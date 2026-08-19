import React, { useState, useEffect, useRef } from 'react';
import AvatarRenderer from '../AvatarRenderer';
import { Icons } from '../AspirantIcons';
import { sendChatMessage, subscribeToChatMessages, deleteChatMessage } from '../../utils/firebase';

const PUBLIC_CHANNELS = [
  { id: 'general-hall', name: 'general-hall', icon: Icons.MessageSquare, desc: 'Real-time discussions, doubts, prep strategy & general banter.' },
  { id: 'quant-sprints', name: 'quant-sprints', icon: Icons.Calculator, desc: 'Quantitative Aptitude problem sprints, shortcuts & doubts.' },
  { id: 'varc-reading', name: 'varc-reading', icon: Icons.BookOpen, desc: 'Reading Comprehension sets, Vocabulary & Verbal Ability.' },
  { id: 'lrdi-puzzles', name: 'lrdi-puzzles', icon: Icons.Puzzle, desc: 'Arrangements, Matrix, Caselets & Games & Tournaments.' },
  { id: 'milestones', name: 'milestones', icon: Icons.Trophy, desc: 'Daily study question targets crushed & milestone celebrations.' }
];

const QUICK_CHIPS = [
  { label: '1hr Quant Sprint', text: 'Starting a 1-hour Quant focus sprint! Who is in? #QUANT', tag: 'QUANT' },
  { label: 'Cracking RCs', text: 'Solving 4 RC sets back-to-back right now. #VARC', tag: 'VARC' },
  { label: 'LRDI Drills', text: 'Tackling Arrangements & Games puzzles. #LRDI', tag: 'LRDI' },
  { label: '5-min Break', text: 'Taking a quick 5-min coffee break! #BREAK', tag: 'BREAK' },
  { label: 'Daily Target Hit', text: 'Crushed my daily question target for today! #MILESTONE', tag: 'MILESTONE' }
];

