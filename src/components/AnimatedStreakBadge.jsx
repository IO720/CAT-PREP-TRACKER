import React, { useState } from 'react';
import { AnimatedFlameIcon } from './AnimatedUiIcons';

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
      title={`${streak}-day active study streak`}
    >
      {/* Ambient Pulsing Glow Backdrop */}
      <div className="streak-ambient-glow" />

      {/* Living Animated Flame Graphic */}
      <div className="streak-flame-wrapper">
        <AnimatedFlameIcon size={18} />
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
            <span className="milestone-tag-inner" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <AnimatedFlameIcon size={13} />
              <span>ACTIVE MOMENTUM</span>
            </span>
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
