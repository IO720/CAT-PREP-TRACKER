import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

/**
 * CustomCursor - High-performance 120fps hardware-accelerated reticle cursor
 * Zero React re-renders on mousemove (pure direct GSAP manipulation)
 * Zero event-listener teardown/rebind cycling
 * Full viewport zoom/scale compensation (handles UI zoom 90%-120% pixel-perfectly)
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

    // Center both elements directly on the mouse pointer tip
    gsap.set([core, reticle], { xPercent: -50, yPercent: -50 });

    // Ultra high-performance GSAP quickTo interpolation
    const setCoreX = gsap.quickTo(core, 'x', { duration: 0.05, ease: 'power3.out' });
    const setCoreY = gsap.quickTo(core, 'y', { duration: 0.05, ease: 'power3.out' });

    const setReticleX = gsap.quickTo(reticle, 'x', { duration: 0.18, ease: 'power3.out' });
    const setReticleY = gsap.quickTo(reticle, 'y', { duration: 0.18, ease: 'power3.out' });

    let isVisible = false;
    const lastPos = { x: 0, y: 0 };

    const getEffectiveZoom = () => {
      const docZoom = parseFloat(document.documentElement.style.zoom) || 
                      parseFloat(getComputedStyle(document.documentElement).zoom) || 
                      (parseFloat(localStorage.getItem('aspiranto_font_scale')) / 100) || 
                      1;
      return docZoom > 0 ? docZoom : 1;
    };

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
      lastPos.x = e.clientX;
      lastPos.y = e.clientY;

      const z = getEffectiveZoom();
      const targetX = e.clientX / z;
      const targetY = e.clientY / z;

      setCoreX(targetX);
      setCoreY(targetY);
      setReticleX(targetX);
      setReticleY(targetY);

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

    // Instant sync when UI scale changes without waiting for mouse move
    const onScaleOrResize = (e) => {
      if (!isVisible) return;
      const z = e?.detail?.ratio || getEffectiveZoom();
      const targetX = lastPos.x / z;
      const targetY = lastPos.y / z;
      gsap.set(core, { x: targetX, y: targetY });
      gsap.set(reticle, { x: targetX, y: targetY });
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
    window.addEventListener('aspiranto_scale_change', onScaleOrResize);
    window.addEventListener('resize', onScaleOrResize, { passive: true });
    document.body.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('aspiranto_scale_change', onScaleOrResize);
      window.removeEventListener('resize', onScaleOrResize);
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
