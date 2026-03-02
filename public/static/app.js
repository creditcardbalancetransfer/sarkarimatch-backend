/**
 * SarkariMatch — Client-side interactions
 * Dark mode, language toggle, mobile menu, count-up stats,
 * scroll reveal, bookmarks, countdown timers, carousel scroll
 */

(function () {
  'use strict';

  // ─── Dark Mode ───────────────────────────────────────────────
  var THEME_KEY = 'sarkarimatch_theme';

  function getTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    var current = getTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  applyTheme(getTheme());

  var themeBtn = document.getElementById('theme-toggle');
  var themeBtnMobile = document.getElementById('theme-toggle-mobile');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });


  // ─── Language Toggle ─────────────────────────────────────────
  var LANG_KEY = 'sarkarimatch_lang';

  function getLang() { return localStorage.getItem(LANG_KEY) || 'EN'; }

  function setLangDisplay(lang) {
    var display = lang === 'EN' ? 'EN' : 'हि';
    var el1 = document.getElementById('lang-text');
    var el2 = document.getElementById('lang-text-mobile');
    if (el1) el1.textContent = display;
    if (el2) el2.textContent = display;
  }

  function toggleLang() {
    var next = getLang() === 'EN' ? 'HI' : 'EN';
    localStorage.setItem(LANG_KEY, next);
    setLangDisplay(next);
  }

  setLangDisplay(getLang());

  var langBtn = document.getElementById('lang-toggle');
  var langBtnMobile = document.getElementById('lang-toggle-mobile');
  if (langBtn) langBtn.addEventListener('click', toggleLang);
  if (langBtnMobile) langBtnMobile.addEventListener('click', toggleLang);


  // ─── Mobile Menu ─────────────────────────────────────────────
  var menuBtn = document.getElementById('mobile-menu-btn');
  var closeBtnMenu = document.getElementById('mobile-menu-close');
  var menu = document.getElementById('mobile-menu');
  var overlay = document.getElementById('mobile-overlay');
  var hamburgerIcon = document.getElementById('hamburger-icon');
  var closeIcon = document.getElementById('close-icon');

  function openMenu() {
    if (!menu || !overlay) return;
    menu.classList.add('open');
    overlay.classList.remove('hidden');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
    if (closeIcon) closeIcon.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (closeBtnMenu) closeBtnMenu.focus();
  }

  function closeMenu() {
    if (!menu || !overlay) return;
    menu.classList.remove('open');
    overlay.classList.add('hidden');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
    document.body.style.overflow = '';
    if (menuBtn) menuBtn.focus();
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtnMenu) closeBtnMenu.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('open')) closeMenu();
  });

  if (menu) {
    menu.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && menu && menu.classList.contains('open')) closeMenu();
  });


  // ─── Count-Up Animation (Stats Bar) ─────────────────────────
  function formatIndian(num) {
    var str = num.toString();
    var last3 = str.substring(str.length - 3);
    var rest = str.substring(0, str.length - 3);
    if (rest !== '') last3 = ',' + last3;
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last3;
  }

  function animateCountUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var customDisplay = el.getAttribute('data-display');
    var duration = 2000;
    var start = null;

    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = Math.floor(ease(p) * target);
      if (p < 1) {
        el.textContent = (target >= 10000 ? formatIndian(val) : val) + suffix;
        requestAnimationFrame(step);
      } else {
        el.textContent = customDisplay || ((target >= 10000 ? formatIndian(target) : target) + suffix);
      }
    }
    requestAnimationFrame(step);
  }

  var statsBar = document.getElementById('stats-bar');
  var statsAnimated = false;

  if (statsBar && 'IntersectionObserver' in window) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          statsBar.querySelectorAll('.stat-number').forEach(animateCountUp);
          statsObs.unobserve(statsBar);
        }
      });
    }, { threshold: 0.3 });
    statsObs.observe(statsBar);
  }


  // ─── Scroll Reveal ───────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-section').forEach(function (s) {
      revealObs.observe(s);
    });
  }


  // ─── Education Scroll Fades ──────────────────────────────────
  var eduScroll = document.querySelector('.edu-scroll');
  var fadeL = document.querySelector('.edu-fade-left');
  var fadeR = document.querySelector('.edu-fade-right');

  function updateEduFades() {
    if (!eduScroll || !fadeL || !fadeR) return;
    var sl = eduScroll.scrollLeft;
    var max = eduScroll.scrollWidth - eduScroll.clientWidth;
    fadeL.classList.toggle('hidden', sl <= 8);
    fadeR.classList.toggle('hidden', sl >= max - 8);
  }

  if (eduScroll) {
    eduScroll.addEventListener('scroll', updateEduFades, { passive: true });
    updateEduFades();
  }


  // ─── Bookmarks (localStorage) ────────────────────────────────
  var BM_KEY = 'sarkarimatch_bookmarks';

  function getBookmarks() {
    try {
      var data = JSON.parse(localStorage.getItem(BM_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  function saveBookmarks(arr) {
    localStorage.setItem(BM_KEY, JSON.stringify(arr));
  }

  function isBookmarked(slug) {
    return getBookmarks().indexOf(slug) !== -1;
  }

  function toggleBookmark(slug) {
    var bm = getBookmarks();
    var idx = bm.indexOf(slug);
    if (idx === -1) {
      bm.push(slug);
    } else {
      bm.splice(idx, 1);
    }
    saveBookmarks(bm);
    return idx === -1; // returns true if now bookmarked
  }

  // Initialize bookmark buttons
  function initBookmarks() {
    var btns = document.querySelectorAll('.bookmark-btn');
    btns.forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      if (!slug) return;

      // Set initial state
      if (isBookmarked(slug)) {
        btn.classList.add('bookmarked');
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var nowBookmarked = toggleBookmark(slug);
        if (nowBookmarked) {
          btn.classList.add('bookmarked');
          btn.setAttribute('aria-label', 'Remove bookmark');
        } else {
          btn.classList.remove('bookmarked');
          btn.setAttribute('aria-label', 'Bookmark this job');
        }
      });
    });
  }

  initBookmarks();


  // ─── Live Countdown Timers ───────────────────────────────────
  var countdownTimers = document.querySelectorAll('.countdown-timer');

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function updateCountdowns() {
    var now = Date.now();

    countdownTimers.forEach(function (timer) {
      var deadline = timer.getAttribute('data-deadline');
      if (!deadline) return;

      var target = new Date(deadline).getTime();
      var diff = target - now;

      var daysEl = timer.querySelector('.countdown-days');
      var hoursEl = timer.querySelector('.countdown-hours');
      var minsEl = timer.querySelector('.countdown-mins');
      var secsEl = timer.querySelector('.countdown-secs');

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = pad2(days);
      if (hoursEl) hoursEl.textContent = pad2(hours);
      if (minsEl) minsEl.textContent = pad2(mins);
      if (secsEl) secsEl.textContent = pad2(secs);
    });
  }

  if (countdownTimers.length > 0) {
    updateCountdowns(); // immediate
    setInterval(updateCountdowns, 1000); // every second
  }


  // ─── Closing-Soon Carousel Drag Scroll ───────────────────────
  var carousel = document.querySelector('.closing-carousel');

  if (carousel) {
    var isDown = false;
    var startX = 0;
    var scrollLeftStart = 0;

    carousel.addEventListener('mousedown', function (e) {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      startX = e.pageX - carousel.offsetLeft;
      scrollLeftStart = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', function () {
      isDown = false;
      carousel.style.cursor = '';
    });

    carousel.addEventListener('mouseup', function () {
      isDown = false;
      carousel.style.cursor = '';
    });

    carousel.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - carousel.offsetLeft;
      var walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeftStart - walk;
    });

    // Set grab cursor
    carousel.style.cursor = 'grab';
  }

})();
