import React from 'react';
import { getTodayTrackerPosition } from '../utils/dateUtils';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';

export default function DashboardView({ 
  state, 
  setActiveTab, 
  friends = [], 
  onInspectFriend,
  onMessagePeer = null,
  onManageBuddies = null,
  currentUser = null,
  userProfile = null,
  timerState = null
}) {
  const { tracker, studyPlan, mocks, settings } = state;
  const todayPos = getTodayTrackerPosition(settings?.startDate);

  // Calculate totals
  let totalQuantSolved = 0;
  let totalLrdidSolved = 0;
  let totalVarcSolved = 0;
  let _totalDaysCount = 0;

  const allDaysChronological = [];

  for (const [_month, weeks] of Object.entries(tracker)) {
    weeks.forEach(week => {
      week.days.forEach(day => {
        totalQuantSolved += Number(day.quantCount) || 0;
        totalLrdidSolved += Number(day.lrdiCount) || 0;
        totalVarcSolved += Number(day.varcCount) || 0;
        _totalDaysCount++;

        const isDayDone = day.quantCompleted || day.lrdiCompleted || day.varcCompleted;
        allDaysChronological.push({
          ...day,
          isDone: isDayDone
        });
      });
    });
  }

  // Calculate Active Streak
  let activeStreak = 0;
  for (let i = allDaysChronological.length - 1; i >= 0; i--) {
    if (allDaysChronological[i].isDone) {
      activeStreak++;
    } else {
      if (activeStreak > 0) break;
    }
  }

  const mocksTaken = mocks.filter(m => m.status === 'Taken').length;

  const grandTargets = {
    quant: 3160,
    lrdi: 650,
    varc: 620,
    mocks: 30
  };

  const quantPercent = Math.min(100, Math.round((totalQuantSolved / grandTargets.quant) * 100));
  const lrdiPercent = Math.min(100, Math.round((totalLrdidSolved / grandTargets.lrdi) * 100));
  const varcPercent = Math.min(100, Math.round((totalVarcSolved / grandTargets.varc) * 100));
  const mockPercent = Math.min(100, Math.round((mocksTaken / grandTargets.mocks) * 100));

  let activeWeek = studyPlan.find(w => w.status === 'In Progress') || studyPlan.find(w => w.status === 'Not Started') || studyPlan[studyPlan.length - 1];

  // Today's Study Hours and Sessions
  const todayMonthObj = tracker[todayPos.activeMonth];
  const todayWeekObj = todayMonthObj?.find(w => w.week === todayPos.activeWeek);
  const todayDayObj = todayWeekObj?.days?.find(d => d.day === todayPos.todayDayName || d.day === todayPos.dayName);
  const todayStudyHours = todayDayObj?.studyHours || (todayDayObj?.sessions || []).reduce((acc, s) => acc + (s.durationMinutes || 0) / 60, 0);
  const todaySessions = todayDayObj?.sessions || [];
  const todayDoneTasks = (todayDayObj?.quantCompleted ? 1 : 0) + (todayDayObj?.lrdiCompleted ? 1 : 0) + (todayDayObj?.varcCompleted ? 1 : 0);

  // Online and studying buddies
  const onlineFriends = friends.filter(f => f.status === 'studying' || f.status === 'online');

  return (
    <div className="dashboard-clean-container">
      {/* Hero Greeting Bar */}
      <div className="dashboard-hero-header">
        <div className="hero-title-group">
          <h1 className="hero-greeting">Welcome back, Aspirant</h1>
          <p className="hero-subtext">Your daily preparation hub & benchmark performance summary.</p>
        </div>

        <div className="hero-action-buttons">
          <button className="btn-primary hero-main-btn" onClick={() => setActiveTab('daily')}>
            Start Today's Practice
          </button>
          <button className="btn-secondary hero-sub-btn" onClick={() => setActiveTab('timer')}>
            Focus Timer
          </button>
        </div>
      </div>

      {/* Today's Focus Overview Card */}
      <div className="today-focus-card">
        <div className="focus-card-left">
          <div className="focus-card-badge">
            <span>TODAY'S FOCUS & QUOTA</span>
          </div>
          <div className="focus-card-stats">
            <div className="focus-stat-item">
              <span className="focus-stat-val">{todayStudyHours.toFixed(1)} hrs</span>
              <span className="focus-stat-lbl">Time Studied Today</span>
            </div>
            <div className="focus-stat-divider"></div>
            <div className="focus-stat-item">
              <span className="focus-stat-val">{todayDoneTasks} / 3</span>
              <span className="focus-stat-lbl">Drills Completed</span>
            </div>
            <div className="focus-stat-divider"></div>
            <div className="focus-stat-item">
              <span className="focus-stat-val">{activeStreak} Days</span>
              <span className="focus-stat-lbl">Active Streak</span>
            </div>
          </div>
          {todaySessions.length > 0 && (
            <div className="focus-recent-slots">
              {todaySessions.slice(0, 3).map((s, i) => (
                <span key={i} className="slot-chip">
                  {s.startTime} - {s.endTime} ({s.subject})
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="focus-card-right">
          <button className="btn-primary start-timer-cta-btn" onClick={() => setActiveTab('timer')}>
            <span>Start 25m Session</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="metrics-clean-grid">
        {/* Quant */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-title">
              <span className="metric-title">Quant Questions</span>
            </div>
            <span className="metric-percent-badge">{quantPercent}%</span>
          </div>
          <div className="metric-card-value">
            {totalQuantSolved.toLocaleString()} <span className="metric-target">/ {grandTargets.quant}</span>
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${quantPercent}%` }}></div>
          </div>
        </div>

        {/* LRDI */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-title">
              <span className="metric-title">LRDI Sets</span>
            </div>
            <span className="metric-percent-badge">{lrdiPercent}%</span>
          </div>
          <div className="metric-card-value">
            {totalLrdidSolved.toLocaleString()} <span className="metric-target">/ {grandTargets.lrdi}</span>
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${lrdiPercent}%` }}></div>
          </div>
        </div>

        {/* VARC */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-title">
              <span className="metric-title">VARC RCs</span>
            </div>
            <span className="metric-percent-badge">{varcPercent}%</span>
          </div>
          <div className="metric-card-value">
            {totalVarcSolved.toLocaleString()} <span className="metric-target">/ {grandTargets.varc}</span>
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${varcPercent}%` }}></div>
          </div>
        </div>

        {/* Mocks */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-title">
              <span className="metric-title">Mock Tests</span>
            </div>
            <span className="metric-percent-badge">{mockPercent}%</span>
          </div>
          <div className="metric-card-value">
            {mocksTaken} <span className="metric-target">/ {grandTargets.mocks}</span>
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${mockPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Activity Consistency & Streak Matrix Panel (2-Column Responsive Layout) */}
      <div className="dashboard-card streak-heatmap-dashboard-card">
        <div className="streak-heatmap-header">
          <div className="streak-heatmap-title-group">
            <div className="streak-icon-bubble">
              <Icons.Zap size={18} />
            </div>
            <div>
              <h3 className="streak-heatmap-title">Study Consistency & Streak Matrix</h3>
              <p className="streak-heatmap-subtitle">
                Daily preparation activity matrix. Maintain daily drills to unlock streak perks and collectible badges.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Heatmap on Left, Streak Insights on Right */}
        <div className="dashboard-heatmap-dual-row">
          <div className="heatmap-matrix-left-col">
            <StudyContributionHeatmap tracker={tracker} compact={false} />
          </div>

          <div className="streak-analytics-right-col">
            <div className="streak-analytics-tile">
              <div className="streak-tile-header">
                <Icons.Flame size={14} color="#f97316" />
                <span>ACTIVE STREAK</span>
              </div>
              <div className="streak-tile-number">
                {activeStreak} <span>{activeStreak === 1 ? 'Day' : 'Days'}</span>
              </div>
              <div className="streak-tile-desc">
                {activeStreak > 0 ? "Momentum active! Don't break the streak." : "Complete today's drill to start your streak."}
              </div>
            </div>

            <div className="streak-analytics-tile">
              <div className="streak-tile-header">
                <Icons.Calendar size={14} color="#38bdf8" />
                <span>CONSISTENCY RECORD</span>
              </div>
              <div className="streak-tile-number">
                {allDaysChronological.filter(d => d.isDone).length} <span>/ 112 Days</span>
              </div>
              <div className="streak-tile-desc">
                Total active practice days logged across 4 months.
              </div>
            </div>

            <button 
              type="button"
              className="streak-perks-action-btn"
              onClick={() => setActiveTab('achievements')}
              title="View your prestige achievement badges and custom perks"
            >
              <Icons.Award size={14} color="#eab308" />
              <span>Collected Perks & Badges</span>
              <Icons.ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* REAL-TIME ONLINE STUDY BUDDIES NETWORK SECTION */}
      <div className="dashboard-card dashboard-online-buddies-card">
        <div className="online-buddies-header">
          <div className="online-buddies-title-group">
            <div className="online-buddies-icon-box">
              <Icons.Users size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 className="online-buddies-title">Study Buddy Network</h3>
              <p className="online-buddies-sub">Real-time status & active focus sessions of your study friends</p>
            </div>
          </div>
          <div className="online-buddies-header-actions">
            <span className="online-status-badge">
              <span className="live-pulse-dot"></span>
              {onlineFriends.length} Active Now
            </span>
            <button 
              type="button" 
              className="view-all-buddies-btn"
              onClick={onManageBuddies || (() => setActiveTab('profile'))}
              title="Manage your study buddies network"
            >
              <span>Manage Buddies</span>
              <Icons.ChevronRight size={13} />
            </button>
          </div>
        </div>

        <div className="online-buddies-content">
          {friends.length === 0 ? (
            <div className="dashboard-no-buddies-empty">
              <Icons.Users size={32} color="#64748b" />
              <h4>No Study Buddies Added Yet</h4>
              <p>Connect with fellow CAT aspirants by Unique ID or Email to study together and see when they come online!</p>
              <button 
                type="button" 
                className="btn-secondary add-buddies-empty-btn"
                onClick={onManageBuddies || (() => setActiveTab('profile'))}
              >
                <Icons.UserPlus size={14} />
                <span>Add Friends on Profile</span>
              </button>
            </div>
          ) : onlineFriends.length === 0 ? (
            <div className="dashboard-all-offline-box">
              <div className="offline-notice-text">
                <span className="offline-dot"></span>
                <span>All your {friends.length} study buddies are currently offline. Check their progress below or chat in Study Lounge:</span>
              </div>
              <div className="dashboard-buddies-compact-grid">
                {friends.slice(0, 6).map(friend => (
                  <div 
                    key={friend.id || friend.uid} 
                    className="dashboard-buddy-chip clickable"
                    onClick={() => onInspectFriend && onInspectFriend(friend)}
                    title="Click to inspect tracker"
                  >
                    <AvatarRenderer 
                      avatar={friend.avatar} 
                      name={friend.displayName || friend.name} 
                      avatarBg={friend.avatarBg} 
                      size={28} 
                      status="offline"
                    />
                    <span className="chip-name">{friend.displayName || friend.name}</span>
                    <span className="chip-streak">{friend.streak || 0}d streak</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-buddies-live-grid">
              {onlineFriends.map(friend => {
                const isStudying = friend.status === 'studying';
                return (
                  <div 
                    key={friend.id || friend.uid} 
                    className={`dashboard-buddy-live-card ${isStudying ? 'is-studying' : ''}`}
                  >
                    <div 
                      className="buddy-live-info clickable"
                      onClick={() => onInspectFriend && onInspectFriend(friend)}
                      title="Click to view full aspirant profile"
                    >
                      <AvatarRenderer 
                        avatar={friend.avatar}
                        name={friend.displayName || friend.name}
                        avatarBg={friend.avatarBg}
                        size={40}
                        status={friend.status}
                      />
                      <div className="buddy-live-meta">
                        <div className="buddy-live-name-row">
                          <span className="buddy-live-name">{friend.displayName || friend.name}</span>
                          {friend.aspirantId && (
                            <span className="buddy-id-tag">#{friend.aspirantId}</span>
                          )}
                        </div>
                        <div className="buddy-live-status-pill">
                          <span className={`status-dot-mini ${friend.status}`}></span>
                          {isStudying ? (
                            <span className="studying-text">
                              Studying {friend.activity?.subject ? `(${friend.activity.subject})` : 'Focus Session'}
                              {friend.activity?.timerRemaining ? ` • ${friend.activity.timerRemaining}` : ''}
                            </span>
                          ) : (
                            <span className="online-text">Online & Active</span>
                          )}
                        </div>
                        <div className="buddy-live-stats">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f97316" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
                            </svg>
                            {friend.streak || 0}d streak
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <circle cx="12" cy="12" r="6"></circle>
                              <circle cx="12" cy="12" r="2"></circle>
                            </svg>
                            {friend.solvedQs || 0} Qs solved
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="buddy-live-actions">
                      {onMessagePeer && (
                        <button 
                          type="button"
                          className="buddy-live-btn message-btn"
                          onClick={() => onMessagePeer(friend)}
                          title={`Chat with ${friend.displayName || friend.name}`}
                        >
                          <Icons.MessageSquare size={13} />
                          <span>Message</span>
                        </button>
                      )}
                      {onInspectFriend && (
                        <button 
                          type="button"
                          className="buddy-live-btn inspect-btn"
                          onClick={() => onInspectFriend(friend)}
                          title="Inspect Tracker & Analytics"
                        >
                          <Icons.Target size={13} />
                          <span>Inspect</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Curriculum Phase & Peer Feed Grid */}
      <div className="dashboard-details-row">
        {/* Active Study Focus */}
        <div className="dashboard-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">Current Study Focus</h2>
            {activeWeek && (
              <span className="status-badge in-progress">
                {activeWeek.week}
              </span>
            )}
          </div>

          {activeWeek ? (
            <div className="weekly-focus-container">
              <p className="phase-label-sub">{activeWeek.phase}</p>
              
              <div className="weekly-focus-card">
                <div className="focus-subject">Quantitative Aptitude</div>
                <div className="focus-detail">{activeWeek.quantFocus || "Formula revision & concept brushing"}</div>
              </div>

              <div className="weekly-focus-card">
                <div className="focus-subject">LRDI Practice</div>
                <div className="focus-detail">{activeWeek.lrdiFocus || "Set selection & speed practice"}</div>
              </div>

              <div className="weekly-focus-card">
                <div className="focus-subject">VARC Sectionals</div>
                <div className="focus-detail">{activeWeek.varcFocus || "Mock analytics & VA grammar"}</div>
              </div>
            </div>
          ) : (
            <p className="empty-state">No active focus found. Mark a week as "In Progress" in the timeline plan.</p>
          )}
        </div>

        {/* Inviting Live Peer Study Lounge Hub Card */}
        <div className="dashboard-card live-lounge-hub-card">
          <div className="live-lounge-hub-left">
            <div className="live-lounge-icon-box">
              <span className="live-pulse-dot"></span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="live-lounge-hub-text">
              <div className="live-lounge-hub-title">
                <span>Live Aspirants Study Lounge</span>
                <span className="live-lounge-badge">
                  {friends.filter(p => p.status === 'studying').length} Studying Now
                </span>
              </div>
              <p className="live-lounge-hub-subtitle">
                Join active timed focus sprints, ask doubts in real-time, and study alongside online peers.
              </p>
            </div>
          </div>

          <div className="live-lounge-hub-right">
            <button 
              type="button" 
              className="enter-lounge-cta-btn"
              onClick={() => setActiveTab('lounge')}
            >
              <span>Enter Study Lounge</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
