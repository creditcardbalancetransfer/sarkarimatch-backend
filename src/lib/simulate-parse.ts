/**
 * simulate-parse.ts
 * Simulates AI parsing of a PDF by returning mock job data
 * based on the uploaded filename.
 *
 * Used exclusively by the admin upload page for demo purposes.
 * Returns data in the exact Job interface format from placeholder-data.ts.
 */
import type { Job } from './placeholder-data'

function generateId(): string {
  return 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7)
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const sbiMock: Job = {
  id: generateId(),
  slug: 'sbi-po-recruitment-2026',
  notification_title: 'SBI Probationary Officer (PO) Recruitment 2026',
  advertisement_number: 'CRPD/PO/2026-26/05',
  department: 'Department of Financial Services',
  organization: 'State Bank of India',
  sector: 'banking',
  total_vacancies: 2000,
  education_level: 'graduate',
  age_min: 21,
  age_max: 30,
  salary_min: 36000,
  salary_max: 120000,
  application_fee_general: 750,
  application_fee_sc_st: 0,
  important_dates: {
    notification_date: '2026-03-01',
    start_date: '2026-03-10',
    last_date: '2026-04-10',
    exam_date: '2026-06-20',
  },
  apply_link: 'https://sbi.co.in/careers',
  locations: ['All India'],
  tags: ['banking', 'po', 'sbi', 'graduate', 'officer'],
  status: 'draft',
  featured: false,
  posts: [
    { post_name: 'Probationary Officer', vacancies_total: 1600, education_required: 'Graduation in any discipline from a recognized university', age_limit: '21\u201330 years', salary: '\u20b936,000 \u2013 \u20b91,20,000' },
    { post_name: 'Probationary Officer (IT)', vacancies_total: 400, education_required: 'B.Tech/B.E. in Computer Science/IT', age_limit: '21\u201330 years', salary: '\u20b936,000 \u2013 \u20b91,20,000' },
  ],
  created_at: new Date().toISOString(),
  summary: 'State Bank of India invites online applications from eligible Indian citizens for recruitment to the post of Probationary Officer (PO) in various branches across India.',
  how_to_apply: [
    'Visit sbi.co.in/careers and click Apply Online',
    'Register with email and mobile number',
    'Fill personal, educational and work details',
    'Upload photo (4.5x3.5cm) and signature',
    'Pay application fee online',
    'Submit and print confirmation page',
  ],
  selection_process: [
    { stage: 1, name: 'Preliminary Examination', description: 'Online objective test with English, Quantitative Aptitude, Reasoning Ability. 1 hour.', is_eliminatory: true },
    { stage: 2, name: 'Main Examination', description: 'Online objective and descriptive test. 3 hours.', is_eliminatory: true },
    { stage: 3, name: 'Group Exercise & Interview', description: 'GE (20 marks) + Interview (30 marks). Total 50 marks.', is_eliminatory: true },
  ],
  exam_pattern: [
    { section: 'English Language', questions: 30, marks: 30, duration_minutes: 20 },
    { section: 'Quantitative Aptitude', questions: 35, marks: 35, duration_minutes: 20 },
    { section: 'Reasoning Ability', questions: 35, marks: 35, duration_minutes: 20 },
  ],
  syllabus_topics: {
    'English Language': ['Reading Comprehension', 'Cloze Test', 'Error Detection', 'Sentence Improvement'],
    'Quantitative Aptitude': ['Number Series', 'Data Interpretation', 'Simplification', 'Quadratic Equations'],
    'Reasoning Ability': ['Puzzles', 'Seating Arrangement', 'Syllogism', 'Coding-Decoding', 'Inequality'],
  },
  official_website: 'https://sbi.co.in/careers',
  pdf_url: '',
  vacancy_breakdown: [
    { post_name: 'Probationary Officer', ur: 640, obc: 432, sc: 240, st: 128, ews: 160, total: 1600 },
    { post_name: 'Probationary Officer (IT)', ur: 160, obc: 108, sc: 60, st: 32, ews: 40, total: 400 },
  ],
  application_mode: 'Online',
  documents_required: ['Graduation Degree', 'Photo ID', 'Passport Photo', 'Scanned Signature', 'Category Certificate (if applicable)'],
  important_notice: 'Candidates should ensure eligibility before applying. Fee is non-refundable.',
  marking_scheme: '1 mark per correct answer. 0.25 negative marking for wrong answers.',
}

