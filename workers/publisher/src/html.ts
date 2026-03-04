export function publisherHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SarkariMatch Publisher</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      line-height: 1.6;
      min-height: 100vh;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px 0;
      border-bottom: 1px solid #1e293b;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    .header p {
      color: #94a3b8;
      font-size: 14px;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      background: #1e293b;
      border-radius: 10px;
      padding: 4px;
    }
    .tab {
      flex: 1;
      padding: 10px 16px;
      background: transparent;
      color: #94a3b8;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .tab.active {
      background: #334155;
      color: #f1f5f9;
    }
    .tab:hover:not(.active) { color: #e2e8f0; }

    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Form elements */
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input[type="text"], input[type="password"], textarea, select {
      width: 100%;
      padding: 12px 16px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 14px;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
    }
    textarea { resize: vertical; min-height: 320px; }

    .field-group { margin-bottom: 20px; }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }
    .btn-success {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }
    .btn-success:hover:not(:disabled) {
      background: linear-gradient(135deg, #16a34a, #15803d);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
    }
    .btn-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }
    .btn-warning:hover:not(:disabled) {
      background: linear-gradient(135deg, #d97706, #b45309);
    }
    .btn-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    /* Status messages */
    .msg {
      padding: 14px 18px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 14px;
      display: none;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .msg.error {
      display: block;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .msg.success {
      display: block;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #86efac;
    }
    .msg.info {
      display: block;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #7dd3fc;
    }

    /* Preview card */
    .preview-card {
      display: none;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      margin-top: 20px;
      animation: fadeIn 0.3s ease;
    }
    .preview-card.visible { display: block; }
    .preview-card h3 {
      color: #38bdf8;
      font-size: 20px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #334155;
    }
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
    }
    .preview-item {
      background: #0f172a;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .preview-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .preview-value {
      font-size: 16px;
      font-weight: 600;
      color: #f1f5f9;
    }

    /* Jobs list */
    .job-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .job-card:hover { border-color: #475569; }
    .job-card h4 { color: #38bdf8; font-size: 16px; margin-bottom: 8px; }
    .job-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 13px;
      color: #94a3b8;
    }
    .job-meta span { display: inline-flex; align-items: center; gap: 4px; }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-active { background: rgba(34, 197, 94, 0.2); color: #86efac; }
    .badge-closed { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-label { font-size: 13px; color: #94a3b8; margin-top: 4px; }

    .loading {
      text-align: center;
      padding: 40px;
      color: #64748b;
    }
    .loading::after {
      content: '';
      display: inline-block;
      width: 20px; height: 20px;
      border: 2px solid #334155;
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-left: 8px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .container { padding: 16px 12px; }
      .header h1 { font-size: 22px; }
      .preview-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .btn-row { flex-direction: column; }
      .btn { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>&#x1F3DB; SarkariMatch Publisher</h1>
      <p>Publish &amp; manage government job listings &bull; Powered by Cloudflare D1</p>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="switchTab('publish')">Publish Job</button>
      <button class="tab" onclick="switchTab('browse')">Browse Jobs</button>
      <button class="tab" onclick="switchTab('stats')">Stats</button>
    </div>

    <!-- ===== PUBLISH TAB ===== -->
    <div id="tab-publish" class="tab-content active">
      <div class="field-group">
        <label for="secret">Secret Key</label>
        <input type="password" id="secret" placeholder="Enter your PUBLISHER_SECRET" autocomplete="off" />
      </div>

      <div class="field-group">
        <label for="mode">Mode</label>
        <select id="mode" onchange="toggleMode()">
          <option value="create">Create New Job</option>
          <option value="update">Update Existing Job</option>
        </select>
      </div>

      <div class="field-group" id="slug-field" style="display:none">
        <label for="update-slug">Job Slug to Update</label>
        <input type="text" id="update-slug" placeholder="e.g. rrb-ntpc-2025" />
      </div>

      <div class="field-group">
        <label for="json-input">Paste Job JSON from Genspark</label>
        <textarea id="json-input" placeholder='Paste your job JSON here...

{
  "title": "RRB NTPC Recruitment 2025",
  "slug": "rrb-ntpc-2025",
  "department": "Railway Recruitment Board",
  "sector": "railway",
  "posts": [...]
}'></textarea>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" onclick="validateJSON()">&#x2714; Validate</button>
        <button class="btn btn-success" id="publish-btn" disabled onclick="publishJob()">&#x1F680; Publish</button>
      </div>

      <div id="msg" class="msg"></div>
      <div id="preview" class="preview-card"></div>
    </div>

    <!-- ===== BROWSE TAB ===== -->
    <div id="tab-browse" class="tab-content">
      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <input type="text" id="filter-sector" placeholder="Filter by sector..." style="flex:1;min-width:150px" />
        <select id="filter-status" style="flex:1;min-width:120px">
          <option value="">All Status</option>
          <option value="active" selected>Active</option>
          <option value="closed">Closed</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <button class="btn btn-primary" onclick="loadJobs()">Search</button>
      </div>
      <div id="jobs-list"><div class="loading">Loading jobs</div></div>
      <div id="pagination" style="text-align:center;margin-top:16px;"></div>
    </div>

    <!-- ===== STATS TAB ===== -->
    <div id="tab-stats" class="tab-content">
      <div id="stats-content"><div class="loading">Loading stats</div></div>
    </div>
  </div>

  <script>
    // ── Tab switching ──
    function switchTab(tab) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      event.target.classList.add('active');

      if (tab === 'browse') loadJobs();
      if (tab === 'stats') loadStats();
    }

    function toggleMode() {
      const mode = document.getElementById('mode').value;
      document.getElementById('slug-field').style.display = mode === 'update' ? 'block' : 'none';
      document.getElementById('publish-btn').textContent = mode === 'update' ? '\\u270F\\uFE0F Update' : '\\uD83D\\uDE80 Publish';
    }

    // ── Validate JSON ──
    let validatedData = null;

    function validateJSON() {
      const raw = document.getElementById('json-input').value.trim();
      const msgEl = document.getElementById('msg');
      const previewEl = document.getElementById('preview');

      validatedData = null;
      previewEl.classList.remove('visible');
      document.getElementById('publish-btn').disabled = true;

      if (!raw) {
        showMsg('error', 'Please paste JSON data first.');
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        showMsg('error', 'Invalid JSON: ' + e.message);
        return;
      }

      const mode = document.getElementById('mode').value;
      if (mode === 'create') {
        const required = ['title', 'slug', 'department', 'sector', 'posts'];
        const missing = required.filter(f => !data[f]);
        if (missing.length > 0) {
          showMsg('error', 'Missing required fields: ' + missing.join(', '));
          return;
        }
        if (!Array.isArray(data.posts) || data.posts.length === 0) {
          showMsg('error', '"posts" must be a non-empty array.');
          return;
        }
      }

      validatedData = data;
      showMsg('success', 'JSON is valid! Review the preview below, then click Publish.');
      document.getElementById('publish-btn').disabled = false;

      // Build preview
      const postsCount = Array.isArray(data.posts) ? data.posts.length : 0;
      previewEl.innerHTML = \`
        <h3>\${esc(data.title || 'Untitled')}</h3>
        <div class="preview-grid">
          <div class="preview-item"><div class="preview-label">Department</div><div class="preview-value">\${esc(data.department || '-')}</div></div>
          <div class="preview-item"><div class="preview-label">Sector</div><div class="preview-value">\${esc(data.sector || '-')}</div></div>
          <div class="preview-item"><div class="preview-label">Total Vacancies</div><div class="preview-value">\${data.total_vacancies || 0}</div></div>
          <div class="preview-item"><div class="preview-label">Posts</div><div class="preview-value">\${postsCount} post type\${postsCount !== 1 ? 's' : ''}</div></div>
          <div class="preview-item"><div class="preview-label">Apply End Date</div><div class="preview-value">\${esc(data.apply_end_date || 'Not set')}</div></div>
          <div class="preview-item"><div class="preview-label">Slug</div><div class="preview-value">\${esc(data.slug || '-')}</div></div>
          <div class="preview-item"><div class="preview-label">Education</div><div class="preview-value">\${esc(data.education_min || 'Not set')}</div></div>
          <div class="preview-item"><div class="preview-label">Age Range</div><div class="preview-value">\${data.age_min || 18} - \${data.age_max || 35} years</div></div>
        </div>
      \`;
      previewEl.classList.add('visible');
    }

    // ── Publish / Update job ──
    async function publishJob() {
      if (!validatedData) return;

      const secret = document.getElementById('secret').value.trim();
      if (!secret) {
        showMsg('error', 'Please enter your Secret Key.');
        return;
      }

      const btn = document.getElementById('publish-btn');
      btn.disabled = true;
      btn.textContent = 'Publishing...';

      const mode = document.getElementById('mode').value;
      let url = '/api/publish';
      let method = 'POST';

      if (mode === 'update') {
        const slug = document.getElementById('update-slug').value.trim() || validatedData.slug;
        if (!slug) {
          showMsg('error', 'Please enter the slug of the job to update.');
          btn.disabled = false;
          btn.textContent = '\\u270F\\uFE0F Update';
          return;
        }
        url = '/api/publish/' + encodeURIComponent(slug);
        method = 'PUT';
      }

      try {
        const resp = await fetch(url, {
          method,
          headers: {
            'Authorization': 'Bearer ' + secret,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedData),
        });

        const result = await resp.json();

        if (resp.ok && result.success) {
          const liveUrl = window.location.origin + result.url;
          showMsg('success',
            (mode === 'update' ? 'Job updated!' : 'Job published!') +
            ' View it at: <a href="' + esc(liveUrl) + '" target="_blank" style="color:#38bdf8;text-decoration:underline;">' + esc(liveUrl) + '</a>'
          );
        } else {
          showMsg('error', result.error || 'Unknown error occurred.');
        }
      } catch (e) {
        showMsg('error', 'Network error: ' + e.message);
      }

      btn.disabled = false;
      btn.textContent = mode === 'update' ? '\\u270F\\uFE0F Update' : '\\uD83D\\uDE80 Publish';
    }

    // ── Browse Jobs ──
    let currentOffset = 0;

    async function loadJobs(offset) {
      if (offset !== undefined) currentOffset = offset;
      else currentOffset = 0;

      const listEl = document.getElementById('jobs-list');
      listEl.innerHTML = '<div class="loading">Loading jobs</div>';

      const sector = document.getElementById('filter-sector').value.trim();
      const status = document.getElementById('filter-status').value;

      let url = '/api/jobs?limit=20&offset=' + currentOffset;
      if (sector) url += '&sector=' + encodeURIComponent(sector);
      if (status) url += '&status=' + encodeURIComponent(status);

      try {
        const resp = await fetch(url);
        const data = await resp.json();

        if (!data.jobs || data.jobs.length === 0) {
          listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#64748b">No jobs found.</div>';
          document.getElementById('pagination').innerHTML = '';
          return;
        }

        listEl.innerHTML = data.jobs.map(job => \`
          <div class="job-card">
            <h4>\${esc(job.title)}</h4>
            <div class="job-meta">
              <span class="badge \${job.status === 'active' ? 'badge-active' : 'badge-closed'}">\${esc(job.status)}</span>
              <span>\\uD83C\\uDFDB\\uFE0F \${esc(job.department)}</span>
              <span>\\uD83D\\uDCBC \${job.total_vacancies} vacancies</span>
              <span>\\uD83D\\uDCC5 \${esc(job.apply_end_date || 'N/A')}</span>
              <span>\\uD83C\\uDF10 \${esc(job.sector)}</span>
            </div>
            <div style="margin-top:10px">
              <a href="/api/jobs/\${encodeURIComponent(job.slug)}" target="_blank" style="color:#38bdf8;font-size:13px;">View JSON &rarr;</a>
            </div>
          </div>
        \`).join('');

        // Pagination
        const p = data.pagination;
        let pagHtml = '';
        if (p.offset > 0) {
          pagHtml += '<button class="btn btn-primary" style="margin:4px" onclick="loadJobs(' + Math.max(0, p.offset - p.limit) + ')">&larr; Previous</button>';
        }
        if (p.has_more) {
          pagHtml += '<button class="btn btn-primary" style="margin:4px" onclick="loadJobs(' + (p.offset + p.limit) + ')">Next &rarr;</button>';
        }
        pagHtml += '<div style="color:#64748b;font-size:13px;margin-top:8px">Showing ' + (p.offset + 1) + '-' + Math.min(p.offset + p.limit, p.total) + ' of ' + p.total + '</div>';
        document.getElementById('pagination').innerHTML = pagHtml;

      } catch (e) {
        listEl.innerHTML = '<div class="msg error" style="display:block">Failed to load jobs: ' + esc(e.message) + '</div>';
      }
    }

    // ── Stats ──
    async function loadStats() {
      const el = document.getElementById('stats-content');
      el.innerHTML = '<div class="loading">Loading stats</div>';

      try {
        const resp = await fetch('/api/stats');
        const s = await resp.json();

        el.innerHTML = \`
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-value">\${s.total_jobs}</div><div class="stat-label">Total Jobs</div></div>
            <div class="stat-card"><div class="stat-value">\${s.active_jobs}</div><div class="stat-label">Active Jobs</div></div>
            <div class="stat-card"><div class="stat-value">\${(s.sectors || []).length}</div><div class="stat-label">Sectors</div></div>
            <div class="stat-card"><div class="stat-value">\${s.last_updated ? new Date(s.last_updated).toLocaleDateString() : 'N/A'}</div><div class="stat-label">Last Updated</div></div>
          </div>
          <h3 style="color:#94a3b8;margin-bottom:12px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px">Sectors</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            \${(s.sectors || []).map(sec => '<span class="badge badge-active">' + esc(sec) + '</span>').join('')}
          </div>
        \`;
      } catch (e) {
        el.innerHTML = '<div class="msg error" style="display:block">Failed to load stats: ' + esc(e.message) + '</div>';
      }
    }

    // ── Helpers ──
    function showMsg(type, html) {
      const el = document.getElementById('msg');
      el.className = 'msg ' + type;
      el.innerHTML = html;
      el.style.display = 'block';
    }

    function esc(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = String(str);
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}
