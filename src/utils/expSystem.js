/**
 * expSystem.js - Candidate Progression, EXP Curves, Daily Login Bonuses & Milestone Logic
 * Strictly adheres to Zero-Emoji Policy.
 */
import { getDateTrackerPosition } from './dateUtils';
// EXP required to REACH a specific level
export const getExpForLevel = (lvl) => {
  if (lvl <= 1) return 0;
  // Smooth progressive curve: Lvl 2 = 180, Lvl 3 = 380, Lvl 5 = 980, Lvl 10 = 3450, Lvl 20 = 12500
  return Math.round(50 * Math.pow(lvl, 1.84));
};

// Calculate level from total accumulated EXP
export const calculateLevelFromExp = (exp = 0) => {
  const safeExp = Math.max(0, Number(exp) || 0);
  let lvl = 1;
  while (getExpForLevel(lvl + 1) <= safeExp && lvl < 100) {
    lvl++;
  }
  return lvl;
};

// Detailed progress within current level
export const getExpProgress = (exp = 0) => {
  const safeExp = Math.max(0, Number(exp) || 0);
  const currentLevel = calculateLevelFromExp(safeExp);
  const currentLevelBaseExp = getExpForLevel(currentLevel);
  const nextLevelBaseExp = getExpForLevel(currentLevel + 1);
  const expIntoLevel = safeExp - currentLevelBaseExp;
  const expNeededForNext = Math.max(1, nextLevelBaseExp - currentLevelBaseExp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((expIntoLevel / expNeededForNext) * 100)));

  return {
    currentLevel,
    totalExp: safeExp,
    currentLevelBaseExp,
    nextLevelBaseExp,
    expIntoLevel,
    expNeededForNext,
    progressPercent,
    isMilestone: isMilestoneLevel(currentLevel),
    milestoneTitle: getMilestoneTitle(currentLevel)
  };
};

// Check if a level is a major 10-level milestone (10, 20, 30, 40...)
export const isMilestoneLevel = (lvl) => {
  const num = Number(lvl);
  return num > 0 && num % 10 === 0;
};

// Milestone Titles for prestige candidates
export const getMilestoneTitle = (lvl) => {
  const num = Number(lvl);
  if (num >= 50) return "Immortal Achiever";
  if (num >= 40) return "Transcendent Scholar";
  if (num >= 30) return "Mythic Sovereign";
  if (num >= 20) return "Grandmaster Operative";
  if (num >= 10) return "Elite Strategist";
  if (num >= 5) return "Rising Vanguard";
  return "Candidate Aspirant";
};

// Daily Login EXP calculation
export const calculateDailyLoginReward = (currentStreak = 0) => {
  const baseExp = 120;
  // Consecutive streak bonus: +20 EXP per day, capped at +180 bonus (7+ days)
  const streakBonus = Math.min(180, Math.max(0, currentStreak) * 20);
  const totalAward = baseExp + streakBonus;

  return {
    baseExp,
    streakBonus,
    totalAward,
    nextStreak: currentStreak + 1
  };
};

