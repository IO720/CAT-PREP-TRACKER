/**
 * Comprehensive CAT 16-Week Syllabus & Roadmap Reference
 * Granular sub-topics, milestone definitions, formula anchors, and study companion guidance.
 */

export const CAT_PHASES = [
  {
    id: 'ALL',
    name: 'All Weeks (1-16)',
    shortName: 'Full Blueprint',
    badge: '16 WEEKS',
    weeksRange: [1, 16],
    color: '#38bdf8'
  },
  {
    id: 'PHASE 1',
    name: 'Phase 1: Foundation & Core Concepts',
    shortName: 'Foundation (W1–8)',
    badge: 'WEEKS 1–8',
    weeksRange: [1, 8],
    color: '#38bdf8',
    summary: 'Master arithmetic essentials, algebra fundamentals, core LR arrangement types, and fundamental reading comprehension habits.'
  },
  {
    id: 'PHASE 2',
    name: 'Phase 2: Syllabus Completion & Sectionals',
    shortName: 'Advanced & Sectionals (W9–12)',
    badge: 'WEEKS 9–12',
    color: '#a855f7',
    summary: 'Coordinate geometry, modern math, complex games/tournaments, missing data sets, and high-difficulty sectional test simulations.'
  },
  {
    id: 'PHASE 3',
    name: 'Phase 3: The Mock Marathon',
    shortName: 'Mock Marathon (W13–16)',
    badge: 'WEEKS 13–16',
    color: '#f59e0b',
    summary: '30 Full-Length Mocks, intense error log diagnostics, set-selection discipline, and mental composure conditioning.'
  }
];

export const CAT_MILESTONES = {
  4: {
    title: 'Arithmetic Mastery Checkpoint',
    desc: 'You have cleared Percentages, P&L, TSD, Time & Work, and SI/CI. Arithmetic accounts for 35-40% of CAT Quant!',
    icon: 'target',
    phase: 'Phase 1',
    badgeColor: '#38bdf8'
  },
  8: {
    title: 'Foundation Complete',
    desc: 'Phase 1 conquered! You have built the core foundation in Algebra, Geometry, Arrangements, and Reading Comprehension.',
    icon: 'trophy',
    phase: 'Phase 1',
    badgeColor: '#10b981'
  },
  12: {
    title: 'Full Syllabus Conquered',
    desc: 'All 100% syllabus topics mastered! Modern Math, Advanced Tournaments, and High-Difficulty VARC conquered.',
    icon: 'zap',
    phase: 'Phase 2',
    badgeColor: '#a855f7'
  },
  16: {
    title: 'CAT Peak Readiness',
    desc: '30 Mocks analyzed, Error Log resolved. You are in the 99th percentile strike zone. Trust your prep!',
    icon: 'sparkles',
    phase: 'Phase 3',
    badgeColor: '#f59e0b'
  }
};

export const CAT_CAT_BUDDY_QUOTES = [
  {
    threshold: 0,
    text: "The journey to 99%ile begins with Week 1! Nail those percentage fractions and seating puzzles.",
    mood: 'focused'
  },
  {
    threshold: 25,
    text: "25% of the blueprint conquered! Arithmetic is getting solid. Keep drilling consistently!",
    mood: 'proud'
  },
  {
    threshold: 50,
    text: "Halfway mark reached! Phase 1 foundation complete. Now the real sectional test mastery begins.",
    mood: 'excited'
  },
  {
    threshold: 75,
    text: "75% cleared! Syllabus is nearly done. Entering the Mock Marathon stage — stay cool under pressure!",
    mood: 'warrior'
  },
  {
    threshold: 100,
    text: "All 16 weeks completed! You are fully prepped, battle-tested, and ready to dominate CAT!",
    mood: 'champion'
  }
];

