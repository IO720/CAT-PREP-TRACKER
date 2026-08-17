// Badge and Perk Definitions and Unlocking Logic

export const BADGE_DEFINITIONS = [
  // Streak Badges
  {
    id: 'streak-3',
    category: 'streak',
    name: 'Focus Spark',
    perkTitle: '3-Day Consistency Perk',
    description: 'Maintained a 3-day active study streak',
    threshold: 3,
    metricType: 'streak',
    iconName: 'Flame',
    color: '#f97316'
  },
  {
    id: 'streak-7',
    category: 'streak',
    name: 'Weekly Warrior',
    perkTitle: '7-Day Grinder Perk',
    description: 'Completed a full 7-day study streak without missing a day',
    threshold: 7,
    metricType: 'streak',
    iconName: 'Zap',
    color: '#eab308'
  },
  {
    id: 'streak-14',
    category: 'streak',
    name: 'Iron Discipline',
    perkTitle: '14-Day Master Perk',
    description: '14 consecutive active study days',
    threshold: 14,
    metricType: 'streak',
    iconName: 'Shield',
    color: '#10b981'
  },
  {
    id: 'streak-30',
    category: 'streak',
    name: 'Unstoppable Momentum',
    perkTitle: '30-Day Elite Perk',
    description: '30 consecutive active days of focused preparation',
    threshold: 30,
    metricType: 'streak',
    iconName: 'Trophy',
    color: '#ec4899'
  },

  // Problem Solving Milestones
  {
    id: 'solved-50',
    category: 'solved',
    name: 'Problem Solver',
    perkTitle: '50 Questions Solved',
    description: 'Solved over 50 practice questions',
    threshold: 50,
    metricType: 'solvedQs',
    iconName: 'Target',
    color: '#3b82f6'
  },
  {
    id: 'solved-250',
    category: 'solved',
    name: 'Drill Commander',
    perkTitle: '250 Questions Solved',
    description: 'Crossed 250 drill questions solved across Quant and VARC',
    threshold: 250,
    metricType: 'solvedQs',
    iconName: 'Calculator',
    color: '#8b5cf6'
  },
  {
    id: 'solved-1000',
    category: 'solved',
    name: 'Quant Titan',
    perkTitle: '1,000 Questions Solved',
    description: 'Over 1,000 preparation questions completed',
    threshold: 1000,
    metricType: 'solvedQs',
    iconName: 'Sparkles',
    color: '#06b6d4'
  },

  // Mock Milestones
  {
    id: 'mock-1',
    category: 'mock',
    name: 'Mock Rookie',
    perkTitle: 'First Mock Test Done',
    description: 'Completed and analyzed your 1st full mock exam',
    threshold: 1,
    metricType: 'mocksCount',
    iconName: 'BookOpen',
    color: '#14b8a6'
  },
  {
    id: 'mock-5',
    category: 'mock',
    name: 'Exam Gladiator',
    perkTitle: '5 Full Mocks Taken',
    description: 'Completed 5 full-length mock tests',
    threshold: 5,
    metricType: 'mocksCount',
    iconName: 'Award',
    color: '#f59e0b'
  },
  {
    id: 'mock-10',
    category: 'mock',
    name: 'Percentile Hunter',
    perkTitle: '10 Mocks Mastered',
    description: 'Completed 10 full-length mock examinations',
    threshold: 10,
    metricType: 'mocksCount',
    iconName: 'Trophy',
    color: '#84cc16'
  }
];

/**
 * Calculates user badges with unlock status and progress
 */
export function calculateUserBadges(stats = {}) {
  const {
    streak = 0,
    solvedQs = 0,
    mocksCount = 0
  } = stats;

  return BADGE_DEFINITIONS.map(badge => {
    let currentValue = 0;
    if (badge.metricType === 'streak') currentValue = streak;
    else if (badge.metricType === 'solvedQs') currentValue = solvedQs;
    else if (badge.metricType === 'mocksCount') currentValue = mocksCount;

    const isUnlocked = currentValue >= badge.threshold;
    const progressPercent = Math.min(100, Math.round((currentValue / badge.threshold) * 100));

    return {
      ...badge,
      currentValue,
      isUnlocked,
      progressPercent
    };
  });
}

export const PRESTIGE_BADGE = {
  id: 'omni-grandmaster',
  name: 'Omni-Aspirant Grandmaster',
  perkTitle: 'Complete Preparation Mastery',
  description: 'Unlocked all 10 consistency, problem-solving, and mock test badges. Pure excellence!',
  iconName: 'Trophy',
  color: '#eab308',
  gradient: 'linear-gradient(135deg, #ffd700 0%, #ff8800 50%, #ec4899 100%)'
};
