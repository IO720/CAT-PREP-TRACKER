import React, { useState } from 'react';

/**
 * AnimatedStreakBadge - Luxury Unique Flame & Floating Embers Streak Component
 * Features:
 * - Multi-layer SVG flame with dynamic pulsation
 * - Rising glowing ember micro-particles
 * - Ambient gradient pulse glow border
 * - Interactive milestone popover on hover/click
 */
export default function AnimatedStreakBadge({ streak = 0, totalDays = 112 }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="animated-streak-badge-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(prev => !prev)}
      role="button"
      tabIndex={0}
      title="Active Study Streak"
    >
      {/* Flame Icon with Animated Rising Embers */}
      <div className="streak-flame-wrapper">
        <svg 
          className="streak-flame-svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="streakFlameGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <filter id="flameGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M12 2C9.5 6.5 13 9 11 12C9.5 14.25 7 13.5 7 17C7 19.76 9.24 22 12 22C14.76 22 17 19.76 17 17C17 13 14 11 14 8C14 5.5 12.5 3.5 12 2Z" 
            fill="url(#streakFlameGrad)"
            filter="url(#flameGlow)"
            className="flame-body-path"
          />
          <path 
            d="M12 11C11 13 12 14.5 11 16C10.5 17 9.5 17.5 9.5 18.5C9.5 19.88 10.62 21 12 21C13.38 21 14.5 19.88 14.5 18.5C14.5 16.5 13 15.5 13 14C13 12.5 12.3 11.8 12 11Z" 
            fill="#fef08a" 
            opacity="0.85"
            className="flame-inner-core"
          />
        </svg>

        {/* Rising Particle Embers */}
        <span className="ember-particle ember-1"></span>
        <span className="ember-particle ember-2"></span>
        <span className="ember-particle ember-3"></span>
      </div>

      {/* Streak Number & Label */}
      <div className="streak-data-text">
        <span className="streak-bold-val">{streak}</span>
        <span className="streak-unit-label">{streak === 1 ? 'Day' : 'Days'}</span>
      </div>

      {/* Interactive Milestone Tooltip */}
      {showTooltip && (
        <div className="streak-floating-milestone-popover" role="tooltip">
          <div className="milestone-top-tag">
            <span>🔥 ACTIVE MOMENTUM</span>
            <span className="milestone-ratio">{streak}/{totalDays}d</span>
          </div>
          <p className="milestone-desc">
            {streak > 0 
              ? `${streak} consecutive day(s) practiced. Observation defines outcome.`
              : "Complete today's drill to start your streak."}
          </p>
          <div className="milestone-progress-bar">
            <div 
              className="milestone-progress-fill" 
              style={{ width: `${Math.min(100, (streak / totalDays) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
