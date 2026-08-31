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
    }

    updateDayMetric(month, weekName, dayName, subject, targetCompleted, defaultQty);
  };

  const getSubjectTarget = (subj, dayObj) => {
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

  const selectedCompletedCount = 
    (selectedDay.quantCompleted ? 1 : 0) + 
    (selectedDay.lrdiCompleted ? 1 : 0) + 
    (selectedDay.varcCompleted ? 1 : 0);

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const prevCompletedCountRef = useRef(null);

  useEffect(() => {
    if (
      prevCompletedCountRef.current !== null &&
      prevCompletedCountRef.current < 3 &&
      selectedCompletedCount === 3
    ) {
      setShowCelebrationModal(true);
      if (onAwardDailyStamp) {
        const dateStr = new Date().toISOString().split('T')[0];
        onAwardDailyStamp(dateStr, selectedDay.day || 'Today');
      }
    }
    prevCompletedCountRef.current = selectedCompletedCount;
  }, [selectedCompletedCount, onAwardDailyStamp, selectedDay.day]);

  // Subject timer sessions
  const quantSessions = (selectedDay.sessions || []).filter(s => (s.subject || '').toLowerCase() === 'quant');
  const lrdiSessions = (selectedDay.sessions || []).filter(s => (s.subject || '').toLowerCase() === 'lrdi');
  const varcSessions = (selectedDay.sessions || []).filter(s => (s.subject || '').toLowerCase() === 'varc');

  const quantMins = quantSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const lrdiMins = lrdiSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const varcMins = varcSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalMins = quantMins + lrdiMins + varcMins;

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

          {onOpenStampRally && (
            <button 
              type="button" 
              className="minimal-btn outline stamp-rally-tracker-btn"
              onClick={onOpenStampRally}
              title="Inspect Japanese Cat Stamp Rally Card"
              style={{
                borderColor: 'rgba(244, 63, 94, 0.4)',
                color: '#fb7185',
                background: 'rgba(244, 63, 94, 0.08)'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span>Stamp Rally ({stampRallyData?.currentCardStamps?.length || 0}/6)</span>
            </button>
          )}

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
            const completed = 
              (d.quantCompleted ? 1 : 0) + 
              (d.lrdiCompleted ? 1 : 0) + 
              (d.varcCompleted ? 1 : 0);

            return (
              <button
                key={d.day || dIdx}
                type="button"
                className={`mini-day-pill ${isSelected ? 'selected' : ''} ${isDayToday ? 'is-today' : ''}`}
                onClick={() => setEffectiveDayName(d.day)}
              >
                <span className="mini-day-name">{getDayShort(d.day)}</span>
                <span className={`mini-day-dot ${completed === 3 ? 'all' : completed > 0 ? 'some' : ''}`} />
                {d.studyHours > 0 && <span className="mini-day-hrs">{d.studyHours.toFixed(1)}h</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. RESPONSIVE WORKSPACE */}
      <div className="clean-workspace-grid">
        
        {/* LEFT COLUMN: THE 3 DAILY DRILL QUOTAS */}
        <div className="workspace-main-col">
          
          {/* Day Status Header */}
          <div className="day-overview-header">
            <div className="day-title-block">
              <div className="day-title-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 className="selected-day-heading">{selectedDay.day}</h2>
                <span className="selected-date-tag">{selectedDayDateFormatted}</span>
                {selectedDayIsToday && <span className="today-live-tag">TODAY</span>}
                {resetDayMetrics && (selectedCompletedCount > 0 || (selectedDay.quantCount || 0) + (selectedDay.lrdiCount || 0) + (selectedDay.varcCount || 0) > 0) && (
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
              className={`day-quota-tally ${selectedCompletedCount === 3 ? 'all-done clickable-celebrate' : ''}`}
              onClick={() => {
                if (selectedCompletedCount === 3) setShowCelebrationModal(true);
              }}
              title={selectedCompletedCount === 3 ? "Click to view celebration & Cat Mascot!" : undefined}
            >
              <span className={`tally-score ${selectedCompletedCount === 3 ? 'all-done' : ''}`}>
                {selectedCompletedCount} / 3
              </span>
              <span className="tally-label">{selectedCompletedCount === 3 ? 'Conquered!' : 'Quotas Cleared'}</span>
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
                  aria-label="Quant completed"
                  className={`drill-check-bubble ${selectedDay.quantCompleted ? 'checked' : ''}`}
                  onClick={(e) => handleToggleDrill(activeMonth, activeWeek, selectedDay.day, 'quant', selectedDay.quantCompleted, e)}
                  title={selectedDay.quantCompleted ? 'Completed' : 'Mark complete'}
                >
                  <Icons.Check size={14} />
                </button>

                <div className="drill-subject-heading-row">
                  <span className="drill-subject-badge quant">QUANT</span>
                  <span className="drill-subject-title">Quantitative Aptitude</span>
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
                    {selectedDay.quantTarget || 'Arithmetic & Algebra Practice Drill'}
                  </span>
                </div>

                <div className="drill-stepper-compact">
                  <span className="stepper-subtext">Solved Qs:</span>
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
                  aria-label="DILR completed"
                  className={`drill-check-bubble ${selectedDay.lrdiCompleted ? 'checked' : ''}`}
                  onClick={(e) => handleToggleDrill(activeMonth, activeWeek, selectedDay.day, 'lrdi', selectedDay.lrdiCompleted, e)}
                  title={selectedDay.lrdiCompleted ? 'Completed' : 'Mark complete'}
                >
                  <Icons.Check size={14} />
                </button>

                <div className="drill-subject-heading-row">
                  <span className="drill-subject-badge lrdi">DILR</span>
                  <span className="drill-subject-title">Data Interpretation & LR</span>
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
                    {selectedDay.lrdiTarget || '4 Matrix & Reasoning Sets'}
                  </span>
                </div>

                <div className="drill-stepper-compact">
                  <span className="stepper-subtext">Solved Sets:</span>
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
                  aria-label="VARC completed"
                  className={`drill-check-bubble ${selectedDay.varcCompleted ? 'checked' : ''}`}
                  onClick={(e) => handleToggleDrill(activeMonth, activeWeek, selectedDay.day, 'varc', selectedDay.varcCompleted, e)}
                  title={selectedDay.varcCompleted ? 'Completed' : 'Mark complete'}
                >
                  <Icons.Check size={14} />
                </button>

                <div className="drill-subject-heading-row">
                  <span className="drill-subject-badge varc">VARC</span>
                  <span className="drill-subject-title">Verbal Ability & Reading</span>
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
                      background: 'rgba(16, 185, 129, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      width: 'fit-content'
                    }}>
                      <Icons.BookOpen size={11} />
                      <span>{activeWeekPlan.varcFocus}</span>
                    </span>
                  )}
                  <span className="drill-target-text" title={selectedDay.varcTarget}>
                    {selectedDay.varcTarget || '4 Aeon Articles & RC Passages'}
                  </span>
                </div>

                <div className="drill-stepper-compact">
                  <span className="stepper-subtext">Solved RCs:</span>
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

          </div>

          {/* Clean Day Reflection & Mistake Notes */}
          <div className="clean-notes-card">
            <div className="notes-card-head">
              <span className="notes-card-title">Day Reflection & Error Log</span>
              <span className="notes-card-hint">Formula slips, trap answers, takeaways</span>
            </div>
            <textarea
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

      {/* 3/3 Daily Quotas Conquered Cat Mascot Celebration Modal */}
      <DailyQuotaCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        dayName={`${selectedDay.day || 'Today'}`}
        activeStreak={state.streak || 1}
        totalSolvedToday={
          (Number(selectedDay.quantCount) || 0) + 
          (Number(selectedDay.lrdiCount) || 0) + 
          (Number(selectedDay.varcCount) || 0)
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
