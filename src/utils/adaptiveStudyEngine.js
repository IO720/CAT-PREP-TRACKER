/**
 * Adaptive Study Progress & Quota Recovery Engine
 * Calculates pacing, syllabus deficits, and generates adaptive recovery solutions
 * (Schedule Shift, 7-Day Catch-Up Blitz, Weekend Sprint, Pareto 80/20 Triage).
 */

import { WEEKLY_SYLLABUS_DETAILS } from '../data/catSyllabusRoadmap';

// Default target quotas per standard week if not specified
export const DEFAULT_WEEKLY_TARGETS = {
  quant: 125,
  lrdi: 25,
  varc: 25,
  studyHours: 20
};

// High-Yield Core Topics for Pareto 80/20 Triage across CAT syllabus
export const HIGH_YIELD_TOPIC_FOCUS = {
  1: {
    quant: ['Percentage-to-fraction conversions (1/1 to 1/20)', 'Profit, Loss, Discount & Margin calculations'],
    lrdi: ['Linear arrangements (Single row, Facing North/South)', 'Circular arrangements'],
    varc: ['Structural reading: Main idea vs Supporting evidence', 'Intro to 4-sentence Parajumbles (Mandatory pairs)'],
    minQuantTarget: 50,
    minLrdiTarget: 10,
    minVarcTarget: 10,
    rationale: 'Arithmetic percentages & linear puzzles constitute over 40% of CAT QA & DILR foundations.'
  },
  2: {
    quant: ['Ratios, proportions & properties of equal ratios', 'Weighted averages & visual balancing method'],
    lrdi: ['Matrix grid matching (3 to 4 variable matching)', 'Elimination grids'],
    varc: ['Macro trends & author perspective identification', 'Para Summary: Spotting extreme options'],
    minQuantTarget: 50,
    minLrdiTarget: 10,
    minVarcTarget: 10,
    rationale: 'Ratios and matrix grids are non-negotiable for 90th percentile DILR and QA.'
  },
  3: {
    quant: ['Average speed & inverse proportionality', 'Relative speed & Trains'],
    lrdi: ['Tabular Data Interpretation calculation shortcuts', 'Bar charts comparison sets'],
    varc: ['Philosophy/Psychology dense passage tracking', 'Tone inference decoding'],
    minQuantTarget: 50,
    minLrdiTarget: 10,
    minVarcTarget: 10,
    rationale: 'TSD and standard DI tables are core scoring areas in CAT.'
  },
  4: {
    quant: ['Time & Work unitary method', 'Pipes & Cisterns alternate work'],
    lrdi: ['Pie Charts visual estimation', 'Caselets calculation setups'],
    varc: ['History & Sociology arguments', 'Critical Reasoning assumptions'],
    minQuantTarget: 50,
    minLrdiTarget: 10,
    minVarcTarget: 10,
    rationale: 'Time & Work is a guaranteed 2-3 question topic in CAT Quant.'
  }
};

/**
 * Parses target weekly study hours from strings like "20-22 hrs"
 */
export const parseTargetHours = (hoursStr) => {
  if (typeof hoursStr === 'number') return hoursStr;
  if (!hoursStr) return DEFAULT_WEEKLY_TARGETS.studyHours;
  const match = String(hoursStr).match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!match) return DEFAULT_WEEKLY_TARGETS.studyHours;
  if (match[2]) {
    return Math.round((parseInt(match[1], 10) + parseInt(match[2], 10)) / 2);
  }
  return parseInt(match[1], 10) || DEFAULT_WEEKLY_TARGETS.studyHours;
};

/**
 * Calculates granular weekly progress, deficits, and pacing status
 * @param {Object} state - Application state with tracker and studyPlan
 * @param {string} monthKey - "Month 1", "Month 2", etc.
 * @param {string} weekKey - "Week 1", "Week 2", etc.
 * @param {number} globalWeekIdx - 1 to 16
 */
