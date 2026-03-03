/**
 * SarkariMatch -- Jobs Page Client-Side Logic v2
 *
 * Handles:
 * - Profile reading from localStorage
 * - Eligibility engine (inline, no ES modules in browser)
 * - Eligibility Detail Tooltip (hover/tap with per-post breakdown)
 * - Filtering (sector, education, state, toggles, search)
 * - Sorting (best match, newest, closing soon, vacancies, salary)
 * - Pagination (12 jobs per page, "Load More")
 * - Mobile filter bottom sheet
 * - View toggle (grid/list)
 * - Profile summary bar
 * - Eligibility badges on job cards
 * - Bookmarks tab integration
 * - URL query parameter sync
 * - Quick stats on filter change
 * - Empty states (no matching / no eligible)
 * - Keyboard shortcuts (P, E, /)
 */

(function () {
  'use strict';

  // =====================================================
  //  CONSTANTS
  // =====================================================

  var PROFILE_KEY = 'sarkarimatch_profile';
  var BM_KEY = 'sarkarimatch_bookmarks';
  var PAGE_SIZE = 12;
  var TODAY = '2026-03-03';

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

  // =====================================================
  //  ELIGIBILITY ENGINE (browser-compatible)
  // =====================================================

  function normalizeCategory(cat) {
    if (!cat) return 'UR';
    return CATEGORY_NORMALIZE[cat.toLowerCase().trim()] || cat.toUpperCase().trim();
  }

  function calculateAge(dob, refDate) {
    var bp = dob.split('-').map(Number);
    var rp = refDate.split('-').map(Number);
    var years = rp[0] - bp[0], months = rp[1] - bp[1], days = rp[2] - bp[2];
    if (days < 0) {
      var pm = rp[1] - 1 === 0 ? 12 : rp[1] - 1;
      var py = pm === 12 ? rp[0] - 1 : rp[0];
      days += new Date(py, pm, 0).getDate();
      months--;
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
    var m = s.match(/(\d+(?:\.\d+)?)\s*[-\u2013\u2014]\s*(\d+(?:\.\d+)?)/);
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

    // -- Age check --
    var ageResult = 'pass';
    var ageMsg = '';
    if (ageMin === 0 && ageMax === 0) {
      ageResult = 'pass'; ageMsg = 'No age limit';
    } else {
      var age = calculateAge(profile.dob, lastDate);
      var effMax = ageMax + relax;
      if (age.years < ageMin) { ageResult = 'fail'; ageMsg = 'Age ' + age.years + 'y, min ' + ageMin + 'y'; }
      else if (age.years > effMax) { ageResult = 'fail'; ageMsg = 'Age ' + age.years + 'y, max ' + effMax + 'y'; }
      else { ageResult = 'pass'; ageMsg = 'Age ' + age.years + 'y (limit ' + ageMin + '-' + effMax + 'y)'; }
    }

    // -- Education check --
    var reqLevel = inferEducationLevel(post.education_required, job.education_level);
    var uRank = getEducationRank(profile.education_level);
    var rRank = getEducationRank(reqLevel);
    var eduResult = (uRank === 0 || rRank === 0) ? 'unknown' : (uRank >= rRank ? 'pass' : 'fail');
    var eduMsg = eduResult === 'pass' ? (EDUCATION_LABELS[profile.education_level] || profile.education_level) + ' >= ' + (EDUCATION_LABELS[reqLevel] || reqLevel) :
                 eduResult === 'fail' ? 'Need ' + (EDUCATION_LABELS[reqLevel] || reqLevel) + ', have ' + (EDUCATION_LABELS[profile.education_level] || profile.education_level) : 'Education unknown';

    // -- Degree check --
    var degReq = parseDegreeReq(post.education_required);
    var degResult = 'not_required';
    var degMsg = 'No specific degree required';
    if (degReq.degrees && degReq.degrees.length > 0) {
      if (!profile.degree) {
        degResult = 'unknown'; degMsg = 'Degree not set in profile';
      } else {
        var matched = false;
        for (var i = 0; i < degReq.degrees.length; i++) {
          if (degreesMatch(profile.degree, degReq.degrees[i])) { matched = true; break; }
        }
        degResult = matched ? 'pass' : 'fail';
        degMsg = matched ? profile.degree + ' matches' : 'Need ' + degReq.degrees.join('/');
      }
    }

    // -- Percentage check --
    var pctResult = 'not_required';
    var pctMsg = '';
    if (post.education_required) {
      var pctMatch = post.education_required.match(/(\d+)\s*%/);
      if (pctMatch) {
        var reqPct = parseInt(pctMatch[1], 10);
        if (profile.percentage === null || profile.percentage === undefined) { pctResult = 'unknown'; pctMsg = reqPct + '% required, yours not set'; }
        else { pctResult = profile.percentage >= reqPct ? 'pass' : 'fail'; pctMsg = profile.percentage + '% vs ' + reqPct + '% required'; }
      }
    }

    // -- Vacancy check --
    var vacResult = (typeof post.vacancies_total === 'number') ?
      (post.vacancies_total === 0 ? 'pass' : 'unknown') : 'unknown';

    // -- Score --
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

    // Build criteria list for tooltip
    var criteria = [];
    criteria.push({ check: 'Age', result: ageResult, msg: ageMsg });
    criteria.push({ check: 'Education', result: eduResult, msg: eduMsg });
    if (degResult !== 'not_required') criteria.push({ check: 'Degree', result: degResult, msg: degMsg });
    if (pctResult !== 'not_required') criteria.push({ check: 'Percentage', result: pctResult, msg: pctMsg });

    return { post_name: post.post_name, score: score, label: label, criteria: criteria };
  }

  function evaluateJobFull(profile, job) {
    var posts = (job.posts && job.posts.length > 0) ? job.posts : [{
      post_name: job.notification_title || 'Main Post',
      vacancies_total: job.total_vacancies || 0,
      education_required: job.education_level || '',
      age_limit: (job.age_min && job.age_max) ? job.age_min + '\u2013' + job.age_max + ' years' : '',
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

  // =====================================================
  //  PROFILE READING
  // =====================================================

  function readProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  // =====================================================
  //  STATE
  // =====================================================

  var allCards = [];
  var eligibilityMap = {};
  var currentProfile = null;
  var visibleCount = 0;
  var filteredCards = [];
  var activeTab = 'all'; // 'all' or 'bookmarks'
  var activeTooltip = null; // currently open tooltip element

  // =====================================================
  //  INITIALIZATION
  // =====================================================

  function init() {
    var grid = document.getElementById('jobs-grid');
    if (!grid) return;

    var cards = grid.querySelectorAll('.job-card');
    allCards = Array.prototype.slice.call(cards);

    currentProfile = readProfile();
    updateProfileBar(currentProfile);

    if (currentProfile) {
      runEligibility(currentProfile);
    }

    // Read URL params into filters before first filter+sort
    readUrlParams();

    applyFiltersAndSort();

    attachFilterListeners();
    attachMobileFilterSheet();
    attachViewToggle();
    attachLoadMore();
    attachSearchSync();
    attachTooltipListeners();
    attachBookmarksTab();
    attachKeyboardShortcuts();
    initJobBookmarks();

    // Handle browser back/forward
    window.addEventListener('popstate', function() {
      readUrlParams();
      applyFiltersAndSort();
    });

    // Listen for profile updates
    window.addEventListener('profile-updated', onProfileUpdate);
    window.addEventListener('sarkarimatch-profile-changed', onProfileUpdate);
  }

  function onProfileUpdate() {
    currentProfile = readProfile();
    updateProfileBar(currentProfile);
    if (currentProfile) {
      runEligibility(currentProfile);
    } else {
      clearEligibility();
    }
    applyFiltersAndSort();
  }

  // =====================================================
  //  PROFILE BAR
  // =====================================================

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
      summaryText.textContent = 'Profile Active \u2014 Showing Eligibility';
    }
    if (summaryDetails) {
      var parts = [];
      if (profile.education_level) parts.push(EDUCATION_LABELS[profile.education_level] || profile.education_level);
      if (profile.category) parts.push(normalizeCategory(profile.category));
      if (profile.age_years) parts.push(profile.age_years + 'y');
      if (profile.preferred_sectors && profile.preferred_sectors.length > 0) {
        parts.push(profile.preferred_sectors.length + ' sector' + (profile.preferred_sectors.length > 1 ? 's' : ''));
      }
      summaryDetails.textContent = parts.join(' \xb7 ');
    }
  }

  // =====================================================
  //  ELIGIBILITY
  // =====================================================

  function runEligibility(profile) {
    eligibilityMap = {};
    for (var i = 0; i < allCards.length; i++) {
      var card = allCards[i];
      var jobId = card.getAttribute('data-job-id');
      if (!jobId) continue;
      var jobObj = buildJobFromCard(card);
      var result = evaluateJobFull(profile, jobObj);
      eligibilityMap[jobId] = result;
      renderEligibilityBadge(card, result);
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
    if (window.__SARKARIMATCH_JOBS__ && window.__SARKARIMATCH_JOBS__[jobId]) {
      return window.__SARKARIMATCH_JOBS__[jobId];
    }
    return {
      id: jobId,
      sector: card.getAttribute('data-sector') || '',
      education_level: card.getAttribute('data-education') || '',
      locations: tryParseJSON(card.getAttribute('data-locations'), []),
      important_dates: { last_date: card.getAttribute('data-last-date') || '' },
      total_vacancies: parseInt(card.getAttribute('data-vacancies'), 10) || 0,
      salary_max: parseInt(card.getAttribute('data-salary-max'), 10) || 0,
      age_min: 0, age_max: 0, posts: [], notification_title: ''
    };
  }

  function tryParseJSON(str, fallback) {
    try { return JSON.parse(str); } catch(e) { return fallback; }
  }

  function renderEligibilityBadge(card, result) {
    var badge = card.querySelector('[data-job-eligibility]');
    if (!badge) return;

    var colorMap = {
      eligible: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-300', sub: 'text-green-600 dark:text-green-400', lbl: 'Eligible' },
      partial: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', sub: 'text-amber-600 dark:text-amber-400', lbl: 'Partially Eligible' },
      not_eligible: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300', sub: 'text-red-600 dark:text-red-400', lbl: 'Not Eligible' }
    };
    var c = colorMap[result.overall_label] || colorMap.not_eligible;

    badge.innerHTML =
      '<div class="eligibility-badge-inner flex items-center gap-1.5 px-3 py-1.5 ' + c.bg + ' border-b ' + c.border + ' cursor-pointer select-none" data-tooltip-trigger="' + result.job_id + '" role="button" tabindex="0" aria-label="View eligibility details">' +
        '<span class="w-2.5 h-2.5 rounded-full ' + c.dot + '"></span>' +
        '<span class="text-xs font-bold ' + c.text + '">' + c.lbl + '</span>' +
        '<span class="text-xs ' + c.sub + ' ml-auto">Score: ' + result.best_score + '</span>' +
        '<svg class="w-3 h-3 ' + c.sub + ' ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>' +
      '</div>';
    badge.classList.remove('hidden');
  }

  function renderEligiblePostsBar(card, result) {
    var bar = card.querySelector('[data-eligible-bar]');
    if (!bar) return;
    var total = result.total_posts;
    var eligible = result.eligible_posts;
    var partial = result.partial_posts;
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

  // =====================================================
  //  ELIGIBILITY DETAIL TOOLTIP
  // =====================================================

  function attachTooltipListeners() {
    // Delegate clicks on eligibility badges
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-tooltip-trigger]');
      if (trigger) {
        e.stopPropagation();
        var jobId = trigger.getAttribute('data-tooltip-trigger');
        toggleTooltip(jobId, trigger);
        return;
      }
      // Close on outside click
      if (activeTooltip && !e.target.closest('.eligibility-tooltip')) {
        closeTooltip();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && activeTooltip) {
        closeTooltip();
      }
    });

    // Desktop hover: open on mouseenter of badge, close on mouseleave of tooltip area
    document.addEventListener('mouseenter', function(e) {
      if (window.innerWidth < 768) return; // skip on mobile
      var trigger = e.target.closest('[data-tooltip-trigger]');
      if (trigger) {
        var jobId = trigger.getAttribute('data-tooltip-trigger');
        openTooltip(jobId, trigger);
      }
    }, true);

    document.addEventListener('mouseleave', function(e) {
      if (window.innerWidth < 768) return;
      var trigger = e.target.closest('[data-tooltip-trigger]');
      var tooltip = e.target.closest('.eligibility-tooltip');
      if (trigger || tooltip) {
        // Delay close to allow moving to tooltip
        setTimeout(function() {
          if (activeTooltip && !activeTooltip.matches(':hover') && !activeTooltip.previousElementSibling) {
            var badge = document.querySelector('[data-tooltip-trigger]:hover');
            var ttHover = document.querySelector('.eligibility-tooltip:hover');
            if (!badge && !ttHover) closeTooltip();
          }
        }, 150);
      }
    }, true);
  }

  function toggleTooltip(jobId, triggerEl) {
    if (activeTooltip && activeTooltip.getAttribute('data-tooltip-job') === jobId) {
      closeTooltip();
      return;
    }
    openTooltip(jobId, triggerEl);
  }

  function openTooltip(jobId, triggerEl) {
    closeTooltip();
    var result = eligibilityMap[jobId];
    if (!result) return;

    var tooltip = document.createElement('div');
    tooltip.className = 'eligibility-tooltip';
    tooltip.setAttribute('data-tooltip-job', jobId);

    var html = '<div class="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">' +
      '<span class="text-xs font-bold text-content-primary dark:text-content-dark">Post-wise Eligibility</span>' +
      '<button type="button" class="tooltip-close-btn w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400" aria-label="Close">' +
        '<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>';

    html += '<div class="tooltip-scroll-body">';

    for (var i = 0; i < result.posts.length; i++) {
      var p = result.posts[i];
      var icon = p.label === 'eligible' ? '<svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>' : (p.label === 'partial' ? '<svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>' : '<svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>');
      var scoreColor = p.label === 'eligible' ? 'text-green-600 dark:text-green-400' : (p.label === 'partial' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400');
      var bgColor = p.label === 'eligible' ? 'bg-green-50 dark:bg-green-900/10' : (p.label === 'partial' ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-red-50 dark:bg-red-900/10');

      html += '<div class="px-3 py-2.5 ' + bgColor + ' ' + (i < result.posts.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : '') + '">' +
        '<div class="flex items-center justify-between gap-2 mb-1.5">' +
          '<span class="text-xs font-semibold text-content-primary dark:text-content-dark flex items-center gap-1.5">' +
            '<span>' + icon + '</span> ' + escapeHtml(p.post_name) +
          '</span>' +
          '<span class="text-xs font-bold ' + scoreColor + ' tabular-nums">' + p.score + '%</span>' +
        '</div>';

      if (p.criteria && p.criteria.length > 0) {
        for (var ci = 0; ci < p.criteria.length; ci++) {
          var cr = p.criteria[ci];
          var crIcon = cr.result === 'pass' || cr.result === 'not_required' ? '<svg class="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>' : (cr.result === 'unknown' ? '<svg class="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>' : '<svg class="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>');
          var crColor = cr.result === 'pass' || cr.result === 'not_required' ? 'text-green-600 dark:text-green-400' : (cr.result === 'unknown' ? 'text-amber-500' : 'text-red-500');
          html += '<div class="flex items-start gap-1.5 text-[11px] ml-4">' +
            '<span class="' + crColor + ' font-bold leading-4">' + crIcon + '</span>' +
            '<span class="text-content-secondary dark:text-content-dark-muted leading-4">' + escapeHtml(cr.check) + ': ' + escapeHtml(cr.msg) + '</span>' +
          '</div>';
        }
      }
      html += '</div>';
    }

    html += '</div>';

    html += '<div class="p-2.5 border-t border-gray-100 dark:border-gray-700 text-center">' +
      '<a href="/jobs/' + jobId + '" class="text-xs font-semibold text-brand-primary dark:text-blue-400 hover:underline">View Full Details \u2192</a>' +
    '</div>';

    tooltip.innerHTML = html;

    // Position: insert after the badge container
    var card = triggerEl.closest('.job-card');
    var badgeContainer = card.querySelector('[data-job-eligibility]');
    if (badgeContainer) {
      badgeContainer.style.position = 'relative';
      badgeContainer.appendChild(tooltip);
    }

    activeTooltip = tooltip;

    // Close button inside tooltip
    var closeBtn = tooltip.querySelector('.tooltip-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeTooltip();
      });
    }
  }

  function closeTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // =====================================================
  //  FILTERING & SORTING
  // =====================================================

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

  function setVal(id, v) {
    var el = document.getElementById(id);
    if (el) el.value = v;
  }

  function setChecked(id, v) {
    var el = document.getElementById(id);
    if (el) el.checked = v;
  }

  function applyFiltersAndSort() {
    var f = getFilters();
    var sourceCards = activeTab === 'bookmarks' ? getBookmarkedCards() : allCards;
    var matched = [];
    var eligibleTotal = 0, partialTotal = 0, notEligTotal = 0;

    for (var i = 0; i < sourceCards.length; i++) {
      var card = sourceCards[i];
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

      // Eligible only
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

      if (visible) {
        matched.push(card);
        // Count eligibility stats
        if (currentProfile) {
          var jid = card.getAttribute('data-job-id');
          var ev = eligibilityMap[jid];
          if (ev) {
            if (ev.overall_label === 'eligible') eligibleTotal++;
            else if (ev.overall_label === 'partial') partialTotal++;
            else notEligTotal++;
          }
        }
      }
    }

    // Sort
    matched.sort(function (a, b) { return sortCards(a, b, f.sort); });

    filteredCards = matched;
    visibleCount = 0;
    showNextPage();
    updateResultsCount();
    updateLoadMoreButton();
    updateActiveFilterCount();
    updateQuickStats(matched.length, eligibleTotal, partialTotal, notEligTotal);
    updateEmptyState(sourceCards.length, matched.length, eligibleTotal, partialTotal);
    writeUrlParams(f);
  }

  function sortCards(a, b, sortType) {
    switch (sortType) {
      case 'newest':
        return (b.getAttribute('data-created') || '').localeCompare(a.getAttribute('data-created') || '');
      case 'closing_soon': {
        var dA = dateDiff(TODAY, a.getAttribute('data-last-date') || '');
        var dB = dateDiff(TODAY, b.getAttribute('data-last-date') || '');
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
          var fA = a.querySelector('.bg-amber-100') ? 1 : 0;
          var fB = b.querySelector('.bg-amber-100') ? 1 : 0;
          if (fB !== fA) return fB - fA;
          return (b.getAttribute('data-created') || '').localeCompare(a.getAttribute('data-created') || '');
        }
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
    if (!grid) return;

    for (var i = 0; i < allCards.length; i++) {
      allCards[i].style.display = 'none';
    }

    if (filteredCards.length === 0) {
      return;
    }

    var end = Math.min(visibleCount + PAGE_SIZE, filteredCards.length);
    for (var j = 0; j < end; j++) {
      grid.appendChild(filteredCards[j]);
      filteredCards[j].style.display = '';
      if (j >= visibleCount) {
        filteredCards[j].style.opacity = '0';
        filteredCards[j].style.transform = 'translateY(12px)';
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

  // =====================================================
  //  QUICK STATS (animated count summary)
  // =====================================================

  function updateQuickStats(total, eligible, partial, notElig) {
    var bar = document.getElementById('quick-stats-bar');
    if (!bar) return;

    if (!currentProfile || total === 0) {
      bar.classList.add('hidden');
      return;
    }

    bar.classList.remove('hidden');
    var html =
      '<div class="quick-stats-inner flex items-center gap-3 flex-wrap text-xs font-medium">' +
        '<span class="text-content-primary dark:text-content-dark">' +
          '<span class="quick-stat-num tabular-nums">' + total + '</span> job' + (total !== 1 ? 's' : '') +
        '</span>' +
        '<span class="text-gray-300 dark:text-gray-600">\xb7</span>' +
        '<span class="text-green-600 dark:text-green-400">' +
          '<span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>' +
          '<span class="quick-stat-num tabular-nums">' + eligible + '</span> eligible' +
        '</span>' +
        '<span class="text-gray-300 dark:text-gray-600">\xb7</span>' +
        '<span class="text-amber-600 dark:text-amber-400">' +
          '<span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>' +
          '<span class="quick-stat-num tabular-nums">' + partial + '</span> partial' +
        '</span>' +
        '<span class="text-gray-300 dark:text-gray-600">\xb7</span>' +
        '<span class="text-red-500 dark:text-red-400">' +
          '<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>' +
          '<span class="quick-stat-num tabular-nums">' + notElig + '</span> not eligible' +
        '</span>' +
      '</div>';

    bar.innerHTML = html;

    // Animate the inner element
    var inner = bar.querySelector('.quick-stats-inner');
    if (inner) {
      inner.style.opacity = '0';
      inner.style.transform = 'translateY(4px)';
      requestAnimationFrame(function() {
        inner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        inner.style.opacity = '1';
        inner.style.transform = 'translateY(0)';
      });
    }
  }

  // =====================================================
  //  EMPTY STATES
  // =====================================================

  function updateEmptyState(sourceTotal, matchedTotal, eligibleTotal, partialTotal) {
    var noResults = document.getElementById('no-results');
    var noEligible = document.getElementById('no-eligible-state');

    // Hide both first
    if (noResults) noResults.classList.add('hidden');
    if (noEligible) noEligible.classList.add('hidden');

    if (matchedTotal === 0 && sourceTotal > 0) {
      // Check if it's because of eligible-only filter with no eligible
      var f = getFilters();
      if (f.eligibleOnly && currentProfile && partialTotal + eligibleTotal === 0) {
        // No eligible at all — show the "no eligible" empty state
        if (noEligible) {
          var partialInAll = 0;
          for (var i = 0; i < allCards.length; i++) {
            var jid = allCards[i].getAttribute('data-job-id');
            var ev = eligibilityMap[jid];
            if (ev && ev.overall_label === 'partial') partialInAll++;
          }
          var countEl = noEligible.querySelector('#partial-match-count');
          if (countEl) countEl.textContent = partialInAll;
          noEligible.classList.remove('hidden');
        }
      } else {
        // Generic no results
        if (noResults) noResults.classList.remove('hidden');
      }
    }
  }

  // =====================================================
  //  URL QUERY PARAMETER SYNC
  // =====================================================

  function writeUrlParams(f) {
    var params = new URLSearchParams();
    if (f.search) params.set('q', f.search);
    if (f.sector) params.set('sector', f.sector);
    if (f.education) params.set('education', f.education);
    if (f.state) params.set('state', f.state);
    if (f.eligibleOnly) params.set('eligible', 'true');
    if (f.closingSoon) params.set('closing', 'true');
    if (f.freeApply) params.set('free', 'true');
    if (f.noExam) params.set('noexam', 'true');
    if (f.sort && f.sort !== 'best_match') params.set('sort', f.sort);
    if (activeTab === 'bookmarks') params.set('tab', 'bookmarks');

    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? '?' + qs : '');
    if (newUrl !== window.location.pathname + window.location.search) {
      history.replaceState(null, '', newUrl);
    }
  }

  function readUrlParams() {
    var params = new URLSearchParams(window.location.search);

    setVal('filter-search', params.get('q') || '');
    setVal('filter-search-mobile', params.get('q') || '');
    setVal('filter-sector', params.get('sector') || '');
    setVal('mobile-filter-sector', params.get('sector') || '');
    setVal('filter-education', params.get('education') || '');
    setVal('mobile-filter-education', params.get('education') || '');
    setVal('filter-state', params.get('state') || '');
    setVal('mobile-filter-state', params.get('state') || '');
    setChecked('filter-eligible-only', params.get('eligible') === 'true');
    setChecked('mobile-filter-eligible', params.get('eligible') === 'true');
    setChecked('filter-closing-soon', params.get('closing') === 'true');
    setChecked('mobile-filter-closing', params.get('closing') === 'true');
    setChecked('filter-free-apply', params.get('free') === 'true');
    setChecked('mobile-filter-free', params.get('free') === 'true');
    setChecked('filter-no-exam', params.get('noexam') === 'true');
    setChecked('mobile-filter-noexam', params.get('noexam') === 'true');
    setVal('filter-sort', params.get('sort') || 'best_match');
    setVal('mobile-filter-sort', params.get('sort') || 'best_match');

    // Tab
    if (params.get('tab') === 'bookmarks') {
      switchTab('bookmarks');
    } else {
      switchTab('all');
    }
  }

  // =====================================================
  //  EVENT LISTENERS
  // =====================================================

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

    var searchEl = document.getElementById('filter-search');
    if (searchEl) {
      var searchTimer;
      searchEl.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () { applyFiltersAndSort(); }, 250);
      });
    }

    var clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', resetAllFilters);
    }

    // "View partial matches" button in no-eligible empty state
    var viewPartialBtn = document.getElementById('view-partial-btn');
    if (viewPartialBtn) {
      viewPartialBtn.addEventListener('click', function() {
        setChecked('filter-eligible-only', false);
        setChecked('mobile-filter-eligible', false);
        applyFiltersAndSort();
      });
    }
  }

  function attachSearchSync() {
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

  // =====================================================
  //  BOOKMARKS TAB
  // =====================================================

  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(BM_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function saveBookmarks(arr) { localStorage.setItem(BM_KEY, JSON.stringify(arr)); }

  function getBookmarkedCards() {
    var bm = getBookmarks();
    var result = [];
    for (var i = 0; i < allCards.length; i++) {
      var slug = allCards[i].querySelector('.bookmark-btn') ?
        allCards[i].querySelector('.bookmark-btn').getAttribute('data-slug') : '';
      if (bm.indexOf(slug) !== -1) result.push(allCards[i]);
    }
    return result;
  }

  function attachBookmarksTab() {
    var allTab = document.getElementById('tab-all-jobs');
    var bmTab = document.getElementById('tab-bookmarks');
    if (!allTab || !bmTab) return;

    allTab.addEventListener('click', function() { switchTab('all'); applyFiltersAndSort(); });
    bmTab.addEventListener('click', function() { switchTab('bookmarks'); applyFiltersAndSort(); });
  }

  function switchTab(tab) {
    activeTab = tab;
    var allTab = document.getElementById('tab-all-jobs');
    var bmTab = document.getElementById('tab-bookmarks');
    var bmCountEl = document.getElementById('bookmarks-count');
    var bmEmptyEl = document.getElementById('bookmarks-empty-state');

    if (allTab && bmTab) {
      if (tab === 'all') {
        allTab.className = 'tab-btn px-4 py-2 text-sm font-semibold border-b-2 border-brand-primary text-brand-primary dark:text-blue-400 dark:border-blue-400 transition-colors';
        bmTab.className = 'tab-btn px-4 py-2 text-sm font-medium text-content-secondary dark:text-content-dark-muted border-b-2 border-transparent hover:text-content-primary dark:hover:text-content-dark transition-colors';
      } else {
        bmTab.className = 'tab-btn px-4 py-2 text-sm font-semibold border-b-2 border-brand-primary text-brand-primary dark:text-blue-400 dark:border-blue-400 transition-colors';
        allTab.className = 'tab-btn px-4 py-2 text-sm font-medium text-content-secondary dark:text-content-dark-muted border-b-2 border-transparent hover:text-content-primary dark:hover:text-content-dark transition-colors';
      }
    }

    // Update bookmarks count
    var bmCards = getBookmarkedCards();
    if (bmCountEl) {
      bmCountEl.textContent = bmCards.length;
      bmCountEl.style.display = bmCards.length > 0 ? '' : 'none';
    }

    // Show/hide bookmarks empty state
    if (bmEmptyEl) {
      if (tab === 'bookmarks' && bmCards.length === 0) {
        bmEmptyEl.classList.remove('hidden');
      } else {
        bmEmptyEl.classList.add('hidden');
      }
    }
  }

  function initJobBookmarks() {
    var btns = document.querySelectorAll('#jobs-grid .bookmark-btn');
    btns.forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      if (!slug) return;
      var bm = getBookmarks();
      if (bm.indexOf(slug) !== -1) {
        btn.classList.add('bookmarked');
        // Also toggle hidden classes for Tailwind compatibility
        var outline = btn.querySelector('.bookmark-outline');
        var filled = btn.querySelector('.bookmark-filled');
        if (outline) outline.classList.add('hidden');
        if (filled) filled.classList.remove('hidden');
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var bookmarks = getBookmarks();
        var idx = bookmarks.indexOf(slug);
        var outline = btn.querySelector('.bookmark-outline');
        var filled = btn.querySelector('.bookmark-filled');
        if (idx === -1) {
          bookmarks.push(slug);
          btn.classList.add('bookmarked');
          btn.setAttribute('aria-label', 'Remove bookmark');
          if (outline) outline.classList.add('hidden');
          if (filled) filled.classList.remove('hidden');
        } else {
          bookmarks.splice(idx, 1);
          btn.classList.remove('bookmarked');
          btn.setAttribute('aria-label', 'Bookmark this job');
          if (outline) outline.classList.remove('hidden');
          if (filled) filled.classList.add('hidden');
        }
        saveBookmarks(bookmarks);

        // Update bookmarks tab count
        var bmCountEl = document.getElementById('bookmarks-count');
        if (bmCountEl) {
          var count = getBookmarkedCards().length;
          bmCountEl.textContent = count;
          bmCountEl.style.display = count > 0 ? '' : 'none';
        }

        // If on bookmarks tab, re-filter
        if (activeTab === 'bookmarks') {
          applyFiltersAndSort();
        }
      });
    });

    // Initial count update
    var bmCountEl = document.getElementById('bookmarks-count');
    if (bmCountEl) {
      var count = getBookmarkedCards().length;
      bmCountEl.textContent = count;
      bmCountEl.style.display = count > 0 ? '' : 'none';
    }
  }

  // =====================================================
  //  KEYBOARD SHORTCUTS
  // =====================================================

  function attachKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Don't fire if user is typing in input/textarea/select
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      // Don't fire with modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch(e.key.toLowerCase()) {
        case 'p':
          e.preventDefault();
          var wizardBtn = document.querySelector('[data-open-wizard]');
          if (wizardBtn) wizardBtn.click();
          break;
        case 'e':
          e.preventDefault();
          var eligChk = document.getElementById('filter-eligible-only');
          if (eligChk) {
            eligChk.checked = !eligChk.checked;
            applyFiltersAndSort();
          }
          break;
        case '/':
          e.preventDefault();
          var searchInput = document.getElementById('filter-search');
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          break;
        case '?':
          e.preventDefault();
          toggleShortcutsModal();
          break;
      }
    });

    // Shortcuts footer link
    var shortcutsLink = document.getElementById('shortcuts-link');
    if (shortcutsLink) {
      shortcutsLink.addEventListener('click', function(e) {
        e.preventDefault();
        toggleShortcutsModal();
      });
    }
  }

  function toggleShortcutsModal() {
    var existing = document.getElementById('shortcuts-modal');
    if (existing) {
      existing.remove();
      return;
    }

    var modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.className = 'fixed inset-0 z-[80] flex items-center justify-center';
    modal.innerHTML =
      '<div class="absolute inset-0 bg-black/40" style="backdrop-filter:blur(4px)"></div>' +
      '<div class="relative bg-white dark:bg-surface-card-dark rounded-card shadow-2xl max-w-sm w-full mx-4 overflow-hidden" style="animation:fadeIn 0.2s ease-out">' +
        '<div class="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">' +
          '<h3 class="font-heading font-bold text-lg text-content-primary dark:text-content-dark flex items-center gap-2"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"/></svg> Keyboard Shortcuts</h3>' +
          '<button type="button" class="shortcuts-modal-close w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">' +
            '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="p-5 space-y-3">' +
          shortcutRow('P', 'Open profile wizard') +
          shortcutRow('E', 'Toggle "Eligible Only" filter') +
          shortcutRow('/', 'Focus search input') +
          shortcutRow('?', 'Show this shortcuts list') +
          shortcutRow('Esc', 'Close modals & tooltips') +
        '</div>' +
        '<div class="px-5 pb-4 text-xs text-content-secondary dark:text-content-dark-muted">Shortcuts work when no input is focused</div>' +
      '</div>';

    document.body.appendChild(modal);

    // Close handlers
    modal.querySelector('.absolute').addEventListener('click', function() { modal.remove(); });
    modal.querySelector('.shortcuts-modal-close').addEventListener('click', function() { modal.remove(); });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', handler); }
    });
  }

  function shortcutRow(key, desc) {
    return '<div class="flex items-center justify-between">' +
      '<span class="text-sm text-content-primary dark:text-content-dark">' + desc + '</span>' +
      '<kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono font-semibold text-content-primary dark:text-content-dark">' + key + '</kbd>' +
    '</div>';
  }

  // =====================================================
  //  INLINE JOB DATA
  // =====================================================

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

  // =====================================================
  //  BOOTSTRAP
  // =====================================================

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
