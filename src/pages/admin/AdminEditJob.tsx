import type { FC } from 'hono/jsx'
import { AdminLayout } from '../../components/admin/AdminLayout'
import type { Job } from '../../lib/placeholder-data'

/**
 * AdminEditJob — Edit a job by ID.
 *
 * Reuses the exact form structure from AdminUpload Step 3.
 * Pre-populates all fields from the job data (seed or localStorage).
 * Includes: Last Modified, Changelog, Unpublish, Delete, View on Site,
 * unsaved-changes warning via beforeunload.
 * Shows a 404 admin page if ID not found.
 */

export const AdminEditJobNotFound: FC<{ jobId: string }> = ({ jobId }) => {
  return (
    <AdminLayout pageTitle="Job Not Found" currentPath="/admin/jobs">
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 class="text-2xl font-heading font-bold text-content-primary dark:text-white mb-2">Job Not Found</h2>
        <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-1">
          No job was found with ID: <code class="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">{jobId}</code>
        </p>
        <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-6">It may have been deleted or the URL is incorrect.</p>
        <div class="flex items-center gap-3">
          <a href="/admin/jobs" class="px-5 py-2.5 bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60">
            Back to Manage Jobs
          </a>
          <a href="/admin/upload" class="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-content-primary dark:text-white text-sm font-medium rounded-btn hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50">
            Upload New Job
          </a>
        </div>
      </div>
      <script src="/static/admin.js" defer></script>
    </AdminLayout>
  )
}

