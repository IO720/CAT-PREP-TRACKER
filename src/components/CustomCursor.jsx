import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * CustomCursor - High-performance 120fps hardware-accelerated reticle cursor
 * Zero React re-renders on mousemove (pure direct GSAP manipulation)
 * Zero event-listener teardown/rebind cycling
 */
export default function CustomCursor({ activeTheme }) {
  const coreRef = useRef(null);
  const reticleRef = useRef(null);
  const modeRef = useRef('default'); // 'default' | 'target' | 'text'

  useEffect(() => {
    // Disable on touch devices or fine pointer absent
    const hasTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasTouch || !canHover) return;

    const core = coreRef.current;
    const reticle = reticleRef.current;
    if (!core || !reticle) return;

    // Ultra high-performance GSAP quickTo interpolation
    const setCoreX = gsap.quickTo(core, 'x', { duration: 0.05, ease: 'power3.out' });
    const setCoreY = gsap.quickTo(core, 'y', { duration: 0.05, ease: 'power3.out' });

    const setReticleX = gsap.quickTo(reticle, 'x', { duration: 0.18, ease: 'power3.out' });
    const setReticleY = gsap.quickTo(reticle, 'y', { duration: 0.18, ease: 'power3.out' });

    let isVisible = false;

    const applyModeAnimations = (newMode) => {
      if (modeRef.current === newMode) return;
      modeRef.current = newMode;

      if (newMode === 'target') {
        reticle.classList.add('target');
        reticle.classList.remove('text');
        core.classList.add('target');
        core.classList.remove('text');

        gsap.to(reticle, {
          scale: 1.35,
          rotate: 45,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        gsap.to(core, {
          scale: 0.65,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else if (newMode === 'text') {
        reticle.classList.add('text');
        reticle.classList.remove('target');
        core.classList.add('text');
        core.classList.remove('target');

        gsap.to(reticle, {
          scale: 0.7,
          rotate: 0,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        gsap.to(core, {
          scale: 1.2,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        reticle.classList.remove('target', 'text');
        core.classList.remove('target', 'text');

        gsap.to(reticle, {
          scale: 1,
          rotate: 0,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        gsap.to(core, {
          scale: 1,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    };

    const onMouseMove = (e) => {
      if (!isVisible) {
        gsap.to([core, reticle], { opacity: 1, duration: 0.18 });
        isVisible = true;
      }
      setCoreX(e.clientX);
      setCoreY(e.clientY);
      setReticleX(e.clientX);
      setReticleY(e.clientY);

      const target = e.target;
      if (!target) return;

      const isInteractive = target.closest(
        'button, a, input[type="submit"], input[type="button"], .btn-primary, .btn-secondary, ' +
        '.nav-link, .theme-option-item, .settings-theme-emblem-btn, .sidebar-toggle-btn, ' +
        '.stat-card, .metric-card, .theme-dropdown-trigger, .hub-badge-item, .clickable, ' +
        '.mock-test-item'
      );

      const isText = target.closest('input[type="text"], input[type="password"], input[type="email"], textarea, [contenteditable="true"]');

      if (isInteractive) {
        applyModeAnimations('target');
      } else if (isText) {
        applyModeAnimations('text');
      } else {
        applyModeAnimations('default');
      }
    };

    const onMouseDown = () => {
      gsap.to(reticle, { scale: 0.75, rotate: 45, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(core, { scale: 1.4, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
    };

    const onMouseUp = () => {
      const isTarget = modeRef.current === 'target';
      gsap.to(reticle, { 
        scale: isTarget ? 1.35 : 1, 
        rotate: isTarget ? 45 : 0, 
        duration: 0.28, 
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.to(core, { scale: 1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
    };

    const onMouseLeave = () => {
      gsap.to([core, reticle], { opacity: 0, duration: 0.18 });
      isVisible = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.body.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Central Laser Star Core */}
      <div 
        ref={coreRef} 
        className="focus-cursor-core" 
        style={{ opacity: 0 }}
      />

      {/* Precision Corner Brackets Targeting Reticle */}
      <div 
        ref={reticleRef} 
        className="focus-cursor-reticle" 
        style={{ opacity: 0 }}
      >
        <span className="reticle-corner top-left" />
        <span className="reticle-corner top-right" />
        <span className="reticle-corner bottom-left" />
        <span className="reticle-corner bottom-right" />
      </div>
    </>
  );
}
