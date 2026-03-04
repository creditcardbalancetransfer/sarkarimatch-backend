import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { publisherHTML } from './html';

type Bindings = {
  DB: D1Database;
  PUBLISHER_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ── CORS for all API routes ──
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ── Helper: auth check ──
function checkAuth(c: any): boolean {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.replace('Bearer ', '').trim();
  return token === c.env.PUBLISHER_SECRET;
}

// ── Helper: safe JSON parse ──
function safeJsonParse(val: any, fallback: any = null) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ── Helper: stringify for DB storage ──
function toJsonString(val: any): string {
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
}

// ── Helper: parse a job row from DB ──
function parseJobRow(row: any) {
  return {
    ...row,
    important_dates: safeJsonParse(row.important_dates, []),
    posts: safeJsonParse(row.posts, []),
    age_relaxation: safeJsonParse(row.age_relaxation, {}),
    application_fee: safeJsonParse(row.application_fee, {}),
  };
}

// ============================
// 1. GET / → Publisher HTML page
// ============================
app.get('/', (c) => {
  return c.html(publisherHTML());
});

// ============================
// 2. POST /api/publish → Create a new job
// ============================
app.post('/api/publish', async (c) => {
  if (!checkAuth(c)) {
    return c.json({ error: 'Unauthorized. Invalid or missing secret key.' }, 401);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body.' }, 400);
  }

  const { title, slug, department, sector } = body;
  if (!title || !slug || !department || !sector) {
    return c.json({ error: 'Missing required fields: title, slug, department, sector.' }, 400);
  }

  // Check duplicate slug
  const existing = await c.env.DB.prepare('SELECT id FROM jobs WHERE slug = ?').bind(slug).first();
  if (existing) {
    return c.json({ error: `Job with slug "${slug}" already exists.`, existing_id: existing.id }, 409);
  }

  const stmt = c.env.DB.prepare(`
    INSERT INTO jobs (
      title, slug, department, department_short, sector, status,
      total_vacancies, salary, education_min, age_min, age_max,
      content_summary, apply_end_date, apply_link,
      important_dates, posts, age_relaxation, application_fee,
      official_website
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    await stmt.bind(
      title,
      slug,
      department,
      body.department_short || '',
      sector,
      body.status || 'active',
      body.total_vacancies || 0,
      body.salary || '',
      body.education_min || '',
      body.age_min ?? 18,
      body.age_max ?? 35,
      body.content_summary || '',
      body.apply_end_date || '',
      body.apply_link || '',
      toJsonString(body.important_dates || []),
      toJsonString(body.posts || []),
      toJsonString(body.age_relaxation || {}),
      toJsonString(body.application_fee || {}),
      body.official_website || ''
    ).run();
  } catch (err: any) {
    return c.json({ error: 'Database insert failed.', details: err.message }, 500);
  }

  return c.json({
    success: true,
    slug,
    url: `/api/jobs/${slug}`,
    message: `Job "${title}" published successfully.`
  }, 201);
});

// ============================
// 3. PUT /api/publish/:slug → Update existing job
// ============================
app.put('/api/publish/:slug', async (c) => {
  if (!checkAuth(c)) {
    return c.json({ error: 'Unauthorized. Invalid or missing secret key.' }, 401);
  }

  const slug = c.req.param('slug');

  const existing = await c.env.DB.prepare('SELECT id FROM jobs WHERE slug = ?').bind(slug).first();
  if (!existing) {
    return c.json({ error: `Job with slug "${slug}" not found.` }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body.' }, 400);
  }

  // Build dynamic SET clause from provided fields
  const allowedFields: Record<string, (v: any) => any> = {
    title: (v) => v,
    department: (v) => v,
    department_short: (v) => v,
    sector: (v) => v,
    status: (v) => v,
    total_vacancies: (v) => v,
    salary: (v) => v,
    education_min: (v) => v,
    age_min: (v) => v,
    age_max: (v) => v,
    content_summary: (v) => v,
    apply_end_date: (v) => v,
    apply_link: (v) => v,
    important_dates: (v) => toJsonString(v),
    posts: (v) => toJsonString(v),
    age_relaxation: (v) => toJsonString(v),
    application_fee: (v) => toJsonString(v),
    official_website: (v) => v,
  };

  const setClauses: string[] = [];
  const values: any[] = [];

  for (const [field, transform] of Object.entries(allowedFields)) {
    if (body[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(transform(body[field]));
    }
  }

  if (setClauses.length === 0) {
    return c.json({ error: 'No valid fields provided for update.' }, 400);
  }

  values.push(slug);

  try {
    await c.env.DB.prepare(
      `UPDATE jobs SET ${setClauses.join(', ')} WHERE slug = ?`
    ).bind(...values).run();
  } catch (err: any) {
    return c.json({ error: 'Database update failed.', details: err.message }, 500);
  }

  return c.json({
    success: true,
    slug,
    url: `/api/jobs/${slug}`,
    message: `Job "${slug}" updated successfully.`
  });
});

// ============================
// 4. GET /api/jobs → List jobs with filtering
// ============================
app.get('/api/jobs', async (c) => {
  const sector = c.req.query('sector');
  const status = c.req.query('status');
  const education = c.req.query('education');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const offset = parseInt(c.req.query('offset') || '0');

  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: any[] = [];

  if (sector) {
    query += ' AND LOWER(sector) = LOWER(?)';
    params.push(sector);
  }
  if (status) {
    query += ' AND LOWER(status) = LOWER(?)';
    params.push(status);
  }
  if (education) {
    query += ' AND LOWER(education_min) LIKE LOWER(?)';
    params.push(`%${education}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    const jobs = (results || []).map(parseJobRow);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM jobs WHERE 1=1';
    const countParams: any[] = [];
    if (sector) { countQuery += ' AND LOWER(sector) = LOWER(?)'; countParams.push(sector); }
    if (status) { countQuery += ' AND LOWER(status) = LOWER(?)'; countParams.push(status); }
    if (education) { countQuery += ' AND LOWER(education_min) LIKE LOWER(?)'; countParams.push(`%${education}%`); }

    const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();

    return c.json({
      jobs,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        has_more: offset + limit < (countResult?.total || 0)
      }
    });
  } catch (err: any) {
    return c.json({ error: 'Database query failed.', details: err.message }, 500);
  }
});

