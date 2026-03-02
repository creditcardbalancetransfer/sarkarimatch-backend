import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'

export const PrivacyPage: FC = () => {
  const lastUpdated = 'March 1, 2026'

  return (
    <Layout
      meta={{
        title: 'Privacy Policy — SarkariMatch',
        description:
          'SarkariMatch privacy policy: No user accounts, no server-side data storage, no cookies, no trackers. All preferences stored in browser localStorage only.',
        ogTitle: 'Privacy Policy — SarkariMatch',
        ogDescription:
          'We don\'t collect, store, or process any personal data. Learn about our privacy-first approach.',
      }}
      currentPath="/privacy"
    >
      <section class="py-12 md:py-20 px-4">
        <div class="max-w-3xl mx-auto">
          {/* Page header */}
          <div class="mb-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 mb-4">
              <svg class="w-3.5 h-3.5 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="text-xs font-semibold text-brand-success uppercase tracking-wider">
                Your Privacy Matters
              </span>
            </div>
            <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-content-primary dark:text-white mb-2">
              Privacy Policy
            </h1>
            <p class="text-sm text-content-secondary dark:text-content-dark-muted">
              Last updated: {lastUpdated}
            </p>
            <div class="w-16 h-1 bg-brand-success rounded-full mt-4" />
          </div>

          {/* Content */}
          <div class="bg-white dark:bg-surface-card-dark rounded-card p-6 md:p-8 shadow-card space-y-8">
            {/* TL;DR */}
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-btn p-4">
              <p class="text-sm font-semibold text-brand-success mb-1">TL;DR</p>
              <p class="text-sm text-content-primary dark:text-content-dark leading-relaxed">
                We don't collect any personal data. Period. No accounts, no cookies, no analytics,
                no trackers. All your preferences live in your browser and never leave your device.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                1. Overview
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch ("we," "our," or "the Service") is a government job aggregation
                and matching platform designed with privacy as a core principle. This Privacy Policy
                explains what data we do (and do not) handle when you use our website. We are
                committed to complete transparency about our data practices.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                2. No User Accounts
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch does not require or offer user registration or login. There are no
                user accounts, no email verification, no phone number collection, and no
                social login integrations. You use the service anonymously, always.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                3. No Server-Side Data Storage
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                We do not store any user data on our servers. We do not maintain databases of
                user profiles, preferences, search histories, or behavior patterns. Our servers
                serve static web content and publicly available job notification data — nothing
                more.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                4. Client-Side Storage (localStorage)
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed mb-3">
                To provide personalized job matching, SarkariMatch stores your preferences
                entirely in your browser's <code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">localStorage</code>.
                This includes:
              </p>
              <ul class="list-disc list-inside text-content-secondary dark:text-content-dark-muted leading-relaxed space-y-1 ml-2">
                <li>Theme preference (light/dark mode)</li>
                <li>Language preference (English/Hindi)</li>
                <li>Job filter preferences (education level, age, category, sector)</li>
                <li>Bookmarked job notifications</li>
              </ul>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed mt-3">
                This data <strong class="text-content-primary dark:text-white">never leaves your device</strong>.
                It is not transmitted to our servers or any third party. You can clear this data
                at any time by clearing your browser's site data or using the "Reset Preferences"
                option within the app.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                5. No Cookies
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch does not use cookies — not first-party, not third-party. We do not
                use session cookies, tracking cookies, or any form of HTTP cookies.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                6. No Third-Party Trackers or Analytics
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                We do not embed Google Analytics, Facebook Pixel, Hotjar, Mixpanel, or any other
                analytics or tracking scripts. There are no advertising networks, no retargeting
                pixels, and no behavior tracking of any kind. We do not know who visits our site,
                how often, or what they do on it.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                7. No Personal Data Processing
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                Since we do not collect, store, or transmit any personal data, we do not process
                personal data in any form. The eligibility criteria you enter (education, age,
                category) are processed entirely in your browser using client-side JavaScript.
                These values are never sent to our servers.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                8. Compliance with India's DPDP Act 2023
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                The Digital Personal Data Protection Act, 2023 (DPDP Act) governs the processing
                of digital personal data in India. Since SarkariMatch does not collect, store,
                process, or share any personal data — digital or otherwise — the obligations
                under the DPDP Act regarding data fiduciaries, consent management, data principal
                rights, and data protection impact assessments do not apply to our service.
                Nevertheless, we fully support the spirit of the DPDP Act and have designed our
                platform to be inherently privacy-preserving.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                9. External Links
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch may contain links to official government notification portals and
                other external websites. We are not responsible for the privacy practices of these
                external sites. We encourage you to review the privacy policies of any external
                site you visit through our links.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                10. Changes to This Policy
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                If we ever change our privacy practices (which we do not anticipate), we will
                update this page with the new date and a clear description of what changed. Our
                commitment to zero data collection is fundamental to our mission and is unlikely
                to change.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                11. Contact
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                If you have any questions about this Privacy Policy, you may reach out to us at{' '}
                <span class="font-medium text-brand-primary dark:text-blue-400">
                  privacy@sarkarimatch.in
                </span>{' '}
                (placeholder).
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
