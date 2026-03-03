import type { FC } from 'hono/jsx'

const sectors = [
  {
    slug: 'banking',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />',
    name: 'Banking & Insurance',
    color: '#1E40AF',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderHover: 'hover:border-blue-500',
    count: '52 Active Jobs',
  },
  {
    slug: 'railway',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h17.25M3.375 14.25V3.375c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v10.875" />',
    name: 'Railway',
    color: '#DC2626',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderHover: 'hover:border-red-500',
    count: '38 Active Jobs',
  },
  {
    slug: 'ssc',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />',
    name: 'SSC (Staff Selection)',
    color: '#059669',
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    borderHover: 'hover:border-green-500',
    count: '45 Active Jobs',
  },
  {
    slug: 'upsc',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />',
    name: 'UPSC (Civil Services)',
    color: '#7C3AED',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    borderHover: 'hover:border-purple-500',
    count: '12 Active Jobs',
  },
  {
    slug: 'defence',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />',
    name: 'Defence & Military',
    color: '#92400E',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    borderHover: 'hover:border-amber-700',
    count: '28 Active Jobs',
  },
  {
    slug: 'teaching',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />',
    name: 'Teaching & Education',
    color: '#0891B2',
    bgClass: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderHover: 'hover:border-cyan-500',
    count: '34 Active Jobs',
  },
  {
    slug: 'state-psc',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />',
    name: 'State PSC',
    color: '#BE185D',
    bgClass: 'bg-pink-50 dark:bg-pink-900/20',
    borderHover: 'hover:border-pink-500',
    count: '67 Active Jobs',
  },
  {
    slug: 'police',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />',
    name: 'Police & Paramilitary',
    color: '#1E293B',
    bgClass: 'bg-slate-100 dark:bg-slate-800/40',
    borderHover: 'hover:border-slate-500',
    count: '23 Active Jobs',
  },
  {
    slug: 'psu',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />',
    name: 'PSU & Public Sector',
    color: '#D97706',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    borderHover: 'hover:border-orange-500',
    count: '19 Active Jobs',
  },
]

export const BrowseBySector: FC = () => {
  return (
    <section class="py-16 md:py-24 bg-white dark:bg-surface-card-dark reveal-section" id="browse-sector">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div class="text-center mb-12">
          <h2 class="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-content-primary dark:text-white mb-3">
            Browse by Sector
          </h2>
          <p class="text-base sm:text-lg text-content-secondary dark:text-content-dark-muted max-w-lg mx-auto">
            Explore government jobs across all major recruitment sectors
          </p>
        </div>

        {/* Sector grid */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector, index) => (
            <a
              key={sector.slug}
              href={`/jobs?sector=${sector.slug}`}
              class={`group flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-card border border-gray-100 dark:border-gray-800 ${sector.borderHover} dark:${sector.borderHover} transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 reveal-child reveal-stagger-${index + 1}`}
            >
              {/* Icon circle */}
              <div
                class={`w-12 h-12 rounded-xl ${sector.bgClass} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
              >
                <span class="w-6 h-6" aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">${sector.iconPath}</svg>` }} />
              </div>

              {/* Text */}
              <div class="flex-1 min-w-0">
                <h3 class="font-heading font-bold text-sm text-content-primary dark:text-white truncate">
                  {sector.name}
                </h3>
                <p class="text-xs text-content-secondary dark:text-content-dark-muted mt-0.5">
                  {sector.count}
                </p>
              </div>

              {/* Arrow */}
              <svg
                class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