export const calculateWeekProgress = (state, monthKey, weekKey, globalWeekIdx = 1) => {
  const monthWeeks = state?.tracker?.[monthKey] || [];
  const weekData = monthWeeks.find(w => w.week === weekKey) || monthWeeks[0] || { days: [] };
  const days = weekData.days || [];

  // Drill counts completed this week
  let quantSolved = 0;
  let lrdiSolved = 0;
  let varcSolved = 0;
  let customSolved = 0;
  let studyHoursLogged = 0;
  let quantCompletedDays = 0;
  let lrdiCompletedDays = 0;
  let varcCompletedDays = 0;

  days.forEach(day => {
    quantSolved += Number(day.quantCount) || 0;
    lrdiSolved += Number(day.lrdiCount) || 0;
    varcSolved += Number(day.varcCount) || 0;
    customSolved += Number(day.customCount) || 0;
    studyHoursLogged += Number(day.studyHours) || 0;

    if (day.quantCompleted) quantCompletedDays++;
    if (day.lrdiCompleted) lrdiCompletedDays++;
    if (day.varcCompleted) varcCompletedDays++;
  });

  // Fetch syllabus targets
  const syllabusDetail = WEEKLY_SYLLABUS_DETAILS[globalWeekIdx] || {};
  const targetQuant = DEFAULT_WEEKLY_TARGETS.quant;
  const targetLrdi = DEFAULT_WEEKLY_TARGETS.lrdi;
  const targetVarc = DEFAULT_WEEKLY_TARGETS.varc;
  const targetHours = parseTargetHours(syllabusDetail.targetWeeklyHours);

  // Subtopics audit
  const allSubtopics = [
    ...(syllabusDetail.quantSubtopics || []),
    ...(syllabusDetail.lrdiSubtopics || []),
    ...(syllabusDetail.varcSubtopics || [])
  ];

  const planItem = (state?.studyPlan || [])[globalWeekIdx - 1] || {};
  const completedSubtopics = planItem.completedSubtopics || [];
  const totalSubtopicsCount = allSubtopics.length || 12;
  const completedSubtopicsCount = completedSubtopics.length;
  const subtopicProgressPct = totalSubtopicsCount > 0 
    ? Math.min(100, Math.round((completedSubtopicsCount / totalSubtopicsCount) * 100))
    : 0;

  // Deficits (clamped to 0 minimum)
  const deficitQuant = Math.max(0, targetQuant - quantSolved);
  const deficitLrdi = Math.max(0, targetLrdi - lrdiSolved);
  const deficitVarc = Math.max(0, targetVarc - varcSolved);
  const deficitHours = Math.max(0, targetHours - studyHoursLogged);

  // Percentages per section
  const quantPct = Math.min(100, Math.round((quantSolved / targetQuant) * 100));
  const lrdiPct = Math.min(100, Math.round((lrdiSolved / targetLrdi) * 100));
  const varcPct = Math.min(100, Math.round((varcSolved / targetVarc) * 100));
  const hoursPct = Math.min(100, Math.round((studyHoursLogged / targetHours) * 100));

  // Calculate days elapsed from start date
  const startDateStr = state?.settings?.startDate;
  let daysElapsed = 0;
  if (startDateStr) {
    try {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      daysElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    } catch (_e) {
      daysElapsed = 0;
    }
  }

  // A week has only ELAPSED if real calendar days elapsed has passed its 7-day window:
  // Week 1 has elapsed if daysElapsed >= 7.
  // Week 2 has elapsed if daysElapsed >= 14, etc.
  const isElapsed = daysElapsed >= (globalWeekIdx * 7);
  const isCurrentActiveWeek = !isElapsed && (daysElapsed >= (globalWeekIdx - 1) * 7);

  // Overall combined weighted completion: 70% drill questions + 30% subtopics
  const totalTargetDrills = targetQuant + targetLrdi + targetVarc;
  const totalSolvedDrills = quantSolved + lrdiSolved + varcSolved;
  const drillProgressPct = Math.min(100, Math.round((totalSolvedDrills / totalTargetDrills) * 100));

  const overallProgressPct = Math.round(
    drillProgressPct * 0.7 + (totalSubtopicsCount > 0 ? subtopicProgressPct * 0.3 : drillProgressPct * 0.3)
  );

  // Status classification
  let pacingStatus = 'IN_PROGRESS';
  let statusBadge = 'In Progress';
  let badgeColor = '#38bdf8'; // sky blue

  const isExplicitlyCompleted = planItem.status === 'Completed';

  if (isExplicitlyCompleted || overallProgressPct >= 90) {
    pacingStatus = 'COMPLETED';
    statusBadge = 'Completed';
    badgeColor = '#10b981'; // emerald green
  } else if (!isElapsed) {
    // Current or future week (NOT elapsed yet - never an overdue backlog or critical deficit!)
    if (overallProgressPct >= 70) {
      pacingStatus = 'ON_TRACK';
      statusBadge = 'On Track';
      badgeColor = '#38bdf8';
    } else if (totalSolvedDrills > 0 || completedSubtopicsCount > 0) {
      pacingStatus = 'IN_PROGRESS';
      statusBadge = 'In Progress';
      badgeColor = '#38bdf8';
    } else {
      pacingStatus = 'IN_PROGRESS';
      statusBadge = globalWeekIdx === 1 ? 'Day 1 (Ready)' : 'Upcoming';
      badgeColor = '#94a3b8';
    }
  } else {
    // Week HAS elapsed in real calendar time, but was left incomplete
    if (overallProgressPct >= 70) {
      pacingStatus = 'ON_TRACK';
      statusBadge = 'On Track';
      badgeColor = '#38bdf8';
    } else if (overallProgressPct >= 40) {
      pacingStatus = 'MODERATE_DEFICIT';
      statusBadge = 'Moderate Deficit';
      badgeColor = '#f59e0b'; // amber
    } else {
      pacingStatus = 'CRITICAL_DEFICIT';
      statusBadge = 'Critical Deficit';
      badgeColor = '#ef4444'; // red
    }
  }

  // Determine smart recommendation
  let recommendedPlan = 'stay_on_week';
  let recommendationReason = '';

  if (!isElapsed || (deficitQuant + deficitLrdi + deficitVarc) === 0) {
    // Active current week or zero deficit - stay on track with regular daily syllabus drills
    recommendedPlan = 'stay_on_week';
    recommendationReason = globalWeekIdx === 1 && daysElapsed < 7
      ? 'You are on Week 1 of your preparation. Solve your daily drill quotas across Monday to Sunday to build foundation mastery.'
      : `You are currently in Week ${globalWeekIdx} with no overdue deficit. Focus on your daily targets to stay on track.`;
  } else if (overallProgressPct === 0 && globalWeekIdx > 1) {
    recommendedPlan = 'reset_start_date';
    recommendationReason = 'You haven’t started initial exercises yet. Re-anchoring your start date to Today gives you a fresh Day 1 start with zero deficit.';
  } else if (overallProgressPct >= 75) {
    recommendedPlan = 'mark_complete';
    recommendationReason = 'You have mastered over 75% of this week. Clear to advance!';
  } else if (overallProgressPct < 40) {
    recommendedPlan = 'schedule_shift';
    recommendationReason = 'Heavy conceptual backlog (<40% complete). Extending this topic by 1 week guarantees foundation mastery before moving on.';
  } else if (studyHoursLogged < (targetHours * 0.5)) {
    recommendedPlan = 'weekend_sprint';
    recommendationReason = 'Weekday hours were limited. Two focused weekend deep work blocks will bring you right back on track.';
  } else if (deficitQuant > 25 || deficitLrdi > 5) {
    recommendedPlan = 'catch_up_blitz';
    recommendationReason = 'A manageable drill deficit. Spreading +N extra questions daily over the next 7 days will clear the backlog without schedule delay.';
  } else {
    recommendedPlan = 'pareto_triage';
    recommendationReason = 'Focus strictly on high-yield core concepts to protect your target mock test date.';
  }

  return {
    monthKey,
    weekKey,
    globalWeekIdx,
    isElapsed,
    isCurrentActiveWeek,
    daysElapsed,
    targetQuant,
    targetLrdi,
    targetVarc,
    targetHours,
    quantSolved,
    lrdiSolved,
    varcSolved,
    customSolved,
    studyHoursLogged,
    quantCompletedDays,
    lrdiCompletedDays,
    varcCompletedDays,
    deficitQuant,
    deficitLrdi,
    deficitVarc,
    deficitHours,
    quantPct,
    lrdiPct,
    varcPct,
    hoursPct,
    drillProgressPct,
    subtopicProgressPct,
    overallProgressPct,
    completedSubtopicsCount,
    totalSubtopicsCount,
    allSubtopics,
    completedSubtopics,
    pacingStatus,
    statusBadge,
    badgeColor,
    isExplicitlyCompleted,
    recommendedPlan,
    recommendationReason,
    syllabusDetail,
    planItem,
    isExtended: Boolean(planItem.isExtended)
  };
};

