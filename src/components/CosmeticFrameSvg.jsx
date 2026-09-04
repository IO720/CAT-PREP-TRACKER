import React from 'react';

/**
 * CosmeticFrameSvg - Vector SVG Overlays for Unlockable Avatar Frames
 * Renders high-tier gamer cosmetics (Valorant / Apex / Steam style)
 * Zero raw emojis used - 100% vector SVG artwork.
 */
export default function CosmeticFrameSvg({ frameId = 'default' }) {
  if (!frameId) return null;

  switch (frameId) {
    case 'neon_cyber': // Level 3 • Rare (Electric Gyro)
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="cosmetic-svg-frame frame-svg-neon_cyber"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="neonCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Rotating Gyro Tech Ring */}
          <g className="gyro-spin-ring">
            <circle cx="50" cy="50" r="46" fill="none" stroke="url(#neonCyanGrad)" strokeWidth="1.8" strokeDasharray="14 6 8 6" filter="url(#neonGlow)" />
            {/* 4 Orbital Cyan Power Nodes */}
            <circle cx="50" cy="4" r="3" fill="#38bdf8" filter="url(#neonGlow)" />
            <circle cx="96" cy="50" r="3" fill="#38bdf8" filter="url(#neonGlow)" />
            <circle cx="50" cy="96" r="3" fill="#38bdf8" filter="url(#neonGlow)" />
            <circle cx="4" cy="50" r="3" fill="#38bdf8" filter="url(#neonGlow)" />
          </g>

          {/* Inner Counter-Rotating Reticle Ring */}
          <g className="gyro-counter-ring">
            <circle cx="50" cy="50" r="41" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 8" opacity="0.8" />
          </g>

          {/* 4 HUD Targeting Brackets */}
          <path d="M 12 24 L 12 12 L 24 12" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 88 24 L 88 12 L 76 12" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 88 76 L 88 88 L 76 88" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 12 76 L 12 88 L 24 88" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'solar_flare': // Level 5 • Epic (Solar Corona)
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="cosmetic-svg-frame frame-svg-solar_flare"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="solarCoronaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="solarGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 8 Radiant Solar Corona Flame Spikes */}
          <g className="solar-flame-burst" filter="url(#solarGlow)">
            {/* Top / Bottom / Left / Right Major Solar Spikes */}
            <polygon points="50,2 45,10 55,10" fill="#fbbf24" />
            <polygon points="50,98 45,90 55,90" fill="#f97316" />
            <polygon points="2,50 10,45 10,55" fill="#f97316" />
            <polygon points="98,50 90,45 90,55" fill="#fbbf24" />
            {/* 4 Diagonal Minor Spikes */}
            <polygon points="16,16 23,20 20,23" fill="#fbbf24" />
            <polygon points="84,16 77,20 80,23" fill="#fbbf24" />
            <polygon points="84,84 77,80 80,77" fill="#ef4444" />
            <polygon points="16,84 23,80 20,77" fill="#ef4444" />
          </g>

          {/* Blazing Coronal Plasma Ring */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#solarCoronaGrad)" strokeWidth="3" filter="url(#solarGlow)" className="solar-plasma-corona" />
          {/* Inner Swirling Ember Ring */}
          <circle cx="50" cy="50" r="41" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="12 4 6 4" opacity="0.9" className="solar-spin-inner" />
        </svg>
      );

    case 'amethyst_void': // Level 8 • Epic (Void Sorcery)
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="cosmetic-svg-frame frame-svg-amethyst_void"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="voidVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <filter id="voidGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Interlocked Dual Squares (8-Pointed Octagram Runic Seal) */}
          <g className="void-runic-seal" filter="url(#voidGlow)">
            {/* Square 1 */}
            <rect x="18" y="18" width="64" height="64" rx="4" fill="none" stroke="url(#voidVioletGrad)" strokeWidth="1.8" />
            {/* Square 2 (Rotated 45 degrees) */}
            <rect x="18" y="18" width="64" height="64" rx="4" fill="none" stroke="url(#voidVioletGrad)" strokeWidth="1.8" transform="rotate(45 50 50)" />
          </g>

          {/* 8 Outer Void Spark Nodes */}
          <g className="void-nodes" fill="#c084fc">
            <circle cx="50" cy="8" r="2.5" />
            <circle cx="92" cy="50" r="2.5" />
            <circle cx="50" cy="92" r="2.5" />
            <circle cx="8" cy="50" r="2.5" />
            <circle cx="20" cy="20" r="2.5" />
            <circle cx="80" cy="20" r="2.5" />
            <circle cx="80" cy="80" r="2.5" />
            <circle cx="20" cy="80" r="2.5" />
          </g>

          {/* Inner Arcane Ring */}
          <circle cx="50" cy="50" r="41" fill="none" stroke="#d8b4fe" strokeWidth="1.4" strokeDasharray="6 4" className="void-pulse-inner" />
        </svg>
      );

    case 'emerald_matrix': // Level 12 • Legendary (Matrix Infiltrator)
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="cosmetic-svg-frame frame-svg-emerald_matrix"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="matrixGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="matrixBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a7f3d0" stopOpacity="1" />
              <stop offset="70%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="matrixGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Animated Vertical Matrix Phosphor Code Drops */}
          <g className="matrix-rain-streams" stroke="#34d399" strokeWidth="1.2" opacity="0.85">
            <line x1="14" y1="12" x2="14" y2="88" strokeDasharray="3 7 5 9 2 6" className="matrix-rain-stream col-1" />
            <line x1="24" y1="6" x2="24" y2="94" strokeDasharray="4 6 2 8 6 4" className="matrix-rain-stream col-2" />
            <line x1="76" y1="6" x2="76" y2="94" strokeDasharray="5 8 3 6 4 7" className="matrix-rain-stream col-3" />
            <line x1="86" y1="12" x2="86" y2="88" strokeDasharray="2 9 6 5 3 8" className="matrix-rain-stream col-4" />
          </g>

          {/* 2. Sweeping Laser HUD Scanline */}
          <g className="matrix-scanner-sweep-wrap">
            <line x1="6" y1="50" x2="94" y2="50" stroke="url(#matrixBeamGrad)" strokeWidth="2" filter="url(#matrixGlow)" className="matrix-beam-line" />
          </g>

          {/* 3. Cybernetic Tactical Corner Reticles & Brackets */}
          <g filter="url(#matrixGlow)">
            {/* Top-Left Tactical Frame */}
            <path d="M 5 28 L 5 7 L 28 7" fill="none" stroke="url(#matrixGreenGrad)" strokeWidth="3" strokeLinecap="square" />
            <polygon points="5,7 12,7 5,14" fill="#34d399" />
            <line x1="10" y1="12" x2="20" y2="12" stroke="#6ee7b7" strokeWidth="1.2" />
            <circle cx="28" cy="7" r="1.5" fill="#a7f3d0" />

            {/* Top-Right Tactical Frame */}
            <path d="M 95 28 L 95 7 L 72 7" fill="none" stroke="url(#matrixGreenGrad)" strokeWidth="3" strokeLinecap="square" />
            <polygon points="95,7 88,7 95,14" fill="#34d399" />
            <line x1="90" y1="12" x2="80" y2="12" stroke="#6ee7b7" strokeWidth="1.2" />
            <circle cx="72" cy="7" r="1.5" fill="#a7f3d0" />

            {/* Bottom-Right Tactical Frame */}
            <path d="M 95 72 L 95 93 L 72 93" fill="none" stroke="url(#matrixGreenGrad)" strokeWidth="3" strokeLinecap="square" />
            <polygon points="95,93 88,93 95,86" fill="#34d399" />
            <line x1="90" y1="88" x2="80" y2="88" stroke="#6ee7b7" strokeWidth="1.2" />
            <circle cx="72" cy="93" r="1.5" fill="#a7f3d0" />

            {/* Bottom-Left Tactical Frame */}
            <path d="M 5 72 L 5 93 L 28 93" fill="none" stroke="url(#matrixGreenGrad)" strokeWidth="3" strokeLinecap="square" />
            <polygon points="5,93 12,93 5,86" fill="#34d399" />
            <line x1="10" y1="88" x2="20" y2="88" stroke="#6ee7b7" strokeWidth="1.2" />
            <circle cx="28" cy="93" r="1.5" fill="#a7f3d0" />
          </g>

          {/* 4. Rotating Inner Cyber Reticle */}
          <g className="matrix-inner-reticle">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="8 6 3 6" opacity="0.75" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#34d399" strokeWidth="0.8" strokeDasharray="2 12" opacity="0.6" />
          </g>

          {/* 5. Edge Crosshairs & Telemetry Hex Points */}
          <line x1="50" y1="2" x2="50" y2="11" stroke="#a7f3d0" strokeWidth="1.8" />
          <line x1="50" y1="89" x2="50" y2="98" stroke="#a7f3d0" strokeWidth="1.8" />
          <line x1="2" y1="50" x2="11" y2="50" stroke="#a7f3d0" strokeWidth="1.8" />
          <line x1="89" y1="50" x2="98" y2="50" stroke="#a7f3d0" strokeWidth="1.8" />
        </svg>
      );

    case 'imperial_gold': // Level 15 • Legendary (Imperial Laurel)
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="cosmetic-svg-frame frame-svg-imperial_gold"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="imperialGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            <filter id="royalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Radiant Royal Diamond Apex Star Crest at Top */}
          <g className="imperial-apex-star" filter="url(#royalGlow)">
            {/* 4-point Diamond Star */}
            <polygon points="50,1 54,9 62,9 56,15 58,23 50,18 42,23 44,15 38,9 46,9" fill="url(#imperialGoldGrad)" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="50" cy="13" r="2.2" fill="#ffffff" />
          </g>

          {/* Left Laurel Leaves */}
          <g className="imperial-wreath" fill="url(#imperialGoldGrad)" stroke="#ca8a04" strokeWidth="0.6">
            <path d="M 36 14 C 30 15 22 22 18 30 C 24 28 32 23 36 14 Z" />
            <path d="M 24 26 C 16 30 10 40 8 50 C 15 46 22 38 24 26 Z" />
            <path d="M 12 44 C 7 52 7 64 12 72 C 16 64 19 54 12 44 Z" />
            <path d="M 16 68 C 14 76 22 84 32 90 C 30 82 25 74 16 68 Z" />
          </g>

          {/* Right Laurel Leaves */}
          <g className="imperial-wreath" fill="url(#imperialGoldGrad)" stroke="#ca8a04" strokeWidth="0.6">
            <path d="M 64 14 C 70 15 78 22 82 30 C 76 28 68 23 64 14 Z" />
            <path d="M 76 26 C 84 30 90 40 92 50 C 85 46 78 38 76 26 Z" />
            <path d="M 88 44 C 93 52 93 64 88 72 C 84 64 81 54 88 44 Z" />
            <path d="M 84 68 C 86 76 78 84 68 90 C 70 82 75 74 84 68 Z" />
          </g>

          {/* Bottom Imperial Ribbon Knot */}
          <path d="M 40 92 C 45 90 55 90 60 92 C 57 97 53 99 50 99 C 47 99 43 97 40 92 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />

          {/* Inner Golden Halo Ring */}
          <circle cx="50" cy="50" r="41" fill="none" stroke="url(#imperialGoldGrad)" strokeWidth="2" strokeDasharray="12 6 4 6" filter="url(#royalGlow)" className="imperial-spin-halo" />
        </svg>
      );

    case 'mythic_dragon': // Level 20 • Mythic (Omni Dragon)
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="cosmetic-svg-frame frame-svg-mythic_dragon"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dragonRainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="33%" stopColor="#8b5cf6" />
              <stop offset="66%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="dragonFireGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dragon Horns Framing Top Apex */}
          <g className="dragon-horns-wrap" filter="url(#dragonFireGlow)">
            {/* Left Curving Horn */}
            <path d="M 38 12 C 30 6 18 2 10 8 C 14 16 26 20 34 20 C 36 17 37 14 38 12 Z" fill="url(#dragonRainbowGrad)" stroke="#f472b6" strokeWidth="1" />
            {/* Right Curving Horn */}
            <path d="M 62 12 C 70 6 82 2 90 8 C 86 16 74 20 66 20 C 64 17 63 14 62 12 Z" fill="url(#dragonRainbowGrad)" stroke="#f472b6" strokeWidth="1" />
            {/* Center Mystic Flame Jewel */}
            <polygon points="50,4 56,14 50,20 44,14" fill="#fbbf24" stroke="#ec4899" strokeWidth="1" />
          </g>

          {/* Bottom Dragon Claws / Tail Spikes */}
          <g fill="url(#dragonRainbowGrad)" stroke="#8b5cf6" strokeWidth="0.8">
            <polygon points="18,80 10,92 24,88" />
            <polygon points="82,80 90,92 76,88" />
            <polygon points="50,98 44,88 56,88" />
          </g>

          {/* Rotating Chromatic Dragon Flame Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            fill="none" 
            stroke="url(#dragonRainbowGrad)" 
            strokeWidth="3.2" 
            filter="url(#dragonFireGlow)"
            className="dragon-spin-ring"
          />

          {/* Inner Plasma Reticle */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f472b6" strokeWidth="1" strokeDasharray="14 6 4 6" opacity="0.85" className="dragon-plasma-reticle" />
        </svg>
      );

    case 'default': // Level 1 • Common (Titanium Operative)
    default:
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="cosmetic-svg-frame frame-svg-default"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="titaniumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <filter id="titaniumGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Chamfered Octagonal Titanium Combat Armor Bezel with Subtle Breathing Aura */}
          <polygon 
            points="24,6 76,6 94,24 94,76 76,94 24,94 6,76 6,24" 
            fill="none" 
            stroke="url(#titaniumGrad)" 
            strokeWidth="2.8" 
            filter="url(#titaniumGlow)"
            className="titanium-armor-bezel"
          />

          {/* Animated 4 Corner Hex LED Bolts */}
          <g className="titanium-hex-bolts">
            <circle cx="24" cy="14" r="2.2" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.8" className="titanium-bolt bolt-1" />
            <circle cx="76" cy="14" r="2.2" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.8" className="titanium-bolt bolt-2" />
            <circle cx="76" cy="86" r="2.2" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.8" className="titanium-bolt bolt-3" />
            <circle cx="24" cy="86" r="2.2" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.8" className="titanium-bolt bolt-4" />
          </g>

          {/* Smoothly Rotating Tactical Reticle Ring */}
          <g className="titanium-reticle-ring">
            <circle cx="50" cy="50" r="41" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="10 6 3 6" opacity="0.85" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="4 12" opacity="0.65" />
          </g>

          {/* 4 Cardinal HUD Crosshairs */}
          <g className="titanium-crosshairs">
            <line x1="50" y1="4" x2="50" y2="8" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="50" y1="92" x2="50" y2="96" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="4" y1="50" x2="8" y2="50" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="92" y1="50" x2="96" y2="50" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </svg>
      );
  }
}
