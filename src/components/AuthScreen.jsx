import React, { useState } from 'react';
import { logInUser, signUpUser, signInWithGoogle } from '../utils/firebase';
import { Icons } from './AspirantIcons';

export default function AuthScreen({ onAuthSuccess, onContinueAsGuest }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState('CAT 2025 (99.5+%ile • IIM-A Focus)');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    if (isSignUp && !displayName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const u = await signUpUser(email, password, displayName, targetExam);
        if (onAuthSuccess) onAuthSuccess(u);
      } else {
        const u = await logInUser(email, password);
        if (onAuthSuccess) onAuthSuccess(u);
      }
    } catch (err) {
      console.error("Auth error:", err);
      let msg = err.message || 'Authentication failed. Please try again.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setGoogleLoading(true);
    try {
      const u = await signInWithGoogle();
      if (onAuthSuccess) onAuthSuccess(u);
    } catch (err) {
      console.error("Google Auth error:", err);
      if (!err.message?.includes('popup-closed-by-user')) {
        setAuthError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen-container fade-in">
      
      {/* Background Ambient Glows */}
      <div className="auth-ambient-glow glow-top-left" />
      <div className="auth-ambient-glow glow-bottom-right" />

      <div className="auth-card-wrapper animate-slide-up">
        
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-logo-badge">
            <span className="auth-logo-symbol">A</span>
          </div>
          <h1 className="auth-app-title">CATalyze</h1>
          <p className="auth-app-tagline">
            Core Preparation Operating System for CAT & OMETs Aspirants
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="auth-tabs-bar">
          <button
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setAuthError('');
            }}
          >
            <Icons.LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setAuthError('');
            }}
          >
            <Icons.UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>

        {/* 1-Click Google Sign In Button */}
        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <span className="btn-spinner" />
          ) : (
            <svg className="google-svg-logo" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="auth-or-divider">
          <div className="divider-line" />
          <span className="divider-text">OR WITH EMAIL</span>
          <div className="divider-line" />
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="auth-error-banner animate-slide-up">
            <Icons.AlertCircle size={15} />
            <span>{authError}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="auth-input-group animate-fade-in">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <Icons.User size={15} className="auth-field-icon" />
                <input
                  type="text"
                  className="auth-text-input"
                  placeholder="e.g. Sunny Pathak"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Icons.Mail size={15} className="auth-field-icon" />
              <input
                type="email"
                className="auth-text-input"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || googleLoading}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Icons.Lock size={15} className="auth-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-text-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || googleLoading}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="auth-input-group animate-fade-in">
              <label className="auth-label">Target Examination</label>
              <div className="auth-input-wrapper">
                <Icons.Target size={15} className="auth-field-icon" />
                <select
                  className="auth-select-input"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  disabled={loading || googleLoading}
                >
                  <option value="CAT 2025 (99.5+%ile • IIM-A Focus)">CAT 2025 (99.5+%ile • IIM-A Focus)</option>
                  <option value="CAT 2026 (Early Foundation Focus)">CAT 2026 (Early Foundation Focus)</option>
                  <option value="XAT 2026 (XLRI BM/HRM Focus)">XAT 2026 (XLRI BM/HRM Focus)</option>
                  <option value="SNAP / NMAT 2025 (Speed Sprint)">SNAP / NMAT 2025 (Speed Sprint)</option>
                  <option value="All MBA Entrances 2025-26">All MBA Entrances 2025-26</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : isSignUp ? (
              <>
                <Icons.UserPlus size={16} />
                <span>Create Preparation Account</span>
              </>
            ) : (
              <>
                <Icons.LogIn size={16} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / Guest Mode */}
        {onContinueAsGuest && (
          <div className="auth-footer-options">
            <button
              type="button"
              className="auth-guest-link"
              onClick={onContinueAsGuest}
            >
              <span>Continue as Offline Guest</span>
              <Icons.ChevronRight size={13} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
