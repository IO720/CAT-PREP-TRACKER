import React, { useState, useEffect, useMemo } from 'react';
import { stripEmojis } from '../utils/textUtils';
import SmoothCaretInput from './animations/SmoothCaretInput';

// Helper to extract numeric target from target strings like "Solve 18 Quant Questions"
export const parseTargetNumber = (targetStr, fallback = 18) => {
  if (!targetStr || typeof targetStr !== 'string') return fallback;
  const match = targetStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : fallback;
};

export default function SessionCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  sessionData,
  todayDay = {},
  activeWeekDays = [],
  activeWeekName = 'This Week'
}) {
  if (!isOpen || !sessionData) return null;

  const {
    subject = 'Quant',
    durationMinutes = 1,
    startTimeStr = '',
    endTimeStr = '',
    initialNotes = ''
  } = sessionData;

  const cleanSubject = stripEmojis(subject || 'General');
  const subjKey = cleanSubject.toLowerCase().trim();
  const isDrillSubject = ['quant', 'lrdi', 'varc'].includes(subjKey);

  // Determine subject units and fallbacks
  const { unitName, defaultDailyTarget, defaultWeeklyTarget } = useMemo(() => {
    if (subjKey === 'lrdi') {
      return { unitName: 'Sets', defaultDailyTarget: 4, defaultWeeklyTarget: 24 };
    }
    if (subjKey === 'varc') {
      return { unitName: 'RCs', defaultDailyTarget: 4, defaultWeeklyTarget: 24 };
    }
    return { unitName: 'Questions', defaultDailyTarget: 18, defaultWeeklyTarget: 108 };
  }, [subjKey]);

  // Extract Daily and Weekly Quota info
  const {
    currentTodaySolved,
    dailyTarget,
    currentWeeklySolved,
    weeklyTarget,
    isAlreadyDone
  } = useMemo(() => {
    let target = defaultDailyTarget;
    let todaySolved = 0;
    let alreadyDone = false;

    if (subjKey === 'quant') {
      target = parseTargetNumber(todayDay.quantTarget, defaultDailyTarget);
      todaySolved = todayDay.quantCount || 0;
      alreadyDone = Boolean(todayDay.quantCompleted);
    } else if (subjKey === 'lrdi') {
      target = parseTargetNumber(todayDay.lrdiTarget, defaultDailyTarget);
      todaySolved = todayDay.lrdiCount || 0;
      alreadyDone = Boolean(todayDay.lrdiCompleted);
    } else if (subjKey === 'varc') {
      target = parseTargetNumber(todayDay.varcTarget, defaultDailyTarget);
      todaySolved = todayDay.varcCount || 0;
      alreadyDone = Boolean(todayDay.varcCompleted);
    }

    // Weekly metrics
    let weekTargetTotal = 0;
    let weekSolvedTotal = 0;
    (activeWeekDays || []).forEach(d => {
      if (subjKey === 'quant') {
        weekTargetTotal += parseTargetNumber(d.quantTarget, defaultDailyTarget);
        weekSolvedTotal += (d.quantCount || 0);
      } else if (subjKey === 'lrdi') {
        weekTargetTotal += parseTargetNumber(d.lrdiTarget, defaultDailyTarget);
        weekSolvedTotal += (d.lrdiCount || 0);
      } else if (subjKey === 'varc') {
        weekTargetTotal += parseTargetNumber(d.varcTarget, defaultDailyTarget);
        weekSolvedTotal += (d.varcCount || 0);
      }
    });

    return {
      currentTodaySolved: todaySolved,
      dailyTarget: Math.max(1, target),
      currentWeeklySolved: weekSolvedTotal,
      weeklyTarget: Math.max(1, weekTargetTotal || defaultWeeklyTarget),
      isAlreadyDone: alreadyDone
    };
  }, [subjKey, todayDay, activeWeekDays, defaultDailyTarget, defaultWeeklyTarget]);

  // Questions solved during this session (defaults to 0 for deliberate honest tracking)
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [userToggledComplete, setUserToggledComplete] = useState(null);
  const [sessionNotes, setSessionNotes] = useState(stripEmojis(initialNotes || ''));

  // Reset state whenever modal opens with new session data
  useEffect(() => {
    setQuestionsSolved(0);
    setUserToggledComplete(null);
    setSessionNotes(stripEmojis(initialNotes || ''));
  }, [isOpen, initialNotes, subjKey]);

  // Projected counts
  const projectedToday = currentTodaySolved + Math.max(0, questionsSolved);
  const projectedWeekly = currentWeeklySolved + Math.max(0, questionsSolved);
  const isDailyQuotaMet = projectedToday >= dailyTarget;

  // Determine whether to mark drill as complete
  const markCompleted = userToggledComplete !== null
    ? userToggledComplete
    : (isAlreadyDone || isDailyQuotaMet);

  // Quick addition chips
  const quickChips = useMemo(() => {
    if (subjKey === 'quant') {
      return [
        { label: '+0 (Study)', val: 0 },
        { label: '+2', val: 2 },
        { label: '+5', val: 5 },
        { label: `+${dailyTarget} (Quota)`, val: dailyTarget }
      ];
    }
    return [
      { label: '+0 (Study)', val: 0 },
      { label: '+1', val: 1 },
      { label: '+2', val: 2 },
      { label: `+${dailyTarget} (Quota)`, val: dailyTarget }
    ];
  }, [subjKey, dailyTarget]);

  const handleStep = (delta) => {
    setQuestionsSolved(prev => Math.max(0, prev + delta));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      notes: sessionNotes,
      questionsSolved: isDrillSubject ? Math.max(0, questionsSolved) : 0,
      markCompleted: isDrillSubject ? markCompleted : false
    });
  };

  return (
    <div className="session-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="session-modal-title">
      <div className="session-modal-card">
        
        {/* Clean Modal Header */}
        <div className="session-modal-head">
          <div className="session-modal-head-left">
            <span className={`session-subject-badge ${subjKey}`}>
              {cleanSubject}
            </span>
            <span className="session-duration-tag">
              {durationMinutes}m focus {startTimeStr && endTimeStr ? `(${startTimeStr} - ${endTimeStr})` : ''}
            </span>
          </div>
          <button 
            type="button" 
            className="session-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="session-modal-body">
          <h2 id="session-modal-title" className="session-modal-title">
            Log {cleanSubject} Output
          </h2>

          {/* DRILL SUBJECT: CLEAN PROGRESS STRIP */}
          {isDrillSubject ? (
            <div className="session-clean-quota-strip">
              
              {/* Telemetry Numbers Row */}
              <div className="quota-summary-line">
                <div className="quota-summary-item">
                  <span className="summary-lbl">Today's Quota:</span>
                  <span className="summary-val">{projectedToday} / {dailyTarget} {unitName}</span>
                </div>
                <div className="quota-summary-item week-item">
                  <span className="summary-lbl">{activeWeekName}:</span>
                  <span className="summary-val">{projectedWeekly} / {weeklyTarget} {unitName}</span>
                </div>
              </div>

              {/* Progress bar towards daily quota */}
              <div className="clean-progress-track">
                <div 
                  className={`clean-progress-fill ${isDailyQuotaMet ? 'cleared' : ''}`}
                  style={{ width: `${Math.min(100, Math.round((projectedToday / dailyTarget) * 100))}%` }}
                />
              </div>

              {/* Status Hint */}
              <div className="clean-quota-diff-line">
                {isDailyQuotaMet ? (
                  <span className="status-badge cleared">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Daily Quota Cleared ({projectedToday}/{dailyTarget})
                  </span>
                ) : (
                  <span className="status-badge under">
                    {dailyTarget - projectedToday} {unitName.toLowerCase()} needed to reach daily quota
                  </span>
                )}
              </div>

              {/* Minimal Stepper & Chips */}
              <div className="clean-stepper-box">
                <span className="clean-input-title">{unitName} Solved This Session:</span>
                
                <div className="clean-stepper-row">
                  <div className="clean-stepper-wrap">
                    <button 
                      type="button" 
                      className="stepper-arrow-btn"
                      onClick={() => handleStep(-1)}
                      title="Decrease"
                    >
                      -
                    </button>
                    
                    <input 
                      id="questions-solved-input"
                      type="number"
                      min="0"
                      className="clean-stepper-input"
                      value={questionsSolved}
                      onChange={(e) => setQuestionsSolved(Math.max(0, parseInt(e.target.value) || 0))}
                    />

                    <button 
                      type="button" 
                      className="stepper-arrow-btn"
                      onClick={() => handleStep(1)}
                      title="Increase"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Chips */}
                  <div className="clean-chips-wrap">
                    {quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`clean-chip-btn ${questionsSolved === chip.val ? 'selected' : ''}`}
                        onClick={() => setQuestionsSolved(chip.val)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Completion Toggle */}
              <label className="clean-checkbox-row">
                <input 
                  type="checkbox"
                  className="clean-check-box"
                  checked={markCompleted}
                  onChange={(e) => setUserToggledComplete(e.target.checked)}
                />
                <span className="clean-check-text">
                  Mark {cleanSubject} daily drill completed
                </span>
              </label>

            </div>
          ) : (
            /* GENERAL STUDY SESSION */
            <div className="clean-general-note">
              <span>+{durationMinutes}m focus logged to total daily study hours.</span>
            </div>
          )}

          {/* Quick Note Input with Smooth Caret */}
          <div className="clean-note-wrap">
            <SmoothCaretInput
              id="session-modal-notes"
              type="text"
              className="clean-note-input"
              placeholder="Session notes or mistakes (optional)..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(stripEmojis(e.target.value))}
            />
          </div>

          {/* Action Buttons */}
          <div className="clean-modal-foot">
            <button 
              type="button" 
              className="btn-secondary clean-foot-btn"
              onClick={onClose}
            >
              Resume
            </button>
            <button 
              type="submit" 
              className="btn-primary clean-foot-btn primary"
            >
              Save Session
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
