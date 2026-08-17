import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, subscribeToChatMessages, deleteChatMessage } from '../utils/firebase';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';

const QUICK_CHIPS = [
  { label: '1hr Quant Sprint', text: 'Starting a 1-hour Quant focus sprint! Who is in? #QUANT', tag: 'QUANT', icon: Icons.Flame },
  { label: 'Cracking RCs', text: 'Solving 4 RC sets back-to-back right now. #VARC', tag: 'VARC', icon: Icons.BookOpen },
  { label: 'LRDI Drills', text: 'Tackling Arrangements & Games puzzles. #LRDI', tag: 'LRDI', icon: Icons.Puzzle },
  { label: '5-min Break', text: 'Taking a quick 5-min coffee break! #BREAK', tag: 'BREAK', icon: Icons.Coffee },
  { label: 'Target Hit', text: 'Crushed my daily question target for today! #MILESTONE', tag: 'MILESTONE', icon: Icons.Trophy }
];

const TAG_FILTERS = [
  { id: 'ALL', label: 'All Messages', icon: Icons.MessageSquare },
  { id: 'QUANT', label: 'Quant', icon: Icons.Calculator },
  { id: 'LRDI', label: 'LRDI', icon: Icons.Puzzle },
  { id: 'VARC', label: 'VARC', icon: Icons.BookOpen },
  { id: 'MILESTONE', label: 'Milestones', icon: Icons.Trophy }
];

