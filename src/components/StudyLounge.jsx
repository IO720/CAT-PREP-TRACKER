import React, { useState, useEffect } from 'react';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';

export default function StudyLounge({
  peers = [],
  friends = [],
  onInspectFriend,
  currentUser = null,
  userProfile = null,
  timerState = null,
  onNavigateToTimer = null,
  onNavigateToFriends = null
}) {
  const [activeTab, setActiveTab] = useState('buddies'); // 'buddies' | 'leaderboard'
  const [subjectFilter, setSubjectFilter] = useState('ALL'); // 'ALL' | 'QUANT' | 'VARC' | 'LRDI'
  const [buddyFilter, setBuddyFilter] = useState('ALL'); // 'ALL' | 'STUDYING' | 'ONLINE'
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

  // Real-time tick every second to smoothly compute remaining countdowns for studying peers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const mins = Math.floor(safeSecs / 60);
    const remainder = safeSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Dynamically calculate peer countdown from timestamp
  const getPeerTimerInfo = (peer) => {
    if (!peer?.activity) return null;
    const act = peer.activity;
    if (act.updatedMs && act.secondsLeft != null && act.isRunning) {
      const elapsedSecs = Math.floor((currentTimeMs - act.updatedMs) / 1000);
      const remainingSecs = Math.max(0, act.secondsLeft - elapsedSecs);
      return {
        formatted: `${formatTime(remainingSecs)} remaining`,
        secondsLeft: remainingSecs,
        subject: act.subject || 'Quant',
        title: act.title || `${act.subject || 'Quant'} Focus Session`,
        mode: act.mode || 'pomodoro',
        isRunning: true
      };
    }
    if (act.isPaused && act.secondsLeft != null) {
      return {
        formatted: `${formatTime(act.secondsLeft)} (paused)`,
        secondsLeft: act.secondsLeft,
        subject: act.subject || 'Quant',
        title: act.title || `${act.subject || 'Quant'} Focus Session`,
        mode: act.mode || 'pomodoro',
        isRunning: false
      };
    }
    return {
      formatted: act.timerRemaining || act.timerText || 'In Session',
      secondsLeft: act.secondsLeft || 1500,
      subject: act.subject || 'Quant',
      title: act.title || 'Focus Session',
      mode: 'pomodoro',
      isRunning: true
    };
  };

  // Build current user's live activity record
  const isUserStudying = timerState && (timerState.isRunning || timerState.isPaused);
  const userAvatar = userProfile?.avatar || (currentUser?.displayName ? currentUser.displayName[0] : 'rocket');
  const userAvatarBg = userProfile?.avatarBg || '#3b82f6';
  const userLocation = userProfile?.location || '';
  const userTarget = userProfile?.target || 'CAT 2025 Aspirant';
  const userAspirantId = userProfile?.aspirantId || '';

  const userActivity = isUserStudying ? {
    isSelf: true,
    id: currentUser?.uid || 'self',
    uid: currentUser?.uid || 'self',
    name: userProfile?.displayName || currentUser?.displayName || 'You',
    displayName: userProfile?.displayName || currentUser?.displayName || 'You',
    avatar: userAvatar,
    avatarBg: userAvatarBg,
    location: userLocation,
    target: userTarget,
    aspirantId: userAspirantId,
    streak: userProfile?.streak || 0,
    solvedQs: userProfile?.solvedQs || 0,
    status: 'studying',
    activity: {
      subject: (timerState.subject || 'QUANT').toUpperCase(),
      title: `${timerState.subject || 'Quant'} Focus Session`,
      taskDetails: timerState.sessionNotes || (timerState.mode === 'stopwatch' ? 'Stopwatch Session' : `${Math.round((timerState.totalSeconds || 1500) / 60)}m Focus Session`),
      timerText: timerState.mode === 'stopwatch' 
        ? formatTime(timerState.secondsLeft) 
        : `${formatTime(timerState.secondsLeft)} remaining`,
      secondsLeft: timerState.secondsLeft || 1500,
      isRunning: timerState.isRunning
    }
  } : null;

  // Filter and Compile Global Studying Aspirants Leaderboard
  const peerSource = peers.length > 0 ? peers : friends;
  const studyingPeers = peerSource.filter(p => p.status === 'studying');

  const allStudyingAspirants = [
    ...(userActivity ? [userActivity] : []),
    ...studyingPeers.filter(p => p.id !== currentUser?.uid && p.uid !== currentUser?.uid)
  ].filter(student => {
    if (subjectFilter === 'ALL') return true;
    const subj = (student.activity?.subject || '').toUpperCase();
    return subj.includes(subjectFilter);
  }).sort((a, b) => {
    return (b.solvedQs || 0) - (a.solvedQs || 0) || (b.streak || 0) - (a.streak || 0);
  });

  // Filter Friends by Status
  const filteredFriends = friends.filter(friend => {
    if (buddyFilter === 'ALL') return true;
    if (buddyFilter === 'STUDYING') return friend.status === 'studying';
    if (buddyFilter === 'ONLINE') return friend.status === 'online' || friend.status === 'studying';
    return true;
  });

  const activeStudyingCount = allStudyingAspirants.length;
  const onlineBuddiesCount = friends.filter(f => f.status === 'studying' || f.status === 'online').length;

  return (
    <div className="study-arena-view animate-fade-in">
      
      {/* 1. TOP HERO BANNER & STATS BAR */}
      <div className="study-arena-hero">
        <div className="study-arena-hero-left">
          <div className="study-arena-hero-badge">
            <span className="live-pulse-dot"></span>
            <span>LIVE STUDY ARENA</span>
          </div>
          <h1 className="study-arena-title">Aspirants Focus Lounge</h1>
          <p className="study-arena-subtitle">
            Track your study buddies' live focus sessions, compete on the studying leaderboard, and stay accountable.
          </p>
        </div>

        <div className="study-arena-hero-stats">
          <div className="arena-stat-box">
            <div className="arena-stat-icon-wrap" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24' }}>
              <Icons.Flame size={20} />
            </div>
            <div className="arena-stat-data">
              <span className="arena-stat-value">{activeStudyingCount}</span>
              <span className="arena-stat-label">Aspirants Studying Now</span>
            </div>
          </div>

          <div className="arena-stat-box">
            <div className="arena-stat-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Icons.Users size={20} />
            </div>
            <div className="arena-stat-data">
              <span className="arena-stat-value">{onlineBuddiesCount} / {friends.length}</span>
              <span className="arena-stat-label">Buddies Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. USER ACTIVE SESSION STATUS BAR */}
      <div className="arena-user-session-bar">
        <div className="arena-user-session-info">
          <AvatarRenderer 
            avatar={userProfile?.avatar || currentUser?.photoURL}
            name={userProfile?.displayName || 'You'}
            avatarBg={userProfile?.avatarBg || '#5865f2'}
            size={42}
            status={isUserStudying ? 'studying' : 'online'}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="arena-user-name">{userProfile?.displayName || 'You'}</span>
              <span className="hub-self-tag">YOU</span>
              <span className={`status-pill ${isUserStudying ? 'studying' : 'online'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                {isUserStudying ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f97316" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
                    </svg>
                    <span>Actively Studying</span>
                  </>
                ) : (
                  <>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                    <span>Ready to Study</span>
                  </>
                )}
              </span>
            </div>
            <p className="arena-user-desc">
              {isUserStudying 
                ? `${timerState.subject || 'Quant'} Session in progress • ${formatTime(timerState.secondsLeft)} remaining`
                : "No active timer running. Launch a session in Study Timer to appear on the live leaderboard!"}
            </p>
          </div>
        </div>

        {onNavigateToTimer && (
          <button 
            type="button" 
            className="arena-cta-btn primary"
            onClick={onNavigateToTimer}
          >
            <Icons.Clock size={16} />
            <span>{isUserStudying ? 'Open Study Timer' : 'Start Focus Session'}</span>
          </button>
        )}
      </div>

      {/* 3. PRIMARY ARENA NAVIGATION TABS */}
      <div className="arena-tabs-header">
        <div className="arena-tabs-group">
          <button
            type="button"
            className={`arena-tab-btn ${activeTab === 'buddies' ? 'active' : ''}`}
            onClick={() => setActiveTab('buddies')}
          >
            <Icons.Users size={16} />
            <span>My Study Buddies</span>
            {friends.length > 0 && <span className="arena-tab-badge">{friends.length}</span>}
          </button>

          <button
            type="button"
            className={`arena-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Icons.Trophy size={16} />
            <span>Global Study Leaderboard</span>
            {activeStudyingCount > 0 && (
              <span className="arena-tab-badge pulse-badge">{activeStudyingCount} Live</span>
            )}
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'buddies' ? (
          <div className="arena-filter-pills">
            <button 
              type="button" 
              className={`filter-pill ${buddyFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setBuddyFilter('ALL')}
            >
              All ({friends.length})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${buddyFilter === 'STUDYING' ? 'active' : ''}`}
              onClick={() => setBuddyFilter('STUDYING')}
            >
              Studying ({friends.filter(f => f.status === 'studying').length})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${buddyFilter === 'ONLINE' ? 'active' : ''}`}
              onClick={() => setBuddyFilter('ONLINE')}
            >
              Online ({onlineBuddiesCount})
            </button>
          </div>
        ) : (
          <div className="arena-filter-pills">
            <button 
              type="button" 
              className={`filter-pill ${subjectFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSubjectFilter('ALL')}
            >
              All Subjects
            </button>
            <button 
              type="button" 
              className={`filter-pill ${subjectFilter === 'QUANT' ? 'active' : ''}`}
              onClick={() => setSubjectFilter('QUANT')}
            >
              Quant
            </button>
            <button 
              type="button" 
              className={`filter-pill ${subjectFilter === 'VARC' ? 'active' : ''}`}
              onClick={() => setSubjectFilter('VARC')}
            >
              VARC
            </button>
            <button 
              type="button" 
              className={`filter-pill ${subjectFilter === 'LRDI' ? 'active' : ''}`}
              onClick={() => setSubjectFilter('LRDI')}
            >
              DILR
            </button>
          </div>
        )}
      </div>

      {/* 4. MAIN CONTENT CONTAINER */}
      <div className="arena-content-area">

        {/* ========================================================
            TAB 1: MY STUDY BUDDIES TIMERS & LIVE STATUS
           ======================================================== */}
        {activeTab === 'buddies' && (
          <div className="arena-buddies-grid">
            {filteredFriends.length === 0 ? (
              <div className="arena-empty-state">
                <div className="arena-empty-icon-wrap">
                  <Icons.Users size={40} color="#38bdf8" />
                </div>
                <h3>{friends.length === 0 ? "No Study Buddies Added Yet" : "No Buddies Match Filter"}</h3>
                <p>
                  {friends.length === 0 
                    ? "Connect with fellow CAT aspirants to track their live focus timers and study heatmaps in real time." 
                    : "None of your connected buddies currently match the selected status filter."}
                </p>
                {onNavigateToFriends && (
                  <button 
                    type="button" 
                    className="arena-cta-btn primary"
                    onClick={onNavigateToFriends}
                    style={{ marginTop: '14px' }}
                  >
                    <Icons.UserPlus size={16} />
                    <span>Add Friends by Aspirant ID</span>
                  </button>
                )}
              </div>
            ) : (
              filteredFriends.map(friend => {
                const fId = friend.id || friend.uid;
                const isStudying = friend.status === 'studying';
                const isOnline = friend.status === 'online';
                const timerInfo = getPeerTimerInfo(friend);

                return (
                  <div key={fId} className={`arena-buddy-card ${isStudying ? 'is-studying' : ''}`}>
                    {/* Top User Row */}
                    <div className="arena-card-top-row">
                      <AvatarRenderer 
                        avatar={friend.avatar}
                        name={friend.displayName || friend.name}
                        avatarBg={friend.avatarBg}
                        size={48}
                        status={friend.status || 'offline'}
                      />

                      <div className="arena-card-user-meta">
                        <div className="arena-card-name-row">
                          <h3 className="arena-card-user-name">{friend.displayName || friend.name}</h3>
                          {friend.aspirantId && (
                            <span className="arena-aspirant-tag">#{friend.aspirantId}</span>
                          )}
                        </div>

                        <div className="arena-status-row">
                          <span className={`status-dot-mini ${friend.status || 'offline'}`}></span>
                          <span className="arena-status-text">
                            {isStudying ? 'Studying Now' : isOnline ? 'Online' : 'Offline'}
                          </span>
                          {friend.target && <span className="arena-target-text">• {friend.target}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Active Timer Box (If Studying) */}
                    {isStudying ? (
                      <div className="arena-live-timer-box">
                        <div className="arena-live-timer-header">
                          <span className="arena-timer-subject-pill">
                            {timerInfo?.subject || friend.activity?.subject || 'Quant'}
                          </span>
                          <span className="arena-timer-mode-pill">
                            {timerInfo?.mode === 'stopwatch' ? 'Stopwatch' : 'Pomodoro'}
                          </span>
                        </div>

                        <div className="arena-live-timer-clock">
                          <Icons.Clock size={16} className="clock-pulse" />
                          <span className="arena-clock-readout">{timerInfo?.formatted || 'In Session'}</span>
                        </div>

                        {friend.activity?.title && (
                          <div className="arena-timer-topic-snip">
                            {friend.activity.title}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="arena-idle-timer-box">
                        <Icons.Clock size={14} color="#64748b" />
                        <span>No active timer session currently running</span>
                      </div>
                    )}

                    {/* Stats Strip */}
                    <div className="arena-stats-strip">
                      <div className="arena-stat-badge">
                        <Icons.Flame size={14} color="#f97316" />
                        <span>{friend.streak || 0}d streak</span>
                      </div>
                      <div className="arena-stat-badge">
                        <Icons.Target size={14} color="#38bdf8" />
                        <span>{friend.solvedQs || 0} solved</span>
                      </div>
                    </div>

                    {/* Inspect Profile Action */}
                    <button
                      type="button"
                      className="arena-inspect-btn"
                      onClick={() => onInspectFriend && onInspectFriend(friend)}
                    >
                      <Icons.Eye size={14} />
                      <span>Inspect Profile & Heatmap</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: GLOBAL STUDYING LEADERBOARD (Strictly Active Timers)
           ======================================================== */}
        {activeTab === 'leaderboard' && (
          <div className="arena-leaderboard-container">
            {allStudyingAspirants.length === 0 ? (
              <div className="arena-empty-state">
                <div className="arena-empty-icon-wrap" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24' }}>
                  <Icons.Trophy size={40} />
                </div>
                <h3>No Aspirants Currently in Active Focus Sessions</h3>
                <p>
                  Be the first to hit the study arena! Launch a Pomodoro or Stopwatch session in Study Timer to claim #1 on the leaderboard.
                </p>
                {onNavigateToTimer && (
                  <button 
                    type="button" 
                    className="arena-cta-btn primary"
                    onClick={onNavigateToTimer}
                    style={{ marginTop: '14px' }}
                  >
                    <Icons.Clock size={16} />
                    <span>Start #1 Focus Session</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="arena-leaderboard-grid">
                {allStudyingAspirants.map((student, idx) => {
                  const timerInfo = getPeerTimerInfo(student);
                  const isTop1 = idx === 0;
                  const isTop2 = idx === 1;
                  const isTop3 = idx === 2;

                  return (
                    <div 
                      key={student.id || student.uid} 
                      className={`arena-leaderboard-card ${student.isSelf ? 'is-self' : ''} ${isTop1 ? 'rank-gold' : isTop2 ? 'rank-silver' : isTop3 ? 'rank-bronze' : ''}`}
                    >
                      {/* Rank Tag */}
                      <div className="arena-rank-crown" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isTop1 ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="8" r="7"></circle>
                              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                            </svg>
                            <span>#1</span>
                          </>
                        ) : isTop2 ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#94a3b8" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="8" r="7"></circle>
                              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                            </svg>
                            <span>#2</span>
                          </>
                        ) : isTop3 ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#d97706" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="8" r="7"></circle>
                              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                            </svg>
                            <span>#3</span>
                          </>
                        ) : (
                          <span>#{idx + 1}</span>
                        )}
                      </div>

                      <div className="arena-leaderboard-card-body">
                        <AvatarRenderer 
                          avatar={student.avatar}
                          name={student.name || student.displayName}
                          avatarBg={student.avatarBg}
                          size={52}
                          status="studying"
                        />

                        <div className="arena-leaderboard-details">
                          <div className="arena-card-name-row">
                            <h3 className="arena-card-user-name">{student.name || student.displayName}</h3>
                            {student.isSelf && <span className="hub-self-tag">YOU</span>}
                            {student.aspirantId && (
                              <span className="arena-aspirant-tag">#{student.aspirantId}</span>
                            )}
                          </div>

                          {/* Dynamic Live Timer Display */}
                          <div className="arena-leaderboard-live-clock">
                            <Icons.Clock size={14} color="#fbbf24" className="clock-pulse" />
                            <span className="arena-clock-time">{timerInfo?.formatted || 'In Session'}</span>
                            <span className="arena-subject-chip">{student.activity?.subject || 'QUANT'}</span>
                          </div>

                          {/* Stats Strip */}
                          <div className="arena-stats-strip" style={{ marginTop: '8px' }}>
                            <div className="arena-stat-badge">
                              <Icons.Flame size={13} color="#f97316" />
                              <span>{student.streak || 0}d streak</span>
                            </div>
                            <div className="arena-stat-badge">
                              <Icons.Target size={13} color="#38bdf8" />
                              <span>{student.solvedQs || 0} Qs solved</span>
                            </div>
                          </div>
                        </div>

                        {/* Inspect Profile */}
                        <button
                          type="button"
                          className="arena-inspect-btn-compact"
                          onClick={() => onInspectFriend && onInspectFriend(student.isSelf ? { isSelf: true, ...userProfile, id: currentUser?.uid, uid: currentUser?.uid } : student)}
                          title="Inspect Profile"
                        >
                          <Icons.Eye size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
