import React from 'react';

/**
 * WordHoverEffect
 * Premium kinetic text roll & chromatic hover effect.
 * Features:
 * - Dual-layer kinetic slide reveal
 * - 100% responsive with zero layout shift (does not expand, push or wrap surrounding text)
 * - Accessible and touch friendly
 */
export default function WordHoverEffect({
  text = '',
  accentText,
  className = '',
  style = {}
}) {
  const displayAccent = accentText || text;

  return (
    <span
      className={`word-hover-root ${className}`}
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        cursor: 'default',
        lineHeight: 'inherit',
        ...style
      }}
    >
      <span className="word-hover-track">
        <span className="word-hover-primary">{text}</span>
        <span className="word-hover-secondary" aria-hidden="true">
          {displayAccent}
        </span>
      </span>
    </span>
  );
}