export default function CommunityChat({
  currentUser = null,
  userProfile = null,
  friends = [],
  onClose = null
}) {
  const [activeChannel, setActiveChannel] = useState('global'); // 'global' | 'friends'
  const [selectedFriendRoom, setSelectedFriendRoom] = useState(null); // null (All Buddies) | friend object
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeActionMessage, setActiveActionMessage] = useState(null);
  const [copyToast, setCopyToast] = useState('');
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const friendIds = Array.isArray(userProfile?.friends) && userProfile.friends.length > 0
      ? userProfile.friends
      : friends.map(f => f.id || f.uid).filter(Boolean);
    const targetFriendId = selectedFriendRoom ? (selectedFriendRoom.id || selectedFriendRoom.uid) : null;

    const unsubscribe = subscribeToChatMessages(
      activeChannel, 
      (msgs) => {
        setMessages(msgs || []);
      },
      currentUser?.uid,
      friendIds,
      targetFriendId
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeChannel, currentUser?.uid, userProfile?.friends, friends, selectedFriendRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedTagFilter]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    const currentReply = replyingTo;
    const targetFriendId = (activeChannel === 'friends' && selectedFriendRoom)
      ? (selectedFriendRoom.id || selectedFriendRoom.uid)
      : null;

    setInputText('');
    setReplyingTo(null);
    setSending(true);

    let tag = 'GENERAL';
    if (text.toUpperCase().includes('#QUANT')) tag = 'QUANT';
    else if (text.toUpperCase().includes('#LRDI')) tag = 'LRDI';
    else if (text.toUpperCase().includes('#VARC')) tag = 'VARC';
    else if (text.toUpperCase().includes('#MILESTONE')) tag = 'MILESTONE';
    else if (text.toUpperCase().includes('#BREAK')) tag = 'BREAK';

    await sendChatMessage(currentUser, text, tag, userProfile, activeChannel, currentReply, targetFriendId);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleQuickChipClick = async (chip) => {
    if (sending) return;
    const targetFriendId = (activeChannel === 'friends' && selectedFriendRoom)
      ? (selectedFriendRoom.id || selectedFriendRoom.uid)
      : null;

    setSending(true);
    await sendChatMessage(currentUser, chip.text, chip.tag, userProfile, activeChannel, replyingTo, targetFriendId);
    setReplyingTo(null);
    setSending(false);
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
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCopyText = (text) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopyToast("Copied to clipboard!");
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
    await deleteChatMessage(msg.id, activeChannel);
    setActiveActionMessage(null);
  };

  const handleJumpToMessage = (targetMsgId) => {
    if (!targetMsgId) return;
    const elem = document.getElementById(`community-msg-${targetMsgId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(targetMsgId);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    }
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
    <div className="community-chat-wrapper">
      {/* Toast */}
      {copyToast && (
        <div className="lounge-floating-toast animate-slide-up">
          <Icons.Check size={14} />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="community-chat-header">
        <div className="chat-title-group">
          <div className="chat-live-pulse-icon">
            <span className="pulse-dot"></span>
          </div>
          <div>
            <h4 className="chat-title">
              {activeChannel === 'global'
                ? 'Live Aspirants Lounge' 
                : selectedFriendRoom 
                  ? `DM: ${selectedFriendRoom.displayName || selectedFriendRoom.name}` 
                  : 'Study Buddies Chat'}
            </h4>
            <div className="chat-subtitle">
              {activeChannel === 'global'
                ? 'Global real-time study discussion' 
                : selectedFriendRoom 
                  ? 'Private 1-on-1 discussion' 
                  : `Private chat with your ${friends.length} buddies`}
            </div>
          </div>
        </div>
        {onClose && (
          <button className="chat-close-btn" onClick={onClose} title="Close Chat">
            <Icons.Close size={16} />
          </button>
        )}
      </div>

      {/* Channel Switcher Tabs (Global vs Friends) */}
      <div className="community-chat-channel-tabs">
        <button
          type="button"
          className={`community-channel-tab-btn ${activeChannel === 'global' ? 'active' : ''}`}
          onClick={() => {
            setActiveChannel('global');
            setSelectedFriendRoom(null);
            setReplyingTo(null);
          }}
        >
          <Icons.MessageSquare size={13} />
          <span>Global Lounge</span>
        </button>
        <button
          type="button"
          className={`community-channel-tab-btn ${activeChannel === 'friends' ? 'active' : ''}`}
          onClick={() => {
            setActiveChannel('friends');
            setReplyingTo(null);
          }}
        >
          <Icons.Users size={13} />
          <span>Friends Only {friends.length > 0 ? `(${friends.length})` : ''}</span>
        </button>
      </div>

      {/* Friend Rooms Pills (when on Friends Only) */}
      {activeChannel === 'friends' && (
        <div className="community-friend-rooms-bar animate-slide-up" style={{ padding: '0 12px 8px 12px' }}>
          <button
            type="button"
            className={`friend-room-pill ${!selectedFriendRoom ? 'active' : ''}`}
            onClick={() => setSelectedFriendRoom(null)}
          >
            <Icons.Users size={11} />
            <span>All Buddies ({friends.length})</span>
          </button>
          {friends.map((f) => {
            const fId = f.id || f.uid;
            const isSelected = selectedFriendRoom && ((selectedFriendRoom.id === fId) || (selectedFriendRoom.uid === fId));
            return (
              <button
                key={fId}
                type="button"
                className={`friend-room-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedFriendRoom(f)}
                title={`Direct Chat with ${f.displayName || f.name}`}
              >
                <span className={`status-dot-mini ${f.status || 'offline'}`}></span>
                <span>{f.displayName || f.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Category Tag Filter Pills */}
      <div className="chat-tag-filter-bar">
        {TAG_FILTERS.map(filter => {
          const FilterIcon = filter.icon;
          return (
            <button
              key={filter.id}
              type="button"
              className={`chat-tag-btn ${selectedTagFilter === filter.id ? 'active' : ''}`}
              onClick={() => setSelectedTagFilter(filter.id)}
            >
              <FilterIcon size={12} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Real-time Message Stream */}
      <div className="chat-messages-container">
        {filteredMessages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <Icons.MessageSquare size={32} />
            </div>
            <div className="chat-empty-title">
              No messages in #{activeChannel === 'global' ? 'global' : selectedFriendRoom ? `DM-${selectedFriendRoom.displayName || selectedFriendRoom.name}` : 'friends'} yet
            </div>
            <div className="chat-empty-desc">
              {activeChannel === 'global'
                ? 'Be the first to share your study target, question doubt, or start a sprint!'
                : selectedFriendRoom 
                  ? `Say hello to ${selectedFriendRoom.displayName || selectedFriendRoom.name}!`
                  : 'Send a message to your connected study buddies!'}
            </div>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelf = currentUser && (msg.userId === currentUser.uid);
            const isHighlighted = highlightedMsgId === msg.id;

            return (
              <div 
                key={msg.id} 
                id={`community-msg-${msg.id}`}
                className={`chat-bubble-row ${isSelf ? 'self-row' : ''} ${isHighlighted ? 'message-highlight-pulse' : ''}`}
                onDoubleClick={() => setActiveActionMessage(msg)}
                onTouchStart={(e) => {
                  const now = Date.now();
                  if (msg._lastTouch && (now - msg._lastTouch < 350)) {
                    setActiveActionMessage(msg);
                  }
                  msg._lastTouch = now;
                }}
              >
                <AvatarRenderer 
                  avatar={msg.avatar}
                  name={msg.senderName}
                  avatarBg={msg.avatarBg}
                  size={34}
                />

                <div className="chat-message-bubble">
                  <div className="chat-message-header">
                    <span className="chat-sender-name">{msg.senderName}</span>
                    {isSelf && <span className="chat-self-badge">YOU</span>}
                    {msg.location && (
                      <span className="chat-location-tag">
                        <Icons.MapPin size={10} /> {msg.location}
                      </span>
                    )}
                    <span className="chat-timestamp">{formatMessageTime(msg.timestamp)}</span>

                    {/* Quick message actions */}
                    <div className="chat-bubble-quick-actions">
                      <button
                        type="button"
                        className="bubble-action-btn"
                        onClick={() => handleInitiateReply(msg)}
                        title="Reply"
                      >
                        <Icons.Reply size={12} />
                      </button>
                      <button
                        type="button"
                        className="bubble-action-btn"
                        onClick={() => setActiveActionMessage(msg)}
                        title="Options"
                      >
                        <Icons.MoreVertical size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Quoted Replied Message Bubble */}
                  {msg.replyTo && (
                    <div 
                      className="chat-quoted-reply-banner clickable"
                      onClick={() => handleJumpToMessage(msg.replyTo.id)}
                      title="Jump to replied message"
                    >
                      <div className="quoted-reply-line"></div>
                      <div className="quoted-reply-content">
                        <span className="quoted-reply-user">@{msg.replyTo.senderName}</span>
                        <span className="quoted-reply-snippet">{msg.replyTo.text}</span>
                      </div>
                    </div>
                  )}

                  <div className="chat-message-text">{msg.text}</div>

                  {msg.tag && msg.tag !== 'GENERAL' && (
                    <div className="chat-message-footer">
                      <span className={`chat-tag-pill tag-${msg.tag.toLowerCase()}`}>
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

      {/* 1-Tap Quick Action Chips */}
      <div className="chat-quick-chips-scroll">
        {QUICK_CHIPS.map((chip, idx) => {
          const ChipIcon = chip.icon;
          return (
            <button
              key={idx}
              type="button"
              className="quick-chip-btn"
              onClick={() => handleQuickChipClick(chip)}
              disabled={sending}
            >
              <ChipIcon size={12} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reply Banner Above Composer */}
      {replyingTo && (
        <div className="chat-composer-reply-bar animate-slide-up">
          <div className="composer-reply-left">
            <Icons.Reply size={13} className="composer-reply-icon" />
            <div className="composer-reply-meta">
              <span className="composer-reply-title">Replying to <strong>@{replyingTo.senderName}</strong></span>
              <span className="composer-reply-text">{replyingTo.text}</span>
            </div>
          </div>
          <button 
            type="button" 
            className="composer-reply-close-btn"
            onClick={() => setReplyingTo(null)}
            title="Cancel reply"
          >
            <Icons.Close size={13} />
          </button>
        </div>
      )}

      {/* Chat Message Input Bar */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          className="chat-text-input"
          placeholder={
            replyingTo 
              ? `Reply to @${replyingTo.senderName}...` 
              : activeChannel === 'global' 
                ? 'Share status in Global Lounge...' 
                : selectedFriendRoom 
                  ? `Message ${selectedFriendRoom.displayName || selectedFriendRoom.name}...` 
                  : 'Message your study buddies...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={sending}
        />
        <button 
          type="submit" 
          className="chat-send-btn" 
          disabled={!inputText.trim() || sending}
          title="Send message"
        >
          {sending ? (
            <span className="btn-spinner"></span>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>

      {/* Action Menu Bottom Sheet (Matching Image 4) */}
      {activeActionMessage && (
        <div className="chat-action-backdrop fade-in" onClick={() => setActiveActionMessage(null)}>
          <div className="chat-action-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="chat-action-header-text">
              Double tap a message to 🤠 Edit
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
