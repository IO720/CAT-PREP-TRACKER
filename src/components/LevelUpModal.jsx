import React, { useEffect, useState } from 'react';
import { Icons } from './AspirantIcons';
import { 
  AnimatedSparkleIcon, 
  AnimatedCrownIcon, 
  AnimatedLightningIcon, 
  AnimatedTargetIcon,
  AnimatedShieldCheckIcon,
  AnimatedFlameIcon
} from './AnimatedUiIcons';
import { isMilestoneLevel, getMilestoneTitle, getUnlockedRewardsForLevel } from '../utils/expSystem';

export default function LevelUpModal({ 
  isOpen, 
  onClose, 
  oldLevel = 1, 
  newLevel = 2,
  totalExp = 0,
  isMilestone = false
}) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(true);
      // Clean, single acoustic chime (no frequency sliding or layered harmonics)
      try {
        if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const now = ctx.currentTime;

          // Pure single harmonic pitch - fixed frequency with zero sliding/warbling
          osc.type = isMilestone ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(isMilestone ? 587.33 : 880, now); // D5 (warm resonant) or A5 (pure crystal)

          // Natural bell-curve acoustic envelope: gentle instant attack, smooth exponential decay
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(isMilestone ? 0.16 : 0.12, now + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + (isMilestone ? 0.75 : 0.5));

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + (isMilestone ? 0.78 : 0.52));
        }
      } catch (e) {
        // AudioContext autoplay was blocked or unsupported
      }
    } else {
      setShowContent(false);
    }
  }, [isOpen, isMilestone]);

  if (!isOpen) return null;

  const milestone = isMilestone || isMilestoneLevel(newLevel);
  const unlockedRewards = getUnlockedRewardsForLevel(newLevel);
  const isMythic = newLevel >= 20 || (unlockedRewards && unlockedRewards.some(r => r.tier === 'MYTHIC'));
  const milestoneTitle = getMilestoneTitle(newLevel);

  return (
    <div 
      className="mock-modal-overlay level-up-modal-overlay" 
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div 
        className={`level-up-modal-box ${isMythic ? 'milestone-mythic-box' : milestone ? 'milestone-decade-box' : 'standard-level-box'} ${showContent ? 'modal-animate-in' : ''}`}
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decorative radiant particles for decade & mythic milestones */}
        {milestone && (
          <>
            <div className={`milestone-rays-fx ${isMythic ? 'mythic-rays' : ''}`} />
            <div className={`milestone-shimmer-ring ${isMythic ? 'mythic-shimmer' : ''}`} />
            <div className="milestone-confetti-wrap">
              {[...Array(14)].map((_, i) => (
                <span key={i} className={`milestone-particle particle-${i + 1} ${isMythic ? 'mythic-spark' : ''}`} />
              ))}
            </div>
          </>
        )}

        <div className="level-up-modal-header">
          {isMythic ? (
            <div className="milestone-badge-pill mythic-pill font-mono">
              <AnimatedCrownIcon size={14} color="#fb7185" />
              <span>MYTHIC PRESTIGE ASCENSION</span>
            </div>
          ) : milestone ? (
            <div className="milestone-badge-pill legendary-pill font-mono">
              <AnimatedCrownIcon size={14} color="#f59e0b" />
              <span>DECADE PRESTIGE MILESTONE</span>
            </div>
          ) : (
            <div className="standard-badge-pill font-mono">
              <AnimatedSparkleIcon size={14} color="#38bdf8" />
              <span>PROGRESSION ADVANCEMENT</span>
            </div>
          )}

          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <Icons.Close size={16} />
          </button>
        </div>

        {/* Central Level Badge Visual */}
        <div className="level-up-center-emblem">
          <div className={`level-ring-container ${isMythic ? 'ring-mythic' : milestone ? 'ring-milestone' : 'ring-standard'}`}>
            <div className="ring-pulse-aura" />
            <div className="level-number-wrap font-mono">
              <span className="level-prefix">LVL</span>
              <span className="level-digit">{newLevel}</span>
            </div>
          </div>

          <div className="level-transition-pill font-mono">
            <span className="old-level-tag">Level {oldLevel}</span>
            <Icons.ChevronRight size={13} />
            <span className="new-level-tag">Level {newLevel}</span>
          </div>

          <h2 className="level-up-title font-sans">
            {isMythic ? `Mythic Level ${newLevel} Achieved!` : milestone ? `Level ${newLevel} Achieved!` : `Promoted to Level ${newLevel}!`}
          </h2>

          <p className="level-up-subtitle">
            {isMythic ? (
              <>You conquered a monumental ascension tier! You have attained the mythic status of <strong className="mythic-prestige-name">{milestoneTitle}</strong>.</>
            ) : milestone ? (
              <>You conquered a major 10-level milestone! You have attained the prestige status of <strong className="milestone-prestige-name">{milestoneTitle}</strong>.</>
            ) : (
              <>Your dedicated practice and study momentum elevated your candidate clearance rank.</>
            )}
          </p>
        </div>

        {/* Unlocked Perks & Cosmetics Section */}
        {unlockedRewards.length > 0 && (
          <div className="unlocked-rewards-drawer">
            <div className="rewards-drawer-heading font-mono">
              <AnimatedLightningIcon size={13} color={isMythic ? '#fb7185' : milestone ? '#fbbf24' : '#38bdf8'} />
              <span>UNLOCKED CLEARANCE PERKS</span>
            </div>

            <div className="rewards-cards-grid">
              {unlockedRewards.map((rew, idx) => {
                const tier = rew.tier?.toLowerCase() || 'common';
                const tierColor = rew.tier === 'MYTHIC' ? '#fb7185' : rew.tier === 'LEGENDARY' ? '#fbbf24' : rew.tier === 'EPIC' ? '#c084fc' : '#38bdf8';

                return (
                  <div key={idx} className={`reward-unlock-card tier-card-${tier}`}>
                    <div className="reward-card-left">
                      <div className="reward-card-icon">
                        {rew.type === 'frame' ? (
                          <AnimatedShieldCheckIcon size={18} color={tierColor} />
                        ) : rew.type === 'banner' ? (
                          <AnimatedSparkleIcon size={18} color={tierColor} />
                        ) : (
                          <AnimatedCrownIcon size={18} color={tierColor} />
                        )}
                      </div>
                      <span className="reward-item-name font-mono" title={rew.name}>{rew.name}</span>
                    </div>
                    <span className={`reward-tier-badge tier-badge-${tier} font-mono`}>{rew.tier}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="level-up-footer-action">
          <button 
            type="button" 
            className={`btn-claim-level ${isMythic ? 'btn-milestone-mythic' : milestone ? 'btn-milestone-gold' : 'btn-standard-cyan'}`}
            onClick={onClose}
          >
            <AnimatedTargetIcon size={16} color={isMythic ? '#ffffff' : milestone ? '#000000' : '#ffffff'} />
            <span>{isMythic ? 'Claim Mythic Ascension' : milestone ? 'Claim Milestone Prestige' : 'Continue Preparation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
