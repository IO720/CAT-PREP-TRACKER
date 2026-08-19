import React, { useState, useEffect, useRef } from 'react';
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
import AspirantProfileCard from './AspirantProfileCard';
import { Icons } from './AspirantIcons';

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
  initialSubTab = 'profile',
  onResetSubTab = null,
  isEditOpen = false,
  onResetEditOpen = null
}) {
  // Sub-tabs: 'profile' (View Profile & Edit) | 'friends' (Add Friends & Buddy Network)
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'profile');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Edit Profile Hover / Modal Pop-up State
  const [isEditModalOpen, setIsEditModalOpen] = useState(isEditOpen);

  useEffect(() => {
    if (isEditOpen) {
      setIsEditModalOpen(true);
      setActiveSubTab('profile');
      if (onResetEditOpen) onResetEditOpen();
    }
  }, [isEditOpen]);

  // Authentication State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile customization state
  const [profName, setProfName] = useState(userProfile?.displayName || user?.displayName || '');
  const [profUsername, setProfUsername] = useState(userProfile?.username || (user?.email ? user.email.split('@')[0] : ''));
  const [profAvatar, setProfAvatar] = useState(userProfile?.avatar || 'rocket');
  const [profAvatarBg, setProfAvatarBg] = useState(userProfile?.avatarBg || '#5865f2');
  const [profBannerBg, setProfBannerBg] = useState(userProfile?.bannerBg || '#1e1f22');
  const [profBannerUrl, setProfBannerUrl] = useState(userProfile?.bannerUrl || '');
  const [profBio, setProfBio] = useState(userProfile?.bio || '');
  const [profTarget, setProfTarget] = useState(userProfile?.target || 'CAT 2025 (99.5+%ile • IIM-A Focus)');
  const [profLocation, setProfLocation] = useState(userProfile?.location || '');
  const [editModalTab, setEditModalTab] = useState('appearance'); // 'appearance' | 'identity' | 'goals'
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const imageUploadInputRef = useRef(null);
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const bannerUploadInputRef = useRef(null);

  // Unique Aspirant ID State
  const currentAspirantId = userProfile?.aspirantId || (user ? generateUniqueAspirantId(user.uid) : getLocalAspirantId());
  const [copiedMyId, setCopiedMyId] = useState(false);
  const [floatingToastMsg, setFloatingToastMsg] = useState('');

  const showAssuranceToast = (msg) => {
    setFloatingToastMsg(msg);
    setTimeout(() => setFloatingToastMsg(''), 3200);
  };

  // Add Friend & Requests State
  const [friendSearchInput, setFriendSearchInput] = useState('');
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [removingFriendId, setRemovingFriendId] = useState(null);

  // Sync state when userProfile loads
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

  // Copy own Unique ID with feedback
  const handleCopyMyId = () => {
    navigator.clipboard.writeText(currentAspirantId);
    setCopiedMyId(true);
    setTimeout(() => setCopiedMyId(false), 2500);
  };

  // Handle local image file upload & compression
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
        showAssuranceToast("Avatar photo successfully applied to preview!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setProfAvatar(customImageUrl.trim());
    setCustomImageUrl('');
    showAssuranceToast("Avatar image URL successfully applied!");
  };

  // Handle local banner file upload (supports JPG, PNG, WebP, and animated GIFs)
  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Banner file size must be under 8MB.");
      return;
    }

    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

    if (isGif) {
      // Check GIF file size - directly embedded animated GIFs in Firestore must be <= 400KB
      if (file.size > 400 * 1024) {
        alert("Animated GIF file is too large (" + Math.round(file.size / 1024) + "KB). Direct file uploads must be under 400KB. Tip: Paste an image URL (e.g. from Tenor, Giphy, or Imgur) in the URL box below to use any GIF without size limits!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfBannerBg(event.target.result);
          setProfBannerUrl(event.target.result);
          showAssuranceToast("Animated GIF banner successfully applied!");
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Optimize image formats with canvas downscaling and compression
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_W = 750;
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
          if (compressed.length > 300000) {
            compressed = canvas.toDataURL('image/jpeg', 0.65);
          }
          setProfBannerBg(compressed);
          setProfBannerUrl(compressed);
          showAssuranceToast("Header banner photo successfully applied!");
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyBannerUrl = () => {
    if (!customBannerUrl.trim()) return;
    setProfBannerBg(customBannerUrl.trim());
    setProfBannerUrl(customBannerUrl.trim());
    setCustomBannerUrl('');
    showAssuranceToast("Banner image URL successfully applied!");
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      alert("Please sign in to save and sync your profile to cloud.");
      return;
    }

    if (profBannerBg && profBannerBg.length > 750000) {
      alert("Banner image is too large for cloud storage. Please select a smaller image or paste an image URL.");
      return;
    }
    if (profAvatar && profAvatar.length > 500000) {
      alert("Avatar image is too large for cloud storage. Please select a smaller photo.");
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
      setProfileSuccessMsg("Profile changes successfully applied and cloud-synced!");
      showAssuranceToast("Profile changes successfully applied and cloud-synced!");
      setTimeout(() => {
        setProfileSuccessMsg('');
        setIsEditModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Send Friend Request by Unique ID or Email
  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    setFriendError('');
    setFriendSuccess('');
    setFriendActionLoading(true);

    try {
      if (!user) {
        setFriendError("Please sign in with your CATalyze account to send friend requests.");
        return;
      }

      const cleanInput = friendSearchInput.trim();
      if (!cleanInput) {
        setFriendError("Please enter a friend's Unique Aspirant ID or Email.");
        return;
      }

      const res = await sendFriendRequest(user, cleanInput, {
        displayName: profName,
        username: profUsername,
        avatar: profAvatar,
        avatarBg: profAvatarBg,
        target: profTarget,
        aspirantId: currentAspirantId
      });

      setFriendSuccess(`Friend request sent successfully to ${res.targetUser?.displayName || 'aspirant'} (ID: ${res.targetUser?.aspirantId || 'ASP-peer'})! They will be notified in their Friend Requests panel.`);
      setFriendSearchInput('');
    } catch (err) {
      setFriendError(err.message || "Failed to send friend request.");
    } finally {
      setFriendActionLoading(false);
    }
  };

  // Handle Accept or Decline Friend Request
  const handleRespondRequest = async (request, action) => {
    setProcessingRequestId(request.id);
    try {
      await respondToFriendRequest(request.id, request.fromUid, user.uid, action);
      if (action === 'accept') {
        setFriendSuccess(`Accepted friend request from ${request.fromName}! You are now study buddies.`);
        if (onAddFriendSuccess) onAddFriendSuccess();
      } else {
        setFriendSuccess(`Declined friend request from ${request.fromName}.`);
      }
      // Remove from local list optimistically
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
      setTimeout(() => setFriendSuccess(''), 4000);
    } catch (err) {
      console.error("Error responding to request:", err);
      alert(`Failed to ${action} request: ` + err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle Remove Friend
  const handleRemoveFriend = async (friend) => {
    if (!user) return;
    const confirmRemove = window.confirm(`Are you sure you want to remove ${friend.name || friend.displayName || 'this friend'} from your Study Buddy list?`);
    if (!confirmRemove) return;

    setRemovingFriendId(friend.id || friend.uid);
    try {
      await removeFriend(user.uid, friend.id || friend.uid);
      if (onAddFriendSuccess) onAddFriendSuccess();
      setFriendSuccess(`Removed ${friend.name || 'friend'} from your buddy list.`);
      setTimeout(() => setFriendSuccess(''), 3000);
    } catch (err) {
      console.error("Error removing friend:", err);
      alert("Failed to remove friend: " + err.message);
    } finally {
      setRemovingFriendId(null);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const u = await signUpUser(email, password, displayName);
        onAuthSuccess(u);
      } else {
        const u = await logInUser(email, password);
        onAuthSuccess(u);
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setAuthError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOutUser();
      onAuthSuccess(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const BG_COLORS = ['#5865f2', '#3b82f6', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#e11d48', '#23272a'];
  const BANNER_COLORS = ['#1e1f22', '#2b2d42', '#1e3a8a', '#312e81', '#14532d', '#701a75', '#7c2d12', '#0f172a'];
  
  const TARGET_PRESETS = [
    'CAT 2025 (99.5+%ile • IIM-A Focus)',
    'CAT 2025 (99.0+%ile • Top IIMs)',
    'CAT 2026 (Foundation & Core)',
    'XAT 2025 (XLRI Jamshedpur Focus)',
    'SNAP & NMAT Top Percentile',
    'Custom Target Goal'
  ];

  // Calculate live stats from tracker and mocks
  let liveSolvedQs = 0;
  let liveStreak = 0;
  let liveMocksCount = 0;

  if (tracker) {
    const allDays = [];
    for (const [_month, weeks] of Object.entries(tracker)) {
      weeks.forEach(week => {
        week.days?.forEach(day => {
          liveSolvedQs += (Number(day.quantCount) || 0) + (Number(day.lrdiCount) || 0) + (Number(day.varcCount) || 0);
          const isDone = day.quantCompleted || day.lrdiCompleted || day.varcCompleted;
          allDays.push(isDone);
        });
      });
    }
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i]) liveStreak++;
      else if (liveStreak > 0) break;
    }
  }

  if (mocks) {
    liveMocksCount = mocks.filter(m => m.status === 'Taken').length;
  }

  const previewProfile = {
    displayName: profName || user?.displayName || 'Your Display Name',
    username: profUsername || 'handle',
    aspirantId: currentAspirantId,
    avatar: profAvatar,
    avatarBg: profAvatarBg,
    bannerBg: profBannerBg,
    bio: profBio,
    target: profTarget,
    location: profLocation,
    streak: userProfile?.streak !== undefined ? userProfile.streak : liveStreak,
    solvedQs: userProfile?.solvedQs !== undefined ? userProfile.solvedQs : liveSolvedQs,
    mocksCount: userProfile?.mocksCount !== undefined ? userProfile.mocksCount : liveMocksCount,
    status: 'online',
    email: user?.email || 'aspirant@catprep.com'
  };

  const pendingRequestsCount = incomingRequests.length;

  return (
    <div className="profile-view-container">
      {/* View Header */}
      <div className="header-row">
        <div>
          <h1 className="page-title">Profile & Buddy Network</h1>
          <p className="page-subtitle">
            Manage your aspirant identity, customize your profile, connect with study buddies, and review invitations.
          </p>
        </div>
      </div>

      {/* Mobile-Only Quick Navigation Hub */}
      {setActiveTab && (
        <div className="profile-mobile-quick-nav">
          <button 
            type="button" 
            className="btn-secondary mobile-nav-tile highlight-achievement-tile" 
            onClick={() => setActiveTab('achievements')}
          >
            <Icons.Award size={18} />
            <div>
              <div className="mobile-nav-tile-title">Achievements</div>
              <div className="mobile-nav-tile-sub">Prestige badges & perks</div>
            </div>
          </button>

          <button 
            type="button" 
            className="btn-secondary mobile-nav-tile" 
            onClick={() => setActiveTab('lounge')}
          >
            <Icons.Chat size={18} />
            <div>
              <div className="mobile-nav-tile-title">Study Lounge</div>
              <div className="mobile-nav-tile-sub">Live peers & chat</div>
            </div>
          </button>

          <button 
            type="button" 
            className="btn-secondary mobile-nav-tile" 
            onClick={() => setActiveTab('timeline')}
          >
            <Icons.BookOpen size={18} />
            <div>
              <div className="mobile-nav-tile-title">6-Month Plan</div>
              <div className="mobile-nav-tile-sub">Syllabus breakdown</div>
            </div>
          </button>

          <button 
            type="button" 
            className="btn-secondary mobile-nav-tile" 
            onClick={() => setActiveTab('errors')}
          >
            <Icons.Target size={18} />
            <div>
              <div className="mobile-nav-tile-title">Error Log</div>
              <div className="mobile-nav-tile-sub">Formulas & traps</div>
            </div>
          </button>

          <button 
            type="button" 
            className="btn-secondary mobile-nav-tile" 
            onClick={() => setActiveTab('settings')}
          >
            <Icons.Settings size={18} />
            <div>
              <div className="mobile-nav-tile-title">Settings</div>
              <div className="mobile-nav-tile-sub">Theme, cloud & data</div>
            </div>
          </button>
        </div>
      )}

      {/* ========================================================
          TWO MAIN SUB-TABS: PROFILE vs. ADD FRIENDS
         ======================================================== */}
      <div className="profile-subtabs-nav-bar">
        <button
          type="button"
          className={`profile-subtab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('profile')}
        >
          <Icons.User size={16} />
          <span>My Profile</span>
        </button>

        <button
          type="button"
          className={`profile-subtab-btn ${activeSubTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('friends')}
        >
          <Icons.Users size={16} />
          <span>Add Friends & Buddies</span>
          {pendingRequestsCount > 0 && (
            <span className="subtab-notification-badge" title={`${pendingRequestsCount} Pending Friend Requests`}>
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Global Alerts / Status */}
      {friendSuccess && (
        <div className="auth-success-msg" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.CheckCircle size={15} />
          <span>{friendSuccess}</span>
        </div>
      )}
      {friendError && (
        <div className="auth-error-msg" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Close size={15} />
          <span>{friendError}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: VIEW PROFILE & EDIT HOVER CARD
         ======================================================== */}
      {activeSubTab === 'profile' && (
        <div className="profile-page-container fade-in">
          {/* Floating User Assurance Toast */}
          {floatingToastMsg && (
            <div className="profile-global-floating-toast animate-slide-up">
              <div className="toast-success-icon"><Icons.Check size={14} /></div>
              <span>{floatingToastMsg}</span>
            </div>
          )}

          {/* Primary Identity Profile Card */}
          <div className="profile-identity-direct-wrap">
            <AspirantProfileCard 
              profile={previewProfile}
              tracker={tracker}
              isSelf={true}
              onEditProfile={() => setIsEditModalOpen(true)}
              onViewAchievements={() => setActiveTab('achievements')}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ADD FRIENDS, NOTIFICATION PANEL & BUDDY NETWORK
         ======================================================== */}
      {activeSubTab === 'friends' && (
        <div className="friends-tab-content fade-in">
          
          {/* Top Row: 2-Column Grid (My Unique ID + Connect Peer Search) */}
          <div className="friends-top-hero-grid">
            
            {/* 1. Unique Aspirant ID Showcase Card */}
            <div className="aspirant-id-hero-card">
              <div className="id-card-header">
                <div className="id-card-icon-badge">
                  <Icons.Hash size={18} />
                </div>
                <div>
                  <span className="id-card-super-title">Your Unique Aspirant ID</span>
                  <p className="id-card-sub-desc">
                    Share this ID so peers can connect instantly without email.
                  </p>
                </div>
              </div>

              <div className="id-card-action-box">
                <span className="id-card-code-text">{currentAspirantId}</span>
                <button
                  type="button"
                  onClick={handleCopyMyId}
                  className="id-card-copy-btn"
                  title="Click to copy your unique ID"
                >
                  {copiedMyId ? (
                    <>
                      <Icons.Check size={14} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Icons.Copy size={14} />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. ADD NEW FRIEND FORM (By Unique ID or Email) */}
            <div className="send-invite-hero-card">
              <div className="invite-card-header">
                <div className="invite-card-icon-badge">
                  <Icons.UserPlus size={18} />
                </div>
                <div>
                  <span className="id-card-super-title">Connect with a Study Buddy</span>
                  <p className="id-card-sub-desc">
                    Enter your peer's Unique ID (e.g. <code>ASP-749201</code>) or email.
                  </p>
                </div>
              </div>

              <form className="send-invite-form" onSubmit={handleSendFriendRequest}>
                <div className="invite-input-container">
                  <Icons.Search size={15} className="invite-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter Unique ID (e.g. ASP-849201) or email" 
                    value={friendSearchInput}
                    onChange={(e) => setFriendSearchInput(e.target.value)}
                    disabled={!user || friendActionLoading}
                    className="invite-text-input"
                  />
                  <button 
                    type="submit" 
                    className="invite-submit-btn"
                    disabled={!user || friendActionLoading || !friendSearchInput.trim()}
                  >
                    {friendActionLoading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Icons.UserPlus size={14} />
                        <span>Send Invite</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              {!user && (
                <div className="invite-guest-warning">
                  <Icons.Shield size={12} /> Sign in to send friend invitations.
                </div>
              )}
            </div>

          </div>

          {/* 3. INCOMING FRIEND REQUESTS (Rendered prominently only if requests exist, or sleek minimal bar) */}
          {pendingRequestsCount > 0 ? (
            <div className="friend-requests-panel-card animate-slide-up">
              <div className="panel-header-with-badge">
                <div className="panel-header-title-wrap">
                  <div className="notification-bell-icon-wrap has-notifications">
                    <Icons.Bell size={16} />
                  </div>
                  <div>
                    <h3 className="panel-main-title">Pending Invitations ({pendingRequestsCount})</h3>
                    <p className="panel-sub-desc">Aspirants wishing to connect as study peers.</p>
                  </div>
                </div>
                <span className="pending-badge-pill">{pendingRequestsCount} Action Required</span>
              </div>

              <div className="incoming-requests-list">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="incoming-request-card">
                    <div className="request-user-info">
                      <AvatarRenderer 
                        avatar={req.fromAvatar || 'rocket'}
                        name={req.fromName}
                        avatarBg={req.fromAvatarBg || '#5865f2'}
                        size={42}
                        status="online"
                      />
                      <div className="request-user-meta">
                        <div className="request-name-row">
                          <span className="request-sender-name">{req.fromName}</span>
                          {req.fromAspirantId && (
                            <span className="request-aspirant-id-badge">
                              <Icons.Hash size={10} /> {req.fromAspirantId}
                            </span>
                          )}
                        </div>
                        <div className="request-target-text">
                          <Icons.Target size={11} /> {req.fromTarget || 'CAT Aspirant'}
                        </div>
                      </div>
                    </div>

                    {/* Accept & Decline Actions */}
                    <div className="request-actions-row">
                      <button
                        type="button"
                        className="request-btn accept-btn"
                        disabled={processingRequestId === req.id}
                        onClick={() => handleRespondRequest(req, 'accept')}
                        title="Accept friend request"
                      >
                        <Icons.Check size={14} />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        className="request-btn decline-btn"
                        disabled={processingRequestId === req.id}
                        onClick={() => handleRespondRequest(req, 'decline')}
                        title="Decline friend request"
                      >
                        <Icons.Close size={14} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* 4. MY STUDY BUDDIES & CONNECTED PEERS */}
          <div className="study-buddies-section-card">
            <div className="buddies-header-row">
              <div className="buddies-header-left">
                <div className="buddies-icon-wrap">
                  <Icons.Users size={18} />
                </div>
                <div>
                  <h3 className="panel-main-title">
                    My Study Buddies ({friends.length})
                  </h3>
                  <p className="panel-sub-desc">
                    Real-time status, streak momentum, and study activity.
                  </p>
                </div>
              </div>

              {friends.length > 0 && (
                <div className="buddies-online-pill">
                  <span className="live-dot" />
                  <span>{friends.filter(f => f.status === 'studying' || f.status === 'online').length} Active</span>
                </div>
              )}
            </div>

            {friends.length === 0 ? (
              <div className="empty-friends-clean-state">
                <div className="empty-friends-icon-box">
                  <Icons.Users size={28} />
                </div>
                <h4 className="empty-title">No Study Buddies Added Yet</h4>
                <p className="empty-desc">
                  Share your Unique ID <strong>{currentAspirantId}</strong> with peers or use the search above to start tracking progress together.
                </p>
              </div>
            ) : (
              <div className="buddies-modern-grid">
                {friends.map((friend) => (
                  <div key={friend.id || friend.uid} className="buddy-modern-card">
                    <div className="buddy-modern-top">
                      <div className="buddy-avatar-col">
                        <AvatarRenderer 
                          avatar={friend.avatar || 'rocket'}
                          name={friend.displayName || friend.name}
                          avatarBg={friend.avatarBg || '#5865f2'}
                          size={46}
                          status={friend.status || 'offline'}
                        />
                      </div>
                      <div className="buddy-info-col">
                        <div className="buddy-name-line">
                          <span className="buddy-display-name">{friend.displayName || friend.name}</span>
                          {friend.aspirantId && (
                            <span className="buddy-aspirant-tag">
                              <Icons.Hash size={9} /> {friend.aspirantId}
                            </span>
                          )}
                        </div>
                        <div className="buddy-target-line">{friend.target || 'CAT Aspirant'}</div>
                        <div className="buddy-live-status">
                          <span className={`status-dot ${friend.status || 'offline'}`} />
                          <span className="status-text">
                            {friend.status === 'studying' ? 'Focusing Now' : friend.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="buddy-stats-strip">
                      <div className="buddy-stat-badge">
                        <Icons.Flame size={12} color="#f97316" />
                        <span>{friend.streak || 0}d streak</span>
                      </div>
                      <div className="buddy-stat-badge">
                        <Icons.Target size={12} color="#38bdf8" />
                        <span>{friend.solvedQs || 0} Qs</span>
                      </div>
                    </div>

                    <div className="buddy-modern-actions">
                      {onMessagePeer && (
                        <button
                          type="button"
                          className="buddy-inspect-action-btn message-accent"
                          onClick={() => onMessagePeer(friend)}
                          title={`Direct message with ${friend.displayName || friend.name}`}
                          style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                        >
                          <Icons.MessageSquare size={13} />
                          <span>Message</span>
                        </button>
                      )}
                      {onInspectFriend && (
                        <button
                          type="button"
                          className="buddy-inspect-action-btn"
                          onClick={() => onInspectFriend(friend)}
                        >
                          <Icons.Target size={13} />
                          <span>Inspect Tracker</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="buddy-remove-action-btn"
                        onClick={() => handleRemoveFriend(friend)}
                        disabled={removingFriendId === (friend.id || friend.uid)}
                        title="Remove buddy"
                      >
                        <Icons.UserX size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT PROFILE HOVER CARD / POP-UP MODAL
         ======================================================== */}
      {isEditModalOpen && (
        <div className="modal-backdrop fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div 
            className="modal-card edit-profile-popup-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="edit-modal-header">
              <div className="edit-modal-header-left">
                <div className="edit-modal-icon-wrap">
                  <Icons.Edit3 size={18} />
                </div>
                <div>
                  <h3 className="edit-modal-title">Edit Aspirant Profile</h3>
                  <p className="edit-modal-subtitle">
                    Customize your profile avatar, banner, handle, and preparation targets.
                  </p>
                </div>
              </div>

              <button 
                type="button"
                className="modal-close-btn" 
                onClick={() => setIsEditModalOpen(false)}
                title="Close"
              >
                <Icons.Close size={18} />
              </button>
            </div>

            {/* Live Profile Header Preview Card */}
            <div className="edit-modal-live-preview">
              <div 
                className="edit-preview-banner" 
                style={{ 
                  backgroundColor: profBannerBg || '#1e1f22',
                  backgroundImage: profBannerUrl ? `url(${profBannerUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <span className="edit-preview-tag">LIVE PREVIEW</span>
              </div>
              <div className="edit-preview-body">
                <div className="edit-preview-avatar-wrap">
                  <AvatarRenderer 
                    avatar={profAvatar} 
                    name={profName} 
                    avatarBg={profAvatarBg} 
                    size={48} 
                  />
                </div>
                <div className="edit-preview-meta">
                  <span className="edit-preview-name">{profName || 'Your Name'}</span>
                  <span className="edit-preview-target">{profTarget || 'CAT 2025 Aspirant'}</span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="edit-modal-tabs-bar">
              <button
                type="button"
                className={`edit-tab-btn ${editModalTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setEditModalTab('appearance')}
              >
                <Icons.Sparkles size={13} />
                <span>Appearance & Banner</span>
              </button>
              <button
                type="button"
                className={`edit-tab-btn ${editModalTab === 'identity' ? 'active' : ''}`}
                onClick={() => setEditModalTab('identity')}
              >
                <Icons.User size={13} />
                <span>Identity & Handle</span>
              </button>
              <button
                type="button"
                className={`edit-tab-btn ${editModalTab === 'goals' ? 'active' : ''}`}
                onClick={() => setEditModalTab('goals')}
              >
                <Icons.Target size={13} />
                <span>Target & Bio</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="edit-modal-body">
              {profileSuccessMsg && (
                <div className="edit-modal-success-banner animate-slide-up">
                  <Icons.Check size={16} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}
              
              {/* TAB 1: APPEARANCE & BANNER */}
              {editModalTab === 'appearance' && (
                <div className="edit-tab-pane animate-fade-in">
                  
                  {/* Profile Avatar Block */}
                  <div className="edit-uniform-block">
                    <div className="edit-block-title-row">
                      <Icons.User size={14} className="edit-block-icon" />
                      <span>Profile Avatar</span>
                    </div>

                    <div className="edit-upload-action-row">
                      <input 
                        type="file" 
                        ref={imageUploadInputRef} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleImageFileChange}
                      />
                      <button
                        type="button"
                        className="edit-uniform-upload-btn"
                        onClick={() => imageUploadInputRef.current?.click()}
                      >
                        <Icons.Upload size={14} />
                        <span>Upload Photo</span>
                      </button>

                      <button
                        type="button"
                        className={`edit-default-toggle-btn ${profAvatar === 'default' || !profAvatar.startsWith('data:') ? 'active' : ''}`}
                        onClick={() => {
                          setProfAvatar('default');
                          showAssuranceToast("Reset to default CATalyze icon!");
                        }}
                      >
                        <Icons.Sparkles size={13} />
                        <span>Default Icon</span>
                      </button>
                    </div>

                    <div className="edit-sub-label" style={{ marginTop: '12px' }}>
                      Default Icon & Glow Color:
                    </div>
                    <div className="edit-color-swatches-row">
                      {BG_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`edit-color-swatch-circle ${profAvatarBg === color ? 'active' : ''}`}
                          onClick={() => {
                            setProfAvatarBg(color);
                            showAssuranceToast("Avatar color updated!");
                          }}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Header Banner Block */}
                  <div className="edit-uniform-block" style={{ marginTop: '14px' }}>
                    <div className="edit-block-title-row">
                      <Icons.Image size={14} className="edit-block-icon" />
                      <span>Header Banner (Photos & Animated GIFs)</span>
                    </div>

                    <div className="edit-upload-action-row">
                      <input 
                        type="file" 
                        ref={bannerUploadInputRef} 
                        accept="image/*,.gif" 
                        style={{ display: 'none' }} 
                        onChange={handleBannerFileChange}
                      />
                      <button
                        type="button"
                        className="edit-uniform-upload-btn"
                        onClick={() => bannerUploadInputRef.current?.click()}
                      >
                        <Icons.Upload size={14} />
                        <span>Upload Photo or Animated GIF</span>
                      </button>
                      <span className="edit-upload-hint">GIF, PNG, JPG supported</span>
                    </div>

                    <div className="edit-sub-label" style={{ marginTop: '12px' }}>
                      Or Select Theme Banner Palette:
                    </div>
                    <div className="edit-color-swatches-row">
                      {BANNER_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`edit-banner-swatch-rect ${profBannerBg === color ? 'active' : ''}`}
                          onClick={() => {
                            setProfBannerBg(color);
                            setProfBannerUrl('');
                            showAssuranceToast("Banner color updated!");
                          }}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: IDENTITY & HANDLE */}
              {editModalTab === 'identity' && (
                <div className="edit-tab-pane animate-fade-in">
                  <div className="edit-uniform-block">
                    <div className="edit-grid-2col">
                      <div className="edit-form-field">
                        <label className="edit-field-label">Display Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sunny Pathak"
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="edit-uniform-input"
                          required
                        />
                      </div>

                      <div className="edit-form-field">
                        <label className="edit-field-label">Username / Handle</label>
                        <input
                          type="text"
                          placeholder="e.g. sunnypathak"
                          value={profUsername}
                          onChange={(e) => setProfUsername(e.target.value)}
                          className="edit-uniform-input"
                        />
                      </div>
                    </div>

                    <div className="edit-form-field" style={{ marginTop: '14px' }}>
                      <label className="edit-field-label">Location / City (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru, Karnataka"
                        value={profLocation}
                        onChange={(e) => setProfLocation(e.target.value)}
                        className="edit-uniform-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TARGET & BIO */}
              {editModalTab === 'goals' && (
                <div className="edit-tab-pane animate-fade-in">
                  <div className="edit-uniform-block">
                    <div className="edit-form-field">
                      <label className="edit-field-label">Target Examination & Focus Goal</label>
                      <select
                        value={profTarget}
                        onChange={(e) => setProfTarget(e.target.value)}
                        className="edit-uniform-select"
                      >
                        {TARGET_PRESETS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {profTarget === 'Custom Target Goal' && (
                        <input
                          type="text"
                          placeholder="Type custom target (e.g. CAT 2026 Core • IIM-A Focus)"
                          onChange={(e) => setProfTarget(e.target.value)}
                          className="edit-uniform-input"
                          style={{ marginTop: '8px' }}
                        />
                      )}
                    </div>

                    <div className="edit-form-field" style={{ marginTop: '14px' }}>
                      <label className="edit-field-label">Aspirant Bio & Strategy Notes</label>
                      <textarea
                        rows={4}
                        placeholder="e.g. Focusing on daily Quant drills, LRDI speed practice, and regular mock analysis."
                        value={profBio}
                        onChange={(e) => setProfBio(e.target.value)}
                        className="edit-uniform-textarea"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="edit-modal-footer">
                <button
                  type="button"
                  className="edit-modal-cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-modal-save-btn"
                  disabled={profileSaving}
                >
                  {profileSaving ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
