import React, { useState, useEffect } from 'react';

export default function StudyTimerView({
  timerState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onFinishTimer,
  todaySessions = [],
  todayTotalHours = 0,
  onDeleteSession,
  theme,
  onSetTheme,
  friends = [],
  onInspectFriend,
  currentUser = null
}) {
  const {
    secondsLeft,
    totalSeconds,
    isRunning,
    isPaused,
    mode,
    subject,
    startTimeStr,
    sessionNotes
  } = timerState;

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timerMode, setTimerMode] = useState(mode || 'pomodoro');
  const [currentSubject, setCurrentSubject] = useState(subject || 'Quant');
  const [notes, setNotes] = useState(sessionNotes || '');

  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimerMode(mode);
      setCurrentSubject(subject);
    }
  }, [mode, subject, isRunning, isPaused]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(progress * 100)));

  // Circle dimensions for 260px SVG ring
  const circleRadius = 110;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference - (progress * circumference);

  const handleStart = () => {
    let targetMins = selectedDuration;
    if (timerMode === 'custom') targetMins = customMinutes;
    if (timerMode === 'stopwatch') targetMins = 0;

    onStartTimer({
      durationMinutes: targetMins,
      mode: timerMode,
      visualTheme: 'glow',
      subject: currentSubject,
      notes: notes
    });
  };

  return (
    <div className="study-timer-minimal-container">
      {/* Header bar inside tab */}
      <div className="minimal-timer-header">
        <div className="header-left">
          <h1 className="minimal-page-title">Focus Session</h1>
          <span className="live-timer-badge">
            <span className={`timer-pulse-dot ${isRunning ? 'active' : ''}`}></span>
            {isRunning ? 'Session Active' : isPaused ? 'Paused' : 'Ready'}
          </span>
        </div>

        <div className="header-right">
          {/* Today's Focus Hours summary badge */}
          <div className="minimal-hours-badge">
            <span className="hours-label">Today's Focus:</span>
            <span className="hours-val">{todayTotalHours.toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      {/* Main Center Stage: Pure Circular Progression */}
      <div className={`minimal-timer-stage ${isRunning ? 'is-running' : ''}`}>
        
        {/* Sleek SVG Radial Progress Ring */}
        <div className="radial-ring-wrapper">
          <svg width="280" height="280" viewBox="0 0 260 260" className="minimal-radial-svg">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-color)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
              <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="130"
              cy="130"
              r={circleRadius}
              className="radial-ring-bg"
            />

            {/* Dynamic Progress Circle */}
            <circle
              cx="130"
              cy="130"
              r={circleRadius}
              className="radial-ring-fill"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeOffset
              }}
              filter="url(#ringGlow)"
            />
          </svg>

          {/* Time Typography inside the Ring */}
          <div className="radial-ring-content">
            <div className="minimal-time-readout">{formatTime(secondsLeft)}</div>
            <div className="minimal-sub-readout">{currentSubject} Focus • {progressPercent}% Completed</div>
          </div>
        </div>

        {/* Primary Controls Row */}
        <div className="minimal-controls-bar">
          {!isRunning && !isPaused ? (
            <button className="btn-primary minimal-start-btn" onClick={handleStart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Start Study Session</span>
            </button>
          ) : isRunning ? (
            <>
              <button className="btn-secondary control-btn pause-control-btn" onClick={onPauseTimer}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <span>Pause</span>
              </button>
              <button className="btn-primary finish-btn control-btn" onClick={onFinishTimer}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Log Time ({startTimeStr ? `${startTimeStr} - Now` : 'Log'})</span>
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary control-btn resume-control-btn" onClick={onResumeTimer}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Resume</span>
              </button>
              <button className="btn-primary finish-btn control-btn" onClick={onFinishTimer}>
                <span>Log Time</span>
              </button>
              <button className="btn-secondary control-btn reset-control-btn" onClick={onResetTimer}>
                <span>Reset</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* Sleek Minimal Options Bar below stage */}
      <div className="minimal-settings-grid">
        
        {/* Duration / Mode Selector */}
        <div className="minimal-box">
          <span className="minimal-box-label">Duration Preset</span>
          <div className="minimal-pills-group">
            {[15, 25, 45, 50, 60].map(m => (
              <button
                key={m}
                className={`minimal-pill ${timerMode === 'pomodoro' && selectedDuration === m ? 'active' : ''}`}
                onClick={() => {
                  setTimerMode('pomodoro');
                  setSelectedDuration(m);
                }}
                disabled={isRunning || isPaused}
              >
                {m}m
              </button>
            ))}
            <button
              className={`minimal-pill ${timerMode === 'custom' ? 'active' : ''}`}
              onClick={() => setTimerMode('custom')}
              disabled={isRunning || isPaused}
            >
              Custom
            </button>
            <button
              className={`minimal-pill ${timerMode === 'stopwatch' ? 'active' : ''}`}
              onClick={() => setTimerMode('stopwatch')}
              disabled={isRunning || isPaused}
            >
              Stopwatch
            </button>
          </div>
          {timerMode === 'custom' && (
            <div className="custom-mins-inline">
              <span>Target Mins:</span>
              <input
                type="number"
                className="drill-input custom-mins-input"
                min="1"
                max="480"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isRunning || isPaused}
              />
            </div>
          )}
        </div>

        {/* Prep Subject Pill Selector */}
        <div className="minimal-box">
          <span className="minimal-box-label">Prep Subject</span>
          <div className="minimal-pills-group">
            {['Quant', 'LRDI', 'VARC', 'General'].map(s => (
              <button
                key={s}
                className={`minimal-pill ${currentSubject === s ? 'active' : ''}`}
                onClick={() => setCurrentSubject(s)}
                disabled={isRunning || isPaused}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Session Notes */}
        <div className="minimal-box wide-box">
          <span className="minimal-box-label">Session Focus Notes</span>
          <input
            type="text"
            className="day-textarea minimal-notes-input"
            placeholder="e.g. Practicing Time & Work Level-2 sets..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

      </div>

      {/* Today's Logged Sessions Timeline */}
      <div className="sessions-history-section">
        <div className="history-header-row">
          <div>
            <h3 className="section-title">Today's Recorded Sessions</h3>
            <p className="section-subtitle">
              Time intervals automatically logged directly from your system clock.
            </p>
          </div>
          <div className="today-badge-chip">
            {todaySessions.length} Sessions Logged Today
          </div>
        </div>

        {todaySessions.length === 0 ? (
          <div className="empty-sessions-box">
            <p>No study sessions logged yet for today. Hit start above to begin!</p>
          </div>
        ) : (
          <div className="sessions-timeline-grid">
            {todaySessions.map((s, idx) => (
              <div key={s.id || idx} className="session-card">
                <div className="session-card-header">
                  <span className={`subject-badge badge-${s.subject?.toLowerCase()}`}>
                    {s.subject || 'General'}
                  </span>
                  <span className="session-duration-tag">
                    {s.durationMinutes} mins ({ (s.durationMinutes / 60).toFixed(1) } hrs)
                  </span>
                </div>
                <div className="session-time-range">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{s.startTime} - {s.endTime}</span>
                </div>
                {s.notes && <div className="session-notes-text">"{s.notes}"</div>}
                <div className="session-card-footer">
                  <span className="session-mode-badge">{s.mode || 'Pomodoro'}</span>
                  {onDeleteSession && (
                    <button
                      className="delete-session-btn"
                      onClick={() => onDeleteSession(s.id)}
                      title="Remove session log"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
