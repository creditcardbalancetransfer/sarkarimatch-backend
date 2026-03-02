/**
 * SarkariMatch — Client-side interactions
 * Dark mode, language toggle, mobile menu, count-up stats, scroll reveal
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
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
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

  function getLang() {
    return localStorage.getItem(LANG_KEY) || 'EN';
  }

  function setLangDisplay(lang) {
    var langText = document.getElementById('lang-text');
    var langTextMobile = document.getElementById('lang-text-mobile');
    var display = lang === 'EN' ? 'EN' : 'हि';
    if (langText) langText.textContent = display;
    if (langTextMobile) langTextMobile.textContent = display;
  }

  function toggleLang() {
    var current = getLang();
    var next = current === 'EN' ? 'HI' : 'EN';
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
  var closeBtn = document.getElementById('mobile-menu-close');
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
    if (closeBtn) closeBtn.focus();
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
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  if (menu) {
    var navLinks = menu.querySelectorAll('a[href]');
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && menu && menu.classList.contains('open')) {
      closeMenu();
    }
  });


  // ─── Count-Up Animation (Stats Bar) ─────────────────────────
  function formatIndian(num) {
    // Format number in Indian numbering system: 1,50,000
    var str = num.toString();
    var lastThree = str.substring(str.length - 3);
    var remaining = str.substring(0, str.length - 3);
    if (remaining !== '') {
      lastThree = ',' + lastThree;
    }
    return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  }

  function animateCountUp(element) {
    var target = parseInt(element.getAttribute('data-target'), 10);
    var suffix = element.getAttribute('data-suffix') || '';
    var customDisplay = element.getAttribute('data-display');
    var duration = 2000; // 2 seconds
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutCubic(progress);
      var current = Math.floor(easedProgress * target);

      if (progress < 1) {
        if (target >= 10000) {
          element.textContent = formatIndian(current) + suffix;
        } else {
          element.textContent = current + suffix;
        }
        requestAnimationFrame(step);
      } else {
        // Final value — use custom display if provided
        if (customDisplay) {
          element.textContent = customDisplay;
        } else if (target >= 10000) {
          element.textContent = formatIndian(target) + suffix;
        } else {
          element.textContent = target + suffix;
        }
      }
    }

    requestAnimationFrame(step);
  }

  // Observe stats bar
  var statsBar = document.getElementById('stats-bar');
  var statsAnimated = false;

  if (statsBar && 'IntersectionObserver' in window) {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            var statElements = statsBar.querySelectorAll('.stat-number');
            statElements.forEach(function (el) {
              animateCountUp(el);
            });
            statsObserver.unobserve(statsBar);
          }
        });
      },
      { threshold: 0.3 }
    );
    statsObserver.observe(statsBar);
  }


  // ─── Scroll Reveal (Sections) ────────────────────────────────
  if ('IntersectionObserver' in window) {
    var revealSections = document.querySelectorAll('.reveal-section');
    if (revealSections.length > 0) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      revealSections.forEach(function (section) {
        revealObserver.observe(section);
      });
    }
  }


  // ─── Education Scroll Fade Indicators ────────────────────────
  var eduScroll = document.querySelector('.edu-scroll');
  var fadeLeft = document.querySelector('.edu-fade-left');
  var fadeRight = document.querySelector('.edu-fade-right');

  function updateEduFades() {
    if (!eduScroll || !fadeLeft || !fadeRight) return;
    var scrollLeft = eduScroll.scrollLeft;
    var maxScroll = eduScroll.scrollWidth - eduScroll.clientWidth;

    if (scrollLeft > 8) {
      fadeLeft.classList.remove('hidden');
    } else {
      fadeLeft.classList.add('hidden');
    }

    if (scrollLeft < maxScroll - 8) {
      fadeRight.classList.remove('hidden');
    } else {
      fadeRight.classList.add('hidden');
    }
  }

  if (eduScroll) {
    eduScroll.addEventListener('scroll', updateEduFades, { passive: true });
    // Initial check
    updateEduFades();
  }

})();
