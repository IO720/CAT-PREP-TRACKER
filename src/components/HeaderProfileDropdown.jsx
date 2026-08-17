import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './AspirantIcons';
import AvatarRenderer from './AvatarRenderer';

export default function HeaderProfileDropdown({
  user,
  userProfile,
  onInspectSelf,
  onNavigate,
  onSignOut,
  onSignIn,
  timerState
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isStudying = Boolean(timerState?.isRunning);
  const displayName = userProfile?.displayName || user?.displayName || (user ? 'Aspirant' : 'Guest Aspirant');
  const userEmail = user?.email || 'Offline Guest Mode';
  const userAvatar = userProfile?.avatar || user?.photoURL;
  const userAvatarBg = userProfile?.avatarBg || '#3b82f6';

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (callback) => {
    setIsOpen(false);
    if (callback) callback();
  };

  return (
    <div className="header-profile-dropdown-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`header-profile-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Account & Profile Menu"
        aria-expanded={isOpen}
      >
        <div className="trigger-avatar-wrap">
          <AvatarRenderer
            avatar={userAvatar}
            name={displayName}
            avatarBg={userAvatarBg}
            size={26}
            status={isStudying ? 'studying' : user ? 'online' : 'offline'}
          />
        </div>
        <span className="trigger-user-name desktop-inline">{displayName.split(' ')[0]}</span>
        <Icons.ChevronDown size={13} className={`trigger-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {/* Glassmorphic Dropdown Panel */}
      {isOpen && (
        <div className="header-profile-dropdown-menu animate-slide-up">
          {/* Header User Preview Card */}
          <div className="menu-profile-preview-card">
            <div className="preview-top-row">
              <AvatarRenderer
                avatar={userAvatar}
                name={displayName}
                avatarBg={userAvatarBg}
                size={40}
                status={isStudying ? 'studying' : user ? 'online' : 'offline'}
              />
              <div className="preview-user-details">
                <div className="preview-name-row">
                  <span className="preview-name">{displayName}</span>
                  {user ? (
                    <span className="preview-verified-badge" title="Cloud Verified">
                      <Icons.Sparkles size={11} />
                    </span>
                  ) : (
                    <span className="preview-guest-tag">GUEST</span>
                  )}
                </div>
                <span className="preview-email">{userEmail}</span>
              </div>
            </div>

            {/* View Full Profile Card Action */}
            <button
              type="button"
              className="preview-view-card-btn"
              onClick={() => handleAction(onInspectSelf)}
            >
              <Icons.User size={13} />
              <span>View Profile Card</span>
              <Icons.ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.7 }} />
            </button>
          </div>

          <div className="menu-divider" />

          {/* Quick Nav Links */}
          <div className="menu-nav-group">
            <button
              type="button"
              className="menu-nav-item"
              onClick={() => handleAction(() => onNavigate('achievements'))}
            >
              <div className="menu-item-icon-box award">
                <Icons.Award size={15} />
              </div>
              <div className="menu-item-text">
                <span className="item-title">Achievements & Badges</span>
                <span className="item-sub">View unlocked milestones</span>
              </div>
            </button>

            <button
              type="button"
              className="menu-nav-item"
              onClick={() => handleAction(() => onNavigate('profile'))}
            >
              <div className="menu-item-icon-box profile">
                <Icons.User size={15} />
              </div>
              <div className="menu-item-text">
                <span className="item-title">Study Profile & Circle</span>
                <span className="item-sub">Edit bio, banner & buddies</span>
              </div>
            </button>

            <button
              type="button"
              className="menu-nav-item"
              onClick={() => handleAction(() => onNavigate('settings'))}
            >
              <div className="menu-item-icon-box settings">
                <Icons.Settings size={15} />
              </div>
              <div className="menu-item-text">
                <span className="item-title">App Settings & Data</span>
                <span className="item-sub">Cloud sync & preferences</span>
              </div>
            </button>
          </div>

          <div className="menu-divider" />

          {/* Auth Footer Action */}
          <div className="menu-auth-footer">
            {user ? (
              <button
                type="button"
                className="menu-signout-btn"
                onClick={() => handleAction(onSignOut)}
              >
                <Icons.LogOut size={14} />
                <span>Sign Out of CATalyze</span>
              </button>
            ) : (
              <button
                type="button"
                className="menu-signin-btn"
                onClick={() => handleAction(onSignIn)}
              >
                <Icons.LogIn size={14} />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
