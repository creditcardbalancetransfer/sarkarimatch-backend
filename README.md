# SarkariMatch Backend

> **Cloudflare Workers API for government job listings — powered by Hono + D1**

A lightweight, edge-deployed backend for publishing and querying Indian government job notifications. Runs entirely on Cloudflare Workers with D1 (SQLite) for persistent storage.

---

## Features

- **Publisher UI** — Dark-themed web page to validate and publish job JSON
- **RESTful API** — Full CRUD for job listings with filtering & pagination
- **D1 Database** — Cloudflare's globally distributed SQLite
- **CORS enabled** — Ready for frontend integration from any domain
- **XML Sitemap** — Auto-generated sitemap for SEO
- **Auth-protected** — Publishing requires a secret key
- **Zero cold starts** — Runs on Cloudflare's edge network

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Cloudflare Workers |
| Framework | Hono v4 |
| Database | Cloudflare D1 (SQLite) |
| Language | TypeScript |
| Auth | Bearer token (PUBLISHER_SECRET) |

---

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create the D1 Database

```bash
wrangler d1 create sarkarimatch-db
```

This will output something like:

```
✅ Successfully created DB 'sarkarimatch-db'

[[d1_databases]]
binding = "DB"
database_name = "sarkarimatch-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. Update `wrangler.toml`

Copy the `database_id` from the previous step and replace `YOUR_DATABASE_ID_HERE` in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "sarkarimatch-db"
database_id = "your-actual-database-id"
```

### 4. Run the Schema

**Remote (production):**
```bash
wrangler d1 execute sarkarimatch-db --file=./schema.sql --remote
```

**Local (development):**
```bash
wrangler d1 execute sarkarimatch-db --file=./schema.sql --local
```

### 5. Set the Publisher Secret

```bash
wrangler secret put PUBLISHER_SECRET
```

Enter a strong secret key when prompted. This protects the publish/update endpoints.

### 6. Deploy

```bash
wrangler deploy
```

Your worker will be live at: `https://sarkarimatch-backend.<your-subdomain>.workers.dev`

---

## Local Development

```bash
# Start local dev server with D1
wrangler dev --ip 0.0.0.0 --port 3000

# The PUBLISHER_SECRET for local dev can be set in .dev.vars:
echo 'PUBLISHER_SECRET=my-local-secret' > .dev.vars
```

---

## API Endpoints

### Publisher UI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | Publisher HTML page |

### Job Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/publish` | Bearer token | Create a new job |
| `PUT` | `/api/publish/:slug` | Bearer token | Update an existing job |

### Public API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/jobs` | No | List all jobs (with filters) |
| `GET` | `/api/jobs/:slug` | No | Get single job by slug |
| `GET` | `/api/stats` | No | Aggregate statistics |
| `GET` | `/api/sitemap` | No | XML sitemap |

---

## Testing Endpoints

### Publish a Job

```bash
curl -X POST https://your-worker.workers.dev/api/publish \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d @sample-job.json
```

### List Jobs

```bash
# All active jobs
curl https://your-worker.workers.dev/api/jobs?status=active

# Filter by sector
curl https://your-worker.workers.dev/api/jobs?sector=railway&status=active

# Filter by education
curl https://your-worker.workers.dev/api/jobs?education=graduate

# Pagination
curl https://your-worker.workers.dev/api/jobs?limit=10&offset=0
```

### Get Single Job

```bash
curl https://your-worker.workers.dev/api/jobs/rrb-ntpc-recruitment-2025
```

### Update a Job

```bash
curl -X PUT https://your-worker.workers.dev/api/publish/rrb-ntpc-recruitment-2025 \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status": "closed", "total_vacancies": 12000}'
```

### Get Stats

```bash
curl https://your-worker.workers.dev/api/stats
```

### Get Sitemap

```bash
curl https://your-worker.workers.dev/api/sitemap
```

---

## Project Structure

```
sarkarimatch-backend/
├── workers/
│   └── publisher/
│       └── src/
│           ├── index.ts      # Main Hono app with all API routes
│           └── html.ts       # Publisher UI HTML template
├── schema.sql                # D1 database schema
├── sample-job.json           # Example job JSON for testing
├── wrangler.toml             # Cloudflare Workers configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

---

## Data Model

### `jobs` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-increment primary key |
| `title` | TEXT | Job notification title |
| `slug` | TEXT (UNIQUE) | URL-friendly identifier |
| `department` | TEXT | Issuing department name |
| `department_short` | TEXT | Short department code (e.g., RRB) |
| `sector` | TEXT | Sector category (railway, ssc, upsc, etc.) |
| `status` | TEXT | active, closed, upcoming |
| `total_vacancies` | INTEGER | Total number of vacancies |
| `salary` | TEXT | Pay scale range |
| `education_min` | TEXT | Minimum education requirement |
| `age_min` / `age_max` | INTEGER | Age limits |
| `content_summary` | TEXT | Brief description |
| `apply_end_date` | TEXT | Application deadline |
| `apply_link` | TEXT | Official application URL |
| `important_dates` | TEXT (JSON) | Array of date events |
| `posts` | TEXT (JSON) | Array of post details |
| `age_relaxation` | TEXT (JSON) | Category-wise age relaxation |
| `application_fee` | TEXT (JSON) | Fee structure by category |
| `official_website` | TEXT | Department website |
| `created_at` | DATETIME | Record creation timestamp |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLISHER_SECRET` | Yes | Secret key for publish/update auth |
| `ENVIRONMENT` | No | Set automatically (production/development) |

---

## Deployment Checklist

- [ ] `npm install`
- [ ] `wrangler d1 create sarkarimatch-db`
- [ ] Update `database_id` in `wrangler.toml`
- [ ] `wrangler d1 execute sarkarimatch-db --file=./schema.sql --remote`
- [ ] `wrangler secret put PUBLISHER_SECRET`
- [ ] `wrangler deploy`
- [ ] Test all endpoints
- [ ] Publish first job using the Publisher UI

---

## License

ISC