/**
 * Generates exact numbers and configs for all recovery solutions
 */
export const generateRecoveryOptions = (progressData) => {
  const { deficitQuant, deficitLrdi, deficitVarc, globalWeekIdx, syllabusDetail } = progressData;

  // 1. Catch-Up Blitz (7-day micro distribution)
  const dailyExtraQuant = Math.ceil(deficitQuant / 7);
  const dailyExtraLrdi = Math.ceil(deficitLrdi / 7);
  const dailyExtraVarc = Math.ceil(deficitVarc / 7);

  // 2. Weekend Recovery Sprint (concentrated Saturday & Sunday)
  const satQuant = Math.ceil(deficitQuant * 0.5);
  const sunQuant = Math.floor(deficitQuant * 0.5);
  const satLrdi = Math.ceil(deficitLrdi * 0.5);
  const sunLrdi = Math.floor(deficitLrdi * 0.5);
  const satVarc = Math.ceil(deficitVarc * 0.5);
  const sunVarc = Math.floor(deficitVarc * 0.5);

  // 3. Pareto 80/20 Core Triage
  const highYieldData = HIGH_YIELD_TOPIC_FOCUS[globalWeekIdx] || {
    quant: (syllabusDetail?.quantSubtopics || []).slice(0, 2),
    lrdi: (syllabusDetail?.lrdiSubtopics || []).slice(0, 2),
    varc: (syllabusDetail?.varcSubtopics || []).slice(0, 2),
    minQuantTarget: 50,
    minLrdiTarget: 10,
    minVarcTarget: 10,
    rationale: 'Focus on high-weightage foundation concepts first.'
  };

  return {
    resetStartDate: {
      id: 'reset_start_date',
      title: 'Reset Start Date to Today (Fresh Start)',
      badge: 'FRESH START',
      tagline: 'Re-anchor your 16-week prep timeline to today. Zero out backlog and start from Day 1.',
      description: 'Perfect if you haven’t done initial exercises yet. Updates your start date so today becomes Day 1 of Month 1: Week 1 with no missed days or overdue drills.'
    },
    redirectWeek1: {
      id: 'redirect_week1',
      title: 'Start From Week 1 (Initial Foundation)',
      badge: 'FOUNDATION START',
      tagline: 'Redirect directly to Month 1: Week 1 initial exercises to start your prep properly.',
      description: 'Takes you back to the very first foundation week so you can complete the initial theory concepts and fundamental drills.'
    },
    catchUpBlitz: {
      id: 'catch_up_blitz',
      title: '7-Day Catch-Up Micro-Blitz',
      badge: 'PARALLEL RECOVERY',
      tagline: 'Advance to next topic while clearing deficit with bite-sized daily targets.',
      dailyExtraQuant,
      dailyExtraLrdi,
      dailyExtraVarc,
      totalExtraDays: 7,
      description: `Adds +${dailyExtraQuant} QA, +${dailyExtraLrdi} DILR, +${dailyExtraVarc} VARC per day across the next 7 days.`
    },
    scheduleShift: {
      id: 'schedule_shift',
      title: 'Linear Schedule Shift (+1 Buffer Week)',
      badge: 'TOPIC EXTENSION',
      tagline: 'Extend this topic by 1 week and shift all future syllabus weeks forward.',
      shiftWeeks: 1,
      description: 'Freezes progression and grants a dedicated 7-day buffer to master these concepts fully before moving to advanced topics.'
    },
    weekendSprint: {
      id: 'weekend_sprint',
      title: 'Weekend Recovery Sprint',
      badge: 'DEEP WORK',
      tagline: 'Keep weekdays manageable and clear the entire deficit in 2 focused weekend blocks.',
      satTargets: { quant: satQuant, lrdi: satLrdi, varc: satVarc },
      sunTargets: { quant: sunQuant, lrdi: sunLrdi, varc: sunVarc },
      description: `Saturday: +${satQuant} QA, +${satLrdi} DILR • Sunday: +${sunQuant} QA, +${sunLrdi} DILR.`
    },
    paretoTriage: {
      id: 'pareto_triage',
      title: 'Pareto 80/20 Core Mastery Triage',
      badge: 'HIGH-YIELD FILTER',
      tagline: 'Master the non-negotiable core concepts and shelve edge topics for final revision.',
      highYieldData,
      description: `Target ${highYieldData.minQuantTarget} core questions on ${highYieldData.quant[0] || 'essential topics'}.`
    },
    markComplete: {
      id: 'mark_complete',
      title: 'Mark Completed (Offline / Self-Study)',
      badge: 'CONFIRMATION',
      tagline: 'Confirm you covered these concepts through offline coaching or self-study.',
      description: 'Marks this week complete in your study blueprint and unlocks the next topic with zero backlog penalty.'
    },
    stayOnWeek: {
      id: 'stay_on_week',
      title: 'Continue Current Week Drills (On Track)',
      badge: 'ON TRACK',
      tagline: 'Maintain your steady study pace through your active week.',
      description: 'Conquer your standard daily drill targets across Monday to Sunday to build consistent momentum with zero overdue backlog.'
    },
    stay_on_week: {
      id: 'stay_on_week',
      title: 'Continue Current Week Drills (On Track)',
      badge: 'ON TRACK',
      tagline: 'Maintain your steady study pace through your active week.',
      description: 'Conquer your standard daily drill targets across Monday to Sunday to build consistent momentum with zero overdue backlog.'
    }
  };
};

