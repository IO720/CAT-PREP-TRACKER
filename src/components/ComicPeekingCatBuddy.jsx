import React, { useState } from 'react';
import { AnimatedPawIcon } from './AnimatedUiIcons';

/**
 * ComicPeekingCatBuddy - Discreet Bottom-Right Peeking Cat
 * - Displays ONLY cute cat ears and paws peeking over the bottom ledge (NO eyes)
 * - Playful micro-animations: ear wiggles & gentle paw taps
 * - Exact same theme-reactive colors as StudyCompanionEntity
 * - Dialogue: "*PSST!* Let's go study!" with quick 1-click timer launcher
 */
function ComicPeekingCatBuddy({
  onOpenTimer,
  timerState,
  activeTheme = 'dark'
}) {
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  return (
    <div className="bottom-peeking-cat-wrapper">
      {/* Speech Dialogue Bubble ("Psst let's go study!") */}
      {showBubble && (
        <div className="bottom-peeking-cat-bubble animate-slide-up">
          <div className="cat-bubble-header">
            <div className="cat-bubble-tag">
              <AnimatedPawIcon size={12} color="var(--accent-color, #38bdf8)" />
              <span className="cat-bubble-callout">*PSST!*</span>
            </div>
            <button 
              type="button" 
              className="cat-bubble-close"
              onClick={() => setShowBubble(false)}
              title="Close"
            >
              ×
            </button>
          </div>

          <p className="cat-bubble-message">
            {isTimerRunning
              ? `Session active (${timerState?.subject || 'Drill'})! Let's lock in.`
              : "Let's go study! 25 minutes of pure focus."}
          </p>

          <button 
            type="button"
            className="cat-bubble-action-btn"
            onClick={() => {
              setShowBubble(false);
              onOpenTimer();
            }}
          >
            {isTimerRunning ? "View Active Timer ➔" : "Start Focus Timer ➔"}
          </button>
          <div className="cat-bubble-notch" />
        </div>
      )}

      {/* The Peeking Cat: ONLY Paws & Cat Ears (No Eyes) */}
      <button
        type="button"
        className={`bottom-cat-peeking-trigger ${isHovered ? 'hovered' : ''} ${isTimerRunning ? 'active' : ''}`}
        onClick={() => setShowBubble(prev => !prev)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Psst! Click to start study timer"
        aria-label="Cat Study Buddy"
      >
        <svg 
          viewBox="0 0 100 48" 
          className="bottom-cat-svg" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="catLedgeBodyGrad" x1="10" y1="10" x2="90" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
              <stop offset="50%" stopColor="var(--accent-secondary, #818cf8)" />
              <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
            </linearGradient>
            <linearGradient id="catLedgeEarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
            </linearGradient>
          </defs>

          {/* Left Cat Ear */}
          <polygon points="18,48 24,10 40,36" fill="url(#catLedgeBodyGrad)" className="cat-ledge-ear left-ear" />
          <polygon points="21,44 26,17 37,36" fill="url(#catLedgeEarGrad)" opacity="0.85" />

          {/* Right Cat Ear */}
          <polygon points="82,48 76,10 60,36" fill="url(#catLedgeBodyGrad)" className="cat-ledge-ear right-ear" />
          <polygon points="79,44 74,17 63,36" fill="url(#catLedgeEarGrad)" opacity="0.85" />

          {/* Head Crown Arch (Just the top rim of head hiding behind ledge) */}
          <path d="M38,36 Q50,30 62,36 L62,48 L38,48 Z" fill="url(#catLedgeBodyGrad)" />

          {/* Left Paw Gripping the Ledge */}
          <g className="cat-ledge-paw left-paw">
            <ellipse cx="28" cy="42" rx="10" ry="6.5" fill="url(#catLedgeBodyGrad)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.2" />
            <circle cx="22" cy="41" r="1.3" fill="#f472b6" />
            <circle cx="28" cy="39.5" r="1.4" fill="#f472b6" />
            <circle cx="34" cy="41" r="1.3" fill="#f472b6" />
          </g>

          {/* Right Paw Gripping the Ledge */}
          <g className="cat-ledge-paw right-paw">
            <ellipse cx="72" cy="42" rx="10" ry="6.5" fill="url(#catLedgeBodyGrad)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.2" />
            <circle cx="66" cy="41" r="1.3" fill="#f472b6" />
            <circle cx="72" cy="39.5" r="1.4" fill="#f472b6" />
            <circle cx="78" cy="41" r="1.3" fill="#f472b6" />
          </g>
        </svg>
      </button>
    </div>
  );
}

export default React.memo(ComicPeekingCatBuddy);
