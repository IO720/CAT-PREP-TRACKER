import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * LiquidIntroLoader - Cinematic Pop-in & Liquid Transition Screen
 * Inspired by Spylt ("Freaking Delicious" kinetic intro) & ReactBits
 * Features:
 * - High-impact pop-in kinetic typography (Syne + Playfair italic)
 * - Direct DOM percentile counter roll (00% -> 99.8%) without React re-render thrashing
 * - Liquid SVG bezier wave wipe transition that dissolves into the dashboard
 * - Safe single-execution run with Skip button and safety timeout
 */
export default function LiquidIntroLoader({ onComplete, activeTheme = 'dark' }) {
  const containerRef = useRef(null);
  const counterValRef = useRef(null);
  const svgPathRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety fallback: guaranteed exit after 3.2s
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        handleFinish();
      }
    }, 3200);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (isMounted) {
            handleFinish();
          }
        }
      });

      // 1. Initial State
      gsap.set('.spylt-word', { y: 50, opacity: 0, scale: 0.9, rotateX: 20 });
      gsap.set('.spylt-subtag', { opacity: 0, y: 15 });
      gsap.set('.spylt-counter-wrap', { opacity: 0, scale: 0.9 });
      gsap.set('.spylt-skip-btn', { opacity: 0 });

      // 2. Kinetic Pop-in (Spylt style)
      tl.to('.spylt-subtag', {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power3.out'
      })
      .to('.spylt-word', {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, '-=0.15')
      .to('.spylt-counter-wrap', {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'power2.out'
      }, '-=0.3')
      .to('.spylt-skip-btn', {
        opacity: 0.7,
        duration: 0.3
      }, '-=0.2');

      // 3. Counter Rollup directly via DOM ref (0 React re-renders)
      const counterObj = { val: 0 };
      tl.to(counterObj, {
        val: 99.8,
        duration: 0.7,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counterValRef.current) {
            counterValRef.current.textContent = `${counterObj.val.toFixed(1)}%`;
          }
        }
      }, '-=0.35');

      // 4. Brief Hold for Impact
      tl.to({}, { duration: 0.25 });

      // 5. Kinetic Text Exit (Dissolves upward)
      tl.to('.spylt-word', {
        y: -40,
        opacity: 0,
        stagger: 0.05,
        duration: 0.35,
        ease: 'power3.in'
      })
      .to('.spylt-subtag, .spylt-counter-wrap, .spylt-skip-btn', {
        opacity: 0,
        y: -20,
        duration: 0.25,
        ease: 'power2.in'
      }, '-=0.25');

      // 6. Liquid Curtain Morph & Pull-up (SVG Bezier curve wipe)
      const path = svgPathRef.current;
      if (path) {
        const liquidCurve = "M 0 0 L 100 0 L 100 0 Q 50 80 0 0 Z";
        const flatTop = "M 0 0 L 100 0 L 100 0 Q 50 0 0 0 Z";

        tl.to(path, {
          attr: { d: liquidCurve },
          duration: 0.6,
          ease: 'power4.inOut'
        })
        .to(path, {
          attr: { d: flatTop },
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      // Container fade out
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.2,
        pointerEvents: 'none'
      }, '-=0.2');

    }, containerRef);

    // Allow Esc key to skip immediately
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
      ctx.revert();
    };
  }, []); // Run exactly ONCE on mount

  return (
    <div 
      ref={containerRef} 
      className="liquid-intro-container" 
      aria-label="Loading CATalyze"
      onClick={handleFinish}
    >
      {/* Background Liquid SVG Mask / Curtain */}
      <svg 
        className="liquid-intro-curtain" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path 
          ref={svgPathRef} 
          d="M 0 0 L 100 0 L 100 100 Q 50 100 0 100 Z" 
          className="liquid-curtain-fill" 
        />
      </svg>

      {/* Foreground Kinetic Typography */}
      <div className="liquid-intro-content">
        <div className="spylt-subtag">
          <span className="subtag-dot"></span>
          <span>CAT-2026 // ASPIRANT PROTOCOL</span>
        </div>

        <div className="spylt-title-wrapper">
          <span className="spylt-word word-bold">DISCIPLINE</span>
          <span className="spylt-word word-italic">is Real.</span>
        </div>

        <div className="spylt-counter-wrap">
          <span ref={counterValRef} className="counter-val">00.0%</span>
          <span className="counter-lbl">TARGET PERCENTILE</span>
        </div>

        <button 
          type="button" 
          className="spylt-skip-btn" 
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          title="Skip intro"
        >
          <span>ESC TO SKIP ➔</span>
        </button>
      </div>
    </div>
  );
}
