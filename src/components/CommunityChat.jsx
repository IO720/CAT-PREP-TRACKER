import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, subscribeToChatMessages } from '../utils/firebase';
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
  onClose = null
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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
    <div className="community-chat-wrapper">
      {/* Top Banner Header */}
      <div className="community-chat-header">
        <div className="chat-title-group">
          <div className="chat-live-pulse-icon">
            <span className="pulse-dot"></span>
          </div>
          <div>
            <h4 className="chat-title">Live Aspirants Lounge</h4>
            <div className="chat-subtitle">Real-time study discussion & accountability</div>
          </div>
        </div>
        {onClose && (
          <button className="chat-close-btn" onClick={onClose} title="Close Chat">
            <Icons.Close size={16} />
          </button>
        )}
      </div>

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
            <div className="chat-empty-title">No messages in this channel yet</div>
            <div className="chat-empty-desc">
              Be the first to share your study target, question doubt, or start a sprint!
            </div>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelf = currentUser && (msg.userId === currentUser.uid);
            return (
              <div 
                key={msg.id} 
                className={`chat-bubble-row ${isSelf ? 'self-row' : ''}`}
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
                  </div>

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

      {/* Chat Message Input Bar */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-text-input"
          placeholder="Share study status, doubt, or message..."
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
    </div>
  );
}
