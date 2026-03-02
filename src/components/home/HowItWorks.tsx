import type { FC } from 'hono/jsx'

const steps = [
  {
    number: '01',
    icon: 'profile',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-brand-primary dark:text-blue-400',
    title: 'Set Your Profile',
    description:
      'Enter your age, education, category & preferred sectors. Takes 30 seconds. Stored only in your browser.',
  },
  {
    number: '02',
    icon: 'target',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    iconColor: 'text-brand-success',
    title: 'Get Matched Jobs',
    description:
      'Our engine instantly filters 500+ notifications and shows only the posts you\'re eligible for — with a match score.',
  },
  {
    number: '03',
    icon: 'bell',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-brand-secondary',
    title: 'Apply Before Deadline',
    description:
      'See countdown timers, get deadline alerts, and apply directly on official websites. Never miss a closing date.',
  },
]

const StepIcon: FC<{ icon: string; bgColor: string; iconColor: string }> = ({
  icon,
  bgColor,
  iconColor,
}) => {
  const svgPaths: Record<string, string> = {
    profile:
      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    target:
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  }

  return (
    <div
      class={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center mx-auto mb-5 transition-transform duration-200 group-hover:scale-110`}
    >
      <svg
        class={`w-7 h-7 ${iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d={svgPaths[icon]}
        />
      </svg>
    </div>
  )
}

export const HowItWorks: FC = () => {
  return (
    <section class="py-16 md:py-24 bg-surface-light dark:bg-surface-dark reveal-section" id="how-it-works">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div class="text-center mb-14">
          <h2 class="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-content-primary dark:text-white mb-3">
            How SarkariMatch Works
          </h2>
          <p class="text-base sm:text-lg text-content-secondary dark:text-content-dark-muted max-w-lg mx-auto">
            3 simple steps to never miss an eligible job again
          </p>
        </div>

        {/* Steps grid */}
        <div class="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          {/* Connecting line — desktop only */}
          <div class="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-0.5 z-0">
            <div class="w-full h-full bg-gradient-to-r from-blue-200 via-green-200 to-amber-200 dark:from-blue-800 dark:via-green-800 dark:to-amber-800 rounded-full" />
            {/* Arrow heads */}
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div class="w-2.5 h-2.5 rotate-45 border-t-2 border-r-2 border-green-300 dark:border-green-700" />
            </div>
          </div>

          {steps.map((step, index) => (
            <div
              key={step.number}
              class={`group relative z-10 reveal-child reveal-stagger-${index + 1}`}
            >
              <div class="bg-white dark:bg-surface-card-dark rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center h-full">
                {/* Step icon */}
                <StepIcon
                  icon={step.icon}
                  bgColor={step.bgColor}
                  iconColor={step.iconColor}
                />

                {/* Step number */}
                <div class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-pill bg-amber-50 dark:bg-amber-900/30 mb-3">
                  <span class="text-xs font-bold text-brand-secondary tracking-wider">
                    STEP {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 class="font-heading font-bold text-lg text-content-primary dark:text-white mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p class="text-sm text-content-secondary dark:text-content-dark-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
