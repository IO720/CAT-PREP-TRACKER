import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { playHankoStampSound, playSoftClick } from '../utils/audioUtils';

/**
 * 6 Collectible Japanese Neko Stamps inspired by "3 Reasons Why Japan Loves Cats"
 * (J-Life International: Buddhism / Temple Guardians, Urban Solitude, and Self-Sufficiency)
 */
export const STAMP_DEFINITIONS = [
  {
    id: 'zen-neko',
    slotCode: 'ZEN NEKO J101',
    jpName: '禅猫',
    enName: 'Temple Scripture Guardian',
    kanji: '禅',
    reasonTag: 'Reason 1: Temple Guardian',
    lore: 'Since ancient times, Buddhist monks kept cats in Japanese temples to protect sacred sutras and grain from pests. In return, monks admired their meditative calm and stillness, seeing them as living embodiments of Zen mindfulness.'
  },
  {
    id: 'maneki-neko',
    slotCode: 'MANEKI NEKO J102',
    jpName: '招き猫',
    enName: 'The Beckoning Fortune',
    kanji: '福',
    reasonTag: 'Folklore: Auspicious Luck',
    lore: 'Famous across Japan since the Edo period, the Maneki-Neko raises its paw to beckon good fortune, abundance, and exam triumph. When practicing hard, discipline becomes your own good luck charm.'
  },
  {
    id: 'tokai-neko',
    slotCode: 'TOKAI NEKO J103',
    jpName: '都会猫',
    enName: 'Urban Serenity & Calm',
    kanji: '静',
    reasonTag: 'Reason 2: Urban Lifestyle',
    lore: 'In bustling Japanese metropolises, cats thrive in quiet, compact living spaces. They teach us that even inside intense, high-stress environments, one can build a tranquil sanctuary of quiet daily focus.'
  },
  {
    id: 'ronin-neko',
    slotCode: 'RONIN NEKO J104',
    jpName: '自立猫',
    enName: 'Disciplined Self-Sufficiency',
    kanji: '律',
    reasonTag: 'Reason 3: Independence',
    lore: 'Known for their independent and self-sufficient nature, cats mirror the disciplined aspirant who needs no external pressure to show up, sit down, and conquer their daily quota.'
  },
  {
    id: 'torii-neko',
    slotCode: 'TORII NEKO J105',
    jpName: '鳥居猫',
    enName: 'Sacred Gatekeeper',
    kanji: '護',
    reasonTag: 'Shinto Lore: Sacred Boundary',
    lore: 'At Shinto shrines across Kyoto and Aoshima, shrine cats guard the torii threshold. Crossing your study threshold daily marks the sacred separation between distraction and unwavering commitment.'
  },
  {
    id: 'neko-daishi',
    slotCode: 'COMPLETE',
    jpName: '猫大師',
    enName: 'Grand Scholar Enlightenment',
    kanji: '成',
    reasonTag: 'Rally Completion: Grand Prize',
    lore: 'Full Stamp Rally Conquered! You have completed all 6 sprint quotas with samurai-like discipline. The Grand Scholar Cat bestows the Imperial Fortune Gold theme and the Gōkaku Exam Omamori.'
  }
];

