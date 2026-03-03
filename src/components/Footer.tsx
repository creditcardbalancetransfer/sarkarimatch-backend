import type { FC } from 'hono/jsx'

const quickLinks = [
  { href: '/jobs', label: 'All Government Jobs' },
  { href: '/jobs?closing=true', label: 'Closing This Week' },
  { href: '/jobs?sort=newest', label: 'Latest Notifications' },
  { href: '/calendar', label: 'Exam Calendar' },
  { href: '/blog', label: 'Preparation Hub' },
]

const byEducation = [
  { href: '/jobs?education=10th', label: '10th Pass Jobs' },
  { href: '/jobs?education=12th', label: '12th Pass Jobs' },
  { href: '/jobs?education=graduate', label: 'Graduate Jobs' },
  { href: '/jobs?education=graduate', label: 'B.Tech Jobs' },
  { href: '/jobs?education=pg', label: 'MBA Jobs' },
]

const bySector = [
  { href: '/jobs?sector=banking', label: 'Banking Jobs' },
  { href: '/jobs?sector=railway', label: 'Railway Jobs' },
  { href: '/jobs?sector=ssc', label: 'SSC Jobs' },
  { href: '/jobs?sector=defence', label: 'Defence Jobs' },
  { href: '/jobs?sector=upsc', label: 'UPSC Jobs' },
  { href: '/jobs?sector=teaching', label: 'Teaching Jobs' },
]

const FooterLinkSection: FC<{ title: string; links: { href: string; label: string }[] }> = ({
  title,
  links,
}) => (
  <div>
    <h3 class="font-heading font-bold text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
      {title}
    </h3>
    <ul class="space-y-2.5" role="list">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            class="text-sm text-gray-300 dark:text-gray-400 hover:text-brand-secondary transition-colors duration-150"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
)

export const Footer: FC = () => {
  return (
    <footer class="bg-content-primary dark:bg-surface-dark border-t border-gray-800 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Footer grid */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div class="sm:col-span-2 lg:col-span-1">
            <a href="/" class="inline-flex items-center gap-1.5 mb-4">
              <svg class="w-6 h-6 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              <span class="font-heading font-bold text-xl text-white">SarkariMatch</span>
            </a>
            <p class="text-xs font-medium text-brand-secondary mb-3 tracking-wide">
              Your Jobs. Your Eligibility. Zero Noise.
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
              India's smartest government job finder. No accounts. No tracking. 100% free. Your data stays in your browser.
            </p>
          </div>

          {/* Quick Links */}
          <FooterLinkSection title="Quick Links" links={quickLinks} />

          {/* By Education */}
          <FooterLinkSection title="By Education" links={byEducation} />

          {/* By Sector */}
          <FooterLinkSection title="By Sector" links={bySector} />
        </div>

        {/* Divider */}
        <div class="border-t border-gray-700 dark:border-gray-800 mt-12 pt-8">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-gray-500 dark:text-gray-600 text-center sm:text-left">
              &copy; 2026 SarkariMatch. Not affiliated with any government body.
            </p>
            <div class="flex items-center gap-4 text-xs">
              <a
                href="/privacy"
                class="text-gray-500 dark:text-gray-600 hover:text-gray-300 transition-colors duration-150"
              >
                Privacy Policy
              </a>
              <span class="text-gray-700" aria-hidden="true">|</span>
              <a
                href="/disclaimer"
                class="text-gray-500 dark:text-gray-600 hover:text-gray-300 transition-colors duration-150"
              >
                Disclaimer
              </a>
              <span class="text-gray-700" aria-hidden="true">|</span>
              <a
                href="/about"
                class="text-gray-500 dark:text-gray-600 hover:text-gray-300 transition-colors duration-150"
              >
                About
              </a>
              <span class="text-gray-700" aria-hidden="true">|</span>
              <a
                href="#"
                id="shortcuts-link"
                class="text-gray-500 dark:text-gray-600 hover:text-gray-300 transition-colors duration-150 inline-flex items-center gap-1"
              >
                <svg class="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"/></svg> Keyboard shortcuts
              </a>
              <span class="text-gray-700" aria-hidden="true">|</span>
              <a
                href="#"
                class="text-gray-500 dark:text-gray-600 hover:text-gray-300 transition-colors duration-150"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
