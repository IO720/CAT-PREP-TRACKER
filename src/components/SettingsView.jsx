import React, { useState } from 'react';
import { 
  signUpUser, 
  logInUser, 
  logOutUser, 
  signInWithGoogle,
  getLocalAspirantId 
} from '../utils/firebase';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import { THEMES } from './ThemeSelectorDropdown';
import { isThemeUnlocked, redeemThemeCode, PREMIUM_THEME_IDS } from '../utils/themeRedemption';
import { 
  AnimatedSparkleIcon, 
  AnimatedShieldCheckIcon, 
  AnimatedRadarBeaconIcon,
  AnimatedFlameIcon 
} from './AnimatedUiIcons';
import { playSoftZenChime } from '../utils/audioUtils';

export default function SettingsView({
  user,
  userProfile,
  onAuthSuccess,
  startDate = "",
  onUpdateStartDate,
  onExport,
  onImport,
  onReset,
  onTriggerNotification,
  fileInputRef,
  currentTheme = 'slate',
  onSelectTheme = () => {},
  unlockedThemes = [],
  onOpenRedeemModal = () => {},
  onThemeUnlocked = () => {}
}) {
  // Navigation Category Tab ('themes' | 'typography' | 'schedule' | 'cloud')
  const [activeTab, setActiveTab] = useState('themes');

  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Copied Aspirant ID feedback
  const [copiedId, setCopiedId] = useState(false);

  // Inline theme redemption state
  const [inlineCode, setInlineCode] = useState('');
  const [inlineMsg, setInlineMsg] = useState({ text: '', type: '' });
  const [inlineLoading, setInlineLoading] = useState(false);

  // Font Selection State
  const [selectedFont, setSelectedFont] = useState(() => {
    return localStorage.getItem('aspiranto_font_choice') || 'Plus Jakarta Sans';
  });

  // Font Size Scaling State (90%, 100%, 110%, 120%)
  const [fontScale, setFontScale] = useState(() => {
    return localStorage.getItem('aspiranto_font_scale') || '100';
  });

  // Font Boldness Boost State
  const [boldBoost, setBoldBoost] = useState(() => {
    return localStorage.getItem('aspiranto_bold_boost') === 'true';
  });

  // Dynamic theme switch animation states (Skiper UI / React Bits style)
  const [rippleEffect, setRippleEffect] = useState(null);
  const [justSelectedId, setJustSelectedId] = useState(null);

  const handleThemeCardClick = (e, themeId, isPrem, isUnlocked, accentColor) => {
    if (isPrem && !isUnlocked) {
      onOpenRedeemModal(themeId);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    setJustSelectedId(themeId);
    setRippleEffect({ x, y, color: accentColor });
    onSelectTheme(themeId);
    try {
      playSoftZenChime(0.2);
    } catch {
      // Audio autoplay policy fallback
    }

    setTimeout(() => {
      setRippleEffect(null);
    }, 700);

    setTimeout(() => {
      setJustSelectedId(null);
    }, 1200);
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const currentAspirantId = userProfile?.aspirantId || getLocalAspirantId();
  const profName = userProfile?.displayName || user?.displayName || 'CAT Aspirant';
  const profAvatar = userProfile?.avatar || '';
  const profAvatarBg = userProfile?.avatarBg || '#0284c7';

  // Fixed Active Theme to eliminate layout reflow and stuttering
  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const ActivePreviewIcon = activeThemeObj.IconComponent;

  const THEME_DESCRIPTIONS = {
    dark: 'Dark Obsidian — High-contrast deep black interface with crisp white accents and clean obsidian depth.',
    light: 'Pure Light — Minimalist airy paper-white palette engineered for clarity and daytime reading.',
    'dark-olive': 'Dark Olive — Deep moss olive, forest green tones and warm sand accents.',
    'plum-velvet': 'Plum Velvet — Midnight violet, deep plum backgrounds and orchid rose highlights.',
    'slate-terracotta': 'Slate Terracotta — Deep slate navy, storm ocean blues and terracotta peach warmth.',
    coffee: 'Coffee Mocha — Warm roasted espresso tones with soothing caramel highlights for late-night drills.',
    fall: 'Fall Season — Autumn midnight navy accented with rich harvest gold and warm amber glow.',
    warm: 'Warm Terracotta — Deep earthen dusk slate paired with radiant terracotta orange warmth.',
    sunset: 'Sun Set — Twilight evening gradient with soothing dusky crimson and rose pink accents.',
    'sunset-magenta': 'Sunset Magenta — Vivid sunset orchid gradient from soft coral through magenta down to royal purple.',
    'crimson-twilight': 'Crimson Twilight — Electric dusk gradient from neon crimson and magenta into deep violet and midnight navy.',
    'cosmic-nebula': 'Cosmic Nebula — Deep celestial gradient from electric purple through indigo into obsidian abyss.',
    'electric-lilac': 'Electric Lilac — Cyber lilac aesthetic transitioning from pastel pink-lavender into electric violet and ultramarine blue.',
    'royal-cobalt': 'Royal Cobalt — Radiant cobalt energy transitioning from bright violet into deep cyber blue and royal navy.',
    'deep-abyss': 'Deep Abyss — Deep oceanic void gradient plunging from electric sapphire through dark cobalt to infinite abyss.',
    ephemeral: 'Ephemeral — Modern minimal twilight slate complemented by soft champagne gold accents.',
    emerald: 'Emerald Forest — Deep evergreen focus mode with vibrant restorative mint accents.',
    nordic: 'Nordic Midnight — Polar night aesthetic with crystal-clear arctic cyan highlights.',
    'nordic-slate': 'Nordic Slate — Slate navy and deep steel blue paired with cashmere sand accents.',
    'crimson-velvet': 'Crimson Velvet — Deep crimson red, midnight oceanic navy and sea teal highlights.',
    'sage-frost': 'Sage Frost — Soft pastel mint mist, soothing sage and ocean teal accents.'
  };

  const FONTS = [
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sub: 'Modern geometric clean sans' },
    { id: 'Outfit', label: 'Outfit Display', sub: 'Editorial headline aesthetic' },
    { id: 'Inter', label: 'Inter Minimal', sub: 'Compact high-density UI font' },
    { id: 'Space Grotesk', label: 'Space Grotesk', sub: 'Neo-modern tech grotesque' },
    { id: 'Sora', label: 'Sora Precision', sub: 'Futuristic clean geometric sans' },
    { id: 'JetBrains Mono', label: 'JetBrains Mono', sub: 'High-focus tabular monospace' }
  ];

  const handleCopyId = () => {
    if (!currentAspirantId) return;
    navigator.clipboard?.writeText(currentAspirantId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleInlineRedeem = (e) => {
    e.preventDefault();
    if (!inlineCode.trim()) {
      setInlineMsg({ text: 'Please enter a redemption code.', type: 'error' });
      return;
    }

    setInlineLoading(true);
    setInlineMsg({ text: '', type: '' });

    setTimeout(() => {
      const res = redeemThemeCode(inlineCode);
      setInlineLoading(false);
      if (!res.success) {
        setInlineMsg({ text: res.error, type: 'error' });
      } else {
        setInlineMsg({ text: res.message, type: 'success' });
        setInlineCode('');
        if (typeof onThemeUnlocked === 'function') {
          onThemeUnlocked(res.unlockedThemes, res.targetId);
        }
        if (res.targetId && res.targetId !== 'ALL') {
          onSelectTheme(res.targetId);
        } else if (res.targetId === 'ALL') {
          onSelectTheme(PREMIUM_THEME_IDS[0]);
        }
      }
    }, 300);
  };

  const handleFontChange = (fontFamily) => {
    setSelectedFont(fontFamily);
    localStorage.setItem('aspiranto_font_choice', fontFamily);
    document.documentElement.style.setProperty('--font-sans', `'${fontFamily}', -apple-system, BlinkMacSystemFont, sans-serif`);
  };

  const handleScaleChange = (scaleVal) => {
    setFontScale(scaleVal);
    localStorage.setItem('aspiranto_font_scale', scaleVal);
    const ratio = Number(scaleVal) / 100;
    document.documentElement.style.setProperty('--ui-scale', ratio);
    document.documentElement.style.zoom = ratio;
    document.documentElement.style.setProperty('--ui-font-scale', ratio);
    document.documentElement.style.fontSize = `${14 * ratio}px`;
  };

  const handleBoldBoostToggle = (e) => {
    const isChecked = e.target.checked;
    setBoldBoost(isChecked);
    localStorage.setItem('aspiranto_bold_boost', isChecked ? 'true' : 'false');
    document.documentElement.classList.toggle('ui-bold-boost', isChecked);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const u = await signUpUser(email, password, displayName || profName);
        onAuthSuccess(u);
        setAuthSuccess("Account successfully created and cloud synced!");
      } else {
        const u = await logInUser(email, password);
        onAuthSuccess(u);
        setAuthSuccess("Successfully logged in! Your preparation data is synced.");
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setAuthError(err.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);
    try {
      const u = await signInWithGoogle();
      onAuthSuccess(u);
      setAuthSuccess("Successfully connected with Google! Your preparation data is synced.");
    } catch (err) {
      if (!err.message?.includes('popup-closed-by-user')) {
        setAuthError(err.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOutUser();
      onAuthSuccess(null);
      setAuthSuccess("Successfully signed out. Local data preserved.");
    } catch (err) {
      setAuthError(err.message || "Failed to sign out.");
    }
  };

  // Calculate days elapsed from start date
  const getDaysElapsed = () => {
    if (!startDate) return null;
    try {
      const start = new Date(startDate);
      const now = new Date();
      const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return diff >= 0 ? diff : 0;
    } catch {
      return null;
    }
  };

  const daysElapsed = getDaysElapsed();

  return (
    <div className="settings-command-container fade-in">
      {/* React Bits / Skiper UI Full-Screen Theme Ripple Bloom */}
      {rippleEffect && (
        <div 
          className="theme-switch-ripple-portal"
          style={{
            '--ripple-x': `${rippleEffect.x}px`,
            '--ripple-y': `${rippleEffect.y}px`,
            '--ripple-color': rippleEffect.color
          }}
        />
      )}

      {/* ========================================================
          PANORAMIC COMMAND HEADER
         ======================================================== */}
      <div className="settings-command-header">
        <div className="settings-header-left">
          <div className="settings-badge-pill">
            <AnimatedRadarBeaconIcon size={13} color="#38bdf8" />
            <span>SYSTEM PREFERENCES // PROTOCOL</span>
          </div>
          <h1 className="settings-hero-title">Command Settings & Preferences</h1>
          <p className="settings-hero-subtitle">
            Configure visual themes, UI typography scaling, prep schedule calibration, and cloud sync.
          </p>
        </div>

        <div className="settings-header-telemetry">
          <div className="settings-telemetry-chip">
            <span className="telemetry-lbl">THEME</span>
            <span className="telemetry-val">{activeThemeObj.name}</span>
          </div>
          <div className="settings-telemetry-chip">
            <span className="telemetry-lbl">FONT</span>
            <span className="telemetry-val">{selectedFont}</span>
          </div>
          {user ? (
            <div className="settings-telemetry-chip online">
              <span className="telemetry-lbl">SYNC</span>
              <span className="telemetry-val">Cloud Active</span>
            </div>
          ) : (
            <div className="settings-telemetry-chip offline">
              <span className="telemetry-lbl">MODE</span>
              <span className="telemetry-val">Local Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {authSuccess && (
        <div className="settings-global-alert success animate-fade-in">
          <AnimatedShieldCheckIcon size={15} color="#34d399" />
          <span>{authSuccess}</span>
        </div>
      )}
      {authError && (
        <div className="settings-global-alert error animate-fade-in">
          <Icons.Close size={15} />
          <span>{authError}</span>
        </div>
      )}

      {/* ========================================================
          SEGMENTED CATEGORY NAVIGATION (4 PILLARS)
         ======================================================== */}
      <div className="settings-category-nav-bar">
        <button
          type="button"
          className={`category-nav-btn ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          <AnimatedSparkleIcon size={14} color="#38bdf8" />
          <span className="nav-btn-desktop">Appearance & Themes</span>
          <span className="nav-btn-mobile">Themes</span>
        </button>

        <button
          type="button"
          className={`category-nav-btn ${activeTab === 'typography' ? 'active' : ''}`}
          onClick={() => setActiveTab('typography')}
        >
          <Icons.Edit3 size={14} />
          <span className="nav-btn-desktop">Typography Studio</span>
          <span className="nav-btn-mobile">Typography</span>
        </button>

        <button
          type="button"
          className={`category-nav-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <Icons.Calendar size={14} />
          <span className="nav-btn-desktop">Schedule & Sounds</span>
          <span className="nav-btn-mobile">Schedule</span>
        </button>

        <button
          type="button"
          className={`category-nav-btn ${activeTab === 'cloud' ? 'active' : ''}`}
          onClick={() => setActiveTab('cloud')}
        >
          <Icons.Cloud size={14} />
          <span className="nav-btn-desktop">Cloud & Portability</span>
          <span className="nav-btn-mobile">Cloud</span>
        </button>
      </div>

      {/* ========================================================
          CATEGORY 1: APPEARANCE & THEMES
         ======================================================== */}
      {activeTab === 'themes' && (
        <div className="settings-pane-content fade-in">
          
          {/* Active Theme Spotlight Card - Fixed & Stable to Eliminate Layout Jitter */}
          <div 
            className="theme-spotlight-card"
            style={{
              borderColor: activeThemeObj.colors[3],
              background: `linear-gradient(135deg, ${activeThemeObj.colors[0]} 0%, ${activeThemeObj.colors[1]} 100%)`
            }}
          >
            <div className="spotlight-left">
              <div className="spotlight-title-row">
                <span className="spotlight-icon" style={{ color: activeThemeObj.colors[3] }}>
                  <ActivePreviewIcon />
                </span>
                <span className="spotlight-name" style={{ color: activeThemeObj.colors[3] }}>
                  {activeThemeObj.name}
                </span>
                <span className="spotlight-active-badge">
                  <Icons.Check size={11} />
                  <span>Active System Theme</span>
                </span>
              </div>
              <p className="spotlight-desc">
                {THEME_DESCRIPTIONS[activeThemeObj.id] || "Curated interface theme palette tailored for high-focus preparation."}
              </p>
            </div>

            <div className="spotlight-right">
              <div className="spotlight-palette-chips">
                {activeThemeObj.colors.map((c, i) => (
                  <span key={i} className="palette-color-chip" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          </div>

          {/* Complete 21-Theme Gallery Grid */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Visual Palette Gallery</h3>
                <p className="sub-panel-subtitle">Click any theme card to preview and switch system accents in real-time.</p>
              </div>
              <button 
                type="button" 
                className="vip-gallery-link-btn"
                onClick={() => onOpenRedeemModal()}
              >
                <span>Theme Status & Perks</span>
                <Icons.ArrowRight size={13} />
              </button>
            </div>

            <div className="themes-gallery-cards-grid">
              {THEMES.map((th) => {
                const isActive = currentTheme === th.id;
                const IconComp = th.IconComponent;
                const isUnlocked = isThemeUnlocked(th.id, unlockedThemes);
                const isPrem = th.isPremium;
                const isJustSelected = justSelectedId === th.id;

                return (
                  <div
                    key={th.id}
                    className={`theme-card-tile ${isActive ? 'active' : ''} ${isPrem && !isUnlocked ? 'locked' : ''} ${isJustSelected ? 'just-selected' : ''}`}
                    onClick={(e) => handleThemeCardClick(e, th.id, isPrem, isUnlocked, th.colors[3])}
                    onMouseMove={handleCardMouseMove}
                    style={{
                      '--theme-accent': th.colors[3],
                      '--theme-bg': th.colors[0]
                    }}
                  >
                    <div className="theme-card-sheen" />
                    <div className="theme-card-head">
                      <div className="theme-card-icon-wrap" style={{ color: th.colors[3], background: th.colors[0] }}>
                        <IconComp />
                      </div>
                      <div className="theme-card-badges">
                        {isActive && (
                          <span className="theme-active-tag">
                            <Icons.Check size={10} /> Active
                          </span>
                        )}
                        {isPrem && !isUnlocked && (
                          <span className="theme-vip-tag">
                            <Icons.Lock size={10} /> VIP
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="theme-card-meta">
                      <span className="theme-title">{th.name}</span>
                    </div>

                    <div className="theme-card-palette-row">
                      {th.colors.map((c, i) => (
                        <span key={i} className="mini-color-dot" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VIP Secret Code Redemption Console */}
          <div className="settings-sub-panel redeem-console-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">
                  <AnimatedSparkleIcon size={14} color="#38bdf8" />
                  <span>VIP Theme Code Redemption Console</span>
                </h3>
                <p className="sub-panel-subtitle">
                  Unlock secret cyberpunk gradients (e.g. <code>SUNSET-MAGENTA</code> or <code>PREMIUM-ALL</code>).
                </p>
              </div>
            </div>

            <form className="vip-code-form" onSubmit={handleInlineRedeem}>
              <div className="vip-input-wrap">
                <Icons.Key size={14} className="vip-key-icon" />
                <input
                  type="text"
                  placeholder="Enter secret theme redemption code..."
                  value={inlineCode}
                  onChange={(e) => setInlineCode(e.target.value.toUpperCase())}
                  className="vip-code-input"
                  spellCheck="false"
                />
              </div>
              <button 
                type="submit" 
                className="vip-submit-btn"
                disabled={inlineLoading || !inlineCode.trim()}
              >
                {inlineLoading ? 'Verifying...' : 'Unlock VIP Theme'}
              </button>
            </form>

            {inlineMsg.text && (
              <div className={`vip-status-banner ${inlineMsg.type}`}>
                {inlineMsg.type === 'success' ? (
                  <AnimatedShieldCheckIcon size={14} color="#34d399" />
                ) : (
                  <Icons.Close size={14} />
                )}
                <span>{inlineMsg.text}</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          CATEGORY 2: TYPOGRAPHY STUDIO & UI SCALING
         ======================================================== */}
      {activeTab === 'typography' && (
        <div className="settings-pane-content fade-in">
          
          {/* Live Font Interactive Sandbox */}
          <div className="typography-sandbox-card">
            <div className="sandbox-header">
              <span className="sandbox-tag">LIVE TYPOGRAPHY PREVIEW</span>
              <span className="sandbox-active-font">{selectedFont}</span>
            </div>
            <div className="sandbox-content" style={{ fontFamily: selectedFont }}>
              <h2 className="sandbox-headline">
                99.50%ile in CAT 2025: Precision, Consistency & Asymmetric Outcomes.
              </h2>
              <p className="sandbox-body">
                "We do not rise to the level of our goals. We fall to the level of our systems." — Every daily drill logged compound into speed, accuracy, and percentile dominance.
              </p>
            </div>
          </div>

          {/* Font Family Selection Grid */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Interface Font Family</h3>
                <p className="sub-panel-subtitle">Select a clean modern typography system tailored for long reading sessions.</p>
              </div>
            </div>

            <div className="font-family-grid">
              {FONTS.map(f => {
                const isSelected = selectedFont === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`font-card-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleFontChange(f.id)}
                  >
                    <div className="font-card-top">
                      <span className="font-sample-name" style={{ fontFamily: f.id }}>
                        {f.label}
                      </span>
                      {isSelected && (
                        <span className="font-active-badge">
                          <Icons.Check size={11} /> Selected
                        </span>
                      )}
                    </div>
                    <span className="font-sub-desc">{f.sub}</span>
                    <span className="font-specimen" style={{ fontFamily: f.id }}>
                      Aa Bb Gg 123
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UI Scaling & High-Legibility Bold Boost */}
          <div className="settings-sub-panel typography-controls-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">UI Scaling & Legibility</h3>
                <p className="sub-panel-subtitle">Adjust viewport proportions and high-contrast text rendering.</p>
              </div>
            </div>

            <div className="typography-controls-grid">
              {/* Scale Control */}
              <div className="typo-control-card">
                <div className="typo-control-meta">
                  <span className="control-title">UI Zoom & Font Scale</span>
                  <span className="control-value-pill">{fontScale}%</span>
                </div>
                <p className="control-desc">Scale text elements and metrics for high-DPI screens or compact reading.</p>
                <div className="scale-buttons-row">
                  {[
                    { val: '90', label: '90% Compact' },
                    { val: '100', label: '100% Balanced' },
                    { val: '110', label: '110% Comfort' },
                    { val: '120', label: '120% Large' }
                  ].map(s => (
                    <button
                      key={s.val}
                      type="button"
                      className={`scale-btn ${fontScale === s.val ? 'active' : ''}`}
                      onClick={() => handleScaleChange(s.val)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bold Boost Control */}
              <div className="typo-control-card">
                <div className="typo-control-meta">
                  <span className="control-title">High-Legibility Bold Typography</span>
                  <label className="cyber-toggle-wrap">
                    <input 
                      type="checkbox" 
                      checked={boldBoost} 
                      onChange={handleBoldBoostToggle}
                      className="cyber-toggle-input"
                    />
                    <span className="cyber-toggle-track">
                      <span className="cyber-toggle-thumb" />
                    </span>
                  </label>
                </div>
                <p className="control-desc">Increases standard font weights to 600+ across all syllabus titles, timers, and problem descriptions for maximum ocular clarity.</p>
                <div className="bold-status-chip">
                  <span className={`status-dot ${boldBoost ? 'active' : ''}`} />
                  <span>{boldBoost ? 'High-Legibility Enabled' : 'Standard Weight Typography'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          CATEGORY 3: SCHEDULE & SOUNDS
         ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="settings-pane-content fade-in">
          
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Preparation Baseline Schedule</h3>
                <p className="sub-panel-subtitle">Calibrate your preparation start date to synchronize daily streak tracking and week milestones.</p>
              </div>
            </div>

            <div className="schedule-setting-card">
              <div className="schedule-input-row">
                <div className="schedule-field-group">
                  <label>Prep Start Date</label>
                  <div className="schedule-input-wrap">
                    <Icons.Calendar size={15} className="schedule-cal-icon" />
                    <input 
                      type="date" 
                      value={startDate || ""}
                      onChange={(e) => onUpdateStartDate && onUpdateStartDate(e.target.value)}
                      className="schedule-date-input"
                    />
                  </div>
                </div>

                <div className="schedule-telemetry-pills">
                  {daysElapsed !== null && (
                    <div className="sched-pill">
                      <AnimatedFlameIcon size={14} />
                      <span>{daysElapsed} Days Since Start</span>
                    </div>
                  )}
                  <div className="sched-pill highlight">
                    <Icons.Target size={14} />
                    <span>CAT 2025 Target Window</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Feedback & Sanctuary Chimes */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Zen Audio & Ambient Chimes</h3>
                <p className="sub-panel-subtitle">Audio feedback when study sprints complete or timer milestones are unlocked.</p>
              </div>
            </div>

            <div className="audio-test-card">
              <div className="audio-card-meta">
                <div className="audio-title-row">
                  <Icons.Bell size={16} />
                  <span>Zen Study Sanctuary Chime</span>
                </div>
                <p className="audio-desc">
                  Gentle 528Hz harmonized completion chime played when your focus timer reaches zero.
                </p>
              </div>
              <button 
                type="button" 
                className="audio-preview-btn"
                onClick={() => playSoftZenChime(0.35)}
              >
                <Icons.Play size={13} />
                <span>Test Zen Chime</span>
              </button>
            </div>

            {/* Notification Toast Simulator */}
            {onTriggerNotification && (
              <div className="audio-test-card" style={{ marginTop: '12px' }}>
                <div className="audio-card-meta">
                  <div className="audio-title-row">
                    <Icons.CheckCircle size={16} />
                    <span>In-App Toast Notification</span>
                  </div>
                  <p className="audio-desc">
                    Trigger a demo toast notification to verify system alert visibility and sounds.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="audio-preview-btn secondary"
                  onClick={onTriggerNotification}
                >
                  <Icons.Bell size={13} />
                  <span>Trigger Demo Toast</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          CATEGORY 4: CLOUD ACCOUNT & PORTABILITY
         ======================================================== */}
      {activeTab === 'cloud' && (
        <div className="settings-pane-content fade-in">
          
          {/* Cloud Account Status / Form */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Cloud Account & Real-Time Sync</h3>
                <p className="sub-panel-subtitle">Synchronize daily drills, mocks, and custom study notes across devices.</p>
              </div>
            </div>

            {user ? (
              <div className="cloud-account-card">
                <div className="cloud-account-left">
                  <AvatarRenderer 
                    avatar={profAvatar}
                    name={profName}
                    avatarBg={profAvatarBg}
                    size={52}
                    status="online"
                  />
                  <div className="cloud-account-info">
                    <div className="cloud-name-row">
                      <span className="cloud-display-name">{user.displayName || profName}</span>
                      <span className="cloud-verified-pill">
                        <AnimatedShieldCheckIcon size={12} color="#34d399" />
                        <span>Cloud Verified</span>
                      </span>
                    </div>
                    <span className="cloud-email">{user.email}</span>
                    <div className="cloud-id-row">
                      <span className="cloud-asp-id" onClick={handleCopyId} title="Click to copy Aspirant ID">
                        <Icons.Hash size={11} />
                        <span>{currentAspirantId}</span>
                        {copiedId ? <Icons.Check size={11} /> : <Icons.Copy size={11} />}
                      </span>
                      <span className="cloud-status-badge">
                        <AnimatedRadarBeaconIcon size={12} color="#34d399" />
                        <span>Firestore Live Sync Active</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cloud-account-actions">
                  <button 
                    type="button" 
                    className="cloud-signout-btn"
                    onClick={handleLogOut}
                  >
                    <Icons.LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="cloud-auth-box">
                <div className="auth-tab-switch-row">
                  <button 
                    type="button" 
                    className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
                    onClick={() => setIsSignUp(false)}
                  >
                    Log In
                  </button>
                  <button 
                    type="button" 
                    className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
                    onClick={() => setIsSignUp(true)}
                  >
                    Create Account
                  </button>
                </div>

                <form className="cloud-auth-form" onSubmit={handleAuth}>
                  {isSignUp && (
                    <div className="auth-form-field">
                      <label>Display Name</label>
                      <div className="auth-input-container">
                        <Icons.User size={14} className="auth-icon" />
                        <input 
                          type="text" 
                          placeholder="e.g. Rahul Sharma" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="auth-form-field">
                    <label>Email Address</label>
                    <div className="auth-input-container">
                      <Icons.Mail size={14} className="auth-icon" />
                      <input 
                        type="email" 
                        placeholder="aspirant@gmail.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-form-field">
                    <label>Password</label>
                    <div className="auth-input-container">
                      <Icons.Key size={14} className="auth-icon" />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-primary-btn" disabled={loading}>
                    {loading ? 'Processing...' : (isSignUp ? 'Create Account & Sync' : 'Log In & Sync')}
                  </button>

                  <div className="auth-divider">
                    <span className="divider-label">OR</span>
                  </div>

                  <button
                    type="button"
                    className="auth-google-btn"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    <svg className="google-svg-logo" width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Data Portability Suite */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Data Portability & Offline Snapshots</h3>
                <p className="sub-panel-subtitle">Download JSON backups of your 4-month plan, daily drills, and 30 CAT mocks.</p>
              </div>
            </div>

            <div className="portability-cards-grid">
              {/* Export Card */}
              <div className="portability-action-card">
                <div className="port-card-top">
                  <div className="port-icon-wrap export">
                    <Icons.Download size={18} />
                  </div>
                  <div>
                    <span className="port-card-title">Export JSON Backup</span>
                    <span className="port-card-desc">Download complete preparation state into an offline portable file.</span>
                  </div>
                </div>
                <button type="button" className="port-btn export" onClick={onExport}>
                  <Icons.Download size={13} />
                  <span>Export Backup</span>
                </button>
              </div>

              {/* Import Card */}
              <div className="portability-action-card">
                <div className="port-card-top">
                  <div className="port-icon-wrap import">
                    <Icons.RefreshCw size={18} />
                  </div>
                  <div>
                    <span className="port-card-title">Restore from File</span>
                    <span className="port-card-desc">Restore previously saved preparation logs from a JSON snapshot.</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="port-btn import"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icons.RefreshCw size={13} />
                  <span>Restore Snapshot</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={onImport} style={{ display: 'none' }} accept=".json" />
              </div>

              {/* Danger Zone: Reset Card */}
              <div className="portability-action-card danger">
                <div className="port-card-top">
                  <div className="port-icon-wrap reset">
                    <Icons.Trash2 size={18} />
                  </div>
                  <div>
                    <span className="port-card-title">Reset All Progress</span>
                    <span className="port-card-desc">Clear ticks, solved question metrics, and restore original CAT defaults.</span>
                  </div>
                </div>
                <button type="button" className="port-btn reset" onClick={onReset}>
                  <Icons.Trash2 size={13} />
                  <span>Reset Progress</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
