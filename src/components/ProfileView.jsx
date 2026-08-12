import React, { useState } from 'react';
import { signUpUser, logInUser, logOutUser, addFriendByEmail, isFirebaseConfigured } from '../utils/firebase';

export default function ProfileView({ 
  user, 
  onAuthSuccess, 
  friends = [], 
  onAddFriendSuccess, 
  onInspectFriend,
  startDate = "",
  onUpdateStartDate,
  onExport,
  onImport,
  onReset,
  onTriggerNotification,
  fileInputRef
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const u = await signUpUser(email, password, displayName);
        onAuthSuccess(u);
      } else {
        const u = await logInUser(email, password);
        onAuthSuccess(u);
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setAuthError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setFriendError('');
    setFriendSuccess('');
    setLoading(true);

    try {
      const friendData = await addFriendByEmail(user.uid, friendEmail);
      setFriendSuccess(`Successfully added friend: ${friendData.displayName}!`);
      setFriendEmail('');
      if (onAddFriendSuccess) {
        onAddFriendSuccess();
      }
    } catch (err) {
      setFriendError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOutUser();
      onAuthSuccess(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Render Firebase Warning banner if keys are placeholder
  if (!isFirebaseConfigured) {
    return (
      <div>
        <div className="header-row">
          <div>
            <h1 className="page-title">Cloud Account</h1>
            <p className="page-subtitle">Configure Firebase to enable real-time friend syncing.</p>
          </div>
        </div>

        <div className="dashboard-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#818cf8' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 4 16.25"></path>
            </svg>
          </div>
          <h2 className="panel-title" style={{ fontSize: '18px', marginBottom: '12px' }}>Firebase Configuration Required</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
            To enable real-time tracking with friends, you need to link a free-tier Firebase account. We've created a step-by-step config guide for you!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <a 
              href="file:///C:/Users/sesmi/.gemini/antigravity-ide/brain/6be6e737-632d-4a6f-9a97-2d19758e7733/firebase_setup_guide.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Open Setup Guide
            </a>
          </div>
          <div style={{ marginTop: '30px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Once set up, paste your config values into <code>src/utils/firebase.js</code>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">Cloud Account</h1>
          <p className="page-subtitle">Synchronize your timeline database and coordinate with study peers.</p>
        </div>
      </div>

      {user ? (
        /* Logged In account dashboard */
        <div className="dashboard-details-row">
          {/* User Profile Summary */}
          <div className="dashboard-panel">
            <h2 className="panel-title">Your Account Profile</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="friend-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{user.displayName || user.email.split('@')[0]}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>User Cloud ID:</span>
                <code style={{ fontSize: '11px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{user.uid}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cloud Sync Status:</span>
                <span style={{ color: '#00cc66', fontWeight: 600 }}>Active</span>
              </div>
            </div>

            {/* Preparation Schedule Start Date Setting */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '20px' }}>
              <label className="filter-label" htmlFor="start-date-input" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Preparation Schedule Start Date</span>
              </label>
              <input
                id="start-date-input"
                type="date"
                className="filter-input"
                style={{ width: '100%', padding: '8px' }}
                value={startDate || ""}
                onChange={(e) => onUpdateStartDate && onUpdateStartDate(e.target.value)}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                This aligns Month 1 Week 1 to your actual calendar start date and highlights TODAY's drills automatically.
              </p>
            </div>

            <button className="btn-secondary" style={{ color: '#ff4444', borderColor: '#ff444433', width: '100%' }} onClick={handleLogOut}>
              Sign Out Account
            </button>
          </div>

          {/* Manage Friends panel */}
          <div className="dashboard-panel">
            <h2 className="panel-title">Coordinate with Peers</h2>
            
            <form onSubmit={handleAddFriend} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div className="filter-group" style={{ width: '100%' }}>
                <label className="filter-label" htmlFor="friend-email-input">Add Friend by Email</label>
                <input
                  id="friend-email-input"
                  type="email"
                  className="filter-input"
                  style={{ width: '100%', marginTop: '6px' }}
                  placeholder="e.g. peer.aspirant@gmail.com"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? "Adding..." : "Add Friend"}
              </button>
            </form>

            {friendError && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '6px' }}>{friendError}</p>}
            {friendSuccess && <p style={{ color: '#00cc66', fontSize: '12px', marginTop: '6px' }}>{friendSuccess}</p>}

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
              <span className="filter-label">Linked Peer Tracker Connections ({friends.length})</span>
              {friends.length > 0 ? (
                <div className="friend-feed-list" style={{ marginTop: '10px' }}>
                  {friends.map(f => (
                    <div 
                      key={f.id} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', cursor: 'pointer' }}
                      onClick={() => onInspectFriend && onInspectFriend(f)}
                      title="Click to inspect peer study progress details"
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{f.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        <span>{f.streak} streak</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                  No friends added yet. Add peers to see their scores and streak dashboard live.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Logged Out login / register cards */
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, padding: '40px 0' }}>
          <div className="dashboard-panel" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 className="panel-title" style={{ textAlign: 'center', marginBottom: '24px' }}>
              {isSignUp ? "Create Tracker Account" : "Access Cloud Tracker"}
            </h2>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isSignUp && (
                <div className="filter-group" style={{ width: '100%' }}>
                  <label className="filter-label" htmlFor="dispname-input">Aspirant Username</label>
                  <input
                    id="dispname-input"
                    type="text"
                    className="filter-input"
                    style={{ width: '100%', marginTop: '4px' }}
                    placeholder="e.g. Rahul S."
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="filter-group" style={{ width: '100%' }}>
                <label className="filter-label" htmlFor="email-input">Email Address</label>
                <input
                  id="email-input"
                  type="email"
                  className="filter-input"
                  style={{ width: '100%', marginTop: '4px' }}
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="filter-group" style={{ width: '100%' }}>
                <label className="filter-label" htmlFor="pwd-input">Secure Password</label>
                <input
                  id="pwd-input"
                  type="password"
                  className="filter-input"
                  style={{ width: '100%', marginTop: '4px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
              </button>
            </form>

            {authError && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}>{authError}</p>}

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isSignUp ? "Already have an account? " : "New to cloud tracker? "}
              </span>
              <button 
                className="nav-link" 
                style={{ display: 'inline', padding: 0, textDecoration: 'underline', color: 'var(--text-primary)', fontWeight: 'bold' }}
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                }}
              >
                {isSignUp ? "Log In here" : "Register account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Workspace Data & Backup Space */}
      <div className="dashboard-panel" style={{ marginTop: '24px' }}>
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Workspace Data & Local Maintenance</span>
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Manage your offline backup files, trigger notification reminders, or reset your workspace state.
        </p>

        <div className="data-maintenance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Backup & Import Card */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <span>JSON Data Backup</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '14px' }}>Export your complete drill logs, error notes, and mock test scores to a JSON backup file.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onExport}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Export Backup</span>
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onImport}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Import Backup</span>
              </button>
            </div>
          </div>

          {/* Reminders & Notifications */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span>Push Notifications</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '14px' }}>Test your system push notification permissions for evening study reminders.</p>
            <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onTriggerNotification}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Trigger Test Reminder</span>
            </button>
          </div>

          {/* Danger Zone / Reset */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid #ff444433', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#ff4444', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Danger Zone</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '14px' }}>Reset all progress, drills, notes, and mock scores back to factory initial state.</p>
            <button className="btn-secondary" style={{ width: '100%', color: '#ff4444', borderColor: '#ff444444', fontSize: '12px', padding: '8px' }} onClick={onReset}>
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
