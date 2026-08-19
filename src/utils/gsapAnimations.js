import gsap from 'gsap';

/**
 * Animate container children with a silky GSAP stagger entrance.
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} options - Custom animation options
 */
export function animatePageEntrance(container, options = {}) {
  if (!container) return;

  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  // Find direct sections or cards to stagger
  const targets = el.querySelectorAll(
    '.page-title, .page-subtitle, .stat-card, .metric-card, .dashboard-banner, ' +
    '.study-plan-card, .mock-test-item, .achievement-card, .settings-card-container, ' +
    '.arena-leaderboard-card, .study-lounge-banner, .tracker-grid-wrapper, .view-stagger-item'
  );

  if (targets.length > 0) {
    gsap.fromTo(
      targets,
      {
        opacity: 0,
        y: 18,
        scale: 0.985
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: options.duration || 0.45,
        stagger: options.stagger || 0.04,
        ease: options.ease || 'power3.out',
        clearProps: 'transform,opacity',
        overwrite: 'auto'
      }
    );
  } else {
    // Fallback: smooth fade in for whole container
    gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' }
    );
  }
}

/**
 * Attaches magnetic physics to buttons and interactive tags.
 * The element subtly follows the mouse cursor with spring damping.
 * @param {HTMLElement} element 
 * @param {number} strength - Damping multiplier (default: 0.28)
 */
export function makeMagnetic(element, strength = 0.28) {
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
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const onMouseLeave = () => {
    bounds = null;
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.6,
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
    { scale: 0.85, rotate: -12 },
    {
      scale: 1,
      rotate: 0,
      duration: 0.5,
      ease: 'elastic.out(1.3, 0.35)',
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
