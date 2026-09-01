/**
 * User Exam Configuration & Multi-Exam Curriculum Registry
 * 
 * Provides dynamic subject definitions, daily quota targets, preparation horizons,
 * and detailed syllabus modules mapped from the Master Competitive Exams Preparation Tracker.
 * 
 * Supported Exams:
 * 1. MBA / IIMs — CAT (Common Admission Test)
 * 2. Engineering — JEE (Main & Advanced)
 * 3. Medical — NEET-UG
 * 4. Postgrad / PSU — GATE (Graduate Aptitude Test in Engineering)
 * 5. Civil Services — UPSC CSE
 * 6. Global Admissions — GRE & GMAT Focus
 */

export const DEFAULT_EXAM_ID = 'cat';
export const DEFAULT_TIMELINE_ID = '16_weeks';

/**
 * Preparation Timeline Horizons
 * Dynamically scales daily question quotas, study hours, and weekly roadmap duration.
 */
export const TIMELINE_HORIZONS = [
  {
    id: '3_months',
    name: '3 Months',
    label: '3 Months Crash',
    badge: 'SPRINT',
    durationWeeks: 12,
    multiplier: 1.4, // Higher daily intensity to cover syllabus rapidly
    dailyHours: 6.0,
    description: 'High-intensity sprint prioritizing high-weightage chapters and intensive PYQs.'
  },
  {
    id: '16_weeks',
    name: '16 Weeks',
    label: '16 Weeks Standard',
    badge: 'BALANCED',
    durationWeeks: 16,
    multiplier: 1.0, // Standard baseline
    dailyHours: 4.0,
    isDefault: true,
    description: 'Proven balanced blueprint: 10 weeks foundation, 4 weeks advanced drill, 2 weeks mock marathons.'
  },
  {
    id: '6_months',
    name: '6 Months',
    label: '6 Months Intensive',
    badge: 'PACED',
    durationWeeks: 24,
    multiplier: 0.85,
    dailyHours: 3.5,
    description: 'Methodical pacing with dedicated multiple-revision cycles and full problem sheets.'
  },
  {
    id: '1_year',
    name: '1 Year',
    label: '1 Year Comprehensive',
    badge: 'FOUNDATION',
    durationWeeks: 52,
    multiplier: 0.65,
    dailyHours: 3.0,
    description: 'Exhaustive foundation building with 3 complete revision cycles and full test series.'
  }
];

