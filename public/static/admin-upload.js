/**
 * admin-upload.js
 * Client-side logic for /admin/upload — 3-step wizard.
 *
 * Step 1: File upload + drag-and-drop + parse simulation
 * Step 2: Review AI parsed data with accordion + JSON view
 * Step 3: Full editable form with dynamic repeaters
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //  STATE
  // ═══════════════════════════════════════════
  var currentStep = 1;
  var selectedFile = null;
  var parsedData = null;
  var STORAGE_KEY = 'sarkarimatch_admin_jobs';
  var AUTOSAVE_KEY = 'sarkarimatch_upload_autosave';

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════
  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function confidenceBadge() {
    var r = Math.random();
    if (r < 0.6) return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">High</span>';
    if (r < 0.9) return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Medium</span>';
    return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">Low</span>';
  }

  // ═══════════════════════════════════════════
  //  STEP NAVIGATION
  // ═══════════════════════════════════════════
  function setStep(step) {
    currentStep = step;
    // Show/hide content
    document.querySelectorAll('.step-content').forEach(function (el, i) {
      el.classList.toggle('hidden', i + 1 !== step);
    });
    // Update indicators
    for (var s = 1; s <= 3; s++) {
      var indicator = document.querySelector('[data-step-indicator="' + s + '"]');
      if (!indicator) continue;
      var circle = indicator.querySelector('.step-circle');
      var num = indicator.querySelector('.step-num');
      var check = indicator.querySelector('.step-check');
      var label = indicator.querySelector('.step-label');

      if (s < step) {
        // Completed
        circle.className = 'step-circle w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-green-500 text-white bg-green-500 transition-all duration-300';
        num.classList.add('hidden'); check.classList.remove('hidden');
        if (label) label.className = 'step-label text-sm font-medium text-green-600 dark:text-green-400 hidden sm:inline transition-colors duration-300';
      } else if (s === step) {
        // Active
        circle.className = 'step-circle w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-brand-primary text-white bg-brand-primary transition-all duration-300';
        num.classList.remove('hidden'); check.classList.add('hidden');
        if (label) label.className = 'step-label text-sm font-medium text-brand-primary dark:text-blue-400 hidden sm:inline transition-colors duration-300';
      } else {
        // Upcoming
        circle.className = 'step-circle w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 transition-all duration-300';
        num.classList.remove('hidden'); check.classList.add('hidden');
        if (label) label.className = 'step-label text-sm font-medium text-gray-400 dark:text-gray-500 hidden sm:inline transition-colors duration-300';
      }
    }
    // Step lines
    for (var l = 1; l <= 2; l++) {
      var line = document.querySelector('[data-step-line="' + l + '"]');
      if (line) {
        line.className = 'step-line w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 transition-colors duration-500 ' +
          (l < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════
  //  STEP 1: FILE UPLOAD
  // ═══════════════════════════════════════════
  var dropZone = $('drop-zone');
  var dropDefault = $('drop-default');
  var dropHover = $('drop-hover');
  var fileInput = $('file-input');
  var browseBtn = $('browse-btn');
  var filePreview = $('file-preview');
  var fileName = $('file-name');
  var fileSize = $('file-size');
  var removeFileBtn = $('remove-file-btn');
  var parseBtn = $('parse-btn');
  var parseBtnText = $('parse-btn-text');
  var parseSpinner = $('parse-spinner');
  var parseProgress = $('parse-progress');
  var parseSteps = $('parse-steps');

  browseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('click', function () { fileInput.click(); });
  dropZone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });

  // Drag events
  ['dragenter', 'dragover'].forEach(function (evt) {
    dropZone.addEventListener(evt, function (e) {
      e.preventDefault(); e.stopPropagation();
      dropHover.classList.remove('hidden');
      dropDefault.classList.add('hidden');
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropZone.addEventListener(evt, function (e) {
      e.preventDefault(); e.stopPropagation();
      dropHover.classList.add('hidden');
      dropDefault.classList.remove('hidden');
    });
  });

  dropZone.addEventListener('drop', function (e) {
    var files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are accepted.', 'error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast('File too large. Maximum 25 MB.', 'error');
      return;
    }
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    filePreview.classList.remove('hidden');
    parseBtn.disabled = false;
    parseProgress.classList.add('hidden');
    parseSteps.innerHTML = '';
  }

  removeFileBtn.addEventListener('click', function () {
    selectedFile = null;
    fileInput.value = '';
    filePreview.classList.add('hidden');
    parseBtn.disabled = true;
    parseProgress.classList.add('hidden');
    parseSteps.innerHTML = '';
  });

  // ═══════════════════════════════════════════
  //  PARSE SIMULATION
  // ═══════════════════════════════════════════
  var parseMessages = [
    { text: 'Reading PDF document...', icon: 'doc' },
    { text: 'Detecting notification type...', icon: 'search' },
    { text: 'Extracting job details...', icon: 'list' },
    { text: 'Parsing vacancy breakdown...', icon: 'users' },
    { text: 'Identifying important dates...', icon: 'calendar' },
    { text: 'AI parsing complete!', icon: 'check' },
  ];

  parseBtn.addEventListener('click', function () {
    if (!selectedFile) return;
    parseBtnText.textContent = 'Parsing with Gemini AI...';
    parseSpinner.classList.remove('hidden');
    parseBtn.disabled = true;
    parseProgress.classList.remove('hidden');
    parseSteps.innerHTML = '';

    parseMessages.forEach(function (msg, i) {
      setTimeout(function () {
        var isLast = i === parseMessages.length - 1;
        var div = document.createElement('div');
        div.className = 'flex items-center gap-2 text-sm ' + (isLast ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-content-secondary dark:text-content-dark-muted');
        div.style.animation = 'fadeInUp 0.3s ease-out forwards';
        div.innerHTML =
          '<svg class="w-4 h-4 shrink-0 ' + (isLast ? 'text-green-500' : 'text-blue-500') + '" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
          (isLast
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />') +
          '</svg>' +
          '<span>' + esc(msg.text) + '</span>';
        parseSteps.appendChild(div);
      }, i * 800);
    });

    // Generate mock data
    setTimeout(function () {
      parsedData = simulateParseClient(selectedFile.name);
      setStep(2);
      renderReview();
      // Reset parse UI
      parseBtnText.textContent = 'Parse with AI';
      parseSpinner.classList.add('hidden');
      parseBtn.disabled = false;
    }, 4500);
  });

  // ═══════════════════════════════════════════
  //  CLIENT-SIDE MOCK DATA GENERATOR
  // ═══════════════════════════════════════════
  function simulateParseClient(filename) {
    var lower = filename.toLowerCase();
    var data;

    if (lower.includes('sbi')) {
      data = {
        notification_title: 'SBI Probationary Officer (PO) Recruitment 2026',
        advertisement_number: 'CRPD/PO/2026-26/05',
        department: 'Department of Financial Services',
        organization: 'State Bank of India',
        sector: 'banking', total_vacancies: 2000,
        education_level: 'graduate', age_min: 21, age_max: 30,
        salary_min: 36000, salary_max: 120000,
        application_fee_general: 750, application_fee_sc_st: 0,
        important_dates: { notification_date: '2026-03-01', start_date: '2026-03-10', last_date: '2026-04-10', exam_date: '2026-06-20' },
        apply_link: 'https://sbi.co.in/careers', official_website: 'https://sbi.co.in/careers',
        locations: ['All India'], tags: ['banking', 'po', 'sbi', 'graduate'],
        summary: 'SBI invites applications for Probationary Officer posts across India.',
        application_mode: 'Online',
        posts: [
          { post_name: 'Probationary Officer', vacancies_total: 1600, education_required: 'Graduation in any discipline', age_limit: '21-30 years', salary: '\u20b936,000 - \u20b91,20,000' },
          { post_name: 'Probationary Officer (IT)', vacancies_total: 400, education_required: 'B.Tech/B.E. in CS/IT', age_limit: '21-30 years', salary: '\u20b936,000 - \u20b91,20,000' },
        ],
        vacancy_breakdown: [
          { post_name: 'Probationary Officer', ur: 640, obc: 432, sc: 240, st: 128, ews: 160, total: 1600 },
          { post_name: 'Probationary Officer (IT)', ur: 160, obc: 108, sc: 60, st: 32, ews: 40, total: 400 },
        ],
        selection_process: [
          { stage: 1, name: 'Preliminary Examination', description: 'Online objective test. 1 hour.', is_eliminatory: true },
          { stage: 2, name: 'Main Examination', description: 'Online objective + descriptive. 3 hours.', is_eliminatory: true },
          { stage: 3, name: 'GE & Interview', description: 'Group exercise + personal interview.', is_eliminatory: true },
        ],
        how_to_apply: ['Visit sbi.co.in/careers', 'Register and fill form', 'Upload documents', 'Pay fee and submit'],
        exam_pattern: [
          { section: 'English Language', questions: 30, marks: 30, duration_minutes: 20 },
          { section: 'Quantitative Aptitude', questions: 35, marks: 35, duration_minutes: 20 },
          { section: 'Reasoning Ability', questions: 35, marks: 35, duration_minutes: 20 },
        ],
        documents_required: ['Graduation Degree', 'Photo ID', 'Passport Photo'],
        marking_scheme: '1 mark correct, 0.25 negative.',
        important_notice: 'Ensure eligibility before applying.',
      };
    } else if (lower.includes('rrb') || lower.includes('railway')) {
      data = {
        notification_title: 'RRB Group D (Level 1) Recruitment 2026',
        advertisement_number: 'CEN RRC 01/2026',
        department: 'Ministry of Railways', organization: 'Railway Recruitment Cells',
        sector: 'railway', total_vacancies: 32000,
        education_level: '10th', age_min: 18, age_max: 33,
        salary_min: 18000, salary_max: 56900,
        application_fee_general: 500, application_fee_sc_st: 250,
        important_dates: { notification_date: '2026-03-05', start_date: '2026-03-15', last_date: '2026-04-30', exam_date: '2026-09-15' },
        apply_link: 'https://www.rrbapply.gov.in', official_website: 'https://www.rrbapply.gov.in',
        locations: ['All India'], tags: ['railway', 'group-d', '10th-pass'],
        summary: 'RRC invites applications for Group D Level 1 posts. 32,000 vacancies.',
        application_mode: 'Online',
        posts: [
          { post_name: 'Track Maintainer Grade IV', vacancies_total: 18000, education_required: '10th Pass + ITI', age_limit: '18-33 years', salary: '\u20b918,000 - \u20b956,900' },
          { post_name: 'Helper/Assistant', vacancies_total: 8000, education_required: '10th Pass', age_limit: '18-33 years', salary: '\u20b918,000 - \u20b956,900' },
          { post_name: 'Porter/Pointsman', vacancies_total: 6000, education_required: '10th Pass', age_limit: '18-33 years', salary: '\u20b918,000 - \u20b956,900' },
        ],
        vacancy_breakdown: [
          { post_name: 'Track Maintainer', ur: 7200, obc: 4860, sc: 2700, st: 1440, ews: 1800, total: 18000 },
          { post_name: 'Helper/Assistant', ur: 3200, obc: 2160, sc: 1200, st: 640, ews: 800, total: 8000 },
          { post_name: 'Porter/Pointsman', ur: 2400, obc: 1620, sc: 900, st: 480, ews: 600, total: 6000 },
        ],
        selection_process: [
          { stage: 1, name: 'CBT', description: 'Computer Based Test. 90 minutes.', is_eliminatory: true },
          { stage: 2, name: 'PET', description: 'Physical Efficiency Test.', is_eliminatory: true },
          { stage: 3, name: 'Document Verification', description: 'Original documents.', is_eliminatory: false },
        ],
        how_to_apply: ['Visit rrbapply.gov.in', 'Register and fill form', 'Upload documents and pay fee', 'Submit'],
        exam_pattern: [
          { section: 'Mathematics', questions: 25, marks: 25, duration_minutes: null },
          { section: 'GI & Reasoning', questions: 30, marks: 30, duration_minutes: null },
          { section: 'General Science', questions: 25, marks: 25, duration_minutes: null },
          { section: 'General Awareness', questions: 20, marks: 20, duration_minutes: null },
        ],
        documents_required: ['10th Certificate', 'Photo ID', 'Photo'],
        marking_scheme: '1 mark correct, 1/3 negative.', important_notice: 'Must be physically fit.',
      };
    } else if (lower.includes('ssc') || lower.includes('chsl') || lower.includes('cgl')) {
      data = {
        notification_title: 'SSC CGL Examination 2026',
        advertisement_number: 'F.No.3/1/2026-P&P-I',
        department: 'Department of Personnel & Training', organization: 'Staff Selection Commission',
        sector: 'ssc', total_vacancies: 14582,
        education_level: 'graduate', age_min: 18, age_max: 32,
        salary_min: 25500, salary_max: 151100,
        application_fee_general: 100, application_fee_sc_st: 0,
        important_dates: { notification_date: '2026-03-10', start_date: '2026-03-20', last_date: '2026-04-20', exam_date: '2026-07-15' },
        apply_link: 'https://ssc.nic.in', official_website: 'https://ssc.nic.in',
        locations: ['All India'], tags: ['ssc', 'cgl', 'graduate'],
        summary: 'SSC CGL for Group B & C posts in central government.',
        application_mode: 'Online',
        posts: [
          { post_name: 'Income Tax Inspector', vacancies_total: 4500, education_required: 'Graduate', age_limit: '18-30 years', salary: '\u20b944,900 - \u20b91,42,400' },
          { post_name: 'Tax Assistant', vacancies_total: 6000, education_required: 'Graduate', age_limit: '18-27 years', salary: '\u20b925,500 - \u20b981,100' },
          { post_name: 'Upper Division Clerk', vacancies_total: 4082, education_required: 'Graduate', age_limit: '18-27 years', salary: '\u20b925,500 - \u20b981,100' },
        ],
        vacancy_breakdown: [
          { post_name: 'Income Tax Inspector', ur: 1800, obc: 1215, sc: 675, st: 360, ews: 450, total: 4500 },
          { post_name: 'Tax Assistant', ur: 2400, obc: 1620, sc: 900, st: 480, ews: 600, total: 6000 },
          { post_name: 'Upper Division Clerk', ur: 1633, obc: 1102, sc: 612, st: 327, ews: 408, total: 4082 },
        ],
        selection_process: [
          { stage: 1, name: 'Tier I (CBT)', description: 'MCQ exam. 60 minutes.', is_eliminatory: true },
          { stage: 2, name: 'Tier II (CBT)', description: 'Detailed exam + descriptive.', is_eliminatory: true },
          { stage: 3, name: 'Document Verification', description: 'Originals at designated center.', is_eliminatory: false },
        ],
        how_to_apply: ['Visit ssc.nic.in', 'Register on One-Time Registration', 'Fill form and upload docs', 'Pay fee and submit'],
        exam_pattern: [
          { section: 'GI & Reasoning', questions: 25, marks: 50, duration_minutes: 15 },
          { section: 'General Awareness', questions: 25, marks: 50, duration_minutes: 15 },
          { section: 'Quantitative Aptitude', questions: 25, marks: 50, duration_minutes: 15 },
          { section: 'English', questions: 25, marks: 50, duration_minutes: 15 },
        ],
        documents_required: ['Graduation Certificate', 'Photo ID', 'Category Certificate'],
        marking_scheme: '2 marks correct, 0.50 negative.', important_notice: 'Correction window after last date.',
      };
    } else {
      data = {
        notification_title: 'Government Recruitment 2026',
        advertisement_number: 'ADVT/2026/01',
        department: 'Ministry of Home Affairs', organization: 'Central Government',
        sector: 'other', total_vacancies: 500,
        education_level: 'graduate', age_min: 21, age_max: 35,
        salary_min: 25500, salary_max: 81100,
        application_fee_general: 200, application_fee_sc_st: 0,
        important_dates: { notification_date: '2026-03-01', start_date: '2026-03-15', last_date: '2026-04-15', exam_date: '2026-07-01' },
        apply_link: 'https://www.india.gov.in', official_website: 'https://www.india.gov.in',
        locations: ['All India'], tags: ['government', 'recruitment'],
        summary: 'Central Government invites applications for various posts.',
        application_mode: 'Online',
        posts: [
          { post_name: 'Assistant', vacancies_total: 300, education_required: 'Graduate', age_limit: '21-35 years', salary: '\u20b925,500 - \u20b981,100' },
          { post_name: 'Upper Division Clerk', vacancies_total: 200, education_required: 'Graduate', age_limit: '18-32 years', salary: '\u20b925,500 - \u20b981,100' },
        ],
        vacancy_breakdown: [
          { post_name: 'Assistant', ur: 120, obc: 81, sc: 45, st: 24, ews: 30, total: 300 },
          { post_name: 'UDC', ur: 80, obc: 54, sc: 30, st: 16, ews: 20, total: 200 },
        ],
        selection_process: [
          { stage: 1, name: 'Written Exam', description: 'MCQ exam.', is_eliminatory: true },
          { stage: 2, name: 'Interview', description: 'Personal interview.', is_eliminatory: true },
        ],
        how_to_apply: ['Visit official website', 'Register and fill form', 'Upload documents', 'Pay fee and submit'],
        exam_pattern: [
          { section: 'General Knowledge', questions: 50, marks: 50, duration_minutes: 30 },
          { section: 'English', questions: 50, marks: 50, duration_minutes: 30 },
          { section: 'Reasoning', questions: 50, marks: 50, duration_minutes: 30 },
        ],
        documents_required: ['Graduation Certificate', 'Photo ID'],
        marking_scheme: '1 mark correct, no negative.', important_notice: null,
      };
    }

    // Add standard fields
    data.id = 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
    data.slug = slugify(data.notification_title);
    data.status = 'draft';
    data.featured = false;
    data.created_at = new Date().toISOString();
    data.pdf_url = '/uploads/' + filename;
    data.syllabus_topics = null;
    return data;
  }

  // ═══════════════════════════════════════════
  //  STEP 2: REVIEW
  // ═══════════════════════════════════════════
  function renderReview() {
    if (!parsedData) return;
    var d = parsedData;

    // Quick summary
    var summary = $('quick-summary');
    summary.innerHTML =
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Title</span><span class="font-medium text-right max-w-[60%] truncate">' + esc(d.notification_title) + '</span></div>' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Department</span><span class="font-medium text-right max-w-[60%] truncate">' + esc(d.department) + '</span></div>' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Vacancies</span><span class="font-bold text-brand-primary dark:text-blue-400">' + d.total_vacancies.toLocaleString() + '</span></div>' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Last Date</span><span class="font-medium">' + esc(d.important_dates.last_date) + '</span></div>' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Salary Range</span><span class="font-medium">\u20b9' + d.salary_min.toLocaleString() + ' - \u20b9' + d.salary_max.toLocaleString() + '</span></div>' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Education</span><span class="font-medium">' + esc(d.education_level) + '</span></div>';

    // JSON output
    $('json-output').textContent = JSON.stringify(d, null, 2);

    // Accordion sections
    var accordion = $('review-accordion');
    accordion.innerHTML = '';
    var sections = [
      { title: 'Basic Info', content: renderBasicInfo(d) },
      { title: 'Posts Breakdown', content: renderPostsTable(d) },
      { title: 'Important Dates', content: renderDatesReview(d) },
      { title: 'Application Details', content: renderAppDetails(d) },
      { title: 'Selection Process', content: renderSelectionReview(d) },
      { title: 'Exam Pattern', content: renderExamReview(d) },
    ];

    sections.forEach(function (sec, i) {
      var isOpen = i === 0;
      var div = document.createElement('div');
      div.className = 'bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden';
      div.innerHTML =
        '<button type="button" class="acc-toggle w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-content-primary dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none">' +
        '<span>' + esc(sec.title) + '</span>' +
        '<svg class="acc-chevron w-4 h-4 transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '') + '" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>' +
        '</button>' +
        '<div class="acc-body border-t border-gray-200 dark:border-gray-800 px-4 py-3 text-sm ' + (isOpen ? '' : 'hidden') + '">' + sec.content + '</div>';
      accordion.appendChild(div);

      div.querySelector('.acc-toggle').addEventListener('click', function () {
        var body = div.querySelector('.acc-body');
        var chev = div.querySelector('.acc-chevron');
        body.classList.toggle('hidden');
        chev.classList.toggle('rotate-180');
      });
    });
  }

  function renderBasicInfo(d) {
    var rows = [
      ['Title', d.notification_title],
      ['Advt. No.', d.advertisement_number],
      ['Department', d.department],
      ['Organization', d.organization],
      ['Sector', d.sector],
      ['Vacancies', d.total_vacancies],
      ['Education', d.education_level],
      ['Status', d.status],
    ];
    return '<div class="space-y-2">' + rows.map(function (r) {
      return '<div class="flex items-center justify-between gap-2"><span class="text-content-secondary dark:text-content-dark-muted">' + esc(r[0]) + '</span><span class="flex items-center gap-2"><span class="font-medium">' + esc(String(r[1])) + '</span>' + confidenceBadge() + '</span></div>';
    }).join('') + '</div>';
  }

  function renderPostsTable(d) {
    if (!d.vacancy_breakdown || d.vacancy_breakdown.length === 0) return '<p class="text-content-secondary">No posts data.</p>';
    var html = '<div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-left border-b border-gray-200 dark:border-gray-700">' +
      '<th class="pb-2 pr-2 font-medium">Post</th><th class="pb-2 px-2 text-right">UR</th><th class="pb-2 px-2 text-right">OBC</th><th class="pb-2 px-2 text-right">SC</th><th class="pb-2 px-2 text-right">ST</th><th class="pb-2 px-2 text-right">EWS</th><th class="pb-2 pl-2 text-right font-bold">Total</th><th class="pb-2 pl-2"></th></tr></thead><tbody>';
    d.vacancy_breakdown.forEach(function (row) {
      html += '<tr class="border-b border-gray-100 dark:border-gray-800"><td class="py-1.5 pr-2">' + esc(row.post_name) + '</td><td class="py-1.5 px-2 text-right">' + row.ur + '</td><td class="py-1.5 px-2 text-right">' + row.obc + '</td><td class="py-1.5 px-2 text-right">' + row.sc + '</td><td class="py-1.5 px-2 text-right">' + row.st + '</td><td class="py-1.5 px-2 text-right">' + row.ews + '</td><td class="py-1.5 pl-2 text-right font-bold">' + row.total + '</td><td class="py-1.5 pl-2">' + confidenceBadge() + '</td></tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function renderDatesReview(d) {
    var dates = d.important_dates;
    var items = [
      ['Notification', dates.notification_date],
      ['Start Date', dates.start_date],
      ['Last Date', dates.last_date],
      ['Exam Date', dates.exam_date || 'TBD'],
    ];
    return '<div class="space-y-2">' + items.map(function (it) {
      return '<div class="flex items-center justify-between gap-2"><span class="text-content-secondary dark:text-content-dark-muted">' + esc(it[0]) + '</span><span class="flex items-center gap-2"><span class="font-medium">' + esc(it[1]) + '</span>' + confidenceBadge() + '</span></div>';
    }).join('') + '</div>';
  }

  function renderAppDetails(d) {
    return '<div class="space-y-2">' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Fee (Gen/OBC)</span><span class="font-medium">\u20b9' + d.application_fee_general + ' ' + confidenceBadge() + '</span></div>' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Fee (SC/ST)</span><span class="font-medium">' + (d.application_fee_sc_st === 0 ? 'Free' : '\u20b9' + d.application_fee_sc_st) + ' ' + confidenceBadge() + '</span></div>' +
      '<div class="flex justify-between"><span class="text-content-secondary dark:text-content-dark-muted">Mode</span><span class="font-medium">' + esc(d.application_mode) + '</span></div>' +
      '<div class="mt-3"><p class="text-content-secondary dark:text-content-dark-muted mb-1">How to Apply:</p><ol class="list-decimal list-inside space-y-1 text-content-primary dark:text-white">' +
      d.how_to_apply.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
      '</ol></div></div>';
  }

  function renderSelectionReview(d) {
    if (!d.selection_process || d.selection_process.length === 0) return '<p class="text-content-secondary">No data.</p>';
    return '<div class="space-y-2">' + d.selection_process.map(function (s) {
      return '<div class="flex items-start gap-2"><span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">' + s.stage + '</span><div><p class="font-medium">' + esc(s.name) + (s.is_eliminatory ? ' <span class="text-red-500 text-[10px]">(Eliminatory)</span>' : '') + '</p><p class="text-xs text-content-secondary dark:text-content-dark-muted">' + esc(s.description) + '</p></div></div>';
    }).join('') + '</div>';
  }

  function renderExamReview(d) {
    if (!d.exam_pattern || d.exam_pattern.length === 0) return '<p class="text-content-secondary">No exam pattern data.</p>';
    var html = '<table class="w-full text-xs"><thead><tr class="border-b border-gray-200 dark:border-gray-700 text-left"><th class="pb-2 pr-2">Section</th><th class="pb-2 px-2 text-right">Qs</th><th class="pb-2 px-2 text-right">Marks</th><th class="pb-2 pl-2 text-right">Duration</th></tr></thead><tbody>';
    d.exam_pattern.forEach(function (s) {
      html += '<tr class="border-b border-gray-100 dark:border-gray-800"><td class="py-1.5 pr-2">' + esc(s.section) + '</td><td class="py-1.5 px-2 text-right">' + s.questions + '</td><td class="py-1.5 px-2 text-right">' + s.marks + '</td><td class="py-1.5 pl-2 text-right">' + (s.duration_minutes ? s.duration_minutes + ' min' : '-') + '</td></tr>';
    });
    return html + '</tbody></table>';
  }

  // Review action buttons
  $('edit-before-publish-btn').addEventListener('click', function () {
    setStep(3);
    populateForm();
  });

  $('publish-now-btn').addEventListener('click', function () {
    if (!parsedData) return;
    parsedData.status = 'published';
    saveJob(parsedData);
    showToast('Job published successfully!', 'success');
    showConfetti();
    setTimeout(function () { window.location.href = '/admin/jobs'; }, 2000);
  });

  // JSON toggle
  $('json-toggle-btn').addEventListener('click', function () {
    $('json-panel').classList.toggle('hidden');
    $('json-chevron').classList.toggle('rotate-180');
  });

  $('copy-json-btn').addEventListener('click', function () {
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2)).then(function () {
      showToast('JSON copied to clipboard!', 'success');
    });
  });

  // ═══════════════════════════════════════════
  //  STEP 3: EDIT FORM
  // ═══════════════════════════════════════════
  var inputCls = 'w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors';
  var smallBtnCls = 'p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none';

  function populateForm() {
    if (!parsedData) return;
    var d = parsedData;

    // Basic fields
    $('f-title').value = d.notification_title || '';
    $('f-slug').value = d.slug || '';
    $('f-advt').value = d.advertisement_number || '';
    $('f-dept').value = d.department || '';
    $('f-org').value = d.organization || '';
    $('f-sector').value = d.sector || 'other';
    $('f-status').value = d.status || 'draft';
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
    });

    // Render dynamic sections
    renderDatesForm(d);
    renderPostsForm(d);
    renderStagesForm(d);
    renderStepsForm(d);
    renderExamForm(d);
  }

  // ── Dates ──
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
      addDateRow(container, dl.label, d.important_dates[dl.key] || '');
    });
  }

  function addDateRow(container, label, value) {
    var row = document.createElement('div');
    row.className = 'flex flex-col sm:flex-row items-start sm:items-center gap-2';
    row.innerHTML =
      '<input type="text" class="' + inputCls + ' sm:w-40" placeholder="Label" value="' + esc(label) + '" />' +
      '<input type="date" class="' + inputCls + ' sm:flex-1" value="' + esc(value || '') + '" />' +
      '<button type="button" class="' + smallBtnCls + '" aria-label="Remove date"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>';
    row.querySelector('button').addEventListener('click', function () { row.remove(); });
    container.appendChild(row);
  }

  $('add-date-btn').addEventListener('click', function () {
    addDateRow($('dates-container'), '', '');
  });

  // ── Posts ──
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
        });
      }
    });

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
    });

    // Delete
    card.querySelector('.del-post-btn').addEventListener('click', function () {
      if (container.children.length <= 1) { showToast('Must have at least one post.', 'error'); return; }
      card.remove();
    });

    container.appendChild(card);
  }

  $('add-post-btn').addEventListener('click', function () {
    addPostCard($('posts-container'));
  });

  // ── Selection Process ──
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
    row.querySelector('button:last-child').addEventListener('click', function () { row.remove(); });
    container.appendChild(row);
  }

  $('add-stage-btn').addEventListener('click', function () { addStageRow($('stages-container')); });

  // ── How to Apply ──
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
    row.querySelector('button').addEventListener('click', function () { row.remove(); renumberSteps(); });
    container.appendChild(row);
  }

  function renumberSteps() {
    $('steps-container').querySelectorAll(':scope > div').forEach(function (row, i) {
      var num = row.querySelector('span');
      if (num) num.textContent = i + 1;
    });
  }

  $('add-step-btn').addEventListener('click', function () { addStepRow($('steps-container')); });

  // ── Exam Pattern ──
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
    row.querySelector('button').addEventListener('click', function () { row.remove(); });
    container.appendChild(row);
  }

  $('add-exam-btn').addEventListener('click', function () { addExamRow($('exam-container')); });

  // ═══════════════════════════════════════════
  //  FORM ACTIONS
  // ═══════════════════════════════════════════
  function collectFormData() {
    var d = JSON.parse(JSON.stringify(parsedData || {}));
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

  function saveJob(data) {
    var jobs = [];
    try { jobs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) {}
    if (!Array.isArray(jobs)) jobs = [];
    jobs.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }

  // Save draft
  $('save-draft-btn').addEventListener('click', function () {
    var data = collectFormData();
    data.status = 'draft';
    saveJob(data);
    showToast('Saved as draft!', 'success');
  });

  // Preview
  $('preview-btn').addEventListener('click', function () {
    var data = collectFormData();
    var previewUrl = '/jobs/' + (data.slug || 'preview');
    showToast('Preview opens for published jobs. Data saved as draft.', 'info');
    data.status = 'draft';
    saveJob(data);
  });

  // Publish
  $('publish-btn').addEventListener('click', function () {
    var data = collectFormData();
    // Validate
    if (!data.notification_title.trim()) { showToast('Title is required.', 'error'); $('f-title').focus(); return; }
    if (!data.department.trim()) { showToast('Department is required.', 'error'); $('f-dept').focus(); return; }
    if (data.posts.length === 0) { showToast('At least one post is required.', 'error'); return; }

    data.status = 'published';
    saveJob(data);
    showToast('Job published successfully!', 'success');
    showConfetti();
    setTimeout(function () { window.location.href = '/admin/jobs'; }, 2000);
  });

  // Auto-save every 30s
  setInterval(function () {
    if (currentStep === 3 && parsedData) {
      try {
        var data = collectFormData();
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        var indicator = $('autosave-indicator');
        indicator.textContent = 'Auto-saved at ' + new Date().toLocaleTimeString();
        setTimeout(function () { indicator.textContent = ''; }, 3000);
      } catch (e) {}
    }
  }, 30000);

  // ═══════════════════════════════════════════
  //  TOAST (use global admin toast)
  // ═══════════════════════════════════════════
  function showToast(message, type) {
    if (window.showAdminToast) { window.showAdminToast(message, type); return; }
    // Fallback
    var toast = $('toast');
    if (!toast) return;
    var inner = $('toast-inner');
    var text = $('toast-text');
    if (text) text.textContent = message;
    var colors = {
      success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    };
    if (inner) inner.className = 'flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium ' + (colors[type] || colors.info);
    toast.classList.remove('hidden');
    setTimeout(function () { toast.classList.add('hidden'); }, 3000);
  }

  // ═══════════════════════════════════════════
  //  CONFETTI
  // ═══════════════════════════════════════════
  function showConfetti() {
    var container = $('confetti-container');
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
        'animation:confetti-fall ' + (1.5 + Math.random() * 2) + 's ease-out ' + (Math.random() * 0.5) + 's forwards;' +
        'opacity:0.9;';
      container.appendChild(piece);
    }

    setTimeout(function () { container.classList.add('hidden'); container.innerHTML = ''; }, 4000);
  }

  // Add confetti keyframes
  var style = document.createElement('style');
  style.textContent =
    '@keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(' + (360 + Math.random() * 360) + 'deg); opacity: 0; } }' +
    '@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }';
  document.head.appendChild(style);

  // Initialize step 1
  setStep(1);

})();
