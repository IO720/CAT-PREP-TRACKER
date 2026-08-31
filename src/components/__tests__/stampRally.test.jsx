import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JapaneseCatStampRallyModal, { STAMP_DEFINITIONS } from '../JapaneseCatStampRallyModal';
import DailyQuotaCelebrationModal from '../DailyQuotaCelebrationModal';
import { 
  getStampRallyData, 
  awardDailyQuotaStamp, 
  redeemStampReward, 
  saveStampRallyData 
} from '../../utils/stampRallyStorage';
import { isThemeUnlocked } from '../../utils/themeRedemption';

describe('Japanese Cat Stamp Rally & Washi Paper Card System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the washi-paper stamp rally card with 6 slots and Hanko ink seal when stamped', () => {
    const onClose = vi.fn();
    const onRedeemTheme = vi.fn();

    const mockData = {
      totalStamps: 3,
      currentCardStamps: ['zen-neko', 'maneki-neko', 'tokai-neko'],
      redeemedThemes: [],
      completedCards: 0
    };

    render(
      <JapaneseCatStampRallyModal
        isOpen={true}
        onClose={onClose}
        stampRallyData={mockData}
        onRedeemTheme={onRedeemTheme}
      />
    );

    // Title and Japanese header
    expect(screen.getByText('YOKAI MASCOTS STAMP RALLY')).toBeDefined();
    expect(screen.getByText(/NEKO STAMP RALLY/i)).toBeDefined();

    // 6 slot captions
    expect(screen.getByText('ZEN NEKO J101')).toBeDefined();
    expect(screen.getByText('MANEKI NEKO J102')).toBeDefined();
    expect(screen.getByText('TOKAI NEKO J103')).toBeDefined();
    expect(screen.getByText('RONIN NEKO J104')).toBeDefined();
    expect(screen.getByText('TORII NEKO J105')).toBeDefined();
    expect(screen.getByText('COMPLETE')).toBeDefined();

    // Stamped Japanese kanji seals
    expect(screen.getByText('禅猫')).toBeDefined();
    expect(screen.getByText('招き猫')).toBeDefined();
    expect(screen.getByText('都会猫')).toBeDefined();

    // Prize redemption tray (3 stamps collected makes Kyoto Zen eligible)
    const redeemBtn = screen.getByText('Redeem (3 Stamps)');
    expect(redeemBtn).toBeDefined();
    fireEvent.click(redeemBtn);
    expect(onRedeemTheme).toHaveBeenCalledWith('kyoto-zen');
  });

  it('allows clicking a collected stamp slot to open the cultural lore scroll', () => {
    const mockData = {
      totalStamps: 1,
      currentCardStamps: ['zen-neko'],
      redeemedThemes: [],
      completedCards: 0
    };

    render(
      <JapaneseCatStampRallyModal
        isOpen={true}
        onClose={vi.fn()}
        stampRallyData={mockData}
        onRedeemTheme={vi.fn()}
      />
    );

    // Click the stamped slot
    const stampedSlot = screen.getByTitle(/Click to inspect Temple Scripture Guardian Lore/i);
    fireEvent.click(stampedSlot);

    // Lore scroll pops up with reason tag and history from article
    expect(screen.getByText('Reason 1: Temple Guardian')).toBeDefined();
    expect(screen.getByText(/Buddhist monks kept cats in Japanese temples to protect sacred sutras/i)).toBeDefined();

    // Close lore
    const closeLoreBtn = screen.getByText('Close Lore Scroll');
    fireEvent.click(closeLoreBtn);
    expect(screen.queryByText('Reason 1: Temple Guardian')).toBeNull();
  });

  it('awardDailyQuotaStamp increments stamp count and rolls over after 6 stamps', () => {
    // Stamp day 1
    const res1 = awardDailyQuotaStamp('2026-09-01', 'Monday');
    expect(res1.newStampAwarded).toBe(true);
    expect(res1.stampDef.id).toBe('zen-neko');
    expect(res1.updatedData.totalStamps).toBe(1);
    expect(res1.updatedData.currentCardStamps).toEqual(['zen-neko']);

    // Fill the remaining 5 stamps
    for (let i = 2; i <= 6; i++) {
      awardDailyQuotaStamp(`2026-09-0${i}`, `Day ${i}`);
    }

    const completed = getStampRallyData();
    expect(completed.totalStamps).toBe(6);
    expect(completed.currentCardStamps.length).toBe(6);

    // Redeeming Kyoto Zen Sanctuary Theme
    const redeemRes = redeemStampReward('kyoto-zen');
    expect(redeemRes.success).toBe(true);
    expect(isThemeUnlocked('kyoto-zen')).toBe(true);

    // Redeeming Maneki Fortune Gold Theme
    const redeemGold = redeemStampReward('maneki-gold');
    expect(redeemGold.success).toBe(true);
    expect(isThemeUnlocked('maneki-gold')).toBe(true);
  });

  it('DailyQuotaCelebrationModal provides Stamp My Japanese Rally Card action button', () => {
    const onOpenStampRally = vi.fn();
    const onClose = vi.fn();

    render(
      <DailyQuotaCelebrationModal
        isOpen={true}
        onClose={onClose}
        dayName="Monday"
        activeStreak={3}
        totalSolvedToday={30}
        onOpenStampRally={onOpenStampRally}
      />
    );

    const stampBtn = screen.getByText('Stamp My Japanese Rally Card');
    expect(stampBtn).toBeDefined();

    fireEvent.click(stampBtn);
    expect(onOpenStampRally).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