export const SUPPORTED_EXAMS = {
  cat: {
    id: 'cat',
    name: 'CAT (Common Admission Test)',
    shortName: 'CAT',
    badge: 'MBA / IIMs',
    targetAudience: 'IIMs, FMS, XLRI, SPJIMR & Top B-Schools',
    defaultYear: '2025',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    icon: 'Trophy',
    trackingColumns: [
      { key: 'status', label: 'Status' },
      { key: 'firstRevision', label: '1st Revision' },
      { key: 'secondRevision', label: '2nd Revision' },
      { key: 'pyqStatus', label: 'PYQ Status' },
      { key: 'targetScore', label: 'Target Score' }
    ],
    sections: [
      {
        slotKey: 'quant',
        id: 'qa',
        name: 'Quantitative Aptitude',
        shortName: 'QA',
        cardTitle: 'Quant Questions',
        badge: 'QA',
        defaultDailyQuota: 18,
        unit: 'Questions',
        color: '#38bdf8',
        topics: [
          'Arithmetic (Percentages, Profit/Loss, TSD, Work)',
          'Algebra (Linear/Quadratic Equations, Functions)',
          'Geometry & Mensuration (Triangles, Circles, Polygons)',
          'Number Systems (Divisibility, Remainders, Factors)',
          'Modern Math (Permutations, Combinations, Probability)'
        ],
        modules: [
          { name: 'Arithmetic (Percentages, Profit/Loss, TSD, Work)', targetScore: 40, pyqs: '300+' },
          { name: 'Algebra (Linear/Quadratic Equations, Functions)', targetScore: 35, pyqs: '250+' },
          { name: 'Geometry & Mensuration', targetScore: 30, pyqs: '200+' }
        ]
      },
      {
        slotKey: 'lrdi',
        id: 'dilr',
        name: 'Data Interpretation & Logical Reasoning',
        shortName: 'DILR',
        cardTitle: 'LRDI Sets',
        badge: 'DILR',
        defaultDailyQuota: 4,
        unit: 'Sets',
        color: '#a855f7',
        topics: [
          'Data Interpretation (Tables, Charts, Venn Diagrams)',
          'Logical Reasoning (Arrangements, Games & Tournaments)',
          'Networks, Routes & Grouping',
          'Binary Logic & Truth-Liar Puzzles'
        ],
        modules: [
          { name: 'Data Interpretation (Tables, Charts, Venn Diagrams)', targetScore: 35, pyqs: '120 Sets' },
          { name: 'Logical Reasoning (Arrangements, Games & Tournaments)', targetScore: 35, pyqs: '140 Sets' }
        ]
      },
      {
        slotKey: 'varc',
        id: 'varc',
        name: 'Verbal Ability & Reading Comprehension',
        shortName: 'VARC',
        cardTitle: 'VARC RCs',
        badge: 'VARC',
        defaultDailyQuota: 4,
        unit: 'RCs & Exercises',
        color: '#34d399',
        topics: [
          'Reading Comprehension (Passage Analysis & Inference)',
          'Verbal Ability (Para Summary, Jumbles, Odd One Out)',
          'Critical Reasoning & Argument Analysis'
        ],
        modules: [
          { name: 'Reading Comprehension (Passage Analysis & Inference)', targetScore: 40, pyqs: '150 Passages' },
          { name: 'Verbal Ability (Para Summary, Jumbles, Odd One Out)', targetScore: 25, pyqs: '200 Questions' }
        ]
      }
    ]
  },

  jee: {
    id: 'jee',
    name: 'JEE (Main & Advanced)',
    shortName: 'JEE',
    badge: 'ENGINEERING',
    targetAudience: 'IITs, NITs, IIITs & Premier Tech Institutes',
    defaultYear: '2025',
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.25)',
    icon: 'Zap',
    trackingColumns: [
      { key: 'theoryStatus', label: 'Theory Status' },
      { key: 'sheetCompleted', label: 'Sheet / Module' },
      { key: 'mainPyqs', label: 'JEE Main PYQs' },
      { key: 'advPyqs', label: 'JEE Adv PYQs' },
      { key: 'revisionCount', label: 'Revision Count' }
    ],
    sections: [
      {
        slotKey: 'quant',
        id: 'physics',
        name: 'Physics',
        shortName: 'PHY',
        cardTitle: 'Physics Questions',
        badge: 'PHY',
        defaultDailyQuota: 20,
        unit: 'Questions',
        color: '#38bdf8',
        topics: [
          'Mechanics (Kinematics, Laws of Motion, WEP)',
          'Electrodynamics & Magnetism',
          'Optics & Modern Physics',
          'Thermodynamics, Waves & Oscillations',
          'Rotational Dynamics & Gravitation'
        ],
        modules: [
          { name: 'Mechanics (Kinematics, Laws of Motion, WEP)', mainPyqs: 100, advPyqs: 50 },
          { name: 'Electrodynamics & Magnetism', mainPyqs: 100, advPyqs: 50 },
          { name: 'Optics & Modern Physics', mainPyqs: 100, advPyqs: 50 }
        ]
      },
      {
        slotKey: 'lrdi',
        id: 'chemistry',
        name: 'Chemistry',
        shortName: 'CHEM',
        cardTitle: 'Chemistry Questions',
        badge: 'CHEM',
        defaultDailyQuota: 25,
        unit: 'Questions',
        color: '#ec4899',
        topics: [
          'Physical Chemistry (Thermodynamics, Equilibrium, Kinetics)',
          'Organic Chemistry (Reaction Mechanisms, GOC, Hydrocarbons)',
          'Inorganic Chemistry (p-Block, Coordination, Chemical Bonding)',
          'Atomic Structure & Electrochemistry'
        ],
        modules: [
          { name: 'Physical Chemistry (Thermodynamics, Equilibrium)', mainPyqs: 100, advPyqs: 50 },
          { name: 'Organic Chemistry (Reaction Mechanisms, GOC)', mainPyqs: 100, advPyqs: 50 },
          { name: 'Inorganic Chemistry (p-Block, Coordination)', mainPyqs: 100, advPyqs: 50 }
        ]
      },
      {
        slotKey: 'varc',
        id: 'math',
        name: 'Mathematics',
        shortName: 'MATH',
        cardTitle: 'Mathematics Problems',
        badge: 'MATH',
        defaultDailyQuota: 20,
        unit: 'Problems',
        color: '#a855f7',
        topics: [
          'Calculus (Differential & Integral)',
          'Coordinate Geometry & Vectors/3D',
          'Algebra (Matrices, Determinants, Complex Numbers)',
          'Probability & Binomial Theorem',
          'Trigonometry & Mathematical Reasoning'
        ],
        modules: [
          { name: 'Calculus (Differential & Integral)', mainPyqs: 100, advPyqs: 50 },
          { name: 'Coordinate Geometry & Vectors/3D', mainPyqs: 100, advPyqs: 50 },
          { name: 'Algebra & Probability', mainPyqs: 100, advPyqs: 50 }
        ]
      }
    ]
  },

  neet: {
    id: 'neet',
    name: 'NEET-UG (Medical Entrance)',
    shortName: 'NEET',
    badge: 'MEDICAL',
    targetAudience: 'AIIMS, JIPMER, AFMC & Top Govt Medical Colleges (MBBS)',
    defaultYear: '2025',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    icon: 'Shield',
    trackingColumns: [
      { key: 'ncertRead', label: 'NCERT Read' },
      { key: 'ncertHighlights', label: 'NCERT Highlights' },
      { key: 'questionBank', label: 'Question Bank (MCQs)' },
      { key: 'revision1', label: 'Revision 1' },
      { key: 'revision2', label: 'Revision 2' }
    ],
    sections: [
      {
        slotKey: 'quant',
        id: 'physics',
        name: 'Physics',
        shortName: 'PHY',
        cardTitle: 'Physics Questions',
        badge: 'PHY',
        defaultDailyQuota: 25,
        unit: 'Questions',
        color: '#38bdf8',
        topics: [
          'Optics & Modern Physics',
          'Mechanics & Properties of Matter',
          'Thermodynamics & Kinetic Theory',
          'Electrostatics, Current & Magnetism',
          'Semiconductors & Electronic Devices'
        ],
        modules: [
          { name: 'Optics & Modern Physics', mcqsTarget: 150, ncertRead: true },
          { name: 'Mechanics & Properties of Matter', mcqsTarget: 150, ncertRead: true },
          { name: 'Electrostatics & Magnetism', mcqsTarget: 150, ncertRead: true }
        ]
      },
      {
        slotKey: 'lrdi',
        id: 'chemistry',
        name: 'Chemistry',
        shortName: 'CHEM',
        cardTitle: 'Chemistry Questions',
        badge: 'CHEM',
        defaultDailyQuota: 30,
        unit: 'Questions',
        color: '#f59e0b',
        topics: [
          'Inorganic Chemistry (p-Block, Coordination, Periodic Table)',
          'Physical Chemistry (Equilibrium, Solutions, Thermodynamics)',
          'Organic Chemistry (Named Reactions, Biomolecules, GOC)',
          'Chemical Bonding & Molecular Structure'
        ],
        modules: [
          { name: 'Inorganic Chemistry (p-Block, Coordination)', mcqsTarget: 150, ncertRead: true },
          { name: 'Physical Chemistry & Solutions', mcqsTarget: 150, ncertRead: true },
          { name: 'Organic Chemistry & Biomolecules', mcqsTarget: 150, ncertRead: true }
        ]
      },
      {
        slotKey: 'varc',
        id: 'biology',
        name: 'Biology (Botany & Zoology)',
        shortName: 'BIO',
        cardTitle: 'Biology MCQs',
        badge: 'BIO',
        defaultDailyQuota: 50,
        unit: 'NCERT MCQs',
        color: '#10b981',
        topics: [
          'Diversity in Living World & Cell Biology',
          'Human Physiology & Genetics',
          'Plant Physiology & Photosynthesis',
          'Ecology, Environment & Biodiversity',
          'Reproduction & Human Health'
        ],
        modules: [
          { name: 'Diversity in Living World & Cell Biology', mcqsTarget: 200, ncertRead: true },
          { name: 'Human Physiology & Genetics', mcqsTarget: 200, ncertRead: true },
          { name: 'Ecology & Plant Physiology', mcqsTarget: 200, ncertRead: true }
        ]
      }
    ]
  },

  gate: {
    id: 'gate',
    name: 'GATE (Engineering Graduate)',
    shortName: 'GATE',
    badge: 'POSTGRAD / PSU',
    targetAudience: 'IISc, IITs (M.Tech/Direct PhD) & Top Navratna PSUs',
    defaultYear: '2026',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    icon: 'Cpu',
    trackingColumns: [
      { key: 'lecturesStatus', label: 'Lectures Status' },
      { key: 'notesCreated', label: 'Notes Created' },
      { key: 'pyqs25Yrs', label: 'PYQs (Last 25 Yrs)' },
      { key: 'testSeriesStatus', label: 'Test Series Status' }
    ],
    sections: [
      {
        slotKey: 'quant',
        id: 'core_eng',
        name: 'Core Engineering',
        shortName: 'CORE',
        cardTitle: 'Core Technical MCQs',
        badge: 'CORE',
        defaultDailyQuota: 20,
        unit: 'Questions',
        color: '#38bdf8',
        topics: [
          'Core Subject 1 (e.g., Data Structures / Thermodynamics)',
          'Core Subject 2 (e.g., Algorithms / Circuits)',
          'Core Subject 3 (e.g., Operating Systems / Mechanics)',
          'Theory of Computation / Electrical Machines'
        ],
        modules: [
          { name: 'Core Subject 1 (Data Structures / Thermodynamics)', pyqs25Yrs: true, testSeries: true },
          { name: 'Core Subject 2 (Algorithms / Circuits)', pyqs25Yrs: true, testSeries: true }
        ]
      },
      {
        slotKey: 'lrdi',
        id: 'eng_math',
        name: 'Engineering Mathematics',
        shortName: 'MATH',
        cardTitle: 'Engineering Math Questions',
        badge: 'MATH',
        defaultDailyQuota: 10,
        unit: 'Questions',
        color: '#6366f1',
        topics: [
          'Linear Algebra & Eigenvalues',
          'Calculus (Differential & Vector)',
          'Probability & Statistics',
          'Differential Equations & Numerical Methods'
        ],
        modules: [
          { name: 'Linear Algebra, Calculus, Probability', pyqs25Yrs: true, testSeries: true }
        ]
      },
      {
        slotKey: 'varc',
        id: 'gen_aptitude',
        name: 'General Aptitude',
        shortName: 'APT',
        cardTitle: 'General Aptitude Questions',
        badge: 'APT',
        defaultDailyQuota: 10,
        unit: 'Questions',
        color: '#14b8a6',
        topics: [
          'Verbal & Numerical Ability',
          'Spatial Reasoning & Shape Patterns',
          'Data Interpretation & Analytical Reasoning'
        ],
        modules: [
          { name: 'Verbal & Numerical Ability', pyqs25Yrs: true, testSeries: true }
        ]
      }
    ]
  },

  upsc: {
    id: 'upsc',
    name: 'UPSC Civil Services (CSE)',
    shortName: 'UPSC',
    badge: 'CIVIL SERVICES',
    targetAudience: 'IAS, IPS, IFS & Central Civil Services',
    defaultYear: '2026',
    color: '#e879f9',
    glowColor: 'rgba(232, 121, 249, 0.25)',
    icon: 'Compass',
    trackingColumns: [
      { key: 'standardSources', label: 'Standard Books / Sources' },
      { key: 'syllabusCompletion', label: 'Syllabus Completion' },
      { key: 'revisionCycle', label: 'Revision Cycle' },
      { key: 'mainsAnswerWriting', label: 'Mains Answer Writing' }
    ],
    sections: [
      {
        slotKey: 'quant',
        id: 'gs1',
        name: 'General Studies 1 (GS-1)',
        shortName: 'GS-1',
        cardTitle: 'GS-1 Topics & MCQs',
        badge: 'GS-1',
        defaultDailyQuota: 15,
        unit: 'Topics / MCQs',
        color: '#38bdf8',
        topics: [
          'Indian History & Art/Culture (NCERTs / Spectrum)',
          'Polity & Governance (M. Laxmikanth)',
          'Geography & Environment (NCERTs / PMF IAS)',
          'Indian Economy & Budget Analysis'
        ],
        modules: [
          { name: 'Indian History & Art/Culture', standardSource: 'NCERTs / Spectrum', revisionTarget: '0/3', mainsWriting: '50+ Answers' },
          { name: 'Polity & Governance', standardSource: 'M. Laxmikanth', revisionTarget: '0/3', mainsWriting: '50+ Answers' },
          { name: 'Geography & Environment', standardSource: 'NCERTs / PMF IAS', revisionTarget: '0/3', mainsWriting: '50+ Answers' }
        ]
      },
      {
        slotKey: 'lrdi',
        id: 'csat',
        name: 'CSAT (Paper II)',
        shortName: 'CSAT',
        cardTitle: 'CSAT Practice Sets',
        badge: 'CSAT',
        defaultDailyQuota: 4,
        unit: 'Practice Sets',
        color: '#ec4899',
        topics: [
          'Quantitative Aptitude & Reasoning (RS Aggarwal / PYQs)',
          'Reading Comprehension & Interpersonal Skills',
          'Data Interpretation & Mental Ability'
        ],
        modules: [
          { name: 'Quantitative Aptitude & Reasoning', standardSource: 'RS Aggarwal / PYQs', revisionTarget: '0/2', mainsWriting: 'N/A' }
        ]
      },
      {
        slotKey: 'varc',
        id: 'current_affairs',
        name: 'Current Affairs',
        shortName: 'CA',
        cardTitle: 'Current Affairs Notes',
        badge: 'CA',
        defaultDailyQuota: 4,
        unit: 'Analysis Notes',
        color: '#34d399',
        topics: [
          'Monthly Compilations (Polity/Economy/Sci-Tech)',
          'News Analysis / Magazines & Editorials',
          'Government Schemes & PIB Compilations'
        ],
        modules: [
          { name: 'Monthly Compilations (Polity/Economy/Sci-Tech)', standardSource: 'News Analysis / Magazines', revisionTarget: 'Continuous', mainsWriting: 'Weekly Essays' }
        ]
      }
    ]
  },

  gre: {
    id: 'gre',
    name: 'GRE & GMAT Focus',
    shortName: 'GRE / GMAT',
    badge: 'GLOBAL',
    targetAudience: 'Ivy League, MIT, Stanford, INSEAD & Top Global Universities',
    defaultYear: '2025',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    icon: 'Globe',
    trackingColumns: [
      { key: 'questionCategory', label: 'Question Type / Category' },
      { key: 'questionsAttempted', label: 'Questions Attempted' },
      { key: 'accuracyPct', label: 'Accuracy %' },
      { key: 'errorLogRef', label: 'Error Log Ref' }
    ],
    sections: [
      {
        slotKey: 'quant',
        id: 'quant_reasoning',
        name: 'Quantitative Reasoning (QR)',
        shortName: 'QR',
        cardTitle: 'Quantitative Problems',
        badge: 'QR',
        defaultDailyQuota: 20,
        unit: 'Problems',
        color: '#38bdf8',
        topics: [
          'Problem Solving & Data Interpretation',
          'Arithmetic & Number Properties',
          'Algebra & Coordinate Geometry',
          'Quantitative Comparison Traps'
        ],
        modules: [
          { name: 'Problem Solving & Data Interpretation', targetAccuracy: 88, errorLog: 'Log 2' }
        ]
      },
      {
        slotKey: 'lrdi',
        id: 'data_insights',
        name: 'Data Insights (DI)',
        shortName: 'DI',
        cardTitle: 'Data Insights Sets',
        badge: 'DI',
        defaultDailyQuota: 5,
        unit: 'Sets',
        color: '#a855f7',
        topics: [
          'Data Sufficiency & Multi-Source Reasoning',
          'Table Analysis & Graphics Interpretation',
          'Two-Part Analysis Questions'
        ],
        modules: [
          { name: 'Data Sufficiency & Multi-Source Reasoning', targetAccuracy: 85, errorLog: 'Log 1' }
        ]
      },
      {
        slotKey: 'varc',
        id: 'verbal_reasoning',
        name: 'Verbal Reasoning (VR)',
        shortName: 'VR',
        cardTitle: 'Verbal Questions',
        badge: 'VR',
        defaultDailyQuota: 15,
        unit: 'Questions',
        color: '#34d399',
        topics: [
          'Reading Comprehension & Critical Reasoning',
          'Advanced Vocabulary in Context',
          'Text Completion & Sentence Equivalence'
        ],
        modules: [
          { name: 'Reading Comprehension & Critical Reasoning', targetAccuracy: 85, errorLog: 'Log 3' }
        ]
      }
    ]
  }
};

