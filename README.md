# SarkariMatch

> **Your Jobs. Your Eligibility. Zero Noise.**

India's smartest government job finder. No accounts, no tracking, 100% free. Your data stays in your browser.

## Project Overview

- **Name**: SarkariMatch
- **Goal**: Help Indian government job aspirants find personalized sarkari jobs without information overload
- **Privacy**: Zero data collection — all preferences stored in browser localStorage only
- **Stack**: Hono + TypeScript + Tailwind CSS on Cloudflare Pages

## Features

### Phase 1 — Foundation
- [x] Responsive navbar with glassmorphism effect (sticky, backdrop-blur)
- [x] Dark mode toggle (persists to localStorage, respects system preference)
- [x] Language toggle (EN/Hindi visual switch, saved to localStorage)
- [x] Mobile hamburger menu with slide-in panel + overlay
- [x] About page with mission statement and value cards
- [x] Privacy Policy page (DPDP Act 2023 compliant — we collect nothing)
- [x] Disclaimer page (comprehensive legal disclaimer)
- [x] Full-width footer with 4-column grid (Brand, Quick Links, By Education, By Sector)
- [x] SVG favicon matching brand colors
- [x] SEO meta tags + Open Graph on every page
- [x] Skip-to-content link for accessibility
- [x] Semantic HTML5 throughout (header, nav, main, footer, section)
- [x] Keyboard-accessible interactive elements
- [x] Print-friendly styles, custom scrollbar styling

### Phase 2 — Homepage Content Sections
- [x] **Hero Section** — full viewport height with gradient background, decorative dot pattern, split layout (60/40), staggered fade-in animations, SVG shield illustration with floating mini-cards, dual CTAs (Set Your Profile + Browse All Jobs), trust indicators
- [x] **Live Stats Bar** — 4 stats (500+ notifications, 1,50,000+ vacancies, 28+ states, 100% free) with Intersection Observer-triggered count-up animation, easeOutCubic easing, Indian number formatting
- [x] **How It Works** — 3-step process cards (Set Profile → Get Matched → Apply) with connecting gradient line on desktop, hover lift animation, step icons with colored backgrounds
- [x] **Browse by Sector** — 9 sector cards (Banking, Railway, SSC, UPSC, Defence, Teaching, State PSC, Police, PSU) with unique color-coded icons, hover border color change, arrow indicators, links to /jobs?sector=
- [x] **Browse by Education** — horizontal scrollable pill row (11 qualifications from 10th Pass to PhD with counts), hidden scrollbar, fade edge indicators that respond to scroll position, hover fill animation

## Homepage Sections (in order)

| # | Section | Description |
|---|---------|-------------|
| 1 | Hero | Full-viewport split layout with CTA buttons, animated illustration |
| 2 | Stats Bar | Blue bar with 4 animated count-up stats |
| 3 | How It Works | 3 step cards with connecting line |
| 4 | Browse by Sector | 9 colored sector cards in 3-col grid |
| 5 | Browse by Education | Scrollable qualification pill chips |

## Pages & Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Full homepage with 5 content sections | Done |
| `/about` | Mission, values, privacy-first philosophy | Done |
| `/privacy` | Comprehensive privacy policy (DPDP Act) | Done |
| `/disclaimer` | Legal disclaimer, no government affiliation | Done |
| `/jobs` | Job listings (planned) | Planned |
| `/calendar` | Exam calendar (planned) | Planned |
| `/blog` | Preparation hub (planned) | Planned |
| `/api/health` | Health check endpoint | Done |

## Project Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main Hono app — all routes
│   ├── components/
│   │   ├── Layout.tsx         # Shared HTML layout (head, meta, fonts, scripts)
│   │   ├── Navbar.tsx         # Sticky glassmorphism navbar
│   │   ├── Footer.tsx         # 4-column footer
│   │   └── home/
│   │       ├── HeroSection.tsx      # Hero with gradient, illustration, CTAs
│   │       ├── StatsBar.tsx         # Animated count-up statistics
│   │       ├── HowItWorks.tsx       # 3-step process cards
│   │       ├── BrowseBySector.tsx   # 9 sector cards grid
│   │       └── BrowseByEducation.tsx # Scrollable education pills
│   ├── lib/
│   │   └── tokens.ts          # Design tokens and types
│   └── pages/
│       ├── Home.tsx           # Homepage (composes all home sections)
│       ├── About.tsx          # About page
│       ├── Privacy.tsx        # Privacy Policy
│       └── Disclaimer.tsx     # Disclaimer
├── public/
│   └── static/
│       ├── app.js             # Client-side JS (theme, lang, menu, countup, scroll)
│       ├── styles.css         # Global CSS (animations, hero, scrollbar, print)
│       ├── favicon.svg        # SVG favicon
│       └── og-default.png     # OG image placeholder
├── ecosystem.config.cjs       # PM2 configuration
├── wrangler.jsonc             # Cloudflare Pages config
├── vite.config.ts             # Vite build config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies and scripts
```

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

## Animations

| Animation | Trigger | Description |
|-----------|---------|-------------|
| Hero fade-up | Page load | Staggered 4-step entrance (0s → 0.5s delays) |
| Shield orbit | Page load | Two concentric dashed circles rotating opposite directions |
| Floating cards | Page load | 3 mini cards bob up/down with different timings |
| Count-up | Scroll into view | Numbers animate 0 → target over 2s with easeOutCubic |
| Scroll reveal | Scroll into view | Sections fade up from 32px below with 0.6s transition |
| Education fades | Scroll position | Left/right gradient masks appear based on scroll state |

## Development

```bash
npm install           # Install deps
npm run build         # Build
pm2 start ecosystem.config.cjs  # Start dev server
pm2 logs sarkarimatch --nostream  # Check logs
```

## Deployment

```bash
npm run deploy:prod   # Build + deploy to Cloudflare Pages
```

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
