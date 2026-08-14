import React from 'react';
import { getTodayTrackerPosition } from '../utils/dateUtils';

export default function DashboardView({ state, setActiveTab, friends = [], onInspectFriend }) {
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

        {/* Peer Feed */}
        <div className="dashboard-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">Peer Study Feed</h2>
            <span className="today-badge-chip">Live Activity</span>
          </div>

          <div className="friend-feed-list">
            {friends.map(friend => (
              <div 
                key={friend.id} 
                className="friend-feed-item"
                onClick={() => onInspectFriend && onInspectFriend(friend)}
                title="Inspect peer progress"
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
  );
}
