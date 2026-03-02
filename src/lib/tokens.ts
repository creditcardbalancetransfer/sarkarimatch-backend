// Design tokens for SarkariMatch
export const tokens = {
  colors: {
    primary: '#1E40AF',
    primaryLight: '#3B82F6',
    secondary: '#F59E0B',
    secondaryDark: '#D97706',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    bgLight: '#F8FAFC',
    cardLight: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    bgDark: '#0F172A',
    cardDark: '#1E293B',
    textDark: '#E2E8F0',
    footerBg: '#1E293B',
    footerBgDark: '#0F172A',
  },
  radius: {
    card: '12px',
    button: '8px',
    pill: '9999px',
  },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.1)',
    hover: '0 4px 6px rgba(0,0,0,0.1)',
  },
  navbar: {
    heightDesktop: '64px',
    heightMobile: '56px',
  },
} as const

export type MetaData = {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonical?: string
}
