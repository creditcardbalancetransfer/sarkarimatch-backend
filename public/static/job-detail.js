/**
 * SarkariMatch — Job Detail Page Client-Side Script
 *
 * Handles: tab switching, eligibility checker, bookmark toggle,
 * share functionality, and smooth interactions.
 */
(function () {
  'use strict';

  var PROFILE_KEY = 'sarkarimatch_profile';
  var BOOKMARKS_KEY = 'sarkarimatch_bookmarks';
  var TODAY = '2026-03-03';

  // ─── Education Ranks ──────────────────────────────────────
  var EDUCATION_RANKS = {
    '10th': 1, '12th': 2, 'iti': 2.5, 'diploma': 3,
    'graduate': 4, 'pg': 5, 'phd': 6
  };

  var EDUCATION_LABELS = {
    '10th': '10th Pass', '12th': '12th Pass', 'iti': 'ITI',
    'diploma': 'Diploma', 'graduate': 'Graduate', 'pg': 'Post Graduate', 'phd': 'PhD'
  };

  var CATEGORY_NORMALIZE = {
    'general': 'UR', 'ur': 'UR', 'obc': 'OBC',
    'sc': 'SC', 'st': 'ST', 'ews': 'EWS'
  };

  // ─── Read job data ────────────────────────────────────────
  var jobDataEl = document.getElementById('jd-job-data');
  if (!jobDataEl) return;
  var job;
  try { job = JSON.parse(jobDataEl.textContent || '{}'); } catch (e) { return; }

  // ─── Tab Switching ────────────────────────────────────────
  var tabBtns = document.querySelectorAll('.jd-tab-btn');
  var tabContents = document.querySelectorAll('.jd-tab-content');

  function switchTab(tabName) {
    tabBtns.forEach(function (btn) {
      var isActive = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('text-brand-secondary', isActive);
      btn.classList.toggle('dark:text-amber-400', isActive);
      btn.classList.toggle('border-brand-secondary', isActive);
      btn.classList.toggle('dark:border-amber-400', isActive);
      btn.classList.toggle('font-semibold', isActive);
      btn.classList.toggle('text-content-secondary', !isActive);
      btn.classList.toggle('dark:text-content-dark-muted', !isActive);
      btn.classList.toggle('border-transparent', !isActive);
    });
    tabContents.forEach(function (content) {
      var isActive = content.getAttribute('data-tab-content') === tabName;
      content.classList.toggle('hidden', !isActive);
      if (isActive) {
        content.style.animation = 'fadeIn 0.3s ease-out';
      }
    });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // ─── Eligibility Engine (mini version for detail page) ────
  function normCat(cat) {
    return CATEGORY_NORMALIZE[(cat || '').toLowerCase().trim()] || (cat || '').toUpperCase().trim();
  }

  function calcAge(dob, ref) {
    var b = dob.split('-').map(Number);
    var r = ref.split('-').map(Number);
    var y = r[0] - b[0], m = r[1] - b[1], d = r[2] - b[2];
    if (d < 0) { m--; d += new Date(r[0], r[1] - 1, 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { years: y, months: m, days: d };
  }

  function getRelaxation(cat, pwd, exsm, cge) {
    var c = normCat(cat);
    var base = c === 'OBC' ? 3 : (c === 'SC' || c === 'ST') ? 5 : 0;
    var add = 0;
    if (pwd && exsm) add += 10;
    else if (pwd) add += 10;
    else if (exsm) add += 5;
    if (cge) add += 5;
    return base + add;
  }

  function parseAgeRange(ageStr) {
    if (!ageStr) return { min: 0, max: 0 };
    var m = ageStr.match(/(\d+(?:\.\d+)?)\s*[–\-—]\s*(\d+(?:\.\d+)?)/);
    if (m) return { min: Math.floor(parseFloat(m[1])), max: Math.ceil(parseFloat(m[2])) };
    var maxM = ageStr.match(/maximum\s+(\d+)/i);
    if (maxM) return { min: 0, max: parseInt(maxM[1]) };
    if (/no\s+(upper\s+)?age\s+limit/i.test(ageStr)) return { min: 0, max: 99 };
    return { min: 0, max: 0 };
  }

  function inferEduLevel(text, fallback) {
    if (!text) return fallback || 'graduate';
    var l = text.toLowerCase();
    if (/ph\.?d|doctorate/i.test(l)) return 'phd';
    if (/post[- ]?graduat|master|m\.tech|m\.sc|m\.com|mba|mca/i.test(l)) return 'pg';
    if (/graduat|b\.tech|b\.e\b|b\.sc|b\.com|bachelor/i.test(l)) return 'graduate';
    if (/diploma/i.test(l)) return 'diploma';
    if (/iti|trade\s+cert/i.test(l)) return 'iti';
    if (/12th|10\+2|intermediate|higher\s+secondary/i.test(l)) return '12th';
    if (/10th|class\s+10|sslc|matricul/i.test(l)) return '10th';
    return fallback || 'graduate';
  }

  function evaluatePostForWidget(profile, post) {
    var lastDate = (job.important_dates && job.important_dates.last_date) || TODAY;
    var checks = {};
    var details = {};

    // Age
    var ar = parseAgeRange(post.age_limit);
    var ageMin = ar.min || job.age_min || 0;
    var ageMax = ar.max || job.age_max || 0;
    if (ageMin === 0 && ageMax === 0) {
      checks.age = 'pass'; details.age = 'No age limit for this post.';
    } else {
      var age = calcAge(profile.dob, lastDate);
      var relax = getRelaxation(profile.category, profile.is_pwd, profile.is_ex_serviceman, profile.is_central_govt_employee);
      var effMax = ageMax + relax;
      var ageStr = age.years + 'y ' + age.months + 'm';
      if (age.years < ageMin) {
        checks.age = 'fail';
        details.age = 'Your age: ' + ageStr + '. Required: ' + ageMin + '–' + ageMax + (relax > 0 ? ' (+' + relax + ' relaxation → ' + effMax + ')' : '') + '. Under age limit.';
      } else if (age.years > effMax) {
        checks.age = 'fail';
        details.age = 'Your age: ' + ageStr + '. Required: ' + ageMin + '–' + ageMax + (relax > 0 ? ' (+' + relax + ' relaxation → ' + effMax + ')' : '') + '. Over age limit.';
      } else {
        checks.age = 'pass';
        details.age = 'Your age: ' + ageStr + '. Required: ' + ageMin + '–' + ageMax + (relax > 0 ? ' (+' + relax + ' relaxation → ' + effMax + ')' : '') + '. Eligible.';
      }
    }

    // Education
    var reqLevel = inferEduLevel(post.education_required, job.education_level);
    var uRank = EDUCATION_RANKS[(profile.education_level || '').toLowerCase()] || 0;
    var rRank = EDUCATION_RANKS[reqLevel] || 0;
    if (uRank === 0 || rRank === 0) {
      checks.education = 'unknown';
      details.education = 'Cannot determine education comparison.';
    } else if (uRank >= rRank) {
      checks.education = 'pass';
      details.education = (EDUCATION_LABELS[reqLevel] || reqLevel) + ' required. You have: ' + (EDUCATION_LABELS[(profile.education_level||'').toLowerCase()] || profile.education_level) + '. Match.';
    } else {
      checks.education = 'fail';
      details.education = (EDUCATION_LABELS[reqLevel] || reqLevel) + ' required. You have: ' + (EDUCATION_LABELS[(profile.education_level||'').toLowerCase()] || profile.education_level) + '. Does not meet.';
    }

    // Degree — simplified: if "any discipline" in requirement, pass
    var eduReq = (post.education_required || '').toLowerCase();
    if (/any\s+discipline|any\s+degree|any\s+stream/.test(eduReq) || !profile.degree) {
      if (/any\s+discipline|any\s+degree/.test(eduReq)) {
        checks.degree = 'pass'; details.degree = 'Any degree/discipline accepted.';
      } else {
        checks.degree = 'unknown'; details.degree = 'Degree check: cannot verify.';
      }
    } else {
      checks.degree = 'unknown'; details.degree = 'Degree: ' + (profile.degree || 'not set') + '. Check notification for specific requirements.';
    }

    // Percentage
    var pctMatch = eduReq.match(/(\d+)\s*%/);
    if (pctMatch) {
      var reqPct = parseInt(pctMatch[1]);
      if (profile.percentage != null) {
        checks.percentage = profile.percentage >= reqPct ? 'pass' : 'fail';
        details.percentage = 'Minimum ' + reqPct + '% required. Your marks: ' + profile.percentage + '%.';
      } else {
        checks.percentage = 'unknown'; details.percentage = 'Minimum ' + reqPct + '% required. Marks not entered.';
      }
    } else {
      checks.percentage = 'pass'; details.percentage = 'No minimum marks specified.';
    }

    // Category vacancy (simplified)
    var vb = (job.vacancy_breakdown || []).find(function(r) { return r.post_name === post.post_name; });
    var cat = normCat(profile.category);
    if (vb) {
      var catKey = cat.toLowerCase();
      var catVac = vb[catKey] || 0;
      if (catVac > 0) {
        checks.vacancy = 'pass'; details.vacancy = cat + ' vacancies: ' + catVac + '. Available.';
      } else if ((vb.ur || 0) > 0) {
        checks.vacancy = 'pass'; details.vacancy = cat + ' vacancies: 0. UR vacancies available (' + vb.ur + ').';
      } else if (vb.total === 0) {
        checks.vacancy = 'pass'; details.vacancy = 'Exam/eligibility test — no specific vacancies.';
      } else {
        checks.vacancy = 'fail'; details.vacancy = cat + ' vacancies: 0. No vacancy available.';
      }
    } else {
      checks.vacancy = 'unknown'; details.vacancy = 'Vacancy breakdown not available for this post.';
    }

    // Score
    var weights = { age: 30, education: 25, degree: 20, percentage: 10, vacancy: 15 };
    var score = 0;
    Object.keys(checks).forEach(function(k) {
      var w = weights[k] || 0;
      if (checks[k] === 'pass') score += w;
      else if (checks[k] === 'unknown') score += w * 0.5;
    });
    score = Math.round(score);

    var label = score >= 90 ? 'eligible' : score >= 55 ? 'partial' : 'not_eligible';

    return { post_name: post.post_name, checks: checks, details: details, score: score, label: label };
  }

  // ─── Render Eligibility Widget ────────────────────────────
  function renderEligibility() {
    var profile;
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return showNoProfile();
      profile = JSON.parse(raw);
      if (!profile || !profile.dob) return showNoProfile();
    } catch (e) { return showNoProfile(); }

    var noProfileEl = document.getElementById('eligibility-no-profile');
    var resultsEl = document.getElementById('eligibility-results');
    if (noProfileEl) noProfileEl.classList.add('hidden');
    if (resultsEl) resultsEl.classList.remove('hidden');

    var posts = job.posts || [];
    var results = posts.map(function(p) { return evaluatePostForWidget(profile, p); });

    var eligibleCount = results.filter(function(r) { return r.label === 'eligible'; }).length;
    var partialCount = results.filter(function(r) { return r.label === 'partial'; }).length;
    var notCount = results.filter(function(r) { return r.label === 'not_eligible'; }).length;

    // Summary
    var summaryEl = document.getElementById('eligibility-summary');
    if (summaryEl) {
      var summaryColor = eligibleCount > 0 ? 'bg-green-50 dark:bg-green-900/20' : partialCount > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';
      var summaryIcon = eligibleCount > 0 ? '\u2705' : partialCount > 0 ? '\u26a0\ufe0f' : '\u274c';
      var summaryText = eligibleCount > 0
        ? 'Eligible for <strong>' + eligibleCount + '</strong> of ' + posts.length + ' posts'
        : partialCount > 0
          ? 'Partially eligible for <strong>' + partialCount + '</strong> of ' + posts.length + ' posts'
          : 'Not eligible for any of the ' + posts.length + ' posts';

      summaryEl.innerHTML = '<div class="flex items-center gap-3 p-3 rounded-btn ' + summaryColor + '">' +
        '<span class="text-lg">' + summaryIcon + '</span>' +
        '<div class="text-sm text-content-primary dark:text-content-dark">' + summaryText + '</div>' +
      '</div>';

      // Mini badges for each post
      if (posts.length > 1) {
        var badgesHtml = '<div class="flex flex-wrap gap-1.5 mt-2">';
        results.forEach(function(r, i) {
          var bc = r.label === 'eligible' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : r.label === 'partial' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
          var icon = r.label === 'eligible' ? '\u2705' : r.label === 'partial' ? '\u26a0\ufe0f' : '\u274c';
          badgesHtml += '<span class="px-2 py-0.5 text-[10px] font-semibold rounded-pill ' + bc + '" title="' + r.post_name + '">' + icon + ' Post ' + (i + 1) + ' (' + r.score + '%)</span>';
        });
        badgesHtml += '</div>';
        summaryEl.innerHTML += badgesHtml;
      }
    }

    // Show checks for selected post
    var currentPostIdx = 0;
    renderPostChecks(results[currentPostIdx]);

    // Post selector
    var postSelect = document.getElementById('eligibility-post-select');
    if (postSelect) {
      postSelect.addEventListener('change', function () {
        currentPostIdx = parseInt(postSelect.value) || 0;
        renderPostChecks(results[currentPostIdx]);
      });
    }
  }

  function renderPostChecks(result) {
    var checksEl = document.getElementById('eligibility-checks');
    if (!checksEl || !result) return;

    var checkOrder = [
      { key: 'age', label: 'Age', icon: '\ud83d\udcc5' },
      { key: 'education', label: 'Education', icon: '\ud83c\udf93' },
      { key: 'degree', label: 'Degree', icon: '\ud83d\udcda' },
      { key: 'percentage', label: 'Marks', icon: '\ud83d\udcaf' },
      { key: 'vacancy', label: 'Vacancy', icon: '\ud83d\udc64' },
    ];

    var html = '';
    checkOrder.forEach(function (c) {
      var status = result.checks[c.key];
      var detail = result.details[c.key] || '';
      var statusIcon, statusColor;
      if (status === 'pass') {
        statusIcon = '<svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>';
        statusColor = 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10';
      } else if (status === 'fail') {
        statusIcon = '<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
        statusColor = 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10';
      } else {
        statusIcon = '<svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>';
        statusColor = 'border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10';
      }

      html += '<div class="flex items-start gap-3 p-2.5 rounded-btn border ' + statusColor + '">' +
        '<div class="shrink-0 mt-0.5">' + statusIcon + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="text-xs font-semibold text-content-primary dark:text-content-dark">' + c.icon + ' ' + c.label + '</div>' +
          '<div class="text-xs text-content-secondary dark:text-content-dark-muted mt-0.5 leading-relaxed">' + escHtml(detail) + '</div>' +
        '</div>' +
      '</div>';
    });

    // Score bar
    var scoreColor = result.label === 'eligible' ? 'bg-green-500' : result.label === 'partial' ? 'bg-amber-500' : 'bg-red-500';
    html += '<div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">' +
      '<div class="flex items-center justify-between text-xs mb-1.5">' +
        '<span class="font-semibold text-content-primary dark:text-content-dark">Eligibility Score</span>' +
        '<span class="font-bold text-content-primary dark:text-content-dark">' + result.score + '%</span>' +
      '</div>' +
      '<div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">' +
        '<div class="h-full rounded-full transition-all duration-500 ' + scoreColor + '" style="width:' + result.score + '%"></div>' +
      '</div>' +
    '</div>';

    checksEl.innerHTML = html;
  }

  function showNoProfile() {
    var noProfileEl = document.getElementById('eligibility-no-profile');
    var resultsEl = document.getElementById('eligibility-results');
    if (noProfileEl) noProfileEl.classList.remove('hidden');
    if (resultsEl) resultsEl.classList.add('hidden');
  }

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ─── Bookmark Toggle ──────────────────────────────────────
  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function setBookmarks(arr) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(arr));
  }

  function initBookmark() {
    var btn = document.getElementById('jd-bookmark-btn');
    if (!btn) return;
    var slug = btn.getAttribute('data-slug');
    var bookmarks = getBookmarks();
    var isBookmarked = bookmarks.indexOf(slug) !== -1;

    updateBookmarkUI(btn, isBookmarked);

    btn.addEventListener('click', function () {
      var bm = getBookmarks();
      var idx = bm.indexOf(slug);
      if (idx !== -1) {
        bm.splice(idx, 1);
        updateBookmarkUI(btn, false);
      } else {
        bm.push(slug);
        updateBookmarkUI(btn, true);
      }
      setBookmarks(bm);
    });
  }

  function updateBookmarkUI(btn, isActive) {
    var outline = btn.querySelector('.bookmark-outline');
    var filled = btn.querySelector('.bookmark-filled');
    var label = btn.querySelector('.bookmark-label');
    if (isActive) {
      btn.classList.add('bookmarked');
      if (outline) outline.classList.add('hidden');
      if (filled) filled.classList.remove('hidden');
      if (label) label.textContent = 'Bookmarked';
    } else {
      btn.classList.remove('bookmarked');
      if (outline) outline.classList.remove('hidden');
      if (filled) filled.classList.add('hidden');
      if (label) label.textContent = 'Bookmark';
    }
  }

  // ─── Share Functionality ──────────────────────────────────
  function initShare() {
    var shareBtn = document.getElementById('jd-share-btn');
    var shareDropdown = document.getElementById('share-dropdown');
    var shareCopy = document.getElementById('share-copy');
    if (!shareBtn) return;

    var pageUrl = window.location.href;
    var pageTitle = job.notification_title || document.title;

    shareBtn.addEventListener('click', function () {
      // Try Web Share API first
      if (navigator.share) {
        navigator.share({
          title: pageTitle,
          text: pageTitle + ' - Apply Now on SarkariMatch',
          url: pageUrl,
        }).catch(function () {});
        return;
      }
      // Fallback: toggle dropdown
      if (shareDropdown) {
        shareDropdown.classList.toggle('hidden');
      }
    });

    if (shareCopy) {
      shareCopy.addEventListener('click', function () {
        navigator.clipboard.writeText(pageUrl).then(function () {
          shareCopy.innerHTML = '<svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Copied!';
          setTimeout(function () {
            shareCopy.innerHTML = '<svg class="w-4 h-4 text-content-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.636 8.82"/></svg> Copy Link';
          }, 2000);
          if (shareDropdown) shareDropdown.classList.add('hidden');
        });
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      if (shareDropdown && !shareBtn.contains(e.target) && !shareDropdown.contains(e.target)) {
        shareDropdown.classList.add('hidden');
      }
    });
  }

  // ─── Profile change listener ──────────────────────────────
  window.addEventListener('sarkarimatch-profile-changed', function () {
    renderEligibility();
  });

  // ─── Init ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    renderEligibility();
    initBookmark();
    initShare();
  });

  // Also run immediately if DOM already loaded
  if (document.readyState !== 'loading') {
    renderEligibility();
    initBookmark();
    initShare();
  }
})();
