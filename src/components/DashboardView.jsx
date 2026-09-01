import React from 'react';
import { getTodayTrackerPosition } from '../utils/dateUtils';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import WeekContributionHeatmap from './WeekContributionHeatmap';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import Counter from './animations/Counter';
import { getActiveExamConfig } from '../config/examConfig';

function DashboardView({ 
  state, 
  setActiveTab, 
  friends = [], 
  onInspectFriend,
  onMessagePeer = null,
  onManageBuddies = null,
  currentUser = null,
  userProfile = null,
  timerState = null,
  onNavigateToDay = null
}) {
  const { tracker, studyPlan, mocks, settings } = state;
  const todayPos = getTodayTrackerPosition(settings?.startDate);

  const examConfig = React.useMemo(() => getActiveExamConfig(settings?.targetExam || 'cat'), [settings?.targetExam]);
  const secQuant = examConfig.sections[0] || { shortName: 'Quant', unit: 'Questions' };
  const secLrdi = examConfig.sections[1] || { shortName: 'LRDI', unit: 'Sets' };
  const secVarc = examConfig.sections[2] || { shortName: 'VARC', unit: 'RCs' };

  // Memoize heavy aggregations across tracker data
  const metrics = React.useMemo(() => {
    let totalQuant = 0;
    let totalLrdi = 0;
    let totalVarc = 0;
    let _totalDays = 0;
    const allDays = [];

    for (const [_month, weeks] of Object.entries(tracker || {})) {
      weeks.forEach(week => {
        week.days.forEach(day => {
          totalQuant += Number(day.quantCount) || 0;
          totalLrdi += Number(day.lrdiCount) || 0;
          totalVarc += Number(day.varcCount) || 0;
          _totalDays++;

          const isDayDone = day.quantCompleted || day.lrdiCompleted || day.varcCompleted;
          allDays.push({
            ...day,
            isDone: isDayDone
          });
        });
      });
    }

    let streak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].isDone) {
        streak++;
      } else {
        if (streak > 0) break;
      }
    }

    const taken = (mocks || []).filter(m => m.status === 'Taken').length;

    return {
      totalQuantSolved: totalQuant,
      totalLrdidSolved: totalLrdi,
      totalVarcSolved: totalVarc,
      activeStreak: streak,
      mocksTaken: taken,
      allDaysChronological: allDays
    };
  }, [tracker, mocks]);

  const { totalQuantSolved, totalLrdidSolved, totalVarcSolved, activeStreak, mocksTaken, allDaysChronological } = metrics;

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

  const activeWeek = React.useMemo(() => {
    return (studyPlan || []).find(w => w.status === 'In Progress') || (studyPlan || []).find(w => w.status === 'Not Started') || (studyPlan || [])[studyPlan.length - 1];
  }, [studyPlan]);

  // Today's Study Hours and Sessions
  const todayMonthObj = tracker[todayPos.activeMonth];
  const todayWeekObj = todayMonthObj?.find(w => w.week === todayPos.activeWeek);
  const todayDayObj = todayWeekObj?.days?.find(d => d.day === todayPos.todayDayName || d.day === todayPos.dayName);
  const todayStudyHours = todayDayObj?.studyHours || (todayDayObj?.sessions || []).reduce((acc, s) => acc + (s.durationMinutes || 0) / 60, 0);
  const todaySessions = todayDayObj?.sessions || [];
  const todayDoneTasks = (todayDayObj?.quantCompleted ? 1 : 0) + (todayDayObj?.lrdiCompleted ? 1 : 0) + (todayDayObj?.varcCompleted ? 1 : 0);

  // Online and studying buddies
  const onlineFriends = React.useMemo(() => {
    return (friends || []).filter(f => f.status === 'studying' || f.status === 'online');
  }, [friends]);

  return (
    <div className="dashboard-clean-container">
      {/* Minimalist Editorial Hero Header */}
      <div className="minimal-hero-section">
        <div className="minimal-hero-tag">
          <span>// PREPARATION PROTOCOL • {todayPos.activeMonth?.toUpperCase()} ({todayPos.activeWeek?.toUpperCase()})</span>
        </div>

        <div className="minimal-hero-main">
          <div className="minimal-hero-titles">
            <h1 className="minimal-headline">
              DISCIPLINE <span className="minimal-headline-italic">is Real.</span>
            </h1>
            <p className="minimal-subtext">
              Observation defines outcome. Structured daily quotas and continuous percentile mastery.
            </p>
          </div>

          <div className="minimal-hero-actions">
            <button 
              type="button" 
              className="minimal-btn-primary" 
              onClick={() => setActiveTab('daily')}
            >
              <span>Start Daily Practice</span>
              <span className="btn-arrow">↗</span>
            </button>
            <button 
              type="button" 
              className="minimal-btn-secondary" 
              onClick={() => setActiveTab('timer')}
            >
              <Icons.Clock size={14} />
              <span>Focus Timer</span>
            </button>
          </div>
        </div>

        {/* 3-Metric Horizon Quota Strip */}
        <div className="minimal-horizon-strip">
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Time Studied Today</span>
            <span className="horizon-stat-val">{todayStudyHours.toFixed(1)} <span className="horizon-unit">hrs</span></span>
          </div>
          <div className="horizon-divider"></div>
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Daily Drills</span>
            <span className="horizon-stat-val"><Counter value={todayDoneTasks} /> <span className="horizon-unit">/ 3 Done</span></span>
          </div>
          <div className="horizon-divider"></div>
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Active Streak</span>
            <span className="horizon-stat-val" style={{ color: activeStreak > 0 ? '#ff3344' : 'inherit' }}>
              <Counter value={activeStreak} /> <span className="horizon-unit">{activeStreak === 1 ? 'Day' : 'Days'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Subject Metrics Grid */}
      <div className="minimal-metrics-grid">
        {/* Slot 1: Quant / Physics / Core */}
        <div className="minimal-metric-card">
          <div className="minimal-metric-header">
            <span className="minimal-metric-title">{secQuant.cardTitle || `${secQuant.shortName} ${secQuant.unit}`}</span>
            <span className="minimal-metric-badge">{quantPercent}%</span>
          </div>
          <div className="minimal-metric-number">
            <Counter value={totalQuantSolved} /> <span className="minimal-target">/ {grandTargets.quant}</span>
          </div>
          <div className="minimal-progress-track">
            <div className="minimal-progress-fill quant-fill" style={{ width: `${quantPercent}%` }}></div>
          </div>
        </div>

        {/* Slot 2: LRDI / Chemistry / Math */}
        <div className="minimal-metric-card">
          <div className="minimal-metric-header">
            <span className="minimal-metric-title">{secLrdi.cardTitle || `${secLrdi.shortName} ${secLrdi.unit}`}</span>
            <span className="minimal-metric-badge">{lrdiPercent}%</span>
          </div>
          <div className="minimal-metric-number">
            <Counter value={totalLrdidSolved} /> <span className="minimal-target">/ {grandTargets.lrdi}</span>
          </div>
          <div className="minimal-progress-track">
            <div className="minimal-progress-fill lrdi-fill" style={{ width: `${lrdiPercent}%` }}></div>
          </div>
        </div>

        {/* Slot 3: VARC / Math / Biology */}
        <div className="minimal-metric-card">
          <div className="minimal-metric-header">
            <span className="minimal-metric-title">{secVarc.cardTitle || `${secVarc.shortName} ${secVarc.unit}`}</span>
            <span className="minimal-metric-badge">{varcPercent}%</span>
          </div>
          <div className="minimal-metric-number">
            <Counter value={totalVarcSolved} /> <span className="minimal-target">/ {grandTargets.varc}</span>
          </div>
          <div className="minimal-progress-track">
            <div className="minimal-progress-fill varc-fill" style={{ width: `${varcPercent}%` }}></div>
          </div>
        </div>

        {/* Mocks */}
        <div className="minimal-metric-card">
          <div className="minimal-metric-header">
            <span className="minimal-metric-title">Mock Tests</span>
            <span className="minimal-metric-badge">{mockPercent}%</span>
          </div>
          <div className="minimal-metric-number">
            <Counter value={mocksTaken} /> <span className="minimal-target">/ {grandTargets.mocks}</span>
          </div>
          <div className="minimal-progress-track">
            <div className="minimal-progress-fill mock-fill" style={{ width: `${mockPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Activity Consistency & Streak Matrix */}
      <div className="minimal-section-card">
        <div className="minimal-section-header">
          <div>
            <h3 className="minimal-section-title">Study Consistency & Streak Matrix</h3>
            <p className="minimal-section-subtitle">
              Daily preparation activity matrix. Maintain daily momentum across the 16-week curriculum.
            </p>
          </div>
        </div>

        {/* 7-Day Current Week Momentum Heatmap */}
        <WeekContributionHeatmap 
          tracker={tracker}
          startDateStr={settings?.startDate}
          onNavigateToDay={(month, week, day) => {
            if (onNavigateToDay) {
              onNavigateToDay(month, week, day);
            } else {
              setActiveTab('daily');
            }
          }}
        />

        <div className="dashboard-heatmap-dual-row">
          <div className="heatmap-matrix-left-col">
            <StudyContributionHeatmap tracker={tracker} compact={false} />
          </div>

          <div className="streak-analytics-right-col">
            <div className="minimal-streak-box">
              <div className="streak-box-label">
                <Icons.Flame size={14} color="#ff3344" />
                <span>ACTIVE STREAK</span>
              </div>
              <div className="streak-box-value">
                <Counter value={activeStreak} /> <span className="streak-box-unit">{activeStreak === 1 ? 'Day' : 'Days'}</span>
              </div>
              <div className="streak-box-desc">
                {activeStreak > 0 ? "Momentum active! Keep the streak alive." : "Complete today's drill to start your streak."}
              </div>
            </div>

            <div className="minimal-streak-box">
              <div className="streak-box-label">
                <Icons.Calendar size={14} color="#38bdf8" />
                <span>CONSISTENCY RECORD</span>
              </div>
              <div className="streak-box-value">
                <Counter value={allDaysChronological.filter(d => d.isDone).length} /> <span className="streak-box-unit">/ 112 Days</span>
              </div>
              <div className="streak-box-desc">
                Total active practice days logged across 4 curriculum months.
              </div>
            </div>

            <button 
              type="button"
              className="minimal-perks-btn"
              onClick={() => setActiveTab('achievements')}
              title="View your prestige achievement badges"
            >
              <div className="perks-btn-text">
                <Icons.Award size={14} color="#eab308" />
                <span>Prestige Badges & Perks</span>
              </div>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Phase & Focus */}
      <div className="minimal-section-card">
        <div className="minimal-section-header">
          <div>
            <h3 className="minimal-section-title">Current Study Focus</h3>
            <p className="minimal-section-subtitle">Active curriculum syllabus milestones and target areas.</p>
          </div>
          {activeWeek && (
            <span className="minimal-phase-pill">
              {activeWeek.week} • {activeWeek.phase}
            </span>
          )}
        </div>

        {activeWeek ? (
          <div className="minimal-focus-grid">
            <div className="minimal-focus-tile">
              <span className="focus-tile-subject">Quantitative Aptitude</span>
              <span className="focus-tile-detail">{activeWeek.quantFocus || "Formula revision & concept practice"}</span>
            </div>

            <div className="minimal-focus-tile">
              <span className="focus-tile-subject">LRDI Practice</span>
              <span className="focus-tile-detail">{activeWeek.lrdiFocus || "Set selection & speed practice"}</span>
            </div>

            <div className="minimal-focus-tile">
              <span className="focus-tile-subject">VARC Sectionals</span>
              <span className="focus-tile-detail">{activeWeek.varcFocus || "Mock analytics & VA grammar"}</span>
            </div>
          </div>
        ) : (
          <p className="empty-state">No active focus found. Mark a week as "In Progress" in the timeline plan.</p>
        )}
      </div>
    </div>
  );
}

export default React.memo(DashboardView);
