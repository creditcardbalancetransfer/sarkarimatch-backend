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

### Phase 3 — Job Data & Interactive Sections
- [x] **Placeholder Data** — 10 realistic Indian government jobs (SBI Clerk, RRB NTPC, SSC CHSL, UPSC CDS, IBPS PO, Army Agniveer, UP Police, KRCL Apprentice, NTA UGC NET, BPSC 70th) with full `Job` interface, 2-4 posts each, realistic dates/salaries/vacancies
- [x] **Job Helpers Library** — sector metadata, date formatting, Indian number formatting, salary formatting, days-remaining calculator, progress-bar calculator
- [x] **Latest Notifications** (Section 6) — 6 job cards grid with sector badge, bookmark toggle (localStorage), info pills (vacancies/education/salary), location + last-date row, days-remaining with color coding (green/orange/red+pulse), elapsed progress bar, "View Details" CTA
- [x] **Closing Soon** (Section 7) — horizontal snap-scroll carousel, filters jobs closing within 20 days, live countdown timers (dd:hh:mm:ss updated every second), urgency color coding, drag-to-scroll on desktop, "Apply Now" external links
- [x] **CTA Banner** (Section 8) — full-width saffron gradient background with dot pattern, lightning bolt icon, centered heading + subtext, large white pill CTA button with hover:scale-105, trust line

### Phase 4 — Polish & Performance
- [x] **Scroll-Reveal Animations** — IntersectionObserver-driven fade-up (20px) with cubic-bezier easing, section-level + staggered child-level delays (8 levels at 80ms intervals) on all sections
- [x] **Scroll-to-Top Button** — fixed bottom-right circular button, primary blue, white arrow-up, appears at 500px scroll, rAF-throttled, dark mode variant, keyboard accessible
- [x] **Skeleton Shimmer Loading** — grey animated shimmer placeholders for Latest Notifications (6 cards) and Closing Soon (3 cards), 500ms reveal delay, fade transition, dark mode variant
- [x] **Updated Meta Tags** — new title ("Personalized Government Job Finder for India 2026"), description (500+ notifications detail), og:title ("Never Miss an Eligible Govt Job"), og:url
- [x] **Schema.org JSON-LD** — WebSite structured data with SearchAction targeting /jobs?q={search_term_string}
- [x] **Core Web Vitals** — CLS: explicit dimensions on all placeholders/timers; LCP: SSR hero heading + font preconnect; FID: rAF-throttled scroll, no heavy JS; `prefers-reduced-motion` media query
- [x] **Animated Gradient Border** — rotating conic-gradient (6-color rainbow) on hero "Set Your Profile" button via CSS @property Houdini, 3s rotation, blur glow, hover intensification

## Homepage Sections (in order)

| # | Section | Description |
|---|---------|-------------|
| 1 | Hero | Full-viewport split layout with CTA buttons, animated illustration |
| 2 | Stats Bar | Blue bar with 4 animated count-up stats |
| 3 | How It Works | 3 step cards with connecting line |
| 4 | Browse by Sector | 9 colored sector cards in 3-col grid |
| 5 | Browse by Education | Scrollable qualification pill chips |
| 6 | Latest Notifications | 6 job cards with bookmarks, progress bars |
| 7 | Closing Soon | Horizontal carousel with live countdown timers |
| 8 | CTA Banner | Full-width saffron call-to-action |

## Pages & Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Full homepage with 8 content sections | Done |
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
│   │       ├── BrowseByEducation.tsx # Scrollable education pills
│   │       ├── LatestNotifications.tsx # 6 job cards with bookmarks
│   │       ├── ClosingSoon.tsx       # Carousel with countdown timers
│   │       └── CtaBanner.tsx         # Saffron CTA section
│   ├── lib/
│   │   ├── tokens.ts          # Design tokens and types
│   │   ├── placeholder-data.ts # 10 realistic job notifications
│   │   └── job-helpers.ts     # Sector meta, formatters, calculators
│   └── pages/
│       ├── Home.tsx           # Homepage (composes all home sections)
│       ├── About.tsx          # About page
│       ├── Privacy.tsx        # Privacy Policy
│       └── Disclaimer.tsx     # Disclaimer
├── public/
│   └── static/
│       ├── app.js             # Client-side JS (theme, lang, menu, countup, scroll, bookmarks, countdown)
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
| Gradient border | Page load | Rotating conic-gradient on CTA button (3s loop) |
| Count-up | Scroll into view | Numbers animate 0 → target over 2s with easeOutCubic |
| Scroll reveal (section) | Scroll into view | Sections fade up 20px with 0.7s cubic-bezier easing |
| Scroll reveal (children) | Scroll into view | Staggered 0.5s child reveals with 80ms interval delays |
| Skeleton shimmer | Page load → 500ms | Shimmer bars animate, then fade out to reveal content |
| Education fades | Scroll position | Left/right gradient masks appear based on scroll state |
| Live countdown | Every second | dd:hh:mm:ss countdown to application deadlines |
| Bookmark toggle | Click | Icon switches outline→filled, persists to localStorage |
| Scroll-to-top | Scroll past 500px | Button fades in from below with scale transform |

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

## Data Architecture

- **Storage**: Browser localStorage only (zero server-side storage)
- **localStorage Keys**:
  - `sarkarimatch_theme` — `"light"` or `"dark"`
  - `sarkarimatch_lang` — `"EN"` or `"HI"`
  - `sarkarimatch_bookmarks` — JSON array of job slugs
- **Placeholder Data**: 10 jobs in `src/lib/placeholder-data.ts` (will move to D1/API later)
- **No databases, no cookies, no analytics, no trackers**

## Planned Next Steps

- [ ] Job detail page (`/jobs/:slug`) with full notification breakdown
- [ ] Job listings page with filters + search
- [ ] Profile wizard (set education, age, category, sector preferences)
- [ ] Client-side job filtering and matching engine
- [ ] Exam calendar page
- [ ] Blog/preparation hub
- [ ] Actual Hindi language translations
- [ ] PWA support (offline caching)
- [ ] Move placeholder data to Cloudflare D1 database

## Platform

- **Deployment**: Cloudflare Pages
- **Status**: Active (Development)
- **Tech Stack**: Hono 4.x + TypeScript + Tailwind CSS (CDN)
- **Last Updated**: March 2, 2026
- **Performance**: Skeleton loading, scroll-reveal animations, prefers-reduced-motion support, Schema.org structured data
