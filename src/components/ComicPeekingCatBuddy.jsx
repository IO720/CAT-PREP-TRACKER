import React, { useState, useRef, useEffect } from 'react';
import { AnimatedPawIcon } from './AnimatedUiIcons';

/**
 * ComicPeekingCatBuddy - The Exact Peeking "Zen Study Sprite" Mascot
 * - 100% visual match with official sprite (OnboardingMascotGuide & StudyCompanionEntity)
 * - Zero headset/headband (clean, elegant scholar sprite)
 * - AT REST: Only the ears and paws peek above the bottom edge; eyes are hidden
 * - ONLY ON HOVER: Head smoothly pops up so eyes emerge level with the ledge
 * - Speech active: head subtly bobs like it's talking
 * - Right tail: sways gently over the right edge
 * - Double-click headpat: happy ^ ^ arched eyes, blushing cheeks, floating vector hearts
 */
function ComicPeekingCatBuddy({
  onOpenTimer,
  timerState,
  activeTheme = 'dark',
  autoPromptTimer = false,
  onDismissPrompt
}) {
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isPatted, setIsPatted] = useState(false);

  const lastClickRef = useRef(0);
  const patTimeoutRef = useRef(null);

  // Automatically pop up speech bubble when user finishes onboarding without starting timer
  useEffect(() => {
    if (autoPromptTimer && !isTimerRunning) {
      setShowBubble(true);
    }
  }, [autoPromptTimer, isTimerRunning]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    };
  }, []);

  const triggerHeadpat = (e) => {
    if (e) e.stopPropagation();
    setIsPatted(true);
    setShowBubble(true);
    if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    patTimeoutRef.current = setTimeout(() => {
      setIsPatted(false);
    }, 2800);
  };

  const handleClick = () => {
    const now = Date.now();
    // Detect double click (under 380ms)
    if (now - lastClickRef.current < 380) {
      triggerHeadpat();
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
      setShowBubble(prev => !prev);
    }
  };

  const handleCloseBubble = (e) => {
    if (e) e.stopPropagation();
    setShowBubble(false);
    if (typeof onDismissPrompt === 'function') {
      onDismissPrompt();
    }
  };

  return (
    <div className={`bottom-peeking-cat-wrapper ${autoPromptTimer ? 'just-arrived' : ''}`}>
      {/* Speech Dialogue Bubble ("Psst let's go study!" / Headpat response) */}
      {showBubble && (
        <div className="bottom-peeking-cat-bubble animate-slide-up">
          <div className="cat-bubble-header">
            <div className="cat-bubble-tag">
              <AnimatedPawIcon size={12} color="var(--accent-color, #38bdf8)" />
              <span className="cat-bubble-callout">
                {isPatted ? "*PURRR~!*" : "*PSST!*"}
              </span>
            </div>
            <button 
              type="button" 
              className="cat-bubble-close"
              onClick={handleCloseBubble}
              title="Close"
            >
              ×
            </button>
          </div>

          <p className="cat-bubble-message">
            {isPatted
              ? "*Purrrr~!* Headpat received! Focus stamina recharged. Ready to conquer your goals?"
              : isTimerRunning
                ? `Session active (${timerState?.subject || 'Drill'})! Let's lock in.`
                : autoPromptTimer
                  ? "Workspace calibrated! 25 minutes of pure focus awaits. Ready to start your first session?"
                  : "Let's go study! 25 minutes of pure focus."}
          </p>

          <button 
            type="button"
            className="cat-bubble-action-btn"
            style={{
              background: 'var(--accent-color, #38bdf8)',
              color: 'var(--accent-text, #09090b)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
            onClick={() => {
              handleCloseBubble();
              onOpenTimer();
            }}
          >
            <span>{isTimerRunning ? "View Active Timer" : "Start Focus Timer"}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <div className="cat-bubble-notch" />
        </div>
      )}

      {/* Floating Headpat Vector Particles (No Emojis) */}
      {isPatted && (
        <div className="cat-headpat-burst" aria-hidden="true">
          <svg className="burst-heart burst-1" viewBox="0 0 24 24" fill="#ec4899">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="burst-sparkle burst-2" viewBox="0 0 24 24" fill="#38bdf8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg className="burst-heart burst-3" viewBox="0 0 24 24" fill="#f43f5e">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      )}

      {/* The Peeking Cat: ONLY ears and paws visible at rest; ONLY on hover do eyes pop out */}
      <button
        type="button"
        className={`bottom-cat-peeking-trigger ${isHovered ? 'hovered' : ''} ${isPatted ? 'patted' : ''} ${showBubble ? 'talking' : ''}`}
        onClick={handleClick}
        onDoubleClick={triggerHeadpat}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Zen Study Sprite - Hover to peek, double-click to pat!"
        aria-label="Zen Study Sprite - hover to peek"
      >
        <svg 
          viewBox="18 10 76 56" 
          className="bottom-cat-svg zen-sprite-svg" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="zenSpriteBodyGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
              <stop offset="100%" stopColor="var(--accent-secondary, #818cf8)" />
            </linearGradient>

            <linearGradient id="zenSpriteEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
            </linearGradient>
          </defs>

          {/* Right Peeking Tail (Swaying over right edge) */}
          <path 
            d="M70 60 Q84 48 82 34 Q85 26 89 31 Q92 39 87 50 Q82 58 74 62 Z" 
            fill="url(#zenSpriteBodyGrad)" 
            className="cat-ledge-tail" 
          />

          {/* Head & Face Group (Bobs subtly when talking, pops up on hover) */}
          <g className={`cat-head-group ${showBubble ? 'talking' : ''}`}>
            {/* Seamless Organic Cat Head & Ears Silhouette */}
            <path 
              d="M 50,66 C 26,66 26,42 30,28 L 32,12 L 42,22 Q 50,19 58,22 L 68,12 L 70,28 C 74,42 74,66 50,66 Z" 
              fill="url(#zenSpriteBodyGrad)" 
            />

            {/* Inner Ear Gradient Flaps */}
            <polygon points="34,26 33,16 41,23" fill="url(#zenSpriteEarInnerGrad)" opacity="0.85" />
            <polygon points="66,26 67,16 59,23" fill="url(#zenSpriteEarInnerGrad)" opacity="0.85" />

            {/* Scholar Glasses (NO HEADSET!) */}
            <g className="scholar-glasses">
              {/* Left Lens */}
              <circle cx="41" cy="42" r="7.5" fill="rgba(11, 15, 25, 0.75)" stroke="#ffffff" strokeWidth="1.4" />
              {/* Right Lens */}
              <circle cx="59" cy="42" r="7.5" fill="rgba(11, 15, 25, 0.75)" stroke="#ffffff" strokeWidth="1.4" />
              {/* Bridge */}
              <path d="M48.5 42 Q50 40 51.5 42" stroke="#ffffff" strokeWidth="1.4" fill="none" />

              {/* Eyes Inside Glasses */}
              {isPatted ? (
                /* Joyful Arched Smiling Eyes (^ ^ like Horimiya reference image) */
                <g stroke="var(--accent-color, #38bdf8)" strokeWidth="2" strokeLinecap="round" fill="none">
                  <path d="M37.5 43.5 Q41 39 44.5 43.5" />
                  <path d="M55.5 43.5 Q59 39 62.5 43.5" />
                </g>
              ) : (
                /* Focused Studying Eyes with Shiny Specular Highlight */
                <g fill="var(--accent-color, #38bdf8)">
                  <circle cx="41" cy="42" r="2.6" />
                  <circle cx="59" cy="42" r="2.6" />
                  <circle cx="42.2" cy="40.8" r="0.9" fill="#ffffff" />
                  <circle cx="60.2" cy="40.8" r="0.9" fill="#ffffff" />
                </g>
              )}
            </g>

            {/* Nose & Whiskers */}
            <path d="M48.5 48.5 L51.5 48.5 L50 50.5 Z" fill="#f472b6" />
            <path d="M50 50.5 L50 52.5" stroke="rgba(255,255,255,0.7)" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M34 49 L25 47 M34 51 L24 52" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M66 49 L75 47 M66 51 L76 52" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" strokeLinecap="round" />

            {/* Blushing Cheeks when Patted */}
            {isPatted && (
              <g className="cat-blush">
                <ellipse cx="33" cy="46" rx="3.5" ry="2" fill="#f43f5e" opacity="0.8" />
                <ellipse cx="67" cy="46" rx="3.5" ry="2" fill="#f43f5e" opacity="0.8" />
                <path d="M47.5 52 Q50 54 52.5 52" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </g>
            )}
          </g>

          {/* Resting Paws Gripping the Ledge */}
          <g className="cat-ledge-paws">
            <ellipse cx="38" cy="62" rx="6" ry="4" fill="url(#zenSpriteBodyGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.9" />
            <ellipse cx="62" cy="62" rx="6" ry="4" fill="url(#zenSpriteBodyGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.9" />
          </g>
        </svg>
      </button>
    </div>
  );
}

export default React.memo(ComicPeekingCatBuddy);
