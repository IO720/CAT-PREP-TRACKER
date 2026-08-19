import React, { useState } from 'react';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { calculateUserBadges } from '../utils/badgeUtils';

export default function AspirantProfileCard({
  profile = {},
  isSelf = false,
  onEditProfile = null,
  onMessagePeer = null,
  onViewAchievements = null,
  compact = false
}) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [activeBadgeTooltip, setActiveBadgeTooltip] = useState(null);

  const displayName = profile.displayName || profile.name || (isSelf ? 'You' : 'Aspirant');
  const avatar = profile.avatar || 'rocket';
  const avatarBg = profile.avatarBg || '#5865f2';
  const bannerBg = profile.bannerBg || '';
  const bio = profile.bio || '';
  const location = profile.location || '';
  const aspirantId = profile.aspirantId || '';
  const target = profile.target || 'CAT Aspirant';
  const streak = profile.streak || 0;
  const solvedQs = profile.solvedQs || 0;
  const mocksCount = profile.mocksCount || 0;
  const tracker = profile.tracker || null;
  const status = profile.status || 'offline';

  const handleText = target ? `${target}` : '@aspirant';

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (!aspirantId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(aspirantId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const badges = calculateUserBadges({ streak, solvedQs, mocksCount });
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div 
      className={`profile-card-container ${compact ? 'compact' : ''}`}
      onClick={() => setActiveBadgeTooltip(null)}
    >
      {/* Top Banner Header */}
      {(() => {
        const isImageOrGifBanner = bannerBg && (
          bannerBg.startsWith('data:image') || 
          bannerBg.startsWith('http') || 
          bannerBg.startsWith('/') ||
          bannerBg.includes('.gif') ||
          bannerBg.includes('.png') ||
          bannerBg.includes('.jpg') ||
          bannerBg.includes('.webp')
        );

        return (
          <div 
            className="profile-card-banner-header"
            style={{
              backgroundColor: '#121316',
              backgroundImage: isImageOrGifBanner 
                ? `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.45)), url("${bannerBg}")`
                : `linear-gradient(135deg, ${bannerBg || avatarBg || '#1e1f22'} 0%, #0f1012 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="profile-card-banner-badge">
              <Icons.Shield size={12} />
              <span>CATalyze Verified</span>
            </div>
          </div>
        );
      })()}

      {/* Main Profile Content */}
      <div className="profile-card-body">
        {/* Overlapping Avatar Header */}
        <div className="profile-card-avatar-row">
          <div className="profile-card-avatar-wrapper">
            <AvatarRenderer 
              avatar={avatar}
              name={displayName}
              avatarBg={avatarBg}
              size={compact ? 56 : 72}
              status={status}
            />
          </div>

          {/* Action Buttons */}
          <div className="profile-card-top-actions">
            {isSelf ? (
              onEditProfile && (
                <button 
                  type="button" 
                  className="profile-card-action-btn primary"
                  onClick={onEditProfile}
                >
                  <Icons.Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
              )
            ) : (
              onMessagePeer && (
                <button 
                  type="button" 
                  className="profile-card-action-btn primary"
                  onClick={onMessagePeer}
                >
                  <Icons.MessageSquare size={13} />
                  <span>Message</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Identity & Location */}
        <div className="profile-card-identity-section">
          <div className="profile-card-display-name-row">
            <h2 className="profile-card-display-name">{displayName}</h2>
            {isSelf && <span className="profile-card-self-pill">YOU</span>}
          </div>
          <div className="profile-card-handle-row">
            <span className="profile-card-username">{handleText}</span>
            {aspirantId && (
              <button 
                type="button"
                onClick={handleCopyId}
                className="aspirant-id-badge-pill"
                title="Click to copy Unique Aspirant ID"
              >
                <Icons.Hash size={10} />
                <span>{aspirantId}</span>
                {copiedId ? (
                  <span className="copied-inline-tag"><Icons.Check size={9} /> Copied</span>
                ) : (
                  <Icons.Copy size={10} className="copy-icon-subtle" />
                )}
              </button>
            )}
            {location && (
              <>
                <span className="profile-card-dot-separator">•</span>
                <span className="profile-card-location">
                  <Icons.MapPin size={10} /> {location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="profile-card-divider" />

        {/* About Me */}
        <div className="profile-card-info-block">
          <div className="profile-card-section-header">ABOUT ME</div>
          <div className="profile-card-bio-text">
            {bio || "Consistent daily practice, mocks analysis & speed building."}
          </div>
        </div>

        {/* 3-Column Clean Preparation Stats */}
        <div className="profile-card-info-block">
          <div className="profile-card-section-header">PREPARATION STATS</div>
          <div className="profile-card-stats-grid-3col">
            <div className="profile-card-stat-cell">
              <div className="profile-card-stat-title">
                <Icons.Flame size={11} color="#f97316" /> CURRENT STREAK
              </div>
              <div className="profile-card-stat-number">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
            </div>

            <div className="profile-card-stat-cell">
              <div className="profile-card-stat-title">
                <Icons.Target size={11} color="#3b82f6" /> QUESTIONS SOLVED
              </div>
              <div className="profile-card-stat-number">{solvedQs ? solvedQs.toLocaleString() : '0'} Qs</div>
            </div>

            <div className="profile-card-stat-cell">
              <div className="profile-card-stat-title">
                <Icons.BookOpen size={11} color="#10b981" /> MOCKS TAKEN
              </div>
              <div className="profile-card-stat-number">{mocksCount} / 30</div>
            </div>
          </div>
        </div>

        {/* Badges & Collectible Perks Section */}
        <div className="profile-card-info-block">
          <div 
            className="profile-card-section-header-row"
            onClick={onViewAchievements}
            style={onViewAchievements ? { cursor: 'pointer' } : undefined}
            title={onViewAchievements ? "View All Achievements & Badges" : undefined}
          >
            <span className="profile-card-section-header">COLLECTED PERKS & BADGES</span>
            <span className="badge-count-pill" style={onViewAchievements ? { cursor: 'pointer', transition: 'all 0.2s' } : undefined}>
              {unlockedCount} / {badges.length} Unlocked {onViewAchievements ? '→' : ''}
            </span>
          </div>

          {unlockedCount === 0 ? (
            <div className="no-badges-unlocked-row">
              <span className="no-badges-text">No badges unlocked yet • Complete daily drills & mocks to collect badges!</span>
            </div>
          ) : unlockedCount === badges.length && badges.length > 0 ? (
            /* Special Single Grandmaster Badge if all 10 collected */
            <div className="profile-badges-emblems-track grandmaster-mode">
              <div className="badge-emblem-interactive-wrap">
                <div className="profile-badge-emblem-tile grandmaster-crest-tile" style={{ '--badge-glow-color': '#eab308' }}>
                  <div className="badge-emblem-svg-icon" style={{ color: '#eab308' }}>
                    <Icons.Trophy size={20} />
                  </div>
                  <span className="badge-emblem-active-pip" style={{ backgroundColor: '#eab308' }} />
                </div>

                <div className="badge-animated-hover-card" style={{ '--badge-card-accent': '#eab308' }}>
                  <div className="hover-card-title-row">
                    <span className="hover-card-icon" style={{ color: '#eab308' }}>
                      <Icons.Trophy size={14} />
                    </span>
                    <span className="hover-card-name" style={{ color: '#eab308' }}>
                      Omni Grandmaster Crest
                    </span>
                    <span className="hover-card-status-tag unlocked">
                      {badges.length}/{badges.length} UNLOCKED
                    </span>
                  </div>
                  <div className="hover-card-perk-title">Complete Preparation Mastery</div>
                  <div className="hover-card-description">
                    Collected all {badges.length} consistency, drill, and mock test achievement badges!
                  </div>
                </div>
              </div>
              <span className="grandmaster-badge-label">Omni Grandmaster (100% Mastery)</span>
            </div>
          ) : (
            /* Only show badges the user has unlocked */
            <div className="profile-badges-emblems-track">
              {badges.filter(b => b.isUnlocked).map((badge) => {
                const IconComp = Icons[badge.iconName] || Icons.Award;
                const isActive = activeBadgeTooltip === badge.id;
                return (
                  <div 
                    key={badge.id} 
                    className={`badge-emblem-interactive-wrap ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBadgeTooltip(isActive ? null : badge.id);
                    }}
                  >
                    <div
                      className="profile-badge-emblem-tile unlocked"
                      style={{
                        '--badge-glow-color': badge.color
                      }}
                    >
                      <div className="badge-emblem-svg-icon" style={{ color: badge.color }}>
                        <IconComp size={18} />
                      </div>
                      <span className="badge-emblem-active-pip" style={{ backgroundColor: badge.color }} />
                    </div>

                    {/* Special Animated Hover Text Card */}
                    <div className="badge-animated-hover-card" style={{ '--badge-card-accent': badge.color }}>
                      <div className="hover-card-title-row">
                        <span className="hover-card-icon" style={{ color: badge.color }}>
                          <IconComp size={14} />
                        </span>
                        <span className="hover-card-name" style={{ color: badge.color }}>
                          {badge.name}
                        </span>
                        <span className="hover-card-status-tag unlocked">
                          Unlocked
                        </span>
                      </div>
                      <div className="hover-card-perk-title">{badge.perkTitle}</div>
                      <div className="hover-card-description">{badge.description}</div>
                      <div className="hover-card-metric-footer" style={{ marginTop: '4px' }}>
                        <span>Milestone: {badge.threshold} {badge.metricType === 'streak' ? 'Days' : badge.metricType === 'mocksCount' ? 'Mocks' : 'Qs'}</span>
                        <span style={{ color: '#22c55e' }}>Achieved</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Toggleable Contribution Matrix Button */}
        {tracker && (
          <div className="profile-card-info-block" style={{ marginBottom: '4px' }}>
            <button
              type="button"
              className="profile-card-toggle-heatmap-btn"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Icons.Calendar size={13} />
              <span>{showHeatmap ? 'Hide Contribution Heatmap' : 'View Study Contribution Heatmap'}</span>
              <Icons.ChevronRight size={13} className={`chevron-rotate ${showHeatmap ? 'open' : ''}`} />
            </button>

            {showHeatmap && (
              <div className="profile-embedded-heatmap-wrap animate-fade-in">
                <StudyContributionHeatmap 
                  tracker={tracker}
                  readOnly={true}
                  compact={true}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
