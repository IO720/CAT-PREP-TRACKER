import React, { useRef, useState, useCallback } from 'react';

/**
 * SpotlightCard - Inspired by React Bits (https://reactbits.dev/components/spotlight-card)
 * Premium interactive card with mouse-tracking radial spotlight glow,
 * dynamic animated border beam, and smooth spring hover physics.
 * 100% theme-aligned, zero-dependency.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(56, 189, 248, 0.15)',
  borderColor = 'rgba(56, 189, 248, 0.4)',
  isSelected = false,
  onClick,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: -1000, y: -1000 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`spotlight-card-root ${isSelected ? 'selected' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
        '--spotlight-color': spotlightColor,
        '--border-beam-color': borderColor
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      {...props}
    >
      {/* Radial cursor spotlight effect */}
      <div 
        className="spotlight-layer" 
        style={{ opacity: isHovered || isSelected ? 1 : 0 }} 
      />

      {/* Selected animated border beam */}
      {isSelected && <div className="border-beam-layer" />}

      {/* Card inner content */}
      <div className="spotlight-card-content">
        {children}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .spotlight-card-root {
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.2s ease,
                      box-shadow 0.2s ease,
                      background 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }

        .spotlight-card-root:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.5);
        }

        .spotlight-card-root.selected {
          background: rgba(56, 189, 248, 0.05);
          border-color: var(--accent-color, #38bdf8);
          box-shadow: 0 0 0 1px var(--accent-color, #38bdf8),
                      0 8px 25px -5px rgba(56, 189, 248, 0.25);
        }

        .spotlight-card-root:focus-visible {
          border-color: var(--accent-color, #38bdf8);
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4);
        }

        .spotlight-layer {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            280px circle at var(--mouse-x) var(--mouse-y),
            var(--spotlight-color),
            transparent 80%
          );
          transition: opacity 0.25s ease;
          z-index: 1;
        }

        .border-beam-layer {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--accent-color, #38bdf8) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: borderBeamSpin 3s linear infinite;
          z-index: 2;
        }

        @keyframes borderBeamSpin {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .spotlight-card-content {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
      `}} />
    </div>
  );
}
