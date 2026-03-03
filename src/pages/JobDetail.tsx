import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'
import { ProfileProvider } from '../lib/profile-context'
import { ProfileWizard } from '../components/ProfileWizard'
import { placeholderJobs, type Job } from '../lib/placeholder-data'
import {
  sectorMeta,
  formatDateShort,
  daysRemaining,
  formatSalary,
  formatVacancies,
  educationLabels,
  applicationProgress,
} from '../lib/job-helpers'

/* ── Helpers ───────────────────────────────────────────────── */

function getStatusBadge(job: Job): { label: string; color: string; bgClass: string; textClass: string; icon: string } {
  const today = '2026-03-03'
  const lastDate = job.important_dates.last_date
  const startDate = job.important_dates.start_date
  const days = daysRemaining(lastDate, today)

  if (days < 0) return { label: 'EXPIRED', color: '#6B7280', bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-700 dark:text-gray-300', icon: '\u26d4' }
  if (today < startDate) return { label: 'UPCOMING', color: '#7C3AED', bgClass: 'bg-purple-100 dark:bg-purple-900/30', textClass: 'text-purple-800 dark:text-purple-300', icon: '\ud83d\udcc5' }
  if (days <= 7) return { label: 'CLOSING SOON', color: '#DC2626', bgClass: 'bg-red-100 dark:bg-red-900/30', textClass: 'text-red-800 dark:text-red-300', icon: '\u23f3' }
  return { label: 'ACTIVE', color: '#059669', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-800 dark:text-green-300', icon: '\u2705' }
}

/* ── 404 Not Found Component ─────────────────────────────── */
export const JobNotFound: FC = () => {
  return (
    <Layout
      meta={{
        title: 'Job Not Found \u2014 SarkariMatch',
        description: 'The job you are looking for could not be found.',
      }}
      currentPath="/jobs"
    >
      <div class="min-h-[60vh] flex items-center justify-center px-4">
        <div class="text-center max-w-md">
          <div class="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 class="font-heading font-bold text-2xl text-content-primary dark:text-content-dark mb-3">
            Job Not Found
          </h1>
          <p class="text-content-secondary dark:text-content-dark-muted mb-6">
            Job not found. It may have been removed or the URL is incorrect.
          </p>
          <a
            href="/jobs"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-blue-700 text-white font-bold text-sm rounded-btn transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Browse All Jobs
          </a>
        </div>
      </div>
    </Layout>
  )
}

/* ── Main Job Detail Page ────────────────────────────────── */
export const JobDetailPage: FC<{ job: Job }> = ({ job }) => {
  const sector = sectorMeta[job.sector] || sectorMeta.other
  const status = getStatusBadge(job)
  const days = daysRemaining(job.important_dates.last_date, '2026-03-03')
  const progress = applicationProgress(job.important_dates.start_date, job.important_dates.last_date, '2026-03-03')
  const salary = formatSalary(job.salary_min, job.salary_max)
  const vacancies = formatVacancies(job.total_vacancies)
  const eduLabel = educationLabels[job.education_level] || job.education_level
  const isExpired = days < 0

  /* Schema.org BreadcrumbList */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://sarkarimatch.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Government Jobs', 'item': 'https://sarkarimatch.com/jobs' },
      { '@type': 'ListItem', 'position': 3, 'name': job.notification_title },
    ],
  }

  /* Schema.org JobPosting */
  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.notification_title,
    'description': job.summary,
    'datePosted': job.important_dates.notification_date,
    'validThrough': job.important_dates.last_date,
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.organization,
      'sameAs': job.official_website,
    },
    'jobLocation': {
      '@type': 'Place',
      'address': { '@type': 'PostalAddress', 'addressCountry': 'IN', 'addressRegion': job.locations[0] },
    },
    'baseSalary': {
      '@type': 'MonetaryAmount',
      'currency': 'INR',
      'value': { '@type': 'QuantitativeValue', 'minValue': job.salary_min, 'maxValue': job.salary_max, 'unitText': 'MONTH' },
    },
    'employmentType': 'FULL_TIME',
  }

  return (
    <Layout
      meta={{
        title: `${job.notification_title} \u2014 SarkariMatch`,
        description: job.summary,
        ogTitle: job.notification_title,
        ogDescription: job.summary,
        ogUrl: `https://sarkarimatch.com/jobs/${job.slug}`,
      }}
      currentPath="/jobs"
      structuredData={jobSchema}
    >
      {/* Profile Provider */}
      <ProfileProvider />

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3" aria-label="Breadcrumb">
        <ol class="flex items-center gap-1.5 text-sm text-content-secondary dark:text-content-dark-muted flex-wrap" style="font-size:14px">
          <li>
            <a href="/" class="hover:text-brand-primary dark:hover:text-blue-400 transition-colors">Home</a>
          </li>
          <li aria-hidden="true">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </li>
          <li>
            <a href="/jobs" class="hover:text-brand-primary dark:hover:text-blue-400 transition-colors">Government Jobs</a>
          </li>
          <li aria-hidden="true">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </li>
          <li class="text-content-primary dark:text-content-dark font-medium truncate max-w-[240px] sm:max-w-none" aria-current="page">
            {job.notification_title}
          </li>
        </ol>
      </nav>

      {/* ── Hero Header ────────────────────────────────────── */}
      <section class="jd-hero relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-surface-dark dark:to-blue-950/20" aria-hidden="true"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Org icon + Title row */}
          <div class="flex items-start gap-4 mb-4">
            <div class={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl ${sector.bgClass} border border-gray-200/60 dark:border-gray-700/60`}>
              {sector.icon}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <span class={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold ${status.bgClass} ${status.textClass}`}>
                  <span aria-hidden="true">{status.icon}</span>
                  {status.label}
                </span>
                <span class={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold ${sector.bgClass} ${sector.textClass}`}>
                  {sector.label}
                </span>
                {job.featured && (
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                    \u2b50 Featured
                  </span>
                )}
              </div>
              <h1 class="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-content-primary dark:text-content-dark leading-tight mb-1.5">
                {job.notification_title}
              </h1>
              <p class="text-sm sm:text-base text-content-secondary dark:text-content-dark-muted">
                {job.organization} &middot; {job.department}
              </p>
              <p class="text-xs text-content-secondary dark:text-content-dark-muted mt-1">
                Advt. No.: {job.advertisement_number}
              </p>
            </div>
          </div>

          {/* Quick stats boxes */}
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
            <div class="bg-white/80 dark:bg-surface-card-dark/80 rounded-card p-3 sm:p-4 border border-gray-200/60 dark:border-gray-700/60 text-center" style="backdrop-filter:blur(8px)">
              <div class="text-xs text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1">Vacancies</div>
              <div class="font-heading font-bold text-lg sm:text-xl text-brand-primary dark:text-blue-400">{vacancies === 'Exam' ? 'Exam' : vacancies}</div>
              <div class="text-xs text-content-secondary dark:text-content-dark-muted">total posts</div>
            </div>
            <div class="bg-white/80 dark:bg-surface-card-dark/80 rounded-card p-3 sm:p-4 border border-gray-200/60 dark:border-gray-700/60 text-center" style="backdrop-filter:blur(8px)">
              <div class="text-xs text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1">Last Date</div>
              <div class={`font-heading font-bold text-lg sm:text-xl ${days <= 7 && days >= 0 ? 'text-red-600 dark:text-red-400' : 'text-content-primary dark:text-content-dark'}`}>
                {formatDateShort(job.important_dates.last_date)}
              </div>
              <div class={`text-xs ${days < 0 ? 'text-gray-500' : days <= 7 ? 'text-red-500 font-semibold' : 'text-content-secondary dark:text-content-dark-muted'}`}>
                {days < 0 ? 'Closed' : days === 0 ? 'Today!' : `${days} days left`}
              </div>
            </div>
            <div class="bg-white/80 dark:bg-surface-card-dark/80 rounded-card p-3 sm:p-4 border border-gray-200/60 dark:border-gray-700/60 text-center" style="backdrop-filter:blur(8px)">
              <div class="text-xs text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1">Salary</div>
              <div class="font-heading font-bold text-lg sm:text-xl text-content-primary dark:text-content-dark">{salary}</div>
              <div class="text-xs text-content-secondary dark:text-content-dark-muted">per month</div>
            </div>
            <div class="bg-white/80 dark:bg-surface-card-dark/80 rounded-card p-3 sm:p-4 border border-gray-200/60 dark:border-gray-700/60 text-center" style="backdrop-filter:blur(8px)">
              <div class="text-xs text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1">Application Fee</div>
              <div class="font-heading font-bold text-lg sm:text-xl text-content-primary dark:text-content-dark">
                {job.application_fee_general === 0 ? 'Free' : `\u20b9${job.application_fee_general}`}
              </div>
              <div class="text-xs text-content-secondary dark:text-content-dark-muted">
                {job.application_fee_sc_st === 0 ? 'SC/ST: Free' : `SC/ST: \u20b9${job.application_fee_sc_st}`}
              </div>
            </div>
          </div>

          {/* Full-width application progress bar */}
          <div class="mt-5">
            <div class="flex items-center justify-between text-xs text-content-secondary dark:text-content-dark-muted mb-1.5">
              <span>Application Window</span>
              <span>
                {formatDateShort(job.important_dates.start_date)} \u2192 {formatDateShort(job.important_dates.last_date)}
              </span>
            </div>
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class={`h-full rounded-full transition-all duration-500 ${
                  progress >= 100 ? 'bg-gray-400 dark:bg-gray-500' : progress >= 80 ? 'bg-red-500' : progress >= 50 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={`width: ${Math.min(progress, 100)}%`}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two-Column Layout ──────────────────────────────── */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Sidebar (Right on desktop, top on mobile) ───── */}
          <aside class="w-full lg:w-[35%] order-first lg:order-last">
            <div class="jd-sidebar lg:sticky" style="top:80px">

              {/* Eligibility Checker Widget */}
              <div id="eligibility-widget" class="bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 overflow-hidden mb-4 shadow-card">
                <div class="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                  <h2 class="font-heading font-bold text-base text-content-primary dark:text-content-dark flex items-center gap-2">
                    <svg class="w-5 h-5 text-brand-primary dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Eligibility Checker
                  </h2>
                </div>

                {/* No profile state */}
                <div id="eligibility-no-profile" class="p-4 sm:p-5">
                  <div class="text-center py-4">
                    <div class="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center mb-3">
                      <svg class="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-3">Set your profile to check eligibility for all posts in this notification.</p>
                    <button
                      type="button"
                      data-open-wizard
                      class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-sm rounded-btn transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      Set Your Profile
                    </button>
                  </div>
                </div>

                {/* Has profile — eligibility results */}
                <div id="eligibility-results" class="hidden">
                  {/* Summary */}
                  <div id="eligibility-summary" class="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-700/50"></div>

                  {/* Post selector dropdown (if >1 post) */}
                  {job.posts.length > 1 && (
                    <div class="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-700/50">
                      <label class="text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1.5 block">Select Post</label>
                      <select
                        id="eligibility-post-select"
                        class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark pw-select focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                      >
                        {job.posts.map((post, i) => (
                          <option key={i} value={i}>{post.post_name} ({formatVacancies(post.vacancies_total)} posts)</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Per-check results */}
                  <div id="eligibility-checks" class="px-4 sm:px-5 py-3 space-y-2.5"></div>

                  {/* Edit profile link */}
                  <div class="px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 text-center">
                    <button
                      type="button"
                      data-open-wizard
                      class="text-sm font-medium text-brand-primary dark:text-blue-400 hover:underline"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div class="space-y-2.5">
                {/* Apply Now */}
                {!isExpired && (
                  <a
                    href={job.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="apply-now-btn"
                    class="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-sm rounded-btn transition-colors shadow-sm"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Apply Now
                  </a>
                )}

                {/* Download Notification PDF */}
                <a
                  href={job.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-surface-card-dark border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark font-semibold text-sm rounded-btn hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Download Notification PDF
                </a>

                {/* Bookmark + Share row */}
                <div class="flex gap-2.5">
                  <button
                    type="button"
                    id="jd-bookmark-btn"
                    class="bookmark-btn flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-card-dark border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark font-semibold text-sm rounded-btn hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    data-slug={job.slug}
                    aria-label="Bookmark this job"
                  >
                    <svg class="bookmark-outline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <svg class="bookmark-filled w-4 h-4 text-brand-secondary hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span class="bookmark-label">Bookmark</span>
                  </button>
                  <button
                    type="button"
                    id="jd-share-btn"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-card-dark border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark font-semibold text-sm rounded-btn hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Share this job"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>

              {/* Share dropdown (hidden) */}
              <div id="share-dropdown" class="hidden mt-2 bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 shadow-card-hover overflow-hidden">
                <div class="py-1.5">
                  <button id="share-copy" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg class="w-4 h-4 text-content-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.636 8.82" /></svg>
                    Copy Link
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(job.notification_title + ' - Apply Now: https://sarkarimatch.com/jobs/' + job.slug)}`} target="_blank" rel="noopener noreferrer" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span class="text-green-500 text-base">&#9679;</span>
                    WhatsApp
                  </a>
                  <a href={`https://t.me/share/url?url=${encodeURIComponent('https://sarkarimatch.com/jobs/' + job.slug)}&text=${encodeURIComponent(job.notification_title)}`} target="_blank" rel="noopener noreferrer" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span class="text-blue-400 text-base">&#9679;</span>
                    Telegram
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(job.notification_title + ' - Apply Now!')}&url=${encodeURIComponent('https://sarkarimatch.com/jobs/' + job.slug)}`} target="_blank" rel="noopener noreferrer" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span class="text-sky-500 text-base">&#9679;</span>
                    Twitter / X
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content (Left column) ──────────────────── */}
          <div class="flex-1 min-w-0 order-last lg:order-first">

            {/* Tab navigation */}
            <div class="jd-tabs border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto" style="scrollbar-width:none">
              <div class="flex gap-0 min-w-max">
                {(['overview', 'posts', 'how-to-apply', 'selection', 'dates', 'exam-pattern'] as const).map((tab, i) => {
                  const labels: Record<string, string> = {
                    'overview': 'Overview',
                    'posts': 'Posts & Vacancies',
                    'how-to-apply': 'How to Apply',
                    'selection': 'Selection Process',
                    'dates': 'Important Dates',
                    'exam-pattern': 'Exam Pattern',
                  }
                  return (
                    <button
                      key={tab}
                      type="button"
                      class={`jd-tab-btn px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        i === 0
                          ? 'text-brand-secondary dark:text-amber-400 border-brand-secondary dark:border-amber-400 font-semibold'
                          : 'text-content-secondary dark:text-content-dark-muted border-transparent hover:text-content-primary dark:hover:text-content-dark hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      data-tab={tab}
                    >
                      {labels[tab]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Tab: Overview ─────────────────────────────── */}
            <div class="jd-tab-content" data-tab-content="overview">
              {/* Summary */}
              <div class="mb-6">
                <h2 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-3">About This Notification</h2>
                <p class="text-sm leading-relaxed text-content-secondary dark:text-content-dark-muted">{job.summary}</p>
              </div>

              {/* Key highlights */}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-btn">
                  <span class="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">\ud83c\udfeb</span>
                  <div>
                    <div class="text-xs text-content-secondary dark:text-content-dark-muted">Organization</div>
                    <div class="text-sm font-medium text-content-primary dark:text-content-dark">{job.organization}</div>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-btn">
                  <span class="shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-sm">\ud83d\udcbc</span>
                  <div>
                    <div class="text-xs text-content-secondary dark:text-content-dark-muted">Department</div>
                    <div class="text-sm font-medium text-content-primary dark:text-content-dark">{job.department}</div>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-btn">
                  <span class="shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm">\ud83c\udf93</span>
                  <div>
                    <div class="text-xs text-content-secondary dark:text-content-dark-muted">Education Required</div>
                    <div class="text-sm font-medium text-content-primary dark:text-content-dark">{eduLabel}</div>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-btn">
                  <span class="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm">\ud83d\udccd</span>
                  <div>
                    <div class="text-xs text-content-secondary dark:text-content-dark-muted">Location</div>
                    <div class="text-sm font-medium text-content-primary dark:text-content-dark">{job.locations.join(', ')}</div>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-btn">
                  <span class="shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-sm">\ud83d\udc64</span>
                  <div>
                    <div class="text-xs text-content-secondary dark:text-content-dark-muted">Age Limit</div>
                    <div class="text-sm font-medium text-content-primary dark:text-content-dark">
                      {job.age_min === 0 && job.age_max === 0 ? 'No age limit' : `${job.age_min}\u2013${job.age_max} years`}
                    </div>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-btn">
                  <span class="shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-sm">\ud83d\udcb0</span>
                  <div>
                    <div class="text-xs text-content-secondary dark:text-content-dark-muted">Salary Range</div>
                    <div class="text-sm font-medium text-content-primary dark:text-content-dark">{salary}</div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div class="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag) => (
                  <span key={tag} class="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-content-secondary dark:text-content-dark-muted rounded-pill">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Official website */}
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-card border border-blue-200/50 dark:border-blue-800/30">
                <div class="flex items-center gap-2 text-sm">
                  <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  <span class="text-content-secondary dark:text-content-dark-muted">Official Website:</span>
                  <a href={job.official_website} target="_blank" rel="noopener noreferrer" class="text-brand-primary dark:text-blue-400 hover:underline font-medium">
                    {job.official_website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            </div>

            {/* ── Tab: Posts & Vacancies ────────────────────── */}
            <div class="jd-tab-content hidden" data-tab-content="posts">
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-4">Posts & Vacancies</h2>

              {/* Post cards */}
              <div class="space-y-4 mb-6">
                {job.posts.map((post, i) => (
                  <div key={i} class="bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                    <h3 class="font-heading font-semibold text-base text-content-primary dark:text-content-dark mb-3">{post.post_name}</h3>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div><span class="text-content-secondary dark:text-content-dark-muted">Vacancies:</span> <strong class="text-content-primary dark:text-content-dark">{formatVacancies(post.vacancies_total)}</strong></div>
                      <div><span class="text-content-secondary dark:text-content-dark-muted">Salary:</span> <strong class="text-content-primary dark:text-content-dark">{post.salary}</strong></div>
                      <div class="col-span-2"><span class="text-content-secondary dark:text-content-dark-muted">Education:</span> <strong class="text-content-primary dark:text-content-dark">{post.education_required}</strong></div>
                      <div class="col-span-2"><span class="text-content-secondary dark:text-content-dark-muted">Age:</span> <strong class="text-content-primary dark:text-content-dark">{post.age_limit}</strong></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vacancy breakdown table */}
              {job.vacancy_breakdown.length > 0 && job.vacancy_breakdown[0].total > 0 && (
                <div>
                  <h3 class="font-heading font-semibold text-base text-content-primary dark:text-content-dark mb-3">Category-wise Vacancy Breakdown</h3>
                  <div class="overflow-x-auto rounded-card border border-gray-200 dark:border-gray-700">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <th class="px-3 py-2.5 text-left font-semibold text-content-primary dark:text-content-dark">Post</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">UR</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">OBC</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">SC</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">ST</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">EWS</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-brand-primary dark:text-blue-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.vacancy_breakdown.map((row, i) => (
                          <tr key={i} class="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                            <td class="px-3 py-2.5 font-medium text-content-primary dark:text-content-dark max-w-[200px] truncate">{row.post_name}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{row.ur}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{row.obc}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{row.sc}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{row.st}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{row.ews}</td>
                            <td class="px-3 py-2.5 text-center font-bold text-brand-primary dark:text-blue-400">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── Tab: How to Apply ────────────────────────── */}
            <div class="jd-tab-content hidden" data-tab-content="how-to-apply">
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-4">How to Apply</h2>
              <ol class="space-y-3">
                {job.how_to_apply.map((step, i) => (
                  <li key={i} class="flex gap-3">
                    <span class="shrink-0 w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <p class="text-sm text-content-secondary dark:text-content-dark-muted leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
              {!isExpired && (
                <a
                  href={job.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-sm rounded-btn transition-colors"
                >
                  Apply Now on Official Website
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>

            {/* ── Tab: Selection Process ───────────────────── */}
            <div class="jd-tab-content hidden" data-tab-content="selection">
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-4">Selection Process</h2>
              <div class="relative">
                {/* Timeline line */}
                <div class="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></div>
                <div class="space-y-6">
                  {job.selection_process.map((stage) => (
                    <div key={stage.stage} class="relative flex gap-4 pl-1">
                      <div class={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 ${stage.is_eliminatory ? 'bg-red-500' : 'bg-green-500'}`}>
                        {stage.stage}
                      </div>
                      <div class="flex-1 pb-2">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                          <h3 class="font-semibold text-sm text-content-primary dark:text-content-dark">{stage.name}</h3>
                          {stage.is_eliminatory && (
                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-pill">Eliminatory</span>
                          )}
                        </div>
                        <p class="text-sm text-content-secondary dark:text-content-dark-muted leading-relaxed">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Tab: Important Dates ─────────────────────── */}
            <div class="jd-tab-content hidden" data-tab-content="dates">
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-4">Important Dates</h2>
              <div class="bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 overflow-hidden">
                {([
                  { label: 'Notification Date', date: job.important_dates.notification_date, icon: '\ud83d\udce2' },
                  { label: 'Application Start Date', date: job.important_dates.start_date, icon: '\ud83d\udcc4' },
                  { label: 'Application Last Date', date: job.important_dates.last_date, icon: '\u23f0' },
                  ...(job.important_dates.exam_date ? [{ label: 'Exam Date', date: job.important_dates.exam_date, icon: '\ud83d\udcdd' }] : []),
                ] as Array<{label:string;date:string;icon:string}>).map((item, i) => {
                  const dLeft = daysRemaining(item.date, '2026-03-03')
                  const isPast = dLeft < 0
                  const isToday = dLeft === 0
                  return (
                    <div key={i} class={`flex items-center gap-4 px-4 sm:px-5 py-3.5 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-700/50' : ''}`}>
                      <span class="text-xl" aria-hidden="true">{item.icon}</span>
                      <div class="flex-1">
                        <div class="text-xs text-content-secondary dark:text-content-dark-muted">{item.label}</div>
                        <div class={`text-sm font-semibold ${isPast ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-content-primary dark:text-content-dark'}`}>
                          {formatDateShort(item.date)}
                        </div>
                      </div>
                      <div class={`text-xs font-medium px-2.5 py-1 rounded-pill ${
                        isPast ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' :
                        isToday ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        dLeft <= 7 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {isPast ? 'Passed' : isToday ? 'Today!' : `${dLeft} days left`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Tab: Exam Pattern ────────────────────────── */}
            <div class="jd-tab-content hidden" data-tab-content="exam-pattern">
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-4">Exam Pattern</h2>

              {job.exam_pattern ? (
                <div class="mb-6">
                  <div class="overflow-x-auto rounded-card border border-gray-200 dark:border-gray-700">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <th class="px-3 py-2.5 text-left font-semibold text-content-primary dark:text-content-dark">Section</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">Questions</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">Marks</th>
                          <th class="px-3 py-2.5 text-center font-semibold text-content-primary dark:text-content-dark">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.exam_pattern.map((sec, i) => (
                          <tr key={i} class="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                            <td class="px-3 py-2.5 font-medium text-content-primary dark:text-content-dark">{sec.section}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{sec.questions}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{sec.marks}</td>
                            <td class="px-3 py-2.5 text-center text-content-secondary dark:text-content-dark-muted">{sec.duration_minutes ? `${sec.duration_minutes} min` : 'Combined'}</td>
                          </tr>
                        ))}
                        <tr class="bg-gray-50 dark:bg-gray-800/50 font-semibold">
                          <td class="px-3 py-2.5 text-content-primary dark:text-content-dark">Total</td>
                          <td class="px-3 py-2.5 text-center text-content-primary dark:text-content-dark">{job.exam_pattern.reduce((s, sec) => s + sec.questions, 0)}</td>
                          <td class="px-3 py-2.5 text-center text-brand-primary dark:text-blue-400">{job.exam_pattern.reduce((s, sec) => s + sec.marks, 0)}</td>
                          <td class="px-3 py-2.5 text-center text-content-primary dark:text-content-dark">
                            {job.exam_pattern.some(s => s.duration_minutes)
                              ? `${job.exam_pattern.reduce((s, sec) => s + (sec.duration_minutes || 0), 0)} min`
                              : '\u2014'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div class="p-6 text-center bg-gray-50 dark:bg-gray-800/50 rounded-card border border-gray-200 dark:border-gray-700 mb-6">
                  <p class="text-sm text-content-secondary dark:text-content-dark-muted">No written examination for this recruitment. Selection is based on physical tests, merit, and document verification.</p>
                </div>
              )}

              {/* Syllabus Topics */}
              {job.syllabus_topics && (
                <div>
                  <h3 class="font-heading font-semibold text-base text-content-primary dark:text-content-dark mb-3">Syllabus Topics</h3>
                  <div class="space-y-3">
                    {Object.entries(job.syllabus_topics).map(([subject, topics]) => (
                      <div key={subject} class="bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 p-4">
                        <h4 class="font-semibold text-sm text-content-primary dark:text-content-dark mb-2">{subject}</h4>
                        <div class="flex flex-wrap gap-1.5">
                          {topics.map((topic: string) => (
                            <span key={topic} class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-content-secondary dark:text-content-dark-muted rounded-pill">{topic}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Profile Wizard */}
      <ProfileWizard />

      {/* Inline job data for client-side eligibility */}
      <script
        id="jd-job-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(job) }}
      />

      {/* Job detail client-side script */}
      <script src="/static/job-detail.js" defer></script>
    </Layout>
  )
}