const rrbMock: Job = {
  id: generateId(),
  slug: 'rrb-group-d-recruitment-2026',
  notification_title: 'RRB Group D (Level 1) Recruitment 2026',
  advertisement_number: 'CEN RRC 01/2026',
  department: 'Ministry of Railways',
  organization: 'Railway Recruitment Cells',
  sector: 'railway',
  total_vacancies: 32000,
  education_level: '10th',
  age_min: 18,
  age_max: 33,
  salary_min: 18000,
  salary_max: 56900,
  application_fee_general: 500,
  application_fee_sc_st: 250,
  important_dates: {
    notification_date: '2026-03-05',
    start_date: '2026-03-15',
    last_date: '2026-04-30',
    exam_date: '2026-09-15',
  },
  apply_link: 'https://www.rrbapply.gov.in',
  locations: ['All India'],
  tags: ['railway', 'group-d', '10th-pass', 'large-vacancy', 'technical'],
  status: 'draft',
  featured: false,
  posts: [
    { post_name: 'Track Maintainer Grade IV', vacancies_total: 18000, education_required: '10th Pass + ITI (preferred)', age_limit: '18\u201333 years', salary: '\u20b918,000 \u2013 \u20b956,900' },
    { post_name: 'Helper/Assistant', vacancies_total: 8000, education_required: '10th Pass', age_limit: '18\u201333 years', salary: '\u20b918,000 \u2013 \u20b956,900' },
    { post_name: 'Porter/Pointsman', vacancies_total: 6000, education_required: '10th Pass', age_limit: '18\u201333 years', salary: '\u20b918,000 \u2013 \u20b956,900' },
  ],
  created_at: new Date().toISOString(),
  summary: 'Railway Recruitment Cells invite applications for various Group D (Level 1) posts across Indian Railways. Massive recruitment with 32,000 vacancies for 10th pass candidates.',
  how_to_apply: [
    'Visit rrbapply.gov.in',
    'Click on CEN RRC 01/2026 link',
    'Register and fill the application form',
    'Upload documents and pay fee',
    'Submit and save confirmation',
  ],
  selection_process: [
    { stage: 1, name: 'Computer Based Test (CBT)', description: 'Online exam with Maths, GI & Reasoning, General Science, General Awareness. 90 minutes.', is_eliminatory: true },
    { stage: 2, name: 'Physical Efficiency Test (PET)', description: 'Physical endurance test. Male: 1000m in 4 min 15 sec, Female: 1000m in 5 min 40 sec.', is_eliminatory: true },
    { stage: 3, name: 'Document Verification', description: 'Verification of original certificates and documents.', is_eliminatory: false },
  ],
  exam_pattern: [
    { section: 'Mathematics', questions: 25, marks: 25, duration_minutes: null },
    { section: 'General Intelligence & Reasoning', questions: 30, marks: 30, duration_minutes: null },
    { section: 'General Science', questions: 25, marks: 25, duration_minutes: null },
    { section: 'General Awareness', questions: 20, marks: 20, duration_minutes: null },
  ],
  syllabus_topics: {
    'Mathematics': ['Number System', 'BODMAS', 'Decimals', 'Fractions', 'LCM/HCF', 'Ratio & Proportion', 'Percentage', 'Time & Work'],
    'General Science': ['Physics', 'Chemistry', 'Life Science', 'Environmental Science'],
    'General Awareness': ['Current Affairs', 'Indian History', 'Geography', 'Polity', 'Economy'],
  },
  official_website: 'https://www.rrbapply.gov.in',
  pdf_url: '',
  vacancy_breakdown: [
    { post_name: 'Track Maintainer Grade IV', ur: 7200, obc: 4860, sc: 2700, st: 1440, ews: 1800, total: 18000 },
    { post_name: 'Helper/Assistant', ur: 3200, obc: 2160, sc: 1200, st: 640, ews: 800, total: 8000 },
    { post_name: 'Porter/Pointsman', ur: 2400, obc: 1620, sc: 900, st: 480, ews: 600, total: 6000 },
  ],
  application_mode: 'Online',
  documents_required: ['10th Pass Certificate', 'ITI Certificate (if applicable)', 'Photo ID', 'Passport Photo', 'Caste Certificate (if applicable)'],
  important_notice: 'Candidates must be physically fit for PET. Medical standards as per railway norms.',
  marking_scheme: '1 mark per correct answer. 1/3 negative marking for wrong answers.',
}

