import React, { useState, useRef, useEffect } from 'react';
import { isThemeUnlocked, PREMIUM_THEME_IDS } from '../utils/themeRedemption';

// Professional SVG Icons for Themes
const ThemeIcons = {
  dark: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  light: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),
  coffee: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  ),
  fall: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
  ),
  warm: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10V2"></path>
      <path d="m4.93 10.93 1.41 1.41"></path>
      <path d="M2 18h20"></path>
      <path d="M20 22H4"></path>
      <path d="m19.07 10.93-1.41 1.41"></path>
      <path d="M22 10h-2"></path>
      <path d="M4 10H2"></path>
      <path d="M16 18a4 4 0 0 0-8 0"></path>
    </svg>
  ),
  sunset: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6"></path>
      <path d="M4.93 4.93l1.41 1.41"></path>
      <path d="M19.07 4.93l-1.41 1.41"></path>
      <path d="M2 18h20"></path>
      <path d="M20 22H4"></path>
      <path d="M16 18a4 4 0 0 0-8 0"></path>
    </svg>
  ),
  ephemeral: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    </svg>
  ),
  emerald: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 9 14h-5l4 6H4l4-6H3l9-14z"></path>
    </svg>
  ),
  nordic: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
    </svg>
  ),
  darkOlive: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z"></path>
      <path d="M12 2V22"></path>
      <path d="M12 7C14.5 7 17 8.5 17 11"></path>
      <path d="M12 15C9.5 15 7 13.5 7 11"></path>
    </svg>
  ),
  plumVelvet: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 12L2 9l4-6z"></path>
      <path d="M10 3v6l-4 3"></path>
      <path d="M14 3v6l4 3"></path>
      <path d="M2 9h20"></path>
    </svg>
  ),
  slateTerracotta: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
      <circle cx="17" cy="6" r="2"></circle>
    </svg>
  ),
  sunsetMagenta: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  ),
  crimsonTwilight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 0 0-10 0"></path>
      <line x1="12" y1="2" x2="12" y2="9"></line>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
      <line x1="1" y1="18" x2="23" y2="18"></line>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
      <line x1="23" y1="22" x2="1" y2="22"></line>
    </svg>
  ),
  cosmicNebula: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)"></ellipse>
    </svg>
  ),
  electricLilac: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  royalCobalt: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 7-10 11L2 10l4-7z"></path>
      <line x1="2" y1="10" x2="22" y2="10"></line>
      <line x1="12" y1="21" x2="8.5" y2="10"></line>
      <line x1="12" y1="21" x2="15.5" y2="10"></line>
      <line x1="6" y1="3" x2="8.5" y2="10"></line>
      <line x1="18" y1="3" x2="15.5" y2="10"></line>
    </svg>
  ),
  deepAbyss: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
    </svg>
  ),
  phosphorCrt: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  )
};

export const THEMES = [
  { 
    id: 'phosphor-crt', 
    name: 'Phosphor CRT Matrix', 
    IconComponent: ThemeIcons.phosphorCrt, 
    colors: ['#05080a', '#0a160f', '#10b981', '#39ff7a']
  },
  { 
    id: 'dark', 
    name: 'Dark Obsidian', 
    IconComponent: ThemeIcons.dark, 
    colors: ['#09090b', '#121215', '#1a1a20', '#ffffff']
  },
  { 
    id: 'dark-olive', 
    name: 'Dark Olive', 
    IconComponent: ThemeIcons.darkOlive, 
    colors: ['#151a14', '#243022', '#6d8c52', '#e6caa4']
  },
  { 
    id: 'plum-velvet', 
    name: 'Plum Velvet', 
    IconComponent: ThemeIcons.plumVelvet, 
    colors: ['#16131a', '#36243b', '#6b1d52', '#aa5482']
  },
  { 
    id: 'slate-terracotta', 
    name: 'Slate Terracotta', 
    IconComponent: ThemeIcons.slateTerracotta, 
    colors: ['#1c2834', '#2b3f4f', '#9e6b6b', '#e8b2a2']
  },
  { 
    id: 'coffee', 
    name: 'Coffee Mocha', 
    IconComponent: ThemeIcons.coffee, 
    colors: ['#0e0906', '#19120c', '#38271a', '#d9a774']
  },
  { 
    id: 'fall', 
    name: 'Fall Season', 
    IconComponent: ThemeIcons.fall, 
    colors: ['#0d1b2a', '#162638', '#2b4463', '#e59b24']
  },
  { 
    id: 'warm', 
    name: 'Warm Terracotta', 
    IconComponent: ThemeIcons.warm, 
    colors: ['#0b1a23', '#152733', '#314b5c', '#d97a66']
  },
  { 
    id: 'sunset', 
    name: 'Sun Set', 
    IconComponent: ThemeIcons.sunset, 
    colors: ['#1e2633', '#3c4a5c', '#b8657d', '#f46b78']
  },
  { 
    id: 'sunset-magenta', 
    name: 'Sunset Magenta', 
    IconComponent: ThemeIcons.sunsetMagenta, 
    colors: ['#6700a3', '#e02f75', '#ff5a57', '#fcc8f0'],
    isPremium: true
  },
  { 
    id: 'crimson-twilight', 
    name: 'Crimson Twilight', 
    IconComponent: ThemeIcons.crimsonTwilight, 
    colors: ['#050c38', '#6700a3', '#e02f75', '#ff5a57'],
    isPremium: true
  },
  { 
    id: 'cosmic-nebula', 
    name: 'Cosmic Nebula', 
    IconComponent: ThemeIcons.cosmicNebula, 
    colors: ['#050c38', '#1b2062', '#6700a3', '#a855f7'],
    isPremium: true
  },
  { 
    id: 'electric-lilac', 
    name: 'Electric Lilac', 
    IconComponent: ThemeIcons.electricLilac, 
    colors: ['#0c0e29', '#0033ff', '#977dff', '#efccf2'],
    isPremium: true
  },
  { 
    id: 'royal-cobalt', 
    name: 'Royal Cobalt', 
    IconComponent: ThemeIcons.royalCobalt, 
    colors: ['#040720', '#0600ab', '#0033ff', '#977dff'],
    isPremium: true
  },
  { 
    id: 'deep-abyss', 
    name: 'Deep Abyss', 
    IconComponent: ThemeIcons.deepAbyss, 
    colors: ['#00033d', '#0600ab', '#0033ff', '#60a5fa'],
    isPremium: true
  },
  { 
    id: 'ephemeral', 
    name: 'Ephemeral', 
    IconComponent: ThemeIcons.ephemeral, 
    colors: ['#141a21', '#1f2730', '#384250', '#e3d6c3']
  },
  { 
    id: 'emerald', 
    name: 'Emerald Forest', 
    IconComponent: ThemeIcons.emerald, 
    colors: ['#06120a', '#0e2113', '#22492c', '#34d399']
  },
  { 
    id: 'nordic', 
    name: 'Nordic Midnight', 
    IconComponent: ThemeIcons.nordic, 
    colors: ['#060b14', '#0e1726', '#2a384e', '#38bdf8']
  },
  { 
    id: 'nordic-slate', 
    name: 'Nordic Slate', 
    IconComponent: ThemeIcons.nordic, 
    colors: ['#162836', '#23455b', '#3c617b', '#c8b7a6']
  },
  { 
    id: 'crimson-velvet', 
    name: 'Crimson Velvet', 
    IconComponent: ThemeIcons.sunset, 
    colors: ['#b81432', '#18263e', '#224b6d', '#36959b']
  },
  { 
    id: 'sage-frost', 
    name: 'Sage Frost', 
    IconComponent: ThemeIcons.emerald, 
    colors: ['#edf6ee', '#c2f0b5', '#9be2b0', '#7daeb9']
  }
];

