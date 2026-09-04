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
import { 
  calculateLevelFromExp, 
  getExpProgress
} from '../utils/expSystem';
import AvatarRenderer, { AVATAR_PRESETS } from './AvatarRenderer';
import AspirantProfileCard from './AspirantProfileCard';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { calculateUserBadges } from '../utils/badgeUtils';
import { AVATAR_FRAMES, PROFILE_BANNERS, getEffectiveFrameId, getEffectiveBannerId } from '../data/cosmeticsData';
import MythicBannerOverlay from './MythicBannerOverlay';
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
import SmoothCaretTextarea from './animations/SmoothCaretTextarea';
import { getLenis } from '../utils/smoothScroll';

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
  'CAT (99.5+%ile • IIM-A Focus)',
  'CAT (99.0+%ile • IIM-B/C Focus)',
  'CAT (98.0+%ile • Top IIMs & FMS)',
  'CAT Foundation & Prep',
  'XAT + CAT Dual Target (XLRI Focus)',
  'All MBA Entrances Target',
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
  onResetEditOpen = null,
  onTriggerLevelUp = null
}) {
  // Navigation Section: 'passport' (Full Executive Profile) | 'network' (Friends & Invitations) | 'settings' (Data & Cloud)
  const [activeSection, setActiveSection] = useState(initialSubTab === 'friends' ? 'network' : 'passport');

  useEffect(() => {
    if (initialSubTab === 'friends') {
      setActiveSection('network');
    }
  }, [initialSubTab]);

  // Live Live Aggregated Metrics Calculation (Moved up to prevent TDZ ReferenceError)
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

  const unlockedBadges = useMemo(() => badges.filter(b => b.isUnlocked), [badges]);

  // Featured Showcase Badges (User-customizable 3 to 4 best achievements)
  const [showcaseBadgeIds, setShowcaseBadgeIds] = useState(() => {
    try {
      const saved = localStorage.getItem('user_showcase_badges');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return userProfile?.showcaseBadgeIds || ['streak-1', 'solved-10', 'streak-3'];
  });
  const [isCustomizingShowcase, setIsCustomizingShowcase] = useState(false);

  const showcaseBadges = useMemo(() => {
    const selected = showcaseBadgeIds.map(id => badges.find(b => b.id === id)).filter(Boolean);
    if (selected.length > 0) return selected.slice(0, 4);
    return badges.slice(0, 3);
  }, [showcaseBadgeIds, badges]);

  const toggleShowcaseBadge = (badgeId) => {
    setShowcaseBadgeIds(prev => {
      let updated;
      if (prev.includes(badgeId)) {
        if (prev.length <= 1) return prev; // Keep at least 1 badge in showcase
        updated = prev.filter(id => id !== badgeId);
      } else {
        if (prev.length >= 4) {
          // Replace oldest to cap strictly at 4
          updated = [...prev.slice(1), badgeId];
        } else {
          updated = [...prev, badgeId];
        }
      }
      try {
        localStorage.setItem('user_showcase_badges', JSON.stringify(updated));
      } catch (e) {}
      if (user && onUpdateProfile) {
        onUpdateProfile({ showcaseBadgeIds: updated });
      }
      return updated;
    });
  };

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

  // Prevent background website page from scrolling & stop Lenis wheel hijacking when modal is open
  useEffect(() => {
    if (isEditModalOpen || isCustomizingShowcase || isAuthModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const lenis = getLenis();
      if (lenis) lenis.stop();
      return () => {
        document.body.style.overflow = originalOverflow;
        if (lenis) lenis.start();
      };
    }
  }, [isEditModalOpen, isCustomizingShowcase, isAuthModalOpen]);

  // RPG Level & EXP Progression (From Firebase Database for logged in users, defaulting strictly to Level 1 / 0 EXP for new accounts)
  const currentExp = userProfile?.exp !== undefined 
    ? userProfile.exp 
    : (user ? 0 : (userProfile?.exp ?? 0));
  const userLevel = userProfile?.level !== undefined
    ? userProfile.level
    : (user ? 1 : (calculateLevelFromExp(currentExp) || 1));
  const expProgress = getExpProgress(currentExp);

  // Profile customization state
  const savedCosmetics = (() => {
    try {
      const s = localStorage.getItem('local_aspirant_cosmetics');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  })();

  const [profName, setProfName] = useState(userProfile?.displayName || user?.displayName || savedCosmetics?.displayName || '');
  const [profUsername, setProfUsername] = useState(userProfile?.username || (user?.email ? user.email.split('@')[0] : 'aspirant'));
  const [profAvatar, setProfAvatar] = useState(userProfile?.avatar || savedCosmetics?.avatar || 'rocket');
  const [profAvatarBg, setProfAvatarBg] = useState(userProfile?.avatarBg || savedCosmetics?.avatarBg || '#38bdf8');
  const [profFrameId, setProfFrameId] = useState(getEffectiveFrameId(userProfile?.frameId || savedCosmetics?.frameId || 'default', userLevel));
  const [profBannerId, setProfBannerId] = useState(getEffectiveBannerId(userProfile?.bannerId || savedCosmetics?.bannerId || 'cyber_grid', userLevel));
  const [profBannerBg, setProfBannerBg] = useState(userProfile?.bannerBg || savedCosmetics?.bannerBg || '#0b1120');
  const [profBannerUrl, setProfBannerUrl] = useState(userProfile?.bannerUrl || savedCosmetics?.bannerUrl || '');
  const [profBio, setProfBio] = useState(userProfile?.bio || '');
  const [profTarget, setProfTarget] = useState(userProfile?.target || 'CAT (99.5+%ile • IIM-A Focus)');
  const [profLocation, setProfLocation] = useState(userProfile?.location || '');
  const [editModalTab, setEditModalTab] = useState('avatar_frame');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Keep local fields strictly in sync whenever userProfile prop changes
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName !== undefined) setProfName(userProfile.displayName);
      if (userProfile.username !== undefined) setProfUsername(userProfile.username);
      if (userProfile.avatar !== undefined) setProfAvatar(userProfile.avatar);
      if (userProfile.avatarBg !== undefined) setProfAvatarBg(userProfile.avatarBg);
      if (userProfile.frameId !== undefined) {
        setProfFrameId(getEffectiveFrameId(userProfile.frameId, userLevel));
      }
      if (userProfile.bannerId !== undefined) {
        setProfBannerId(getEffectiveBannerId(userProfile.bannerId, userLevel));
      }
      if (userProfile.bannerBg !== undefined) setProfBannerBg(userProfile.bannerBg);
      if (userProfile.bannerUrl !== undefined) setProfBannerUrl(userProfile.bannerUrl);
      if (userProfile.bio !== undefined) setProfBio(userProfile.bio);
      if (userProfile.target !== undefined) setProfTarget(userProfile.target);
      if (userProfile.location !== undefined) setProfLocation(userProfile.location);
    }
  }, [userProfile, userLevel]);

  // Instant equip handlers that propagate immediately to profile card
  const handleEquipFrame = (frameId, frameName) => {
    setProfFrameId(frameId);
    showToast(`Equipped ${frameName} frame!`);
    try {
      const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
      saved.frameId = frameId;
      localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
    } catch (e) {}
    if (onUpdateProfile) {
      onUpdateProfile({ frameId });
    }
  };

  const handleEquipBanner = (bannerId, bannerName) => {
    setProfBannerId(bannerId);
    setProfBannerUrl('');
    showToast(`Equipped ${bannerName} banner!`);
    try {
      const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
      saved.bannerId = bannerId;
      saved.bannerUrl = '';
      localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
    } catch (e) {}
    if (onUpdateProfile) {
      onUpdateProfile({ bannerId, bannerUrl: '' });
    }
  };

  const handleSelectAvatarPreset = (avatarId, label) => {
    setProfAvatar(avatarId);
    showToast(`Selected ${label}!`);
    try {
      const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
      saved.avatar = avatarId;
      localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
    } catch (e) {}
    if (onUpdateProfile) {
      onUpdateProfile({ avatar: avatarId });
    }
  };

  const handleSelectAvatarColor = (color) => {
    setProfAvatarBg(color);
    try {
      const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
      saved.avatarBg = color;
      localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
    } catch (e) {}
    if (onUpdateProfile) {
      onUpdateProfile({ avatarBg: color });
    }
  };

  // Effective Cosmetics validated against level (defaults to 'default' and 'cyber_grid' for Level 1)
  const effectiveProfFrameId = getEffectiveFrameId(profFrameId, userLevel);
  const effectiveProfBannerId = getEffectiveBannerId(profBannerId, userLevel);

  // Sanitize stored local cosmetics if user level does not satisfy equipped frame/banner
  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_aspirant_cosmetics');
      if (raw) {
        const parsed = JSON.parse(raw);
        let changed = false;
        if (parsed.frameId && getEffectiveFrameId(parsed.frameId, userLevel) !== parsed.frameId) {
          parsed.frameId = 'default';
          changed = true;
          setProfFrameId('default');
        }
        if (parsed.bannerId && getEffectiveBannerId(parsed.bannerId, userLevel) !== parsed.bannerId) {
          parsed.bannerId = 'cyber_grid';
          changed = true;
          setProfBannerId('cyber_grid');
        }
        if (changed) {
          localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(parsed));
        }
      }
    } catch (e) {}
  }, [userLevel]);

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

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    setProfileSaving(true);
    setProfileSuccessMsg('');

    try {
      const updatedProfileData = {
        displayName: profName.trim() || user?.email?.split('@')[0] || 'Aspirant',
        username: profUsername.trim() || user?.email?.split('@')[0] || 'aspirant',
        avatar: profAvatar,
        avatarBg: profAvatarBg,
        frameId: profFrameId,
        bannerId: profBannerId,
        bannerBg: profBannerBg,
        bannerUrl: profBannerUrl,
        bio: profBio.trim(),
        target: profTarget.trim(),
        location: profLocation.trim(),
        aspirantId: currentAspirantId
      };

      // Also persist to localStorage so guest / offline mode retains cosmetics
      try {
        localStorage.setItem('local_aspirant_cosmetics', JSON.stringify({
          frameId: profFrameId,
          bannerId: profBannerId,
          bannerUrl: profBannerUrl,
          displayName: profName.trim() || 'Aspirant',
          avatar: profAvatar,
          avatarBg: profAvatarBg
        }));
      } catch (err) {}

      if (onUpdateProfile) {
        await onUpdateProfile(updatedProfileData);
      }
      setProfileSuccessMsg("Loadout & Profile updated!");
      showToast("Loadout & profile saved successfully!");
      setTimeout(() => setIsEditModalOpen(false), 900);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please check connection.");
    } finally {
      setProfileSaving(false);
    }
  };

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
          SECTION 1: ASPIRANT TACTICAL CAREER HUB (Spacious Layout)
         ======================================================== */}
      {activeSection === 'passport' && (
        <div className="tactical-career-workspace fade-in">
          
          {/* TOP: Full-Width Spacious Panoramic Operative Card */}
          <div className="panoramic-card-wrapper">
            <AspirantProfileCard
              user={user}
              profile={{
                displayName: profName || user?.displayName,
                target: profTarget,
                bio: profBio,
                location: profLocation,
                avatar: profAvatar,
                avatarBg: profAvatarBg,
                frameId: effectiveProfFrameId,
                bannerId: effectiveProfBannerId,
                bannerUrl: profBannerUrl,
                streak: liveStats.streak,
                solvedQs: liveStats.solvedQs,
                mocksCount: liveStats.mocksCount,
                status: user ? 'online' : 'offline',
                aspirantId: currentAspirantId,
                exp: currentExp,
                level: userLevel
              }}
              tracker={tracker}
              showcaseBadges={showcaseBadges}
              isSelf={true}
              onEditProfile={() => setIsEditModalOpen(true)}
              compact={false}
            />
          </div>

          {/* Candidate Level & EXP Progression Ribbon */}
          <div className="exp-ribbon-panel">
            <div className="exp-ribbon-top">
              <div className="exp-ribbon-badge-col font-mono">
                <span className="exp-ribbon-level">LEVEL {expProgress.currentLevel}</span>
                <span className="exp-ribbon-title">{expProgress.milestoneTitle.toUpperCase()}</span>
              </div>
              <div className="exp-ribbon-actions font-mono">
                <span className="exp-ribbon-counter">
                  {expProgress.totalExp} TOTAL EXP • {expProgress.expIntoLevel} / {expProgress.expNeededForNext} to Level {expProgress.currentLevel + 1} ({expProgress.progressPercent}%)
                </span>
              </div>
            </div>
            <div className="exp-bar-track">
              <div className="exp-bar-fill" style={{ width: `${expProgress.progressPercent}%` }} />
            </div>
          </div>

          {/* LOWER WORKSPACE: 2-Column Telemetry & Social Hub */}
          <div className="tactical-lower-workspace-grid">
            
            {/* LEFT COLUMN: Activity Matrix & Dungeon Quotas */}
            <div className="tactical-lower-main-col">
              
              {/* Panel 1: Activity Matrix (GitHub-Style Heatmap) */}
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

              {/* Panel 2: Dungeon Campaign Quotas (Quant, DILR, VARC) */}
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Target size={16} className="panel-ico" />
                    <h3>Dungeon Campaign Syllabus Telemetry</h3>
                  </div>
                  <span className="panel-tag font-mono">TARGET RATIO</span>
                </div>
                
                <div className="syllabus-cards-container" style={{ margin: '8px 0 0 0' }}>
                  {/* Quant Dungeon */}
                  <div className="syllabus-progress-card quant-theme">
                    <div className="syllabus-label-row">
                      <div className="syllabus-sub-title">
                        <span className="syllabus-icon-badge quant-badge"><Icons.Calculator size={13} /></span>
                        <span className="syllabus-subject-name font-mono">QUANTITATIVE LABYRINTH</span>
                      </div>
                      <div className="syllabus-stats-badge font-mono">
                        <span className="syllabus-count-val">{liveStats.quantQs.toLocaleString()} / 2,500 Qs</span>
                        <span className="syllabus-percent-pill quant-pill">
                          {Math.min(100, Math.round((liveStats.quantQs / 2500) * 100))}%
                        </span>
                      </div>
                    </div>
                    <div className="syllabus-track">
                      <div 
                        className="syllabus-fill quant" 
                        style={{ width: `${Math.min(100, Math.round((liveStats.quantQs / 2500) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* DILR Logic Crypt */}
                  <div className="syllabus-progress-card lrdi-theme">
                    <div className="syllabus-label-row">
                      <div className="syllabus-sub-title">
                        <span className="syllabus-icon-badge lrdi-badge"><Icons.Puzzle size={13} /></span>
                        <span className="syllabus-subject-name font-mono">DILR LOGIC CRYPT</span>
                      </div>
                      <div className="syllabus-stats-badge font-mono">
                        <span className="syllabus-count-val">{liveStats.lrdiQs.toLocaleString()} / 500 Sets</span>
                        <span className="syllabus-percent-pill lrdi-pill">
                          {Math.min(100, Math.round((liveStats.lrdiQs / 500) * 100))}%
                        </span>
                      </div>
                    </div>
                    <div className="syllabus-track">
                      <div 
                        className="syllabus-fill lrdi" 
                        style={{ width: `${Math.min(100, Math.round((liveStats.lrdiQs / 500) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* VARC Spire */}
                  <div className="syllabus-progress-card varc-theme">
                    <div className="syllabus-label-row">
                      <div className="syllabus-sub-title">
                        <span className="syllabus-icon-badge varc-badge"><Icons.BookOpen size={13} /></span>
                        <span className="syllabus-subject-name font-mono">VARC COMPREHENSION SPIRE</span>
                      </div>
                      <div className="syllabus-stats-badge font-mono">
                        <span className="syllabus-count-val">{liveStats.varcQs.toLocaleString()} / 500 Articles</span>
                        <span className="syllabus-percent-pill varc-pill">
                          {Math.min(100, Math.round((liveStats.varcQs / 500) * 100))}%
                        </span>
                      </div>
                    </div>
                    <div className="syllabus-track">
                      <div 
                        className="syllabus-fill varc" 
                        style={{ width: `${Math.min(100, Math.round((liveStats.varcQs / 500) * 100))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Prestige Armory & Battle Squad */}
            <div className="tactical-lower-side-col">
              
              {/* Panel 3: Featured Achievements Showcase (User Customizable 3-4 Badges) */}
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Award size={16} className="panel-ico" />
                    <h3>Featured Achievements Showcase</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="panel-customize-btn font-mono"
                      onClick={() => setIsCustomizingShowcase(true)}
                      title="Choose which 3-4 badges to showcase"
                    >
                      <Icons.Edit3 size={11} />
                      <span>SELECT ({showcaseBadges.length}/4)</span>
                    </button>
                    {setActiveTab && (
                      <button 
                        type="button" 
                        className="panel-link-btn"
                        onClick={() => setActiveTab('achievements')}
                      >
                        All ({badges.length}) →
                      </button>
                    )}
                  </div>
                </div>
                <p className="panel-explainer">
                  Showcase of your best achievements and prestige medals pinned to your operative profile.
                </p>

                <div className="featured-showcase-rack">
                  {showcaseBadges.map((badge) => {
                    const IconComp = Icons[badge.iconName] || Icons.Award;
                    return (
                      <div 
                        key={badge.id}
                        className={`featured-showcase-card ${badge.isUnlocked ? 'unlocked' : 'locked'}`}
                        style={{ '--accent-color': badge.color }}
                        onClick={() => setIsCustomizingShowcase(true)}
                        title="Click to customize your featured showcase"
                      >
                        <div className="showcase-card-top">
                          <div className="showcase-emblem-wrap">
                            <IconComp size={20} />
                          </div>
                          <span className={`showcase-status-chip font-mono ${badge.isUnlocked ? 'unlocked' : 'locked'}`}>
                            {badge.isUnlocked ? 'UNLOCKED' : `REQ: ${badge.threshold}`}
                          </span>
                        </div>
                        <span className="showcase-badge-title font-mono">{badge.name}</span>
                        <span className="showcase-badge-desc">{badge.perkTitle || badge.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel 4: Quick Peer Connect & Active Squad */}
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Users size={16} className="panel-ico" />
                    <h3>Battle Squad ({friends.length})</h3>
                  </div>
                  <button 
                    type="button" 
                    className="panel-link-btn"
                    onClick={() => setActiveSection('network')}
                  >
                    Manage Squad →
                  </button>
                </div>
                <p className="panel-explainer">
                  Link with peer aspirants using their Unique ID (e.g. <code>ASP-849201</code>) or email to compare prep pace.
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
                      {friendActionLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </form>

                {friendFeedback.text && (
                  <div className={`connect-feedback-tag ${friendFeedback.type}`}>
                    {friendFeedback.type === 'success' ? <Icons.Check size={12} /> : <Icons.Close size={12} />}
                    <span>{friendFeedback.text}</span>
                  </div>
                )}

                {friends.length > 0 && (
                  <div className="friends-mini-stack" style={{ marginTop: '12px' }}>
                    {friends.slice(0, 3).map((f) => (
                      <div key={f.id || f.uid} className="friend-mini-row">
                        <AvatarRenderer 
                          avatar={f.avatar || 'rocket'} 
                          name={f.displayName || f.name} 
                          avatarBg={f.avatarBg || '#38bdf8'} 
                          size={32}
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
          MODAL: CUSTOMIZE FEATURED ACHIEVEMENTS SHOWCASE (3-4 SLOTS)
         ======================================================== */}
      {isCustomizingShowcase && (
        <div 
          className="mock-modal-overlay" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setIsCustomizingShowcase(false)}
        >
          <div 
            className="showcase-modal-box" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Icons.Award size={16} />
                <h3>Select Featured Achievements (Choose 3 or 4)</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setIsCustomizingShowcase(false)}>
                <Icons.Close size={16} />
              </button>
            </div>

            <div className="showcase-modal-body">
              <p className="showcase-modal-instruction">
                Pick 3 or 4 of your proudest achievements to showcase on your operative profile card and career overview.
                <span className="showcase-selection-count font-mono">
                  {showcaseBadgeIds.length} / 4 PINNED
                </span>
              </p>

              <div 
                className="showcase-picker-grid"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                {badges.map((b) => {
                  const IconComp = Icons[b.iconName] || Icons.Award;
                  const isSelected = showcaseBadgeIds.includes(b.id);

                  return (
                    <div
                      key={b.id}
                      className={`showcase-picker-item ${isSelected ? 'selected' : ''} ${b.isUnlocked ? 'unlocked' : 'locked'}`}
                      onClick={() => toggleShowcaseBadge(b.id)}
                    >
                      <div className="picker-item-left">
                        <div className="picker-badge-icon" style={{ color: b.color, backgroundColor: `${b.color}18` }}>
                          <IconComp size={18} />
                        </div>
                        <div className="picker-badge-details">
                          <span className="picker-badge-name font-mono">{b.name}</span>
                          <span className="picker-badge-desc">{b.perkTitle || b.description}</span>
                          <span className="picker-badge-status font-mono">
                            {b.isUnlocked ? 'Unlocked' : `Lock (${b.threshold})`}
                          </span>
                        </div>
                      </div>

                      <div className="picker-checkbox font-mono">
                        {isSelected ? <Icons.Check size={14} /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-save"
                  onClick={() => {
                    setIsCustomizingShowcase(false);
                    showToast("Showcase updated!");
                  }}
                >
                  Confirm &amp; Display Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PROFILE & APPEARANCE
         ======================================================== */}
      {isEditModalOpen && (
        <div 
          className="mock-modal-overlay" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="edit-profile-modal-box" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            
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
                className={`live-preview-banner ${PROFILE_BANNERS.find(b => b.id === effectiveProfBannerId)?.overlayClass || ''}`}
                style={{
                  background: PROFILE_BANNERS.find(b => b.id === effectiveProfBannerId)?.bg || profBannerBg || 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                  backgroundImage: profBannerUrl ? `url(${profBannerUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <MythicBannerOverlay bannerId={effectiveProfBannerId} />
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
                    frameId={effectiveProfFrameId}
                    size={60} 
                  />
                </div>
                <div className="live-preview-text">
                  <div className="live-preview-row-title">
                    <span className="live-name">{profName || 'Your Name'}</span>
                    <span className="live-lvl-pill font-mono">
                      LVL {userLevel} • {expProgress.milestoneTitle.toUpperCase()}
                    </span>
                  </div>
                  <div className="live-preview-row-sub">
                    <span className="live-target">{profTarget}</span>
                    {profLocation && (
                      <span className="live-location font-mono">• {profLocation}</span>
                    )}
                  </div>
                  <div className="live-preview-exp-track">
                    <div className="live-preview-exp-fill" style={{ width: `${expProgress.progressPercent}%` }} />
                    <span className="live-preview-exp-label font-mono">
                      {expProgress.expIntoLevel} / {expProgress.expNeededForNext} EXP to Level {userLevel + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="modal-tabs-strip">
              <button
                type="button"
                className={`modal-tab-pill ${editModalTab === 'avatar_frame' || editModalTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setEditModalTab('avatar_frame')}
              >
                <AnimatedSparkleIcon size={14} color="#38bdf8" />
                <span>Avatar &amp; Frames</span>
              </button>
              <button
                type="button"
                className={`modal-tab-pill ${editModalTab === 'banners' ? 'active' : ''}`}
                onClick={() => setEditModalTab('banners')}
              >
                <AnimatedRadarBeaconIcon size={14} color="#a855f7" />
                <span>Animated Banners</span>
              </button>
              <button
                type="button"
                className={`modal-tab-pill ${editModalTab === 'identity' ? 'active' : ''}`}
                onClick={() => setEditModalTab('identity')}
              >
                <Icons.User size={14} />
                <span>Identity &amp; Goals</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form-body">
              {profileSuccessMsg && (
                <div className="form-success-banner">
                  <Icons.Check size={14} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: AVATAR & FRAMES */}
              {(editModalTab === 'avatar_frame' || editModalTab === 'appearance') && (
                <div className="form-pane">
                  {/* 1A. AVATAR SYMBOL & COLOR PALETTE */}
                  <div className="edit-section-card">
                    <div className="edit-section-header">
                      <div className="edit-section-title font-mono">
                        <Icons.User size={14} />
                        <span>Avatar Symbol Preset &amp; Accent</span>
                      </div>
                      <span className="edit-section-hint font-mono">8 Presets • 10 Colors</span>
                    </div>

                    <div className="avatar-preset-grid">
                      {AVATAR_PRESETS.map((preset) => {
                        const PresetIcon = preset.icon;
                        const isSelected = profAvatar === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            className={`avatar-preset-tile ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectAvatarPreset(preset.id, preset.label)}
                          >
                            <div 
                              className="preset-icon-circle" 
                              style={{ 
                                backgroundColor: isSelected ? profAvatarBg : 'rgba(255, 255, 255, 0.05)',
                                color: isSelected ? '#ffffff' : (preset.color || '#94a3b8')
                              }}
                            >
                              <PresetIcon size={17} />
                            </div>
                            <span className="preset-label font-mono">{preset.label}</span>
                            {isSelected && <span className="preset-active-dot" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="avatar-color-row">
                      <span className="avatar-color-label font-mono">Aura Accent:</span>
                      <div className="color-swatches-grid">
                        {BG_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`swatch-circle ${profAvatarBg === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => handleSelectAvatarColor(c)}
                            title={`Aura Accent: ${c}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1B. UNLOCKABLE AVATAR FRAMES */}
                  <div className="edit-section-card" style={{ marginTop: '4px' }}>
                    <div className="edit-section-header">
                      <div className="edit-section-title font-mono">
                        <AnimatedSparkleIcon size={14} color="#38bdf8" />
                        <span>Unlockable Avatar Frames</span>
                      </div>
                      <span className="edit-section-hint font-mono">
                        Rank: Level {userLevel} • {AVATAR_FRAMES.filter(f => userLevel >= f.minLevel).length}/{AVATAR_FRAMES.length} Unlocked
                      </span>
                    </div>

                    <div className="cosmetic-frames-grid-v2">
                      {AVATAR_FRAMES.map((frame) => {
                        const isUnlocked = userLevel >= frame.minLevel;
                        const isEquipped = effectiveProfFrameId === frame.id;

                        return (
                          <div 
                            key={frame.id}
                            className={`cosmetic-frame-card-v2 ${isEquipped ? 'equipped' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                            onClick={() => {
                              if (isUnlocked) {
                                handleEquipFrame(frame.id, frame.name);
                              }
                            }}
                          >
                            <div className="frame-card-preview-v2">
                              <AvatarRenderer
                                avatar={profAvatar}
                                name={profName}
                                avatarBg={profAvatarBg}
                                frameId={frame.id}
                                size={52}
                              />
                            </div>
                            <div className="frame-card-content-v2">
                              <div className="frame-card-header-v2 font-mono">
                                <span className="frame-name-v2 font-mono">{frame.name}</span>
                                <span 
                                  className="frame-tier-badge-v2 font-mono" 
                                  style={{ color: frame.color, borderColor: `${frame.color}50`, background: `${frame.color}18` }}
                                >
                                  {frame.tier}
                                </span>
                              </div>
                              <p className="frame-desc-v2">{frame.description}</p>
                              <div className="frame-card-footer-v2 font-mono">
                                {isEquipped ? (
                                  <span className="frame-status-pill equipped font-mono">
                                    <Icons.Check size={11} /> EQUIPPED
                                  </span>
                                ) : isUnlocked ? (
                                  <button type="button" className="frame-equip-action-btn font-mono">
                                    EQUIP FRAME
                                  </button>
                                ) : (
                                  <span className="frame-status-pill locked font-mono">
                                    <Icons.Lock size={11} /> REQ. LVL {frame.minLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANIMATED BANNERS */}
              {editModalTab === 'banners' && (
                <div className="form-pane">
                  <div className="edit-section-card">
                    <div className="edit-section-header">
                      <div className="edit-section-title font-mono">
                        <AnimatedRadarBeaconIcon size={14} color="#a855f7" />
                        <span>Unlockable Animated Horizon Banners</span>
                      </div>
                      <span className="edit-section-hint font-mono">
                        Rank: Level {userLevel} • {PROFILE_BANNERS.filter(b => userLevel >= b.minLevel).length}/{PROFILE_BANNERS.length} Unlocked
                      </span>
                    </div>

                    <div className="cosmetic-banners-grid-v2">
                      {PROFILE_BANNERS.map((banner) => {
                        const isUnlocked = userLevel >= banner.minLevel;
                        const isEquipped = effectiveProfBannerId === banner.id && !profBannerUrl;

                        return (
                          <div 
                            key={banner.id}
                            className={`cosmetic-banner-card-v2 ${isEquipped ? 'equipped' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                            onClick={() => {
                              if (isUnlocked) {
                                handleEquipBanner(banner.id, banner.name);
                              }
                            }}
                          >
                            <div 
                              className={`banner-thumb-panoramic ${banner.overlayClass || ''}`}
                              style={{ background: banner.bg }}
                            >
                              <MythicBannerOverlay bannerId={banner.id} />
                              <div className="banner-thumb-scrim-v2" />
                              <div className="banner-thumb-meta-top font-mono">
                                <span 
                                  className="banner-tier-badge-v2 font-mono"
                                  style={{
                                    color: banner.tierColor || '#94a3b8',
                                    borderColor: `${banner.tierColor || '#94a3b8'}60`,
                                    background: 'rgba(0, 0, 0, 0.65)'
                                  }}
                                >
                                  {banner.tier}
                                </span>
                                {!isUnlocked && (
                                  <span className="banner-lock-pill font-mono">
                                    <Icons.Lock size={10} />
                                    <span>LVL {banner.minLevel}</span>
                                  </span>
                                )}
                              </div>
                              <span className="banner-thumb-name font-mono">{banner.name}</span>
                            </div>

                            <div className="banner-card-body-v2">
                              <p className="banner-desc-v2" title={banner.description}>
                                {banner.description}
                              </p>
                              <div className="banner-action-row-v2 font-mono">
                                {isEquipped ? (
                                  <span className="banner-status-pill equipped font-mono">
                                    <Icons.Check size={11} /> EQUIPPED
                                  </span>
                                ) : isUnlocked ? (
                                  <button type="button" className="banner-equip-action-btn font-mono">
                                    EQUIP BANNER
                                  </button>
                                ) : (
                                  <span className="banner-status-pill locked font-mono">
                                    <Icons.Lock size={11} /> UNLOCKS AT LVL {banner.minLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IDENTITY & GOALS */}
              {editModalTab === 'identity' && (
                <div className="form-pane">
                  <div className="edit-section-card">
                    <div className="edit-section-header">
                      <div className="edit-section-title font-mono">
                        <Icons.User size={14} />
                        <span>Aspirant Identity &amp; Target Goal</span>
                      </div>
                      <span className="edit-section-hint font-mono">Candidate Bio &amp; Strategy</span>
                    </div>

                    <div className="identity-form-fields">
                      <div className="form-row two-cols">
                        <div className="form-field">
                          <label className="font-mono">Display Name</label>
                          <input
                            type="text"
                            required
                            value={profName}
                            onChange={(e) => setProfName(e.target.value)}
                            placeholder="e.g. Sunny Pathak"
                            className="clean-field-input"
                          />
                        </div>
                        <div className="form-field">
                          <label className="font-mono">Handle / Username</label>
                          <div className="input-with-affix">
                            <span className="affix-at font-mono">@</span>
                            <input
                              type="text"
                              value={profUsername}
                              onChange={(e) => setProfUsername(e.target.value)}
                              placeholder="sunnypathak"
                              className="clean-field-input affixed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-row two-cols">
                        <div className="form-field">
                          <label className="font-mono">Target Examination &amp; Goal</label>
                          <AnimatedSelect
                            value={profTarget}
                            onChange={(e) => setProfTarget(e.target.value)}
                            options={TARGET_PRESETS.map(t => ({ value: t, label: t }))}
                          />
                        </div>
                        <div className="form-field">
                          <label className="font-mono">Location / City (Optional)</label>
                          <input
                            type="text"
                            value={profLocation}
                            onChange={(e) => setProfLocation(e.target.value)}
                            placeholder="e.g. Bengaluru, KA"
                            className="clean-field-input"
                          />
                        </div>
                      </div>

                      <div className="form-field full">
                        <label className="font-mono">Aspirant Bio &amp; Strategy Notes</label>
                        <SmoothCaretTextarea
                          rows={3}
                          value={profBio}
                          onChange={(e) => setProfBio(e.target.value)}
                          placeholder="e.g. Targeting 99.5+%ile with disciplined morning Quant drills and weekly full-length analysis."
                          className="vault-textarea"
                        />
                      </div>

                      <div className="aspirant-id-badge-row">
                        <div className="aspirant-id-info">
                          <span className="id-label font-mono">Aspirant ID:</span>
                          <code className="id-code font-mono">{currentAspirantId}</code>
                        </div>
                        <button 
                          type="button" 
                          className="id-copy-action-btn font-mono"
                          onClick={handleCopyMyId}
                        >
                          {copiedMyId ? (
                            <>
                              <Icons.Check size={12} color="#34d399" />
                              <span style={{ color: '#34d399' }}>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Icons.Copy size={12} />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-footer-actions">
                <div className="modal-footer-note font-mono">
                  <span>Cosmetic modifications apply instantly across your profile card.</span>
                </div>
                <div className="modal-footer-btns">
                  <button type="button" className="btn-cancel font-mono" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save font-mono" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: AUTHENTICATION (SIGN IN / SIGN UP)
         ======================================================== */}
      {isAuthModalOpen && (
        <div 
          className="mock-modal-overlay" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div 
            className="auth-modal-box" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
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
