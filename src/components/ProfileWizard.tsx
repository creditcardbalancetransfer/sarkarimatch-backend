import type { FC } from 'hono/jsx'

/** months for DOB dropdown */
const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const educationLevels = [
  { value: '10th', icon: '📄', label: '10th Pass' },
  { value: '12th', icon: '📄', label: '12th Pass' },
  { value: 'iti', icon: '🔧', label: 'ITI' },
  { value: 'diploma', icon: '📐', label: 'Diploma' },
  { value: 'graduate', icon: '🎓', label: 'Graduate' },
  { value: 'pg', icon: '🎓', label: 'Post Graduate' },
]

const graduateDegrees = [
  'B.Tech/B.E','B.Sc','B.Com','BA','BBA','BCA','LLB','B.Ed',
  'MBBS','B.Pharm','B.Arch','BDS','BAMS','BHMS','B.Lib','Other'
]
const pgDegrees = [
  'M.Tech/M.E','M.Sc','M.Com','MA','MBA','MCA','LLM','M.Ed',
  'MD','M.Pharm','M.Arch','MDS','Other'
]

const categories = [
  { value: 'General', label: 'General / UR' },
  { value: 'OBC', label: 'OBC (Non-Creamy Layer)' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'EWS', label: 'EWS' },
]

const sectors = [
  { value: 'banking', icon: '🏦', label: 'Banking' },
  { value: 'railway', icon: '🚂', label: 'Railway' },
  { value: 'ssc', icon: '📋', label: 'SSC' },
  { value: 'upsc', icon: '🏛️', label: 'UPSC' },
  { value: 'defence', icon: '🎖️', label: 'Defence' },
  { value: 'teaching', icon: '👨‍🏫', label: 'Teaching' },
  { value: 'state_psc', icon: '🏢', label: 'State PSC' },
  { value: 'police', icon: '👮', label: 'Police' },
  { value: 'psu', icon: '🏭', label: 'PSU' },
  { value: 'other', icon: '📌', label: 'Other' },
]

const states = [
  'All India',
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar','Chandigarh','Dadra & Nagar Haveli and Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry'
]

const pwdTypes = [
  'Locomotor','Visual','Hearing','Intellectual','Mental Illness','Multiple'
]

const stepLabels = ['Age', 'Education', 'Category', 'Preferences', 'Review']