// Get perks & cosmetics unlocked at a specific level
export const getUnlockedRewardsForLevel = (targetLevel) => {
  const rewards = [];
  
  if (targetLevel === 3) {
    rewards.push({ type: 'frame', name: 'Electric Gyro Frame', tier: 'RARE' });
    rewards.push({ type: 'banner', name: 'Neo-Tokyo Cyber Rain Banner', tier: 'RARE' });
  } else if (targetLevel === 5) {
    rewards.push({ type: 'frame', name: 'Solar Corona Frame', tier: 'EPIC' });
    rewards.push({ type: 'title', name: 'Rising Vanguard Title', tier: 'EPIC' });
  } else if (targetLevel === 6) {
    rewards.push({ type: 'banner', name: 'Cosmic Nebula Banner', tier: 'EPIC' });
  } else if (targetLevel === 8) {
    rewards.push({ type: 'frame', name: 'Void Sorcery Frame', tier: 'EPIC' });
  } else  if (targetLevel === 10) {
    rewards.push({ type: 'milestone', name: 'Level 10 Milestone Badge', tier: 'LEGENDARY' });
    rewards.push({ type: 'title', name: 'Elite Strategist Title', tier: 'LEGENDARY' });
    rewards.push({ type: 'banner', name: 'Solar Plasma Corona Banner', tier: 'LEGENDARY' });
  } else if (targetLevel === 12) {
    rewards.push({ type: 'frame', name: 'Matrix Infiltrator Frame', tier: 'LEGENDARY' });
  } else if (targetLevel === 14) {
    rewards.push({ type: 'banner', name: 'Cyber Cat Sentinel Banner', tier: 'MYTHIC' });
  } else if (targetLevel === 15) {
    rewards.push({ type: 'frame', name: 'Imperial Laurel Frame', tier: 'LEGENDARY' });
  } else if (targetLevel === 18) {
    rewards.push({ type: 'banner', name: 'Imperial Gold Sovereign Banner', tier: 'LEGENDARY' });
  } else if (targetLevel === 20) {
    rewards.push({ type: 'milestone', name: 'Level 20 Milestone Badge', tier: 'MYTHIC' });
    rewards.push({ type: 'title', name: 'Grandmaster Operative Title', tier: 'MYTHIC' });
    rewards.push({ type: 'frame', name: 'Omni Dragon Frame', tier: 'MYTHIC' });
    rewards.push({ type: 'banner', name: 'Prismatic Hyperdrive Banner', tier: 'MYTHIC' });
  } else if (targetLevel % 10 === 0) {
    rewards.push({ type: 'milestone', name: `Level ${targetLevel} Milestone Badge`, tier: 'MYTHIC' });
    rewards.push({ type: 'title', name: `${getMilestoneTitle(targetLevel)} Title`, tier: 'MYTHIC' });
  }

  return rewards;
};

/**
 * Calculate EXP awarded when all daily objectives for the previous day are completed.
 * Guarantees fair evaluation based on actual completion status of QA, LRDI, VARC, and Custom objectives.
 */
export const calculatePreviousDayObjectiveExp = (tracker, startDateStr, targetDate = null) => {
  if (!tracker) return { allCompleted: false, reason: 'no_tracker' };

  try {
    const d = targetDate ? new Date(targetDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pos = getDateTrackerPosition(d, startDateStr);
    const dateISO = pos.dateISO;
    const activeMonth = pos.activeMonth;
    const activeWeek = pos.activeWeek;
    const dayName = pos.dayName;

    const monthData = tracker[activeMonth];
    const weekData = monthData?.find(w => w.week === activeWeek);
    const dayData = weekData?.days?.find(item => item.day === dayName);

    if (!dayData) {
      return { allCompleted: false, dateISO, dayName, activeMonth, activeWeek, reason: 'day_not_found' };
    }

    const quantDone = Boolean(dayData.quantCompleted);
    const lrdiDone = Boolean(dayData.lrdiCompleted);
    const varcDone = Boolean(dayData.varcCompleted);
    const customDone = dayData.hasCustomObjective ? Boolean(dayData.customCompleted) : true;

    const allCompleted = quantDone && lrdiDone && varcDone && customDone;

    if (!allCompleted) {
      return { 
        allCompleted: false, 
        dateISO, 
        dayName, 
        activeMonth, 
        activeWeek, 
        reason: 'objectives_incomplete',
        incompleteList: [
          !quantDone && 'Quant',
          !lrdiDone && 'DILR',
          !varcDone && 'VARC',
          dayData.hasCustomObjective && !customDone && 'Custom'
        ].filter(Boolean)
      };
    }

    // 100% Objectives Conquered: Base award + Problem volume bonus
    const baseExp = 300;
    const solvedCount = (Number(dayData.quantCount) || 0) + (Number(dayData.lrdiCount) || 0) + (Number(dayData.varcCount) || 0);
    const volumeBonus = Math.min(100, solvedCount * 5);
    const totalAward = baseExp + volumeBonus;

    return {
      allCompleted: true,
      dateISO,
      dayName,
      activeMonth,
      activeWeek,
      baseExp,
      volumeBonus,
      totalAward,
      solvedCount
    };
  } catch (err) {
    console.error("calculatePreviousDayObjectiveExp error:", err);
    return { allCompleted: false, reason: err.message };
  }
};

