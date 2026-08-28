import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * FocusTransitionPortal - Spylt-Inspired Cinematic Focus Overlay
 * Displays kinetic typography ("TIME TO STUDY.") and ambient veil
 * while the Study Companion Cat glides seamlessly into its desk chair in StudyTimerView.
 */
export default function FocusTransitionPortal({ onComplete, activeTheme = 'dark', subject = 'Quant' }) {
  const containerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: auto-finish after 2.0s
    const safetyTimer = setTimeout(() => {
      if (isMounted) handleFinish();
    }, 2000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleFinish();
    };
    window.addEventListener('keydown', handleKeyDown);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (isMounted) handleFinish();
        }
      });

      // Initial state
      gsap.set('.focus-trans-word', { y: 30, opacity: 0, scale: 0.9 });
      gsap.set('.focus-trans-tag', { opacity: 0, y: -12 });
      gsap.set('.focus-trans-sub-hint', { opacity: 0 });

      // 1. Kinetic Typography ("TIME TO STUDY.") sweeps in smoothly
      tl.to('.focus-trans-tag', {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out'
      }, 0.1)
      .to('.focus-trans-word', {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.07,
        duration: 0.5,
        ease: 'back.out(1.6)'
      }, 0.18)
      .to('.focus-trans-sub-hint', {
        opacity: 0.8,
        duration: 0.3
      }, 0.4)

      // 2. Brief hold so the aspirant experiences the focus motivation
      .to({}, { duration: 0.45 })

      // 3. Kinetic Typography sweeps upward and fades
      .to(['.focus-trans-word', '.focus-trans-tag', '.focus-trans-sub-hint'], {
        y: -24,
        opacity: 0,
        stagger: 0.03,
        duration: 0.3,
        ease: 'power2.in'
      })

      // 4. Veil dissolves seamlessly, revealing the full Timer Sanctuary
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.15');

    }, containerRef);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
      ctx.revert();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="focus-transition-portal-overlay"
      onClick={handleFinish}
      title="Click or press Esc to skip"
    >
      {/* Background Ambient Glow Halo */}
      <div className="focus-trans-ambient-halo" />

      {/* Kinetic Typography floating above */}
      <div className="focus-trans-header-wrap">
        <span className="focus-trans-tag font-mono">
          // PROTOCOL: DEEP FOCUS • {subject.toUpperCase()} DRILL
        </span>

        <h1 className="focus-trans-title">
          <span className="focus-trans-word font-display">TIME</span>{' '}
          <span className="focus-trans-word font-display">TO</span>{' '}
          <span className="focus-trans-word italic-serif">STUDY.</span>
        </h1>
      </div>

      <span className="focus-trans-sub-hint font-mono">
        PREPARING FOCUS SANCTUARY • (CLICK TO SKIP)
      </span>
    </div>
  );
}
