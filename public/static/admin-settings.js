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
    if (window.showAdminToast) { window.showAdminToast(message, type); return; }
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
