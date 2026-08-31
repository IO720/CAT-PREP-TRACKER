import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyQuotaCelebrationModal from '../DailyQuotaCelebrationModal';
import SadCatGuiltTripModal from '../SadCatGuiltTripModal';

describe('Cat Mascot Quota Celebration & Exit Modes', () => {
  it('renders DailyQuotaCelebrationModal with proud cat mascot and animated heatmap stamp', () => {
    const onClose = vi.fn();
    render(
      <DailyQuotaCelebrationModal
        isOpen={true}
        onClose={onClose}
        dayName="Monday (Aug 31)"
        activeStreak={5}
        totalSolvedToday={26}
      />
    );

    // Achievement badge
    expect(screen.getByText('3 / 3 DAILY QUOTAS CONQUERED')).toBeDefined();

    // Pride and discipline message
    expect(screen.getByText('I Am Incredibly Proud of You!')).toBeDefined();
    expect(screen.getByText(/Monday \(Aug 31\)/i)).toBeDefined();
    expect(screen.getByText(/transforms you into a sharper mind and a more resilient person/i)).toBeDefined();

    // Study Heatmap stamping section
    expect(screen.getByText('Study Contribution Heatmap')).toBeDefined();
    expect(screen.getByText('5-Day Streak Active')).toBeDefined();
    expect(screen.getByText(/Level 4 Max Contribution/i)).toBeDefined();

    // Action button
    const claimBtn = screen.getByText('Claim Victory & Continue');
    fireEvent.click(claimBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('SadCatGuiltTripModal shows Happy Cat when quota is completed and allows leaving with "See You Tomorrow!"', () => {
    const onStay = vi.fn();
    const onLeave = vi.fn();

    render(
      <SadCatGuiltTripModal
        isOpen={true}
        onStay={onStay}
        onLeave={onLeave}
        activeStreak={7}
        subject="Quant"
        secondsLeft={0}
        isRunning={false}
        isQuotaCompleted={true}
      />
    );

    // Happy Badge & Title
    expect(screen.getByText('DAILY QUOTA CONQUERED')).toBeDefined();
    expect(screen.getByText('Magnificent Work Today, Scholar!')).toBeDefined();
    expect(screen.getByText(/Rest up, and I'll see you tomorrow!/i)).toBeDefined();

    // "See You Tomorrow!" button
    const leaveBtn = screen.getByText(/See You Tomorrow! \(Rest Earned\)/i);
    fireEvent.click(leaveBtn);
    expect(onLeave).toHaveBeenCalled();
  });

  it('SadCatGuiltTripModal shows Sad Cat guilt trip when quota is incomplete', () => {
    const onStay = vi.fn();
    const onLeave = vi.fn();

    render(
      <SadCatGuiltTripModal
        isOpen={true}
        onStay={onStay}
        onLeave={onLeave}
        activeStreak={7}
        subject="Quant"
        secondsLeft={600}
        isRunning={true}
        isQuotaCompleted={false}
      />
    );

    // Focus Breach Warning & Title
    expect(screen.getByText('FOCUS BREACH WARNING')).toBeDefined();
    expect(screen.getByText(/Wait... You're really leaving\?!/i)).toBeDefined();
    expect(screen.getByText(/abandon our session for distractions\?/i)).toBeDefined();

    // Stay button
    const stayBtn = screen.getByText(/Stay & Lock In! \(I won't give up\)/i);
    fireEvent.click(stayBtn);
    expect(onStay).toHaveBeenCalled();
  });
});
