import type { FC } from 'hono/jsx'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { placeholderJobs } from '../../lib/placeholder-data'
import { sectorMeta, daysRemaining } from '../../lib/job-helpers'

/**
 * Admin Dashboard page.
 * Shows stats, recent activity, quick actions, and a status bar chart.
 * All numbers are derived server-side from placeholderJobs.
 */
export const AdminDashboardPage: FC = () => {
  const today = '2026-03-03'
  const totalJobs = placeholderJobs.length
  const activeJobs = placeholderJobs.filter((j) => j.status === 'published').length
  const closingThisWeek = placeholderJobs.filter((j) => {
    const days = daysRemaining(j.important_dates.last_date, today)
    return days >= 0 && days <= 7
  }).length
  // Expired = last_date before today
  const expiredJobs = placeholderJobs.filter((j) => daysRemaining(j.important_dates.last_date, today) < 0).length
  // Upcoming = start_date after today
  const upcomingJobs = placeholderJobs.filter((j) => new Date(j.important_dates.start_date) > new Date(today)).length
  const stillActive = activeJobs - expiredJobs

  // Jobs by sector for quick reference
  const sectorCounts: Record<string, number> = {}
  for (const job of placeholderJobs) {
    sectorCounts[job.sector] = (sectorCounts[job.sector] || 0) + 1
  }

  // Status bar chart values
  const barActive = Math.max(stillActive, 0)
  const barClosing = closingThisWeek
  const barExpired = expiredJobs
  const barUpcoming = upcomingJobs
  const barTotal = barActive + barClosing + barExpired + barUpcoming || 1

  // Recent activity items (hardcoded per spec)
  const activityItems = [
    { text: 'SBI Clerk 2026 published', time: '2 hours ago', type: 'publish' },
    { text: 'RRB NTPC PDF uploaded', time: '5 hours ago', type: 'upload' },
    { text: 'UPSC CDS age limit updated', time: '1 day ago', type: 'edit' },
    { text: 'SSC CHSL syllabus added', time: '2 days ago', type: 'edit' },
    { text: 'IBPS PO notification created', time: '3 days ago', type: 'publish' },
  ]

  const activityIcons: Record<string, { color: string; bgColor: string; path: string }> = {
    publish: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    upload: {
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      path: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
    },
    edit: {
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      path: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
    },
  }

  // Quick action items
  const quickActions = [
    {
      href: '/admin/upload',
      label: 'Upload New PDF',
      desc: 'Parse and create a job post',
      iconPath: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      href: '/admin/jobs/new',
      label: 'Add Job Manually',
      desc: 'Create from scratch',
      iconPath: 'M12 4.5v15m7.5-7.5h-15',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      href: '/admin/jobs',
      label: 'View All Jobs',
      desc: 'Manage existing posts',
      iconPath: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      href: '/admin/settings',
      label: 'Site Settings',
      desc: 'Configuration options',
      iconPath: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-800/40',
      borderColor: 'border-slate-200 dark:border-slate-700',
    },
  ]

  // Stat cards data — encoded as JSON for client-side animation
  const statCards = [
    {
      label: 'Total Jobs',
      value: totalJobs,
      trend: '+3 this week',
      trendUp: true,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconPath: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
    },
    {
      label: 'Active Jobs',
      value: activeJobs,
      trend: '+2 new',
      trendUp: true,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Closing This Week',
      value: closingThisWeek,
      trend: 'Needs attention',
      trendUp: false,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Total Bookmarks',
      value: 0, // Populated client-side from localStorage
      trend: 'From users',
      trendUp: true,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconPath: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
    },
  ]

  return (
    <AdminLayout pageTitle="Dashboard" currentPath="/admin/dashboard">

      {/* Stat cards data for JS animation */}
      <script
        id="dashboard-stats-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(statCards),
        }}
      />

      {/* ═══ ROW 1: Stat Cards ═══ */}
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {statCards.map((card, i) => (
          <div
            class="stat-card bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow duration-200"
            data-stat-index={i}
            key={card.label}
          >
            <div class="flex items-start justify-between mb-3">
              <div class={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bgColor}`}>
                <svg class={`w-5 h-5 ${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d={card.iconPath} />
                </svg>
              </div>
              <span class={`inline-flex items-center gap-1 text-xs font-medium ${card.trendUp ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {card.trendUp ? (
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                ) : (
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                )}
                <span>{card.trend}</span>
              </span>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-content-primary dark:text-white mb-1" data-count-target={card.value} data-stat-key={card.label}>
              0
            </p>
            <p class="text-sm text-content-secondary dark:text-content-dark-muted">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ═══ ROW 2: Activity + Quick Actions ═══ */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {/* Recent Activity */}
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 class="font-heading font-bold text-base text-content-primary dark:text-white mb-4">Recent Activity</h2>
          <div class="space-y-3">
            {activityItems.map((item) => {
              const ic = activityIcons[item.type]
              return (
                <div class="flex items-start gap-3" key={item.text}>
                  <div class={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ic.bgColor}`}>
                    <svg class={`w-4 h-4 ${ic.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d={ic.path} />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-content-primary dark:text-white truncate">{item.text}</p>
                    <p class="text-xs text-content-secondary dark:text-content-dark-muted">{item.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 class="font-heading font-bold text-base text-content-primary dark:text-white mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <a
                href={action.href}
                class={`group flex items-start gap-3 p-3 rounded-lg border ${action.borderColor} ${action.bgColor} hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
                key={action.href}
              >
                <div class="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                  <svg class={`w-4.5 h-4.5 ${action.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d={action.iconPath} />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-content-primary dark:text-white group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </p>
                  <p class="text-xs text-content-secondary dark:text-content-dark-muted">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ROW 3: Jobs by Status Bar Chart ═══ */}
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 class="font-heading font-bold text-base text-content-primary dark:text-white mb-4">Jobs by Status</h2>

        {/* Legend */}
        <div class="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-xs font-medium">
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-green-500"></span>
            <span class="text-content-secondary dark:text-content-dark-muted">Active ({barActive})</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-amber-500"></span>
            <span class="text-content-secondary dark:text-content-dark-muted">Closing Soon ({barClosing})</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-red-500"></span>
            <span class="text-content-secondary dark:text-content-dark-muted">Expired ({barExpired})</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-blue-500"></span>
            <span class="text-content-secondary dark:text-content-dark-muted">Upcoming ({barUpcoming})</span>
          </span>
        </div>

        {/* Stacked bar */}
        <div class="w-full h-10 rounded-lg overflow-hidden flex bg-gray-100 dark:bg-gray-800">
          {barActive > 0 && (
            <div
              class="h-full bg-green-500 flex items-center justify-center text-xs font-bold text-white transition-all duration-700"
              style={`width: ${(barActive / barTotal) * 100}%`}
              title={`Active: ${barActive}`}
            >
              {barActive > 0 && <span>{barActive}</span>}
            </div>
          )}
          {barClosing > 0 && (
            <div
              class="h-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white transition-all duration-700"
              style={`width: ${(barClosing / barTotal) * 100}%`}
              title={`Closing Soon: ${barClosing}`}
            >
              {barClosing > 0 && <span>{barClosing}</span>}
            </div>
          )}
          {barExpired > 0 && (
            <div
              class="h-full bg-red-500 flex items-center justify-center text-xs font-bold text-white transition-all duration-700"
              style={`width: ${(barExpired / barTotal) * 100}%`}
              title={`Expired: ${barExpired}`}
            >
              {barExpired > 0 && <span>{barExpired}</span>}
            </div>
          )}
          {barUpcoming > 0 && (
            <div
              class="h-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white transition-all duration-700"
              style={`width: ${(barUpcoming / barTotal) * 100}%`}
              title={`Upcoming: ${barUpcoming}`}
            >
              {barUpcoming > 0 && <span>{barUpcoming}</span>}
            </div>
          )}
          {barActive === 0 && barClosing === 0 && barExpired === 0 && barUpcoming === 0 && (
            <div class="h-full w-full flex items-center justify-center text-xs text-content-secondary dark:text-content-dark-muted">
              No job data
            </div>
          )}
        </div>

        {/* Summary text */}
        <p class="text-xs text-content-secondary dark:text-content-dark-muted mt-3">
          Total: {totalJobs} jobs across {Object.keys(sectorCounts).length} sectors.
          {closingThisWeek > 0 && (
            <span class="text-amber-600 dark:text-amber-400 font-medium"> {closingThisWeek} closing this week!</span>
          )}
        </p>
      </div>

    </AdminLayout>
  )
}