/**
 * Applies a 7-Day Catch-Up Blitz to a target week
 * Injects catch-up micro-targets into each day of the target week in state.tracker
 */
export const applyCatchUpBlitzToState = (state, targetMonth, targetWeek, blitzConfig) => {
  const { dailyExtraQuant = 0, dailyExtraLrdi = 0, dailyExtraVarc = 0 } = blitzConfig;

  const updatedTracker = { ...(state.tracker || {}) };
  const monthWeeks = updatedTracker[targetMonth] || [];

  updatedTracker[targetMonth] = monthWeeks.map(week => {
    if (week.week === targetWeek) {
      const updatedDays = (week.days || []).map(day => {
        const baseQuant = 18;
        const baseLrdi = 4;
        const baseVarc = 4;
        const totalQuant = baseQuant + dailyExtraQuant;
        const totalLrdi = baseLrdi + dailyExtraLrdi;
        const totalVarc = baseVarc + dailyExtraVarc;

        const hasLegacyCatchUpCustom = day.customTitle === 'Catch-Up Micro Target' ||
          day.customTitle === 'Saturday Recovery Sprint' ||
          day.customTitle === 'Sunday Recovery Sprint';

        return {
          ...day,
          catchUpActive: true,
          catchUpQuant: dailyExtraQuant,
          catchUpLrdi: dailyExtraLrdi,
          catchUpVarc: dailyExtraVarc,
          customBadge: 'CATCH-UP',
          quantTarget: dailyExtraQuant > 0 ? `Solve ${totalQuant} Quant Questions (${baseQuant} Base + ${dailyExtraQuant} Backlog Boost)` : (day.quantTarget || `Solve ${baseQuant} Quant Questions`),
          lrdiTarget: dailyExtraLrdi > 0 ? `Solve ${totalLrdi} LRDI Sets (${baseLrdi} Base + ${dailyExtraLrdi} Backlog Boost)` : (day.lrdiTarget || `Solve ${baseLrdi} LRDI Sets`),
          varcTarget: dailyExtraVarc > 0 ? `Solve ${totalVarc} Reading Comprehensions (${baseVarc} Base + ${dailyExtraVarc} Backlog Boost)` : (day.varcTarget || `Solve ${baseVarc} Reading Comprehensions`),
          hasCustomObjective: hasLegacyCatchUpCustom ? false : Boolean(day.hasCustomObjective),
          customTitle: hasLegacyCatchUpCustom ? '' : (day.customTitle || ''),
          customTarget: hasLegacyCatchUpCustom ? '' : (day.customTarget || '')
        };
      });
      return { ...week, days: updatedDays, catchUpActive: true };
    }
    return week;
  });

  return {
    ...state,
    tracker: updatedTracker,
    activeCatchUp: {
      targetMonth,
      targetWeek,
      dailyExtraQuant,
      dailyExtraLrdi,
      dailyExtraVarc,
      appliedAt: Date.now()
    },
    lastUpdated: Date.now()
  };
};

