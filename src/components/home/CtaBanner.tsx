import type { FC } from 'hono/jsx'

export const CtaBanner: FC = () => {
  return (
    <section class="relative overflow-hidden" id="cta-banner">
      {/* Background */}
      <div class="absolute inset-0 bg-gradient-to-br from-brand-secondary via-[#F59E0B] to-[#D97706] dark:from-[#92400E] dark:via-[#B45309] dark:to-[#78350F] -z-10" />

      {/* Decorative pattern */}
      <div
        class="absolute inset-0 -z-[5] opacity-10"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0); background-size: 24px 24px;"
      />

      {/* Decorative blobs */}
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center relative">
        {/* Icon */}
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
          <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Heading */}
        <h2 class="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white leading-tight mb-4">
          Ready to Find Your Perfect
          <br class="hidden sm:block" />
          Government Job?
        </h2>

        {/* Subtext */}
        <p class="text-base sm:text-lg text-white/90 max-w-lg mx-auto mb-8 leading-relaxed">
          Set your profile in 30 seconds. See only the jobs you qualify for.
          No sign-up. No email. Just results.
        </p>

        {/* CTA button */}
        <a
          href="#"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-brand-secondary-dark font-bold text-base sm:text-lg rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
          role="button"
        >
          Get Started — It's Free
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>

        {/* Subtle trust line */}
        <p class="mt-6 text-xs text-white/60 flex items-center justify-center gap-3">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            No account needed
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            30 seconds setup
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            100% free
          </span>
        </p>
      </div>
    </section>
  )
}
