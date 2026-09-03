import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  signUpUser, 
  logInUser, 
  logOutUser, 
  sendFriendRequest, 
  subscribeToFriendRequests, 
  respondToFriendRequest, 
  removeFriend, 
  getLocalAspirantId, 
  generateUniqueAspirantId, 
  isFirebaseConfigured 
} from '../utils/firebase';
import AvatarRenderer, { AVATAR_PRESETS } from './AvatarRenderer';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { calculateUserBadges } from '../utils/badgeUtils';
import { Icons } from './AspirantIcons';
import { 
  AnimatedFlameIcon, 
  AnimatedTargetIcon, 
  AnimatedCrownIcon, 
  AnimatedLightningIcon,
  AnimatedSparkleIcon,
  AnimatedShieldCheckIcon,
  AnimatedRadarBeaconIcon
} from './AnimatedUiIcons';
import { stripEmojis } from '../utils/textUtils';
import AnimatedSelect from './animations/AnimatedSelect';

const BG_COLORS = [
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185',
  '#fb923c', '#fbbf24', '#34d399', '#2dd4bf', '#94a3b8'
];

const BANNER_THEMES = [
  { id: 'cyber-sky', name: 'Cyber Sky', bg: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)' },
  { id: 'emerald-matrix', name: 'Emerald Matrix', bg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' },
  { id: 'violet-nebula', name: 'Violet Nebula', bg: 'linear-gradient(135deg, #7c3aed 0%, #1e1b4b 100%)' },
  { id: 'solar-flare', name: 'Solar Flare', bg: 'linear-gradient(135deg, #ea580c 0%, #451a03 100%)' },
  { id: 'neon-rose', name: 'Neon Rose', bg: 'linear-gradient(135deg, #e11d48 0%, #4c0519 100%)' },
  { id: 'teal-aurora', name: 'Teal Aurora', bg: 'linear-gradient(135deg, #0d9488 0%, #042f2e 100%)' },
  { id: 'imperial-gold', name: 'Imperial Gold', bg: 'linear-gradient(135deg, #d97706 0%, #291e03 100%)' },
  { id: 'midnight-stealth', name: 'Midnight Stealth', bg: 'linear-gradient(135deg, #1e293b 0%, #0b1120 100%)' }
];

const TARGET_PRESETS = [
  'CAT 2025 (99.5+%ile • IIM-A Focus)',
  'CAT 2025 (99.0+%ile • IIM-B/C Focus)',
  'CAT 2025 (98.0+%ile • Top IIMs & FMS)',
  'CAT 2026 Foundation & Early Prep',
  'XAT + CAT Dual Target (XLRI Focus)',
  'Custom Target Goal'
];

export default function ProfileView({ 
  user, 
  userProfile,
  tracker = null,
  mocks = [],
  onAuthSuccess, 
  onUpdateProfile,
  friends = [], 
  onAddFriendSuccess, 
  onInspectFriend,
  onMessagePeer = null,
  startDate = "",
  onUpdateStartDate,
  onExport,
  onImport,
  onReset,
  fileInputRef,
  setActiveTab,
  initialSubTab = 'passport',
  onResetSubTab = null,
  isEditOpen = false,
  onResetEditOpen = null
}) {
  // Navigation Section: 'passport' (Full Executive Profile) | 'network' (Friends & Invitations) | 'settings' (Data & Cloud)
  const [activeSection, setActiveSection] = useState(initialSubTab === 'friends' ? 'network' : 'passport');

  useEffect(() => {
    if (initialSubTab === 'friends') {
      setActiveSection('network');
    }
  }, [initialSubTab]);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(isEditOpen);

  useEffect(() => {
    if (isEditOpen) {
      setIsEditModalOpen(true);
      if (onResetEditOpen) onResetEditOpen();
    }
  }, [isEditOpen, onResetEditOpen]);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile customization state
  const [profName, setProfName] = useState(userProfile?.displayName || user?.displayName || '');
  const [profUsername, setProfUsername] = useState(userProfile?.username || (user?.email ? user.email.split('@')[0] : 'aspirant'));
  const [profAvatar, setProfAvatar] = useState(userProfile?.avatar || 'rocket');
  const [profAvatarBg, setProfAvatarBg] = useState(userProfile?.avatarBg || '#38bdf8');
  const [profBannerBg, setProfBannerBg] = useState(userProfile?.bannerBg || '#0b1120');
  const [profBannerUrl, setProfBannerUrl] = useState(userProfile?.bannerUrl || '');
  const [profBio, setProfBio] = useState(userProfile?.bio || '');
  const [profTarget, setProfTarget] = useState(userProfile?.target || 'CAT 2025 (99.5+%ile • IIM-A Focus)');
  const [profLocation, setProfLocation] = useState(userProfile?.location || '');
  const [editModalTab, setEditModalTab] = useState('appearance');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const imageUploadInputRef = useRef(null);
  const bannerUploadInputRef = useRef(null);

  // Unique Aspirant ID
  const currentAspirantId = userProfile?.aspirantId || (user ? generateUniqueAspirantId(user.uid) : getLocalAspirantId());
  const [copiedMyId, setCopiedMyId] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Add Friend & Requests State
  const [friendSearchInput, setFriendSearchInput] = useState('');
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [friendFeedback, setFriendFeedback] = useState({ type: '', text: '' });
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [removingFriendId, setRemovingFriendId] = useState(null);

  // Sync state when userProfile updates
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setProfName(userProfile.displayName);
      if (userProfile.username) setProfUsername(userProfile.username);
      if (userProfile.avatar) setProfAvatar(userProfile.avatar);
      if (userProfile.avatarBg) setProfAvatarBg(userProfile.avatarBg);
      if (userProfile.bannerBg) setProfBannerBg(userProfile.bannerBg);
      if (userProfile.bannerUrl) setProfBannerUrl(userProfile.bannerUrl);
      if (userProfile.bio !== undefined) setProfBio(userProfile.bio);
      if (userProfile.target) setProfTarget(userProfile.target);
      if (userProfile.location !== undefined) setProfLocation(userProfile.location);
    } else if (user) {
      if (user.displayName) setProfName(user.displayName);
      if (user.email) setProfUsername(user.email.split('@')[0]);
    }
  }, [userProfile, user]);

  // Subscribe to real-time incoming friend requests
  useEffect(() => {
    if (user && isFirebaseConfigured) {
      const unsubscribe = subscribeToFriendRequests(user.uid, (requests) => {
        setIncomingRequests(requests);
      });
      return () => unsubscribe();
    } else {
      setIncomingRequests([]);
    }
  }, [user]);

  // Copy own Unique ID
  const handleCopyMyId = (e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(currentAspirantId);
    setCopiedMyId(true);
    showToast(`Copied Aspirant ID ${currentAspirantId} to clipboard!`);
    setTimeout(() => setCopiedMyId(false), 2400);
  };

  // Avatar Upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Avatar image size must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 140;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfAvatar(compressedDataUrl);
        showToast("Avatar image updated!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Banner Upload
  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Banner file size must be under 8MB.");
      return;
    }
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    if (isGif) {
      if (file.size > 400 * 1024) {
        alert("Animated GIF must be under 400KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfBannerBg(event.target.result);
          setProfBannerUrl(event.target.result);
          showToast("Animated banner applied!");
        }
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_W = 850;
          const MAX_H = 320;
          let width = img.width;
          let height = img.height;
          if (width > MAX_W) {
            height = Math.round((height * MAX_W) / width);
            width = MAX_W;
          }
          if (height > MAX_H) {
            width = Math.round((width * MAX_H) / height);
            height = MAX_H;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          let compressed = canvas.toDataURL('image/jpeg', 0.80);
          setProfBannerBg(compressed);
          setProfBannerUrl(compressed);
          showToast("Banner image applied!");
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      alert("Please sign in to sync profile changes with cloud.");
      return;
    }

    setProfileSaving(true);
    setProfileSuccessMsg('');

    try {
      if (onUpdateProfile) {
        await onUpdateProfile({
          displayName: profName.trim() || user.email?.split('@')[0] || 'Aspirant',
          username: profUsername.trim() || user.email?.split('@')[0] || 'aspirant',
          avatar: profAvatar,
          avatarBg: profAvatarBg,
          bannerBg: profBannerBg,
          bio: profBio.trim(),
          target: profTarget.trim(),
          location: profLocation.trim(),
          aspirantId: currentAspirantId
        });
      }
      setProfileSuccessMsg("Profile updated and synced!");
      showToast("Profile changes saved successfully!");
      setTimeout(() => setIsEditModalOpen(false), 1000);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please check connection.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Live Live Aggregated Metrics Calculation
  const liveStats = useMemo(() => {
    let streak = 0;
    let solvedQs = 0;
    let quantQs = 0;
    let lrdiQs = 0;
    let varcQs = 0;
    let activeDaysCount = 0;

    if (tracker) {
      const allDays = [];
      ['Month 1', 'Month 2', 'Month 3', 'Month 4'].forEach(mKey => {
        const weeks = tracker[mKey] || [];
        weeks.forEach(w => {
          (w.days || []).forEach(d => {
            const q = Number(d.quantCount) || 0;
            const l = Number(d.lrdiCount) || 0;
            const v = Number(d.varcCount) || 0;
            quantQs += q;
            lrdiQs += l;
            varcQs += v;
            solvedQs += (q + l + v);
            const isCompleted = d.quantCompleted || d.lrdiCompleted || d.varcCompleted || (q + l + v > 0);
            if (isCompleted) activeDaysCount++;
            allDays.push(isCompleted);
          });
        });
      });

      for (let i = allDays.length - 1; i >= 0; i--) {
        if (allDays[i]) streak++;
        else if (streak > 0) break;
      }
    }

    const takenMocks = (mocks || []).filter(m => m.status === 'Taken');
    const mocksCount = takenMocks.length;
    let mockTotalPoints = 0;
    takenMocks.forEach(m => {
      mockTotalPoints += parseFloat(m.totalScore) || 0;
    });
    const avgMockScore = mocksCount > 0 ? Math.round((mockTotalPoints / mocksCount) * 10) / 10 : 0;

    return {
      streak: userProfile?.streak !== undefined ? userProfile.streak : streak,
      solvedQs: userProfile?.solvedQs !== undefined ? userProfile.solvedQs : solvedQs,
      quantQs,
      lrdiQs,
      varcQs,
      activeDaysCount,
      mocksCount: userProfile?.mocksCount !== undefined ? userProfile.mocksCount : mocksCount,
      avgMockScore
    };
  }, [tracker, mocks, userProfile]);

  // Badges & Trophy calculation
  const badges = useMemo(() => {
    return calculateUserBadges({
      streak: liveStats.streak,
      solvedQs: liveStats.solvedQs,
      mocksCount: liveStats.mocksCount
    });
  }, [liveStats]);

  const unlockedBadges = badges.filter(b => b.isUnlocked);

  // Send Friend Request
  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendSearchInput.trim()) return;
    if (!user) {
      setFriendFeedback({ type: 'error', text: 'Sign in to send friend requests.' });
      return;
    }

    setFriendActionLoading(true);
    setFriendFeedback({ type: '', text: '' });

    try {
      const res = await sendFriendRequest(user, friendSearchInput.trim(), userProfile);
      setFriendFeedback({ type: 'success', text: `Friend request sent to ${res.targetName}!` });
      setFriendSearchInput('');
      showToast("Invitation sent successfully!");
    } catch (err) {
      setFriendFeedback({ type: 'error', text: err.message || 'Unable to find user with that ID or email.' });
    } finally {
      setFriendActionLoading(false);
    }
  };

  // Accept / Decline Request
  const handleRespondRequest = async (req, action) => {
    setProcessingRequestId(req.id);
    try {
      await respondToFriendRequest(req.id, action);
      setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
      showToast(action === 'accept' ? 'Friend request accepted!' : 'Request declined.');
    } catch (err) {
      alert("Error responding to request: " + err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Remove Friend
  const handleRemoveFriend = async (friend) => {
    const friendId = friend.id || friend.uid;
    if (!window.confirm(`Remove ${friend.displayName || friend.name} from your study network?`)) return;
    setRemovingFriendId(friendId);
    try {
      await removeFriend(user.uid, friendId);
      showToast(`Removed from study buddies.`);
    } catch (err) {
      alert("Error removing friend: " + err.message);
    } finally {
      setRemovingFriendId(null);
    }
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      let loggedUser;
      if (isSignUp) {
        loggedUser = await signUpUser(authEmail, authPassword, authDisplayName);
      } else {
        loggedUser = await logInUser(authEmail, authPassword);
      }
      if (onAuthSuccess) onAuthSuccess(loggedUser);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${loggedUser.displayName || 'Aspirant'}!`);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Log out of your account on this device?")) return;
    try {
      await logOutUser();
      if (onAuthSuccess) onAuthSuccess(null);
      showToast("Logged out successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-dashboard-wrapper fade-in">
      
      {/* Floating Assurance Toast */}
      {toastMsg && (
        <div className="profile-floating-toast">
          <Icons.Check size={14} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP NAVIGATION TABS (Passport, Network, Settings) */}
      <div className="profile-unified-nav-strip">
        <div className="nav-tabs-left">
          <button
            type="button"
            className={`profile-nav-pill ${activeSection === 'passport' ? 'active' : ''}`}
            onClick={() => setActiveSection('passport')}
          >
            <Icons.User size={14} />
            <span className="pill-text-desktop">Aspirant Passport</span>
            <span className="pill-text-mobile">Passport</span>
          </button>
          
          <button
            type="button"
            className="profile-nav-pill"
            onClick={() => setActiveTab && setActiveTab('achievements')}
          >
            <Icons.Award size={14} />
            <span className="pill-text-desktop">Achievements</span>
            <span className="pill-text-mobile">Badges</span>
          </button>

          <button
            type="button"
            className={`profile-nav-pill ${activeSection === 'network' ? 'active' : ''}`}
            onClick={() => setActiveSection('network')}
          >
            <Icons.Users size={14} />
            <span className="pill-text-desktop">Study Buddies ({friends.length})</span>
            <span className="pill-text-mobile">Buddies ({friends.length})</span>
            {incomingRequests.length > 0 && (
              <span className="nav-ping-badge">{incomingRequests.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`profile-nav-pill ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <Icons.Database size={14} />
            <span className="pill-text-desktop">Data & Sync</span>
            <span className="pill-text-mobile">Sync</span>
          </button>
        </div>

        <div className="nav-status-right">
          {user ? (
            <div className="cloud-status-chip online">
              <AnimatedRadarBeaconIcon size={14} color="#34d399" />
              <span>Cloud Synced ({user.email})</span>
            </div>
          ) : (
            <button 
              type="button" 
              className="cloud-sign-in-btn"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <Icons.Shield size={13} />
              <span>Sign In for Cloud Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          PANORAMIC ASPIRANT PASSPORT HERO
         ======================================================== */}
      <div className="aspirant-passport-hero">
        <div 
          className="passport-banner-cover"
          style={{
            background: profBannerBg || 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
            backgroundImage: profBannerUrl ? `url(${profBannerUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="passport-banner-overlay" />
          <div className="passport-banner-top-tags">
            <span className="verified-aspirant-pill">
              <AnimatedShieldCheckIcon size={14} color="#34d399" />
              <span>CATalyze 2025 Verified</span>
            </span>
            <span className="aspirant-id-display-pill" onClick={handleCopyMyId} title="Click to copy your unique ID">
              <Icons.Hash size={11} />
              <span>{currentAspirantId}</span>
              {copiedMyId ? <Icons.Check size={11} /> : <Icons.Copy size={11} />}
            </span>
          </div>
        </div>

        {/* Hero Identity Body */}
        <div className="passport-identity-row">
          <div className="passport-avatar-block">
            <div className="passport-avatar-frame">
              <AvatarRenderer 
                avatar={profAvatar} 
                name={profName || user?.displayName || 'Aspirant'} 
                avatarBg={profAvatarBg} 
                size={82}
                status={user ? 'online' : 'offline'}
              />
            </div>
          </div>

          <div className="passport-meta-block">
            <div className="passport-name-line">
              <h1 className="passport-display-name">{profName || user?.displayName || 'Your Display Name'}</h1>
              <span className="passport-handle">@{profUsername || 'aspirant'}</span>
              {profLocation && (
                <span className="passport-location-tag">
                  <Icons.MapPin size={11} /> {profLocation}
                </span>
              )}
            </div>

            <div className="passport-target-line">
              <div className="target-goal-badge">
                <AnimatedTargetIcon size={14} color="#38bdf8" />
                <span>{profTarget}</span>
              </div>
              <p className="passport-bio-text">
                {profBio || 'Daily Quant drills, strategic LRDI set selection, and weekly mock analysis.'}
              </p>
            </div>
          </div>

          <div className="passport-actions-block">
            <button
              type="button"
              className="passport-primary-edit-btn"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Icons.Edit3 size={14} />
              <span>Edit Profile</span>
            </button>

            {user ? (
              <button
                type="button"
                className="passport-secondary-btn"
                onClick={handleLogout}
              >
                <span>Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                className="passport-secondary-btn highlight"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <span>Sign In / Join</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 1: ASPIRANT PASSPORT (Full Workspace)
         ======================================================== */}
      {activeSection === 'passport' && (
        <div className="passport-workspace-grid">
          
          {/* 4 LIVE TELEMETRY STAT CARDS */}
          <div className="passport-telemetry-row">
            
            {/* 1. Consistency Streak */}
            <div className="telemetry-stat-card">
              <div className="stat-card-head">
                <span className="stat-label">CONSISTENCY MOMENTUM</span>
                <div className="stat-icon-wrap streak">
                  <AnimatedFlameIcon size={16} color="#fbbf24" />
                </div>
              </div>
              <div className="stat-value-group">
                <span className="stat-number">{liveStats.streak}</span>
                <span className="stat-unit">Days Active</span>
              </div>
              <div className="stat-subtext">
                {liveStats.activeDaysCount} total active study days recorded
              </div>
            </div>

            {/* 2. Questions Conquered */}
            <div className="telemetry-stat-card">
              <div className="stat-card-head">
                <span className="stat-label">PRACTICE VELOCITY</span>
                <div className="stat-icon-wrap velocity">
                  <Icons.Target size={16} />
                </div>
              </div>
              <div className="stat-value-group">
                <span className="stat-number">{liveStats.solvedQs.toLocaleString()}</span>
                <span className="stat-unit">Qs Solved</span>
              </div>
              <div className="stat-subtext">
                QA: {liveStats.quantQs} • DILR: {liveStats.lrdiQs} • VARC: {liveStats.varcQs}
              </div>
            </div>

            {/* 3. Mocks Completed */}
            <div className="telemetry-stat-card">
              <div className="stat-card-head">
                <span className="stat-label">EXAM READINESS</span>
                <div className="stat-icon-wrap exam">
                  <Icons.BookOpen size={16} />
                </div>
              </div>
              <div className="stat-value-group">
                <span className="stat-number">{liveStats.mocksCount} / 30</span>
                <span className="stat-unit">Mocks</span>
              </div>
              <div className="stat-subtext">
                {liveStats.avgMockScore > 0 ? `Avg Composite: ${liveStats.avgMockScore} pts` : 'Awaiting first completed mock'}
              </div>
            </div>

            {/* 4. Trophies & Prestige */}
            <div 
              className="telemetry-stat-card clickable-telemetry"
              onClick={() => setActiveTab && setActiveTab('achievements')}
              title="Click to view all Achievement Badges"
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-card-head">
                <span className="stat-label">PRESTIGE MILESTONES</span>
                <div className="stat-icon-wrap prestige">
                  <AnimatedCrownIcon size={16} color="#f472b6" />
                </div>
              </div>
              <div className="stat-value-group">
                <span className="stat-number">{unlockedBadges.length} / {badges.length}</span>
                <span className="stat-unit">Badges</span>
              </div>
              <div className="stat-subtext">
                {unlockedBadges.length === badges.length ? 'Grandmaster Mastery Achieved' : 'Unlock badges via daily consistency'} ➔
              </div>
            </div>

          </div>

          {/* TWO COLUMN LOWER WORKSPACE */}
          <div className="passport-details-columns">
            
            {/* LEFT COLUMN: Study Activity Heatmap & Badges */}
            <div className="passport-left-col">
              
              {/* GitHub-Style Study Contribution Heatmap */}
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Calendar size={16} className="panel-ico" />
                    <h3>Study Contribution Activity Matrix</h3>
                  </div>
                  <span className="panel-tag">4-Month Cadence</span>
                </div>
                <p className="panel-explainer">
                  Visual intensity corresponds to daily questions conquered and sectional drills completed.
                </p>

                <div className="embedded-heatmap-container">
                  <StudyContributionHeatmap tracker={tracker || {}} compact={false} />
                </div>
              </div>

              {/* Prestige Trophy Showcase */}
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Trophy size={16} className="panel-ico" />
                    <h3>Collected Badges & Prestige Perks ({unlockedBadges.length}/{badges.length})</h3>
                  </div>
                  {setActiveTab && (
                    <button 
                      type="button" 
                      className="panel-link-btn"
                      onClick={() => setActiveTab('achievements')}
                    >
                      View All Achievements →
                    </button>
                  )}
                </div>

                <div className="badges-horizontal-rack">
                  {badges.map((badge) => {
                    const IconComp = Icons[badge.iconName] || Icons.Award;
                    return (
                      <div 
                        key={badge.id} 
                        className={`badge-rack-item ${badge.isUnlocked ? 'unlocked' : 'locked'}`}
                        title={`${badge.name}: ${badge.description}`}
                      >
                        <div 
                          className="badge-emblem-circle"
                          style={{ '--accent-color': badge.color }}
                        >
                          <IconComp size={18} />
                        </div>
                        <span className="badge-rack-name">{badge.name}</span>
                        <span className="badge-rack-status">
                          {badge.isUnlocked ? 'Unlocked' : `Lock (${badge.threshold})`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Peer Quick Connect & Study Buddies Preview */}
            <div className="passport-right-col">
              
              {/* Quick Buddy Connect Card */}
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.UserPlus size={16} className="panel-ico" />
                    <h3>Connect with a Peer</h3>
                  </div>
                </div>
                <p className="panel-explainer">
                  Enter your study buddy's Unique Aspirant ID (e.g. <code>ASP-849201</code>) or email to link progress.
                </p>

                <form onSubmit={handleSendFriendRequest} className="quick-connect-form">
                  <div className="quick-connect-input-wrap">
                    <Icons.Search size={14} className="input-search-ico" />
                    <input
                      type="text"
                      placeholder="e.g. ASP-849201 or peer@gmail.com"
                      value={friendSearchInput}
                      onChange={(e) => setFriendSearchInput(e.target.value)}
                      disabled={!user || friendActionLoading}
                    />
                    <button
                      type="submit"
                      className="quick-connect-btn"
                      disabled={!user || friendActionLoading || !friendSearchInput.trim()}
                    >
                      {friendActionLoading ? 'Sending...' : 'Connect'}
                    </button>
                  </div>
                </form>

                {friendFeedback.text && (
                  <div className={`connect-feedback-tag ${friendFeedback.type}`}>
                    {friendFeedback.type === 'success' ? <Icons.Check size={12} /> : <Icons.Close size={12} />}
                    <span>{friendFeedback.text}</span>
                  </div>
                )}
              </div>

              {/* Study Buddies Preview */}
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Users size={16} className="panel-ico" />
                    <h3>Active Study Network ({friends.length})</h3>
                  </div>
                  <button 
                    type="button" 
                    className="panel-link-btn"
                    onClick={() => setActiveSection('network')}
                  >
                    Manage Buddies →
                  </button>
                </div>

                {friends.length === 0 ? (
                  <div className="empty-network-callout">
                    <Icons.Users size={28} />
                    <p>No study buddies added yet. Share your Unique ID <strong>{currentAspirantId}</strong> with friends to compare prep momentum!</p>
                  </div>
                ) : (
                  <div className="friends-mini-stack">
                    {friends.slice(0, 4).map((f) => (
                      <div key={f.id || f.uid} className="friend-mini-row">
                        <AvatarRenderer 
                          avatar={f.avatar || 'rocket'} 
                          name={f.displayName || f.name} 
                          avatarBg={f.avatarBg || '#38bdf8'} 
                          size={34}
                          status={f.status || 'offline'}
                        />
                        <div className="friend-mini-meta">
                          <span className="friend-mini-name">{f.displayName || f.name}</span>
                          <span className="friend-mini-sub">{f.streak || 0}d streak • {f.solvedQs || 0} Qs</span>
                        </div>
                        {onInspectFriend && (
                          <button
                            type="button"
                            className="mini-inspect-btn"
                            onClick={() => onInspectFriend(f)}
                            title="Inspect progress"
                          >
                            <Icons.Target size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SECTION 2: STUDY BUDDY NETWORK & INVITATIONS
         ======================================================== */}
      {activeSection === 'network' && (
        <div className="network-section-content fade-in">
          
          {/* Pending Invitations Banner */}
          {incomingRequests.length > 0 && (
            <div className="pending-requests-card">
              <div className="pending-card-head">
                <div className="pending-title-group">
                  <Icons.Bell size={16} className="pending-bell" />
                  <h4>Pending Invitations ({incomingRequests.length})</h4>
                </div>
                <span className="pending-pill">Action Required</span>
              </div>

              <div className="pending-requests-grid">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="pending-request-row">
                    <AvatarRenderer 
                      avatar={req.fromAvatar || 'rocket'}
                      name={req.fromName}
                      avatarBg={req.fromAvatarBg || '#38bdf8'}
                      size={40}
                      status="online"
                    />
                    <div className="pending-request-details">
                      <span className="req-name">{req.fromName}</span>
                      <span className="req-meta">
                        #{req.fromAspirantId || 'ASP-ID'} • {req.fromTarget || 'CAT Aspirant'}
                      </span>
                    </div>
                    <div className="pending-actions-row">
                      <button
                        type="button"
                        className="btn-req accept"
                        disabled={processingRequestId === req.id}
                        onClick={() => handleRespondRequest(req, 'accept')}
                      >
                        <Icons.Check size={13} />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        className="btn-req decline"
                        disabled={processingRequestId === req.id}
                        onClick={() => handleRespondRequest(req, 'decline')}
                      >
                        <Icons.Close size={13} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Study Buddies Grid */}
          <div className="full-buddies-panel">
            <div className="buddies-panel-header">
              <div>
                <h3 className="buddies-title">My Study Buddies ({friends.length})</h3>
                <p className="buddies-subtitle">Real-time study status, daily streaks, and peer accountability.</p>
              </div>
              <div className="buddies-header-actions">
                <button
                  type="button"
                  className="copy-my-id-btn"
                  onClick={handleCopyMyId}
                >
                  <Icons.Hash size={13} />
                  <span>My ID: {currentAspirantId}</span>
                  {copiedMyId ? <Icons.Check size={13} /> : <Icons.Copy size={13} />}
                </button>
              </div>
            </div>

            {friends.length === 0 ? (
              <div className="empty-buddies-hero">
                <div className="empty-icon-wrap">
                  <Icons.Users size={32} />
                </div>
                <h4>No Study Buddies Connected</h4>
                <p>Share your Unique Aspirant ID <strong>{currentAspirantId}</strong> or search using your buddy's ID above to start studying together.</p>
              </div>
            ) : (
              <div className="buddies-card-grid">
                {friends.map((friend) => (
                  <div key={friend.id || friend.uid} className="buddy-card">
                    <div className="buddy-card-top">
                      <AvatarRenderer 
                        avatar={friend.avatar || 'rocket'}
                        name={friend.displayName || friend.name}
                        avatarBg={friend.avatarBg || '#38bdf8'}
                        size={46}
                        status={friend.status || 'offline'}
                      />
                      <div className="buddy-card-identity">
                        <div className="buddy-name-bar">
                          <span className="buddy-name">{friend.displayName || friend.name}</span>
                          {friend.aspirantId && (
                            <span className="buddy-id-badge">#{friend.aspirantId}</span>
                          )}
                        </div>
                        <span className="buddy-target-txt">{friend.target || 'CAT Aspirant'}</span>
                        <div className="buddy-status-indicator">
                          <span className={`status-dot ${friend.status || 'offline'}`} />
                          <span className="status-lbl">
                            {friend.status === 'studying' ? 'Focusing Now' : friend.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="buddy-remove-btn"
                        onClick={() => handleRemoveFriend(friend)}
                        disabled={removingFriendId === (friend.id || friend.uid)}
                        title="Remove friend"
                      >
                        <Icons.UserX size={14} />
                      </button>
                    </div>

                    <div className="buddy-card-metrics">
                      <div className="b-metric-pill">
                        <Icons.Flame size={12} color="#fbbf24" />
                        <span>{friend.streak || 0}d streak</span>
                      </div>
                      <div className="b-metric-pill">
                        <Icons.Target size={12} color="#38bdf8" />
                        <span>{friend.solvedQs || 0} Qs solved</span>
                      </div>
                    </div>

                    <div className="buddy-card-actions">
                      {onMessagePeer && (
                        <button
                          type="button"
                          className="buddy-btn primary"
                          onClick={() => onMessagePeer(friend)}
                        >
                          <Icons.MessageSquare size={13} />
                          <span>Direct Message</span>
                        </button>
                      )}
                      {onInspectFriend && (
                        <button
                          type="button"
                          className="buddy-btn secondary"
                          onClick={() => onInspectFriend(friend)}
                        >
                          <Icons.Target size={13} />
                          <span>Inspect</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          SECTION 3: DATA MANAGEMENT, BACKUP & CLOUD SYNC
         ======================================================== */}
      {activeSection === 'settings' && (
        <div className="settings-section-content fade-in">
          <div className="settings-cards-grid">
            
            {/* Card 1: Cloud Account Status */}
            <div className="settings-panel-card">
              <div className="panel-card-head">
                <Icons.Cloud size={18} className="panel-head-ico" />
                <div>
                  <h4>Cloud Synchronization</h4>
                  <p>Keep your daily drill metrics and mocks backed up across all devices.</p>
                </div>
              </div>

              <div className="panel-card-body">
                {user ? (
                  <div className="auth-user-status-box">
                    <div className="user-info-row">
                      <span className="lbl">Logged in as:</span>
                      <span className="val">{user.email}</span>
                    </div>
                    <div className="user-info-row">
                      <span className="lbl">Cloud Status:</span>
                      <span className="val success">Real-Time Firestore Sync Active</span>
                    </div>
                    <button
                      type="button"
                      className="auth-action-btn logout"
                      onClick={handleLogout}
                    >
                      Sign Out of Device
                    </button>
                  </div>
                ) : (
                  <div className="auth-guest-status-box">
                    <p>You are currently in <strong>Local Offline Mode</strong>. Your progress is saved in this browser, but not synced across devices.</p>
                    <button
                      type="button"
                      className="auth-action-btn signin"
                      onClick={() => setIsAuthModalOpen(true)}
                    >
                      <Icons.Shield size={14} />
                      <span>Sign In or Create Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Data Portability (Export & Import) */}
            <div className="settings-panel-card">
              <div className="panel-card-head">
                <Icons.Database size={18} className="panel-head-ico" />
                <div>
                  <h4>Data Portability & Backup</h4>
                  <p>Download a complete JSON snapshot of your 4-month plan, daily drills, and 30 mocks.</p>
                </div>
              </div>

              <div className="panel-card-body">
                <div className="data-action-buttons-row">
                  {onExport && (
                    <button
                      type="button"
                      className="data-port-btn export"
                      onClick={onExport}
                    >
                      <Icons.Download size={15} />
                      <span>Export Backup (JSON)</span>
                    </button>
                  )}
                  {onImport && (
                    <button
                      type="button"
                      className="data-port-btn import"
                      onClick={onImport}
                    >
                      <Icons.Upload size={15} />
                      <span>Restore from JSON File</span>
                    </button>
                  )}
                </div>

                {startDate !== undefined && (
                  <div className="prep-start-date-row">
                    <label>Preparation Journey Start Date:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => onUpdateStartDate && onUpdateStartDate(e.target.value)}
                    />
                  </div>
                )}

                {onReset && (
                  <div className="danger-zone-strip">
                    <button
                      type="button"
                      className="reset-tracker-btn"
                      onClick={onReset}
                    >
                      Reset All Tracker Data
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PROFILE & APPEARANCE
         ======================================================== */}
      {isEditModalOpen && (
        <div className="mock-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="edit-profile-modal-box" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div className="modal-title-group">
                <Icons.Edit3 size={16} />
                <h3>Edit Aspirant Profile</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <Icons.Close size={16} />
              </button>
            </div>

            {/* Modal Live Banner & Avatar Preview */}
            <div className="modal-live-preview-card">
              <div 
                className="live-preview-banner"
                style={{
                  background: profBannerBg || 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                  backgroundImage: profBannerUrl ? `url(${profBannerUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="live-preview-banner-tint" />
                <span className="live-badge">
                  <span className="live-badge-dot" />
                  <span>LIVE PREVIEW</span>
                </span>
              </div>
              <div className="live-preview-identity">
                <div className="live-preview-avatar-wrap">
                  <AvatarRenderer 
                    avatar={profAvatar} 
                    name={profName || 'Your Name'} 
                    avatarBg={profAvatarBg} 
                    size={56} 
                  />
                </div>
                <div className="live-preview-text">
                  <span className="live-name">{profName || 'Your Name'}</span>
                  <span className="live-target">{profTarget}</span>
                </div>
              </div>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="modal-tabs-strip">
              <button
                type="button"
                className={`modal-tab-pill ${editModalTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setEditModalTab('appearance')}
              >
                <AnimatedSparkleIcon size={13} color="#38bdf8" />
                <span>Appearance & Banner</span>
              </button>
              <button
                type="button"
                className={`modal-tab-pill ${editModalTab === 'identity' ? 'active' : ''}`}
                onClick={() => setEditModalTab('identity')}
              >
                <Icons.User size={13} />
                <span>Identity & Goals</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form-body">
              {profileSuccessMsg && (
                <div className="form-success-banner">
                  <Icons.Check size={14} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: APPEARANCE */}
              {editModalTab === 'appearance' && (
                <div className="form-pane">
                  <div className="form-field-group">
                    <label>Avatar Photo</label>
                    <div className="file-upload-row">
                      <input 
                        type="file" 
                        ref={imageUploadInputRef} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleImageFileChange}
                      />
                      <button
                        type="button"
                        className="file-trigger-btn"
                        onClick={() => imageUploadInputRef.current?.click()}
                      >
                        <Icons.Upload size={14} />
                        <span>Upload Custom Photo</span>
                      </button>
                      <button
                        type="button"
                        className="file-trigger-btn secondary"
                        onClick={() => {
                          setProfAvatar('default');
                          showToast("Reset to default icon!");
                        }}
                      >
                        Use Default Icon
                      </button>
                    </div>

                    <label style={{ marginTop: '12px' }}>Avatar Glow / Background Accent</label>
                    <div className="color-swatches-grid">
                      {BG_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`swatch-circle ${profAvatarBg === c ? 'active' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setProfAvatarBg(c)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="form-field-group" style={{ marginTop: '14px' }}>
                    <label>Passport Banner (JPG, PNG, or GIF)</label>
                    <div className="file-upload-row">
                      <input 
                        type="file" 
                        ref={bannerUploadInputRef} 
                        accept="image/*,.gif" 
                        style={{ display: 'none' }} 
                        onChange={handleBannerFileChange}
                      />
                      <button
                        type="button"
                        className="file-trigger-btn"
                        onClick={() => bannerUploadInputRef.current?.click()}
                      >
                        <Icons.Upload size={14} />
                        <span>Upload Banner Photo or GIF</span>
                      </button>
                    </div>

                    <label style={{ marginTop: '12px' }}>Preset Cyber Theme Palettes</label>
                    <div className="banner-swatches-grid">
                      {BANNER_THEMES.map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          title={theme.name}
                          className={`swatch-rect ${profBannerBg === theme.bg ? 'active' : ''}`}
                          style={{ background: theme.bg }}
                          onClick={() => {
                            setProfBannerBg(theme.bg);
                            setProfBannerUrl('');
                          }}
                        >
                          {profBannerBg === theme.bg && <Icons.Check size={11} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IDENTITY & GOALS */}
              {editModalTab === 'identity' && (
                <div className="form-pane">
                  <div className="form-row two-cols">
                    <div className="form-field">
                      <label>Display Name</label>
                      <input
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        placeholder="e.g. Sunny Pathak"
                      />
                    </div>
                    <div className="form-field">
                      <label>Username / Handle</label>
                      <input
                        type="text"
                        value={profUsername}
                        onChange={(e) => setProfUsername(e.target.value)}
                        placeholder="e.g. sunnypathak"
                      />
                    </div>
                  </div>

                  <div className="form-row two-cols">
                    <div className="form-field">
                      <label>Target Examination & Goal</label>
                      <AnimatedSelect
                        value={profTarget}
                        onChange={(e) => setProfTarget(e.target.value)}
                        options={TARGET_PRESETS.map(t => ({ value: t, label: t }))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Location / City (Optional)</label>
                      <input
                        type="text"
                        value={profLocation}
                        onChange={(e) => setProfLocation(e.target.value)}
                        placeholder="e.g. Bengaluru, KA"
                      />
                    </div>
                  </div>

                  <div className="form-field full">
                    <label>Aspirant Bio & Strategy Notes</label>
                    <textarea
                      rows={3}
                      value={profBio}
                      onChange={(e) => setProfBio(e.target.value)}
                      placeholder="e.g. Targeting 99.5+%ile with disciplined morning Quant drills and weekly full-length analysis."
                    />
                  </div>
                </div>
              )}

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: AUTHENTICATION (SIGN IN / SIGN UP)
         ======================================================== */}
      {isAuthModalOpen && (
        <div className="mock-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
          <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Icons.Shield size={16} />
                <h3>{isSignUp ? 'Create Aspirant Account' : 'Sign In to Account'}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
                <Icons.Close size={16} />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="modal-form-body">
              {authError && (
                <div className="form-error-banner">
                  <Icons.Close size={14} />
                  <span>{authError}</span>
                </div>
              )}

              {isSignUp && (
                <div className="form-field">
                  <label>Full Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunny Pathak"
                    value={authDisplayName}
                    onChange={(e) => setAuthDisplayName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="aspirant@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <div className="auth-switch-prompt">
                {isSignUp ? (
                  <span>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setIsSignUp(false)}>Sign In</button>
                  </span>
                ) : (
                  <span>
                    Don't have an account yet?{' '}
                    <button type="button" onClick={() => setIsSignUp(true)}>Sign Up</button>
                  </span>
                )}
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAuthModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={authLoading}>
                  {authLoading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