/**
 * Applies a Weekend Sprint to a target week
 * Injects weekend deep work targets into Saturday and Sunday
 */
export const applyWeekendSprintToState = (state, targetMonth, targetWeek, sprintConfig) => {
  const { satTargets = {}, sunTargets = {} } = sprintConfig;

  const updatedTracker = { ...(state.tracker || {}) };
  const monthWeeks = updatedTracker[targetMonth] || [];

  updatedTracker[targetMonth] = monthWeeks.map(week => {
    if (week.week === targetWeek) {
      const updatedDays = (week.days || []).map(day => {
        const baseQuant = 18;
        const baseLrdi = 4;
        const baseVarc = 4;
        const hasLegacyCatchUpCustom = day.customTitle === 'Catch-Up Micro Target' ||
          day.customTitle === 'Saturday Recovery Sprint' ||
          day.customTitle === 'Sunday Recovery Sprint';

        if (day.day === 'Saturday') {
          const extraQuant = satTargets.quant || 0;
          const extraLrdi = satTargets.lrdi || 0;
          const extraVarc = satTargets.varc || 0;
          return {
            ...day,
            catchUpActive: true,
            catchUpQuant: extraQuant,
            catchUpLrdi: extraLrdi,
            catchUpVarc: extraVarc,
            customBadge: 'SPRINT',
            quantTarget: extraQuant > 0 ? `Solve ${baseQuant + extraQuant} Quant Questions (${baseQuant} Base + ${extraQuant} Sprint Boost)` : day.quantTarget,
            lrdiTarget: extraLrdi > 0 ? `Solve ${baseLrdi + extraLrdi} LRDI Sets (${baseLrdi} Base + ${extraLrdi} Sprint Boost)` : day.lrdiTarget,
            varcTarget: extraVarc > 0 ? `Solve ${baseVarc + extraVarc} Reading Comprehensions (${baseVarc} Base + ${extraVarc} Sprint Boost)` : day.varcTarget,
            hasCustomObjective: hasLegacyCatchUpCustom ? false : Boolean(day.hasCustomObjective),
            customTitle: hasLegacyCatchUpCustom ? '' : (day.customTitle || ''),
            customTarget: hasLegacyCatchUpCustom ? '' : (day.customTarget || '')
          };
        }
        if (day.day === 'Sunday') {
          const extraQuant = sunTargets.quant || 0;
          const extraLrdi = sunTargets.lrdi || 0;
          const extraVarc = sunTargets.varc || 0;
          return {
            ...day,
            catchUpActive: true,
            catchUpQuant: extraQuant,
            catchUpLrdi: extraLrdi,
            catchUpVarc: extraVarc,
            customBadge: 'SPRINT',
            quantTarget: extraQuant > 0 ? `Solve ${baseQuant + extraQuant} Quant Questions (${baseQuant} Base + ${extraQuant} Sprint Boost)` : day.quantTarget,
            lrdiTarget: extraLrdi > 0 ? `Solve ${baseLrdi + extraLrdi} LRDI Sets (${baseLrdi} Base + ${extraLrdi} Sprint Boost)` : day.lrdiTarget,
            varcTarget: extraVarc > 0 ? `Solve ${baseVarc + extraVarc} Reading Comprehensions (${baseVarc} Base + ${extraVarc} Sprint Boost)` : day.varcTarget,
            hasCustomObjective: hasLegacyCatchUpCustom ? false : Boolean(day.hasCustomObjective),
            customTitle: hasLegacyCatchUpCustom ? '' : (day.customTitle || ''),
            customTarget: hasLegacyCatchUpCustom ? '' : (day.customTarget || '')
          };
        }
        return {
          ...day,
          hasCustomObjective: hasLegacyCatchUpCustom ? false : Boolean(day.hasCustomObjective),
          customTitle: hasLegacyCatchUpCustom ? '' : (day.customTitle || ''),
          customTarget: hasLegacyCatchUpCustom ? '' : (day.customTarget || '')
        };
      });
      return { ...week, days: updatedDays, weekendSprintActive: true };
    }
    return week;
  });

  return {
    ...state,
    tracker: updatedTracker,
    activeWeekendSprint: {
      targetMonth,
      targetWeek,
      satTargets,
      sunTargets,
      appliedAt: Date.now()
    },
    lastUpdated: Date.now()
  };
};

