# SarkariMatch

> **Your Jobs. Your Eligibility. Zero Noise.**

India's smartest government job finder. No accounts, no tracking, 100% free. Your data stays in your browser.

## Project Overview

- **Name**: SarkariMatch
- **Goal**: Help Indian government job aspirants find personalized sarkari jobs without information overload
- **Privacy**: Zero data collection — all preferences stored in browser localStorage only
- **Stack**: Hono + TypeScript + Tailwind CSS on Cloudflare Pages

## Features (Phase 1 — Foundation)

- [x] Responsive navbar with glassmorphism effect (sticky, backdrop-blur)
- [x] Dark mode toggle (persists to localStorage, respects system preference)
- [x] Language toggle (EN/Hindi visual switch, saved to localStorage)
- [x] Mobile hamburger menu with slide-in panel + overlay
- [x] Homepage with hero section, CTAs, and trust badges
- [x] About page with mission statement and value cards
- [x] Privacy Policy page (DPDP Act 2023 compliant — we collect nothing)
- [x] Disclaimer page (comprehensive legal disclaimer)
- [x] Full-width footer with 4-column grid (Brand, Quick Links, By Education, By Sector)
- [x] SVG favicon matching brand colors
- [x] SEO meta tags + Open Graph on every page
- [x] Skip-to-content link for accessibility
- [x] Semantic HTML5 throughout (header, nav, main, footer, section)
- [x] Keyboard-accessible interactive elements
- [x] Smooth page load animation
- [x] Print-friendly styles
- [x] Custom scrollbar styling

## Pages & Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Homepage with hero, CTAs, trust badges | Done |
| `/about` | Mission, values, privacy-first philosophy | Done |
| `/privacy` | Comprehensive privacy policy (DPDP Act) | Done |
| `/disclaimer` | Legal disclaimer, no government affiliation | Done |
| `/jobs` | Job listings (planned) | Planned |
| `/calendar` | Exam calendar (planned) | Planned |
| `/blog` | Preparation hub (planned) | Planned |
| `/api/health` | Health check endpoint | Done |

## Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#1E40AF` (deep blue) |
| Secondary/Accent | `#F59E0B` (saffron/amber) |
| Success | `#059669` (green) |
| Warning | `#D97706` (orange) |
| Danger | `#DC2626` (red) |
| Body Font | Inter |
| Heading Font | Plus Jakarta Sans |
| Card Radius | 12px |
| Button Radius | 8px |
| Pill Radius | 9999px |

## Project Structure

```
webapp/
├── src/
│   ├── index.tsx          # Main Hono app — all routes
│   ├── components/
│   │   ├── Layout.tsx     # Shared HTML layout (head, meta, fonts, scripts)
│   │   ├── Navbar.tsx     # Sticky glassmorphism navbar
│   │   └── Footer.tsx     # 4-column footer
│   ├── lib/
│   │   └── tokens.ts      # Design tokens and types
│   └── pages/
│       ├── Home.tsx       # Homepage
│       ├── About.tsx      # About page
│       ├── Privacy.tsx    # Privacy Policy
│       └── Disclaimer.tsx # Disclaimer
├── public/
│   └── static/
│       ├── app.js         # Client-side JS (dark mode, lang toggle, menu)
│       ├── styles.css     # Global CSS
│       ├── favicon.svg    # SVG favicon
│       └── og-default.png # OG image placeholder
├── ecosystem.config.cjs   # PM2 configuration
├── wrangler.jsonc         # Cloudflare Pages config
├── vite.config.ts         # Vite build config
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies and scripts
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Start local dev server (sandbox)
pm2 start ecosystem.config.cjs

# Or start manually
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000

# Check logs
pm2 logs sarkarimatch --nostream
```

## Deployment

```bash
# Build and deploy to Cloudflare Pages
npm run deploy:prod

# Or manually
npm run build
npx wrangler pages deploy dist --project-name sarkarimatch
```

## Data Architecture

- **Storage**: Browser localStorage only (zero server-side storage)
- **Keys**:
  - `sarkarimatch_theme` — `"light"` or `"dark"`
  - `sarkarimatch_lang` — `"EN"` or `"HI"`
- **No databases, no cookies, no analytics, no trackers**

## User Guide

1. Visit the homepage
2. Toggle dark/light mode using the moon/sun icon in the navbar
3. Toggle language (visual only for now) using the EN/HI button
4. Navigate to About, Privacy, or Disclaimer pages via navbar or footer links
5. On mobile: tap the hamburger menu for navigation

## Planned Next Steps

- [ ] Job listings page with card grid UI
- [ ] Profile wizard (set education, age, category, sector preferences)
- [ ] Client-side job filtering and matching engine
- [ ] Exam calendar page
- [ ] Blog/preparation hub
- [ ] Actual Hindi language translations
- [ ] PWA support (offline caching)

## Platform

- **Deployment**: Cloudflare Pages
- **Status**: Active (Development)
- **Tech Stack**: Hono 4.x + TypeScript + Tailwind CSS (CDN)
- **Last Updated**: March 2, 2026
