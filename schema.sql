CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  department_short TEXT DEFAULT '',
  sector TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  total_vacancies INTEGER DEFAULT 0,
  salary TEXT DEFAULT '',
  education_min TEXT DEFAULT '',
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 35,
  content_summary TEXT DEFAULT '',
  apply_end_date TEXT DEFAULT '',
  apply_link TEXT DEFAULT '',
  important_dates TEXT DEFAULT '[]',
  posts TEXT DEFAULT '[]',
  age_relaxation TEXT DEFAULT '{}',
  application_fee TEXT DEFAULT '{}',
  official_website TEXT DEFAULT '',
  created_at DATETIME DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_sector ON jobs(sector);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
