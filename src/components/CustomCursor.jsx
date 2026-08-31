import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

/**
 * CustomCursor - TargetCursor
 * Inspired by React Bits (https://reactbits.dev/animations/target-cursor)
 * High-performance 120fps hardware-accelerated target-locking reticle cursor.
 * Features 4 precision animated corner brackets that track movement and smoothly "lock"
 * onto interactive target elements across the UI, accurately calculating element edges.
 */
export default function CustomCursor({ activeTheme }) {
  const coreRef = useRef(null);
  const reticleRef = useRef(null);
  const modeRef = useRef('default'); // 'default' | 'target' | 'text'
  const isLockedRef = useRef(false);
  const currentTargetRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices or fine pointer absent
    const hasTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasTouch || !canHover) return;

    const core = coreRef.current;
    const reticle = reticleRef.current;
    if (!core || !reticle) return;

    // Center both elements directly on the mouse pointer tip
    gsap.set([core, reticle], { xPercent: -50, yPercent: -50 });

    // GSAP quickTo interpolation for lag-free 120fps tracking
    const setCoreX = gsap.quickTo(core, 'x', { duration: 0.05, ease: 'power3.out' });
    const setCoreY = gsap.quickTo(core, 'y', { duration: 0.05, ease: 'power3.out' });

    const setReticleX = gsap.quickTo(reticle, 'x', { duration: 0.16, ease: 'power3.out' });
    const setReticleY = gsap.quickTo(reticle, 'y', { duration: 0.16, ease: 'power3.out' });

    let isVisible = false;

    const lockOntoTarget = (targetElement) => {
      const rect = targetElement.getBoundingClientRect();
      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;

      // Check if element is excessively large (like an entire page card)
      if (rect.width > 550 || rect.height > 160) {
        isLockedRef.current = false;
        reticle.classList.add('target');
        reticle.classList.remove('target-locked');
        gsap.to(reticle, {
          width: 36,
          height: 36,
          borderRadius: 6,
          scale: 1.15,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        return;
      }

      isLockedRef.current = true;
      currentTargetRef.current = targetElement;
      reticle.classList.add('target-locked');
      reticle.classList.remove('text');
      core.classList.add('target');

      // Edge-accurate target lock: 6px horizontal padding, 5px vertical padding
      const padX = 7;
      const padY = 5;
      const targetW = Math.round(rect.width + padX * 2);
      const targetH = Math.round(rect.height + padY * 2);

      const computedStyle = window.getComputedStyle(targetElement);
      const rawRadius = parseInt(computedStyle.borderRadius, 10);
      const cornerRadius = !isNaN(rawRadius) && rawRadius > 0 ? Math.min(rawRadius + 2, 24) : 8;

      setReticleX(targetCenterX);
      setReticleY(targetCenterY);

      gsap.to(reticle, {
        width: targetW,
        height: targetH,
        borderRadius: cornerRadius,
        scale: 1,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      gsap.to(core, {
        scale: 0.5,
        opacity: 0.35,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const unlockTarget = () => {
      isLockedRef.current = false;
      currentTargetRef.current = null;
      reticle.classList.remove('target-locked', 'target', 'text');
      core.classList.remove('target', 'text');

      gsap.to(reticle, {
        width: 28,
        height: 28,
        borderRadius: 4,
        scale: 1,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      gsap.to(core, {
        scale: 1,
        opacity: 1,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const onMouseMove = (e) => {
      if (!isVisible) {
        gsap.to([core, reticle], { opacity: 1, duration: 0.18 });
        isVisible = true;
      }

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      setCoreX(mouseX);
      setCoreY(mouseY);

      const target = e.target;
      if (!target) {
        if (isLockedRef.current) unlockTarget();
        setReticleX(mouseX);
        setReticleY(mouseY);
        return;
      }

      // Check for interactive targets
      const interactiveEl = target.closest(
        'button, a, input[type="submit"], input[type="button"], .btn-primary, .btn-secondary, ' +
        '.dock-nav-item, .reactbits-dock-item, .mobile-dock-btn, .step-btn, .week-matrix-col, ' +
        '.minimal-btn-primary, .minimal-btn-secondary, .month-tab-btn, .theme-option-item, ' +
        '.edit-session-btn, .delete-session-btn, .hub-badge-banner, .prestige-banner-btn, ' +
        '.edit-step-btn, .edit-preset-chip, .edit-subj-pill, .edit-cancel-btn, .edit-save-btn, ' +
        '[data-cursor="target"]'
      );

      const isText = target.closest('input[type="text"], input[type="password"], input[type="email"], textarea, [contenteditable="true"]');

      if (interactiveEl && interactiveEl.offsetWidth > 0) {
        modeRef.current = 'target';
        lockOntoTarget(interactiveEl);
      } else if (isText) {
        modeRef.current = 'text';
        if (isLockedRef.current) unlockTarget();
        setReticleX(mouseX);
        setReticleY(mouseY);
        reticle.classList.add('text');
        core.classList.add('text');
      } else {
        modeRef.current = 'default';
        if (isLockedRef.current) unlockTarget();
        setReticleX(mouseX);
        setReticleY(mouseY);
      }
    };

    const onMouseDown = () => {
      gsap.to(reticle, { scale: 0.88, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(core, { scale: 1.4, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
    };

    const onMouseUp = () => {
      gsap.to(reticle, { scale: 1, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(core, { scale: isLockedRef.current ? 0.5 : 1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
    };

    const onMouseLeave = () => {
      gsap.to([core, reticle], { opacity: 0, duration: 0.18 });
      isVisible = false;
      if (isLockedRef.current) unlockTarget();
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

  if (typeof document === 'undefined') return null;

  return createPortal(
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
    </>,
    document.body
  );
}
