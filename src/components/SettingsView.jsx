import React, { useState, useEffect } from 'react';
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
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Inline theme redemption state
  const [inlineCode, setInlineCode] = useState('');
  const [inlineMsg, setInlineMsg] = useState({ text: '', type: '' });
  const [inlineLoading, setInlineLoading] = useState(false);

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

  const currentAspirantId = userProfile?.aspirantId || getLocalAspirantId();
  const profName = userProfile?.displayName || user?.displayName || 'CAT Aspirant';
  const profAvatar = userProfile?.avatar || '';
  const profAvatarBg = userProfile?.avatarBg || '#5865f2';

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

  // Hovered Theme for Inspection Card
  const [hoveredThemeId, setHoveredThemeId] = useState(null);

  const activeOrHoveredTheme = THEMES.find(t => t.id === (hoveredThemeId || currentTheme)) || THEMES[0];
  const ActivePreviewIcon = activeOrHoveredTheme.IconComponent;

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
    'sunset-magenta': 'Sunset Magenta — Vivid sunset orchid gradient from soft pink (#FCC8F0) through vibrant coral & magenta (#FF5A57, #E02F75) down to royal purple (#6700A3).',
    'crimson-twilight': 'Crimson Twilight — Electric dusk gradient from neon crimson (#FF5A57) and magenta (#E02F75) into deep violet (#6700A3) and midnight navy (#050C38).',
    'cosmic-nebula': 'Cosmic Nebula — Deep celestial gradient from electric purple (#6700A3) through indigo (#1B2062) into obsidian abyss (#050C38).',
    'electric-lilac': 'Electric Lilac — Cyber lilac aesthetic transitioning from pastel pink-lavender (#EFCCF2) through electric violet (#977DFF) to ultramarine blue (#0033FF).',
    'royal-cobalt': 'Royal Cobalt — Radiant cobalt energy transitioning from bright violet (#977DFF) into deep cyber blue (#0033FF) and royal navy (#0600AB).',
    'deep-abyss': 'Deep Abyss — Deep oceanic void gradient plunging from electric sapphire (#0033FF) through dark cobalt (#0600AB) to infinite abyss (#00033D).',
    ephemeral: 'Ephemeral — Modern minimal twilight slate complemented by soft champagne gold accents.',
    emerald: 'Emerald Forest — Deep evergreen focus mode with vibrant restorative mint accents.',
    nordic: 'Nordic Midnight — Polar night aesthetic with crystal-clear arctic cyan highlights.',
    'nordic-slate': 'Nordic Slate — Slate navy and deep steel blue paired with cashmere sand accents.',
    'crimson-velvet': 'Crimson Velvet — Deep crimson red, midnight oceanic navy and sea teal highlights.',
    'sage-frost': 'Sage Frost — Soft pastel mint mist, soothing sage and ocean teal accents.'
  };

  const FONTS = [
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sub: 'Modern geometric clean sans' },
    { id: 'Outfit', label: 'Outfit Display', sub: 'Editorial geometric headline style' },
    { id: 'Inter', label: 'Inter Minimal', sub: 'Compact high-density UI font' },
    { id: 'Space Grotesk', label: 'Space Grotesk', sub: 'Neo-modern tech grotesque' },
    { id: 'Sora', label: 'Sora Precision', sub: 'Futuristic clean geometric sans' },
    { id: 'JetBrains Mono', label: 'JetBrains Mono', sub: 'High-focus monospace design' }
  ];

  return (
    <div className="settings-page-wrapper fade-in">
      {/* Page Header */}
      <div className="settings-page-header">
        <div className="settings-header-icon-box">
          <Icons.Settings size={24} />
        </div>
        <div>
          <h1 className="settings-page-title">Settings & Cloud Management</h1>
          <p className="settings-page-subtitle">
            Configure your cloud backup account, appearance themes, UI typography, and data export options.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {authSuccess && (
        <div className="auth-success-msg" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.CheckCircle size={15} />
          <span>{authSuccess}</span>
        </div>
      )}
      {authError && (
        <div className="auth-error-msg" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Close size={15} />
          <span>{authError}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="settings-cards-grid">
        
        {/* Card 1: Cloud Account & Sync */}
        <div className="settings-card-container">
          <div className="settings-card-header">
            <div className="settings-card-icon-box cloud-icon">
              <Icons.Cloud size={20} />
            </div>
            <div>
              <h3 className="settings-card-title">Cloud Account & Sync</h3>
              <p className="settings-card-subtitle">
                Automatic real-time synchronization across web and mobile devices.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            {user ? (
              <div className="account-logged-in-box">
                <div className="account-user-row">
                  <AvatarRenderer 
                    avatar={profAvatar}
                    name={profName}
                    avatarBg={profAvatarBg}
                    size={52}
                    status="online"
                  />
                  <div className="account-details-col">
                    <div className="account-user-name">
                      <span>{user.displayName || profName}</span>
                      <span className="verified-status-tag">
                        <Icons.Shield size={11} /> Verified
                      </span>
                    </div>
                    <div className="account-user-email">
                      <Icons.Mail size={12} />
                      <span>{user.email}</span>
                    </div>
                    <div className="account-id-row">
                      <span className="account-id-badge">
                        <Icons.Hash size={10} /> {currentAspirantId}
                      </span>
                      <span className="account-sync-live-pill">
                        <span className="live-pulse-dot"></span>
                        <span>Live Sync Active</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="account-card-actions">
                  <button 
                    type="button" 
                    className="account-signout-btn" 
                    onClick={handleLogOut}
                  >
                    <Icons.LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <form className="auth-form-styled" onSubmit={handleAuth}>
                <div className="auth-toggle-pill-row">
                  <button 
                    type="button" 
                    className={`auth-toggle-pill ${!isSignUp ? 'active' : ''}`}
                    onClick={() => setIsSignUp(false)}
                  >
                    Log In
                  </button>
                  <button 
                    type="button" 
                    className={`auth-toggle-pill ${isSignUp ? 'active' : ''}`}
                    onClick={() => setIsSignUp(true)}
                  >
                    Create Account
                  </button>
                </div>

                {isSignUp && (
                  <div className="auth-field-group">
                    <label>Display Name</label>
                    <div className="auth-input-wrapper">
                      <Icons.User size={15} className="auth-input-icon" />
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

                <div className="auth-field-group">
                  <label>Email Address</label>
                  <div className="auth-input-wrapper">
                    <Icons.Mail size={15} className="auth-input-icon" />
                    <input 
                      type="email" 
                      placeholder="aspirant@gmail.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <Icons.Key size={15} className="auth-input-icon" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary auth-submit-btn-styled" disabled={loading}>
                  {loading ? 'Processing...' : (isSignUp ? 'Create Account & Sync' : 'Log In & Sync')}
                </button>

                <div className="auth-or-divider" style={{ margin: '12px 0 8px 0' }}>
                  <div className="divider-line" />
                  <span className="divider-text" style={{ fontSize: '10px' }}>OR</span>
                  <div className="divider-line" />
                </div>

                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  style={{ width: '100%', padding: '10px' }}
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
            )}
          </div>
        </div>

        {/* Card 2: Appearance & Theme Customization */}
        <div className="settings-card-container">
          <div className="settings-card-header">
            <div className="settings-card-icon-box theme-icon">
              <Icons.Sparkles size={20} />
            </div>
            <div>
              <h3 className="settings-card-title">Appearance & Color Themes</h3>
              <p className="settings-card-subtitle">
                Select your preferred interface color palette and accent style.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            {/* Emblem Buttons displaying theme logos with lock state */}
            <div className="settings-theme-emblems-bar">
              {THEMES.map((th) => {
                const isActive = currentTheme === th.id;
                const isHovered = hoveredThemeId === th.id;
                const IconComp = th.IconComponent;
                const isUnlocked = isThemeUnlocked(th.id, unlockedThemes);
                const isPrem = th.isPremium;

                return (
                  <button
                    key={th.id}
                    type="button"
                    className={`settings-theme-emblem-btn ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''} ${isPrem && !isUnlocked ? 'locked' : ''}`}
                    onClick={() => {
                      if (isPrem && !isUnlocked) {
                        onOpenRedeemModal(th.id);
                      } else {
                        onSelectTheme(th.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredThemeId(th.id)}
                    onMouseLeave={() => setHoveredThemeId(null)}
                    title={isPrem && !isUnlocked ? `${th.name} (VIP Exclusive - Click to Unlock)` : th.name}
                    style={{
                      '--theme-accent': th.colors[3],
                      '--theme-bg-preview': th.colors[0]
                    }}
                  >
                    <span className="theme-emblem-icon-wrap" style={{ color: th.colors[3] }}>
                      <IconComp />
                    </span>
                    {isActive && <span className="theme-emblem-check-dot" style={{ backgroundColor: th.colors[3] }} />}
                    {isPrem && !isUnlocked && (
                      <span className="theme-emblem-lock-pip" title="VIP Exclusive (Locked)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7z" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hover Theme Card: Displays what the theme represents */}
            {(() => {
              const isCurrentPreviewUnlocked = isThemeUnlocked(activeOrHoveredTheme.id, unlockedThemes);
              const isPrem = activeOrHoveredTheme.isPremium;

              return (
                <div 
                  className="settings-theme-preview-card animate-fade-in"
                  style={{
                    borderColor: activeOrHoveredTheme.colors[3],
                    background: `linear-gradient(135deg, ${activeOrHoveredTheme.colors[0]} 0%, ${activeOrHoveredTheme.colors[1]} 100%)`
                  }}
                >
                  <div className="theme-preview-header">
                    <div className="theme-preview-title-row">
                      <span className="theme-preview-icon" style={{ color: activeOrHoveredTheme.colors[3] }}>
                        <ActivePreviewIcon />
                      </span>
                      <span className="theme-preview-name" style={{ color: activeOrHoveredTheme.colors[3] }}>
                        {activeOrHoveredTheme.name}
                      </span>
                      {currentTheme === activeOrHoveredTheme.id ? (
                        <span className="theme-preview-active-badge">Active Theme</span>
                      ) : isPrem && !isCurrentPreviewUnlocked ? (
                        <button 
                          type="button" 
                          className="theme-preview-unlock-btn"
                          onClick={() => onOpenRedeemModal(activeOrHoveredTheme.id)}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          <span>Unlock with Code</span>
                        </button>
                      ) : (
                        <span className="theme-preview-click-hint">Click to apply</span>
                      )}
                    </div>

                    <div className="theme-preview-dots-row">
                      {activeOrHoveredTheme.colors.map((c, i) => (
                        <span key={i} className="theme-color-dot" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <div className="theme-preview-description">
                    {THEME_DESCRIPTIONS[activeOrHoveredTheme.id] || "Curated interface theme palette tailored for high-focus preparation."}
                  </div>
                </div>
              );
            })()}

            {/* VIP Theme Code Redemption Inline Box */}
            <div className="settings-theme-redeem-row">
              <div className="redeem-row-header">
                <div className="redeem-row-title">
                  <Icons.Sparkles size={14} />
                  <span>Redeem Exclusive VIP Theme</span>
                </div>
                <button 
                  type="button" 
                  className="redeem-view-all-link"
                  onClick={() => onOpenRedeemModal()}
                >
                  Theme Gallery & Status →
                </button>
              </div>

              <form className="settings-inline-redeem-form" onSubmit={handleInlineRedeem}>
                <div className="settings-inline-input-wrap">
                  <Icons.Key size={13} className="inline-key-icon" />
                  <input
                    type="text"
                    placeholder="Enter secret theme code (e.g. SUNSET-MAGENTA or PREMIUM-ALL)..."
                    value={inlineCode}
                    onChange={(e) => setInlineCode(e.target.value.toUpperCase())}
                    className="settings-inline-redeem-input"
                    spellCheck="false"
                  />
                </div>
                <button 
                  type="submit" 
                  className="settings-inline-redeem-btn" 
                  disabled={inlineLoading || !inlineCode.trim()}
                >
                  {inlineLoading ? 'Verifying...' : 'Unlock Theme'}
                </button>
              </form>

              {inlineMsg.text && (
                <div className={`settings-inline-redeem-msg ${inlineMsg.type}`}>
                  {inlineMsg.type === 'success' ? <Icons.CheckCircle size={13} /> : <Icons.Close size={13} />}
                  <span>{inlineMsg.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Typography & Fonts */}
        <div className="settings-card-container">
          <div className="settings-card-header">
            <div className="settings-card-icon-box font-icon">
              <Icons.Edit3 size={20} />
            </div>
            <div>
              <h3 className="settings-card-title">Typography & Font Family</h3>
              <p className="settings-card-subtitle">
                Customize readability and font personality across the application.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="settings-font-list">
              {FONTS.map(f => {
                const isSelected = selectedFont === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`font-selection-tile ${isSelected ? 'active' : ''}`}
                    onClick={() => handleFontChange(f.id)}
                  >
                    <div className="font-tile-top-row">
                      <span style={{ fontFamily: f.id, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {f.label}
                      </span>
                      {isSelected && <span className="font-active-pill">Selected</span>}
                    </div>
                    <div className="font-subtext">{f.sub}</div>
                  </button>
                );
              })}
            </div>

            {/* Font Size / UI Scaling Options */}
            <div className="font-scale-control-group" style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>UI Font Scale & Size</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color)' }}>{fontScale}%</span>
              </div>
              <div className="font-scale-buttons-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { val: '90', label: 'Compact (90%)' },
                  { val: '100', label: 'Default (100%)' },
                  { val: '110', label: 'Large (110%)' },
                  { val: '120', label: 'XL (120%)' }
                ].map(s => (
                  <button
                    key={s.val}
                    type="button"
                    className={`btn-secondary ${fontScale === s.val ? 'active' : ''}`}
                    onClick={() => handleScaleChange(s.val)}
                    style={{
                      fontSize: '11px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      background: fontScale === s.val ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                      color: fontScale === s.val ? 'var(--bg-primary)' : 'var(--text-primary)',
                      border: fontScale === s.val ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High-Contrast Boldness Boost Toggle */}
            <div className="bold-boost-row" style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>High-Legibility Bold Typography</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Increases overall text weight for high readability</div>
              </div>
              <label className="toggle-switch-styled" style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px' }}>
                <input 
                  type="checkbox" 
                  checked={boldBoost} 
                  onChange={handleBoldBoostToggle}
                  style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span 
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    inset: 0,
                    backgroundColor: boldBoost ? 'var(--accent-color)' : '#4b5563',
                    borderRadius: '20px',
                    transition: '0.2s'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute',
                      height: '14px',
                      width: '14px',
                      left: boldBoost ? '20px' : '3px',
                      bottom: '3px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transition: '0.2s'
                    }}
                  />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 4: Preparation Start Date */}
        <div className="settings-card-container">
          <div className="settings-card-header">
            <div className="settings-card-icon-box date-icon">
              <Icons.Calendar size={20} />
            </div>
            <div>
              <h3 className="settings-card-title">Preparation Schedule</h3>
              <p className="settings-card-subtitle">
                Set or modify your prep baseline start date for day calculation and streak alignment.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="start-date-setting-row">
              <div className="auth-field-group" style={{ marginBottom: 0, flex: 1 }}>
                <label>Prep Start Date</label>
                <div className="auth-input-wrapper">
                  <Icons.Calendar size={15} className="auth-input-icon" />
                  <input 
                    type="date" 
                    value={startDate || ""}
                    onChange={(e) => onUpdateStartDate && onUpdateStartDate(e.target.value)}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Data Maintenance & Backups */}
        <div className="settings-card-container" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-card-header">
            <div className="settings-card-icon-box database-icon">
              <Icons.Database size={20} />
            </div>
            <div>
              <h3 className="settings-card-title">Data Maintenance & Offline Backups</h3>
              <p className="settings-card-subtitle">
                Export JSON snapshots, restore previously backed up logs, or reset all preparation data.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="maintenance-action-rows">
              {/* Export Action */}
              <div className="maintenance-row-item">
                <div className="maintenance-row-meta">
                  <div className="maintenance-row-title">
                    <Icons.Download size={14} />
                    <span>Export JSON Backup</span>
                  </div>
                  <div className="maintenance-row-desc">
                    Download complete preparation checklist, scores, and logs as a secure JSON snapshot.
                  </div>
                </div>
                <button 
                  type="button" 
                  className="maintenance-action-btn export"
                  onClick={onExport}
                >
                  <Icons.Download size={13} />
                  <span>Export</span>
                </button>
              </div>

              {/* Import / Restore Action */}
              <div className="maintenance-row-item">
                <div className="maintenance-row-meta">
                  <div className="maintenance-row-title">
                    <Icons.RefreshCw size={14} />
                    <span>Restore Tracker Backup</span>
                  </div>
                  <div className="maintenance-row-desc">
                    Restore and merge your saved study records from a previously exported file.
                  </div>
                </div>
                <button 
                  type="button" 
                  className="maintenance-action-btn import"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icons.RefreshCw size={13} />
                  <span>Import</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={onImport} style={{ display: 'none' }} accept=".json" />
              </div>

              {/* Reset Action */}
              <div className="maintenance-row-item danger-row">
                <div className="maintenance-row-meta">
                  <div className="maintenance-row-title">
                    <Icons.Trash2 size={14} color="#ef4444" />
                    <span>Reset All Progress</span>
                  </div>
                  <div className="maintenance-row-desc">
                    Clear current checklist ticks, timer logs and restore original CAT defaults.
                  </div>
                </div>
                <button 
                  type="button" 
                  className="maintenance-action-btn reset"
                  onClick={onReset}
                >
                  <Icons.Trash2 size={13} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Demo Notification Toast */}
              {onTriggerNotification && (
                <div className="maintenance-row-item">
                  <div className="maintenance-row-meta">
                    <div className="maintenance-row-title">
                      <Icons.Bell size={14} />
                      <span>Test App Notification Toast</span>
                    </div>
                    <div className="maintenance-row-desc">
                      Preview the in-app notification and update prompt component.
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={onTriggerNotification}
                  >
                    <span>Trigger Notification</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
