import React, { useState, useMemo } from 'react';
import { Icons } from './AspirantIcons';
import { generateRecoveryOptions } from '../utils/adaptiveStudyEngine';
import { analyzeAspirantBehavior } from '../utils/studyBehaviorEngine';
import { playGamingAchievementSound } from '../utils/audioUtils';

// Vector Chevron SVGs to strictly comply with Zero-Emoji Policy
const ChevronDown = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export default function AdaptiveWeekReviewModal({
  isOpen,
  onClose,
  progressData,
  onApplyPlan,
  state = null
}) {
  const recoveryOptions = useMemo(() => {
    if (!progressData) return {};
    return generateRecoveryOptions(progressData);
  }, [progressData]);

  // Analyze study behavioral profile
  const behaviorDiagnosis = useMemo(() => {
    return analyzeAspirantBehavior(state, progressData);
  }, [state, progressData]);

  const effectiveRecommendedPlanId = useMemo(() => {
    if (!progressData?.isElapsed || (progressData?.deficitQuant + progressData?.deficitLrdi + progressData?.deficitVarc) <= 0) {
      return 'stay_on_week';
    }
    return behaviorDiagnosis?.primaryPlanId || progressData?.recommendedPlan || 'stay_on_week';
  }, [behaviorDiagnosis, progressData]);

  // Selected solution tab: defaults to behavioral recommendation
  const [selectedPlanId, setSelectedPlanId] = useState(effectiveRecommendedPlanId);
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  if (!isOpen || !progressData) return null;

  const {
    monthKey,
    weekKey,
    globalWeekIdx,
    quantSolved,
    lrdiSolved,
    varcSolved,
    targetQuant,
    targetLrdi,
    targetVarc,
    studyHoursLogged,
    targetHours,
    deficitQuant,
    deficitLrdi,
    deficitVarc,
    overallProgressPct,
    quantPct,
    lrdiPct,
    varcPct,
    completedSubtopicsCount,
    totalSubtopicsCount,
    statusBadge,
    badgeColor
  } = progressData;

  const handleSelectOption = (planId) => {
    setSelectedPlanId(planId);
  };

  const handleConfirmAction = (overridePlanId = null) => {
    const planToApply = overridePlanId || selectedPlanId || effectiveRecommendedPlanId;
    try {
      playGamingAchievementSound(0.04);
    } catch (_err) {}

    const chosenOption = recoveryOptions[planToApply] || recoveryOptions.stayOnWeek || recoveryOptions.catchUpBlitz;
    if (onApplyPlan) {
      onApplyPlan(planToApply, chosenOption, progressData);
    }
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const totalDeficitDrills = deficitQuant + deficitLrdi + deficitVarc;

  // Catalog of recovery solutions
  const allOptionsList = [
    {
      id: 'stay_on_week',
      title: 'Continue Current Week Drills (On Track)',
      category: 'Foundation Pacing',
      icon: Icons.Target,
      accentColor: '#10b981',
      desc: 'Keep pacing through your active week without injecting extra backlog drills. Conquer your standard daily targets across Monday to Sunday to build consistent momentum.',
      direction: `${monthKey} • ${weekKey} daily drills`
    },
    {
      id: 'reset_start_date',
      title: 'Reset Prep Start Date to Today (Fresh Start)',
      category: 'Clean Slate',
      icon: Icons.Calendar,
      accentColor: '#fbbf24',
      desc: 'Re-anchors your entire 16-week prep timeline to today. Zero out backlog and start fresh from Month 1: Week 1 with no overdue penalties.',
      direction: 'Month 1: Week 1 • Day 1 (Today) fresh start'
    },
    {
      id: 'redirect_week1',
      title: 'Start From Week 1 (Keep Current Timeline)',
      category: 'Foundation Start',
      icon: Icons.Target,
      accentColor: '#38bdf8',
      desc: 'Keep your calendar timeline as-is, but immediately jump to Month 1: Week 1 to complete the initial theory concepts and foundation drills.',
      direction: 'Month 1: Week 1 • Monday (Initial Exercises)'
    },
    {
      id: 'schedule_shift',
      title: 'Extend Schedule (+1 Buffer Week)',
      category: 'Topic Extension',
      icon: Icons.Calendar,
      accentColor: '#c084fc',
      desc: "Freezes progression and grants an extra 7-day buffer dedicated to mastering this week's exact topics. Future weeks shift forward.",
      direction: `${weekKey} (Extended Buffer) • Day 1 (Monday)`
    },
    {
      id: 'catch_up_blitz',
      title: '7-Day Catch-Up Micro-Blitz',
      category: 'Parallel Recovery',
      icon: Icons.Zap,
      accentColor: '#38bdf8',
      desc: `Progresses to next week on schedule, but automatically injects +${recoveryOptions.catchUpBlitz?.dailyExtraQuant || 0} QA & +${recoveryOptions.catchUpBlitz?.dailyExtraLrdi || 0} DILR daily micro-targets.`,
      direction: `Next Week • Day 1 with +${recoveryOptions.catchUpBlitz?.dailyExtraQuant || 0} QA daily boost`
    },
    {
      id: 'weekend_sprint',
      title: 'Weekend Recovery Sprint',
      category: 'Deep Work',
      icon: Icons.Flame,
      accentColor: '#f59e0b',
      desc: 'Leaves weekdays normal and schedules 2 focused weekend deep-sprint blocks to clear the deficit cleanly.',
      direction: 'Next Week Saturday & Sunday deep sprint'
    },
    {
      id: 'pareto_triage',
      title: 'Pareto 80/20 High-Yield Triage',
      category: 'Core Concepts',
      icon: Icons.Filter,
      accentColor: '#10b981',
      desc: `Prioritize non-negotiable core concepts (e.g. ${recoveryOptions.paretoTriage?.highYieldData?.quant?.[0] || 'foundation topics'}) and shelve edge topics for post-syllabus revision.`,
      direction: `${weekKey} Checklist with high-yield concepts`
    },
    {
      id: 'mark_complete',
      title: 'I Completed This Portion Offline',
      category: 'Self-Study',
      icon: Icons.CheckCircle,
      accentColor: '#10b981',
      desc: 'Confirms that you practiced these concepts in coaching books or mock analysis. Unlocks the next topic with 100% completed status.',
      direction: "Next Week's Drills unlocked cleanly"
    }
  ];

  const spotlightOption = allOptionsList.find(opt => opt.id === effectiveRecommendedPlanId) || allOptionsList[0];
  const otherOptions = allOptionsList.filter(opt => opt.id !== spotlightOption.id);

  // Persona Icon Picker
  const PersonaIcon = behaviorDiagnosis?.archetype?.iconName === 'Flame' ? Icons.Flame
    : behaviorDiagnosis?.archetype?.iconName === 'RotateCcw' ? Icons.RotateCcw
    : behaviorDiagnosis?.archetype?.iconName === 'Clock' ? Icons.Clock
    : behaviorDiagnosis?.archetype?.iconName === 'Filter' ? Icons.Filter
    : Icons.Zap;

  return (
    <div 
      className="adaptive-checkpoint-backdrop"
      onClick={onClose}
      data-lenis-prevent="true"
    >
      <div 
        className="adaptive-checkpoint-card"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
      >
        {/* Top Glow Accent */}
        <div className="checkpoint-top-glow" />

        {/* Modal Header */}
        <div className="checkpoint-header">
          <div className="checkpoint-header-left">
            <div className="checkpoint-icon-badge">
              <Icons.Target size={20} color="#38bdf8" />
            </div>
            <div className="checkpoint-title-wrap">
              <div className="checkpoint-title-row">
                <h3 className="checkpoint-title">
                  Adaptive Syllabus Checkpoint
                </h3>
                <span 
                  className="checkpoint-status-tag"
                  style={{
                    backgroundColor: `${badgeColor}22`,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}44`
                  }}
                >
                  {statusBadge}
                </span>
              </div>
              <p className="checkpoint-subtitle">
                {monthKey} • {weekKey} Syllabus Progression Review — Did you complete this week's syllabus portion?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="checkpoint-close-btn"
            title="Close checkpoint"
          >
            <Icons.Close size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="checkpoint-body" data-lenis-prevent="true">

          {/* Section 1: Unified Diagnostic Cockpit (Mastery Audit + Study Pattern in one ultra-compact card) */}
          <div className="checkpoint-diagnostic-cockpit">
            {/* Top row: Progress Summary & Persona Pill */}
            <div className="checkpoint-cockpit-header">
              <div className="checkpoint-cockpit-status">
                <span className="checkpoint-cockpit-score">
                  {overallProgressPct}% Completed
                </span>
                <span className="checkpoint-cockpit-divider">•</span>
                <span className="checkpoint-cockpit-backlog">
                  {totalDeficitDrills > 0 
                    ? (progressData?.isElapsed ? `-${totalDeficitDrills} Drills Backlog` : `${totalDeficitDrills} Drills Remaining`) 
                    : 'Quota Cleared'}
                </span>
              </div>

              <div 
                className="checkpoint-cockpit-persona-pill"
                style={{
                  borderColor: `${behaviorDiagnosis.archetype.color}55`,
                  background: `${behaviorDiagnosis.archetype.color}15`
                }}
              >
                <PersonaIcon size={14} color={behaviorDiagnosis.archetype.color} />
                <span style={{ color: behaviorDiagnosis.archetype.color, fontWeight: 800 }}>
                  {behaviorDiagnosis.diagnosticTitle}
                </span>
                <span 
                  className="checkpoint-persona-chip-tag"
                  style={{
                    background: `${behaviorDiagnosis.archetype.color}33`,
                    color: behaviorDiagnosis.archetype.color
                  }}
                >
                  {behaviorDiagnosis.archetype.badge}
                </span>
              </div>
            </div>

            {/* Middle row: Ultra-compact metrics row (QA, DILR, VARC, Theory, Hours) */}
            <div className="checkpoint-compact-metrics-row">
              <div className="checkpoint-mini-metric">
                <span className="mini-metric-label quant">QA</span>
                <div className="mini-metric-bar">
                  <div className="mini-fill quant" style={{ width: `${quantPct}%` }} />
                </div>
                <span className="mini-metric-val">{quantSolved}/{targetQuant}</span>
              </div>

              <div className="checkpoint-mini-metric">
                <span className="mini-metric-label lrdi">DILR</span>
                <div className="mini-metric-bar">
                  <div className="mini-fill lrdi" style={{ width: `${lrdiPct}%` }} />
                </div>
                <span className="mini-metric-val">{lrdiSolved}/{targetLrdi}</span>
              </div>

              <div className="checkpoint-mini-metric">
                <span className="mini-metric-label varc">VARC</span>
                <div className="mini-metric-bar">
                  <div className="mini-fill varc" style={{ width: `${varcPct}%` }} />
                </div>
                <span className="mini-metric-val">{varcSolved}/{targetVarc}</span>
              </div>

              <div className="checkpoint-mini-metric text-only">
                <Icons.CheckCircle size={12} color="#10b981" />
                <span>Theory: <strong>{completedSubtopicsCount}/{totalSubtopicsCount}</strong></span>
              </div>

              <div className="checkpoint-mini-metric text-only">
                <Icons.Clock size={12} color="#f59e0b" />
                <span>Hours: <strong>{studyHoursLogged.toFixed(1)}/{targetHours}h</strong></span>
              </div>
            </div>

            {/* Bottom row: Diagnostic Rationale & Habit Telemetry chips */}
            <div className="checkpoint-cockpit-rationale-box">
              <p className="checkpoint-cockpit-rationale-text">
                {behaviorDiagnosis.diagnosticRationale}
              </p>
              <div className="checkpoint-cockpit-telemetry-chips">
                <span>Weekday: <strong>{behaviorDiagnosis.metrics.weekdayAvgHours}h</strong></span>
                <span>Weekend: <strong>{behaviorDiagnosis.metrics.weekendAvgHours}h</strong></span>
                <span>Consistency: <strong>{behaviorDiagnosis.metrics.regularityScore}%</strong></span>
              </div>
            </div>
          </div>

          {/* Section 2: AI Spotlight Recommended Solution */}
          <div className="checkpoint-spotlight-wrapper">
            <div className="checkpoint-options-section-label">
              AI Tailored Recommendation:
            </div>

            <div 
              className={`checkpoint-spotlight-box ${selectedPlanId === spotlightOption.id ? 'active' : ''}`}
            >
              <div className="checkpoint-spotlight-top-tag">
                <div className="checkpoint-spotlight-badge">
                  <Icons.Zap size={12} />
                  <span>RECOMMENDED FOR YOUR STUDY PATTERN</span>
                </div>
                <span className="checkpoint-spotlight-category" style={{ color: spotlightOption.accentColor }}>
                  {spotlightOption.category}
                </span>
              </div>

              <div className="checkpoint-spotlight-title-row">
                <div className="checkpoint-spotlight-title-left">
                  <div 
                    className="checkpoint-spotlight-icon-box"
                    style={{
                      background: `${spotlightOption.accentColor}22`,
                      color: spotlightOption.accentColor
                    }}
                  >
                    <spotlightOption.icon size={18} />
                  </div>
                  <div>
                    <h3 className="checkpoint-spotlight-title">
                      {spotlightOption.title}
                    </h3>
                    <div className="checkpoint-start-direction">
                      <Icons.ArrowRight size={11} />
                      <span>Directs you to: <strong>{spotlightOption.direction}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="checkpoint-spotlight-desc">
                {spotlightOption.desc}
              </p>

              <div className="checkpoint-spotlight-footer">
                <button
                  type="button"
                  className="checkpoint-spotlight-apply-btn"
                  onClick={() => handleConfirmAction(spotlightOption.id)}
                >
                  <span>{spotlightOption.id === 'stay_on_week' ? 'Continue Drills & Stay on Track' : 'Apply Recommended Plan'}</span>
                  <Icons.ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Collapsible Alternative Recovery Options */}
          <div className="checkpoint-alternatives-section">
            <button
              type="button"
              className="checkpoint-accordion-toggle"
              onClick={() => setShowOtherOptions(!showOtherOptions)}
              aria-expanded={showOtherOptions}
            >
              <div className="checkpoint-accordion-toggle-left">
                <Icons.Filter size={14} />
                <span>
                  Browse Alternative Recovery Options ({otherOptions.length})
                </span>
              </div>
              <div className="checkpoint-accordion-toggle-right">
                <span className="checkpoint-toggle-hint">
                  {showOtherOptions ? 'Hide alternatives' : 'Click to explore other plans'}
                </span>
                {showOtherOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
            </button>

            {/* Alternatives drawer - rendered in DOM with collapsible display */}
            <div 
              className="checkpoint-other-options-drawer"
              style={{ display: showOtherOptions ? 'flex' : 'none' }}
            >
              {otherOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = selectedPlanId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`checkpoint-option-item ${isSelected ? 'active' : ''}`}
                  >
                    <div 
                      className="checkpoint-option-icon-box"
                      style={{
                        background: `${option.accentColor}18`,
                        color: option.accentColor
                      }}
                    >
                      <OptionIcon size={18} />
                    </div>
                    <div className="checkpoint-option-content">
                      <div className="checkpoint-option-header-row">
                        <span className="checkpoint-option-title">
                          <span>{option.title}</span>
                          {isSelected && (
                            <span className="checkpoint-rec-pill" style={{ background: `${option.accentColor}25`, color: option.accentColor }}>Selected</span>
                          )}
                        </span>
                        <span className="checkpoint-option-category" style={{ color: option.accentColor }}>
                          {option.category}
                        </span>
                      </div>
                      <p className="checkpoint-option-desc">
                        {option.desc}
                      </p>
                      <div className="checkpoint-start-direction">
                        <Icons.ArrowRight size={11} />
                        <span>Directs you to: <strong>{option.direction}</strong></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="checkpoint-footer">
          <button
            type="button"
            onClick={onClose}
            className="checkpoint-cancel-btn"
          >
            Stay on This Week
          </button>

          <button
            type="button"
            onClick={() => handleConfirmAction(selectedPlanId)}
            className="checkpoint-submit-btn"
          >
            <Icons.ArrowRight size={15} />
            <span>{selectedPlanId === 'stay_on_week' ? 'Continue Drills & Stay on Track' : 'Apply Plan & Start Drills'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
