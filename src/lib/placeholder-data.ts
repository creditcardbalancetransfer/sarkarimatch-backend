export interface SelectionStage {
  stage: number
  name: string
  description: string
  is_eliminatory: boolean
}

export interface ExamSection {
  section: string
  questions: number
  marks: number
  duration_minutes: number | null
}

export interface VacancyBreakdownRow {
  post_name: string
  ur: number
  obc: number
  sc: number
  st: number
  ews: number
  total: number
}

export interface Job {
  id: string
  slug: string
  notification_title: string
  advertisement_number: string
  department: string
  organization: string
  sector:
    | 'banking'
    | 'railway'
    | 'ssc'
    | 'upsc'
    | 'defence'
    | 'teaching'
    | 'state_psc'
    | 'police'
    | 'psu'
    | 'other'
  total_vacancies: number
  education_level: '10th' | '12th' | 'iti' | 'diploma' | 'graduate' | 'pg' | 'phd'
  age_min: number
  age_max: number
  salary_min: number
  salary_max: number
  application_fee_general: number
  application_fee_sc_st: number
  important_dates: {
    notification_date: string
    start_date: string
    last_date: string
    exam_date: string | null
  }
  apply_link: string
  locations: string[]
  tags: string[]
  status: 'published' | 'draft' | 'expired'
  featured: boolean
  posts: Array<{
    post_name: string
    vacancies_total: number
    education_required: string
    age_limit: string
    salary: string
  }>
  created_at: string

  // ── NEW FIELDS ──
  summary: string
  how_to_apply: string[]
  selection_process: SelectionStage[]
  exam_pattern: ExamSection[] | null
  syllabus_topics: Record<string, string[]> | null
  official_website: string
  pdf_url: string
  vacancy_breakdown: VacancyBreakdownRow[]
}

