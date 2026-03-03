import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'
import { ProfileProvider } from '../lib/profile-context'
import { ProfileWizard } from '../components/ProfileWizard'
import { placeholderJobs, type Job } from '../lib/placeholder-data'
import { sectorMeta, formatDateShort, daysRemaining, formatSalary, formatVacancies, educationLabels } from '../lib/job-helpers'

/* -- Sector options for filter ----------------------------- */
const sectorOptions: { value: string; label: string; icon: string }[] = [
  { value: '', label: 'All Sectors', icon: '\ud83d\udccb' },
  { value: 'banking', label: 'Banking', icon: '\ud83c\udfe6' },
  { value: 'railway', label: 'Railway', icon: '\ud83d\ude82' },
  { value: 'ssc', label: 'SSC', icon: '\ud83d\udccb' },
  { value: 'upsc', label: 'UPSC', icon: '\ud83c\udfdb\ufe0f' },
  { value: 'defence', label: 'Defence', icon: '\ud83c\udf96\ufe0f' },
  { value: 'teaching', label: 'Teaching', icon: '\ud83d\udc68\u200d\ud83c\udfeb' },
  { value: 'state_psc', label: 'State PSC', icon: '\ud83c\udfe2' },
  { value: 'police', label: 'Police', icon: '\ud83d\udc6e' },
  { value: 'psu', label: 'PSU', icon: '\ud83c\udfed' },
  { value: 'other', label: 'Other', icon: '\ud83d\udccc' },
]

const educationOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Education' },
  { value: '10th', label: '10th Pass' },
  { value: '12th', label: '12th Pass' },
  { value: 'iti', label: 'ITI' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'pg', label: 'Post Graduate' },
  { value: 'phd', label: 'PhD' },
]

const stateOptions: string[] = [
  'All India',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli',
  'Daman & Diu', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
]

const sortOptions: { value: string; label: string }[] = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'newest', label: 'Newest First' },
  { value: 'closing_soon', label: 'Closing Soon' },
  { value: 'highest_vacancies', label: 'Highest Vacancies' },
  { value: 'highest_salary', label: 'Highest Salary' },
]

/* -- Schema.org -------------------------------------------- */
const jobListSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': 'Government Jobs 2026 \u2014 SarkariMatch',
  'description': 'Browse and filter all government job notifications across Banking, Railway, SSC, UPSC, Defence, Teaching, Police & more.',
  'url': 'https://sarkarimatch.com/jobs',
}