/**
 * Applies a Linear Schedule Shift (+1 Buffer Week)
 * Inserts a buffer week right after the current week in state.studyPlan and creates an extended tracker week
 */
export const applyScheduleShiftToState = (state, monthKey, weekKey, globalWeekIdx) => {
  const currentPlan = [...(state.studyPlan || [])];
  const targetIdx = Math.max(0, globalWeekIdx - 1);
  const currentItem = currentPlan[targetIdx] || {};

  // Sanitize base week title to prevent stacking "(Extended Buffer) (Extended Buffer)"
  const basePlanWeek = (currentItem.week || '').replace(/\s*\((?:Extended|Extended Buffer)\)/gi, '').trim() || `Week ${globalWeekIdx}`;
  const baseMonthWeek = (weekKey || '').replace(/\s*\((?:Extended|Extended Buffer)\)/gi, '').trim() || `Week ${globalWeekIdx}`;

  // Check if an extended buffer already exists immediately following this week to avoid duplicate insertion
  const nextItem = currentPlan[targetIdx + 1];
  const alreadyHasBuffer = nextItem && (nextItem.isExtended || String(nextItem.week).includes('Extended Buffer'));

  // Create extended week item
  const extendedItem = {
    ...currentItem,
    week: `${basePlanWeek} (Extended Buffer)`,
    status: 'In Progress',
    isExtended: true,
    originalWeek: basePlanWeek,
    extendedAt: Date.now()
  };

  if (!alreadyHasBuffer) {
    // Insert buffer week into studyPlan right after current week
    currentPlan.splice(targetIdx + 1, 0, extendedItem);
  } else {
    currentPlan[targetIdx + 1] = extendedItem;
  }

  // Update existing week status
  currentPlan[targetIdx] = {
    ...currentItem,
    week: basePlanWeek,
    status: 'Extended',
    hasExtendedBuffer: true
  };

  // Duplicate the week in tracker with clean days
  const updatedTracker = { ...(state.tracker || {}) };
  const monthWeeks = updatedTracker[monthKey] || [];
  const weekIdxInMonth = monthWeeks.findIndex(w => w.week === weekKey || w.week === baseMonthWeek);

  if (weekIdxInMonth !== -1) {
    const nextWeekInTracker = monthWeeks[weekIdxInMonth + 1];
    const trackerAlreadyHasBuffer = nextWeekInTracker && (nextWeekInTracker.isExtended || String(nextWeekInTracker.week).includes('Extended'));

    const freshDays = [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ].map(dayName => ({
      day: dayName,
      quantTarget: "Solve 18 Quant Questions (Buffer Mastery)",
      lrdiTarget: "Solve 4 LRDI Sets",
      varcTarget: "Solve 4 Reading Comprehensions",
      quantCompleted: false,
      lrdiCompleted: false,
      varcCompleted: false,
      customCompleted: false,
      quantCount: 0,
      lrdiCount: 0,
      varcCount: 0,
      customCount: 0,
      notes: "Extended Buffer Week - Focus on clearing topic bottlenecks",
      studyHours: 0,
      sessions: []
    }));

    const extendedWeekObj = {
      week: `${baseMonthWeek} (Extended)`,
      isExtended: true,
      days: freshDays
    };

    const newMonthWeeks = [...monthWeeks];
    if (!trackerAlreadyHasBuffer) {
      newMonthWeeks.splice(weekIdxInMonth + 1, 0, extendedWeekObj);
    } else {
      newMonthWeeks[weekIdxInMonth + 1] = extendedWeekObj;
    }
    updatedTracker[monthKey] = newMonthWeeks;
  }

  return {
    ...state,
    studyPlan: currentPlan,
    tracker: updatedTracker,
    lastUpdated: Date.now()
  };
};

