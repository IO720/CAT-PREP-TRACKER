import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getInitialState } from '../../utils/storage';
import {
  calculateWeekProgress,
  generateRecoveryOptions,
  applyCatchUpBlitzToState,
  applyWeekendSprintToState,
  applyScheduleShiftToState,
  calculateOverallBacklog,
  sanitizeTrackerState
} from '../../utils/adaptiveStudyEngine';
import AdaptiveWeekReviewModal from '../AdaptiveWeekReviewModal';
import DailyTrackerView from '../DailyTrackerView';
import BacklogRecoveryView from '../BacklogRecoveryView';
import {
  analyzeAspirantBehavior,
  recordBehaviorTelemetry,
  getBehaviorTelemetry,
  getPersonalizationResearchSignals
} from '../../utils/studyBehaviorEngine';

describe('Adaptive Study Progress Engine & Quota Recovery Suite', () => {
  let mockState;
  const todayStr = new Date().toISOString().split('T')[0];
  const elapsedTwoWeeksAgoStr = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const elapsedThreeWeeksAgoStr = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  beforeEach(() => {
    mockState = getInitialState();
    mockState.settings.startDate = todayStr;
  });

  it('identifies fresh Day 1 accounts as IN_PROGRESS with zero backlog and no false deficits', () => {
    mockState.settings.startDate = todayStr;
    const progress = calculateWeekProgress(mockState, 'Month 1', 'Week 1', 1);

    expect(progress.isElapsed).toBe(false);
    expect(progress.isCurrentActiveWeek).toBe(true);
    expect(progress.pacingStatus).toBe('IN_PROGRESS');
    expect(progress.statusBadge).toBe('Day 1 (Ready)');
    expect(progress.badgeColor).toBe('#94a3b8');

    const backlog = calculateOverallBacklog(mockState, 1);
    expect(backlog.hasBacklog).toBe(false);
    expect(backlog.totalDeficitDrills).toBe(0);
    expect(backlog.backlogWeeks).toEqual([]);
  });

  it('calculates progress accurately for elapsed empty week and classifies as CRITICAL_DEFICIT', () => {
    mockState.settings.startDate = elapsedTwoWeeksAgoStr;
    const progress = calculateWeekProgress(mockState, 'Month 1', 'Week 1', 1);

    expect(progress.isElapsed).toBe(true);
    expect(progress.quantSolved).toBe(0);
    expect(progress.lrdiSolved).toBe(0);
    expect(progress.varcSolved).toBe(0);
    expect(progress.targetQuant).toBe(125);
    expect(progress.targetLrdi).toBe(25);
    expect(progress.targetVarc).toBe(25);
    expect(progress.deficitQuant).toBe(125);
    expect(progress.deficitLrdi).toBe(25);
    expect(progress.deficitVarc).toBe(25);
    expect(progress.overallProgressPct).toBe(0);
    expect(progress.pacingStatus).toBe('CRITICAL_DEFICIT');
    expect(progress.recommendedPlan).toBe('schedule_shift');
  });

  it('calculates partial progress on elapsed week and recommends catch_up_blitz for moderate deficit', () => {
    mockState.settings.startDate = elapsedTwoWeeksAgoStr;
    // Populate with 80 Quant questions, 15 LRDI sets, 18 VARC
    mockState.tracker['Month 1'][0].days[0].quantCount = 20;
    mockState.tracker['Month 1'][0].days[1].quantCount = 20;
    mockState.tracker['Month 1'][0].days[2].quantCount = 20;
    mockState.tracker['Month 1'][0].days[3].quantCount = 20;
    mockState.tracker['Month 1'][0].days[0].lrdiCount = 5;
    mockState.tracker['Month 1'][0].days[1].lrdiCount = 5;
    mockState.tracker['Month 1'][0].days[2].lrdiCount = 5;
    mockState.tracker['Month 1'][0].days[0].varcCount = 6;
    mockState.tracker['Month 1'][0].days[1].varcCount = 6;
    mockState.tracker['Month 1'][0].days[2].varcCount = 6;
    mockState.tracker['Month 1'][0].days[0].studyHours = 12;

    const progress = calculateWeekProgress(mockState, 'Month 1', 'Week 1', 1);

    expect(progress.isElapsed).toBe(true);
    expect(progress.quantSolved).toBe(80);
    expect(progress.lrdiSolved).toBe(15);
    expect(progress.varcSolved).toBe(18);
    expect(progress.deficitQuant).toBe(45);
    expect(progress.deficitLrdi).toBe(10);
    expect(progress.deficitVarc).toBe(7);
    expect(progress.overallProgressPct).toBeGreaterThan(40);
    expect(['ON_TRACK', 'MODERATE_DEFICIT']).toContain(progress.pacingStatus);
    expect(progress.recommendedPlan).toBe('catch_up_blitz');
  });

  it('generates recovery options with correct mathematical micro-targets', () => {
    mockState.settings.startDate = elapsedTwoWeeksAgoStr;
    const progress = calculateWeekProgress(mockState, 'Month 1', 'Week 1', 1);
    const options = generateRecoveryOptions(progress);

    expect(options.catchUpBlitz).toBeDefined();
    expect(options.catchUpBlitz.dailyExtraQuant).toBe(Math.ceil(125 / 7)); // 18/day
    expect(options.catchUpBlitz.dailyExtraLrdi).toBe(Math.ceil(25 / 7)); // 4/day

    expect(options.scheduleShift).toBeDefined();
    expect(options.scheduleShift.shiftWeeks).toBe(1);

    expect(options.weekendSprint).toBeDefined();
    expect(options.weekendSprint.satTargets.quant).toBe(Math.ceil(125 * 0.5));

    expect(options.paretoTriage).toBeDefined();
    expect(options.markComplete).toBeDefined();
  });

  it('applies 7-Day Catch-Up Blitz to upcoming week in state', () => {
    const blitzConfig = {
      dailyExtraQuant: 6,
      dailyExtraLrdi: 2,
      dailyExtraVarc: 2
    };

    const updatedState = applyCatchUpBlitzToState(mockState, 'Month 1', 'Week 2', blitzConfig);

    const week2Days = updatedState.tracker['Month 1'][1].days;
    expect(week2Days[0].catchUpActive).toBe(true);
    expect(week2Days[0].catchUpQuant).toBe(6);
    expect(week2Days[0].catchUpLrdi).toBe(2);
    expect(week2Days[0].customBadge).toBe('CATCH-UP');
    expect(updatedState.activeCatchUp).toBeDefined();
  });

  it('applies Weekend Recovery Sprint to Saturday and Sunday', () => {
    const sprintConfig = {
      satTargets: { quant: 25, lrdi: 5, varc: 5 },
      sunTargets: { quant: 25, lrdi: 5, varc: 5 }
    };

    const updatedState = applyWeekendSprintToState(mockState, 'Month 1', 'Week 2', sprintConfig);
    const week2Days = updatedState.tracker['Month 1'][1].days;
    const saturday = week2Days.find(d => d.day === 'Saturday');
    const sunday = week2Days.find(d => d.day === 'Sunday');
    const monday = week2Days.find(d => d.day === 'Monday');

    expect(saturday.catchUpActive).toBe(true);
    expect(saturday.catchUpQuant).toBe(25);
    expect(saturday.customBadge).toBe('SPRINT');
    expect(sunday.catchUpActive).toBe(true);
    expect(sunday.catchUpQuant).toBe(25);
    expect(monday.catchUpActive).toBeFalsy();
  });

  it('applies Linear Schedule Shift (+1 Buffer Week) cleanly', () => {
    const originalPlanLength = mockState.studyPlan.length;
    const originalTrackerWeeks = mockState.tracker['Month 1'].length;

    const updatedState = applyScheduleShiftToState(mockState, 'Month 1', 'Week 1', 1);

    expect(updatedState.studyPlan.length).toBe(originalPlanLength + 1);
    expect(updatedState.studyPlan[1].week).toContain('Extended Buffer');
    expect(updatedState.studyPlan[1].isExtended).toBe(true);
    expect(updatedState.tracker['Month 1'].length).toBe(originalTrackerWeeks + 1);
    expect(updatedState.tracker['Month 1'][1].week).toContain('Extended');
  });

  it('renders AdaptiveWeekReviewModal with zero emoji compliance and handles plan application', () => {
    mockState.settings.startDate = elapsedTwoWeeksAgoStr;
    const progress = calculateWeekProgress(mockState, 'Month 1', 'Week 1', 1);
    const onApplyPlan = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <AdaptiveWeekReviewModal
        isOpen={true}
        onClose={onClose}
        progressData={progress}
        onApplyPlan={onApplyPlan}
      />
    );

    // Verify modal header & question
    expect(screen.getByText(/Adaptive Syllabus Checkpoint/i)).toBeDefined();
    expect(screen.getByText(/Did you complete this week's syllabus portion\?/i)).toBeDefined();

    // Verify all 5 recovery solutions are present
    expect(screen.getByText(/Extend Schedule \(\+1 Buffer Week\)/i)).toBeDefined();
    expect(screen.getByText(/7-Day Catch-Up Micro-Blitz/i)).toBeDefined();
    expect(screen.getByText(/Weekend Recovery Sprint/i)).toBeDefined();
    expect(screen.getByText(/Pareto 80\/20 High-Yield Triage/i)).toBeDefined();
    expect(screen.getByText(/I Completed This Portion Offline/i)).toBeDefined();

    // Zero-emoji verification: ensure no raw unicode emojis in DOM
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(container.textContent)).toBe(false);

    // Click apply recovery plan or continue drills button
    const applyButtons = screen.getAllByRole('button', { name: /Apply Plan|Continue Drills/i });
    fireEvent.click(applyButtons[0]);

    expect(onApplyPlan).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenCheckpoint only when user attempts to advance from an overdue elapsed week', () => {
    const onOpenCheckpoint = vi.fn();
    const setActiveWeek = vi.fn();

    // Set start date 14 days ago so Week 1 has elapsed
    const pastState = {
      ...mockState,
      settings: { ...mockState.settings, startDate: elapsedTwoWeeksAgoStr }
    };

    render(
      <DailyTrackerView
        state={pastState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 1"
        setActiveWeek={setActiveWeek}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
        onOpenCheckpoint={onOpenCheckpoint}
      />
    );

    // In Week 1 (overdue elapsed week with 0 progress), user clicks Week 2
    const week2Button = screen.getByRole('button', { name: 'W2' });
    fireEvent.click(week2Button);

    // Checkpoint should be intercepted and opened instead of silently changing weeks
    expect(onOpenCheckpoint).toHaveBeenCalledWith('Month 1', 'Week 1', 1);
    expect(setActiveWeek).not.toHaveBeenCalled();
  });

  it('allows free navigation on unelapsed active weeks without blocking checkpoint modal', () => {
    const onOpenCheckpoint = vi.fn();
    const setActiveWeek = vi.fn();

    // Fresh start date (today)
    mockState.settings.startDate = todayStr;

    render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 1"
        setActiveWeek={setActiveWeek}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
        onOpenCheckpoint={onOpenCheckpoint}
      />
    );

    // On Day 1, user clicks Week 2
    const week2Button = screen.getByRole('button', { name: 'W2' });
    fireEvent.click(week2Button);

    // User is NOT blocked with checkpoint modal
    expect(onOpenCheckpoint).not.toHaveBeenCalled();
    expect(setActiveWeek).toHaveBeenCalledWith('Week 2');
  });

  it('categorizes Weekend Warrior archetype when weekend hours dominate weekday study', () => {
    // Start date 14 days ago with global week 2
    const stateWithWeekendHabit = {
      ...mockState,
      settings: { ...mockState.settings, startDate: elapsedTwoWeeksAgoStr }
    };
    stateWithWeekendHabit.tracker['Month 1'][0].days = stateWithWeekendHabit.tracker['Month 1'][0].days.map(d => {
      if (d.day === 'Saturday' || d.day === 'Sunday') {
        return { ...d, studyHours: 4, quantCount: 20, lrdiCount: 4 };
      }
      return { ...d, studyHours: 0.5, quantCount: 2 };
    });

    const diagnosis = analyzeAspirantBehavior(stateWithWeekendHabit, { globalWeekIdx: 2 });
    expect(diagnosis.archetype.id).toBe('WEEKEND_WARRIOR');
    expect(diagnosis.primaryPlanId).toBe('weekend_sprint');
    expect(diagnosis.diagnosticTitle).toContain('Weekend Warrior');
    expect(diagnosis.metrics.weekendAvgHours).toBeGreaterThan(diagnosis.metrics.weekdayAvgHours);
  });

  it('records persistent behavioral telemetry events and calculates future personalization signals', () => {
    try { localStorage.clear(); } catch (_e) {}

    const updatedState = recordBehaviorTelemetry(mockState, 'CHECKPOINT_EVALUATED', {
      monthKey: 'Month 1',
      weekKey: 'Week 1',
      deficitDrills: 30
    });

    expect(updatedState.behaviorTelemetry.logs.length).toBeGreaterThan(0);
    const telemetryLogs = getBehaviorTelemetry(updatedState);
    expect(telemetryLogs.length).toBeGreaterThan(0);
    expect(telemetryLogs[0].eventType).toBe('CHECKPOINT_EVALUATED');

    const signals = getPersonalizationResearchSignals(updatedState);
    expect(signals.detectedPersona).toBeDefined();
    expect(signals.burnoutRisk).toBeDefined();
    expect(signals.sustainableDailyHours).toBeDefined();
  });

  it('supports expanding alternative options accordion in AdaptiveWeekReviewModal', () => {
    mockState.settings.startDate = elapsedTwoWeeksAgoStr;
    const progress = calculateWeekProgress(mockState, 'Month 1', 'Week 1', 1);
    const onApplyPlan = vi.fn();
    const onClose = vi.fn();

    render(
      <AdaptiveWeekReviewModal
        isOpen={true}
        onClose={onClose}
        progressData={progress}
        onApplyPlan={onApplyPlan}
        state={mockState}
      />
    );

    // Accordion toggle button is rendered
    const toggleButton = screen.getByRole('button', { name: /Browse Alternative Recovery Options/i });
    expect(toggleButton).toBeDefined();
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');

    // Click toggle to reveal alternatives
    fireEvent.click(toggleButton);
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');

    // Click Adopt AI Recommendation button in Spotlight Card
    const spotlightBtn = screen.getByRole('button', { name: /Apply Recommended Plan/i });
    fireEvent.click(spotlightBtn);
    expect(onApplyPlan).toHaveBeenCalledTimes(1);
  });

  it('calculates overall syllabus backlog across all elapsed weeks', () => {
    // 3 weeks ago start date: Week 1 & Week 2 have fully elapsed and are empty
    mockState.settings.startDate = elapsedThreeWeeksAgoStr;
    const backlog = calculateOverallBacklog(mockState, 3);
    expect(backlog.hasBacklog).toBe(true);
    expect(backlog.totalDeficitDrills).toBeGreaterThan(0);
    expect(backlog.primaryBottleneck).toBeDefined();
    expect(backlog.primaryBottleneck.monthKey).toBe('Month 1');
    expect(backlog.primaryBottleneck.weekKey).toBe('Week 1');
  });

  it('sanitizes state by deduplicating stacked extended weeks for elapsed accounts', () => {
    const stateWithDuplicates = {
      ...mockState,
      settings: { ...mockState.settings, startDate: elapsedTwoWeeksAgoStr },
      tracker: {
        'Month 1': [
          { week: 'Week 1', days: [] },
          { week: 'Week 1 (Extended)', days: [] },
          { week: 'Week 1 (Extended)', days: [] },
          { week: 'Week 2', days: [] }
        ]
      },
      studyPlan: [
        { week: 'Month 1: Week 1' },
        { week: 'Month 1: Week 1 (Extended Buffer)' },
        { week: 'Month 1: Week 1 (Extended Buffer)' }
      ]
    };

    const sanitized = sanitizeTrackerState(stateWithDuplicates);
    expect(sanitized.tracker['Month 1'].length).toBe(3);
    expect(sanitized.studyPlan.length).toBe(2);
  });

  it('sanitizes state by completely purging extended weeks for fresh accounts (<7 days elapsed)', () => {
    const freshStateWithAccidentalBuffer = {
      ...mockState,
      settings: { ...mockState.settings, startDate: todayStr },
      tracker: {
        'Month 1': [
          { week: 'Week 1', days: [] },
          { week: 'Week 1 (Extended)', days: [] },
          { week: 'Week 2', days: [] }
        ]
      },
      studyPlan: [
        { week: 'Month 1: Week 1' },
        { week: 'Month 1: Week 1 (Extended Buffer)' }
      ]
    };

    const sanitized = sanitizeTrackerState(freshStateWithAccidentalBuffer);
    expect(sanitized.tracker['Month 1'].length).toBe(2);
    expect(sanitized.studyPlan.length).toBe(1);
    expect(sanitized.tracker['Month 1'].some(w => w.week.includes('Extended'))).toBe(false);
  });

  it('renders BacklogRecoveryView component with interactive drill stations when user has backlog', () => {
    const onUpdateDayMetric = vi.fn();
    const onUpdateWeekPlan = vi.fn();
    const onApplyPlan = vi.fn();

    const backloggedState = {
      ...mockState,
      activeMonth: 'Month 1',
      activeWeek: 'Week 3',
      settings: { ...mockState.settings, startDate: elapsedThreeWeeksAgoStr }
    };

    render(
      <BacklogRecoveryView
        state={backloggedState}
        onUpdateDayMetric={onUpdateDayMetric}
        onUpdateWeekPlan={onUpdateWeekPlan}
        onApplyPlan={onApplyPlan}
        onNavigateToDaily={vi.fn()}
        onNavigateToTimer={vi.fn()}
        onNavigateToTimeline={vi.fn()}
      />
    );

    // Hero banner and clearance meter are visible
    expect(screen.getByText(/ACTIVE BACKLOG RECOVERY COCKPIT/i)).toBeDefined();
    expect(screen.getByText(/Prerequisite Mastery Clearance/i)).toBeDefined();

    // Priority 1 bottleneck station is prominent
    expect(screen.getByText(/PRIORITY 1: COMPLETE THESE TOPICS FIRST/i)).toBeDefined();

    // Clicking quick stepper (+5 Qs) calls onUpdateDayMetric
    const plusFiveButtons = screen.getAllByRole('button', { name: /\+5 Qs/i });
    expect(plusFiveButtons.length).toBeGreaterThan(0);
    fireEvent.click(plusFiveButtons[0]);
    expect(onUpdateDayMetric).toHaveBeenCalled();

    // Switching recovery strategy invokes onApplyPlan
    const weekendSprintPill = screen.getByRole('button', { name: /Weekend Recovery Sprint/i });
    fireEvent.click(weekendSprintPill);
    expect(onApplyPlan).toHaveBeenCalledWith('weekend_sprint', expect.anything(), expect.anything());
  });

  it('renders clean on-track state in BacklogRecoveryView when user has zero backlog', () => {
    mockState.settings.startDate = todayStr;

    render(
      <BacklogRecoveryView
        state={mockState}
        onUpdateDayMetric={vi.fn()}
        onUpdateWeekPlan={vi.fn()}
        onApplyPlan={vi.fn()}
        onNavigateToDaily={vi.fn()}
        onNavigateToTimer={vi.fn()}
        onNavigateToTimeline={vi.fn()}
      />
    );

    expect(screen.getByText(/All Clear — Zero Active Backlogs/i)).toBeDefined();
    expect(screen.getByText(/Your preparation is 100% on schedule/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Start Week 1 Daily Drills/i })).toBeDefined();
  });

  it('increases daily drill questions directly by backlog numbers instead of hijacking custom objective', () => {
    // Apply Catch-Up Blitz (+18 QA, +3 DILR, +3 VARC) to Week 2
    const blitzConfig = {
      dailyExtraQuant: 18,
      dailyExtraLrdi: 3,
      dailyExtraVarc: 3
    };

    const stateWithCatchUp = applyCatchUpBlitzToState(mockState, 'Month 1', 'Week 2', blitzConfig);
    const monday = stateWithCatchUp.tracker['Month 1'][1].days[0];

    // Standard base 18 QA + 18 backlog = 36 total questions
    expect(monday.quantTarget).toContain('36 Quant Questions');
    expect(monday.quantTarget).toContain('18 Base + 18 Backlog Boost');
    expect(monday.catchUpQuant).toBe(18);

    // Standard base 4 DILR + 3 backlog = 7 sets
    expect(monday.lrdiTarget).toContain('7 LRDI Sets');
    expect(monday.catchUpLrdi).toBe(3);

    // Standard base 4 VARC + 3 backlog = 7 RCs
    expect(monday.varcTarget).toContain('7 Reading Comprehensions');
    expect(monday.catchUpVarc).toBe(3);

    // Custom objective is NOT hijacked as a replacement for backlog
    expect(monday.customTitle).not.toBe('Catch-Up Micro Target');
  });
});
