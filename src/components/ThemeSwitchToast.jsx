import React, { useEffect, useRef } from 'react';
import { THEMES } from './ThemeSelectorDropdown';

export default function ThemeSwitchToast({ activeTheme, onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [activeTheme]);

  const themeObj = THEMES.find(t => t.id === activeTheme) || THEMES[0];
  const ActiveIcon = themeObj.IconComponent;

  return (
    <div className="theme-switch-toast-overlay" onClick={onClose} title="Click to dismiss">
      <div className={`theme-toast-card theme-badge-${activeTheme}`}>
        
        {/* Animated SVG Cartoon Artwork based on theme */}
        <div className="theme-toast-art">
          {activeTheme === 'dark-olive' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art olive-anim">
              <path d="M20 80 Q45 60 75 25" stroke="#6d8c52" strokeWidth="4" strokeLinecap="round" fill="none" />
              <ellipse cx="36" cy="58" rx="8" ry="15" transform="rotate(-40 36 58)" fill="#556b3b" />
              <ellipse cx="58" cy="42" rx="8" ry="15" transform="rotate(45 58 42)" fill="#829f63" />
              <ellipse cx="76" cy="24" rx="7" ry="12" transform="rotate(-15 76 24)" fill="#829f63" />
              <circle cx="46" cy="65" r="6" fill="#e6caa4" />
              <circle cx="66" cy="48" r="5" fill="#e6caa4" />
            </svg>
          )}

          {activeTheme === 'plum-velvet' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art plum-anim">
              <polygon points="50,15 80,38 70,82 30,82 20,38" fill="#6b1d52" opacity="0.9" />
              <polygon points="50,15 70,38 50,55 30,38" fill="#aa5482" />
              <polygon points="50,55 70,82 30,82" fill="#3d2639" />
              <circle cx="50" cy="50" r="4" fill="#faeef5" />
            </svg>
          )}

          {activeTheme === 'slate-terracotta' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art terracotta-anim">
              <circle cx="65" cy="35" r="18" fill="#e8b2a2" opacity="0.95" />
              <path d="M10 75 L40 38 L65 65 L80 48 L95 75 Z" fill="#354c5c" />
              <path d="M30 75 L55 46 L75 75 Z" fill="#9e6b6b" opacity="0.9" />
              <rect x="10" y="75" width="85" height="12" fill="#223342" rx="3" />
            </svg>
          )}

          {activeTheme === 'crimson-velvet' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art crimson-anim">
              <circle cx="50" cy="50" r="30" fill="#b81432" opacity="0.9" />
              <path d="M30 65 L50 30 L70 65 Z" fill="#f43f5e" />
              <circle cx="50" cy="30" r="5" fill="#fecdd3" />
              <circle cx="30" cy="65" r="4" fill="#fecdd3" />
              <circle cx="70" cy="65" r="4" fill="#fecdd3" />
            </svg>
          )}

          {activeTheme === 'sage-frost' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art sage-anim">
              <circle cx="50" cy="50" r="30" fill="#7daeb9" opacity="0.9" />
              <path d="M50 18 Q72 38 52 78 Q32 78 28 50 Q30 28 50 18 Z" fill="#9be2b0" />
              <path d="M50 18 L48 78" stroke="#edf6ee" strokeWidth="2" />
            </svg>
          )}

          {activeTheme === 'nordic-slate' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art slate-anim">
              <path d="M15 70 L45 30 L60 50 L75 35 L90 70 Z" fill="#3c617b" />
              <path d="M35 43 L45 30 L55 43 Z" fill="#c8b7a6" />
              <path d="M68 42 L75 35 L82 42 Z" fill="#c8b7a6" />
            </svg>
          )}

          {activeTheme === 'coffee' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art steam-anim">
              <path d="M30 45 L70 45 L65 75 Q50 82 35 75 Z" fill="#d9a774" stroke="#593f2d" strokeWidth="3" />
              <path d="M70 50 Q82 50 82 58 Q82 66 67 66" fill="none" stroke="#d9a774" strokeWidth="4" />
              <path d="M40 35 Q45 25 40 18" fill="none" stroke="#f5efe6" strokeWidth="3" strokeLinecap="round" className="steam-line s1" />
              <path d="M50 38 Q55 28 50 20" fill="none" stroke="#f5efe6" strokeWidth="3" strokeLinecap="round" className="steam-line s2" />
              <path d="M60 35 Q65 25 60 18" fill="none" stroke="#f5efe6" strokeWidth="3" strokeLinecap="round" className="steam-line s3" />
            </svg>
          )}

          {activeTheme === 'fall' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art leaf-anim">
              <path d="M50 15 Q75 35 55 75 Q35 75 25 50 Q30 25 50 15 Z" fill="#e59b24" stroke="#6b8226" strokeWidth="2" />
              <path d="M50 15 L45 80" stroke="#7e942b" strokeWidth="2" />
              <path d="M48 35 L62 45 M47 50 L60 60 M46 42 L32 50" stroke="#7e942b" strokeWidth="1.5" />
            </svg>
          )}

          {activeTheme === 'warm' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art sunset-anim">
              <circle cx="50" cy="50" r="30" fill="#d97a66" opacity="0.9" />
              <path d="M10 65 Q50 55 90 65 L90 85 L10 85 Z" fill="#152733" />
              <path d="M10 75 Q50 68 90 75 L90 85 L10 85 Z" fill="#0b1a23" opacity="0.6" />
            </svg>
          )}

          {activeTheme === 'sunset' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art sunset-anim">
              <circle cx="50" cy="50" r="28" fill="#f46b78" opacity="0.95" />
              <path d="M10 60 Q50 50 90 60 L90 85 L10 85 Z" fill="#b8657d" opacity="0.8" />
              <path d="M10 72 Q50 65 90 72 L90 85 L10 85 Z" fill="#335c7d" />
            </svg>
          )}

          {activeTheme === 'sunset-magenta' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art sunset-anim">
              <defs>
                <linearGradient id="smGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fcc8f0" />
                  <stop offset="35%" stopColor="#ff5a57" />
                  <stop offset="70%" stopColor="#e02f75" />
                  <stop offset="100%" stopColor="#6700a3" />
                </linearGradient>
                <filter id="smGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="50" cy="50" r="34" fill="url(#smGrad)" filter="url(#smGlow)" opacity="0.6" />
              <circle cx="50" cy="50" r="28" fill="url(#smGrad)" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#ff5a57" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
              <path d="M20 68 Q50 48 80 68 L80 86 L20 86 Z" fill="#12071a" opacity="0.88" />
              <circle cx="50" cy="38" r="9" fill="#fcc8f0" />
              <circle cx="28" cy="30" r="2.5" fill="#fcc8f0" opacity="0.8" />
              <circle cx="72" cy="34" r="3" fill="#ff5a57" opacity="0.9" />
            </svg>
          )}

          {activeTheme === 'crimson-twilight' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art crimson-anim">
              <defs>
                <linearGradient id="ctGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff5a57" />
                  <stop offset="40%" stopColor="#e02f75" />
                  <stop offset="75%" stopColor="#6700a3" />
                  <stop offset="100%" stopColor="#050c38" />
                </linearGradient>
                <filter id="ctGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect x="12" y="12" width="76" height="76" rx="38" fill="url(#ctGrad)" filter="url(#ctGlow)" opacity="0.5" />
              <rect x="16" y="16" width="68" height="68" rx="34" fill="url(#ctGrad)" />
              <path d="M14 62 Q50 42 86 62 L86 86 L14 86 Z" fill="#040822" />
              <circle cx="50" cy="38" r="8" fill="#ff5a57" />
              <line x1="25" y1="38" x2="75" y2="38" stroke="#ff5a57" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="34" cy="24" r="2" fill="#fdf4f6" />
              <circle cx="68" cy="28" r="2.5" fill="#fecdd3" />
            </svg>
          )}

          {activeTheme === 'cosmic-nebula' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art plum-anim">
              <defs>
                <radialGradient id="cnGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#b347ff" />
                  <stop offset="45%" stopColor="#6700a3" />
                  <stop offset="75%" stopColor="#1b2062" />
                  <stop offset="100%" stopColor="#050c38" />
                </radialGradient>
                <filter id="cnGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="50" cy="50" r="30" fill="url(#cnGrad)" filter="url(#cnGlow)" />
              <ellipse cx="50" cy="50" rx="44" ry="16" fill="none" stroke="#b347ff" strokeWidth="2.5" strokeDasharray="12 4" transform="rotate(-28 50 50)" />
              <ellipse cx="50" cy="50" rx="36" ry="12" fill="none" stroke="#6700a3" strokeWidth="1.5" transform="rotate(35 50 50)" opacity="0.7" />
              <circle cx="50" cy="50" r="6" fill="#ffffff" />
              <circle cx="22" cy="30" r="2" fill="#b347ff" />
              <circle cx="78" cy="70" r="2.5" fill="#c2abeb" />
            </svg>
          )}

          {activeTheme === 'electric-lilac' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art sparkle-anim">
              <defs>
                <linearGradient id="elGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#efccf2" />
                  <stop offset="50%" stopColor="#977dff" />
                  <stop offset="100%" stopColor="#0033ff" />
                </linearGradient>
                <filter id="elGlow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <polygon points="50,8 65,36 94,50 65,64 50,92 35,64 6,50 35,36" fill="url(#elGrad)" filter="url(#elGlow)" opacity="0.5" />
              <polygon points="50,12 62,38 90,50 62,62 50,88 38,62 10,50 38,38" fill="url(#elGrad)" />
              <polygon points="50,25 58,42 75,50 58,58 50,75 42,58 25,50 42,42" fill="#ffffff" opacity="0.8" />
              <circle cx="50" cy="50" r="4" fill="#0033ff" />
            </svg>
          )}

          {activeTheme === 'royal-cobalt' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art aurora-anim">
              <defs>
                <linearGradient id="rcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#977dff" />
                  <stop offset="50%" stopColor="#0033ff" />
                  <stop offset="100%" stopColor="#0600ab" />
                </linearGradient>
                <filter id="rcGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <polygon points="50,12 88,36 74,84 26,84 12,36" fill="url(#rcGrad)" filter="url(#rcGlow)" opacity="0.6" />
              <polygon points="50,15 85,38 72,82 28,82 15,38" fill="url(#rcGrad)" />
              <polygon points="50,28 73,44 63,73 37,73 27,44" fill="#0600ab" opacity="0.8" />
              <circle cx="50" cy="50" r="7" fill="#977dff" />
              <circle cx="50" cy="50" r="3" fill="#ffffff" />
            </svg>
          )}

          {activeTheme === 'deep-abyss' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art slate-anim">
              <defs>
                <linearGradient id="daGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="35%" stopColor="#0033ff" />
                  <stop offset="70%" stopColor="#0600ab" />
                  <stop offset="100%" stopColor="#00033d" />
                </linearGradient>
                <filter id="daGlow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="50" cy="50" r="34" fill="url(#daGrad)" filter="url(#daGlow)" opacity="0.7" />
              <circle cx="50" cy="50" r="28" fill="url(#daGrad)" />
              <path d="M16 54 Q33 42 50 54 T84 54" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <path d="M20 66 Q35 56 50 66 T80 66" fill="none" stroke="#0033ff" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M26 76 Q38 68 50 76 T74 76" fill="none" stroke="#0600ab" strokeWidth="2" strokeLinecap="round" />
              <circle cx="50" cy="34" r="5" fill="#38bdf8" opacity="0.9" />
            </svg>
          )}

          {activeTheme === 'ephemeral' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art sparkle-anim">
              <polygon points="50,15 58,40 85,50 58,60 50,85 42,60 15,50 42,40" fill="#e3d6c3" />
              <circle cx="20" cy="20" r="3" fill="#948b81" />
              <circle cx="80" cy="25" r="4" fill="#e3d6c3" />
              <circle cx="75" cy="75" r="3" fill="#948b81" />
            </svg>
          )}

          {activeTheme === 'emerald' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art tree-anim">
              <path d="M50 15 L75 50 L62 50 L82 78 L18 78 L38 50 L25 50 Z" fill="#34d399" />
              <rect x="44" y="78" width="12" height="15" fill="#22492c" />
            </svg>
          )}

          {activeTheme === 'nordic' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art aurora-anim">
              <path d="M10 40 Q40 10 90 35 Q60 60 10 40 Z" fill="#38bdf8" opacity="0.8" />
              <path d="M10 55 Q50 30 90 60 Q50 75 10 55 Z" fill="#818cf8" opacity="0.7" />
            </svg>
          )}

          {activeTheme === 'dark' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art moon-anim">
              <path d="M60 20 A30 30 0 1 0 80 70 A35 35 0 1 1 60 20 Z" fill="#ffffff" />
            </svg>
          )}

          {activeTheme === 'light' && (
            <svg viewBox="0 0 100 100" className="theme-svg-art sun-anim">
              <circle cx="50" cy="22" r="16" fill="#f59e0b" />
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="15"
                  x2="50"
                  y2="5"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform={`rotate(${i * 45} 50 22)`}
                />
              ))}
            </svg>
          )}

          {/* Universal Fallback icon if no artwork matched */}
          {!['dark-olive', 'plum-velvet', 'slate-terracotta', 'crimson-velvet', 'sage-frost', 'nordic-slate', 'coffee', 'fall', 'warm', 'sunset', 'sunset-magenta', 'crimson-twilight', 'cosmic-nebula', 'electric-lilac', 'royal-cobalt', 'deep-abyss', 'ephemeral', 'emerald', 'nordic', 'dark', 'light'].includes(activeTheme) && (
            <div className="theme-fallback-icon-wrap" style={{ color: themeObj.colors[3] || 'var(--accent-color, #38bdf8)' }}>
              {ActiveIcon && <ActiveIcon />}
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="theme-toast-info">
          <span className="toast-tag">THEME ACTIVATED</span>
          <h4 className="toast-title">{themeObj.name}</h4>
        </div>
      </div>
    </div>
  );
}