export const WEEKLY_SYLLABUS_DETAILS = {
  1: {
    quantSubtopics: [
      'Percentage-to-fraction conversions (1/1 to 1/20)',
      'Successive percentage changes & multiplying factors',
      'Profit, Loss, Discount, Marked Price & Margin calculations',
      'Faulty balance & dishonest shopkeeper trick concepts'
    ],
    lrdiSubtopics: [
      'Linear arrangements (Single row, Facing North/South)',
      'Circular arrangements (Inward & Outward facing)',
      'Double row parallel seating constraints',
      'Definite clue identification & case branching'
    ],
    varcSubtopics: [
      'Science & Technology long passage comprehension',
      'Structural reading: Main idea vs Supporting evidence',
      'Intro to 4-sentence Parajumbles (Mandatory pairs)',
      'Active paragraph summarization in own words'
    ],
    targetWeeklyHours: '20-22 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'Memorize fraction tables up to 1/20 cold — saves 30-40 seconds per DI set.'
  },
  2: {
    quantSubtopics: [
      'Ratios, proportions & properties of equal ratios',
      'Weighted averages & visual balancing method',
      'Mixtures & Alligation rule applications',
      'Replacement formulas (Repeated dilution problems)'
    ],
    lrdiSubtopics: [
      'Matrix grid matching (3 to 4 variable matching)',
      'Complex attribute mapping & elimination grids',
      'Conditional logic constraints ("If X then not Y")',
      'Tabular puzzle layout optimization'
    ],
    varcSubtopics: [
      'Economics, Finance & Business passage analysis',
      'Macro trends & author perspective identification',
      'Para Summary: Spotting extreme and distortive options',
      'Elimination technique on 2-close options'
    ],
    targetWeeklyHours: '20-24 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'Always test alligation ratios using difference of values — avoids algebraic mistakes.'
  },
  3: {
    quantSubtopics: [
      'Average speed, inverse proportionality of Speed & Time',
      'Relative speed in same & opposite directions',
      'Trains, platforms, boats & streams (Upstream/Downstream)',
      'Circular tracks, first meeting & meeting at starting point'
    ],
    lrdiSubtopics: [
      'Tabular Data Interpretation calculation shortcuts',
      'Bar charts & Line graphs comparison sets',
      'CAGR vs Simple growth calculations',
      'Percentage change vs Percentage point difference'
    ],
    varcSubtopics: [
      'Philosophy, Psychology & Sociology dense passages',
      'Abstract terminology & tone inference decoding',
      'Odd One Out (Odd sentence out of context)',
      'Theme tracking across disjointed paragraphs'
    ],
    targetWeeklyHours: '22-26 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'Draw simple timelines for TSD problems — visual positioning clears 90% of confusion.'
  },
  4: {
    quantSubtopics: [
      'Time & Work unitary method & efficiency ratios',
      'Pipes & Cisterns (Negative work / Leakage problems)',
      'Work & Wages proportional division',
      'Simple Interest vs Compound Interest, EMI & Installments'
    ],
    lrdiSubtopics: [
      'Pie charts (Degree to percentage conversions)',
      'Multiple pie charts & combined comparative sets',
      'Caselet DI (Paragraph without pre-made tables)',
      'Translating narrative statements into clean tables'
    ],
    varcSubtopics: [
      'History, Sociology & Anthropology passages',
      'Critical Reasoning: Identifying assumptions & premises',
      'Strengthen vs Weaken author arguments',
      'Inference vs direct fact distinction in question stems'
    ],
    targetWeeklyHours: '22-26 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'Take LCM of individual days as total work units to turn fractional math into integers!'
  },
  5: {
    quantSubtopics: [
      'Linear equations with 2 and 3 variables',
      'Special equations (Integral solutions & Diophantine equations)',
      'Quadratic equations: Roots, Discriminant, Nature of roots',
      'Sum & Product of roots, Common roots condition'
    ],
    lrdiSubtopics: [
      'Knockout tournament mechanics (Matches, Byes, Seedings)',
      'Round-Robin tournament grids (Points tables & Wins/Losses)',
      'Goals for/against & Tie-breaking algorithms',
      'Min/Max matches required for qualification'
    ],
    varcSubtopics: [
      'Art, Culture, Film & Literary criticism passages',
      'Author attitude: Objective vs Subjective vs Cynical',
      'Sentence Completion & Contextual Vocabulary',
      'Speed reading without subvocalization drills'
    ],
    targetWeeklyHours: '24-28 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'In knockout tournaments with N players, total matches is always N - 1.'
  },
  6: {
    quantSubtopics: [
      'Logarithm laws, base change theorem & characteristics',
      'Surds & Indices rationalization techniques',
      'Linear & Quadratic inequalities (Wavy curve method)',
      'Modulus equations and absolute value inequalities'
    ],
    lrdiSubtopics: [
      '2-Set & 3-Set Venn Diagrams (Overlap & Union formulas)',
      '4-Set Venn Diagrams matrix representation',
      'Venn Diagram Maxima & Minima concepts',
      'Exact 1, Exact 2, and "At least" region equations'
    ],
    varcSubtopics: [
      'Diverse multidimensional RC passages (Cross-domain)',
      'Advanced 5-sentence Parajumbles (TITA format)',
      'Transition words spotting (However, Furthermore, Yet)',
      'Opening sentence criteria identification'
    ],
    targetWeeklyHours: '22-26 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'Always mark the zero-point critical values on number line for inequalities (Wavy Curve).'
  },
  7: {
    quantSubtopics: [
      'Arithmetic Progression (AP): nth term & sum formulas',
      'Geometric Progression (GP): Infinite sum & common ratio',
      'Special series (Sigma n, n^2, n^3 and telescoping series)',
      'Functions: Domain, Range, Composite functions & Inverses'
    ],
    lrdiSubtopics: [
      'Binary Logic: Truth tellers, Liars & Alternators',
      'Case assumption & contradiction matrix',
      'Cubes: Cutting painted cubes (Face, edge, corner cuts)',
      'Dice orientation & opposite face deduction'
    ],
    varcSubtopics: [
      'Complex inference passages with double-negative questions',
      'Main Idea options: Spotting "Too Narrow" vs "Too Broad"',
      'Advanced Para Summary with subtle logical shifts',
      'Paragraph tone evaluation under time pressure'
    ],
    targetWeeklyHours: '24-28 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'In Truth-Teller problems, pair contradictory statements — one must be true, one false.'
  },
  8: {
    quantSubtopics: [
      'Triangles: Similarity, Congruence, Area formulas (Herons, Sine)',
      'Centers of Triangle: Incenter, Circumcenter, Orthocenter, Centroid',
      'Circles: Tangent-secant theorem, Cyclic quadrilaterals, Chords',
      'Polygons: Interior/exterior angles & diagonals'
    ],
    lrdiSubtopics: [
      'Optimization in DI (Maximizing profits, minimizing costs)',
      'Network routes & directional flow capacity',
      'Critical path method & pipeline bottlenecks',
      'Visual diagramming for multi-stage transit'
    ],
    varcSubtopics: [
      'Speed reading diagnostic test (Goal: 250-300 WPM with 80% accuracy)',
      'Full Verbal Ability sectional drill (40 min, 24 questions)',
      'RC selection order: Skimming 30 seconds before committing',
      'Time budget: 8-9 min per passage maximum'
    ],
    targetWeeklyHours: '25-30 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'In Geometry, draw figures proportionally — geometric intuition solves 50% of questions.'
  },
  9: {
    quantSubtopics: [
      'Coordinate Geometry: Slope, Distance, Section formula',
      'Lines: Parallel/Perpendicular conditions, Intercept form',
      'Mensuration 2D: Parallelogram, Rhombus, Trapezium, Circles',
      'Mensuration 3D: Cylinders, Cones, Spheres, Frustum, Prisms'
    ],
    lrdiSubtopics: [
      'Quant-Based DI (Math formulation inside tables)',
      'Missing Data Tables with algebraic constraints',
      'Reasoning from minimum/maximum limits',
      'Formulating clean equations from narrative footnotes'
    ],
    varcSubtopics: [
      'High-difficulty abstract philosophy & literary criticism passages',
      'Dense syntactic structures and arcane vocabulary management',
      'Analyzing philosophical thesis vs antithesis arguments',
      'Maintaining calm focus when passage meaning seems elusive'
    ],
    targetWeeklyHours: '25-30 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'For 3D Mensuration, equate volumes when one solid is recast into another.'
  },
  10: {
    quantSubtopics: [
      'Divisibility rules (2 through 19, Composite rules)',
      'Factors, Number of factors, Sum of factors, Product of factors',
      'Remainders: Euler’s theorem, Fermat’s Little Theorem, Wilson’s',
      'Last digit, Last two digits & Highest power of prime in factorial'
    ],
    lrdiSubtopics: [
      'Advanced Tournaments: Group stages leading to knockouts',
      'Seeding anomalies, Upsets & Point-differential tables',
      'Complex multi-stage tournaments with wildcard entries',
      'Exhaustive scenario testing without missing corner cases'
    ],
    varcSubtopics: [
      'Author tone calibration (Sarcastic, Condescending, Laudatory, Neutral)',
      'Question Stem Trap spotting ("Except", "Cannot be inferred")',
      'Speed drill: 4 RCs in 32 minutes flat',
      'TITA Para Jumble pairing confidence building'
    ],
    targetWeeklyHours: '25-30 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'Euler’s Totient function simplifies 90% of remainder problems: a^phi(n) = 1 (mod n).'
  },
  11: {
    quantSubtopics: [
      'Fundamental principles of counting (Addition vs Multiplication)',
      'Permutations: Linear, Circular, Repetition cases',
      'Combinations: Selection, Grouping, Identical items distribution',
      'Derangements formula & Beggar’s method (Integer partitions)'
    ],
    lrdiSubtopics: [
      'Hybrid sets: Logic puzzles embedded inside DI charts',
      'Complex seating with conditional statements and lies',
      'Time management: The "3-Minute Abort Rule" on lethal sets',
      'Set difficulty classification (Easy -> Medium -> Skip)'
    ],
    varcSubtopics: [
      'Full VARC Sectional Test 1 (Simulated 40 minutes)',
      'Score & Accuracy review: Diagnostic error audit',
      'Analyzing why wrong option was chosen (Careless vs Conceptual)',
      'Pacing calibration: Question attempt strategy'
    ],
    targetWeeklyHours: '26-30 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'Derangement count for n=4 is 9; for n=5 is 44. Memorize these standard numbers.'
  },
  12: {
    quantSubtopics: [
      'Classical Probability definition, Sample space formulation',
      'Independent events, Conditional probability, Bayes theorem',
      'Geometric probability & Dice/Cards standard problems',
      'Set Theory algebra & Symmetric difference applications'
    ],
    lrdiSubtopics: [
      'Missing data matrices with multiple possibilities',
      'Route planning, shortest paths & graph theory puzzles',
      'Full LRDI Sectional Test 1 (Simulated 40 minutes)',
      'Set selection precision: Choosing the right 2-3 sets out of 4'
    ],
    varcSubtopics: [
      'Full VARC Sectional Test 2 (Simulated 40 minutes)',
      'Fine-tuning Parajumble and Summary 100% accuracy',
      'Eliminating confirmation bias during passage re-reading',
      'Finalizing passage selection strategy for mock phase'
    ],
    targetWeeklyHours: '26-30 hrs',
    drillTargets: '125 Quant Qs • 25 LRDI Sets • 25 RCs',
    strategyTip: 'P(At least 1) = 1 - P(None). Use complement rule whenever you see "at least one".'
  },
  13: {
    quantSubtopics: [
      'Comprehensive Formula Revision: Arithmetic & Algebra',
      'Shortcut review: Unit digits, Alligations, Work fractions',
      'Targeted sectional drills (20 questions in 30 minutes)',
      'Mock Exam 1 to 7 review & weak question categorization'
    ],
    lrdiSubtopics: [
      'Mock Marathon Set Selection: First 5-minute scan protocol',
      'Ranking all 4 sets by familiarity and data clarity',
      'Executing Set 1 & Set 2 with 100% accuracy focus',
      'Error log analysis for LRDI: Was it calculation or misreading?'
    ],
    varcSubtopics: [
      'Mock Marathon VARC: Passage skimming order lockdown',
      'Never spending more than 2.5 minutes on a single question',
      'Confidence calibration on 50/50 option dilemmas',
      'Full Sectional & Mock error audit'
    ],
    targetWeeklyHours: '28-32 hrs',
    drillTargets: '7 Full Mocks • Error Log Audit • Formula Revision',
    strategyTip: 'In Mocks, attempt the easiest set first — early momentum lowers cortisol and sharpens focus.'
  },
  14: {
    quantSubtopics: [
      'Weak Area Targeted Drills based on Mock 1-15 Error Logs',
      'Geometry theorems revision sheet (Tangents, Chords, Solids)',
      'Eliminating silly calculation mistakes & unit mismatch errors',
      'Mock Exam 8 to 15 execution & in-depth 3-hour analysis per mock'
    ],
    lrdiSubtopics: [
      'Time Allocation protocol: 10-12 minutes per set maximum',
      'Enforcing strict stop-loss: If 6 minutes pass without progress, ABORT',
      'Practicing tough non-standard CAT puzzles under clock pressure',
      'Mastering incomplete answer deduction (answering 3 out of 5 Qs)'
    ],
    varcSubtopics: [
      'Speed & TITA accuracy optimization',
      'Eliminating over-thinking on non-fiction passages',
      'Zero-negative strategy: Being selective on tricky inference Qs',
      'Maintaining reading energy for the 4th passage'
    ],
    targetWeeklyHours: '28-32 hrs',
    drillTargets: '8 Full Mocks • Intensive Error Log Drilling',
    strategyTip: 'Analyze mocks for twice the duration of the test: 2 hours writing, 4 hours dissecting.'
  },
  15: {
    quantSubtopics: [
      'High-Yield Concepts Revision: Top 50 recurring CAT patterns',
      'Mental math & estimation techniques for Options Elimination',
      'Algebra maxima/minima & AM-GM inequality quick review',
      'Mock Exam 16 to 23 execution & percentile stabilization'
    ],
    lrdiSubtopics: [
      'Stress management under unfamiliar or abstract set layouts',
      'Translating messy problem text into compact visual shorthand',
      'Locking in the 2-set clear target for 95+ percentile in DILR',
      'Refining answer sanity-checks before submitting'
    ],
    varcSubtopics: [
      'Strategy Refinement: Locking in personal test-taking flow',
      'Standardizing time split (e.g. 28 min RCs + 12 min VA)',
      'Mental focus resets between passages',
      'Maintaining 85%+ accuracy across all passages attempted'
    ],
    targetWeeklyHours: '26-30 hrs',
    drillTargets: '8 Full Mocks • High-Yield Revision',
    strategyTip: 'Substitution of options or small values (n=1, 2) breaks open 3-4 Quant questions instantly.'
  },
  16: {
    quantSubtopics: [
      'Formula Flashcards light review — No heavy new problems',
      'Arithmetic & Geometry mental walkthroughs',
      'Re-checking personal cheat-sheet of past silly errors',
      'Final 7 Mocks completion (Focus on confidence and rhythm)'
    ],
    lrdiSubtopics: [
      'Light puzzle solving for brain warmup (Sudoku / classic puzzles)',
      'Relaxed attitude conditioning — avoiding panic or burn-out',
      'Finalizing set-ranking mental checklist',
      'Visualizing optimal exam day decision making'
    ],
    varcSubtopics: [
      'Reading light editorial articles (Aeon / The Economist / Guardian)',
      'Reviewing past high-scoring mocks to reinforce confidence',
      'Strategy lockdown — zero radical changes in final week',
      'Physical rest, sleep cycle alignment & calm mindset'
    ],
    targetWeeklyHours: '16-20 hrs (Tapering)',
    drillTargets: '7 Mocks • Flashcards • Mental Peak Conditioning',
    strategyTip: 'Trust the 16 weeks of sweat and discipline. You have earned your seat. Go claim it!'
  }
};
