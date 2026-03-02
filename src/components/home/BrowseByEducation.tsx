import type { FC } from 'hono/jsx'

const qualifications = [
  { slug: '10th', label: '10th Pass', count: 142 },
  { slug: '12th', label: '12th Pass', count: 198 },
  { slug: 'iti', label: 'ITI/Diploma', count: 87 },
  { slug: 'graduate', label: 'Graduate', count: 312 },
  { slug: 'btech', label: 'B.Tech', count: 156 },
  { slug: 'bsc', label: 'B.Sc', count: 89 },
  { slug: 'bcom', label: 'B.Com', count: 112 },
  { slug: 'mba', label: 'MBA/PG', count: 67 },
  { slug: 'medical', label: 'Medical', count: 34 },
  { slug: 'law', label: 'Law', count: 28 },
  { slug: 'phd', label: 'PhD', count: 8 },
]

export const BrowseByEducation: FC = () => {
  return (
    <section class="py-16 md:py-24 bg-surface-light dark:bg-surface-dark reveal-section" id="browse-education">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div class="text-center mb-10">
          <h2 class="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-content-primary dark:text-white mb-3">
            Find Jobs by Your Qualification
          </h2>
          <p class="text-base sm:text-lg text-content-secondary dark:text-content-dark-muted max-w-lg mx-auto">
            Select your education level to see matching government jobs
          </p>
        </div>

        {/* Scrollable pills */}
        <div class="edu-scroll-container relative">
          {/* Left fade mask */}
          <div class="edu-fade-left absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-surface-light dark:from-surface-dark to-transparent hidden" />

          {/* Scrollable row */}
          <div
            class="edu-scroll flex gap-3 overflow-x-auto pb-3 px-1 scroll-smooth"
            role="list"
            aria-label="Filter jobs by qualification"
          >
            {qualifications.map((q) => (
              <a
                key={q.slug}
                href={`/jobs?education=${q.slug}`}
                role="listitem"
                class="edu-pill flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark font-medium text-sm transition-all duration-200 hover:bg-brand-primary hover:text-white hover:border-brand-primary dark:hover:bg-blue-600 dark:hover:border-blue-600 dark:hover:text-white hover:shadow-card whitespace-nowrap group"
              >
                <span>{q.label}</span>
                <span class="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-content-secondary dark:text-content-dark-muted group-hover:bg-white/20 group-hover:text-white transition-colors duration-200">
                  {q.count}
                </span>
              </a>
            ))}
          </div>

          {/* Right fade mask */}
          <div class="edu-fade-right absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-surface-light dark:from-surface-dark to-transparent" />
        </div>

        {/* Mobile hint */}
        <p class="text-center text-xs text-content-secondary dark:text-content-dark-muted mt-4 sm:hidden">
          <svg class="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Scroll for more qualifications
        </p>
      </div>
    </section>
  )
}
