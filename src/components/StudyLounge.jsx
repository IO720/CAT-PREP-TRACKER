import React, { useState, useEffect, useRef } from 'react';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import { sendChatMessage, subscribeToChatMessages } from '../utils/firebase';

const QUICK_CHIPS = [
  { label: '1hr Quant Sprint', text: 'Starting a 1-hour Quant focus sprint! Who is in? #QUANT', tag: 'QUANT' },
  { label: 'Cracking RCs', text: 'Solving 4 RC sets back-to-back right now. #VARC', tag: 'VARC' },
  { label: 'LRDI Drills', text: 'Tackling Arrangements & Games puzzles. #LRDI', tag: 'LRDI' },
  { label: '5-min Break', text: 'Taking a quick 5-min coffee break! #BREAK', tag: 'BREAK' },
  { label: 'Daily Target Hit', text: 'Crushed my daily question target for today! #MILESTONE', tag: 'MILESTONE' }
];

const TAG_FILTERS = [
  { id: 'ALL', label: '#all-messages' },
  { id: 'QUANT', label: '#quant' },
  { id: 'LRDI', label: '#lrdi' },
  { id: 'VARC', label: '#varc' },
  { id: 'MILESTONE', label: '#milestones' }
];

export default function StudyLounge({
  friends = [],
  onInspectFriend,
  currentUser = null,
  userProfile = null,
  timerState = null,
  compact = false,
  fullPage = true
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'peers'
  const messagesEndRef = useRef(null);

  // Real-time tick to update countdowns for other studying peers smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages((msgs) => {
      setMessages(msgs || []);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedTagFilter]);

  // Format seconds to mm:ss for live timer
  const formatTime = (secs) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const mins = Math.floor(safeSecs / 60);
    const remainder = safeSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Helper to get dynamically ticking timer readout for a peer
  const getPeerTimerDisplay = (peer) => {
    if (!peer?.activity) return null;
    const act = peer.activity;
    if (act.updatedMs && act.secondsLeft != null && act.isRunning) {
      const elapsedSecs = Math.floor((currentTimeMs - act.updatedMs) / 1000);
      const remainingSecs = Math.max(0, act.secondsLeft - elapsedSecs);
      return `${formatTime(remainingSecs)} left`;
    }
    if (act.isPaused && act.secondsLeft != null) {
      return `${formatTime(act.secondsLeft)} (paused)`;
    }
    return act.timerRemaining || act.timerText || 'In Session';
  };

  // Build current user activity if timer is running or active
  const isUserStudying = timerState && (timerState.isRunning || timerState.isPaused);
  const userAvatar = userProfile?.avatar || (currentUser?.displayName ? currentUser.displayName[0] : 'rocket');
  const userAvatarBg = userProfile?.avatarBg || '#3b82f6';
  const userLocation = userProfile?.location || '';
  const userTarget = userProfile?.target || 'CAT 2025 Aspirant';
  const userAspirantId = userProfile?.aspirantId || '';

  const userActivity = isUserStudying ? {
    isSelf: true,
    id: currentUser?.uid || 'self',
    uid: currentUser?.uid || 'self',
    name: userProfile?.displayName || currentUser?.displayName || 'You',
    displayName: userProfile?.displayName || currentUser?.displayName || 'You',
    avatar: userAvatar,
    avatarBg: userAvatarBg,
    location: userLocation,
    target: userTarget,
    aspirantId: userAspirantId,
    streak: userProfile?.streak || 0,
    solvedQs: userProfile?.solvedQs || 0,
    status: 'studying',
    activity: {
      subject: timerState.subject || 'QUANT',
      title: `${timerState.subject || 'Quant'} Focus Session`,
      taskDetails: timerState.sessionNotes || (timerState.mode === 'stopwatch' ? 'Stopwatch Session' : `${Math.round((timerState.totalSeconds || 1500) / 60)}m Focus Session`),
      timerText: timerState.mode === 'stopwatch' 
        ? formatTime(timerState.secondsLeft) 
        : `${formatTime(timerState.secondsLeft)} left`
    }
  } : null;

  // Filter peers by search query
  const filteredPeers = friends.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.displayName && p.displayName.toLowerCase().includes(q)) ||
      (p.target && p.target.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.aspirantId && p.aspirantId.toLowerCase().includes(q)) ||
      (p.activity?.title && p.activity.title.toLowerCase().includes(q)) ||
      (p.activity?.subject && p.activity.subject.toLowerCase().includes(q))
    );
  });

  // Split into categories
  const studyingPeers = filteredPeers.filter(p => p.status === 'studying');
  const onlinePeers = filteredPeers.filter(p => p.status === 'online');
  const offlinePeers = filteredPeers.filter(p => p.status === 'offline');

  // Count summaries
  const selfStudyingCount = userActivity ? 1 : 0;
  const selfOnlineCount = (!userActivity && currentUser) ? 1 : 0;
  
  const totalStudying = selfStudyingCount + studyingPeers.length;
  const totalOnline = selfOnlineCount + onlinePeers.length;
  const totalActivePeers = totalStudying + totalOnline;

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    let tag = 'GENERAL';
    if (text.toUpperCase().includes('#QUANT')) tag = 'QUANT';
    else if (text.toUpperCase().includes('#LRDI')) tag = 'LRDI';
    else if (text.toUpperCase().includes('#VARC')) tag = 'VARC';
    else if (text.toUpperCase().includes('#MILESTONE')) tag = 'MILESTONE';
    else if (text.toUpperCase().includes('#BREAK')) tag = 'BREAK';

    await sendChatMessage(currentUser, text, tag, userProfile);
    setSending(false);
  };

  const handleQuickChipClick = async (chip) => {
    if (sending) return;
    setSending(true);
    await sendChatMessage(currentUser, chip.text, chip.tag, userProfile);
    setSending(false);
  };

  const filteredMessages = selectedTagFilter === 'ALL'
    ? messages
    : messages.filter(m => m.tag === selectedTagFilter);

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`discord-lounge-full-layout ${fullPage ? 'full-page-lounge' : ''}`}>
      
      {/* Mobile View Toggle Switch */}
      <div className="lounge-mobile-tab-switch">
        <button 
          type="button" 
          className={`lounge-mobile-tab-btn ${mobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setMobileTab('chat')}
        >
          <Icons.Chat size={15} />
          <span>Chat Stream</span>
        </button>
        <button 
          type="button" 
          className={`lounge-mobile-tab-btn ${mobileTab === 'peers' ? 'active' : ''}`}
          onClick={() => setMobileTab('peers')}
        >
          <Icons.Users size={15} />
          <span>Active Peers ({totalStudying} Studying)</span>
          {totalStudying > 0 && <span className="live-studying-pulse-dot"></span>}
        </button>
      </div>

      {/* ========================================================
          LEFT / CENTER: CHAT CHANNEL
         ======================================================== */}
      <div className={`discord-chat-main-area ${mobileTab === 'chat' ? 'mobile-active' : 'mobile-inactive'}`}>
        {/* Channel Top Header */}
        <div className="discord-channel-top-bar">
          <div className="discord-channel-info">
            <span className="discord-hash-tag">#</span>
            <div>
              <h2 className="discord-channel-name">aspirants-study-hall</h2>
              <p className="discord-channel-desc">Real-time study discussions, doubts, sprints & daily prep accountability.</p>
            </div>
          </div>

          <div className="discord-channel-meta-pill">
            <span className="live-pulse-dot"></span>
            <span>{totalStudying} Studying Now • {totalActivePeers} Online</span>
          </div>
        </div>

        {/* Category Tag Filters */}
        <div className="discord-tag-filters-bar">
          {TAG_FILTERS.map(filter => (
            <button
              key={filter.id}
              type="button"
              className={`discord-tag-filter-btn ${selectedTagFilter === filter.id ? 'active' : ''}`}
              onClick={() => setSelectedTagFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Real-time Message Stream */}
        <div className="discord-messages-scroll-box">
          {filteredMessages.length === 0 ? (
            <div className="discord-chat-empty">
              <div className="discord-empty-icon-wrap">
                <Icons.MessageSquare size={36} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: '8px 0 4px 0' }}>
                Welcome to #aspirants-study-hall!
              </h4>
              <p style={{ fontSize: '13px', color: '#949ba4', margin: 0, maxWidth: '400px', lineHeight: 1.4 }}>
                This is the start of the study lounge channel. Share a question doubt, start a sprint, or chat with study buddies!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelf = currentUser && (msg.userId === currentUser.uid);
                const handleMessageSenderClick = () => {
                  if (!onInspectFriend) return;
                  if (isSelf) {
                    onInspectFriend({ isSelf: true, ...userProfile, id: currentUser?.uid, uid: currentUser?.uid });
                  } else {
                    onInspectFriend({
                      id: msg.userId,
                      uid: msg.userId,
                      displayName: msg.senderName,
                      name: msg.senderName,
                      avatar: msg.avatar,
                      avatarBg: msg.avatarBg,
                      location: msg.location,
                      aspirantId: msg.aspirantId || ''
                    });
                  }
                };

                return (
                  <div key={msg.id} className={`discord-message-row ${isSelf ? 'is-self' : ''}`}>
                    <div 
                      className="discord-msg-avatar clickable" 
                      onClick={handleMessageSenderClick}
                      title="Click to view aspirant profile"
                      style={{ cursor: 'pointer' }}
                    >
                      <AvatarRenderer 
                        avatar={msg.avatar}
                        name={msg.senderName}
                        avatarBg={msg.avatarBg}
                        size={40}
                      />
                    </div>

                    <div className="discord-msg-content">
                      <div className="discord-msg-header">
                        <span 
                          className="discord-msg-sender clickable" 
                          onClick={handleMessageSenderClick}
                          title="Click to view aspirant profile"
                          style={{ cursor: 'pointer' }}
                        >
                          {msg.senderName}
                        </span>
                        {isSelf && <span className="discord-msg-self-badge">YOU</span>}
                        {msg.location && (
                          <span className="discord-msg-location">
                            <Icons.MapPin size={10} /> {msg.location}
                          </span>
                        )}
                        <span className="discord-msg-time">{formatMessageTime(msg.timestamp)}</span>
                      </div>

                    <div className="discord-msg-body">{msg.text}</div>

                    {msg.tag && msg.tag !== 'GENERAL' && (
                      <div className="discord-msg-tags">
                        <span className={`discord-tag-pill tag-${msg.tag.toLowerCase()}`}>
                          #{msg.tag}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick 1-Tap Action Sprint Chips (Desktop Only) */}
        <div className="discord-quick-chips-bar desktop-only-chips">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="discord-quick-chip"
              onClick={() => handleQuickChipClick(chip)}
              disabled={sending}
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Message Input Composer */}
        <form className="discord-input-composer" onSubmit={handleSendMessage}>
          {/* Quick Topic / Sprint Dropdown Menu */}
          <div className="discord-topic-dropdown-wrap">
            <select
              className="discord-topic-select-dropdown"
              value=""
              onChange={(e) => {
                const selected = QUICK_CHIPS.find(c => c.label === e.target.value);
                if (selected) {
                  handleQuickChipClick(selected);
                }
              }}
              title="Select Topic or Quick Sprint"
            >
              <option value="" disabled>⚡ Topic</option>
              {QUICK_CHIPS.map((c, i) => (
                <option key={i} value={c.label}>
                  {c.label} (#{c.tag})
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            className="discord-composer-input"
            placeholder="Message #aspirants-study-hall (Type #QUANT, #LRDI)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
          />
          <button 
            type="submit" 
            className="discord-send-button"
            disabled={!inputText.trim() || sending}
            title="Send Message (Enter)"
          >
            {sending ? (
              <span className="btn-spinner"></span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* ========================================================
          RIGHT SIDE: FIXED SERVER MEMBER LIST SIDEBAR
         ======================================================== */}
      <div className={`discord-members-sidebar ${mobileTab === 'peers' ? 'mobile-active' : 'mobile-inactive'}`}>
        
        {/* Search Members Bar */}
        <div className="discord-member-search-box">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search peers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="discord-member-search-input"
          />
        </div>

        <div className="discord-members-list-scroll">
          
          {/* CATEGORY 1: ACTIVELY STUDYING */}
          <div className="discord-member-category">
            <div className="discord-category-title">
              <Icons.Flame size={12} color="#f97316" />
              <span>ACTIVELY STUDYING — {totalStudying}</span>
            </div>

            {totalStudying === 0 ? (
              <div className="discord-category-empty">
                No peers actively in timer. Start a session to appear here!
              </div>
            ) : (
              <>
                {/* Self studying card */}
                {userActivity && (
                  <div 
                    className="discord-member-item is-studying is-self clickable"
                    onClick={() => onInspectFriend && onInspectFriend({ isSelf: true, ...userProfile, id: currentUser?.uid, uid: currentUser?.uid })}
                    title="Click to view & edit your profile"
                  >
                    <AvatarRenderer 
                      avatar={userActivity.avatar}
                      name={userActivity.name}
                      avatarBg={userActivity.avatarBg}
                      size={36}
                      status="studying"
                    />
                    <div className="discord-member-meta">
                      <div className="discord-member-name-row">
                        <span className="discord-member-name">{userActivity.name}</span>
                        <span className="discord-self-tag">YOU</span>
                      </div>
                      <div className="discord-member-timer-badge">
                        <Icons.Clock size={11} color="#eab308" />
                        <span>{userActivity.activity.timerText}</span>
                      </div>
                      <div className="discord-member-task-snippet">
                        {userActivity.activity.subject} Focus
                      </div>
                    </div>
                  </div>
                )}

                {/* Other studying peers */}
                {studyingPeers.map((peer) => {
                  const timerDisplay = getPeerTimerDisplay(peer);
                  return (
                    <div 
                      key={peer.id || peer.uid} 
                      className="discord-member-item is-studying clickable"
                      onClick={() => onInspectFriend && onInspectFriend(peer)}
                      title="Click to view peer's study tracker"
                    >
                      <AvatarRenderer 
                        avatar={peer.avatar}
                        name={peer.name || peer.displayName}
                        avatarBg={peer.avatarBg}
                        size={36}
                        status="studying"
                      />
                      <div className="discord-member-meta">
                        <div className="discord-member-name-row">
                          <span className="discord-member-name">{peer.name || peer.displayName}</span>
                        </div>
                        {timerDisplay && (
                          <div className="discord-member-timer-badge">
                            <Icons.Clock size={11} color="#eab308" />
                            <span>{timerDisplay}</span>
                          </div>
                        )}
                        <div className="discord-member-task-snippet">
                          {peer.activity?.subject || peer.activity?.title || peer.target}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* CATEGORY 2: ONLINE ASPIRANTS */}
          <div className="discord-member-category">
            <div className="discord-category-title">
              <span className="online-dot-tiny"></span>
              <span>ONLINE — {totalOnline}</span>
            </div>

            {/* Self online item */}
            {!userActivity && (
              <div 
                className="discord-member-item is-online is-self clickable"
                onClick={() => onInspectFriend && onInspectFriend({ 
                  isSelf: true, 
                  ...userProfile, 
                  id: currentUser?.uid || 'self_user', 
                  uid: currentUser?.uid || 'self_user' 
                })}
                title="Click to view & edit your profile"
              >
                <AvatarRenderer 
                  avatar={userAvatar}
                  name={userProfile?.displayName || currentUser?.displayName || 'You'}
                  avatarBg={userAvatarBg}
                  size={36}
                  status="online"
                />
                <div className="discord-member-meta">
                  <div className="discord-member-name-row">
                    <span className="discord-member-name">{userProfile?.displayName || currentUser?.displayName || 'You'}</span>
                    <span className="discord-self-tag">YOU</span>
                  </div>
                  <div className="discord-member-sub">{userProfile?.streak || 0}d streak • Online</div>
                </div>
              </div>
            )}

            {/* Other online peers */}
            {onlinePeers.map((peer) => (
              <div 
                key={peer.id || peer.uid} 
                className="discord-member-item is-online clickable"
                onClick={() => onInspectFriend && onInspectFriend(peer)}
                title="Click to view peer's study tracker"
              >
                <AvatarRenderer 
                  avatar={peer.avatar}
                  name={peer.name || peer.displayName}
                  avatarBg={peer.avatarBg}
                  size={36}
                  status="online"
                />
                <div className="discord-member-meta">
                  <div className="discord-member-name-row">
                    <span className="discord-member-name">{peer.name || peer.displayName}</span>
                    {peer.aspirantId && (
                      <span className="discord-member-id-tag">
                        <Icons.Hash size={9} /> {peer.aspirantId}
                      </span>
                    )}
                  </div>
                  <div className="discord-member-sub">
                    {peer.streak ? `${peer.streak}d streak` : 'Online'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CATEGORY 3: OFFLINE BUDDIES */}
          {offlinePeers.length > 0 && (
            <div className="discord-member-category">
              <div className="discord-category-title">
                <span>OFFLINE — {offlinePeers.length}</span>
              </div>

              {offlinePeers.map((peer) => (
                <div 
                  key={peer.id || peer.uid} 
                  className="discord-member-item is-offline clickable"
                  onClick={() => onInspectFriend && onInspectFriend(peer)}
                  title="Click to view peer's study tracker"
                >
                  <AvatarRenderer 
                    avatar={peer.avatar}
                    name={peer.name || peer.displayName}
                    avatarBg={peer.avatarBg}
                    size={34}
                    status="offline"
                  />
                  <div className="discord-member-meta">
                    <div className="discord-member-name-row">
                      <span className="discord-member-name">{peer.name || peer.displayName}</span>
                    </div>
                    <div className="discord-member-sub">Offline</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