export const placeholderJobs: Job[] = [
  {
    id: 'sbi-clerk-2026',
    slug: 'sbi-clerk-recruitment-2026',
    notification_title: 'SBI Clerk (Junior Associate) Recruitment 2026',
    advertisement_number: 'CRPD/CR/2026-26/01',
    department: 'Department of Financial Services',
    organization: 'State Bank of India',
    sector: 'banking',
    total_vacancies: 8000,
    education_level: 'graduate',
    age_min: 20,
    age_max: 28,
    salary_min: 23000,
    salary_max: 80000,
    application_fee_general: 750,
    application_fee_sc_st: 0,
    important_dates: {
      notification_date: '2026-02-20',
      start_date: '2026-02-25',
      last_date: '2026-03-25',
      exam_date: '2026-06-15',
    },
    apply_link: 'https://sbi.co.in/careers',
    locations: ['All India'],
    tags: ['banking', 'clerk', 'sbi', 'graduate', 'fresher-friendly'],
    status: 'published',
    featured: true,
    posts: [
      {
        post_name: 'Junior Associate (Customer Support & Sales)',
        vacancies_total: 5500,
        education_required: 'Graduation in any discipline from a recognized university',
        age_limit: '20\u201328 years (relaxation as per rules)',
        salary: '\u20b923,000 \u2013 \u20b980,000 (Basic Pay: \u20b919,900)',
      },
      {
        post_name: 'Junior Associate (Inter-branch Settlements)',
        vacancies_total: 1500,
        education_required: 'Graduation with Commerce/Accountancy',
        age_limit: '20\u201328 years (relaxation as per rules)',
        salary: '\u20b923,000 \u2013 \u20b980,000 (Basic Pay: \u20b919,900)',
      },
      {
        post_name: 'Junior Associate (Treasury Operations)',
        vacancies_total: 1000,
        education_required: 'Graduation in Finance/Economics/Mathematics',
        age_limit: '20\u201328 years (relaxation as per rules)',
        salary: '\u20b923,000 \u2013 \u20b980,000 (Basic Pay: \u20b919,900)',
      },
    ],
    created_at: '2026-02-20T10:00:00Z',

    summary: 'State Bank of India invites applications from eligible Indian citizens for appointment of Junior Associates (Customer Support & Sales) in clerical cadre. This is one of the largest banking recruitment drives in 2026 with 8,000 vacancies across all states and union territories. Candidates must hold a graduation degree from a recognized university.',
    how_to_apply: [
      'Visit the official SBI careers portal at sbi.co.in/careers',
      'Click on "Apply Online" under the SBI Clerk 2026 notification',
      'Register with a valid email ID and mobile number',
      'Fill in personal, educational, and category details',
      'Upload photograph (4.5cm x 3.5cm), signature, and ID proof',
      'Pay the application fee online (General/OBC: \u20b9750, SC/ST/PwBD: Nil)',
      'Submit and download the confirmation page for future reference',
    ],
    selection_process: [
      { stage: 1, name: 'Preliminary Examination', description: 'Online objective test with 100 questions on English Language, Numerical Ability, and Reasoning Ability. 1 hour duration. Qualifying in nature.', is_eliminatory: true },
      { stage: 2, name: 'Main Examination', description: 'Online objective test with 190 questions across General/Financial Awareness, General English, Quantitative Aptitude, and Reasoning & Computer Aptitude. 2 hours 40 minutes.', is_eliminatory: true },
      { stage: 3, name: 'Language Proficiency Test', description: 'Test of specified opted local language. Qualifying in nature \u2014 candidates must be proficient in the local language of the state they apply for.', is_eliminatory: false },
    ],
    exam_pattern: [
      { section: 'English Language', questions: 30, marks: 30, duration_minutes: 20 },
      { section: 'Numerical Ability', questions: 35, marks: 35, duration_minutes: 20 },
      { section: 'Reasoning Ability', questions: 35, marks: 35, duration_minutes: 20 },
    ],
    syllabus_topics: {
      'English Language': ['Reading Comprehension', 'Cloze Test', 'Error Spotting', 'Sentence Rearrangement', 'Fill in the Blanks'],
      'Numerical Ability': ['Number Series', 'Simplification', 'Percentage', 'Ratio & Proportion', 'Profit & Loss', 'Simple & Compound Interest', 'Data Interpretation'],
      'Reasoning Ability': ['Puzzles & Seating Arrangement', 'Syllogism', 'Inequality', 'Coding-Decoding', 'Blood Relations', 'Direction Sense'],
    },
    official_website: 'https://sbi.co.in/careers',
    pdf_url: 'https://sbi.co.in/documents/clerk-2026-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Junior Associate (Customer Support & Sales)', ur: 2200, obc: 1485, sc: 825, st: 440, ews: 550, total: 5500 },
      { post_name: 'Junior Associate (Inter-branch Settlements)', ur: 600, obc: 405, sc: 225, st: 120, ews: 150, total: 1500 },
      { post_name: 'Junior Associate (Treasury Operations)', ur: 400, obc: 270, sc: 150, st: 80, ews: 100, total: 1000 },
    ],
  },
  {
    id: 'rrb-ntpc-02-2026',
    slug: 'rrb-ntpc-recruitment-02-2026',
    notification_title: 'RRB NTPC (Non-Technical Popular Categories) 02/2026',
    advertisement_number: 'CEN 02/2026',
    department: 'Ministry of Railways',
    organization: 'Railway Recruitment Boards',
    sector: 'railway',
    total_vacancies: 11558,
    education_level: '12th',
    age_min: 18,
    age_max: 33,
    salary_min: 19900,
    salary_max: 92300,
    application_fee_general: 500,
    application_fee_sc_st: 250,
    important_dates: {
      notification_date: '2026-02-28',
      start_date: '2026-03-05',
      last_date: '2026-04-15',
      exam_date: '2026-08-10',
    },
    apply_link: 'https://www.rrbapply.gov.in',
    locations: ['All India'],
    tags: ['railway', 'ntpc', '12th-pass', 'graduate', 'large-vacancy'],
    status: 'published',
    featured: true,
    posts: [
      {
        post_name: 'Station Master',
        vacancies_total: 2500,
        education_required: 'Graduation in any discipline',
        age_limit: '18\u201333 years',
        salary: '\u20b935,400 \u2013 \u20b992,300 (Level 6)',
      },
      {
        post_name: 'Traffic Assistant',
        vacancies_total: 3058,
        education_required: 'Graduation in any discipline',
        age_limit: '18\u201333 years',
        salary: '\u20b929,200 \u2013 \u20b973,000 (Level 5)',
      },
      {
        post_name: 'Commercial Cum Ticket Clerk',
        vacancies_total: 4000,
        education_required: '12th Pass (10+2) from recognized board',
        age_limit: '18\u201330 years',
        salary: '\u20b919,900 \u2013 \u20b963,200 (Level 2)',
      },
      {
        post_name: 'Accounts Clerk Cum Typist',
        vacancies_total: 2000,
        education_required: '12th Pass with Commerce; Typing 30 WPM in English',
        age_limit: '18\u201330 years',
        salary: '\u20b919,900 \u2013 \u20b963,200 (Level 2)',
      },
    ],
    created_at: '2026-02-28T09:00:00Z',

    summary: 'Railway Recruitment Boards invite online applications for Non-Technical Popular Category (NTPC) posts under CEN 02/2026. With over 11,500 vacancies across multiple post levels including Station Master, Traffic Assistant, and Commercial Clerk, this is one of the most anticipated railway recruitments of the year. Both 12th pass and graduate candidates can apply based on the post.',
    how_to_apply: [
      'Visit the RRB official website for your zone (e.g., rrbapply.gov.in)',
      'Click on "New Registration" for CEN 02/2026',
      'Fill in personal details, educational qualifications, and preferred RRB zone',
      'Upload scanned photo, signature, and left thumb impression',
      'Select preferred post(s) in order of preference',
      'Pay the application fee online (General/OBC: \u20b9500, SC/ST/ExSM/Female/Minorities/EBC: \u20b9250)',
      'Print the application summary for records',
    ],
    selection_process: [
      { stage: 1, name: 'CBT Stage 1 (Prelims)', description: 'Computer-Based Test with 100 MCQs on Mathematics, General Intelligence & Reasoning, and General Awareness. 90 minutes duration. Screening test.', is_eliminatory: true },
      { stage: 2, name: 'CBT Stage 2 (Mains)', description: 'Computer-Based Test with 120 MCQs covering General Awareness, Mathematics, General Intelligence & Reasoning. 90 minutes. Merit-based selection.', is_eliminatory: true },
      { stage: 3, name: 'Typing Skill Test', description: 'For posts requiring typing proficiency (e.g., Accounts Clerk Cum Typist). English Typing 30 WPM or Hindi Typing 25 WPM on computer.', is_eliminatory: true },
      { stage: 4, name: 'Document Verification', description: 'Verification of original certificates, identity proof, caste certificate, and other relevant documents.', is_eliminatory: false },
      { stage: 5, name: 'Medical Examination', description: 'Medical fitness test as per railway medical standards. Visual acuity and color vision tests included.', is_eliminatory: true },
    ],
    exam_pattern: [
      { section: 'Mathematics', questions: 30, marks: 30, duration_minutes: null },
      { section: 'General Intelligence & Reasoning', questions: 30, marks: 30, duration_minutes: null },
      { section: 'General Awareness', questions: 40, marks: 40, duration_minutes: null },
    ],
    syllabus_topics: {
      'Mathematics': ['Number System', 'Decimals', 'Fractions', 'LCM & HCF', 'Ratio & Proportion', 'Percentage', 'Mensuration', 'Time & Work', 'Time & Distance', 'Simple & Compound Interest', 'Profit & Loss', 'Algebra', 'Geometry & Trigonometry'],
      'General Intelligence & Reasoning': ['Analogies', 'Alphabetical & Number Series', 'Coding-Decoding', 'Mathematical Operations', 'Relationships', 'Syllogism', 'Jumbling', 'Venn Diagram', 'Data Interpretation', 'Statement Conclusion'],
      'General Awareness': ['Current Events', 'Indian History', 'Indian Polity', 'Indian Economy', 'Geography', 'Culture', 'General Science', 'Computer Basics'],
    },
    official_website: 'https://www.rrbapply.gov.in',
    pdf_url: 'https://www.rrbapply.gov.in/documents/cen-02-2026-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Station Master', ur: 1000, obc: 675, sc: 375, st: 200, ews: 250, total: 2500 },
      { post_name: 'Traffic Assistant', ur: 1223, obc: 826, sc: 459, st: 245, ews: 305, total: 3058 },
      { post_name: 'Commercial Cum Ticket Clerk', ur: 1600, obc: 1080, sc: 600, st: 320, ews: 400, total: 4000 },
      { post_name: 'Accounts Clerk Cum Typist', ur: 800, obc: 540, sc: 300, st: 160, ews: 200, total: 2000 },
    ],
  },
  {
    id: 'ssc-chsl-2026',
    slug: 'ssc-chsl-recruitment-2026',
    notification_title: 'SSC CHSL (Combined Higher Secondary Level) 2026',
    advertisement_number: 'SSC/CHSL/2026',
    department: 'Ministry of Personnel, PG & Pensions',
    organization: 'Staff Selection Commission',
    sector: 'ssc',
    total_vacancies: 4500,
    education_level: '12th',
    age_min: 18,
    age_max: 27,
    salary_min: 25500,
    salary_max: 81100,
    application_fee_general: 100,
    application_fee_sc_st: 0,
    important_dates: {
      notification_date: '2026-02-25',
      start_date: '2026-03-01',
      last_date: '2026-04-01',
      exam_date: '2026-07-01',
    },
    apply_link: 'https://ssc.nic.in',
    locations: ['All India'],
    tags: ['ssc', 'chsl', '12th-pass', 'ldc', 'deo', 'postal-assistant'],
    status: 'published',
    featured: true,
    posts: [
      {
        post_name: 'Lower Division Clerk (LDC) / Junior Secretariat Assistant',
        vacancies_total: 2000,
        education_required: '12th Pass from recognized board',
        age_limit: '18\u201327 years (relaxation as per rules)',
        salary: '\u20b925,500 \u2013 \u20b981,100 (Pay Level 2)',
      },
      {
        post_name: 'Postal Assistant / Sorting Assistant',
        vacancies_total: 1500,
        education_required: '12th Pass from recognized board',
        age_limit: '18\u201327 years (relaxation as per rules)',
        salary: '\u20b925,500 \u2013 \u20b981,100 (Pay Level 4)',
      },
      {
        post_name: 'Data Entry Operator (DEO)',
        vacancies_total: 1000,
        education_required: '12th Pass with Computer proficiency (8000 key depressions/hour)',
        age_limit: '18\u201327 years (relaxation as per rules)',
        salary: '\u20b925,500 \u2013 \u20b981,100 (Pay Level 4)',
      },
    ],
    created_at: '2026-02-25T11:30:00Z',

    summary: 'The Staff Selection Commission conducts the CHSL examination annually for recruitment of LDC/JSA, Postal Assistant/Sorting Assistant, and Data Entry Operator posts in various Central Government Ministries and Departments. This exam is ideal for 12th pass candidates seeking a stable government career with good pay and benefits.',
    how_to_apply: [
      'Visit ssc.nic.in and navigate to "Apply" section',
      'Register with One-Time Registration if not already done',
      'Login and click on "Apply" for CHSL 2026',
      'Fill in the application form with educational and personal details',
      'Upload recent photograph and signature in prescribed format',
      'Pay application fee online (General/OBC/EWS: \u20b9100, SC/ST/PwBD/ExSM/Female: Nil)',
      'Download and save the acknowledgement slip',
    ],
    selection_process: [
      { stage: 1, name: 'Computer Based Examination (Tier-I)', description: 'Objective MCQ test with questions from General Intelligence, English Language, Quantitative Aptitude, and General Awareness. Total 200 marks, 60 minutes, negative marking of 0.50 per wrong answer.', is_eliminatory: true },
      { stage: 2, name: 'Skill Test / Typing Test (Tier-II)', description: 'For LDC/JSA: Typing Test (English 35 WPM or Hindi 30 WPM). For DEO: Data Entry Speed Test (8000 key depressions per hour). For PA/SA: Typing Test. Qualifying in nature.', is_eliminatory: true },
      { stage: 3, name: 'Document Verification', description: 'Verification of original educational certificates, caste/category certificates, age proof, and other required documents at allocated office.', is_eliminatory: false },
    ],
    exam_pattern: [
      { section: 'General Intelligence', questions: 25, marks: 50, duration_minutes: null },
      { section: 'English Language', questions: 25, marks: 50, duration_minutes: null },
      { section: 'Quantitative Aptitude', questions: 25, marks: 50, duration_minutes: null },
      { section: 'General Awareness', questions: 25, marks: 50, duration_minutes: null },
    ],
    syllabus_topics: {
      'General Intelligence': ['Analogies', 'Similarities & Differences', 'Space Visualization', 'Problem Solving', 'Analysis', 'Judgement', 'Decision Making', 'Visual Memory', 'Discrimination', 'Observation', 'Relationship Concepts', 'Figure Classification'],
      'English Language': ['Spot the Error', 'Fill in the Blanks', 'Synonyms/Antonyms', 'Spellings', 'Idioms & Phrases', 'One Word Substitution', 'Sentence Improvement', 'Active/Passive Voice', 'Direct/Indirect Speech', 'Reading Comprehension'],
      'Quantitative Aptitude': ['Number System', 'Computation of Whole Numbers', 'Decimals & Fractions', 'Fundamental Arithmetic', 'Percentage', 'Ratio & Proportion', 'Average', 'Interest', 'Profit & Loss', 'Time & Distance', 'Time & Work', 'Mensuration', 'Geometry', 'Trigonometry', 'Statistics'],
      'General Awareness': ['India and Neighbours', 'History', 'Culture', 'Geography', 'Economic Scene', 'General Polity', 'Constitution', 'Sports', 'General Science', 'Current Affairs'],
    },
    official_website: 'https://ssc.nic.in',
    pdf_url: 'https://ssc.nic.in/documents/chsl-2026-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'LDC / Junior Secretariat Assistant', ur: 800, obc: 540, sc: 300, st: 160, ews: 200, total: 2000 },
      { post_name: 'Postal Assistant / Sorting Assistant', ur: 600, obc: 405, sc: 225, st: 120, ews: 150, total: 1500 },
      { post_name: 'Data Entry Operator (DEO)', ur: 400, obc: 270, sc: 150, st: 80, ews: 100, total: 1000 },
    ],
  },
  {
    id: 'upsc-cds-01-2026',
    slug: 'upsc-cds-01-2026',
    notification_title: 'UPSC CDS (Combined Defence Services) Examination (I) 2026',
    advertisement_number: 'UPSC/CDS-I/2026',
    department: 'Ministry of Defence',
    organization: 'Union Public Service Commission',
    sector: 'defence',
    total_vacancies: 457,
    education_level: 'graduate',
    age_min: 20,
    age_max: 24,
    salary_min: 56100,
    salary_max: 177500,
    application_fee_general: 200,
    application_fee_sc_st: 0,
    important_dates: {
      notification_date: '2026-02-12',
      start_date: '2026-02-15',
      last_date: '2026-03-20',
      exam_date: '2026-04-20',
    },
    apply_link: 'https://upsconline.nic.in',
    locations: ['All India (Training Academies)'],
    tags: ['upsc', 'cds', 'defence', 'graduate', 'officer-cadre', 'ima', 'ota', 'navy', 'airforce'],
    status: 'published',
    featured: true,
    posts: [
      {
        post_name: 'Indian Military Academy (IMA)',
        vacancies_total: 200,
        education_required: 'Graduation from a recognized university',
        age_limit: '20\u201324 years (born between 02-Jul-2002 and 01-Jul-2006)',
        salary: '\u20b956,100 \u2013 \u20b91,77,500 (Level 10)',
      },
      {
        post_name: 'Officers Training Academy (OTA) \u2014 Men',
        vacancies_total: 100,
        education_required: 'Graduation from a recognized university',
        age_limit: '20\u201324 years',
        salary: '\u20b956,100 \u2013 \u20b91,77,500 (Level 10)',
      },
      {
        post_name: 'Indian Naval Academy',
        vacancies_total: 82,
        education_required: 'B.E./B.Tech in Engineering disciplines',
        age_limit: '20\u201324 years',
        salary: '\u20b956,100 \u2013 \u20b91,77,500 (Level 10)',
      },
      {
        post_name: 'Air Force Academy',
        vacancies_total: 75,
        education_required: 'Graduation with Physics & Mathematics at 10+2 level, or B.E./B.Tech',
        age_limit: '20\u201324 years',
        salary: '\u20b956,100 \u2013 \u20b91,77,500 (Level 10)',
      },
    ],
    created_at: '2026-02-12T08:00:00Z',

    summary: 'The Union Public Service Commission conducts the CDS examination for recruitment into the Indian Military Academy, Officers Training Academy, Indian Naval Academy, and Air Force Academy. This prestigious exam offers a direct entry route for graduates into the officer cadre of the Indian Armed Forces with excellent pay and career growth.',
    how_to_apply: [
      'Visit the UPSC Online Application Portal at upsconline.nic.in',
      'Click on "Online Application for Various Examinations of UPSC"',
      'Select CDS Examination (I), 2026 and click "Apply Now"',
      'Register with a valid email and phone number',
      'Fill in Part-I (personal details) and Part-II (detailed application form)',
      'Upload photograph and signature as per specifications',
      'Pay the application fee online (General/OBC/EWS: \u20b9200, SC/ST/Female: Nil)',
      'Submit the application and note down the Registration ID',
    ],
    selection_process: [
      { stage: 1, name: 'Written Examination', description: 'Pen-and-paper exam testing English, General Knowledge, and Elementary Mathematics. For IMA/Naval/AFA: all 3 papers. For OTA: English + GK only. Each paper is 2 hours, 100 marks each.', is_eliminatory: true },
      { stage: 2, name: 'SSB Interview', description: 'Services Selection Board interview spanning 5 days. Includes Screening Test (OIR + PPDT), Psychological Tests (TAT, WAT, SRT, SD), Group Testing (GD, GPE, GTO Tasks), and Personal Interview. Total 300 marks.', is_eliminatory: true },
      { stage: 3, name: 'Medical Examination', description: 'Detailed medical exam at military hospitals to assess physical and medical fitness as per Armed Forces medical standards.', is_eliminatory: true },
      { stage: 4, name: 'Final Merit List', description: 'Combined merit based on written exam marks + SSB interview marks. Allocation to training academy based on merit and preference.', is_eliminatory: false },
    ],
    exam_pattern: [
      { section: 'English', questions: 120, marks: 100, duration_minutes: 120 },
      { section: 'General Knowledge', questions: 120, marks: 100, duration_minutes: 120 },
      { section: 'Elementary Mathematics', questions: 100, marks: 100, duration_minutes: 120 },
    ],
    syllabus_topics: {
      'English': ['Comprehension', 'Spotting Errors', 'Sentence Arrangement', 'Synonyms & Antonyms', 'Selecting Words', 'Ordering of Words in a Sentence'],
      'General Knowledge': ['Current Events', 'Indian History', 'Geography', 'Indian Polity', 'Economics', 'Physics', 'Chemistry', 'Biology', 'Defence & Security'],
      'Elementary Mathematics': ['Number System', 'HCF & LCM', 'Decimal Fractions', 'Square Roots', 'Percentage', 'Average', 'Profit & Loss', 'Simple & Compound Interest', 'Time & Distance', 'Algebra', 'Trigonometry', 'Geometry', 'Mensuration', 'Statistics'],
    },
    official_website: 'https://upsconline.nic.in',
    pdf_url: 'https://upsc.gov.in/sites/default/files/CDS-I-2026-Notice.pdf',
    vacancy_breakdown: [
      { post_name: 'Indian Military Academy (IMA)', ur: 80, obc: 54, sc: 30, st: 16, ews: 20, total: 200 },
      { post_name: 'Officers Training Academy (OTA)', ur: 40, obc: 27, sc: 15, st: 8, ews: 10, total: 100 },
      { post_name: 'Indian Naval Academy', ur: 33, obc: 22, sc: 12, st: 7, ews: 8, total: 82 },
      { post_name: 'Air Force Academy', ur: 30, obc: 20, sc: 11, st: 6, ews: 8, total: 75 },
    ],
  },
  {
    id: 'ibps-po-2026',
    slug: 'ibps-po-recruitment-2026',
    notification_title: 'IBPS PO (Probationary Officer/Management Trainee) CRP PO/MT-XVI',
    advertisement_number: 'IBPS/CRP-PO/MT-XVI/2026',
    department: 'Department of Financial Services',
    organization: 'Institute of Banking Personnel Selection',
    sector: 'banking',
    total_vacancies: 3049,
    education_level: 'graduate',
    age_min: 20,
    age_max: 30,
    salary_min: 36000,
    salary_max: 120000,
    application_fee_general: 850,
    application_fee_sc_st: 175,
    important_dates: {
      notification_date: '2026-03-01',
      start_date: '2026-03-05',
      last_date: '2026-04-10',
      exam_date: '2026-06-28',
    },
    apply_link: 'https://ibps.in',
    locations: ['All India'],
    tags: ['banking', 'ibps', 'po', 'graduate', 'officer', 'management-trainee'],
    status: 'published',
    featured: true,
    posts: [
      {
        post_name: 'Probationary Officer (PO)',
        vacancies_total: 2049,
        education_required: 'Graduation in any discipline from a recognized university',
        age_limit: '20\u201330 years (relaxation for SC/ST/OBC/PwBD)',
        salary: '\u20b936,000 \u2013 \u20b91,20,000 (Basic Pay: \u20b936,000)',
      },
      {
        post_name: 'Management Trainee (MT)',
        vacancies_total: 1000,
        education_required: 'Graduation in any discipline with minimum 55% marks',
        age_limit: '20\u201330 years (relaxation for SC/ST/OBC/PwBD)',
        salary: '\u20b936,000 \u2013 \u20b91,20,000 (Basic Pay: \u20b936,000)',
      },
    ],
    created_at: '2026-03-01T07:00:00Z',

    summary: 'IBPS conducts the CRP PO/MT exam for recruitment of Probationary Officers and Management Trainees in 11 participating public sector banks. This is a premier banking exam offering officer-level posts with excellent career progression, starting salary of \u20b936,000 basic plus allowances, and postings across India.',
    how_to_apply: [
      'Visit the IBPS official website at ibps.in',
      'Navigate to CRP PO/MT-XVI and click "Apply Online"',
      'Complete the registration with valid email and phone',
      'Fill in academic, personal, and preference details',
      'Upload photo, signature, left thumb impression, and hand-written declaration',
      'Select up to 6 bank preferences in order',
      'Pay application fee (General/OBC/EWS: \u20b9850, SC/ST/PwBD: \u20b9175)',
      'Submit the form and save the printout for reference',
    ],
    selection_process: [
      { stage: 1, name: 'Preliminary Examination', description: 'Online objective test: English Language (30Q/30M), Quantitative Aptitude (35Q/35M), Reasoning Ability (35Q/35M). Total 100 marks, 60 minutes. Qualifying for Mains.', is_eliminatory: true },
      { stage: 2, name: 'Main Examination', description: 'Online objective + descriptive test. Objective: Reasoning & Computer Aptitude, English Language, Data Analysis, General/Economy/Banking. Descriptive: Essay & Letter. Total 225 marks.', is_eliminatory: true },
      { stage: 3, name: 'Interview', description: 'Personal interview conducted by participating banks. Tests communication skills, banking awareness, general knowledge, and personality. 100 marks.', is_eliminatory: true },
      { stage: 4, name: 'Provisional Allotment', description: 'Based on combined Mains + Interview score, candidates are allotted to banks as per preference and merit.', is_eliminatory: false },
    ],
    exam_pattern: [
      { section: 'English Language', questions: 30, marks: 30, duration_minutes: 20 },
      { section: 'Quantitative Aptitude', questions: 35, marks: 35, duration_minutes: 20 },
      { section: 'Reasoning Ability', questions: 35, marks: 35, duration_minutes: 20 },
    ],
    syllabus_topics: {
      'English Language': ['Reading Comprehension', 'Cloze Test', 'Para Jumbles', 'Error Detection', 'Vocabulary', 'Sentence Completion', 'Word Swap'],
      'Quantitative Aptitude': ['Simplification', 'Number Series', 'Data Interpretation', 'Quadratic Equations', 'Percentage', 'Ratio', 'Profit & Loss', 'Mixtures', 'Time Speed & Distance'],
      'Reasoning Ability': ['Seating Arrangement', 'Puzzles', 'Syllogism', 'Coding-Decoding', 'Blood Relations', 'Inequality', 'Input-Output', 'Data Sufficiency'],
    },
    official_website: 'https://ibps.in',
    pdf_url: 'https://ibps.in/documents/crp-po-mt-xvi-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Probationary Officer (PO)', ur: 820, obc: 553, sc: 307, st: 164, ews: 205, total: 2049 },
      { post_name: 'Management Trainee (MT)', ur: 400, obc: 270, sc: 150, st: 80, ews: 100, total: 1000 },
    ],
  },
  {
    id: 'army-agniveer-2026',
    slug: 'indian-army-agniveer-2026',
    notification_title: 'Indian Army Agniveer Rally Recruitment 2026 (All Categories)',
    advertisement_number: 'Army/Agniveer/2026-01',
    department: 'Ministry of Defence',
    organization: 'Indian Army',
    sector: 'defence',
    total_vacancies: 25000,
    education_level: '10th',
    age_min: 17,
    age_max: 23,
    salary_min: 30000,
    salary_max: 40000,
    application_fee_general: 0,
    application_fee_sc_st: 0,
    important_dates: {
      notification_date: '2026-03-01',
      start_date: '2026-03-10',
      last_date: '2026-04-30',
      exam_date: null,
    },
    apply_link: 'https://joinindianarmy.nic.in',
    locations: ['All India', 'Rally Centers across states'],
    tags: ['army', 'agniveer', '10th-pass', '12th-pass', 'defence', 'youth'],
    status: 'published',
    featured: false,
    posts: [
      {
        post_name: 'Agniveer (General Duty)',
        vacancies_total: 15000,
        education_required: 'Class 10th Pass (SSLC) with 45% aggregate',
        age_limit: '17.5\u201323 years',
        salary: '\u20b930,000/month (1st year), \u20b933,000 (2nd year)',
      },
      {
        post_name: 'Agniveer (Technical)',
        vacancies_total: 5000,
        education_required: '12th Pass with Physics, Chemistry, Maths (60% aggregate)',
        age_limit: '17.5\u201323 years',
        salary: '\u20b930,000/month (1st year), \u20b933,000 (2nd year)',
      },
      {
        post_name: 'Agniveer (Clerk/Store Keeper Technical)',
        vacancies_total: 3000,
        education_required: '12th Pass with 60% aggregate; Typing 33 WPM',
        age_limit: '17.5\u201323 years',
        salary: '\u20b930,000/month (1st year), \u20b933,000 (2nd year)',
      },
      {
        post_name: 'Agniveer (Tradesman)',
        vacancies_total: 2000,
        education_required: 'Class 10th Pass with relevant ITI trade certificate',
        age_limit: '17.5\u201323 years',
        salary: '\u20b930,000/month (1st year), \u20b933,000 (2nd year)',
      },
    ],
    created_at: '2026-03-01T06:00:00Z',

    summary: 'The Indian Army invites eligible young Indian citizens to serve the nation under the Agniveer scheme for a period of 4 years. With 25,000 vacancies across General Duty, Technical, Clerk/Store Keeper, and Tradesman categories, this recruitment offers rigorous military training, competitive pay, and the Seva Nidhi package of approximately \u20b911.71 lakh upon completion of the 4-year tenure.',
    how_to_apply: [
      'Visit the official Indian Army recruitment portal at joinindianarmy.nic.in',
      'Click on "Apply Online" under Agniveer Recruitment 2026',
      'Create an account with valid email, mobile, and Aadhaar details',
      'Fill in personal, educational, and physical measurement details',
      'Upload photograph, signature, and required certificates',
      'Select the rally center nearest to your domicile/home address',
      'Submit the form \u2014 no application fee is charged',
      'Download the admit card when released for your rally center',
    ],
    selection_process: [
      { stage: 1, name: 'Online Registration & Screening', description: 'Online application followed by shortlisting based on educational marks and preferences. Admit card issued for rally.', is_eliminatory: true },
      { stage: 2, name: 'Physical Fitness Test (PFT)', description: '1.6 km run in 5 min 30 sec, pull-ups (minimum 6), 9-feet ditch jump, balancing beam. Conducted at rally grounds.', is_eliminatory: true },
      { stage: 3, name: 'Physical Measurement Test', description: 'Height (minimum 170 cm for GD), weight as per BMI standards, chest measurement (77 cm, 5 cm expansion).', is_eliminatory: true },
      { stage: 4, name: 'Medical Examination', description: 'Detailed medical examination at Military Hospital. Tests eyesight, hearing, dental, and overall fitness.', is_eliminatory: true },
      { stage: 5, name: 'Common Entrance Exam (CEE)', description: 'Online written exam at designated centers. Tests General Knowledge, General Science, Maths, and subject-specific topics based on category.', is_eliminatory: true },
      { stage: 6, name: 'Merit List & Joining', description: 'Final merit list based on CEE score, physical standards, and medical fitness. Selected candidates join training centers.', is_eliminatory: false },
    ],
    exam_pattern: null,
    syllabus_topics: {
      'General Knowledge': ['History of India', 'Geography', 'Civics', 'Current Affairs', 'General Science', 'Famous Personalities', 'Sports', 'Awards'],
      'General Science': ['Physics Basics', 'Chemistry Basics', 'Biology Basics', 'Human Body', 'Nutrition', 'Disease & Prevention'],
      'Mathematics': ['Arithmetic', 'Algebra', 'Mensuration', 'Geometry', 'Percentage', 'Average', 'Profit & Loss'],
      'Physical Fitness Standards': ['1.6 km Run: 5 min 30 sec', 'Pull-ups: Minimum 6 (40 marks max for 10)', '9 Feet Ditch Jump', 'Balancing Beam: Walk without falling'],
    },
    official_website: 'https://joinindianarmy.nic.in',
    pdf_url: 'https://joinindianarmy.nic.in/documents/agniveer-2026-rally-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Agniveer (General Duty)', ur: 6000, obc: 4050, sc: 2250, st: 1200, ews: 1500, total: 15000 },
      { post_name: 'Agniveer (Technical)', ur: 2000, obc: 1350, sc: 750, st: 400, ews: 500, total: 5000 },
      { post_name: 'Agniveer (Clerk/Store Keeper Technical)', ur: 1200, obc: 810, sc: 450, st: 240, ews: 300, total: 3000 },
      { post_name: 'Agniveer (Tradesman)', ur: 800, obc: 540, sc: 300, st: 160, ews: 200, total: 2000 },
    ],
  },
  {
    id: 'up-police-constable-2026',
    slug: 'up-police-constable-recruitment-2026',
    notification_title: 'UP Police Constable Recruitment 2026',
    advertisement_number: 'UPPRPB/Const/2026-01',
    department: 'Home Department, Government of Uttar Pradesh',
    organization: 'Uttar Pradesh Police Recruitment and Promotion Board',
    sector: 'police',
    total_vacancies: 52699,
    education_level: '12th',
    age_min: 18,
    age_max: 25,
    salary_min: 21700,
    salary_max: 69100,
    application_fee_general: 400,
    application_fee_sc_st: 200,
    important_dates: {
      notification_date: '2026-02-18',
      start_date: '2026-02-22',
      last_date: '2026-03-30',
      exam_date: '2026-07-15',
    },
    apply_link: 'https://uppbpb.gov.in',
    locations: ['Uttar Pradesh'],
    tags: ['police', 'constable', 'up', '12th-pass', 'mega-vacancy', 'physical-test'],
    status: 'published',
    featured: true,
    posts: [
      {
        post_name: 'Constable (Civil Police)',
        vacancies_total: 40000,
        education_required: '12th Pass (Intermediate) from a recognized board',
        age_limit: '18\u201325 years (relaxation for OBC/SC/ST)',
        salary: '\u20b921,700 \u2013 \u20b969,100 (Pay Level 3)',
      },
      {
        post_name: 'Constable (PAC)',
        vacancies_total: 8699,
        education_required: '12th Pass (Intermediate) from a recognized board',
        age_limit: '18\u201325 years (relaxation for OBC/SC/ST)',
        salary: '\u20b921,700 \u2013 \u20b969,100 (Pay Level 3)',
      },
      {
        post_name: 'Constable (Fireman)',
        vacancies_total: 4000,
        education_required: '12th Pass; Physical fitness standards applicable',
        age_limit: '18\u201325 years',
        salary: '\u20b921,700 \u2013 \u20b969,100 (Pay Level 3)',
      },
    ],
    created_at: '2026-02-18T12:00:00Z',

    summary: 'The Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB) has announced a massive recruitment of 52,699 constable vacancies across Civil Police, Provincial Armed Constabulary (PAC), and Fireman posts. This is one of the largest police recruitment drives in India in 2026, offering stable government jobs with career growth opportunities in the UP Police force.',
    how_to_apply: [
      'Visit the official UPPRPB website at uppbpb.gov.in',
      'Click on the recruitment link for UP Police Constable 2026',
      'Register with Aadhaar-linked mobile number and valid email',
      'Fill in personal details including domicile, category, and education',
      'Upload photograph, signature, and thumb impression as per format',
      'Pay the application fee (General/OBC: \u20b9400, SC/ST: \u20b9200)',
      'Submit the application and download the confirmation page',
    ],
    selection_process: [
      { stage: 1, name: 'Written Examination', description: 'Objective multiple-choice test on General Hindi, General Knowledge, Numerical & Mental Ability, Mental Aptitude/Intelligence/Reasoning. 300 marks, 2 hours.', is_eliminatory: true },
      { stage: 2, name: 'Document Verification', description: 'Verification of educational certificates, domicile, caste certificate, character certificate, and other documents.', is_eliminatory: true },
      { stage: 3, name: 'Physical Standard Test (PST)', description: 'Male: Height 168 cm (Gen/OBC), 160 cm (SC/ST). Chest: 79-84 cm. Female: Height 152 cm (Gen/OBC), 147 cm (SC/ST).', is_eliminatory: true },
      { stage: 4, name: 'Physical Efficiency Test (PET)', description: 'Male: 4.8 km run in 25 minutes. Female: 2.4 km run in 14 minutes.', is_eliminatory: true },
      { stage: 5, name: 'Medical Examination', description: 'Medical fitness as per UP Police norms including eyesight (6/6 without glasses for constable), hearing, and general health.', is_eliminatory: true },
      { stage: 6, name: 'Final Merit List', description: 'Based on written exam marks. Separate merit list for each category and gender.', is_eliminatory: false },
    ],
    exam_pattern: [
      { section: 'General Hindi', questions: 37, marks: 75, duration_minutes: null },
      { section: 'General Knowledge', questions: 38, marks: 75, duration_minutes: null },
      { section: 'Numerical & Mental Ability', questions: 38, marks: 75, duration_minutes: null },
      { section: 'Mental Aptitude/Intelligence/Reasoning', questions: 37, marks: 75, duration_minutes: null },
    ],
    syllabus_topics: {
      'General Hindi': ['Hindi Grammar', 'Synonyms & Antonyms', 'One Word Substitution', 'Idioms & Proverbs', 'Sentence Correction', 'Comprehension'],
      'General Knowledge': ['Indian History', 'Indian Polity', 'Indian Economy', 'Geography', 'Current Affairs', 'General Science', 'UP Specific GK'],
      'Numerical & Mental Ability': ['Number System', 'Simplification', 'Percentage', 'Profit & Loss', 'Statistics', 'HCF & LCM', 'Average', 'Area & Volume'],
      'Mental Aptitude/Intelligence/Reasoning': ['Logical Diagrams', 'Symbol-Relationship Interpretation', 'Coding-Decoding', 'Trend Perception', 'Word Formation', 'Letter & Number Series', 'Analogies', 'Classification'],
    },
    official_website: 'https://uppbpb.gov.in',
    pdf_url: 'https://uppbpb.gov.in/documents/constable-2026-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Constable (Civil Police)', ur: 16000, obc: 10800, sc: 6000, st: 3200, ews: 4000, total: 40000 },
      { post_name: 'Constable (PAC)', ur: 3480, obc: 2349, sc: 1305, st: 696, ews: 869, total: 8699 },
      { post_name: 'Constable (Fireman)', ur: 1600, obc: 1080, sc: 600, st: 320, ews: 400, total: 4000 },
    ],
  },
  {
    id: 'krcl-apprentice-2026',
    slug: 'krcl-trainee-apprentice-2026',
    notification_title: 'KRCL Trainee Apprentice Recruitment 2026',
    advertisement_number: 'KRCL/HR/Apprentice/2026-01',
    department: 'Ministry of Railways',
    organization: 'Konkan Railway Corporation Limited',
    sector: 'railway',
    total_vacancies: 190,
    education_level: 'diploma',
    age_min: 18,
    age_max: 25,
    salary_min: 8000,
    salary_max: 9000,
    application_fee_general: 100,
    application_fee_sc_st: 0,
    important_dates: {
      notification_date: '2026-02-28',
      start_date: '2026-03-01',
      last_date: '2026-03-21',
      exam_date: null,
    },
    apply_link: 'https://konkanrailway.com/careers',
    locations: ['Maharashtra', 'Goa', 'Karnataka'],
    tags: ['railway', 'apprentice', 'diploma', 'iti', 'konkan', 'trainee'],
    status: 'published',
    featured: false,
    posts: [
      {
        post_name: 'Graduate Apprentice (Civil Engineering)',
        vacancies_total: 40,
        education_required: 'B.E./B.Tech in Civil Engineering',
        age_limit: '18\u201325 years',
        salary: '\u20b99,000/month (stipend)',
      },
      {
        post_name: 'Graduate Apprentice (Electrical Engineering)',
        vacancies_total: 35,
        education_required: 'B.E./B.Tech in Electrical Engineering',
        age_limit: '18\u201325 years',
        salary: '\u20b99,000/month (stipend)',
      },
      {
        post_name: 'Technician Apprentice (Mechanical)',
        vacancies_total: 60,
        education_required: 'Diploma in Mechanical Engineering',
        age_limit: '18\u201325 years',
        salary: '\u20b98,000/month (stipend)',
      },
      {
        post_name: 'Technician Apprentice (S&T)',
        vacancies_total: 55,
        education_required: 'Diploma in Electronics / Telecommunications',
        age_limit: '18\u201325 years',
        salary: '\u20b98,000/month (stipend)',
      },
    ],
    created_at: '2026-02-28T14:00:00Z',

    summary: 'Konkan Railway Corporation Limited (KRCL) invites applications for Trainee Apprentices under the Apprentices Act 1961. This opportunity is for engineering graduates and diploma holders in Civil, Electrical, Mechanical, and Electronics/Telecommunications disciplines. The apprenticeship spans one year and provides hands-on training in railway operations along the scenic Konkan route.',
    how_to_apply: [
      'Visit the KRCL careers page at konkanrailway.com/careers',
      'Download the application form for Trainee Apprentice 2026',
      'Fill in the form with personal and educational details',
      'Attach self-attested copies of marksheets, degree/diploma certificate, and ID proof',
      'Pay the application fee of \u20b9100 (General/OBC) via demand draft or online',
      'Submit the application online or by post to the Chief Personnel Officer, KRCL, Belapur Bhavan, Navi Mumbai',
      'Shortlisted candidates will be called for document verification and joining',
    ],
    selection_process: [
      { stage: 1, name: 'Application Screening', description: 'Applications are screened based on educational qualifications, marks, and eligibility criteria.', is_eliminatory: true },
      { stage: 2, name: 'Merit List', description: 'Shortlisting based on marks in qualifying degree/diploma examination. Separate merit for each trade.', is_eliminatory: true },
      { stage: 3, name: 'Document Verification', description: 'In-person verification of original educational certificates, identity proof, and category certificates.', is_eliminatory: true },
      { stage: 4, name: 'Medical Fitness', description: 'Basic medical fitness check as per Apprentices Act norms.', is_eliminatory: true },
    ],
    exam_pattern: null,
    syllabus_topics: null,
    official_website: 'https://konkanrailway.com/careers',
    pdf_url: 'https://konkanrailway.com/documents/apprentice-2026-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Graduate Apprentice (Civil Engineering)', ur: 16, obc: 11, sc: 6, st: 3, ews: 4, total: 40 },
      { post_name: 'Graduate Apprentice (Electrical Engineering)', ur: 14, obc: 10, sc: 5, st: 3, ews: 3, total: 35 },
      { post_name: 'Technician Apprentice (Mechanical)', ur: 24, obc: 16, sc: 9, st: 5, ews: 6, total: 60 },
      { post_name: 'Technician Apprentice (S&T)', ur: 22, obc: 15, sc: 8, st: 4, ews: 6, total: 55 },
    ],
  },
  {
    id: 'nta-ugc-net-2026',
    slug: 'nta-ugc-net-june-2026',
    notification_title: 'NTA UGC NET June 2026 Examination',
    advertisement_number: 'NTA/UGC-NET/June-2026',
    department: 'Ministry of Education',
    organization: 'National Testing Agency',
    sector: 'teaching',
    total_vacancies: 0,
    education_level: 'pg',
    age_min: 0,
    age_max: 0,
    salary_min: 57700,
    salary_max: 182400,
    application_fee_general: 1150,
    application_fee_sc_st: 600,
    important_dates: {
      notification_date: '2026-02-22',
      start_date: '2026-02-25',
      last_date: '2026-04-05',
      exam_date: '2026-06-10',
    },
    apply_link: 'https://ugcnet.nta.nic.in',
    locations: ['All India (Exam Centers)'],
    tags: ['teaching', 'ugc-net', 'pg', 'jrf', 'assistant-professor', 'nta'],
    status: 'published',
    featured: false,
    posts: [
      {
        post_name: 'Junior Research Fellowship (JRF)',
        vacancies_total: 0,
        education_required: 'Post-Graduation with minimum 55% marks in relevant subject',
        age_limit: 'Maximum 30 years (relaxation for SC/ST/OBC/PwBD)',
        salary: '\u20b931,000/month (JRF fellowship) + HRA',
      },
      {
        post_name: 'Assistant Professor Eligibility',
        vacancies_total: 0,
        education_required: 'Post-Graduation with minimum 55% marks in relevant subject',
        age_limit: 'No upper age limit',
        salary: '\u20b957,700 \u2013 \u20b91,82,400 (Pay Level 10)',
      },
    ],
    created_at: '2026-02-22T10:30:00Z',

    summary: 'The National Testing Agency conducts UGC NET to determine eligibility for Junior Research Fellowship (JRF) and for appointment as Assistant Professor in Indian universities and colleges. The exam is conducted in 83 subjects across Humanities, Social Sciences, Commerce, Sciences, and other disciplines. It is the gateway to an academic career in India.',
    how_to_apply: [
      'Visit the NTA UGC NET portal at ugcnet.nta.nic.in',
      'Click on "New Registration" for June 2026 cycle',
      'Register with valid email, mobile number, and create password',
      'Fill in academic details, subject of PG, and NET subject chosen',
      'Upload photograph, signature, category certificate, and PG marksheet',
      'Pay the application fee (General: \u20b91,150, OBC-NCL/EWS: \u20b9600, SC/ST/PwBD/Third Gender: \u20b9325)',
      'Confirm the application and download for records',
    ],
    selection_process: [
      { stage: 1, name: 'UGC NET Examination', description: 'Computer-Based Test with two papers. Paper I (General) tests Teaching Aptitude, Research, Comprehension, Communication, Reasoning, Data Interpretation, ICT, People & Environment, and Higher Education. Paper II tests the subject chosen by the candidate.', is_eliminatory: true },
      { stage: 2, name: 'Result & Certificate', description: 'Qualified candidates receive JRF or NET (Assistant Professor eligibility) certificate. JRF is valid for 5 years. NET certificate is valid for lifetime.', is_eliminatory: false },
    ],
    exam_pattern: [
      { section: 'Paper I (General)', questions: 50, marks: 100, duration_minutes: 60 },
      { section: 'Paper II (Subject-specific)', questions: 100, marks: 200, duration_minutes: 120 },
    ],
    syllabus_topics: {
      'Paper I (General)': ['Teaching Aptitude', 'Research Aptitude', 'Comprehension', 'Communication', 'Mathematical Reasoning & Aptitude', 'Logical Reasoning', 'Data Interpretation', 'Information & Communication Technology (ICT)', 'People, Development & Environment', 'Higher Education System'],
      'Paper II (Subject)': ['In-depth knowledge of chosen subject', 'Latest developments in the field', 'Application-based questions', 'Analytical and critical thinking', 'Interdisciplinary concepts'],
    },
    official_website: 'https://ugcnet.nta.nic.in',
    pdf_url: 'https://ugcnet.nta.nic.in/documents/ugc-net-june-2026-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Junior Research Fellowship (JRF)', ur: 0, obc: 0, sc: 0, st: 0, ews: 0, total: 0 },
      { post_name: 'Assistant Professor Eligibility', ur: 0, obc: 0, sc: 0, st: 0, ews: 0, total: 0 },
    ],
  },
  {
    id: 'bpsc-70th-2026',
    slug: 'bpsc-70th-combined-exam-2026',
    notification_title: 'BPSC 70th Combined Competitive Examination 2026',
    advertisement_number: 'BPSC/70th CCE/2026',
    department: 'Government of Bihar',
    organization: 'Bihar Public Service Commission',
    sector: 'state_psc',
    total_vacancies: 1929,
    education_level: 'graduate',
    age_min: 20,
    age_max: 37,
    salary_min: 44900,
    salary_max: 209200,
    application_fee_general: 600,
    application_fee_sc_st: 150,
    important_dates: {
      notification_date: '2026-02-10',
      start_date: '2026-02-12',
      last_date: '2026-03-18',
      exam_date: '2026-05-18',
    },
    apply_link: 'https://bpsc.bih.nic.in',
    locations: ['Bihar'],
    tags: ['state-psc', 'bpsc', 'graduate', 'officer', 'bihar', 'civil-services'],
    status: 'published',
    featured: true,
    posts: [
      {
        post_name: 'Deputy Collector / Deputy SP / Other Group A Services',
        vacancies_total: 400,
        education_required: 'Graduation from a recognized university',
        age_limit: '20\u201337 years (relaxation for SC/ST/OBC/PwBD/Women)',
        salary: '\u20b944,900 \u2013 \u20b92,09,200 (Pay Level 11+)',
      },
      {
        post_name: 'Block Development Officer (BDO)',
        vacancies_total: 529,
        education_required: 'Graduation from a recognized university',
        age_limit: '20\u201337 years',
        salary: '\u20b944,900 \u2013 \u20b91,42,400 (Pay Level 10)',
      },
      {
        post_name: 'Revenue Officer / Supply Inspector / Other Group B',
        vacancies_total: 1000,
        education_required: 'Graduation from a recognized university',
        age_limit: '20\u201337 years',
        salary: '\u20b944,900 \u2013 \u20b91,42,400 (Pay Level 10)',
      },
    ],
    created_at: '2026-02-10T09:00:00Z',

    summary: 'The Bihar Public Service Commission announces the 70th Combined Competitive Examination for recruitment to various Group A and Group B services under the Government of Bihar. This includes coveted posts like Deputy Collector, Deputy SP, Block Development Officer, and Revenue Officer. The exam follows a three-stage process similar to UPSC Civil Services and offers excellent career prospects in Bihar state administration.',
    how_to_apply: [
      'Visit the BPSC official website at bpsc.bih.nic.in',
      'Navigate to the 70th CCE notification and click "Apply Online"',
      'Register with valid email, mobile number, and Aadhaar number',
      'Fill in personal, educational, and domicile details',
      'Upload recent photograph, signature, and required certificates',
      'Pay the application fee (General/OBC/EWS: \u20b9600, SC/ST/Female of Bihar: \u20b9150, PwBD: \u20b9150)',
      'Submit the application and take a printout for reference',
    ],
    selection_process: [
      { stage: 1, name: 'Preliminary Examination', description: 'Objective MCQ paper of General Studies covering History, Geography, Polity, Economy, Science, and Current Affairs of Bihar and India. 150 questions, 150 marks, 2 hours. Qualifying in nature.', is_eliminatory: true },
      { stage: 2, name: 'Main Examination', description: 'Written (descriptive) exam with 4 compulsory papers: General Hindi (100 marks), General Studies Paper I (300 marks), General Studies Paper II (300 marks), and Optional Subject (100 marks). Total 800 marks.', is_eliminatory: true },
      { stage: 3, name: 'Interview / Personality Test', description: 'Personal interview assessing personality, communication, knowledge, and suitability for administrative services. 120 marks.', is_eliminatory: true },
      { stage: 4, name: 'Final Merit & Service Allocation', description: 'Combined merit of Mains + Interview determines rank. Service and cadre allocation based on rank and preference.', is_eliminatory: false },
    ],
    exam_pattern: [
      { section: 'General Studies (Prelims)', questions: 150, marks: 150, duration_minutes: 120 },
    ],
    syllabus_topics: {
      'General Studies I': ['Indian History & Culture', 'Modern Indian History', 'Indian National Movement with special reference to Bihar', 'Indian Geography', 'Bihar Geography'],
      'General Studies II': ['Indian Polity & Governance', 'Indian Economy', 'Science & Technology', 'Indian Agriculture', 'Current Affairs of National & International Importance', 'Bihar-specific developments'],
      'General Hindi': ['Hindi Grammar', 'Essay Writing', 'Letter Writing', 'Precis Writing', 'Translation (English to Hindi)'],
    },
    official_website: 'https://bpsc.bih.nic.in',
    pdf_url: 'https://bpsc.bih.nic.in/documents/70th-cce-notification.pdf',
    vacancy_breakdown: [
      { post_name: 'Deputy Collector / Deputy SP / Group A', ur: 160, obc: 108, sc: 60, st: 32, ews: 40, total: 400 },
      { post_name: 'Block Development Officer (BDO)', ur: 212, obc: 143, sc: 79, st: 42, ews: 53, total: 529 },
      { post_name: 'Revenue Officer / Supply Inspector / Group B', ur: 400, obc: 270, sc: 150, st: 80, ews: 100, total: 1000 },
    ],
  },
]