export default function JapaneseCatStampRallyModal({
  isOpen,
  onClose,
  stampRallyData = { totalStamps: 0, currentCardStamps: [], redeemedThemes: [], completedCards: 0 },
  onRedeemTheme,
  triggerNewStamp = false
}) {
  const [selectedStampLore, setSelectedStampLore] = useState(null);
  const [animatingStampId, setAnimatingStampId] = useState(null);

  const stampsCollected = stampRallyData.currentCardStamps || [];
  const isCardComplete = stampsCollected.length >= 6;

  // Trigger stamp press animation when completing quota
  useEffect(() => {
    if (isOpen && triggerNewStamp && stampsCollected.length > 0) {
      const latestStamp = stampsCollected[stampsCollected.length - 1];
      setAnimatingStampId(latestStamp);
      try {
        playHankoStampSound(0.04);
      } catch (e) {}

      const timer = setTimeout(() => {
        setAnimatingStampId(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, triggerNewStamp, stampsCollected]);

  const handleSlotClick = (stampDef, isStamped) => {
    playSoftClick();
    if (isStamped) {
      setSelectedStampLore(stampDef);
    }
  };

  const isKyotoUnlocked = stampRallyData.redeemedThemes?.includes('kyoto-zen');
  const isManekiUnlocked = stampRallyData.redeemedThemes?.includes('maneki-gold');

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="stamp-rally-backdrop" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className="stamp-rally-dialog-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Japanese Lantern Glow */}
        <div className="stamp-rally-ambient-glow" />

        {/* Modal Close Button */}
        <button 
          type="button" 
          className="stamp-rally-close-btn" 
          onClick={onClose}
          aria-label="Close Stamp Rally"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 1. Header Banner */}
        <div className="stamp-rally-modal-header">
          <div className="stamp-badge-tag">
            <span className="shinto-sun-circle" />
            <span>和風猫スタンプラリー • NEKO STAMP RALLY</span>
          </div>
          <h2 className="stamp-rally-modal-title">
            YOKAI MASCOTS STAMP RALLY
          </h2>
          <p className="stamp-rally-instructions">
            CONQUER 3/3 DAILY QUOTAS FOR AN AUTHENTIC JAPANESE HANKO STAMP • COLLECT ALL 6 FOR PRIZE THEMES
          </p>
        </div>

        {/* 2. Physical Washi-Paper Stamp Rally Card (Exact layout of user photo) */}
        <div className="washi-paper-card-wrapper">
          <div className="washi-card-inner">
            <div className="washi-card-header-row">
              <div className="washi-card-title-lockup">
                <span className="washi-top-title font-display">YOKAI MASCOTS</span>
                <span className="washi-bottom-title font-display">STAMP RALLY</span>
                <span className="washi-card-subtitle font-mono">MAP AND PRIZE PREVIEWS ARE ON THE BACKSIDE!</span>
              </div>
              <div className="washi-card-rules-box font-mono">
                <span>CONQUER 3/3 DRILLS FOR A STAMP</span>
                <span>COLLECT ALL STAMPS FOR A PRIZE PACK</span>
              </div>
            </div>

            {/* 6 Circular Stamp Slots Grid */}
            <div className="washi-slots-grid">
              {STAMP_DEFINITIONS.map((def, idx) => {
                const isStamped = stampsCollected.includes(def.id) || stampsCollected.length > idx;
                const isCurrentAnimation = animatingStampId === def.id;

                return (
                  <div 
                    key={def.id}
                    className={`washi-slot-box ${isStamped ? 'stamped' : 'empty'} ${isCurrentAnimation ? 'anim-stamping' : ''}`}
                    onClick={() => handleSlotClick(def, isStamped)}
                    title={isStamped ? `Click to inspect ${def.enName} Lore` : `Slot ${idx + 1}: ${def.slotCode} (Complete today's quota to stamp)`}
                  >
                    {/* The Circular White Stamp Base */}
                    <div className="washi-slot-circle">
                      {isStamped ? (
                        <div className={`hanko-ink-seal ${isCurrentAnimation ? 'hanko-slam-in' : ''}`}>
                          {/* Outer Scalloped Cog Border like Sundrop Studios Stamp in Photo */}
                          <svg className="hanko-scallop-svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="3.5 2" />
                            <circle cx="50" cy="50" r="41" fill="none" stroke="#b91c1c" strokeWidth="1.2" />
                          </svg>

                          {/* Stamp Arc Text */}
                          <div className="hanko-top-arc font-mono">
                            <span>CATALYZE</span>
                          </div>

                          {/* Mascot Cat Illustration in Center */}
                          <div className="hanko-mascot-art">
                            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                              {/* Cute Kitty Body */}
                              <path d="M12 36C12 28 15 22 21 22C27 22 30 28 30 36" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />
                              {/* Kitty Head */}
                              <ellipse cx="21" cy="18" rx="10" ry="8" stroke="#b91c1c" strokeWidth="2" fill="#fffaf0" />
                              {/* Cat Ears */}
                              <polygon points="12,14 16,8 18,12" stroke="#b91c1c" strokeWidth="1.75" fill="#fffaf0" />
                              <polygon points="30,14 26,8 24,12" stroke="#b91c1c" strokeWidth="1.75" fill="#fffaf0" />
                              {/* Persimmon / Mikan on Head like photo! */}
                              <circle cx="21" cy="8.5" r="3" stroke="#b91c1c" strokeWidth="1.5" fill="#fffaf0" />
                              <path d="M21 5.5V4" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
                              {/* Happy Face */}
                              <path d="M17 17C18 19 19 19 20 17" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M22 17C23 19 24 19 25 17" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
                              {/* Cheerful Paws */}
                              <ellipse cx="16" cy="27" rx="2.5" ry="3.5" stroke="#b91c1c" strokeWidth="1.5" fill="#fffaf0" />
                              <ellipse cx="26" cy="27" rx="2.5" ry="3.5" stroke="#b91c1c" strokeWidth="1.5" fill="#fffaf0" />
                            </svg>
                          </div>

                          {/* Kanji Seal Ribbon */}
                          <div className="hanko-kanji-label">
                            <span>{def.jpName}</span>
                          </div>

                          {/* Hanko Texture Sheen */}
                          <div className="hanko-ink-texture" />
                        </div>
                      ) : (
                        <div className="washi-empty-prompt font-mono">
                          <span>// PENDING</span>
                        </div>
                      )}
                    </div>

                    {/* Slot Label beneath each circle (Exact font style of photo) */}
                    <div className="washi-slot-caption font-display">
                      <span className={isStamped ? 'caption-stamped' : ''}>{def.slotCode}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Prize Redemption Tray */}
        <div className="stamp-rally-rewards-panel">
          <div className="rewards-panel-header">
            <span className="rewards-header-tag font-mono">// CULTURAL PRIZE PACK REWARDS</span>
            <span className="rewards-stamp-counter font-mono">
              STAMPS: <strong>{stampsCollected.length}</strong> / 6
            </span>
          </div>

          <div className="rewards-cards-grid">
            {/* Prize 1: Kyoto Zen Sanctuary Theme (Unlocked at 3 Stamps) */}
            <div className={`reward-prize-card ${stampsCollected.length >= 3 ? 'eligible' : 'locked'} ${isKyotoUnlocked ? 'claimed' : ''}`}>
              <div className="prize-card-left">
                <div className="prize-swatch-cluster">
                  <span style={{ background: '#070b19' }} />
                  <span style={{ background: '#10b981' }} />
                  <span style={{ background: '#f43f5e' }} />
                </div>
                <div className="prize-info">
                  <span className="prize-name">Kyoto Zen Sanctuary Theme</span>
                  <span className="prize-sub">Reason 1: Temple scripture guardian tranquility</span>
                </div>
              </div>
              <div className="prize-card-right">
                {isKyotoUnlocked ? (
                  <span className="prize-status-pill unlocked">REDEEMED</span>
                ) : stampsCollected.length >= 3 ? (
                  <button 
                    type="button"
                    className="prize-redeem-btn"
                    onClick={() => onRedeemTheme('kyoto-zen')}
                  >
                    Redeem (3 Stamps)
                  </button>
                ) : (
                  <span className="prize-status-pill locked">3 Stamps Needed</span>
                )}
              </div>
            </div>

            {/* Prize 2: Maneki Fortune Gold Theme (Unlocked at 6 Stamps) */}
            <div className={`reward-prize-card ${stampsCollected.length >= 6 ? 'eligible' : 'locked'} ${isManekiUnlocked ? 'claimed' : ''}`}>
              <div className="prize-card-left">
                <div className="prize-swatch-cluster">
                  <span style={{ background: '#08080c' }} />
                  <span style={{ background: '#f59e0b' }} />
                  <span style={{ background: '#fbbf24' }} />
                </div>
                <div className="prize-info">
                  <span className="prize-name">Maneki Fortune Gold Theme + Exam Omamori</span>
                  <span className="prize-sub">Full Rally Grand Prize: Beckoning cat of good fortune</span>
                </div>
              </div>
              <div className="prize-card-right">
                {isManekiUnlocked ? (
                  <span className="prize-status-pill unlocked">REDEEMED</span>
                ) : stampsCollected.length >= 6 ? (
                  <button 
                    type="button"
                    className="prize-redeem-btn grand-prize"
                    onClick={() => onRedeemTheme('maneki-gold')}
                  >
                    Redeem Grand Prize (6 Stamps)
                  </button>
                ) : (
                  <span className="prize-status-pill locked">6 Stamps Needed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Lore Inspection Popover (if user clicks a collected stamp) */}
        {selectedStampLore && (
          <div className="stamp-lore-popover" onClick={() => setSelectedStampLore(null)}>
            <div className="stamp-lore-card" onClick={(e) => e.stopPropagation()}>
              <div className="lore-card-top">
                <span className="lore-reason-pill font-mono">{selectedStampLore.reasonTag}</span>
                <button type="button" className="lore-close-x" onClick={() => setSelectedStampLore(null)}>×</button>
              </div>
              <h3 className="lore-stamp-title">
                {selectedStampLore.jpName} • {selectedStampLore.enName}
              </h3>
              <p className="lore-stamp-text">
                {selectedStampLore.lore}
              </p>
              <button 
                type="button" 
                className="lore-confirm-btn" 
                onClick={() => setSelectedStampLore(null)}
              >
                Close Lore Scroll
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
