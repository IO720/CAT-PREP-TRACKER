import React, { useRef, useEffect } from 'react';

/**
 * GlareHoverCard - Ultra-Smooth High-Performance 3D Tilt & Glare
 * Features:
 * - 0 React re-renders on mousemove (pure RAF + direct GPU style updates)
 * - Zero CSS transition conflict during hover (eliminates jitter and micro-stuttering)
 * - Smooth spring-back physics on mouseleave
 * - Touch-device aware (gracefully disabled on touchscreens to prevent erratic tilt)
 */
export default function GlareHoverCard({
  children,
  className = '',
  maxTilt = 10,
  glareColor = 'rgba(255, 255, 255, 0.22)',
  style = {},
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const sheenRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const sheen = sheenRef.current;
    if (!card) return;

    // Check if device supports true hover (skip on touch devices)
    const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isHoverCapable) return;

    let bounds = null;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.15s ease-out';
      if (sheen) sheen.style.opacity = '1';
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        const normX = (x - centerX) / centerX;
        const normY = (y - centerY) / centerY;

        const rotX = (-normY * maxTilt).toFixed(2);
        const rotY = (normX * maxTilt).toFixed(2);

        // Direct hardware-accelerated transform with NO transition lag during active mousemove
        card.style.transition = 'none';
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015, 1.015, 1.015)`;

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
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (sheen) {
        sheen.style.transition = 'opacity 0.4s ease';
        sheen.style.opacity = '0';
      }
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      card.removeEventListener('mouseenter', onMouseEnter);
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [maxTilt, glareColor]);

  return (
    <div
      ref={cardRef}
      className={`glare-hover-card-root ${className}`}
      style={{
        ...style,
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
      onClick={onClick}
      {...props}
    >
      {/* Card Content */}
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
  );
}
