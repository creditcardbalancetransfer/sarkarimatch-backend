import type { FC } from 'hono/jsx'
import { placeholderJobs } from '../../lib/placeholder-data'
import {
  sectorMeta,
  formatDateShort,
  daysRemaining,
  applicationProgress,
  formatSalary,
  formatVacancies,
  educationLabels,
} from '../../lib/job-helpers'

/** Single skeleton card matching the real card layout */
const SkeletonCard: FC = () => (
  <div class="skeleton-card bg-white dark:bg-surface-card-dark border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
    <div class="p-5">
      {/* Top row: badge + bookmark */}
      <div class="flex items-center justify-between mb-3">
        <div class="skeleton-bar" style="width: 80px; height: 24px;" />
        <div class="skeleton-bar" style="width: 32px; height: 32px; border-radius: 50%;" />
      </div>
      {/* Title */}
      <div class="skeleton-bar mb-2" style="width: 100%; height: 18px;" />
      <div class="skeleton-bar mb-3" style="width: 65%; height: 14px;" />
      {/* Org */}
      <div class="skeleton-bar mb-4" style="width: 50%; height: 12px;" />
      {/* Pills */}
      <div class="flex gap-2 mb-4">
        <div class="skeleton-bar" style="width: 90px; height: 26px; border-radius: 6px;" />
        <div class="skeleton-bar" style="width: 70px; height: 26px; border-radius: 6px;" />
        <div class="skeleton-bar" style="width: 80px; height: 26px; border-radius: 6px;" />
      </div>
      {/* Location + date */}
      <div class="flex gap-4 mb-4">
        <div class="skeleton-bar" style="width: 70px; height: 12px;" />
        <div class="skeleton-bar" style="width: 100px; height: 12px;" />
      </div>
      {/* Progress bar */}
      <div class="flex justify-between mb-1.5">
        <div class="skeleton-bar" style="width: 100px; height: 12px;" />
        <div class="skeleton-bar" style="width: 50px; height: 10px;" />
      </div>
      <div class="skeleton-bar" style="width: 100%; height: 6px; border-radius: 9999px;" />
    </div>
    {/* Button */}
    <div class="px-5 pb-4 pt-2">
      <div class="skeleton-bar" style="width: 100%; height: 40px; border-radius: 8px;" />
    </div>
  </div>
)

export const LatestNotifications: FC = () => {
  const jobs = [...placeholderJobs]
    .filter((j) => j.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  return (
    <section class="py-16 md:py-24 bg-white dark:bg-surface-card-dark reveal-section" id="latest-jobs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
          <div>
            <h2 class="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-content-primary dark:text-white mb-2">
              Latest Government Job Notifications
            </h2>
            <p class="text-base text-content-secondary dark:text-content-dark-muted">
              Freshly published — don't miss these opportunities
            </p>
          </div>
          <a
            href="/jobs"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary dark:text-blue-400 hover:underline underline-offset-4 whitespace-nowrap flex-shrink-0"
          >
            View All Jobs
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Skeleton placeholders — visible for 500ms */}
        <div class="skeleton-container" aria-hidden="true">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>

        {/* Real job cards — hidden initially, revealed after 500ms */}
        <div class="content-container">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, index) => {
              const sector = sectorMeta[job.sector]
              const days = daysRemaining(job.important_dates.last_date)
              const progress = applicationProgress(job.important_dates.start_date, job.important_dates.last_date)
              const expired = days < 0
              const urgent = days >= 0 && days < 7
              const warning = days >= 7 && days <= 14

              const daysClass = expired
                ? 'text-brand-danger'
                : urgent
                  ? 'text-brand-danger animate-pulse'
                  : warning
                    ? 'text-brand-warning'
                    : 'text-brand-success'

              const daysLabel = expired
                ? 'Expired'
                : days === 0
                  ? 'Last day to apply!'
                  : `${days} days remaining`

              const progressColor = expired
                ? 'bg-red-500'
                : urgent
                  ? 'bg-red-500'
                  : warning
                    ? 'bg-amber-500'
                    : 'bg-brand-success'

              return (
                <article
                  key={job.id}
                  class={`job-card group bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover flex flex-col reveal-child reveal-stagger-${index + 1}`}
                >
                  <div class="p-5 flex-1 flex flex-col">
                    {/* Top row: sector badge + bookmark */}
                    <div class="flex items-center justify-between mb-3">
                      <span
                        class={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold ${sector.bgClass} ${sector.textClass}`}
                      >
                        <span aria-hidden="true">{sector.icon}</span>
                        {sector.label}
                      </span>
                      <button
                        type="button"
                        class="bookmark-btn w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        data-slug={job.slug}
                        aria-label={`Bookmark ${job.notification_title}`}
                        title="Bookmark this job"
                      >
                        {/* Outline bookmark (default) */}
                        <svg class="bookmark-outline w-4.5 h-4.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {/* Filled bookmark (when active) */}
                        <svg class="bookmark-filled w-4.5 h-4.5 text-brand-secondary hidden" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    {/* Title + org */}
                    <h3 class="font-heading font-bold text-base leading-snug text-content-primary dark:text-white mb-1 line-clamp-2 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
                      <a href={`/jobs/${job.slug}`} class="hover:underline underline-offset-2">
                        {job.notification_title}
                      </a>
                    </h3>
                    <p class="text-xs text-content-secondary dark:text-content-dark-muted mb-3">
                      {job.organization}
                    </p>

                    {/* Info pills */}
                    <div class="flex flex-wrap gap-2 mb-4">
                      {/* Vacancies */}
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-700 dark:text-blue-300">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.total_vacancies === 0 ? 'Exam' : formatVacancies(job.total_vacancies)} {job.total_vacancies > 0 ? 'Vacancies' : ''}
                      </span>
                      {/* Education */}
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-xs font-medium text-purple-700 dark:text-purple-300">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m3-9l6-3" />
                        </svg>
                        {educationLabels[job.education_level] || job.education_level}
                      </span>
                      {/* Salary */}
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-xs font-medium text-green-700 dark:text-green-300">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    </div>

                    {/* Location + last date row */}
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-secondary dark:text-content-dark-muted mb-4">
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.locations[0]}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Last Date: {formatDateShort(job.important_dates.last_date)}
                      </span>
                    </div>

                    {/* Days remaining + progress bar */}
                    <div class="mt-auto">
                      <div class="flex items-center justify-between mb-1.5">
                        <span class={`flex items-center gap-1 text-xs font-semibold ${daysClass}`}>
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {daysLabel}
                        </span>
                        <span class="text-[10px] text-content-secondary dark:text-content-dark-muted">
                          {progress}% elapsed
                        </span>
                      </div>
                      {/* Progress bar — explicit height to prevent CLS */}
                      <div class="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          class={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                          style={`width: ${Math.min(progress, 100)}%`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom action */}
                  <div class="px-5 pb-4 pt-2">
                    <a
                      href={`/jobs/${job.slug}`}
                      class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-brand-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-btn transition-colors duration-150"
                    >
                      View Details
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
