import React from 'react';
import { getTodayTrackerPosition, formatDateShort } from '../utils/dateUtils';

export default function DashboardView({ state, setActiveTab, friends = [], onInspectFriend }) {
  const { tracker, studyPlan, mocks, settings } = state;
  const todayPos = getTodayTrackerPosition(settings?.startDate);

  // Calculate totals
  let totalQuantSolved = 0;
  let totalLrdidSolved = 0;
  let totalVarcSolved = 0;
  let _totalDaysCount = 0;
  let _completedDaysCount = 0;

  // Flatten days to calculate streak and progress
  const allDaysChronological = [];

  for (const [_month, weeks] of Object.entries(tracker)) {
    weeks.forEach(week => {
      week.days.forEach(day => {
        totalQuantSolved += Number(day.quantCount) || 0;
        totalLrdidSolved += Number(day.lrdiCount) || 0;
        totalVarcSolved += Number(day.varcCount) || 0;
        _totalDaysCount++;

        const isDayDone = day.quantCompleted || day.lrdiCompleted || day.varcCompleted;
        if (isDayDone) {
          _completedDaysCount++;
        }

        allDaysChronological.push({
          ...day,
          isDone: isDayDone
        });
      });
    });
  }

  // Calculate Streak
  let currentStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < allDaysChronological.length; i++) {
    if (allDaysChronological[i].isDone) {
      tempStreak++;
      if (tempStreak > currentStreak) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Current consecutive streak from the last active day
  let activeStreak = 0;
  for (let i = allDaysChronological.length - 1; i >= 0; i--) {
    if (allDaysChronological[i].isDone) {
      activeStreak++;
    } else {
      if (activeStreak > 0) break;
    }
  }

  const mocksTaken = mocks.filter(m => m.status === 'Taken').length;

  // Grand Targets
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

  // Find Active Week
  let activeWeek = studyPlan.find(w => w.status === 'In Progress') || studyPlan.find(w => w.status === 'Not Started') || studyPlan[studyPlan.length - 1];

  // SVG Progress Ring Component
  const ProgressRing = ({ percent, size = 52, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          stroke="var(--border-color)"
        />
        <circle
          className="progress-ring-circle"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          stroke="var(--accent-color)"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div>
      <div className="header-row">
        <div>
          <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">Dashboard</h1>
            <span className="today-header-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{formatDateShort(new Date())} ({todayPos.todayDayName})</span>
            </span>
          </div>
          <p className="page-subtitle">Your preparation summary and elite benchmarks tracker.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setActiveTab('timeline')}>Full Study Plan</button>
          <button className="btn-primary" onClick={() => setActiveTab('daily')}>Start Today's Drill</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-title">Quant Questions</span>
              <div className="stat-value">{totalQuantSolved.toLocaleString()} <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {grandTargets.quant}</span></div>
            </div>
            <ProgressRing percent={quantPercent} />
          </div>
          <p className="stat-subtext">{quantPercent}% of grand target completed</p>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${quantPercent}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-title">LRDI Sets</span>
              <div className="stat-value">{totalLrdidSolved.toLocaleString()} <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {grandTargets.lrdi}</span></div>
            </div>
            <ProgressRing percent={lrdiPercent} />
          </div>
          <p className="stat-subtext">{lrdiPercent}% of grand target completed</p>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${lrdiPercent}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-title">VARC RCs</span>
              <div className="stat-value">{totalVarcSolved.toLocaleString()} <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {grandTargets.varc}</span></div>
            </div>
            <ProgressRing percent={varcPercent} />
          </div>
          <p className="stat-subtext">{varcPercent}% of grand target completed</p>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${varcPercent}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-title">Mock Tests</span>
              <div className="stat-value">{mocksTaken} <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {grandTargets.mocks}</span></div>
            </div>
            <ProgressRing percent={mockPercent} />
          </div>
          <p className="stat-subtext">{mockPercent}% of target (30 full mocks)</p>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${mockPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="dashboard-details-row">
        {/* Active Week Panel */}
        <div className="dashboard-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="panel-title" style={{ margin: 0 }}>Active Study Focus</h2>
            {activeWeek && (
              <span className="status-badge in-progress" style={{ cursor: 'default' }}>
                {activeWeek.week}
              </span>
            )}
          </div>
          
          {activeWeek ? (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>
                {activeWeek.phase}
              </p>
              
              <div className="weekly-focus-card">
                <div className="focus-subject">Quantitative Aptitude</div>
                <div className="focus-detail">{activeWeek.quantFocus || "Formula revision & concept brushing"}</div>
              </div>

              <div className="weekly-focus-card">
                <div className="focus-subject">Logical Reasoning & Data Interpretation</div>
                <div className="focus-detail">{activeWeek.lrdiFocus || "Set selection & speed practice"}</div>
              </div>

              <div className="weekly-focus-card">
                <div className="focus-subject">Verbal Ability & Reading Comprehension</div>
                <div className="focus-detail">{activeWeek.varcFocus || "Mock analytics & VA grammar"}</div>
              </div>
            </div>
          ) : (
            <p className="empty-state">No active focus found. Mark a week as "In Progress" in the timeline.</p>
          )}
        </div>

        {/* Right Columns: Streak & Friend Sync Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Streaks Card */}
          <div className="dashboard-panel" style={{ padding: '20px' }}>
            <h2 className="panel-title" style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>Consistency Streak</h2>
            <div className="streak-container">
              <div className="streak-number" style={{ fontSize: '44px' }}>{activeStreak}</div>
              <div className="streak-label" style={{ fontSize: '12px', marginTop: '2px' }}>Consecutive Active Days</div>
            </div>
          </div>

          {/* Friends Real-time Activity Feed */}
          <div className="dashboard-panel" style={{ flexGrow: 1 }}>
            <h2 className="panel-title" style={{ margin: 0 }}>Friend Activity (Sync Feed)</h2>
            <div className="friend-feed-list">
              {friends.map(friend => (
                <div 
                  key={friend.id} 
                  className="friend-feed-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onInspectFriend && onInspectFriend(friend)}
                  title="Click to inspect peer study progress details"
                >
                  <div className="friend-avatar">{friend.avatar}</div>
                  <div className="friend-info">
                    <div className="friend-name-row">
                      <span className="friend-name">{friend.name}</span>
                      <span className="friend-time">{friend.lastActive}</span>
                    </div>
                    <div className="friend-action">{friend.message}</div>
                    <div className="friend-streak-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      <span>{friend.streak} Streak</span>
                    </div>
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
