import React, { useState, useMemo } from 'react';
import { Icons } from './AspirantIcons';
import { calculateOverallBacklog, generateRecoveryOptions } from '../utils/adaptiveStudyEngine';
import { getTodayTrackerPosition } from '../utils/dateUtils';
import { playGamingAchievementSound } from '../utils/audioUtils';

export default function BacklogRecoveryView({
  state,
  overallBacklog: propOverallBacklog,
  activeMonth: propActiveMonth,
  activeWeek: propActiveWeek,
  onUpdateDayMetric,
  onUpdateWeekPlan,
  onApplyPlan,
  onNavigateToDaily,
  onNavigateToTimer,
  onNavigateToTimeline
}) {
  const currentGlobalWeek = useMemo(() => {
    const pos = getTodayTrackerPosition(state?.settings?.startDate);
    const monthKey = pos?.activeMonth || propActiveMonth || 'Month 1';
    const weekKey = pos?.activeWeek || propActiveWeek || 'Week 1';
    const mNum = parseInt(monthKey.replace(/\D/g, ''), 10) || 1;
    const wNum = parseInt(weekKey.replace(/\D/g, ''), 10) || 1;
    return Math.min(16, Math.max(1, (mNum - 1) * 4 + wNum));
  }, [state?.settings?.startDate, propActiveMonth, propActiveWeek]);

  // Comprehensive backlog evaluation - synchronized with App overallBacklog
  const backlogData = useMemo(() => {
    if (propOverallBacklog) return propOverallBacklog;
    return calculateOverallBacklog(state, currentGlobalWeek);
  }, [propOverallBacklog, state, currentGlobalWeek]);

  const {
    hasBacklog,
    totalDeficitDrills,
    totalDeficitHours,
    backlogClearancePct,
    backlogWeeks,
    primaryBottleneck,
    isExtendedWeekActive
  } = backlogData;

  const bottleneckWeekData = primaryBottleneck?.progress;
  const bottleneckMonth = primaryBottleneck?.monthKey || 'Month 1';
  const bottleneckWeek = primaryBottleneck?.weekKey || 'Week 1';
  const bottleneckGlobalIdx = primaryBottleneck?.globalWeekIdx || 1;

  // Selected recovery mode state
  const [activeStrategy, setActiveStrategy] = useState(() => {
    if (state?.activeCatchUp) return 'catch_up_blitz';
    if (state?.activeWeekendSprint) return 'weekend_sprint';
    if (isExtendedWeekActive) return 'schedule_shift';
    return 'catch_up_blitz';
  });

  const [notification, setNotification] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Quick Drill Incrementer for the bottleneck week
  const handleIncrementDrill = (subject, delta) => {
    if (!onUpdateDayMetric) return;
    try {
      playGamingAchievementSound(0.03);
    } catch (_e) {}

    const monthWeeks = state?.tracker?.[bottleneckMonth] || [];
    const weekObj = monthWeeks.find(w => w.week === bottleneckWeek) || monthWeeks[0];
    const days = weekObj?.days || [];
    const targetDay = days.find(d => d.day === 'Monday') || days[0] || { day: 'Monday' };

    const currentCount = Number(targetDay[`${subject}Count`]) || 0;
    const newCount = Math.max(0, currentCount + delta);
    const isCompleted = newCount >= 18;

    onUpdateDayMetric(bottleneckMonth, bottleneckWeek, targetDay.day, subject, isCompleted, newCount);
    showToast(`Logged +${delta} ${subject.toUpperCase()} questions for ${bottleneckWeek}`);
  };

  // Toggle subtopic on bottleneck week
  const handleToggleSubtopic = (subtopic) => {
    if (!onUpdateWeekPlan) return;
    try {
      playGamingAchievementSound(0.04);
    } catch (_e) {}

    const planItem = (state?.studyPlan || [])[bottleneckGlobalIdx - 1] || {};
    const currentCompleted = planItem.completedSubtopics || [];
    const isDone = currentCompleted.includes(subtopic);

    const updatedSubtopics = isDone
      ? currentCompleted.filter(s => s !== subtopic)
      : [...currentCompleted, subtopic];

    const weekTitle = planItem.week || `${bottleneckMonth}: ${bottleneckWeek}`;
    onUpdateWeekPlan(weekTitle, { completedSubtopics: updatedSubtopics });
    showToast(isDone ? `Unchecked: ${subtopic}` : `Mastered concept: ${subtopic} (+50 EXP)`);
  };

  // Handle applying a recovery strategy
  const handleSwitchStrategy = (strategyId) => {
    setActiveStrategy(strategyId);
    try {
      playGamingAchievementSound(0.04);
    } catch (_e) {}

    if (onApplyPlan && bottleneckWeekData) {
      const recoveryOpts = generateRecoveryOptions(bottleneckWeekData) || {};
      const optionsList = Object.values(recoveryOpts);
      const chosen = optionsList.find(o => o?.id === strategyId) || recoveryOpts[strategyId] || { id: strategyId };
      onApplyPlan(strategyId, chosen, bottleneckWeekData);
      showToast(`Activated ${chosen.title || strategyId.replace(/_/g, ' ').toUpperCase()} recovery mode`);
    }
  };

  // Subtopics for bottleneck week
  const subtopicItems = useMemo(() => {
    const sDetail = primaryBottleneck?.syllabusDetails || {};
    return [
      ...(sDetail.quantSubtopics || []),
      ...(sDetail.lrdiSubtopics || []),
      ...(sDetail.varcSubtopics || [])
    ];
  }, [primaryBottleneck]);

  const planItem = (state?.studyPlan || [])[bottleneckGlobalIdx - 1] || {};
  const completedSubtopics = planItem.completedSubtopics || [];

  // When there are no backlogs, render a triumphant all-clear hero card
  if (!hasBacklog) {
    const activeM = propActiveMonth || 'Month 1';
    const activeW = propActiveWeek || 'Week 1';
    return (
      <div className="backlog-recovery-view-root fade-in">
        <div className="recovery-all-clear-card">
          <div className="recovery-all-clear-icon-bubble">
            <Icons.CheckCircle size={44} />
          </div>
          <h2 className="recovery-all-clear-title">
            All Clear — Zero Active Backlogs
          </h2>
          <p className="recovery-all-clear-desc">
            Your preparation is 100% on schedule with no overdue modules. You are currently mastering <strong style={{ color: '#38bdf8' }}>{activeM} • {activeW}</strong> at peak pace.
          </p>
          <div className="recovery-all-clear-actions">
            <button
              type="button"
              className="recovery-hero-btn primary"
              onClick={() => onNavigateToDaily && onNavigateToDaily(activeM, activeW, 'Monday')}
            >
              <Icons.Drills size={15} />
              <span>Start {activeW} Daily Drills &rarr;</span>
            </button>
            <button
              type="button"
              className="recovery-hero-btn ghost"
              onClick={onNavigateToTimeline}
            >
              <Icons.Timeline size={15} />
              <span>View Full Syllabus Roadmap</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate subject progress percentages for mini bars
  const quantTarget = bottleneckWeekData?.targetQuant || 125;
  const quantSolved = bottleneckWeekData?.quantSolved || 0;
  const quantPct = Math.min(100, Math.round((quantSolved / quantTarget) * 100));

  const lrdiTarget = bottleneckWeekData?.targetLrdi || 25;
  const lrdiSolved = bottleneckWeekData?.lrdiSolved || 0;
  const lrdiPct = Math.min(100, Math.round((lrdiSolved / lrdiTarget) * 100));

  const varcTarget = bottleneckWeekData?.targetVarc || 25;
  const varcSolved = bottleneckWeekData?.varcSolved || 0;
  const varcPct = Math.min(100, Math.round((varcSolved / varcTarget) * 100));

  return (
    <div className="backlog-recovery-view-root fade-in">
      {/* Toast Alert */}
      {notification && (
        <div className="recovery-toast-alert">
          <Icons.Zap size={14} />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Tactical Command Hero Banner */}
      <div className="recovery-command-hero">
        <div className="recovery-hero-left">
          <div className="recovery-protocol-tag">
            <div className="recovery-protocol-pill">
              <span className="recovery-pulse-ping" />
              <span>ACTIVE BACKLOG RECOVERY COCKPIT</span>
            </div>
            <span className="recovery-paused-chip">
              PAUSED AT WEEK {currentGlobalWeek}
            </span>
          </div>

          <h1 className="recovery-command-headline">
            CURRICULUM <span className="recovery-headline-accent">Recovery Command.</span>
          </h1>

          <p className="recovery-command-manifesto">
            To protect your foundational retention, curriculum pacing is temporarily frozen. Master your prerequisite <strong style={{ color: '#fbbf24' }}>{bottleneckMonth} • {bottleneckWeek}</strong> bottleneck ({totalDeficitDrills} deficit questions) below. Once conquered, regular syllabus modules unlock automatically.
          </p>

          <div className="recovery-hero-actions">
            <button
              type="button"
              className="recovery-hero-btn primary"
              onClick={() => onNavigateToDaily && onNavigateToDaily(bottleneckMonth, bottleneckWeek, 'Monday')}
              title="Launch daily drills for this backlog week"
            >
              <Icons.ArrowRight size={14} />
              <span>Launch {bottleneckWeek} Drills</span>
            </button>
            <button
              type="button"
              className="recovery-hero-btn ghost"
              onClick={onNavigateToTimer}
              title="Start a focused study session"
            >
              <Icons.Timer size={14} />
              <span>Start Focus Timer</span>
            </button>
          </div>
        </div>

        {/* Tactical Clearance HUD */}
        <div className="recovery-hud-card">
          <div className="recovery-hud-top-row">
            <span className="recovery-hud-label">Prerequisite Mastery Clearance</span>
            <span className="recovery-hud-score">{backlogClearancePct}% Cleared ({totalDeficitDrills} Deficit Questions Remaining)</span>
          </div>

          <div className="recovery-hud-track">
            <div
              className="recovery-hud-fill"
              style={{ width: `${Math.max(5, backlogClearancePct)}%` }}
            />
          </div>

          <div className="recovery-hud-telemetry-grid">
            <div className="recovery-hud-pill quant">
              <span>QA</span>
              <strong>-{bottleneckWeekData?.deficitQuant || 0} Qs</strong>
            </div>
            <div className="recovery-hud-pill lrdi">
              <span>DILR</span>
              <strong>-{bottleneckWeekData?.deficitLrdi || 0} Sets</strong>
            </div>
            <div className="recovery-hud-pill varc">
              <span>VARC</span>
              <strong>-{bottleneckWeekData?.deficitVarc || 0} RCs</strong>
            </div>
            <div className="recovery-hud-pill theory">
              <span>Theory</span>
              <strong>{completedSubtopics.length}/{subtopicItems.length || 12}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Priority 1 Bottleneck Hub & Interactive Stations */}
      <div className="recovery-section-card priority-focus">
        <div className="recovery-section-header">
          <div className="recovery-section-header-left">
            <div className="recovery-section-badge warning">
              <Icons.Target size={22} />
            </div>
            <div>
              <div className="recovery-priority-tag">
                PRIORITY 1: COMPLETE THESE TOPICS FIRST
              </div>
              <h2 className="recovery-section-title">
                {bottleneckMonth} • {bottleneckWeek} Foundation Topics
              </h2>
              <p className="recovery-section-subtitle">
                Prerequisites for Week {Math.min(16, bottleneckGlobalIdx + 1)}+ modules • Live Interactive Logger
              </p>
            </div>
          </div>

          <div className="recovery-section-actions">
            <button
              type="button"
              className="recovery-hero-btn ghost"
              onClick={() => onNavigateToDaily && onNavigateToDaily(bottleneckMonth, bottleneckWeek, 'Monday')}
              title="Jump directly to this week in the daily tracker"
            >
              <Icons.ArrowRight size={13} />
              <span>Jump to Daily Tracker</span>
            </button>
          </div>
        </div>

        {/* 3 Subject Stations Grid */}
        <div className="recovery-stations-grid">
          {/* Quant Station */}
          <div className="recovery-station-card quant">
            <div className="recovery-station-header">
              <div className="station-title-wrap">
                <div className="station-icon-bullet">
                  <Icons.Calculator size={13} />
                </div>
                <span className="station-name">Quant Aptitude</span>
              </div>
              <span className="station-deficit">-{bottleneckWeekData?.deficitQuant || 18} Qs</span>
            </div>

            <div className="recovery-station-body">
              <div className="station-stat-row">
                <span>Target: <strong>{quantTarget} Qs</strong></span>
                <span>Solved: <strong style={{ color: '#38bdf8' }}>{quantSolved}</strong></span>
              </div>

              <div className="station-mini-track">
                <div className="station-mini-fill" style={{ width: `${quantPct}%` }} />
              </div>

              <div className="station-stepper-row">
                <button
                  type="button"
                  className="station-stepper-btn dec"
                  onClick={() => handleIncrementDrill('quant', -5)}
                  title="Decrease 5 questions"
                  aria-label="-5 Qs"
                >
                  -5
                </button>
                <button
                  type="button"
                  className="station-stepper-btn dec"
                  onClick={() => handleIncrementDrill('quant', -1)}
                  title="Decrease 1 question"
                  aria-label="-1 Q"
                >
                  -1
                </button>
                <button
                  type="button"
                  className="station-stepper-btn inc"
                  onClick={() => handleIncrementDrill('quant', 1)}
                  title="Solve 1 question"
                  aria-label="+1 Q"
                >
                  +1
                </button>
                <button
                  type="button"
                  className="station-stepper-btn inc highlight"
                  onClick={() => handleIncrementDrill('quant', 5)}
                  title="Solve 5 questions"
                  aria-label="+5 Qs"
                >
                  +5
                </button>
                <button
                  type="button"
                  className="station-stepper-btn inc boost"
                  onClick={() => handleIncrementDrill('quant', 10)}
                  title="Solve 10 questions"
                  aria-label="+10 Qs"
                >
                  +10
                </button>
              </div>
            </div>
          </div>

          {/* DILR Station */}
          <div className="recovery-station-card lrdi">
            <div className="recovery-station-header">
              <div className="station-title-wrap">
                <div className="station-icon-bullet">
                  <Icons.Puzzles size={13} />
                </div>
                <span className="station-name">DILR Puzzles</span>
              </div>
              <span className="station-deficit">-{bottleneckWeekData?.deficitLrdi || 4} Sets</span>
            </div>

            <div className="recovery-station-body">
              <div className="station-stat-row">
                <span>Target: <strong>{lrdiTarget} Sets</strong></span>
                <span>Solved: <strong style={{ color: '#c084fc' }}>{lrdiSolved}</strong></span>
              </div>

              <div className="station-mini-track">
                <div className="station-mini-fill" style={{ width: `${lrdiPct}%` }} />
              </div>

              <div className="station-stepper-row">
                <button
                  type="button"
                  className="station-stepper-btn dec"
                  onClick={() => handleIncrementDrill('lrdi', -1)}
                  title="Decrease 1 set"
                  aria-label="-1 Set"
                >
                  -1
                </button>
                <button
                  type="button"
                  className="station-stepper-btn inc highlight"
                  onClick={() => handleIncrementDrill('lrdi', 1)}
                  title="Solve 1 set"
                  aria-label="+1 Set"
                >
                  +1 Set
                </button>
                <button
                  type="button"
                  className="station-stepper-btn inc boost"
                  onClick={() => handleIncrementDrill('lrdi', 2)}
                  title="Solve 2 sets"
                  aria-label="+2 Sets"
                >
                  +2 Sets
                </button>
              </div>
            </div>
          </div>

          {/* VARC Station */}
          <div className="recovery-station-card varc">
            <div className="recovery-station-header">
              <div className="station-title-wrap">
                <div className="station-icon-bullet">
                  <Icons.BookOpen size={13} />
                </div>
                <span className="station-name">VARC Reading</span>
              </div>
              <span className="station-deficit">-{bottleneckWeekData?.deficitVarc || 4} RCs</span>
            </div>

            <div className="recovery-station-body">
              <div className="station-stat-row">
                <span>Target: <strong>{varcTarget} RCs</strong></span>
                <span>Solved: <strong style={{ color: '#34d399' }}>{varcSolved}</strong></span>
              </div>

              <div className="station-mini-track">
                <div className="station-mini-fill" style={{ width: `${varcPct}%` }} />
              </div>

              <div className="station-stepper-row">
                <button
                  type="button"
                  className="station-stepper-btn dec"
                  onClick={() => handleIncrementDrill('varc', -1)}
                  title="Decrease 1 RC"
                  aria-label="-1 RC"
                >
                  -1
                </button>
                <button
                  type="button"
                  className="station-stepper-btn inc highlight"
                  onClick={() => handleIncrementDrill('varc', 1)}
                  title="Solve 1 RC"
                  aria-label="+1 RC"
                >
                  +1 RC
                </button>
                <button
                  type="button"
                  className="station-stepper-btn inc boost"
                  onClick={() => handleIncrementDrill('varc', 2)}
                  title="Solve 2 RCs"
                  aria-label="+2 RCs"
                >
                  +2 RCs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lower 2-Column Matrix */}
      <div className="recovery-lower-grid">
        {/* Left: Concept Mastery Checklist + Next Radar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Concept Checklist */}
          <div className="recovery-checklist-card">
            <div className="recovery-checklist-header">
              <div className="recovery-checklist-title-wrap">
                <Icons.CheckCircle size={18} color="#10b981" />
                <h4>Prerequisite Concept Mastery Checklist</h4>
              </div>
              <span className="recovery-checklist-count">
                {completedSubtopics.length} of {subtopicItems.length || 12} Concepts Mastered
              </span>
            </div>

            <p className="recovery-checklist-note">
              Tick each foundational concept as you review the core lecture or notes (+50 EXP each):
            </p>

            <div className="recovery-subtopics-list">
              {subtopicItems.map((subtopic, sIdx) => {
                const isDone = completedSubtopics.includes(subtopic);
                return (
                  <button
                    key={subtopic || sIdx}
                    type="button"
                    className={`recovery-subtopic-item ${isDone ? 'done' : ''}`}
                    onClick={() => handleToggleSubtopic(subtopic)}
                  >
                    <div className={`recovery-subtopic-check ${isDone ? 'checked' : ''}`}>
                      {isDone ? <Icons.CheckCircle size={14} color="#10b981" /> : <span className="empty-check-dot" />}
                    </div>
                    <span className="recovery-subtopic-text">{subtopic}</span>
                    <span className="recovery-exp-tag">+50 EXP</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Locked Next Step Radar */}
          <div className="recovery-locked-card">
            <div className="recovery-locked-icon-wrap">
              <Icons.Lock size={18} />
            </div>
            <div>
              <span className="recovery-locked-tag">NEXT IN LINE (PAUSED)</span>
              <h4 className="recovery-locked-title">
                {propActiveMonth || 'Month 1'} • {propActiveWeek || 'Current Week'} Regular Syllabus
              </h4>
              <p className="recovery-locked-desc">
                Upcoming roadmap topics will automatically reactivate as soon as your {bottleneckWeek} prerequisite quota is cleared.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Recovery Mode Selector Cockpit */}
        <div className="recovery-strategy-card">
          <div className="recovery-strategy-header">
            <div className="recovery-section-badge strategy">
              <Icons.Zap size={20} />
            </div>
            <div>
              <h3 className="recovery-section-title" style={{ fontSize: '17px' }}>Recovery Mode</h3>
              <p className="recovery-section-subtitle">Choose your tactical catch-up protocol</p>
            </div>
          </div>

          <div className="recovery-strategies-list">
            {/* Strategy 1: Catch-Up Blitz */}
            <div
              role="button"
              tabIndex={0}
              className={`recovery-strategy-option ${activeStrategy === 'catch_up_blitz' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('catch_up_blitz')}
            >
              <div className="strategy-option-radio">
                <span className="radio-dot" />
              </div>
              <div className="strategy-option-info">
                <div className="strategy-top-row">
                  <span className="strategy-title">7-Day Catch-Up Micro-Blitz</span>
                  <div className="strategy-badges-cluster">
                    <span className="strategy-chip recommended">RECOMMENDED</span>
                    {activeStrategy === 'catch_up_blitz' && (
                      <span className="strategy-chip active">ACTIVE</span>
                    )}
                  </div>
                </div>
                <p className="strategy-desc">
                  Distributes +18 QA, +4 DILR across your upcoming 7 days to eliminate this backlog without slowing roadmap.
                </p>
              </div>
            </div>

            {/* Strategy 2: Weekend Sprint */}
            <div
              role="button"
              tabIndex={0}
              className={`recovery-strategy-option ${activeStrategy === 'weekend_sprint' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('weekend_sprint')}
            >
              <div className="strategy-option-radio">
                <span className="radio-dot" />
              </div>
              <div className="strategy-option-info">
                <div className="strategy-top-row">
                  <span className="strategy-title">Weekend Recovery Sprint</span>
                  {activeStrategy === 'weekend_sprint' && (
                    <span className="strategy-chip active">ACTIVE</span>
                  )}
                </div>
                <p className="strategy-desc">
                  Protects weekdays. Loads Saturday and Sunday with concentrated 4-hour deep practice blocks.
                </p>
              </div>
            </div>

            {/* Strategy 3: Schedule Shift */}
            <div
              role="button"
              tabIndex={0}
              className={`recovery-strategy-option ${activeStrategy === 'schedule_shift' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('schedule_shift')}
            >
              <div className="strategy-option-radio">
                <span className="radio-dot" />
              </div>
              <div className="strategy-option-info">
                <div className="strategy-top-row">
                  <span className="strategy-title">Extend Schedule (+1 Buffer Week)</span>
                  {activeStrategy === 'schedule_shift' && (
                    <span className="strategy-chip active">ACTIVE</span>
                  )}
                </div>
                <p className="strategy-desc">
                  Freezes progression and grants 7 dedicated days to clear this backlog before advancing.
                </p>
              </div>
            </div>

            {/* Strategy 4: High-Yield Pareto Triage */}
            <div
              role="button"
              tabIndex={0}
              className={`recovery-strategy-option ${activeStrategy === 'pareto_triage' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('pareto_triage')}
            >
              <div className="strategy-option-radio">
                <span className="radio-dot" />
              </div>
              <div className="strategy-option-info">
                <div className="strategy-top-row">
                  <span className="strategy-title">Pareto 80/20 High-Yield Triage</span>
                  {activeStrategy === 'pareto_triage' && (
                    <span className="strategy-chip active">ACTIVE</span>
                  )}
                </div>
                <p className="strategy-desc">
                  Compresses backlog by 50%. Focuses exclusively on top exam-weighted questions.
                </p>
              </div>
            </div>
          </div>

          {/* Offline Clearance Action */}
          <div className="recovery-override-box">
            <button
              type="button"
              className="recovery-override-btn"
              onClick={() => handleSwitchStrategy('mark_complete')}
            >
              <Icons.CheckCircle size={15} />
              <span>I already completed this offline (Clear Deficit)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
