import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileView from '../ProfileView';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {}
    };
  };
});

describe('ProfileView Featured Achievements Showcase', () => {
  const dummyTracker = {
    'Month 1': [
      {
        week: 'Week 1',
        days: [
          { day: 'Day 1', quantCount: 10, quantCompleted: true, lrdiCount: 5, lrdiCompleted: true, varcCount: 5, varcCompleted: true }
        ]
      }
    ]
  };

  const dummyProfile = {
    displayName: 'Phantom Strike',
    target: 'CAT 99.9%ile',
    avatar: 'rocket',
    frameId: 'neon_cyber',
    bannerId: 'cyber_grid',
    showcaseBadgeIds: ['streak-1', 'solved-10', 'streak-3']
  };

  it('renders ProfileView without crashing and mounts the Featured Achievements Showcase', () => {
    const { container } = render(
      <ProfileView
        user={{ uid: 'test-user-123', email: 'operative@prep.io', displayName: 'Phantom Strike' }}
        userProfile={dummyProfile}
        tracker={dummyTracker}
        mocks={[]}
        friends={[]}
      />
    );

    // Check that the profile rendered successfully without TDZ ReferenceError
    expect(container).toBeDefined();

    // Check Featured Achievements Showcase header is present
    expect(screen.getByText(/Featured Achievements Showcase/i)).toBeDefined();

    // Check that 3-4 featured showcase items are rendered
    const showcaseCards = container.querySelectorAll('.featured-showcase-card');
    expect(showcaseCards.length).toBeGreaterThanOrEqual(3);
    expect(showcaseCards.length).toBeLessThanOrEqual(4);

    // Check that Select button is present
    const customizeBtn = screen.getByTitle(/Choose which 3-4 badges to showcase/i);
    expect(customizeBtn).toBeDefined();
  });

  it('opens customize showcase modal and allows toggling badges within 3-4 limit', () => {
    const { container } = render(
      <ProfileView
        user={{ uid: 'test-user-123', email: 'operative@prep.io', displayName: 'Phantom Strike' }}
        userProfile={dummyProfile}
        tracker={dummyTracker}
        mocks={[]}
        friends={[]}
      />
    );

    // Open showcase customization modal
    const customizeBtn = screen.getByTitle(/Choose which 3-4 badges to showcase/i);
    fireEvent.click(customizeBtn);

    // Verify modal appears
    expect(screen.getByText(/Select Featured Achievements/i)).toBeDefined();
    expect(screen.getByText(/Confirm & Display Showcase/i)).toBeDefined();

    // Check picker items
    const pickerItems = container.querySelectorAll('.showcase-picker-item');
    expect(pickerItems.length).toBeGreaterThan(5);

    // Click to confirm
    const confirmBtn = screen.getByText(/Confirm & Display Showcase/i);
    fireEvent.click(confirmBtn);

    // Modal closes
    expect(screen.queryByText(/Select Featured Achievements/i)).toBeNull();
  });

  it('defaults new users strictly to Level 1 and 0 EXP rather than Level 4', () => {
    const newProfile = {
      displayName: 'New Candidate',
      target: 'CAT 2026',
      avatar: 'rocket',
      // No exp or level property yet (fresh user)
    };

    render(
      <ProfileView
        user={{ uid: 'new-user-001', email: 'candidate@prep.io', displayName: 'New Candidate' }}
        userProfile={newProfile}
        tracker={dummyTracker}
        mocks={[]}
        friends={[]}
      />
    );

    // Profile card should strictly show Level 1
    expect(screen.getByText('LVL 1')).toBeDefined();
    expect(screen.getByText(/LEVEL 1 PROGRESSION/i)).toBeDefined();
    expect(screen.getByText(/0 \/ 179 XP/i)).toBeDefined();
  });

  it('enforces frame unlock requirements and prevents equipping Level 3 frame at Level 1', () => {
    const level1ProfileWithLockedFrame = {
      displayName: 'Novice Aspirant',
      target: 'CAT 2026',
      avatar: 'rocket',
      level: 1,
      exp: 0,
      frameId: 'neon_cyber' // Requires Level 3
    };

    const { container } = render(
      <ProfileView
        user={{ uid: 'novice-001', email: 'novice@prep.io', displayName: 'Novice Aspirant' }}
        userProfile={level1ProfileWithLockedFrame}
        tracker={dummyTracker}
        mocks={[]}
        friends={[]}
      />
    );

    // Profile card avatar should render the unlocked Level 1 default frame, not neon_cyber
    const avatarContainer = container.querySelector('.aspirant-avatar-container');
    expect(avatarContainer).toBeDefined();
    expect(avatarContainer.classList.contains('frame-default')).toBe(true);
    expect(avatarContainer.classList.contains('frame-neon_cyber')).toBe(false);
  });

  it('renders the streamlined Edit Aspirant Profile modal with 3 tabs and uniform cards', () => {
    const { container } = render(
      <ProfileView
        user={{ uid: 'test-user-123', email: 'operative@prep.io', displayName: 'Phantom Strike' }}
        userProfile={dummyProfile}
        tracker={dummyTracker}
        mocks={[]}
        friends={[]}
        isEditOpen={true}
      />
    );

    // Check modal title and live preview
    expect(screen.getByText('Edit Aspirant Profile')).toBeDefined();
    expect(screen.getByText('LIVE PREVIEW')).toBeDefined();

    // Check 3 tabs are present
    expect(screen.getByText(/Avatar & Frames/i)).toBeDefined();
    expect(screen.getByText(/Animated Banners/i)).toBeDefined();
    expect(screen.getByText(/Identity & Goals/i)).toBeDefined();

    // Tab 1 (Avatar & Frames) active by default: 8 presets and 7 frames
    const presetTiles = container.querySelectorAll('.avatar-preset-tile');
    expect(presetTiles.length).toBe(8);

    const frameCards = container.querySelectorAll('.cosmetic-frame-card-v2');
    expect(frameCards.length).toBe(7);

    // Switch to Tab 2 (Animated Banners)
    const bannerTabBtn = screen.getByText(/Animated Banners/i);
    fireEvent.click(bannerTabBtn);

    const bannerCards = container.querySelectorAll('.cosmetic-banner-card-v2');
    expect(bannerCards.length).toBe(7);

    // Switch to Tab 3 (Identity & Goals)
    const identityTabBtn = screen.getByText(/Identity & Goals/i);
    fireEvent.click(identityTabBtn);

    expect(screen.getByText(/Display Name/i)).toBeDefined();
    expect(screen.getByText(/Handle \/ Username/i)).toBeDefined();
    expect(screen.getByText(/Aspirant Bio & Strategy Notes/i)).toBeDefined();
  });
});