export const AdminEditJobPage: FC<{ job: Job; jobId: string }> = ({ job, jobId }) => {
  const sectors = [
    { value: 'banking', label: 'Banking' },
    { value: 'railway', label: 'Railway' },
    { value: 'ssc', label: 'SSC' },
    { value: 'upsc', label: 'UPSC' },
    { value: 'defence', label: 'Defence' },
    { value: 'teaching', label: 'Teaching' },
    { value: 'state_psc', label: 'State PSC' },
    { value: 'police', label: 'Police' },
    { value: 'psu', label: 'PSU' },
    { value: 'other', label: 'Other' },
  ]

  const eduLevels = [
    { value: '10th', label: '10th Pass' },
    { value: '12th', label: '12th Pass' },
    { value: 'iti', label: 'ITI' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'pg', label: 'Post Graduate' },
    { value: 'phd', label: 'PhD' },
  ]

  const existingDepts = [
    'Department of Financial Services',
    'Ministry of Railways',
    'Department of Personnel & Training',
    'Ministry of Defence',
    'Ministry of Home Affairs',
    'Department of Posts',
    'Ministry of Education',
    'Department of Revenue',
  ]

  const pageTitle = `Edit: ${job.notification_title}`

  return (
    <AdminLayout pageTitle={pageTitle} currentPath="/admin/jobs">

      {/* ═══ BREADCRUMBS ═══ */}
      <nav class="mb-4 text-sm" aria-label="Breadcrumb">
        <ol class="flex items-center gap-1.5 text-content-secondary dark:text-content-dark-muted">
          <li><a href="/admin/dashboard" class="hover:text-brand-primary dark:hover:text-blue-400 transition-colors">Admin</a></li>
          <li><svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
          <li><a href="/admin/jobs" class="hover:text-brand-primary dark:hover:text-blue-400 transition-colors">Manage Jobs</a></li>
          <li><svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
          <li class="text-content-primary dark:text-white font-medium truncate max-w-[200px]">Edit</li>
        </ol>
      </nav>

      {/* ═══ PAGE HEADER ═══ */}
      <div class="flex flex-col gap-3 mb-5 sm:mb-6">
        <div class="min-w-0">
          <h2 class="text-lg sm:text-xl font-heading font-bold text-content-primary dark:text-white line-clamp-2">{pageTitle}</h2>
          <div class="flex flex-wrap items-center gap-3 mt-1.5">
            <span id="last-modified" class="text-xs text-content-secondary dark:text-content-dark-muted"></span>
            <span id="autosave-indicator" class="text-xs text-green-600 dark:text-green-400"></span>
          </div>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 -mb-1">
          <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-xs font-medium text-content-secondary dark:text-content-dark-muted border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-btn hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50 whitespace-nowrap shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            View on Site
          </a>
          <button type="button" id="unpublish-btn" class="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl sm:rounded-btn hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 whitespace-nowrap shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            Unpublish
          </button>
          <button type="button" id="delete-job-btn" class="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl sm:rounded-btn hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 whitespace-nowrap shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            Delete
          </button>
        </div>
      </div>

      {/* ═══ EDIT FORM (reuses AdminUpload Step 3 structure exactly) ═══ */}
      <form id="job-edit-form" autocomplete="off" novalidate>

        {/* ── SECTION: Basic Information ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Basic Information</legend>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div class="md:col-span-2">
              <label for="f-title" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Title <span class="text-red-500">*</span></label>
              <input type="text" id="f-title" name="title" required class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
            </div>
            <div>
              <label for="f-slug" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Slug</label>
              <input type="text" id="f-slug" name="slug" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-gray-50 dark:bg-slate-800 text-content-secondary dark:text-content-dark-muted font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-advt" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Advertisement Number</label>
              <input type="text" id="f-advt" name="advertisement_number" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-dept" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Department <span class="text-red-500">*</span></label>
              <input type="text" id="f-dept" name="department" list="dept-list" required class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
              <datalist id="dept-list">
                {existingDepts.map((d) => (<option value={d} key={d} />))}
              </datalist>
            </div>
            <div>
              <label for="f-org" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Organization</label>
              <input type="text" id="f-org" name="organization" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-sector" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Sector</label>
              <select id="f-sector" name="sector" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
                {sectors.map((s) => (<option value={s.value} key={s.value}>{s.label}</option>))}
              </select>
            </div>
            <div>
              <label for="f-status" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Status</label>
              <select id="f-status" name="status" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label for="f-vacancies" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Total Vacancies</label>
              <input type="number" id="f-vacancies" name="total_vacancies" min="0" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-salary-min" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Salary Min</label>
              <input type="number" id="f-salary-min" name="salary_min" min="0" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-salary-max" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Salary Max</label>
              <input type="number" id="f-salary-max" name="salary_max" min="0" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-website" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Official Website</label>
              <input type="url" id="f-website" name="official_website" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-apply-link" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Apply Link</label>
              <input type="url" id="f-apply-link" name="apply_link" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div class="md:col-span-2">
              <label for="f-summary" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Summary</label>
              <textarea id="f-summary" name="summary" rows="3" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-y"></textarea>
            </div>
          </div>
        </fieldset>

        {/* ── SECTION: Education & Eligibility ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Education & Eligibility</legend>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label for="f-edu-level" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Minimum Education</label>
              <select id="f-edu-level" name="education_level" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
                {eduLevels.map((e) => (<option value={e.value} key={e.value}>{e.label}</option>))}
              </select>
            </div>
            <div>
              <label for="f-app-mode" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Application Mode</label>
              <select id="f-app-mode" name="application_mode" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Online & Offline">Online &amp; Offline</option>
              </select>
            </div>
            <div>
              <label for="f-fee-gen" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Fee: General/OBC</label>
              <input type="number" id="f-fee-gen" name="application_fee_general" min="0" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-fee-scst" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Fee: SC/ST/PwD</label>
              <input type="number" id="f-fee-scst" name="application_fee_sc_st" min="0" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
          </div>
        </fieldset>

        {/* ── SECTION: Important Dates ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Important Dates</legend>
          <div id="dates-container" class="space-y-3 mt-3"></div>
          <button type="button" id="add-date-btn" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Date</span>
          </button>
        </fieldset>

        {/* ── SECTION: Age Limits ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Age Limits</legend>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <label for="f-age-min" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Min Age</label>
              <input type="number" id="f-age-min" name="age_min" min="0" max="70" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="f-age-max" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Max Age</label>
              <input type="number" id="f-age-max" name="age_max" min="0" max="70" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
          </div>
        </fieldset>

        {/* ── SECTION: Posts Breakdown ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Posts Breakdown</legend>
          <div id="posts-container" class="space-y-4 mt-3"></div>
          <button type="button" id="add-post-btn" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/30 rounded-btn hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Post</span>
          </button>
        </fieldset>

        {/* ── SECTION: Selection Process ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Selection Process</legend>
          <div id="stages-container" class="space-y-3 mt-3"></div>
          <button type="button" id="add-stage-btn" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Stage</span>
          </button>
        </fieldset>

        {/* ── SECTION: How to Apply ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">How to Apply</legend>
          <div id="steps-container" class="space-y-3 mt-3"></div>
          <button type="button" id="add-step-btn" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Step</span>
          </button>
        </fieldset>

        {/* ── SECTION: Exam Pattern ── */}
        <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Exam Pattern</legend>
          <div id="exam-container" class="space-y-3 mt-3"></div>
          <button type="button" id="add-exam-btn" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Section</span>
          </button>
        </fieldset>

        {/* ── SECTION: Changelog ── */}
        <fieldset class="mb-24 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Changelog</legend>
          <div id="changelog-entries" class="space-y-2 mt-3 max-h-40 overflow-y-auto text-xs text-content-secondary dark:text-content-dark-muted"></div>
          <div class="mt-3">
            <label for="changelog-note" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Add note about this edit</label>
            <textarea id="changelog-note" rows="2" placeholder="Describe what changed..." class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-y"></textarea>
          </div>
        </fieldset>

      </form>

      {/* ── Sticky action bar ── */}
      <div class="sticky bottom-16 sm:bottom-0 z-10 -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        <button type="button" id="save-draft-btn" class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-content-primary dark:text-white text-sm font-medium rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50">
          Save as Draft
        </button>
        <div class="flex-1"></div>
        <button type="button" id="preview-btn" class="w-full sm:w-auto px-5 py-3 sm:py-2.5 border border-brand-primary dark:border-blue-500 text-brand-primary dark:text-blue-400 text-sm font-medium rounded-xl sm:rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
          Preview
        </button>
        <button type="button" id="publish-btn" class="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60">
          Save &amp; Publish
        </button>
      </div>

      {/* ═══ Delete confirmation modal ═══ */}
      <div id="delete-modal" class="fixed inset-0 z-[100] hidden mobile-fullscreen-modal" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" id="delete-modal-backdrop"></div>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <div class="relative bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full sm:max-w-md p-6">
            <div class="swipe-indicator sm:hidden"></div>
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 class="text-base font-heading font-bold text-content-primary dark:text-white text-center mb-1">Delete This Job?</h3>
            <p class="text-sm text-content-secondary dark:text-content-dark-muted text-center mb-6">This action cannot be undone. The job will be permanently removed.</p>
            <div class="flex items-center gap-3">
              <button type="button" id="delete-cancel-btn" class="flex-1 px-4 py-3 sm:py-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-content-primary dark:text-white rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50">Cancel</button>
              <button type="button" id="delete-confirm-btn" class="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50">Delete Permanently</button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Toast ═══ */}
      <div id="toast" class="fixed top-6 right-6 z-[100] space-y-2" aria-live="polite"></div>

      {/* ═══ Confetti ═══ */}
      <div id="confetti-container" class="fixed inset-0 pointer-events-none z-[90] hidden" aria-hidden="true"></div>

      {/* ═══ Preview modal ═══ */}
      <div id="preview-modal" class="fixed inset-0 z-[100] hidden mobile-fullscreen-modal" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" id="preview-modal-backdrop"></div>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="relative bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-5 sm:p-6">
            <div class="swipe-indicator sm:hidden"></div>
            <div class="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-slate-900 pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 class="text-lg font-heading font-bold text-content-primary dark:text-white">Job Preview</h3>
              <button type="button" id="preview-close-btn" class="p-2 rounded-lg text-content-secondary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div id="preview-content" class="prose prose-sm dark:prose-invert max-w-none"></div>
          </div>
        </div>
      </div>

      {/* Pass job data to client JS */}
      <script
        id="edit-job-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(job),
        }}
      />
      <script
        id="edit-job-id"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobId),
        }}
      />

      <script src="/static/admin-edit-job.js" defer></script>
    </AdminLayout>
  )
}
