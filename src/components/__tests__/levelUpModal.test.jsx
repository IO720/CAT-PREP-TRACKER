import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LevelUpModal from '../LevelUpModal';

describe('LevelUpModal Component', () => {
  it('renders standard promotion modal with clearance perks', () => {
    const handleClose = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        oldLevel={1}
        newLevel={3}
        totalExp={380}
        isMilestone={false}
      />
    );

    expect(screen.getByText(/Promoted to Level 3!/i)).toBeTruthy();
    expect(screen.getByText(/PROGRESSION ADVANCEMENT/i)).toBeTruthy();
    expect(screen.getByText(/Electric Gyro Frame/i)).toBeTruthy();

    const continueBtn = screen.getByRole('button', { name: /Continue Preparation/i });
    fireEvent.click(continueBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders Decade Milestone celebration for Level 10 with prestige fanfare', () => {
    const handleClose = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        oldLevel={9}
        newLevel={10}
        totalExp={3500}
        isMilestone={true}
      />
    );

    expect(screen.getByText(/DECADE PRESTIGE MILESTONE/i)).toBeTruthy();
    expect(screen.getByText(/Level 10 Achieved!/i)).toBeTruthy();
    expect(screen.getAllByText(/Elite Strategist/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Solar Plasma Corona Banner/i)).toBeTruthy();

    const claimBtn = screen.getByRole('button', { name: /Claim Milestone Prestige/i });
    fireEvent.click(claimBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <LevelUpModal
        isOpen={false}
        onClose={() => {}}
        oldLevel={1}
        newLevel={2}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
