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
 * 7. Keyboard shortcuts (Ctrl+K, Ctrl+U, Ctrl+S, Escape, ?)
 * 8. Session timeout after 30 min inactivity
 * 9. Global toast helper (window.showAdminToast)
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════
  //  CONSTANTS
  // ═══════════════════════════════════════════════
  var ADMIN_HASH = 'e7fb06e08e53bd012d6ba2ca259c852c62c6707f44bc3f1d08434bfe117f6f16';
  var TOKEN_KEY = 'sarkarimatch_admin_token';
  var SESSION_TTL = 24 * 60 * 60 * 1000;
  var INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
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
  var sidebarNavLinks = document.querySelectorAll('#admin-sidebar nav a');
  sidebarNavLinks.forEach(function (link) {
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

  // ═══════════════════════════════════════════════
  //  8. KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════
  var shortcutsOverlay = document.getElementById('shortcuts-overlay');
  var shortcutsBackdrop = document.getElementById('shortcuts-backdrop');
  var shortcutsCloseBtn = document.getElementById('shortcuts-close-btn');

  function isShortcutsOpen() {
    return shortcutsOverlay && !shortcutsOverlay.classList.contains('hidden');
  }

  function openShortcuts() {
    if (shortcutsOverlay) shortcutsOverlay.classList.remove('hidden');
  }

  function closeShortcuts() {
    if (shortcutsOverlay) shortcutsOverlay.classList.add('hidden');
  }

  if (shortcutsCloseBtn) shortcutsCloseBtn.addEventListener('click', closeShortcuts);
  if (shortcutsBackdrop) shortcutsBackdrop.addEventListener('click', closeShortcuts);

  document.addEventListener('keydown', function (e) {
    var isCtrl = e.ctrlKey || e.metaKey;
    var tag = (e.target.tagName || '').toLowerCase();
    var isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    // Escape: close modals/overlays/mobile menu
    if (e.key === 'Escape') {
      if (isShortcutsOpen()) { closeShortcuts(); e.preventDefault(); return; }
      if (isMobileOpen) { closeMobileMenu(); e.preventDefault(); return; }
      // Close any visible modal
      document.querySelectorAll('[role="dialog"]:not(.hidden)').forEach(function (m) {
        if (m.id !== 'session-timeout-overlay') m.classList.add('hidden');
      });
      return;
    }

    // ? key (not in input): show shortcuts
    if (e.key === '?' && !isInput) {
      e.preventDefault();
      if (isShortcutsOpen()) closeShortcuts();
      else openShortcuts();
      return;
    }

    // Ctrl+K: focus job search
    if (isCtrl && e.key === 'k') {
      e.preventDefault();
      var searchEl = document.getElementById('jobs-search');
      if (searchEl) {
        searchEl.focus();
        searchEl.select();
      } else {
        window.location.href = '/admin/jobs';
      }
      return;
    }

    // Ctrl+U: go to upload
    if (isCtrl && e.key === 'u') {
      e.preventDefault();
      window.location.href = '/admin/upload';
      return;
    }

    // Ctrl+S: save form (trigger save-draft-btn or save-settings-btn)
    if (isCtrl && e.key === 's') {
      e.preventDefault();
      var saveBtn = document.getElementById('save-draft-btn') || document.getElementById('save-settings-btn');
      if (saveBtn) saveBtn.click();
      return;
    }
  });

  // ═══════════════════════════════════════════════
  //  9. SESSION TIMEOUT (30 min inactivity)
  // ═══════════════════════════════════════════════
  var sessionTimer = null;
  var sessionTimedOut = false;
  var sessionOverlay = document.getElementById('session-timeout-overlay');
  var reloginBtn = document.getElementById('session-relogin-btn');

  function resetSessionTimer() {
    if (sessionTimedOut) return;
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(function () {
      sessionTimedOut = true;
      if (sessionOverlay) sessionOverlay.classList.remove('hidden');
    }, INACTIVITY_TIMEOUT);
  }

  // Track activity
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
    document.addEventListener(evt, resetSessionTimer, { passive: true });
  });

  resetSessionTimer();

  if (reloginBtn) {
    reloginBtn.addEventListener('click', function () {
      window.location.href = '/admin/login';
    });
  }

  // ═══════════════════════════════════════════════
  //  10. GLOBAL TOAST HELPER
  // ═══════════════════════════════════════════════
  // Exportable toast function for use by page-specific scripts
  window.showAdminToast = function (message, type) {
    type = type || 'info';
    // Find or create toast container
    var container = document.getElementById('toast');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast';
      container.className = 'fixed top-6 right-6 z-[100] space-y-2';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    var colors = {
      success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
      info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    };
    var icons = {
      success: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
      error: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />',
      warning: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />',
      info: '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />',
    };

    var d = document.createElement('div');
    d.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium min-w-[300px] relative overflow-hidden ' + (colors[type] || colors.info);
    d.style.animation = 'slideInRight 0.3s ease-out forwards';
    var escT = document.createElement('span');
    escT.textContent = message;
    d.innerHTML =
      '<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">' + (icons[type] || icons.info) + '</svg>' +
      '<span class="flex-1"></span>' +
      '<button type="button" class="toast-close-btn p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>' +
      '<div class="absolute bottom-0 left-0 h-0.5 bg-current opacity-30" style="animation: toastProgress 4s linear forwards"></div>';
    d.querySelector('.flex-1').textContent = message;
    container.appendChild(d);
    d.querySelector('.toast-close-btn').addEventListener('click', function () { d.remove(); });
    setTimeout(function () { if (d.parentNode) d.remove(); }, 4000);
  };

})();
