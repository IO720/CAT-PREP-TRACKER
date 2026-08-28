import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { stripEmojis } from '../utils/textUtils';
import StudyCompanionEntity from './StudyCompanionEntity';
import AsciiMascot from './AsciiMascot';
import { playSoftZenChime, playSoftClick } from '../utils/audioUtils';
import SadCatGuiltTripModal from './SadCatGuiltTripModal';

export default function StudyTimerView({
  timerState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onFinishTimer,
  onUpdateNotes,
  todaySessions = [],
  todayTotalHours = 0,
  onDeleteSession,
  theme,
  onSetTheme,
  friends = [],
  onInspectFriend,
  currentUser = null,
  activeStreak = 0,
  onLeaveTimer,
  isFocusTransitioning = false
}) {
  const [showGuiltTrip, setShowGuiltTrip] = useState(false);
  const companionRef = useRef(null);
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
  const [notes, setNotes] = useState(stripEmojis(sessionNotes || ''));
  const [isZenFullscreen, setIsZenFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const prevSecondsLeftRef = useRef(secondsLeft);

  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimerMode(mode);
      setCurrentSubject(subject);
    }
  }, [mode, subject, isRunning, isPaused]);

  // Trigger soft zen chime when countdown naturally reaches 0
  useEffect(() => {
    if (
      prevSecondsLeftRef.current > 0 &&
      secondsLeft === 0 &&
      !isRunning &&
      !isPaused &&
      timerMode !== 'stopwatch'
    ) {
      if (!isMuted) {
        playSoftZenChime(0.32);
      }
    }
    prevSecondsLeftRef.current = secondsLeft;
  }, [secondsLeft, isRunning, isPaused, timerMode, isMuted]);

  // Fullscreen keyboard shortcuts (F for fullscreen, Space for pause/resume, Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in notes or input fields
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleZenFullscreen();
      } else if (e.key === ' ' && (isRunning || isPaused)) {
        e.preventDefault();
        if (isRunning) {
          playSoftClick();
          onPauseTimer();
        } else {
          playSoftClick();
          onResumeTimer();
        }
      } else if (e.key === 'Escape' && isZenFullscreen) {
        setIsZenFullscreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenFullscreen, isRunning, isPaused]);

  // Shared-Element Glide: Seamlessly glides the cat from bottom-right peeking spot directly into its desk chair!
  useEffect(() => {
    if (isFocusTransitioning && companionRef.current) {
      const el = companionRef.current;
      const rect = el.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const startX = window.innerWidth - (isMobile ? 60 : 110);
      const startY = window.innerHeight - (isMobile ? 70 : 130);

      const deltaX = startX - (rect.left + rect.width / 2);
      const deltaY = startY - (rect.top + rect.height / 2);

      gsap.fromTo(el,
        {
          x: deltaX,
          y: deltaY,
          scale: 0.62,
          opacity: 0.95
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'transform'
        }
      );
    }
  }, [isFocusTransitioning]);

  const toggleZenFullscreen = () => {
    playSoftClick();
    if (!isZenFullscreen) {
      setIsZenFullscreen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsZenFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleStart = () => {
    playSoftClick();
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

  const handleFinish = () => {
    if (!isMuted) {
      playSoftZenChime(0.3);
    }
    onFinishTimer(notes);
    if (isZenFullscreen) {
      setIsZenFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div className={`study-timer-minimal-container ${isZenFullscreen ? 'zen-fullscreen-mode' : ''}`}>
      
      {/* Floating Exit Button for Pure Deep Focus Fullscreen */}
      {isZenFullscreen && (
        <button
          type="button"
          className="zen-floating-exit-btn"
          onClick={toggleZenFullscreen}
          title="Exit Fullscreen (Esc or F)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>Exit Fullscreen</span>
        </button>
      )}

      {/* Header bar inside tab (Hidden completely in Deep Focus Fullscreen) */}
      {!isZenFullscreen && (
        <div className="minimal-timer-header">
          <div className="header-left">
            {/* Leave Sanctuary Button with Guilt Trip Trigger */}
            <button 
              type="button" 
              className="zen-leave-sanctuary-btn"
              onClick={() => setShowGuiltTrip(true)}
              title="Leave Focus Sanctuary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Leave Sanctuary</span>
            </button>

            <span className="live-timer-badge">
              <span className={`timer-pulse-dot ${isRunning ? 'active' : ''}`}></span>
              {isRunning ? 'Session Active' : isPaused ? 'Paused' : 'Ready'}
            </span>
          </div>

          <div className="header-right">
            {/* Audio Chime Mute/Unmute Toggle */}
            <button 
              type="button" 
              className={`zen-icon-btn ${isMuted ? 'muted' : ''}`}
              onClick={() => {
                setIsMuted(!isMuted);
                if (isMuted) playSoftZenChime(0.2);
              }}
              title={isMuted ? "Sound Muted (Click to enable soft completion chime)" : "Sound Enabled (Click to mute)"}
            >
              {isMuted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              )}
              <span className="desktop-inline">{isMuted ? "Chime Muted" : "Zen Chime"}</span>
            </button>

            {/* Deep Focus Fullscreen Toggle */}
            <button
              type="button"
              className={`zen-fullscreen-trigger-btn ${isZenFullscreen ? 'active' : ''}`}
              onClick={toggleZenFullscreen}
              title="Toggle Deep Focus Fullscreen Sanctuary (Shortcut: F)"
            >
              {isZenFullscreen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20"></polyline>
                  <polyline points="20 10 14 10 14 4"></polyline>
                  <line x1="14" y1="10" x2="21" y2="3"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              )}
              <span>{isZenFullscreen ? 'Exit Focus' : 'Deep Focus Mode'}</span>
            </button>

            {/* Today's Focus Hours summary badge */}
            <div className="minimal-hours-badge">
              <span className="hours-label">Today's Focus:</span>
              <span className="hours-val">{todayTotalHours.toFixed(1)} hrs</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Stage: Timer + Study Companion Layout */}
      <div className={`minimal-timer-stage ${isRunning ? 'is-running' : ''} ${isZenFullscreen ? 'fullscreen-stage' : ''}`}>
        
        {/* Companion Display: Animated ASCII Bot in Phosphor CRT theme, Standard Mascot in all other themes */}
        <div 
          ref={companionRef} 
          className={`stage-companion-container ${isFocusTransitioning ? 'transitioning-in' : ''}`}
        >
          {theme === 'phosphor-crt' ? (
            <AsciiMascot 
              isRunning={isRunning}
              subject={currentSubject}
              size={isZenFullscreen ? 230 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 175)}
            />
          ) : (
            <StudyCompanionEntity 
              isRunning={isRunning}
              isPaused={isPaused}
              isCompleted={secondsLeft === 0 && !isRunning && !isPaused}
              subject={currentSubject}
              size={isZenFullscreen ? 230 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 175)}
            />
          )}
        </div>

        {/* Center Stage: Dynamic Circular SVG Progress Ring (Enlarged) */}
        <div className="dynamic-timer-ring-container enlarged-ring">
          <svg className="timer-svg-ring" viewBox="0 0 320 320">
            <defs>
              <linearGradient id="timerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
                <stop offset="50%" stopColor="var(--accent-secondary, #ec4899)" />
                <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
              </linearGradient>
              <filter id="ringGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              className="timer-track-circle"
            />

            {/* Dynamic Animated Progress Circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              className={`timer-progress-circle ${isRunning ? 'active-glow' : ''}`}
              style={{
                strokeDasharray: 2 * Math.PI * 140,
                strokeDashoffset: totalSeconds > 0 
                  ? 2 * Math.PI * 140 * (1 - Math.max(0, Math.min(1, secondsLeft / totalSeconds)))
                  : 0
              }}
            />
          </svg>

          {/* Time Readout in Center */}
          <div className="minimal-timer-center-info">
            <span className="minimal-time-readout font-display">{formatTime(secondsLeft)}</span>
            <div className="minimal-sub-readout">
              <span className="subject-focus-badge">{currentSubject} FOCUS</span>
              {timerMode === 'stopwatch' && <span className="stopwatch-tag">• STOPWATCH</span>}
            </div>
            {isRunning && (
              <span className="live-sprint-indicator">
                <span className="pulse-sprint-dot"></span>
                <span>DEEP FOCUS ACTIVE</span>
              </span>
            )}
          </div>
        </div>

        {/* Primary Controls Bar */}
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
              <button 
                className="btn-secondary control-btn pause-control-btn" 
                onClick={() => { playSoftClick(); onPauseTimer(); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <span>Pause</span>
              </button>
              <button 
                className="btn-secondary control-btn reset-control-btn" 
                onClick={() => { playSoftClick(); onResetTimer(); }}
                title="Reset Session"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                <span>Reset</span>
              </button>
              <button className="btn-primary finish-btn control-btn" onClick={handleFinish}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Log Time</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-primary control-btn resume-control-btn" 
                onClick={() => { playSoftClick(); onResumeTimer(); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Resume</span>
              </button>
              <button 
                className="btn-secondary control-btn reset-control-btn" 
                onClick={() => { playSoftClick(); onResetTimer(); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                <span>Reset</span>
              </button>
              <button className="btn-primary finish-btn control-btn" onClick={handleFinish}>
                <span>Log Time</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* Sleek Minimal Options Bar below stage (Hidden in Fullscreen for zero distraction) */}
      {!isZenFullscreen && (
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
                    playSoftClick();
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
                onClick={() => { playSoftClick(); setTimerMode('custom'); }}
                disabled={isRunning || isPaused}
              >
                Custom
              </button>
              <button
                className={`minimal-pill ${timerMode === 'stopwatch' ? 'active' : ''}`}
                onClick={() => { playSoftClick(); setTimerMode('stopwatch'); }}
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
                  onClick={() => { playSoftClick(); setCurrentSubject(s); }}
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
              onChange={(e) => {
                const clean = stripEmojis(e.target.value);
                setNotes(clean);
                if (onUpdateNotes) onUpdateNotes(clean);
              }}
            />
          </div>

        </div>
      )}

      {/* Today's Logged Sessions Timeline (Hidden in Fullscreen) */}
      {!isZenFullscreen && (
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
      )}

      {/* Emotional Guilt-Trip Sad Cat Modal when attempting to leave focus sanctuary */}
      <SadCatGuiltTripModal
        isOpen={showGuiltTrip}
        onStay={() => setShowGuiltTrip(false)}
        onLeave={() => {
          setShowGuiltTrip(false);
          if (onLeaveTimer) onLeaveTimer();
        }}
        activeStreak={activeStreak}
        subject={currentSubject}
        secondsLeft={secondsLeft}
        isRunning={isRunning}
      />

    </div>
  );
}