export default function ThemeSelectorDropdown({ 
  currentTheme, 
  onSelectTheme, 
  unlockedThemes = [], 
  onOpenRedeemModal = () => {} 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const ActiveIcon = activeThemeObj.IconComponent;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickTheme = (t) => {
    const isUnlocked = isThemeUnlocked(t.id, unlockedThemes);
    if (!isUnlocked) {
      // Prompt redemption modal
      onOpenRedeemModal(t.id);
      setIsOpen(false);
      return;
    }
    onSelectTheme(t.id);
    setIsOpen(false);
  };

  const handleOpenRedeem = (e) => {
    e.stopPropagation();
    onOpenRedeemModal();
    setIsOpen(false);
  };

  return (
    <div className="custom-theme-dropdown-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        className="theme-dropdown-trigger" 
        onClick={() => setIsOpen(prev => !prev)}
        title="Change Color Tone Theme"
      >
        <span className="theme-trigger-icon"><ActiveIcon /></span>
        <span className="theme-trigger-name">{activeThemeObj.name}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          className={`theme-chevron ${isOpen ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Animated Popover Menu */}
      {isOpen && (
        <div 
          className="theme-popover-menu" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="popover-header">
            <span>Color Tone Themes</span>
            <span className="popover-sub font-mono">{THEMES.length} TONES</span>
          </div>

          <div 
            className="popover-themes-list" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
          >
            {THEMES.map((t) => {
              const isSelected = t.id === currentTheme;
              const OptionIcon = t.IconComponent;
              const isUnlocked = isThemeUnlocked(t.id, unlockedThemes);
              const isPrem = t.isPremium;

              return (
                <button
                  key={t.id}
                  className={`theme-option-item ${isSelected ? 'selected' : ''} ${isPrem && !isUnlocked ? 'theme-locked-item' : ''}`}
                  onClick={() => handlePickTheme(t)}
                  title={isPrem && !isUnlocked ? `${t.name} (Requires Code to Unlock)` : t.name}
                >
                  <div className="item-left">
                    <span className="item-icon"><OptionIcon /></span>
                    <span className="item-name">
                      {t.name}
                      {isPrem && (
                        <span className={`theme-vip-tag ${isUnlocked ? 'unlocked' : 'locked'}`}>
                          {isUnlocked ? (
                            'VIP'
                          ) : (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          )}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="item-right">
                    {/* Palette Swatch Circles */}
                    <div className="palette-swatch" title={`${t.name} Palette`}>
                      {t.colors.map((c, idx) => (
                        <span key={idx} className="swatch-dot" style={{ backgroundColor: c }} />
                      ))}
                    </div>

                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="check-icon">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}

                    {!isUnlocked && isPrem && !isSelected && (
                      <span className="item-lock-pill" title="Locked Theme">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer: Redeem Theme Code button */}
          <div className="popover-footer-action">
            <button 
              type="button" 
              className="popover-redeem-btn" 
              onClick={handleOpenRedeem}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Redeem Theme Code</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

