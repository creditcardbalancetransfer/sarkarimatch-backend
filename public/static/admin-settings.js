/**
 * admin-settings.js
 * Client-side logic for /admin/settings.
 * Manages site config, API keys (localStorage), notification tests, data export/import/clear/reset.
 */
(function () {
  'use strict';

  var SETTINGS_KEY = 'sarkarimatch_settings';
  var JOBS_KEY = 'sarkarimatch_admin_jobs';

  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  // ═══════════════════════════════════════════
  //  TOAST
  // ═══════════════════════════════════════════
  function showToast(message, type) {
    type = type || 'info';
    var container = $('toast');
    if (!container) return;
    var colors = {
      success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
      info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    };
    var icons = {
      success: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
      error: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />',
      warning: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />',
      info: '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />',
    };
    var div = document.createElement('div');
    div.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium min-w-[300px] ' + (colors[type] || colors.info);
    div.style.animation = 'slideInRight 0.3s ease-out forwards';
    div.innerHTML =
      '<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">' + (icons[type] || icons.info) + '</svg>' +
      '<span class="flex-1">' + esc(message) + '</span>' +
      '<button type="button" class="toast-close p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>' +
      '<div class="absolute bottom-0 left-0 h-0.5 bg-current opacity-30" style="animation: toastProgress 4s linear forwards"></div>';
    div.style.position = 'relative';
    div.style.overflow = 'hidden';
    container.appendChild(div);
    div.querySelector('.toast-close').addEventListener('click', function () { div.remove(); });
    setTimeout(function () { if (div.parentNode) div.remove(); }, 4000);
  }

  // ═══════════════════════════════════════════
  //  LOAD / SAVE SETTINGS
  // ═══════════════════════════════════════════
  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    } catch (e) { return {}; }
  }

  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  // Populate from saved
  var settings = loadSettings();
  if (settings.site_name) $('s-site-name').value = settings.site_name;
  if (settings.tagline) $('s-tagline').value = settings.tagline;
  if (settings.primary_color) {
    $('s-primary-color').value = settings.primary_color;
    $('s-primary-color-hex').value = settings.primary_color;
  }
  if (settings.accent_color) {
    $('s-accent-color').value = settings.accent_color;
    $('s-accent-color-hex').value = settings.accent_color;
  }
  if (settings.logo_url) $('s-logo-url').value = settings.logo_url;
  if (settings.gemini_key) $('s-gemini-key').value = settings.gemini_key;
  if (settings.cf_token) $('s-cf-token').value = settings.cf_token;
  if (settings.email_enabled) $('s-email-enabled').checked = true;
  if (settings.whatsapp_enabled) $('s-whatsapp-enabled').checked = true;
  if (settings.telegram_enabled) $('s-telegram-enabled').checked = true;

  // Sync color pickers
  $('s-primary-color').addEventListener('input', function () { $('s-primary-color-hex').value = this.value; });
  $('s-primary-color-hex').addEventListener('input', function () {
    if (/^#[0-9a-fA-F]{6}$/.test(this.value)) $('s-primary-color').value = this.value;
  });
  $('s-accent-color').addEventListener('input', function () { $('s-accent-color-hex').value = this.value; });
  $('s-accent-color-hex').addEventListener('input', function () {
    if (/^#[0-9a-fA-F]{6}$/.test(this.value)) $('s-accent-color').value = this.value;
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      if (input.type === 'password') { input.type = 'text'; }
      else { input.type = 'password'; }
    });
  });

  // ═══════════════════════════════════════════
  //  SAVE SETTINGS BUTTON
  // ═══════════════════════════════════════════
  $('save-settings-btn').addEventListener('click', function () {
    var s = {
      site_name: $('s-site-name').value,
      tagline: $('s-tagline').value,
      primary_color: $('s-primary-color').value,
      accent_color: $('s-accent-color').value,
      logo_url: $('s-logo-url').value,
      gemini_key: $('s-gemini-key').value,
      cf_token: $('s-cf-token').value,
      email_enabled: $('s-email-enabled').checked,
      whatsapp_enabled: $('s-whatsapp-enabled').checked,
      telegram_enabled: $('s-telegram-enabled').checked,
      updated_at: new Date().toISOString(),
    };
    saveSettings(s);
    showToast('Settings saved successfully!', 'success');
    var indicator = $('settings-save-indicator');
    if (indicator) indicator.textContent = 'Last saved: ' + new Date().toLocaleTimeString();
  });

  // ═══════════════════════════════════════════
  //  NOTIFICATION TEST BUTTONS
  // ═══════════════════════════════════════════
  $('test-email-btn').addEventListener('click', function () {
    showToast('Test email notification sent! (simulated)', 'success');
  });
  $('test-whatsapp-btn').addEventListener('click', function () {
    showToast('Test WhatsApp message sent! (simulated)', 'success');
  });
  $('test-telegram-btn').addEventListener('click', function () {
    showToast('Test Telegram message sent! (simulated)', 'success');
  });

  // ═══════════════════════════════════════════
  //  DATA MANAGEMENT
  // ═══════════════════════════════════════════

  // Export
  $('export-btn').addEventListener('click', function () {
    var jobs = [];
    try { jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]'); } catch (e) {}
    var blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sarkarimatch-jobs-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Jobs exported! Check your downloads.', 'success');
  });

  // Import
  $('import-btn').addEventListener('click', function () { $('import-file').click(); });
  $('import-file').addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) { showToast('Invalid JSON: expected an array.', 'error'); return; }
        var existing = [];
        try { existing = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]'); } catch (err) {}
        if (!Array.isArray(existing)) existing = [];
        // Merge by ID
        var existingIds = new Set(existing.map(function (j) { return j.id; }));
        var added = 0;
        imported.forEach(function (j) {
          if (j.id && !existingIds.has(j.id)) {
            existing.push(j);
            added++;
          }
        });
        localStorage.setItem(JOBS_KEY, JSON.stringify(existing));
        showToast('Imported ' + added + ' new jobs (skipped ' + (imported.length - added) + ' duplicates).', 'success');
      } catch (err) {
        showToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    this.value = '';
  });

  // Confirm modal helper
  var confirmCallback = null;

  function showConfirm(title, text, cb) {
    $('confirm-title').textContent = title;
    $('confirm-text').textContent = text;
    confirmCallback = cb;
    $('confirm-modal').classList.remove('hidden');
  }

  $('confirm-cancel').addEventListener('click', function () { $('confirm-modal').classList.add('hidden'); confirmCallback = null; });
  $('confirm-backdrop').addEventListener('click', function () { $('confirm-modal').classList.add('hidden'); confirmCallback = null; });
  $('confirm-ok').addEventListener('click', function () {
    $('confirm-modal').classList.add('hidden');
    if (typeof confirmCallback === 'function') confirmCallback();
    confirmCallback = null;
  });

  // Clear all jobs
  $('clear-jobs-btn').addEventListener('click', function () {
    showConfirm(
      'Clear All Uploaded Jobs?',
      'This will remove all jobs from localStorage. Seed data from the server will still be available.',
      function () {
        localStorage.removeItem(JOBS_KEY);
        showToast('All uploaded jobs cleared.', 'success');
      }
    );
  });

  // Reset all
  $('reset-btn').addEventListener('click', function () {
    showConfirm(
      'Reset Everything?',
      'This will clear all uploaded jobs, settings, and changelogs. Seed data will be preserved.',
      function () {
        localStorage.removeItem(JOBS_KEY);
        localStorage.removeItem(SETTINGS_KEY);
        localStorage.removeItem('sarkarimatch_changelogs');
        localStorage.removeItem('sarkarimatch_upload_autosave');
        localStorage.removeItem('sarkarimatch_edit_autosave');
        showToast('Reset complete! All custom data cleared.', 'success');
        setTimeout(function () { location.reload(); }, 1500);
      }
    );
  });

  // Add keyframe animations
  var style = document.createElement('style');
  style.textContent =
    '@keyframes slideInRight { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }' +
    '@keyframes toastProgress { from { width:100%; } to { width:0; } }';
  document.head.appendChild(style);

})();