export const ProfileWizard: FC = () => {
  return (
    <>
      {/* ══════════════════════════════════════════════════════
          PROFILE WIZARD MODAL
          ══════════════════════════════════════════════════════ */}
      <div
        id="profile-wizard-overlay"
        class="fixed inset-0 z-[200] hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Profile Setup Wizard"
      >
        {/* Backdrop */}
        <div id="pw-backdrop" class="absolute inset-0 bg-black/50" style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);" />

        {/* Modal card */}
        <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div
            id="pw-card"
            class="pointer-events-auto w-full max-w-[600px] max-h-[90vh] bg-white dark:bg-surface-card-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden pw-card-enter"
          >
            {/* ─── HEADER ─── */}
            <div class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-2 flex-shrink-0">
              <div>
                <div id="pw-editing-banner" class="hidden text-xs font-medium text-brand-primary dark:text-blue-400 mb-1">
                  📝 Editing your existing profile
                </div>
                <h2 id="pw-heading" class="font-heading font-bold text-lg sm:text-xl text-content-primary dark:text-white">
                  When were you born?
                </h2>
                <p id="pw-subtext" class="text-sm text-content-secondary dark:text-content-dark-muted mt-0.5">
                  We calculate your age on each job's last date to check eligibility
                </p>
              </div>
              <button
                id="pw-close"
                type="button"
                class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-content-secondary dark:text-content-dark-muted transition-colors flex-shrink-0 ml-3"
                aria-label="Close wizard"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ─── PROGRESS BAR ─── */}
            <div class="px-5 sm:px-6 pt-3 pb-4 flex-shrink-0" aria-label="Wizard progress">
              <div class="flex items-center justify-between relative">
                {/* Connection line behind dots */}
                <div class="absolute top-3 left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-0" />
                <div id="pw-progress-fill" class="absolute top-3 left-[10%] h-0.5 bg-brand-success -z-0 transition-all duration-500" style="width: 0%;" />

                {stepLabels.map((label, i) => (
                  <div key={label} class="flex flex-col items-center z-10" style="flex: 1;">
                    <div
                      class={`pw-dot w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                        i === 0
                          ? 'border-brand-secondary bg-brand-secondary text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-card-dark text-gray-400 dark:text-gray-500'
                      }`}
                      data-step={i}
                    >
                      <span class="pw-dot-num">{i + 1}</span>
                      <svg class="pw-dot-check w-3 h-3 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-[10px] mt-1 text-content-secondary dark:text-content-dark-muted font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── STEPS CONTAINER ─── */}
            <div id="pw-steps" class="flex-1 overflow-y-auto overflow-x-hidden relative px-5 sm:px-6">

              {/* ════════ STEP 1: AGE ════════ */}
              <div class="pw-step" data-step="0">
                <div class="space-y-5 pb-4">
                  {/* Date of Birth */}
                  <fieldset>
                    <legend class="text-sm font-semibold text-content-primary dark:text-white mb-2">Date of Birth <span class="text-brand-danger">*</span></legend>
                    <div class="grid grid-cols-3 gap-3">
                      <div>
                        <label for="pw-dob-day" class="sr-only">Day</label>
                        <select id="pw-dob-day" class="pw-select w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-colors">
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label for="pw-dob-month" class="sr-only">Month</label>
                        <select id="pw-dob-month" class="pw-select w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-colors">
                          <option value="">Month</option>
                          {months.map((m, i) => (
                            <option key={m} value={String(i + 1)}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label for="pw-dob-year" class="sr-only">Year</label>
                        <select id="pw-dob-year" class="pw-select w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-colors">
                          <option value="">Year</option>
                          {Array.from({ length: 41 }, (_, i) => {
                            const y = 2010 - i
                            return <option key={y} value={String(y)}>{y}</option>
                          })}
                        </select>
                      </div>
                    </div>
                    <div id="pw-age-display" class="mt-2 text-sm text-content-secondary dark:text-content-dark-muted hidden">
                      <span class="inline-flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-brand-primary dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        You are currently <strong id="pw-age-text" class="text-content-primary dark:text-white mx-1">—</strong>
                      </span>
                    </div>
                    <p id="pw-dob-error" class="mt-1 text-xs text-brand-danger hidden"></p>
                  </fieldset>

                  {/* Gender */}
                  <fieldset>
                    <legend class="text-sm font-semibold text-content-primary dark:text-white mb-2">Gender <span class="text-brand-danger">*</span></legend>
                    <div class="flex gap-3 flex-wrap">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <label key={g} class="pw-radio-card flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn cursor-pointer transition-all duration-150 hover:border-brand-secondary">
                          <input type="radio" name="pw-gender" value={g.toLowerCase()} class="sr-only" />
                          <span class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors">
                            <span class="pw-radio-dot w-2 h-2 rounded-full bg-brand-secondary scale-0 transition-transform" />
                          </span>
                          <span class="text-sm font-medium text-content-primary dark:text-content-dark">{g}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>

              {/* ════════ STEP 2: EDUCATION ════════ */}
              <div class="pw-step hidden" data-step="1">
                <div class="space-y-5 pb-4">
                  {/* Education level cards */}
                  <fieldset>
                    <legend class="text-sm font-semibold text-content-primary dark:text-white mb-2">Highest Qualification <span class="text-brand-danger">*</span></legend>
                    <div class="grid grid-cols-3 gap-2.5">
                      {educationLevels.map((edu) => (
                        <button
                          key={edu.value}
                          type="button"
                          class="pw-edu-card flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-card text-center transition-all duration-150 hover:border-brand-secondary/50 cursor-pointer"
                          data-value={edu.value}
                        >
                          <span class="text-xl mb-1" aria-hidden="true">{edu.icon}</span>
                          <span class="text-xs sm:text-sm font-semibold text-content-primary dark:text-content-dark leading-tight">{edu.label}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* Conditional: Degree dropdown (graduate/pg) */}
                  <div id="pw-degree-section" class="hidden pw-slide-down">
                    <label for="pw-degree" class="text-sm font-semibold text-content-primary dark:text-white mb-1.5 block">
                      Degree <span class="text-brand-danger">*</span>
                    </label>
                    <select id="pw-degree" class="pw-select w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none">
                      <option value="">Select degree</option>
                      {graduateDegrees.map((d) => (
                        <option key={d} value={d} class="pw-degree-grad">{d}</option>
                      ))}
                      {pgDegrees.map((d) => (
                        <option key={d} value={d} class="pw-degree-pg hidden">{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Conditional: Branch/Subject (graduate/pg) */}
                  <div id="pw-branch-section" class="hidden pw-slide-down">
                    <label for="pw-branch" class="text-sm font-semibold text-content-primary dark:text-white mb-1.5 block">Branch / Subject</label>
                    <input
                      type="text"
                      id="pw-branch"
                      class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none placeholder:text-gray-400"
                      placeholder="Enter your branch or subject"
                    />
                  </div>

                  {/* Conditional: Trade (diploma/iti) */}
                  <div id="pw-trade-section" class="hidden pw-slide-down">
                    <label for="pw-trade" class="text-sm font-semibold text-content-primary dark:text-white mb-1.5 block">Trade / Branch</label>
                    <input
                      type="text"
                      id="pw-trade"
                      class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none placeholder:text-gray-400"
                      placeholder="e.g., Fitter, Electrician, Civil Engineering"
                    />
                  </div>

                  {/* Percentage */}
                  <div>
                    <label for="pw-percentage" class="text-sm font-semibold text-content-primary dark:text-white mb-1 block">Percentage or CGPA (optional)</label>
                    <p class="text-xs text-content-secondary dark:text-content-dark-muted mb-1.5">Some jobs require minimum marks</p>
                    <input
                      type="number"
                      id="pw-percentage"
                      class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none placeholder:text-gray-400"
                      placeholder="e.g., 72 or 7.5"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* ════════ STEP 3: CATEGORY ════════ */}
              <div class="pw-step hidden" data-step="2">
                <div class="space-y-5 pb-4">
                  {/* Category cards */}
                  <fieldset>
                    <legend class="text-sm font-semibold text-content-primary dark:text-white mb-2">Category <span class="text-brand-danger">*</span></legend>
                    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          class="pw-cat-card flex flex-col items-center justify-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-card text-center transition-all duration-150 hover:border-brand-secondary/50 cursor-pointer"
                          data-value={cat.value}
                        >
                          <span class="text-xs sm:text-sm font-semibold text-content-primary dark:text-content-dark leading-tight">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* Additional checkboxes */}
                  <fieldset>
                    <legend class="text-sm font-semibold text-content-primary dark:text-white mb-2">Additional Details</legend>
                    <div class="space-y-2.5">
                      <label class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-btn cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <input type="checkbox" id="pw-pwd" class="w-4 h-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary accent-[#F59E0B]" />
                        <span class="text-sm text-content-primary dark:text-content-dark">Person with Disability (PwD / Divyang)</span>
                      </label>
                      {/* PwD type dropdown */}
                      <div id="pw-pwd-type-section" class="hidden pw-slide-down pl-7">
                        <label for="pw-pwd-type" class="text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1 block">Type of Disability</label>
                        <select id="pw-pwd-type" class="pw-select w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary outline-none">
                          <option value="">Select type</option>
                          {pwdTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <label class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-btn cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <input type="checkbox" id="pw-exsm" class="w-4 h-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary accent-[#F59E0B]" />
                        <span class="text-sm text-content-primary dark:text-content-dark">Ex-Serviceman</span>
                      </label>
                      {/* Years of service */}
                      <div id="pw-exsm-years-section" class="hidden pw-slide-down pl-7">
                        <label for="pw-exsm-years" class="text-xs font-medium text-content-secondary dark:text-content-dark-muted mb-1 block">Years of Service</label>
                        <input type="number" id="pw-exsm-years" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary outline-none" min="1" max="40" placeholder="e.g., 15" />
                      </div>

                      <label class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-btn cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <input type="checkbox" id="pw-cge" class="w-4 h-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary accent-[#F59E0B]" />
                        <span class="text-sm text-content-primary dark:text-content-dark">Central Government Employee</span>
                      </label>
                    </div>
                  </fieldset>

                  {/* Age relaxation preview */}
                  <div id="pw-relaxation-box" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-card p-4">
                    <p class="text-xs font-semibold text-brand-primary dark:text-blue-400 mb-2">Age Relaxation Preview</p>
                    <div id="pw-relaxation-content" class="text-sm text-content-primary dark:text-content-dark space-y-0.5">
                      <p>Select your category to see age relaxation details.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ════════ STEP 4: PREFERENCES ════════ */}
              <div class="pw-step hidden" data-step="3">
                <div class="space-y-5 pb-4">
                  {/* Sector preferences */}
                  <fieldset>
                    <div class="flex items-center justify-between mb-2">
                      <legend class="text-sm font-semibold text-content-primary dark:text-white">Preferred Sectors <span class="text-brand-danger">*</span></legend>
                      <button type="button" id="pw-select-all-sectors" class="text-xs font-medium text-brand-primary dark:text-blue-400 hover:underline">Select All</button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      {sectors.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          class="pw-sector-pill inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-content-secondary dark:text-content-dark-muted transition-all duration-150 hover:border-brand-primary/50 cursor-pointer"
                          data-value={s.value}
                        >
                          <span aria-hidden="true">{s.icon}</span>
                          <span>{s.label}</span>
                          <svg class="pw-sector-check w-3.5 h-3.5 hidden text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </button>
                      ))}
                    </div>
                    <p id="pw-sector-hint" class="mt-1.5 text-xs text-brand-danger hidden">Please select at least one sector</p>
                  </fieldset>

                  {/* State preference */}
                  <div>
                    <label for="pw-state-search" class="text-sm font-semibold text-content-primary dark:text-white mb-1.5 block">Preferred State / Location</label>
                    <div class="relative">
                      <input
                        type="text"
                        id="pw-state-search"
                        class="w-full px-3 py-2.5 pl-9 border border-gray-200 dark:border-gray-700 rounded-btn bg-white dark:bg-surface-dark text-sm text-content-primary dark:text-content-dark focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none placeholder:text-gray-400"
                        placeholder="Search state..."
                        autocomplete="off"
                      />
                      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      {/* Dropdown list */}
                      <div id="pw-state-dropdown" class="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-surface-card-dark border border-gray-200 dark:border-gray-700 rounded-btn shadow-lg max-h-48 overflow-y-auto z-10 hidden">
                        {states.map((s, i) => (
                          <button
                            key={s}
                            type="button"
                            class="pw-state-option w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-content-primary dark:text-content-dark transition-colors"
                            data-value={i === 0 ? 'all_india' : s.toLowerCase().replace(/[^a-z0-9]/g, '_')}
                          >
                            {i === 0 ? '🇮🇳 All India (show all locations)' : s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p id="pw-state-selected" class="mt-1.5 text-xs text-brand-success hidden">
                      <svg class="w-3 h-3 inline mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span id="pw-state-selected-text"></span>
                    </p>
                  </div>
                </div>
              </div>

              {/* ════════ STEP 5: REVIEW ════════ */}
              <div class="pw-step hidden" data-step="4">
                <div class="space-y-4 pb-4">
                  {/* Summary card */}
                  <div class="border border-gray-200 dark:border-gray-700 rounded-card overflow-hidden">
                    {/* Personal */}
                    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                      <span class="text-xs font-bold text-content-primary dark:text-white uppercase tracking-wider">👤 Personal</span>
                      <button type="button" class="pw-edit-link text-xs font-medium text-brand-primary dark:text-blue-400 hover:underline" data-goto="0">Edit</button>
                    </div>
                    <div class="px-4 py-3 space-y-1.5">
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Date of Birth</span><span id="pw-rev-dob" class="font-medium text-content-primary dark:text-white">—</span></div>
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Current Age</span><span id="pw-rev-age" class="font-medium text-content-primary dark:text-white">—</span></div>
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Gender</span><span id="pw-rev-gender" class="font-medium text-content-primary dark:text-white">—</span></div>
                    </div>

                    {/* Education */}
                    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                      <span class="text-xs font-bold text-content-primary dark:text-white uppercase tracking-wider">📚 Education</span>
                      <button type="button" class="pw-edit-link text-xs font-medium text-brand-primary dark:text-blue-400 hover:underline" data-goto="1">Edit</button>
                    </div>
                    <div class="px-4 py-3 space-y-1.5">
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Education</span><span id="pw-rev-edu" class="font-medium text-content-primary dark:text-white">—</span></div>
                      <div id="pw-rev-degree-row" class="flex justify-between text-sm hidden"><span class="text-content-secondary dark:text-content-dark-muted">Degree</span><span id="pw-rev-degree" class="font-medium text-content-primary dark:text-white">—</span></div>
                      <div id="pw-rev-branch-row" class="flex justify-between text-sm hidden"><span class="text-content-secondary dark:text-content-dark-muted">Branch</span><span id="pw-rev-branch" class="font-medium text-content-primary dark:text-white">—</span></div>
                      <div id="pw-rev-trade-row" class="flex justify-between text-sm hidden"><span class="text-content-secondary dark:text-content-dark-muted">Trade</span><span id="pw-rev-trade" class="font-medium text-content-primary dark:text-white">—</span></div>
                      <div id="pw-rev-pct-row" class="flex justify-between text-sm hidden"><span class="text-content-secondary dark:text-content-dark-muted">Percentage</span><span id="pw-rev-pct" class="font-medium text-content-primary dark:text-white">—</span></div>
                    </div>

                    {/* Category */}
                    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                      <span class="text-xs font-bold text-content-primary dark:text-white uppercase tracking-wider">🏷️ Category</span>
                      <button type="button" class="pw-edit-link text-xs font-medium text-brand-primary dark:text-blue-400 hover:underline" data-goto="2">Edit</button>
                    </div>
                    <div class="px-4 py-3 space-y-1.5">
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Category</span><span id="pw-rev-cat" class="font-medium text-content-primary dark:text-white">—</span></div>
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">PwD</span><span id="pw-rev-pwd" class="font-medium text-content-primary dark:text-white">No</span></div>
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Ex-Serviceman</span><span id="pw-rev-exsm" class="font-medium text-content-primary dark:text-white">No</span></div>
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Age Relaxation</span><span id="pw-rev-relax" class="font-medium text-brand-success">—</span></div>
                    </div>

                    {/* Preferences */}
                    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                      <span class="text-xs font-bold text-content-primary dark:text-white uppercase tracking-wider">⚙️ Preferences</span>
                      <button type="button" class="pw-edit-link text-xs font-medium text-brand-primary dark:text-blue-400 hover:underline" data-goto="3">Edit</button>
                    </div>
                    <div class="px-4 py-3 space-y-1.5">
                      <div class="flex justify-between text-sm gap-2"><span class="text-content-secondary dark:text-content-dark-muted flex-shrink-0">Sectors</span><span id="pw-rev-sectors" class="font-medium text-content-primary dark:text-white text-right">—</span></div>
                      <div class="flex justify-between text-sm"><span class="text-content-secondary dark:text-content-dark-muted">Location</span><span id="pw-rev-state" class="font-medium text-content-primary dark:text-white">—</span></div>
                    </div>
                  </div>

                  {/* Privacy notice */}
                  <p class="text-xs text-content-secondary dark:text-content-dark-muted text-center leading-relaxed">
                    🔒 Your profile is saved only in this browser's storage.
                    No data is sent to any server. No account is created.
                    You can clear it anytime from Settings.
                  </p>

                  {/* Clear profile */}
                  <div class="text-center">
                    <button type="button" id="pw-clear-profile" class="text-xs font-medium text-brand-danger hover:underline">
                      🗑️ Clear my profile and start fresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── FOOTER / NAVIGATION BUTTONS ─── */}
            <div class="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                id="pw-back"
                class="hidden inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-content-secondary dark:text-content-dark-muted border border-gray-200 dark:border-gray-700 rounded-btn hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div class="flex-1" />
              <button
                type="button"
                id="pw-next"
                class="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white bg-brand-secondary hover:bg-brand-secondary-dark rounded-btn transition-colors shadow-sm"
              >
                Next
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button
                type="button"
                id="pw-save"
                class="hidden inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white bg-brand-success hover:bg-green-700 rounded-btn transition-colors shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span id="pw-save-text">Save My Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ TOAST NOTIFICATION ══════ */}
      <div id="pw-toast" class="fixed bottom-6 right-6 z-[210] hidden" role="alert" aria-live="polite">
        <div class="flex items-center gap-3 px-5 py-3.5 bg-brand-success text-white rounded-card shadow-lg max-w-sm">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span id="pw-toast-text" class="text-sm font-medium">Profile saved!</span>
          <button type="button" id="pw-toast-close" class="ml-auto w-5 h-5 flex items-center justify-center hover:text-white/70 transition-colors" aria-label="Dismiss">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </>
  )
}
