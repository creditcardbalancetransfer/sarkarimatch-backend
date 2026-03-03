/**
 * Admin authentication module for SarkariMatch.
 *
 * Uses SHA-256 hash comparison via the Web Crypto API.
 * Token stored in localStorage as "hash|timestamp".
 * Session expires after 24 hours.
 */

/** Pre-computed SHA-256 hex of the admin password */
const ADMIN_PASSWORD_HASH =
  'e7fb06e08e53bd012d6ba2ca259c852c62c6707f44bc3f1d08434bfe117f6f16'

const TOKEN_KEY = 'sarkarimatch_admin_token'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Hash a string with SHA-256 using Web Crypto and return hex.
 * Works in both Cloudflare Workers and browser contexts.
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Attempt admin login.
 * Returns true on success (token stored in localStorage), false on failure.
 */
export async function login(password: string): Promise<boolean> {
  const hash = await sha256(password)
  if (hash === ADMIN_PASSWORD_HASH) {
    const token = hash + '|' + Date.now()
    localStorage.setItem(TOKEN_KEY, token)
    return true
  }
  return false
}

/**
 * Check if admin session is authenticated and not expired.
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return false

  const parts = token.split('|')
  if (parts.length !== 2) return false

  const [hash, timestampStr] = parts
  if (hash !== ADMIN_PASSWORD_HASH) return false

  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) return false

  return Date.now() - timestamp < SESSION_TTL_MS
}

/**
 * Clear admin session.
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
}
