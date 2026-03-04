import type { FC } from 'hono/jsx'
import { AdminLayout } from '../../components/admin/AdminLayout'

/**
 * AdminSettings — Site config, API keys, notifications, data management.
 *
 * Sections:
 * 1. Site Configuration (name, tagline, colors, logo)
 * 2. API Keys (placeholders)
 * 3. Notification Channels (placeholders with test toast)
 * 4. Data Management (export/import JSON, clear, reset)
 */
export const AdminSettingsPage: FC = () => {
  return (
    <AdminLayout pageTitle="Settings" currentPath="/admin/settings">

      {/* ═══ BREADCRUMBS ═══ */}
      <nav class="mb-4 text-sm" aria-label="Breadcrumb">
        <ol class="flex items-center gap-1.5 text-content-secondary dark:text-content-dark-muted">
          <li><a href="/admin/dashboard" class="hover:text-brand-primary dark:hover:text-blue-400 transition-colors">Admin</a></li>
          <li><svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
          <li class="text-content-primary dark:text-white font-medium">Settings</li>
        </ol>
      </nav>

      {/* ═══ PAGE HEADER ═══ */}
      <div class="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h2 class="text-lg sm:text-xl font-heading font-bold text-content-primary dark:text-white">Settings</h2>
          <p class="text-xs sm:text-sm text-content-secondary dark:text-content-dark-muted mt-0.5">Configure your SarkariMatch admin panel</p>
        </div>
      </div>

      <div class="space-y-4 sm:space-y-6 pb-28 sm:pb-24">

        {/* ═══════════════════════════════════════════
             SECTION 1: SITE CONFIGURATION
           ═══════════════════════════════════════════ */}
        <fieldset class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
            Site Configuration
          </legend>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label for="s-site-name" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Site Name</label>
              <input type="text" id="s-site-name" value="SarkariMatch" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="s-tagline" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Tagline</label>
              <input type="text" id="s-tagline" value="Your Gateway to Government Jobs" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
            <div>
              <label for="s-primary-color" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Primary Color</label>
              <div class="flex items-center gap-2">
                <input type="color" id="s-primary-color" value="#1E40AF" class="w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-btn cursor-pointer" />
                <input type="text" id="s-primary-color-hex" value="#1E40AF" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
              </div>
            </div>
            <div>
              <label for="s-accent-color" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Accent Color</label>
              <div class="flex items-center gap-2">
                <input type="color" id="s-accent-color" value="#F59E0B" class="w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-btn cursor-pointer" />
                <input type="text" id="s-accent-color-hex" value="#F59E0B" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
              </div>
            </div>
            <div class="md:col-span-2">
              <label for="s-logo-url" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Logo URL</label>
              <input type="url" id="s-logo-url" placeholder="https://example.com/logo.svg" class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
            </div>
          </div>
        </fieldset>

        {/* ═══════════════════════════════════════════
             SECTION 2: API KEYS
           ═══════════════════════════════════════════ */}
        <fieldset class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
            API Keys
          </legend>
          <div class="mt-3 space-y-4">
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p class="text-xs text-amber-700 dark:text-amber-400">
                <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                API keys are stored locally for demo purposes. In production, use Cloudflare Workers Secrets.
              </p>
            </div>
            <div>
              <label for="s-gemini-key" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Gemini AI API Key</label>
              <div class="relative">
                <input type="password" id="s-gemini-key" placeholder="AIza..." class="w-full px-3 py-2 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
                <button type="button" class="toggle-password absolute right-2 top-1/2 -translate-y-1/2 p-1 text-content-secondary hover:text-content-primary dark:hover:text-white transition-colors" aria-label="Toggle visibility">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              </div>
            </div>
            <div>
              <label for="s-cf-token" class="block text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1">Cloudflare API Token</label>
              <div class="relative">
                <input type="password" id="s-cf-token" placeholder="cf_..." class="w-full px-3 py-2 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-slate-800 text-content-primary dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
                <button type="button" class="toggle-password absolute right-2 top-1/2 -translate-y-1/2 p-1 text-content-secondary hover:text-content-primary dark:hover:text-white transition-colors" aria-label="Toggle visibility">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        {/* ═══════════════════════════════════════════
             SECTION 3: NOTIFICATION CHANNELS
           ═══════════════════════════════════════════ */}
        <fieldset class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            Notification Channels
          </legend>
          <div class="mt-3 space-y-4">
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-content-primary dark:text-white">Email Notifications</p>
                  <p class="text-xs text-content-secondary dark:text-content-dark-muted">Send alerts for new jobs and updates</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="test-email-btn" class="px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Test</button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="s-email-enabled" class="sr-only peer" />
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary/50 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"/></svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-content-primary dark:text-white">WhatsApp Updates</p>
                  <p class="text-xs text-content-secondary dark:text-content-dark-muted">Push notifications via WhatsApp</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="test-whatsapp-btn" class="px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Test</button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="s-whatsapp-enabled" class="sr-only peer" />
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary/50 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-content-primary dark:text-white">Telegram Bot</p>
                  <p class="text-xs text-content-secondary dark:text-content-dark-muted">Post updates to Telegram channel</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="test-telegram-btn" class="px-3 py-1.5 text-xs font-medium text-brand-primary dark:text-blue-400 border border-brand-primary/30 dark:border-blue-500/30 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Test</button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="s-telegram-enabled" class="sr-only peer" />
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary/50 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* ═══════════════════════════════════════════
             SECTION 4: DATA MANAGEMENT
           ═══════════════════════════════════════════ */}
        <fieldset class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <legend class="text-sm font-heading font-bold text-content-primary dark:text-white px-1 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>
            Data Management
          </legend>
          <div class="mt-3 space-y-3">

            {/* Export */}
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p class="text-sm font-medium text-content-primary dark:text-white">Export Jobs Data</p>
                <p class="text-xs text-content-secondary dark:text-content-dark-muted">Download all jobs (seed + uploaded) as JSON</p>
              </div>
              <button type="button" id="export-btn" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-brand-primary hover:bg-blue-700 text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Export JSON
              </button>
            </div>

            {/* Import */}
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p class="text-sm font-medium text-content-primary dark:text-white">Import Jobs Data</p>
                <p class="text-xs text-content-secondary dark:text-content-dark-muted">Upload a JSON file to merge with existing jobs</p>
              </div>
              <div class="flex items-center gap-2">
                <input type="file" id="import-file" accept=".json" class="hidden" />
                <button type="button" id="import-btn" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-brand-primary/30 dark:border-blue-500/30 text-brand-primary dark:text-blue-400 rounded-btn hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  Import JSON
                </button>
              </div>
            </div>

            {/* Clear all jobs */}
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
              <div>
                <p class="text-sm font-medium text-red-700 dark:text-red-400">Clear All Uploaded Jobs</p>
                <p class="text-xs text-red-600 dark:text-red-500">Remove all uploaded jobs from localStorage (seed data unaffected)</p>
              </div>
              <button type="button" id="clear-jobs-btn" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                Clear All
              </button>
            </div>

            {/* Reset to seed */}
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
              <div>
                <p class="text-sm font-medium text-amber-700 dark:text-amber-400">Reset to Default Seed Data</p>
                <p class="text-xs text-amber-600 dark:text-amber-500">Clear all uploaded jobs and settings, restore factory state</p>
              </div>
              <button type="button" id="reset-btn" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                Reset All
              </button>
            </div>
          </div>
        </fieldset>

      </div>

      {/* ── Sticky Save bar ── */}
      <div class="sticky bottom-16 sm:bottom-0 z-10 -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
        <span id="settings-save-indicator" class="text-xs text-content-secondary dark:text-content-dark-muted hidden sm:inline"></span>
        <button type="button" id="save-settings-btn" class="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-xl sm:rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/60">
          Save Settings
        </button>
      </div>

      {/* ═══ Toast ═══ */}
      <div id="toast" class="fixed top-6 right-6 z-[100] space-y-2" aria-live="polite"></div>

      {/* ═══ Confirm modal ═══ */}
      <div id="confirm-modal" class="fixed inset-0 z-[100] hidden mobile-fullscreen-modal" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" id="confirm-backdrop"></div>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="relative bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full sm:max-w-sm p-6">
            <div class="swipe-indicator sm:hidden"></div>
            <h3 id="confirm-title" class="text-base font-heading font-bold text-content-primary dark:text-white text-center mb-2"></h3>
            <p id="confirm-text" class="text-sm text-content-secondary dark:text-content-dark-muted text-center mb-6"></p>
            <div class="flex items-center gap-3">
              <button type="button" id="confirm-cancel" class="flex-1 px-4 py-3 sm:py-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-content-primary dark:text-white rounded-xl sm:rounded-btn transition-colors">Cancel</button>
              <button type="button" id="confirm-ok" class="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-btn transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      </div>

      <script src="/static/admin-settings.js" defer></script>
    </AdminLayout>
  )
}
