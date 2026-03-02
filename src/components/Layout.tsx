import type { FC, PropsWithChildren } from 'hono/jsx'
import type { MetaData } from '../lib/tokens'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

type LayoutProps = PropsWithChildren<{
  meta: MetaData
  currentPath?: string
  structuredData?: object
}>

export const Layout: FC<LayoutProps> = ({ meta, currentPath = '/', children, structuredData }) => {
  const title = meta.title
  const description = meta.description
  const ogTitle = meta.ogTitle || title
  const ogDescription = meta.ogDescription || description
  const ogImage = meta.ogImage || '/static/og-default.png'
  const ogUrl = meta.ogUrl || 'https://sarkarimatch.com'

  return (
    <html lang="en" dir="ltr" class="">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:site_name" content="SarkariMatch" />
        {meta.canonical && <link rel="canonical" href={meta.canonical} />}

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />

        {/* Schema.org JSON-LD Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        )}

        {/* Fonts — preconnect for LCP optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>

        {/* Tailwind Config */}
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
                        success: '#059669',
                        warning: '#D97706',
                        danger: '#DC2626',
                      },
                      surface: {
                        light: '#F8FAFC',
                        card: '#FFFFFF',
                        dark: '#0F172A',
                        'card-dark': '#1E293B',
                      },
                      content: {
                        primary: '#1E293B',
                        secondary: '#64748B',
                        dark: '#E2E8F0',
                        'dark-muted': '#94A3B8',
                      },
                    },
                    borderRadius: {
                      card: '12px',
                      btn: '8px',
                      pill: '9999px',
                    },
                    boxShadow: {
                      card: '0 1px 3px rgba(0,0,0,0.1)',
                      'card-hover': '0 4px 6px rgba(0,0,0,0.1)',
                    },
                  },
                },
              }
            `,
          }}
        />

        {/* Dark mode initialization - runs BEFORE render to prevent flash (CLS fix) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('sarkarimatch_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />

        <link href="/static/styles.css" rel="stylesheet" />
      </head>
      <body class="font-body bg-surface-light dark:bg-surface-dark text-content-primary dark:text-content-dark min-h-screen flex flex-col transition-colors duration-200">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-btn focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        >
          Skip to content
        </a>

        <Navbar currentPath={currentPath} />

        <main id="main-content" class="flex-1">
          {children}
        </main>

        <Footer />

        {/* Scroll-to-Top Button */}
        <button
          id="scroll-to-top"
          type="button"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>

        <script src="/static/app.js" defer></script>
      </body>
    </html>
  )
}
