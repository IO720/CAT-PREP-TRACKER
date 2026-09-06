// Study Behavior Profiling Engine
// Analyzes user study telemetry (weekday vs. weekend availability, velocity, regularity)
// to categorize students into research-backed archetypes and personalize recommendations.

export const ASPIRANT_ARCHETYPES = {
  STALLED_STARTER: {
    id: 'STALLED_STARTER',
    title: 'Stalled Starter (Delayed Onboarding)',
    badge: 'FRESH START',
    color: '#fbbf24',
    iconName: 'RotateCcw',
    defaultPlanId: 'reset_start_date'
  },
  WEEKEND_WARRIOR: {
    id: 'WEEKEND_WARRIOR',
    title: 'The Weekend Warrior (Busy Professional)',
    badge: 'DEEP WORK',
    color: '#f59e0b',
    iconName: 'Flame',
    defaultPlanId: 'weekend_sprint'
  },
  STEADY_PACER: {
    id: 'STEADY_PACER',
    title: 'The Steady Pacer (Daily Habit Grinder)',
    badge: 'MICRO-BLITZ',
    color: '#38bdf8',
    iconName: 'Zap',
    defaultPlanId: 'catch_up_blitz'
  },
  CONCEPT_BOTTLENECK: {
    id: 'CONCEPT_BOTTLENECK',
    title: 'Concept-Bottlenecked (Foundation Incomplete)',
    badge: 'BUFFER EXTENSION',
    color: '#c084fc',
    iconName: 'Clock',
    defaultPlanId: 'schedule_shift'
  },
  TIME_CRUNCHED: {
    id: 'TIME_CRUNCHED',
    title: 'Time-Crunched Exam Strategist',
    badge: 'HIGH-YIELD 80/20',
    color: '#10b981',
    iconName: 'Filter',
    defaultPlanId: 'pareto_triage'
  }
};

/**
 * Analyzes stored tracker data to extract temporal patterns, habit regularity, and capacity.
 *
 * @param {Object} state - Main application state containing tracker and studyPlan
 * @param {Object} currentWeekProgress - Active week calculated progress from adaptiveStudyEngine
 * @returns {Object} Comprehensive behavioral profile and tailored recommendation
 */