/**
 * Calculates overall backlog across all elapsed syllabus weeks.
 * Identifies the primary bottleneck topic that must be conquered first before continuing.
 */
export const calculateOverallBacklog = (state, currentGlobalWeek = 1) => {
  const tracker = state?.tracker || {};
  const startDateStr = state?.settings?.startDate;

  let daysElapsed = 0;
  if (startDateStr) {
    try {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      daysElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    } catch (_e) {
      daysElapsed = 0;
    }
  }

  // Number of full 7-day weeks that have actually elapsed in real calendar time:
  const fullyElapsedWeeks = Math.floor(daysElapsed / 7);

  // If user just started (daysElapsed < 7, i.e. fullyElapsedWeeks === 0),
  // they are on Week 1. They DO NOT have a backlog.
  if (fullyElapsedWeeks === 0) {
    return {
      hasBacklog: false,
      totalDeficitDrills: 0,
      totalDeficitHours: 0,
      backlogClearancePct: 100,
      backlogWeeks: [],
      primaryBottleneck: null,
      currentGlobalWeek: 1,
      isExtendedWeekActive: false,
      daysElapsed
    };
  }

  const backlogWeeks = [];
  let totalDeficitDrills = 0;
  let totalDeficitHours = 0;

  // ONLY scan PAST ELAPSED weeks! (strictly < currentGlobalWeek, up to fullyElapsedWeeks)
  const maxElapsedWeek = Math.min(fullyElapsedWeeks, Math.max(0, currentGlobalWeek - 1));

  for (let gWeek = 1; gWeek <= maxElapsedWeek; gWeek++) {
    const monthNum = Math.floor((gWeek - 1) / 4) + 1;
    const weekNum = ((gWeek - 1) % 4) + 1;
    const monthKey = `Month ${monthNum}`;
    const weekKey = `Week ${weekNum}`;

    const progress = calculateWeekProgress(state, monthKey, weekKey, gWeek);
    const deficitDrills = (progress.deficitQuant || 0) + (progress.deficitLrdi || 0) + (progress.deficitVarc || 0);
    const subtopicsIncomplete = (progress.totalSubtopicsCount || 0) - (progress.completedSubtopicsCount || 0);

    const isLagging = (deficitDrills > 15 || subtopicsIncomplete > 0) && !progress.isExplicitlyCompleted && progress.overallProgressPct < 75;

    if (isLagging) {
      totalDeficitDrills += deficitDrills;
      totalDeficitHours += (progress.deficitHours || 0);

      backlogWeeks.push({
        globalWeekIdx: gWeek,
        monthKey,
        weekKey,
        progress,
        deficitDrills,
        subtopicsIncomplete,
        syllabusDetails: WEEKLY_SYLLABUS_DETAILS[gWeek] || {}
      });
    }
  }

  const isExtendedWeekActive = Boolean(
    state?.studyPlan?.some(w => w.isExtended) || 
    Object.values(tracker).some(weeks => Array.isArray(weeks) && weeks.some(w => w.isExtended))
  );

  const hasBacklog = backlogWeeks.length > 0;
  const primaryBottleneck = backlogWeeks[0] || null;

  // Calculate percentage of backlog cleared
  const totalTargetDrills = (DEFAULT_WEEKLY_TARGETS.quant + DEFAULT_WEEKLY_TARGETS.lrdi + DEFAULT_WEEKLY_TARGETS.varc) * Math.max(1, backlogWeeks.length);
  const totalSolvedDrills = Math.max(0, totalTargetDrills - totalDeficitDrills);
  const backlogClearancePct = totalTargetDrills > 0 ? Math.min(100, Math.round((totalSolvedDrills / totalTargetDrills) * 100)) : 100;

  return {
    hasBacklog,
    totalDeficitDrills,
    totalDeficitHours,
    backlogClearancePct,
    backlogWeeks,
    primaryBottleneck,
    currentGlobalWeek: Math.max(1, currentGlobalWeek),
    isExtendedWeekActive,
    daysElapsed
  };
};

