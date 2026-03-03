/**
 * SarkariMatch — Job Detail Page Client-Side Script
 *
 * Handles: tab switching (hash routing, fade-in, scroll-spy), eligibility checker,
 * bookmark toggle, share, document checklist, calendar export,
 * clash detector, vacancy table expand, syllabus accordion, selection stage expand,
 * FAQ accordion, similar jobs carousel, print, back-to-top.
 */
(function () {
  'use strict';

  var PROFILE_KEY = 'sarkarimatch_profile';
  var BOOKMARKS_KEY = 'sarkarimatch_bookmarks';
  var TODAY = '2026-03-03';

  // ─── Tab name to hash mapping ──────────────────────────────
  var TAB_HASH_MAP = {
    'overview': 'overview',
    'posts': 'posts',
    'how-to-apply': 'apply',
    'selection': 'selection',
    'dates': 'dates',
    'exam-pattern': 'exam'
  };
  var HASH_TAB_MAP = {};
  Object.keys(TAB_HASH_MAP).forEach(function (k) { HASH_TAB_MAP[TAB_HASH_MAP[k]] = k; });

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

  // ═══════════════════════════════════════════════════════════
  // TAB SWITCHING — with hash routing, active saffron underline,
  // 200ms fade-in, URL hash update, auto-select on load
  // ═══════════════════════════════════════════════════════════
  var tabBtns = document.querySelectorAll('.jd-tab-btn');
  var tabContents = document.querySelectorAll('.jd-tab-content');
  var currentTab = 'overview';

  function switchTab(tabName, updateHash) {
    if (!tabName) tabName = 'overview';
    currentTab = tabName;

    tabBtns.forEach(function (btn) {
      var isActive = btn.getAttribute('data-tab') === tabName;
      // Active: saffron underline + bold
      btn.classList.toggle('text-brand-secondary', isActive);
      btn.classList.toggle('dark:text-amber-400', isActive);
      btn.classList.toggle('border-brand-secondary', isActive);
      btn.classList.toggle('dark:border-amber-400', isActive);
      btn.classList.toggle('font-bold', isActive);
      // Inactive
      btn.classList.toggle('text-content-secondary', !isActive);
      btn.classList.toggle('dark:text-content-dark-muted', !isActive);
      btn.classList.toggle('border-transparent', !isActive);
      btn.classList.toggle('font-medium', !isActive);

      // Scroll active tab into view on mobile
      if (isActive) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    tabContents.forEach(function (content) {
      var isActive = content.getAttribute('data-tab-content') === tabName;
      if (isActive) {
        content.classList.remove('hidden');
        content.style.opacity = '0';
        content.style.transform = 'translateY(6px)';
        // Force reflow
        void content.offsetHeight;
        content.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      } else {
        content.classList.add('hidden');
        content.style.transition = '';
        content.style.opacity = '';
        content.style.transform = '';
      }
    });

    // Update URL hash
    if (updateHash !== false) {
      var hash = TAB_HASH_MAP[tabName] || tabName;
      if (hash !== 'overview') {
        history.replaceState(null, '', '#' + hash);
      } else {
        history.replaceState(null, '', window.location.pathname);
      }
    }
  }

  // Tab button click handlers
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // On load: check URL hash for tab selection
  function getTabFromHash() {
    var hash = window.location.hash.replace('#', '').toLowerCase();
    return HASH_TAB_MAP[hash] || null;
  }

  // Listen for hash changes (back/forward)
  window.addEventListener('hashchange', function () {
    var tab = getTabFromHash();
    if (tab) switchTab(tab, false);
  });

  // ═══════════════════════════════════════════════════════════
  // SCROLL-SPY — Highlight active tab based on scroll position
  // ═══════════════════════════════════════════════════════════
  function initScrollSpy() {
    var tabsBar = document.querySelector('.jd-tabs');
    if (!tabsBar) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          var tabName = entry.target.getAttribute('data-tab-content');
          if (tabName && tabName !== currentTab) {
            // Only update tab styling, not URL hash (too noisy)
            tabBtns.forEach(function (btn) {
              var isActive = btn.getAttribute('data-tab') === tabName;
              btn.classList.toggle('text-brand-secondary', isActive);
              btn.classList.toggle('dark:text-amber-400', isActive);
              btn.classList.toggle('border-brand-secondary', isActive);
              btn.classList.toggle('dark:border-amber-400', isActive);
              btn.classList.toggle('font-bold', isActive);
              btn.classList.toggle('text-content-secondary', !isActive);
              btn.classList.toggle('dark:text-content-dark-muted', !isActive);
              btn.classList.toggle('border-transparent', !isActive);
              btn.classList.toggle('font-medium', !isActive);
            });
          }
        }
      });
    }, { threshold: [0.3], rootMargin: '-80px 0px -50% 0px' });

    tabContents.forEach(function (el) {
      if (!el.classList.contains('hidden')) {
        observer.observe(el);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // OVERVIEW — Read More / Read Less
  // ═══════════════════════════════════════════════════════════
  function initReadMore() {
    var text = document.getElementById('overview-summary-text');
    var btn = document.getElementById('overview-read-more');
    if (!text || !btn) return;

    var fullText = text.textContent || '';
    if (fullText.length <= 300) return;

    var shortText = fullText.substring(0, 300).replace(/\s+\S*$/, '') + '...';
    var isExpanded = false;

    text.textContent = shortText;
    btn.classList.remove('hidden');
    btn.textContent = 'Read More';

    btn.addEventListener('click', function () {
      isExpanded = !isExpanded;
      text.textContent = isExpanded ? fullText : shortText;
      btn.textContent = isExpanded ? 'Read Less' : 'Read More';
    });
  }

  // ═══════════════════════════════════════════════════════════
  // VACANCY TABLE — Row expansion, user category highlight
  // ═══════════════════════════════════════════════════════════
  function initVacancyTable() {
    // Row expansion
    var expandRows = document.querySelectorAll('[data-expand-row]');
    expandRows.forEach(function (row) {
      row.addEventListener('click', function () {
        var idx = row.getAttribute('data-expand-row');
        var detail = document.querySelector('[data-expand-detail="' + idx + '"]');
        var icon = row.querySelector('.jd-expand-icon');
        if (detail) {
          detail.classList.toggle('hidden');
          if (icon) icon.style.transform = detail.classList.contains('hidden') ? '' : 'rotate(180deg)';
        }
      });
    });

    // Highlight user's category column
    highlightUserCategory();
  }

  function highlightUserCategory() {
    var profile = getProfile();
    if (!profile) return;
    var cat = normCat(profile.category);
    if (!cat) return;
    var catKey = cat.toLowerCase();

    // Highlight header & cells
    document.querySelectorAll('[data-cat="' + catKey + '"]').forEach(function (el) {
      el.classList.add('jd-cat-highlight');
    });

    // Show eligibility column
    document.querySelectorAll('.jd-elig-col').forEach(function (el) {
      el.classList.remove('hidden');
    });

    // Fill in eligibility cells
    var posts = job.posts || [];
    posts.forEach(function (post, i) {
      var cell = document.querySelector('[data-elig-cell="' + i + '"]');
      if (!cell) return;
      var result = evaluatePostForWidget(profile, post);
      var icon, cls;
      if (result.label === 'eligible') {
        icon = '\u2705'; cls = 'text-green-600 dark:text-green-400';
      } else if (result.label === 'partial') {
        icon = '\u26a0\ufe0f'; cls = 'text-amber-600 dark:text-amber-400';
      } else {
        icon = '\u274c'; cls = 'text-red-600 dark:text-red-400';
      }
      cell.innerHTML = '<span class="' + cls + ' text-xs font-semibold">' + icon + ' ' + result.score + '%</span>';
    });

    // Mobile cards: add eligibility border color
    var mobileCards = document.querySelectorAll('.jd-vacancy-card');
    mobileCards.forEach(function (card) {
      var idx = parseInt(card.getAttribute('data-post-idx'));
      if (isNaN(idx) || !posts[idx]) return;
      var result = evaluatePostForWidget(profile, posts[idx]);
      if (result.label === 'eligible') {
        card.classList.add('jd-card-eligible');
      } else if (result.label === 'partial') {
        card.classList.add('jd-card-partial');
      } else {
        card.classList.add('jd-card-ineligible');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // HOW TO APPLY — Document Checklist with localStorage
  // ═══════════════════════════════════════════════════════════
  function initDocChecklist() {
    var checks = document.querySelectorAll('.jd-doc-check');
    if (!checks.length) return;

    var storageKey = 'sarkarimatch_docs_' + job.slug;
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) { saved = {}; }

    var total = checks.length;

    function updateProgress() {
      var checked = 0;
      checks.forEach(function (cb) { if (cb.checked) checked++; });
      var pct = Math.round((checked / total) * 100);
      var bar = document.getElementById('docs-progress-bar');
      var txt = document.getElementById('docs-progress-text');
      if (bar) bar.style.width = pct + '%';
      if (txt) txt.textContent = checked + ' of ' + total + ' documents ready';
    }

    // Restore saved state
    checks.forEach(function (cb) {
      var idx = cb.getAttribute('data-doc-idx');
      if (saved[idx]) cb.checked = true;

      cb.addEventListener('change', function () {
        var state = {};
        checks.forEach(function (c) {
          state[c.getAttribute('data-doc-idx')] = c.checked;
        });
        localStorage.setItem(storageKey, JSON.stringify(state));
        updateProgress();
      });
    });

    updateProgress();
  }

  // ═══════════════════════════════════════════════════════════
  // SELECTION PROCESS — Expandable stage cards
  // ═══════════════════════════════════════════════════════════
  function initSelectionStages() {
    var stages = document.querySelectorAll('.jd-stage-card');
    stages.forEach(function (card) {
      card.addEventListener('click', function () {
        var desc = card.querySelector('.jd-stage-desc');
        var chevron = card.querySelector('.jd-stage-chevron');
        if (desc) {
          desc.classList.toggle('hidden');
          if (chevron) chevron.style.transform = desc.classList.contains('hidden') ? '' : 'rotate(180deg)';
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // IMPORTANT DATES — Add to Calendar (.ics)
  // ═══════════════════════════════════════════════════════════
  function initCalendar() {
    var btn = document.getElementById('add-to-calendar-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var title = btn.getAttribute('data-event-title') || 'Application Deadline';
      var dateStr = btn.getAttribute('data-event-date');
      var url = btn.getAttribute('data-event-url') || '';
      if (!dateStr) return;

      var d = new Date(dateStr);
      var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
      var fmt = function (dt) {
        return dt.getFullYear() + pad(dt.getMonth() + 1) + pad(dt.getDate());
      };

      var ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SarkariMatch//Job Reminder//EN',
        'BEGIN:VEVENT',
        'DTSTART;VALUE=DATE:' + fmt(d),
        'DTEND;VALUE=DATE:' + fmt(d),
        'SUMMARY:' + title,
        'DESCRIPTION:Apply before the deadline!\\nApply here: ' + url,
        'URL:' + url,
        'BEGIN:VALARM',
        'TRIGGER:-P3D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: ' + title + ' is in 3 days!',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'sarkarimatch-reminder.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // IMPORTANT DATES — Clash Detector
  // ═══════════════════════════════════════════════════════════
  function initClashDetector() {
    var container = document.getElementById('clash-detector');
    if (!container) return;

    var profile = getProfile();
    if (!profile) return;

    var bookmarks = getBookmarks();
    if (!bookmarks.length && !job) return;

    var lastDate = job.important_dates.last_date;
    var examDate = job.important_dates.exam_date;
    if (!lastDate) return;

    if (bookmarks.length > 0) {
      container.classList.remove('hidden');
      container.innerHTML = '<div class="jd-info-box jd-info-box-blue">' +
        '<div class="flex items-start gap-3">' +
        '<span class="shrink-0 text-lg">\ud83d\udd0d</span>' +
        '<div>' +
        '<h3 class="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">Date Clash Check</h3>' +
        '<p class="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">You have <strong>' + bookmarks.length + '</strong> bookmarked job(s). Check their dates on the <a href="/jobs" class="underline font-medium">Jobs page</a> to avoid scheduling conflicts with this notification\'s last date (' + formatDateShortJS(lastDate) + ')' + (examDate ? ' and exam date (' + formatDateShortJS(examDate) + ')' : '') + '.</p>' +
        '</div></div></div>';
    }
  }

  function formatDateShortJS(dateStr) {
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  // ═══════════════════════════════════════════════════════════
  // EXAM PATTERN — Syllabus Accordion
  // ═══════════════════════════════════════════════════════════
  function initSyllabusAccordion() {
    var triggers = document.querySelectorAll('.jd-accordion-trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var idx = trigger.getAttribute('data-accordion');
        var body = document.querySelector('[data-accordion-body="' + idx + '"]');
        var chevron = trigger.querySelector('.jd-accordion-chevron');
        var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          if (body) body.classList.add('hidden');
          trigger.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.classList.remove('rotate-180');
        } else {
          if (body) body.classList.remove('hidden');
          trigger.setAttribute('aria-expanded', 'true');
          if (chevron) chevron.classList.add('rotate-180');
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // FAQ ACCORDION
  // ═══════════════════════════════════════════════════════════
  function initFAQAccordion() {
    var triggers = document.querySelectorAll('.jd-faq-trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var idx = trigger.getAttribute('data-faq');
        var body = document.querySelector('[data-faq-body="' + idx + '"]');
        var chevron = trigger.querySelector('.jd-faq-chevron');
        var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          if (body) body.classList.add('hidden');
          trigger.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.classList.remove('rotate-180');
        } else {
          if (body) body.classList.remove('hidden');
          trigger.setAttribute('aria-expanded', 'true');
          if (chevron) chevron.classList.add('rotate-180');
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // SIMILAR JOBS CAROUSEL
  // ═══════════════════════════════════════════════════════════
  function initSimilarCarousel() {
    var carousel = document.getElementById('similar-carousel');
    var prevBtn = document.getElementById('similar-prev');
    var nextBtn = document.getElementById('similar-next');
    if (!carousel) return;

    var scrollAmount = 296; // 280px card + 16px gap

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PRINT BUTTON
  // ═══════════════════════════════════════════════════════════
  function initPrint() {
    var btn = document.getElementById('print-page-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      // Show all tab contents for print
      var hiddenTabs = [];
      tabContents.forEach(function (tc) {
        if (tc.classList.contains('hidden')) {
          tc.classList.remove('hidden');
          tc.style.opacity = '1';
          tc.style.transform = 'none';
          hiddenTabs.push(tc);
        }
      });
      window.print();
      // Re-hide tabs after print
      setTimeout(function () {
        hiddenTabs.forEach(function (tc) {
          tc.classList.add('hidden');
          tc.style.opacity = '';
          tc.style.transform = '';
        });
      }, 500);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // BACK TO TOP
  // ═══════════════════════════════════════════════════════════
  function initBackToTop() {
    var btn = document.getElementById('jd-back-to-top');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // ELIGIBILITY ENGINE (mini version for detail page)
  // ═══════════════════════════════════════════════════════════
  function getProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      return (p && p.dob) ? p : null;
    } catch (e) { return null; }
  }

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
        details.age = 'Your age: ' + ageStr + '. Required: ' + ageMin + '\u2013' + ageMax + (relax > 0 ? ' (+' + relax + ' relaxation \u2192 ' + effMax + ')' : '') + '. Under age limit.';
      } else if (age.years > effMax) {
        checks.age = 'fail';
        details.age = 'Your age: ' + ageStr + '. Required: ' + ageMin + '\u2013' + ageMax + (relax > 0 ? ' (+' + relax + ' relaxation \u2192 ' + effMax + ')' : '') + '. Over age limit.';
      } else {
        checks.age = 'pass';
        details.age = 'Your age: ' + ageStr + '. Required: ' + ageMin + '\u2013' + ageMax + (relax > 0 ? ' (+' + relax + ' relaxation \u2192 ' + effMax + ')' : '') + '. Eligible.';
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
      details.education = (EDUCATION_LABELS[reqLevel] || reqLevel) + ' required. You have: ' + (EDUCATION_LABELS[(profile.education_level || '').toLowerCase()] || profile.education_level) + '. Match.';
    } else {
      checks.education = 'fail';
      details.education = (EDUCATION_LABELS[reqLevel] || reqLevel) + ' required. You have: ' + (EDUCATION_LABELS[(profile.education_level || '').toLowerCase()] || profile.education_level) + '. Does not meet.';
    }

    // Degree
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

    // Category vacancy
    var vb = (job.vacancy_breakdown || []).find(function (r) { return r.post_name === post.post_name; });
    var cat = normCat(profile.category);
    if (vb) {
      var catKey = cat.toLowerCase();
      var catVac = vb[catKey] || 0;
      if (catVac > 0) {
        checks.vacancy = 'pass'; details.vacancy = cat + ' vacancies: ' + catVac + '. Available.';
      } else if ((vb.ur || 0) > 0) {
        checks.vacancy = 'pass'; details.vacancy = cat + ' vacancies: 0. UR vacancies available (' + vb.ur + ').';
      } else if (vb.total === 0) {
        checks.vacancy = 'pass'; details.vacancy = 'Exam/eligibility test \u2014 no specific vacancies.';
      } else {
        checks.vacancy = 'fail'; details.vacancy = cat + ' vacancies: 0. No vacancy available.';
      }
    } else {
      checks.vacancy = 'unknown'; details.vacancy = 'Vacancy breakdown not available for this post.';
    }

    // Score
    var weights = { age: 30, education: 25, degree: 20, percentage: 10, vacancy: 15 };
    var score = 0;
    Object.keys(checks).forEach(function (k) {
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
    var profile = getProfile();
    if (!profile) return showNoProfile();

    var noProfileEl = document.getElementById('eligibility-no-profile');
    var resultsEl = document.getElementById('eligibility-results');
    if (noProfileEl) noProfileEl.classList.add('hidden');
    if (resultsEl) resultsEl.classList.remove('hidden');

    var posts = job.posts || [];
    var results = posts.map(function (p) { return evaluatePostForWidget(profile, p); });

    var eligibleCount = results.filter(function (r) { return r.label === 'eligible'; }).length;
    var partialCount = results.filter(function (r) { return r.label === 'partial'; }).length;

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

      // Mini badges
      if (posts.length > 1) {
        var badgesHtml = '<div class="flex flex-wrap gap-1.5 mt-2">';
        results.forEach(function (r, i) {
          var bc = r.label === 'eligible' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : r.label === 'partial' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
          var icon = r.label === 'eligible' ? '\u2705' : r.label === 'partial' ? '\u26a0\ufe0f' : '\u274c';
          badgesHtml += '<span class="px-2 py-0.5 text-[10px] font-semibold rounded-pill ' + bc + '" title="' + escHtml(r.post_name) + '">' + icon + ' Post ' + (i + 1) + ' (' + r.score + '%)</span>';
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

    // Also update vacancy table highlighting
    highlightUserCategory();
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

  // ═══════════════════════════════════════════════════════════
  // BOOKMARK TOGGLE
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  // SHARE FUNCTIONALITY
  // ═══════════════════════════════════════════════════════════
  function initShare() {
    var shareBtn = document.getElementById('jd-share-btn');
    var shareDropdown = document.getElementById('share-dropdown');
    var shareCopy = document.getElementById('share-copy');
    if (!shareBtn) return;

    var pageUrl = window.location.href;
    var pageTitle = job.notification_title || document.title;

    shareBtn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({
          title: pageTitle,
          text: pageTitle + ' - Apply Now on SarkariMatch',
          url: pageUrl,
        }).catch(function () { });
        return;
      }
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

  // ═══════════════════════════════════════════════════════════
  // KEYBOARD ACCESSIBILITY — Tab nav with arrows
  // ═══════════════════════════════════════════════════════════
  function initKeyboardNav() {
    var tabContainer = document.querySelector('.jd-tabs');
    if (!tabContainer) return;

    tabContainer.addEventListener('keydown', function (e) {
      var tabs = Array.from(tabBtns);
      var currentIdx = tabs.findIndex(function (t) { return t.getAttribute('data-tab') === currentTab; });
      if (currentIdx === -1) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var nextIdx = (currentIdx + 1) % tabs.length;
        tabs[nextIdx].focus();
        switchTab(tabs[nextIdx].getAttribute('data-tab'));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prevIdx = (currentIdx - 1 + tabs.length) % tabs.length;
        tabs[prevIdx].focus();
        switchTab(tabs[prevIdx].getAttribute('data-tab'));
      } else if (e.key === 'Home') {
        e.preventDefault();
        tabs[0].focus();
        switchTab(tabs[0].getAttribute('data-tab'));
      } else if (e.key === 'End') {
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        switchTab(tabs[tabs.length - 1].getAttribute('data-tab'));
      }
    });

    // Add ARIA roles for tabs
    tabBtns.forEach(function (btn, i) {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    });
    tabContents.forEach(function (tc) {
      tc.setAttribute('role', 'tabpanel');
      tc.setAttribute('tabindex', '0');
    });
    if (tabContainer) {
      tabContainer.querySelector('.flex')?.setAttribute('role', 'tablist');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PROFILE CHANGE LISTENER
  // ═══════════════════════════════════════════════════════════
  window.addEventListener('sarkarimatch-profile-changed', function () {
    renderEligibility();
    initClashDetector();
  });

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════
  function init() {
    // Tab: auto-select from hash or default to Overview
    var hashTab = getTabFromHash();
    if (hashTab) {
      switchTab(hashTab, false);
    } else {
      switchTab('overview', false);
    }

    // Initialize all features
    initReadMore();
    initVacancyTable();
    initDocChecklist();
    initSelectionStages();
    initCalendar();
    initClashDetector();
    initSyllabusAccordion();
    initFAQAccordion();
    initSimilarCarousel();
    initPrint();
    initBackToTop();
    initScrollSpy();
    initKeyboardNav();
    renderEligibility();
    initBookmark();
    initShare();
  }

  // Run init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
