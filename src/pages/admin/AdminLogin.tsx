import type { FC } from 'hono/jsx'

/**
 * Admin Login page.
 * Standalone page with its own HTML shell (no AdminLayout).
 * All auth logic runs client-side via /static/admin-login.js.
 */
export const AdminLoginPage: FC = () => {
  return (
    <html lang="en" dir="ltr" class="">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Login - SarkariMatch</title>
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
                      },
                    },
                    borderRadius: { btn: '8px', card: '12px' },
                  },
                },
              }
            `,
          }}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                20%, 40%, 60%, 80% { transform: translateX(6px); }
              }
              .shake { animation: shake 0.5s ease-in-out; }

              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(24px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }

              @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
              }
              .loading-ring { animation: pulse-glow 1.2s ease-in-out infinite; }
            `,
          }}
        />
      </head>
      <body class="font-body min-h-screen flex items-center justify-center p-4"
        style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)">

        <div class="relative z-10 w-full max-w-md fade-in-up">
          {/* Login Card */}
          <div id="login-card" class="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 sm:p-10">

            {/* Logo + Brand */}
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/20 rounded-2xl mb-4 border border-brand-primary/30">
                <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h1 class="font-heading font-bold text-2xl text-white mb-1">SarkariMatch</h1>
              <p class="text-sm text-gray-400">Admin Panel</p>
            </div>

            {/* Error Alert */}
            <div id="login-error" class="hidden mb-4 px-4 py-3 rounded-btn bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center" role="alert">
              <span>Invalid password. Please try again.</span>
            </div>

            {/* Login Form */}
            <form id="admin-login-form" autocomplete="off">
              <div class="mb-6">
                <label for="admin-password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div class="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter admin password"
                    class="w-full px-4 py-3 pr-12 bg-white/[0.07] border border-white/10 rounded-btn text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-brand-primary/40 transition-all duration-200"
                    autofocus
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 rounded"
                    aria-label="Toggle password visibility"
                  >
                    {/* Eye icon — show */}
                    <svg id="eye-open" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {/* Eye-off icon — hide */}
                    <svg id="eye-closed" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-btn"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary hover:bg-blue-700 text-white font-semibold text-sm rounded-btn transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span id="login-btn-text">Enter Admin Panel</span>
                {/* Spinner (hidden by default) */}
                <svg id="login-spinner" class="hidden w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </form>

            {/* Footer */}
            <p class="text-center text-xs text-gray-600 mt-6">
              Protected area. Authorized personnel only.
            </p>
          </div>

          {/* Back to site */}
          <div class="text-center mt-6">
            <a
              href="/"
              class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60 rounded px-2 py-1"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to SarkariMatch</span>
            </a>
          </div>
        </div>

        <script src="/static/admin-login.js" defer></script>
      </body>
    </html>
  )
}
