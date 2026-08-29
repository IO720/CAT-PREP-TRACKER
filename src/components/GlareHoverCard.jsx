import React, { useRef, useEffect } from 'react';

/**
 * GlareHoverCard - Ultra-Smooth High-Performance 3D Tilt & Glare
 * Features:
 * - Decoupled boundary container: outer container tracks events with 0 shift, inner card receives 3D transform.
 * - Completely eliminates coordinate feedback-loop stutter/jitter when hovering.
 * - Pure RAF direct GPU updates with 0 React re-renders.
 * - Smooth spring-back physics on mouseleave.
 */
export default function GlareHoverCard({
  children,
  className = '',
  maxTilt = 8,
  glareColor = 'rgba(255, 255, 255, 0.22)',
  style = {},
  onClick,
  ...props
}) {
  const containerRef = useRef(null);
  const tiltCardRef = useRef(null);
  const sheenRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const tiltCard = tiltCardRef.current;
    const sheen = sheenRef.current;
    if (!container || !tiltCard) return;

    // Check if device supports true hover
    const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isHoverCapable) return;

    let bounds = null;

    const onMouseEnter = () => {
      bounds = container.getBoundingClientRect();
      tiltCard.style.transition = 'transform 0.15s ease-out';
      if (sheen) sheen.style.opacity = '1';
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = container.getBoundingClientRect();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
        const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

        const rotX = (-normY * maxTilt).toFixed(2);
        const rotY = (normX * maxTilt).toFixed(2);

        // Hardware-accelerated transform on inner card ONLY (outer wrapper never moves)
        tiltCard.style.transition = 'none';
        tiltCard.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.012, 1.012, 1.012)`;

        if (sheen) {
          const glareX = ((x / bounds.width) * 100).toFixed(1);
          const glareY = ((y / bounds.height) * 100).toFixed(1);
          sheen.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, ${glareColor} 0%, rgba(255, 255, 255, 0) 65%)`;
        }
      });
    };

    const onMouseLeave = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      bounds = null;
      // Smooth liquid spring-back
      tiltCard.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      tiltCard.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (sheen) {
        sheen.style.transition = 'opacity 0.35s ease';
        sheen.style.opacity = '0';
      }
    };

    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [maxTilt, glareColor]);

  return (
    <div
      ref={containerRef}
      className={`glare-hover-card-root ${className}`}
      style={{
        ...style,
        position: 'relative'
      }}
      onClick={onClick}
      {...props}
    >
      {/* Inner 3D Tilt Card (Transforms independently of bounding box) */}
      <div
        ref={tiltCardRef}
        className="glare-card-tilt-stage"
        style={{
          width: '100%',
          height: '100%',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          position: 'relative'
        }}
      >
        <div className="glare-card-inner">
          {children}
        </div>

        {/* Dynamic 3D Glare Sheen Overlay */}
        <div
          ref={sheenRef}
          className="glare-hover-sheen-layer"
          style={{
            opacity: 0,
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
}