// ============================
// 5. GET /api/jobs/:slug → Single job by slug
// ============================
app.get('/api/jobs/:slug', async (c) => {
  const slug = c.req.param('slug');

  try {
    const row = await c.env.DB.prepare('SELECT * FROM jobs WHERE slug = ?').bind(slug).first();
    if (!row) {
      return c.json({ error: `Job with slug "${slug}" not found.` }, 404);
    }
    return c.json(parseJobRow(row));
  } catch (err: any) {
    return c.json({ error: 'Database query failed.', details: err.message }, 500);
  }
});

// ============================
// 6. GET /api/stats → Aggregate statistics
// ============================
app.get('/api/stats', async (c) => {
  try {
    const totalResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM jobs').first<{ count: number }>();
    const activeResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").first<{ count: number }>();
    const sectorsResult = await c.env.DB.prepare('SELECT DISTINCT sector FROM jobs ORDER BY sector').all();
    const lastUpdated = await c.env.DB.prepare('SELECT created_at FROM jobs ORDER BY created_at DESC LIMIT 1').first<{ created_at: string }>();

    return c.json({
      total_jobs: totalResult?.count || 0,
      active_jobs: activeResult?.count || 0,
      sectors: (sectorsResult.results || []).map((r: any) => r.sector),
      last_updated: lastUpdated?.created_at || null,
    });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch stats.', details: err.message }, 500);
  }
});

// ============================
// 7. GET /api/sitemap → XML sitemap
// ============================
app.get('/api/sitemap', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT slug, created_at FROM jobs WHERE status = 'active' ORDER BY created_at DESC"
    ).all();

    const baseUrl = new URL(c.req.url).origin;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const row of results || []) {
      const r = row as any;
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/api/jobs/${r.slug}</loc>\n`;
      xml += `    <lastmod>${r.created_at ? r.created_at.split(' ')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return c.json({ error: 'Failed to generate sitemap.', details: err.message }, 500);
  }
});

// ── 404 handler ──
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found.', path: c.req.path }, 404);
});

// ── Error handler ──
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error.', message: err.message }, 500);
});

export default app;
