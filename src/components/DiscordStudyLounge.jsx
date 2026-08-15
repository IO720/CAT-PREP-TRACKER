import React, { useState } from 'react';

export default function DiscordStudyLounge({
  friends = [],
  onInspectFriend,
  currentUser = null,
  timerState = null,
  compact = false
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Format seconds to mm:ss for live timer
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Build current user activity if timer is running or active
  const isUserStudying = timerState && (timerState.isRunning || timerState.isPaused);
  const userActivity = isUserStudying ? {
    isSelf: true,
    id: 'self',
    name: currentUser?.displayName || 'You',
    avatar: (currentUser?.displayName ? currentUser.displayName[0] : 'Y').toUpperCase(),
    avatarBg: 'var(--accent-color)',
    status: timerState.isRunning ? 'studying' : 'idle',
    target: 'CAT 2025 Aspirant',
    streak: 5,
    activity: {
      type: 'TIMER',
      subject: timerState.subject || 'Quant',
      title: `${timerState.subject} Focus Session`,
      taskDetails: timerState.sessionNotes || `${timerState.mode === 'stopwatch' ? 'Stopwatch Timer' : `${Math.round(timerState.totalSeconds / 60)}m Pomodoro Session`}`,
      timerText: `${formatTime(timerState.secondsLeft)} remaining`,
      isRunning: timerState.isRunning
    }
  } : null;

  // Filter friends based on search query
  const filteredFriends = friends.filter(f => 
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.activity?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.activity?.taskDetails?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.activity?.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group real study peers by status
  const studyingPeers = filteredFriends.filter(f => f.status === 'studying' || f.activity?.isRunning);
  const onlinePeers = filteredFriends.filter(f => f.status === 'online' && !f.activity?.isRunning);
  const offlinePeers = filteredFriends.filter(f => f.status === 'offline');

  const totalStudying = (userActivity ? 1 : 0) + studyingPeers.length;
  const totalOnline = (userActivity && !isUserStudying ? 1 : 0) + onlinePeers.length + studyingPeers.length;

  return (
    <div className={`peer-lounge-container ${compact ? 'compact-lounge' : ''}`}>
      {/* Lounge Top Bar */}
      <div className="peer-lounge-header">
        <div className="lounge-header-left">
          <div className="lounge-icon-bubble">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <h3 className="peer-lounge-title">Live Peer Study Lounge</h3>
            <div className="peer-lounge-subtitle">
              <span className="live-pulse-dot"></span>
              <span>{totalStudying} Studying Now • {totalOnline} Active Peers</span>
            </div>
          </div>
        </div>

        {/* Search Peers Input */}
        <div className="peer-search-container">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search study peers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="peer-search-input"
          />
        </div>
      </div>

      <div className="peer-lounge-body">
        {/* ========================================================
            SECTION 1: ACTIVELY STUDYING PEERS (Rich Profile Cards)
           ======================================================== */}
        <div className="lounge-category-section">
          <div className="category-section-title">
            <span>🔥 ACTIVELY STUDYING — {totalStudying}</span>
          </div>

          <div className="peer-cards-grid">
            {/* User's own live card if studying */}
            {userActivity && (
              <div className="peer-profile-card self-profile-card">
                <div className="peer-card-top-row">
                  <div className="peer-avatar-wrapper">
                    <div className="peer-avatar self-avatar">{userActivity.avatar}</div>
                    <span className="peer-status-indicator studying"></span>
                  </div>
                  <div className="peer-identity-meta">
                    <div className="peer-name-row">
                      <span className="peer-fullname">{userActivity.name}</span>
                      <span className="peer-tag you-tag">YOU</span>
                      <span className="peer-streak-badge">🔥 {userActivity.streak}d Streak</span>
                    </div>
                    <span className="peer-status-sub">In Focus Session right now</span>
                  </div>
                </div>

                <div className="peer-current-task-box">
                  <div className="task-header-row">
                    <span className={`subject-badge badge-${userActivity.activity.subject?.toLowerCase()}`}>
                      {userActivity.activity.subject || 'QUANT'}
                    </span>
                    <span className="task-timer-chip live">
                      <span className="chip-timer-icon">⏱️</span>
                      <span>{userActivity.activity.timerText}</span>
                    </span>
                  </div>
                  <div className="task-main-title">{userActivity.activity.title}</div>
                  <div className="task-details-text">{userActivity.activity.taskDetails}</div>
                </div>
              </div>
            )}

            {/* Other peers actively in session */}
            {studyingPeers.map(peer => (
              <div 
                key={peer.id} 
                className="peer-profile-card studying-card clickable"
                onClick={() => onInspectFriend && onInspectFriend(peer)}
                title="Click to view full tracker & stats"
              >
                <div className="peer-card-top-row">
                  <div className="peer-avatar-wrapper">
                    <div className="peer-avatar" style={{ backgroundColor: peer.avatarBg || 'var(--bg-tertiary)' }}>
                      {peer.avatar || peer.name[0]}
                    </div>
                    <span className="peer-status-indicator studying"></span>
                  </div>
                  <div className="peer-identity-meta">
                    <div className="peer-name-row">
                      <span className="peer-fullname">{peer.name}</span>
                      {peer.streak >= 3 && (
                        <span className="peer-streak-badge">🔥 {peer.streak}d Streak</span>
                      )}
                    </div>
                    <span className="peer-status-sub">{peer.target || 'CAT Aspirant'}</span>
                  </div>
                  <button className="inspect-peer-cta" title="Inspect Study Tracker">
                    Inspect ↗
                  </button>
                </div>

                <div className="peer-current-task-box">
                  <div className="task-header-row">
                    <span className={`subject-badge badge-${(peer.activity?.subject || 'quant').toLowerCase()}`}>
                      {peer.activity?.subject || 'QUANT'}
                    </span>
                    {peer.activity?.timerRemaining && (
                      <span className="task-timer-chip live">
                        <span className="chip-timer-icon">⏱️</span>
                        <span>{peer.activity.timerRemaining}</span>
                      </span>
                    )}
                  </div>
                  <div className="task-main-title">
                    {peer.activity?.title || 'Focused Study Session'}
                  </div>
                  <div className="task-details-text">
                    {peer.activity?.taskDetails || peer.message}
                  </div>
                  {peer.progressToday && (
                    <div className="peer-progress-inline">
                      <span className="progress-inline-label">Today's Progress:</span>
                      <span className="progress-inline-val">{peer.progressToday}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 2: ONLINE PEERS (Active & Ready)
           ======================================================== */}
        <div className="lounge-category-section">
          <div className="category-section-title">
            <span>🟢 ONLINE PEERS — {totalOnline - totalStudying}</span>
          </div>

          <div className="peer-cards-grid">
            {/* Show user if online and not in timer */}
            {!isUserStudying && (
              <div className="peer-profile-card online-card">
                <div className="peer-card-top-row">
                  <div className="peer-avatar-wrapper">
                    <div className="peer-avatar self-avatar">
                      {(currentUser?.displayName ? currentUser.displayName[0] : 'Y').toUpperCase()}
                    </div>
                    <span className="peer-status-indicator online"></span>
                  </div>
                  <div className="peer-identity-meta">
                    <div className="peer-name-row">
                      <span className="peer-fullname">{currentUser?.displayName || 'You'}</span>
                      <span className="peer-tag you-tag">YOU</span>
                    </div>
                    <span className="peer-status-sub">Online • Ready to start study session</span>
                  </div>
                </div>
              </div>
            )}

            {/* Online peers with their current activities */}
            {onlinePeers.map(peer => (
              <div 
                key={peer.id} 
                className="peer-profile-card online-card clickable"
                onClick={() => onInspectFriend && onInspectFriend(peer)}
                title="Click to view full tracker & stats"
              >
                <div className="peer-card-top-row">
                  <div className="peer-avatar-wrapper">
                    <div className="peer-avatar" style={{ backgroundColor: peer.avatarBg || 'var(--bg-tertiary)' }}>
                      {peer.avatar || peer.name[0]}
                    </div>
                    <span className="peer-status-indicator online"></span>
                  </div>
                  <div className="peer-identity-meta">
                    <div className="peer-name-row">
                      <span className="peer-fullname">{peer.name}</span>
                      {peer.streak >= 3 && (
                        <span className="peer-streak-badge">🔥 {peer.streak}d Streak</span>
                      )}
                    </div>
                    <span className="peer-status-sub">{peer.activity?.title || peer.message || 'Online'}</span>
                  </div>
                  <button className="inspect-peer-cta" title="Inspect Study Tracker">
                    Inspect ↗
                  </button>
                </div>

                {peer.activity?.taskDetails && (
                  <div className="peer-activity-snippet">
                    <span className="snippet-subject">[{peer.activity.subject || 'PREP'}]</span> {peer.activity.taskDetails}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 3: OFFLINE PEERS (Last Seen)
           ======================================================== */}
        {offlinePeers.length > 0 && (
          <div className="lounge-category-section">
            <div className="category-section-title">
              <span>⚪ OFFLINE — {offlinePeers.length}</span>
            </div>

            <div className="offline-peers-row-list">
              {offlinePeers.map(peer => (
                <div 
                  key={peer.id} 
                  className="offline-peer-chip clickable"
                  onClick={() => onInspectFriend && onInspectFriend(peer)}
                  title={`Click to view ${peer.name}'s study profile`}
                >
                  <div className="offline-avatar-mini">{peer.avatar || peer.name[0]}</div>
                  <div className="offline-meta-mini">
                    <span className="offline-name">{peer.name}</span>
                    <span className="offline-last-seen">{peer.lastActive || 'Offline'}</span>
                  </div>
                  {peer.streak >= 3 && (
                    <span className="offline-streak-mini">🔥 {peer.streak}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
