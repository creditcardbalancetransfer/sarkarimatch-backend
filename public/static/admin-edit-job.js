/**
 * admin-edit-job.js
 * Client-side logic for /admin/jobs/:id/edit — Reuses form logic from admin-upload.js Step 3.
 * Pre-populates from server-injected job data, supports save/publish/delete/unpublish/changelog.
 * Unsaved changes warning via beforeunload. Auto-save every 30s.
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //  STATE
  // ═══════════════════════════════════════════
  var STORAGE_KEY = 'sarkarimatch_admin_jobs';
  var CHANGELOG_KEY = 'sarkarimatch_changelogs';
  var AUTOSAVE_KEY = 'sarkarimatch_edit_autosave';
  var hasUnsavedChanges = false;
  var jobData = null;
  var jobId = null;

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════
  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  // ═══════════════════════════════════════════
  //  TOAST (enhanced: top-right stacking, types, progress, close)
  // ═══════════════════════════════════════════
  function showToast(message, type) {
    if (window.showAdminToast) { window.showAdminToast(message, type); return; }
  }

  // ═══════════════════════════════════════════
  //  LOAD JOB DATA (seed from server, or fallback to localStorage)
  // ═══════════════════════════════════════════
  try {
    var dataEl = $('edit-job-data');
    var idEl = $('edit-job-id');
    if (dataEl) jobData = JSON.parse(dataEl.textContent || '{}');
    if (idEl) jobId = JSON.parse(idEl.textContent || '""');
  } catch (e) {
    showToast('Failed to load job data', 'error');
  }

  // If server returned placeholder ("Loading..."), try localStorage
  if (jobData && jobData.notification_title === 'Loading...' && jobId) {
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      var found = null;
      for (var i = 0; i < stored.length; i++) {
        if (stored[i].id === jobId) { found = stored[i]; break; }
      }
      if (found) {
        jobData = found;
      } else {
        // Truly not found - show a message
        showToast('Job not found. It may have been deleted.', 'error');
        return;
      }
    } catch (e) {
      showToast('Job not found in local storage.', 'error');
      return;
    }
  }

  if (!jobData || !jobData.notification_title || jobData.notification_title === 'Loading...') {
    return; // No data to work with
  }

  // ═══════════════════════════════════════════
  //  INPUT CLASSES
  // ═══════════════════════════════════════════
  var inputCls = 'w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors';
  var smallBtnCls = 'p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none';

  // ═══════════════════════════════════════════
  //  POPULATE FORM
  // ═══════════════════════════════════════════
  function populateForm() {
    var d = jobData;
    $('f-title').value = d.notification_title || '';
    $('f-slug').value = d.slug || '';
    $('f-advt').value = d.advertisement_number || '';
    $('f-dept').value = d.department || '';
    $('f-org').value = d.organization || '';
    $('f-sector').value = d.sector || 'other';
    $('f-status').value = d.status === 'published' ? 'published' : (d.status || 'draft');
    $('f-vacancies').value = d.total_vacancies || 0;
    $('f-salary-min').value = d.salary_min || 0;
    $('f-salary-max').value = d.salary_max || 0;
    $('f-website').value = d.official_website || '';
    $('f-apply-link').value = d.apply_link || '';
    $('f-summary').value = d.summary || '';
    $('f-edu-level').value = d.education_level || 'graduate';
    $('f-app-mode').value = d.application_mode || 'Online';
    $('f-fee-gen').value = d.application_fee_general || 0;
    $('f-fee-scst').value = d.application_fee_sc_st || 0;
    $('f-age-min').value = d.age_min || 0;
    $('f-age-max').value = d.age_max || 0;

    // Auto-generate slug from title
    $('f-title').addEventListener('input', function () {
      $('f-slug').value = slugify(this.value);
      hasUnsavedChanges = true;
    });

    // Last Modified display
    var lastMod = $('last-modified');
    if (lastMod) {
      var date = d.updated_at || d.created_at;
      if (date) {
        try { lastMod.textContent = 'Last modified: ' + new Date(date).toLocaleString(); } catch (e) {}
      }
    }

    // Render dynamic sections
    renderDatesForm(d);
    renderPostsForm(d);
    renderStagesForm(d);
    renderStepsForm(d);
    renderExamForm(d);
    renderChangelog();
  }

  // ═══════════════════════════════════════════
  //  TRACK CHANGES
  // ═══════════════════════════════════════════
  document.querySelectorAll('#job-edit-form input, #job-edit-form select, #job-edit-form textarea').forEach(function (el) {
    el.addEventListener('input', function () { hasUnsavedChanges = true; });
    el.addEventListener('change', function () { hasUnsavedChanges = true; });
  });

  window.addEventListener('beforeunload', function (e) {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  });

  // ═══════════════════════════════════════════
  //  DATES FORM
  // ═══════════════════════════════════════════
  function renderDatesForm(d) {
    var container = $('dates-container');
    container.innerHTML = '';
    var dateLabels = [
      { key: 'notification_date', label: 'Notification Date' },
      { key: 'start_date', label: 'Apply Start' },
      { key: 'last_date', label: 'Apply End' },
      { key: 'exam_date', label: 'Exam Date' },
    ];
    dateLabels.forEach(function (dl) {
      addDateRow(container, dl.label, (d.important_dates || {})[dl.key] || '');
    });
  }

  function addDateRow(container, label, value) {
    var row = document.createElement('div');
    row.className = 'flex flex-col sm:flex-row items-start sm:items-center gap-2';
    row.innerHTML =
      '<input type="text" class="' + inputCls + ' sm:w-40" placeholder="Label" value="' + esc(label) + '" />' +
      '<input type="date" class="' + inputCls + ' sm:flex-1" value="' + esc(value || '') + '" />' +
      '<button type="button" class="' + smallBtnCls + '" aria-label="Remove date"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>';
    row.querySelector('button').addEventListener('click', function () { row.remove(); hasUnsavedChanges = true; });
    row.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () { hasUnsavedChanges = true; }); });
    container.appendChild(row);
  }

  $('add-date-btn').addEventListener('click', function () { addDateRow($('dates-container'), '', ''); });

  // ═══════════════════════════════════════════
  //  POSTS FORM
  // ═══════════════════════════════════════════
  function renderPostsForm(d) {
    var container = $('posts-container');
    container.innerHTML = '';
    (d.posts || []).forEach(function (post, i) {
      var vb = (d.vacancy_breakdown || [])[i] || {};
      addPostCard(container, post, vb);
    });
  }

  function addPostCard(container, post, vb) {
    post = post || { post_name: '', vacancies_total: 0, education_required: '', age_limit: '', salary: '' };
    vb = vb || { ur: 0, obc: 0, sc: 0, st: 0, ews: 0, total: 0 };
    var card = document.createElement('div');
    card.className = 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3';
    card.innerHTML =
      '<div class="flex items-center justify-between">' +
        '<input type="text" class="' + inputCls + ' flex-1 font-semibold" placeholder="Post Name" value="' + esc(post.post_name) + '" data-field="post_name" />' +
        '<div class="flex items-center gap-1 ml-2">' +
          '<button type="button" class="dup-post-btn p-1.5 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Duplicate"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg></button>' +
          '<button type="button" class="del-post-btn ' + smallBtnCls + '" title="Remove"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-3 sm:grid-cols-6 gap-2">' +
        ['UR', 'OBC', 'SC', 'ST', 'EWS', 'Total'].map(function (cat) {
          var key = cat.toLowerCase();
          var val = vb[key] || 0;
          var isTotal = key === 'total';
          return '<div><label class="block text-[10px] text-content-secondary dark:text-content-dark-muted mb-0.5">' + cat + '</label><input type="number" min="0" class="' + inputCls + ' text-center ' + (isTotal ? 'font-bold bg-gray-50 dark:bg-slate-700' : '') + '" value="' + val + '" data-vac="' + key + '" ' + (isTotal ? 'readonly' : '') + ' /></div>';
        }).join('') +
      '</div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' +
        '<input type="text" class="' + inputCls + '" placeholder="Education Required" value="' + esc(post.education_required) + '" data-field="education_required" />' +
        '<input type="text" class="' + inputCls + '" placeholder="Salary" value="' + esc(post.salary) + '" data-field="salary" />' +
      '</div>';

    // Auto-calculate total
    card.querySelectorAll('input[data-vac]').forEach(function (inp) {
      if (inp.dataset.vac !== 'total') {
        inp.addEventListener('input', function () {
          var total = 0;
          card.querySelectorAll('input[data-vac]').forEach(function (v) {
            if (v.dataset.vac !== 'total') total += parseInt(v.value) || 0;
          });
          card.querySelector('input[data-vac="total"]').value = total;
          hasUnsavedChanges = true;
        });
      }
    });

    card.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () { hasUnsavedChanges = true; }); });

    // Duplicate
    card.querySelector('.dup-post-btn').addEventListener('click', function () {
      var newPost = {
        post_name: card.querySelector('[data-field="post_name"]').value + ' (Copy)',
        vacancies_total: parseInt(card.querySelector('[data-vac="total"]').value) || 0,
        education_required: card.querySelector('[data-field="education_required"]').value,
        age_limit: post.age_limit,
        salary: card.querySelector('[data-field="salary"]').value,
      };
      var newVb = {};
      card.querySelectorAll('input[data-vac]').forEach(function (v) { newVb[v.dataset.vac] = parseInt(v.value) || 0; });
      addPostCard(container, newPost, newVb);
      hasUnsavedChanges = true;
    });

    // Delete
    card.querySelector('.del-post-btn').addEventListener('click', function () {
      if (container.children.length <= 1) { showToast('Must have at least one post.', 'error'); return; }
      card.remove();
      hasUnsavedChanges = true;
    });

    container.appendChild(card);
  }

  $('add-post-btn').addEventListener('click', function () { addPostCard($('posts-container')); });

  // ═══════════════════════════════════════════
  //  SELECTION PROCESS
  // ═══════════════════════════════════════════
  function renderStagesForm(d) {
    var container = $('stages-container');
    container.innerHTML = '';
    (d.selection_process || []).forEach(function (s) { addStageRow(container, s); });
  }

  function addStageRow(container, stage) {
    stage = stage || { name: '', description: '', is_eliminatory: false };
    var row = document.createElement('div');
    row.className = 'flex flex-col sm:flex-row items-start sm:items-center gap-2';
    row.innerHTML =
      '<input type="text" class="' + inputCls + ' sm:flex-1" placeholder="Stage Name" value="' + esc(stage.name) + '" />' +
      '<input type="text" class="' + inputCls + ' sm:flex-1" placeholder="Description" value="' + esc(stage.description) + '" />' +
      '<label class="inline-flex items-center gap-1.5 text-xs whitespace-nowrap"><input type="checkbox" class="rounded border-gray-300 text-brand-primary focus:ring-brand-primary/50" ' + (stage.is_eliminatory ? 'checked' : '') + ' /><span>Eliminatory</span></label>' +
      '<button type="button" class="' + smallBtnCls + '" aria-label="Remove stage"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>';
    row.querySelector('button:last-child').addEventListener('click', function () { row.remove(); hasUnsavedChanges = true; });
    row.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () { hasUnsavedChanges = true; }); });
    container.appendChild(row);
  }

  $('add-stage-btn').addEventListener('click', function () { addStageRow($('stages-container')); });

  // ═══════════════════════════════════════════
  //  HOW TO APPLY
  // ═══════════════════════════════════════════
  function renderStepsForm(d) {
    var container = $('steps-container');
    container.innerHTML = '';
    (d.how_to_apply || []).forEach(function (s, i) { addStepRow(container, s, i + 1); });
  }

  function addStepRow(container, text, num) {
    num = num || container.children.length + 1;
    var row = document.createElement('div');
    row.className = 'flex items-start gap-2';
    row.innerHTML =
      '<span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1.5">' + num + '</span>' +
      '<textarea class="' + inputCls + ' flex-1 resize-y" rows="2" placeholder="Step description...">' + esc(text || '') + '</textarea>' +
      '<button type="button" class="' + smallBtnCls + ' mt-1.5" aria-label="Remove step"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>';
    row.querySelector('button').addEventListener('click', function () { row.remove(); renumberSteps(); hasUnsavedChanges = true; });
    row.querySelector('textarea').addEventListener('input', function () { hasUnsavedChanges = true; });
    container.appendChild(row);
  }

  function renumberSteps() {
    $('steps-container').querySelectorAll(':scope > div').forEach(function (row, i) {
      var num = row.querySelector('span');
      if (num) num.textContent = i + 1;
    });
  }

  $('add-step-btn').addEventListener('click', function () { addStepRow($('steps-container')); });

  // ═══════════════════════════════════════════
  //  EXAM PATTERN
  // ═══════════════════════════════════════════
  function renderExamForm(d) {
    var container = $('exam-container');
    container.innerHTML = '';
    (d.exam_pattern || []).forEach(function (s) { addExamRow(container, s); });
  }

  function addExamRow(container, sec) {
    sec = sec || { section: '', questions: 0, marks: 0, duration_minutes: null };
    var row = document.createElement('div');
    row.className = 'grid grid-cols-2 sm:grid-cols-5 gap-2 items-end';
    row.innerHTML =
      '<div class="sm:col-span-2"><label class="block text-[10px] text-content-secondary dark:text-content-dark-muted mb-0.5">Section</label><input type="text" class="' + inputCls + '" placeholder="Section name" value="' + esc(sec.section) + '" /></div>' +
      '<div><label class="block text-[10px] text-content-secondary dark:text-content-dark-muted mb-0.5">Questions</label><input type="number" min="0" class="' + inputCls + '" value="' + (sec.questions || 0) + '" /></div>' +
      '<div><label class="block text-[10px] text-content-secondary dark:text-content-dark-muted mb-0.5">Marks</label><input type="number" min="0" class="' + inputCls + '" value="' + (sec.marks || 0) + '" /></div>' +
      '<div class="flex items-end gap-1"><div class="flex-1"><label class="block text-[10px] text-content-secondary dark:text-content-dark-muted mb-0.5">Duration (min)</label><input type="number" min="0" class="' + inputCls + '" value="' + (sec.duration_minutes || '') + '" /></div>' +
      '<button type="button" class="' + smallBtnCls + ' mb-0.5" aria-label="Remove"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div>';
    row.querySelector('button').addEventListener('click', function () { row.remove(); hasUnsavedChanges = true; });
    row.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () { hasUnsavedChanges = true; }); });
    container.appendChild(row);
  }

  $('add-exam-btn').addEventListener('click', function () { addExamRow($('exam-container')); });

  // ═══════════════════════════════════════════
  //  CHANGELOG
  // ═══════════════════════════════════════════
  function getChangelogs() {
    try {
      var all = JSON.parse(localStorage.getItem(CHANGELOG_KEY) || '{}');
      return all[jobId] || [];
    } catch (e) { return []; }
  }

  function saveChangelogs(entries) {
    try {
      var all = JSON.parse(localStorage.getItem(CHANGELOG_KEY) || '{}');
      all[jobId] = entries;
      localStorage.setItem(CHANGELOG_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function addChangelogEntry(note) {
    var entries = getChangelogs();
    entries.unshift({ date: new Date().toISOString(), note: note });
    saveChangelogs(entries);
  }

  function renderChangelog() {
    var container = $('changelog-entries');
    if (!container) return;
    var entries = getChangelogs();
    if (entries.length === 0) {
      container.innerHTML = '<p class="text-content-secondary dark:text-content-dark-muted italic">No changelog entries yet.</p>';
      return;
    }
    container.innerHTML = entries.map(function (e) {
      var d;
      try { d = new Date(e.date).toLocaleString(); } catch (err) { d = e.date; }
      return '<div class="flex items-start gap-2 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">' +
        '<span class="text-[10px] text-content-secondary dark:text-content-dark-muted whitespace-nowrap mt-0.5">' + esc(d) + '</span>' +
        '<span class="text-xs text-content-primary dark:text-white">' + esc(e.note) + '</span></div>';
    }).join('');
  }

  // ═══════════════════════════════════════════
  //  COLLECT FORM DATA
  // ═══════════════════════════════════════════
  function collectFormData() {
    var d = JSON.parse(JSON.stringify(jobData || {}));
    d.notification_title = $('f-title').value;
    d.slug = $('f-slug').value || slugify(d.notification_title);
    d.advertisement_number = $('f-advt').value;
    d.department = $('f-dept').value;
    d.organization = $('f-org').value;
    d.sector = $('f-sector').value;
    d.status = $('f-status').value;
    d.total_vacancies = parseInt($('f-vacancies').value) || 0;
    d.salary_min = parseInt($('f-salary-min').value) || 0;
    d.salary_max = parseInt($('f-salary-max').value) || 0;
    d.official_website = $('f-website').value;
    d.apply_link = $('f-apply-link').value;
    d.summary = $('f-summary').value;
    d.education_level = $('f-edu-level').value;
    d.application_mode = $('f-app-mode').value;
    d.application_fee_general = parseInt($('f-fee-gen').value) || 0;
    d.application_fee_sc_st = parseInt($('f-fee-scst').value) || 0;
    d.age_min = parseInt($('f-age-min').value) || 0;
    d.age_max = parseInt($('f-age-max').value) || 0;
    d.updated_at = new Date().toISOString();

    // Dates
    var dateRows = $('dates-container').querySelectorAll(':scope > div');
    var dates = {};
    dateRows.forEach(function (row) {
      var inputs = row.querySelectorAll('input');
      var label = (inputs[0].value || '').toLowerCase().replace(/\s+/g, '_');
      var val = inputs[1].value;
      if (label && val) dates[label] = val;
    });
    d.important_dates = {
      notification_date: dates.notification_date || dates.notification || '',
      start_date: dates.start_date || dates.apply_start || '',
      last_date: dates.last_date || dates.apply_end || '',
      exam_date: dates.exam_date || dates.exam || null,
    };

    // Posts
    d.posts = [];
    d.vacancy_breakdown = [];
    $('posts-container').querySelectorAll(':scope > div').forEach(function (card) {
      var name = (card.querySelector('[data-field="post_name"]') || {}).value || '';
      var edu = (card.querySelector('[data-field="education_required"]') || {}).value || '';
      var sal = (card.querySelector('[data-field="salary"]') || {}).value || '';
      var vb = {};
      card.querySelectorAll('input[data-vac]').forEach(function (v) { vb[v.dataset.vac] = parseInt(v.value) || 0; });
      d.posts.push({ post_name: name, vacancies_total: vb.total || 0, education_required: edu, age_limit: d.age_min + '-' + d.age_max + ' years', salary: sal });
      d.vacancy_breakdown.push({ post_name: name, ur: vb.ur || 0, obc: vb.obc || 0, sc: vb.sc || 0, st: vb.st || 0, ews: vb.ews || 0, total: vb.total || 0 });
    });

    // Selection process
    d.selection_process = [];
    $('stages-container').querySelectorAll(':scope > div').forEach(function (row, i) {
      var inputs = row.querySelectorAll('input[type="text"]');
      var cb = row.querySelector('input[type="checkbox"]');
      d.selection_process.push({ stage: i + 1, name: inputs[0].value, description: inputs[1] ? inputs[1].value : '', is_eliminatory: cb ? cb.checked : false });
    });

    // How to apply
    d.how_to_apply = [];
    $('steps-container').querySelectorAll('textarea').forEach(function (ta) { if (ta.value.trim()) d.how_to_apply.push(ta.value.trim()); });

    // Exam pattern
    d.exam_pattern = [];
    $('exam-container').querySelectorAll(':scope > div').forEach(function (row) {
      var inputs = row.querySelectorAll('input');
      d.exam_pattern.push({ section: inputs[0].value, questions: parseInt(inputs[1].value) || 0, marks: parseInt(inputs[2].value) || 0, duration_minutes: parseInt(inputs[3].value) || null });
    });

    return d;
  }

  // ═══════════════════════════════════════════
  //  SAVE JOB (update in localStorage)
  // ═══════════════════════════════════════════
  function saveJob(data) {
    var jobs = [];
    try { jobs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) {}
    if (!Array.isArray(jobs)) jobs = [];
    // Find and update existing, or add new
    var found = false;
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id === data.id) {
        jobs[i] = data;
        found = true;
        break;
      }
    }
    if (!found) jobs.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    hasUnsavedChanges = false;
  }

  function deleteJobFromStorage(id) {
    var jobs = [];
    try { jobs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) {}
    if (!Array.isArray(jobs)) jobs = [];
    jobs = jobs.filter(function (j) { return j.id !== id; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }

  // ═══════════════════════════════════════════
  //  ACTION HANDLERS
  // ═══════════════════════════════════════════

  // Save as Draft
  $('save-draft-btn').addEventListener('click', function () {
    var data = collectFormData();
    data.status = 'draft';
    var note = $('changelog-note').value.trim();
    if (note) addChangelogEntry(note);
    else addChangelogEntry('Saved as draft');
    $('changelog-note').value = '';
    saveJob(data);
    showToast('Saved as draft!', 'success');
    renderChangelog();
    var lastMod = $('last-modified');
    if (lastMod) lastMod.textContent = 'Last modified: ' + new Date().toLocaleString();
  });

  // Preview
  $('preview-btn').addEventListener('click', function () {
    var data = collectFormData();
    var modal = $('preview-modal');
    var content = $('preview-content');
    content.innerHTML =
      '<h2 class="text-xl font-bold mb-2">' + esc(data.notification_title) + '</h2>' +
      '<p class="text-sm text-content-secondary dark:text-content-dark-muted mb-4">' + esc(data.department) + ' | ' + esc(data.organization) + '</p>' +
      '<div class="grid grid-cols-2 gap-4 mb-4 text-sm">' +
        '<div><span class="font-medium">Vacancies:</span> ' + (data.total_vacancies || 0).toLocaleString() + '</div>' +
        '<div><span class="font-medium">Sector:</span> ' + esc(data.sector) + '</div>' +
        '<div><span class="font-medium">Education:</span> ' + esc(data.education_level) + '</div>' +
        '<div><span class="font-medium">Status:</span> ' + esc(data.status) + '</div>' +
        '<div><span class="font-medium">Age:</span> ' + data.age_min + ' - ' + data.age_max + ' years</div>' +
        '<div><span class="font-medium">Salary:</span> Rs.' + (data.salary_min || 0).toLocaleString() + ' - Rs.' + (data.salary_max || 0).toLocaleString() + '</div>' +
      '</div>' +
      '<h3 class="font-bold text-sm mb-2">Summary</h3><p class="text-sm mb-4">' + esc(data.summary) + '</p>' +
      '<h3 class="font-bold text-sm mb-2">Important Dates</h3>' +
      '<div class="text-sm space-y-1 mb-4">' +
        '<div>Notification: ' + esc((data.important_dates || {}).notification_date || 'N/A') + '</div>' +
        '<div>Apply Start: ' + esc((data.important_dates || {}).start_date || 'N/A') + '</div>' +
        '<div>Last Date: ' + esc((data.important_dates || {}).last_date || 'N/A') + '</div>' +
        '<div>Exam: ' + esc((data.important_dates || {}).exam_date || 'TBD') + '</div>' +
      '</div>' +
      '<h3 class="font-bold text-sm mb-2">Posts (' + (data.posts || []).length + ')</h3>' +
      '<div class="space-y-1 text-sm mb-4">' + (data.posts || []).map(function (p) {
        return '<div>' + esc(p.post_name) + ' - ' + (p.vacancies_total || 0) + ' vacancies</div>';
      }).join('') + '</div>';

    modal.classList.remove('hidden');
  });

  $('preview-close-btn').addEventListener('click', function () { $('preview-modal').classList.add('hidden'); });
  $('preview-modal-backdrop').addEventListener('click', function () { $('preview-modal').classList.add('hidden'); });

  // Publish
  $('publish-btn').addEventListener('click', function () {
    var data = collectFormData();
    if (!data.notification_title.trim()) { showToast('Title is required.', 'error'); $('f-title').focus(); return; }
    if (!data.department.trim()) { showToast('Department is required.', 'error'); $('f-dept').focus(); return; }
    if ((data.posts || []).length === 0) { showToast('At least one post is required.', 'error'); return; }

    data.status = 'published';
    var note = $('changelog-note').value.trim();
    if (note) addChangelogEntry(note);
    else addChangelogEntry('Published');
    $('changelog-note').value = '';
    saveJob(data);
    showToast('Job published successfully!', 'success');
    showConfetti();
    setTimeout(function () { window.location.href = '/admin/jobs'; }, 2000);
  });

  // Unpublish
  $('unpublish-btn').addEventListener('click', function () {
    var data = collectFormData();
    data.status = 'draft';
    addChangelogEntry('Unpublished (set to draft)');
    saveJob(data);
    $('f-status').value = 'draft';
    showToast('Job unpublished and set to draft.', 'warning');
    renderChangelog();
  });

  // Delete
  $('delete-job-btn').addEventListener('click', function () {
    $('delete-modal').classList.remove('hidden');
  });

  $('delete-cancel-btn').addEventListener('click', function () { $('delete-modal').classList.add('hidden'); });
  $('delete-modal-backdrop').addEventListener('click', function () { $('delete-modal').classList.add('hidden'); });

  $('delete-confirm-btn').addEventListener('click', function () {
    deleteJobFromStorage(jobId);
    hasUnsavedChanges = false;
    showToast('Job deleted permanently.', 'success');
    $('delete-modal').classList.add('hidden');
    setTimeout(function () { window.location.href = '/admin/jobs'; }, 1500);
  });

  // ═══════════════════════════════════════════
  //  AUTO-SAVE every 30s
  // ═══════════════════════════════════════════
  setInterval(function () {
    if (hasUnsavedChanges) {
      try {
        var data = collectFormData();
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        var indicator = $('autosave-indicator');
        if (indicator) {
          indicator.textContent = 'Auto-saved at ' + new Date().toLocaleTimeString();
          setTimeout(function () { if (indicator) indicator.textContent = ''; }, 3000);
        }
      } catch (e) {}
    }
  }, 30000);

  // ═══════════════════════════════════════════
  //  CONFETTI
  // ═══════════════════════════════════════════
  function showConfetti() {
    var container = $('confetti-container');
    if (!container) return;
    container.classList.remove('hidden');
    container.innerHTML = '';
    var colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    for (var i = 0; i < 60; i++) {
      var piece = document.createElement('div');
      piece.style.cssText =
        'position:absolute;width:' + (6 + Math.random() * 6) + 'px;height:' + (6 + Math.random() * 6) + 'px;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'left:' + (Math.random() * 100) + '%;top:-10px;' +
        'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';' +
        'animation:confetti-fall ' + (1.5 + Math.random() * 2) + 's ease-out ' + (Math.random() * 0.5) + 's forwards;opacity:0.9;';
      container.appendChild(piece);
    }
    setTimeout(function () { container.classList.add('hidden'); container.innerHTML = ''; }, 4000);
  }

  // Add CSS keyframes
  var style = document.createElement('style');
  style.textContent =
    '@keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(' + (360 + Math.random() * 360) + 'deg); opacity: 0; } }' +
    '@keyframes toast-progress { 0% { width: 100%; } 100% { width: 0%; } }' +
    '@keyframes animate-slide-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }' +
    '.animate-slide-in { animation: animate-slide-in 0.3s ease-out forwards; }';
  document.head.appendChild(style);

  // ═══════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════
  populateForm();

})();
