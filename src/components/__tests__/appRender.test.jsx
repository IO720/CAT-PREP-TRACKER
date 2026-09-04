import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';

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

import App from '../../App';

describe('App Root Render Test', () => {
  it('renders App without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('renders logo in top bar and dock as a floating overlay without logo', () => {
    localStorage.setItem('catalyze_guest_mode', 'true');
    const { container } = render(<App />);
    
    // Logo is in the top bar header
    const headerLogo = container.querySelector('.header-logo-badge');
    expect(headerLogo).toBeDefined();
    expect(headerLogo).not.toBeNull();

    // Dock is a floating overlay dock with drag handle
    const dock = container.querySelector('.sidebar.floating-overlay-dock');
    expect(dock).toBeDefined();
    expect(dock).not.toBeNull();

    // Dock contains drag handle
    const dragHandle = dock.querySelector('.dock-drag-handle');
    expect(dragHandle).toBeDefined();
    expect(dragHandle).not.toBeNull();

    // Dock does NOT contain brand-section / logo
    const dockBrandSection = dock.querySelector('.brand-section');
    expect(dockBrandSection).toBeNull();
  });

  it('renders timer tab without crashing when activeTab is timer', async () => {
    localStorage.setItem('catalyze_guest_mode', 'true');
    const { container } = render(<App />);
    const timerDockItem = container.querySelector('[aria-label="Focus & Study Timer"]');
    if (timerDockItem) {
      timerDockItem.click();
    }
  });

  it('renders StudyTimerView directly without error', async () => {
    const { default: StudyTimerView } = await import('../StudyTimerView');
    const timerState = {
      secondsLeft: 25 * 60,
      totalSeconds: 25 * 60,
      isRunning: false,
      isPaused: false,
      mode: 'pomodoro',
      subject: 'Quant',
      startTimeStr: null,
      sessionNotes: ''
    };
    const { container } = render(
      <StudyTimerView
        timerState={timerState}
        todaySessions={[]}
        todayTotalHours={0}
        theme="dark"
        friends={[]}
        activeStreak={1}
        todayDay={{}}
        activeWeekDays={[]}
        activeWeekName="Week 1"
        onOpenNotes={() => {}}
        onLeaveTimer={() => {}}
      />
    );
    expect(container).toBeDefined();
    expect(container.querySelector('.study-timer-minimal-container')).not.toBeNull();
  });
});
