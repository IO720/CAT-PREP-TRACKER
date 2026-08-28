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
  isRunning = false
}) {
  if (!isOpen) return null;

  const minsRemaining = Math.ceil(secondsLeft / 60);

  return createPortal(
    <div 
      className="sad-cat-modal-backdrop" 
      onClick={onStay}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="sad-cat-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Red/Orange Warning Glow */}
        <div className="sad-cat-glow-halo" />

        {/* Handcrafted Sad Tearful Scholar Cat SVG Artwork */}
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
              <linearGradient id="sadCatBodyGrad" x1="40" y1="20" x2="130" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>

              <linearGradient id="sadTearGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              <filter id="sadTearGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Slender Torso with Drooping Shoulders */}
            <path 
              d="M58 120 C56 100, 114 100, 112 120 L122 170 H48 L58 120 Z" 
              fill="url(#sadCatBodyGrad)" 
              opacity="0.9"
            />

            {/* Drooping Head */}
            <g className="sad-cat-head-group">
              {/* Droopy / Flattened Cat Ears (Sign of sadness) */}
              <polygon points="46,74 32,54 62,56" fill="#38bdf8" />
              <polygon points="50,70 38,56 60,58" fill="#f472b6" opacity="0.8" />
              <polygon points="124,74 138,54 108,56" fill="#2563eb" />
              <polygon points="120,70 132,56 110,58" fill="#f472b6" opacity="0.8" />

              {/* Head Silhouette */}
              <circle cx="85" cy="78" r="36" fill="url(#sadCatBodyGrad)" />

              {/* Focus Headphones slipping down slightly */}
              <path d="M52 82 C52 50, 118 50, 118 82" stroke="#f1f5f9" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <rect x="46" y="74" width="11" height="20" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
              <rect x="113" y="74" width="11" height="20" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />

              {/* Scholar Glasses with Drooping Angle */}
              <g transform="rotate(3 85 78)">
                <circle cx="72" cy="78" r="11" fill="rgba(15, 23, 42, 0.75)" stroke="#f8fafc" strokeWidth="1.6" />
                <circle cx="98" cy="78" r="11" fill="rgba(15, 23, 42, 0.75)" stroke="#f8fafc" strokeWidth="1.6" />
                <line x1="83" y1="78" x2="87" y2="78" stroke="#f8fafc" strokeWidth="1.6" />

                {/* Big Teary Kitten Eyes (Heartbroken, wide and shiny) */}
                <g className="teary-eyes">
                  <circle cx="72" cy="79" r="6.5" fill="#09090b" />
                  <circle cx="98" cy="79" r="6.5" fill="#09090b" />
                  {/* Big Glistening Highlights */}
                  <circle cx="70" cy="76.5" r="2.8" fill="#ffffff" />
                  <circle cx="74" cy="80.5" r="1.2" fill="#ffffff" />
                  <circle cx="96" cy="76.5" r="2.8" fill="#ffffff" />
                  <circle cx="100" cy="80.5" r="1.2" fill="#ffffff" />
                </g>
              </g>

              {/* Rosy Sad Blushing Cheeks */}
              <ellipse cx="64" cy="88" rx="4" ry="2" fill="#f472b6" opacity="0.6" />
              <ellipse cx="106" cy="88" rx="4" ry="2" fill="#f472b6" opacity="0.6" />

              {/* Cute Pink Nose */}
              <polygon points="83,86 87,86 85,89" fill="#f472b6" />

              {/* Trembling Sad Feline Mouth (:c) */}
              <path d="M80 94 Q85 91 90 94" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" fill="none" />

              {/* Flowing Glistening Teardrops */}
              <g className="falling-tears" filter="url(#sadTearGlow)">
                {/* Left Tear */}
                <path d="M68 86 C66 90, 64 96, 64 99 C64 102, 67 104, 69 102 C71 100, 70 94, 68 86 Z" fill="url(#sadTearGrad)" />
                {/* Right Tear */}
                <path d="M102 86 C104 90, 106 96, 106 99 C106 102, 103 104, 101 102 C99 100, 100 94, 102 86 Z" fill="url(#sadTearGrad)" />
              </g>

              {/* Paws Holding Up Tiny Broken Pencil */}
              <ellipse cx="72" cy="122" rx="7" ry="5" fill="#f8fafc" />
              <ellipse cx="98" cy="122" rx="7" ry="5" fill="#f8fafc" />
              <line x1="68" y1="120" x2="82" y2="124" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="88" y1="124" x2="102" y2="120" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Guilt-Trip Dialogue & Notice */}
        <div className="sad-cat-text-block">
          <div className="sad-cat-badge font-mono">
            <AnimatedWarningIcon size={14} />
            <span>FOCUS BREACH WARNING</span>
          </div>
          <h2 className="sad-cat-title">
            <span>Wait... You're really leaving?!</span>
            <AnimatedTearIcon size={22} color="#38bdf8" />
          </h2>
          <p className="sad-cat-message">
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
        </div>

        {/* Action Buttons */}
        <div className="sad-cat-btn-row">
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
        </div>

        <button 
          type="button" 
          className="sad-cat-close-btn"
          onClick={onStay}
          title="Return to session"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}