export default function StudyLoungeChatArchive({
  peers = [],
  friends = [],
  onInspectFriend,
  currentUser = null,
  userProfile = null,
  timerState = null,
  compact = false,
  fullPage = true,
  initialTargetFriend = null,
  onResetTargetFriend = null
}) {
  const [activeChannelId, setActiveChannelId] = useState(() => {
    if (initialTargetFriend) {
      const fId = initialTargetFriend.id || initialTargetFriend.uid;
      return `dm_${fId}`;
    }
    if (friends && friends.length > 0) {
      return 'buddies-circle';
    }
    return 'general-hall';
  });
  const [selectedDirectFriend, setSelectedDirectFriend] = useState(() => initialTargetFriend || null);
  const [rightSidebarTab, setRightSidebarTab] = useState(() => (friends && friends.length > 0) ? 'buddies' : 'leaderboard');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [mobileTab, setMobileTab] = useState('chat');
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeActionMessage, setActiveActionMessage] = useState(null);
  const [copyToast, setCopyToast] = useState('');
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialTargetFriend) {
      const fId = initialTargetFriend.id || initialTargetFriend.uid;
      setActiveChannelId(`dm_${fId}`);
      setSelectedDirectFriend(initialTargetFriend);
      setMobileTab('chat');
      if (onResetTargetFriend) onResetTargetFriend();
    }
  }, [initialTargetFriend]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cacheKey = `cat_chat_cache_${activeChannelId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {}

    const friendIds = Array.isArray(userProfile?.friends) && userProfile.friends.length > 0
      ? userProfile.friends
      : friends.map(f => f.id || f.uid).filter(Boolean);
    const targetFriendId = selectedDirectFriend ? (selectedDirectFriend.id || selectedDirectFriend.uid) : null;

    const unsubscribe = subscribeToChatMessages(
      activeChannelId, 
      (msgs) => {
        setMessages(msgs || []);
        try {
          if (Array.isArray(msgs) && msgs.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(msgs.slice(-60)));
          }
        } catch (e) {}
      },
      currentUser?.uid,
      friendIds,
      targetFriendId
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeChannelId, currentUser?.uid, userProfile?.friends, friends, selectedDirectFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  const formatTime = (secs) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const mins = Math.floor(safeSecs / 60);
    const remainder = safeSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

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

  const peerSource = peers.length > 0 ? peers : friends;
  const studyingPeers = peerSource.filter(p => p.status === 'studying');
  
  const allStudyingStudents = [
    ...(userActivity ? [userActivity] : []),
    ...studyingPeers.filter(p => p.id !== currentUser?.uid && p.uid !== currentUser?.uid)
  ].sort((a, b) => {
    return (b.solvedQs || 0) - (a.solvedQs || 0) || (b.streak || 0) - (a.streak || 0);
  });

  const handleSelectPublicChannel = (channel) => {
    setActiveChannelId(channel.id);
    setSelectedDirectFriend(null);
    setReplyingTo(null);
    setMobileTab('chat');
  };

  const handleSelectBuddiesCircle = () => {
    setActiveChannelId('buddies-circle');
    setSelectedDirectFriend(null);
    setReplyingTo(null);
    setMobileTab('chat');
  };

  const handleSelectDirectFriend = (friend) => {
    const fId = friend.id || friend.uid;
    setActiveChannelId(`dm_${fId}`);
    setSelectedDirectFriend(friend);
    setReplyingTo(null);
    setMobileTab('chat');
  };

  const isPrivateChannel = activeChannelId === 'buddies-circle' || activeChannelId.startsWith('dm_') || !!selectedDirectFriend;

  const currentChannelInfo = isPrivateChannel
    ? selectedDirectFriend
      ? { name: selectedDirectFriend.displayName || selectedDirectFriend.name, desc: `Direct 1-on-1 private discussion with ${selectedDirectFriend.displayName || selectedDirectFriend.name}.` }
      : { name: 'study-buddies', desc: `Private discussion room exclusively for you and your ${friends.length} connected study buddies.` }
    : PUBLIC_CHANNELS.find(c => c.id === activeChannelId) || PUBLIC_CHANNELS[0];

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    const currentReply = replyingTo;
    const targetFriendId = selectedDirectFriend ? (selectedDirectFriend.id || selectedDirectFriend.uid) : null;

    setInputText('');
    setReplyingTo(null);

    let tag = 'GENERAL';
    if (activeChannelId === 'quant-sprints' || text.toUpperCase().includes('#QUANT')) tag = 'QUANT';
    else if (activeChannelId === 'varc-reading' || text.toUpperCase().includes('#VARC')) tag = 'VARC';
    else if (activeChannelId === 'lrdi-puzzles' || text.toUpperCase().includes('#LRDI')) tag = 'LRDI';
    else if (activeChannelId === 'milestones' || text.toUpperCase().includes('#MILESTONE')) tag = 'MILESTONE';
    else if (text.toUpperCase().includes('#BREAK')) tag = 'BREAK';

    const optimisticMsg = {
      id: 'local_' + Date.now(),
      userId: currentUser?.uid || 'self',
      senderName: userProfile?.displayName || currentUser?.displayName || 'You',
      avatar: userProfile?.avatar || currentUser?.photoURL || 'rocket',
      avatarBg: userProfile?.avatarBg || '#5865f2',
      text: text,
      tag: tag,
      timestamp: Date.now(),
      roomId: activeChannelId,
      channel: activeChannelId,
      replyTo: currentReply
    };

    setMessages(prev => [...prev, optimisticMsg]);
    const cacheKey = `cat_chat_cache_${activeChannelId}`;
    try {
      const currentCached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      localStorage.setItem(cacheKey, JSON.stringify([...currentCached, optimisticMsg].slice(-60)));
    } catch(e) {}

    setSending(true);

    try {
      await sendChatMessage(currentUser, text, tag, userProfile, activeChannelId, currentReply, targetFriendId);
    } catch (err) {
      console.warn("Cloud Firestore message sync notice (saved locally):", err?.message);
    } finally {
      setSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickChipClick = async (chip) => {
    if (sending) return;
    const targetFriendId = selectedDirectFriend ? (selectedDirectFriend.id || selectedDirectFriend.uid) : null;

    const optimisticMsg = {
      id: 'local_' + Date.now(),
      userId: currentUser?.uid || 'self',
      senderName: userProfile?.displayName || currentUser?.displayName || 'You',
      avatar: userProfile?.avatar || currentUser?.photoURL || 'rocket',
      avatarBg: userProfile?.avatarBg || '#5865f2',
      text: chip.text,
      tag: chip.tag || 'GENERAL',
      timestamp: Date.now(),
      roomId: activeChannelId,
      channel: activeChannelId,
      replyTo: replyingTo
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setReplyingTo(null);
    setSending(true);

    try {
      await sendChatMessage(currentUser, chip.text, chip.tag, userProfile, activeChannelId, replyingTo, targetFriendId);
    } catch (err) {
      console.warn("Cloud Firestore chip sync notice (saved locally):", err?.message);
    } finally {
      setSending(false);
    }
  };

  const getTagStyle = (tag) => {
    switch ((tag || '').toUpperCase()) {
      case 'QUANT':
        return { bg: 'rgba(59, 130, 246, 0.18)', color: '#60a5fa' };
      case 'VARC':
        return { bg: 'rgba(168, 85, 247, 0.18)', color: '#c084fc' };
      case 'LRDI':
        return { bg: 'rgba(234, 179, 8, 0.18)', color: '#facc15' };
      case 'MILESTONE':
        return { bg: 'rgba(34, 197, 94, 0.18)', color: '#4ade80' };
      case 'BREAK':
        return { bg: 'rgba(244, 63, 94, 0.18)', color: '#fb7185' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' };
    }
  };

  const handleInitiateReply = (msg) => {
    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName || 'Aspirant',
      text: msg.text || '',
      avatar: msg.avatar,
      avatarBg: msg.avatarBg
    });
    setActiveActionMessage(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCopyText = (text) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopyToast("Message copied to clipboard!");
    setActiveActionMessage(null);
    setTimeout(() => setCopyToast(''), 2000);
  };

  const handleForwardMessage = (msg) => {
    setInputText(`"${msg.text}" - @${msg.senderName} `);
    setActiveActionMessage(null);
    inputRef.current?.focus();
  };

  const handleDeleteMsg = async (msg) => {
    if (!window.confirm("Delete this message?")) return;
    await deleteChatMessage(msg.id, activeChannelId);
    setActiveActionMessage(null);
  };

  const handleJumpToMessage = (targetMsgId) => {
    if (!targetMsgId) return;
    const elem = document.getElementById(`msg-${targetMsgId}`) || document.getElementById(`channel-msg-${targetMsgId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(targetMsgId);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    }
  };

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
    <div className={`hub-layout ${fullPage ? 'full-page-hub' : ''}`}>
      {copyToast && (
        <div className="lounge-floating-toast animate-slide-up">
          <Icons.Check size={14} />
          <span>{copyToast}</span>
        </div>
      )}

      <div className="hub-mobile-tabs-bar">
        <button 
          type="button" 
          className={`hub-mobile-tab-btn ${mobileTab === 'channels' ? 'active' : ''}`}
          onClick={() => setMobileTab('channels')}
        >
          <Icons.Hash size={14} />
          <span>Channels</span>
        </button>
        <button 
          type="button" 
          className={`hub-mobile-tab-btn ${mobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setMobileTab('chat')}
        >
          <Icons.MessageSquare size={14} />
          <span>Chat</span>
        </button>
        <button 
          type="button" 
          className={`hub-mobile-tab-btn ${mobileTab === 'sidebar' ? 'active' : ''}`}
          onClick={() => setMobileTab('sidebar')}
        >
          <Icons.Flame size={14} />
          <span>{isPrivateChannel ? 'Members' : 'Leaderboard'}</span>
          {allStudyingStudents.length > 0 && <span className="live-studying-pulse-dot"></span>}
        </button>
      </div>

      <div className={`hub-channels-sidebar ${mobileTab === 'channels' ? 'mobile-active' : 'mobile-inactive'}`}>
        <div className="hub-server-header">
          <div className="hub-server-title-row">
            <span className="hub-server-icon-badge">
              <Icons.Zap size={14} />
            </span>
            <span className="hub-server-title">Aspirants Study Hall</span>
          </div>
        </div>

        <div className="hub-channels-list-scroll">
          <div className="hub-channel-category">
            <div className="hub-category-label">
              <span>PERSONAL CONNECTIONS</span>
            </div>

            <button
              type="button"
              className={`hub-channel-btn ${activeChannelId === 'buddies-circle' && !selectedDirectFriend ? 'active' : ''}`}
              onClick={handleSelectBuddiesCircle}
            >
              <Icons.Users size={14} className="hub-channel-icon" />
              <span className="hub-channel-name">study-buddies</span>
              {friends.length > 0 && <span className="hub-badge-count">{friends.length}</span>}
            </button>

            {friends.map(friend => {
              const fId = friend.id || friend.uid;
              const isActive = selectedDirectFriend && ((selectedDirectFriend.id === fId) || (selectedDirectFriend.uid === fId));
              const timerDisplay = getPeerTimerDisplay(friend);
              return (
                <button
                  key={fId}
                  type="button"
                  className={`hub-channel-btn dm-channel-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectDirectFriend(friend)}
                >
                  <span className={`status-dot-mini ${friend.status || 'offline'}`}></span>
                  <span className="hub-channel-name">{friend.displayName || friend.name}</span>
                  {friend.status === 'studying' && (
                    <span className="hub-studying-timer-chip">
                      {timerDisplay ? timerDisplay.split(' ')[0] : 'Study'}
                    </span>
                  )}
                </button>
              );
            })}

            {friends.length === 0 && (
              <div className="hub-empty-friends-hint">
                No buddies added yet. Add friends from your Profile tab to start 1-on-1 study sessions!
              </div>
            )}
          </div>

          <div className="hub-channel-category">
            <div className="hub-category-label">
              <span>PUBLIC STUDY HALL</span>
            </div>

            {PUBLIC_CHANNELS.map(channel => {
              const ChannelIcon = channel.icon;
              const isActive = activeChannelId === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  className={`hub-channel-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectPublicChannel(channel)}
                >
                  <span className="hub-channel-hash">#</span>
                  <span className="hub-channel-name">{channel.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`hub-chat-area ${mobileTab === 'chat' ? 'mobile-active' : 'mobile-inactive'}`}>
        <div className="hub-chat-header-bar">
          <div className="hub-chat-header-info">
            <span className="hub-header-hash">{isPrivateChannel && selectedDirectFriend ? '@' : '#'}</span>
            <div>
              <h2 className="hub-header-channel-name">{currentChannelInfo.name}</h2>
              <p className="hub-header-channel-desc">{currentChannelInfo.desc}</p>
            </div>
          </div>
        </div>

        <div className="hub-messages-container">
          {messages.length === 0 ? (
            <div className="hub-messages-empty-state">
              <div className="hub-empty-icon-wrap">
                {isPrivateChannel ? (
                  <Icons.Users size={36} color="#38bdf8" />
                ) : (
                  <Icons.MessageSquare size={36} />
                )}
              </div>
              <h3>
                {isPrivateChannel && selectedDirectFriend 
                  ? `Conversation with @${currentChannelInfo.name}` 
                  : `Welcome to #${currentChannelInfo.name}!`}
              </h3>
              <p>
                {isPrivateChannel
                  ? selectedDirectFriend
                    ? `This is your 1-on-1 private study chat with ${selectedDirectFriend.displayName || selectedDirectFriend.name}. Send your first message!`
                    : friends.length === 0
                      ? "This is your private group study room for you and your study buddies. Add friends using their Unique Aspirant ID to study together here!"
                      : `This is your private group study room with your ${friends.length} study buddies. Start a sprint or share notes!`
                  : `This is the start of real-time discussion in #${currentChannelInfo.name}. Share your targets, ask doubts, or motivate your peers!`
                }
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isSelf = currentUser && (msg.userId === currentUser.uid);
              const tagStyle = getTagStyle(msg.tag);
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const isGrouped = prevMsg && (prevMsg.userId === msg.userId) && (msg.timestamp - prevMsg.timestamp < 3 * 60 * 1000);
              const isHighlighted = highlightedMsgId === msg.id;

              return (
                <div 
                  key={msg.id || index} 
                  id={`msg-${msg.id}`}
                  className={`hub-message-row ${isSelf ? 'is-self' : ''} ${isGrouped ? 'grouped' : ''} ${isHighlighted ? 'highlighted-msg' : ''}`}
                >
                  {!isGrouped && (
                    <div className="hub-msg-avatar-col">
                      <AvatarRenderer 
                        avatar={msg.avatar}
                        name={msg.senderName}
                        avatarBg={msg.avatarBg}
                        size={38}
                      />
                    </div>
                  )}

                  <div className="hub-msg-content-col">
                    {!isGrouped && (
                      <div className="hub-msg-header">
                        <span 
                          className="hub-sender-name clickable"
                          onClick={() => onInspectFriend && onInspectFriend({
                            id: msg.userId,
                            uid: msg.userId,
                            displayName: msg.senderName,
                            name: msg.senderName,
                            avatar: msg.avatar,
                            avatarBg: msg.avatarBg,
                            target: msg.target,
                            location: msg.location,
                            aspirantId: msg.aspirantId
                          })}
                        >
                          {msg.senderName}
                        </span>

                        {isSelf && <span className="hub-self-tag">YOU</span>}

                        {msg.tag && msg.tag.toUpperCase() !== 'GENERAL' && (
                          <span 
                            className="hub-msg-tag-badge"
                            style={{ backgroundColor: tagStyle.bg, color: tagStyle.color }}
                          >
                            {msg.tag}
                          </span>
                        )}

                        <span className="hub-msg-time">{formatMessageTime(msg.timestamp)}</span>
                      </div>
                    )}

                    {msg.replyTo && (
                      <div 
                        className="hub-replied-preview-box clickable"
                        onClick={() => handleJumpToMessage(msg.replyTo.id)}
                        title="Click to jump to quoted message"
                      >
                        <div className="hub-reply-left-bar"></div>
                        <AvatarRenderer 
                          avatar={msg.replyTo.avatar}
                          name={msg.replyTo.senderName}
                          avatarBg={msg.replyTo.avatarBg}
                          size={16}
                        />
                        <span className="hub-reply-sender">@{msg.replyTo.senderName}</span>
                        <span className="hub-reply-snippet">{msg.replyTo.text}</span>
                      </div>
                    )}

                    <div className="hub-msg-text-row">
                      <div className="hub-msg-text">
                        {msg.text}
                      </div>

                      <div className="hub-msg-hover-actions">
                        <button 
                          type="button" 
                          className="hub-hover-action-btn"
                          title="Reply to message"
                          onClick={() => handleInitiateReply(msg)}
                        >
                          <Icons.Reply size={13} />
                        </button>
                        <button 
                          type="button" 
                          className="hub-hover-action-btn"
                          title="Copy text"
                          onClick={() => handleCopyText(msg.text)}
                        >
                          <Icons.Copy size={13} />
                        </button>
                        <button 
                          type="button" 
                          className="hub-hover-action-btn"
                          title="More options"
                          onClick={() => setActiveActionMessage(msg)}
                        >
                          <Icons.MoreVertical size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {replyingTo && (
          <div className="hub-replying-active-bar">
            <div className="hub-replying-info">
              <Icons.Reply size={14} color="#38bdf8" />
              <span>Replying to <strong>@{replyingTo.senderName}</strong>:</span>
              <span className="hub-replying-text-snip">"{replyingTo.text}"</span>
            </div>
            <button 
              type="button" 
              className="hub-reply-cancel-btn"
              onClick={() => setReplyingTo(null)}
              title="Cancel reply"
            >
              <Icons.Close size={13} />
            </button>
          </div>
        )}

        <div className="hub-quick-chips-bar">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="hub-quick-chip-btn"
              onClick={() => handleQuickChipClick(chip)}
              title={chip.text}
            >
              <span className="chip-plus">+</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        <form className="hub-composer-form" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            className="hub-chat-input"
            placeholder={
              isPrivateChannel 
                ? (selectedDirectFriend ? `Message @${selectedDirectFriend.displayName || selectedDirectFriend.name}...` : `Message #study-buddies...`)
                : `Message #${currentChannelInfo.name}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={1000}
            disabled={sending}
          />

          <button
            type="submit"
            className={`hub-send-btn ${inputText.trim() ? 'has-text' : ''}`}
            disabled={!inputText.trim() || sending}
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            {sending ? (
              <span className="btn-spinner"></span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(1px)' }}>
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" fillOpacity="0.25"></polygon>
              </svg>
            )}
          </button>
        </form>
      </div>

      <div className={`hub-right-sidebar ${mobileTab === 'sidebar' ? 'mobile-active' : 'mobile-inactive'}`}>
        <div className="hub-right-sidebar-nav">
          <button
            type="button"
            className={`hub-right-nav-tab ${rightSidebarTab === 'buddies' ? 'active' : ''}`}
            onClick={() => setRightSidebarTab('buddies')}
          >
            <Icons.Users size={14} />
            <span>Study Buddies</span>
            {friends.length > 0 && <span className="hub-tab-count">{friends.length}</span>}
          </button>

          <button
            type="button"
            className={`hub-right-nav-tab ${rightSidebarTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setRightSidebarTab('leaderboard')}
          >
            <Icons.Trophy size={14} />
            <span>Studying</span>
            {allStudyingStudents.length > 0 && (
              <span className="hub-tab-count active-pulse">{allStudyingStudents.length}</span>
            )}
          </button>
        </div>

        {rightSidebarTab === 'buddies' ? (
          <div className="hub-channel-members-container">
            <div className="hub-leaderboard-header">
              <div className="hub-leaderboard-title-row">
                <Icons.Users size={16} color="#38bdf8" />
                <span className="hub-leaderboard-title">STUDY BUDDY NETWORK</span>
              </div>
              <span className="hub-leaderboard-badge">
                {friends.filter(f => f.status === 'studying' || f.status === 'online').length} Online
              </span>
            </div>

            <div className="hub-channel-members-list">
              <div 
                className="hub-member-card is-self clickable"
                onClick={() => onInspectFriend && onInspectFriend({ isSelf: true, ...userProfile, id: currentUser?.uid, uid: currentUser?.uid })}
                title="Click to view your profile card"
              >
                <AvatarRenderer 
                  avatar={userProfile?.avatar || currentUser?.photoURL}
                  name={userProfile?.displayName || 'You'}
                  avatarBg={userProfile?.avatarBg || '#5865f2'}
                  size={36}
                  status={isUserStudying ? 'studying' : 'online'}
                />
                <div className="hub-member-meta">
                  <div className="hub-member-name-row">
                    <span className="hub-member-name">{userProfile?.displayName || 'You'}</span>
                    <span className="hub-self-tag">YOU</span>
                  </div>
                  <div className="hub-member-status-line">
                    <span className={`status-dot-mini ${isUserStudying ? 'studying' : 'online'}`}></span>
                    <span>{isUserStudying ? `Studying (${userActivity?.activity?.timerText || 'Live'})` : 'Online'}</span>
                  </div>
                  <div className="hub-student-stats-row">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Icons.Flame size={11} color="#f97316" />
                      {userProfile?.streak || 0}d streak
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Icons.Target size={11} color="#38bdf8" />
                      {userProfile?.solvedQs || 0} Qs
                    </span>
                  </div>
                </div>
              </div>

              {friends.length === 0 ? (
                <div className="hub-empty-friends-sidebar">
                  <Icons.Users size={28} color="#64748b" />
                  <p>No study buddies added yet.</p>
                  <span>Add friends by Unique ID from your Profile tab!</span>
                </div>
              ) : (
                friends.map(friend => {
                  const fId = friend.id || friend.uid;
                  const isCurrentDm = selectedDirectFriend && ((selectedDirectFriend.id === fId) || (selectedDirectFriend.uid === fId));
                  const timerDisplay = getPeerTimerDisplay(friend);
                  const isStudying = friend.status === 'studying';
                  const isOnline = friend.status === 'online';

                  return (
                    <div 
                      key={fId}
                      className={`hub-member-card clickable ${isCurrentDm ? 'is-active-dm' : ''}`}
                      onClick={() => onInspectFriend && onInspectFriend(friend)}
                      title={`Click to view ${friend.displayName || friend.name}'s aspirant profile`}
                    >
                      <AvatarRenderer 
                        avatar={friend.avatar}
                        name={friend.displayName || friend.name}
                        avatarBg={friend.avatarBg}
                        size={36}
                        status={friend.status || 'offline'}
                      />
                      <div className="hub-member-meta">
                        <div className="hub-member-name-row">
                          <span className="hub-member-name">{friend.displayName || friend.name}</span>
                          {isCurrentDm && <span className="hub-active-chat-pill">ACTIVE CHAT</span>}
                        </div>

                        <div className="hub-member-status-line">
                          <span className={`status-dot-mini ${friend.status || 'offline'}`}></span>
                          {isStudying ? (
                            <span className="studying-status-text">
                              Studying {friend.activity?.subject ? `(${friend.activity.subject})` : ''} {timerDisplay ? `• ${timerDisplay}` : ''}
                            </span>
                          ) : (
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                          )}
                        </div>

                        <div className="hub-student-stats-row">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Icons.Flame size={11} color="#f97316" />
                            {friend.streak || 0}d streak
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Icons.Target size={11} color="#38bdf8" />
                            {friend.solvedQs || 0} Qs
                          </span>

                          <button
                            type="button"
                            className="hub-inspect-inline-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDirectFriend(friend);
                            }}
                            title="Chat in Direct Message"
                            style={{ marginLeft: 'auto', background: isCurrentDm ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)', color: isCurrentDm ? '#000' : '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                          >
                            <Icons.MessageSquare size={11} />
                            <span style={{ fontSize: '10px', marginLeft: '3px' }}>Chat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="hub-leaderboard-container">
            <div className="hub-leaderboard-header">
              <div className="hub-leaderboard-title-row">
                <Icons.Trophy size={16} color="#fbbf24" />
                <span className="hub-leaderboard-title">STUDYING LEADERBOARD</span>
              </div>
              <span className="hub-leaderboard-badge">
                <span className="live-pulse-dot"></span>
                {allStudyingStudents.length} Active Now
              </span>
            </div>

            <div className="hub-leaderboard-scroll">
              {allStudyingStudents.length === 0 ? (
                <div className="hub-leaderboard-empty">
                  <Icons.Flame size={32} color="#f97316" />
                  <h4>No Active Timers</h4>
                  <p>Start a focus session in the Timer tab to claim #1 on the live leaderboard!</p>
                </div>
              ) : (
                allStudyingStudents.map((student, idx) => {
                  const timerDisplay = getPeerTimerDisplay(student);
                  const rankIcon = `#${idx + 1}`;
                  
                  return (
                    <div 
                      key={student.id || student.uid} 
                      className={`hub-leaderboard-card ${student.isSelf ? 'is-self' : ''} clickable`}
                      onClick={() => onInspectFriend && onInspectFriend(student.isSelf ? { isSelf: true, ...userProfile, id: currentUser?.uid, uid: currentUser?.uid } : student)}
                      title="Click to view full aspirant profile card"
                    >
                      <div className="hub-rank-badge">{rankIcon}</div>

                      <AvatarRenderer 
                        avatar={student.avatar}
                        name={student.name || student.displayName}
                        avatarBg={student.avatarBg}
                        size={36}
                        status="studying"
                      />

                      <div className="hub-leaderboard-meta">
                        <div className="hub-student-name-row">
                          <span className="hub-student-name">{student.name || student.displayName}</span>
                          {student.isSelf && <span className="hub-self-tag">YOU</span>}
                        </div>

                        <div className="hub-leaderboard-timer">
                          <Icons.Clock size={11} color="#eab308" />
                          <span>{timerDisplay}</span>
                          <span className="hub-subject-pill">{student.activity?.subject || 'Quant'}</span>
                        </div>

                        <div className="hub-student-stats-row">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Icons.Flame size={11} color="#f97316" />
                            {student.streak || 0}d streak
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Icons.Target size={11} color="#38bdf8" />
                            {student.solvedQs || 0} Qs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {activeActionMessage && (
        <div className="chat-action-backdrop fade-in" onClick={() => setActiveActionMessage(null)}>
          <div className="chat-action-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="chat-action-header-text">
              Double click a message to edit
            </div>
            
            <div className="chat-action-card-container">
              <div className="chat-action-card">
                <button
                  type="button"
                  className="chat-action-row-btn"
                  onClick={() => handleInitiateReply(activeActionMessage)}
                >
                  <Icons.Reply size={18} />
                  <span>Reply</span>
                </button>

                <button
                  type="button"
                  className="chat-action-row-btn"
                  onClick={() => handleForwardMessage(activeActionMessage)}
                >
                  <Icons.Forward size={18} />
                  <span>Forward</span>
                </button>
              </div>

              <div className="chat-action-card secondary-card">
                <button
                  type="button"
                  className="chat-action-row-btn"
                  onClick={() => handleCopyText(activeActionMessage.text)}
                >
                  <Icons.Copy size={18} />
                  <span>Copy Text</span>
                </button>

                {currentUser && (activeActionMessage.userId === currentUser.uid) && (
                  <button
                    type="button"
                    className="chat-action-row-btn delete-btn"
                    onClick={() => handleDeleteMsg(activeActionMessage)}
                  >
                    <Icons.Trash2 size={18} />
                    <span>Delete Message</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
