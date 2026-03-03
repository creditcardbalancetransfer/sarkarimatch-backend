/**
 * SarkariMatch — Profile Wizard Controller
 * Pure client-side, ALL data in localStorage only, zero API calls.
 */
(function () {
  'use strict';

  var PROFILE_KEY = 'sarkarimatch_profile';
  var overlay = document.getElementById('profile-wizard-overlay');
  if (!overlay) return;

  var card = document.getElementById('pw-card');
  var backdrop = document.getElementById('pw-backdrop');
  var closeBtn = document.getElementById('pw-close');
  var backBtn = document.getElementById('pw-back');
  var nextBtn = document.getElementById('pw-next');
  var saveBtn = document.getElementById('pw-save');
  var heading = document.getElementById('pw-heading');
  var subtext = document.getElementById('pw-subtext');
  var editBanner = document.getElementById('pw-editing-banner');
  var toast = document.getElementById('pw-toast');
  var toastText = document.getElementById('pw-toast-text');
  var toastClose = document.getElementById('pw-toast-close');
  var progressFill = document.getElementById('pw-progress-fill');

  var steps = document.querySelectorAll('.pw-step');
  var dots = document.querySelectorAll('.pw-dot');
  var currentStep = 0;
  var isEditing = false;

  var headings = [
    'When were you born?',
    'What is your highest qualification?',
    'What is your category?',
    'What kind of jobs interest you?',
    'Review Your Profile'
  ];
  var subtexts = [
    "We calculate your age on each job's last date to check eligibility",
    'This determines which jobs you can apply for',
    'This determines age relaxation and reservation seats',
    'Select sectors and location preferences',
    'Make sure everything looks right'
  ];

  // ─── STATE ──────────────────────────────────────────────
  var state = {
    dob_day: '', dob_month: '', dob_year: '',
    gender: '',
    education_level: '',
    degree: '', branch: '', trade: '', percentage: '',
    category: '',
    is_pwd: false, pwd_type: '',
    is_ex_serviceman: false, ex_service_years: '',
    is_central_govt_employee: false,
    preferred_sectors: [],
    preferred_state: 'all_india', preferred_state_label: 'All India'
  };

  // ─── HELPERS ────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  function calcAge(day, month, year) {
    var today = new Date(2026, 2, 2); // 2026-03-02
    var birth = new Date(year, month - 1, day);
    var years = today.getFullYear() - birth.getFullYear();
    var months = today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    return { years: years, months: months };
  }

  function formatDOB(d, m, y) {
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return d + ' ' + months[m - 1] + ' ' + y;
  }

  var eduLabels = { '10th': '10th Pass', '12th': '12th Pass', 'iti': 'ITI', 'diploma': 'Diploma', 'graduate': 'Graduate', 'pg': 'Post Graduate' };
  var sectorLabels = { banking: 'Banking', railway: 'Railway', ssc: 'SSC', upsc: 'UPSC', defence: 'Defence', teaching: 'Teaching', state_psc: 'State PSC', police: 'Police', psu: 'PSU', other: 'Other' };

  function getRelaxation() {
    var base = 0;
    var cat = state.category;
    if (cat === 'OBC') base = 3;
    else if (cat === 'SC' || cat === 'ST') base = 5;
    var pwd = state.is_pwd ? 10 : 0;
    var exsm = state.is_ex_serviceman ? 5 : 0;
    var cge = state.is_central_govt_employee ? 5 : 0;
    var total = base + pwd + exsm + cge;
    return { base: base, pwd: pwd, exsm: exsm, cge: cge, total: total, catLabel: cat || 'None' };
  }

  // ─── MODAL OPEN / CLOSE ─────────────────────────────────
  function openWizard() {
    // Load existing profile
    var existing = null;
    try { existing = JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch (e) {}
    if (existing && existing.dob) {
      loadProfile(existing);
      isEditing = true;
      editBanner.classList.remove('hidden');
      $('pw-save-text').textContent = 'Update My Profile';
    } else {
      isEditing = false;
      editBanner.classList.add('hidden');
      $('pw-save-text').textContent = 'Save My Profile';
    }

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    goToStep(0);

    // Focus first input after animation
    setTimeout(function () {
      var first = steps[0].querySelector('select, input, button');
      if (first) first.focus();
    }, 200);
  }

  function closeWizard() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Triggers
  document.querySelectorAll('[data-open-wizard]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // Close mobile menu if open
      var menu = document.getElementById('mobile-menu');
      if (menu && menu.classList.contains('open')) {
        document.getElementById('mobile-menu-close').click();
      }
      openWizard();
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', closeWizard);
  if (backdrop) backdrop.addEventListener('click', closeWizard);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeWizard();
  });

  // ─── FOCUS TRAP ─────────────────────────────────────────
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = card.querySelectorAll('button:not([disabled]):not(.hidden), select:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])');
    var arr = Array.from(focusable).filter(function (el) { return el.offsetParent !== null; });
    if (arr.length === 0) return;
    var first = arr[0];
    var last = arr[arr.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ─── STEP NAVIGATION ───────────────────────────────────
  function goToStep(n) {
    var prev = currentStep;
    currentStep = n;

    steps.forEach(function (s, i) {
      s.classList.toggle('hidden', i !== n);
      if (i === n) {
        s.classList.remove('pw-slide-left', 'pw-slide-right');
        s.classList.add(n > prev ? 'pw-slide-right' : 'pw-slide-left');
        // Remove animation class after it plays
        setTimeout(function () { s.classList.remove('pw-slide-left', 'pw-slide-right'); }, 350);
      }
    });

    // Update heading/subtext
    heading.textContent = headings[n];
    subtext.textContent = subtexts[n];

    // Update buttons
    backBtn.classList.toggle('hidden', n === 0);
    nextBtn.classList.toggle('hidden', n === 4);
    saveBtn.classList.toggle('hidden', n !== 4);

    // Update progress dots
    dots.forEach(function (dot, i) {
      var num = dot.querySelector('.pw-dot-num');
      var check = dot.querySelector('.pw-dot-check');
      dot.className = 'pw-dot w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300';
      if (i < n) {
        // Completed
        dot.className += ' border-brand-success bg-brand-success text-white';
        num.classList.add('hidden');
        check.classList.remove('hidden');
      } else if (i === n) {
        // Current
        dot.className += ' border-brand-secondary bg-brand-secondary text-white';
        num.classList.remove('hidden');
        check.classList.add('hidden');
      } else {
        // Future
        dot.className += ' border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-card-dark text-gray-400 dark:text-gray-500';
        num.classList.remove('hidden');
        check.classList.add('hidden');
      }
    });

    // Progress fill line
    var pct = n === 0 ? 0 : (n / 4) * 80;
    progressFill.style.width = pct + '%';

    // Populate review if step 5
    if (n === 4) populateReview();

    // Focus first input
    setTimeout(function () {
      var step = steps[n];
      var first = step.querySelector('select:not([disabled]), input:not([disabled]):not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), button.pw-edu-card, button.pw-cat-card');
      if (first && first.focus) first.focus();
    }, 100);
  }

  if (backBtn) backBtn.addEventListener('click', function () { goToStep(currentStep - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    if (validateStep(currentStep)) goToStep(currentStep + 1);
  });

  // Edit links in review
  document.querySelectorAll('.pw-edit-link').forEach(function (link) {
    link.addEventListener('click', function () {
      var step = parseInt(link.getAttribute('data-goto'));
      goToStep(step);
    });
  });

  // ─── VALIDATION ─────────────────────────────────────────
  function validateStep(n) {
    if (n === 0) return validateAge();
    if (n === 1) return validateEducation();
    if (n === 2) return validateCategory();
    if (n === 3) return validatePreferences();
    return true;
  }

  function validateAge() {
    readAgeState();
    var err = $('pw-dob-error');
    if (!state.dob_day || !state.dob_month || !state.dob_year) {
      err.textContent = 'Please select your date of birth';
      err.classList.remove('hidden');
      return false;
    }
    var age = calcAge(+state.dob_day, +state.dob_month, +state.dob_year);
    if (age.years < 14 || age.years > 65) {
      err.textContent = 'Age must be between 14 and 65 years';
      err.classList.remove('hidden');
      return false;
    }
    if (!state.gender) {
      err.textContent = 'Please select your gender';
      err.classList.remove('hidden');
      return false;
    }
    err.classList.add('hidden');
    return true;
  }

  function validateEducation() {
    if (!state.education_level) {
      alert('Please select your highest qualification');
      return false;
    }
    if ((state.education_level === 'graduate' || state.education_level === 'pg') && !state.degree) {
      alert('Please select your degree');
      return false;
    }
    return true;
  }

  function validateCategory() {
    if (!state.category) {
      alert('Please select your category');
      return false;
    }
    return true;
  }

  function validatePreferences() {
    readPreferencesState();
    var hint = $('pw-sector-hint');
    if (state.preferred_sectors.length === 0) {
      hint.classList.remove('hidden');
      return false;
    }
    hint.classList.add('hidden');
    return true;
  }

  // ─── READ STATE FROM INPUTS ─────────────────────────────
  function readAgeState() {
    state.dob_day = $('pw-dob-day').value;
    state.dob_month = $('pw-dob-month').value;
    state.dob_year = $('pw-dob-year').value;
    var checked = document.querySelector('input[name="pw-gender"]:checked');
    state.gender = checked ? checked.value : '';
  }

  function readEducationState() {
    state.degree = $('pw-degree').value;
    state.branch = $('pw-branch').value;
    state.trade = $('pw-trade').value;
    state.percentage = $('pw-percentage').value;
  }

  function readCategoryState() {
    state.is_pwd = $('pw-pwd').checked;
    state.pwd_type = state.is_pwd ? $('pw-pwd-type').value : '';
    state.is_ex_serviceman = $('pw-exsm').checked;
    state.ex_service_years = state.is_ex_serviceman ? $('pw-exsm-years').value : '';
    state.is_central_govt_employee = $('pw-cge').checked;
  }

  function readPreferencesState() {
    state.preferred_sectors = [];
    document.querySelectorAll('.pw-sector-pill.selected').forEach(function (pill) {
      state.preferred_sectors.push(pill.getAttribute('data-value'));
    });
  }

  // ─── STEP 1: AGE — Live age calculation ─────────────────
  var dobDay = $('pw-dob-day');
  var dobMonth = $('pw-dob-month');
  var dobYear = $('pw-dob-year');
  var ageDisplay = $('pw-age-display');
  var ageText = $('pw-age-text');

  function updateAgeCalc() {
    var d = +dobDay.value, m = +dobMonth.value, y = +dobYear.value;
    if (d && m && y) {
      var age = calcAge(d, m, y);
      ageText.textContent = age.years + ' years ' + age.months + ' months old';
      ageDisplay.classList.remove('hidden');
    } else {
      ageDisplay.classList.add('hidden');
    }
  }

  [dobDay, dobMonth, dobYear].forEach(function (el) {
    el.addEventListener('change', updateAgeCalc);
  });

  // Gender radio styling
  document.querySelectorAll('.pw-radio-card').forEach(function (label) {
    var input = label.querySelector('input[type="radio"]');
    input.addEventListener('change', function () {
      document.querySelectorAll('.pw-radio-card').forEach(function (l) {
        l.classList.remove('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20');
        l.querySelector('.pw-radio-dot').classList.remove('scale-100');
        l.querySelector('.pw-radio-dot').classList.add('scale-0');
      });
      label.classList.add('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20');
      label.querySelector('.pw-radio-dot').classList.remove('scale-0');
      label.querySelector('.pw-radio-dot').classList.add('scale-100');
      state.gender = input.value;
    });
  });

  // ─── STEP 2: EDUCATION ──────────────────────────────────
  var degreeSection = $('pw-degree-section');
  var branchSection = $('pw-branch-section');
  var tradeSection = $('pw-trade-section');
  var degreeSelect = $('pw-degree');

  document.querySelectorAll('.pw-edu-card').forEach(function (card) {
    card.addEventListener('click', function () {
      // Deselect all
      document.querySelectorAll('.pw-edu-card').forEach(function (c) {
        c.classList.remove('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20');
      });
      // Select this
      card.classList.add('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20');
      state.education_level = card.getAttribute('data-value');

      // Show/hide conditional fields
      var isGrad = state.education_level === 'graduate';
      var isPG = state.education_level === 'pg';
      var isDiplomaITI = state.education_level === 'diploma' || state.education_level === 'iti';

      degreeSection.classList.toggle('hidden', !isGrad && !isPG);
      branchSection.classList.toggle('hidden', !isGrad && !isPG);
      tradeSection.classList.toggle('hidden', !isDiplomaITI);

      // Toggle degree options based on grad/pg
      degreeSelect.querySelectorAll('.pw-degree-grad').forEach(function (o) { o.classList.toggle('hidden', !isGrad); });
      degreeSelect.querySelectorAll('.pw-degree-pg').forEach(function (o) { o.classList.toggle('hidden', !isPG); });
      if (!isGrad && !isPG) { degreeSelect.value = ''; state.degree = ''; }
      if (!isDiplomaITI) { $('pw-trade').value = ''; state.trade = ''; }
    });
  });

  degreeSelect.addEventListener('change', function () { state.degree = degreeSelect.value; });
  $('pw-branch').addEventListener('input', function () { state.branch = this.value; });
  $('pw-trade').addEventListener('input', function () { state.trade = this.value; });
  $('pw-percentage').addEventListener('input', function () { state.percentage = this.value; });

  // ─── STEP 3: CATEGORY ──────────────────────────────────
  document.querySelectorAll('.pw-cat-card').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.pw-cat-card').forEach(function (c) {
        c.classList.remove('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20');
      });
      card.classList.add('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20');
      state.category = card.getAttribute('data-value');
      updateRelaxation();
    });
  });

  // PwD checkbox
  $('pw-pwd').addEventListener('change', function () {
    state.is_pwd = this.checked;
    $('pw-pwd-type-section').classList.toggle('hidden', !this.checked);
    updateRelaxation();
  });
  $('pw-pwd-type').addEventListener('change', function () { state.pwd_type = this.value; });

  // Ex-serviceman checkbox
  $('pw-exsm').addEventListener('change', function () {
    state.is_ex_serviceman = this.checked;
    $('pw-exsm-years-section').classList.toggle('hidden', !this.checked);
    updateRelaxation();
  });
  $('pw-exsm-years').addEventListener('input', function () { state.ex_service_years = this.value; });

  // CGE checkbox
  $('pw-cge').addEventListener('change', function () {
    state.is_central_govt_employee = this.checked;
    updateRelaxation();
  });

  function updateRelaxation() {
    var r = getRelaxation();
    var box = $('pw-relaxation-content');
    if (!state.category) {
      box.innerHTML = '<p>Select your category to see age relaxation details.</p>';
      return;
    }
    var lines = [];
    if (r.base > 0) lines.push('Base relaxation (' + r.catLabel + '): <strong>+' + r.base + ' years</strong>');
    if (r.pwd > 0) lines.push('PwD additional: <strong>+' + r.pwd + ' years</strong>');
    if (r.exsm > 0) lines.push('Ex-Serviceman: <strong>+' + r.exsm + ' years</strong>');
    if (r.cge > 0) lines.push('Central Govt Employee: <strong>+' + r.cge + ' years</strong>');
    if (r.total === 0) {
      lines.push('No age relaxation for ' + r.catLabel + ' category');
    } else {
      lines.push('<span class="text-brand-success font-semibold">Total relaxation: +' + r.total + ' years</span>');
      lines.push('<span class="text-content-secondary dark:text-content-dark-muted text-xs">Effective max age for a 30-year limit job: <strong>' + (30 + r.total) + ' years</strong></span>');
    }
    box.innerHTML = lines.map(function (l) { return '<p>' + l + '</p>'; }).join('');
  }

  // ─── STEP 4: PREFERENCES ───────────────────────────────
  // Sector pills
  document.querySelectorAll('.pw-sector-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      var isSelected = pill.classList.contains('selected');
      if (isSelected) {
        pill.classList.remove('selected', 'bg-brand-primary', 'dark:bg-blue-600', 'text-white', 'border-brand-primary', 'dark:border-blue-600');
        pill.classList.add('border-gray-200', 'dark:border-gray-700', 'text-content-secondary', 'dark:text-content-dark-muted');
        pill.querySelector('.pw-sector-check').classList.add('hidden');
      } else {
        pill.classList.add('selected', 'bg-brand-primary', 'dark:bg-blue-600', 'text-white', 'border-brand-primary', 'dark:border-blue-600');
        pill.classList.remove('border-gray-200', 'dark:border-gray-700', 'text-content-secondary', 'dark:text-content-dark-muted');
        pill.querySelector('.pw-sector-check').classList.remove('hidden');
      }
      $('pw-sector-hint').classList.add('hidden');
    });
  });

  // Select All sectors
  $('pw-select-all-sectors').addEventListener('click', function () {
    document.querySelectorAll('.pw-sector-pill').forEach(function (pill) {
      if (!pill.classList.contains('selected')) pill.click();
    });
  });

  // Searchable state dropdown
  var stateSearch = $('pw-state-search');
  var stateDropdown = $('pw-state-dropdown');
  var stateOptions = document.querySelectorAll('.pw-state-option');
  var stateSelectedEl = $('pw-state-selected');
  var stateSelectedText = $('pw-state-selected-text');

  stateSearch.addEventListener('focus', function () { stateDropdown.classList.remove('hidden'); });
  stateSearch.addEventListener('input', function () {
    var q = stateSearch.value.toLowerCase();
    stateDropdown.classList.remove('hidden');
    stateOptions.forEach(function (opt) {
      var text = opt.textContent.toLowerCase();
      opt.classList.toggle('hidden', q && text.indexOf(q) === -1);
    });
  });

  stateOptions.forEach(function (opt) {
    opt.addEventListener('click', function () {
      var val = opt.getAttribute('data-value');
      var label = opt.textContent.trim().replace(' (show all locations)', '');
      state.preferred_state = val;
      state.preferred_state_label = label;
      stateSearch.value = label;
      stateDropdown.classList.add('hidden');
      stateSelectedText.textContent = label + ' selected';
      stateSelectedEl.classList.remove('hidden');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!stateSearch.contains(e.target) && !stateDropdown.contains(e.target)) {
      stateDropdown.classList.add('hidden');
    }
  });

  // ─── STEP 5: REVIEW ────────────────────────────────────
  function populateReview() {
    readAgeState();
    readEducationState();
    readCategoryState();
    readPreferencesState();

    // Personal
    if (state.dob_day && state.dob_month && state.dob_year) {
      $('pw-rev-dob').textContent = formatDOB(+state.dob_day, +state.dob_month, +state.dob_year);
      var age = calcAge(+state.dob_day, +state.dob_month, +state.dob_year);
      $('pw-rev-age').textContent = age.years + ' years, ' + age.months + ' months';
    }
    $('pw-rev-gender').textContent = state.gender ? state.gender.charAt(0).toUpperCase() + state.gender.slice(1) : '—';

    // Education
    $('pw-rev-edu').textContent = eduLabels[state.education_level] || '—';
    var showDegree = (state.education_level === 'graduate' || state.education_level === 'pg') && state.degree;
    $('pw-rev-degree-row').classList.toggle('hidden', !showDegree);
    $('pw-rev-degree').textContent = state.degree || '—';
    var showBranch = showDegree && state.branch;
    $('pw-rev-branch-row').classList.toggle('hidden', !showBranch);
    $('pw-rev-branch').textContent = state.branch || '—';
    var showTrade = (state.education_level === 'diploma' || state.education_level === 'iti') && state.trade;
    $('pw-rev-trade-row').classList.toggle('hidden', !showTrade);
    $('pw-rev-trade').textContent = state.trade || '—';
    var showPct = state.percentage;
    $('pw-rev-pct-row').classList.toggle('hidden', !showPct);
    $('pw-rev-pct').textContent = state.percentage ? state.percentage + '%' : '—';

    // Category
    $('pw-rev-cat').textContent = state.category || '—';
    $('pw-rev-pwd').textContent = state.is_pwd ? ('Yes — ' + (state.pwd_type || 'Not specified')) : 'No';
    $('pw-rev-exsm').textContent = state.is_ex_serviceman ? ('Yes — ' + (state.ex_service_years || '?') + ' years') : 'No';
    var r = getRelaxation();
    $('pw-rev-relax').textContent = r.total > 0 ? '+' + r.total + ' years' : 'None';

    // Preferences
    var sectorNames = state.preferred_sectors.map(function (s) { return sectorLabels[s] || s; });
    $('pw-rev-sectors').textContent = sectorNames.length > 0 ? sectorNames.join(', ') : '—';
    $('pw-rev-state').textContent = state.preferred_state_label || 'All India';
  }

  // ─── SAVE ───────────────────────────────────────────────
  saveBtn.addEventListener('click', function () {
    readAgeState();
    readEducationState();
    readCategoryState();
    readPreferencesState();

    var age = calcAge(+state.dob_day, +state.dob_month, +state.dob_year);
    var now = new Date().toISOString();

    var profile = {
      dob: state.dob_year + '-' + String(state.dob_month).padStart(2, '0') + '-' + String(state.dob_day).padStart(2, '0'),
      age_years: age.years,
      age_months: age.months,
      gender: state.gender,
      education_level: state.education_level,
      degree: state.degree || null,
      branch: state.branch || null,
      trade: state.trade || null,
      percentage: state.percentage ? parseFloat(state.percentage) : null,
      category: state.category,
      is_pwd: state.is_pwd,
      pwd_type: state.is_pwd ? (state.pwd_type || null) : null,
      is_ex_serviceman: state.is_ex_serviceman,
      ex_service_years: state.is_ex_serviceman ? (parseInt(state.ex_service_years) || null) : null,
      is_central_govt_employee: state.is_central_govt_employee,
      preferred_sectors: state.preferred_sectors,
      preferred_state: state.preferred_state,
      profile_version: 1,
      created_at: isEditing ? (JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}').created_at || now) : now,
      updated_at: now
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    closeWizard();
    showToast('Profile saved! Your job matches will update now.');
    window.dispatchEvent(new Event('profile-updated'));
  });

  // ─── CLEAR PROFILE ──────────────────────────────────────
  $('pw-clear-profile').addEventListener('click', function () {
    if (confirm('This will clear your saved profile. Are you sure?')) {
      localStorage.removeItem(PROFILE_KEY);
      resetState();
      resetUI();
      isEditing = false;
      editBanner.classList.add('hidden');
      $('pw-save-text').textContent = 'Save My Profile';
      goToStep(0);
    }
  });

  function resetState() {
    state.dob_day = ''; state.dob_month = ''; state.dob_year = '';
    state.gender = '';
    state.education_level = '';
    state.degree = ''; state.branch = ''; state.trade = ''; state.percentage = '';
    state.category = '';
    state.is_pwd = false; state.pwd_type = '';
    state.is_ex_serviceman = false; state.ex_service_years = '';
    state.is_central_govt_employee = false;
    state.preferred_sectors = [];
    state.preferred_state = 'all_india'; state.preferred_state_label = 'All India';
  }

  function resetUI() {
    $('pw-dob-day').value = ''; $('pw-dob-month').value = ''; $('pw-dob-year').value = '';
    $('pw-age-display').classList.add('hidden');
    document.querySelectorAll('.pw-radio-card').forEach(function (l) {
      l.classList.remove('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20');
      l.querySelector('.pw-radio-dot').classList.remove('scale-100'); l.querySelector('.pw-radio-dot').classList.add('scale-0');
      l.querySelector('input').checked = false;
    });
    document.querySelectorAll('.pw-edu-card').forEach(function (c) { c.classList.remove('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20'); });
    $('pw-degree-section').classList.add('hidden'); $('pw-branch-section').classList.add('hidden'); $('pw-trade-section').classList.add('hidden');
    $('pw-degree').value = ''; $('pw-branch').value = ''; $('pw-trade').value = ''; $('pw-percentage').value = '';
    document.querySelectorAll('.pw-cat-card').forEach(function (c) { c.classList.remove('border-brand-secondary', 'bg-amber-50', 'dark:bg-amber-900/20'); });
    $('pw-pwd').checked = false; $('pw-pwd-type-section').classList.add('hidden'); $('pw-pwd-type').value = '';
    $('pw-exsm').checked = false; $('pw-exsm-years-section').classList.add('hidden'); $('pw-exsm-years').value = '';
    $('pw-cge').checked = false;
    updateRelaxation();
    document.querySelectorAll('.pw-sector-pill.selected').forEach(function (pill) { pill.click(); });
    stateSearch.value = ''; stateSelectedEl.classList.add('hidden');
  }

  // ─── LOAD EXISTING PROFILE ──────────────────────────────
  function loadProfile(p) {
    resetUI();
    // Parse DOB
    if (p.dob) {
      var parts = p.dob.split('-');
      state.dob_year = parts[0]; state.dob_month = String(parseInt(parts[1])); state.dob_day = String(parseInt(parts[2]));
      $('pw-dob-year').value = state.dob_year;
      $('pw-dob-month').value = state.dob_month;
      $('pw-dob-day').value = state.dob_day;
      updateAgeCalc();
    }
    // Gender
    if (p.gender) {
      state.gender = p.gender;
      var radio = document.querySelector('input[name="pw-gender"][value="' + p.gender + '"]');
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    // Education
    if (p.education_level) {
      state.education_level = p.education_level;
      var eduCard = document.querySelector('.pw-edu-card[data-value="' + p.education_level + '"]');
      if (eduCard) eduCard.click();
    }
    if (p.degree) { state.degree = p.degree; $('pw-degree').value = p.degree; }
    if (p.branch) { state.branch = p.branch; $('pw-branch').value = p.branch; }
    if (p.trade) { state.trade = p.trade; $('pw-trade').value = p.trade; }
    if (p.percentage) { state.percentage = String(p.percentage); $('pw-percentage').value = p.percentage; }
    // Category
    if (p.category) {
      state.category = p.category;
      var catCard = document.querySelector('.pw-cat-card[data-value="' + p.category + '"]');
      if (catCard) catCard.click();
    }
    if (p.is_pwd) { $('pw-pwd').checked = true; $('pw-pwd').dispatchEvent(new Event('change')); state.is_pwd = true; }
    if (p.pwd_type) { state.pwd_type = p.pwd_type; $('pw-pwd-type').value = p.pwd_type; }
    if (p.is_ex_serviceman) { $('pw-exsm').checked = true; $('pw-exsm').dispatchEvent(new Event('change')); state.is_ex_serviceman = true; }
    if (p.ex_service_years) { state.ex_service_years = String(p.ex_service_years); $('pw-exsm-years').value = p.ex_service_years; }
    if (p.is_central_govt_employee) { $('pw-cge').checked = true; $('pw-cge').dispatchEvent(new Event('change')); state.is_central_govt_employee = true; }
    updateRelaxation();
    // Sectors
    if (p.preferred_sectors && p.preferred_sectors.length) {
      p.preferred_sectors.forEach(function (sv) {
        var pill = document.querySelector('.pw-sector-pill[data-value="' + sv + '"]');
        if (pill && !pill.classList.contains('selected')) pill.click();
      });
    }
    // State
    if (p.preferred_state) {
      state.preferred_state = p.preferred_state;
      var opt = document.querySelector('.pw-state-option[data-value="' + p.preferred_state + '"]');
      if (opt) {
        var label = opt.textContent.trim().replace(' (show all locations)', '');
        state.preferred_state_label = label;
        stateSearch.value = label;
        stateSelectedText.textContent = label + ' selected';
        stateSelectedEl.classList.remove('hidden');
      }
    }
  }

  // ─── TOAST ──────────────────────────────────────────────
  var toastTimer;
  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('pw-toast-enter');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
  }
  function hideToast() {
    toast.classList.add('hidden');
    toast.classList.remove('pw-toast-enter');
  }
  if (toastClose) toastClose.addEventListener('click', hideToast);

})();
