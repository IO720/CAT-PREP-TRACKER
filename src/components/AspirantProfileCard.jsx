import React, { useState, useMemo } from 'react';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { calculateUserBadges } from '../utils/badgeUtils';
import { AVATAR_FRAMES, PROFILE_BANNERS, getEffectiveFrameId, getEffectiveBannerId } from '../data/cosmeticsData';
import MythicBannerOverlay from './MythicBannerOverlay';
import { AnimatedSparkleIcon } from './AnimatedUiIcons';
import { calculateLevelFromExp, getExpProgress } from '../utils/expSystem';

/**
 * AspirantProfileCard - Spacious Esports Tactical Operative Profile
 * Features:
 * - Panoramic, de-cluttered layout with generous breathing room
 * - Unlockable Special Avatar Frames & Animated Banners (with GIF support)
 * - Clean, spacious EXP Progression Bar
 * - Wide 3-column Apex Legends Stat Trackers
 * - Fluid tab transitions with active indicator sliding
 */
export default function AspirantProfileCard({
  user,
  profile,
  isSelf = false,
  onEditProfile,
  onMessagePeer,
  onClose,
  compact = false,
  tracker = null,
  showcaseBadges = null
}) {
  const [activeTab, setActiveTab] = useState('trackers'); // 'trackers' | 'syllabus' | 'heatmap'
  const [showCosmeticsModal, setShowCosmeticsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [activeBadgeTooltip, setActiveBadgeTooltip] = useState(null);

  const displayName = profile?.displayName || user?.displayName || 'Aspirant';
  const username = profile?.target || 'CAT 2025';
  const location = profile?.location || '';
  const avatar = profile?.avatar || 'rocket';
  const avatarBg = profile?.avatarBg || '#0284c7';
  const bio = profile?.bio || '';
  const streak = profile?.streak || user?.streak || 0;
  const solvedQs = profile?.solvedQs || user?.solvedQs || 0;
  const mocksCount = profile?.mocksCount || user?.mocksCount || 0;
  const status = profile?.status || 'offline';
  const aspirantId = profile?.aspirantId || user?.aspirantId || '';

  const totalQuant = tracker?.totals?.quant || profile?.quant || 0;
  const totalLrdi = tracker?.totals?.lrdi || profile?.lrdi || 0;
  const totalVarc = tracker?.totals?.varc || profile?.varc || 0;
  const grandTargets = { quant: 2500, lrdi: 500, varc: 500 };

  // RPG Gaming Engine (Level & EXP) - Unified with expSystem (strictly defaults to Level 1 / 0 EXP for new users)
  const rawExp = profile?.exp !== undefined 
    ? profile.exp 
    : (user?.exp !== undefined ? user.exp : 0);
  const totalExp = Math.max(0, Number(rawExp) || 0);
  const progressData = getExpProgress(totalExp);
  const level = profile?.level !== undefined 
    ? Math.max(1, Number(profile.level) || 1) 
    : (progressData.currentLevel || 1);
  const currentExpInLevel = progressData.expIntoLevel;
  const expNeeded = progressData.expNeededForNext;
  const expProgress = progressData.progressPercent;

  // Equipped Cosmetics (strictly validated against level: defaults to 'default' and 'cyber_grid' for Level 1)
  const candidateFrameId = profile?.frameId || user?.frameId || 'default';
  const equippedFrameId = getEffectiveFrameId(candidateFrameId, level);
  const candidateBannerId = profile?.bannerId || user?.bannerId || 'cyber_grid';
  const equippedBannerId = getEffectiveBannerId(candidateBannerId, level);
  const customBannerUrl = profile?.bannerUrl || profile?.bannerBg;

  let classTitle = 'SCHOLAR OPERATIVE';
  let tierRank = 'BRONZE III';
  let tierColor = '#94a3b8';

  if (level >= 50) {
    classTitle = 'IMMORTAL ACHIEVER';
    tierRank = 'IMMORTAL I';
    tierColor = '#fb7185';
  } else if (level >= 40) {
    classTitle = 'TRANSCENDENT SCHOLAR';
    tierRank = 'TRANSCENDENT I';
    tierColor = '#f43f5e';
  } else if (level >= 30) {
    classTitle = 'MYTHIC SOVEREIGN';
    tierRank = 'MYTHIC I';
    tierColor = '#ec4899';
  } else if (level >= 20) {
    classTitle = 'OMNI GRANDMASTER';
    tierRank = 'GRANDMASTER I';
    tierColor = '#fb7185';
  } else if (level >= 15) {
    classTitle = 'PERCENTILE WARLORD';
    tierRank = 'DIAMOND I';
    tierColor = '#38bdf8';
  } else if (level >= 10) {
    classTitle = 'QUANT SPELLBLADE';
    tierRank = 'PLATINUM II';
    tierColor = '#a855f7';
  } else if (level >= 5) {
    classTitle = 'STREAK CRUSADER';
    tierRank = 'GOLD III';
    tierColor = '#eab308';
  } else if (level >= 2) {
    classTitle = 'TACTICAL ASPIRANT';
    tierRank = 'SILVER I';
    tierColor = '#38bdf8';
  } else {
    classTitle = 'SCHOLAR OPERATIVE';
    tierRank = 'NOVICE I';
    tierColor = '#94a3b8';
  }

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (!aspirantId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(aspirantId);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleText = username ? (username.startsWith('@') ? username : `@${username}`) : '@aspirant';
  const badges = calculateUserBadges({ streak, solvedQs, mocksCount });
  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const displayBadges = (showcaseBadges && showcaseBadges.length > 0) ? showcaseBadges : badges.slice(0, 4);

  // Active banner resolution
  const activeBannerPreset = PROFILE_BANNERS.find(b => b.id === equippedBannerId) || PROFILE_BANNERS[0];
  const isGifOrImgBanner = customBannerUrl && (customBannerUrl.startsWith('http') || customBannerUrl.startsWith('data:image'));

  return (
    <div 
      className={`panoramic-operative-card ${compact ? 'compact' : ''}`}
      onClick={() => setActiveBadgeTooltip(null)}
    >
      {/* 1. PANORAMIC ANIMATED BANNER HERO */}
      <div 
        className={`panoramic-banner-canvas ${activeBannerPreset.overlayClass || ''}`}
        style={{
          background: isGifOrImgBanner ? undefined : activeBannerPreset.bg,
          backgroundImage: isGifOrImgBanner ? `url(${customBannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="panoramic-banner-scrim" />
        {!isGifOrImgBanner && <MythicBannerOverlay bannerId={activeBannerPreset.id} />}

        {/* Top Floating Controls on Banner */}
        <div className="panoramic-top-row">
          <div className="panoramic-rank-chip font-mono" style={{ borderColor: tierColor, color: tierColor }}>
            <Icons.Shield size={12} />
            <span>{tierRank}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {aspirantId && (
              <button 
                type="button"
                onClick={handleCopyId}
                className="panoramic-id-pill font-mono"
                title="Click to copy Aspirant ID"
              >
                <span>{aspirantId}</span>
                {copiedId ? <Icons.Check size={10} /> : <Icons.Copy size={10} />}
              </button>
            )}

            {onClose && (
              <button 
                type="button" 
                className="panoramic-close-btn" 
                onClick={onClose} 
                title="Close Profile"
              >
                <Icons.Close size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Hero Character & Details Overlay */}
        <div className="panoramic-hero-info-row">
          {/* Avatar with Special Unlocked Frame */}
          <div className="panoramic-avatar-slot">
            <AvatarRenderer 
              avatar={avatar}
              name={displayName}
              avatarBg={avatarBg}
              size={compact ? 68 : 84}
              status={status}
              frameId={equippedFrameId}
            />
            {/* Level Crest Badge */}
            <div className="panoramic-lvl-crest font-mono">
              <AnimatedSparkleIcon size={12} color="#fbbf24" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '3px' }} />
              <span>LVL {level}</span>
            </div>
          </div>

          {/* Callsign & Spec Titles */}
          <div className="panoramic-titles-block">
            <div className="panoramic-spec-strip">
              <span className="panoramic-spec-badge font-mono">{classTitle}</span>
              <span className="panoramic-target-tag font-mono">{handleText}</span>
            </div>

            <h2 className="panoramic-callsign-name">{displayName}</h2>

            {bio && (
              <p className="panoramic-quote-text">
                "{bio}"
              </p>
            )}
          </div>

          {/* Action Button: Loadout / Transmit */}
          <div className="panoramic-action-slot">
            {isSelf ? (
              <button 
                type="button" 
                className="panoramic-loadout-btn font-mono"
                onClick={onEditProfile || (() => setShowCosmeticsModal(true))}
              >
                <Icons.Edit3 size={13} />
                <span>LOADOUT CONFIG</span>
                <span className="btn-arrow">↗</span>
              </button>
            ) : onMessagePeer && (
              <button 
                type="button" 
                className="panoramic-loadout-btn font-mono"
                onClick={() => onMessagePeer(profile)}
              >
                <Icons.MessageSquare size={13} />
                <span>DIRECT COMMS</span>
                <span className="btn-arrow">↗</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SPACIOUS & CLEAN EXP PROGRESSION BAR */}
      <div className="panoramic-exp-section">
        <div className="panoramic-exp-header font-mono">
          <div className="exp-lead">
            <span className="exp-tag">EXP</span>
            <span className="exp-title">LEVEL {level} PROGRESSION</span>
          </div>
          <div className="exp-stats">
            <span className="exp-count">{currentExpInLevel.toLocaleString()} / {expNeeded.toLocaleString()} XP</span>
            <span className="exp-percent">{expProgress}%</span>
          </div>
        </div>

        <div className="panoramic-exp-track">
          <div 
            className="panoramic-exp-fill" 
            style={{ width: `${expProgress}%` }}
          >
            <div className="exp-shine-edge" />
          </div>
        </div>

        <div className="panoramic-exp-footer font-mono">
          <span>STREAK MULTIPLIER: x{(1 + streak * 0.1).toFixed(1)} ACTIVE</span>
          <span>NEXT ACT MILESTONE: LVL {level + 1}</span>
        </div>
      </div>

      {/* 3. FLUID SEGMENTED TAB SWITCHER */}
      <div className="panoramic-tab-nav font-mono">
        <button
          type="button"
          className={`panoramic-nav-pill ${activeTab === 'trackers' ? 'active' : ''}`}
          onClick={() => setActiveTab('trackers')}
        >
          <Icons.Zap size={13} />
          <span>COMBAT TRACKERS</span>
        </button>
        <button
          type="button"
          className={`panoramic-nav-pill ${activeTab === 'syllabus' ? 'active' : ''}`}
          onClick={() => setActiveTab('syllabus')}
        >
          <Icons.Target size={13} />
          <span>DUNGEON QUOTAS</span>
        </button>
        <button
          type="button"
          className={`panoramic-nav-pill ${activeTab === 'heatmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('heatmap')}
        >
          <Icons.Calendar size={13} />
          <span>STUDY MATRIX</span>
        </button>
      </div>

      {/* 4. FLUID ANIMATED TAB CONTENT */}
      <div className="panoramic-tab-content">
        {/* TAB 1: SPACIOUS 3-COLUMN APEX STAT TRACKERS */}
        {activeTab === 'trackers' && (
          <div className="tab-pane-fluid-enter">
            <div className="panoramic-trackers-grid">
              {/* Tracker 1: Streak */}
              <div className="panoramic-tracker-card streak">
                <div className="tracker-card-icon streak">
                  <Icons.Flame size={20} color="#f97316" />
                </div>
                <div className="tracker-card-body">
                  <span className="tracker-tag-label font-mono">MOMENTUM CHAIN</span>
                  <div className="tracker-number-row font-mono">
                    <span className="tracker-bold-val">{streak}</span>
                    <span className="tracker-unit-str">{streak === 1 ? 'DAY STREAK' : 'DAYS ACTIVE'}</span>
                  </div>
                  <span className="tracker-bonus-sub font-mono">x{(1 + streak * 0.1).toFixed(1)} XP Boost Active</span>
                </div>
              </div>

              {/* Tracker 2: Questions */}
              <div className="panoramic-tracker-card questions">
                <div className="tracker-card-icon questions">
                  <Icons.Target size={20} color="#38bdf8" />
                </div>
                <div className="tracker-card-body">
                  <span className="tracker-tag-label font-mono">QUESTIONS CONQUERED</span>
                  <div className="tracker-number-row font-mono">
                    <span className="tracker-bold-val">{solvedQs.toLocaleString()}</span>
                    <span className="tracker-unit-str">QUESTIONS</span>
                  </div>
                  <span className="tracker-bonus-sub font-mono">QA • DILR • VARC Drills</span>
                </div>
              </div>

              {/* Tracker 3: Mocks */}
              <div className="panoramic-tracker-card mocks">
                <div className="tracker-card-icon mocks">
                  <Icons.BookOpen size={20} color="#10b981" />
                </div>
                <div className="tracker-card-body">
                  <span className="tracker-tag-label font-mono">BOSS BATTLES</span>
                  <div className="tracker-number-row font-mono">
                    <span className="tracker-bold-val">{mocksCount}</span>
                    <span className="tracker-unit-str">/ 30 MOCKS</span>
                  </div>
                  <span className="tracker-bonus-sub font-mono">Full CAT Benchmarks</span>
                </div>
              </div>
            </div>

            {/* Top 3 Featured Showcase Medals Rack */}
            <div className="panoramic-medals-rack">
              <div className="medals-rack-top font-mono">
                <span>PINNED ARTIFACT MEDALS</span>
                <span className="medals-count">{unlockedBadges.length} / {badges.length} UNLOCKED</span>
              </div>

              <div className="medals-pins-row">
                {displayBadges.map((badge) => {
                  const IconComp = Icons[badge.iconName] || Icons.Award;
                  const isUnlocked = badge.isUnlocked;

                  return (
                    <div 
                      key={badge.id}
                      className={`panoramic-pin-slot ${isUnlocked ? 'unlocked' : 'locked'}`}
                      onClick={() => setActiveBadgeTooltip(activeBadgeTooltip === badge.id ? null : badge.id)}
                      title={badge.name}
                    >
                      <div className="pin-medal-body" style={isUnlocked ? { '--medal-color': badge.color } : undefined}>
                        <div className="pin-glyph" style={{ color: isUnlocked ? badge.color : '#475569' }}>
                          <IconComp size={18} />
                        </div>
                        <span className="pin-title font-mono">{badge.name}</span>
                        {isUnlocked ? (
                          <span className="pin-core-dot" style={{ backgroundColor: badge.color }} />
                        ) : (
                          <span className="pin-lock-lbl font-mono">LOCKED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DUNGEON QUOTAS */}
        {activeTab === 'syllabus' && (
          <div className="tab-pane-fluid-enter">
            <div className="syllabus-cards-container" style={{ margin: 0 }}>
              <div className="syllabus-progress-card quant-theme">
                <div className="syllabus-label-row">
                  <div className="syllabus-sub-title">
                    <span className="syllabus-icon-badge quant-badge"><Icons.Calculator size={13} /></span>
                    <span className="syllabus-subject-name font-mono">QUANTITATIVE LABYRINTH</span>
                  </div>
                  <div className="syllabus-stats-badge font-mono">
                    <span className="syllabus-count-val">{totalQuant.toLocaleString()} / {grandTargets.quant.toLocaleString()} Qs</span>
                    <span className="syllabus-percent-pill quant-pill">
                      {Math.min(100, Math.round((totalQuant / grandTargets.quant) * 100))}%
                    </span>
                  </div>
                </div>
                <div className="syllabus-track">
                  <div 
                    className="syllabus-fill quant" 
                    style={{ width: `${Math.min(100, Math.round((totalQuant / grandTargets.quant) * 100))}%` }} 
                  />
                </div>
              </div>

              <div className="syllabus-progress-card lrdi-theme">
                <div className="syllabus-label-row">
                  <div className="syllabus-sub-title">
                    <span className="syllabus-icon-badge lrdi-badge"><Icons.Puzzle size={13} /></span>
                    <span className="syllabus-subject-name font-mono">DILR LOGIC CRYPT</span>
                  </div>
                  <div className="syllabus-stats-badge font-mono">
                    <span className="syllabus-count-val">{totalLrdi.toLocaleString()} / {grandTargets.lrdi.toLocaleString()} Sets</span>
                    <span className="syllabus-percent-pill lrdi-pill">
                      {Math.min(100, Math.round((totalLrdi / grandTargets.lrdi) * 100))}%
                    </span>
                  </div>
                </div>
                <div className="syllabus-track">
                  <div 
                    className="syllabus-fill lrdi" 
                    style={{ width: `${Math.min(100, Math.round((totalLrdi / grandTargets.lrdi) * 100))}%` }} 
                  />
                </div>
              </div>

              <div className="syllabus-progress-card varc-theme">
                <div className="syllabus-label-row">
                  <div className="syllabus-sub-title">
                    <span className="syllabus-icon-badge varc-badge"><Icons.BookOpen size={13} /></span>
                    <span className="syllabus-subject-name font-mono">VARC COMPREHENSION SPIRE</span>
                  </div>
                  <div className="syllabus-stats-badge font-mono">
                    <span className="syllabus-count-val">{totalVarc.toLocaleString()} / {grandTargets.varc.toLocaleString()} Articles</span>
                    <span className="syllabus-percent-pill varc-pill">
                      {Math.min(100, Math.round((totalVarc / grandTargets.varc) * 100))}%
                    </span>
                  </div>
                </div>
                <div className="syllabus-track">
                  <div 
                    className="syllabus-fill varc" 
                    style={{ width: `${Math.min(100, Math.round((totalVarc / grandTargets.varc) * 100))}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STUDY MATRIX */}
        {activeTab === 'heatmap' && (
          <div className="tab-pane-fluid-enter">
            <div style={{ background: 'rgba(10, 15, 26, 0.7)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {tracker ? (
                <StudyContributionHeatmap tracker={tracker} compact={true} />
              ) : (
                <div className="empty-state" style={{ padding: '16px', fontSize: '12px', textAlign: 'center' }}>
                  Study matrix telemetry synchronized with local clock.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BARCODE CHECK */}
      <div className="panoramic-footer font-mono">
        <span className="panoramic-barcode">||| | || ||||| | ||| || ||||</span>
        <span>CATALYZE COMMAND HUB // PROTOCOL v3.0</span>
      </div>
    </div>
  );
}
