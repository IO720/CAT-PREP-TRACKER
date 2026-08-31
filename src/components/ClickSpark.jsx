import React, { useEffect, useRef } from 'react';
import { THEMES } from './ThemeSelectorDropdown';

/**
 * ClickSpark - ReactBits Interactive Particle Burst
 * Inspired by https://reactbits.dev/animations/click-spark
 * Features:
 * - Canvas particle burst on mouse click / pointerdown
 * - 100% Theme-reactive: Uses THEMES palette + computed CSS vars
 * - Zero unmounting on theme change (uses themeRef to preserve canvas & listeners)
 * - Full cross-browser support (Brave, Chrome, Firefox, Safari)
 */
function ClickSpark({
  sparkColor,
  sparkSize = 12,
  sparkRadius = 26,
  sparkCount = 8,
  duration = 420,
  activeTheme = 'dark'
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const themeRef = useRef(activeTheme);
  themeRef.current = activeTheme;

  // Check if on mobile or low-power touch device
  const isMobile = typeof window !== 'undefined' && (
    (typeof window.innerWidth === 'number' && window.innerWidth < 768) ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches)
  );

  // Compute theme color for sparks dynamically without forcing DOM reflow
  const getThemeSparkColor = () => {
    if (sparkColor) return sparkColor;

    // Check THEMES dictionary for high-vibrancy accent
    const currentId = themeRef.current;
    const matched = THEMES.find((t) => t.id === currentId);
    if (matched && matched.colors && matched.colors.length > 0) {
      const accent = matched.colors[3] || matched.colors[2];
      if (accent) return accent;
    }

    return '#38bdf8';
  };

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = now - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const currentDist = spark.distance * easeProgress;
        const lineLen = spark.size * (1 - progress);

        const startX = spark.x + Math.cos(spark.angle) * currentDist;
        const startY = spark.y + Math.sin(spark.angle) * currentDist;
        const endX = spark.x + Math.cos(spark.angle) * (currentDist + lineLen);
        const endY = spark.y + Math.sin(spark.angle) * (currentDist + lineLen);

        const alpha = 1 - progress;

        ctx.save();
        ctx.strokeStyle = spark.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.shadowColor = spark.color;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.restore();
        return true;
      });

      if (sparksRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    let lastTriggerTime = 0;
    const triggerBurst = (clientX, clientY) => {
      const now = performance.now();
      // Debounce if multiple pointer events fire on same interaction
      if (now - lastTriggerTime < 20) return;
      lastTriggerTime = now;

      const color = getThemeSparkColor();

      for (let i = 0; i < sparkCount; i++) {
        const baseAngle = (i * 2 * Math.PI) / sparkCount;
        const randomOffset = (Math.random() - 0.5) * 0.35;
        const angle = baseAngle + randomOffset;
        const distance = sparkRadius + Math.random() * 8;

        sparksRef.current.push({
          x: clientX,
          y: clientY,
          angle,
          distance,
          size: sparkSize + Math.random() * 4,
          color,
          startTime: now
        });
      }

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const handlePointerDown = (e) => {
      triggerBurst(e.clientX, e.clientY);
    };

    // Attach to document with capture: true so nothing stops propagation
    document.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]); // Note: activeTheme is NOT in dependencies, preserving canvas lifecycle!

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="click-spark-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999998
      }}
    />
  );
}

export default React.memo(ClickSpark);
