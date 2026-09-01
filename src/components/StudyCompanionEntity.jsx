import React from 'react';

/**
 * Animated Study Companion Entity ("Zen Focus Sprite / Scholar Cat").
 * Studies alongside the aspirant in real-time with rhythmic head-bobs,
 * active note-taking, floating focus particles, and cozy desk steam.
 */
function StudyCompanionEntity({
  isRunning = false,
  isPaused = false,
  isCompleted = false,
  subject = 'VARC',
  size = 200
}) {
  const statusLabel = isCompleted 
    ? "Session Mastered!" 
    : isRunning 
      ? `Studying ${subject} alongside you...` 
      : isPaused 
        ? "Taking a quick breather..." 
        : "Ready to focus when you are!";

  return (
    <div className={`study-companion-entity-wrap ${isRunning ? 'is-studying' : ''} ${isPaused ? 'is-paused' : ''} ${isCompleted ? 'is-completed' : ''}`}>
      
      {/* Ambient Focus Halo */}
      <div className="companion-focus-halo" />

      {/* Handcrafted Animated Vector SVG Artwork */}
      <svg 
        width={size} 
        height={size * 0.9} 
        viewBox="0 0 240 210" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="companion-svg-art"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="60" y1="40" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
            <stop offset="50%" stopColor="var(--accent-secondary, #818cf8)" />
            <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="earInnerGrad" x1="88" y1="38" x2="108" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent-secondary, #ec4899)" />
            <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
          </linearGradient>

          <linearGradient id="deskGrad" x1="20" y1="170" x2="220" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>

          <linearGradient id="bookGrad" x1="80" y1="140" x2="160" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* Ambient Floating Sparkles / Focus Particles */}
        {isRunning && (
          <g className="floating-sparks">
            <circle cx="45" cy="55" r="2" fill="var(--accent-color, #38bdf8)" className="spark spark-1" />
            <circle cx="195" cy="65" r="2.5" fill="var(--accent-secondary, #ec4899)" className="spark spark-2" />
            <circle cx="65" cy="115" r="1.5" fill="var(--accent-color, #eab308)" className="spark spark-3" />
            <circle cx="180" cy="125" r="2" fill="var(--accent-secondary, #38bdf8)" className="spark spark-4" />
          </g>
        )}

        {/* Study Desk Base */}
        <path 
          d="M20 180C20 174.477 24.477 170 30 170H210C215.523 170 220 174.477 220 180V184H20V180Z" 
          fill="url(#deskGrad)" 
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />

        {/* Cozy Steaming Mug */}
        <g className="desk-mug" transform="translate(38, 142)">
          <rect x="0" y="8" width="18" height="20" rx="4" fill="#1e293b" stroke="var(--accent-color, #38bdf8)" strokeWidth="1.2" />
          <path d="M18 13C21 13 23 15 23 18C23 21 21 23 18 23" stroke="var(--accent-color, #38bdf8)" strokeWidth="1.2" fill="none" />
          {/* Animated Rising Steam */}
          <path d="M5 4Q9 0 6 -4" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" className="steam-line steam-1" />
          <path d="M12 5Q15 1 13 -3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" className="steam-line steam-2" />
        </g>

        {/* Scholar Body & Head */}
        <g className="scholar-character">
          
          {/* Torso / Cape */}
          <path 
            d="M85 135 C85 105, 155 105, 155 135 L165 170 H75 L85 135 Z" 
            fill="url(#bodyGrad)" 
            opacity="0.9"
          />

          {/* Bobbing Head Group */}
          <g className="scholar-head-group">
            {/* Seamless Organic Cat Head & Ears Silhouette */}
            <path 
              d="M 120,116 C 82,116 82,78 88,56 L 92,28 L 108,44 Q 120,40 132,44 L 148,28 L 152,56 C 158,78 158,116 120,116 Z" 
              fill="url(#bodyGrad)" 
            />

            {/* Inner Ear Gradient Flaps */}
            <polygon points="94,48 93,34 104,44" fill="url(#earInnerGrad)" opacity="0.85" />
            <polygon points="146,48 147,34 136,44" fill="url(#earInnerGrad)" opacity="0.85" />


            {/* Cute Scholar Glasses */}
            <g className="scholar-glasses">
              {/* Left Lens */}
              <circle cx="106" cy="78" r="10" fill="rgba(15, 23, 42, 0.7)" stroke="#f8fafc" strokeWidth="1.8" />
              {/* Right Lens */}
              <circle cx="134" cy="78" r="10" fill="rgba(15, 23, 42, 0.7)" stroke="#f8fafc" strokeWidth="1.8" />
              {/* Bridge */}
              <line x1="116" y1="78" x2="124" y2="78" stroke="#f8fafc" strokeWidth="1.8" />

              {/* Eyes Inside Glasses */}
              {isCompleted ? (
                // Happy ^ ^ Eyes
                <g stroke="var(--accent-color, #38bdf8)" strokeWidth="2" strokeLinecap="round">
                  <path d="M102 79 L106 75 L110 79" />
                  <path d="M130 79 L134 75 L138 79" />
                </g>
              ) : isPaused ? (
                // Inquisitive Open Eyes
                <g fill="#f8fafc">
                  <circle cx="106" cy="78" r="3" />
                  <circle cx="134" cy="78" r="3" />
                </g>
              ) : (
                // Focused Studying Eyes (Gently Blinking)
                <g className="scholar-eyes" fill="var(--accent-color, #38bdf8)">
                  <circle cx="106" cy="78" r="3.2" />
                  <circle cx="134" cy="78" r="3.2" />
                  <circle cx="107.5" cy="76.5" r="1" fill="#ffffff" />
                  <circle cx="135.5" cy="76.5" r="1" fill="#ffffff" />
                </g>
              )}
            </g>

            {/* Nose & Whiskers */}
            <circle cx="120" cy="88" r="2" fill="#f8fafc" />
            <line x1="90" y1="87" x2="100" y2="89" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="90" y1="92" x2="100" y2="92" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="150" y1="87" x2="140" y2="89" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="150" y1="92" x2="140" y2="92" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* Open Study Notebook on Desk */}
          <g className="study-notebook" transform="translate(86, 148)">
            {/* Left Page */}
            <path d="M0 4 C15 0, 30 2, 34 8 L34 24 C30 18, 15 16, 0 20 Z" fill="url(#bookGrad)" stroke="#64748b" strokeWidth="0.8" />
            {/* Right Page */}
            <path d="M68 4 C53 0, 38 2, 34 8 L34 24 C38 18, 53 16, 68 20 Z" fill="url(#bookGrad)" stroke="#64748b" strokeWidth="0.8" />
            {/* Text lines on book */}
            <line x1="6" y1="8" x2="28" y2="9" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            <line x1="6" y1="12" x2="26" y2="13" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            <line x1="6" y1="16" x2="22" y2="17" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            <line x1="40" y1="9" x2="62" y2="8" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            <line x1="40" y1="13" x2="60" y2="12" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            <line x1="42" y1="17" x2="56" y2="16" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* Animated Hand / Quill Writing Notes */}
          <g className="writing-hand">
            {/* Left Resting Paw */}
            <ellipse cx="88" cy="158" rx="7" ry="5" fill="#f8fafc" opacity="0.9" />
            {/* Right Active Writing Paw & Pencil */}
            <g className="pencil-hand">
              <ellipse cx="144" cy="154" rx="7" ry="5" fill="#f8fafc" opacity="0.9" />
              {/* Glowing Pencil */}
              <line x1="140" y1="154" x2="128" y2="160" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              <polygon points="128,160 125,162 127,159" fill="#0f172a" />
              {/* Particle Spark at pen tip when writing */}
              {isRunning && <circle cx="125" cy="162" r="1.5" fill="var(--accent-color, #38bdf8)" style={{ filter: 'drop-shadow(0 0 2px var(--accent-color, #38bdf8))' }} />}
            </g>
          </g>

        </g>
      </svg>

      {/* Live Companion Status Caption */}
      <div className="companion-status-caption">
        <span className="companion-name-tag">ZEN STUDY SPRITE</span>
        <span className="companion-quote-text">{statusLabel}</span>
      </div>

    </div>
  );
}

export default React.memo(StudyCompanionEntity);
