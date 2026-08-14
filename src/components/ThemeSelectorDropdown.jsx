import React, { useState, useRef, useEffect } from 'react';

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
  )
};

export const THEMES = [
  { 
    id: 'dark', 
    name: 'Dark Obsidian', 
    IconComponent: ThemeIcons.dark, 
    colors: ['#09090b', '#121215', '#1a1a20', '#ffffff']
  },
  { 
    id: 'light', 
    name: 'Pure Light', 
    IconComponent: ThemeIcons.light, 
    colors: ['#f8fafc', '#ffffff', '#e2e8f0', '#0f172a']
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
  }
];

export default function ThemeSelectorDropdown({ currentTheme, onSelectTheme }) {
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

  const handlePickTheme = (themeId) => {
    onSelectTheme(themeId);
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
        <div className="theme-popover-menu">
          <div className="popover-header">
            <span>Color Tone Themes</span>
            <span className="popover-sub font-mono">9 TONES</span>
          </div>

          <div className="popover-themes-list">
            {THEMES.map((t) => {
              const isSelected = t.id === currentTheme;
              const OptionIcon = t.IconComponent;
              return (
                <button
                  key={t.id}
                  className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePickTheme(t.id)}
                >
                  <div className="item-left">
                    <span className="item-icon"><OptionIcon /></span>
                    <span className="item-name">{t.name}</span>
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
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
