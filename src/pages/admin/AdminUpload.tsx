import type { FC } from 'hono/jsx'
import { AdminLayout } from '../../components/admin/AdminLayout'

/**
 * Admin Upload page — 3-step wizard:
 * Step 1: Upload PDF  |  Step 2: Review AI Parse  |  Step 3: Edit & Publish
 *
 * All step switching, form state, parsing simulation, and validation
 * are handled client-side by /static/admin-upload.js.
 * The TSX provides the full HTML shell with all 3 steps rendered
 * (hidden via CSS, shown by JS).
 */
export const AdminUploadPage: FC = () => {
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

  return (
    <AdminLayout pageTitle="Upload Job Notification PDF" currentPath="/admin/upload">

      {/* ═══ STEP INDICATOR ═══ */}
      <div class="mb-6 sm:mb-8">
        <div class="flex items-center justify-center gap-0 px-2">
          {[
            { num: 1, label: 'Upload PDF' },
            { num: 2, label: 'Review AI Parse' },
            { num: 3, label: 'Edit & Publish' },
          ].map((step, i) => (
            <div class="flex items-center" key={step.num}>
              <div class="flex items-center gap-1.5 sm:gap-2" data-step-indicator={step.num}>
                <div class="step-circle w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 transition-all duration-300">
                  <span class="step-num">{step.num}</span>
                  <svg class="step-check hidden w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span class="step-label text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 hidden sm:inline transition-colors duration-300">{step.label}</span>
              </div>
              {i < 2 && (
                <div class="step-line w-8 sm:w-20 h-0.5 mx-1.5 sm:mx-4 bg-gray-200 dark:bg-gray-700 transition-colors duration-500" data-step-line={i + 1}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           STEP 1: UPLOAD PDF
         ═══════════════════════════════════════════ */}
      <div id="step-1" class="step-content">

        {/* Drop zone */}
        <div
          id="drop-zone"
          class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl sm:rounded-xl bg-white dark:bg-slate-900 p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 active:scale-[0.99]"
          style="min-height: 220px"
          role="button"
          tabindex="0"
          aria-label="Upload PDF file"
        >
          {/* Default state */}
          <div id="drop-default" class="flex flex-col items-center justify-center h-full py-6 sm:py-8">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
              <svg class="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <p class="text-base sm:text-lg font-semibold text-content-primary dark:text-white mb-1">Drag & drop your PDF here</p>
            <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-3 sm:mb-4">or</p>
            <button
              type="button"
              id="browse-btn"
              class="px-6 py-3 sm:py-2.5 bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Browse Files
            </button>
            <p class="text-xs text-content-secondary dark:text-content-dark-muted mt-3">PDF files only, max 25 MB</p>
          </div>

          {/* Drag-over state (hidden by default) */}
          <div id="drop-hover" class="hidden absolute inset-0 flex flex-col items-center justify-center bg-blue-50/80 dark:bg-blue-900/30 rounded-xl border-2 border-solid border-blue-500">
            <svg class="w-12 h-12 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p class="text-lg font-bold text-blue-600 dark:text-blue-400">Drop your PDF!</p>
          </div>

          <input type="file" id="file-input" accept=".pdf" class="hidden" />
        </div>

        {/* File preview card (hidden by default) */}
        <div id="file-preview" class="hidden mt-4 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                <path d="M8.5 15.5h2v-1h-2v1zm0-2h4v-1h-4v1zm0-2h5v-1h-5v1z" opacity=".5"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p id="file-name" class="text-sm font-semibold text-content-primary dark:text-white truncate"></p>
              <p id="file-size" class="text-xs text-content-secondary dark:text-content-dark-muted"></p>
            </div>
            <button
              type="button"
              id="remove-file-btn"
              class="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
              aria-label="Remove file"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Parse button */}
        <button
          type="button"
          id="parse-btn"
          disabled
          class="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-brand-primary hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-semibold text-sm rounded-xl sm:rounded-btn transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 disabled:cursor-not-allowed"
        >
          <span id="parse-btn-text">Parse with AI</span>
          <svg id="parse-spinner" class="hidden w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>

        {/* Progress panel (hidden by default) */}
        <div id="parse-progress" class="hidden mt-4 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <h3 class="text-sm font-semibold text-content-primary dark:text-white mb-3">AI Parsing Progress</h3>
          <div id="parse-steps" class="space-y-2"></div>
        </div>

        {/* Info box */}
        <div class="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl sm:rounded-xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">What our AI extracts</p>
              <p class="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">Job title, department, vacancies, eligibility criteria, important dates, posts breakdown, selection process, exam pattern, application fees, and more. Supported: Government job notification PDFs from any department.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           STEP 2: REVIEW AI PARSE
         ═══════════════════════════════════════════ */}
      <div id="step-2" class="step-content hidden">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

          {/* LEFT: Extracted Data (60%) */}
          <div class="lg:col-span-3 space-y-4">
            <h2 class="text-lg font-heading font-bold text-content-primary dark:text-white mb-2">Extracted Data Preview</h2>

            {/* Accordion sections rendered by JS */}
            <div id="review-accordion" class="space-y-3"></div>

            {/* Action buttons */}
            <div class="flex flex-col sm:flex-row gap-3 pt-4">
              <button type="button" id="edit-before-publish-btn" class="flex-1 px-5 py-3.5 sm:py-3 bg-brand-primary hover:bg-blue-700 text-white font-semibold text-sm rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60">
                Edit Before Publishing
              </button>
              <button type="button" id="publish-now-btn" class="flex-1 px-5 py-3.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/60">
                Looks Good, Publish Now
              </button>
            </div>
          </div>

          {/* RIGHT: Quick Summary (40%) */}
          <div class="lg:col-span-2">
            <div class="lg:sticky lg:top-24 space-y-4">
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h3 class="text-sm font-heading font-bold text-content-primary dark:text-white mb-3">Quick Summary</h3>
                <div id="quick-summary" class="space-y-2 text-sm"></div>
              </div>

              {/* Raw JSON toggle */}
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button type="button" id="json-toggle-btn" class="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-content-primary dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none">
                  <span>Raw JSON</span>
                  <svg id="json-chevron" class="w-4 h-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div id="json-panel" class="hidden border-t border-gray-200 dark:border-gray-800">
                  <div class="p-4 max-h-80 overflow-auto">
                    <pre id="json-output" class="text-xs font-mono leading-relaxed whitespace-pre-wrap break-all text-content-secondary dark:text-content-dark-muted"></pre>
                  </div>
                  <div class="px-4 pb-3">
                    <button type="button" id="copy-json-btn" class="text-xs font-medium text-brand-primary dark:text-blue-400 hover:underline focus:outline-none">
                      Copy JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           STEP 3: EDIT & PUBLISH
         ═══════════════════════════════════════════ */}
      <div id="step-3" class="step-content hidden">
        <form id="job-edit-form" autocomplete="off" novalidate>

          {/* Auto-save indicator */}
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-heading font-bold text-content-primary dark:text-white">Edit Job Details</h2>
            <span id="autosave-indicator" class="text-xs text-content-secondary dark:text-content-dark-muted"></span>
          </div>

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
                  <option value="Online & Offline">Online & Offline</option>
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

          {/* ── SECTION: Exam Pattern (optional) ── */}
          <fieldset class="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1">Exam Pattern</legend>
            <div id="exam-container" class="space-y-3 mt-3"></div>
            <button type="button" id="add-exam-btn" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              <span>Add Section</span>
            </button>
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
            Publish
          </button>
        </div>
      </div>

      {/* ═══ Toast notification ═══ */}
      <div id="toast" class="fixed bottom-6 right-6 z-[100] hidden">
        <div class="flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium" id="toast-inner">
          <span id="toast-text"></span>
        </div>
      </div>

      {/* ═══ Confetti container ═══ */}
      <div id="confetti-container" class="fixed inset-0 pointer-events-none z-[90] hidden" aria-hidden="true"></div>

      {/* Parsed data passed from server (populated by JS from mock) */}
      <script
        id="upload-sectors-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(sectors),
        }}
      />

      <script src="/static/admin-upload.js" defer></script>
    </AdminLayout>
  )
}
