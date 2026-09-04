import React from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './AspirantIcons';
import { AnimatedWarningIcon, AnimatedTearIcon, AnimatedFlameIcon } from './AnimatedUiIcons';

/**
 * SadCatGuiltTripModal - Emotional Focus Sanctuary Exit Warning
 * Features:
 * - Handcrafted vector SVG of Scholar Cat with teary puppy/kitten eyes & droopy ears
 * - Playful, dramatic guilt-trip messages to keep the aspirant disciplined
 * - High-contrast action choices: "Stay & Lock In" vs "Leave anyway"
 */
export default function SadCatGuiltTripModal({
  isOpen,
  onStay,
  onLeave,
  activeStreak = 0,
  subject = 'Quant',
  secondsLeft = 1500,
  isRunning = false,
  isQuotaCompleted = false,
  isPast15Hours = false,
  hoursLeftInDay = 8
}) {
  if (!isOpen) return null;

  const minsRemaining = Math.ceil(secondsLeft / 60);

  return createPortal(
    <div 
      className={`sad-cat-modal-backdrop ${isQuotaCompleted ? 'happy-mode' : ''}`}
      onClick={onStay}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`sad-cat-modal-card ${isQuotaCompleted ? 'happy-card' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Halo: Emerald/Gold if Quota Done, Red Warning if Incomplete */}
        <div className={`sad-cat-glow-halo ${isQuotaCompleted ? 'happy-halo' : ''}`} />

        {/* Handcrafted Scholar Cat SVG Artwork */}
        <div className="sad-cat-art-container">
          <svg 
            width="170" 
            height="170" 
            viewBox="0 0 170 170" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="sad-cat-svg-art"
          >
            <defs>
              <linearGradient id="catExitBodyGrad" x1="40" y1="20" x2="130" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={isQuotaCompleted ? "var(--accent-color, #10b981)" : "var(--accent-color, #38bdf8)"} />
                <stop offset="60%" stopColor={isQuotaCompleted ? "var(--accent-secondary, #38bdf8)" : "var(--accent-secondary, #818cf8)"} />
                <stop offset="100%" stopColor={isQuotaCompleted ? "var(--accent-color, #10b981)" : "var(--accent-color, #38bdf8)"} stopOpacity="0.85" />
              </linearGradient>

              <linearGradient id="sadTearGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-color, #67e8f9)" />
                <stop offset="100%" stopColor="var(--accent-secondary, #0284c7)" />
              </linearGradient>

              <filter id="sadTearGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Torso */}
            <path 
              d="M58 120 C56 100, 114 100, 112 120 L122 170 H48 L58 120 Z" 
              fill="url(#catExitBodyGrad)" 
              opacity="0.9"
            />

            {/* Head Group */}
            <g className="cat-head-group">
              {isQuotaCompleted ? (
                /* Happy Upright Seamless Cat Head */
                <>
                  <path 
                    d="M 85,114 C 49,114 49,78 54,56 L 58,30 L 74,44 Q 85,41 96,44 L 112,30 L 116,56 C 121,78 121,114 85,114 Z" 
                    fill="url(#catExitBodyGrad)" 
                  />
                  <polygon points="60,48 60,36 70,44" fill="#fbcfe8" opacity="0.85" />
                  <polygon points="110,48 110,36 100,44" fill="#fbcfe8" opacity="0.85" />
                </>
              ) : (
                /* Sad Gentle Folded Ears Seamless Cat Head */
                <>
                  <path 
                    d="M 85,114 C 49,114 49,78 52,58 L 48,42 L 68,48 Q 85,45 102,48 L 122,42 L 118,58 C 121,78 121,114 85,114 Z" 
                    fill="url(#catExitBodyGrad)" 
                  />
                  <polygon points="54,52 50,44 64,48" fill="#f472b6" opacity="0.85" />
                  <polygon points="116,52 120,44 106,48" fill="#f472b6" opacity="0.85" />
                </>
              )}


              {/* Scholar Glasses */}
              <g transform="rotate(0 85 78)">
                <circle cx="72" cy="78" r="11" fill="rgba(15, 23, 42, 0.75)" stroke="#f8fafc" strokeWidth="1.6" />
                <circle cx="98" cy="78" r="11" fill="rgba(15, 23, 42, 0.75)" stroke="#f8fafc" strokeWidth="1.6" />
                <line x1="83" y1="78" x2="87" y2="78" stroke="#f8fafc" strokeWidth="1.6" />

                {isQuotaCompleted ? (
                  /* Cheerful Happy Arched Eyes (^ ^) */
                  <g className="happy-eyes">
                    <path d="M66 79 Q72 73 78 79" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                    <path d="M92 79 Q98 73 104 79" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  </g>
                ) : (
                  /* Big Teary Kitten Eyes */
                  <g className="teary-eyes">
                    <circle cx="72" cy="79" r="6.5" fill="#09090b" />
                    <circle cx="98" cy="79" r="6.5" fill="#09090b" />
                    <circle cx="70" cy="76.5" r="2.8" fill="#ffffff" />
                    <circle cx="74" cy="80.5" r="1.2" fill="#ffffff" />
                    <circle cx="96" cy="76.5" r="2.8" fill="#ffffff" />
                    <circle cx="100" cy="80.5" r="1.2" fill="#ffffff" />
                  </g>
                )}
              </g>

              {/* Rosy Cheeks */}
              <ellipse cx="64" cy="88" rx="4" ry="2" fill="#f472b6" opacity="0.75" />
              <ellipse cx="106" cy="88" rx="4" ry="2" fill="#f472b6" opacity="0.75" />

              {/* Cute Pink Nose */}
              <polygon points="83,86 87,86 85,89" fill="#f472b6" />

              {isQuotaCompleted ? (
                /* Purring Content Smile (w) */
                <path d="M85 89V91M85 91C83 93 80 92 78 90M85 91C87 93 90 92 92 90" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                /* Trembling Sad Feline Mouth */
                <path d="M80 94 Q85 91 90 94" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              )}

              {!isQuotaCompleted && (
                /* Flowing Glistening Teardrops */
                <g className="falling-tears" filter="url(#sadTearGlow)">
                  <path d="M68 86 C66 90, 64 96, 64 99 C64 102, 67 104, 69 102 C71 100, 70 94, 68 86 Z" fill="url(#sadTearGrad)" />
                  <path d="M102 86 C104 90, 106 96, 106 99 C106 102, 103 104, 101 102 C99 100, 100 94, 102 86 Z" fill="url(#sadTearGrad)" />
                </g>
              )}

              {/* Paws */}
              {isQuotaCompleted ? (
                /* Cheerful Waving Paws */
                <>
                  <ellipse cx="68" cy="120" rx="8" ry="7" fill="#f8fafc" />
                  <ellipse cx="102" cy="116" rx="8" ry="7" fill="#f8fafc" />
                </>
              ) : (
                /* Paws Holding Up Tiny Broken Pencil */
                <>
                  <ellipse cx="72" cy="122" rx="7" ry="5" fill="#f8fafc" />
                  <ellipse cx="98" cy="122" rx="7" ry="5" fill="#f8fafc" />
                  <line x1="68" y1="120" x2="82" y2="124" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="88" y1="124" x2="102" y2="120" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}
            </g>
          </svg>
        </div>

        {/* Text Block */}
        <div className="sad-cat-text-block">
          {isQuotaCompleted ? (
            <>
              <div className="sad-cat-badge happy font-mono">
                <Icons.Check size={14} />
                <span>DAILY QUOTA CONQUERED</span>
              </div>
              <h2 className="sad-cat-title">
                <span>Magnificent Work Today, Scholar!</span>
              </h2>
              <p className="sad-cat-message">
                All 3 daily drill quotas are cleared and cemented onto your study heatmap! True discipline knows when to grind and when to rest. You've earned tonight's recovery. Rest up, and I'll see you tomorrow!
              </p>
              {activeStreak > 0 && (
                <div className="sad-cat-streak-warning happy">
                  <AnimatedFlameIcon size={16} />
                  <span>Your <strong>{activeStreak}-day momentum streak</strong> is securely locked in for today!</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="sad-cat-badge font-mono">
                <AnimatedWarningIcon size={14} />
                <span>FOCUS BREACH WARNING</span>
              </div>
              <h2 className="sad-cat-title">
                <span>Wait... You're really leaving?!</span>
                <AnimatedTearIcon size={22} color="#38bdf8" />
              </h2>
              <p className="sad-cat-message">
                {isPast15Hours && (
                  <span style={{ display: 'block', marginBottom: '8px', color: '#f59e0b', fontWeight: 600, fontSize: '11.5px' }}>
                    Clock's ticking! It's already past 15:00 hrs ({hoursLeftInDay}h left before midnight rollover) and today's quota is still incomplete.
                  </span>
                )}
                {isRunning 
                  ? `We still have ${minsRemaining} minutes left on this ${subject} drill! I had the notebook open and everything... Are you really gonna abandon our session for distractions?`
                  : `I was just warming up the notes for our ${subject} sprint! Top 1% percentiles aren't built when you walk away from the desk.`}
              </p>
              {activeStreak > 0 && (
                <div className="sad-cat-streak-warning">
                  <AnimatedFlameIcon size={16} />
                  <span>Your <strong>{activeStreak}-day momentum streak</strong> is counting on this focus session. Don't break the chain!</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sad-cat-btn-row">
          {isQuotaCompleted ? (
            <>
              <button 
                type="button" 
                className="sad-cat-stay-btn happy-confirm"
                onClick={onLeave}
                autoFocus
              >
                <Icons.Check size={16} />
                <span>See You Tomorrow! (Rest Earned)</span>
              </button>

              <button 
                type="button" 
                className="sad-cat-leave-btn"
                onClick={onStay}
              >
                <span>Stay a bit longer & review notes</span>
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                className="sad-cat-stay-btn"
                onClick={onStay}
                autoFocus
              >
                <Icons.Sparkles size={16} />
                <span>Stay & Lock In! (I won't give up)</span>
              </button>

              <button 
                type="button" 
                className="sad-cat-leave-btn"
                onClick={onLeave}
              >
                <span>Leave anyway (I'll regret this)</span>
              </button>
            </>
          )}
        </div>

        <button 
          type="button" 
          className="sad-cat-close-btn"
          onClick={onStay}
          title="Close modal"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}