const sscMock: Job = {
  id: generateId(),
  slug: 'ssc-cgl-recruitment-2026',
  notification_title: 'SSC Combined Graduate Level (CGL) Examination 2026',
  advertisement_number: 'F.No.3/1/2026-P&P-I',
  department: 'Department of Personnel & Training',
  organization: 'Staff Selection Commission',
  sector: 'ssc',
  total_vacancies: 14582,
  education_level: 'graduate',
  age_min: 18,
  age_max: 32,
  salary_min: 25500,
  salary_max: 151100,
  application_fee_general: 100,
  application_fee_sc_st: 0,
  important_dates: {
    notification_date: '2026-03-10',
    start_date: '2026-03-20',
    last_date: '2026-04-20',
    exam_date: '2026-07-15',
  },
  apply_link: 'https://ssc.nic.in',
  locations: ['All India'],
  tags: ['ssc', 'cgl', 'graduate', 'group-b', 'group-c', 'tax-assistant', 'inspector'],
  status: 'draft',
  featured: false,
  posts: [
    { post_name: 'Assistant Audit Officer', vacancies_total: 500, education_required: "Graduate + CA/CS/ICWA/M.Com", age_limit: '18\u201330 years', salary: '\u20b947,600 \u2013 \u20b91,51,100' },
    { post_name: 'Income Tax Inspector', vacancies_total: 4500, education_required: 'Graduate in any discipline', age_limit: '18\u201330 years', salary: '\u20b944,900 \u2013 \u20b91,42,400' },
    { post_name: 'Sub Inspector (CBI)', vacancies_total: 800, education_required: 'Graduate in any discipline', age_limit: '20\u201330 years', salary: '\u20b935,400 \u2013 \u20b91,12,400' },
    { post_name: 'Tax Assistant (CBDT/CBIC)', vacancies_total: 6000, education_required: 'Graduate in any discipline', age_limit: '18\u201327 years', salary: '\u20b925,500 \u2013 \u20b981,100' },
    { post_name: 'Upper Division Clerk', vacancies_total: 2782, education_required: 'Graduate in any discipline', age_limit: '18\u201327 years', salary: '\u20b925,500 \u2013 \u20b981,100' },
  ],
  created_at: new Date().toISOString(),
  summary: 'Staff Selection Commission conducts the Combined Graduate Level Examination for recruitment to various Group B and Group C posts in ministries, departments, and organizations of the Government of India.',
  how_to_apply: [
    'Visit ssc.nic.in and register on the One-Time Registration portal',
    'Login and click Apply for CGL 2026',
    'Fill in educational qualifications and preferences',
    'Upload photo and signature as per specifications',
    'Pay fee via online mode',
    'Take printout of application for records',
  ],
  selection_process: [
    { stage: 1, name: 'Tier I (Computer Based)', description: 'Online MCQ exam with General Intelligence, English, Quantitative Aptitude, General Awareness. 60 minutes.', is_eliminatory: true },
    { stage: 2, name: 'Tier II (Computer Based)', description: 'Online exam with Paper I (Maths & Reasoning), Paper II (English & General Awareness). Descriptive Paper for select posts.', is_eliminatory: true },
    { stage: 3, name: 'Document Verification', description: 'Original documents verification at designated centers.', is_eliminatory: false },
  ],
  exam_pattern: [
    { section: 'General Intelligence & Reasoning', questions: 25, marks: 50, duration_minutes: 15 },
    { section: 'General Awareness', questions: 25, marks: 50, duration_minutes: 15 },
    { section: 'Quantitative Aptitude', questions: 25, marks: 50, duration_minutes: 15 },
    { section: 'English Comprehension', questions: 25, marks: 50, duration_minutes: 15 },
  ],
  syllabus_topics: {
    'Quantitative Aptitude': ['Computation', 'Number System', 'Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Data Interpretation'],
    'English': ['Comprehension', 'Vocabulary', 'Grammar', 'Sentence Structure', 'Synonyms & Antonyms'],
    'General Awareness': ['Indian History', 'Geography', 'Economy', 'Polity', 'Science', 'Current Affairs'],
  },
  official_website: 'https://ssc.nic.in',
  pdf_url: '',
  vacancy_breakdown: [
    { post_name: 'Assistant Audit Officer', ur: 200, obc: 135, sc: 75, st: 40, ews: 50, total: 500 },
    { post_name: 'Income Tax Inspector', ur: 1800, obc: 1215, sc: 675, st: 360, ews: 450, total: 4500 },
    { post_name: 'Sub Inspector (CBI)', ur: 320, obc: 216, sc: 120, st: 64, ews: 80, total: 800 },
    { post_name: 'Tax Assistant (CBDT/CBIC)', ur: 2400, obc: 1620, sc: 900, st: 480, ews: 600, total: 6000 },
    { post_name: 'Upper Division Clerk', ur: 1113, obc: 751, sc: 417, st: 223, ews: 278, total: 2782 },
  ],
  application_mode: 'Online',
  documents_required: ['Graduation Certificate', 'Photo ID', 'Category Certificate', 'Passport Photo', 'Scanned Signature'],
  important_notice: 'Window for correction in application form will be provided after last date. Check SSC website regularly.',
  marking_scheme: 'Tier I: 2 marks per correct, 0.50 negative. Tier II: varies by paper.',
}

