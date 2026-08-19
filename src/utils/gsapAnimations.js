import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initializes scroll clip-cut triggers and refreshes layout without any container fade/translation.
 * @param {HTMLElement|string} container - Container element or selector
 */
export function animatePageEntrance(container) {
  if (typeof window === 'undefined') return;
  // Initialize scroll clip-cut reveals for below-the-fold elements
  initClipCutScrollAnimations();
  ScrollTrigger.refresh();
}

/**
 * Scroll-triggered diagonal clip-cut reveals for elements as the user scrolls down.
 * Provides a unique, futuristic, and smooth aesthetic.
 */
export function initClipCutScrollAnimations() {
  if (typeof window === 'undefined') return;

  // Select below-the-fold cards, charts, and content blocks
  const targets = document.querySelectorAll(
    '.stat-card, .metric-card, .study-plan-card, .mock-test-item, ' +
    '.arena-leaderboard-card, .study-lounge-banner, .settings-card-container, ' +
    '.achievement-card, .tracker-grid-wrapper, .dashboard-banner, .buddy-card, ' +
    '.syllabus-progress-card, .focus-breakdown-card, .distribution-card'
  );

  targets.forEach((target) => {
    // Prevent duplicate triggers
    if (target.dataset.clipCutActive) return;

    // Check if target is already visible in viewport
    const rect = target.getBoundingClientRect();
    const isAboveFold = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;

    if (isAboveFold) {
      // Keep immediately visible without blocking initial view
      target.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
      target.style.opacity = '1';
      target.dataset.clipCutActive = 'done';
      return;
    }

    target.dataset.clipCutActive = 'pending';

    gsap.fromTo(
      target,
      {
        clipPath: 'polygon(0% 12%, 100% 0%, 100% 0%, 0% 12%)',
        opacity: 0,
        y: 32
      },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        opacity: 1,
        y: 0,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: target,
          start: 'top 92%',
          toggleActions: 'play none none none',
          once: true,
          onEnter: () => {
            target.dataset.clipCutActive = 'done';
          }
        }
      }
    );
  });
}

/**
 * Attaches magnetic physics to buttons and interactive tags.
 * The element subtly follows the mouse cursor with spring damping.
 * @param {HTMLElement} element 
 * @param {number} strength - Damping multiplier (default: 0.24)
 */
export function makeMagnetic(element, strength = 0.24) {
  if (!element) return () => {};

  let bounds = null;

  const onMouseEnter = () => {
    bounds = element.getBoundingClientRect();
  };

  const onMouseMove = (e) => {
    if (!bounds) bounds = element.getBoundingClientRect();
    const x = e.clientX - (bounds.left + bounds.width / 2);
    const y = e.clientY - (bounds.top + bounds.height / 2);

    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const onMouseLeave = () => {
    bounds = null;
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1.1, 0.4)',
      overwrite: 'auto'
    });
  };

  element.addEventListener('mouseenter', onMouseEnter);
  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', onMouseEnter);
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}

/**
 * Plays a high-voltage spring pop on an SVG icon when clicked or hovered.
 * @param {SVGElement|HTMLElement} iconEl 
 */
export function pulseIcon(iconEl) {
  if (!iconEl) return;
  gsap.fromTo(
    iconEl,
    { scale: 0.88, rotate: -8 },
    {
      scale: 1,
      rotate: 0,
      duration: 0.45,
      ease: 'elastic.out(1.2, 0.35)',
      overwrite: 'auto'
    }
  );
}

/**
 * Glint / ripple wave on theme switch.
 */
export function triggerThemeWave() {
  const overlay = document.createElement('div');
  overlay.className = 'theme-transition-wave-overlay';
  document.body.appendChild(overlay);

  gsap.fromTo(
    overlay,
    { opacity: 0.45, scale: 0.8 },
    {
      opacity: 0,
      scale: 1.3,
      duration: 0.65,
      ease: 'power2.out',
      onComplete: () => overlay.remove()
    }
  );
}
