import type { FC } from 'hono/jsx'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { placeholderJobs } from '../../lib/placeholder-data'

/**
 * AdminJobs — Manage Jobs data table.
 *
 * All filtering, sorting, pagination, bulk actions, mobile card view,
 * CRUD (duplicate, delete, status change), and keyboard navigation
 * are handled client-side by /static/admin-jobs.js.
 *
 * The TSX renders the full HTML shell: header, filters bar, desktop table,
 * mobile card list, empty state, pagination, bulk bar, delete confirm modal,
 * and a toast. Seed data is embedded as JSON in a <script> block.
 */
export const AdminJobsPage: FC = () => {
  // Sector options for filter dropdown
  const sectors = [
    { value: '', label: 'All Sectors' },
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

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'closing_soon', label: 'Closing Soon' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'expired', label: 'Expired' },
    { value: 'draft', label: 'Draft' },
  ]

  const eduLevels = [
    { value: '', label: 'All Education' },
    { value: '10th', label: '10th Pass' },
    { value: '12th', label: '12th Pass' },
    { value: 'iti', label: 'ITI' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'pg', label: 'Post Graduate' },
    { value: 'phd', label: 'PhD' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'closing', label: 'Closing Soonest' },
    { value: 'vacancies', label: 'Most Vacancies' },
    { value: 'title_az', label: 'Title A-Z' },
  ]

  const selectCls = 'px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors appearance-none cursor-pointer'

  return (
    <AdminLayout pageTitle="Manage Jobs" currentPath="/admin/jobs">

      {/* ═══ PAGE HEADER ═══ */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 class="text-xl font-heading font-bold text-content-primary dark:text-white">Manage Jobs</h2>
          <p id="jobs-subtitle" class="text-sm text-content-secondary dark:text-content-dark-muted mt-0.5">Loading...</p>
        </div>
        <a
          href="/admin/upload"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:ring-offset-2 dark:focus:ring-offset-slate-950 self-start sm:self-auto"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Upload New</span>
        </a>
      </div>

      {/* ═══ SEARCH & FILTER BAR ═══ */}
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
        <div class="flex flex-wrap gap-3 items-end">

          {/* Search */}
          <div class="flex-1 min-w-[200px]">
            <label for="jobs-search" class="sr-only">Search jobs</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-secondary dark:text-content-dark-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                id="jobs-search"
                placeholder="Search title, department, advt no..."
                class="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white placeholder:text-content-secondary dark:placeholder:text-content-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label for="filter-status" class="sr-only">Filter by status</label>
            <select id="filter-status" class={selectCls}>
              {statuses.map((s) => (
                <option value={s.value} key={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Sector filter */}
          <div>
            <label for="filter-sector" class="sr-only">Filter by sector</label>
            <select id="filter-sector" class={selectCls}>
              {sectors.map((s) => (
                <option value={s.value} key={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Education filter */}
          <div>
            <label for="filter-edu" class="sr-only">Filter by education</label>
            <select id="filter-edu" class={selectCls}>
              {eduLevels.map((e) => (
                <option value={e.value} key={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label for="filter-sort" class="sr-only">Sort by</label>
            <select id="filter-sort" class={selectCls}>
              {sortOptions.map((s) => (
                <option value={s.value} key={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Clear filters (hidden by default) */}
          <button
            type="button"
            id="clear-filters-btn"
            class="hidden items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-btn hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* ═══ BULK ACTIONS BAR (hidden by default) ═══ */}
      <div id="bulk-bar" class="hidden mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex flex-wrap items-center gap-3 transition-all duration-200">
        <span id="bulk-count" class="text-sm font-semibold text-blue-800 dark:text-blue-300"></span>
        <div class="flex items-center gap-2 ml-auto">
          <button type="button" id="bulk-active-btn" class="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50">Set Active</button>
          <button type="button" id="bulk-expire-btn" class="px-3 py-1.5 text-xs font-medium bg-gray-500 hover:bg-gray-600 text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50">Set Expired</button>
          <button type="button" id="bulk-delete-btn" class="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50">Delete Selected</button>
        </div>
      </div>

      {/* ═══ DESKTOP TABLE ═══ */}
      <div id="table-wrapper" class="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm" id="jobs-table">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[5]">
                <th scope="col" class="w-10 px-3 py-3">
                  <input type="checkbox" id="select-all-cb" class="rounded border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary/50 cursor-pointer" aria-label="Select all jobs" />
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider">Title & Department</th>
                <th scope="col" class="px-4 py-3 text-right text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider w-28">Vacancies</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider w-32">Last Date</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider w-32">Status</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider w-28">Education</th>
                <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-content-secondary dark:text-content-dark-muted uppercase tracking-wider w-40">Actions</th>
              </tr>
            </thead>
            <tbody id="jobs-tbody" class="divide-y divide-gray-100 dark:divide-gray-800"></tbody>
          </table>
        </div>
      </div>

      {/* ═══ MOBILE CARD VIEW ═══ */}
      <div id="mobile-cards" class="md:hidden space-y-3"></div>

      {/* ═══ EMPTY STATE ═══ */}
      <div id="empty-state" class="hidden py-16 text-center">
        <div class="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-content-primary dark:text-white mb-1">No jobs match your filters</h3>
        <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-4">Try adjusting your search or filter criteria.</p>
        <button type="button" id="empty-clear-btn" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
          Clear All Filters
        </button>
      </div>

      {/* ═══ PAGINATION ═══ */}
      <div id="pagination-bar" class="mt-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 text-sm text-content-secondary dark:text-content-dark-muted">
          <span id="page-info">Showing 0-0 of 0</span>
          <select id="page-size" class="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer">
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="all">All</option>
          </select>
        </div>
        <div id="page-buttons" class="flex items-center gap-1"></div>
      </div>

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      <div id="delete-modal" class="fixed inset-0 z-[100] hidden" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" id="delete-modal-backdrop"></div>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <div class="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-6">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 id="delete-modal-title" class="text-base font-heading font-bold text-content-primary dark:text-white text-center mb-1">Delete Job?</h3>
            <p id="delete-modal-text" class="text-sm text-content-secondary dark:text-content-dark-muted text-center mb-6">This action cannot be undone.</p>
            <div class="flex items-center gap-3">
              <button type="button" id="delete-cancel-btn" class="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-content-primary dark:text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50">Cancel</button>
              <button type="button" id="delete-confirm-btn" class="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50">Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Toast notification ═══ */}
      <div id="toast" class="fixed bottom-6 right-6 z-[100] hidden">
        <div class="flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium" id="toast-inner">
          <span id="toast-text"></span>
        </div>
      </div>

      {/* Seed data JSON (placeholder jobs from server) */}
      <script
        id="seed-jobs-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(placeholderJobs),
        }}
      />

      <script src="/static/admin-jobs.js" defer></script>
    </AdminLayout>
  )
}