const genericMock: Job = {
  id: generateId(),
  slug: 'government-recruitment-2026',
  notification_title: 'Government Department Recruitment 2026',
  advertisement_number: 'ADVT/2026/01',
  department: 'Ministry of Home Affairs',
  organization: 'Central Government',
  sector: 'other',
  total_vacancies: 500,
  education_level: 'graduate',
  age_min: 21,
  age_max: 35,
  salary_min: 25500,
  salary_max: 81100,
  application_fee_general: 200,
  application_fee_sc_st: 0,
  important_dates: {
    notification_date: '2026-03-01',
    start_date: '2026-03-15',
    last_date: '2026-04-15',
    exam_date: '2026-07-01',
  },
  apply_link: 'https://www.india.gov.in',
  locations: ['All India'],
  tags: ['government', 'recruitment', 'graduate'],
  status: 'draft',
  featured: false,
  posts: [
    { post_name: 'Assistant', vacancies_total: 300, education_required: 'Graduate in any discipline', age_limit: '21\u201335 years', salary: '\u20b925,500 \u2013 \u20b981,100' },
    { post_name: 'Upper Division Clerk', vacancies_total: 200, education_required: 'Graduate in any discipline', age_limit: '18\u201332 years', salary: '\u20b925,500 \u2013 \u20b981,100' },
  ],
  created_at: new Date().toISOString(),
  summary: 'Central Government invites applications for various posts. Eligible candidates may apply online within the prescribed time.',
  how_to_apply: [
    'Visit the official website',
    'Click on the recruitment notification link',
    'Register and fill the online application form',
    'Upload required documents',
    'Pay application fee and submit',
  ],
  selection_process: [
    { stage: 1, name: 'Written Examination', description: 'Objective type MCQ based exam.', is_eliminatory: true },
    { stage: 2, name: 'Interview', description: 'Personal interview for shortlisted candidates.', is_eliminatory: true },
    { stage: 3, name: 'Document Verification', description: 'Verification of original documents.', is_eliminatory: false },
  ],
  exam_pattern: [
    { section: 'General Knowledge', questions: 50, marks: 50, duration_minutes: 30 },
    { section: 'English Language', questions: 50, marks: 50, duration_minutes: 30 },
    { section: 'Reasoning', questions: 50, marks: 50, duration_minutes: 30 },
    { section: 'Quantitative Aptitude', questions: 50, marks: 50, duration_minutes: 30 },
  ],
  syllabus_topics: {
    'General Knowledge': ['Current Affairs', 'History', 'Geography', 'Science'],
    'Reasoning': ['Logical Reasoning', 'Analytical Reasoning', 'Non-Verbal Reasoning'],
  },
  official_website: 'https://www.india.gov.in',
  pdf_url: '',
  vacancy_breakdown: [
    { post_name: 'Assistant', ur: 120, obc: 81, sc: 45, st: 24, ews: 30, total: 300 },
    { post_name: 'Upper Division Clerk', ur: 80, obc: 54, sc: 30, st: 16, ews: 20, total: 200 },
  ],
  application_mode: 'Online',
  documents_required: ['Graduation Certificate', 'Photo ID', 'Category Certificate (if applicable)', 'Passport Photo'],
  important_notice: null,
  marking_scheme: '1 mark per correct answer. No negative marking.',
}

/**
 * Simulate AI parsing of a PDF.
 * Chooses a mock based on the filename.
 */
export function simulateParse(filename: string): Job {
  const lower = filename.toLowerCase()

  let base: Job
  if (lower.includes('sbi')) {
    base = JSON.parse(JSON.stringify(sbiMock))
  } else if (lower.includes('rrb') || lower.includes('railway')) {
    base = JSON.parse(JSON.stringify(rrbMock))
  } else if (lower.includes('ssc') || lower.includes('chsl') || lower.includes('cgl')) {
    base = JSON.parse(JSON.stringify(sscMock))
  } else {
    base = JSON.parse(JSON.stringify(genericMock))
  }

  // Assign fresh id/slug and set pdf_url from filename
  base.id = generateId()
  base.slug = slugify(base.notification_title)
  base.pdf_url = '/uploads/' + filename
  base.created_at = new Date().toISOString()

  return base
}
