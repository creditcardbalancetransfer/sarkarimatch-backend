/**
 * admin.js
 * Client-side logic for all admin pages wrapped by AdminLayout.
 *
 * Responsibilities:
 * 1. Auth gate — verify token, redirect to /admin/login if invalid
 * 2. Sidebar collapse/expand and mobile drawer
 * 3. Dark mode toggle
 * 4. Dashboard stat counter animation
 * 5. Inject SVG icon paths into sidebar nav items
 * 6. Bookmark count from localStorage
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════
  //  CONSTANTS
  // ═══════════════════════════════════════════════
  var ADMIN_HASH = 'e7fb06e08e53bd012d6ba2ca259c852c62c6707f44bc3f1d08434bfe117f6f16';
  var TOKEN_KEY = 'sarkarimatch_admin_token';
  var SESSION_TTL = 24 * 60 * 60 * 1000;
  var SIDEBAR_KEY = 'sarkarimatch_admin_sidebar';
  var THEME_KEY = 'sarkarimatch_theme';
  var BOOKMARK_KEY = 'sarkarimatch_bookmarks';

  // ═══════════════════════════════════════════════
  //  1. AUTH GATE
  // ═══════════════════════════════════════════════
  var authGate = document.getElementById('admin-auth-gate');

  function isAuthenticated() {
    var token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    var parts = token.split('|');
    if (parts.length !== 2 || parts[0] !== ADMIN_HASH) return false;
    var ts = parseInt(parts[1], 10);
    return !isNaN(ts) && (Date.now() - ts < SESSION_TTL);
  }

  if (!isAuthenticated()) {
    window.location.replace('/admin/login');
    return; // Stop executing rest of script
  }

  // Authenticated — hide gate
  if (authGate) {
    authGate.style.display = 'none';
  }

  // ═══════════════════════════════════════════════
  //  2. INJECT SVG ICONS INTO SIDEBAR NAV
  // ═══════════════════════════════════════════════
  var iconDataEl = document.getElementById('admin-nav-icon-data');
  if (iconDataEl) {
    try {
      var iconPaths = JSON.parse(iconDataEl.textContent || '{}');
      var navLinks = document.querySelectorAll('#admin-sidebar nav a');
      var iconKeys = ['grid', 'upload', 'briefcase', 'settings'];
      navLinks.forEach(function (link, idx) {
        if (idx < iconKeys.length) {
          var key = iconKeys[idx];
          var svg = link.querySelector('svg');
          if (svg && iconPaths[key]) {
            svg.innerHTML = iconPaths[key];
          }
        }
      });
    } catch (e) {
      // Silent fail
    }
  }

  // ═══════════════════════════════════════════════
  //  3. SIDEBAR LOGIC
  // ═══════════════════════════════════════════════
  var sidebar = document.getElementById('admin-sidebar');
  var mainWrapper = document.getElementById('admin-main-wrapper');
  var backdrop = document.getElementById('sidebar-backdrop');
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');
  var collapseBtn = document.getElementById('sidebar-collapse-btn');
  var collapseIcon = document.getElementById('collapse-icon');
  var logoutBtn = document.getElementById('admin-logout-btn');

  var isCollapsed = localStorage.getItem(SIDEBAR_KEY) === 'collapsed';
  var isMobileOpen = false;

  function applySidebarState() {
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
      sidebar.style.width = '64px';
      mainWrapper.style.marginLeft = '64px';
      collapseIcon.style.transform = 'rotate(180deg)';
    } else {
      sidebar.classList.remove('collapsed');
      sidebar.style.width = '260px';
      mainWrapper.style.marginLeft = '260px';
      collapseIcon.style.transform = 'rotate(0deg)';
    }
  }

  // On desktop, apply saved state
  function checkDesktop() {
    return window.innerWidth >= 1024;
  }

  if (checkDesktop()) {
    applySidebarState();
  } else {
    // Mobile: sidebar hidden, main full width
    mainWrapper.style.marginLeft = '0';
  }

  // Collapse toggle (desktop)
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function () {
      isCollapsed = !isCollapsed;
      localStorage.setItem(SIDEBAR_KEY, isCollapsed ? 'collapsed' : 'expanded');
      applySidebarState();
    });
  }

  // Mobile menu toggle
  function openMobileMenu() {
    isMobileOpen = true;
    sidebar.classList.add('translate-x-0');
    sidebar.classList.remove('-translate-x-full');
    sidebar.style.width = '260px';
    backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    isMobileOpen = false;
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      if (isMobileOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileMenu);
  }

  // Handle resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (checkDesktop()) {
        closeMobileMenu();
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        applySidebarState();
      } else {
        if (!isMobileOpen) {
          sidebar.classList.add('-translate-x-full');
          sidebar.classList.remove('translate-x-0');
        }
        mainWrapper.style.marginLeft = '0';
      }
    }, 100);
  });

  // Escape key closes mobile menu
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMobileOpen) {
      closeMobileMenu();
    }
  });

  // ═══════════════════════════════════════════════
  //  4. LOGOUT
  // ═══════════════════════════════════════════════
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace('/admin/login');
    });
  }

  // ═══════════════════════════════════════════════
  //  5. DARK MODE TOGGLE
  // ═══════════════════════════════════════════════
  var themeToggle = document.getElementById('admin-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      }
    });
  }

  // ═══════════════════════════════════════════════
  //  6. DASHBOARD STAT COUNTER ANIMATION
  // ═══════════════════════════════════════════════
  var statElements = document.querySelectorAll('[data-count-target]');

  // Populate bookmark count from localStorage
  var bookmarkEl = document.querySelector('[data-stat-key="Total Bookmarks"]');
  if (bookmarkEl) {
    try {
      var bookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
      var count = Array.isArray(bookmarks) ? bookmarks.length : 0;
      bookmarkEl.setAttribute('data-count-target', String(count));
    } catch (e) {
      bookmarkEl.setAttribute('data-count-target', '0');
    }
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count-target'), 10);
    if (isNaN(target) || target === 0) {
      el.textContent = '0';
      return;
    }

    var duration = 800; // ms
    var startTime = null;
    var startVal = 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // Start animations after a brief delay
  setTimeout(function () {
    statElements.forEach(animateCounter);
  }, 300);

  // ═══════════════════════════════════════════════
  //  7. SIDEBAR TOOLTIP HOVER (collapsed mode)
  // ═══════════════════════════════════════════════
  var navLinks = document.querySelectorAll('#admin-sidebar nav a');
  navLinks.forEach(function (link) {
    var tooltip = link.querySelector('.nav-tooltip');
    if (!tooltip) return;

    link.addEventListener('mouseenter', function () {
      if (sidebar.classList.contains('collapsed')) {
        tooltip.style.display = 'block';
      }
    });
    link.addEventListener('mouseleave', function () {
      tooltip.style.display = '';
    });
  });

})();
