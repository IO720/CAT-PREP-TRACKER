import React, { useRef, useState } from 'react';

/**
 * GlareHoverCard - Inspired by ReactBits Glare Hover & 3D Tilt
 * Features:
 * - 3D Perspective tilt following mouse cursor position
 * - Dynamic holographic glare reflection that moves with light angle
 * - Theme-reactive ambient edge glow
 * - Touch-safe fallback with smooth spring-back on leave
 */
export default function GlareHoverCard({
  children,
  className = '',
  maxTilt = 12,
  glareColor = 'rgba(255, 255, 255, 0.25)',
  style = {},
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / centerX; // -1 to 1
    const normY = (y - centerY) / centerY; // -1 to 1

    const rotX = -normY * maxTilt;
    const rotY = normX * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);

    // Glare position percentage
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setGlareStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${glareColor} 0%, rgba(255, 255, 255, 0) 65%)`
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`glare-hover-card-root ${className} ${isHovered ? 'is-glare-hovered' : ''}`}
      style={{
        ...style,
        transform: transform || undefined,
        transition: isHovered ? 'transform 0.08s linear' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {/* Card Content */}
      <div className="glare-card-inner">
        {children}
      </div>

      {/* Dynamic 3D Glare Sheen Overlay */}
      <div
        className="glare-hover-sheen-layer"
        style={{
          ...glareStyle,
          transition: isHovered ? 'opacity 0.15s ease' : 'opacity 0.5s ease'
        }}
      />
    </div>
  );
}
