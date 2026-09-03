import React, { useState } from 'react';
import { 
  getAllExams, 
  getActiveExamConfig, 
  DEFAULT_EXAM_ID, 
  TIMELINE_HORIZONS, 
  DEFAULT_TIMELINE_ID, 
  getAdjustedDailyQuotas,
  getTimelineHorizon
} from '../config/examConfig';
import { playSoftZenChime, playObjectiveCompleteGameSound } from '../utils/audioUtils';
import Stepper from './animations/Stepper';
import SpotlightCard from './animations/SpotlightCard';
import OnboardingMascotGuide from './OnboardingMascotGuide';

export default function OnboardingWelcomeModal({
  isOpen,
  onClose,
  onComplete,
  initialExamId = DEFAULT_EXAM_ID,
  initialHorizonId = DEFAULT_TIMELINE_ID,
  activeTheme = 'slate'
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || DEFAULT_EXAM_ID);
  const [selectedHorizonId, setSelectedHorizonId] = useState(initialHorizonId || DEFAULT_TIMELINE_ID);
  const [isMinimizing, setIsMinimizing] = useState(false);
  
  const rawExams = getAllExams();
  const selectedConfig = getActiveExamConfig(selectedExamId);
  const selectedHorizon = getTimelineHorizon(selectedHorizonId);
  const adjustedQuotas = getAdjustedDailyQuotas(selectedExamId, selectedHorizonId);

  const steps = [
    { id: 'exam', title: 'Target Exam' },
    { id: 'horizon', title: 'Prep Horizon' },
    { id: 'blueprint', title: 'Blueprint' }
  ];

  if (!isOpen) return null;

  const handleExamSelect = (examId) => {
    if (examId !== 'cat') return; // Locked for live release
    setSelectedExamId(examId);
    try {
      playSoftZenChime(0.12);
    } catch (e) {}
  };

  const handleHorizonSelect = (horizonId) => {
    if (horizonId !== '16_weeks') return; // Locked for current pace release
    setSelectedHorizonId(horizonId);
    try {
      playSoftZenChime(0.15);
    } catch (e) {}
  };

  const handleStepChange = (stepNum) => {
    setCurrentStep(stepNum);
    try {
      playSoftZenChime(0.1);
    } catch (e) {}
  };

  const executeFinish = (chosenExamId = selectedExamId, chosenHorizonId = selectedHorizonId) => {
    setIsMinimizing(false);
    const config = getActiveExamConfig(chosenExamId);
    const quotas = getAdjustedDailyQuotas(chosenExamId, chosenHorizonId);

    const payload = {
      targetExam: chosenExamId,
      targetYear: config.defaultYear || '2025',
      timelineHorizon: chosenHorizonId,
      dailyHoursGoal: quotas.dailyHours,
      dailyQuotas: {
        quant: quotas.quant,
        lrdi: quotas.lrdi,
        varc: quotas.varc
      }
    };

    try {
      localStorage.setItem('catalyze_target_exam', chosenExamId);
      localStorage.setItem('catalyze_timeline_horizon', chosenHorizonId);
      localStorage.setItem('catalyze_target_year', payload.targetYear);
      localStorage.setItem('catalyze_daily_hours_goal', String(quotas.dailyHours));
      localStorage.setItem('catalyze_onboarding_completed', 'true');
    } catch (e) {}

    if (typeof onComplete === 'function') {
      onComplete(payload);
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleGetStartedClick = () => {
    try {
      playObjectiveCompleteGameSound();
    } catch (e) {}

    setIsMinimizing(true);
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      executeFinish(selectedExamId, selectedHorizonId);
    } else {
      setTimeout(() => {
        executeFinish(selectedExamId, selectedHorizonId);
      }, 520);
    }
  };

  return (
    <div className={`onb-overlay ${isMinimizing ? 'minimizing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="onb-title">
      {/* Flying Mascot Morph Animation towards Bottom-Right */}
      {isMinimizing && (
        <div className="flying-mascot-projectile" aria-hidden="true">
          <div className="flying-mascot-glow" />
          <svg viewBox="0 0 100 80" className="flying-cat-svg">
            <defs>
              <linearGradient id="flyGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
                <stop offset="100%" stopColor="var(--accent-secondary, #818cf8)" />
              </linearGradient>
            </defs>
            <polygon points="18,50 24,14 40,38" fill="url(#flyGrad)" />
            <polygon points="82,50 76,14 60,38" fill="url(#flyGrad)" />
            <circle cx="50" cy="46" r="26" fill="url(#flyGrad)" />
            <ellipse cx="32" cy="62" rx="10" ry="6" fill="url(#flyGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <ellipse cx="68" cy="62" rx="10" ry="6" fill="url(#flyGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      <div className={`onb-card ${isMinimizing ? 'card-shrinking' : ''}`} data-theme={activeTheme}>
        {/* Sleek Top Header */}
        <div className="onb-header">
          <div className="onb-top-row">
            <span className="onb-tag">// WORKSPACE CALIBRATION</span>
            <button 
              type="button" 
              className="onb-close-btn"
              onClick={() => executeFinish(DEFAULT_EXAM_ID, DEFAULT_TIMELINE_ID)}
              aria-label="Close"
              title="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="onb-title-row">
            <h2 id="onb-title" className="onb-main-title">Target Examination & Timeline</h2>
            <p className="onb-subtext">Calibrate your syllabus, daily pacing, and drill quotas.</p>
          </div>
        </div>

        {/* Minimal Stepper Bar */}
        <div className="onb-stepper-wrap">
          <Stepper 
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </div>

        {/* Mascot Companion Guide with Dynamic Dialogue */}
        <div className="onb-mascot-container">
          <OnboardingMascotGuide 
            currentStep={currentStep}
            selectedExamConfig={selectedConfig}
            selectedHorizon={selectedHorizon}
            adjustedQuotas={adjustedQuotas}
          />
        </div>

        {/* Smooth Horizontal Slide Carousel for Steps */}
        <div className="onb-slider-viewport">
          <div 
            className="onb-slider-track"
            style={{ transform: `translateX(-${((currentStep - 1) * 100) / 3}%)` }}
          >
            {/* Slide 1: Target Exam Grid */}
            <div className="onb-slider-slide">
              <div className="onb-grid">
                {rawExams.map((exam) => {
                  const isSelected = selectedExamId === exam.id;
                  const isLocked = exam.id !== 'cat';

                  return (
                    <SpotlightCard
                      key={exam.id}
                      className={`onb-exam-spotlight-card ${isLocked ? 'locked' : ''}`}
                      isSelected={isSelected}
                      onClick={() => handleExamSelect(exam.id)}
                    >
                      <div className="onb-card-inner">
                        <div className="onb-card-top">
                          <div className="onb-card-meta">
                            <span className="onb-exam-code">{exam.shortName}</span>
                            <span className="onb-exam-badge">{exam.badge}</span>
                          </div>
                          {isLocked ? (
                            <div className="onb-lock-pill" title="Coming Soon">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                              <span className="onb-lock-status-default">LOCKED</span>
                              <span className="onb-lock-status-hover">COMING SOON</span>
                            </div>
                          ) : (
                            <div className={`onb-radio-circle ${isSelected ? 'checked' : ''}`}>
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="onb-check-svg">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="onb-card-desc">
                          {isLocked ? (
                            <span className="onb-locked-hint">Syllabus calibration in progress</span>
                          ) : (
                            exam.targetAudience.split(',')[0]
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>

            {/* Slide 2: Timeline Horizon & Pacing */}
            <div className="onb-slider-slide">
              <div className="onb-horizon-wrap">
                <div className="onb-horizon-grid">
                  {TIMELINE_HORIZONS.map((h) => {
                    const isSelected = selectedHorizonId === h.id;
                    const isLocked = h.id !== '16_weeks';

                    return (
                      <SpotlightCard
                        key={h.id}
                        className={`onb-horizon-spotlight-card ${isLocked ? 'locked' : ''}`}
                        isSelected={isSelected}
                        onClick={() => handleHorizonSelect(h.id)}
                      >
                        <div className="onb-card-inner">
                          <div className="onb-hz-top">
                            <span className="onb-hz-label">{h.label}</span>
                            {isLocked ? (
                              <div className="onb-lock-pill" title="Coming Soon">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span className="onb-lock-status-default">{h.badge}</span>
                                <span className="onb-lock-status-hover">COMING SOON</span>
                              </div>
                            ) : (
                              <span className="onb-hz-badge">{h.badge}</span>
                            )}
                          </div>
                          <div className="onb-hz-hours">
                            {isLocked ? (
                              <span className="onb-locked-hint">Pace roadmap calibration in progress</span>
                            ) : (
                              `${h.dailyHours} hrs / day`
                            )}
                          </div>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>

                {/* Dynamic Adjusted Quota Summary Strip */}
                <div className="onb-quota-strip">
                  <div className="onb-quota-pill">
                    <span className="onb-q-lbl">{selectedConfig.sections[0]?.shortName}:</span>
                    <span className="onb-q-val">{adjustedQuotas.quant} {selectedConfig.sections[0]?.unit}</span>
                  </div>
                  <div className="onb-quota-pill">
                    <span className="onb-q-lbl">{selectedConfig.sections[1]?.shortName}:</span>
                    <span className="onb-q-val">{adjustedQuotas.lrdi} {selectedConfig.sections[1]?.unit}</span>
                  </div>
                  <div className="onb-quota-pill">
                    <span className="onb-q-lbl">{selectedConfig.sections[2]?.shortName}:</span>
                    <span className="onb-q-val">{adjustedQuotas.varc} {selectedConfig.sections[2]?.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3: Clean, Airy & Inspiring Completion Launchpad */}
            <div className="onb-slider-slide">
              <div className="onb-ready-layout">
                {/* Tactical Status Pill */}
                <div className="onb-ready-badge">
                  <span className="onb-ready-dot" />
                  <span className="onb-ready-text">SYSTEM CALIBRATED // READY FOR CONQUEST</span>
                </div>

                {/* Hero Target Statement */}
                <div className="onb-ready-hero">
                  <h3 className="onb-ready-title">{selectedConfig.shortName} Blueprint Primed</h3>
                  <div className="onb-ready-meta">
                    <span className="onb-ready-meta-pill">{selectedHorizon.name} Horizon</span>
                    <span className="onb-ready-meta-bullet">•</span>
                    <span className="onb-ready-meta-hours">{selectedHorizon.dailyHours} hrs / day</span>
                  </div>
                </div>

                {/* Clean, Open Quota Counters (Zero Nested Boxes) */}
                <div className="onb-ready-stats-row">
                  {selectedConfig.sections.map((section, idx) => {
                    const quotaVal = idx === 0 ? adjustedQuotas.quant : idx === 1 ? adjustedQuotas.lrdi : adjustedQuotas.varc;
                    return (
                      <div key={section.id} className="onb-ready-stat-item">
                        <span className="onb-ready-stat-code">{section.shortName}</span>
                        <span className="onb-ready-stat-num">{quotaVal}</span>
                        <span className="onb-ready-stat-unit">{section.unit}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Motivational Kickoff Message */}
                <p className="onb-ready-quote">
                  Workspace calibrated for peak retention. 25 minutes of pure focus awaits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clean, Focused Footer */}
        <div className="onb-footer">
          <div className="onb-footer-left">
            {currentStep > 1 ? (
              <button
                type="button"
                className="onb-nav-back"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Back</span>
              </button>
            ) : (
              <div className="onb-target-info">
                <span className="onb-meta-label">Selected Target:</span>
                <span className="onb-meta-val">{selectedConfig.name}</span>
              </div>
            )}
          </div>

          <div className="onb-footer-right">
            {currentStep < 3 ? (
              <button
                type="button"
                className="onb-btn-primary"
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
              >
                <span>Continue</span>
                <span className="onb-btn-arrow">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="onb-btn-primary onb-btn-launch"
                onClick={handleGetStartedClick}
                aria-label="Get Started"
              >
                <span>Start Studying Now (Get Started)</span>
                <span className="onb-btn-arrow">↗</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .onb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.84);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
          animation: onbFade 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }

        .onb-overlay.minimizing {
          background: rgba(0, 0, 0, 0);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          pointer-events: none;
        }

        @keyframes onbFade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .onb-card {
          background: var(--card-bg, #0b0f19);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 28px 70px -15px rgba(0, 0, 0, 0.75);
          overflow: hidden;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .onb-card.card-shrinking {
          transform: scale(0.92);
          opacity: 0;
        }

        /* Flying Mascot Morph Animation towards Bottom-Right */
        .flying-mascot-projectile {
          position: fixed;
          top: 36%;
          left: 50%;
          width: 80px;
          height: 64px;
          z-index: 10005;
          pointer-events: none;
          animation: mascotFlyToBottomRight 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .flying-mascot-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent-color, #38bdf8) 0%, transparent 70%);
          opacity: 0.6;
          animation: flyGlowPulse 0.5s ease-in-out infinite;
        }

        @keyframes flyGlowPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0.9; }
        }

        .flying-cat-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 16px var(--accent-color, #38bdf8));
        }

        @keyframes mascotFlyToBottomRight {
          0% {
            top: 36%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          40% {
            transform: translate(-30%, -80px) scale(1.15) rotate(-6deg);
            opacity: 1;
          }
          100% {
            top: calc(100vh - 46px);
            left: calc(100vw - 84px);
            transform: translate(0, 0) scale(0.48) rotate(0deg);
            opacity: 0.9;
          }
        }

        .onb-header {
          padding: 16px 22px 6px 22px;
          flex-shrink: 0;
        }

        .onb-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .onb-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent-color, #38bdf8);
        }

        .onb-close-btn {
          background: none;
          border: none;
          color: var(--text-tertiary, #64748b);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.15s ease;
        }

        .onb-close-btn:hover {
          color: var(--text-primary, #ffffff);
        }

        .onb-title-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .onb-main-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .onb-subtext {
          font-size: 11.5px;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
        }

        .onb-stepper-wrap {
          padding: 4px 14px 6px 14px;
          flex-shrink: 0;
        }

        .onb-mascot-container {
          padding: 0 20px;
          flex-shrink: 0;
        }

        /* Slide Viewport & Track */
        .onb-slider-viewport {
          overflow: hidden;
          width: 100%;
          position: relative;
          flex: 1;
          min-height: 0;
        }

        .onb-slider-track {
          display: flex;
          width: 300%;
          transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .onb-slider-slide {
          width: 33.333333%;
          flex-shrink: 0;
          box-sizing: border-box;
          padding: 4px 20px 14px 20px;
          max-height: calc(90vh - 210px);
          overflow-y: auto;
        }

        /* Step 1: Exam Grid - 2 columns on desktop, 1 column on narrow screens */
        .onb-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 620px) {
          .onb-grid {
            grid-template-columns: 1fr;
          }
        }

        .onb-exam-spotlight-card {
          border-radius: 10px;
        }

        .onb-exam-spotlight-card.locked,
        .onb-horizon-spotlight-card.locked {
          cursor: not-allowed !important;
          opacity: 0.6;
          transition: all 0.22s ease;
          border-color: rgba(255, 255, 255, 0.05);
        }

        .onb-exam-spotlight-card.locked:hover,
        .onb-horizon-spotlight-card.locked:hover {
          opacity: 0.95;
          border-color: rgba(251, 191, 36, 0.35);
          background: rgba(251, 191, 36, 0.03);
        }

        .onb-lock-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--text-tertiary, #94a3b8);
          transition: all 0.2s ease;
          flex-shrink: 0;
          white-space: nowrap;
          margin-left: auto;
        }

        .onb-lock-status-default {
          display: inline;
        }

        .onb-lock-status-hover {
          display: none;
          color: #fbbf24;
          font-weight: 800;
        }

        .onb-exam-spotlight-card.locked:hover .onb-lock-pill,
        .onb-horizon-spotlight-card.locked:hover .onb-lock-pill {
          background: rgba(251, 191, 36, 0.12);
          border-color: rgba(251, 191, 36, 0.4);
          color: #fbbf24;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
        }

        .onb-exam-spotlight-card.locked:hover .onb-lock-status-default,
        .onb-horizon-spotlight-card.locked:hover .onb-lock-status-default {
          display: none;
        }

        .onb-exam-spotlight-card.locked:hover .onb-lock-status-hover,
        .onb-horizon-spotlight-card.locked:hover .onb-lock-status-hover {
          display: inline;
        }

        .onb-locked-hint {
          font-size: 10px;
          color: #64748b;
          font-style: italic;
          letter-spacing: 0.01em;
        }

        .onb-card-inner {
          padding: 11px 13px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .onb-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-width: 0;
          width: 100%;
        }

        .onb-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          flex: 1 1 auto;
          overflow: hidden;
        }

        .onb-exam-code {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        .onb-exam-badge {
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-tertiary, #64748b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 105px;
        }

        .spotlight-card-root.selected .onb-exam-badge {
          background: rgba(56, 189, 248, 0.14);
          color: var(--accent-color, #38bdf8);
        }

        .onb-radio-circle {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0b0f19;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .onb-radio-circle.checked {
          background: var(--accent-color, #38bdf8);
          border-color: var(--accent-color, #38bdf8);
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }

        .onb-check-svg {
          animation: onbCheckPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes onbCheckPop {
          0% { transform: scale(0.5); }
          100% { transform: scale(1); }
        }

        .onb-card-desc {
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Step 2: Horizon Grid */
        .onb-horizon-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .onb-horizon-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .onb-hz-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .onb-hz-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
        }

        .onb-hz-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 2px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-tertiary, #64748b);
        }

        .spotlight-card-root.selected .onb-hz-badge {
          background: rgba(56, 189, 248, 0.14);
          color: var(--accent-color, #38bdf8);
        }

        .onb-hz-hours {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
          margin-top: 1px;
        }

        .spotlight-card-root.selected .onb-hz-hours {
          color: var(--accent-color, #38bdf8);
          font-weight: 600;
        }

        /* Quota Summary Strip */
        .onb-quota-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
        }

        .onb-quota-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          flex: 1;
          justify-content: center;
        }

        .onb-q-lbl {
          color: var(--text-secondary, #94a3b8);
          font-weight: 500;
        }

        .onb-q-val {
          color: var(--text-primary, #ffffff);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
        }

        /* Step 3: Clean, Airy & Inviting Completion Layout */
        .onb-ready-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px 14px 14px 14px;
          gap: 14px;
        }

        .onb-ready-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.22);
          border-radius: 9999px;
        }

        .onb-ready-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .onb-ready-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          font-weight: 700;
          color: #10b981;
          letter-spacing: 0.06em;
        }

        .onb-ready-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .onb-ready-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--text-primary, #ffffff);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .onb-ready-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
        }

        .onb-ready-meta-pill {
          color: var(--accent-color, #38bdf8);
          font-weight: 600;
        }

        .onb-ready-meta-bullet {
          color: var(--text-tertiary, #64748b);
        }

        .onb-ready-meta-hours {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
        }

        /* Borderless, Airy Stats Row */
        .onb-ready-stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          width: 100%;
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .onb-ready-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          min-width: 75px;
        }

        .onb-ready-stat-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-color, #38bdf8);
          letter-spacing: 0.05em;
        }

        .onb-ready-stat-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary, #ffffff);
          line-height: 1.1;
        }

        .onb-ready-stat-unit {
          font-size: 10px;
          color: var(--text-secondary, #94a3b8);
        }

        .onb-ready-quote {
          font-size: 11.5px;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
          max-width: 440px;
          line-height: 1.4;
        }

        /* Footer */
        .onb-footer {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.015);
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-shrink: 0;
        }

        .onb-footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .onb-nav-back {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: var(--text-secondary, #94a3b8);
          font-size: 11px;
          font-weight: 600;
          padding: 5px 9px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .onb-nav-back:hover {
          color: var(--text-primary, #ffffff);
          border-color: rgba(255, 255, 255, 0.22);
        }

        .onb-target-info {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
        }

        .onb-meta-label {
          color: var(--text-tertiary, #64748b);
        }

        .onb-meta-val {
          color: var(--accent-color, #38bdf8);
          font-weight: 700;
        }

        .onb-footer-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .onb-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 18px;
          background: var(--text-primary, #ffffff);
          color: var(--bg-primary, #0b0f19);
          border: 1px solid var(--text-primary, #ffffff);
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .onb-btn-primary:hover {
          background: transparent;
          color: var(--text-primary, #ffffff);
        }

        .onb-btn-launch {
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
          background: var(--accent-color, #38bdf8);
          color: #0b0f19;
          border-color: var(--accent-color, #38bdf8);
        }

        .onb-btn-launch:hover {
          background: transparent;
          color: var(--accent-color, #38bdf8);
        }

        .onb-btn-arrow {
          font-size: 12px;
          font-weight: 900;
        }

        /* Mobile specific responsiveness */
        @media (max-width: 540px) {
          .onb-overlay {
            padding: 8px;
          }

          .onb-card {
            max-height: 94vh;
            border-radius: 12px;
          }

          .onb-header {
            padding: 12px 14px 4px 14px;
          }

          .onb-main-title {
            font-size: 15px;
          }

          .onb-subtext {
            font-size: 11px;
          }

          .onb-stepper-wrap {
            padding: 2px 10px 4px 10px;
          }

          .onb-mascot-container {
            padding: 0 14px;
          }

          .onb-slider-slide {
            padding: 4px 14px 10px 14px;
            max-height: calc(94vh - 190px);
          }

          .onb-grid, .onb-horizon-grid {
            gap: 8px;
          }

          .onb-card-inner {
            padding: 8px 10px;
          }

          .onb-card-desc {
            font-size: 10px;
          }

          .onb-footer {
            padding: 8px 14px;
          }

          .onb-btn-primary {
            padding: 6px 14px;
            font-size: 11px;
          }
        }
      `}} />
    </div>
  );
}
