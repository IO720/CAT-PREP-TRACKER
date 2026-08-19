import React, { useState, useEffect } from 'react';
import { THEMES } from './ThemeSelectorDropdown';
import { PREMIUM_THEME_IDS, redeemThemeCode, isThemeUnlocked } from '../utils/themeRedemption';

export default function ThemeRedeemModal({
  isOpen,
  onClose,
  onThemeUnlocked,
  preselectedThemeId = null,
  unlockedThemes = []
}) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setErrorMsg('');
      setSuccessResult(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const premiumThemesList = THEMES.filter(t => PREMIUM_THEME_IDS.includes(t.id));

  const handleRedeem = (e) => {
    e?.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter a redemption code.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = redeemThemeCode(code);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to redeem code.');
      } else {
        setSuccessResult(res);
        if (typeof onThemeUnlocked === 'function') {
          onThemeUnlocked(res.unlockedThemes, res.targetId);
        }
      }
    }, 350);
  };

  const handleApplyNow = (themeId) => {
    if (themeId && themeId !== 'ALL') {
      if (typeof onThemeUnlocked === 'function') {
        onThemeUnlocked(null, themeId, true);
      }
    }
    onClose();
  };

  return (
    <div className="theme-redeem-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="theme-redeem-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="redeem-modal-header">
          <div className="redeem-modal-title-row">
            <div className="redeem-sparkle-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div>
              <h3 className="redeem-modal-title">Redeem Exclusive Themes</h3>
              <p className="redeem-modal-subtitle">
                Enter your secret VIP redemption code to unlock handcrafted gradient themes.
              </p>
            </div>
          </div>
          <button className="redeem-close-btn" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="redeem-modal-body">
          {successResult ? (
            /* Celebration Success State */
            <div className="redeem-success-view animate-pop">
              <div className="redeem-success-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h4 className="redeem-success-title">Code Successfully Redeemed!</h4>
              <p className="redeem-success-desc">{successResult.message}</p>

              {successResult.targetId !== 'ALL' ? (
                <div className="redeem-success-actions">
                  <button 
                    className="btn-primary redeem-apply-btn" 
                    onClick={() => handleApplyNow(successResult.targetId)}
                  >
                    Apply "{successResult.themeName}" Now
                  </button>
                  <button className="btn-secondary" onClick={onClose}>
                    Done
                  </button>
                </div>
              ) : (
                <div className="redeem-success-actions">
                  <button 
                    className="btn-primary redeem-apply-btn" 
                    onClick={() => handleApplyNow(PREMIUM_THEME_IDS[0])}
                  >
                    Apply {THEMES.find(t => t.id === PREMIUM_THEME_IDS[0])?.name}
                  </button>
                  <button className="btn-secondary" onClick={onClose}>
                    Done
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Code Entry Form */
            <form className="redeem-form" onSubmit={handleRedeem}>
              <div className="redeem-input-container">
                <div className="redeem-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="redeem-key-icon">
                    <path d="m21 2-2 2m-1.5 1.5L16 7l-1.5-1.5M19 5l-2.5 2.5m-5 5L3 21l3-3 3 3 1.5-1.5-1.5-1.5 3-3-1.5-1.5 3-3"></path>
                    <circle cx="16" cy="8" r="5"></circle>
                  </svg>
                  <input
                    type="text"
                    className="redeem-code-input"
                    placeholder="e.g. SUNSET-MAGENTA or PREMIUM-ALL"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    autoFocus
                    spellCheck="false"
                    autoComplete="off"
                  />
                  {code && (
                    <button 
                      type="button" 
                      className="redeem-clear-input-btn"
                      onClick={() => setCode('')}
                      title="Clear code"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="btn-primary redeem-submit-btn" 
                  disabled={isSubmitting || !code.trim()}
                >
                  {isSubmitting ? 'Verifying...' : 'Unlock'}
                </button>
              </div>

              {errorMsg && (
                <div className="redeem-error-msg animate-shake">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Exclusive Themes Showcase List */}
              <div className="redeem-showcase-section">
                <div className="showcase-header">
                  <span>Exclusive Gradient Themes</span>
                  <span className="showcase-count">
                    {premiumThemesList.filter(t => isThemeUnlocked(t.id, unlockedThemes)).length} / {premiumThemesList.length} Unlocked
                  </span>
                </div>

                <div className="showcase-grid">
                  {premiumThemesList.map(t => {
                    const isUnlocked = isThemeUnlocked(t.id, unlockedThemes);
                    const isHighlighted = preselectedThemeId === t.id;
                    const IconComp = t.IconComponent;

                    return (
                      <div 
                        key={t.id} 
                        className={`showcase-tile ${isUnlocked ? 'unlocked' : 'locked'} ${isHighlighted ? 'highlighted' : ''}`}
                      >
                        <div className="showcase-tile-left">
                          <span className="showcase-icon" style={{ color: t.colors[2] || t.colors[0] }}>
                            <IconComp />
                          </span>
                          <div className="showcase-meta">
                            <span className="showcase-name">{t.name}</span>
                            <div className="showcase-gradient-bar">
                              {t.colors.map((c, i) => (
                                <span key={i} style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="showcase-tile-right">
                          {isUnlocked ? (
                            <span className="showcase-status-badge unlocked">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Unlocked
                            </span>
                          ) : (
                            <span className="showcase-status-badge locked">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
