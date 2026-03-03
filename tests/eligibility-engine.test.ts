/**
 * SarkariMatch — Eligibility Engine Test Suite
 *
 * Run: npx tsx tests/eligibility-engine.test.ts
 */

import {
  calculateAge,
  getAgeRelaxation,
  checkAge,
  getEducationRank,
  checkEducation,
  checkDegree,
  checkCategoryVacancy,
  evaluatePost,
  evaluateJob,
  evaluateAllJobs,
  type UserProfile,
  type JobEligibilityResult,
} from '../src/lib/eligibility-engine'

import { placeholderJobs } from '../src/lib/placeholder-data'

// ═══════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════

let passed = 0
let failed = 0
let total = 0

function assert(condition: boolean, label: string, detail?: string) {
  total++
  if (condition) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

function section(name: string) {
  console.log(`\n═══ ${name} ═══`)
}

// ═══════════════════════════════════════════════════
// 1. calculateAge
// ═══════════════════════════════════════════════════
section('calculateAge')

const age1 = calculateAge('2000-01-15', '2026-03-25')
assert(age1.years === 26, 'Age 2000-01-15 → 2026-03-25 = 26 years', `got ${age1.years}`)
assert(age1.months === 2, '... 2 months', `got ${age1.months}`)
assert(age1.days === 10, '... 10 days', `got ${age1.days}`)

const age2 = calculateAge('1998-06-30', '2026-03-02')
assert(age2.years === 27, 'Age 1998-06-30 → 2026-03-02 = 27 years', `got ${age2.years}`)
assert(age2.months === 8, '... 8 months', `got ${age2.months}`)

const age3 = calculateAge('2000-03-02', '2026-03-02')
assert(age3.years === 26, 'Exact birthday = 26 years', `got ${age3.years}`)
assert(age3.months === 0, '... 0 months', `got ${age3.months}`)
assert(age3.days === 0, '... 0 days', `got ${age3.days}`)

// Leap year: 2000-02-29 → 2026-03-01
const age4 = calculateAge('2000-02-29', '2026-03-01')
assert(age4.years === 26, 'Leap year DOB: 2000-02-29 → 2026-03-01 = 26 years', `got ${age4.years}`)
assert(age4.months === 0, '... 0 months', `got ${age4.months}`)

// Young person
const age5 = calculateAge('2010-12-25', '2026-03-02')
assert(age5.years === 15, 'Young: 2010-12-25 = 15 years', `got ${age5.years}`)

// Older person
const age6 = calculateAge('1975-01-01', '2026-03-02')
assert(age6.years === 51, 'Older: 1975-01-01 = 51 years', `got ${age6.years}`)


// ═══════════════════════════════════════════════════
// 2. getAgeRelaxation
// ═══════════════════════════════════════════════════
section('getAgeRelaxation')

assert(getAgeRelaxation('General', false, false, false) === 0, 'UR, no extras = 0')
assert(getAgeRelaxation('OBC', false, false, false) === 3, 'OBC base = 3')
assert(getAgeRelaxation('SC', false, false, false) === 5, 'SC base = 5')
assert(getAgeRelaxation('ST', false, false, false) === 5, 'ST base = 5')
assert(getAgeRelaxation('EWS', false, false, false) === 0, 'EWS base = 0')

// PwD additional
assert(getAgeRelaxation('General', true, false, false) === 10, 'UR + PwD = 10')
assert(getAgeRelaxation('OBC', true, false, false) === 13, 'OBC + PwD = 13')
assert(getAgeRelaxation('SC', true, false, false) === 15, 'SC + PwD = 15')
assert(getAgeRelaxation('ST', true, false, false) === 15, 'ST + PwD = 15')

// Ex-Serviceman additional
assert(getAgeRelaxation('General', false, true, false) === 5, 'UR + Ex-SM = 5')
assert(getAgeRelaxation('OBC', false, true, false) === 8, 'OBC + Ex-SM = 8')
assert(getAgeRelaxation('SC', false, true, false) === 10, 'SC + Ex-SM = 10')

// PwD + Ex-SM: take higher additional only (PwD: 10 > Ex-SM: 5)
assert(getAgeRelaxation('General', true, true, false) === 10, 'UR + PwD + Ex-SM = 10 (PwD wins)')
assert(getAgeRelaxation('OBC', true, true, false) === 13, 'OBC + PwD + Ex-SM = 13')

// Central Govt Employee stacks
assert(getAgeRelaxation('General', false, false, true) === 5, 'UR + CGE = 5')
assert(getAgeRelaxation('OBC', false, false, true) === 8, 'OBC + CGE = 8')
assert(getAgeRelaxation('SC', true, false, true) === 20, 'SC + PwD + CGE = 20')

// Everything combined
assert(getAgeRelaxation('ST', true, true, true) === 20, 'ST + PwD + Ex-SM + CGE = 5+10+5 = 20')


// ═══════════════════════════════════════════════════
// 3. checkAge
// ═══════════════════════════════════════════════════
section('checkAge')

const ageR1 = checkAge('2000-06-15', '2026-03-25', 20, 28, 0)
assert(ageR1.result === 'pass', 'Age 25y within 20-28 = pass')
assert(ageR1.message.includes('✅'), '... message has ✅')

const ageR2 = checkAge('1990-01-01', '2026-03-25', 20, 28, 0)
assert(ageR2.result === 'fail', 'Age 36y exceeds 28 with 0 relax = fail')
assert(ageR2.message.includes('❌'), '... message has ❌')

const ageR3 = checkAge('1990-01-01', '2026-03-25', 20, 28, 3)
assert(ageR3.result === 'fail', 'Age 36y exceeds 28+3=31 = fail')

const ageR4 = checkAge('1996-01-01', '2026-03-25', 20, 28, 3)
assert(ageR4.result === 'pass', 'Age 30y within 20-(28+3)=31 = pass')
assert(ageR4.message.includes('+3 relaxation'), '... message mentions relaxation')

const ageR5 = checkAge('2012-01-01', '2026-03-25', 18, 30, 0)
assert(ageR5.result === 'fail', 'Age 14y under min 18 = fail')

// No age limit (UGC NET)
const ageR6 = checkAge('1990-01-01', '2026-04-05', 0, 0, 0)
assert(ageR6.result === 'pass', 'No age limit (0-0) = pass')


// ═══════════════════════════════════════════════════
// 4. getEducationRank
// ═══════════════════════════════════════════════════
section('getEducationRank')

assert(getEducationRank('10th') === 1, '10th = rank 1')
assert(getEducationRank('12th') === 2, '12th = rank 2')
assert(getEducationRank('iti') === 2.5, 'ITI = rank 2.5')
assert(getEducationRank('diploma') === 3, 'Diploma = rank 3')
assert(getEducationRank('graduate') === 4, 'Graduate = rank 4')
assert(getEducationRank('pg') === 5, 'PG = rank 5')
assert(getEducationRank('phd') === 6, 'PhD = rank 6')
assert(getEducationRank('unknown') === 0, 'Unknown = rank 0')


// ═══════════════════════════════════════════════════
// 5. checkEducation
// ═══════════════════════════════════════════════════
section('checkEducation')

const edu1 = checkEducation('graduate', 'graduate')
assert(edu1.result === 'pass', 'Graduate meets Graduate = pass')

const edu2 = checkEducation('graduate', '12th')
assert(edu2.result === 'pass', 'Graduate meets 12th (overqualified) = pass')
assert(edu2.message.includes('overqualified'), '... mentions overqualified')

const edu3 = checkEducation('12th', 'graduate')
assert(edu3.result === 'fail', '12th does NOT meet Graduate = fail')

const edu4 = checkEducation('pg', '10th')
assert(edu4.result === 'pass', 'PG meets 10th (overqualified) = pass')

const edu5 = checkEducation('10th', 'pg')
assert(edu5.result === 'fail', '10th does NOT meet PG = fail')


// ═══════════════════════════════════════════════════
// 6. checkDegree
// ═══════════════════════════════════════════════════
section('checkDegree')

const deg1 = checkDegree('B.Tech/B.E', 'Computer Science', null, null)
assert(deg1.result === 'not_required', 'No degree requirement = not_required')

const deg2 = checkDegree('B.Tech/B.E', 'CS', ['B.E./B.Tech'], null)
assert(deg2.result === 'pass', 'B.Tech/B.E matches B.E./B.Tech = pass')

const deg3 = checkDegree('B.Com', null, ['B.E./B.Tech', 'B.Tech'], null)
assert(deg3.result === 'fail', 'B.Com does NOT match B.E./B.Tech = fail')

const deg4 = checkDegree(null, null, ['B.Tech'], null)
assert(deg4.result === 'unknown', 'No user degree but requirement exists = unknown')

const deg5 = checkDegree('B.Sc', 'Physics', ['B.Sc'], ['Physics', 'Mathematics'])
assert(deg5.result === 'pass', 'B.Sc Physics matches B.Sc + [Physics, Maths] = pass')

const deg6 = checkDegree('B.Sc', 'Chemistry', ['B.Sc'], ['Physics', 'Mathematics'])
assert(deg6.result === 'fail', 'B.Sc Chemistry vs required Physics/Maths = fail')


// ═══════════════════════════════════════════════════
// 7. checkCategoryVacancy
// ═══════════════════════════════════════════════════
section('checkCategoryVacancy')

const vac1 = checkCategoryVacancy('General', { UR: 100, OBC: 80, SC: 50, ST: 25, EWS: 30 })
assert(vac1.result === 'pass', 'UR with 100 vacancies = pass')
assert(vac1.vacanciesForCategory === 100, '... vacanciesForCategory = 100')

const vac2 = checkCategoryVacancy('SC', { UR: 100, OBC: 80, SC: 0, ST: 0, EWS: 0 })
assert(vac2.result === 'pass', 'SC=0 but UR=100, can apply in UR = pass')
assert(vac2.message.includes('Can apply in UR'), '... message mentions UR')

const vac3 = checkCategoryVacancy('OBC', { UR: 0, OBC: 0, SC: 50, ST: 25, EWS: 0 })
assert(vac3.result === 'fail', 'OBC=0 and UR=0 = fail')

const vac4 = checkCategoryVacancy('General', null)
assert(vac4.result === 'unknown', 'Null vacancy data = unknown')

const vac5 = checkCategoryVacancy('General', 5000)
assert(vac5.result === 'unknown', 'Total only (no category split) = unknown')

const vac6 = checkCategoryVacancy('General', 0)
assert(vac6.result === 'pass', 'Zero vacancies (exam-type) = pass')


// ═══════════════════════════════════════════════════
// 8. evaluatePost
// ═══════════════════════════════════════════════════
section('evaluatePost')

const testProfile: UserProfile = {
  dob: '2000-06-15',
  gender: 'male',
  education_level: 'graduate',
  degree: 'B.Tech/B.E',
  branch: 'Computer Science',
  percentage: 72,
  category: 'OBC',
  is_pwd: false,
  pwd_type: null,
  is_ex_serviceman: false,
  ex_service_years: null,
  is_central_govt_employee: false,
  preferred_sectors: ['banking', 'railway', 'ssc'],
  preferred_state: 'all_india',
}

const sbiJob = placeholderJobs.find(j => j.id === 'sbi-clerk-2026')!
const sbiPost = sbiJob.posts[0] // Junior Associate (Customer Support)
const postResult = evaluatePost(testProfile, sbiPost, sbiJob)

assert(postResult.post_name.includes('Junior Associate'), 'Post name preserved')
assert(postResult.checks.age === 'pass', 'SBI Clerk: age 25y within 20-28(+3 OBC) = pass')
assert(postResult.checks.education === 'pass', 'SBI Clerk: graduate meets graduate = pass')
assert(postResult.score > 0, `Score > 0: got ${postResult.score}`)
assert(postResult.label === 'eligible' || postResult.label === 'partial', `Label is eligible/partial: ${postResult.label}`)


// ═══════════════════════════════════════════════════
// 9. evaluateJob
// ═══════════════════════════════════════════════════
section('evaluateJob')

const sbiResult = evaluateJob(testProfile, sbiJob)

assert(sbiResult.job_slug === 'sbi-clerk-recruitment-2026', 'Job slug preserved')
assert(sbiResult.total_posts === 3, 'SBI Clerk has 3 posts')
assert(sbiResult.eligible_posts + sbiResult.partial_posts + sbiResult.not_eligible_posts === 3, 'Post counts sum to total')
assert(sbiResult.best_score > 0, `Best score > 0: ${sbiResult.best_score}`)
assert(sbiResult.posts.length === 3, 'All 3 posts evaluated')
assert(sbiResult.posts[0].score >= sbiResult.posts[1].score, 'Posts sorted by score desc')
assert(sbiResult.sector_match === true, 'Banking matches preferred sectors')
assert(sbiResult.is_expired === false, 'SBI Clerk is not expired')

console.log(`  ℹ️  SBI Clerk overall: ${sbiResult.overall_label} (best score: ${sbiResult.best_score})`)
sbiResult.posts.forEach(p => {
  console.log(`     • ${p.post_name}: score=${p.score} (${p.label})`)
})


// ═══════════════════════════════════════════════════
// 10. evaluateAllJobs
// ═══════════════════════════════════════════════════
section('evaluateAllJobs')

const allResults = evaluateAllJobs(testProfile, placeholderJobs)

assert(allResults.length === placeholderJobs.length, `All ${placeholderJobs.length} jobs evaluated`)

// Verify sort order: eligible first, then partial, then not_eligible
let prevOrder = -1
let sortCorrect = true
for (const r of allResults) {
  const order = r.overall_label === 'eligible' ? 0 : r.overall_label === 'partial' ? 1 : 2
  if (order < prevOrder) { sortCorrect = false; break }
  prevOrder = order
}
assert(sortCorrect, 'Results sorted: eligible → partial → not_eligible')

console.log('\n  📊 Full evaluation results for test profile:')
console.log(`     (${testProfile.education_level}, ${testProfile.degree}, ${testProfile.category}, age ~25y, sectors: ${testProfile.preferred_sectors.join(',')})\n`)
allResults.forEach(r => {
  const emoji = r.overall_label === 'eligible' ? '✅' : r.overall_label === 'partial' ? '⚠️' : '❌'
  const expired = r.is_expired ? ' [EXPIRED]' : ''
  const sector = r.sector_match ? '' : ' [sector mismatch]'
  console.log(`     ${emoji} ${r.notification_title}${expired}${sector}`)
  console.log(`        Score: ${r.best_score} | Eligible: ${r.eligible_posts}/${r.total_posts} posts`)
})


// ═══════════════════════════════════════════════════
// 11. Edge cases
// ═══════════════════════════════════════════════════
section('Edge Cases')

// 12th-pass user vs graduate jobs
const profile12th: UserProfile = {
  ...testProfile,
  education_level: '12th',
  degree: null,
  branch: null,
  percentage: null,
}

const rrb = placeholderJobs.find(j => j.id === 'rrb-ntpc-02-2026')!
const rrbResult = evaluateJob(profile12th, rrb)
assert(rrbResult.total_posts === 4, 'RRB NTPC: 4 posts evaluated for 12th user')
// The Ticket Clerk and Accounts Clerk posts require 12th, so should be eligible
// Station Master and Traffic Assistant require graduation, should fail/partial
const ticketClerkPost = rrbResult.posts.find(p => p.post_name.includes('Ticket Clerk'))
assert(
  ticketClerkPost !== undefined && ticketClerkPost.checks.education === 'pass',
  'RRB Ticket Clerk: 12th user meets 12th requirement'
)
const stationMasterPost = rrbResult.posts.find(p => p.post_name.includes('Station Master'))
assert(
  stationMasterPost !== undefined && stationMasterPost.checks.education === 'fail',
  'RRB Station Master: 12th user fails graduate requirement'
)

// NTA UGC NET — no age limit, PG required
const pgProfile: UserProfile = {
  ...testProfile,
  education_level: 'pg',
  degree: 'M.Tech/M.E',
}
const ugcNet = placeholderJobs.find(j => j.id === 'nta-ugc-net-2026')!
const ugcResult = evaluateJob(pgProfile, ugcNet)
assert(ugcResult.posts[0].checks.age === 'pass', 'UGC NET: no age limit = pass')
assert(ugcResult.posts[0].checks.education === 'pass', 'UGC NET: PG user meets PG = pass')

// Defence jobs: Agniveer with age range
// Use a UR profile (0 relaxation) so age 25y truly fails max 23
const armyProfile: UserProfile = {
  ...testProfile,
  category: 'General',
}
const army = placeholderJobs.find(j => j.id === 'army-agniveer-2026')!
const armyResult = evaluateJob(armyProfile, army)
assert(armyResult.total_posts === 4, 'Agniveer: 4 posts evaluated')
// 25y UR user, max is 23, no relaxation, should fail
const gdPost = armyResult.posts.find(p => p.post_name.includes('General Duty'))
assert(
  gdPost !== undefined && gdPost.checks.age === 'fail',
  'Agniveer GD: 25y UR user fails 17.5-23 age range (0 relax)'
)

// With OBC +3, the 25y user should PASS (23+3=26 > 25)
const armyResultOBC = evaluateJob(testProfile, army)
const gdPostOBC = armyResultOBC.posts.find(p => p.post_name.includes('General Duty'))
assert(
  gdPostOBC !== undefined && gdPostOBC.checks.age === 'pass',
  'Agniveer GD: 25y OBC user passes 17.5-23+3=26 range'
)

// Job with no posts array
const jobNoPost = {
  ...sbiJob,
  id: 'test-no-posts',
  slug: 'test-no-posts',
  posts: [],
}
const noPostResult = evaluateJob(testProfile, jobNoPost)
assert(noPostResult.total_posts === 1, 'Job with empty posts: treated as 1 synthetic post')

// User with no percentage vs job requiring minimum
const noPctProfile: UserProfile = {
  ...testProfile,
  percentage: null,
}
const ibps = placeholderJobs.find(j => j.id === 'ibps-po-2026')!
const ibpsMT = ibps.posts[1] // MT requires 55% marks
const mtResult = evaluatePost(noPctProfile, ibpsMT, ibps)
assert(
  mtResult.checks.percentage === 'unknown',
  'IBPS MT: no percentage entered = unknown'
)

// Expired job check
const expiredJob = {
  ...sbiJob,
  important_dates: { ...sbiJob.important_dates, last_date: '2026-02-28' },
}
const expiredResult = evaluateJob(testProfile, expiredJob)
assert(expiredResult.is_expired === true, 'Job with past last_date is marked expired')

// Location match
const upProfile: UserProfile = {
  ...testProfile,
  preferred_state: 'uttar_pradesh',
}
const upPolice = placeholderJobs.find(j => j.id === 'up-police-constable-2026')!
const upResult = evaluateJob(upProfile, upPolice)
assert(upResult.location_match === true, 'UP user matches UP Police location')

const biharProfile: UserProfile = {
  ...testProfile,
  preferred_state: 'bihar',
}
const biharUpResult = evaluateJob(biharProfile, upPolice)
assert(biharUpResult.location_match === false, 'Bihar user does NOT match UP Police location')


// ═══════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════
console.log('\n' + '═'.repeat(50))
console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`)
console.log('═'.repeat(50))

if (failed > 0) {
  console.log('⚠️  Some tests FAILED!')
  process.exit(1)
} else {
  console.log('🎉 All tests PASSED!')
  process.exit(0)
}
