import type { FC } from 'hono/jsx'
import { placeholderJobs } from '../../lib/placeholder-data'
import { sectorMeta, formatVacancies } from '../../lib/job-helpers'

export const ClosingSoon: FC = () => {
  // Filter to jobs closing within 20 days of 2026-03-02, sort soonest first
  const today = new Date('2026-03-02')
  const cutoff = new Date('2026-03-22') // 20 days out

  const closingJobs = [...placeholderJobs]
    .filter((j) => {
      const lastDate = new Date(j.important_dates.last_date)
      return j.status === 'published' && lastDate >= today && lastDate <= cutoff
    })
    .sort(
      (a, b) =>
        new Date(a.important_dates.last_date).getTime() -
        new Date(b.important_dates.last_date).getTime()
    )
    .slice(0, 4)

  return (
    <section class="py-16 md:py-24 bg-surface-light dark:bg-surface-dark reveal-section" id="closing-soon">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div class="text-center mb-10">
          <h2 class="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-content-primary dark:text-white mb-2">
            <span class="inline-block mr-2" aria-hidden="true">⏰</span>
            Closing Soon — Apply Now!
          </h2>
          <p class="text-base text-content-secondary dark:text-content-dark-muted">
            These opportunities are ending within the next few days
          </p>
        </div>

        {/* Horizontal scrollable carousel */}
        <div class="closing-carousel-container relative">
          <div
            class="closing-carousel flex gap-4 overflow-x-auto pb-4 px-1 scroll-smooth snap-x snap-mandatory"
            role="list"
            aria-label="Jobs closing soon"
          >
            {closingJobs.map((job) => {
              const sector = sectorMeta[job.sector]
              const lastDate = new Date(job.important_dates.last_date)
              const diff = lastDate.getTime() - today.getTime()
              const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
              const urgencyColor =
                daysLeft <= 7
                  ? 'from-red-500/20 to-red-600/20 dark:from-red-900/30 dark:to-red-800/30'
                  : daysLeft <= 14
                    ? 'from-orange-500/15 to-orange-600/15 dark:from-orange-900/25 dark:to-orange-800/25'
                    : 'from-amber-500/10 to-amber-600/10 dark:from-amber-900/20 dark:to-amber-800/20'
              const dotColor =
                daysLeft <= 7
                  ? 'bg-red-500'
                  : daysLeft <= 14
                    ? 'bg-orange-500'
                    : 'bg-amber-500'
              const textUrgency =
                daysLeft <= 7
                  ? 'text-red-600 dark:text-red-400'
                  : daysLeft <= 14
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-amber-600 dark:text-amber-400'

              return (
                <div
                  key={job.id}
                  role="listitem"
                  class="closing-card snap-start flex-shrink-0 w-[300px] sm:w-[320px]"
                >
                  <div
                    class={`relative h-full bg-white dark:bg-surface-card-dark rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5`}
                  >
                    {/* Urgency gradient top edge */}
                    <div class={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${urgencyColor.replace('/20', '').replace('/15', '').replace('/10', '').replace('/30', '').replace('/25', '')} ${dotColor}`} />

                    <div class="p-5">
                      {/* Closing indicator */}
                      <div class="flex items-center gap-2 mb-4">
                        <span class={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
                        <span class={`text-xs font-bold ${textUrgency}`}>
                          Closing in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Job info */}
                      <h3 class="font-heading font-bold text-sm text-content-primary dark:text-white mb-1 line-clamp-2 leading-snug">
                        {job.notification_title}
                      </h3>
                      <p class="text-xs text-content-secondary dark:text-content-dark-muted mb-1">
                        {job.organization}
                      </p>
                      <div class="flex items-center gap-2 mb-4">
                        <span class={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-pill ${sector.bgClass} ${sector.textClass}`}>
                          {sector.icon} {sector.label}
                        </span>
                        {job.total_vacancies > 0 && (
                          <span class="text-xs text-content-secondary dark:text-content-dark-muted">
                            {formatVacancies(job.total_vacancies)} Vacancies
                          </span>
                        )}
                      </div>

                      {/* Live countdown timer */}
                      <div
                        class="countdown-timer bg-gray-50 dark:bg-gray-800/50 rounded-btn px-3 py-2.5 mb-4"
                        data-deadline={job.important_dates.last_date + 'T23:59:59'}
                      >
                        <div class="flex items-center gap-1 justify-center">
                          <svg class="w-3.5 h-3.5 text-content-secondary dark:text-content-dark-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div class="countdown-display flex items-center gap-0.5 font-mono text-sm font-bold text-content-primary dark:text-white tabular-nums">
                            <span class="countdown-days">--</span>
                            <span class="text-content-secondary dark:text-content-dark-muted font-normal text-[10px]">d</span>
                            <span class="mx-0.5 text-content-secondary dark:text-content-dark-muted">:</span>
                            <span class="countdown-hours">--</span>
                            <span class="text-content-secondary dark:text-content-dark-muted font-normal text-[10px]">h</span>
                            <span class="mx-0.5 text-content-secondary dark:text-content-dark-muted">:</span>
                            <span class="countdown-mins">--</span>
                            <span class="text-content-secondary dark:text-content-dark-muted font-normal text-[10px]">m</span>
                            <span class="mx-0.5 text-content-secondary dark:text-content-dark-muted">:</span>
                            <span class="countdown-secs">--</span>
                            <span class="text-content-secondary dark:text-content-dark-muted font-normal text-[10px]">s</span>
                          </div>
                        </div>
                      </div>

                      {/* Apply button */}
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-brand-danger hover:bg-red-700 rounded-btn transition-all duration-150 hover:scale-[1.02] active:scale-100"
                      >
                        Apply Now
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Scroll hint (mobile) */}
          <p class="text-center text-xs text-content-secondary dark:text-content-dark-muted mt-3 sm:hidden">
            <svg class="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Swipe to see more
          </p>
        </div>
      </div>
    </section>
  )
}
