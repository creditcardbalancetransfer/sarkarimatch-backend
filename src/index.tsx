import { Hono } from 'hono'
import { HomePage } from './pages/Home'
import { JobsPage } from './pages/Jobs'
import { JobDetailPage, JobNotFound } from './pages/JobDetail'
import { AboutPage } from './pages/About'
import { PrivacyPage } from './pages/Privacy'
import { DisclaimerPage } from './pages/Disclaimer'
import { placeholderJobs } from './lib/placeholder-data'
import { AdminLoginPage } from './pages/admin/AdminLogin'
import { AdminDashboardPage } from './pages/admin/AdminDashboard'
import { AdminUploadPage } from './pages/admin/AdminUpload'
import { AdminJobsPage } from './pages/admin/AdminJobs'
import { AdminEditJobPage, AdminEditJobNotFound } from './pages/admin/AdminEditJob'
import { AdminSettingsPage } from './pages/admin/AdminSettings'

const app = new Hono()

// Homepage
app.get('/', (c) => {
  return c.html(<HomePage />)
})

// Jobs listing page
app.get('/jobs', (c) => {
  return c.html(<JobsPage />)
})

// Job detail page (dynamic route)
app.get('/jobs/:slug', (c) => {
  const slug = c.req.param('slug')
  const job = placeholderJobs.find((j) => j.slug === slug && j.status === 'published')

  if (!job) {
    return c.html(<JobNotFound />, 404)
  }

  return c.html(<JobDetailPage job={job} />)
})

// About page
app.get('/about', (c) => {
  return c.html(<AboutPage />)
})

// Privacy Policy
app.get('/privacy', (c) => {
  return c.html(<PrivacyPage />)
})

// Disclaimer
app.get('/disclaimer', (c) => {
  return c.html(<DisclaimerPage />)
})

// API health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', service: 'SarkariMatch', timestamp: new Date().toISOString() })
})

// ═══ Admin Panel Routes ═══
app.get('/admin', (c) => c.redirect('/admin/login'))
app.get('/admin/login', (c) => c.html(<AdminLoginPage />))
app.get('/admin/dashboard', (c) => c.html(<AdminDashboardPage />))

// Admin Upload page (3-step wizard)
app.get('/admin/upload', (c) => c.html(<AdminUploadPage />))

// Admin Manage Jobs page
app.get('/admin/jobs', (c) => c.html(<AdminJobsPage />))

// Admin Edit Job page — looks up job from seed data (localStorage handled client-side)
app.get('/admin/jobs/:id/edit', (c) => {
  const jobId = c.req.param('id')
  const job = placeholderJobs.find((j) => j.id === jobId)

  if (job) {
    return c.html(<AdminEditJobPage job={job} jobId={jobId} />)
  }

  // Job not found in seed data — render the page shell with the ID.
  // Client JS will try to find it in localStorage. If truly not found, shows 404.
  // For server-side, we create a minimal placeholder that JS will override.
  // We still render the edit page shell to allow localStorage jobs to be edited.
  const placeholderJob = {
    id: jobId,
    slug: jobId,
    notification_title: 'Loading...',
    advertisement_number: '',
    department: '',
    organization: '',
    sector: 'other' as const,
    total_vacancies: 0,
    education_level: 'graduate' as const,
    age_min: 0,
    age_max: 0,
    salary_min: 0,
    salary_max: 0,
    application_fee_general: 0,
    application_fee_sc_st: 0,
    important_dates: { notification_date: '', start_date: '', last_date: '', exam_date: null },
    apply_link: '',
    locations: [],
    tags: [],
    status: 'draft' as const,
    featured: false,
    posts: [],
    created_at: new Date().toISOString(),
    summary: '',
    how_to_apply: [],
    selection_process: [],
    exam_pattern: null,
    syllabus_topics: null,
    official_website: '',
    pdf_url: '',
    vacancy_breakdown: [],
    application_mode: 'Online' as const,
    documents_required: [],
    important_notice: null,
    marking_scheme: null,
  }

  return c.html(<AdminEditJobPage job={placeholderJob} jobId={jobId} />)
})

app.get('/admin/jobs/new', (c) => c.redirect('/admin/upload'))

// Admin Settings page
app.get('/admin/settings', (c) => c.html(<AdminSettingsPage />))

export default app