/**
 * Deduplicates and sanitizes tracker and study plan state
 * to remove multiple duplicate (Extended) weeks
 */
export const sanitizeTrackerState = (state) => {
  if (!state || !state.tracker) return state;
  const startDateStr = state?.settings?.startDate;
  let daysElapsed = 0;
  if (startDateStr) {
    try {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      daysElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    } catch (_e) {
      daysElapsed = 0;
    }
  }

  const isFreshAccount = daysElapsed < 7;
  const cleanedTracker = { ...state.tracker };
  let hasChanges = false;

  for (const [mKey, weeks] of Object.entries(cleanedTracker)) {
    if (Array.isArray(weeks)) {
      const seenWeeks = new Set();
      const dedupedWeeks = [];
      for (const w of weeks) {
        // If fresh account, discard any extended buffer weeks
        if (isFreshAccount && (w.isExtended || w.week?.includes('(Extended)'))) {
          hasChanges = true;
          continue;
        }
        if (!seenWeeks.has(w.week)) {
          seenWeeks.add(w.week);
          dedupedWeeks.push(w);
        } else {
          hasChanges = true;
        }
      }
      cleanedTracker[mKey] = dedupedWeeks;
    }
  }

  let cleanedStudyPlan = state.studyPlan;
  if (Array.isArray(state.studyPlan)) {
    const seenPlanWeeks = new Set();
    const dedupedPlan = [];
    for (const p of state.studyPlan) {
      // If fresh account, discard any extended buffer weeks
      if (isFreshAccount && (p.isExtended || p.week?.includes('(Extended Buffer)'))) {
        hasChanges = true;
        continue;
      }
      if (!seenPlanWeeks.has(p.week)) {
        seenPlanWeeks.add(p.week);
        dedupedPlan.push(p);
      } else {
        hasChanges = true;
      }
    }
    cleanedStudyPlan = dedupedPlan;
  }

  let nextActiveCatchUp = state.activeCatchUp;
  let nextActiveWeekendSprint = state.activeWeekendSprint;
  if (isFreshAccount && (state.activeCatchUp || state.activeWeekendSprint)) {
    nextActiveCatchUp = null;
    nextActiveWeekendSprint = null;
    hasChanges = true;
  }

  if (!hasChanges) return state;

  return {
    ...state,
    tracker: cleanedTracker,
    studyPlan: cleanedStudyPlan,
    activeCatchUp: nextActiveCatchUp,
    activeWeekendSprint: nextActiveWeekendSprint,
    lastUpdated: Date.now()
  };
};
