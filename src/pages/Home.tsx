import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'

export const HomePage: FC = () => {
  return (
    <Layout
      meta={{
        title: 'SarkariMatch — Your Jobs. Your Eligibility. Zero Noise.',
        description:
          'Find government jobs matched to your eligibility. No accounts, no tracking, 100% free. Filter by education, age, category and more.',
        ogTitle: 'SarkariMatch — India\'s Smartest Government Job Finder',
        ogDescription:
          'Personalized government job matching. Filter sarkari jobs by your education, age, and category. All data stays in your browser.',
      }}
      currentPath="/"
    >
      <section class="flex-1 flex items-center justify-center min-h-[60vh] px-4">
        <div class="text-center max-w-2xl mx-auto">
          {/* Hero badge */}
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-6">
            <span class="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
            <span class="text-xs font-semibold text-brand-primary dark:text-blue-400 uppercase tracking-wider">
              Free &amp; Open
            </span>
          </div>

          {/* Main heading */}
          <h1 class="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-content-primary dark:text-white leading-tight mb-4">
            Find Your Perfect{' '}
            <span class="text-brand-primary dark:text-blue-400">Sarkari Job</span>
          </h1>

          {/* Tagline */}
          <p class="text-base sm:text-lg text-content-secondary dark:text-content-dark-muted mb-8 max-w-lg mx-auto leading-relaxed">
            Your Jobs. Your Eligibility. Zero Noise.
            <br class="hidden sm:block" />
            Set your profile once — see only the jobs you're eligible for.
          </p>

          {/* CTA buttons */}
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-light text-white font-bold text-sm rounded-btn transition-all duration-150 shadow-card hover:shadow-card-hover"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse All Jobs
            </a>
            <a
              href="#"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-sm rounded-btn transition-all duration-150 shadow-card hover:shadow-card-hover"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Set Your Profile
            </a>
          </div>

          {/* Trust badges */}
          <div class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-content-secondary dark:text-content-dark-muted">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              No Accounts Needed
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Data Stays in Browser
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              100% Free Forever
            </span>
          </div>
        </div>
      </section>
    </Layout>
  )
}
