import React, { useState } from 'react';
import { signUpUser, logInUser, logOutUser, addFriendByEmail, isFirebaseConfigured } from '../utils/firebase';
import { APP_VERSION, checkForAppUpdate, applyInstantUpdate } from '../utils/versionCheck';

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
  fileInputRef,
  setActiveTab
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  
  const [updateStatus, setUpdateStatus] = useState('');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  
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
      if (!user) {
        setFriendError("Please sign in to add friends.");
        return;
      }
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

  return (
    <div className="profile-view-container">
      {/* View Header */}
      <div className="header-row">
        <div>
          <h1 className="page-title">More & Account Settings</h1>
          <p className="page-subtitle">
            Manage your cloud profile, review the full 6-month study plan, error logs, and data backups.
          </p>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      {setActiveTab && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setActiveTab('timeline')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '20px' }}>📖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>6-Month Plan</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>View syllabus phases</div>
            </div>
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setActiveTab('errors')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '20px' }}>📝</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Error Log</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Review formulas & mistakes</div>
            </div>
          </button>
        </div>
      )}

      {!isFirebaseConfigured && (
        <div className="firebase-notice-banner" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>☁️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Offline Local Mode Active</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All data is saved locally in your device storage. Link Firebase for multi-device cloud backup.</div>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => alert("All data is automatically saved locally on your device!")}>
            Local Mode Info
          </button>
        </div>
      )}

      <div className="dashboard-details-row">
        {/* Account & Sync Section */}
        <div className="dashboard-panel">
          <h2 className="panel-title">Cloud Account Status</h2>

          {user ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div className="friend-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                  {user.email ? user.email.charAt(0).toUpperCase() : (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{user.displayName || (user.email ? user.email.split('@')[0] : 'Aspirant User')}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.email || 'Cloud Account Linked'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Account ID:</span>
                  <code style={{ fontSize: '11px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{user.uid || 'Local-Device-ID'}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cloud Backup:</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>Active</span>
                </div>
              </div>

              <button className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', width: '100%' }} onClick={handleLogOut}>
                Sign Out Account
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {isSignUp ? 'Create a free cloud account to auto-sync across mobile and desktop.' : 'Sign in to access your cloud backup.'}
              </p>

              {authError && <div className="auth-error-badge" style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>{authError}</div>}

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isSignUp && (
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                )}
                <input
                  type="email"
                  className="filter-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="filter-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
                  {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}
                onClick={() => setIsSignUp(prev => !prev)}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
              </button>
            </div>
          )}

          {/* Schedule Start Date Setting */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '24px' }}>
            <label className="filter-label" htmlFor="start-date-input" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Prep Schedule Start Date</span>
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
              Aligns Month 1 Week 1 to your calendar start date and syncs TODAY's drills.
            </p>
          </div>

          {/* App Version & Over-The-Air Updates Setting */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>📱</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>App Version</span>
              </div>
              <span className="badge-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>v{APP_VERSION} (Live OTA)</span>
            </div>
            
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
              Updates are synced live over the air without needing to download a new APK file.
            </p>

            {updateStatus && (
              <div style={{ fontSize: '12px', color: updateStatus.includes('New') ? 'var(--accent-color)' : '#22c55e', fontWeight: 600, marginBottom: '10px' }}>
                {updateStatus}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-secondary"
                style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                disabled={checkingUpdate}
                onClick={async () => {
                  setCheckingUpdate(true);
                  setUpdateStatus('Checking for updates...');
                  const update = await checkForAppUpdate();
                  setCheckingUpdate(false);
                  if (update) {
                    setUpdateStatus(`New version v${update.version} found! Tap to apply.`);
                    applyInstantUpdate(update.version);
                  } else {
                    setUpdateStatus('You are on the latest live version!');
                  }
                }}
              >
                {checkingUpdate ? 'Checking...' : 'Check Updates'}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '8px' }}
                title="Force clear cache and reload live assets"
                onClick={() => applyInstantUpdate(APP_VERSION)}
              >
                ↻ Force Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Data Backup & Peer Sync Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Data Maintenance & Backup */}
          <div className="dashboard-panel">
            <h2 className="panel-title">Data Backup & Export</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Export your entire study history as a JSON backup or restore past checkpoints.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <button className="btn-secondary" onClick={onExport} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Export Backup</span>
              </button>

              <button className="btn-secondary" onClick={onImport} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Import Backup</span>
              </button>
            </div>

            <button className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', width: '100%', fontSize: '12px' }} onClick={onReset}>
              Reset All Progress Data
            </button>
          </div>

          {/* Peer Sync Feed */}
          <div className="dashboard-panel">
            <h2 className="panel-title">Study Peers & Friends</h2>
            
            <form onSubmit={handleAddFriend} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <input
                type="email"
                className="filter-input"
                placeholder="Add Peer by Email..."
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
              <button type="submit" className="btn-secondary" disabled={loading}>
                + Add Study Peer
              </button>
            </form>

            {friendError && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '10px' }}>{friendError}</div>}
            {friendSuccess && <div style={{ color: '#22c55e', fontSize: '12px', marginBottom: '10px' }}>{friendSuccess}</div>}

            <div className="friend-feed-list">
              {friends.map(friend => (
                <div 
                  key={friend.id} 
                  className="friend-feed-item"
                  onClick={() => onInspectFriend && onInspectFriend(friend)}
                  title="Inspect peer progress"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="friend-avatar">{friend.avatar}</div>
                  <div className="friend-info">
                    <div className="friend-name-row">
                      <span className="friend-name">{friend.name}</span>
                      <span className="friend-time">{friend.lastActive}</span>
                    </div>
                    <div className="friend-message">{friend.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
