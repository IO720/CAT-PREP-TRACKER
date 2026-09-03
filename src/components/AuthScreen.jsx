import React, { useState, useEffect } from 'react';
import { logInUser, signUpUser, signInWithGoogle } from '../utils/firebase';
import { Icons } from './AspirantIcons';
import DitherBackground from './DitherBackground';
import SmoothCaretInput from './animations/SmoothCaretInput';

// Official CATalyze Vector Logo
function BrandLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#authBrandGradA)" stroke="var(--accent-color, #38bdf8)" strokeWidth="1.2" strokeOpacity="0.4" />
      <path 
        d="M23 10.5C20.8 8.2 17.8 7 14.5 7.5C10.2 8.2 7.2 12 7.5 16.2C7.8 20.8 11.5 24.5 16 24.5C19.5 24.5 22.2 22.8 24 20" 
        stroke="url(#authBrandArcGrad)" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />
      <path 
        d="M16 8L24.5 12L19.5 13.5L23.5 18L17.5 14.5L20 12.5L16 8Z" 
        fill="url(#authBrandSparkGrad)" 
      />
      <circle cx="14.5" cy="16" r="1.6" fill="#ffffff" />
      <circle cx="14.5" cy="16" r="3.2" stroke="var(--accent-color, #38bdf8)" strokeWidth="0.8" opacity="0.8" />
      <defs>
        <linearGradient id="authBrandGradA" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#080d1a" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="authBrandArcGrad" x1="7" y1="7" x2="25" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="authBrandSparkGrad" x1="16" y1="8" x2="24" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Minimal, Smoothly Animated Zen Scholar Mascot
