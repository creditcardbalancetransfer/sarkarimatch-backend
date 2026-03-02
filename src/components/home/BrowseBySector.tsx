import type { FC } from 'hono/jsx'

const sectors = [
  {
    slug: 'banking',
    icon: '🏦',
    name: 'Banking & Insurance',
    color: '#1E40AF',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderHover: 'hover:border-blue-500',
    count: '52 Active Jobs',
  },
  {
    slug: 'railway',
    icon: '🚂',
    name: 'Railway',
    color: '#DC2626',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderHover: 'hover:border-red-500',
    count: '38 Active Jobs',
  },
  {
    slug: 'ssc',
    icon: '📋',
    name: 'SSC (Staff Selection)',
    color: '#059669',
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    borderHover: 'hover:border-green-500',
    count: '45 Active Jobs',
  },
  {
    slug: 'upsc',
    icon: '🏛️',
    name: 'UPSC (Civil Services)',
    color: '#7C3AED',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    borderHover: 'hover:border-purple-500',
    count: '12 Active Jobs',
  },
  {
    slug: 'defence',
    icon: '🎖️',
    name: 'Defence & Military',
    color: '#92400E',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    borderHover: 'hover:border-amber-700',
    count: '28 Active Jobs',
  },
  {
    slug: 'teaching',
    icon: '👨‍🏫',
    name: 'Teaching & Education',
    color: '#0891B2',
    bgClass: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderHover: 'hover:border-cyan-500',
    count: '34 Active Jobs',
  },
  {
    slug: 'state-psc',
    icon: '🏢',
    name: 'State PSC',
    color: '#BE185D',
    bgClass: 'bg-pink-50 dark:bg-pink-900/20',
    borderHover: 'hover:border-pink-500',
    count: '67 Active Jobs',
  },
  {
    slug: 'police',
    icon: '👮',
    name: 'Police & Paramilitary',
    color: '#1E293B',
    bgClass: 'bg-slate-100 dark:bg-slate-800/40',
    borderHover: 'hover:border-slate-500',
    count: '23 Active Jobs',
  },
  {
    slug: 'psu',
    icon: '🏭',
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
                class={`w-12 h-12 rounded-xl ${sector.bgClass} flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
              >
                <span aria-hidden="true">{sector.icon}</span>
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
