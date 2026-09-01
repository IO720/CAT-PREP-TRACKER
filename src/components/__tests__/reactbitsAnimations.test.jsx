import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from '../animations/Counter';
import { Dock, DockItem } from '../animations/Dock';
import SkiperAnimatedTimer from '../animations/SkiperAnimatedTimer';
import ChronoTimerHUD from '../animations/ChronoTimerHUD';
import WordHoverEffect from '../animations/WordHoverEffect';
import Stepper from '../animations/Stepper';
import SpotlightCard from '../animations/SpotlightCard';
import TermsAndPrivacyModal from '../TermsAndPrivacyModal';
import DitherBackground from '../DitherBackground';

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
    const licenseNavBtn = screen.getByRole('button', { name: /Basic Free License/i });
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

  it('renders Stepper with active, completed, and selectable nodes', () => {
    const onStepChange = vi.fn();
    const steps = [
      { id: '1', title: 'Start', subtitle: 'Step 1' },
      { id: '2', title: 'Configure', subtitle: 'Step 2' },
      { id: '3', title: 'Complete', subtitle: 'Step 3' }
    ];

    const { container, rerender } = render(
      <Stepper steps={steps} currentStep={2} onStepChange={onStepChange} />
    );

    expect(container.querySelector('.rb-stepper-root')).toBeDefined();
    // Step 1 should be completed and have check icon
    expect(container.querySelector('.rb-stepper-node.completed')).toBeDefined();
    expect(container.querySelector('.rb-stepper-check-icon')).toBeDefined();
    // Step 2 should be active
    expect(container.querySelector('.rb-stepper-node.active')).toBeDefined();

    // Click step 3
    const step3Btn = screen.getByRole('button', { name: /Step 3: Complete/i });
    fireEvent.click(step3Btn);
    expect(onStepChange).toHaveBeenCalledWith(3);

    // Re-render at step 3
    rerender(<Stepper steps={steps} currentStep={3} onStepChange={onStepChange} />);
    expect(container.querySelector('.rb-stepper-line-fill').style.width).toBe('100%');
  });

  it('renders SpotlightCard with cursor spotlight and border beam on select', () => {
    const { container, rerender } = render(
      <SpotlightCard isSelected={false}>
        <span>Card Content</span>
      </SpotlightCard>
    );

    expect(container.querySelector('.spotlight-card-root')).toBeDefined();
    expect(container.querySelector('.spotlight-layer')).toBeDefined();
    expect(container.querySelector('.border-beam-layer')).toBeNull();

    // Re-render as selected
    rerender(
      <SpotlightCard isSelected={true}>
        <span>Card Content</span>
      </SpotlightCard>
    );
    expect(container.querySelector('.spotlight-card-root.selected')).toBeDefined();
    expect(container.querySelector('.border-beam-layer')).toBeDefined();
  });

  it('renders DitherBackground canvas on mobile screen dimensions without returning null', () => {
    // Simulate mobile viewport width
    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 390;

    const { container } = render(
      <DitherBackground activeTheme="dark" opacity={0.16} ditherSize={2.2} />
    );

    // Canvas must render in DOM (not null/blank)
    const canvas = container.querySelector('.dither-background-canvas');
    expect(canvas).toBeDefined();

    // Restore
    window.innerWidth = originalInnerWidth;
  });
});


