import React from 'react';
import { Icons } from './AspirantIcons';

export const AVATAR_PRESETS = [
  { id: 'rocket', label: 'Rocket Voyager', icon: Icons.Sparkles, color: '#3b82f6' },
  { id: 'brain', label: 'Strategic Mind', icon: Icons.Zap, color: '#8b5cf6' },
  { id: 'target', label: 'Bullseye Focus', icon: Icons.Target, color: '#10b981' },
  { id: 'scholar', label: 'Scholar Elite', icon: Icons.BookOpen, color: '#f59e0b' },
  { id: 'fire', label: 'Relentless Flame', icon: Icons.Flame, color: '#ec4899' },
  { id: 'shield', label: 'Guardian Defender', icon: Icons.Shield, color: '#06b6d4' },
  { id: 'trophy', label: 'CAT Champion', icon: Icons.Trophy, color: '#eab308' },
  { id: 'user', label: 'Master Aspirant', icon: Icons.User, color: '#6366f1' }
];

export default function AvatarRenderer({ 
  avatar = '', 
  name = '', 
  avatarBg = '#3b82f6', 
  size = 40, 
  status = null, // 'studying' | 'online' | 'offline'
  className = ''
}) {
  const isImage = avatar && (avatar.startsWith('data:image') || avatar.startsWith('http://') || avatar.startsWith('https://'));
  const preset = AVATAR_PRESETS.find(p => p.id === avatar);

  return (
    <div 
      className={`aspirant-avatar-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: avatarBg || '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 2px 10px ${avatarBg || '#3b82f6'}50`,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: `${Math.max(12, Math.round(size * 0.4))}px`
        }}
      >
        {isImage ? (
          <img 
            src={avatar} 
            alt={name || 'Avatar'} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <Icons.Sparkles size={Math.round(size * 0.52)} />
        )}
      </div>

      {/* Online / Studying / Offline Status Indicator */}
      {status && (
        <span 
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: `${Math.max(10, Math.round(size * 0.28))}px`,
            height: `${Math.max(10, Math.round(size * 0.28))}px`,
            borderRadius: '50%',
            backgroundColor: status === 'studying' ? '#f97316' : status === 'online' ? '#22c55e' : '#64748b',
            border: '2px solid #14161c',
            boxShadow: status === 'studying' ? '0 0 8px #f97316' : status === 'online' ? '0 0 8px #22c55e' : 'none'
          }}
          title={status === 'studying' ? 'Focusing now' : status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
