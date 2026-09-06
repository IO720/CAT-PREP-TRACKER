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

  // When there are no backlogs, render a clear status card with actionable next steps
  if (!hasBacklog) {
    const activeM = propActiveMonth || 'Month 1';
    const activeW = propActiveWeek || 'Week 1';
    return (
      <div className="backlog-recovery-view-root">
        <div className="recovery-hero-banner" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '1.25rem' }}>
            <Icons.CheckCircle size={40} color="#38bdf8" />
          </div>
          <h2 className="recovery-hero-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            All Clear — Zero Active Backlogs
          </h2>
          <p className="recovery-hero-desc" style={{ maxWidth: '540px', margin: '0 auto 1.75rem auto' }}>
            Your preparation is 100% on schedule with no overdue modules. You are currently working on <strong style={{ color: '#38bdf8' }}>{activeM} • {activeW}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="guidance-primary-btn"
              onClick={() => onNavigateToDaily && onNavigateToDaily(activeM, activeW, 'Monday')}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <Icons.Drills size={15} />
              <span>Start {activeW} Daily Drills &rarr;</span>
            </button>
            <button
              type="button"
              className="guidance-outline-btn"
              onClick={onNavigateToTimeline}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <Icons.Timeline size={15} />
              <span>View Full Syllabus Roadmap</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backlog-recovery-view-root">
      {/* Toast alert */}
      {notification && (
        <div className="recovery-toast-alert">
          <Icons.Zap size={14} color="#38bdf8" />
          <span>{notification}</span>
        </div>
      )}

      {/* Atmospheric Glowing Top Bar */}
      <div className="recovery-hero-banner">
        <div className="recovery-hero-content">
          <div className="recovery-hero-badge-row">
            <span className="recovery-hero-status-pill">
              <span className="recovery-pulse-ping" />
              <Icons.AlertCircle size={14} />
              <span>ACTIVE BACKLOG RECOVERY COCKPIT</span>
            </span>
            <span className="recovery-hero-mode-pill">
              PAUSED AT WEEK {currentGlobalWeek}
            </span>
          </div>

          <h2 className="recovery-hero-title">
            Foundation Prerequisite Recovery Hub
          </h2>

          <p className="recovery-hero-desc">
            To prevent severe roadblocks in upcoming syllabus modules, your regular curriculum is temporarily paused. Complete your prerequisite <strong style={{ color: '#fbbf24' }}>{bottleneckMonth} • {bottleneckWeek}</strong> topics below first. Once conquered, your roadmap unlocks automatically.
          </p>

          {/* Fluid Clearance Meter */}
          <div className="recovery-clearance-meter-wrap">
            <div className="recovery-meter-top-row">
              <span className="recovery-meter-label">
                Prerequisite Mastery Clearance
              </span>
              <span className="recovery-meter-score">
                {backlogClearancePct}% Cleared ({totalDeficitDrills} Deficit Questions Remaining)
              </span>
            </div>

            <div className="recovery-meter-track">
              <div 
                className="recovery-meter-fill" 
                style={{ width: `${Math.max(5, backlogClearancePct)}%` }}
              />
            </div>

            <div className="recovery-meter-tags-row">
              <span className="recovery-tag quant">
                Quant: -{bottleneckWeekData?.deficitQuant || 120} Qs
              </span>
              <span className="recovery-tag lrdi">
                DILR: -{bottleneckWeekData?.deficitLrdi || 4} Sets
              </span>
              <span className="recovery-tag varc">
                VARC: -{bottleneckWeekData?.deficitVarc || 4} RCs
              </span>
              <span className="recovery-tag theory">
                Theory: {completedSubtopics.length}/{subtopicItems.length || 12} Concepts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECT ACTION GUIDANCE: WHAT TO START */}
      <div className="recovery-start-action-card">
        <div className="recovery-start-content">
          <div className="recovery-start-pill">
            <Icons.Target size={13} color="#38bdf8" />
            <span>START HERE FIRST</span>
          </div>
          <h3 className="recovery-start-heading">
            Prerequisite Topic: {bottleneckMonth} • {bottleneckWeek} Foundation Drills
          </h3>
          <p className="recovery-start-desc">
            Jump straight into the incomplete drills for {bottleneckMonth} • {bottleneckWeek}. You have <strong style={{ color: '#fbbf24' }}>{totalDeficitDrills} deficit questions</strong> remaining across Quantitative Aptitude (-{bottleneckWeekData?.deficitQuant || 0} Qs), DILR (-{bottleneckWeekData?.deficitLrdi || 0} Sets), and VARC (-{bottleneckWeekData?.deficitVarc || 0} RCs).
          </p>
        </div>
        <button
          type="button"
          className="recovery-direct-start-btn"
          onClick={() => onNavigateToDaily && onNavigateToDaily(bottleneckMonth, bottleneckWeek, 'Monday')}
        >
          <Icons.ArrowRight size={16} />
          <span>Start Prerequisite Drills Now &rarr;</span>
        </button>
      </div>

      {/* If Active Catch-Up Blitz or Weekend Sprint is active */}
      {state?.activeCatchUp && (
        <div className="recovery-active-plan-banner">
          <div className="active-plan-left">
            <Icons.Zap size={18} color="#fbbf24" />
            <div>
              <div className="active-plan-title">7-Day Catch-Up Micro-Blitz In Progress</div>
              <div className="active-plan-desc">
                Daily drill quotas on <strong>{state.activeCatchUp.targetMonth} • {state.activeCatchUp.targetWeek}</strong> are boosted (+{state.activeCatchUp.dailyExtraQuant} QA, +{state.activeCatchUp.dailyExtraLrdi} DILR) to absorb this backlog.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="guidance-primary-btn"
            onClick={() => onNavigateToDaily && onNavigateToDaily(state.activeCatchUp.targetMonth, state.activeCatchUp.targetWeek, 'Monday')}
          >
            <span>Go to Today's Boosted Drills ({state.activeCatchUp.targetWeek}) &rarr;</span>
          </button>
        </div>
      )}

      {/* Main Recovery Content Grid */}
      <div className="recovery-workspace-grid">

        {/* LEFT COLUMN: ACTIVE BOTTLENECK TOPICS (MUST COMPLETE FIRST) */}
        <div className="recovery-main-column">
          
          {/* Priority 1 Card: Bottleneck Topic Stations */}
          <div className="recovery-card priority-focus">
            <div className="recovery-card-header">
              <div className="recovery-card-title-left">
                <div className="recovery-icon-badge warning">
                  <Icons.Target size={20} />
                </div>
                <div>
                  <div className="recovery-priority-tag">
                    PRIORITY 1: COMPLETE THESE TOPICS FIRST
                  </div>
                  <h3 className="recovery-card-title">
                    {bottleneckMonth} • {bottleneckWeek} Foundation Topics
                  </h3>
                  <p className="recovery-card-subtitle">
                    Prerequisites for Week {Math.min(16, bottleneckGlobalIdx + 1)}+ modules
                  </p>
                </div>
              </div>

              <div className="recovery-card-actions">
                <button
                  type="button"
                  className="recovery-timer-shortcut-btn"
                  style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}
                  onClick={() => onNavigateToDaily && onNavigateToDaily(bottleneckMonth, bottleneckWeek, 'Monday')}
                  title="Jump straight to these drills in Daily Tracker"
                >
                  <Icons.ArrowRight size={14} />
                  <span>Go to Drills</span>
                </button>
                <button
                  type="button"
                  className="recovery-timer-shortcut-btn"
                  onClick={onNavigateToTimer}
                  title="Launch focus timer for this backlog topic"
                >
                  <Icons.Timer size={14} />
                  <span>Start Focus Session</span>
                </button>
              </div>
            </div>

            {/* Interactive Drill Stations */}
            <div className="recovery-stations-grid">
              {/* Quant Station */}
              <div className="recovery-station-card quant">
                <div className="recovery-station-header">
                  <span className="station-name">Quant Aptitude</span>
                  <span className="station-deficit">-{bottleneckWeekData?.deficitQuant || 18} Qs</span>
                </div>
                <div className="recovery-station-body">
                  <div className="station-stat-row">
                    <span>Target: <strong>{bottleneckWeekData?.targetQuant || 125} Qs</strong></span>
                    <span>Solved: <strong style={{ color: '#38bdf8' }}>{bottleneckWeekData?.quantSolved || 0}</strong></span>
                  </div>
                  <div className="station-stepper-row">
                    <button
                      type="button"
                      className="station-stepper-btn"
                      onClick={() => handleIncrementDrill('quant', -5)}
                      title="Decrease 5 questions"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn"
                      onClick={() => handleIncrementDrill('quant', -1)}
                      title="Decrease 1 question"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn add"
                      onClick={() => handleIncrementDrill('quant', 1)}
                      title="Solve 1 question"
                    >
                      +1 Q
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn add primary"
                      onClick={() => handleIncrementDrill('quant', 5)}
                      title="Solve 5 questions"
                    >
                      +5 Qs
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn add boost"
                      onClick={() => handleIncrementDrill('quant', 10)}
                      title="Solve 10 questions"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* DILR Station */}
              <div className="recovery-station-card lrdi">
                <div className="recovery-station-header">
                  <span className="station-name">DILR Puzzles</span>
                  <span className="station-deficit">-{bottleneckWeekData?.deficitLrdi || 4} Sets</span>
                </div>
                <div className="recovery-station-body">
                  <div className="station-stat-row">
                    <span>Target: <strong>{bottleneckWeekData?.targetLrdi || 25} Sets</strong></span>
                    <span>Solved: <strong style={{ color: '#c084fc' }}>{bottleneckWeekData?.lrdiSolved || 0}</strong></span>
                  </div>
                  <div className="station-stepper-row">
                    <button
                      type="button"
                      className="station-stepper-btn"
                      onClick={() => handleIncrementDrill('lrdi', -1)}
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn add primary"
                      onClick={() => handleIncrementDrill('lrdi', 1)}
                    >
                      +1 Set
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn add boost"
                      onClick={() => handleIncrementDrill('lrdi', 2)}
                    >
                      +2 Sets
                    </button>
                  </div>
                </div>
              </div>

              {/* VARC Station */}
              <div className="recovery-station-card varc">
                <div className="recovery-station-header">
                  <span className="station-name">VARC Comprehension</span>
                  <span className="station-deficit">-{bottleneckWeekData?.deficitVarc || 4} RCs</span>
                </div>
                <div className="recovery-station-body">
                  <div className="station-stat-row">
                    <span>Target: <strong>{bottleneckWeekData?.targetVarc || 25} RCs</strong></span>
                    <span>Solved: <strong style={{ color: '#34d399' }}>{bottleneckWeekData?.varcSolved || 0}</strong></span>
                  </div>
                  <div className="station-stepper-row">
                    <button
                      type="button"
                      className="station-stepper-btn"
                      onClick={() => handleIncrementDrill('varc', -1)}
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn add primary"
                      onClick={() => handleIncrementDrill('varc', 1)}
                    >
                      +1 RC
                    </button>
                    <button
                      type="button"
                      className="station-stepper-btn add boost"
                      onClick={() => handleIncrementDrill('varc', 2)}
                    >
                      +2 RCs
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtopic Theory Checklist */}
            <div className="recovery-checklist-box">
              <div className="recovery-checklist-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.CheckCircle size={16} color="#10b981" />
                  <h4>Prerequisite Concept Mastery Checklist</h4>
                </div>
                <span className="recovery-checklist-count">
                  {completedSubtopics.length} of {subtopicItems.length || 12} Concepts Mastered
                </span>
              </div>

              <p className="recovery-checklist-note">
                Tick each concept as you review the theory lecture or notes:
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
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Shortcut to Daily Tracker Week 1 */}
            <div className="recovery-card-footer">
              <button
                type="button"
                className="recovery-switch-week-btn"
                onClick={() => {
                  if (onNavigateToDaily) onNavigateToDaily(bottleneckMonth, bottleneckWeek, 'Monday');
                }}
              >
                <Icons.ArrowRight size={14} />
                <span>Jump to {bottleneckMonth} • {bottleneckWeek} in Daily Tracker &rarr;</span>
              </button>
            </div>
          </div>

          {/* Locked Next Step Card */}
          <div className="recovery-card locked-syllabus">
            <div className="recovery-locked-header">
              <div className="recovery-locked-icon-box">
                <Icons.Lock size={18} />
              </div>
              <div>
                <span className="recovery-locked-tag">NEXT IN LINE (PAUSED)</span>
                <h4>{propActiveMonth || 'Month 1'} • {propActiveWeek || 'Current Week'} Regular Syllabus</h4>
                <p>
                  Upcoming syllabus modules will resume automatically as soon as your {bottleneckWeek} prerequisite quota is conquered.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECOVERY STRATEGY CONTROLS */}
        <div className="recovery-side-column">
          <div className="recovery-card recovery-strategy-card">
            <div className="recovery-card-header">
              <div className="recovery-card-title-left">
                <div className="recovery-icon-badge strategy">
                  <Icons.Zap size={18} />
                </div>
                <div>
                  <h3 className="recovery-card-title">Recovery Mode</h3>
                  <p className="recovery-card-subtitle">Choose how to conquer your backlog</p>
                </div>
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
                    <span className="strategy-chip">RECOMMENDED</span>
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
                  </div>
                  <p className="strategy-desc">
                    Protects weekdays. Loads Saturday and Sunday with concentrated 4-hour deep practice blocks.
                  </p>
                </div>
              </div>

              {/* Strategy 3: Schedule Shift (+1 Buffer) */}
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
                  </div>
                  <p className="strategy-desc">
                    Compresses backlog by 50%. Focuses exclusively on top exam-weighted questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Override / Offline Clearance */}
            <div className="recovery-override-box">
              <button
                type="button"
                className="recovery-override-btn"
                onClick={() => handleSwitchStrategy('mark_complete')}
              >
                <Icons.CheckCircle size={14} />
                <span>I already completed this offline (Clear Deficit)</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
