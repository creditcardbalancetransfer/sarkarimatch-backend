import type { FC } from 'hono/jsx'

const stats = [
  { id: 'stat-notifications', target: 500, suffix: '+', label: 'Active Notifications' },
  { id: 'stat-vacancies', target: 150000, suffix: '+', label: 'Total Vacancies', display: '1,50,000+' },
  { id: 'stat-states', target: 28, suffix: '+', label: 'States Covered' },
  { id: 'stat-free', target: 100, suffix: '%', label: 'Free Forever' },
]

export const StatsBar: FC = () => {
  return (
    <section
      id="stats-bar"
      class="relative bg-brand-primary dark:bg-[#1E3A8A] overflow-hidden"
      aria-label="Platform statistics"
    >
      {/* Subtle pattern overlay */}
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0); background-size: 32px 32px;" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.id} class="text-center group">
              <div class="mb-1.5">
                <span
                  id={stat.id}
                  class="stat-number text-3xl sm:text-4xl font-heading font-extrabold text-white tabular-nums"
                  data-target={stat.target}
                  data-suffix={stat.suffix}
                  data-display={stat.display || ''}
                >
                  0{stat.suffix}
                </span>
              </div>
              <p class="text-sm text-white/70 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
