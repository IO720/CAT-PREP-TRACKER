import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AvatarRenderer from './AvatarRenderer';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { calculateUserBadges } from '../utils/badgeUtils';
import { Icons } from './AspirantIcons';

export default function PeerInspectorModal({ 
  friend, 
  trackerData, 
  loading, 
  onClose,
  onEditProfile,
  currentUser
}) {
  if (!friend) return null;

  const isSelf = Boolean(friend.isSelf || (currentUser && (friend.id === currentUser.uid || friend.uid === currentUser.uid)));
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' | 'heatmap'
  const [activeBadgeTooltip, setActiveBadgeTooltip] = useState(null);

  // Process detailed tracker data if available
  let totalQuant = 0;
  let totalLrdi = 0;
  let totalVarc = 0;
  let completedMocks = [];

  if (trackerData && trackerData.tracker) {
    for (const [_month, weeks] of Object.entries(trackerData.tracker)) {
      weeks.forEach(week => {
        week.days.forEach(day => {
          totalQuant += Number(day.quantCount) || 0;
          totalLrdi += Number(day.lrdiCount) || 0;
          totalVarc += Number(day.varcCount) || 0;
        });
      });
    }

    if (trackerData.mocks) {
      completedMocks = trackerData.mocks.filter(m => m.status === 'Taken');
    }
  }

  const grandTargets = { quant: 3160, lrdi: 650, varc: 620, mocks: 30 };

  const displayName = friend.displayName || friend.name || (isSelf ? 'You' : 'Study Peer');
  const username = friend.username || (friend.email ? friend.email.split('@')[0] : (isSelf ? 'you' : 'peer'));
  const aspirantId = friend.aspirantId || '';
  const avatar = friend.avatar || '';
  const avatarBg = friend.avatarBg || '#5865f2';
  const bannerBg = friend.bannerBg || '#1e1f22';
  const bannerUrl = friend.bannerUrl || '';
  const bio = friend.bio || '';
  const location = friend.location || '';
  const streak = friend.streak !== undefined ? friend.streak : (isSelf ? 1 : 0);
  const solvedQs = (totalQuant + totalLrdi + totalVarc) || friend.solvedQs || 0;
  const mocksCount = completedMocks.length || friend.mocksCount || 0;
  const status = friend.status || (friend.activity?.isRunning ? 'studying' : 'online');

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (!aspirantId) return;
    navigator.clipboard.writeText(aspirantId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleText = username ? (username.startsWith('@') ? username : `@${username}`) : '@peer';

  const badges = calculateUserBadges({ streak, solvedQs, mocksCount });
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="discord-profile-card-container unified-profile-modal-card" 
        onClick={(e) => {
          e.stopPropagation();
          setActiveBadgeTooltip(null);
        }}
      >
        
        {/* Banner Section */}
        <div 
          className="discord-banner" 
          style={{ 
            backgroundColor: bannerBg || '#1e1f22',
            backgroundImage: bannerUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url("${bannerUrl}")` : `linear-gradient(135deg, ${bannerBg || avatarBg || '#1e1f22'} 0%, #0f1012 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Aspiranto Verified Badge */}
          <div className="aspiranto-verified-pill">
            <Icons.Shield size={11} color="#22c55e" />
            <span>Aspiranto Verified</span>
          </div>

          {/* Edit Profile Button for Self */}
          {isSelf && (
            <button
              type="button"
              className="discord-edit-btn"
              onClick={() => {
                onClose();
                if (onEditProfile) onEditProfile();
              }}
              title="Edit Your Profile"
            >
              <Icons.Edit size={12} />
              <span>Edit Profile</span>
            </button>
          )}

          <button 
            type="button" 
            className="unified-modal-close-btn" 
            onClick={onClose} 
            title="Close Profile"
          >
            <Icons.Close size={16} />
          </button>
        </div>

        {/* Unified Profile Body */}
        <div className="unified-profile-body">
          {/* Avatar Row */}
          <div className="discord-avatar-row">
            <div className="discord-avatar-wrapper">
              <AvatarRenderer 
                avatar={avatar}
                name={displayName}
                avatarBg={avatarBg}
                size={70}
                status={status}
              />
            </div>
          </div>

          {/* Identity Info */}
          <div className="discord-identity-section">
            <div className="discord-display-name-row">
              <h2 className="discord-display-name">{displayName}</h2>
              {isSelf && <span className="discord-self-tag" style={{ marginLeft: '8px' }}>YOU</span>}
            </div>
            <div className="discord-handle-row">
              <span className="discord-username">{handleText}</span>
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
                  <span className="discord-dot-separator">•</span>
                  <span className="discord-location">
                    <Icons.MapPin size={10} /> {location}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="discord-card-divider" />

          {/* About Me */}
          {bio && (
            <div className="discord-info-block">
              <div className="discord-section-header">ABOUT ME</div>
              <div className="discord-bio-text">{bio || (isSelf ? 'CAT 2028' : 'CAT Aspirant')}</div>
            </div>
          )}

          {/* 3-Column Prep Stats */}
          <div className="discord-info-block">
            <div className="discord-section-header">PREPARATION STATS</div>
            <div className="discord-stats-grid-3col">
              <div className="discord-stat-cell">
                <div className="discord-stat-title">
                  <Icons.Flame size={11} color="#f97316" /> CURRENT STREAK
                </div>
                <div className="discord-stat-number">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
              </div>

              <div className="discord-stat-cell">
                <div className="discord-stat-title">
                  <Icons.Target size={11} color="#3b82f6" /> QUESTIONS SOLVED
                </div>
                <div className="discord-stat-number">{solvedQs ? solvedQs.toLocaleString() : '0'} Qs</div>
              </div>

              <div className="discord-stat-cell">
                <div className="discord-stat-title">
                  <Icons.BookOpen size={11} color="#10b981" /> MOCKS TAKEN
                </div>
                <div className="discord-stat-number">{mocksCount} / 30</div>
              </div>
            </div>
          </div>

          {/* Collectible Badges Row (Icon-Only with Animated Hover Card) */}
          <div className="discord-info-block">
            <div className="discord-section-header-row">
              <span className="discord-section-header">UNLOCKED PERKS & BADGES</span>
              <span className="badge-count-pill">{unlockedCount} / {badges.length} Unlocked</span>
            </div>
            {unlockedCount === 0 ? (
              <div className="no-badges-unlocked-row">
                <span className="no-badges-text">Peer has not unlocked any achievement badges yet.</span>
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
                        10/10 UNLOCKED
                      </span>
                    </div>
                    <div className="hover-card-perk-title">Complete Preparation Mastery</div>
                    <div className="hover-card-description">
                      Peer has collected every single consistency, drill, and mock test achievement badge!
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

          {/* Tab Switcher: Syllabus Progress vs Contribution Heatmap */}
          <div className="modal-tab-switcher-row">
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              <Icons.Target size={12} />
              <span>Syllabus Progress</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('heatmap')}
            >
              <Icons.Calendar size={12} />
              <span>Contribution Heatmap</span>
            </button>
          </div>

          {/* Tab 1: Detailed Syllabus Progress Bars */}
          {activeTab === 'syllabus' && (
            <div className="discord-info-block animate-fade-in" style={{ marginBottom: '4px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '14px 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Loading peer tracker metrics...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <div className="syllabus-progress-bar-wrap">
                    <div className="syllabus-label-row">
                      <span className="syllabus-sub-title"><Icons.Book size={12} /> Quantitative Aptitude</span>
                      <span className="syllabus-count-val">{totalQuant.toLocaleString()} / {grandTargets.quant.toLocaleString()} Qs</span>
                    </div>
                    <div className="syllabus-track">
                      <div 
                        className="syllabus-fill quant" 
                        style={{ width: `${Math.min(100, Math.round((totalQuant / grandTargets.quant) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  <div className="syllabus-progress-bar-wrap">
                    <div className="syllabus-label-row">
                      <span className="syllabus-sub-title"><Icons.CheckSquare size={12} /> LRDI Practice</span>
                      <span className="syllabus-count-val">{totalLrdi.toLocaleString()} / {grandTargets.lrdi.toLocaleString()} Sets</span>
                    </div>
                    <div className="syllabus-track">
                      <div 
                        className="syllabus-fill lrdi" 
                        style={{ width: `${Math.min(100, Math.round((totalLrdi / grandTargets.lrdi) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  <div className="syllabus-progress-bar-wrap">
                    <div className="syllabus-label-row">
                      <span className="syllabus-sub-title"><Icons.BookOpen size={12} /> VARC Sectionals</span>
                      <span className="syllabus-count-val">{totalVarc.toLocaleString()} / {grandTargets.varc.toLocaleString()} Articles</span>
                    </div>
                    <div className="syllabus-track">
                      <div 
                        className="syllabus-fill varc" 
                        style={{ width: `${Math.min(100, Math.round((totalVarc / grandTargets.varc) * 100))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: GitHub-Style Study Contribution Heatmap */}
          {activeTab === 'heatmap' && (
            <div className="discord-info-block animate-fade-in" style={{ marginBottom: '4px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '14px 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Loading study matrix...
                </div>
              ) : trackerData?.tracker ? (
                <StudyContributionHeatmap tracker={trackerData.tracker} compact={true} />
              ) : (
                <div className="empty-state" style={{ padding: '16px', fontSize: '12px' }}>
                  Peer has not synchronized activity history yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