export const analyzeAspirantBehavior = (state, currentWeekProgress = null) => {
  const tracker = state?.tracker || {};
  let totalDrills = 0;
  let totalHours = 0;
  let activeDays = 0;
  let trackedDays = 0;

  let weekdayHours = 0;
  let weekdayDays = 0;
  let weekendHours = 0;
  let weekendDays = 0;

  // Only scan weeks that have elapsed up to current progress or contain active study data
  const elapsedWeeksLimit = Math.max(1, currentWeekProgress?.globalWeekIdx || 1);
  let globalWeekCounter = 0;

  for (const weeks of Object.values(tracker)) {
    if (Array.isArray(weeks)) {
      weeks.forEach(week => {
        globalWeekCounter++;
        const weekHasActivity = Array.isArray(week.days) && week.days.some(d => 
          (Number(d.quantCount) || 0) > 0 || 
          (Number(d.lrdiCount) || 0) > 0 || 
          (Number(d.varcCount) || 0) > 0 || 
          (Number(d.studyHours) || 0) > 0 || 
          d.quantCompleted || d.lrdiCompleted || d.varcCompleted
        );

        if (globalWeekCounter <= elapsedWeeksLimit || weekHasActivity) {
          if (Array.isArray(week.days)) {
            week.days.forEach(day => {
              trackedDays++;
              const dayDrills = 
                (Number(day.quantCount) || 0) + 
                (Number(day.lrdiCount) || 0) + 
                (Number(day.varcCount) || 0) + 
                (Number(day.customCount) || 0);
              
              const dayHours = Number(day.studyHours) || 0;
              totalDrills += dayDrills;
              totalHours += dayHours;

              const isDone = dayDrills > 0 || dayHours > 0 || day.quantCompleted || day.lrdiCompleted || day.varcCompleted;
              if (isDone) activeDays++;

              const dayName = (day.day || '').toLowerCase();
              const isWeekend = dayName === 'saturday' || dayName === 'sunday';

              if (isWeekend) {
                weekendDays++;
                weekendHours += dayHours;
              } else {
                weekdayDays++;
                weekdayHours += dayHours;
              }
            });
          }
        }
      });
    }
  }

  const weekdayAvgHours = Math.round((weekdayHours / Math.max(1, weekdayDays)) * 10) / 10;
  const weekendAvgHours = Math.round((weekendHours / Math.max(1, weekendDays)) * 10) / 10;
  const overallAvgHours = Math.round((totalHours / Math.max(1, activeDays || trackedDays)) * 10) / 10;
  const regularityScore = Math.round((activeDays / Math.max(1, Math.min(trackedDays, 28))) * 100);
  const drillVelocity = totalHours > 0 ? Math.round((totalDrills / totalHours) * 10) / 10 : 0;

  // Ratio of weekend study intensity vs weekday study intensity
  const weekendDominanceRatio = weekendAvgHours / Math.max(0.3, weekdayAvgHours);

  // Extract active week metrics & days elapsed
  const globalWeekNum = currentWeekProgress?.globalWeekIdx || 1;
  const deficitDrills = (currentWeekProgress?.deficitQuant || 0) + (currentWeekProgress?.deficitLrdi || 0) + (currentWeekProgress?.deficitVarc || 0);
  const subtopicRatio = currentWeekProgress?.totalSubtopicsCount > 0 
    ? (currentWeekProgress.completedSubtopicsCount / currentWeekProgress.totalSubtopicsCount) 
    : 1;

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

  // Determine Archetype Classification
  let archetype = ASPIRANT_ARCHETYPES.STEADY_PACER;
  let primaryPlanId = 'stay_on_week';
  let diagnosticTitle = 'Steady Daily Pacer';
  let diagnosticRationale = '';

  const isElapsed = currentWeekProgress?.isElapsed !== undefined 
    ? Boolean(currentWeekProgress.isElapsed) 
    : (daysElapsed >= (globalWeekNum * 7));

  // Rule 0: Fresh Starter or Active Week in Progress (week not yet elapsed)
  if (!isElapsed || (daysElapsed < 7 && globalWeekNum <= 1)) {
    archetype = ASPIRANT_ARCHETYPES.STEADY_PACER;
    primaryPlanId = 'stay_on_week';
    diagnosticTitle = `Foundation Curriculum (Week ${globalWeekNum})`;
    diagnosticRationale = `You are currently progressing through your Week ${globalWeekNum} syllabus. Focus on conquering your daily drill quotas across Monday to Sunday to build consistent momentum.`;
  }
  // Rule 1: Stalled Starter (Calendar moved ahead, but 0 drills completed)
  else if (totalDrills <= 5 && globalWeekNum > 1 && daysElapsed >= 7) {
    archetype = ASPIRANT_ARCHETYPES.STALLED_STARTER;
    primaryPlanId = 'reset_start_date';
    diagnosticTitle = 'Stalled Starter';
    diagnosticRationale = `Your tracker shows 0 initial drills completed, while calendar dates have reached Week ${globalWeekNum}. Re-anchoring your start date to Today will reset your prep to Day 1 with zero overdue deficit.`;
  }
  // Rule 2: Weekend Warrior (Low weekday hours, high weekend spike)
  else if (weekendDominanceRatio >= 1.7 || (weekdayAvgHours <= 1.0 && weekendAvgHours >= 1.5)) {
    archetype = ASPIRANT_ARCHETYPES.WEEKEND_WARRIOR;
    primaryPlanId = 'weekend_sprint';
    diagnosticTitle = 'Weekend Warrior (Working Aspirant)';
    diagnosticRationale = `Your study logs show you average ${weekdayAvgHours}h on weekdays vs. ${weekendAvgHours}h on weekends. Forcing extra drills on weekdays causes burnout; a Weekend Recovery Sprint fits your schedule naturally.`;
  }
  // Rule 3: Concept Bottleneck (Studying consistently, but subtopic theory checklist is lagging < 40%)
  else if (subtopicRatio < 0.4 && deficitDrills > 40) {
    archetype = ASPIRANT_ARCHETYPES.CONCEPT_BOTTLENECK;
    primaryPlanId = 'schedule_shift';
    diagnosticTitle = 'Foundation Concept Bottleneck';
    diagnosticRationale = `You are actively putting in hours (${overallAvgHours}h/day), but concept checklists show a foundation backlog (<40% complete). Shifting +1 Buffer Week guarantees complete theory mastery before advancing.`;
  }
  // Rule 4: Time Crunched (Phase 2/3 - Syllabus completion or mock test marathon)
  else if (globalWeekNum >= 9 && deficitDrills > 20) {
    archetype = ASPIRANT_ARCHETYPES.TIME_CRUNCHED;
    primaryPlanId = 'pareto_triage';
    diagnosticTitle = 'Time-Crunched Exam Strategist';
    diagnosticRationale = `You are in Phase ${globalWeekNum <= 12 ? '2 (Syllabus Completion)' : '3 (Mock Marathon)'}. Delaying weeks risks losing critical mock test practice. Pareto 80/20 focuses exclusively on high-yield questions.`;
  }
  // Rule 5: Steady Pacer (Default for consistent daily engagement)
  else {
    archetype = ASPIRANT_ARCHETYPES.STEADY_PACER;
    primaryPlanId = 'catch_up_blitz';
    diagnosticTitle = 'Steady Daily Pacer';
    diagnosticRationale = `Your consistency score is ${regularityScore}%. You have the daily habit momentum to clear this backlog with small daily micro-targets (+${Math.ceil((currentWeekProgress?.deficitQuant || 14) / 7)} QA/day) over the next 7 days without calendar delays.`;
  }

  // Compute confidence score based on data availability
  let confidenceScore = 80;
  if (trackedDays >= 14) confidenceScore = 95;
  else if (trackedDays >= 7) confidenceScore = 88;
  else if (totalDrills <= 5 && globalWeekNum > 1) confidenceScore = 98;

  return {
    archetype,
    primaryPlanId,
    diagnosticTitle,
    diagnosticRationale,
    confidenceScore,
    metrics: {
      totalDrills,
      totalHours,
      activeDays,
      trackedDays,
      weekdayAvgHours,
      weekendAvgHours,
      overallAvgHours,
      regularityScore,
      drillVelocity,
      weekendDominanceRatio: Math.round(weekendDominanceRatio * 10) / 10
    }
  };
};

