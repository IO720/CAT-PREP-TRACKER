import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { playGamingAchievementSound } from '../utils/audioUtils';

/**
 * DailyQuotaCelebrationModal
 * Gamified celebration modal when all 3 daily drill quotas are cleared (Quant, LRDI, VARC).
 * Features:
 * - Handcrafted Proud Scholar Cat Mascot vector SVG with happy eyes & graduation cap
 * - Interactive Heatmap Stamp animation showing today's square lighting up to Level 4
 * - Heartfelt message of pride, discipline, and getting closer to being a better person
 * - Zero Unicode emojis (100% vector SVG icons and animations)
 */
export default function DailyQuotaCelebrationModal({
  isOpen,
  onClose,
  dayName = 'Today',
  activeStreak = 1,
  totalSolvedToday = 26
}) {
  const [stampActive, setStampActive] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Play achievement audio
      try {
        playGamingAchievementSound(0.06);
      } catch (e) {
        // Audio fallback
      }

      // Trigger animated heatmap stamp
      const stampTimer = setTimeout(() => {
        setStampActive(true);
      }, 400);

      // Generate celebratory particles
      const newParticles = Array.from({ length: 18 }, (_, idx) => {
        const angle = (idx / 18) * Math.PI * 2;
        const distance = 80 + Math.random() * 80;
        return {
          id: idx,
          tx: `${Math.cos(angle) * distance}px`,
          ty: `${Math.sin(angle) * distance}px`,
          delay: `${(idx * 0.04).toFixed(2)}s`,
          size: 6 + Math.random() * 6
        };
      });
      setParticles(newParticles);

      return () => clearTimeout(stampTimer);
    } else {
      setStampActive(false);
      setParticles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return createPortal(
    <div 
      className="quota-celebrate-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebrate-title"
    >
      <div 
        className="quota-celebrate-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Radiant Ambient Victory Halo */}
        <div className="celebrate-glow-halo" />

        {/* Floating Celebration Particles */}
        <div className="celebrate-particles-wrap" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="celebrate-particle"
              style={{
                '--tx': p.tx,
                '--ty': p.ty,
                '--delay': p.delay,
                width: `${p.size}px`,
                height: `${p.size}px`
              }}
            />
          ))}
        </div>

        {/* Handcrafted Proud Scholar Cat Vector Artwork */}
        <div className="celebrate-cat-art-wrap">
          <svg 
            width="170" 
            height="170" 
            viewBox="0 0 170 170" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="celebrate-cat-svg"
          >
            <defs>
              <linearGradient id="catProudBodyGrad" x1="40" y1="20" x2="130" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--accent-color, #10b981)" />
                <stop offset="50%" stopColor="var(--accent-secondary, #38bdf8)" />
                <stop offset="100%" stopColor="var(--accent-color, #10b981)" />
              </linearGradient>

              <linearGradient id="laurelGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Glowing Aura Ring */}
            <circle cx="85" cy="92" r="64" fill="var(--accent-glow, rgba(16, 185, 129, 0.12))" filter="blur(16px)" />

            {/* Cat Ears */}
            <path d="M48 68L36 32C36 32 60 40 68 56L48 68Z" fill="url(#catProudBodyGrad)" />
            <path d="M49 63L41 39C41 39 58 45 64 54L49 63Z" fill="rgba(255, 255, 255, 0.25)" />

            <path d="M122 68L134 32C134 32 110 40 102 56L122 68Z" fill="url(#catProudBodyGrad)" />
            <path d="M121 63L129 39C129 39 112 45 106 54L121 63Z" fill="rgba(255, 255, 255, 0.25)" />

            {/* Cat Body */}
            <path d="M42 145C42 108 58 92 85 92C112 92 128 108 128 145H42Z" fill="url(#catProudBodyGrad)" />

            {/* Cat Head */}
            <circle cx="85" cy="80" r="42" fill="url(#catProudBodyGrad)" />

            {/* Golden Scholar Graduation Cap */}
            <g className="scholar-cap-float">
              <polygon points="85 24 125 36 85 48 45 36" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" />
              <rect x="73" y="44" width="24" height="12" rx="2" fill="#312e81" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="85" cy="36" r="3" fill="#fcd34d" />
              {/* Tassel */}
              <path d="M85 36C95 38 114 44 116 58" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <circle cx="116" cy="60" r="2.5" fill="#fcd34d" />
            </g>

            {/* Happy Curved Cheerful Eyes (^ ^) */}
            <path d="M62 76C66 70 72 70 76 76" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M94 76C98 70 104 70 108 76" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />

            {/* Rose Cheeks */}
            <ellipse cx="58" cy="84" rx="5" ry="3" fill="rgba(251, 113, 133, 0.6)" />
            <ellipse cx="112" cy="84" rx="5" ry="3" fill="rgba(251, 113, 133, 0.6)" />

            {/* Cat Cute Snout & Purring Smile */}
            <polygon points="85 82 82 86 88 86" fill="#ffffff" />
            <path d="M85 86V89M85 89C82 91 79 90 77 88M85 89C88 91 91 90 93 88" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />

            {/* Cute Whiskers */}
            <line x1="42" y1="82" x2="28" y2="80" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="42" y1="87" x2="30" y2="89" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="128" y1="82" x2="142" y2="80" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="128" y1="87" x2="140" y2="89" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" />

            {/* Raised Proud Paws */}
            <ellipse cx="64" cy="120" rx="10" ry="12" fill="#ffffff" />
            <ellipse cx="106" cy="120" rx="10" ry="12" fill="#ffffff" />
          </svg>
        </div>

        {/* Achievement Badge */}
        <div className="celebrate-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>3 / 3 DAILY QUOTAS CONQUERED</span>
        </div>

        {/* Inspiring Headline & Pride Message */}
        <h2 id="celebrate-title" className="celebrate-title">
          I Am Incredibly Proud of You!
        </h2>
        <p className="celebrate-message">
          You conquered every quota on today's syllabus ({dayName}). You didn't give in to distractions—you chose focus, discipline, and growth. Each day you show up like this transforms you into a sharper mind and a more resilient person.
        </p>

        {/* Interactive Study Contribution Heatmap Stamping Animation */}
        <div className="celebrate-heatmap-box">
          <div className="heatmap-box-header">
            <span className="heatmap-box-label">Study Contribution Heatmap</span>
            <span className="heatmap-box-streak">{activeStreak}-Day Streak Active</span>
          </div>

          <div className="heatmap-mini-week-row">
            {DAYS.map((day, idx) => {
              const isTodaySquare = idx === 0 || day === 'Mon'; // Represents active week day
              return (
                <div key={day} className="mini-day-cell-wrap">
                  <div 
                    className={`mini-heatmap-cell ${isTodaySquare ? (stampActive ? 'stamped-today' : 'pending-today') : 'prev-day'}`}
                  >
                    {isTodaySquare && stampActive && (
                      <span className="stamp-sparkle-dot" />
                    )}
                  </div>
                  <span className="mini-day-name">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="heatmap-stamp-caption">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Today Stamped at <strong>Level 4 Max Contribution</strong> • Discipline Secured!</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="celebrate-btn-row">
          <button 
            type="button" 
            className="celebrate-claim-btn"
            onClick={onClose}
            autoFocus
          >
            <span>Claim Victory & Continue</span>
          </button>
        </div>

        {/* Close Corner Cross */}
        <button 
          type="button" 
          className="celebrate-close-cross"
          onClick={onClose}
          title="Close celebration"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

      </div>
    </div>,
    document.body
  );
}
