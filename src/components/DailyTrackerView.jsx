import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Icons } from './AspirantIcons';
import { 
  AnimatedFlameIcon, 
  AnimatedTargetIcon, 
  AnimatedLightningIcon 
} from './AnimatedUiIcons';
import { playGamingAchievementSound } from '../utils/audioUtils';
import { 
  getCalculatedDateForTrackerDay, 
  formatDateMonthDay, 
  isToday, 
  getTodayTrackerPosition 
} from '../utils/dateUtils';
import { stripEmojis } from '../utils/textUtils';
import DailyQuotaCelebrationModal from './DailyQuotaCelebrationModal';
import { getActiveExamConfig } from '../config/examConfig';
import SmoothCaretInput from './animations/SmoothCaretInput';
import SmoothCaretTextarea from './animations/SmoothCaretTextarea';

function DailyTrackerView({ 
  state, 
  activeMonth, 
  setActiveMonth, 
  activeWeek, 
  setActiveWeek, 
  activeDayName,
  setActiveDayName,
  updateDayMetric, 
  updateDayNotes,
  resetWeekMetrics,
  resetDayMetrics,
  updateDayCustomTarget,
  updateCustomObjectiveConfig,
  syncStatus = 'saved',
  lastSyncedTimeStr = '',
  hasUnsyncedCloudChanges = false,
  onRecordDayProgress,
  onOpenStampRally,
  onAwardDailyStamp,
  stampRallyData
}) {
  const { tracker, settings } = state;
  const startDateStr = settings?.startDate;

  const examConfig = useMemo(() => getActiveExamConfig(settings?.targetExam || 'cat'), [settings?.targetExam]);
  const secQuant = examConfig.sections[0] || { shortName: 'QUANT', name: 'Quantitative Aptitude', unit: 'Qs' };
  const secLrdi = examConfig.sections[1] || { shortName: 'DILR', name: 'Data Interpretation & LR', unit: 'Sets' };
  const secVarc = examConfig.sections[2] || { shortName: 'VARC', name: 'Verbal Ability & Reading', unit: 'RCs' };
  
  // Sorted month keys
  const months = useMemo(() => {
    return Object.keys(tracker || {}).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [tracker]);
  
  // Available weeks in current month
  const weeks = tracker[activeMonth] || [];

  // Active days for selected week
  const activeWeekDays = useMemo(() => {
    const found = weeks.find(w => w.week === activeWeek);
    return found?.days || [];
  }, [weeks, activeWeek]);

  // Today's position in tracker
  const todayPosition = useMemo(() => {
    return getTodayTrackerPosition(startDateStr);
  }, [startDateStr]);

  // Global week index for study plan syllabus curriculum linkage
  const monthNum = parseInt(activeMonth?.replace(/\D/g, ''), 10) || 1;
  const weekNum = parseInt(activeWeek?.replace(/\D/g, ''), 10) || 1;
  const globalWeekNum = Math.min(16, Math.max(1, (monthNum - 1) * 4 + weekNum));
  const activeWeekPlan = (state.studyPlan || [])[globalWeekNum - 1] || null;

  // Selected Day spotlight (controlled via activeDayName prop or local fallback)
  const [internalDayName, setInternalDayName] = useState(() => {
    return todayPosition.dayName || 'Monday';
  });

  const effectiveDayName = activeDayName || internalDayName;
  const setEffectiveDayName = (name) => {
    if (setActiveDayName) setActiveDayName(name);
    setInternalDayName(name);
  };

  // Custom objective full configuration state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCreatingCustomObj, setIsCreatingCustomObj] = useState(false);
  const [configForm, setConfigForm] = useState({
    title: 'Custom Objective',
    badge: 'CUSTOM',
    target: 'Solve 1 Sectional / Revision Drill',
    targetQty: 1,
    unit: 'Tasks',
    applyToAllDays: true
  });

  const openConfigModal = (isCreating = false) => {
    setIsCreatingCustomObj(isCreating);
    setConfigForm({
      title: isCreating ? '' : (selectedDay.customTitle || ''),
      badge: isCreating ? 'CUSTOM' : (selectedDay.customBadge || 'CUSTOM'),
      target: isCreating ? '' : (selectedDay.customTarget || ''),
      targetQty: isCreating ? 1 : (selectedDay.customTargetQty || 1),
      unit: isCreating ? 'Tasks' : (selectedDay.customUnit || 'Tasks'),
      applyToAllDays: true
    });
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = () => {
    if (updateCustomObjectiveConfig) {
      updateCustomObjectiveConfig(
        activeMonth,
        activeWeek,
        selectedDay.day,
        {
          hasCustomObjective: true,
          title: configForm.title.trim() || 'Custom Objective',
          badge: configForm.badge.trim().toUpperCase() || 'CUSTOM',
          target: configForm.target.trim() || 'Complete daily custom goal',
          targetQty: Math.max(1, parseInt(configForm.targetQty) || 1),
          unit: configForm.unit.trim() || 'Tasks'
        },
        configForm.applyToAllDays
      );
    }
    setIsConfigModalOpen(false);
  };

  const handleRemoveCustomObjective = () => {
    if (updateCustomObjectiveConfig) {
      updateCustomObjectiveConfig(
        activeMonth,
        activeWeek,
        selectedDay.day,
        {
          hasCustomObjective: false
        },
        configForm.applyToAllDays
      );
      updateDayMetric(activeMonth, activeWeek, selectedDay.day, 'custom', false, 0);
    }
    setIsConfigModalOpen(false);
  };

  // Reset confirmation modal state
  const [resetModal, setResetModal] = useState({ isOpen: false, type: null });

  // Sparkle particles
  const [particles, setParticles] = useState([]);

  // Container ref
  const containerRef = useRef(null);

  // Jump to today
  const handleJumpToToday = () => {
    setActiveMonth(todayPosition.activeMonth);
    setActiveWeek(todayPosition.activeWeek);
    setEffectiveDayName(todayPosition.dayName || 'Monday');
  };

  // Animate on day change
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.drill-item-card, .telemetry-card-clean',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [effectiveDayName, activeWeek, activeMonth]);

  // Handle drill completion toggle with sound
  const handleToggleDrill = (month, weekName, dayName, subject, isCompleted, e) => {
    const targetCompleted = !isCompleted;

    if (targetCompleted) {
      playGamingAchievementSound(0.035);

      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const newParticles = Array.from({ length: 10 }, (_, idx) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = 20 + Math.random() * 35;
          return {
            id: Date.now() + idx,
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.top + rect.height / 2}px`,
            tx: `${Math.cos(angle) * distance}px`,
            ty: `${Math.sin(angle) * distance}px`
          };
        });

        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 500);
      }
    }

    let defaultQty = 0;
    if (targetCompleted) {
      if (subject === 'quant') defaultQty = 18;
      if (subject === 'lrdi') defaultQty = 4;
      if (subject === 'varc') defaultQty = 4;
      if (subject === 'custom') defaultQty = getSubjectTarget('custom', selectedDay) || 1;
    }

    updateDayMetric(month, weekName, dayName, subject, targetCompleted, defaultQty);
  };

  const getSubjectTarget = (subj, dayObj) => {
    if (subj === 'custom') {
      return Math.max(1, Number(dayObj?.customTargetQty) || 1);
    }
    const targetStr = dayObj?.[`${subj}Target`];
    const match = targetStr ? targetStr.match(/\d+/) : null;
    if (match) return parseInt(match[0], 10);
    if (subj === 'quant') return 18;
    if (subj === 'lrdi') return 4;
    if (subj === 'varc') return 4;
    return 1;
  };

  const handleStepQty = (month, weekName, dayName, subject, currentVal, delta) => {
    const current = parseInt(currentVal) || 0;
    const nextVal = Math.max(0, current + delta);
    const target = getSubjectTarget(subject, selectedDay);
    const isCompleted = nextVal >= target;
    updateDayMetric(month, weekName, dayName, subject, isCompleted, nextVal);
  };

  const handleDirectQtyChange = (month, weekName, dayName, subject, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    const target = getSubjectTarget(subject, selectedDay);
    const isCompleted = qty >= target;
    updateDayMetric(month, weekName, dayName, subject, isCompleted, qty);
  };

  // Selected Day Data
  const selectedDay = useMemo(() => {
    return activeWeekDays.find(d => d.day === effectiveDayName) || activeWeekDays[0] || {};
  }, [activeWeekDays, effectiveDayName]);

  const selectedDayDate = getCalculatedDateForTrackerDay(activeMonth, activeWeek, selectedDay.day, startDateStr);
  const selectedDayDateFormatted = formatDateMonthDay(selectedDayDate);
  const selectedDayIsToday = isToday(activeMonth, activeWeek, selectedDay.day, startDateStr);

  const hasCustomObjective = Boolean(selectedDay.hasCustomObjective);
  const totalDayQuotas = hasCustomObjective ? 4 : 3;

  const selectedCompletedCount = 
    (selectedDay.quantCompleted ? 1 : 0) + 
    (selectedDay.lrdiCompleted ? 1 : 0) + 
    (selectedDay.varcCompleted ? 1 : 0) + 
    (hasCustomObjective && selectedDay.customCompleted ? 1 : 0);

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const prevCompletedCountRef = useRef(null);

  useEffect(() => {
    if (
      prevCompletedCountRef.current !== null &&
      prevCompletedCountRef.current < totalDayQuotas &&
      selectedCompletedCount === totalDayQuotas
    ) {
      setShowCelebrationModal(true);
      if (onAwardDailyStamp) {
        const dateStr = new Date().toISOString().split('T')[0];
        onAwardDailyStamp(dateStr, selectedDay.day || 'Today');
      }
    }
    prevCompletedCountRef.current = selectedCompletedCount;
  }, [selectedCompletedCount, totalDayQuotas, onAwardDailyStamp, selectedDay.day]);

  // Subject timer sessions
  const quantSessions = (selectedDay.sessions || []).filter(s => (s.subject || '').toLowerCase() === 'quant');
  const lrdiSessions = (selectedDay.sessions || []).filter(s => (s.subject || '').toLowerCase() === 'lrdi');
  const varcSessions = (selectedDay.sessions || []).filter(s => (s.subject || '').toLowerCase() === 'varc');
  const customSessions = (selectedDay.sessions || []).filter(s => {
    const subj = (s.subject || '').toLowerCase();
    return subj === 'custom' || subj === 'general' || subj.includes('mock') || subj.includes('revision');
  });

  const quantMins = quantSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const lrdiMins = lrdiSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const varcMins = varcSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const customMins = customSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalMins = quantMins + lrdiMins + varcMins + customMins;

  // Day shorthand (Maps "Monday" -> "Mon", "Saturday" -> "Sat", "Day 1" -> "D1")
  const getDayShort = (dayStr) => {
    if (!dayStr) return 'Day';
    const clean = dayStr.trim();
    const dayMap = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    const lower = clean.toLowerCase();
    if (dayMap[lower]) return dayMap[lower];

    const num = clean.replace(/\D/g, '');
    if (num) {
      const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const idx = (parseInt(num, 10) - 1) % 7;
      return names[idx] || `D${num}`;
    }

    return clean.substring(0, 3);
  };

  return (
    <div ref={containerRef} className="minimal-daily-hub fade-in">
      
      {/* 1. COMPACT COMMAND HEADER */}
      <div className="minimal-header-strip">
        <div className="minimal-header-left">
          <div className="minimal-tag">
            <span className="minimal-ping" />
            <span>// DAILY QUOTA DISPATCH</span>
          </div>
          <h1 className="minimal-title">
            DAILY DRILLS <span className="minimal-title-italic">& Telemetry</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="minimal-actions-bar">
          <div className="minimal-sync-tag" title={lastSyncedTimeStr || 'Synced'}>
            <span className={`sync-dot ${syncStatus === 'syncing' ? 'syncing' : syncStatus === 'synced' ? 'synced' : 'ready'}`} />
            <span className="sync-lbl-text">{syncStatus === 'syncing' ? 'Syncing...' : 'Synced'}</span>
          </div>

          {resetWeekMetrics && (
            <button 
              type="button"
              className="minimal-btn outline reset-week-trigger-btn"
              onClick={() => setResetModal({ isOpen: true, type: 'week' })}
              title={`Reset completed drills for ${activeWeek}`}
            >
              <Icons.RotateCcw size={12} />
              <span>Reset {activeWeek.replace('Week ', 'W')}</span>
            </button>
          )}

          {onRecordDayProgress && (
            <button 
              type="button"
              className="minimal-btn outline"
              onClick={onRecordDayProgress}
              disabled={syncStatus === 'syncing'}
              title="Save day progress snapshot"
            >
              <Icons.Save size={13} />
              <span>Record</span>
            </button>
          )}

          <button 
            type="button"
            className="minimal-btn accent"
            onClick={handleJumpToToday}
            title="Jump to today's active day"
          >
            <Icons.Zap size={13} />
            <span>Today ({todayPosition.todayMonthDayStr})</span>
          </button>
        </div>
      </div>

      {/* 2. UNIFIED NAVIGATOR STRIP (Responsive & Perfectly Aligned) */}
      <div className="unified-nav-strip">
        
        {/* Month & Week Pills Scroller */}
        <div className="nav-period-group">
          {/* Months */}
          <div className="period-pills-row">
            {months.map(m => (
              <button
                key={m}
                type="button"
                className={`period-pill ${activeMonth === m ? 'active' : ''}`}
                onClick={() => {
                  setActiveMonth(m);
                  setActiveWeek('Week 1');
                  const nextMonthWeeks = tracker[m] || [];
                  const w1 = nextMonthWeeks.find(w => w.week === 'Week 1');
                  const w1Days = w1?.days || [];
                  const targetDay = w1Days.some(d => d.day === effectiveDayName)
                    ? effectiveDayName
                    : (todayPosition.dayName || 'Monday');
                  setEffectiveDayName(targetDay);
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="nav-pipe" />

          {/* Weeks */}
          <div className="period-pills-row">
            {weeks.map(w => (
              <button
                key={w.week}
                type="button"
                className={`period-pill week ${activeWeek === w.week ? 'active' : ''}`}
                onClick={() => {
                  setActiveWeek(w.week);
                  const targetDays = w.days || [];
                  const targetDay = targetDays.some(d => d.day === effectiveDayName)
                    ? effectiveDayName
                    : (todayPosition.dayName || 'Monday');
                  setEffectiveDayName(targetDay);
                }}
              >
                {w.week.replace('Week ', 'W')}
              </button>
            ))}
          </div>
        </div>

        {/* 7-Day Mini Track Grid */}
        <div className="mini-day-track">
          {activeWeekDays.map((d, dIdx) => {
            const isDayToday = isToday(activeMonth, activeWeek, d.day, startDateStr);
            const isSelected = effectiveDayName === d.day;
            const dHasCustom = Boolean(d.hasCustomObjective);
            const dTotal = dHasCustom ? 4 : 3;
            const completed = 
              (d.quantCompleted ? 1 : 0) + 
              (d.lrdiCompleted ? 1 : 0) + 
              (d.varcCompleted ? 1 : 0) + 
              (dHasCustom && d.customCompleted ? 1 : 0);

            return (
              <button
                key={d.day || dIdx}
                type="button"
                className={`mini-day-pill ${isSelected ? 'selected' : ''} ${isDayToday ? 'is-today' : ''}`}
                onClick={() => setEffectiveDayName(d.day)}
              >
                <span className="mini-day-name">{getDayShort(d.day)}</span>
                <span className={`mini-day-dot ${completed === dTotal ? 'all' : completed > 0 ? 'some' : ''}`} />
                {d.studyHours > 0 && <span className="mini-day-hrs">{d.studyHours.toFixed(1)}h</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. RESPONSIVE WORKSPACE */}
      <div className="clean-workspace-grid">
        
        {/* LEFT COLUMN: THE 4 DAILY DRILL QUOTAS */}
        <div className="workspace-main-col">
          
          {/* Day Status Header */}
          <div className="day-overview-header">
            <div className="day-title-block">
              <div className="day-title-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 className="selected-day-heading">{selectedDay.day}</h2>
                <span className="selected-date-tag">{selectedDayDateFormatted}</span>
                {selectedDayIsToday && <span className="today-live-tag">TODAY</span>}
                {resetDayMetrics && (selectedCompletedCount > 0 || (selectedDay.quantCount || 0) + (selectedDay.lrdiCount || 0) + (selectedDay.varcCount || 0) + (selectedDay.customCount || 0) > 0) && (
                  <button
                    type="button"
                    className="day-reset-inline-btn"
                    onClick={() => setResetModal({ isOpen: true, type: 'day' })}
                    title={`Reset ${selectedDay.day} drills to 0`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary, #a1a1aa)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Icons.RotateCcw size={10} />
                    <span>Reset Day</span>
                  </button>
                )}
              </div>
              <span className="day-syllabus-subtitle">
                {activeMonth} • {activeWeek} Syllabus Quotas {activeWeekPlan?.phase ? `• ${activeWeekPlan.phase.split(':')[0]}` : ''}
              </span>
            </div>

            <div 
              className={`day-quota-tally ${selectedCompletedCount === totalDayQuotas ? 'all-done clickable-celebrate' : ''}`}
              onClick={() => {
                if (selectedCompletedCount === totalDayQuotas) setShowCelebrationModal(true);
              }}
              title={selectedCompletedCount === totalDayQuotas ? "Click to view celebration & Cat Mascot!" : undefined}
            >
              <span className={`tally-score ${selectedCompletedCount === totalDayQuotas ? 'all-done' : ''}`}>
                {selectedCompletedCount} / {totalDayQuotas}
              </span>
              <span className="tally-label">{selectedCompletedCount === totalDayQuotas ? 'Conquered!' : 'Quotas Cleared'}</span>
            </div>
          </div>

          {/* The 3 Drill Cards */}
          <div className="drills-stack">
            
            {/* QUANT DRILL */}
            <div className={`drill-item-card quant ${selectedDay.quantCompleted ? 'done' : ''}`}>
              <div className="drill-card-top-row">
                <button 
                  type="button" 
                  role="checkbox"
                  aria-checked={Boolean(selectedDay.quantCompleted)}
                  aria-label={`${secQuant.shortName} completed`}
                  className={`drill-check-bubble ${selectedDay.quantCompleted ? 'checked' : ''}`}
                  onClick={(e) => handleToggleDrill(activeMonth, activeWeek, selectedDay.day, 'quant', selectedDay.quantCompleted, e)}
                  title={selectedDay.quantCompleted ? 'Completed' : 'Mark complete'}
                >
                  <Icons.Check size={14} />
                </button>

                <div className="drill-subject-heading-row">
                  <span className="drill-subject-badge quant">{secQuant.shortName}</span>
                  <span className="drill-subject-title">{secQuant.name}</span>
                  {quantMins > 0 && (
                    <span className="drill-timer-pill">
                      <Icons.Clock size={10} />
                      <span>{quantMins}m from Timer</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="drill-card-bottom-row">
                <div className="drill-target-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                  {activeWeekPlan?.quantFocus && (
                    <span className="drill-curriculum-pill" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--accent-color, #38bdf8)',
                      background: 'rgba(56, 189, 248, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      width: 'fit-content'
                    }}>
                      <Icons.Target size={11} />
                      <span>{activeWeekPlan.quantFocus}</span>
                    </span>
                  )}
                  <span className="drill-target-text" title={selectedDay.quantTarget}>
                    {selectedDay.quantTarget || `${secQuant.name} Practice Drill`}
                  </span>
                </div>

                <div className="drill-stepper-compact">
                  <span className="stepper-subtext">Solved {secQuant.unit}:</span>
                  <div className="stepper-buttons-wrap">
                    <button 
                      type="button"
                      className="step-btn"
                      onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'quant', selectedDay.quantCount, -1)}
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      min="0"
                      className="step-input"
                      value={selectedDay.quantCount || 0}
                      onChange={(e) => handleDirectQtyChange(activeMonth, activeWeek, selectedDay.day, 'quant', e.target.value)}
                    />
                    <button 
                      type="button"
                      className="step-btn"
                      onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'quant', selectedDay.quantCount, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* DILR DRILL */}
            <div className={`drill-item-card lrdi ${selectedDay.lrdiCompleted ? 'done' : ''}`}>
              <div className="drill-card-top-row">
                <button 
                  type="button"
                  role="checkbox"
                  aria-checked={Boolean(selectedDay.lrdiCompleted)}
                  aria-label={`${secLrdi.shortName} completed`}
                  className={`drill-check-bubble ${selectedDay.lrdiCompleted ? 'checked' : ''}`}
                  onClick={(e) => handleToggleDrill(activeMonth, activeWeek, selectedDay.day, 'lrdi', selectedDay.lrdiCompleted, e)}
                  title={selectedDay.lrdiCompleted ? 'Completed' : 'Mark complete'}
                >
                  <Icons.Check size={14} />
                </button>

                <div className="drill-subject-heading-row">
                  <span className="drill-subject-badge lrdi">{secLrdi.shortName}</span>
                  <span className="drill-subject-title">{secLrdi.name}</span>
                  {lrdiMins > 0 && (
                    <span className="drill-timer-pill">
                      <Icons.Clock size={10} />
                      <span>{lrdiMins}m from Timer</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="drill-card-bottom-row">
                <div className="drill-target-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                  {activeWeekPlan?.lrdiFocus && (
                    <span className="drill-curriculum-pill" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#a855f7',
                      background: 'rgba(168, 85, 247, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      width: 'fit-content'
                    }}>
                      <Icons.Puzzle size={11} />
                      <span>{activeWeekPlan.lrdiFocus}</span>
                    </span>
                  )}
                  <span className="drill-target-text" title={selectedDay.lrdiTarget}>
                    {selectedDay.lrdiTarget || `${secLrdi.name} Practice Sets`}
                  </span>
                </div>

                <div className="drill-stepper-compact">
                  <span className="stepper-subtext">Solved {secLrdi.unit}:</span>
                  <div className="stepper-buttons-wrap">
                    <button 
                      type="button"
                      className="step-btn"
                      onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'lrdi', selectedDay.lrdiCount, -1)}
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      min="0"
                      className="step-input"
                      value={selectedDay.lrdiCount || 0}
                      onChange={(e) => handleDirectQtyChange(activeMonth, activeWeek, selectedDay.day, 'lrdi', e.target.value)}
                    />
                    <button 
                      type="button"
                      className="step-btn"
                      onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'lrdi', selectedDay.lrdiCount, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* VARC DRILL */}
            <div className={`drill-item-card varc ${selectedDay.varcCompleted ? 'done' : ''}`}>
              <div className="drill-card-top-row">
                <button 
                  type="button"
                  role="checkbox"
                  aria-checked={Boolean(selectedDay.varcCompleted)}
                  aria-label={`${secVarc.shortName} completed`}
                  className={`drill-check-bubble ${selectedDay.varcCompleted ? 'checked' : ''}`}
                  onClick={(e) => handleToggleDrill(activeMonth, activeWeek, selectedDay.day, 'varc', selectedDay.varcCompleted, e)}
                  title={selectedDay.varcCompleted ? 'Completed' : 'Mark complete'}
                >
                  <Icons.Check size={14} />
                </button>

                <div className="drill-subject-heading-row">
                  <span className="drill-subject-badge varc">{secVarc.shortName}</span>
                  <span className="drill-subject-title">{secVarc.name}</span>
                  {varcMins > 0 && (
                    <span className="drill-timer-pill">
                      <Icons.Clock size={10} />
                      <span>{varcMins}m from Timer</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="drill-card-bottom-row">
                <div className="drill-target-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                  {activeWeekPlan?.varcFocus && (
                    <span className="drill-curriculum-pill" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#10b981',
                      background: 'rgba(168, 85, 247, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      width: 'fit-content'
                    }}>
                      <Icons.BookOpen size={11} />
                      <span>{activeWeekPlan.varcFocus}</span>
                    </span>
                  )}
                  <span className="drill-target-text" title={selectedDay.varcTarget}>
                    {selectedDay.varcTarget || `${secVarc.name} Exercises`}
                  </span>
                </div>

                <div className="drill-stepper-compact">
                  <span className="stepper-subtext">Solved {secVarc.unit}:</span>
                  <div className="stepper-buttons-wrap">
                    <button 
                      type="button"
                      className="step-btn"
                      onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'varc', selectedDay.varcCount, -1)}
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      min="0"
                      className="step-input"
                      value={selectedDay.varcCount || 0}
                      onChange={(e) => handleDirectQtyChange(activeMonth, activeWeek, selectedDay.day, 'varc', e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="step-btn"
                      onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'varc', selectedDay.varcCount, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CUSTOM OBJECTIVE DRILL (Rendered if user added it, otherwise show "+ Add Custom Objective" button) */}
            {hasCustomObjective ? (
              <div className={`drill-item-card custom ${selectedDay.customCompleted ? 'done' : ''}`}>
                <div className="drill-card-top-row">
                  <button 
                    type="button" 
                    role="checkbox"
                    aria-checked={Boolean(selectedDay.customCompleted)}
                    aria-label={`${selectedDay.customTitle || 'Custom Objective'} completed`}
                    className={`drill-check-bubble custom ${selectedDay.customCompleted ? 'checked' : ''}`}
                    onClick={(e) => handleToggleDrill(activeMonth, activeWeek, selectedDay.day, 'custom', selectedDay.customCompleted, e)}
                    title={selectedDay.customCompleted ? 'Completed' : 'Mark complete'}
                  >
                    <Icons.Check size={14} />
                  </button>

                  <div className="drill-subject-heading-row">
                    <span 
                      className="drill-subject-badge custom clickable-chip"
                      onClick={() => openConfigModal(false)}
                      title="Click to edit badge and settings"
                      style={{
                        color: 'var(--accent-color, #38bdf8)',
                        background: 'rgba(var(--accent-rgb, 56, 189, 248), 0.14)',
                        border: '1px solid var(--accent-color, #38bdf8)'
                      }}
                    >
                      {selectedDay.customBadge || 'CUSTOM'}
                    </span>
                    <span 
                      className="drill-subject-title clickable-title"
                      onClick={() => openConfigModal(false)}
                      title="Click to edit objective name"
                    >
                      {selectedDay.customTitle || 'Custom Objective'}
                    </span>
                    {customMins > 0 && (
                      <span className="drill-timer-pill custom" style={{ color: 'var(--accent-color, #38bdf8)' }}>
                        <Icons.Clock size={10} />
                        <span>{customMins}m from Timer</span>
                      </span>
                    )}
                    <button
                      type="button"
                      className="drill-card-config-btn"
                      onClick={() => openConfigModal(false)}
                      title="Edit Custom Objective (Name, Badge, Target, Unit, Scope)"
                    >
                      <Icons.Edit size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <div className="drill-card-bottom-row">
                  <div className="drill-target-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                    <span 
                      className="drill-curriculum-pill custom clickable-chip"
                      onClick={() => openConfigModal(false)}
                      title="Click to edit"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--accent-color, #38bdf8)',
                        background: 'rgba(var(--accent-rgb, 56, 189, 248), 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        width: 'fit-content',
                        cursor: 'pointer'
                      }}
                    >
                      <Icons.Crosshair size={11} />
                      <span>Personal Focus</span>
                    </span>

                    <div 
                      className="drill-target-text-row custom-clickable" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', maxWidth: '100%' }}
                      onClick={() => openConfigModal(false)}
                      title="Click to edit target goal"
                    >
                      <span className="drill-target-text" title={selectedDay.customTarget || "Solve 1 Sectional / Revision Drill"}>
                        {selectedDay.customTarget || "Solve 1 Sectional / Revision Drill"}
                      </span>
                      <span className="drill-edit-target-icon" style={{ opacity: 0.8, display: 'inline-flex', color: 'var(--accent-color, #38bdf8)' }}>
                        <Icons.Edit size={11} />
                      </span>
                    </div>
                  </div>

                  <div className="drill-stepper-compact">
                    <span 
                      className="stepper-subtext clickable-unit" 
                      onClick={() => openConfigModal(false)} 
                      title="Click to edit metric unit"
                      style={{ cursor: 'pointer' }}
                    >
                      Solved {selectedDay.customUnit || 'Tasks'}:
                    </span>
                    <div className="stepper-buttons-wrap">
                      <button 
                        type="button"
                        className="step-btn"
                        onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'custom', selectedDay.customCount, -1)}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="0"
                        className="step-input"
                        value={selectedDay.customCount || 0}
                        onChange={(e) => handleDirectQtyChange(activeMonth, activeWeek, selectedDay.day, 'custom', e.target.value)}
                      />
                      <button 
                        type="button"
                        className="step-btn"
                        onClick={() => handleStepQty(activeMonth, activeWeek, selectedDay.day, 'custom', selectedDay.customCount, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* + Add Custom Objective Button when not added */
              <div className="add-custom-objective-card">
                <button
                  type="button"
                  className="add-custom-objective-btn"
                  onClick={() => openConfigModal(true)}
                  title="Add a custom daily objective (e.g. GK, Mocks, Vocab, Revision)"
                >
                  <div className="add-custom-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <div className="add-custom-btn-info">
                    <span className="add-custom-btn-title">Add Custom Objective</span>
                    <span className="add-custom-btn-sub">Add extra target for GK & Editorial, Mock Analysis, Vocabulary, or Sectionals</span>
                  </div>
                  <span className="add-custom-pill font-mono">+ ADD</span>
                </button>
              </div>
            )}

          </div>

          {/* Clean Day Reflection & Mistake Notes */}
          <div className="clean-notes-card">
            <div className="notes-card-head">
              <span className="notes-card-title">Day Reflection & Error Log</span>
              <span className="notes-card-hint">Formula slips, trap answers, takeaways</span>
            </div>
            <SmoothCaretTextarea
              className="clean-notes-textarea"
              placeholder="Jot down formula triggers, mistakes made today, or question numbers to revise later..."
              value={selectedDay.notes || ''}
              onChange={(e) => updateDayNotes(activeMonth, activeWeek, selectedDay.day, stripEmojis(e.target.value))}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: TIMER TELEMETRY & FOCUS SUMMARY */}
        <div className="workspace-side-col">
          
          {/* Daily Focus Summary Card */}
          <div className="telemetry-summary-card">
            <span className="side-card-tag">TELEMETRY OVERVIEW</span>
            
            <div className="side-hours-row">
              <div className="hours-block">
                <span className="hours-num">{selectedDay.studyHours ? selectedDay.studyHours.toFixed(1) : '0.0'}</span>
                <span className="hours-lbl">Hours Studied</span>
              </div>
              <div className="hours-target-block">
                <span className="target-num">4.0h</span>
                <span className="target-lbl">Daily Quota</span>
              </div>
            </div>

            {/* Clean Progress Bar */}
            <div className="clean-progress-track">
              <div 
                className="clean-progress-fill"
                style={{ width: `${Math.min(100, Math.round(((selectedDay.studyHours || 0) / 4) * 100))}%` }}
              />
            </div>

            {totalMins > 0 && (
              <div className="subject-time-distribution">
                {quantMins > 0 && <span className="dist-item quant">QA: {quantMins}m</span>}
                {lrdiMins > 0 && <span className="dist-item lrdi">DILR: {lrdiMins}m</span>}
                {varcMins > 0 && <span className="dist-item varc">VARC: {varcMins}m</span>}
                {customMins > 0 && <span className="dist-item custom">Custom: {customMins}m</span>}
              </div>
            )}
          </div>

          {/* Incoming Timer Sessions Stream */}
          <div className="telemetry-stream-panel">
            <div className="stream-panel-head">
              <span className="side-card-tag">RECORDED TIMER SESSIONS</span>
              <span className="stream-count-tag">
                {(selectedDay.sessions || []).length} Sessions
              </span>
            </div>

            {selectedDay.sessions && selectedDay.sessions.length > 0 ? (
              <div className="stream-sessions-list">
                {selectedDay.sessions.map((sess, idx) => {
                  const subj = (sess.subject || 'General').toUpperCase();
                  const isQuant = subj.includes('QUANT');
                  const isLrdi = subj.includes('LRDI') || subj.includes('DILR');
                  const isVarc = subj.includes('VARC');
                  const sClass = isQuant ? 'quant' : isLrdi ? 'lrdi' : isVarc ? 'varc' : 'general';

                  return (
                    <div key={sess.id || idx} className={`stream-session-item ${sClass}`}>
                      <div className="session-item-top">
                        <span className={`session-pill ${sClass}`}>{subj}</span>
                        <span className="session-time">{sess.startTime} - {sess.endTime}</span>
                        <span className="session-mins">{sess.durationMinutes}m</span>
                      </div>
                      {sess.notes && (
                        <p className="session-item-note">"{stripEmojis(sess.notes)}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="stream-empty-state">
                <Icons.Clock size={20} className="stream-empty-icon" />
                <p>No timer sessions logged today yet. Complete a Pomodoro in Study Timer to auto-record your minutes here!</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Non-destructive Reset Confirmation Modal */}
      {resetModal.isOpen && (
        <div className="modal-overlay-blur fade-in" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setResetModal({ isOpen: false, type: null })}>
          <div 
            className="clean-confirm-modal"
            style={{
              background: 'var(--surface-color, #18181b)',
              border: '1px solid var(--border-color, #27272a)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icons.RotateCcw size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text-primary, #f4f4f5)' }}>
                  {resetModal.type === 'week' ? `Reset ${activeWeek} Drills?` : `Reset ${selectedDay.day} Drills?`}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary, #a1a1aa)', lineHeight: 1.4 }}>
                  {resetModal.type === 'week' 
                    ? `Clear all 7 days of ${activeMonth} ${activeWeek} back to 0. Study hours and streak remain safe.`
                    : `Clear drill completions and solved quantities for ${selectedDay.day} back to 0.`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setResetModal({ isOpen: false, type: null })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #27272a)',
                  background: 'transparent',
                  color: 'var(--text-primary, #f4f4f5)',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (resetModal.type === 'week' && resetWeekMetrics) {
                    resetWeekMetrics(activeMonth, activeWeek);
                  } else if (resetModal.type === 'day' && resetDayMetrics) {
                    resetDayMetrics(activeMonth, activeWeek, selectedDay.day);
                  }
                  setResetModal({ isOpen: false, type: null });
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Control Custom Objective Config Modal */}
      {isConfigModalOpen && (
        <div 
          className="modal-overlay-blur fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setIsConfigModalOpen(false)}
        >
          <div 
            className="clean-confirm-modal custom-obj-modal"
            style={{
              background: 'var(--surface-color, #131722)',
              border: '1px solid var(--accent-color, #38bdf8)',
              borderRadius: '16px',
              padding: '22px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7), 0 0 30px var(--accent-glow, rgba(56, 189, 248, 0.2))'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: 'rgba(var(--accent-rgb, 56, 189, 248), 0.15)',
                  color: 'var(--accent-color, #38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {hasCustomObjective && !isCreatingCustomObj ? <Icons.Edit size={18} /> : <Icons.Sliders size={18} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                    {hasCustomObjective && !isCreatingCustomObj ? 'Edit Custom Objective' : 'Add Custom Objective'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--text-secondary, #94a3b8)' }}>
                    {hasCustomObjective && !isCreatingCustomObj 
                      ? 'Customize name, category badge, target quota, and metric.'
                      : 'Set a personalized daily target with zero friction.'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsConfigModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Close"
              >
                <Icons.Close size={16} />
              </button>
            </div>

            {/* Quick Templates & Clear All */}
            <div style={{ marginBottom: '14px', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)', letterSpacing: '0.04em' }}>
                  QUICK PRESETS
                </span>
                {(configForm.title || configForm.target) && (
                  <button
                    type="button"
                    onClick={() => setConfigForm(prev => ({ ...prev, title: '', target: '', badge: 'CUSTOM' }))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600
                    }}
                    title="Clear pre-filled text"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {[
                  { title: 'GK & Editorial', badge: 'GK', target: 'Read 2 Aeon/Hindu editorials & note current affairs', qty: 2, unit: 'Articles' },
                  { title: 'Mock Analysis', badge: 'MOCK', target: 'Deep analysis of mock errors & trap solutions', qty: 1, unit: 'Mocks' },
                  { title: 'Vocab Flashcards', badge: 'VOCAB', target: 'Review 20 unfamiliar words with mnemonics', qty: 20, unit: 'Words' },
                  { title: 'Formula Revision', badge: 'REVISE', target: 'Revise Quant formula cheat sheet & speed drills', qty: 1, unit: 'Sets' },
                  { title: 'Sectional Drill', badge: 'SECTION', target: 'Solve 1 timed sectional drill test', qty: 1, unit: 'Tests' }
                ].map(preset => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => setConfigForm(prev => ({
                      ...prev,
                      title: preset.title,
                      badge: preset.badge,
                      target: preset.target,
                      targetQty: preset.qty,
                      unit: preset.unit
                    }))}
                    style={{
                      padding: '2px 7px',
                      fontSize: '10.5px',
                      borderRadius: '5px',
                      border: configForm.badge === preset.badge ? '1px solid var(--accent-color, #38bdf8)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: configForm.badge === preset.badge ? 'rgba(var(--accent-rgb, 56, 189, 248), 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      color: configForm.badge === preset.badge ? 'var(--accent-color, #38bdf8)' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    +{preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              
              {/* 1. Title & Badge in 1 Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)', marginBottom: '4px' }}>
                    OBJECTIVE TITLE
                  </label>
                  <div className="smooth-input-wrapper">
                    <SmoothCaretInput
                      type="text"
                      className="smooth-text-input"
                      value={configForm.title}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, title: stripEmojis(e.target.value) }))}
                      placeholder="e.g. GK & Editorial..."
                    />
                    {configForm.title && (
                      <button
                        type="button"
                        className="smooth-input-clear-btn"
                        onClick={() => setConfigForm(prev => ({ ...prev, title: '' }))}
                        title="Clear title"
                      >
                        <Icons.Close size={11} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)', marginBottom: '4px' }}>
                    BADGE
                  </label>
                  <div className="smooth-input-wrapper">
                    <SmoothCaretInput
                      type="text"
                      maxLength={8}
                      className="smooth-text-input font-mono"
                      style={{ textTransform: 'uppercase', fontWeight: 700, paddingRight: configForm.badge ? '26px' : '10px' }}
                      value={configForm.badge}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, badge: stripEmojis(e.target.value).toUpperCase() }))}
                      placeholder="CUSTOM"
                    />
                    {configForm.badge && (
                      <button
                        type="button"
                        className="smooth-input-clear-btn"
                        onClick={() => setConfigForm(prev => ({ ...prev, badge: '' }))}
                        title="Clear badge"
                      >
                        <Icons.Close size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Goal / Task Description with quick delete (X) */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)', marginBottom: '4px' }}>
                  GOAL / TASK DESCRIPTION
                </label>
                <div className="smooth-input-wrapper">
                  <SmoothCaretInput
                    type="text"
                    className="smooth-text-input"
                    value={configForm.target}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, target: stripEmojis(e.target.value) }))}
                    placeholder="e.g. Read 2 editorials & note key arguments"
                  />
                  {configForm.target && (
                    <button
                      type="button"
                      className="smooth-input-clear-btn"
                      onClick={() => setConfigForm(prev => ({ ...prev, target: '' }))}
                      title="Clear goal description"
                    >
                      <Icons.Close size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Target Qty & Unit Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)', marginBottom: '4px' }}>
                    TARGET COUNT
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(10, 15, 29, 0.72)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', height: '34px' }}>
                    <button
                      type="button"
                      className="step-btn"
                      onClick={() => setConfigForm(prev => ({ ...prev, targetQty: Math.max(1, (parseInt(prev.targetQty) || 1) - 1) }))}
                      style={{ width: '28px', height: '100%' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      className="step-input"
                      style={{ flex: 1, width: '100%', fontSize: '12.5px' }}
                      value={configForm.targetQty}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, targetQty: Math.max(1, parseInt(e.target.value) || 1) }))}
                    />
                    <button
                      type="button"
                      className="step-btn"
                      onClick={() => setConfigForm(prev => ({ ...prev, targetQty: (parseInt(prev.targetQty) || 1) + 1 }))}
                      style={{ width: '28px', height: '100%' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)', marginBottom: '4px' }}>
                    METRIC UNIT
                  </label>
                  <div className="smooth-input-wrapper">
                    <SmoothCaretInput
                      type="text"
                      maxLength={12}
                      className="smooth-text-input"
                      value={configForm.unit}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, unit: stripEmojis(e.target.value) }))}
                      placeholder="Tasks, Sets, Mocks..."
                    />
                    {configForm.unit && (
                      <button
                        type="button"
                        className="smooth-input-clear-btn"
                        onClick={() => setConfigForm(prev => ({ ...prev, unit: '' }))}
                        title="Clear unit"
                      >
                        <Icons.Close size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Scope Selection */}
              <div style={{
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                  Scope: <strong>{configForm.applyToAllDays ? 'Every day (Template)' : `Only ${selectedDay.day || 'Today'}`}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setConfigForm(prev => ({ ...prev, applyToAllDays: !prev.applyToAllDays }))}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    borderRadius: '5px',
                    border: '1px solid var(--accent-color, #38bdf8)',
                    background: 'rgba(var(--accent-rgb, 56, 189, 248), 0.12)',
                    color: 'var(--accent-color, #38bdf8)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {configForm.applyToAllDays ? 'Today only' : 'All days'}
                </button>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              {hasCustomObjective && !isCreatingCustomObj ? (
                <button
                  type="button"
                  onClick={handleRemoveCustomObjective}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '7px',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Remove this custom objective"
                >
                  Remove
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsConfigModalOpen(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '7px',
                    border: '1px solid var(--border-color, #27272a)',
                    background: 'transparent',
                    color: 'var(--text-primary, #f4f4f5)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '7px',
                    border: 'none',
                    background: 'var(--accent-color, #38bdf8)',
                    color: 'var(--accent-contrast, #09090b)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 14px var(--accent-glow, rgba(56, 189, 248, 0.35))'
                  }}
                >
                  <Icons.Check size={13} />
                  <span>{hasCustomObjective && !isCreatingCustomObj ? 'Save Changes' : 'Add Objective'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4/4 Daily Quotas Conquered Cat Mascot Celebration Modal */}
      <DailyQuotaCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        dayName={`${selectedDay.day || 'Today'}`}
        activeStreak={state.streak || 1}
        totalSolvedToday={
          (Number(selectedDay.quantCount) || 0) + 
          (Number(selectedDay.lrdiCount) || 0) + 
          (Number(selectedDay.varcCount) || 0) +
          (Number(selectedDay.customCount) || 0)
        }
        onOpenStampRally={onOpenStampRally}
      />

      {/* Floating Sparkle Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            position: 'fixed',
            left: p.left,
            top: p.top,
            '--tx': p.tx,
            '--ty': p.ty
          }}
        />
      ))}

    </div>
  );
}

export default React.memo(DailyTrackerView);
