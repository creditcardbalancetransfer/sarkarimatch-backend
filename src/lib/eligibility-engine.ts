/**
 * SarkariMatch — Client-side Eligibility Matching Engine
 *
 * Pure TypeScript, ZERO dependencies.
 * Determines which government jobs a user qualifies for based on
 * their profile (age, education, category, preferences).
 *
 * This is the CORE algorithm that powers personalized job matching.
 */

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

/** User profile as stored in localStorage under "sarkarimatch_profile" */
export interface UserProfile {
  dob: string                    // "YYYY-MM-DD"
  gender: string                 // "male" | "female" | "other"
  education_level: string        // "10th" | "12th" | "iti" | "diploma" | "graduate" | "pg" | "phd"
  degree: string | null          // "B.Tech/B.E" | "B.Sc" | "B.Com" | etc.
  branch: string | null          // "Computer Science" | "Commerce" | etc.
  percentage: number | null
  category: string               // "General" | "OBC" | "SC" | "ST" | "EWS"
  is_pwd: boolean
  pwd_type: string | null
  is_ex_serviceman: boolean
  ex_service_years: number | null
  is_central_govt_employee: boolean
  preferred_sectors: string[]
  preferred_state: string        // "all_india" | state slug
}

/** Eligibility check result for a single check dimension */
export type CheckResult = 'pass' | 'fail' | 'unknown' | 'not_required'

/** All eligibility checks for one post within a notification */
export interface PostEligibility {
  post_name: string
  post_code: string | null
  vacancies_total: number
  vacancies_for_category: number
  salary: string
  checks: {
    age: CheckResult
    education: CheckResult
    degree: CheckResult
    percentage: CheckResult
    category_vacancy: CheckResult
  }
  checks_detail: {
    age_message: string
    education_message: string
    degree_message: string
    percentage_message: string
    vacancy_message: string
  }
  score: number          // 0–100
  label: 'eligible' | 'partial' | 'not_eligible'
}

