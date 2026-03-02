import type { FC } from 'hono/jsx'

export const HeroSection: FC = () => {
  return (
    <section class="hero-section relative overflow-hidden min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] flex items-center">
      {/* Background gradient */}
      <div class="absolute inset-0 bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EFF6FF] dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#1E293B] -z-20" />

      {/* Decorative dot pattern */}
      <div class="hero-dots absolute inset-0 -z-10 opacity-[0.35] dark:opacity-[0.08]" />

      {/* Decorative gradient blobs */}
      <div class="absolute top-20 -left-32 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -z-10" />
      <div class="absolute bottom-20 -right-32 w-80 h-80 bg-amber-200/20 dark:bg-amber-900/10 rounded-full blur-3xl -z-10" />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 w-full">
        <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left content — 60% */}
          <div class="flex-1 lg:max-w-[60%] text-center lg:text-left">
            {/* Pill badge */}
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-6 hero-fade-up">
              <span class="text-base leading-none" aria-hidden="true">🇮🇳</span>
              <span class="text-xs font-semibold text-brand-primary dark:text-blue-400 tracking-wide">
                India's #1 Personalized Govt Job Finder
              </span>
            </div>

            {/* Main heading */}
            <h1 class="font-heading font-extrabold text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.15] text-content-primary dark:text-white mb-5 hero-fade-up hero-delay-1">
              Never Miss a{' '}
              <span class="text-brand-primary dark:text-blue-400">Government Job</span>
              {' '}You're Eligible For
            </h1>

            {/* Subheading */}
            <p class="text-base sm:text-lg text-content-secondary dark:text-content-dark-muted leading-relaxed mb-8 max-w-[540px] mx-auto lg:mx-0 hero-fade-up hero-delay-2">
              Set your qualification, age &amp; category once — we instantly filter 500+ active
              notifications and show only the jobs YOU can apply for. No accounts. No tracking. 100% free.
            </p>

            {/* CTA buttons */}
            <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start hero-fade-up hero-delay-3">
              <a
                href="#"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-semibold text-base rounded-full transition-all duration-200 shadow-card hover:shadow-card-hover hover:scale-105 active:scale-100"
                role="button"
              >
                Set Your Profile
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/jobs"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-brand-primary dark:border-blue-400 text-brand-primary dark:text-blue-400 font-semibold text-base rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-blue-500 dark:hover:text-white dark:hover:border-blue-500 hover:scale-105 active:scale-100"
                role="button"
              >
                Browse All Jobs
              </a>
            </div>

            {/* Trust indicators */}
            <div class="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-content-secondary dark:text-content-dark-muted hero-fade-up hero-delay-4">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-brand-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                No Sign-up Required
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-brand-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                No Data Collected
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-brand-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Works Offline
              </span>
            </div>
          </div>

          {/* Right side — illustration (40%), hidden on mobile */}
          <div class="hidden lg:flex flex-1 items-center justify-center hero-fade-up hero-delay-3">
            <div class="relative w-full max-w-md">
              {/* Shield illustration */}
              <div class="hero-illustration relative">
                {/* Glow ring */}
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-72 h-72 rounded-full border-2 border-dashed border-blue-200/60 dark:border-blue-800/40 animate-spin-slow" />
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-56 h-56 rounded-full border border-amber-200/50 dark:border-amber-800/30 animate-spin-reverse" />
                </div>

                {/* Center shield */}
                <div class="relative flex items-center justify-center py-8">
                  <svg viewBox="0 0 200 240" class="w-52 h-auto drop-shadow-xl" aria-hidden="true">
                    {/* Shield body */}
                    <defs>
                      <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#F59E0B" />
                        <stop offset="100%" style="stop-color:#D97706" />
                      </linearGradient>
                      <linearGradient id="shield-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#FBBF24" />
                        <stop offset="100%" style="stop-color:#F59E0B" />
                      </linearGradient>
                      <filter id="shield-shadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#F59E0B" flood-opacity="0.3" />
                      </filter>
                    </defs>
                    {/* Outer shield shape */}
                    <path
                      d="M100 12 L185 50 L185 120 C185 170 145 210 100 232 C55 210 15 170 15 120 L15 50 Z"
                      fill="url(#shield-grad)"
                      filter="url(#shield-shadow)"
                    />
                    {/* Inner shield */}
                    <path
                      d="M100 30 L170 60 L170 120 C170 162 137 196 100 215 C63 196 30 162 30 120 L30 60 Z"
                      fill="url(#shield-inner)"
                      opacity="0.3"
                    />
                    {/* Checkmark */}
                    <path
                      d="M70 120 L92 142 L135 95"
                      fill="none"
                      stroke="white"
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    {/* Small decorative stars */}
                    <circle cx="100" cy="70" r="3" fill="white" opacity="0.6" />
                    <circle cx="70" cy="85" r="2" fill="white" opacity="0.4" />
                    <circle cx="130" cy="85" r="2" fill="white" opacity="0.4" />
                  </svg>
                </div>

                {/* Floating mini cards */}
                <div class="absolute top-4 -left-2 bg-white dark:bg-surface-card-dark rounded-card shadow-card-hover px-3 py-2 flex items-center gap-2 animate-float-slow">
                  <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <svg class="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-content-primary dark:text-white leading-none">Eligible</div>
                    <div class="text-[9px] text-content-secondary dark:text-content-dark-muted">SSC CGL 2026</div>
                  </div>
                </div>

                <div class="absolute top-16 -right-4 bg-white dark:bg-surface-card-dark rounded-card shadow-card-hover px-3 py-2 flex items-center gap-2 animate-float-delayed">
                  <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-content-primary dark:text-white leading-none">500+</div>
                    <div class="text-[9px] text-content-secondary dark:text-content-dark-muted">Active Jobs</div>
                  </div>
                </div>

                <div class="absolute bottom-8 -left-6 bg-white dark:bg-surface-card-dark rounded-card shadow-card-hover px-3 py-2 flex items-center gap-2 animate-float-delayed-2">
                  <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <svg class="w-4 h-4 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-content-primary dark:text-white leading-none">3 Days Left</div>
                    <div class="text-[9px] text-content-secondary dark:text-content-dark-muted">IBPS PO Apply</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
