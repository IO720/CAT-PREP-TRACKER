import React from 'react';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';

/**
 * SkiperAnimatedTimer
 * Official implementation pattern of Skiper UI 37 (https://skiper-ui.com/v1/skiper37)
 * Animated number countdown & stopwatch timer using @number-flow/react.
 * Features rolling mechanical digit columns with fluid spring physics,
 * continuous trend direction, and tabular spacing without layout shift.
 */
function SkiperAnimatedTimer({
  seconds = 0,
  className = '',
  style = {}
}) {
  const totalSecs = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const isMobile = typeof window !== 'undefined' && (
    (typeof window.innerWidth === 'number' && window.innerWidth < 768) || 
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches)
  );

  // Zero-overhead pure tabular layout on mobile for 120fps hardware fluidity
  if (isMobile) {
    return (
      <div
        className={`skiper-animated-timer-root ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          userSelect: 'none',
          lineHeight: 1,
          ...style
        }}
      >
        {hours > 0 && `${String(hours).padStart(2, '0')}:`}
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
    );
  }

  return (
    <NumberFlowGroup>
      <div
        className={`skiper-animated-timer-root ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
          userSelect: 'none',
          lineHeight: 1,
          ...style
        }}
      >
        {hours > 0 && (
          <>
            <NumberFlow
              value={hours}
              format={{ minimumIntegerDigits: 2 }}
              trend={-1}
              willChange
            />
            <span className="skiper-timer-colon">:</span>
          </>
        )}
        <NumberFlow
          value={mins}
          format={{ minimumIntegerDigits: 2 }}
          trend={-1}
          willChange
        />
        <span className="skiper-timer-colon">:</span>
        <NumberFlow
          value={secs}
          format={{ minimumIntegerDigits: 2 }}
          trend={-1}
          willChange
        />
      </div>
    </NumberFlowGroup>
  );
}

export default React.memo(SkiperAnimatedTimer);