/**
 * Returns the active exam configuration object.
 * Falls back to 'cat' if unrecognized.
 */
export const getActiveExamConfig = (examId = DEFAULT_EXAM_ID) => {
  const normalized = (examId || '').toLowerCase().trim();
  return SUPPORTED_EXAMS[normalized] || SUPPORTED_EXAMS[DEFAULT_EXAM_ID];
};

/**
 * Retrieves a timeline horizon object by id.
 */
export const getTimelineHorizon = (horizonId = DEFAULT_TIMELINE_ID) => {
  return TIMELINE_HORIZONS.find(h => h.id === horizonId) || TIMELINE_HORIZONS[1];
};

/**
 * Calculates adjusted daily quotas and hours based on exam and timeline horizon.
 */
export const getAdjustedDailyQuotas = (examId = DEFAULT_EXAM_ID, horizonId = DEFAULT_TIMELINE_ID) => {
  const config = getActiveExamConfig(examId);
  const horizon = getTimelineHorizon(horizonId);
  const m = horizon.multiplier || 1.0;

  return {
    quant: Math.max(1, Math.round((config.sections[0]?.defaultDailyQuota || 18) * m)),
    lrdi: Math.max(1, Math.round((config.sections[1]?.defaultDailyQuota || 4) * m)),
    varc: Math.max(1, Math.round((config.sections[2]?.defaultDailyQuota || 4) * m)),
    dailyHours: horizon.dailyHours,
    durationWeeks: horizon.durationWeeks,
    horizonName: horizon.name
  };
};

/**
 * Retrieves metadata for a specific slot ('quant' | 'lrdi' | 'varc') for an exam.
 */
export const getSectionMeta = (slotKey = 'quant', examId = DEFAULT_EXAM_ID) => {
  const exam = getActiveExamConfig(examId);
  const section = exam.sections.find(s => s.slotKey === slotKey);
  return section || exam.sections[0];
};

/**
 * Returns all supported exams as an array for UI pickers.
 */
export const getAllExams = () => {
  return Object.values(SUPPORTED_EXAMS);
};
