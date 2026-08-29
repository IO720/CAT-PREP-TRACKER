import React from 'react';

/**
 * AnimatedUiIcons - Pure Vector Handcrafted Animated SVGs
 * Zero emojis - 100% vector SVG with GPU-accelerated CSS animations.
 */

// 1. Animated Living Flame (Replaces 🔥 emoji)
export function AnimatedFlameIcon({ size = 20, color = '#f97316', className = '' }) {
  const gradId = `flameGrad_${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-flame ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {/* Outer Living Flame */}
      <path
        d="M12 2C13.5 5 17 8 17 13C17 17.4 14.5 21 12 21C9.5 21 7 17.4 7 13C7 8 10.5 5 12 2Z"
        fill={`url(#${gradId})`}
        className="flame-outer-path"
      />
      {/* Inner Core Flame Flare */}
      <path
        d="M12 9C13 11 15 13 15 15.5C15 17.5 13.7 19.5 12 19.5C10.3 19.5 9 17.5 9 15.5C9 13 11 11 12 9Z"
        fill="#ffffff"
        opacity="0.85"
        className="flame-inner-path"
      />
      {/* Ember Sparkles */}
      <circle cx="15.5" cy="5.5" r="0.8" fill="#fbbf24" className="flame-spark-1" />
      <circle cx="8" cy="8" r="0.7" fill="#f97316" className="flame-spark-2" />
    </svg>
  );
}

// 2. Animated Warning Hexagon Shield (Replaces ⚠️ emoji)
export function AnimatedWarningIcon({ size = 18, color = '#ef4444', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-warning ${className}`}
    >
      <polygon
        points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2"
        stroke={color}
        strokeWidth="1.8"
        fill="rgba(239, 68, 68, 0.12)"
        strokeLinejoin="round"
        className="warning-hex-pulse"
      />
      <line x1="12" y1="7.5" x2="12" y2="13.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.2" fill={color} className="warning-dot-blink" />
    </svg>
  );
}

// 3. Animated Beckoning Cat Paw (Replaces 🐾 emoji)
export function AnimatedPawIcon({ size = 18, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-paw ${className}`}
    >
      {/* Main Soft Paw Pad */}
      <path
        d="M12 12C9.5 12 7.5 14 7.5 16.5C7.5 18.5 9.2 20 12 20C14.8 20 16.5 18.5 16.5 16.5C16.5 14 14.5 12 12 12Z"
        fill={color}
      />
      {/* 4 Cute Toe Beans */}
      <circle cx="6.5" cy="10.5" r="2" fill={color} className="toe-bean toe-1" />
      <circle cx="10" cy="7.5" r="2.1" fill={color} className="toe-bean toe-2" />
      <circle cx="14" cy="7.5" r="2.1" fill={color} className="toe-bean toe-3" />
      <circle cx="17.5" cy="10.5" r="2" fill={color} className="toe-bean toe-4" />
    </svg>
  );
}

// 4. Animated Glistening Tear (Replaces 😿 tear emoji)
export function AnimatedTearIcon({ size = 18, color = '#0284c7', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-tear ${className}`}
    >
      <path
        d="M12 3C12 3 6 12 6 16C6 19.3 8.7 22 12 22C15.3 22 18 19.3 18 16C18 12 12 3 12 3Z"
        fill={color}
        className="tear-drop-flow"
      />
      <circle cx="10" cy="15" r="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

// 5. Animated Bullseye Target (Replaces 🎯 emoji)
export function AnimatedTargetIcon({ size = 18, color = '#3b82f6', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-target ${className}`}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" className="target-ring-outer" />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.6" className="target-ring-mid" />
      <circle cx="12" cy="12" r="2" fill={color} className="target-center-pip" />
    </svg>
  );
}

// 6. Animated Apex Champion Crown
export function AnimatedCrownIcon({ size = 22, color = '#fbbf24', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-crown ${className}`}
    >
      <path
        d="M2 4L5 19H19L22 4L16 10L12 2L8 10L2 4Z"
        fill="url(#crownGrad)"
        stroke="#fef08a"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className="crown-body"
      />
      <circle cx="2" cy="4" r="1.5" fill="#fef08a" className="crown-jewel-left" />
      <circle cx="12" cy="2" r="1.8" fill="#ffffff" className="crown-jewel-center" />
      <circle cx="22" cy="4" r="1.5" fill="#fef08a" className="crown-jewel-right" />
      <defs>
        <linearGradient id="crownGrad" x1="12" y1="2" x2="12" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 7. Animated Electric Lightning Bolt
export function AnimatedLightningIcon({ size = 18, color = '#ff3344', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-lightning ${className}`}
    >
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinejoin="round"
        className="lightning-path"
      />
    </svg>
  );
}

// 8. Animated Clashing Battle Swords
export function AnimatedSwordsIcon({ size = 18, color = '#ff3344', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-swords ${className}`}
    >
      <path d="M14.5 17.5L3 6V3H6L17.5 14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="sword-left" />
      <path d="M13 19L19 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 16L20 20" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M19 21L21 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 17.5L21 6V3H18L6.5 14.5" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="sword-right" />
      <path d="M11 19L5 13" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 16L4 20" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 21L3 19" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="#ffffff" className="swords-clash-spark" />
    </svg>
  );
}

// 9. Animated 4-Point Sparkling Star
export function AnimatedSparkleIcon({ size = 18, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-sparkle ${className}`}
    >
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill={color}
        className="sparkle-star-shape"
      />
      <circle cx="12" cy="12" r="2" fill="#ffffff" />
    </svg>
  );
}

// 10. Animated Shield Check (Verified Badge)
export function AnimatedShieldCheckIcon({ size = 18, color = '#34d399', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-shield-check ${className}`}
    >
      <path
        d="M12 2L20 5.5V11C20 16.5 16.5 21 12 22.5C7.5 21 4 16.5 4 11V5.5L12 2Z"
        stroke={color}
        strokeWidth="1.8"
        fill="rgba(52, 211, 153, 0.12)"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12L11 14.5L15.5 9.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shield-check-tick"
      />
    </svg>
  );
}

// 11. Animated Radar Beacon (Telemetry Pulse)
export function AnimatedRadarBeaconIcon({ size = 18, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-radar ${className}`}
    >
      <circle cx="12" cy="12" r="3" fill={color} />
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.5" opacity="0.6" className="radar-ring-1" />
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1" opacity="0.3" className="radar-ring-2" />
    </svg>
  );
}


