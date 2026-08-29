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

export default function DailyTrackerView({ 
  state, 
  activeMonth, 
  setActiveMonth, 
  activeWeek, 
  setActiveWeek, 
  updateDayMetric, 
  updateDayNotes,
  syncStatus = 'saved',
  lastSyncedTimeStr = '',
  hasUnsyncedCloudChanges = false,
  onRecordDayProgress
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
    return getTodayTrackerPosition(startDateStr, tracker);
  }, [startDateStr, tracker]);

  // Selected Day spotlight
  const [selectedDayName, setSelectedDayName] = useState(() => {
    return todayPosition.dayName || 'Day 1';
  });

  // Sparkle particles
  const [particles, setParticles] = useState([]);

  // Container ref
  const containerRef = useRef(null);

  // Jump to today
  const handleJumpToToday = () => {
    setActiveMonth(todayPosition.activeMonth);
    setActiveWeek(todayPosition.activeWeek);
    setSelectedDayName(todayPosition.dayName);
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
  }, [selectedDayName, activeWeek, activeMonth]);

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

  const handleStepQty = (month, weekName, dayName, subject, currentVal, delta) => {
    const current = parseInt(currentVal) || 0;
    const nextVal = Math.max(0, current + delta);
    const isCompleted = nextVal > 0;
    updateDayMetric(month, weekName, dayName, subject, isCompleted, nextVal);
  };

  const handleDirectQtyChange = (month, weekName, dayName, subject, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    const isCompleted = qty > 0;
    updateDayMetric(month, weekName, dayName, subject, isCompleted, qty);
  };

  // Selected Day Data
  const selectedDay = useMemo(() => {
    return activeWeekDays.find(d => d.day === selectedDayName) || activeWeekDays[0] || {};
  }, [activeWeekDays, selectedDayName]);

  const selectedDayDate = getCalculatedDateForTrackerDay(activeMonth, activeWeek, selectedDay.day, startDateStr);
  const selectedDayDateFormatted = formatDateMonthDay(selectedDayDate);
  const selectedDayIsToday = isToday(activeMonth, activeWeek, selectedDay.day, startDateStr);

  const selectedCompletedCount = 
    (selectedDay.quantCompleted ? 1 : 0) + 
    (selectedDay.lrdiCompleted ? 1 : 0) + 
    (selectedDay.varcCompleted ? 1 : 0);

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
                  setSelectedDayName('Day 1');
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
                  setSelectedDayName('Day 1');
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
            const isSelected = selectedDayName === d.day;
            const completed = 
              (d.quantCompleted ? 1 : 0) + 
              (d.lrdiCompleted ? 1 : 0) + 
              (d.varcCompleted ? 1 : 0);

            return (
              <button
                key={d.day || dIdx}
                type="button"
                className={`mini-day-pill ${isSelected ? 'selected' : ''} ${isDayToday ? 'is-today' : ''}`}
                onClick={() => setSelectedDayName(d.day)}
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
              <div className="day-title-inline">
                <h2 className="selected-day-heading">{selectedDay.day}</h2>
                <span className="selected-date-tag">{selectedDayDateFormatted}</span>
                {selectedDayIsToday && <span className="today-live-tag">TODAY</span>}
              </div>
              <span className="day-syllabus-subtitle">
                {activeMonth} • {activeWeek} Syllabus Quotas
              </span>
            </div>

            <div className="day-quota-tally">
              <span className={`tally-score ${selectedCompletedCount === 3 ? 'all-done' : ''}`}>
                {selectedCompletedCount} / 3
              </span>
              <span className="tally-label">Quotas Cleared</span>
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
                <span className="drill-target-text" title={selectedDay.quantTarget}>
                  {selectedDay.quantTarget || 'Arithmetic & Algebra Practice Drill'}
                </span>

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
                <span className="drill-target-text" title={selectedDay.lrdiTarget}>
                  {selectedDay.lrdiTarget || '4 Matrix & Reasoning Sets'}
                </span>

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
                <span className="drill-target-text" title={selectedDay.varcTarget}>
                  {selectedDay.varcTarget || '4 Aeon Articles & RC Passages'}
                </span>

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
