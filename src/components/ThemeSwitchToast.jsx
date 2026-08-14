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

  return (
    <div className="theme-switch-toast-overlay" onClick={onClose} title="Click to dismiss">
      <div className={`theme-toast-card theme-badge-${activeTheme}`}>
        
        {/* Animated SVG Cartoon Artwork based on theme */}
        <div className="theme-toast-art">
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
              <circle cx="50" cy="50" r="22" fill="#0f172a" />
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="15"
                  x2="50"
                  y2="5"
                  stroke="#0f172a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform={`rotate(${i * 45} 50 50)`}
                />
              ))}
            </svg>
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
