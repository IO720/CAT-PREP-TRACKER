import React, { useMemo } from 'react';

/**
 * ChronoTimerHUD
 * Futuristic chronograph HUD bezel for timer progression.
 * Features:
 * - 60 precision micro-ticks around perimeter
 * - Cardinal telemetry markers
 * - Smooth glowing progression arc with leading orbital laser beacon for countdown
 * - For stopwatch: sleek static bezel (no depletion) as requested
 */
export default function ChronoTimerHUD({
  timerMode = 'pomodoro',
  secondsLeft = 0,
  totalSeconds = 1500,
  isRunning = false,
  children
}) {
  const isStopwatch = timerMode === 'stopwatch';

  // Progress fraction: 1 at start down to 0 at completion
  const progress = useMemo(() => {
    if (isStopwatch || totalSeconds <= 0) return 1;
    return Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  }, [isStopwatch, secondsLeft, totalSeconds]);

  const radius = 138;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isStopwatch ? 0 : circumference * (1 - progress);

  // Position of leading beacon at the front tip of progress arc
  const beaconPos = useMemo(() => {
    if (isStopwatch) return null;
    const angleDeg = -90 + (progress * 360);
    const rad = (angleDeg * Math.PI) / 180;
    return {
      cx: 160 + radius * Math.cos(rad),
      cy: 160 + radius * Math.sin(rad)
    };
  }, [isStopwatch, progress, radius]);

  // 60 precision radar ticks
  const ticks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6) * (Math.PI / 180);
      const isMajor = i % 5 === 0;
      const rInner = isMajor ? 147 : 151;
      const rOuter = 155;
      arr.push({
        x1: 160 + rInner * Math.cos(angle),
        y1: 160 + rInner * Math.sin(angle),
        x2: 160 + rOuter * Math.cos(angle),
        y2: 160 + rOuter * Math.sin(angle),
        isMajor
      });
    }
    return arr;
  }, []);

  return (
    <div className="chrono-hud-container">
      <svg className="chrono-hud-svg" viewBox="0 0 320 320">
        <defs>
          <linearGradient id="chronoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
            <stop offset="50%" stopColor="var(--accent-secondary, #ec4899)" />
            <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
          </linearGradient>
          <filter id="hudLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 60 Precision Radar Perimeter Ticks */}
        <g className="chrono-ticks-group">
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="var(--border-color, rgba(255, 255, 255, 0.15))"
              strokeWidth={t.isMajor ? 1.75 : 1}
              opacity={t.isMajor ? 0.75 : 0.25}
            />
          ))}
        </g>

        {/* Background Track Arc */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="5"
        />

        {/* Dynamic Sweep Arc (or Static Bezel for Stopwatch) */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke={isStopwatch ? "var(--accent-color, #38bdf8)" : "url(#chronoGrad)"}
          strokeWidth={isStopwatch ? "2.5" : "5.5"}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter={isRunning ? "url(#hudLaserGlow)" : "none"}
          className={`chrono-progress-arc ${isStopwatch ? 'static-stopwatch' : ''}`}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '160px 160px',
            transition: isStopwatch ? 'none' : 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          opacity={isStopwatch ? 0.45 : 1}
        />

        {/* Leading Orbital Laser Beacon (Countdown only) */}
        {!isStopwatch && beaconPos && progress > 0 && progress < 1 && (
          <circle
            cx={beaconPos.cx}
            cy={beaconPos.cy}
            r="4"
            fill="#ffffff"
            filter="drop-shadow(0 0 6px var(--accent-color, #38bdf8))"
            className="chrono-beacon-dot"
          />
        )}

        {/* 4 Cardinal Crosshair Accents */}
        <line x1="160" y1="12" x2="160" y2="18" stroke="var(--accent-color, #38bdf8)" strokeWidth="2" opacity="0.8" />
        <line x1="160" y1="302" x2="160" y2="308" stroke="var(--accent-color, #38bdf8)" strokeWidth="2" opacity="0.8" />
        <line x1="12" y1="160" x2="18" y2="160" stroke="var(--accent-color, #38bdf8)" strokeWidth="2" opacity="0.8" />
        <line x1="302" y1="160" x2="308" y2="160" stroke="var(--accent-color, #38bdf8)" strokeWidth="2" opacity="0.8" />
      </svg>

      {/* Centered Readout & Indicators */}
      <div className="chrono-center-content">
        {children}
      </div>
    </div>
  );
}
