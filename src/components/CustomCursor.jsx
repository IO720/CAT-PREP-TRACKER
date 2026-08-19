import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor({ activeTheme }) {
  const coreRef = useRef(null);
  const reticleRef = useRef(null);
  const [cursorMode, setCursorMode] = useState('default'); // 'default', 'target', 'text'
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    const hasTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (hasTouch) {
      setIsTouchDevice(true);
      return;
    }

    const core = coreRef.current;
    const reticle = reticleRef.current;
    if (!core || !reticle) return;

    // Ultra high-performance 120fps GSAP quickTo interpolation
    const setCoreX = gsap.quickTo(core, 'x', { duration: 0.06, ease: 'power3.out' });
    const setCoreY = gsap.quickTo(core, 'y', { duration: 0.06, ease: 'power3.out' });

    const setReticleX = gsap.quickTo(reticle, 'x', { duration: 0.22, ease: 'power3.out' });
    const setReticleY = gsap.quickTo(reticle, 'y', { duration: 0.22, ease: 'power3.out' });

    let isVisible = false;

    const onMouseMove = (e) => {
      if (!isVisible) {
        gsap.to([core, reticle], { opacity: 1, duration: 0.2 });
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
        '.achievement-card, .mock-test-item'
      );

      const isText = target.closest('input[type="text"], input[type="password"], input[type="email"], textarea, [contenteditable="true"]');

      if (isInteractive) {
        setCursorMode('target');
      } else if (isText) {
        setCursorMode('text');
      } else {
        setCursorMode('default');
      }
    };

    const onMouseDown = () => {
      gsap.to(reticle, { scale: 0.7, rotate: 45, duration: 0.12, ease: 'power2.out' });
      gsap.to(core, { scale: 1.5, duration: 0.12, ease: 'power2.out' });
    };

    const onMouseUp = () => {
      gsap.to(reticle, { 
        scale: cursorMode === 'target' ? 1.4 : 1, 
        rotate: cursorMode === 'target' ? 45 : 0, 
        duration: 0.35, 
        ease: 'elastic.out(1.2, 0.4)' 
      });
      gsap.to(core, { scale: 1, duration: 0.2, ease: 'power2.out' });
    };

    const onMouseLeave = () => {
      gsap.to([core, reticle], { opacity: 0, duration: 0.2 });
      isVisible = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.body.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [cursorMode]);

  // Handle mode transitions (Target Lock / Text Focus / Default Reticle)
  useEffect(() => {
    if (isTouchDevice || !reticleRef.current || !coreRef.current) return;

    if (cursorMode === 'target') {
      // Precision Target Acquisition Mode: Corner brackets lock & expand with theme color glow
      gsap.to(reticleRef.current, {
        scale: 1.4,
        rotate: 45,
        duration: 0.25,
        ease: 'power2.out'
      });
      gsap.to(coreRef.current, {
        scale: 0.6,
        duration: 0.2,
        ease: 'power2.out'
      });
    } else if (cursorMode === 'text') {
      // Text Focus Alignment
      gsap.to(reticleRef.current, {
        scale: 0.7,
        rotate: 0,
        duration: 0.2,
        ease: 'power2.out'
      });
      gsap.to(coreRef.current, {
        scale: 1.2,
        duration: 0.2,
        ease: 'power2.out'
      });
    } else {
      // Default Precision Focus Reticle
      gsap.to(reticleRef.current, {
        scale: 1,
        rotate: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(coreRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  }, [cursorMode, activeTheme, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Central Laser Star Core */}
      <div 
        ref={coreRef} 
        className={`focus-cursor-core ${cursorMode}`} 
        style={{ opacity: 0 }}
      />

      {/* Precision Corner Brackets Targeting Reticle */}
      <div 
        ref={reticleRef} 
        className={`focus-cursor-reticle ${cursorMode}`} 
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
