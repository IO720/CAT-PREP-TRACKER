import React from 'react';

/**
 * PrestigeBadgeEmblem - Handcrafted Unique Vector SVGs for Prestige Achievements
 * Renders distinct, geometric emblem artwork for Streaks, Drills, and Mocks.
 */
export default function PrestigeBadgeEmblem({ 
  badgeId, 
  category = 'streak', 
  color = '#38bdf8', 
  isUnlocked = false, 
  size = 48 
}) {
  const filterId = `emblemGlow_${badgeId}`;
  const gradId = `emblemGrad_${badgeId}`;

  // 1. Consistency & Streak Badges: Multi-facet Living Flame with Orbiting Sparks
  if (category === 'streak') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="prestige-svg-emblem">
        <defs>
          <linearGradient id={gradId} x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isUnlocked ? color : '#64748b'} />
            <stop offset="100%" stopColor={isUnlocked ? '#ec4899' : '#334155'} />
          </linearGradient>
          {isUnlocked && (
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Outer Hexagonal Shield */}
        <polygon 
          points="32,4 56,18 56,46 32,60 8,46 8,18" 
          fill={isUnlocked ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)'} 
          stroke={isUnlocked ? color : '#475569'} 
          strokeWidth="1.5" 
          strokeDasharray={isUnlocked ? 'none' : '3 3'}
        />

        {/* Core Living Multi-Tier Flame */}
        <path 
          d="M32 14 C36 22, 46 28, 44 40 C42 48, 34 52, 32 52 C30 52, 22 48, 20 40 C18 28, 28 22, 32 14 Z" 
          fill={`url(#${gradId})`} 
          filter={isUnlocked ? `url(#${filterId})` : 'none'}
        />
        
        {/* Inner White Flame Flare */}
        {isUnlocked && (
          <path 
            d="M32 28 C34 34, 38 38, 37 44 C36 48, 33 50, 32 50 C31 50, 28 48, 27 44 C26 38, 30 34, 32 28 Z" 
            fill="#ffffff" 
            opacity="0.85" 
          />
        )}

        {/* Orbiting Ember Sparkles */}
        {isUnlocked && (
          <g className="emblem-sparks">
            <circle cx="16" cy="22" r="1.5" fill={color} />
            <circle cx="48" cy="20" r="1.8" fill="#f43f5e" />
            <circle cx="46" cy="44" r="1.2" fill="#fbbf24" />
          </g>
        )}
      </svg>
    );
  }

  // 2. Question Solving & Drill Badges: Quantum Polyhedron & Sacred Geometry Core
  if (category === 'solved') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="prestige-svg-emblem">
        <defs>
          <linearGradient id={gradId} x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isUnlocked ? color : '#64748b'} />
            <stop offset="100%" stopColor={isUnlocked ? '#8b5cf6' : '#334155'} />
          </linearGradient>
        </defs>

        {/* Outer Rotating Diamond Ring */}
        <rect 
          x="32" y="6" width="36" height="36" rx="6" 
          transform="rotate(45 32 6)" 
          stroke={isUnlocked ? color : '#475569'} 
          strokeWidth="1.5" 
          fill="rgba(255,255,255,0.03)" 
        />

        {/* Inner Sacred Geometry Icosahedron Facets */}
        <polygon points="32,16 46,26 46,38 32,48 18,38 18,26" fill={`url(#${gradId})`} opacity={isUnlocked ? '0.85' : '0.3'} />
        <line x1="32" y1="16" x2="32" y2="48" stroke="#ffffff" strokeWidth="1" opacity={isUnlocked ? '0.6' : '0.2'} />
        <line x1="18" y1="26" x2="46" y2="38" stroke="#ffffff" strokeWidth="1" opacity={isUnlocked ? '0.6' : '0.2'} />
        <line x1="18" y1="38" x2="46" y2="26" stroke="#ffffff" strokeWidth="1" opacity={isUnlocked ? '0.6' : '0.2'} />

        {/* Central Luminous Singularity */}
        <circle cx="32" cy="32" r={isUnlocked ? 3.5 : 2} fill={isUnlocked ? '#ffffff' : '#64748b'} />
      </svg>
    );
  }

  // 3. Mock Test Mastery Badges: Imperial Laurel & Centurion Crown Emblem
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="prestige-svg-emblem">
      <defs>
        <linearGradient id={gradId} x1="16" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isUnlocked ? color : '#64748b'} />
          <stop offset="100%" stopColor={isUnlocked ? '#eab308' : '#334155'} />
        </linearGradient>
      </defs>

      {/* Laurel Wreath Left */}
      <path 
        d="M16 44 C12 36, 12 24, 20 16 C22 22, 26 26, 22 34 C20 38, 18 42, 16 44 Z" 
        fill={isUnlocked ? color : '#475569'} 
        opacity={isUnlocked ? '0.75' : '0.4'}
      />
      {/* Laurel Wreath Right */}
      <path 
        d="M48 44 C52 36, 52 24, 44 16 C42 22, 38 26, 42 34 C44 38, 46 42, 48 44 Z" 
        fill={isUnlocked ? color : '#475569'} 
        opacity={isUnlocked ? '0.75' : '0.4'}
      />

      {/* Centurion Imperial Crown */}
      <polygon 
        points="22,42 24,26 29,32 32,22 35,32 40,26 42,42" 
        fill={`url(#${gradId})`} 
        stroke={isUnlocked ? '#ffffff' : '#64748b'} 
        strokeWidth="1.2" 
      />

      {/* Pedestal Crown Base */}
      <rect x="22" y="44" width="20" height="4" rx="2" fill={isUnlocked ? '#ffffff' : '#64748b'} />

      {/* Crown Jewels (3 glowing crest pips) */}
      {isUnlocked && (
        <g fill="#ffffff">
          <circle cx="24" cy="25" r="1.5" />
          <circle cx="32" cy="21" r="1.8" fill="#fbbf24" />
          <circle cx="40" cy="25" r="1.5" />
        </g>
      )}
    </svg>
  );
}
