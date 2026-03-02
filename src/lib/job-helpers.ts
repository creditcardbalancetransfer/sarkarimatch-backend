import type { Job } from './placeholder-data'

/** Sector metadata for display */
export const sectorMeta: Record<
  Job['sector'],
  { icon: string; label: string; color: string; bgClass: string; textClass: string }
> = {
  banking: { icon: '🏦', label: 'Banking', color: '#1E40AF', bgClass: 'bg-blue-100 dark:bg-blue-900/30', textClass: 'text-blue-800 dark:text-blue-300' },
  railway: { icon: '🚂', label: 'Railway', color: '#DC2626', bgClass: 'bg-red-100 dark:bg-red-900/30', textClass: 'text-red-800 dark:text-red-300' },
  ssc: { icon: '📋', label: 'SSC', color: '#059669', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-800 dark:text-green-300' },
  upsc: { icon: '🏛️', label: 'UPSC', color: '#7C3AED', bgClass: 'bg-purple-100 dark:bg-purple-900/30', textClass: 'text-purple-800 dark:text-purple-300' },
  defence: { icon: '🎖️', label: 'Defence', color: '#92400E', bgClass: 'bg-amber-100 dark:bg-amber-900/30', textClass: 'text-amber-800 dark:text-amber-300' },
  teaching: { icon: '👨‍🏫', label: 'Teaching', color: '#0891B2', bgClass: 'bg-cyan-100 dark:bg-cyan-900/30', textClass: 'text-cyan-800 dark:text-cyan-300' },
  state_psc: { icon: '🏢', label: 'State PSC', color: '#BE185D', bgClass: 'bg-pink-100 dark:bg-pink-900/30', textClass: 'text-pink-800 dark:text-pink-300' },
  police: { icon: '👮', label: 'Police', color: '#1E293B', bgClass: 'bg-slate-200 dark:bg-slate-700/40', textClass: 'text-slate-800 dark:text-slate-300' },
  psu: { icon: '🏭', label: 'PSU', color: '#D97706', bgClass: 'bg-orange-100 dark:bg-orange-900/30', textClass: 'text-orange-800 dark:text-orange-300' },
  other: { icon: '📌', label: 'Other', color: '#64748B', bgClass: 'bg-gray-100 dark:bg-gray-800/40', textClass: 'text-gray-800 dark:text-gray-300' },
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
