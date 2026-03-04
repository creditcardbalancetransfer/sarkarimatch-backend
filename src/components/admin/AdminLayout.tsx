import type { FC, PropsWithChildren } from 'hono/jsx'

type AdminLayoutProps = PropsWithChildren<{
  pageTitle: string
  currentPath: string
}>

/**
 * AdminLayout wraps all /admin/* pages (except /admin/login).
 * Renders full HTML shell with sidebar, topbar, bottom mobile nav, and main content area.
 * Auth gate + sidebar + responsive behavior powered by /static/admin.js.
 *
 * MOBILE-FIRST DESIGN:
 * - Bottom navigation bar for mobile (iOS/Android style)
 * - Touch-friendly tap targets (min 44px)
 * - Safe area insets for notched devices
 * - Swipe gesture support for sidebar
 * - Pull-to-refresh visual feedback
 * - Larger form controls on mobile
 * - Full-screen modals on small screens
 */
export const AdminLayout: FC<AdminLayoutProps> = ({ pageTitle, currentPath, children }) => {
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'grid', mobileLabel: 'Home' },
    { href: '/admin/upload', label: 'Upload New Job', icon: 'upload', mobileLabel: 'Upload' },
    { href: '/admin/jobs', label: 'Manage Jobs', icon: 'briefcase', mobileLabel: 'Jobs' },
    { href: '/admin/settings', label: 'Settings', icon: 'settings', mobileLabel: 'Settings' },
  ]

  const iconPaths: Record<string, string> = {
    grid: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />',
    upload: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />',
    briefcase: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />',
    settings: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
  }

  return (
    <html lang="en" dir="ltr" class="">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#1E40AF" />
        <title>{pageTitle} - SarkariMatch Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    fontFamily: {
                      body: ['Inter', 'system-ui', 'sans-serif'],
                      heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                    },
                    colors: {
                      brand: {
                        primary: '#1E40AF',
                        'primary-light': '#3B82F6',
                        secondary: '#F59E0B',
                        'secondary-dark': '#D97706',
                        success: '#059669',
                        warning: '#D97706',
                        danger: '#DC2626',
                      },
                      surface: {
                        light: '#F8FAFC',
                        card: '#FFFFFF',
                        dark: '#0F172A',
                        'card-dark': '#1E293B',
                      },
                      content: {
                        primary: '#1E293B',
                        secondary: '#64748B',
                        dark: '#E2E8F0',
                        'dark-muted': '#94A3B8',
                      },
                    },
                    borderRadius: { card: '12px', btn: '8px', pill: '9999px' },
                    spacing: {
                      'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
                      'safe-top': 'env(safe-area-inset-top, 0px)',
                    },
                  },
                },
              }
            `,
          }}
        />

        {/* Dark mode init */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('sarkarimatch_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ═══ Safe area support ═══ */
              :root {
                --sat: env(safe-area-inset-top, 0px);
                --sab: env(safe-area-inset-bottom, 0px);
                --sal: env(safe-area-inset-left, 0px);
                --sar: env(safe-area-inset-right, 0px);
              }

              /* ═══ Touch optimization ═══ */
              * { -webkit-tap-highlight-color: transparent; }
              input, select, textarea, button { font-size: 16px !important; } /* Prevent iOS zoom */
              @media (min-width: 1024px) {
                input, select, textarea, button { font-size: 14px !important; }
              }

              /* ═══ Scrollbar hide for mobile ═══ */
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              .hide-scrollbar::-webkit-scrollbar { display: none; }

              /* ═══ Sidebar transitions ═══ */
              .admin-sidebar {
                transition: width 0.2s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
              }
              .admin-sidebar .nav-label,
              .admin-sidebar .brand-text,
              .admin-sidebar .collapse-label {
                transition: opacity 0.15s ease, width 0.15s ease;
                white-space: nowrap; overflow: hidden;
              }
              .admin-sidebar.collapsed .nav-label,
              .admin-sidebar.collapsed .brand-text,
              .admin-sidebar.collapsed .collapse-label {
                opacity: 0; width: 0;
              }
              .admin-sidebar.collapsed .nav-tooltip { display: block; }
              .admin-sidebar:not(.collapsed) .nav-tooltip { display: none; }

              /* ═══ Bottom nav (mobile only) ═══ */
              .mobile-bottom-nav {
                padding-bottom: calc(8px + var(--sab));
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
              }

              /* ═══ Stat counter animation ═══ */
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .stat-card { animation: fadeInUp 0.4s ease-out forwards; opacity: 0; }
              .stat-card:nth-child(1) { animation-delay: 0.05s; }
              .stat-card:nth-child(2) { animation-delay: 0.1s; }
              .stat-card:nth-child(3) { animation-delay: 0.15s; }
              .stat-card:nth-child(4) { animation-delay: 0.2s; }

              /* ═══ Page transition ═══ */
              .admin-page-content {
                animation: pageFadeIn 0.25s ease-out forwards;
              }
              @keyframes pageFadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }

              /* ═══ Skeleton loader ═══ */
              .skeleton {
                background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                background-size: 200% 100%;
                animation: skeleton-shimmer 1.5s infinite;
                border-radius: 6px;
              }
              .dark .skeleton {
                background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
                background-size: 200% 100%;
              }
              @keyframes skeleton-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }

              /* ═══ Toast animations ═══ */
              @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
              }
              @keyframes slideInUp {
                from { opacity: 0; transform: translateY(100%); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes toastProgress {
                from { width: 100%; }
                to { width: 0%; }
              }

              /* ═══ Mobile toast (bottom center) ═══ */
              @media (max-width: 639px) {
                #admin-toast-container {
                  top: auto !important; right: auto !important;
                  bottom: calc(80px + var(--sab)) !important;
                  left: 16px !important; right: 16px !important;
                  align-items: stretch !important;
                }
                #admin-toast-container > div {
                  animation: slideInUp 0.3s ease-out forwards !important;
                  min-width: auto !important;
                }
              }

              /* ═══ Keyboard shortcut badge ═══ */
              .kbd {
                display: inline-flex; align-items: center; justify-content: center;
                min-width: 24px; height: 22px; padding: 0 6px;
                font-size: 11px; font-weight: 600; font-family: 'Inter', monospace;
                background: #f1f5f9; border: 1px solid #e2e8f0;
                border-radius: 4px; box-shadow: 0 1px 0 #cbd5e1; color: #475569;
              }
              .dark .kbd {
                background: #334155; border-color: #475569;
                box-shadow: 0 1px 0 #1e293b; color: #94a3b8;
              }

              /* ═══ Mobile-optimized form controls ═══ */
              @media (max-width: 639px) {
                .admin-page-content input[type="text"],
                .admin-page-content input[type="number"],
                .admin-page-content input[type="url"],
                .admin-page-content input[type="email"],
                .admin-page-content input[type="password"],
                .admin-page-content input[type="date"],
                .admin-page-content select,
                .admin-page-content textarea {
                  padding: 12px !important;
                  border-radius: 10px !important;
                  min-height: 44px;
                }
                .admin-page-content button {
                  min-height: 44px;
                }
                .admin-page-content fieldset {
                  padding: 16px !important;
                  border-radius: 14px !important;
                }
              }

              /* ═══ Swipe indicator ═══ */
              .swipe-indicator {
                width: 36px; height: 4px; border-radius: 2px;
                background: rgba(0,0,0,0.2); margin: 8px auto;
              }
              .dark .swipe-indicator { background: rgba(255,255,255,0.2); }

              /* ═══ Active state for mobile buttons ═══ */
              @media (max-width: 1023px) {
                button:active, a:active {
                  transform: scale(0.97);
                  transition: transform 0.1s ease;
                }
              }

              /* ═══ Mobile modal fullscreen ═══ */
              @media (max-width: 639px) {
                .mobile-fullscreen-modal > div:last-child > div:last-child {
                  border-radius: 16px 16px 0 0 !important;
                  max-height: 90vh !important;
                  width: 100% !important;
                  margin-top: auto !important;
                  max-width: 100% !important;
                }
              }

              /* ═══ Pull-to-refresh visual ═══ */
              .pull-indicator {
                position: fixed; top: 0; left: 50%; transform: translateX(-50%) translateY(-40px);
                width: 36px; height: 36px; border-radius: 50%;
                background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                display: flex; align-items: center; justify-content: center;
                transition: transform 0.3s ease; z-index: 100; opacity: 0;
              }
              .dark .pull-indicator { background: #1e293b; }

              /* ═══ Haptic feedback simulation ═══ */
              @keyframes haptic {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(0.95); }
              }
              .haptic { animation: haptic 0.15s ease; }
            `,
          }}
        />
      </head>
      <body class="font-body bg-gray-50 dark:bg-slate-950 text-content-primary dark:text-content-dark min-h-screen overscroll-none">

        {/* Auth gate overlay */}
        <div id="admin-auth-gate" class="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center">
          <div class="flex flex-col items-center gap-3">
            <svg class="w-8 h-8 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm text-gray-400">Verifying session...</p>
          </div>
        </div>

        {/* Mobile sidebar backdrop */}
        <div id="sidebar-backdrop" class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm hidden lg:hidden" aria-hidden="true"></div>

        {/* ═══════ SIDEBAR (desktop + mobile drawer) ═══════ */}
        <aside
          id="admin-sidebar"
          class="admin-sidebar fixed top-0 left-0 z-40 h-full w-[280px] lg:w-[260px] flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 -translate-x-full lg:translate-x-0"
          role="navigation"
          aria-label="Admin navigation"
        >
          {/* Mobile swipe indicator */}
          <div class="swipe-indicator lg:hidden"></div>

          {/* Brand */}
          <div class="h-16 flex items-center gap-3 px-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div class="w-9 h-9 lg:w-8 lg:h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 lg:w-4.5 lg:h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div class="brand-text">
              <p class="font-heading font-bold text-sm text-content-primary dark:text-white leading-tight">SarkariMatch</p>
              <p class="text-[10px] text-content-secondary dark:text-content-dark-muted leading-tight">Admin Panel</p>
            </div>

            {/* Close button (mobile only) */}
            <button
              id="sidebar-close-btn"
              type="button"
              class="lg:hidden ml-auto p-2 -mr-2 rounded-lg text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close navigation"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav Items */}
          <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto hide-scrollbar">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href !== '/admin/dashboard' && currentPath.startsWith(item.href))
              return (
                <a
                  key={item.href}
                  href={item.href}
                  class={`group relative flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-xl lg:rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-content-primary dark:hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d={''} />
                  </svg>
                  <span class="nav-label">{item.label}</span>
                  {/* Tooltip for collapsed mode (desktop) */}
                  <span class="nav-tooltip absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg hidden whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                  </span>
                </a>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div class="px-3 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3 shrink-0">
            {/* Collapse toggle (desktop only) */}
            <button
              id="sidebar-collapse-btn"
              type="button"
              class="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              aria-label="Toggle sidebar"
            >
              <svg id="collapse-icon" class="w-5 h-5 shrink-0 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
              <span class="collapse-label">Collapse</span>
            </button>

            {/* View Site link */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 px-3 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <span class="nav-label">View Site</span>
            </a>

            {/* Logout */}
            <button
              id="admin-logout-btn"
              type="button"
              class="w-full flex items-center gap-3 px-3 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span class="nav-label">Logout</span>
            </button>
          </div>
        </aside>

        {/* ═══════ MAIN WRAPPER ═══════ */}
        <div id="admin-main-wrapper" class="lg:ml-[260px] min-h-screen flex flex-col transition-[margin] duration-200">

          {/* ─── Top Bar ─── */}
          <header class="sticky top-0 z-20 h-14 lg:h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                id="mobile-menu-btn"
                type="button"
                class="lg:hidden p-2.5 -ml-2 rounded-xl text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                aria-label="Open navigation menu"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

              {/* Page title */}
              <h1 class="font-heading font-bold text-base lg:text-lg text-content-primary dark:text-white truncate">{pageTitle}</h1>
            </div>

            <div class="flex items-center gap-1.5 lg:gap-2 shrink-0">
              {/* Dark mode toggle */}
              <button
                id="admin-theme-toggle"
                type="button"
                class="p-2.5 rounded-xl text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                aria-label="Toggle dark mode"
              >
                <svg class="w-5 h-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <svg class="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              </button>

              {/* Notification bell */}
              <button
                type="button"
                class="relative p-2.5 rounded-xl text-content-secondary dark:text-content-dark-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                aria-label="Notifications"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* View Site (desktop only) */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                class="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-content-secondary dark:text-content-dark-muted border border-gray-200 dark:border-gray-700 rounded-btn hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                <span>View Site</span>
              </a>
            </div>
          </header>

          {/* ─── Content Area ─── */}
          <main class="flex-1 p-3 sm:p-4 lg:p-8 pb-24 lg:pb-8 overflow-y-auto admin-page-content">
            {children}
          </main>
        </div>

        {/* ═══════ MOBILE BOTTOM NAVIGATION ═══════ */}
        <nav
          id="mobile-bottom-nav"
          class="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-slate-900/95 border-t border-gray-200 dark:border-gray-800"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div class="flex items-stretch justify-around px-2 pt-1.5">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href !== '/admin/dashboard' && currentPath.startsWith(item.href))
              return (
                <a
                  key={item.href}
                  href={item.href}
                  data-nav-icon={item.icon}
                  class={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl min-w-[60px] transition-colors ${
                    isActive
                      ? 'text-brand-primary dark:text-blue-400'
                      : 'text-content-secondary dark:text-content-dark-muted'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={isActive ? '2' : '1.5'}>
                    <path stroke-linecap="round" stroke-linejoin="round" d={''} />
                  </svg>
                  <span class={`text-[10px] font-medium leading-tight ${isActive ? 'font-semibold' : ''}`}>{item.mobileLabel}</span>
                  {isActive && (
                    <div class="w-1 h-1 rounded-full bg-brand-primary dark:bg-blue-400 mt-0.5"></div>
                  )}
                </a>
              )
            })}
          </div>
        </nav>

        {/* ═══ Session Timeout Overlay ═══ */}
        <div id="session-timeout-overlay" class="fixed inset-0 z-[250] hidden" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-slate-950/90 backdrop-blur-sm"></div>
          <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div class="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full sm:max-w-sm p-6 text-center">
              <div class="swipe-indicator sm:hidden"></div>
              <div class="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-heading font-bold text-content-primary dark:text-white mb-1">Session Expired</h3>
              <p class="text-sm text-content-secondary dark:text-content-dark-muted mb-5">Your session has timed out due to inactivity. Your unsaved data is preserved.</p>
              <button type="button" id="session-relogin-btn" class="w-full px-5 py-3 bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60">
                Log In Again
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Keyboard Shortcuts Help Overlay ═══ */}
        <div id="shortcuts-overlay" class="fixed inset-0 z-[150] hidden" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" id="shortcuts-backdrop"></div>
          <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div class="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full sm:max-w-md p-6">
              <div class="swipe-indicator sm:hidden"></div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-heading font-bold text-content-primary dark:text-white">Keyboard Shortcuts</h3>
                <button type="button" id="shortcuts-close-btn" class="p-2 rounded-lg text-content-secondary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between py-2"><span class="text-content-secondary dark:text-content-dark-muted">Search jobs</span><div class="flex items-center gap-1"><span class="kbd">Ctrl</span><span class="text-content-secondary">+</span><span class="kbd">K</span></div></div>
                <div class="flex items-center justify-between py-2"><span class="text-content-secondary dark:text-content-dark-muted">Upload new job</span><div class="flex items-center gap-1"><span class="kbd">Ctrl</span><span class="text-content-secondary">+</span><span class="kbd">U</span></div></div>
                <div class="flex items-center justify-between py-2"><span class="text-content-secondary dark:text-content-dark-muted">Save form</span><div class="flex items-center gap-1"><span class="kbd">Ctrl</span><span class="text-content-secondary">+</span><span class="kbd">S</span></div></div>
                <div class="flex items-center justify-between py-2"><span class="text-content-secondary dark:text-content-dark-muted">Close modal / overlay</span><span class="kbd">Esc</span></div>
                <div class="flex items-center justify-between py-2"><span class="text-content-secondary dark:text-content-dark-muted">Show this help</span><span class="kbd">?</span></div>
              </div>
              <p class="text-[10px] text-content-secondary dark:text-content-dark-muted mt-4 text-center">Use <span class="kbd" style="font-size:10px">Cmd</span> on Mac instead of <span class="kbd" style="font-size:10px">Ctrl</span></p>
            </div>
          </div>
        </div>

        {/* ═══ Global toast container ═══ */}
        <div id="admin-toast-container" class="fixed top-4 right-4 z-[100] space-y-2 flex flex-col items-end" aria-live="polite"></div>

        {/* Admin sidebar nav icon paths */}
        <script
          id="admin-nav-icon-data"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(iconPaths),
          }}
        />

        {/* Current path for JS */}
        <script
          id="admin-page-meta"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ currentPath, pageTitle }),
          }}
        />

        <script src="/static/admin.js" defer></script>
      </body>
    </html>
  )
}
