import { Hono } from 'hono'
import { HomePage } from './pages/Home'
import { AboutPage } from './pages/About'
import { PrivacyPage } from './pages/Privacy'
import { DisclaimerPage } from './pages/Disclaimer'

const app = new Hono()

// Homepage
app.get('/', (c) => {
  return c.html(<HomePage />)
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
