import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import StudyCompanionEntity from './StudyCompanionEntity';

/**
 * FocusTransitionPortal - Seamless Shared-Element Transition to Study Timer
 * Glides the Scholar Cat from the peeking edge smoothly into the exact coordinates
 * of the Study Timer's companion container without any abrupt jump or layout shift.
 */
export default function FocusTransitionPortal({ onComplete, activeTheme = 'dark', subject = 'Quant' }) {
  const containerRef = useRef(null);
  const catWrapperRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: exit after 2.2s if anything stalls
    const safetyTimer = setTimeout(() => {
      if (isMounted) handleFinish();
    }, 2200);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleFinish();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Calculate exact target position matching the Timer stage's companion box
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.32;

    const targetEl = document.querySelector('.stage-companion-container');
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const startX = window.innerWidth - 100;
    const startY = window.innerHeight - 120;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (isMounted) handleFinish();
        }
      });

      // 1. Initial State
      gsap.set(catWrapperRef.current, {
        position: 'fixed',
        left: 0,
        top: 0,
        x: startX,
        y: startY,
        xPercent: -50,
        yPercent: -50,
        scale: 0.65,
        opacity: 0
      });

      gsap.set('.focus-trans-word', { y: 25, opacity: 0, scale: 0.95 });
      gsap.set('.focus-trans-tag', { opacity: 0, y: -10 });
      gsap.set('.focus-trans-sub-hint', { opacity: 0 });

      // 2. Cat leaps/glides from bottom-right into the exact Study Desk location
      tl.to(catWrapperRef.current, {
        opacity: 1,
        duration: 0.2,
        ease: 'power1.out'
      })
      .to(catWrapperRef.current, {
        x: targetX,
        y: targetY,
        scale: 1,
        duration: 0.75,
        ease: 'power3.out'
      }, '-=0.15')

      // 3. Kinetic Typography ("TIME TO STUDY.") pops in smoothly above the desk
      .to('.focus-trans-tag', {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out'
      }, '-=0.6')
      .to('.focus-trans-word', {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.06,
        duration: 0.45,
        ease: 'back.out(1.5)'
      }, '-=0.4')
      .to('.focus-trans-sub-hint', {
        opacity: 0.75,
        duration: 0.25
      }, '-=0.2')

      // 4. Brief hold at desk so the aspirant sees the cat settle into study mode
      .to({}, { duration: 0.4 })

      // 5. Kinetic Typography fades out smoothly
      .to(['.focus-trans-word', '.focus-trans-tag', '.focus-trans-sub-hint'], {
        y: -20,
        opacity: 0,
        stagger: 0.03,
        duration: 0.25,
        ease: 'power2.in'
      })

      // 6. Seamless dissolve of the overlay background directly revealing the Timer Stage
      // The cat matches the exact coordinates of .stage-companion-container below!
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out'
      }, '-=0.1');

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

      {/* Cat Companion Smoothly Gliding into exact target coordinates */}
      <div ref={catWrapperRef} className="focus-trans-floating-cat">
        <StudyCompanionEntity 
          isRunning={true}
          isPaused={false}
          subject={subject}
          size={175}
        />
      </div>

      <span className="focus-trans-sub-hint font-mono">
        PREPARING FOCUS SANCTUARY • (CLICK TO SKIP)
      </span>
    </div>
  );
}
