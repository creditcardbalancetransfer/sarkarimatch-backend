import type { FC } from 'hono/jsx'

type NavbarProps = {
  currentPath?: string
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
]

export const Navbar: FC<NavbarProps> = ({ currentPath = '/' }) => {
  return (
    <header
      class="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/5"
      style="backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
    >
      {/* Glassmorphism background layer */}
      <div class="absolute inset-0 bg-white/80 dark:bg-surface-dark/80 -z-10" />

      <nav
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 md:h-16"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Left: Logo */}
        <a href="/" class="flex items-center gap-1.5 group" aria-label="SarkariMatch Home">
          <span class="text-brand-secondary text-xl font-bold" aria-hidden="true">✓</span>
          <span class="font-heading font-bold text-lg md:text-xl text-brand-primary dark:text-blue-400 tracking-tight">
            SarkariMatch
          </span>
        </a>

        {/* Center: Nav links (desktop) */}
        <div class="hidden md:flex items-center gap-1" role="menubar">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                role="menuitem"
                class={`px-3 py-2 text-sm font-medium rounded-btn transition-colors duration-150 ${
                  isActive
                    ? 'text-brand-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-content-secondary dark:text-content-dark-muted hover:text-brand-primary dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div class="flex items-center gap-2 md:gap-3">
          {/* Language toggle */}
          <button
            id="lang-toggle"
            type="button"
            class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-btn text-xs font-bold border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            aria-label="Toggle language between English and Hindi"
            title="Toggle language"
          >
            <span id="lang-text">EN</span>
          </button>

          {/* Dark mode toggle */}
          <button
            id="theme-toggle"
            type="button"
            class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-btn border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {/* Sun icon (shown in dark mode) */}
            <svg id="icon-sun" class="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {/* Moon icon (shown in light mode) */}
            <svg id="icon-moon" class="w-5 h-5 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          {/* Set Your Profile button (desktop) */}
          <a
            href="#"
            data-open-wizard
            class="hidden md:inline-flex items-center px-4 py-2 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-sm rounded-pill transition-colors duration-150 shadow-sm hover:shadow-card-hover"
            role="button"
            aria-label="Set your job profile preferences"
          >
            Set Your Profile
          </a>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            type="button"
            class="md:hidden w-9 h-9 flex items-center justify-center rounded-btn text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="mobile-menu"
          >
            <svg id="hamburger-icon" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg id="close-icon" class="w-6 h-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <div
        id="mobile-menu"
        class="md:hidden fixed inset-y-0 right-0 w-72 max-w-[80vw] bg-white dark:bg-surface-card-dark shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out z-[60]"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div class="flex flex-col h-full">
          {/* Mobile menu header */}
          <div class="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800">
            <span class="font-heading font-bold text-brand-primary dark:text-blue-400">Menu</span>
            <button
              id="mobile-menu-close"
              type="button"
              class="w-9 h-9 flex items-center justify-center rounded-btn text-content-secondary dark:text-content-dark-muted hover:bg-gray-50 dark:hover:bg-white/5"
              aria-label="Close navigation menu"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile nav links */}
          <div class="flex-1 overflow-y-auto py-4 px-4">
            <div class="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    class={`px-3 py-2.5 text-sm font-medium rounded-btn transition-colors duration-150 ${
                      isActive
                        ? 'text-brand-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-content-primary dark:text-content-dark hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </a>
                )
              })}
            </div>

            {/* Mobile toggles */}
            <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              <div class="flex items-center justify-between px-3">
                <span class="text-sm text-content-secondary dark:text-content-dark-muted">Language</span>
                <button
                  id="lang-toggle-mobile"
                  type="button"
                  class="w-10 h-8 flex items-center justify-center rounded-btn text-xs font-bold border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark"
                  aria-label="Toggle language"
                >
                  <span id="lang-text-mobile">EN</span>
                </button>
              </div>
              <div class="flex items-center justify-between px-3">
                <span class="text-sm text-content-secondary dark:text-content-dark-muted">Dark Mode</span>
                <button
                  id="theme-toggle-mobile"
                  type="button"
                  class="w-10 h-8 flex items-center justify-center rounded-btn border border-gray-200 dark:border-gray-700 text-content-primary dark:text-content-dark"
                  aria-label="Toggle dark mode"
                >
                  <svg class="w-4 h-4 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <svg class="w-4 h-4 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile CTA */}
          <div class="p-4 border-t border-gray-100 dark:border-gray-800">
            <a
              href="#"
              data-open-wizard
              class="w-full flex items-center justify-center px-4 py-2.5 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold text-sm rounded-pill transition-colors duration-150"
              role="button"
            >
              Set Your Profile
            </a>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        id="mobile-overlay"
        class="md:hidden fixed inset-0 bg-black/30 z-[55] hidden"
        aria-hidden="true"
      />
    </header>
  )
}
