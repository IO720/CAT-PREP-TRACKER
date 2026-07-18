import React, { useState } from 'react';
import { signUpUser, logInUser, logOutUser, addFriendByEmail, isFirebaseConfigured } from '../utils/firebase';

export default function ProfileView({ user, onAuthSuccess, friends = [], onAddFriendSuccess, onInspectFriend }) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>☁️</div>
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
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>⚡ {f.streak} streak</span>
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
    </div>
  );
}