/* -- Helper: render one SSR job card ----------------------- */
function JobCard({ job }: { job: Job }) {
  const sector = sectorMeta[job.sector] || sectorMeta.other
  const days = daysRemaining(job.important_dates.last_date)
  const isClosingSoon = days >= 0 && days <= 7
  const isExpired = days < 0
  const salary = formatSalary(job.salary_min, job.salary_max)
  const vacancies = formatVacancies(job.total_vacancies)
  const eduLabel = educationLabels[job.education_level] || job.education_level
  const feeGeneral = job.application_fee_general === 0 ? 'Free' : `\u20b9${job.application_fee_general}`

  return (
    <article
      class={`job-card group bg-white dark:bg-surface-card-dark rounded-card border transition-all duration-200 hover:shadow-card-hover relative overflow-hidden ${
        isExpired
          ? 'border-gray-200 dark:border-gray-700 opacity-60'
          : isClosingSoon
            ? 'border-red-300 dark:border-red-700 ring-1 ring-red-200 dark:ring-red-800'
            : 'border-gray-200 dark:border-gray-700'
      }`}
      data-job-id={job.id}
      data-sector={job.sector}
      data-education={job.education_level}
      data-locations={JSON.stringify(job.locations)}
      data-last-date={job.important_dates.last_date}
      data-vacancies={job.total_vacancies}
      data-salary-max={job.salary_max}
      data-created={job.created_at}
      data-fee-general={job.application_fee_general}
      data-has-exam={job.important_dates.exam_date ? 'true' : 'false'}
      data-status={job.status}
    >
      {/* Eligibility badge placeholder -- filled by JS */}
      <div class="job-eligibility-badge hidden" data-job-eligibility></div>

      {/* Closing soon / expired banner */}
      {isClosingSoon && !isExpired && (
        <div class="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-4 py-1.5 flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span class="text-xs font-semibold text-red-700 dark:text-red-300">
            Closing in {days} day{days !== 1 ? 's' : ''} \u2014 Apply Now!
          </span>
        </div>
      )}
      {isExpired && (
        <div class="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-1.5">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Application Closed</span>
        </div>
      )}

      <div class="p-4 sm:p-5">
        {/* Top row: sector pill + bookmark */}
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold ${sector.bgClass} ${sector.textClass}`}>
              <span aria-hidden="true">{sector.icon}</span>
              {sector.label}
            </span>
            {job.featured && (
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                Featured
              </span>
            )}
          </div>
          <button
            type="button"
            class="bookmark-btn shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            data-slug={job.slug}
            aria-label="Bookmark this job"
          >
            <svg class="bookmark-outline w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <svg class="bookmark-filled w-5 h-5 text-brand-secondary hidden" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 class="font-heading font-bold text-base sm:text-lg text-content-primary dark:text-content-dark leading-tight line-clamp-2 mb-2">
          <a href={`/jobs/${job.slug}`} class="hover:text-brand-primary dark:hover:text-blue-400 transition-colors">
            {job.notification_title}
          </a>
        </h3>

        {/* Organization */}
        <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-3 truncate">
          {job.organization}
        </p>

        {/* Eligible posts bar -- populated by JS */}
        <div class="job-eligible-posts-bar hidden mb-3" data-eligible-bar></div>

        {/* Key info grid */}
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
          <div class="flex items-center gap-1.5">
            <span class="text-content-secondary dark:text-content-dark-muted" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span class="text-content-primary dark:text-content-dark font-medium">{vacancies}</span>
            <span class="text-content-secondary dark:text-content-dark-muted">posts</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-content-secondary dark:text-content-dark-muted" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </span>
            <span class="text-content-primary dark:text-content-dark font-medium">{eduLabel}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-content-secondary dark:text-content-dark-muted" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </span>
            <span class="text-content-primary dark:text-content-dark font-medium">{salary}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-content-secondary dark:text-content-dark-muted" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="text-content-primary dark:text-content-dark font-medium">{feeGeneral}</span>
            <span class="text-content-secondary dark:text-content-dark-muted">fee</span>
          </div>
        </div>

        {/* Age range */}
        <div class="flex items-center gap-1.5 text-sm mb-4">
          <span class="text-content-secondary dark:text-content-dark-muted" aria-hidden="true">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </span>
          <span class="text-content-secondary dark:text-content-dark-muted">Age:</span>
          <span class="text-content-primary dark:text-content-dark font-medium">
            {job.age_min === 0 && job.age_max === 0
              ? 'No limit'
              : `${job.age_min}\u2013${job.age_max} years`}
          </span>
        </div>

        {/* Dates row */}
        <div class="flex items-center gap-3 text-xs text-content-secondary dark:text-content-dark-muted border-t border-gray-100 dark:border-gray-700/50 pt-3">
          <div class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>Last: <strong class="text-content-primary dark:text-content-dark">{formatDateShort(job.important_dates.last_date)}</strong></span>
          </div>
          {job.important_dates.exam_date && (
            <div class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Exam: <strong class="text-content-primary dark:text-content-dark">{formatDateShort(job.important_dates.exam_date)}</strong></span>
            </div>
          )}
          <div class="flex items-center gap-1 ml-auto">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{job.locations[0]}{job.locations.length > 1 ? ` +${job.locations.length - 1}` : ''}</span>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div class="border-t border-gray-100 dark:border-gray-700/50 px-4 sm:px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
        <a
          href={`/jobs/${job.slug}`}
          class="text-sm font-semibold text-brand-primary dark:text-blue-400 hover:underline"
        >
          View Details \u2192
        </a>
        {!isExpired && (
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-btn transition-colors duration-150"
          >
            Apply
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </div>
    </article>
  )
}

/* -- Main Jobs Page ---------------------------------------- */
export const JobsPage: FC = () => {
  const publishedJobs = placeholderJobs
    .filter((j) => j.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <Layout
      meta={{
        title: 'Government Jobs 2026 \u2014 Find Jobs Matching Your Profile | SarkariMatch',
        description:
          'Browse all government job notifications for 2026. Filter by sector, education, state. Set your profile to see personalized eligibility matches across Banking, Railway, SSC, UPSC, Defence, Teaching & more.',
        ogTitle: 'Government Jobs 2026 \u2014 SarkariMatch',
        ogDescription: 'Find government jobs that match YOUR eligibility. Filter, compare, and apply.',
        ogUrl: 'https://sarkarimatch.com/jobs',
      }}
      currentPath="/jobs"
      structuredData={jobListSchema}
    >
      {/* Profile Provider */}
      <ProfileProvider />

      {/* -- Profile Summary Bar ------------------------------ */}
      <div id="jobs-profile-bar" class="border-b border-gray-200 dark:border-gray-700">
        {/* No-profile banner */}
        <div id="no-profile-banner" class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" aria-hidden="true">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </span>
              <div>
                <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">Set your profile to see eligibility matches</p>
                <p class="text-xs text-amber-700/80 dark:text-amber-400/70">Know instantly which jobs you can apply for</p>
              </div>
            </div>
            <button
              type="button"
              data-open-wizard
              class="inline-flex items-center px-4 py-2 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-sm rounded-pill transition-colors whitespace-nowrap"
            >
              Set Your Profile
            </button>
          </div>
        </div>

        {/* Profile summary (shown by JS when profile exists) */}
        <div id="profile-summary-bar" class="hidden">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3 text-sm flex-wrap">
              <span class="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" aria-hidden="true">\u2713</span>
              <span class="font-medium text-content-primary dark:text-content-dark" id="profile-summary-text">Profile loaded</span>
              <span class="text-content-secondary dark:text-content-dark-muted">|</span>
              <span class="text-content-secondary dark:text-content-dark-muted" id="profile-summary-details"></span>
            </div>
            <div class="flex items-center gap-2">
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
      </div>

      {/* -- Tabs: All Jobs / My Bookmarks -------------------- */}
      <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-0">
            <button
              type="button"
              id="tab-all-jobs"
              class="tab-btn px-4 py-2 text-sm font-semibold border-b-2 border-brand-primary text-brand-primary dark:text-blue-400 dark:border-blue-400 transition-colors"
            >
              All Jobs
            </button>
            <button
              type="button"
              id="tab-bookmarks"
              class="tab-btn px-4 py-2 text-sm font-medium text-content-secondary dark:text-content-dark-muted border-b-2 border-transparent hover:text-content-primary dark:hover:text-content-dark transition-colors flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              My Bookmarks
              <span id="bookmarks-count" class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-[10px] font-bold" style="display:none">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* -- Sticky Filter Bar -------------------------------- */}
      <div id="filter-bar" class="sticky top-14 md:top-16 z-40 bg-white/95 dark:bg-surface-dark/95 border-b border-gray-200 dark:border-gray-700" style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Desktop filters */}
          <div class="hidden md:flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div class="relative flex-1 max-w-xs">
              <input
                type="text"
                id="filter-search"
                placeholder="Search jobs..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                aria-label="Search jobs"
              />
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            {/* Sector */}
            <select id="filter-sector" class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition pw-select" aria-label="Filter by sector">
              {sectorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Education */}
            <select id="filter-education" class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition pw-select" aria-label="Filter by education">
              {educationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* State */}
            <select id="filter-state" class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition pw-select" aria-label="Filter by state">
              <option value="">All States</option>
              {stateOptions.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Divider */}
            <div class="w-px h-8 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></div>

            {/* Toggle: Eligible Only */}
            <label class="inline-flex items-center gap-1.5 cursor-pointer select-none" id="toggle-eligible-label">
              <input type="checkbox" id="filter-eligible-only" class="sr-only peer" />
              <span class="w-8 h-[18px] bg-gray-300 dark:bg-gray-600 peer-checked:bg-green-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-[14px]"></span>
              <span class="text-xs font-medium text-content-secondary dark:text-content-dark-muted">Eligible</span>
            </label>

            {/* Toggle: Closing Soon */}
            <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" id="filter-closing-soon" class="sr-only peer" />
              <span class="w-8 h-[18px] bg-gray-300 dark:bg-gray-600 peer-checked:bg-red-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-[14px]"></span>
              <span class="text-xs font-medium text-content-secondary dark:text-content-dark-muted">Closing Soon</span>
            </label>

            {/* Toggle: Free Apply */}
            <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" id="filter-free-apply" class="sr-only peer" />
              <span class="w-8 h-[18px] bg-gray-300 dark:bg-gray-600 peer-checked:bg-blue-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-[14px]"></span>
              <span class="text-xs font-medium text-content-secondary dark:text-content-dark-muted">Free</span>
            </label>

            {/* Toggle: No Exam */}
            <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" id="filter-no-exam" class="sr-only peer" />
              <span class="w-8 h-[18px] bg-gray-300 dark:bg-gray-600 peer-checked:bg-purple-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-[14px]"></span>
              <span class="text-xs font-medium text-content-secondary dark:text-content-dark-muted">No Exam</span>
            </label>

            {/* Sort */}
            <select id="filter-sort" class="ml-auto px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition pw-select" aria-label="Sort jobs">
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile: search + Filters button */}
          <div class="md:hidden flex items-center gap-2">
            <div class="relative flex-1">
              <input
                type="text"
                id="filter-search-mobile"
                placeholder="Search jobs..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                aria-label="Search jobs"
              />
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <button
              type="button"
              id="mobile-filters-btn"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open filters"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filters
              <span id="active-filter-count" class="hidden w-5 h-5 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* -- Mobile Filter Bottom Sheet ----------------------- */}
      <div id="mobile-filter-sheet" class="fixed inset-0 z-[70] hidden" aria-modal="true" role="dialog" aria-label="Filters">
        <div id="mobile-filter-backdrop" class="absolute inset-0 bg-black/40" style="backdrop-filter: blur(4px);"></div>
        <div id="mobile-filter-panel" class="absolute bottom-0 left-0 right-0 bg-white dark:bg-surface-card-dark rounded-t-2xl max-h-[85vh] overflow-y-auto transform translate-y-full transition-transform duration-300">
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" aria-hidden="true"></div>
          </div>
          <div class="px-4 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <h3 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark">Filters</h3>
            <button type="button" id="mobile-filter-close" class="text-sm font-medium text-brand-primary dark:text-blue-400" aria-label="Close filters">Done</button>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1.5 block">Sector</label>
              <select id="mobile-filter-sector" class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark pw-select">
                {sectorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label class="text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1.5 block">Education</label>
              <select id="mobile-filter-education" class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark pw-select">
                {educationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label class="text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1.5 block">State</label>
              <select id="mobile-filter-state" class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark pw-select">
                <option value="">All States</option>
                {stateOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div class="space-y-3 pt-2">
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-content-primary dark:text-content-dark">Eligible Only</span>
                <input type="checkbox" id="mobile-filter-eligible" class="sr-only peer" />
                <span class="w-10 h-5 bg-gray-300 dark:bg-gray-600 peer-checked:bg-green-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-5"></span>
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-content-primary dark:text-content-dark">Closing Soon (7 days)</span>
                <input type="checkbox" id="mobile-filter-closing" class="sr-only peer" />
                <span class="w-10 h-5 bg-gray-300 dark:bg-gray-600 peer-checked:bg-red-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-5"></span>
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-content-primary dark:text-content-dark">Free to Apply</span>
                <input type="checkbox" id="mobile-filter-free" class="sr-only peer" />
                <span class="w-10 h-5 bg-gray-300 dark:bg-gray-600 peer-checked:bg-blue-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-5"></span>
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-content-primary dark:text-content-dark">No Written Exam</span>
                <input type="checkbox" id="mobile-filter-noexam" class="sr-only peer" />
                <span class="w-10 h-5 bg-gray-300 dark:bg-gray-600 peer-checked:bg-purple-500 rounded-full relative transition-colors duration-200 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-[14px] after:h-[14px] after:bg-white after:rounded-full after:transition-transform after:duration-200 peer-checked:after:translate-x-5"></span>
              </label>
            </div>
            <div>
              <label class="text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider mb-1.5 block">Sort By</label>
              <select id="mobile-filter-sort" class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-card-dark text-content-primary dark:text-content-dark pw-select">
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              id="mobile-filter-reset"
              class="w-full py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-btn hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      {/* -- Quick Stats Bar (animated) ----------------------- */}
      <div id="quick-stats-bar" class="hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3"></div>

      {/* -- Results Header ----------------------------------- */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="font-heading font-bold text-xl sm:text-2xl text-content-primary dark:text-content-dark">
            Government Jobs 2026
          </h1>
          <p class="text-sm text-content-secondary dark:text-content-dark-muted mt-0.5" id="results-count">
            Showing {publishedJobs.length} jobs
          </p>
        </div>
        <div class="flex items-center gap-3">
          {/* Keyboard shortcuts link (desktop only) */}
          <a
            href="#"
            id="shortcuts-link"
            class="hidden md:inline-flex items-center gap-1 text-xs text-content-secondary dark:text-content-dark-muted hover:text-content-primary dark:hover:text-content-dark transition-colors"
            title="Keyboard shortcuts"
          >
            <kbd class="inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-mono">?</kbd>
            <span>Shortcuts</span>
          </a>
          {/* View toggle */}
          <div class="hidden sm:flex items-center border border-gray-200 dark:border-gray-700 rounded-btn overflow-hidden">
            <button
              type="button"
              id="view-grid"
              class="p-2 bg-brand-primary text-white"
              aria-label="Grid view"
              aria-pressed="true"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              type="button"
              id="view-list"
              class="p-2 text-content-secondary dark:text-content-dark-muted hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="List view"
              aria-pressed="false"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* -- Bookmarks Empty State (hidden by default) -------- */}
      <div id="bookmarks-empty-state" class="hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div class="py-16 text-center">
          <div class="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center mb-5">
            <svg class="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-2">No bookmarked jobs yet</h3>
          <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-5 max-w-md mx-auto">
            Bookmark jobs you're interested in by clicking the bookmark icon on any job card. They'll appear here for quick access.
          </p>
          <button
            type="button"
            class="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-brand-primary dark:text-blue-400 border border-brand-primary dark:border-blue-400 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            onclick="document.getElementById('tab-all-jobs').click()"
          >
            Browse All Jobs
          </button>
        </div>
      </div>

      {/* -- Job Cards Grid ----------------------------------- */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div
          id="jobs-grid"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {publishedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* No results (generic) */}
        <div id="no-results" class="hidden py-16 text-center">
          <div class="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-5">
            <svg class="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-2">No jobs match your filters</h3>
          <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-5 max-w-md mx-auto">
            Try adjusting your filters, changing the sector, or broadening your search query to find more opportunities.
          </p>
          <button
            type="button"
            id="clear-filters-btn"
            class="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-brand-primary dark:text-blue-400 border border-brand-primary dark:border-blue-400 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Clear All Filters
          </button>
        </div>

        {/* No eligible jobs (shown when eligible-only is on but none found) */}
        <div id="no-eligible-state" class="hidden py-16 text-center">
          <div class="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 flex items-center justify-center mb-5">
            <svg class="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark mb-2">No fully eligible jobs found</h3>
          <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-2 max-w-md mx-auto">
            Based on your profile, none of the current jobs show 100% eligibility. But don't worry!
          </p>
          <p class="text-sm text-amber-600 dark:text-amber-400 font-medium mb-5">
            You have <span id="partial-match-count" class="font-bold">0</span> partial matches you might still qualify for.
          </p>
          <button
            type="button"
            id="view-partial-btn"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-blue-700 rounded-btn transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View Partial Matches
          </button>
        </div>

        {/* Load More */}
        <div id="load-more-container" class="mt-8 text-center">
          <button
            type="button"
            id="load-more-btn"
            class="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-brand-primary dark:text-blue-400 border-2 border-brand-primary dark:border-blue-400 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
            </svg>
            Load More Jobs
          </button>
          <p id="all-loaded-text" class="hidden text-sm text-content-secondary dark:text-content-dark-muted mt-3">
            All jobs loaded
          </p>
        </div>
      </div>

      {/* Profile Wizard */}
      <ProfileWizard />

      {/* Inline job data for eligibility engine */}
      <script
        id="jobs-data-script"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            publishedJobs.reduce((acc: Record<string, Job>, job) => {
              acc[job.id] = job
              return acc
            }, {})
          ),
        }}
      />

      {/* Jobs page script */}
      <script src="/static/jobs.js" defer></script>
    </Layout>
  )
}
