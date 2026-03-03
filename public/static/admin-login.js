/**
 * admin-login.js
 * Client-side logic for /admin/login.
 * Handles password verification using SHA-256, token storage, and UI.
 */
(function () {
  'use strict';

  var ADMIN_HASH = 'e7fb06e08e53bd012d6ba2ca259c852c62c6707f44bc3f1d08434bfe117f6f16';
  var TOKEN_KEY = 'sarkarimatch_admin_token';
  var SESSION_TTL = 24 * 60 * 60 * 1000;

  // --- Check if already authenticated → redirect ---
  var existingToken = localStorage.getItem(TOKEN_KEY);
  if (existingToken) {
    var parts = existingToken.split('|');
    if (parts.length === 2 && parts[0] === ADMIN_HASH) {
      var ts = parseInt(parts[1], 10);
      if (!isNaN(ts) && Date.now() - ts < SESSION_TTL) {
        window.location.replace('/admin/dashboard');
        return;
      }
    }
  }

  // --- DOM Elements ---
  var form = document.getElementById('admin-login-form');
  var passwordInput = document.getElementById('admin-password');
  var toggleBtn = document.getElementById('toggle-password');
  var eyeOpen = document.getElementById('eye-open');
  var eyeClosed = document.getElementById('eye-closed');
  var loginBtn = document.getElementById('login-btn');
  var loginBtnText = document.getElementById('login-btn-text');
  var loginSpinner = document.getElementById('login-spinner');
  var errorAlert = document.getElementById('login-error');
  var loginCard = document.getElementById('login-card');

  // --- Toggle password visibility ---
  toggleBtn.addEventListener('click', function () {
    var isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeOpen.classList.toggle('hidden', !isPassword);
    eyeClosed.classList.toggle('hidden', isPassword);
    passwordInput.focus();
  });

  // --- SHA-256 hash using Web Crypto ---
  function sha256(msg) {
    var encoder = new TextEncoder();
    var data = encoder.encode(msg);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  // --- Show error with shake ---
  function showError() {
    errorAlert.classList.remove('hidden');
    loginCard.classList.remove('shake');
    // Force reflow to restart animation
    void loginCard.offsetWidth;
    loginCard.classList.add('shake');
    passwordInput.select();
    passwordInput.focus();
  }

  function hideError() {
    errorAlert.classList.add('hidden');
    loginCard.classList.remove('shake');
  }

  // --- Show / hide loading ---
  function setLoading(on) {
    loginBtn.disabled = on;
    loginBtnText.textContent = on ? 'Verifying...' : 'Enter Admin Panel';
    loginSpinner.classList.toggle('hidden', !on);
  }

  // --- Form submit ---
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();

    var password = passwordInput.value.trim();
    if (!password) {
      passwordInput.focus();
      return;
    }

    setLoading(true);

    // Small delay for UX feedback
    setTimeout(function () {
      sha256(password).then(function (hash) {
        if (hash === ADMIN_HASH) {
          var token = hash + '|' + Date.now();
          localStorage.setItem(TOKEN_KEY, token);
          // Brief success flash before redirect
          loginBtn.classList.remove('bg-brand-primary', 'hover:bg-blue-700');
          loginBtn.classList.add('bg-green-600');
          loginBtnText.textContent = 'Success!';
          loginSpinner.classList.add('hidden');
          setTimeout(function () {
            window.location.replace('/admin/dashboard');
          }, 400);
        } else {
          setLoading(false);
          showError();
        }
      });
    }, 500);
  });

  // --- Clear error on input ---
  passwordInput.addEventListener('input', function () {
    if (!errorAlert.classList.contains('hidden')) {
      hideError();
    }
  });
})();
