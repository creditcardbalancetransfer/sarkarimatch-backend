import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'

export const AboutPage: FC = () => {
  return (
    <Layout
      meta={{
        title: 'About SarkariMatch — Our Mission',
        description:
          'SarkariMatch helps Indian government job aspirants find personalized sarkari jobs without information overload. No accounts, no data collection, client-side filtering.',
        ogTitle: 'About SarkariMatch',
        ogDescription:
          'Learn about our mission to simplify government job search for millions of Indian aspirants.',
      }}
      currentPath="/about"
    >
      <section class="py-12 md:py-20 px-4">
        <div class="max-w-3xl mx-auto">
          {/* Page header */}
          <div class="mb-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-4">
              <span class="text-xs font-semibold text-brand-primary dark:text-blue-400 uppercase tracking-wider">
                Our Mission
              </span>
            </div>
            <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-content-primary dark:text-white mb-2">
              About SarkariMatch
            </h1>
            <div class="w-16 h-1 bg-brand-secondary rounded-full" />
          </div>

          {/* Content */}
          <div class="space-y-6">
            <div class="bg-white dark:bg-surface-card-dark rounded-card p-6 md:p-8 shadow-card">
              <h2 class="font-heading font-bold text-xl text-content-primary dark:text-white mb-4">
                Simplifying Government Job Search
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                Every year, millions of Indian aspirants spend countless hours sifting through
                scattered government job notifications across dozens of websites. Important
                opportunities are missed, eligibility criteria are misunderstood, and deadlines
                pass unnoticed. SarkariMatch was built to end this chaos. We aggregate publicly
                available government job notifications from central and state bodies, parse them
                into a structured, searchable format, and present only the jobs that match
                <strong class="text-content-primary dark:text-white"> your </strong>
                specific eligibility — your education level, your age, your category, your
                preferred sector. No more scrolling through hundreds of irrelevant listings. No
                more guesswork about whether you qualify. Just the jobs that matter to you,
                delivered clearly and honestly.
              </p>
            </div>

            <div class="bg-white dark:bg-surface-card-dark rounded-card p-6 md:p-8 shadow-card">
              <h2 class="font-heading font-bold text-xl text-content-primary dark:text-white mb-4">
                Privacy-First, User-First
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                Unlike most job platforms, SarkariMatch does not require you to create an account.
                We do not collect your email, phone number, or any personally identifiable
                information. All your preferences — your education, age, category, and interests
                — are stored entirely in your browser's localStorage. Nothing is ever sent to our
                servers. There are no cookies, no analytics scripts, no third-party trackers. Your
                profile data never leaves your device. Every filter, every match, every
                recommendation happens client-side, right in your browser. We believe that a job
                search tool should serve the aspirant, not harvest their data. SarkariMatch is,
                and will always be, 100% free. Our goal is simple: help you find the right
                government job faster, with zero noise and zero compromise on your privacy.
              </p>
            </div>

            {/* Values grid */}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-white dark:bg-surface-card-dark rounded-card p-5 shadow-card text-center">
                <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-sm text-content-primary dark:text-white mb-1">
                  Zero Data Collection
                </h3>
                <p class="text-xs text-content-secondary dark:text-content-dark-muted">
                  Everything stays in your browser
                </p>
              </div>

              <div class="bg-white dark:bg-surface-card-dark rounded-card p-5 shadow-card text-center">
                <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-sm text-content-primary dark:text-white mb-1">
                  Instant Matching
                </h3>
                <p class="text-xs text-content-secondary dark:text-content-dark-muted">
                  Client-side filtering, no lag
                </p>
              </div>

              <div class="bg-white dark:bg-surface-card-dark rounded-card p-5 shadow-card text-center">
                <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-sm text-content-primary dark:text-white mb-1">
                  100% Free Forever
                </h3>
                <p class="text-xs text-content-secondary dark:text-content-dark-muted">
                  No premium tiers, no hidden fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
