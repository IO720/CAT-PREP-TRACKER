import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor({ activeTheme }) {
  const dotRef = useRef(null);
  const followerRef = useRef(null);
  const [cursorState, setCursorState] = useState('default'); // 'default', 'hover', 'text', 'hidden'
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device or if user prefers reduced motion
    const hasTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (hasTouch) {
      setIsTouchDevice(true);
      return;
    }

    const dot = dotRef.current;
    const follower = followerRef.current;
    if (!dot || !follower) return;

    // Use GSAP quickTo for ultra high-performance 120fps smooth interpolation
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
    
    const setFollowerX = gsap.quickTo(follower, 'x', { duration: 0.35, ease: 'power3.out' });
    const setFollowerY = gsap.quickTo(follower, 'y', { duration: 0.35, ease: 'power3.out' });

    let isVisible = false;

    const onMouseMove = (e) => {
      if (!isVisible) {
        gsap.to([dot, follower], { opacity: 1, duration: 0.25 });
        isVisible = true;
      }
      setDotX(e.clientX);
      setDotY(e.clientY);
      setFollowerX(e.clientX);
      setFollowerY(e.clientY);

      // Check hovered element
      const target = e.target;
      if (!target) return;

      const isInteractive = target.closest(
        'button, a, input[type="submit"], input[type="button"], .btn-primary, .btn-secondary, ' +
        '.nav-link, .theme-option-item, .settings-theme-emblem-btn, .sidebar-toggle-btn, ' +
        '.stat-card, .metric-card, .theme-dropdown-trigger, .hub-badge-item, .clickable'
      );

      const isText = target.closest('input[type="text"], input[type="password"], input[type="email"], textarea, [contenteditable="true"]');

      if (isInteractive) {
        setCursorState('hover');
      } else if (isText) {
        setCursorState('text');
      } else {
        setCursorState('default');
      }
    };

    const onMouseDown = () => {
      gsap.to(follower, { scale: 0.8, duration: 0.15, ease: 'power2.out' });
      gsap.to(dot, { scale: 1.4, duration: 0.15, ease: 'power2.out' });
    };

    const onMouseUp = () => {
      gsap.to(follower, { scale: cursorState === 'hover' ? 1.8 : 1, duration: 0.3, ease: 'elastic.out(1.2, 0.4)' });
      gsap.to(dot, { scale: 1, duration: 0.25, ease: 'power2.out' });
    };

    const onMouseLeave = () => {
      gsap.to([dot, follower], { opacity: 0, duration: 0.25 });
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
  }, [cursorState]);

  // Update cursor state scale & animations
  useEffect(() => {
    if (isTouchDevice || !followerRef.current || !dotRef.current) return;

    if (cursorState === 'hover') {
      gsap.to(followerRef.current, {
        scale: 1.85,
        backgroundColor: 'var(--accent-glow, rgba(56, 189, 248, 0.15))',
        borderColor: 'var(--accent-color, #38bdf8)',
        duration: 0.25,
        ease: 'power2.out'
      });
      gsap.to(dotRef.current, {
        scale: 0.4,
        duration: 0.2,
        ease: 'power2.out'
      });
    } else if (cursorState === 'text') {
      gsap.to(followerRef.current, {
        scale: 0.6,
        width: '4px',
        borderRadius: '2px',
        backgroundColor: 'var(--accent-color, #38bdf8)',
        borderColor: 'transparent',
        duration: 0.2,
        ease: 'power2.out'
      });
      gsap.to(dotRef.current, {
        opacity: 0,
        duration: 0.15
      });
    } else {
      gsap.to(followerRef.current, {
        scale: 1,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        borderColor: 'var(--accent-color, rgba(255, 255, 255, 0.4))',
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(dotRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  }, [cursorState, activeTheme, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      <div 
        ref={dotRef} 
        className="custom-cursor-dot" 
        style={{ opacity: 0 }}
      />
      <div 
        ref={followerRef} 
        className={`custom-cursor-follower ${cursorState}`} 
        style={{ opacity: 0 }}
      />
    </>
  );
}
