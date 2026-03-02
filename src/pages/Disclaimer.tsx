import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'

export const DisclaimerPage: FC = () => {
  const lastUpdated = 'March 1, 2026'

  return (
    <Layout
      meta={{
        title: 'Disclaimer — SarkariMatch',
        description:
          'SarkariMatch disclaimer: We aggregate publicly available government notification data. Always verify from official sources. Not affiliated with any government body.',
        ogTitle: 'Disclaimer — SarkariMatch',
        ogDescription:
          'Important information about data accuracy and our relationship with government bodies.',
      }}
      currentPath="/disclaimer"
    >
      <section class="py-12 md:py-20 px-4">
        <div class="max-w-3xl mx-auto">
          {/* Page header */}
          <div class="mb-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 mb-4">
              <svg class="w-3.5 h-3.5 text-brand-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span class="text-xs font-semibold text-brand-warning uppercase tracking-wider">
                Important Notice
              </span>
            </div>
            <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-content-primary dark:text-white mb-2">
              Disclaimer
            </h1>
            <p class="text-sm text-content-secondary dark:text-content-dark-muted">
              Last updated: {lastUpdated}
            </p>
            <div class="w-16 h-1 bg-brand-warning rounded-full mt-4" />
          </div>

          {/* Content */}
          <div class="bg-white dark:bg-surface-card-dark rounded-card p-6 md:p-8 shadow-card space-y-8">
            {/* Important notice box */}
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-btn p-4">
              <p class="text-sm font-semibold text-brand-warning mb-1">Important</p>
              <p class="text-sm text-content-primary dark:text-content-dark leading-relaxed">
                SarkariMatch is an independent, informational platform. We are{' '}
                <strong>not affiliated with, endorsed by, or connected to</strong> any government
                ministry, department, commission, or recruitment body in India.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                1. Nature of Service
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch is a free, independent platform that aggregates publicly available
                government job notifications, recruitment advertisements, and exam schedules from
                official government websites, employment news publications, and gazette
                notifications. We present this publicly available information in a structured,
                searchable, and user-friendly format to help aspirants discover opportunities more
                efficiently.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                2. No Government Affiliation
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch is not affiliated with, endorsed by, sponsored by, or in any way
                officially connected with any Indian government entity including but not limited
                to: the Union Public Service Commission (UPSC), Staff Selection Commission (SSC),
                Railway Recruitment Boards (RRBs), Institute of Banking Personnel Selection
                (IBPS), any State Public Service Commission, or any other central or state
                government recruitment body. The use of government organization names on our
                platform is solely for the purpose of identifying the source of publicly available
                job notifications.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                3. Accuracy of Information
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed mb-3">
                While we make every reasonable effort to ensure that the job notification data
                displayed on SarkariMatch is accurate and up-to-date, we <strong class="text-content-primary dark:text-white">cannot guarantee</strong>{' '}
                the accuracy, completeness, or timeliness of any information on our platform.
                Government notifications may contain complex eligibility criteria, and our parsing
                of these notifications may occasionally result in:
              </p>
              <ul class="list-disc list-inside text-content-secondary dark:text-content-dark-muted leading-relaxed space-y-1 ml-2">
                <li>Incorrect or incomplete eligibility criteria extraction</li>
                <li>Missed or delayed notification listings</li>
                <li>Incorrect dates, age limits, or educational requirements</li>
                <li>Fee structures that may not reflect all categories</li>
                <li>Vacancy counts that may differ from final official numbers</li>
              </ul>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                4. Always Verify from Official Sources
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                <strong class="text-content-primary dark:text-white">
                  You must always verify all job notification details from the official
                  recruitment website or the original notification PDF before applying.
                </strong>{' '}
                SarkariMatch provides convenient links to official notification sources wherever
                available. We strongly recommend that you read the original notification in full,
                check the official website for any corrigenda or amendments, and confirm all
                eligibility criteria directly from the source before submitting any application or
                paying any application fee.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                5. Limitation of Liability
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch, its creators, contributors, and operators shall not be held liable
                for any direct, indirect, incidental, consequential, or punitive damages arising
                from the use of information on this platform. This includes, but is not limited
                to, damages resulting from missed application deadlines, incorrect eligibility
                assessments, application fee losses, or any other harm arising from reliance on
                the data displayed on our platform. Use of this service is entirely at your own
                risk.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                6. No Application Services
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                SarkariMatch does not process, submit, or handle job applications on behalf of
                users. We do not collect application fees. We do not provide admit cards,
                results, or any official correspondence. All such activities must be performed
                directly on the official recruitment portals of the respective government bodies.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                7. External Links
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                Our platform contains links to external government and third-party websites. These
                links are provided for your convenience. We do not control and are not responsible
                for the content, privacy policies, or availability of these external sites.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                8. Changes to This Disclaimer
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                We reserve the right to update this Disclaimer at any time. Changes will be posted
                on this page with an updated date. Continued use of the platform after changes
                constitutes acceptance of the updated Disclaimer.
              </p>
            </div>

            <div>
              <h2 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-3">
                9. Contact
              </h2>
              <p class="text-content-secondary dark:text-content-dark-muted leading-relaxed">
                If you believe any information on SarkariMatch is incorrect or if you have
                concerns about our content, please contact us at{' '}
                <span class="font-medium text-brand-primary dark:text-blue-400">
                  info@sarkarimatch.in
                </span>{' '}
                (placeholder). We take accuracy seriously and will investigate all reports
                promptly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
