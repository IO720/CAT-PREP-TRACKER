import React, { useState } from 'react';
import { signUpUser, logInUser, isFirebaseConfigured } from '../utils/firebase';

export default function MobileOnboardingAuth({ onAuthSuccess, onContinueOffline }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetGoal, setTargetGoal] = useState('CAT 2025 (99.5+%ile)');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your name or alias.');
          setLoading(false);
          return;
        }
        const u = await signUpUser(email, password, displayName);
        onAuthSuccess(u);
      } else {
        const u = await logInUser(email, password);
        onAuthSuccess(u);
      }
    } catch (err) {
      console.error("Auth error:", err);
      const msg = err.message ? err.message.replace('Firebase: ', '') : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-onboarding-wrapper">
      <div className="mobile-onboarding-card">
        {/* Brand Header */}
        <div className="mobile-onboarding-header">
          <div className="onboarding-logo-glow">
            <svg width="42" height="42" viewBox="0 0 64 64" fill="none">
              <rect x="8" y="10" width="44" height="42" rx="12" fill="var(--accent-color)" stroke="currentColor" strokeWidth="2.5" />
              <path d="M18 18 H42 M18 24 H34" stroke="var(--bg-primary)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
              <path d="M32 26 L35 34 L43 35 L37 41 L39 49 L32 44 L25 49 L27 41 L21 35 L29 34 Z" fill="#fbbf24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="onboarding-title">Aspiranto</h1>
          <div className="onboarding-badge">ANDROID NATIVE APP</div>
          <p className="onboarding-subtext">
            {isSignUp 
              ? 'Create your free preparation account to activate live peer lounge & cloud sync.' 
              : 'Welcome back! Sign in to sync your study progress.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="onboarding-tab-toggle">
          <button 
            type="button" 
            className={`tab-toggle-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Create Account
          </button>
          <button 
            type="button" 
            className={`tab-toggle-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="onboarding-error-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="onboarding-form">
          {isSignUp && (
            <div className="onboarding-input-group">
              <label>YOUR NAME / ALIAS</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  placeholder="e.g. Rahul S."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="onboarding-input-group">
            <label>EMAIL ADDRESS</label>
            <div className="input-with-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="onboarding-input-group">
            <label>PASSWORD</label>
            <div className="input-with-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div className="onboarding-input-group">
              <label>PRIMARY TARGET EXAM</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                <select 
                  value={targetGoal} 
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="onboarding-select"
                >
                  <option value="CAT 2025 (99.5+%ile)">CAT 2025 (99.5+%ile • IIM A/B/C)</option>
                  <option value="CAT 2025 (99.0+%ile)">CAT 2025 (99.0+%ile • FMS / XLRI)</option>
                  <option value="CAT 2026 Foundation">CAT 2026 Foundation Prep</option>
                  <option value="XAT / OMETs Focus">XAT / SNAP / NMAT Prep</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="onboarding-submit-btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner-row">
                <span className="spinner-dot"></span> Setting up account...
              </span>
            ) : isSignUp ? (
              'Create Account & Start Prepping →'
            ) : (
              'Sign In & Open Tracker →'
            )}
          </button>
        </form>

        {/* Offline / Guest Mode Fallback */}
        <div className="onboarding-footer-actions">
          <button 
            type="button" 
            className="onboarding-guest-btn"
            onClick={onContinueOffline}
          >
            Skip for now & use Offline Guest Mode
          </button>
        </div>
      </div>
    </div>
  );
}
