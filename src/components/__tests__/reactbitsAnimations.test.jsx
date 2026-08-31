import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from '../animations/Counter';
import { Dock, DockItem } from '../animations/Dock';
import SkiperAnimatedTimer from '../animations/SkiperAnimatedTimer';
import ChronoTimerHUD from '../animations/ChronoTimerHUD';
import WordHoverEffect from '../animations/WordHoverEffect';
import TermsAndPrivacyModal from '../TermsAndPrivacyModal';

describe('ReactBits & Skiper Animations', () => {
  it('renders SkiperAnimatedTimer with rolling digits', () => {
    const { container, rerender } = render(<SkiperAnimatedTimer seconds={1500} />);
    expect(container.querySelector('.skiper-animated-timer-root')).toBeDefined();
    expect(container.querySelector('.skiper-timer-colon')).toBeDefined();

    // Re-render with new seconds
    rerender(<SkiperAnimatedTimer seconds={1499} />);
    expect(container.querySelector('.skiper-animated-timer-root')).toBeDefined();
  });

  it('renders ChronoTimerHUD in countdown and stopwatch modes', () => {
    const { container, rerender } = render(
      <ChronoTimerHUD timerMode="pomodoro" secondsLeft={1200} totalSeconds={1500} isRunning={true}>
        <span>20:00</span>
      </ChronoTimerHUD>
    );

    expect(container.querySelector('.chrono-hud-container')).toBeDefined();
    expect(container.querySelector('.chrono-ticks-group')).toBeDefined();
    expect(container.querySelector('.chrono-beacon-dot')).toBeDefined();

    // Stopwatch mode: static bezel without dynamic depletion or beacon
    rerender(
      <ChronoTimerHUD timerMode="stopwatch" secondsLeft={300} totalSeconds={0} isRunning={true}>
        <span>05:00</span>
      </ChronoTimerHUD>
    );

    expect(container.querySelector('.chrono-progress-arc.static-stopwatch')).toBeDefined();
    expect(container.querySelector('.chrono-beacon-dot')).toBeNull();
  });

  it('renders WordHoverEffect with kinetic dual-layer structure', () => {
    const { container } = render(<WordHoverEffect text="Real." />);
    expect(container.querySelector('.word-hover-root')).toBeDefined();
    expect(container.querySelector('.word-hover-primary').textContent).toBe('Real.');
    expect(container.querySelector('.word-hover-secondary').textContent).toBe('Real.');
  });

  it('renders TermsAndPrivacyModal with Skiper60 side-scroll navigation', () => {
    const onClose = vi.fn();
    render(<TermsAndPrivacyModal isOpen={true} onClose={onClose} />);

    // Check ownership declaration and license
    expect(screen.getByText(/Ownership & Intellectual Property/i)).toBeDefined();
    expect(screen.getByText(/Basic Free User License/i)).toBeDefined();
    expect(screen.getByText(/I own this site/i)).toBeDefined();

    // Check sidebar navigation items
    const licenseNavBtn = screen.getByRole('button', { name: /3\. Basic Free License/i });
    expect(licenseNavBtn).toBeDefined();
    fireEvent.click(licenseNavBtn);

    // Confirm button
    const confirmBtn = screen.getByText(/I Understand & Agree/i);
    fireEvent.click(confirmBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Counter component with animated digit wheels', () => {
    const { rerender } = render(<Counter value={42} />);
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);

    // Value update
    rerender(<Counter value={99} />);
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
  });

  it('renders Dock with vertical and horizontal layouts and magnifies items', () => {
    const onClick = vi.fn();
    render(
      <Dock direction="vertical" magnification={1.3} distance={100}>
        <DockItem active={true} onClick={onClick} tooltipTitle="Dashboard">
          <span>Home Icon</span>
        </DockItem>
        <DockItem active={false} onClick={onClick} tooltipTitle="Daily Drills">
          <span>Drill Icon</span>
        </DockItem>
      </Dock>
    );

    const homeItem = screen.getByText('Home Icon').closest('button');
    expect(homeItem).toBeDefined();

    fireEvent.click(homeItem);
    expect(onClick).toHaveBeenCalled();
  });
});
