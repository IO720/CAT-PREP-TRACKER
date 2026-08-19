import React, { useState, useEffect } from 'react';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { fetchFriendProgress } from '../utils/firebase';
import { calculateUserBadges } from '../utils/badgeUtils';

export default function PeerInspectorModal({
  peer = null,
  friend = null,
  trackerData: initialTrackerData = null,
  loading: initialLoading = false,
  onClose,
  onEditProfile = null,
  onMessagePeer = null,
  currentUser = null
}) {
  const activePeer = peer || friend;
  const [trackerData, setTrackerData] = useState(initialTrackerData || null);
  const [loading, setLoading] = useState(initialLoading);
  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' | 'heatmap'
  const [copiedId, setCopiedId] = useState(false);
  const [activeBadgeTooltip, setActiveBadgeTooltip] = useState(null);

  useEffect(() => {
    if (initialTrackerData) {
      setTrackerData(initialTrackerData);
    }
  }, [initialTrackerData]);

  useEffect(() => {
    if (!activePeer || activePeer.isSelf) {
      if (activePeer?.isSelf) {
        setTrackerData(activePeer);
      }
      return;
    }

    const peerId = activePeer.id || activePeer.uid;
    if (!peerId) return;

    setLoading(true);
    fetchFriendProgress(peerId)
      .then((data) => {
        if (data) {
          setTrackerData(data);
        } else {
          setTrackerData(activePeer);
        }
      })
      .catch((err) => {
        console.error("Error fetching peer detailed progress:", err);
        setTrackerData(activePeer);
      })
      .finally(() => setLoading(false));
  }, [activePeer]);

  if (!activePeer) return null;

  const isSelf = activePeer.isSelf || (currentUser && (activePeer.id === currentUser.uid || activePeer.uid === currentUser.uid));
  const displayName = trackerData?.displayName || trackerData?.name || activePeer.displayName || activePeer.name || 'Aspirant';
  const username = trackerData?.target || activePeer.target || 'CAT 2025';
  const location = trackerData?.location || activePeer.location || '';
  const avatar = trackerData?.avatar || activePeer.avatar || 'rocket';
  const avatarBg = trackerData?.avatarBg || activePeer.avatarBg || '#5865f2';
  const bannerBg = trackerData?.bannerBg || activePeer.bannerBg || '';
  const bannerUrl = trackerData?.bannerUrl || activePeer.bannerUrl || '';
  const bio = trackerData?.bio || activePeer.bio || '';
  const streak = trackerData?.streak != null ? trackerData.streak : (activePeer.streak || 0);
  const solvedQs = trackerData?.solvedQs != null ? trackerData.solvedQs : (activePeer.solvedQs || 0);
  const mocksCount = trackerData?.mocksCount != null ? trackerData.mocksCount : (activePeer.mocksCount || 0);
  const status = activePeer.status || 'offline';
  const aspirantId = trackerData?.aspirantId || activePeer.aspirantId || '';

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (!aspirantId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(aspirantId);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleText = username ? (username.startsWith('@') ? username : `@${username}`) : '@peer';

  const badges = calculateUserBadges({ streak, solvedQs, mocksCount });
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  const totalQuant = trackerData?.totals?.quant || trackerData?.quant || 0;
  const totalLrdi = trackerData?.totals?.lrdi || trackerData?.lrdi || 0;
  const totalVarc = trackerData?.totals?.varc || trackerData?.varc || 0;
  const grandTargets = { quant: 2500, lrdi: 500, varc: 500 };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="profile-card-container unified-profile-modal-card" 
        onClick={(e) => {
          e.stopPropagation();
          setActiveBadgeTooltip(null);
        }}
      >
        
        {/* Banner Section */}
        <div 
          className="profile-card-banner-header" 
          style={{ 
            backgroundColor: bannerBg || '#1e1f22',
            backgroundImage: bannerUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url("${bannerUrl}")` : `linear-gradient(135deg, ${bannerBg || avatarBg || '#1e1f22'} 0%, #0f1012 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* CATalyze Verified Badge */}
          <div className="aspiranto-verified-pill">
            <Icons.Shield size={12} />
            <span>CATalyze Verified</span>
          </div>

          {/* Edit Profile Button for Self */}
          {isSelf && (
            <button
              type="button"
              className="profile-card-edit-btn"
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
          <div className="profile-card-avatar-row">
            <div className="profile-card-avatar-wrapper">
              <AvatarRenderer 
                avatar={avatar}
                name={displayName}
                avatarBg={avatarBg}
                size={70}
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
                    onClick={() => {
                      onClose();
                      onEditProfile();
                    }}
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
                    onClick={() => {
                      onClose();
                      onMessagePeer(activePeer);
                    }}
                  >
                    <Icons.MessageSquare size={13} />
                    <span>Message Buddy</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Identity Info */}
          <div className="profile-card-identity-section">
            <div className="profile-card-display-name-row">
              <h2 className="profile-card-display-name">{displayName}</h2>
              {isSelf && <span className="profile-card-self-pill" style={{ marginLeft: '8px' }}>YOU</span>}
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
          {bio && (
            <div className="profile-card-info-block">
              <div className="profile-card-section-header">ABOUT ME</div>
              <div className="profile-card-bio-text">{bio || (isSelf ? 'CAT 2028' : 'CAT Aspirant')}</div>
            </div>
          )}

          {/* 3-Column Prep Stats */}
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

          {/* Collectible Badges Row */}
          <div className="profile-card-info-block">
            <div className="profile-card-section-header-row">
              <span className="profile-card-section-header">UNLOCKED PERKS & BADGES</span>
              <span className="badge-count-pill">{unlockedCount} / {badges.length} Unlocked</span>
            </div>
            {unlockedCount === 0 ? (
              <div className="no-badges-unlocked-row">
                <span className="no-badges-text">Peer has not unlocked any achievement badges yet.</span>
              </div>
            ) : unlockedCount === badges.length && badges.length > 0 ? (
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
                      Peer has collected every single {badges.length} consistency, drill, and mock test achievement badge!
                    </div>
                  </div>
                </div>
                <span className="grandmaster-badge-label">Omni Grandmaster (100% Mastery)</span>
              </div>
            ) : (
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
            <div className="profile-card-info-block animate-fade-in" style={{ marginBottom: '4px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  <span className="btn-spinner" style={{ marginRight: '8px' }}></span> Loading peer tracker metrics...
                </div>
              ) : (
                <div className="syllabus-cards-container">
                  {/* Quant Card */}
                  <div className="syllabus-progress-card quant-theme">
                    <div className="syllabus-label-row">
                      <div className="syllabus-sub-title">
                        <span className="syllabus-icon-badge quant-badge"><Icons.Calculator size={13} /></span>
                        <span className="syllabus-subject-name">Quantitative Aptitude</span>
                      </div>
                      <div className="syllabus-stats-badge">
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

                  {/* LRDI Card */}
                  <div className="syllabus-progress-card lrdi-theme">
                    <div className="syllabus-label-row">
                      <div className="syllabus-sub-title">
                        <span className="syllabus-icon-badge lrdi-badge"><Icons.Puzzle size={13} /></span>
                        <span className="syllabus-subject-name">LRDI Practice</span>
                      </div>
                      <div className="syllabus-stats-badge">
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

                  {/* VARC Card */}
                  <div className="syllabus-progress-card varc-theme">
                    <div className="syllabus-label-row">
                      <div className="syllabus-sub-title">
                        <span className="syllabus-icon-badge varc-badge"><Icons.BookOpen size={13} /></span>
                        <span className="syllabus-subject-name">VARC Sectionals</span>
                      </div>
                      <div className="syllabus-stats-badge">
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
              )}
            </div>
          )}

          {/* Tab 2: Study Contribution Heatmap */}
          {activeTab === 'heatmap' && (
            <div className="profile-card-info-block animate-fade-in" style={{ marginBottom: '4px' }}>
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
    </div>
  );
}
