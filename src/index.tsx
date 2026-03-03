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

// Placeholder admin pages (to be implemented)
app.get('/admin/upload', (c) => c.html(<AdminDashboardPage />))
app.get('/admin/jobs', (c) => c.html(<AdminDashboardPage />))
app.get('/admin/jobs/new', (c) => c.html(<AdminDashboardPage />))
app.get('/admin/settings', (c) => c.html(<AdminDashboardPage />))

export default app
