import React, { useState } from 'react';
import { 
  getCalculatedDateForTrackerDay, 
  formatDateMonthDay, 
  isToday, 
  getTodayTrackerPosition 
} from '../utils/dateUtils';

export default function DailyTrackerView({ 
  state, 
  activeMonth, 
  setActiveMonth, 
  activeWeek, 
  setActiveWeek, 
  updateDayMetric, 
  updateDayNotes 
}) {
  const { tracker, settings } = state;
  const startDateStr = settings?.startDate;
  const months = Object.keys(tracker);
  
  // Available weeks in current month
  const weeks = tracker[activeMonth] || [];

  // Card animation and particle states
  const [animatingCards, setAnimatingCards] = useState({});
  const [particles, setParticles] = useState([]);

  // Calculate today's tracker position for quick jump
  const todayPosition = getTodayTrackerPosition(startDateStr, tracker);

  const handleJumpToToday = () => {
    setActiveMonth(todayPosition.activeMonth);
    setActiveWeek(todayPosition.activeWeek);
  };

  const handleCheckboxChange = (month, weekName, dayName, subject, isChecked, e) => {
    const cardId = `${dayName}-${subject}`;
    
    if (isChecked) {
      // 1. Trigger Card pop animation
      setAnimatingCards(prev => ({ ...prev, [cardId]: true }));
      setTimeout(() => {
        setAnimatingCards(prev => ({ ...prev, [cardId]: false }));
      }, 300);

      // 2. Trigger Sparkles Particle Explosion
      if (e && e.target) {
        const rect = e.target.getBoundingClientRect();
        
        // Spawn 12 tiny particle sparkles radiating from the checkbox center
        const newParticles = Array.from({ length: 12 }, (_, idx) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = 30 + Math.random() * 50; // Explosion radius
          const tx = `${Math.cos(angle) * distance}px`;
          const ty = `${Math.sin(angle) * distance}px`;
          
          return {
            id: Date.now() + idx,
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.top + rect.height / 2}px`,
            tx,
            ty
          };
        });

        setParticles(prev => [...prev, ...newParticles]);
        
        // Cleanup particles after fly transition (600ms)
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 600);
      }
    }

    // Determine default quantity based on subject
    let defaultQty = 0;
    if (isChecked) {
      if (subject === 'quant') defaultQty = 18;
      if (subject === 'lrdi') defaultQty = 4;
      if (subject === 'varc') defaultQty = 4;
    }
    
    updateDayMetric(month, weekName, dayName, subject, isChecked, defaultQty);
  };

  const handleQtyChange = (month, weekName, dayName, subject, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    const isCompleted = qty > 0;
    updateDayMetric(month, weekName, dayName, subject, isCompleted, qty);
  };

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">Daily Drills</h1>
          <p className="page-subtitle">Track your day-by-day practice checklists synced to your OS/Web calendar.</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary jump-today-btn" 
            onClick={handleJumpToToday}
            title="Jump directly to Today's drills"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Jump to Today ({todayPosition.todayMonthDayStr})</span>
          </button>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="tracker-tabs-row">
        {months.map(m => (
          <button
            key={m}
            className={`tracker-tab ${activeMonth === m ? 'active' : ''}`}
            onClick={() => {
              setActiveMonth(m);
              setActiveWeek('Week 1');
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Week Tabs */}
      <div className="tracker-subtabs-row">
        {weeks.map(w => (
          <button
            key={w.week}
            className={`tracker-subtab ${activeWeek === w.week ? 'active' : ''}`}
            onClick={() => setActiveWeek(w.week)}
          >
            {w.week}
          </button>
        ))}
      </div>

      {/* Days List */}
      <div className="days-grid">
        {weeks.find(w => w.week === activeWeek)?.days.map((day, dIdx) => {
          const completedCount = 
            (day.quantCompleted ? 1 : 0) + 
            (day.lrdiCompleted ? 1 : 0) + 
            (day.varcCompleted ? 1 : 0);

          const dayCalculatedDate = getCalculatedDateForTrackerDay(activeMonth, activeWeek, day.day, startDateStr);
          const dayDateFormatted = formatDateMonthDay(dayCalculatedDate);
          const dayIsToday = isToday(activeMonth, activeWeek, day.day, startDateStr);

          return (
            <div key={dIdx} className={`day-panel ${dayIsToday ? 'today-panel' : ''}`}>
              <div className="day-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="day-name">{day.day}</h3>
                    {dayIsToday && (
                      <span className="today-badge">
                        <span className="today-live-pulse"></span>
                        TODAY
                      </span>
                    )}
                  </div>
                  <div className="day-date-subtext" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{dayDateFormatted}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className="day-completions-badge">
                    {completedCount} / 3 Tasks Done
                  </span>
                  {day.studyHours > 0 && (
                    <span className="day-hours-badge" title="Total hours studied logged from Timer">
                      {day.studyHours.toFixed(1)} hrs studied
                    </span>
                  )}
                </div>
              </div>

              {/* Logged Timer Sessions List */}
              {day.sessions && day.sessions.length > 0 && (
                <div className="day-sessions-summary-row">
                  <span className="sessions-summary-title">Recorded Sessions:</span>
                  <div className="sessions-chips-list">
                    {day.sessions.map((s, sIdx) => (
                      <span key={s.id || sIdx} className="day-session-chip">
                        {s.startTime} - {s.endTime} ({s.durationMinutes}m {s.subject})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Drills Grid */}
              <div className="day-drills-row">
                {/* Quant Drill */}
                <div className={`drill-card ${day.quantCompleted ? 'completed' : ''} ${animatingCards[`${day.day}-quant`] ? 'pop-active' : ''}`}>
                  <div className="drill-label-row">
                    <input
                      type="checkbox"
                      id={`${activeMonth}-${activeWeek}-${day.day}-quant`}
                      className="drill-checkbox"
                      checked={day.quantCompleted}
                      onChange={(e) => handleCheckboxChange(activeMonth, activeWeek, day.day, 'quant', e.target.checked, e)}
                    />
                    <div className="drill-text">
                      <div style={{ fontWeight: 600 }}>Quant Practice</div>
                      <div className={`drill-text ${day.quantCompleted ? 'strikethrough' : ''}`} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {day.quantTarget}
                      </div>
                    </div>
                  </div>
                  <div className="drill-counter-row">
                    <span>Solved Qs:</span>
                    <input
                      type="number"
                      className="drill-input"
                      value={day.quantCount}
                      min="0"
                      onChange={(e) => handleQtyChange(activeMonth, activeWeek, day.day, 'quant', e.target.value)}
                    />
                  </div>
                </div>

                {/* LRDI Drill */}
                <div className={`drill-card ${day.lrdiCompleted ? 'completed' : ''} ${animatingCards[`${day.day}-lrdi`] ? 'pop-active' : ''}`}>
                  <div className="drill-label-row">
                    <input
                      type="checkbox"
                      id={`${activeMonth}-${activeWeek}-${day.day}-lrdi`}
                      className="drill-checkbox"
                      checked={day.lrdiCompleted}
                      onChange={(e) => handleCheckboxChange(activeMonth, activeWeek, day.day, 'lrdi', e.target.checked, e)}
                    />
                    <div className="drill-text">
                      <div style={{ fontWeight: 600 }}>LRDI Practice</div>
                      <div className={`drill-text ${day.lrdiCompleted ? 'strikethrough' : ''}`} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {day.lrdiTarget}
                      </div>
                    </div>
                  </div>
                  <div className="drill-counter-row">
                    <span>Solved Sets:</span>
                    <input
                      type="number"
                      className="drill-input"
                      value={day.lrdiCount}
                      min="0"
                      onChange={(e) => handleQtyChange(activeMonth, activeWeek, day.day, 'lrdi', e.target.value)}
                    />
                  </div>
                </div>

                {/* VARC Drill */}
                <div className={`drill-card ${day.varcCompleted ? 'completed' : ''} ${animatingCards[`${day.day}-varc`] ? 'pop-active' : ''}`}>
                  <div className="drill-label-row">
                    <input
                      type="checkbox"
                      id={`${activeMonth}-${activeWeek}-${day.day}-varc`}
                      className="drill-checkbox"
                      checked={day.varcCompleted}
                      onChange={(e) => handleCheckboxChange(activeMonth, activeWeek, day.day, 'varc', e.target.checked, e)}
                    />
                    <div className="drill-text">
                      <div style={{ fontWeight: 600 }}>VARC Practice</div>
                      <div className={`drill-text ${day.varcCompleted ? 'strikethrough' : ''}`} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {day.varcTarget}
                      </div>
                    </div>
                  </div>
                  <div className="drill-counter-row">
                    <span>Solved RCs:</span>
                    <input
                      type="number"
                      className="drill-input"
                      value={day.varcCount}
                      min="0"
                      onChange={(e) => handleQtyChange(activeMonth, activeWeek, day.day, 'varc', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Day Notes & Error Log */}
              <div className="day-notes-box">
                <label className="day-notes-label" htmlFor={`notes-${activeMonth}-${activeWeek}-${day.day}`}>
                  Day Notes & Error Log (Triggers, Mistakes, Formulas)
                </label>
                <textarea
                  id={`notes-${activeMonth}-${activeWeek}-${day.day}`}
                  className="day-textarea"
                  placeholder="e.g., Silly mistake in Percentage formula logic. Need to focus on Games & Tournaments set constraints..."
                  value={day.notes}
                  onChange={(e) => updateDayNotes(activeMonth, activeWeek, day.day, e.target.value)}
                />
              </div>
            </div>
          );
        })}
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
