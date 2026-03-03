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
const TODAY = '2026-03-03'

function getStatusBadge(job: Job): { label: string; color: string; bgClass: string; textClass: string; icon: string } {
  const lastDate = job.important_dates.last_date
  const startDate = job.important_dates.start_date
  const days = daysRemaining(lastDate, TODAY)

  if (days < 0) return { label: 'EXPIRED', color: '#6B7280', bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-700 dark:text-gray-300', icon: '\u26d4' }
  if (TODAY < startDate) return { label: 'UPCOMING', color: '#7C3AED', bgClass: 'bg-purple-100 dark:bg-purple-900/30', textClass: 'text-purple-800 dark:text-purple-300', icon: '\ud83d\udcc5' }
  if (days <= 7) return { label: 'CLOSING SOON', color: '#DC2626', bgClass: 'bg-red-100 dark:bg-red-900/30', textClass: 'text-red-800 dark:text-red-300', icon: '\u23f3' }
  return { label: 'ACTIVE', color: '#059669', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-800 dark:text-green-300', icon: '\u2705' }
}

/* ── FAQ Generator ─────────────────────────────────────────── */
function generateFAQs(job: Job): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []
  const eduLabel = educationLabels[job.education_level] || job.education_level
  const salary = formatSalary(job.salary_min, job.salary_max)
  const vacancies = formatVacancies(job.total_vacancies)

  faqs.push({
    question: `What is the eligibility criteria for ${job.notification_title}?`,
    answer: `Candidates must have ${eduLabel} qualification. The age limit is ${job.age_min === 0 && job.age_max === 0 ? 'no age limit specified' : `${job.age_min}–${job.age_max} years`} (with relaxation for SC/ST/OBC/PwBD as per government rules). Detailed eligibility for each post is mentioned in the official notification.`,
  })

  faqs.push({
    question: `What is the salary for ${job.organization} ${job.posts[0]?.post_name || 'this post'}?`,
    answer: `The salary range is ${salary} per month. This includes basic pay plus allowances such as DA, HRA, and other benefits as per ${job.organization} norms.`,
  })

  faqs.push({
    question: `How to apply for ${job.notification_title}?`,
    answer: `Applications must be submitted ${job.application_mode.toLowerCase()}. Visit ${job.official_website} and follow the application process. The last date to apply is ${formatDateShort(job.important_dates.last_date)}. Application fee is ₹${job.application_fee_general} for General/OBC and ${job.application_fee_sc_st === 0 ? 'Nil' : '₹' + job.application_fee_sc_st} for SC/ST candidates.`,
  })

  faqs.push({
    question: `What is the selection process for ${job.notification_title}?`,
    answer: `The selection process consists of ${job.selection_process.length} stages: ${job.selection_process.map(s => s.name).join(', ')}. ${job.selection_process.filter(s => s.is_eliminatory).length} of these stages are eliminatory in nature.`,
  })

  if (job.exam_pattern) {
    const totalQ = job.exam_pattern.reduce((s, sec) => s + sec.questions, 0)
    const totalM = job.exam_pattern.reduce((s, sec) => s + sec.marks, 0)
    faqs.push({
      question: `What is the exam pattern for ${job.notification_title}?`,
      answer: `The exam has ${job.exam_pattern.length} sections with a total of ${totalQ} questions carrying ${totalM} marks. Sections include ${job.exam_pattern.map(s => s.section).join(', ')}. ${job.marking_scheme || ''}`,
    })
  }

  if (job.age_min > 0 || job.age_max > 0) {
    faqs.push({
      question: `What is the age limit for ${job.notification_title}?`,
      answer: `The age limit is ${job.age_min}–${job.age_max} years as on the last date of application. Age relaxation: OBC – 3 years, SC/ST – 5 years, PwBD – up to 10 years, Ex-Servicemen – as per government rules.`,
    })
  }

  if (job.total_vacancies > 0) {
    faqs.push({
      question: `How many vacancies are there in ${job.notification_title}?`,
      answer: `There are a total of ${vacancies} vacancies across ${job.posts.length} post(s): ${job.posts.map(p => `${p.post_name} (${formatVacancies(p.vacancies_total)})`).join(', ')}.`,
    })
  }

  faqs.push({
    question: `What is the educational qualification required for ${job.notification_title}?`,
    answer: `The minimum qualification required is ${eduLabel}. ${job.posts.length > 1 ? 'Different posts may have specific educational requirements: ' + job.posts.map(p => `${p.post_name} – ${p.education_required}`).join('; ') + '.' : `Specifically: ${job.posts[0]?.education_required || eduLabel}.`}`,
  })

  return faqs.slice(0, 8)
}

/* ── Similar Jobs finder ───────────────────────────────────── */
function findSimilarJobs(currentJob: Job): Job[] {
  const candidates = placeholderJobs.filter(
    j => j.slug !== currentJob.slug && j.status === 'published' && daysRemaining(j.important_dates.last_date, TODAY) >= 0
  )
  // Priority: same sector > same education > featured > any
  const sameSector = candidates.filter(j => j.sector === currentJob.sector)
  const sameEdu = candidates.filter(j => j.education_level === currentJob.education_level && j.sector !== currentJob.sector)
  const rest = candidates.filter(j => j.sector !== currentJob.sector && j.education_level !== currentJob.education_level)
  const ordered = [...sameSector, ...sameEdu, ...rest]
  return ordered.slice(0, 4)
}

/* ── Prev / Next job navigation ────────────────────────────── */
function getAdjacentJobs(currentJob: Job): { prev: Job | null; next: Job | null } {
  const published = placeholderJobs.filter(j => j.status === 'published')
  const idx = published.findIndex(j => j.slug === currentJob.slug)
  return {
    prev: idx > 0 ? published[idx - 1] : null,
    next: idx < published.length - 1 ? published[idx + 1] : null,
  }
}

/* ── Reading time estimate ─────────────────────────────────── */
function estimateReadingTime(job: Job): number {
  const text = [
    job.summary,
    job.how_to_apply.join(' '),
    job.selection_process.map(s => s.name + ' ' + s.description).join(' '),
    job.exam_pattern ? job.exam_pattern.map(s => s.section).join(' ') : '',
    job.syllabus_topics ? Object.entries(job.syllabus_topics).map(([k, v]) => k + ' ' + v.join(' ')).join(' ') : '',
  ].join(' ')
  const words = text.split(/\s+/).length
  return Math.max(3, Math.ceil(words / 200))
}

/* ── Related SEO internal links ────────────────────────────── */
const relatedInternalLinks = [
  { label: 'Banking Jobs', href: '/jobs?sector=banking', desc: 'SBI, IBPS, RBI and other bank recruitments' },
  { label: 'Railway Jobs', href: '/jobs?sector=railway', desc: 'RRB, KRCL and Indian Railway vacancies' },
  { label: 'SSC Jobs', href: '/jobs?sector=ssc', desc: 'SSC CGL, CHSL, MTS and other exams' },
  { label: 'Defence Jobs', href: '/jobs?sector=defence', desc: 'Army, Navy, Air Force & UPSC CDS' },
  { label: 'State PSC Jobs', href: '/jobs?sector=state_psc', desc: 'BPSC, UPPSC and state commission exams' },
  { label: 'Teaching Jobs', href: '/jobs?sector=teaching', desc: 'UGC NET, CTET and academic positions' },
  { label: 'Police Jobs', href: '/jobs?sector=police', desc: 'State police constable & SI recruitment' },
  { label: 'Latest Government Jobs', href: '/jobs', desc: 'Browse all active sarkari job notifications' },
  { label: 'About SarkariMatch', href: '/about', desc: 'India\'s smart eligibility-checking job portal' },
  { label: 'Privacy Policy', href: '/privacy', desc: 'How we handle your data securely' },
]

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
  const days = daysRemaining(job.important_dates.last_date, TODAY)
  const progress = applicationProgress(job.important_dates.start_date, job.important_dates.last_date, TODAY)
  const salary = formatSalary(job.salary_min, job.salary_max)
  const vacancies = formatVacancies(job.total_vacancies)
  const eduLabel = educationLabels[job.education_level] || job.education_level
  const isExpired = days < 0
  const isDefence = job.sector === 'defence'
  const isUPSCOrPSC = job.sector === 'upsc' || job.sector === 'state_psc'
  const readingTime = estimateReadingTime(job)
  const faqs = generateFAQs(job)
  const similarJobs = findSimilarJobs(job)
  const { prev, next } = getAdjacentJobs(job)

  // Compute vacancy totals for the stacked bar
  const vbTotals = job.vacancy_breakdown.reduce(
    (acc, r) => ({ ur: acc.ur + r.ur, obc: acc.obc + r.obc, sc: acc.sc + r.sc, st: acc.st + r.st, ews: acc.ews + r.ews, total: acc.total + r.total }),
    { ur: 0, obc: 0, sc: 0, st: 0, ews: 0, total: 0 }
  )

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

  /* Schema.org JobPosting — one per post */
  const jobPostingSchemas = job.posts.map((post, i) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': `${post.post_name} — ${job.organization}`,
    'description': `${job.summary} Post: ${post.post_name}. Education: ${post.education_required}. Age: ${post.age_limit}.`,
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
    'industry': sector.label,
    'qualifications': post.education_required,
    'totalJobOpenings': post.vacancies_total,
  }))

  /* Schema.org FAQPage */
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': faq.answer },
    })),
  }

  // All dates array for timeline
  const allDates = [
    { label: 'Notification Date', date: job.important_dates.notification_date, icon: '\ud83d\udce2' },
    { label: 'Application Start Date', date: job.important_dates.start_date, icon: '\ud83d\udcc4' },
    { label: 'Application Last Date', date: job.important_dates.last_date, icon: '\u23f0' },
    ...(job.important_dates.exam_date ? [{ label: 'Exam Date', date: job.important_dates.exam_date, icon: '\ud83d\udcdd' }] : []),
  ]

  const canonicalUrl = `https://sarkarimatch.com/jobs/${job.slug}`

  return (
    <Layout
      meta={{
        title: `${job.notification_title} — Apply Now | Eligibility, Dates, Salary — SarkariMatch`,
        description: `${job.notification_title}: ${vacancies} vacancies, ${salary}/month salary, last date ${formatDateShort(job.important_dates.last_date)}. Check eligibility, exam pattern & apply online at SarkariMatch.`,
        ogTitle: `${job.notification_title} — ${vacancies} Vacancies`,
        ogDescription: `Apply for ${job.notification_title}. ${vacancies} vacancies, ${salary}/month. Last date: ${formatDateShort(job.important_dates.last_date)}. Check eligibility now!`,
        ogUrl: canonicalUrl,
        canonical: canonicalUrl,
      }}
      currentPath="/jobs"
      structuredData={breadcrumbSchema}
    >
      {/* Profile Provider */}
      <ProfileProvider />

      {/* BreadcrumbList JSON-LD (already in Layout via structuredData) */}

      {/* JobPosting JSON-LD — one per post */}
      {jobPostingSchemas.map((schema, i) => (
        <script
          key={`jp-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                    Featured
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

          {/* Meta info row: reading time + last updated + print */}
          <div class="mt-4 flex items-center justify-between flex-wrap gap-2 text-xs text-content-secondary dark:text-content-dark-muted">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="inline-flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {readingTime} min read
              </span>
              <span class="inline-flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                Updated: {formatDateShort(job.created_at.split('T')[0])}
              </span>
            </div>
            <button
              type="button"
              id="print-page-btn"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium print:hidden"
              aria-label="Print this page"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>
              Print
            </button>
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
                    href={job.apply_link}
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
                          ? 'text-brand-secondary dark:text-amber-400 border-brand-secondary dark:border-amber-400 font-bold'
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

            {/* ═══════════════════════════════════════════════════
               TAB 1: OVERVIEW
               ═══════════════════════════════════════════════════ */}
            <div class="jd-tab-content" data-tab-content="overview">
              {/* Job Summary with Read More */}
              <div class="mb-6">
                <h2 class="jd-heading">About This Notification</h2>
                <div id="overview-summary-wrap" class="relative">
                  <p id="overview-summary-text" class="jd-body-text">{job.summary}</p>
                  {job.summary.length > 300 && (
                    <button id="overview-read-more" type="button" class="text-brand-primary dark:text-blue-400 text-sm font-semibold mt-1 hover:underline hidden">Read More</button>
                  )}
                </div>
              </div>

              {/* Key Highlights Table */}
              <div class="mb-6">
                <h2 class="jd-heading">Key Highlights</h2>
                <div class="jd-kv-table rounded-card border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table class="w-full text-sm">
                    <tbody>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Organization</td><td class="jd-kv-val">{job.organization}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Department</td><td class="jd-kv-val">{job.department}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Total Vacancies</td><td class="jd-kv-val font-semibold text-brand-primary dark:text-blue-400">{vacancies === 'Exam' ? 'Eligibility Test (No fixed vacancies)' : vacancies}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Qualification</td><td class="jd-kv-val">{eduLabel}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Age Limit</td><td class="jd-kv-val">{job.age_min === 0 && job.age_max === 0 ? 'No age limit' : `${job.age_min}\u2013${job.age_max} years`}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Salary Range</td><td class="jd-kv-val">{salary}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Application Fee</td><td class="jd-kv-val">{job.application_fee_general === 0 ? 'Free' : `Gen/OBC: \u20b9${job.application_fee_general} | SC/ST: ${job.application_fee_sc_st === 0 ? 'Free' : '\u20b9' + job.application_fee_sc_st}`}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Last Date</td><td class="jd-kv-val">{formatDateShort(job.important_dates.last_date)} {days >= 0 ? `(${days} days left)` : '(Closed)'}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Mode of Apply</td><td class="jd-kv-val">{job.application_mode}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Selection</td><td class="jd-kv-val">{job.selection_process.map(s => s.name).join(' \u2192 ')}</td></tr>
                      <tr class="jd-kv-row"><td class="jd-kv-key">Job Location</td><td class="jd-kv-val">{job.locations.join(', ')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Important Notice */}
              {job.important_notice && (
                <div class="jd-notice-box mb-6">
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 w-5 h-5 mt-0.5">
                      <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    </span>
                    <div>
                      <h3 class="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-1">Important Notice</h3>
                      <p class="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">{job.important_notice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div class="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag) => (
                  <span key={tag} class="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-content-secondary dark:text-content-dark-muted rounded-pill">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Official website */}
              <div class="jd-info-box jd-info-box-blue mb-4">
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

            {/* ═══════════════════════════════════════════════════
               TAB 2: POSTS & VACANCIES
               ═══════════════════════════════════════════════════ */}
            <div class="jd-tab-content hidden" data-tab-content="posts">
              <h2 class="jd-heading">Posts &amp; Vacancies</h2>
              <p class="jd-body-text mb-5">
                {job.posts.length} {job.posts.length === 1 ? 'post' : 'posts'} with <strong class="text-content-primary dark:text-content-dark">{vacancies}</strong> total vacancies
              </p>

              {/* Desktop: Full Vacancy Table */}
              {job.vacancy_breakdown.length > 0 && vbTotals.total > 0 && (
                <div class="jd-vacancy-table-wrap mb-6 hidden sm:block">
                  <div class="overflow-x-auto rounded-card border border-gray-200 dark:border-gray-700">
                    <table class="w-full text-sm jd-table" id="vacancy-table">
                      <thead>
                        <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <th class="jd-th text-left sticky left-0 bg-gray-50 dark:bg-gray-800/50 z-10 min-w-[180px]">Post Name</th>
                          <th class="jd-th text-center" data-cat="ur">UR</th>
                          <th class="jd-th text-center" data-cat="obc">OBC</th>
                          <th class="jd-th text-center" data-cat="sc">SC</th>
                          <th class="jd-th text-center" data-cat="st">ST</th>
                          <th class="jd-th text-center" data-cat="ews">EWS</th>
                          <th class="jd-th text-center font-bold text-brand-primary dark:text-blue-400">Total</th>
                          <th class="jd-th text-center jd-elig-col hidden">Your Eligibility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.vacancy_breakdown.map((row, i) => {
                          const post = job.posts[i]
                          return (
                            <>
                              <tr key={`row-${i}`} class="jd-table-row border-b border-gray-100 dark:border-gray-700/50 cursor-pointer" data-expand-row={i}>
                                <td class="jd-td font-medium sticky left-0 bg-white dark:bg-surface-card-dark z-10">
                                  <div class="flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5 text-content-secondary dark:text-content-dark-muted jd-expand-icon transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                    <span class="truncate max-w-[200px]">{row.post_name}</span>
                                  </div>
                                </td>
                                <td class="jd-td text-center" data-cat="ur">{row.ur}</td>
                                <td class="jd-td text-center" data-cat="obc">{row.obc}</td>
                                <td class="jd-td text-center" data-cat="sc">{row.sc}</td>
                                <td class="jd-td text-center" data-cat="st">{row.st}</td>
                                <td class="jd-td text-center" data-cat="ews">{row.ews}</td>
                                <td class="jd-td text-center font-bold text-brand-primary dark:text-blue-400">{row.total}</td>
                                <td class="jd-td text-center jd-elig-col hidden" data-elig-cell={i}></td>
                              </tr>
                              {/* Expanded detail row (hidden by default) */}
                              {post && (
                                <tr key={`detail-${i}`} class="jd-expand-detail hidden" data-expand-detail={i}>
                                  <td colspan={8} class="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700/50">
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                      <div><span class="text-content-secondary dark:text-content-dark-muted">Education:</span> <span class="text-content-primary dark:text-content-dark">{post.education_required}</span></div>
                                      <div><span class="text-content-secondary dark:text-content-dark-muted">Age:</span> <span class="text-content-primary dark:text-content-dark">{post.age_limit}</span></div>
                                      <div><span class="text-content-secondary dark:text-content-dark-muted">Salary:</span> <span class="text-content-primary dark:text-content-dark">{post.salary}</span></div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          )
                        })}
                        {/* Totals row */}
                        <tr class="bg-gray-50 dark:bg-gray-800/50 font-semibold border-t border-gray-200 dark:border-gray-700">
                          <td class="jd-td sticky left-0 bg-gray-50 dark:bg-gray-800/50 z-10">Total</td>
                          <td class="jd-td text-center">{vbTotals.ur}</td>
                          <td class="jd-td text-center">{vbTotals.obc}</td>
                          <td class="jd-td text-center">{vbTotals.sc}</td>
                          <td class="jd-td text-center">{vbTotals.st}</td>
                          <td class="jd-td text-center">{vbTotals.ews}</td>
                          <td class="jd-td text-center text-brand-primary dark:text-blue-400">{vbTotals.total}</td>
                          <td class="jd-td text-center jd-elig-col hidden"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Mobile: Stacked Cards */}
              <div class="sm:hidden space-y-3 mb-6" id="vacancy-mobile-cards">
                {job.posts.map((post, i) => {
                  const vb = job.vacancy_breakdown[i]
                  return (
                    <div key={i} class="jd-vacancy-card rounded-card border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark overflow-hidden" data-post-idx={i}>
                      <div class="p-4">
                        <h3 class="font-semibold text-sm text-content-primary dark:text-content-dark mb-2">{post.post_name}</h3>
                        {vb && (
                          <div class="flex flex-wrap gap-1.5 mb-3">
                            <span class="jd-cat-pill">UR: {vb.ur}</span>
                            <span class="jd-cat-pill">OBC: {vb.obc}</span>
                            <span class="jd-cat-pill">SC: {vb.sc}</span>
                            <span class="jd-cat-pill">ST: {vb.st}</span>
                            <span class="jd-cat-pill">EWS: {vb.ews}</span>
                            <span class="jd-cat-pill font-bold text-brand-primary dark:text-blue-400">Total: {vb.total}</span>
                          </div>
                        )}
                        <div class="space-y-1 text-xs text-content-secondary dark:text-content-dark-muted">
                          <div>\ud83c\udf93 {post.education_required}</div>
                          <div>\ud83d\udcc5 {post.age_limit}</div>
                          <div>\ud83d\udcb0 {post.salary}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Vacancy Summary Chart - Horizontal stacked bar */}
              {vbTotals.total > 0 && (
                <div class="mb-6">
                  <h3 class="font-heading font-semibold text-base text-content-primary dark:text-content-dark mb-3">Reservation Breakdown</h3>
                  <div class="bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 p-4">
                    <div class="h-8 rounded-full overflow-hidden flex mb-3" role="img" aria-label="Vacancy distribution chart">
                      <div class="bg-blue-500" style={`width:${(vbTotals.ur / vbTotals.total * 100).toFixed(1)}%`} title={`UR: ${vbTotals.ur}`}></div>
                      <div class="bg-green-500" style={`width:${(vbTotals.obc / vbTotals.total * 100).toFixed(1)}%`} title={`OBC: ${vbTotals.obc}`}></div>
                      <div class="bg-purple-500" style={`width:${(vbTotals.sc / vbTotals.total * 100).toFixed(1)}%`} title={`SC: ${vbTotals.sc}`}></div>
                      <div class="bg-orange-500" style={`width:${(vbTotals.st / vbTotals.total * 100).toFixed(1)}%`} title={`ST: ${vbTotals.st}`}></div>
                      <div class="bg-amber-400" style={`width:${(vbTotals.ews / vbTotals.total * 100).toFixed(1)}%`} title={`EWS: ${vbTotals.ews}`}></div>
                    </div>
                    <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-blue-500"></span>UR: {vbTotals.ur} ({(vbTotals.ur / vbTotals.total * 100).toFixed(0)}%)</span>
                      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-green-500"></span>OBC: {vbTotals.obc} ({(vbTotals.obc / vbTotals.total * 100).toFixed(0)}%)</span>
                      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-purple-500"></span>SC: {vbTotals.sc} ({(vbTotals.sc / vbTotals.total * 100).toFixed(0)}%)</span>
                      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-orange-500"></span>ST: {vbTotals.st} ({(vbTotals.st / vbTotals.total * 100).toFixed(0)}%)</span>
                      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-amber-400"></span>EWS: {vbTotals.ews} ({(vbTotals.ews / vbTotals.total * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════
               TAB 3: HOW TO APPLY
               ═══════════════════════════════════════════════════ */}
            <div class="jd-tab-content hidden" data-tab-content="how-to-apply">
              <h2 class="jd-heading">How to Apply</h2>

              {/* Application Mode Badge */}
              <div class="flex items-center gap-2 mb-5">
                <span class={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold ${
                  job.application_mode === 'Online' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  job.application_mode === 'Offline' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}>
                  {job.application_mode === 'Online' ? '\ud83d\udcbb' : job.application_mode === 'Offline' ? '\ud83d\udce8' : '\ud83d\udcbb\ud83d\udce8'}
                  {job.application_mode} Application
                </span>
              </div>

              {/* Step-by-step guide */}
              <div class="space-y-4 mb-6">
                {job.how_to_apply.map((step, i) => (
                  <div key={i} class="flex gap-4">
                    <div class="shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">{i + 1}</div>
                    <div class="flex-1 pt-1">
                      <p class="jd-body-text" dangerouslySetInnerHTML={{
                        __html: step.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-brand-primary dark:text-blue-400 hover:underline font-medium">$1</a>')
                      }}></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip info box */}
              <div class="jd-info-box jd-info-box-green mb-6">
                <div class="flex items-start gap-3">
                  <span class="shrink-0 w-5 h-5 mt-0.5">
                    <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                  </span>
                  <div>
                    <h3 class="font-semibold text-sm text-green-800 dark:text-green-300 mb-1">Pro Tip</h3>
                    <p class="text-sm text-green-700 dark:text-green-400 leading-relaxed">Keep a soft copy of all uploaded documents. Take a screenshot of the payment confirmation and application form before submitting. Note down your registration number immediately.</p>
                  </div>
                </div>
              </div>

              {/* Important Documents Checklist */}
              {job.documents_required && job.documents_required.length > 0 && (
                <div class="mb-6">
                  <h3 class="jd-heading">Important Documents Checklist</h3>
                  <div class="bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                    <div id="docs-progress" class="flex items-center justify-between text-xs text-content-secondary dark:text-content-dark-muted mb-3">
                      <span>Progress</span>
                      <span id="docs-progress-text">0 of {job.documents_required.length} documents ready</span>
                    </div>
                    <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                      <div id="docs-progress-bar" class="h-full rounded-full bg-green-500 transition-all duration-300" style="width:0%"></div>
                    </div>
                    <div class="space-y-2" id="docs-checklist">
                      {job.documents_required.map((doc, i) => (
                        <label key={i} class="flex items-center gap-3 p-2.5 rounded-btn hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                          <input type="checkbox" class="jd-doc-check w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-700" data-doc-idx={i} />
                          <span class="text-sm text-content-primary dark:text-content-dark group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">{doc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Apply Now Button */}
              {!isExpired && (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-base rounded-btn transition-colors shadow-sm"
                >
                  Apply Now on Official Website
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════
               TAB 4: SELECTION PROCESS
               ═══════════════════════════════════════════════════ */}
            <div class="jd-tab-content hidden" data-tab-content="selection">
              <h2 class="jd-heading">Selection Process</h2>

              {/* Visual Pipeline */}
              <div class="jd-pipeline space-y-0 mb-6">
                {job.selection_process.map((stage, i) => (
                  <div key={stage.stage} class="jd-pipeline-stage" data-stage-idx={i}>
                    {/* Connector arrow */}
                    {i > 0 && (
                      <div class="flex justify-center py-1" aria-hidden="true">
                        <svg class="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                      </div>
                    )}
                    <div class={`jd-stage-card rounded-card border p-4 sm:p-5 cursor-pointer transition-all hover:shadow-card ${
                      stage.is_eliminatory ? 'border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark'
                    }`}>
                      <div class="flex items-center gap-3 mb-2">
                        <div class={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${stage.is_eliminatory ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {stage.stage}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="font-semibold text-sm text-content-primary dark:text-content-dark">{stage.name}</h3>
                            <span class={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-pill ${
                              stage.is_eliminatory ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            }`}>
                              {stage.is_eliminatory ? 'Eliminatory' : 'Qualifying'}
                            </span>
                          </div>
                        </div>
                        <svg class="w-4 h-4 text-content-secondary dark:text-content-dark-muted jd-stage-chevron transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                      </div>
                      <div class="jd-stage-desc hidden pl-12">
                        <p class="text-sm text-content-secondary dark:text-content-dark-muted leading-relaxed">{stage.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Defence-specific: Physical Fitness & Medical */}
              {isDefence && (
                <div class="space-y-4 mb-6">
                  <h3 class="jd-heading">Physical &amp; Medical Standards</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="jd-info-box jd-info-box-amber">
                      <h4 class="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-2">\ud83c\udfcb\ufe0f Physical Fitness</h4>
                      <ul class="text-xs text-amber-700 dark:text-amber-400 space-y-1 leading-relaxed">
                        <li>1.6 km run in prescribed time</li>
                        <li>Pull-ups (6-10 reps)</li>
                        <li>9-feet ditch jump</li>
                        <li>Balancing beam walk</li>
                      </ul>
                    </div>
                    <div class="jd-info-box jd-info-box-red">
                      <h4 class="font-semibold text-sm text-red-800 dark:text-red-300 mb-2">\ud83c\udfe5 Medical Standards</h4>
                      <ul class="text-xs text-red-700 dark:text-red-400 space-y-1 leading-relaxed">
                        <li>Eyesight: 6/6 without glasses</li>
                        <li>Color vision: Normal</li>
                        <li>BMI within prescribed range</li>
                        <li>No flat feet / knock knees</li>
                      </ul>
                    </div>
                    <div class="jd-info-box jd-info-box-green">
                      <h4 class="font-semibold text-sm text-green-800 dark:text-green-300 mb-2">\ud83c\udf96\ufe0f Training</h4>
                      <ul class="text-xs text-green-700 dark:text-green-400 space-y-1 leading-relaxed">
                        <li>Basic military training</li>
                        <li>Weapon handling</li>
                        <li>Field craft exercises</li>
                        <li>Physical conditioning</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* UPSC/PSC-specific: Personality Test & DV */}
              {isUPSCOrPSC && (
                <div class="space-y-4 mb-6">
                  <h3 class="jd-heading">Additional Selection Components</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="jd-info-box jd-info-box-purple">
                      <h4 class="font-semibold text-sm text-purple-800 dark:text-purple-300 mb-2">\ud83c\udf99\ufe0f Personality Test / Interview</h4>
                      <ul class="text-xs text-purple-700 dark:text-purple-400 space-y-1 leading-relaxed">
                        <li>Tests personality, communication skills</li>
                        <li>Awareness of current affairs</li>
                        <li>Logical and analytical thinking</li>
                        <li>Suitability for administrative services</li>
                      </ul>
                    </div>
                    <div class="jd-info-box jd-info-box-blue">
                      <h4 class="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">\ud83d\udcc4 Document Verification</h4>
                      <ul class="text-xs text-blue-700 dark:text-blue-400 space-y-1 leading-relaxed">
                        <li>Original certificates verification</li>
                        <li>Caste / Category certificate</li>
                        <li>Character and identity proof</li>
                        <li>Medical fitness certificate</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════
               TAB 5: IMPORTANT DATES
               ═══════════════════════════════════════════════════ */}
            <div class="jd-tab-content hidden" data-tab-content="dates">
              <h2 class="jd-heading">Important Dates</h2>

              {/* Vertical Timeline */}
              <div class="jd-timeline relative mb-6">
                {/* Timeline line */}
                <div class="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></div>

                <div class="space-y-0">
                  {allDates.map((item, i) => {
                    const dLeft = daysRemaining(item.date, '2026-03-03')
                    const isPast = dLeft < 0
                    const isToday = dLeft === 0
                    const isUpcoming = dLeft > 0 && dLeft <= 7
                    const isFuture = dLeft > 7
                    return (
                      <div key={i} class="relative flex gap-4 pl-1 py-3">
                        {/* Timeline dot */}
                        <div class={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm z-10 border-2 ${
                          isPast ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600' :
                          isToday || isUpcoming ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600' :
                          'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        }`}>
                          {isPast ? (
                            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          ) : (
                            <span class="text-xs">{item.icon}</span>
                          )}
                        </div>
                        {/* Content */}
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between gap-2 flex-wrap">
                            <div>
                              <div class="text-xs font-medium text-content-secondary dark:text-content-dark-muted">{item.label}</div>
                              <div class={`text-base font-semibold ${isPast ? 'text-gray-400 dark:text-gray-500' : 'text-content-primary dark:text-content-dark'}`}>
                                {formatDateShort(item.date)}
                              </div>
                            </div>
                            <div class={`text-xs font-semibold px-2.5 py-1 rounded-pill ${
                              isPast ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              isToday ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 animate-pulse' :
                              isUpcoming ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              isFuture ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''
                            }`}>
                              {isPast ? '\u2705 Passed' : isToday ? '\ud83d\udd25 Today!' : `${dLeft} days left`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Add to Calendar */}
              <div class="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  id="add-to-calendar-btn"
                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-surface-card-dark border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark font-semibold text-sm rounded-btn hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-event-title={`Last Date: ${job.notification_title}`}
                  data-event-date={job.important_dates.last_date}
                  data-event-url={job.apply_link}
                >
                  <svg class="w-4 h-4 text-brand-primary dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Add Last Date to Calendar
                </button>
              </div>

              {/* Clash Detector */}
              <div id="clash-detector" class="hidden mb-6"></div>
            </div>

            {/* ═══════════════════════════════════════════════════
               TAB 6: EXAM PATTERN & SYLLABUS
               ═══════════════════════════════════════════════════ */}
            <div class="jd-tab-content hidden" data-tab-content="exam-pattern">
              <h2 class="jd-heading">Exam Pattern &amp; Syllabus</h2>

              {job.exam_pattern ? (
                <>
                  {/* Exam Pattern Table */}
                  <div class="mb-6">
                    <div class="overflow-x-auto rounded-card border border-gray-200 dark:border-gray-700">
                      <table class="w-full text-sm jd-table">
                        <thead>
                          <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <th class="jd-th text-left">Section</th>
                            <th class="jd-th text-center">Questions</th>
                            <th class="jd-th text-center">Marks</th>
                            <th class="jd-th text-center">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {job.exam_pattern.map((sec, i) => (
                            <tr key={i} class="jd-table-row border-b border-gray-100 dark:border-gray-700/50">
                              <td class="jd-td font-medium">{sec.section}</td>
                              <td class="jd-td text-center tabular-nums">{sec.questions}</td>
                              <td class="jd-td text-center tabular-nums">{sec.marks}</td>
                              <td class="jd-td text-center">{sec.duration_minutes ? `${sec.duration_minutes} min` : 'Combined'}</td>
                            </tr>
                          ))}
                          <tr class="bg-gray-50 dark:bg-gray-800/50 font-semibold border-t border-gray-200 dark:border-gray-700">
                            <td class="jd-td">Total</td>
                            <td class="jd-td text-center tabular-nums">{job.exam_pattern.reduce((s, sec) => s + sec.questions, 0)}</td>
                            <td class="jd-td text-center text-brand-primary dark:text-blue-400 tabular-nums">{job.exam_pattern.reduce((s, sec) => s + sec.marks, 0)}</td>
                            <td class="jd-td text-center">
                              {job.exam_pattern.some(s => s.duration_minutes)
                                ? `${job.exam_pattern.reduce((s, sec) => s + (sec.duration_minutes || 0), 0)} min`
                                : '\u2014'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Marking Scheme Info Box */}
                  {job.marking_scheme && (
                    <div class="jd-info-box jd-info-box-amber mb-6">
                      <div class="flex items-start gap-3">
                        <span class="shrink-0 w-5 h-5 mt-0.5">
                          <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                        </span>
                        <div>
                          <h3 class="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-1">Marking Scheme</h3>
                          <p class="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">{job.marking_scheme}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div class="jd-info-box jd-info-box-blue mb-6">
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 text-lg">\u2139\ufe0f</span>
                    <div>
                      <h3 class="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">No Written Examination</h3>
                      <p class="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                        This recruitment does not include a written examination. Selection is based on {isDefence ? 'physical fitness tests, medical examination, and merit' : 'merit, document verification, and other criteria as specified in the notification'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Syllabus Accordion */}
              {job.syllabus_topics && (
                <div class="mb-6">
                  <h3 class="jd-heading">Syllabus Topics</h3>
                  <div class="space-y-2" id="syllabus-accordion">
                    {Object.entries(job.syllabus_topics).map(([subject, topics], i) => (
                      <div key={subject} class="jd-accordion-item rounded-card border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                          type="button"
                          class="jd-accordion-trigger w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                          data-accordion={i}
                          aria-expanded={i === 0 ? 'true' : 'false'}
                        >
                          <span class="font-semibold text-sm text-content-primary dark:text-content-dark">{subject}</span>
                          <svg class={`w-4 h-4 text-content-secondary dark:text-content-dark-muted jd-accordion-chevron transition-transform ${i === 0 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </button>
                        <div class={`jd-accordion-body px-4 pb-3 ${i === 0 ? '' : 'hidden'}`} data-accordion-body={i}>
                          <div class="flex flex-wrap gap-1.5 pt-1">
                            {topics.map((topic: string) => (
                              <span key={topic} class="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-content-secondary dark:text-content-dark-muted rounded-pill">{topic}</span>
                            ))}
                          </div>
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

      {/* ── Similar Jobs Carousel ──────────────────────────── */}
      {similarJobs.length > 0 && (
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 dark:border-gray-700" id="similar-jobs" aria-labelledby="similar-jobs-heading">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 id="similar-jobs-heading" class="jd-heading mb-1">Similar Government Jobs</h2>
              <p class="text-sm text-content-secondary dark:text-content-dark-muted">Other jobs you might be eligible for</p>
            </div>
            <div class="hidden sm:flex gap-2">
              <button type="button" id="similar-prev" aria-label="Previous similar jobs" class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <button type="button" id="similar-next" aria-label="Next similar jobs" class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
          </div>
          <div id="similar-carousel" class="flex gap-4 overflow-x-auto scroll-smooth pb-3" style="scroll-snap-type:x mandatory;scrollbar-width:none;-ms-overflow-style:none">
            {similarJobs.map((sj) => {
              const sjSector = sectorMeta[sj.sector] || sectorMeta.other
              const sjDays = daysRemaining(sj.important_dates.last_date, TODAY)
              const sjSalary = formatSalary(sj.salary_min, sj.salary_max)
              const sjVac = formatVacancies(sj.total_vacancies)
              return (
                <a
                  key={sj.slug}
                  href={`/jobs/${sj.slug}`}
                  class="shrink-0 w-[280px] snap-start bg-white dark:bg-surface-card-dark rounded-card border border-gray-200 dark:border-gray-700 p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <span class={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${sjSector.bgClass}`}>{sjSector.icon}</span>
                    <span class={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${sjSector.bgClass} ${sjSector.textClass}`}>{sjSector.label}</span>
                  </div>
                  <h3 class="text-sm font-semibold text-content-primary dark:text-content-dark line-clamp-2 mb-2 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">{sj.notification_title}</h3>
                  <p class="text-xs text-content-secondary dark:text-content-dark-muted mb-3 truncate">{sj.organization}</p>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-content-secondary dark:text-content-dark-muted">{sjVac === 'Exam' ? 'Exam' : sjVac + ' posts'}</span>
                    <span class={`font-semibold ${sjDays <= 7 ? 'text-red-600 dark:text-red-400' : 'text-content-primary dark:text-content-dark'}`}>
                      {sjDays <= 0 ? 'Closed' : sjDays + 'd left'}
                    </span>
                  </div>
                  <div class="text-xs text-brand-primary dark:text-blue-400 font-medium mt-1">{sjSalary}/mo</div>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* ── FAQ Section ────────────────────────────────────── */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 dark:border-gray-700" id="faq-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="jd-heading">Frequently Asked Questions</h2>
        <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-5">Common questions about {job.notification_title}</p>
        <div class="space-y-2" id="faq-accordion" role="list">
          {faqs.map((faq, i) => (
            <div key={i} class="jd-faq-item rounded-card border border-gray-200 dark:border-gray-700 overflow-hidden" role="listitem">
              <button
                type="button"
                class="jd-faq-trigger w-full flex items-start justify-between gap-3 px-4 py-3.5 bg-white dark:bg-surface-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                data-faq={i}
                aria-expanded={i === 0 ? 'true' : 'false'}
                aria-controls={`faq-body-${i}`}
              >
                <span class="font-semibold text-sm text-content-primary dark:text-content-dark leading-relaxed pr-2">{faq.question}</span>
                <svg class={`shrink-0 w-4 h-4 mt-0.5 text-content-secondary dark:text-content-dark-muted jd-faq-chevron transition-transform ${i === 0 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              <div class={`jd-faq-body px-4 pb-4 ${i === 0 ? '' : 'hidden'}`} id={`faq-body-${i}`} data-faq-body={i} role="region" aria-labelledby={`faq-trigger-${i}`}>
                <p class="text-sm text-content-secondary dark:text-content-dark-muted leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prev/Next Job Navigation ───────────────────────── */}
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200 dark:border-gray-700" aria-label="Job navigation">
        <div class="flex items-stretch gap-4">
          {prev ? (
            <a href={`/jobs/${prev.slug}`} class="flex-1 flex items-center gap-3 p-4 rounded-card border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <svg class="w-5 h-5 text-content-secondary dark:text-content-dark-muted group-hover:text-brand-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              <div class="min-w-0">
                <div class="text-xs text-content-secondary dark:text-content-dark-muted mb-0.5">Previous Job</div>
                <div class="text-sm font-semibold text-content-primary dark:text-content-dark truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">{prev.notification_title}</div>
              </div>
            </a>
          ) : <div class="flex-1"></div>}
          {next ? (
            <a href={`/jobs/${next.slug}`} class="flex-1 flex items-center justify-end gap-3 p-4 rounded-card border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-right">
              <div class="min-w-0">
                <div class="text-xs text-content-secondary dark:text-content-dark-muted mb-0.5">Next Job</div>
                <div class="text-sm font-semibold text-content-primary dark:text-content-dark truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">{next.notification_title}</div>
              </div>
              <svg class="w-5 h-5 text-content-secondary dark:text-content-dark-muted group-hover:text-brand-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          ) : <div class="flex-1"></div>}
        </div>
      </nav>

      {/* ── Related Internal Links (SEO) ───────────────────── */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200 dark:border-gray-700" aria-labelledby="related-links-heading">
        <h2 id="related-links-heading" class="text-base font-semibold text-content-primary dark:text-content-dark mb-4">Explore More on SarkariMatch</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {relatedInternalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              class="p-3 rounded-card border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-surface-card-dark hover:border-gray-200 dark:hover:border-gray-600 transition-all text-center group"
              title={link.desc}
            >
              <div class="text-xs font-semibold text-content-primary dark:text-content-dark group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">{link.label}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Back to top link ────────────────────────────────── */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 text-center print:hidden">
        <button
          type="button"
          id="jd-back-to-top"
          class="inline-flex items-center gap-1.5 text-xs text-content-secondary dark:text-content-dark-muted hover:text-brand-primary dark:hover:text-blue-400 transition-colors"
          aria-label="Back to top"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
          Back to top
        </button>
      </div>

      {/* Profile Wizard */}
      <ProfileWizard />

      {/* Inline job data for client-side eligibility */}
      <script
        id="jd-job-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(job) }}
      />

      {/* Similar jobs data for carousel */}
      <script
        id="jd-similar-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(similarJobs.map(sj => ({ slug: sj.slug, title: sj.notification_title }))) }}
      />

      {/* Job detail client-side script */}
      <script src="/static/job-detail.js" defer></script>
    </Layout>
  )
}
