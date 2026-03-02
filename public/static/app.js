/**
 * SarkariMatch — Client-side interactions
 * Dark mode, language toggle, mobile menu
 */

(function () {
  'use strict';

  // ─── Dark Mode ───────────────────────────────────────────────
  const THEME_KEY = 'sarkarimatch_theme';

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

  // Apply theme on load (backup — inline script handles initial flash)
  applyTheme(getTheme());

  // Bind toggle buttons
  var themeBtn = document.getElementById('theme-toggle');
  var themeBtnMobile = document.getElementById('theme-toggle-mobile');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      toggleTheme();
    });
  }
  if (themeBtnMobile) {
    themeBtnMobile.addEventListener('click', function () {
      toggleTheme();
    });
  }

  // Listen for system theme changes
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

  // Apply saved language
  setLangDisplay(getLang());

  // Bind toggle buttons
  var langBtn = document.getElementById('lang-toggle');
  var langBtnMobile = document.getElementById('lang-toggle-mobile');

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      toggleLang();
    });
  }
  if (langBtnMobile) {
    langBtnMobile.addEventListener('click', function () {
      toggleLang();
    });
  }


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
    // Focus trap: focus the close button
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
    // Return focus to hamburger
    if (menuBtn) menuBtn.focus();
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close mobile menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close menu on navigation link click (mobile)
  if (menu) {
    var navLinks = menu.querySelectorAll('a[href]');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });
  }

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && menu && menu.classList.contains('open')) {
      closeMenu();
    }
  });

})();
