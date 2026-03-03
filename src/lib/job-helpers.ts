import type { Job } from './placeholder-data'

/** SVG icon helper — returns inline SVG HTML string */
function svgIcon(path: string, cls: string = 'w-5 h-5'): string {
  return `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">${path}</svg>`
}
function svgIconFill(path: string, cls: string = 'w-5 h-5'): string {
  return `<svg class="${cls}" fill="currentColor" viewBox="0 0 24 24">${path}</svg>`
}

/** Sector SVG icon paths */
const sectorIcons: Record<string, string> = {
  banking: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />'),
  railway: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h17.25M3.375 14.25V3.375c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v10.875M7.5 10.5h.008v.008H7.5V10.5zm0-3h.008v.008H7.5V7.5z" />'),
  ssc: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />'),
  upsc: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />', 'w-5 h-5 text-purple-600'),
  defence: svgIconFill('<path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-.926 0l-7.5 6.062a.75.75 0 00.463 1.339h1.5v5.063a.75.75 0 001.5 0v-5.063h9a.75.75 0 001.5 0V9.687h1.5a.75.75 0 00.463-1.34l-7.5-6.06zM12 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 10.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm-4.5-.75a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0v-2.25zm9.75.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75z" clip-rule="evenodd" />'),
  teaching: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />'),
  state_psc: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />'),
  police: svgIconFill('<path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.932 9.563 12.348a.749.749 0 00.374 0c5.499-1.416 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />'),
  psu: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />'),
  other: svgIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />'),
}

/** Sector metadata for display */
export const sectorMeta: Record<
  Job['sector'],
  { icon: string; label: string; color: string; bgClass: string; textClass: string }
> = {
  banking: { icon: sectorIcons.banking, label: 'Banking', color: '#1E40AF', bgClass: 'bg-blue-100 dark:bg-blue-900/30', textClass: 'text-blue-800 dark:text-blue-300' },
  railway: { icon: sectorIcons.railway, label: 'Railway', color: '#DC2626', bgClass: 'bg-red-100 dark:bg-red-900/30', textClass: 'text-red-800 dark:text-red-300' },
  ssc: { icon: sectorIcons.ssc, label: 'SSC', color: '#059669', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-800 dark:text-green-300' },
  upsc: { icon: sectorIcons.upsc, label: 'UPSC', color: '#7C3AED', bgClass: 'bg-purple-100 dark:bg-purple-900/30', textClass: 'text-purple-800 dark:text-purple-300' },
  defence: { icon: sectorIcons.defence, label: 'Defence', color: '#92400E', bgClass: 'bg-amber-100 dark:bg-amber-900/30', textClass: 'text-amber-800 dark:text-amber-300' },
  teaching: { icon: sectorIcons.teaching, label: 'Teaching', color: '#0891B2', bgClass: 'bg-cyan-100 dark:bg-cyan-900/30', textClass: 'text-cyan-800 dark:text-cyan-300' },
  state_psc: { icon: sectorIcons.state_psc, label: 'State PSC', color: '#BE185D', bgClass: 'bg-pink-100 dark:bg-pink-900/30', textClass: 'text-pink-800 dark:text-pink-300' },
  police: { icon: sectorIcons.police, label: 'Police', color: '#1E293B', bgClass: 'bg-slate-200 dark:bg-slate-700/40', textClass: 'text-slate-800 dark:text-slate-300' },
  psu: { icon: sectorIcons.psu, label: 'PSU', color: '#D97706', bgClass: 'bg-orange-100 dark:bg-orange-900/30', textClass: 'text-orange-800 dark:text-orange-300' },
  other: { icon: sectorIcons.other, label: 'Other', color: '#64748B', bgClass: 'bg-gray-100 dark:bg-gray-800/40', textClass: 'text-gray-800 dark:text-gray-300' },
}

/** Format date as "25 Mar 2026" */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

/** Calculate days remaining from today to target date */
export function daysRemaining(targetDate: string, today: string = '2026-03-02'): number {
  const target = new Date(targetDate)
  const now = new Date(today)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/** Calculate progress percentage of application window elapsed */
export function applicationProgress(startDate: string, lastDate: string, today: string = '2026-03-02'): number {
  const start = new Date(startDate).getTime()
  const end = new Date(lastDate).getTime()
  const now = new Date(today).getTime()
  if (now <= start) return 0
  if (now >= end) return 100
  return Math.round(((now - start) / (end - start)) * 100)
}

/** Format salary range as ₹ string */
export function formatSalary(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
    return `₹${n}`
  }
  if (min === 0 && max === 0) return 'As per rules'
  return `${fmt(min)}–${fmt(max)}`
}

/** Format vacancy count with Indian commas */
export function formatVacancies(count: number): string {
  if (count === 0) return 'Exam'
  const str = count.toString()
  const lastThree = str.substring(str.length - 3)
  const remaining = str.substring(0, str.length - 3)
  if (remaining !== '') {
    return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
  }
  return lastThree
}

/** Education level display labels */
export const educationLabels: Record<string, string> = {
  '10th': '10th Pass',
  '12th': '12th Pass',
  iti: 'ITI',
  diploma: 'Diploma',
  graduate: 'Graduate',
  pg: 'Post Graduate',
  phd: 'PhD',
}
