import React from 'react';

/**
 * MythicBannerOverlay - Specialized 60fps Vector SVG Overlays for Mythic Banners
 * Strictly Zero-Emoji: 100% precision SVG vectors, laser visors, warp tunnels & HUD telemetry.
 */
export default function MythicBannerOverlay({ bannerId }) {
  if (!bannerId) return null;

  if (bannerId === 'mecha_cat') {
    return (
      <div className="mythic-overlay-container mecha-cat-overlay" aria-hidden="true">
        <svg 
          viewBox="0 0 800 240" 
          preserveAspectRatio="xMidYMid slice" 
          className="mythic-svg-canvas"
        >
          <defs>
            <linearGradient id="catNeonTealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2dd4bf" stopOpacity="1" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="catEyeLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="catVisorGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="laserBeamGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Tactical Hexagonal Coordinate Field */}
          <g opacity="0.35" stroke="#14b8a6" strokeWidth="0.8" fill="none">
            <polygon points="120,40 140,40 150,58 140,76 120,76 110,58" />
            <polygon points="160,40 180,40 190,58 180,76 160,76 150,58" />
            <polygon points="140,76 160,76 170,94 160,112 140,112 130,94" />
            <polygon points="680,140 700,140 710,158 700,176 680,176 670,158" />
            <polygon points="720,140 740,140 750,158 740,176 720,176 710,158" />
          </g>

          {/* 2. Cyber Radar Scope in Top Right */}
          <g transform="translate(680, 80)" opacity="0.8">
            <circle cx="0" cy="0" r="45" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="#14b8a6" strokeWidth="0.8" opacity="0.6" />
            <circle cx="0" cy="0" r="15" fill="none" stroke="#2dd4bf" strokeWidth="0.8" />
            {/* Rotating Radar Sweep Line */}
            <g className="cat-radar-spinner">
              <line x1="0" y1="0" x2="45" y2="0" stroke="#5eead4" strokeWidth="1.8" filter="url(#catVisorGlow)" />
            </g>
            {/* Target Blips */}
            <circle cx="18" cy="-12" r="2.5" fill="#5eead4" filter="url(#catVisorGlow)" className="cat-blip-pulse" />
            <circle cx="-22" cy="16" r="2" fill="#2dd4bf" className="cat-blip-pulse-2" />
          </g>

          {/* 3. Holographic Mecha Cat Silhouette & Visor */}
          <g transform="translate(420, 25)" filter="url(#catVisorGlow)">
            {/* Geometric Cyber Cat Ears */}
            <polygon points="40,90 10,25 70,55" fill="none" stroke="url(#catNeonTealGrad)" strokeWidth="2" opacity="0.9" />
            <polygon points="160,90 190,25 130,55" fill="none" stroke="url(#catNeonTealGrad)" strokeWidth="2" opacity="0.9" />
            {/* Inner Ear Tech Antennae */}
            <line x1="25" y1="38" x2="55" y2="60" stroke="#5eead4" strokeWidth="1.5" />
            <line x1="175" y1="38" x2="145" y2="60" stroke="#5eead4" strokeWidth="1.5" />

            {/* Cranial Armor Plate */}
            <polygon points="70,55 100,45 130,55 150,85 100,95 50,85" fill="#042f2e" stroke="#2dd4bf" strokeWidth="1.8" opacity="0.85" />
            
            {/* Holographic Glowing Visor (Eyes) */}
            <g className="cat-eyes-glow-group">
              {/* Left Cyber Visor Lens */}
              <polygon points="62,100 88,100 82,114 56,114" fill="url(#catEyeLaserGrad)" filter="url(#laserBeamGlow)" />
              {/* Right Cyber Visor Lens */}
              <polygon points="112,100 138,100 144,114 118,114" fill="url(#catEyeLaserGrad)" filter="url(#laserBeamGlow)" />
              {/* Visor Glint Crosshairs */}
              <circle cx="72" cy="107" r="2" fill="#ffffff" />
              <circle cx="128" cy="107" r="2" fill="#ffffff" />
            </g>

            {/* Whisker Laser Probes */}
            <line x1="45" y1="125" x2="5" y2="120" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="45" y1="135" x2="0" y2="138" stroke="#14b8a6" strokeWidth="1.2" />
            <line x1="155" y1="125" x2="195" y2="120" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="155" y1="135" x2="200" y2="138" stroke="#14b8a6" strokeWidth="1.2" />

            {/* Nose & Chin Chassis */}
            <polygon points="95,122 105,122 100,128" fill="#5eead4" />
            <path d="M 90 134 Q 100 142 110 134" fill="none" stroke="#2dd4bf" strokeWidth="1.5" />
          </g>

          {/* 4. Left HUD Audio Telemetry Frequency Bars (Visual Only - No Cluttering Text) */}
          <g transform="translate(60, 185)" opacity="0.8" className="cat-hud-eq-bars">
            <rect x="0" y="0" width="4" height="12" fill="#2dd4bf" className="eq-bar b1" />
            <rect x="7" y="0" width="4" height="18" fill="#5eead4" className="eq-bar b2" />
            <rect x="14" y="0" width="4" height="8" fill="#14b8a6" className="eq-bar b3" />
            <rect x="21" y="0" width="4" height="22" fill="#2dd4bf" className="eq-bar b4" />
            <rect x="28" y="0" width="4" height="14" fill="#5eead4" className="eq-bar b5" />
            <rect x="35" y="0" width="4" height="20" fill="#14b8a6" className="eq-bar b6" />
            <rect x="42" y="0" width="4" height="10" fill="#2dd4bf" className="eq-bar b7" />
          </g>

          {/* 5. Sweeping Cyan Laser Beam across horizon */}
          <line x1="0" y1="230" x2="800" y2="230" stroke="#2dd4bf" strokeWidth="2" filter="url(#catVisorGlow)" opacity="0.65" />
          <line x1="0" y1="230" x2="800" y2="230" stroke="#5eead4" strokeWidth="0.8" opacity="0.9" />
        </svg>
      </div>
    );
  }

  if (bannerId === 'prismatic_warp') {
    return (
      <div className="mythic-overlay-container prismatic-warp-overlay" aria-hidden="true">
        <svg 
          viewBox="0 0 800 240" 
          preserveAspectRatio="xMidYMid slice" 
          className="mythic-svg-canvas"
        >
          <defs>
            <radialGradient id="warpCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0.7" />
              <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="warpRayGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <linearGradient id="warpRayGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <filter id="warpGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Accelerating Hyperspace Star Streaks (shooting from center 400, 120) */}
          <g className="hyperspace-rays-group" strokeWidth="1.8" filter="url(#warpGlowFilter)">
            {/* Quad 1: Top-Right */}
            <line x1="400" y1="120" x2="780" y2="20" stroke="url(#warpRayGrad1)" className="warp-ray ray-1" />
            <line x1="400" y1="120" x2="680" y2="10" stroke="url(#warpRayGrad2)" className="warp-ray ray-2" />
            <line x1="400" y1="120" x2="790" y2="90" stroke="url(#warpRayGrad1)" className="warp-ray ray-3" />
            {/* Quad 2: Bottom-Right */}
            <line x1="400" y1="120" x2="780" y2="220" stroke="url(#warpRayGrad2)" className="warp-ray ray-4" />
            <line x1="400" y1="120" x2="640" y2="235" stroke="url(#warpRayGrad1)" className="warp-ray ray-5" />
            <line x1="400" y1="120" x2="790" y2="160" stroke="url(#warpRayGrad2)" className="warp-ray ray-6" />
            {/* Quad 3: Bottom-Left */}
            <line x1="400" y1="120" x2="20" y2="220" stroke="url(#warpRayGrad1)" className="warp-ray ray-7" />
            <line x1="400" y1="120" x2="160" y2="235" stroke="url(#warpRayGrad2)" className="warp-ray ray-8" />
            <line x1="400" y1="120" x2="10" y2="160" stroke="url(#warpRayGrad1)" className="warp-ray ray-9" />
            {/* Quad 4: Top-Left */}
            <line x1="400" y1="120" x2="20" y2="20" stroke="url(#warpRayGrad2)" className="warp-ray ray-10" />
            <line x1="400" y1="120" x2="120" y2="10" stroke="url(#warpRayGrad1)" className="warp-ray ray-11" />
            <line x1="400" y1="120" x2="10" y2="90" stroke="url(#warpRayGrad2)" className="warp-ray ray-12" />
          </g>

          {/* 2. Expanding Concentric Chromatic Shockwaves */}
          <g className="hyperspace-rings-group" fill="none">
            <ellipse cx="400" cy="120" rx="40" ry="25" stroke="#f43f5e" strokeWidth="1.5" className="warp-ring ring-1" />
            <ellipse cx="400" cy="120" rx="90" ry="55" stroke="#a855f7" strokeWidth="1.8" className="warp-ring ring-2" />
            <ellipse cx="400" cy="120" rx="160" ry="95" stroke="#38bdf8" strokeWidth="2.2" className="warp-ring ring-3" />
            <ellipse cx="400" cy="120" rx="240" ry="145" stroke="#ec4899" strokeWidth="1.5" className="warp-ring ring-4" />
          </g>

          {/* 3. Warp Core Singularity */}
          <g transform="translate(400, 120)" className="warp-core-pulse">
            <circle cx="0" cy="0" r="55" fill="url(#warpCoreGrad)" />
            <circle cx="0" cy="0" r="16" fill="#ffffff" filter="url(#warpGlowFilter)" />
            {/* Quad Prismatic Diffraction Spikes */}
            <polygon points="0,-75 3,-8 75,0 3,8 0,75 -3,8 -75,0 -3,-8" fill="#ffffff" opacity="0.9" filter="url(#warpGlowFilter)" />
          </g>
        </svg>
      </div>
    );
  }

  return null;
}
