import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * DecryptedText
 * Inspired by React Bits (https://reactbits.dev/text-animations/decrypted-text)
 * High-performance cyberpunk/matrix style scrambling text reveal animation.
 */
export default function DecryptedText({
  text = '',
  speed = 45,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?',
  className = '',
  encryptedClassName = 'decrypted-char-scrambled',
  animateOn = 'hover', // 'view' | 'hover' | 'both'
  onAnimationComplete = null,
  style = {}
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimatedOnView, setHasAnimatedOnView] = useState(false);
  
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const iterationRef = useRef(0);
  const revealedIndicesRef = useRef(new Set());

  const charPool = useMemo(() => {
    if (useOriginalCharsOnly) {
      return Array.from(new Set(text.split(''))).filter(c => c !== ' ');
    }
    return characters.split('');
  }, [useOriginalCharsOnly, text, characters]);

  const getRandomChar = useCallback(() => {
    return charPool[Math.floor(Math.random() * charPool.length)] || '*';
  }, [charPool]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    iterationRef.current = 0;
    revealedIndicesRef.current.clear();

    const targetLength = text.length;
    let lastTime = performance.now();

    const animate = (time) => {
      if (time - lastTime >= speed) {
        lastTime = time;
        iterationRef.current++;

        if (sequential) {
          // Reveal letters sequentially
          const progress = iterationRef.current / maxIterations;
          const charsToReveal = Math.min(targetLength, Math.floor(progress * targetLength));

          if (revealDirection === 'end') {
            for (let i = targetLength - 1; i >= targetLength - charsToReveal; i--) {
              revealedIndicesRef.current.add(i);
            }
          } else {
            for (let i = 0; i < charsToReveal; i++) {
              revealedIndicesRef.current.add(i);
            }
          }
        }

        const newDisplay = text.split('').map((char, idx) => {
          if (char === ' ' || char === '\n') return char;
          if (revealedIndicesRef.current.has(idx) || iterationRef.current >= maxIterations) {
            return char;
          }
          return getRandomChar();
        }).join('');

        setDisplayText(newDisplay);

        if (iterationRef.current >= maxIterations) {
          setDisplayText(text);
          setIsAnimating(false);
          if (onAnimationComplete) onAnimationComplete();
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [text, speed, maxIterations, sequential, revealDirection, getRandomChar, isAnimating, onAnimationComplete]);

  // Trigger on initial view/mount
  useEffect(() => {
    if ((animateOn === 'view' || animateOn === 'both') && !hasAnimatedOnView) {
      setHasAnimatedOnView(true);
      startAnimation();
    }
  }, [animateOn, hasAnimatedOnView, startAnimation]);

  // Clean up
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (animateOn === 'hover' || animateOn === 'both') {
      startAnimation();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <span
      ref={containerRef}
      className={`decrypted-text-root ${className} ${isAnimating ? 'is-decrypting' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block', cursor: 'default', ...style }}
    >
      {displayText.split('').map((char, index) => {
        const isOriginal = char === text[index];
        const isSpace = char === ' ';
        return (
          <span
            key={index}
            className={isOriginal || isSpace ? 'decrypted-char-real' : encryptedClassName}
            style={{ display: 'inline' }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