function SmoothZenMascot({ isPatted, onHeadpat }) {
  return (
    <div 
      className={`auth-zen-mascot-badge ${isPatted ? 'is-happy' : ''}`}
      onClick={onHeadpat}
      title="Zen Study Sprite — click to pat!"
    >
      <div className="mascot-soft-glow" />

      {/* Floating vector hearts/sparkles when patted */}
      {isPatted && (
        <div className="mascot-pat-burst" aria-hidden="true">
          <svg className="burst-spark burst-s1" viewBox="0 0 24 24" width="13" height="13">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#f43f5e" />
          </svg>
          <svg className="burst-spark burst-s2" viewBox="0 0 24 24" width="11" height="11">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#38bdf8" />
          </svg>
          <svg className="burst-spark burst-s3" viewBox="0 0 24 24" width="12" height="12">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ec4899" />
          </svg>
        </div>
      )}
      <svg 
        viewBox="18 10 76 56" 
        className="auth-mascot-svg" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="zenBodyGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          <linearGradient id="zenEarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Tail with fluid sway */}
        <path 
          d="M70 60 Q84 48 82 34 Q85 26 89 31 Q92 39 87 50 Q82 58 74 62 Z" 
          fill="url(#zenBodyGrad)" 
          className="mascot-tail" 
        />

        {/* Head with gentle breathing */}
        <g className="mascot-head">
          <path 
            d="M 50,66 C 26,66 26,42 30,28 L 32,12 L 42,22 Q 50,19 58,22 L 68,12 L 70,28 C 74,42 74,66 50,66 Z" 
            fill="url(#zenBodyGrad)" 
          />

          {/* Ears with micro-twitch */}
          <polygon points="34,26 33,16 41,23" fill="url(#zenEarGrad)" opacity="0.85" className="mascot-ear-l" />
          <polygon points="66,26 67,16 59,23" fill="url(#zenEarGrad)" opacity="0.85" className="mascot-ear-r" />

          {/* Scholar Glasses */}
          <g className="mascot-spectacles">
            <circle cx="41" cy="42" r="7.5" fill="rgba(8, 12, 22, 0.8)" stroke="#ffffff" strokeWidth="1.3" />
            <circle cx="59" cy="42" r="7.5" fill="rgba(8, 12, 22, 0.8)" stroke="#ffffff" strokeWidth="1.3" />
            <path d="M48.5 42 Q50 40.5 51.5 42" stroke="#ffffff" strokeWidth="1.3" fill="none" />

            {/* Smoothly Cross-fading Eyes */}
            <g 
              fill="#38bdf8" 
              className="mascot-pupils" 
              style={{ 
                opacity: isPatted ? 0 : 1, 
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none'
              }}
            >
              <circle cx="41" cy="42" r="2.5" />
              <circle cx="59" cy="42" r="2.5" />
              <circle cx="42.2" cy="40.8" r="0.9" fill="#ffffff" />
              <circle cx="60.2" cy="40.8" r="0.9" fill="#ffffff" />
            </g>
            <g 
              stroke="#38bdf8" 
              strokeWidth="2" 
              strokeLinecap="round" 
              fill="none"
              style={{ 
                opacity: isPatted ? 1 : 0, 
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none'
              }}
            >
              <path d="M37.5 43.5 Q41 39.5 44.5 43.5" />
              <path d="M55.5 43.5 Q59 39.5 62.5 43.5" />
            </g>
          </g>

          {/* Nose & Whiskers */}
          <path d="M48.5 48.5 L51.5 48.5 L50 50.5 Z" fill="#f472b6" />
          <line x1="34" y1="49" x2="26" y2="47.5" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="34" y1="51" x2="25" y2="52" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="66" y1="49" x2="74" y2="47.5" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="66" y1="51" x2="75" y2="52" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" strokeLinecap="round" />

          {/* Smoothly Cross-fading Blushing Cheeks */}
          <g 
            style={{ 
              opacity: isPatted ? 1 : 0, 
              transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none'
            }}
          >
            <ellipse cx="33" cy="46" rx="3.5" ry="2" fill="#f43f5e" opacity="0.85" />
            <ellipse cx="67" cy="46" rx="3.5" ry="2" fill="#f43f5e" opacity="0.85" />
          </g>
        </g>

        {/* Front paws resting */}
        <g>
          <ellipse cx="38" cy="62" rx="6" ry="4" fill="url(#zenBodyGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
          <ellipse cx="62" cy="62" rx="6" ry="4" fill="url(#zenBodyGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}

// Skiper103 Bouncy Accordion Feature Card Component
function Skiper103FeatureAccordion() {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const features = [
    {
      id: 'quant-matrix',
      title: 'Quantitative & Error Log Matrix',
      summary: 'Topic mastery analytics with isolated error logging',
      desc: 'Systematically tracks Arithmetic, Algebra, and Geometry practice accuracy with isolated error logging to identify revision areas.',
      tag: 'Topic Accuracy',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      id: 'study-lounge',
      title: 'Live Aspirant Study Lounge',
      summary: 'Synchronized Pomodoro focus with peer accountability',
      desc: 'Join real-time focus rooms with fellow CAT aspirants. 25-minute structured sprints keep you disciplined and eliminate procrastination.',
      tag: 'Study Lounge',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'stamp-rally',
      title: 'Cat Hanko Stamp Rally',
      summary: 'Gamified Japanese ink seals for daily quota streaks',
      desc: 'Earn traditional Japanese Hanko seals upon completing your daily study quotas, unlocking progression milestones and secret bonuses.',
      tag: 'Daily Quota',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      )
    },
    {
      id: 'offline-sync',
      title: 'Offline-First Cloud Sync',
      summary: 'Zero-latency local storage with background sync',
      desc: 'Log study sessions anywhere without worrying about internet drops. All drills sync seamlessly to your account when connected.',
      tag: 'Offline-First',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" />
          <path d="m16.2 7.8 2.9-2.9" />
          <path d="M18 12h4" />
          <path d="m16.2 16.2 2.9 2.9" />
          <path d="M12 18v4" />
          <path d="m4.9 19.1 2.9-2.9" />
          <path d="M2 12h4" />
          <path d="m4.9 4.9 2.9 2.9" />
        </svg>
      )
    }
  ];

  return (
    <div className="skiper103-accordion-wrapper">
      {features.map((feat, index) => {
        const isOpen = expandedIndex === index;
        return (
          <div 
            key={feat.id} 
            className={`skiper103-item ${isOpen ? 'is-expanded' : ''}`}
            onClick={() => setExpandedIndex(isOpen ? -1 : index)}
          >
            <div className="skiper103-trigger">
              <div className="skiper103-icon-box">
                {feat.icon}
              </div>
              <div className="skiper103-title-box">
                <span className="skiper103-title">{feat.title}</span>
                <span className="skiper103-summary">{feat.summary}</span>
              </div>
              <div className="skiper103-chevron">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="skiper103-expand-wrapper">
              <div className="skiper103-content-inner">
                <p className="skiper103-desc">{feat.desc}</p>
                <div className="skiper103-meta-tag">
                  <span className="skiper103-dot" />
                  <span>{feat.tag}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AuthScreen({ onAuthSuccess, onContinueAsGuest }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState('CAT 2025');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isMascotHappy, setIsMascotHappy] = useState(false);
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'success-exit' | 'error-return'
  const [transitionMessage, setTransitionMessage] = useState('');

  // Condition statement: Has user visited the site before?
  const [hasVisitedBefore, setHasVisitedBefore] = useState(() => {
    try {
      return !!(
        localStorage.getItem('cat_prep_visited_before') ||
        localStorage.getItem('cat_guest_mode') ||
        localStorage.getItem('cat_tracker_data') ||
        localStorage.getItem('aspirant_profile')
      );
    } catch {
      return false;
    }
  });

  const handleHeadpat = () => {
    setIsMascotHappy(true);
    setTimeout(() => {
      setIsMascotHappy(false);
    }, 2200);
  };

  const markVisited = () => {
    try {
      localStorage.setItem('cat_prep_visited_before', 'true');
    } catch (e) {
      console.warn("Could not write visited flag:", e);
    }
  };

  const handleContinueGuest = () => {
    markVisited();
    if (onContinueAsGuest) onContinueAsGuest();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }
    if (isSignUp && !displayName.trim()) {
      setAuthError('Please enter your full name.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }

    setLoading(true);
    try {
      let u;
      if (isSignUp) {
        u = await signUpUser(email, password, displayName, targetExam);
      } else {
        u = await logInUser(email, password);
      }

      if (!u) {
        throw new Error('Authentication process did not return an active session.');
      }

      markVisited();
      if (onAuthSuccess) onAuthSuccess(u);
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
      
      // Cancel/Error return animation to bring form back into view smoothly
      setAuthError(msg);
      setTransitionState('error-return');
      setTimeout(() => {
        setTransitionState('idle');
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setGoogleLoading(true);
    try {
      const u = await signInWithGoogle();
      if (!u) {
        throw new Error('Sign-in cancelled.');
      }
      markVisited();
      if (onAuthSuccess) onAuthSuccess(u);
    } catch (err) {
      console.error("Google Auth error:", err);
      // Cancel/Error return animation back to sign up screen
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);

      if (!err.message?.includes('popup-closed-by-user')) {
        if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
          setAuthError("Google Sign-In is disabled in Firebase Console. You can sign in with Email & Password or Continue as Guest.");
        } else {
          setAuthError(err.message || 'Google sign-in failed. Please try again.');
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Dynamic Title: "Welcome back!" ONLY if returning user; otherwise "Welcome to CATalyze" / "Create your account"
  const formHeading = isSignUp
    ? 'Create your account'
    : hasVisitedBefore
    ? 'Welcome back!'
    : 'Welcome to CATalyze';

  const formSubheading = isSignUp
    ? 'Initialize your personal preparation tracker with cloud sync.'
    : hasVisitedBefore
    ? 'Resume your preparation drills and mock analytics.'
    : 'The high-precision preparation operating system for CAT & OMETs aspirants.';

  return (
    <div className={`skiper-auth-root ${transitionState === 'success-exit' ? 'is-exiting' : ''} ${transitionState === 'error-return' ? 'is-returning' : ''}`}>
      {/* ReactBits High-Performance WebGL Dither Wave Background */}
      <div className="auth-dither-backdrop" aria-hidden="true">
        <DitherBackground 
          activeTheme="dark" 
          opacity={0.32} 
          ditherSize={2.4} 
          waveSpeed={0.22} 
        />
      </div>

      {/* Heavy Frosted Glass & Ambient Darkening Veil for High Readability */}
      <div className="auth-bg-veil" aria-hidden="true" />

      {/* Main Split Layout Container with Smooth Exit & Return Transitions */}
      <div className={`skiper-split-card ${transitionState === 'success-exit' ? 'split-card-exit' : ''} ${transitionState === 'error-return' ? 'split-card-return' : ''}`}>
        
        {/* ========================================================
            LEFT COLUMN: Minimal Form with Site Fonts & Official Logo
            ======================================================== */}
        <div className="skiper-form-column">
          
          {/* Brand Row */}
          <div className="skiper-brand-header">
            <BrandLogo size={32} />
            <div className="skiper-brand-meta">
              <span className="skiper-brand-title">CATalyze</span>
              <span className="skiper-version-pill">v1.08</span>
            </div>
          </div>

          {/* Site Signature Kinetic Typography - Clean, Minimal & Grounded */}
          <div className="auth-signature-title-group">
            <div className="spylt-subtag auth-subtag-pill">
              <span className="subtag-dot" />
              <span>CAT & OMETS PREPARATION</span>
            </div>

            <div className="spylt-title-wrapper auth-kinetic-heading">
              {isSignUp ? (
                <>
                  <span className="spylt-word word-bold">START</span>
                  <span className="spylt-word word-italic">your prep.</span>
                </>
              ) : hasVisitedBefore ? (
                <>
                  <span className="spylt-word word-bold">WELCOME</span>
                  <span className="spylt-word word-italic">back.</span>
                </>
              ) : (
                <>
                  <span className="spylt-word word-bold">DAILY</span>
                  <span className="spylt-word word-italic">focus.</span>
                </>
              )}
            </div>

            <p className="auth-minimal-subtext">
              {isSignUp
                ? 'Systematic practice logging, error patterns, and focused study routines.'
                : hasVisitedBefore
                ? 'Resume your study drills, revision queues, and practice sessions.'
                : 'Track daily practice, log mistakes, and build consistency.'}
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="skiper-error-banner">
              <Icons.AlertCircle size={15} />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form className="skiper-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="skiper-input-group">
                <label className="skiper-label">Full Name</label>
                <SmoothCaretInput
                  type="text"
                  placeholder="Sunny Pathak"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                />
              </div>
            )}

            <div className="skiper-input-group">
              <label className="skiper-label">Email</label>
              <SmoothCaretInput
                type="email"
                placeholder="youremail@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || googleLoading}
                required
              />
            </div>

            <div className="skiper-input-group">
              <label className="skiper-label">Password</label>
              <div className="skiper-pwd-container">
                <SmoothCaretInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                >
                  <button
                    type="button"
                    className="skiper-pwd-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}
                  </button>
                </SmoothCaretInput>
              </div>
            </div>

            {isSignUp && (
              <div className="skiper-input-group">
                <label className="skiper-label">Target Examination</label>
                <select
                  className="skiper-select"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  disabled={loading || googleLoading}
                >
                  <option value="CAT 2025">CAT 2025</option>
                  <option value="CAT 2026">CAT 2026</option>
                  <option value="XAT 2026">XAT 2026</option>
                  <option value="SNAP / NMAT 2025">SNAP / NMAT 2025</option>
                  <option value="All MBA Entrances">All MBA Entrances</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="skiper-submit-btn"
              disabled={loading || googleLoading}
            >
              <div className="skiper-btn-bottom-glow" />
              {loading ? (
                <span className="skiper-loading-spinner" />
              ) : isSignUp ? (
                <span>Create Account</span>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="skiper-divider-row">
            <span className="skiper-divider-line" />
            <span className="skiper-divider-text">or</span>
            <span className="skiper-divider-line" />
          </div>

          {/* Google OAuth Button */}
          <div className="skiper-social-wrap">
            <button
              type="button"
              className="skiper-google-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              title="Continue with Google"
            >
              {googleLoading ? (
                <span className="skiper-loading-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Switch Row */}
          <div className="skiper-switch-container">
            {isSignUp ? (
              <p className="skiper-switch-p">
                Already have an account?{' '}
                <button
                  type="button"
                  className="skiper-switch-link"
                  onClick={() => {
                    setIsSignUp(false);
                    setAuthError('');
                  }}
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="skiper-switch-p">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="skiper-switch-link"
                  onClick={() => {
                    setIsSignUp(true);
                    setAuthError('');
                  }}
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          {/* Continue as Offline Guest Link */}
          {onContinueAsGuest && (
            <div className="skiper-guest-wrap">
              <button
                type="button"
                className="skiper-guest-link"
                onClick={handleContinueGuest}
              >
                <span>Continue as Offline Guest</span>
                <Icons.ChevronRight size={13} />
              </button>
            </div>
          )}

        </div>

        {/* ========================================================
            RIGHT COLUMN: Skiper-UI (skiper103) Minimalist Feature Card
            With Smooth Animated Zen Mascot
            ======================================================== */}
        <div className="skiper-feature-column">
          
          {/* Clean Mascot Header (No Quotes) */}
          <div className="skiper-mascot-header">
            <SmoothZenMascot 
              isPatted={isMascotHappy} 
              onHeadpat={handleHeadpat} 
            />
            <div className="skiper-mascot-text">
              <div className="mascot-title-row">
                <span className="mascot-name-label">Zen Study Sprite</span>
                <span className="mascot-interactive-hint">click to pat</span>
              </div>
              <span className="mascot-role-desc">Personal CAT & OMETs Preparation Companion</span>
            </div>
          </div>

          {/* Skiper103 Bouncy Expandable Accordion */}
          <div className="skiper-accordion-container">
            <div className="accordion-section-header">
              <span className="accordion-label">Core Preparation Features</span>
              <span className="accordion-sub">click to expand</span>
            </div>
            <Skiper103FeatureAccordion />
          </div>

          {/* Clean Minimal Security & Sync Badge Footer (No Quotes) */}
          <div className="skiper-feature-footer">
            <div className="skiper-footer-badge">
              <Icons.Shield size={13} />
              <span>Offline-First • Local & Cloud Auto-Sync</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
