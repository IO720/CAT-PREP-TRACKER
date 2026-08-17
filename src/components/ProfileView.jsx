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
  startDate = "",
  onUpdateStartDate,
  onExport,
  onImport,
  onReset,
  fileInputRef,
  setActiveTab,
  isEditOpen = false,
  onResetEditOpen = null
}) {
  // Sub-tabs: 'profile' (View Profile & Edit) | 'friends' (Add Friends & Buddy Network)
  const [activeSubTab, setActiveSubTab] = useState('profile');

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
  const [profBio, setProfBio] = useState(userProfile?.bio || '');
  const [profTarget, setProfTarget] = useState(userProfile?.target || 'CAT 2025 (99.5+%ile • IIM-A Focus)');
  const [profLocation, setProfLocation] = useState(userProfile?.location || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const imageUploadInputRef = useRef(null);
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const bannerUploadInputRef = useRef(null);

  // Unique Aspirant ID State
  const currentAspirantId = userProfile?.aspirantId || (user ? generateUniqueAspirantId(user.uid) : getLocalAspirantId());
  const [copiedMyId, setCopiedMyId] = useState(false);

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
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setProfAvatar(customImageUrl.trim());
    setCustomImageUrl('');
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
    const reader = new FileReader();

    if (isGif) {
      // Preserve GIF animation frames without canvas flattening
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfBannerBg(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Optimize other image formats
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_W = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_W) {
            height *= MAX_W / width;
            width = MAX_W;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setProfBannerBg(compressed);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyBannerUrl = () => {
    if (!customBannerUrl.trim()) return;
    setProfBannerBg(customBannerUrl.trim());
    setCustomBannerUrl('');
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      alert("Please sign in to save and sync your profile to cloud.");
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
      setProfileSuccessMsg("Profile card successfully updated! Live lounge presence synced.");
      setTimeout(() => {
        setProfileSuccessMsg('');
        setIsEditModalOpen(false);
      }, 1200);
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
        setFriendError("Please sign in with your Aspiranto account to send friend requests.");
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
            className="btn-secondary mobile-nav-tile" 
            onClick={() => setActiveTab('timeline')}
          >
            <Icons.BookOpen size={16} />
            <div>
              <div className="mobile-nav-tile-title">6-Month Plan</div>
              <div className="mobile-nav-tile-sub">View syllabus phases</div>
            </div>
          </button>

          <button 
            type="button" 
            className="btn-secondary mobile-nav-tile" 
            onClick={() => setActiveTab('errors')}
          >
            <Icons.Target size={16} />
            <div>
              <div className="mobile-nav-tile-title">Error Log</div>
              <div className="mobile-nav-tile-sub">Review formulas & mistakes</div>
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
        <div className="profile-tab-content fade-in">
          {/* Primary Identity Profile Card */}
          <div className="profile-identity-direct-wrap">
            <AspirantProfileCard 
              profile={previewProfile}
              tracker={tracker}
              isSelf={true}
              onEditProfile={() => setIsEditModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ADD FRIENDS, NOTIFICATION PANEL & BUDDY NETWORK
         ======================================================== */}
      {activeSubTab === 'friends' && (
        <div className="friends-tab-content fade-in">
          
          {/* 1. Unique Aspirant ID Showcase Card */}
          <div className="profile-card unique-id-share-card" style={{ marginBottom: '24px' }}>
            <div className="unique-id-share-content">
              <div className="unique-id-icon-circle">
                <Icons.Hash size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                  YOUR UNIQUE ASPIRANT NUMBER
                </div>
                <div className="unique-id-display-row">
                  <span className="unique-id-large-text">{currentAspirantId}</span>
                  <button
                    type="button"
                    onClick={handleCopyMyId}
                    className="copy-unique-id-btn"
                    title="Click to copy your unique ID"
                  >
                    {copiedMyId ? (
                      <>
                        <Icons.Check size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Icons.Copy size={14} />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="unique-id-desc-text">
                  Share this unique ID with fellow CAT aspirants so they can add you as a study buddy instantly <strong>without needing your Gmail address</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* 2. INCOMING FRIEND REQUESTS NOTIFICATION PANEL */}
          <div className="profile-card friend-requests-notification-panel" style={{ marginBottom: '24px' }}>
            <div className="panel-header-with-badge">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className={`notification-bell-icon-wrap ${pendingRequestsCount > 0 ? 'has-notifications' : ''}`}>
                  <Icons.Bell size={18} />
                </div>
                <div>
                  <h3 className="profile-section-title" style={{ margin: 0 }}>
                    Friend Requests & Invitations
                  </h3>
                  <p className="profile-section-subtitle" style={{ margin: '2px 0 0 0' }}>
                    Aspirants who are willing to add you as a study peer.
                  </p>
                </div>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="pending-badge-pill">
                  {pendingRequestsCount} Pending
                </span>
              )}
            </div>

            {pendingRequestsCount === 0 ? (
              <div className="empty-requests-state">
                <Icons.Inbox size={28} />
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>No Pending Friend Requests</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  When someone adds your Unique ID or Email, their invitation will appear here with accept and decline options.
                </p>
              </div>
            ) : (
              <div className="incoming-requests-list">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="incoming-request-card">
                    <div className="request-user-info">
                      <AvatarRenderer 
                        avatar={req.fromAvatar || 'rocket'}
                        name={req.fromName}
                        avatarBg={req.fromAvatarBg || '#5865f2'}
                        size={46}
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
                          <Icons.Target size={11} /> {req.fromTarget || 'CAT 2025 Focus'}
                        </div>
                        <div className="request-subtext">
                          Willing to connect as study buddies
                        </div>
                      </div>
                    </div>

                    {/* Accept & Decline Buttons */}
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
            )}
          </div>

          {/* 3. ADD NEW FRIEND FORM (By Unique ID or Email) */}
          <div className="profile-card" style={{ marginBottom: '24px' }}>
            <h3 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.UserPlus size={18} />
              <span>Add Friend by Unique ID or Email</span>
            </h3>
            <p className="profile-section-subtitle">
              Enter your peer's Unique Aspirant ID (e.g. <code>ASP-749201</code>) or their registered email to send an invitation.
            </p>

            <form className="add-friend-unique-form" onSubmit={handleSendFriendRequest}>
              <div className="input-with-icon-wrapper">
                <span className="input-leading-icon">
                  <Icons.Search size={16} />
                </span>
                <input 
                  type="text" 
                  placeholder="Enter Unique ID (e.g. ASP-849201) or email" 
                  value={friendSearchInput}
                  onChange={(e) => setFriendSearchInput(e.target.value)}
                  disabled={!user || friendActionLoading}
                  className="friend-search-input"
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary send-request-btn"
                disabled={!user || friendActionLoading || !friendSearchInput.trim()}
              >
                {friendActionLoading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Icons.UserPlus size={15} />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </form>
            {!user && (
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Shield size={13} /> Please sign in to your Aspiranto account to send friend requests.
              </div>
            )}
          </div>

          {/* 4. MY STUDY BUDDIES & CONNECTED PEERS */}
          <div className="profile-card">
            <div className="profile-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.Users size={18} />
                  <span>My Study Buddies ({friends.length})</span>
                </h3>
                <p className="profile-section-subtitle">
                  Track their daily questions solved, streak momentum, and study together in real-time.
                </p>
              </div>
            </div>

            {friends.length === 0 ? (
              <div className="empty-friends-state">
                <Icons.Users size={32} />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>No Study Buddies Connected Yet</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '360px', margin: '6px auto 0 auto' }}>
                  Share your Unique ID <strong>{currentAspirantId}</strong> or add friends above to start studying together!
                </p>
              </div>
            ) : (
              <div className="buddies-grid">
                {friends.map((friend) => (
                  <div key={friend.id || friend.uid} className="buddy-card">
                    <div className="buddy-card-top">
                      <AvatarRenderer 
                        avatar={friend.avatar || 'rocket'}
                        name={friend.displayName || friend.name}
                        avatarBg={friend.avatarBg || '#5865f2'}
                        size={48}
                        status={friend.status || 'online'}
                      />
                      <div className="buddy-meta">
                        <div className="buddy-name-row">
                          <span className="buddy-name">{friend.displayName || friend.name}</span>
                          {friend.aspirantId && (
                            <span className="buddy-id-badge">
                              <Icons.Hash size={10} /> {friend.aspirantId}
                            </span>
                          )}
                        </div>
                        <div className="buddy-target">{friend.target || 'CAT Aspirant'}</div>
                        <div className="buddy-status-indicator">
                          <span className={`status-dot ${friend.status || 'online'}`} />
                          <span className="status-label">{friend.status === 'studying' ? 'Focusing now' : friend.status === 'online' ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="buddy-stats-row">
                      <div className="buddy-stat-pill">
                        <Icons.Flame size={12} color="#f97316" />
                        <span>{friend.streak || 0}d streak</span>
                      </div>
                      <div className="buddy-stat-pill">
                        <Icons.Target size={12} color="#3b82f6" />
                        <span>{friend.solvedQs || 0} Qs</span>
                      </div>
                    </div>

                    <div className="buddy-actions-row">
                      {onInspectFriend && (
                        <button
                          type="button"
                          className="btn-secondary buddy-inspect-btn"
                          onClick={() => onInspectFriend(friend)}
                        >
                          <Icons.Target size={13} />
                          <span>Inspect Tracker</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="buddy-remove-btn"
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
            className="modal-card edit-profile-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="edit-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="edit-modal-icon-wrap">
                  <Icons.Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Edit Aspirant Profile</h3>
                  <p style={{ fontSize: '12px', color: '#949ba4', margin: '2px 0 0 0' }}>
                    Personalize your profile avatar, header banner, target exam, and bio.
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

            {/* Modal Body / Form Organized in 4 Distinct Section Cards */}
            <form onSubmit={handleSaveProfile} className="edit-modal-body">
              
              {/* Section 1: Avatar & Banner Theme */}
              <div className="edit-profile-section-card">
                <div className="edit-section-card-title">
                  <Icons.Sparkles size={14} color="#38bdf8" />
                  <span>1. Avatar & Banner Customization</span>
                </div>

                <div className="modal-form-section">
                  <label className="modal-section-label">Profile Avatar</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <input 
                      type="file" 
                      ref={imageUploadInputRef} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleImageFileChange}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '8px 14px' }}
                      onClick={() => imageUploadInputRef.current?.click()}
                    >
                      <Icons.Upload size={14} />
                      <span>Upload Photo</span>
                    </button>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>PNG, JPG, WebP supported</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input 
                      type="text" 
                      placeholder="Or paste image URL (https://...)" 
                      value={customImageUrl} 
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      style={{ flex: 1, padding: '7px 12px', fontSize: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={handleApplyImageUrl}
                      style={{ fontSize: '12px', padding: '7px 12px' }}
                    >
                      Apply
                    </button>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Or Select Vector Character Badge:</div>
                  <div className="avatar-preset-picker-grid">
                    {AVATAR_PRESETS.map((preset) => {
                      const PresetIcon = preset.icon;
                      const isSelected = profAvatar === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`avatar-preset-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => setProfAvatar(preset.id)}
                          title={preset.label}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isSelected ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                            border: isSelected ? '2px solid #ffffff' : '1px solid var(--border-color)',
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <PresetIcon size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avatar Glow & Theme Color */}
                <div className="modal-form-section" style={{ marginTop: '12px' }}>
                  <label className="modal-section-label">Avatar Glow & Accent Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {BG_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setProfAvatarBg(color)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: profAvatarBg === color ? '3px solid #ffffff' : '1px solid rgba(0,0,0,0.2)',
                          boxShadow: profAvatarBg === color ? `0 0 10px ${color}` : 'none',
                          cursor: 'pointer',
                          transform: profAvatarBg === color ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Header Banner Customization (Photo, Animated GIF, or Colors) */}
                <div className="modal-form-section" style={{ marginTop: '16px' }}>
                  <label className="modal-section-label">Header Banner (Supports Animated GIFs & Photos)</label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <input 
                      type="file" 
                      ref={bannerUploadInputRef} 
                      accept="image/*,.gif" 
                      style={{ display: 'none' }} 
                      onChange={handleBannerFileChange}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '8px 14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                      onClick={() => bannerUploadInputRef.current?.click()}
                    >
                      <Icons.Upload size={14} />
                      <span>Upload Photo / Animated GIF</span>
                    </button>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>GIF, PNG, JPG, WebP (Auto-optimized)</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input 
                      type="text" 
                      placeholder="Or paste banner image/GIF URL (https://...)" 
                      value={customBannerUrl} 
                      onChange={(e) => setCustomBannerUrl(e.target.value)}
                      style={{ flex: 1, padding: '7px 12px', fontSize: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={handleApplyBannerUrl}
                      style={{ fontSize: '12px', padding: '7px 12px' }}
                    >
                      Apply
                    </button>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Or Select Theme Color:</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {BANNER_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setProfBannerBg(color)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          backgroundColor: color,
                          border: profBannerBg === color ? '3px solid #ffffff' : '1px solid rgba(0,0,0,0.4)',
                          boxShadow: profBannerBg === color ? `0 0 10px ${color}` : 'none',
                          cursor: 'pointer',
                          transform: profBannerBg === color ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Identity & Username Alias */}
              <div className="edit-profile-section-card">
                <div className="edit-section-card-title">
                  <Icons.User size={14} color="#a855f7" />
                  <span>2. Identity & Handle Alias</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="modal-section-label">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sesmxc"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label className="modal-section-label">Username / Handle</label>
                    <input
                      type="text"
                      placeholder="e.g. sesmic"
                      value={profUsername}
                      onChange={(e) => setProfUsername(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Target Exam & Location */}
              <div className="edit-profile-section-card">
                <div className="edit-section-card-title">
                  <Icons.Target size={14} color="#10b981" />
                  <span>3. Target Exam & Preparation Goal</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label className="modal-section-label">Target Exam & Focus Track</label>
                  <select
                    value={profTarget}
                    onChange={(e) => setProfTarget(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '6px' }}
                  >
                    {TARGET_PRESETS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {profTarget === 'Custom Target Goal' && (
                    <input
                      type="text"
                      placeholder="Type your custom target (e.g. CAT 2026 Core • IIM-A Focus)"
                      onChange={(e) => setProfTarget(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px' }}
                    />
                  )}
                </div>

                <div>
                  <label className="modal-section-label">Location / City (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Karnataka or New Delhi"
                    value={profLocation}
                    onChange={(e) => setProfLocation(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Section 4: About Me & Bio */}
              <div className="edit-profile-section-card">
                <div className="edit-section-card-title">
                  <Icons.BookOpen size={14} color="#f97316" />
                  <span>4. Aspirant Bio (About Me)</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Focusing on daily Quant drills, LRDI speed practice, and regular mock analysis."
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Modal Actions */}
              <div className="edit-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={profileSaving}
                  style={{ padding: '10px 20px', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {profileSaving ? (
                    <span>Syncing...</span>
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
