/**
 * SarkariMatch — Jobs Page Client-Side Logic
 *
 * Handles:
 * - Profile reading from localStorage
 * - Eligibility engine (inline, no ES modules in browser)
 * - Filtering (sector, education, state, toggles, search)
 * - Sorting (best match, newest, closing soon, vacancies, salary)
 * - Pagination (12 jobs per page, "Load More")
 * - Mobile filter bottom sheet
 * - View toggle (grid/list)
 * - Profile summary bar
 * - Eligibility badges on job cards
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════
  //  CONSTANTS
  // ═══════════════════════════════════════════════════════

  var PROFILE_KEY = 'sarkarimatch_profile';
  var PAGE_SIZE = 12;
  var TODAY = '2026-03-03';

  // Education rank map
  var EDUCATION_RANKS = {
    '10th': 1, '12th': 2, 'iti': 2.5, 'diploma': 3,
    'graduate': 4, 'pg': 5, 'phd': 6
  };

  var CATEGORY_NORMALIZE = {
    'general': 'UR', 'ur': 'UR', 'obc': 'OBC',
    'sc': 'SC', 'st': 'ST', 'ews': 'EWS'
  };

  var EDUCATION_LABELS = {
    '10th': '10th Pass', '12th': '12th Pass', 'iti': 'ITI',
    'diploma': 'Diploma', 'graduate': 'Graduate', 'pg': 'Post Graduate', 'phd': 'PhD'
  };

  var DEGREE_ALIASES = {
    'b.tech/b.e': ['b.tech', 'be', 'b.e', 'b.e.', 'b.tech.', 'btech', 'bachelor of technology', 'bachelor of engineering'],
    'b.sc': ['bsc', 'b.sc.', 'bachelor of science'],
    'b.com': ['bcom', 'b.com.', 'b.commerce', 'bachelor of commerce'],
    'ba': ['b.a', 'b.a.', 'bachelor of arts'],
    'bba': ['b.b.a', 'b.b.a.', 'bachelor of business administration'],
    'bca': ['b.c.a', 'b.c.a.', 'bachelor of computer applications'],
    'llb': ['ll.b', 'll.b.', 'b.l', 'bachelor of law', 'bachelor of laws'],
    'b.ed': ['bed', 'b.ed.', 'bachelor of education'],
    'mbbs': ['m.b.b.s', 'm.b.b.s.', 'bachelor of medicine'],
    'm.tech/m.e': ['m.tech', 'me', 'm.e', 'm.e.', 'm.tech.', 'mtech', 'master of technology', 'master of engineering'],
    'm.sc': ['msc', 'm.sc.', 'master of science'],
    'm.com': ['mcom', 'm.com.', 'm.commerce', 'master of commerce'],
    'ma': ['m.a', 'm.a.', 'master of arts'],
    'mba': ['m.b.a', 'm.b.a.', 'master of business administration'],
    'mca': ['m.c.a', 'm.c.a.', 'master of computer applications']
  };

  // ═══════════════════════════════════════════════════════
  //  ELIGIBILITY ENGINE (browser-compatible)
  // ═══════════════════════════════════════════════════════

  function normalizeCategory(cat) {
    if (!cat) return 'UR';
    return CATEGORY_NORMALIZE[cat.toLowerCase().trim()] || cat.toUpperCase().trim();
  }

  function calculateAge(dob, refDate) {
    var bp = dob.split('-').map(Number);
    var rp = refDate.split('-').map(Number);
    var years = rp[0] - bp[0], months = rp[1] - bp[1], days = rp[2] - bp[2];
    if (days < 0) {
      months--;
      var pm = rp[1] - 1 === 0 ? 12 : rp[1] - 1;
      var py = pm === 12 ? rp[0] - 1 : rp[0];
      days += new Date(py, pm, 0).getDate();
    }
    if (months < 0) { years--; months += 12; }
    return { years: years, months: months, days: days };
  }

  function getAgeRelaxation(category, isPwd, isExSM, isCGE) {
    var cat = normalizeCategory(category);
    var base = 0;
    if (cat === 'OBC') base = 3;
    else if (cat === 'SC' || cat === 'ST') base = 5;
    var additional = 0;
    if (isPwd && isExSM) additional += 10;
    else if (isPwd) additional += 10;
    else if (isExSM) additional += 5;
    if (isCGE) additional += 5;
    return base + additional;
  }

  function getEducationRank(level) {
    return EDUCATION_RANKS[(level || '').toLowerCase().trim()] || 0;
  }

  function findCanonicalDegree(input) {
    var lower = (input || '').toLowerCase().trim();
    if (DEGREE_ALIASES[lower]) return lower;
    for (var key in DEGREE_ALIASES) {
      if (DEGREE_ALIASES[key].indexOf(lower) !== -1) return key;
    }
    return null;
  }

  function degreesMatch(userDeg, reqDeg) {
    var u = (userDeg || '').toLowerCase().trim();
    var r = (reqDeg || '').toLowerCase().trim();
    if (u === r) return true;
    var uc = findCanonicalDegree(u), rc = findCanonicalDegree(r);
    if (uc && rc && uc === rc) return true;
    var uParts = u.split('/').map(function(s){return s.trim();}).filter(Boolean);
    var rParts = r.split('/').map(function(s){return s.trim();}).filter(Boolean);
    for (var i = 0; i < uParts.length; i++) {
      var upc = findCanonicalDegree(uParts[i]);
      for (var j = 0; j < rParts.length; j++) {
        var rpc = findCanonicalDegree(rParts[j]);
        if (uParts[i] === rParts[j]) return true;
        if (upc && rpc && upc === rpc) return true;
        if (uParts[i].replace(/\.$/, '') === rParts[j].replace(/\.$/, '')) return true;
      }
    }
    if (u.indexOf(r) !== -1 || r.indexOf(u) !== -1) return true;
    return false;
  }

  function parseAgeFromPost(post, which) {
    var s = post.age_limit || '';
    if (!s) return null;
    var m = s.match(/(\d+(?:\.\d+)?)\s*[–\-—]\s*(\d+(?:\.\d+)?)/);
    if (m) return which === 'min' ? Math.floor(parseFloat(m[1])) : Math.ceil(parseFloat(m[2]));
    if (which === 'max') {
      var mx = s.match(/maximum\s+(\d+)/i);
      if (mx) return parseInt(mx[1], 10);
    }
    if (/no\s+(upper\s+)?age\s+limit/i.test(s)) return which === 'max' ? 99 : null;
    return null;
  }

  function inferEducationLevel(eduText, jobLevel) {
    if (!eduText) return jobLevel || 'graduate';
    var l = eduText.toLowerCase();
    if (/ph\.?d|doctorate/i.test(l)) return 'phd';
    if (/post[- ]?graduat|master|m\.tech|m\.sc|m\.com|m\.a\b|mba|mca|m\.ed|m\.e\b/i.test(l)) return 'pg';
    if (/graduat|b\.tech|b\.e\b|b\.sc|b\.com|b\.a\b|bba|bca|b\.ed|mbbs|b\.pharm|b\.arch|bachelor/i.test(l)) return 'graduate';
    if (/diploma/i.test(l)) return 'diploma';
    if (/iti|trade\s+certificate/i.test(l)) return 'iti';
    if (/12th|10\+2|intermediate|higher\s+secondary|hsc/i.test(l)) return '12th';
    if (/10th|class\s+10|sslc|matricul|secondary\b/i.test(l)) return '10th';
    return jobLevel || 'graduate';
  }

  function parseDegreeReq(eduText) {
    if (!eduText) return { degrees: null, subjects: null };
    if (/any\s+discipline|any\s+degree|any\s+stream|any\s+subject/i.test(eduText)) {
      return { degrees: null, subjects: null };
    }
    var degrees = [];
    var patterns = [/\bB\.?E\.?\/?B\.?Tech\b/i, /\bB\.?Tech\b/i, /\bB\.?E\b\.?/i,
      /\bB\.?Sc\b\.?/i, /\bB\.?Com\b\.?/i, /\bB\.?A\b\.?/i, /\bMBBS\b/i, /\bB\.?Pharm\b/i,
      /\bM\.?Tech\b/i, /\bM\.?Sc\b/i, /\bM\.?Com\b/i, /\bMBA\b/i, /\bMCA\b/i];
    for (var i = 0; i < patterns.length; i++) {
      var m = eduText.match(patterns[i]);
      if (m) degrees.push(m[0]);
    }
    var subjects = [];
    var sm = eduText.match(/\bin\s+(.+?)(?:\s+from|\s+with|\s*;|\s*\(|$)/i);
    if (sm) {
      var parts = sm[1].split(/[\/,&]/).map(function(s){return s.trim();}).filter(Boolean);
      for (var k = 0; k < parts.length; k++) {
        if (!/^(a|any|the|recognised|recognized|relevant)$/i.test(parts[k]) && parts[k].length > 2) {
          subjects.push(parts[k]);
        }
      }
    }
    return {
      degrees: degrees.length > 0 ? degrees : null,
      subjects: subjects.length > 0 ? subjects : null
    };
  }

  function evaluatePostForJob(profile, post, job) {
    var lastDate = (job.important_dates && job.important_dates.last_date) || '2026-03-03';
    var ageMin = parseAgeFromPost(post, 'min');
    if (ageMin === null) ageMin = job.age_min || 0;
    var ageMax = parseAgeFromPost(post, 'max');
    if (ageMax === null) ageMax = job.age_max || 0;
    var relax = getAgeRelaxation(profile.category, profile.is_pwd, profile.is_ex_serviceman, profile.is_central_govt_employee);

    // Age check
    var ageResult = 'pass';
    if (ageMin === 0 && ageMax === 0) {
      ageResult = 'pass';
    } else {
      var age = calculateAge(profile.dob, lastDate);
      var effMax = ageMax + relax;
      if (age.years < ageMin) ageResult = 'fail';
      else if (age.years > effMax) ageResult = 'fail';
    }

    // Education check
    var reqLevel = inferEducationLevel(post.education_required, job.education_level);
    var uRank = getEducationRank(profile.education_level);
    var rRank = getEducationRank(reqLevel);
    var eduResult = (uRank === 0 || rRank === 0) ? 'unknown' : (uRank >= rRank ? 'pass' : 'fail');

    // Degree check
    var degReq = parseDegreeReq(post.education_required);
    var degResult = 'not_required';
    if (degReq.degrees && degReq.degrees.length > 0) {
      if (!profile.degree) {
        degResult = 'unknown';
      } else {
        var matched = false;
        for (var i = 0; i < degReq.degrees.length; i++) {
          if (degreesMatch(profile.degree, degReq.degrees[i])) { matched = true; break; }
        }
        degResult = matched ? 'pass' : 'fail';
      }
    }

    // Percentage check
    var pctResult = 'not_required';
    if (post.education_required) {
      var pctMatch = post.education_required.match(/(\d+)\s*%/);
      if (pctMatch) {
        var reqPct = parseInt(pctMatch[1], 10);
        if (profile.percentage === null || profile.percentage === undefined) pctResult = 'unknown';
        else pctResult = profile.percentage >= reqPct ? 'pass' : 'fail';
      }
    }

    // Vacancy check — only total available, no category split
    var vacResult = (typeof post.vacancies_total === 'number') ?
      (post.vacancies_total === 0 ? 'pass' : 'unknown') : 'unknown';

    // Score
    var weights = { age: 30, education: 25, degree: 20, percentage: 10, category_vacancy: 15 };
    var checks = { age: ageResult, education: eduResult, degree: degResult, percentage: pctResult, category_vacancy: vacResult };
    var score = 0;
    for (var ck in checks) {
      var w = weights[ck] || 0;
      var r = checks[ck];
      if (r === 'pass' || r === 'not_required') score += w;
      else if (r === 'unknown') score += w * 0.5;
    }
    score = Math.round(score);
    var label = score >= 90 ? 'eligible' : (score >= 55 ? 'partial' : 'not_eligible');

    return { post_name: post.post_name, score: score, label: label };
  }

  function evaluateJobFull(profile, job) {
    var posts = (job.posts && job.posts.length > 0) ? job.posts : [{
      post_name: job.notification_title || 'Main Post',
      vacancies_total: job.total_vacancies || 0,
      education_required: job.education_level || '',
      age_limit: (job.age_min && job.age_max) ? job.age_min + '–' + job.age_max + ' years' : '',
      salary: 'As per rules'
    }];

    var results = [];
    for (var i = 0; i < posts.length; i++) {
      results.push(evaluatePostForJob(profile, posts[i], job));
    }
    results.sort(function(a, b) { return b.score - a.score; });

    var eligibleCount = 0, partialCount = 0;
    for (var j = 0; j < results.length; j++) {
      if (results[j].label === 'eligible') eligibleCount++;
      else if (results[j].label === 'partial') partialCount++;
    }

    var bestScore = results.length > 0 ? results[0].score : 0;
    var overallLabel = bestScore >= 90 ? 'eligible' : (bestScore >= 55 ? 'partial' : 'not_eligible');

    // Check sector & location match
    var sectorMatch = !profile.preferred_sectors || profile.preferred_sectors.length === 0 ||
      profile.preferred_sectors.indexOf(job.sector) !== -1;
    var locationMatch = checkLocationMatch(profile.preferred_state, job.locations);

    return {
      job_id: job.id,
      best_score: bestScore,
      overall_label: overallLabel,
      eligible_posts: eligibleCount,
      partial_posts: partialCount,
      total_posts: results.length,
      sector_match: sectorMatch,
      location_match: locationMatch,
      posts: results
    };
  }

  function checkLocationMatch(preferredState, jobLocations) {
    if (!preferredState || preferredState === 'all_india' || preferredState === '') return true;
    if (!jobLocations || jobLocations.length === 0) return true;
    for (var i = 0; i < jobLocations.length; i++) {
      if (/all\s+india/i.test(jobLocations[i])) return true;
    }
    var us = preferredState.toLowerCase().replace(/_/g, ' ');
    for (var j = 0; j < jobLocations.length; j++) {
      var ll = jobLocations[j].toLowerCase();
      if (ll.indexOf(us) !== -1 || us.indexOf(ll) !== -1) return true;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════
  //  PROFILE READING
  // ═══════════════════════════════════════════════════════

  function readProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  // ═══════════════════════════════════════════════════════
  //  STATE
  // ═══════════════════════════════════════════════════════

  var allCards = [];           // All job card DOM elements
  var eligibilityMap = {};     // job_id -> evaluation result
  var currentProfile = null;
  var visibleCount = 0;        // How many are currently showing
  var filteredCards = [];       // After filter, sorted list of cards

  // ═══════════════════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════════════════

  function init() {
    // Collect all job cards
    var grid = document.getElementById('jobs-grid');
    if (!grid) return;

    var cards = grid.querySelectorAll('.job-card');
    allCards = Array.prototype.slice.call(cards);

    // Read profile
    currentProfile = readProfile();
    updateProfileBar(currentProfile);

    // Run eligibility if profile exists
    if (currentProfile) {
      runEligibility(currentProfile);
    }

    // Apply initial filter + sort + paginate
    applyFiltersAndSort();

    // Attach event listeners
    attachFilterListeners();
    attachMobileFilterSheet();
    attachViewToggle();
    attachLoadMore();
    attachSearchSync();

    // Listen for profile updates
    window.addEventListener('profile-updated', function () {
      currentProfile = readProfile();
      updateProfileBar(currentProfile);
      if (currentProfile) {
        runEligibility(currentProfile);
      } else {
        clearEligibility();
      }
      applyFiltersAndSort();
    });

    window.addEventListener('sarkarimatch-profile-changed', function () {
      currentProfile = readProfile();
      updateProfileBar(currentProfile);
      if (currentProfile) {
        runEligibility(currentProfile);
      } else {
        clearEligibility();
      }
      applyFiltersAndSort();
    });

    // Init bookmarks for job cards
    initJobBookmarks();
  }

  // ═══════════════════════════════════════════════════════
  //  PROFILE BAR
  // ═══════════════════════════════════════════════════════

  function updateProfileBar(profile) {
    var noBanner = document.getElementById('no-profile-banner');
    var summaryBar = document.getElementById('profile-summary-bar');
    var summaryText = document.getElementById('profile-summary-text');
    var summaryDetails = document.getElementById('profile-summary-details');
    var eligibleLabel = document.getElementById('toggle-eligible-label');

    if (!profile) {
      if (noBanner) noBanner.classList.remove('hidden');
      if (summaryBar) summaryBar.classList.add('hidden');
      if (eligibleLabel) eligibleLabel.style.opacity = '0.4';
      return;
    }

    if (noBanner) noBanner.classList.add('hidden');
    if (summaryBar) summaryBar.classList.remove('hidden');
    if (eligibleLabel) eligibleLabel.style.opacity = '1';

    if (summaryText) {
      summaryText.textContent = 'Profile Active — Showing Eligibility';
    }
    if (summaryDetails) {
      var parts = [];
      if (profile.education_level) parts.push(EDUCATION_LABELS[profile.education_level] || profile.education_level);
      if (profile.category) parts.push(normalizeCategory(profile.category));
      if (profile.age_years) parts.push(profile.age_years + 'y');
      if (profile.preferred_sectors && profile.preferred_sectors.length > 0) {
        parts.push(profile.preferred_sectors.length + ' sector' + (profile.preferred_sectors.length > 1 ? 's' : ''));
      }
      summaryDetails.textContent = parts.join(' · ');
    }
  }

  // ═══════════════════════════════════════════════════════
  //  ELIGIBILITY
  // ═══════════════════════════════════════════════════════

  function runEligibility(profile) {
    eligibilityMap = {};
    for (var i = 0; i < allCards.length; i++) {
      var card = allCards[i];
      var jobId = card.getAttribute('data-job-id');
      if (!jobId) continue;

      // Build a minimal job object from data attributes + inline data
      var jobObj = buildJobFromCard(card);
      var result = evaluateJobFull(profile, jobObj);
      eligibilityMap[jobId] = result;

      // Render badge
      renderEligibilityBadge(card, result);
      // Render eligible posts bar
      renderEligiblePostsBar(card, result);
    }
  }

  function clearEligibility() {
    eligibilityMap = {};
    for (var i = 0; i < allCards.length; i++) {
      var badge = allCards[i].querySelector('[data-job-eligibility]');
      if (badge) { badge.classList.add('hidden'); badge.innerHTML = ''; }
      var bar = allCards[i].querySelector('[data-eligible-bar]');
      if (bar) { bar.classList.add('hidden'); bar.innerHTML = ''; }
    }
  }

  function buildJobFromCard(card) {
    var jobId = card.getAttribute('data-job-id');
    // Find the matching job from inline data (embedded in page)
    if (window.__SARKARIMATCH_JOBS__ && window.__SARKARIMATCH_JOBS__[jobId]) {
      return window.__SARKARIMATCH_JOBS__[jobId];
    }
    // Fallback: build from data attributes
    return {
      id: jobId,
      sector: card.getAttribute('data-sector') || '',
      education_level: card.getAttribute('data-education') || '',
      locations: tryParseJSON(card.getAttribute('data-locations'), []),
      important_dates: { last_date: card.getAttribute('data-last-date') || '' },
      total_vacancies: parseInt(card.getAttribute('data-vacancies'), 10) || 0,
      salary_max: parseInt(card.getAttribute('data-salary-max'), 10) || 0,
      age_min: 0,
      age_max: 0,
      posts: [],
      notification_title: ''
    };
  }

  function tryParseJSON(str, fallback) {
    try { return JSON.parse(str); } catch(e) { return fallback; }
  }

  function renderEligibilityBadge(card, result) {
    var badge = card.querySelector('[data-job-eligibility]');
    if (!badge) return;

    var html = '';
    if (result.overall_label === 'eligible') {
      html = '<div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">' +
        '<span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>' +
        '<span class="text-xs font-bold text-green-700 dark:text-green-300">Eligible</span>' +
        '<span class="text-xs text-green-600 dark:text-green-400 ml-auto">Score: ' + result.best_score + '</span>' +
        '</div>';
    } else if (result.overall_label === 'partial') {
      html = '<div class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">' +
        '<span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>' +
        '<span class="text-xs font-bold text-amber-700 dark:text-amber-300">Partially Eligible</span>' +
        '<span class="text-xs text-amber-600 dark:text-amber-400 ml-auto">Score: ' + result.best_score + '</span>' +
        '</div>';
    } else {
      html = '<div class="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">' +
        '<span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>' +
        '<span class="text-xs font-bold text-red-700 dark:text-red-300">Not Eligible</span>' +
        '<span class="text-xs text-red-600 dark:text-red-400 ml-auto">Score: ' + result.best_score + '</span>' +
        '</div>';
    }

    badge.innerHTML = html;
    badge.classList.remove('hidden');
  }

  function renderEligiblePostsBar(card, result) {
    var bar = card.querySelector('[data-eligible-bar]');
    if (!bar) return;

    var total = result.total_posts;
    var eligible = result.eligible_posts;
    var partial = result.partial_posts;
    var notElig = total - eligible - partial;

    if (total === 0) { bar.classList.add('hidden'); return; }

    var pctElig = Math.round((eligible / total) * 100);
    var pctPartial = Math.round((partial / total) * 100);

    var html = '<div class="flex items-center gap-2 text-xs">' +
      '<span class="text-content-secondary dark:text-content-dark-muted">Posts:</span>' +
      '<div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">';

    if (pctElig > 0) html += '<div class="bg-green-500 h-full" style="width:' + pctElig + '%"></div>';
    if (pctPartial > 0) html += '<div class="bg-amber-400 h-full" style="width:' + pctPartial + '%"></div>';

    html += '</div>' +
      '<span class="font-semibold text-content-primary dark:text-content-dark">' + eligible + '/' + total + '</span>' +
      '<span class="text-green-600 dark:text-green-400">eligible</span>' +
      '</div>';

    bar.innerHTML = html;
    bar.classList.remove('hidden');
  }

  // ═══════════════════════════════════════════════════════
  //  FILTERING & SORTING
  // ═══════════════════════════════════════════════════════

  function getFilters() {
    return {
      search: (val('filter-search') || val('filter-search-mobile') || '').toLowerCase(),
      sector: val('filter-sector') || val('mobile-filter-sector') || '',
      education: val('filter-education') || val('mobile-filter-education') || '',
      state: val('filter-state') || val('mobile-filter-state') || '',
      eligibleOnly: isChecked('filter-eligible-only') || isChecked('mobile-filter-eligible'),
      closingSoon: isChecked('filter-closing-soon') || isChecked('mobile-filter-closing'),
      freeApply: isChecked('filter-free-apply') || isChecked('mobile-filter-free'),
      noExam: isChecked('filter-no-exam') || isChecked('mobile-filter-noexam'),
      sort: val('filter-sort') || val('mobile-filter-sort') || 'best_match'
    };
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function isChecked(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
  }

  function applyFiltersAndSort() {
    var f = getFilters();
    var matched = [];

    for (var i = 0; i < allCards.length; i++) {
      var card = allCards[i];
      var visible = true;

      // Search filter
      if (f.search) {
        var title = (card.querySelector('h3') || {}).textContent || '';
        var org = (card.querySelector('h3 + p') || {}).textContent || '';
        var tags = card.getAttribute('data-job-id') || '';
        var combined = (title + ' ' + org + ' ' + tags).toLowerCase();
        if (combined.indexOf(f.search) === -1) visible = false;
      }

      // Sector filter
      if (visible && f.sector) {
        if (card.getAttribute('data-sector') !== f.sector) visible = false;
      }

      // Education filter
      if (visible && f.education) {
        var cardEdu = card.getAttribute('data-education') || '';
        var cardRank = EDUCATION_RANKS[cardEdu] || 0;
        var filterRank = EDUCATION_RANKS[f.education] || 0;
        // Show jobs that require this education level or lower
        if (cardRank > filterRank && filterRank > 0) visible = false;
      }

      // State filter
      if (visible && f.state) {
        var locs = tryParseJSON(card.getAttribute('data-locations'), []);
        var stateMatch = false;
        for (var s = 0; s < locs.length; s++) {
          if (/all\s+india/i.test(locs[s])) { stateMatch = true; break; }
          if (locs[s].toLowerCase().indexOf(f.state.toLowerCase()) !== -1) { stateMatch = true; break; }
        }
        if (!stateMatch) visible = false;
      }

      // Eligible only (requires profile)
      if (visible && f.eligibleOnly && currentProfile) {
        var jobId = card.getAttribute('data-job-id');
        var elig = eligibilityMap[jobId];
        if (!elig || elig.overall_label !== 'eligible') visible = false;
      }

      // Closing soon
      if (visible && f.closingSoon) {
        var lastDate = card.getAttribute('data-last-date') || '';
        var daysLeft = dateDiff(TODAY, lastDate);
        if (daysLeft < 0 || daysLeft > 7) visible = false;
      }

      // Free apply
      if (visible && f.freeApply) {
        var fee = parseInt(card.getAttribute('data-fee-general'), 10) || 0;
        if (fee > 0) visible = false;
      }

      // No exam
      if (visible && f.noExam) {
        if (card.getAttribute('data-has-exam') === 'true') visible = false;
      }

      if (visible) matched.push(card);
    }

    // Sort
    matched.sort(function (a, b) {
      return sortCards(a, b, f.sort);
    });

    filteredCards = matched;
    visibleCount = 0;
    showNextPage();
    updateResultsCount();
    updateLoadMoreButton();
    updateActiveFilterCount();
  }

  function sortCards(a, b, sortType) {
    switch (sortType) {
      case 'newest':
        return (b.getAttribute('data-created') || '').localeCompare(a.getAttribute('data-created') || '');
      case 'closing_soon': {
        var dA = dateDiff(TODAY, a.getAttribute('data-last-date') || '');
        var dB = dateDiff(TODAY, b.getAttribute('data-last-date') || '');
        // Expired goes last
        if (dA < 0 && dB >= 0) return 1;
        if (dB < 0 && dA >= 0) return -1;
        return dA - dB;
      }
      case 'highest_vacancies':
        return (parseInt(b.getAttribute('data-vacancies'), 10) || 0) - (parseInt(a.getAttribute('data-vacancies'), 10) || 0);
      case 'highest_salary':
        return (parseInt(b.getAttribute('data-salary-max'), 10) || 0) - (parseInt(a.getAttribute('data-salary-max'), 10) || 0);
      case 'best_match':
      default: {
        if (!currentProfile) {
          // Without profile, sort by featured, then newest
          var fA = a.querySelector('.bg-amber-100') ? 1 : 0;
          var fB = b.querySelector('.bg-amber-100') ? 1 : 0;
          if (fB !== fA) return fB - fA;
          return (b.getAttribute('data-created') || '').localeCompare(a.getAttribute('data-created') || '');
        }
        // With profile, sort by eligibility label then score
        var idA = a.getAttribute('data-job-id');
        var idB = b.getAttribute('data-job-id');
        var eA = eligibilityMap[idA] || { best_score: 0, overall_label: 'not_eligible' };
        var eB = eligibilityMap[idB] || { best_score: 0, overall_label: 'not_eligible' };
        var labelOrder = { eligible: 0, partial: 1, not_eligible: 2 };
        var orderDiff = (labelOrder[eA.overall_label] || 3) - (labelOrder[eB.overall_label] || 3);
        if (orderDiff !== 0) return orderDiff;
        return eB.best_score - eA.best_score;
      }
    }
  }

  function dateDiff(fromStr, toStr) {
    if (!toStr) return -999;
    var from = new Date(fromStr);
    var to = new Date(toStr);
    return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
  }

  function showNextPage() {
    var grid = document.getElementById('jobs-grid');
    var noResults = document.getElementById('no-results');
    if (!grid) return;

    // Hide all first
    for (var i = 0; i < allCards.length; i++) {
      allCards[i].style.display = 'none';
    }

    if (filteredCards.length === 0) {
      if (noResults) noResults.classList.remove('hidden');
      return;
    }

    if (noResults) noResults.classList.add('hidden');

    var end = Math.min(visibleCount + PAGE_SIZE, filteredCards.length);

    // Re-order DOM: move filtered cards to correct positions
    for (var j = 0; j < end; j++) {
      grid.appendChild(filteredCards[j]);
      filteredCards[j].style.display = '';
      // Animate in new ones
      if (j >= visibleCount) {
        filteredCards[j].style.opacity = '0';
        filteredCards[j].style.transform = 'translateY(12px)';
        // Stagger animation
        (function(el, delay) {
          setTimeout(function() {
            el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
        })(filteredCards[j], (j - visibleCount) * 50);
      }
    }

    visibleCount = end;
    updateLoadMoreButton();
  }

  function updateResultsCount() {
    var el = document.getElementById('results-count');
    if (el) {
      var total = filteredCards.length;
      var showing = Math.min(visibleCount, total);
      if (total === 0) {
        el.textContent = 'No jobs match your filters';
      } else {
        el.textContent = 'Showing ' + showing + ' of ' + total + ' job' + (total !== 1 ? 's' : '');
      }
    }
  }

  function updateLoadMoreButton() {
    var container = document.getElementById('load-more-container');
    var btn = document.getElementById('load-more-btn');
    var allLoaded = document.getElementById('all-loaded-text');
    if (!container || !btn) return;

    if (filteredCards.length === 0) {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');

    if (visibleCount >= filteredCards.length) {
      btn.classList.add('hidden');
      if (allLoaded) allLoaded.classList.remove('hidden');
    } else {
      btn.classList.remove('hidden');
      if (allLoaded) allLoaded.classList.add('hidden');
    }
  }

  function updateActiveFilterCount() {
    var f = getFilters();
    var count = 0;
    if (f.sector) count++;
    if (f.education) count++;
    if (f.state) count++;
    if (f.eligibleOnly) count++;
    if (f.closingSoon) count++;
    if (f.freeApply) count++;
    if (f.noExam) count++;

    var badge = document.getElementById('active-filter-count');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
        badge.classList.add('flex');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════════════════════

  function attachFilterListeners() {
    var filterIds = [
      'filter-sector', 'filter-education', 'filter-state',
      'filter-eligible-only', 'filter-closing-soon', 'filter-free-apply', 'filter-no-exam',
      'filter-sort'
    ];

    for (var i = 0; i < filterIds.length; i++) {
      var el = document.getElementById(filterIds[i]);
      if (el) {
        el.addEventListener('change', function () { applyFiltersAndSort(); });
      }
    }

    // Search with debounce
    var searchEl = document.getElementById('filter-search');
    if (searchEl) {
      var searchTimer;
      searchEl.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () { applyFiltersAndSort(); }, 250);
      });
    }

    // Clear filters button
    var clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', resetAllFilters);
    }
  }

  function attachSearchSync() {
    // Sync desktop <-> mobile search
    var desktop = document.getElementById('filter-search');
    var mobile = document.getElementById('filter-search-mobile');
    if (desktop && mobile) {
      desktop.addEventListener('input', function () { mobile.value = desktop.value; });
      mobile.addEventListener('input', function () {
        desktop.value = mobile.value;
        applyFiltersAndSort();
      });
    }
  }

  function attachMobileFilterSheet() {
    var sheet = document.getElementById('mobile-filter-sheet');
    var panel = document.getElementById('mobile-filter-panel');
    var backdrop = document.getElementById('mobile-filter-backdrop');
    var openBtn = document.getElementById('mobile-filters-btn');
    var closeBtn = document.getElementById('mobile-filter-close');
    var resetBtn = document.getElementById('mobile-filter-reset');

    if (!sheet || !panel) return;

    function openSheet() {
      sheet.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () {
        panel.style.transform = 'translateY(0)';
      });
    }

    function closeSheet() {
      panel.style.transform = 'translateY(100%)';
      setTimeout(function () {
        sheet.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
      // Sync mobile → desktop filters
      syncMobileToDesktop();
      applyFiltersAndSort();
    }

    if (openBtn) openBtn.addEventListener('click', openSheet);
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    if (backdrop) backdrop.addEventListener('click', closeSheet);

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetAllFilters();
        closeSheet();
      });
    }
  }

  function syncMobileToDesktop() {
    syncSelect('mobile-filter-sector', 'filter-sector');
    syncSelect('mobile-filter-education', 'filter-education');
    syncSelect('mobile-filter-state', 'filter-state');
    syncSelect('mobile-filter-sort', 'filter-sort');
    syncCheckbox('mobile-filter-eligible', 'filter-eligible-only');
    syncCheckbox('mobile-filter-closing', 'filter-closing-soon');
    syncCheckbox('mobile-filter-free', 'filter-free-apply');
    syncCheckbox('mobile-filter-noexam', 'filter-no-exam');
  }

  function syncSelect(fromId, toId) {
    var from = document.getElementById(fromId);
    var to = document.getElementById(toId);
    if (from && to) to.value = from.value;
  }

  function syncCheckbox(fromId, toId) {
    var from = document.getElementById(fromId);
    var to = document.getElementById(toId);
    if (from && to) to.checked = from.checked;
  }

  function resetAllFilters() {
    var selectIds = ['filter-sector', 'filter-education', 'filter-state', 'filter-sort',
      'mobile-filter-sector', 'mobile-filter-education', 'mobile-filter-state', 'mobile-filter-sort'];
    for (var i = 0; i < selectIds.length; i++) {
      var el = document.getElementById(selectIds[i]);
      if (el) el.value = el.tagName === 'SELECT' ? (selectIds[i].indexOf('sort') !== -1 ? 'best_match' : '') : '';
    }

    var checkIds = ['filter-eligible-only', 'filter-closing-soon', 'filter-free-apply', 'filter-no-exam',
      'mobile-filter-eligible', 'mobile-filter-closing', 'mobile-filter-free', 'mobile-filter-noexam'];
    for (var j = 0; j < checkIds.length; j++) {
      var cb = document.getElementById(checkIds[j]);
      if (cb) cb.checked = false;
    }

    var searchIds = ['filter-search', 'filter-search-mobile'];
    for (var k = 0; k < searchIds.length; k++) {
      var se = document.getElementById(searchIds[k]);
      if (se) se.value = '';
    }

    applyFiltersAndSort();
  }

  function attachViewToggle() {
    var gridBtn = document.getElementById('view-grid');
    var listBtn = document.getElementById('view-list');
    var grid = document.getElementById('jobs-grid');
    if (!gridBtn || !listBtn || !grid) return;

    gridBtn.addEventListener('click', function () {
      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5';
      gridBtn.className = 'p-2 bg-brand-primary text-white';
      gridBtn.setAttribute('aria-pressed', 'true');
      listBtn.className = 'p-2 text-content-secondary dark:text-content-dark-muted hover:bg-gray-50 dark:hover:bg-gray-800';
      listBtn.setAttribute('aria-pressed', 'false');
    });

    listBtn.addEventListener('click', function () {
      grid.className = 'grid grid-cols-1 gap-4';
      listBtn.className = 'p-2 bg-brand-primary text-white';
      listBtn.setAttribute('aria-pressed', 'true');
      gridBtn.className = 'p-2 text-content-secondary dark:text-content-dark-muted hover:bg-gray-50 dark:hover:bg-gray-800';
      gridBtn.setAttribute('aria-pressed', 'false');
    });
  }

  function attachLoadMore() {
    var btn = document.getElementById('load-more-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        showNextPage();
        updateResultsCount();
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  //  BOOKMARKS (reuse from app.js pattern)
  // ═══════════════════════════════════════════════════════

  function initJobBookmarks() {
    var BM_KEY = 'sarkarimatch_bookmarks';
    function getBookmarks() {
      try { return JSON.parse(localStorage.getItem(BM_KEY) || '[]'); }
      catch(e) { return []; }
    }
    function saveBookmarks(arr) { localStorage.setItem(BM_KEY, JSON.stringify(arr)); }

    var btns = document.querySelectorAll('#jobs-grid .bookmark-btn');
    btns.forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      if (!slug) return;
      var bm = getBookmarks();
      if (bm.indexOf(slug) !== -1) btn.classList.add('bookmarked');

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var bookmarks = getBookmarks();
        var idx = bookmarks.indexOf(slug);
        if (idx === -1) {
          bookmarks.push(slug);
          btn.classList.add('bookmarked');
          btn.setAttribute('aria-label', 'Remove bookmark');
        } else {
          bookmarks.splice(idx, 1);
          btn.classList.remove('bookmarked');
          btn.setAttribute('aria-label', 'Bookmark this job');
        }
        saveBookmarks(bookmarks);
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  //  INLINE JOB DATA (for eligibility engine)
  // ═══════════════════════════════════════════════════════

  // We need full job data (with posts array) for the eligibility engine.
  // Since this is SSR, we embed the data inline.
  function loadInlineJobData() {
    var script = document.getElementById('jobs-data-script');
    if (script) {
      try {
        window.__SARKARIMATCH_JOBS__ = JSON.parse(script.textContent);
      } catch (e) {
        window.__SARKARIMATCH_JOBS__ = {};
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  //  BOOTSTRAP
  // ═══════════════════════════════════════════════════════

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadInlineJobData();
      init();
    });
  } else {
    loadInlineJobData();
    init();
  }

})();
