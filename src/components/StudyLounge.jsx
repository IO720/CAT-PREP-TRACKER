import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Icons } from './AspirantIcons';
import AvatarRenderer from './AvatarRenderer';
import { 
  AnimatedCrownIcon, 
  AnimatedLightningIcon, 
  AnimatedSwordsIcon, 
  AnimatedFlameIcon 
} from './AnimatedUiIcons';
import { 
  MOCK_COMMUNITY_STATS, 
  MOCK_LEADERBOARD_ASPIRANTS 
} from '../data/leaderboardData';
import SmoothCaretInput from './animations/SmoothCaretInput';

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
  // Navigation & Filters
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'buddies'
  const [timeframe, setTimeframe] = useState('today'); // 'today' | 'weekly' | 'allTime'
  const [selectedTier, setSelectedTier] = useState('ALL'); // 'ALL' | 'Diamond' | 'Platinum' | 'Gold'
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingAspirant, setInspectingAspirant] = useState(null);

  // Container ref for GSAP scoped animations
  const arenaContainerRef = useRef(null);

  // Live battle ticker index simulation
  const [tickerIndex, setTickerIndex] = useState(0);

  const LIVE_BATTLE_EVENTS = [
    { name: 'Ananya V.', event: 'logged 2.4h Quant Sectional', score: '+45 pts', time: '1m ago' },
    { name: 'Rohan I.', event: 'cleared DILR Games & Tournaments', score: '+30 pts', time: '3m ago' },
    { name: 'Kabir M.', event: 'extended streak to 25 Days', score: '2.5x Multiplier', time: '6m ago' },
    { name: 'Shreya S.', event: 'completed 3/3 Daily Quotas', score: '+60 pts', time: '9m ago' },
    { name: 'Vikramaditya', event: 'climbed 3 ranks to #6', score: '+75 pts', time: '12m ago' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_BATTLE_EVENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // GSAP animations on tier or timeframe switch
  useEffect(() => {
    if (!arenaContainerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.podium-pillar',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.ladder-match-row',
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.035, ease: 'power1.out' }
      );
    }, arenaContainerRef);

    return () => ctx.revert();
  }, [selectedTier, timeframe]);

  // User live activity
  const isUserStudying = timerState && (timerState.isRunning || timerState.isPaused);
  const userTodayHours = userProfile?.studyHoursToday || 0.4;
  const userStreak = userProfile?.streak || 2;
  const userSolvedQs = userProfile?.solvedQs || 54;
  const userName = userProfile?.displayName || currentUser?.displayName || 'You';

  // Current user standing
  const currentUserRecord = useMemo(() => ({
    id: currentUser?.uid || 'self',
    isSelf: true,
    rank: 11,
    name: userName,
    aspirantId: userProfile?.aspirantId || 'CAT-YOU',
    targetIIM: userProfile?.target || 'IIM Ahmedabad',
    percentile: 96.4,
    studyHoursToday: isUserStudying ? userTodayHours + 0.2 : userTodayHours,
    weeklyHours: 14.8,
    allTimeHours: 64.0,
    drillsCompleted: 1,
    drillsTotal: 3,
    streak: userStreak,
    solvedQs: userSolvedQs,
    tier: 'Gold',
    status: isUserStudying ? 'studying' : 'ready',
    subject: (timerState?.subject || 'QUANT').toUpperCase(),
    activeTask: isUserStudying ? `${timerState?.subject || 'Quant'} Focus Session` : '1 / 3 Daily Quotas Conquered',
    avatarBg: userProfile?.avatarBg || '#5865f2',
    trend: 'up',
    trendDiff: 1
  }), [currentUser, userProfile, timerState, isUserStudying, userTodayHours, userStreak, userSolvedQs, userName]);

  // Next rival immediately ahead of the user
  const nextRival = MOCK_LEADERBOARD_ASPIRANTS.find((a) => a.rank === 10) || MOCK_LEADERBOARD_ASPIRANTS[9];

  // Filtered leaderboard
  const filteredAspirants = useMemo(() => {
    return MOCK_LEADERBOARD_ASPIRANTS.filter((a) => {
      if (selectedTier !== 'ALL' && a.tier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${a.name} ${a.aspirantId} ${a.targetIIM} ${a.subject}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [selectedTier, searchQuery]);

  // Top 3 Podium
  const top1 = MOCK_LEADERBOARD_ASPIRANTS[0];
  const top2 = MOCK_LEADERBOARD_ASPIRANTS[1];
  const top3 = MOCK_LEADERBOARD_ASPIRANTS[2];

  // Ranks 4+
  const ladderRoster = filteredAspirants.filter((a) => a.rank > 3);

  const activeEvent = LIVE_BATTLE_EVENTS[tickerIndex];

  return (
    <div ref={arenaContainerRef} className="battleground-arena-wrapper fade-in">
      
      {/* 1. WAR ROOM COMMAND MARQUEE (NO GENERIC HERO BOX) */}
      <div className="war-room-header-strip">
        <div className="war-room-meta-col">
          <div className="battle-season-badge">
            <span className="live-radar-ping"></span>
            <span className="season-txt">RANKED LADDER • SEASON 2026</span>
            <span className="arena-live-count">{MOCK_COMMUNITY_STATS.activeStudyingNow} COMBATANTS IN SESSION</span>
          </div>

          <h1 className="battleground-title">
            ASPIRANT <span className="title-highlight">BATTLEGROUND</span>
          </h1>

          {/* Live Activity Ticker */}
          <div className="battle-live-ticker">
            <span className="ticker-tag">LIVE TICKER</span>
            <div className="ticker-content" key={tickerIndex}>
              <span className="ticker-name">{activeEvent.name}</span>
              <span className="ticker-event">{activeEvent.event}</span>
              <span className="ticker-score">{activeEvent.score}</span>
              <span className="ticker-time">• {activeEvent.time}</span>
            </div>
          </div>
        </div>

        {/* Rival Overtake Challenge Card */}
        <div className="rival-overtake-widget">
          <div className="rival-widget-header">
            <span className="widget-label">TARGET TO OVERTAKE</span>
            <span className="widget-gap-pill">GAP: 0.8 HRS</span>
          </div>

          <div className="rival-versus-row">
            {/* You */}
            <div className="versus-player you">
              <span className="versus-rank">#11</span>
              <span className="versus-name">YOU</span>
              <span className="versus-stat">{currentUserRecord.studyHoursToday.toFixed(1)}h today</span>
            </div>

            {/* Clashing Swords Animation */}
            <div className="versus-sword-divider">
              <AnimatedSwordsIcon size={18} />
            </div>

            {/* Rival */}
            <div className="versus-player rival">
              <span className="versus-rank">#10</span>
              <span className="versus-name">{nextRival.name.split(' ')[0]}</span>
              <span className="versus-stat">{nextRival.studyHoursToday}h today</span>
            </div>
          </div>

          {onNavigateToTimer && (
            <button
              type="button"
              className="rival-challenge-btn"
              onClick={onNavigateToTimer}
            >
              <AnimatedLightningIcon size={14} color="#ffffff" />
              <span>{isUserStudying ? 'Push Ahead in Timer' : 'Overtake Rank #10'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ESPORTS RANKED PODIUM STAGE (PHYSICAL TIERED PODIUM STEPS) */}
      <div className="ranked-podium-stage">
        
        {/* RANK 2 - SILVER PILLAR */}
        {top2 && (
          <div 
            className="podium-pillar rank-2"
            onClick={() => setInspectingAspirant(top2)}
          >
            <div className="pillar-step-pedestal silver">
              <div className="pedestal-rank-tag">
                <Icons.Award size={13} />
                <span>#2 SILVER</span>
              </div>
              <div className="pedestal-avatar-frame silver">
                <AvatarRenderer 
                  name={top2.name}
                  avatarBg={top2.avatarBg}
                  size={52}
                  status={top2.status}
                />
              </div>
              <h3 className="pillar-player-name">{top2.name}</h3>
              <span className="pillar-target-tag">{top2.targetIIM}</span>
              
              <div className="pillar-elo-score">
                <span className="elo-val">{top2.percentile}%</span>
                <span className="elo-lbl">TIER PERCENTILE</span>
              </div>

              <div className="pillar-stat-chips">
                <span className="stat-chip">{top2.studyHoursToday}h Today</span>
                <span className="stat-chip flame">
                  <AnimatedFlameIcon size={12} />
                  <span>{top2.streak}d Streak</span>
                </span>
              </div>
              <div className="pillar-base-block silver">2</div>
            </div>
          </div>
        )}

        {/* RANK 1 - CHAMPION GOLD PILLAR (TALL & ELEVATED WITH LIVING CROWN) */}
        {top1 && (
          <div 
            className="podium-pillar rank-1 champion"
            onClick={() => setInspectingAspirant(top1)}
          >
            <div className="pillar-step-pedestal gold">
              <div className="pedestal-crown-halo">
                <AnimatedCrownIcon size={20} />
                <span>#1 APEX CHAMPION</span>
              </div>
              <div className="pedestal-avatar-frame gold">
                <AvatarRenderer 
                  name={top1.name}
                  avatarBg={top1.avatarBg}
                  size={64}
                  status={top1.status}
                />
              </div>
              <h3 className="pillar-player-name apex">{top1.name}</h3>
              <span className="pillar-target-tag gold">{top1.targetIIM}</span>
              
              <div className="pillar-elo-score gold">
                <span className="elo-val gold">{top1.percentile}%</span>
                <span className="elo-lbl gold">ARENA APEX RATING</span>
              </div>

              <div className="pillar-stat-chips">
                <span className="stat-chip gold">{top1.studyHoursToday}h Focus</span>
                <span className="stat-chip flame">
                  <AnimatedFlameIcon size={12} />
                  <span>{top1.streak}d Streak</span>
                </span>
                <span className="stat-chip green">3/3 Done</span>
              </div>
              <div className="pillar-base-block gold">1</div>
            </div>
          </div>
        )}

        {/* RANK 3 - BRONZE PILLAR */}
        {top3 && (
          <div 
            className="podium-pillar rank-3"
            onClick={() => setInspectingAspirant(top3)}
          >
            <div className="pillar-step-pedestal bronze">
              <div className="pedestal-rank-tag bronze">
                <Icons.Award size={13} />
                <span>#3 BRONZE</span>
              </div>
              <div className="pedestal-avatar-frame bronze">
                <AvatarRenderer 
                  name={top3.name}
                  avatarBg={top3.avatarBg}
                  size={52}
                  status={top3.status}
                />
              </div>
              <h3 className="pillar-player-name">{top3.name}</h3>
              <span className="pillar-target-tag">{top3.targetIIM}</span>
              
              <div className="pillar-elo-score">
                <span className="elo-val">{top3.percentile}%</span>
                <span className="elo-lbl">TIER PERCENTILE</span>
              </div>

              <div className="pillar-stat-chips">
                <span className="stat-chip">{top3.studyHoursToday}h Today</span>
                <span className="stat-chip flame">
                  <AnimatedFlameIcon size={12} />
                  <span>{top3.streak}d Streak</span>
                </span>
              </div>
              <div className="pillar-base-block bronze">3</div>
            </div>
          </div>
        )}

      </div>

      {/* 3. COMPETITIVE DIVISION FILTER LADDER */}
      <div className="ranked-ladder-toolbar">
        {/* Tier Division Pills */}
        <div className="division-ladder-pills">
          {[
            { id: 'ALL', label: 'ALL DIVISIONS' },
            { id: 'Diamond', label: 'DIAMOND (99%ile+)' },
            { id: 'Platinum', label: 'PLATINUM (95–99%)' },
            { id: 'Gold', label: 'GOLD (90–95%)' }
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              className={`division-pill-btn ${selectedTier === tier.id ? 'active' : ''} ${tier.id.toLowerCase()}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              <span className="pill-dot" />
              <span>{tier.label}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Sprint Modes */}
        <div className="timeframe-mode-cluster">
          <button
            type="button"
            className={`timeframe-mode-btn ${timeframe === 'today' ? 'active' : ''}`}
            onClick={() => setTimeframe('today')}
          >
            24H BLITZ
          </button>
          <button
            type="button"
            className={`timeframe-mode-btn ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            WEEKLY GAUNTLET
          </button>
          <button
            type="button"
            className={`timeframe-mode-btn ${timeframe === 'allTime' ? 'active' : ''}`}
            onClick={() => setTimeframe('allTime')}
          >
            HALL OF FAME
          </button>
        </div>

        {/* Search Filter with Smooth Caret */}
        <div className="ladder-search-box">
          <Icons.Search size={13} className="ladder-search-ico" />
          <SmoothCaretInput
            type="text"
            placeholder="Search combatant or institute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ladder-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="ladder-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <Icons.Close size={11} />
            </button>
          )}
        </div>
      </div>

      {/* 4. THE RANKED LADDER ROSTER BOARD */}
      <div className="ranked-roster-board">
        <div className="ladder-board-header">
          <span style={{ width: '70px' }}>Rank</span>
          <span style={{ flex: 2 }}>Combatant Profile</span>
          <span style={{ flex: 1 }}>Target Institute</span>
          <span style={{ width: '120px', textAlign: 'center' }}>Focus Fire</span>
          <span style={{ width: '110px', textAlign: 'center' }}>Daily Quota</span>
          <span style={{ width: '100px', textAlign: 'center' }}>Streak</span>
          <span style={{ width: '120px', textAlign: 'right' }}>Percentile</span>
        </div>

        <div className="ladder-board-rows">
          {ladderRoster.map((asp) => {
            const hoursVal = timeframe === 'today' 
              ? `${asp.studyHoursToday} hrs` 
              : timeframe === 'weekly' 
              ? `${asp.weeklyHours} hrs` 
              : `${asp.allTimeHours} hrs`;

            const isStudying = asp.status === 'studying';

            return (
              <div 
                key={asp.id} 
                className="ladder-match-row"
                onClick={() => setInspectingAspirant(asp)}
              >
                {/* Positional Rank */}
                <div className="match-rank-col">
                  <span className="match-rank-num">#{asp.rank}</span>
                  <span className={`match-trend-badge ${asp.trend}`}>
                    {asp.trend === 'up' ? `▲ ${asp.trendDiff || 1}` : asp.trend === 'down' ? `▼ ${Math.abs(asp.trendDiff || 1)}` : '—'}
                  </span>
                </div>

                {/* Combatant Name & Live Action */}
                <div className="match-profile-col">
                  <div className="match-avatar-frame">
                    <AvatarRenderer 
                      name={asp.name}
                      avatarBg={asp.avatarBg}
                      size={38}
                      status={asp.status}
                    />
                  </div>
                  <div className="match-info-meta">
                    <div className="match-name-line">
                      <span className="match-player-name">{asp.name}</span>
                      <span className="match-id-badge">#{asp.aspirantId}</span>
                      <span className={`match-tier-tag ${asp.tier.toLowerCase()}`}>
                        {asp.tier}
                      </span>
                    </div>
                    <div className="match-task-line">
                      {isStudying ? (
                        <span className="match-live-combat">
                          <span className="live-combat-dot" />
                          LIVE: {asp.subject} • {asp.activeTask}
                        </span>
                      ) : (
                        <span className="match-completed-quota">
                          Conquered Quota • {asp.activeTask}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target Institute */}
                <div className="match-target-col">
                  <span className="match-institute-pill">{asp.targetIIM}</span>
                </div>

                {/* Focus Hours */}
                <div className="match-hours-col">
                  <span className="match-hours-val">{hoursVal}</span>
                </div>

                {/* Daily Quota Status */}
                <div className="match-quota-col">
                  <span className={`match-quota-tag ${asp.drillsCompleted === asp.drillsTotal ? 'cleared' : ''}`}>
                    <Icons.Check size={11} />
                    <span>{asp.drillsCompleted}/{asp.drillsTotal} Done</span>
                  </span>
                </div>

                {/* Active Streak with Animated Living Flame */}
                <div className="match-streak-col">
                  <div className="match-streak-badge">
                    <AnimatedFlameIcon size={13} />
                    <span>{asp.streak}d</span>
                  </div>
                </div>

                {/* Percentile Rating */}
                <div className="match-score-col">
                  <span className="match-percentile-num">{asp.percentile}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. STICKY USER BATTLE HUD (ALWAYS VISIBLE AT BOTTOM) */}
      <div className="battleground-sticky-hud">
        <div className="user-hud-left">
          <div className="user-hud-rank-block">
            <span className="hud-label">YOUR RANK</span>
            <span className="hud-rank-number">#{currentUserRecord.rank}</span>
          </div>

          <div className="hud-pipe" />

          <div className="user-hud-identity">
            <div className="hud-identity-top">
              <span className="hud-user-name">{currentUserRecord.name}</span>
              <span className="hud-you-pill">YOU</span>
              <span className="hud-rival-alert">
                • 0.8h to overtake #{nextRival.rank} {nextRival.name.split(' ')[0]}
              </span>
            </div>
            <div className="hud-identity-stats">
              <span><strong>{currentUserRecord.percentile}%</strong> Percentile</span>
              <span>•</span>
              <span><strong>{currentUserRecord.studyHoursToday.toFixed(1)}h</strong> Today</span>
              <span>•</span>
              <span><strong>{currentUserRecord.streak}d</strong> Streak Multiplier</span>
              <span>•</span>
              <span><strong>{currentUserRecord.drillsCompleted}/3</strong> Quotas</span>
            </div>
          </div>
        </div>

        <div className="user-hud-right">
          {onNavigateToTimer && (
            <button
              type="button"
              className="hud-strike-btn"
              onClick={onNavigateToTimer}
            >
              <AnimatedLightningIcon size={14} color="#ffffff" />
              <span>{isUserStudying ? 'Return to Combat Timer' : 'Launch Session & Climb Rank'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. COMBATANT DOSSIER MODAL */}
      {inspectingAspirant && (
        <div 
          className="battle-modal-overlay"
          onClick={() => setInspectingAspirant(null)}
        >
          <div 
            className="battle-dossier-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dossier-modal-head">
              <div className="dossier-player-block">
                <AvatarRenderer 
                  name={inspectingAspirant.name}
                  avatarBg={inspectingAspirant.avatarBg}
                  size={56}
                  status={inspectingAspirant.status}
                />
                <div>
                  <div className="dossier-title-row">
                    <h3>{inspectingAspirant.name}</h3>
                    <span className="dossier-rank-pill">RANK #{inspectingAspirant.rank}</span>
                  </div>
                  <span className="dossier-target-text">{inspectingAspirant.targetIIM} • #{inspectingAspirant.aspirantId}</span>
                </div>
              </div>

              <button 
                type="button" 
                className="dossier-close-btn"
                onClick={() => setInspectingAspirant(null)}
              >
                <Icons.Close size={16} />
              </button>
            </div>

            <div className="dossier-modal-content">
              <div className="dossier-combat-matrix">
                <div className="combat-stat-cell">
                  <span className="stat-name">ESTIMATED PERCENTILE</span>
                  <span className="stat-big-val cyan">{inspectingAspirant.percentile}%</span>
                </div>
                <div className="combat-stat-cell">
                  <span className="stat-name">CURRENT STREAK</span>
                  <span className="stat-big-val amber">{inspectingAspirant.streak} Days</span>
                </div>
                <div className="combat-stat-cell">
                  <span className="stat-name">TODAY'S LOGGED FOCUS</span>
                  <span className="stat-big-val">{inspectingAspirant.studyHoursToday} Hours</span>
                </div>
                <div className="combat-stat-cell">
                  <span className="stat-name">TOTAL DRILLS SOLVED</span>
                  <span className="stat-big-val">{inspectingAspirant.solvedQs} Questions</span>
                </div>
              </div>

              <div className="dossier-mission-log">
                <span className="mission-log-header">MISSION COMBAT LOG</span>
                <p className="mission-log-text">
                  {inspectingAspirant.status === 'studying' 
                    ? `Actively drilling ${inspectingAspirant.subject}: ${inspectingAspirant.activeTask}. Currently holding Rank #${inspectingAspirant.rank} with ${inspectingAspirant.studyHoursToday}h logged.`
                    : `Finished all 3 daily drill objectives. Rank defended with ${inspectingAspirant.studyHoursToday}h today and ${inspectingAspirant.solvedQs} total problems solved.`}
                </p>
              </div>
            </div>

            <div className="dossier-modal-actions">
              <button 
                type="button" 
                className="dossier-dismiss-btn"
                onClick={() => setInspectingAspirant(null)}
              >
                Dismiss
              </button>
              {onNavigateToTimer && (
                <button 
                  type="button" 
                  className="dossier-engage-btn"
                  onClick={() => {
                    setInspectingAspirant(null);
                    onNavigateToTimer();
                  }}
                >
                  <AnimatedLightningIcon size={14} color="#ffffff" />
                  <span>Challenge in Study Timer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
