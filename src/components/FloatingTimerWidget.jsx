import React from 'react';
import { Icons } from './AspirantIcons';

function FloatingTimerWidget({ timerState, onPause, onResume, onFinish, onOpenTimer }) {
  const { secondsLeft, isRunning, isPaused, visualTheme, subject } = timerState;

  if (!isRunning && !isPaused) return null;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className="floating-timer-widget">
      <div className="floating-timer-content" onClick={onOpenTimer} title="Click to open Focus Timer">
        <span className="floating-timer-icon">
          <Icons.Clock size={16} color="#3b82f6" />
        </span>
        <div className="floating-timer-details">
          <span className="floating-timer-time">{formatTime(secondsLeft)}</span>
          <span className="floating-timer-sub">{subject} Session</span>
        </div>
      </div>

      <div className="floating-timer-actions">
        {isRunning ? (
          <button className="floating-btn pause-btn" onClick={onPause} title="Pause Timer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        ) : (
          <button className="floating-btn resume-btn" onClick={onResume} title="Resume Timer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        )}
        <button className="floating-btn finish-btn" onClick={onFinish} title="Complete & Record Session">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default React.memo(FloatingTimerWidget);