/** Aggregate result for an entire job notification (may have multiple posts) */
export interface JobEligibilityResult {
  job_slug: string
  notification_title: string
  department: string
  total_posts: number
  eligible_posts: number
  partial_posts: number
  not_eligible_posts: number
  best_score: number
  overall_label: 'eligible' | 'partial' | 'not_eligible'
  is_expired: boolean
  sector_match: boolean
  location_match: boolean
  posts: PostEligibility[]
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════

/** Numeric rank for each education level (higher = more qualified) */
const EDUCATION_RANKS: Record<string, number> = {
  '10th': 1,
  '12th': 2,
  'iti': 2.5,
  'diploma': 3,
  'graduate': 4,
  'pg': 5,
  'phd': 6,
}

/** Scoring weights for each check dimension (must sum to 100) */
const CHECK_WEIGHTS = {
  age: 30,
  education: 25,
  degree: 20,
  percentage: 10,
  category_vacancy: 15,
} as const

/**
 * Degree aliases — maps canonical names to recognized alternative strings.
 * All keys and alias entries are lowercase for case-insensitive matching.
 */
const DEGREE_ALIASES: Record<string, string[]> = {
  'b.tech/b.e':      ['b.tech', 'be', 'b.e', 'b.e.', 'b.tech.', 'btech', 'bachelor of technology', 'bachelor of engineering'],
  'b.sc':            ['bsc', 'b.sc.', 'bachelor of science'],
  'b.com':           ['bcom', 'b.com.', 'b.commerce', 'bachelor of commerce'],
  'ba':              ['b.a', 'b.a.', 'bachelor of arts'],
  'bba':             ['b.b.a', 'b.b.a.', 'bachelor of business administration'],
  'bca':             ['b.c.a', 'b.c.a.', 'bachelor of computer applications'],
  'llb':             ['ll.b', 'll.b.', 'b.l', 'bachelor of law', 'bachelor of laws'],
  'b.ed':            ['bed', 'b.ed.', 'bachelor of education'],
  'mbbs':            ['m.b.b.s', 'm.b.b.s.', 'bachelor of medicine'],
  'b.pharm':         ['bpharm', 'b.pharm.', 'bachelor of pharmacy'],
  'b.arch':          ['barch', 'b.arch.', 'bachelor of architecture'],
  'bds':             ['b.d.s', 'b.d.s.', 'bachelor of dental surgery'],
  'bams':            ['b.a.m.s', 'bachelor of ayurveda'],
  'bhms':            ['b.h.m.s', 'bachelor of homeopathy'],
  'b.lib':           ['blib', 'b.lib.', 'bachelor of library science'],
  'm.tech/m.e':      ['m.tech', 'me', 'm.e', 'm.e.', 'm.tech.', 'mtech', 'master of technology', 'master of engineering'],
  'm.sc':            ['msc', 'm.sc.', 'master of science'],
  'm.com':           ['mcom', 'm.com.', 'm.commerce', 'master of commerce'],
  'ma':              ['m.a', 'm.a.', 'master of arts'],
  'mba':             ['m.b.a', 'm.b.a.', 'master of business administration'],
  'mca':             ['m.c.a', 'm.c.a.', 'master of computer applications'],
  'llm':             ['ll.m', 'll.m.', 'master of law', 'master of laws'],
  'm.ed':            ['med', 'm.ed.', 'master of education'],
  'md':              ['m.d', 'm.d.', 'doctor of medicine'],
  'm.pharm':         ['mpharm', 'm.pharm.', 'master of pharmacy'],
  'm.arch':          ['march', 'm.arch.', 'master of architecture'],
  'mds':             ['m.d.s', 'm.d.s.', 'master of dental surgery'],
}

/**
 * Normalised category key mapping.
 * The profile wizard stores "General" while many checks use "UR".
 */
const CATEGORY_NORMALIZE: Record<string, string> = {
  'general': 'UR',
  'ur':      'UR',
  'obc':     'OBC',
  'sc':      'SC',
  'st':      'ST',
  'ews':     'EWS',
}

// ═══════════════════════════════════════════════════════════════
//  CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate exact age from a date-of-birth to a reference date.
 *
 * @param dob          - Date of birth in "YYYY-MM-DD" format
 * @param referenceDate - The date to calculate age ON (usually job's last_date)
 * @returns Object with years, months, and days components
 *
 * @example
 * calculateAge("2000-01-15", "2026-03-25") // { years: 26, months: 2, days: 10 }
 */
export function calculateAge(
  dob: string,
  referenceDate: string,
): { years: number; months: number; days: number } {
  const [bY, bM, bD] = dob.split('-').map(Number)
  const [rY, rM, rD] = referenceDate.split('-').map(Number)

  let years = rY - bY
  let months = rM - bM
  let days = rD - bD

  // Borrow a month if days go negative
  if (days < 0) {
    months--
    // Days in the month BEFORE the reference month
    const prevMonth = rM - 1 === 0 ? 12 : rM - 1
    const prevMonthYear = prevMonth === 12 ? rY - 1 : rY
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate()
    days += daysInPrevMonth
  }

  // Borrow a year if months go negative
  if (months < 0) {
    years--
    months += 12
  }

  return { years, months, days }
}

/**
 * Return total age relaxation in years per Indian government rules.
 *
 * Relaxation structure:
 * - **Base** (category-based, non-stacking): UR=0, OBC=3, SC=5, ST=5, EWS=0
 * - **Additional** (added to base):
 *   - PwD: +10
 *   - Ex-Serviceman: +5
 *   - Central Govt Employee: +5
 *   - If both PwD and Ex-SM, take the higher additional only (+10).
 *
 * @param category           - Normalised category: "UR" | "OBC" | "SC" | "ST" | "EWS"
 * @param isPwd              - Person with Disability flag
 * @param isExServiceman     - Ex-Serviceman flag
 * @param isCentralGovt      - Central Government Employee flag
 * @returns Total relaxation years
 */
export function getAgeRelaxation(
  category: string,
  isPwd: boolean,
  isExServiceman: boolean,
  isCentralGovt: boolean,
): number {
  const cat = normalizeCategory(category)

  // Base relaxation (highest applicable, they do NOT stack)
  let base = 0
  if (cat === 'OBC') base = 3
  else if (cat === 'SC' || cat === 'ST') base = 5
  // UR and EWS get 0 base

  // Additional relaxation — PwD and Ex-SM do NOT stack with each other,
  // take the higher one; CGE stacks independently.
  let additional = 0

  if (isPwd && isExServiceman) {
    // PwD (+10) is higher than Ex-SM (+5), take PwD
    additional += 10
  } else if (isPwd) {
    additional += 10
  } else if (isExServiceman) {
    additional += 5
  }

  if (isCentralGovt) {
    additional += 5
  }

  return base + additional
}

/**
 * Check whether the user's age on a job's last date falls within the
 * permitted range, including any relaxation.
 *
 * @param userDob            - User DOB "YYYY-MM-DD"
 * @param jobLastDate        - Job application last date "YYYY-MM-DD"
 * @param ageMin             - Minimum age required (years)
 * @param ageMax             - Maximum age required (years, before relaxation)
 * @param ageRelaxation      - Total relaxation years (from getAgeRelaxation)
 * @param jobAgeRelaxation   - Optional job-specific age relaxation overrides
 *                             keyed by category e.g. { OBC: 3, SC: 5 }
 * @returns Object with check result and detailed message
 */
export function checkAge(
  userDob: string,
  jobLastDate: string,
  ageMin: number,
  ageMax: number,
  ageRelaxation: number,
  jobAgeRelaxation?: Record<string, number> | null,
): { result: CheckResult; message: string } {
  // If job has no meaningful age constraints (e.g. UGC NET Assistant Prof)
  if (ageMin === 0 && ageMax === 0) {
    return {
      result: 'pass',
      message: 'No age limit for this post.',
    }
  }

  const age = calculateAge(userDob, jobLastDate)
  const ageYears = age.years
  const ageStr = `${age.years}y ${age.months}m`

  // Determine effective relaxation
  let effectiveRelaxation = ageRelaxation
  if (jobAgeRelaxation && typeof jobAgeRelaxation === 'object') {
    // Job provides its own relaxation per category — check if it has one
    // for the user's category. If yes, use that; otherwise fall back.
    const keys = Object.keys(jobAgeRelaxation)
    if (keys.length > 0) {
      // Try to find a matching key
      const found = keys.find(k => k.toLowerCase() === normalizeCategory('').toLowerCase())
      if (found !== undefined) {
        effectiveRelaxation = jobAgeRelaxation[found]
      }
    }
  }

  const effectiveMax = ageMax + effectiveRelaxation

  // Check minimum age
  if (ageYears < ageMin) {
    // Could the user turn ageMin before the deadline? They're under-age.
    return {
      result: 'fail',
      message: `Your age: ${ageStr} on last date. Required: ${ageMin}\u2013${ageMax}${effectiveRelaxation > 0 ? ` (with +${effectiveRelaxation} relaxation \u2192 ${effectiveMax})` : ''}. [FAIL] Under age limit`,
    }
  }

  // Check maximum age
  if (ageYears > effectiveMax) {
    // Clearly over
    return {
      result: 'fail',
      message: `Your age: ${ageStr} on last date. Required: ${ageMin}–${ageMax}${effectiveRelaxation > 0 ? ` (with +${effectiveRelaxation} relaxation → ${effectiveMax})` : ''}. [FAIL] Over age limit`,
    }
  }

  // Edge case: age equals effectiveMax — depends on months/days
  if (ageYears === effectiveMax) {
    // Exactly at the max year. If months > 0 or days > 0 the user might
    // actually be effectiveMax + some months, which means "over" in strict
    // interpretations. However most govt jobs count in completed years, so
    // ageYears === effectiveMax still passes. Some jobs use DOB ranges.
    // We'll treat this as "pass" since we're comparing completed years.
  }

  // "Unknown" / partial zone — user is within 6 months of the max boundary.
  // This helps surface "might be tight" scenarios where exact DOB cutoff matters.
  if (ageYears >= effectiveMax - 1 && age.months >= 6 && ageYears <= effectiveMax) {
    // The user is very close to the upper bound. Still passes in completed-years
    // logic but worth flagging.
    return {
      result: 'pass',
      message: `Your age: ${ageStr} on last date. Required: ${ageMin}–${ageMax}${effectiveRelaxation > 0 ? ` (with +${effectiveRelaxation} relaxation → ${effectiveMax})` : ''}. [PASS] Eligible (close to upper limit)`,
    }
  }

  return {
    result: 'pass',
    message: `Your age: ${ageStr} on last date. Required: ${ageMin}–${ageMax}${effectiveRelaxation > 0 ? ` (with +${effectiveRelaxation} relaxation → ${effectiveMax})` : ''}. [PASS] Eligible`,
  }
}

/**
 * Get a numeric rank for an education level for comparison.
 * Higher rank = higher qualification.
 *
 * @param level - Education level string
 * @returns Numeric rank (1–6), or 0 if unrecognised
 */
export function getEducationRank(level: string): number {
  const normalised = level.toLowerCase().trim()
  return EDUCATION_RANKS[normalised] ?? 0
}

/**
 * Check if user's education level meets or exceeds the required level.
 * A graduate CAN apply for 12th-pass jobs (overqualified but eligible).
 * A 12th-pass CANNOT apply for graduate-level jobs.
 *
 * @param userLevel     - User's highest education level
 * @param requiredLevel - Job's required education level
 * @returns "pass" | "fail" | "unknown"
 */
export function checkEducation(
  userLevel: string,
  requiredLevel: string,
): { result: CheckResult; message: string } {
  const userRank = getEducationRank(userLevel)
  const reqRank = getEducationRank(requiredLevel)

  if (userRank === 0 || reqRank === 0) {
    return {
      result: 'unknown',
      message: `Could not determine education comparison. Your level: ${userLevel}. Required: ${requiredLevel}.`,
    }
  }

  const userLabel = EDUCATION_LABELS[userLevel.toLowerCase()] || userLevel
  const reqLabel = EDUCATION_LABELS[requiredLevel.toLowerCase()] || requiredLevel

  if (userRank >= reqRank) {
    const over = userRank > reqRank ? ' (overqualified)' : ''
    return {
      result: 'pass',
      message: `${reqLabel} required. You have: ${userLabel}${over}. [PASS] Match`,
    }
  }

  return {
    result: 'fail',
    message: `${reqLabel} required. You have: ${userLabel}. [FAIL] Does not meet requirement`,
  }
}

/**
 * Check whether the user's degree matches a post's required degrees.
 *
 * Handles aliases (e.g. "B.Tech" matches "B.E", "B.Tech/B.E"),
 * and optional subject/branch matching.
 *
 * @param userDegree        - User's degree (e.g. "B.Tech/B.E")
 * @param userBranch        - User's branch/subject (e.g. "Computer Science")
 * @param requiredDegrees   - Array of acceptable degree names, or null if any degree works
 * @param requiredSubjects  - Array of acceptable branches/subjects, or null
 * @returns Check result with message
 */
export function checkDegree(
  userDegree: string | null,
  userBranch: string | null,
  requiredDegrees: string[] | null,
  requiredSubjects: string[] | null,
): { result: CheckResult; message: string } {
  // No specific degree requirement — any degree works
  if (!requiredDegrees || requiredDegrees.length === 0) {
    if (!requiredSubjects || requiredSubjects.length === 0) {
      return {
        result: 'not_required',
        message: 'Any degree/discipline accepted. [PASS] No restriction',
      }
    }
  }

  // User has no degree entered but requirement exists
  if (!userDegree) {
    return {
      result: 'unknown',
      message: `Specific degree required${requiredDegrees ? ` (${requiredDegrees.join(', ')})` : ''}. Your degree: not set. [WARN] Cannot verify`,
    }
  }

  // Check degree match
  let degreeMatch = false
  if (requiredDegrees && requiredDegrees.length > 0) {
    degreeMatch = requiredDegrees.some(req => degreesMatch(userDegree, req))
    if (!degreeMatch) {
      return {
        result: 'fail',
        message: `Required: ${requiredDegrees.join(' / ')}. You have: ${userDegree}. [FAIL] Mismatch`,
      }
    }
  } else {
    degreeMatch = true // No specific degree constraint
  }

  // Check subject/branch match
  if (requiredSubjects && requiredSubjects.length > 0) {
    if (!userBranch) {
      return {
        result: 'unknown',
        message: `Degree matches. Subject required: ${requiredSubjects.join(', ')}. Your branch: not set. [WARN] Cannot verify subject`,
      }
    }
    const branchMatch = requiredSubjects.some(req => subjectsMatch(userBranch, req))
    if (!branchMatch) {
      return {
        result: 'fail',
        message: `Degree matches. Required subject: ${requiredSubjects.join(' / ')}. Your branch: ${userBranch}. [FAIL] Subject mismatch`,
      }
    }
  }

  return {
    result: 'pass',
    message: `Degree: ${userDegree}${userBranch ? ` (${userBranch})` : ''}. [PASS] Match`,
  }
}

/**
 * Check if vacancies exist for the user's reservation category.
 *
 * @param category  - Normalised category ("UR" | "OBC" | "SC" | "ST" | "EWS")
 * @param vacancies - Vacancy breakdown object { UR: n, OBC: n, SC: n, ST: n, EWS: n, total: n }
 *                    OR just a total number (when category-wise data not available)
 * @returns Check result with message
 */
export function checkCategoryVacancy(
  category: string,
  vacancies: Record<string, number> | number | null,
): { result: CheckResult; message: string; vacanciesForCategory: number } {
  const cat = normalizeCategory(category)

  // No vacancy data available
  if (vacancies === null || vacancies === undefined) {
    return {
      result: 'unknown',
      message: 'Vacancy breakdown not available. [WARN] Cannot verify',
      vacanciesForCategory: 0,
    }
  }

  // Only total number provided (no category-wise split)
  if (typeof vacancies === 'number') {
    if (vacancies === 0) {
      // Exam-only notifications like UGC NET
      return {
        result: 'pass',
        message: 'This is an exam/eligibility test — no specific vacancies. [PASS] Open to all',
        vacanciesForCategory: 0,
      }
    }
    return {
      result: 'unknown',
      message: `Total vacancies: ${vacancies}. Category-wise breakdown not available. [WARN] Check notification`,
      vacanciesForCategory: 0,
    }
  }

  // Object with category-wise breakdown
  const catVacancies = vacancies[cat] ?? 0

  if (catVacancies > 0) {
    return {
      result: 'pass',
      message: `${cat} vacancies: ${catVacancies}. [PASS] Available`,
      vacanciesForCategory: catVacancies,
    }
  }

  // Reserved categories can also apply in UR (unreserved)
  if (cat !== 'UR' && (vacancies['UR'] ?? 0) > 0) {
    return {
      result: 'pass',
      message: `${cat} vacancies: 0. But UR (unreserved) vacancies: ${vacancies['UR']}. [PASS] Can apply in UR`,
      vacanciesForCategory: 0,
    }
  }

  if (catVacancies === 0) {
    return {
      result: 'fail',
      message: `${cat} vacancies: 0. No unreserved vacancies either. [FAIL] No vacancy`,
      vacanciesForCategory: 0,
    }
  }

  return {
    result: 'unknown',
    message: `Vacancy information unclear for ${cat}. [WARN] Check notification`,
    vacanciesForCategory: 0,
  }
}

/**
 * Evaluate eligibility for a single post within a job notification.
 *
 * Runs all individual checks, calculates composite score, and
 * determines the overall eligibility label.
 *
 * @param profile      - User's profile
 * @param post         - Post object from job.posts[]
 * @param job          - Parent job object (for age limits, dates, etc.)
 * @returns Full PostEligibility result
 */
export function evaluatePost(
  profile: UserProfile,
  post: any,
  job: any,
): PostEligibility {
  const jobLastDate = job.important_dates?.last_date || job.last_date || '2026-03-02'

  // ── 1. Age check ──
  const ageMin = parseAgeFromPost(post, 'min') ?? job.age_min ?? 0
  const ageMax = parseAgeFromPost(post, 'max') ?? job.age_max ?? 0
  const relaxation = getAgeRelaxation(
    profile.category,
    profile.is_pwd,
    profile.is_ex_serviceman,
    profile.is_central_govt_employee,
  )
  const ageCheck = checkAge(profile.dob, jobLastDate, ageMin, ageMax, relaxation)

  // ── 2. Education check ──
  const requiredLevel = inferEducationLevel(post.education_required, job.education_level)
  const eduCheck = checkEducation(profile.education_level, requiredLevel)

  // ── 3. Degree check ──
  const { degrees: reqDegrees, subjects: reqSubjects } = parseDegreeRequirement(post.education_required)
  const degreeCheck = checkDegree(profile.degree, profile.branch, reqDegrees, reqSubjects)

  // ── 4. Percentage check ──
  const percentageCheck = checkPercentage(profile.percentage, post.education_required)

  // ── 5. Category vacancy check ──
  // Our placeholder data only has total vacancies per post, no category-wise split.
  // Pass total_vacancies as a number, so checkCategoryVacancy handles it correctly.
  const vacancyCheck = checkCategoryVacancy(
    profile.category,
    post.vacancies_total ?? null,
  )

  // ── Score calculation ──
  const checks = {
    age: ageCheck.result === 'not_required' ? 'pass' as CheckResult : ageCheck.result,
    education: eduCheck.result,
    degree: degreeCheck.result,
    percentage: percentageCheck.result,
    category_vacancy: vacancyCheck.result,
  }

  const score = computeScore(checks)
  const label = scoreToLabel(score)

  return {
    post_name: post.post_name || 'Unnamed Post',
    post_code: post.post_code || null,
    vacancies_total: post.vacancies_total ?? 0,
    vacancies_for_category: vacancyCheck.vacanciesForCategory,
    salary: post.salary || 'As per rules',
    checks,
    checks_detail: {
      age_message: ageCheck.message,
      education_message: eduCheck.message,
      degree_message: degreeCheck.message,
      percentage_message: percentageCheck.message,
      vacancy_message: vacancyCheck.message,
    },
    score,
    label,
  }
}

/**
 * Evaluate eligibility for an entire job notification.
 *
 * The MAIN function called for each job. Loops through all posts,
 * evaluates each, and produces a summary.
 *
 * @param profile - User's profile
 * @param job     - Full job object (with posts array)
 * @returns Complete JobEligibilityResult
 */
export function evaluateJob(
  profile: UserProfile,
  job: any,
): JobEligibilityResult {
  const today = '2026-03-02'
  const lastDate = job.important_dates?.last_date || ''
  const isExpired = lastDate ? lastDate < today : false

  // Sector match
  const sectorMatch =
    profile.preferred_sectors.length === 0 ||
    profile.preferred_sectors.includes(job.sector)

  // Location match
  const locationMatch = checkLocationMatch(profile.preferred_state, job.locations)

  // Handle jobs with no posts array — treat job itself as a single post
  const posts: any[] =
    job.posts && Array.isArray(job.posts) && job.posts.length > 0
      ? job.posts
      : [
          {
            post_name: job.notification_title || 'Main Post',
            post_code: null,
            vacancies_total: job.total_vacancies ?? 0,
            education_required: job.education_level || '',
            age_limit: job.age_min && job.age_max ? `${job.age_min}–${job.age_max} years` : '',
            salary: job.salary_min && job.salary_max
              ? `₹${job.salary_min.toLocaleString('en-IN')}–₹${job.salary_max.toLocaleString('en-IN')}`
              : 'As per rules',
          },
        ]

  const evaluatedPosts = posts.map(post => evaluatePost(profile, post, job))

  // Sort by score descending (best match first)
  evaluatedPosts.sort((a, b) => b.score - a.score)

  const eligibleCount = evaluatedPosts.filter(p => p.label === 'eligible').length
  const partialCount = evaluatedPosts.filter(p => p.label === 'partial').length
  const notEligibleCount = evaluatedPosts.filter(p => p.label === 'not_eligible').length
  const bestScore = evaluatedPosts.length > 0 ? evaluatedPosts[0].score : 0

  return {
    job_slug: job.slug || job.id || '',
    notification_title: job.notification_title || '',
    department: job.department || '',
    total_posts: evaluatedPosts.length,
    eligible_posts: eligibleCount,
    partial_posts: partialCount,
    not_eligible_posts: notEligibleCount,
    best_score: bestScore,
    overall_label: scoreToLabel(bestScore),
    is_expired: isExpired,
    sector_match: sectorMatch,
    location_match: locationMatch,
    posts: evaluatedPosts,
  }
}

/**
 * Evaluate all jobs against a user profile.
 *
 * Sorts results: eligible first (by best_score desc), then partial,
 * then not_eligible. Within each group, sorted by best_score descending.
 *
 * @param profile - User's profile
 * @param jobs    - Array of job objects
 * @returns Sorted array of JobEligibilityResult
 */
export function evaluateAllJobs(
  profile: UserProfile,
  jobs: any[],
): JobEligibilityResult[] {
  const results = jobs.map(job => evaluateJob(profile, job))

  // Sort: eligible > partial > not_eligible, then by best_score desc
  const labelOrder: Record<string, number> = {
    eligible: 0,
    partial: 1,
    not_eligible: 2,
  }

  results.sort((a, b) => {
    const orderDiff = (labelOrder[a.overall_label] ?? 3) - (labelOrder[b.overall_label] ?? 3)
    if (orderDiff !== 0) return orderDiff
    return b.best_score - a.best_score
  })

  return results
}

// ═══════════════════════════════════════════════════════════════
//  INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════

/** Human-readable labels for education levels */
const EDUCATION_LABELS: Record<string, string> = {
  '10th': '10th Pass',
  '12th': '12th Pass',
  'iti': 'ITI',
  'diploma': 'Diploma',
  'graduate': 'Graduate',
  'pg': 'Post Graduate',
  'phd': 'PhD',
}

/**
 * Normalise a category string to its canonical form.
 * Maps "General" → "UR", "obc" → "OBC", etc.
 */
function normalizeCategory(category: string): string {
  return CATEGORY_NORMALIZE[category.toLowerCase().trim()] || category.toUpperCase().trim()
}

/**
 * Check if two degree names refer to the same qualification.
 * Uses the DEGREE_ALIASES map for fuzzy matching.
 *
 * Handles compound names like "B.Tech/B.E" vs "B.E./B.Tech" by
 * splitting on "/" and checking each sub-part independently.
 */
function degreesMatch(userDegree: string, requiredDegree: string): boolean {
  const u = userDegree.toLowerCase().trim()
  const r = requiredDegree.toLowerCase().trim()

  // Direct match
  if (u === r) return true

  // Check if either is an alias of the other (whole-string)
  const uCanonical = findCanonicalDegree(u)
  const rCanonical = findCanonicalDegree(r)

  if (uCanonical && rCanonical && uCanonical === rCanonical) return true

  // Split compound degree names on "/" and check each sub-part.
  // e.g. user "B.Tech/B.E" → ["b.tech", "b.e"]
  //      required "B.E./B.Tech" → ["b.e.", "b.tech"]
  const uParts = u.split('/').map(s => s.trim()).filter(Boolean)
  const rParts = r.split('/').map(s => s.trim()).filter(Boolean)

  // If ANY user part matches ANY required part (via canonical lookup)
  for (const up of uParts) {
    const upCanonical = findCanonicalDegree(up)
    for (const rp of rParts) {
      const rpCanonical = findCanonicalDegree(rp)
      // Direct sub-part match
      if (up === rp) return true
      // Canonical match
      if (upCanonical && rpCanonical && upCanonical === rpCanonical) return true
      // One is a substring of the other (handles trailing dots like "b.e.")
      if (up.replace(/\.$/, '') === rp.replace(/\.$/, '')) return true
    }
  }

  // Substring containment for flexible matching
  // e.g. required "B.E./B.Tech in Engineering" should match user "B.Tech/B.E"
  if (u.includes(r) || r.includes(u)) return true

  // Check if canonical forms match via aliases
  if (uCanonical && r.includes(uCanonical)) return true
  if (rCanonical && u.includes(rCanonical)) return true

  return false
}

/**
 * Find the canonical (normalised) name for a degree string.
 * Returns the key from DEGREE_ALIASES if found, otherwise null.
 */
function findCanonicalDegree(input: string): string | null {
  const lower = input.toLowerCase().trim()

  // Is it already a canonical key?
  if (DEGREE_ALIASES[lower]) return lower

  // Search in aliases
  for (const [canonical, aliases] of Object.entries(DEGREE_ALIASES)) {
    if (aliases.includes(lower)) return canonical
  }

  return null
}

/**
 * Check if two subject/branch names match (fuzzy, case-insensitive).
 */
function subjectsMatch(userBranch: string, required: string): boolean {
  const u = userBranch.toLowerCase().trim()
  const r = required.toLowerCase().trim()

  if (u === r) return true
  if (u.includes(r) || r.includes(u)) return true

  // Common abbreviation matching
  const abbreviations: Record<string, string[]> = {
    'computer science': ['cs', 'cse', 'comp sci', 'computer science and engineering'],
    'electronics': ['ece', 'electronics and communication', 'electronics & communication'],
    'mechanical': ['me', 'mechanical engineering'],
    'civil': ['ce', 'civil engineering'],
    'electrical': ['ee', 'electrical engineering'],
    'commerce': ['com', 'b.com', 'bcom'],
    'mathematics': ['maths', 'math'],
    'physics': ['phy'],
    'chemistry': ['chem'],
    'economics': ['eco'],
    'finance': ['fin'],
  }

  for (const [full, abbrs] of Object.entries(abbreviations)) {
    const allForms = [full, ...abbrs]
    const userMatch = allForms.some(f => u.includes(f))
    const reqMatch = allForms.some(f => r.includes(f))
    if (userMatch && reqMatch) return true
  }

  return false
}

/**
 * Attempt to extract minimum or maximum age from a post's age_limit string.
 * Handles formats like "20–28 years", "18-30 years", "17.5–23 years".
 *
 * @returns Parsed age number or null if not parseable
 */
function parseAgeFromPost(post: any, which: 'min' | 'max'): number | null {
  const ageStr: string = post.age_limit || ''
  if (!ageStr) return null

  // Match patterns like "20–28", "18-30", "17.5–23"
  const match = ageStr.match(/(\d+(?:\.\d+)?)\s*[–\-—]\s*(\d+(?:\.\d+)?)/)
  if (match) {
    return which === 'min' ? Math.floor(parseFloat(match[1])) : Math.ceil(parseFloat(match[2]))
  }

  // Match "Maximum 30 years"
  if (which === 'max') {
    const maxMatch = ageStr.match(/maximum\s+(\d+)/i)
    if (maxMatch) return parseInt(maxMatch[1], 10)
  }

  // Match "No upper age limit"
  if (/no\s+(upper\s+)?age\s+limit/i.test(ageStr)) {
    return which === 'max' ? 99 : null
  }

  return null
}

/**
 * Infer the education level key from a post's education_required text.
 * Falls back to the job-level education_level if inference fails.
 */
function inferEducationLevel(educationText: string | undefined, jobLevel: string): string {
  if (!educationText) return jobLevel || 'graduate'

  const lower = educationText.toLowerCase()

  // Check from highest to lowest to avoid false matches
  if (/ph\.?d|doctorate/i.test(lower)) return 'phd'
  if (/post[- ]?graduat|master|m\.tech|m\.sc|m\.com|m\.a\b|mba|mca|m\.ed|m\.e\b/i.test(lower)) return 'pg'
  if (/graduat|b\.tech|b\.e\b|b\.sc|b\.com|b\.a\b|bba|bca|b\.ed|mbbs|b\.pharm|b\.arch|bachelor/i.test(lower)) return 'graduate'
  if (/diploma/i.test(lower)) return 'diploma'
  if (/iti|trade\s+certificate/i.test(lower)) return 'iti'
  if (/12th|10\+2|intermediate|higher\s+secondary|hsc/i.test(lower)) return '12th'
  if (/10th|class\s+10|sslc|matricul|secondary\b/i.test(lower)) return '10th'

  return jobLevel || 'graduate'
}

/**
 * Parse degree and subject requirements from a post's education_required text.
 * Returns arrays of acceptable degree names and subjects, or null if open.
 */
function parseDegreeRequirement(educationText: string | undefined): {
  degrees: string[] | null
  subjects: string[] | null
} {
  if (!educationText) return { degrees: null, subjects: null }

  const text = educationText

  // Check for "any discipline" or "any degree" — no specific requirement
  if (/any\s+discipline|any\s+degree|any\s+stream|any\s+subject/i.test(text)) {
    return { degrees: null, subjects: null }
  }

  const degrees: string[] = []
  const subjects: string[] = []

  // Extract specific degree patterns
  const degreePatterns = [
    /\bB\.?E\.?\/?B\.?Tech\b/i,
    /\bB\.?Tech\b/i,
    /\bB\.?E\b\.?/i,
    /\bB\.?Sc\b\.?/i,
    /\bB\.?Com\b\.?/i,
    /\bB\.?A\b\.?/i,
    /\bBBA\b/i,
    /\bBCA\b/i,
    /\bMBBS\b/i,
    /\bB\.?Pharm\b/i,
    /\bB\.?Arch\b/i,
    /\bLLB\b/i,
    /\bB\.?Ed\b/i,
    /\bM\.?Tech\b/i,
    /\bM\.?Sc\b/i,
    /\bM\.?Com\b/i,
    /\bM\.?A\b\.?/i,
    /\bMBA\b/i,
    /\bMCA\b/i,
  ]

  for (const pattern of degreePatterns) {
    const match = text.match(pattern)
    if (match) {
      degrees.push(match[0])
    }
  }

  // Extract subject/branch mentions after "in" or "with"
  const subjectMatch = text.match(/\bin\s+(.+?)(?:\s+from|\s+with|\s*;|\s*\(|$)/i)
  if (subjectMatch) {
    const subjectStr = subjectMatch[1].trim()
    // Split by / or , or & to get individual subjects
    const parts = subjectStr.split(/[\/,&]/).map(s => s.trim()).filter(Boolean)
    for (const p of parts) {
      // Filter out generic words
      if (!/^(a|any|the|recognised|recognized|relevant)$/i.test(p) && p.length > 2) {
        subjects.push(p)
      }
    }
  }

  // Extract subjects after "with" (e.g. "with Commerce/Accountancy")
  const withMatch = text.match(/\bwith\s+(.+?)(?:\s+from|\s*;|\s*\(|$)/i)
  if (withMatch && subjects.length === 0) {
    const parts = withMatch[1].split(/[\/,&]/).map(s => s.trim()).filter(Boolean)
    for (const p of parts) {
      if (!/^(minimum|min|at\s+least|\d+|recognised|recognized)$/i.test(p) && p.length > 2) {
        subjects.push(p)
      }
    }
  }

  return {
    degrees: degrees.length > 0 ? degrees : null,
    subjects: subjects.length > 0 ? subjects : null,
  }
}

/**
 * Check percentage/marks requirement from education_required text.
 */
function checkPercentage(
  userPercentage: number | null,
  educationText: string | undefined,
): { result: CheckResult; message: string } {
  if (!educationText) {
    return { result: 'not_required', message: 'No minimum marks specified. [PASS]' }
  }

  // Look for percentage requirement patterns
  const pctMatch = educationText.match(/(\d+)\s*%\s*(?:marks|aggregate)?/i)
  const minMatch = educationText.match(/minimum\s+(\d+)\s*%/i)

  const requiredPct = minMatch ? parseInt(minMatch[1], 10) : (pctMatch ? parseInt(pctMatch[1], 10) : null)

  if (requiredPct === null) {
    return { result: 'not_required', message: 'No minimum marks specified. [PASS]' }
  }

  if (userPercentage === null || userPercentage === undefined) {
    return {
      result: 'unknown',
      message: `Minimum ${requiredPct}% required. Your marks: not entered. [WARN] Cannot verify`,
    }
  }

  if (userPercentage >= requiredPct) {
    return {
      result: 'pass',
      message: `Minimum ${requiredPct}% required. Your marks: ${userPercentage}%. [PASS] Meets requirement`,
    }
  }

  return {
    result: 'fail',
    message: `Minimum ${requiredPct}% required. Your marks: ${userPercentage}%. [FAIL] Below requirement`,
  }
}

/**
 * Check if the user's preferred location matches any of the job's locations.
 */
function checkLocationMatch(preferredState: string, jobLocations: string[]): boolean {
  if (!preferredState || preferredState === 'all_india') return true
  if (!jobLocations || jobLocations.length === 0) return true

  // "All India" jobs match everyone
  if (jobLocations.some(loc => /all\s+india/i.test(loc))) return true

  // Check if any job location matches user's preferred state
  const userState = preferredState.toLowerCase().replace(/_/g, ' ')
  return jobLocations.some(loc => {
    const locLower = loc.toLowerCase()
    return locLower.includes(userState) || userState.includes(locLower)
  })
}

/**
 * Compute a weighted composite score from check results.
 *
 * @param checks - Object mapping check names to their results
 * @returns Score from 0 to 100
 */
function computeScore(checks: Record<string, CheckResult>): number {
  let total = 0

  for (const [key, result] of Object.entries(checks)) {
    const weight = CHECK_WEIGHTS[key as keyof typeof CHECK_WEIGHTS] ?? 0
    switch (result) {
      case 'pass':
      case 'not_required':
        total += weight
        break
      case 'unknown':
        total += weight * 0.5
        break
      case 'fail':
        total += 0
        break
    }
  }

  return Math.round(total)
}

/**
 * Map a numeric score to a human-readable eligibility label.
 *
 * @param score - 0 to 100
 * @returns Label string
 */
function scoreToLabel(score: number): 'eligible' | 'partial' | 'not_eligible' {
  if (score >= 90) return 'eligible'
  if (score >= 55) return 'partial'
  return 'not_eligible'
}