export const TELEMETRY_STORAGE_KEY = 'cat_prep_study_behavior_telemetry';

/**
 * Loads behavior telemetry records from state or localStorage
 * @param {Object} state 
 * @returns {Array} List of telemetry event objects
 */
export const getBehaviorTelemetry = (state = null) => {
  if (Array.isArray(state?.behaviorTelemetry?.logs) && state.behaviorTelemetry.logs.length > 0) {
    return state.behaviorTelemetry.logs;
  }
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_e) {
    // localStorage unavailable or restricted
  }
  return [];
};

/**
 * Records a rich study behavior telemetry event for personalization research and AI profiling.
 * 
 * @param {Object} state - Current application state
 * @param {string} eventType - Event category (e.g., 'CHECKPOINT_EVALUATED', 'PLAN_APPLIED', 'DAILY_DRILL')
 * @param {Object} eventData - Specific context payload
 * @returns {Object} Updated application state with appended telemetry
 */
export const recordBehaviorTelemetry = (state, eventType, eventData = {}) => {
  const existingLogs = getBehaviorTelemetry(state);
  const now = new Date();

  // Create lightweight diagnostic profile snapshot
  let currentProfile = null;
  try {
    currentProfile = analyzeAspirantBehavior(state);
  } catch (_e) {}

  const telemetryEntry = {
    id: `telemetry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    isoDate: now.toISOString(),
    dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    eventType,
    data: eventData,
    snapshot: {
      archetypeId: currentProfile?.archetype?.id || 'STEADY_PACER',
      confidenceScore: currentProfile?.confidenceScore || 80,
      regularityScore: currentProfile?.metrics?.regularityScore || 0,
      drillVelocity: currentProfile?.metrics?.drillVelocity || 0,
      weekdayAvgHours: currentProfile?.metrics?.weekdayAvgHours || 0,
      weekendAvgHours: currentProfile?.metrics?.weekendAvgHours || 0
    }
  };

  // Keep a clean rolling window of the last 500 events to prevent unbounded storage growth
  const updatedLogs = [...existingLogs, telemetryEntry].slice(-500);

  // Sync to localStorage
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (_e) {}

  if (!state) return { behaviorTelemetry: { logs: updatedLogs, lastEventAt: Date.now() } };

  return {
    ...state,
    behaviorTelemetry: {
      logs: updatedLogs,
      lastEventAt: Date.now()
    }
  };
};

/**
 * Computes deep research-backed personalization signals from behavioral telemetry.
 * Can be leveraged by future features: burnout prevention, smart rest days, dynamic quota pacing.
 * 
 * @param {Object} state - Current state containing tracker or behaviorTelemetry
 * @returns {Object} Actionable personalization signals
 */
export const getPersonalizationResearchSignals = (state) => {
  const logs = getBehaviorTelemetry(state);
  const profile = analyzeAspirantBehavior(state);

  // 1. Calculate Recommendation Acceptance Rate
  const planAppliedLogs = logs.filter(l => l.eventType === 'RECOVERY_PLAN_APPLIED');
  let acceptedRecommendedCount = 0;
  planAppliedLogs.forEach(log => {
    if (log.data?.wasRecommended) acceptedRecommendedCount++;
  });
  const recommendationAdoptionRate = planAppliedLogs.length > 0
    ? Math.round((acceptedRecommendedCount / planAppliedLogs.length) * 100)
    : 100;

  // 2. Burnout Risk Signal: detect severe drop in study after high intensity or prolonged streaks
  let burnoutRisk = 'LOW';
  if (profile.metrics.regularityScore > 75 && profile.metrics.totalHours > 40 && profile.metrics.overallAvgHours < 1.0) {
    burnoutRisk = 'HIGH';
  } else if (profile.metrics.weekendDominanceRatio > 2.5) {
    burnoutRisk = 'MODERATE'; // High weekend burden risks Sunday evening cognitive fatigue
  }

  // 3. Recommended daily pace adjustments based on real velocity
  const sustainableDailyHours = profile.archetype.id === 'WEEKEND_WARRIOR' 
    ? { weekday: Math.min(1.5, profile.metrics.weekdayAvgHours || 1), weekend: Math.max(3.5, profile.metrics.weekendAvgHours || 4) }
    : { weekday: Math.max(2, profile.metrics.weekdayAvgHours || 2), weekend: Math.max(2, profile.metrics.weekendAvgHours || 2) };

  return {
    detectedPersona: profile.archetype.title,
    archetypeId: profile.archetype.id,
    confidenceScore: profile.confidenceScore,
    burnoutRisk,
    recommendationAdoptionRate,
    sustainableDailyHours,
    telemetryEventsLogged: logs.length,
    lastLoggedAt: logs.length > 0 ? logs[logs.length - 1].timestamp : null
  };
};

