/**
 * admin-jobs.js
 * Client-side logic for /admin/jobs — Job Management data table.
 *
 * Features:
 * - Merges seed data + localStorage uploaded jobs
 * - Search (debounced 300ms), filter by status/sector/education, sort
 * - Desktop table + mobile card view
 * - Pagination with configurable page size
 * - Bulk actions (set active, set expired, delete)
 * - Individual actions: edit, view, duplicate, delete
 * - Delete confirmation modal
 * - URL query param state (bookmarkable)
 * - Keyboard navigation
 * - Dark mode support
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //  CONSTANTS & STATE
  // ═══════════════════════════════════════════
  var STORAGE_KEY = 'sarkarimatch_admin_jobs';
  var TODAY = '2026-03-03';
  var allJobs = [];
  var filteredJobs = [];
  var selectedIds = new Set();
  var currentPage = 1;
  var pageSize = 10;
  var searchTimeout = null;
  var deleteTarget = null; // null | {type:'single', id:''} | {type:'bulk'}

  // Sector color maps for badges
  var sectorColors = {
    banking: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Banking' },
    railway: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Railway' },
    ssc: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'SSC' },
    upsc: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'UPSC' },
    defence: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Defence' },
    teaching: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', label: 'Teaching' },
    state_psc: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', label: 'State PSC' },
    police: { bg: 'bg-slate-200 dark:bg-slate-700/40', text: 'text-slate-700 dark:text-slate-300', label: 'Police' },
    psu: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'PSU' },
    other: { bg: 'bg-gray-100 dark:bg-gray-800/40', text: 'text-gray-700 dark:text-gray-300', label: 'Other' }
  };

  var eduLabels = {
    '10th': '10th Pass', '12th': '12th Pass', iti: 'ITI', diploma: 'Diploma',
    graduate: 'Graduate', pg: 'Post Graduate', phd: 'PhD'
  };

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════
  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function daysUntil(dateStr) {
    if (!dateStr) return Infinity;
    var target = new Date(dateStr);
    var now = new Date(TODAY);
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  }

  function commaNum(n) {
    return (n || 0).toLocaleString('en-IN');
  }

  /** Derive display status from raw job data */
  function deriveStatus(job) {
    if (job.status === 'draft') return 'draft';
    if (job.status === 'expired') return 'expired';
    var lastDate = job.important_dates && job.important_dates.last_date;
    if (!lastDate) return job.status === 'published' ? 'active' : job.status;
    var days = daysUntil(lastDate);
    if (days < 0) return 'expired';
    if (days <= 7) return 'closing_soon';
    var startDate = job.important_dates && job.important_dates.start_date;
    if (startDate && daysUntil(startDate) > 0) return 'upcoming';
    return 'active';
  }

  /** Status badge HTML */
  function statusBadge(status) {
    var map = {
      active: '<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active</span>',
      closing_soon: '<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"><span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>Closing Soon</span>',
      upcoming: '<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Upcoming</span>',
      expired: '<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"><span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Expired</span>',
      draft: '<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border border-dashed border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"><span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Draft</span>'
    };
    return map[status] || map.active;
  }

  // ═══════════════════════════════════════════
  //  LOAD DATA
  // ═══════════════════════════════════════════
  function loadJobs() {
    // Seed jobs from server
    var seedJobs = [];
    try {
      var el = $('seed-jobs-data');
      if (el) seedJobs = JSON.parse(el.textContent || '[]');
    } catch (e) {}
    seedJobs.forEach(function (j) { j._source = 'seed'; });

    // Uploaded jobs from localStorage
    var uploaded = [];
    try { uploaded = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) {}
    if (!Array.isArray(uploaded)) uploaded = [];
    uploaded.forEach(function (j) { j._source = 'uploaded'; });

    allJobs = seedJobs.concat(uploaded);

    // Derive display status for each
    allJobs.forEach(function (j) {
      j._displayStatus = deriveStatus(j);
    });
  }

  // ═══════════════════════════════════════════
  //  FILTER, SORT, PAGINATE
  // ═══════════════════════════════════════════
  function getFilters() {
    return {
      search: ($('jobs-search') || {}).value || '',
      status: ($('filter-status') || {}).value || '',
      sector: ($('filter-sector') || {}).value || '',
      edu: ($('filter-edu') || {}).value || '',
      sort: ($('filter-sort') || {}).value || 'newest'
    };
  }

  function applyFilters() {
    var f = getFilters();
    var q = f.search.toLowerCase().trim();

    filteredJobs = allJobs.filter(function (j) {
      // Search
      if (q) {
        var haystack = ((j.notification_title || '') + ' ' + (j.department || '') + ' ' + (j.advertisement_number || '')).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      // Status
      if (f.status && j._displayStatus !== f.status) return false;
      // Sector
      if (f.sector && j.sector !== f.sector) return false;
      // Education
      if (f.edu && j.education_level !== f.edu) return false;
      return true;
    });

    // Sort
    filteredJobs.sort(function (a, b) {
      switch (f.sort) {
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'closing':
          var dA = daysUntil(a.important_dates && a.important_dates.last_date);
          var dB = daysUntil(b.important_dates && b.important_dates.last_date);
          if (dA < 0 && dB < 0) return dB - dA;
          if (dA < 0) return 1;
          if (dB < 0) return -1;
          return dA - dB;
        case 'vacancies':
          return (b.total_vacancies || 0) - (a.total_vacancies || 0);
        case 'title_az':
          return (a.notification_title || '').localeCompare(b.notification_title || '');
        default: // newest
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    // Show/hide clear filters button
    var hasFilter = f.search || f.status || f.sector || f.edu || f.sort !== 'newest';
    var clearBtn = $('clear-filters-btn');
    if (clearBtn) clearBtn.classList.toggle('hidden', !hasFilter);
    if (clearBtn && hasFilter) clearBtn.classList.add('inline-flex');

    // Update URL params
    updateURL(f);

    // Reset to page 1 on filter change (unless restoring from URL)
    renderAll();
  }

  function updateURL(f) {
    var params = new URLSearchParams();
    if (f.search) params.set('q', f.search);
    if (f.status) params.set('status', f.status);
    if (f.sector) params.set('sector', f.sector);
    if (f.edu) params.set('edu', f.edu);
    if (f.sort && f.sort !== 'newest') params.set('sort', f.sort);
    if (currentPage > 1) params.set('page', currentPage);
    if (pageSize !== 10) params.set('size', pageSize);
    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', newUrl);
  }

  function restoreFromURL() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) $('jobs-search').value = params.get('q');
    if (params.get('status')) $('filter-status').value = params.get('status');
    if (params.get('sector')) $('filter-sector').value = params.get('sector');
    if (params.get('edu')) $('filter-edu').value = params.get('edu');
    if (params.get('sort')) $('filter-sort').value = params.get('sort');
    if (params.get('page')) currentPage = parseInt(params.get('page')) || 1;
    if (params.get('size')) {
      var s = params.get('size');
      pageSize = s === 'all' ? 'all' : (parseInt(s) || 10);
      $('page-size').value = s === 'all' ? 'all' : String(pageSize);
    }
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  function renderAll() {
    renderSubtitle();
    renderTable();
    renderMobileCards();
    renderPagination();
    updateBulkBar();
    updateEmptyState();
  }

  function renderSubtitle() {
    var el = $('jobs-subtitle');
    if (el) el.textContent = allJobs.length + ' total job' + (allJobs.length !== 1 ? 's' : '') +
      (filteredJobs.length !== allJobs.length ? ' (' + filteredJobs.length + ' matching)' : '');
  }

  function getPage() {
    if (pageSize === 'all') return filteredJobs;
    var start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }

  function totalPages() {
    if (pageSize === 'all' || filteredJobs.length === 0) return 1;
    return Math.ceil(filteredJobs.length / pageSize);
  }

  // ── Desktop Table ──
  function renderTable() {
    var tbody = $('jobs-tbody');
    if (!tbody) return;
    var page = getPage();
    tbody.innerHTML = '';

    page.forEach(function (job, i) {
      var tr = document.createElement('tr');
      var isEven = i % 2 === 0;
      tr.className = 'group transition-colors duration-100 ' +
        (isEven ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/20') +
        ' hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-default';
      tr.setAttribute('data-job-id', job.id);
      tr.setAttribute('tabindex', '0');

      var sector = sectorColors[job.sector] || sectorColors.other;
      var lastDate = job.important_dates && job.important_dates.last_date;
      var days = daysUntil(lastDate);
      var dateColor = days < 0 ? 'text-red-500 dark:text-red-400' : (days <= 7 ? 'text-orange-500 dark:text-orange-400' : 'text-content-primary dark:text-white');
      var isSelected = selectedIds.has(job.id);

      var sourceBadge = job._source === 'uploaded'
        ? '<span class="inline-block px-1.5 py-0 text-[9px] font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ml-2">Uploaded</span>'
        : '<span class="inline-block px-1.5 py-0 text-[9px] font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ml-2">Seed</span>';

      tr.innerHTML =
        '<td class="px-3 py-3">' +
          '<input type="checkbox" class="row-cb rounded border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary/50 cursor-pointer" data-id="' + esc(job.id) + '" ' + (isSelected ? 'checked' : '') + ' aria-label="Select ' + esc(job.notification_title) + '" />' +
        '</td>' +
        '<td class="px-4 py-3">' +
          '<div class="min-w-[200px]">' +
            '<a href="/admin/jobs/' + esc(job.id) + '/edit" class="font-semibold text-content-primary dark:text-white hover:text-brand-primary dark:hover:text-blue-400 transition-colors line-clamp-1" title="' + esc(job.notification_title) + '">' + esc(job.notification_title) + '</a>' +
            '<div class="flex items-center gap-2 mt-0.5">' +
              '<span class="text-xs text-content-secondary dark:text-content-dark-muted line-clamp-1">' + esc(job.department || '-') + '</span>' +
              sourceBadge +
            '</div>' +
            '<span class="inline-flex items-center mt-1 px-1.5 py-0 text-[10px] font-semibold rounded-full ' + sector.bg + ' ' + sector.text + '">' + esc(sector.label) + '</span>' +
          '</div>' +
        '</td>' +
        '<td class="px-4 py-3 text-right font-semibold text-content-primary dark:text-white">' + commaNum(job.total_vacancies) + '</td>' +
        '<td class="px-4 py-3"><span class="' + dateColor + ' text-sm font-medium whitespace-nowrap">' + formatDate(lastDate) + '</span>' +
          (days >= 0 && days <= 7 ? '<br/><span class="text-[10px] text-orange-500">' + days + 'd left</span>' : '') +
          (days < 0 ? '<br/><span class="text-[10px] text-red-500">Closed</span>' : '') +
        '</td>' +
        '<td class="px-4 py-3">' + statusBadge(job._displayStatus) + '</td>' +
        '<td class="px-4 py-3 text-sm text-content-secondary dark:text-content-dark-muted">' + esc(eduLabels[job.education_level] || job.education_level || '-') + '</td>' +
        '<td class="px-4 py-3">' +
          '<div class="flex items-center justify-center gap-1">' +
            '<a href="/admin/jobs/' + esc(job.id) + '/edit" class="action-btn p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit" aria-label="Edit ' + esc(job.notification_title) + '">' +
              '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>' +
            '</a>' +
            '<a href="/jobs/' + esc(job.slug) + '" target="_blank" rel="noopener noreferrer" class="action-btn p-1.5 rounded-lg text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" title="View on Site" aria-label="View on site">' +
              '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>' +
            '</a>' +
            '<button type="button" class="action-btn dup-btn p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" data-id="' + esc(job.id) + '" title="Duplicate" aria-label="Duplicate">' +
              '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>' +
            '</button>' +
            '<button type="button" class="action-btn del-btn p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-id="' + esc(job.id) + '" title="Delete" aria-label="Delete ' + esc(job.notification_title) + '">' +
              '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>' +
            '</button>' +
          '</div>' +
        '</td>';

      tbody.appendChild(tr);
    });

    // Attach event listeners
    tbody.querySelectorAll('.row-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = this.dataset.id;
        if (this.checked) selectedIds.add(id); else selectedIds.delete(id);
        updateBulkBar();
        updateSelectAllCb();
      });
    });

    tbody.querySelectorAll('.dup-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        duplicateJob(this.dataset.id);
      });
    });

    tbody.querySelectorAll('.del-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var job = allJobs.find(function (j) { return j.id === btn.dataset.id; });
        showDeleteModal('single', btn.dataset.id, job ? job.notification_title : 'this job');
      });
    });

    updateSelectAllCb();
  }

  // ── Mobile Cards ──
  function renderMobileCards() {
    var container = $('mobile-cards');
    if (!container) return;
    var page = getPage();
    container.innerHTML = '';

    page.forEach(function (job) {
      var sector = sectorColors[job.sector] || sectorColors.other;
      var lastDate = job.important_dates && job.important_dates.last_date;
      var days = daysUntil(lastDate);
      var dateColor = days < 0 ? 'text-red-500' : (days <= 7 ? 'text-orange-500' : 'text-content-primary dark:text-white');
      var isSelected = selectedIds.has(job.id);

      var sourceBadge = job._source === 'uploaded'
        ? '<span class="px-1.5 py-0 text-[9px] font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Uploaded</span>'
        : '<span class="px-1.5 py-0 text-[9px] font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Seed</span>';

      var card = document.createElement('div');
      card.className = 'bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-200' + (isSelected ? ' ring-2 ring-brand-primary' : '');
      card.setAttribute('data-job-id', job.id);

      card.innerHTML =
        '<div class="p-4">' +
          '<div class="flex items-start justify-between gap-3 mb-2">' +
            '<div class="flex-1 min-w-0">' +
              '<h3 class="font-semibold text-sm text-content-primary dark:text-white line-clamp-2">' + esc(job.notification_title) + '</h3>' +
              '<p class="text-xs text-content-secondary dark:text-content-dark-muted mt-0.5 line-clamp-1">' + esc(job.department || '-') + '</p>' +
            '</div>' +
            '<div class="shrink-0">' + statusBadge(job._displayStatus) + '</div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center gap-2 mb-3">' +
            '<span class="inline-flex items-center px-1.5 py-0 text-[10px] font-semibold rounded-full ' + sector.bg + ' ' + sector.text + '">' + esc(sector.label) + '</span>' +
            sourceBadge +
          '</div>' +
          '<div class="grid grid-cols-3 gap-3 text-center mb-3">' +
            '<div><p class="text-xs text-content-secondary dark:text-content-dark-muted">Vacancies</p><p class="text-sm font-bold text-content-primary dark:text-white">' + commaNum(job.total_vacancies) + '</p></div>' +
            '<div><p class="text-xs text-content-secondary dark:text-content-dark-muted">Last Date</p><p class="text-sm font-medium ' + dateColor + '">' + formatDate(lastDate) + '</p></div>' +
            '<div><p class="text-xs text-content-secondary dark:text-content-dark-muted">Education</p><p class="text-sm font-medium text-content-primary dark:text-white">' + esc(eduLabels[job.education_level] || '-') + '</p></div>' +
          '</div>' +
        '</div>' +
        /* Expandable action bar */
        '<div class="mobile-actions hidden border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/30 p-3 flex items-center justify-between gap-2">' +
          '<label class="inline-flex items-center gap-1.5">' +
            '<input type="checkbox" class="mobile-cb rounded border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary/50" data-id="' + esc(job.id) + '" ' + (isSelected ? 'checked' : '') + ' />' +
            '<span class="text-xs text-content-secondary dark:text-content-dark-muted">Select</span>' +
          '</label>' +
          '<div class="flex items-center gap-1">' +
            '<a href="/admin/jobs/' + esc(job.id) + '/edit" class="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></a>' +
            '<a href="/jobs/' + esc(job.slug) + '" target="_blank" class="p-2 rounded-lg text-content-secondary hover:bg-gray-100 dark:hover:bg-slate-800" title="View"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></a>' +
            '<button type="button" class="dup-btn-m p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20" data-id="' + esc(job.id) + '" title="Duplicate"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg></button>' +
            '<button type="button" class="del-btn-m p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" data-id="' + esc(job.id) + '" title="Delete"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>' +
          '</div>' +
        '</div>';

      // Tap to expand/collapse actions
      card.querySelector('.p-4').addEventListener('click', function () {
        var actions = card.querySelector('.mobile-actions');
        actions.classList.toggle('hidden');
      });

      // Mobile checkbox
      card.querySelectorAll('.mobile-cb').forEach(function (cb) {
        cb.addEventListener('change', function (e) {
          e.stopPropagation();
          if (this.checked) selectedIds.add(this.dataset.id); else selectedIds.delete(this.dataset.id);
          card.classList.toggle('ring-2', this.checked);
          card.classList.toggle('ring-brand-primary', this.checked);
          updateBulkBar();
        });
      });

      // Mobile dup/del
      card.querySelectorAll('.dup-btn-m').forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.stopPropagation(); duplicateJob(this.dataset.id); });
      });
      card.querySelectorAll('.del-btn-m').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var job = allJobs.find(function (j) { return j.id === btn.dataset.id; });
          showDeleteModal('single', btn.dataset.id, job ? job.notification_title : 'this job');
        });
      });

      container.appendChild(card);
    });
  }

  // ── Pagination ──
  function renderPagination() {
    var total = filteredJobs.length;
    var tp = totalPages();
    if (currentPage > tp) currentPage = tp;
    if (currentPage < 1) currentPage = 1;

    var start, end;
    if (pageSize === 'all') {
      start = total > 0 ? 1 : 0;
      end = total;
    } else {
      start = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
      end = Math.min(currentPage * pageSize, total);
    }
    $('page-info').textContent = 'Showing ' + start + '-' + end + ' of ' + total;

    var btnsContainer = $('page-buttons');
    btnsContainer.innerHTML = '';

    if (tp <= 1) return;

    var pageBtnCls = 'px-3 py-1.5 text-xs font-medium rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50';
    var activeCls = pageBtnCls + ' bg-brand-primary text-white';
    var inactiveCls = pageBtnCls + ' bg-white dark:bg-slate-800 text-content-secondary dark:text-content-dark-muted border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700';
    var disabledCls = pageBtnCls + ' bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700';

    // Prev
    var prev = document.createElement('button');
    prev.type = 'button';
    prev.textContent = 'Prev';
    prev.className = currentPage <= 1 ? disabledCls : inactiveCls;
    prev.disabled = currentPage <= 1;
    prev.addEventListener('click', function () { if (currentPage > 1) { currentPage--; renderAll(); } });
    btnsContainer.appendChild(prev);

    // Page numbers (show max 5 around current)
    var pages = [];
    var start_p = Math.max(1, currentPage - 2);
    var end_p = Math.min(tp, currentPage + 2);
    if (start_p > 1) { pages.push(1); if (start_p > 2) pages.push('...'); }
    for (var p = start_p; p <= end_p; p++) pages.push(p);
    if (end_p < tp) { if (end_p < tp - 1) pages.push('...'); pages.push(tp); }

    pages.forEach(function (pg) {
      var btn = document.createElement('button');
      btn.type = 'button';
      if (pg === '...') {
        btn.textContent = '...';
        btn.className = pageBtnCls + ' text-content-secondary dark:text-content-dark-muted cursor-default';
        btn.disabled = true;
      } else {
        btn.textContent = pg;
        btn.className = pg === currentPage ? activeCls : inactiveCls;
        btn.addEventListener('click', function () { currentPage = pg; renderAll(); });
      }
      btnsContainer.appendChild(btn);
    });

    // Next
    var next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Next';
    next.className = currentPage >= tp ? disabledCls : inactiveCls;
    next.disabled = currentPage >= tp;
    next.addEventListener('click', function () { if (currentPage < tp) { currentPage++; renderAll(); } });
    btnsContainer.appendChild(next);
  }

  function updateEmptyState() {
    var empty = $('empty-state');
    var table = $('table-wrapper');
    var mobile = $('mobile-cards');
    var pagBar = $('pagination-bar');

    if (filteredJobs.length === 0) {
      if (empty) empty.classList.remove('hidden');
      if (table) table.classList.add('hidden');
      if (mobile) mobile.classList.add('hidden');
      if (pagBar) pagBar.classList.add('hidden');
    } else {
      if (empty) empty.classList.add('hidden');
      if (table) { table.classList.remove('hidden'); table.classList.add('hidden', 'md:block'); table.className = table.className.replace(/\bhidden\b/, '').trim(); table.classList.add('hidden'); table.classList.add('md:block'); }
      if (pagBar) pagBar.classList.remove('hidden');
    }
    // Fix table visibility properly
    if (filteredJobs.length > 0 && table) {
      table.className = 'md:block bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hidden';
    }
  }

  // ═══════════════════════════════════════════
  //  SELECT ALL / BULK
  // ═══════════════════════════════════════════
  function updateSelectAllCb() {
    var cb = $('select-all-cb');
    if (!cb) return;
    var page = getPage();
    var allChecked = page.length > 0 && page.every(function (j) { return selectedIds.has(j.id); });
    var someChecked = page.some(function (j) { return selectedIds.has(j.id); });
    cb.checked = allChecked;
    cb.indeterminate = someChecked && !allChecked;
  }

  $('select-all-cb').addEventListener('change', function () {
    var page = getPage();
    if (this.checked) {
      page.forEach(function (j) { selectedIds.add(j.id); });
    } else {
      page.forEach(function (j) { selectedIds.delete(j.id); });
    }
    renderTable();
    renderMobileCards();
    updateBulkBar();
  });

  function updateBulkBar() {
    var bar = $('bulk-bar');
    var count = $('bulk-count');
    if (selectedIds.size > 0) {
      bar.classList.remove('hidden');
      count.textContent = selectedIds.size + ' selected';
    } else {
      bar.classList.add('hidden');
    }
  }

  // ═══════════════════════════════════════════
  //  CRUD ACTIONS
  // ═══════════════════════════════════════════
  function saveUploaded() {
    var uploaded = allJobs.filter(function (j) { return j._source === 'uploaded'; });
    // Strip internal fields before saving
    var clean = uploaded.map(function (j) {
      var c = Object.assign({}, j);
      delete c._source;
      delete c._displayStatus;
      return c;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  }

  function duplicateJob(id) {
    var job = allJobs.find(function (j) { return j.id === id; });
    if (!job) return;
    var copy = JSON.parse(JSON.stringify(job));
    copy.id = 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
    copy.notification_title = (copy.notification_title || '') + ' (Copy)';
    copy.slug = copy.slug + '-copy-' + Date.now().toString(36).slice(-4);
    copy.status = 'draft';
    copy._source = 'uploaded';
    copy._displayStatus = 'draft';
    copy.created_at = new Date().toISOString();
    allJobs.unshift(copy);
    saveUploaded();
    applyFilters();
    showToast('Job duplicated as draft.', 'success');
  }

  function deleteJobById(id) {
    allJobs = allJobs.filter(function (j) { return j.id !== id; });
    selectedIds.delete(id);
    saveUploaded();
    applyFilters();
  }

  function bulkSetStatus(status) {
    selectedIds.forEach(function (id) {
      var job = allJobs.find(function (j) { return j.id === id; });
      if (job) {
        job.status = status;
        job._displayStatus = deriveStatus(job);
        // If it was seed, make it uploaded (since we changed it)
        if (job._source === 'seed') job._source = 'uploaded';
      }
    });
    var count = selectedIds.size;
    selectedIds.clear();
    saveUploaded();
    applyFilters();
    showToast(count + ' job(s) set to ' + status + '.', 'success');
  }

  function bulkDelete() {
    var count = selectedIds.size;
    selectedIds.forEach(function (id) {
      allJobs = allJobs.filter(function (j) { return j.id !== id; });
    });
    selectedIds.clear();
    saveUploaded();
    applyFilters();
    showToast(count + ' job(s) deleted.', 'success');
  }

  // ═══════════════════════════════════════════
  //  DELETE MODAL
  // ═══════════════════════════════════════════
  function showDeleteModal(type, id, title) {
    deleteTarget = { type: type, id: id };
    var modal = $('delete-modal');
    var text = $('delete-modal-text');
    var titleEl = $('delete-modal-title');

    if (type === 'single') {
      titleEl.textContent = 'Delete "' + (title || 'this job') + '"?';
      text.textContent = 'This action cannot be undone.';
    } else {
      titleEl.textContent = 'Delete ' + selectedIds.size + ' job(s)?';
      text.textContent = 'This action cannot be undone.';
    }

    modal.classList.remove('hidden');
    $('delete-cancel-btn').focus();
  }

  function hideDeleteModal() {
    $('delete-modal').classList.add('hidden');
    deleteTarget = null;
  }

  $('delete-cancel-btn').addEventListener('click', hideDeleteModal);
  $('delete-modal-backdrop').addEventListener('click', hideDeleteModal);

  $('delete-confirm-btn').addEventListener('click', function () {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'single') {
      deleteJobById(deleteTarget.id);
      showToast('Job deleted.', 'success');
    } else {
      bulkDelete();
    }
    hideDeleteModal();
  });

  // Escape to close modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('delete-modal').classList.contains('hidden')) {
      hideDeleteModal();
    }
  });

  // ═══════════════════════════════════════════
  //  BULK ACTION BUTTONS
  // ═══════════════════════════════════════════
  $('bulk-active-btn').addEventListener('click', function () { bulkSetStatus('published'); });
  $('bulk-expire-btn').addEventListener('click', function () { bulkSetStatus('expired'); });
  $('bulk-delete-btn').addEventListener('click', function () { showDeleteModal('bulk'); });

  // ═══════════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════════
  // Search with debounce
  $('jobs-search').addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () { currentPage = 1; applyFilters(); }, 300);
  });

  // Filter/sort changes
  ['filter-status', 'filter-sector', 'filter-edu', 'filter-sort'].forEach(function (id) {
    $(id).addEventListener('change', function () { currentPage = 1; applyFilters(); });
  });

  // Page size
  $('page-size').addEventListener('change', function () {
    var val = this.value;
    pageSize = val === 'all' ? 'all' : parseInt(val);
    currentPage = 1;
    renderAll();
  });

  // Clear filters
  $('clear-filters-btn').addEventListener('click', clearAllFilters);
  var emptyBtn = $('empty-clear-btn');
  if (emptyBtn) emptyBtn.addEventListener('click', clearAllFilters);

  function clearAllFilters() {
    $('jobs-search').value = '';
    $('filter-status').value = '';
    $('filter-sector').value = '';
    $('filter-edu').value = '';
    $('filter-sort').value = 'newest';
    currentPage = 1;
    applyFilters();
  }

  // ═══════════════════════════════════════════
  //  KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════
  document.addEventListener('keydown', function (e) {
    // Only when not in an input
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    var rows = $('jobs-tbody') ? $('jobs-tbody').querySelectorAll('tr[data-job-id]') : [];
    if (rows.length === 0) return;

    var focused = document.activeElement;
    var currentRow = focused && focused.closest ? focused.closest('tr[data-job-id]') : null;
    var idx = -1;
    if (currentRow) {
      rows.forEach(function (r, i) { if (r === currentRow) idx = i; });
    }

    if (e.key === 'ArrowDown' && idx < rows.length - 1) {
      e.preventDefault();
      rows[idx + 1].focus();
    } else if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      rows[idx - 1].focus();
    } else if (e.key === 'Enter' && currentRow) {
      var id = currentRow.dataset.jobId;
      window.location.href = '/admin/jobs/' + id + '/edit';
    } else if (e.key === 'Delete' && currentRow) {
      var jobId = currentRow.dataset.jobId;
      var job = allJobs.find(function (j) { return j.id === jobId; });
      showDeleteModal('single', jobId, job ? job.notification_title : 'this job');
    }
  });

  // ═══════════════════════════════════════════
  //  TOAST
  // ═══════════════════════════════════════════
  function showToast(message, type) {
    var toast = $('toast');
    var inner = $('toast-inner');
    var text = $('toast-text');
    text.textContent = message;
    var colors = {
      success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
    };
    inner.className = 'flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium ' + (colors[type] || colors.info);
    toast.classList.remove('hidden');
    setTimeout(function () { toast.classList.add('hidden'); }, 3000);
  }

  // ═══════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════
  loadJobs();
  restoreFromURL();
  applyFilters();

})();
