import { Hono } from 'hono'
import { HomePage } from './pages/Home'
import { JobsPage } from './pages/Jobs'
import { JobDetailPage, JobNotFound } from './pages/JobDetail'
import { AboutPage } from './pages/About'
import { PrivacyPage } from './pages/Privacy'
import { DisclaimerPage } from './pages/Disclaimer'
import { placeholderJobs } from './lib/placeholder-data'

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

export default app
