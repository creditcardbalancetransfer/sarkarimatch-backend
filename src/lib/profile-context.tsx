/**
 * SarkariMatch — Profile Context (SSR-compatible)
 *
 * Since this is a Hono SSR app (server-rendered HTML without React hydration),
 * the actual profile state lives in localStorage on the client side.
 *
 * This module provides:
 * 1. The PROFILE_KEY constant used across client scripts
 * 2. A ProfileProvider component that injects a <script> tag to make the profile
 *    available in a global `window.__SARKARIMATCH_PROFILE__` variable
 * 3. Types for the profile shape
 *
 * The client-side `jobs.js` script reads the profile from localStorage directly,
 * runs the eligibility engine, and updates the DOM.
 */

import type { FC } from 'hono/jsx'

/** LocalStorage key for the user profile */
export const PROFILE_KEY = 'sarkarimatch_profile'

/**
 * Profile shape as stored in localStorage.
 * Mirrors UserProfile from eligibility-engine.ts.
 */
export interface StoredProfile {
  dob: string
  age_years: number
  age_months: number
  gender: string
  education_level: string
  degree: string | null
  branch: string | null
  percentage: number | null
  category: string
  is_pwd: boolean
  pwd_type: string | null
  is_ex_serviceman: boolean
  ex_service_years: number | null
  is_central_govt_employee: boolean
  preferred_sectors: string[]
  preferred_state: string
  profile_version: number
  created_at: string
  updated_at: string
}

/**
 * ProfileProvider component.
 * Renders an inline <script> that:
 * 1. Reads localStorage on page load
 * 2. Exposes profile data as window.__SARKARIMATCH_PROFILE__
 * 3. Exposes a hasProfile boolean
 * 4. Listens for "profile-updated" custom event to re-read
 *
 * Place this in Layout or page components BEFORE other scripts.
 */
export const ProfileProvider: FC = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  var PROFILE_KEY = 'sarkarimatch_profile';

  function readProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) {
      return null;
    }
  }

  var profile = readProfile();
  window.__SARKARIMATCH_PROFILE__ = profile;
  window.__SARKARIMATCH_HAS_PROFILE__ = !!profile;

  // Listen for profile-updated events (dispatched by profile wizard)
  window.addEventListener('profile-updated', function() {
    var p = readProfile();
    window.__SARKARIMATCH_PROFILE__ = p;
    window.__SARKARIMATCH_HAS_PROFILE__ = !!p;
    // Dispatch a secondary event for scripts that need to react
    window.dispatchEvent(new CustomEvent('sarkarimatch-profile-changed', { detail: p }));
  });
})();
        `,
      }}
    />
  )
}
