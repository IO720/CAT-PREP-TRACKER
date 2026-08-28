import React, { useEffect, useRef } from 'react';

/**
 * CubesCanvas - ReactBits Interactive 3D Cube Mesh Animation
 * Features:
 * - Ultra-smooth 60/120 FPS rendering with IntersectionObserver pausing
 * - Smooth lerped spotlight beacon (zero jumps when entering/leaving canvas)
 * - Retina hardware scaling with crisp geometry
 * - Dual Interaction: Mouse hover on desktop + touch gestures on mobile
 */
export default function CubesCanvas({
  themeColor = '#38bdf8',
  cubeSize = 22,
  gap = 14,
  maxElevation = 24,
  proximity = 130,
  className = ''
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isHovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width <= 0 || height <= 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Pause animation when off-screen to guarantee 100% smooth scrolling & zero CPU waste
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });

    observer.observe(canvas);

    // Mouse & Touch tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
      mouseRef.current.isHovering = true;
    };

    const handleTouchEnd = () => {
      mouseRef.current.isHovering = false;
    };

    const parentEl = canvas.parentElement;
    if (parentEl) {
      parentEl.addEventListener('mousemove', handleMouseMove);
      parentEl.addEventListener('mouseleave', handleMouseLeave);
      parentEl.addEventListener('touchstart', handleTouchMove, { passive: true });
      parentEl.addEventListener('touchmove', handleTouchMove, { passive: true });
      parentEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    const isoAngle = Math.PI / 6;
    const cos30 = Math.cos(isoAngle);
    const sin30 = Math.sin(isoAngle);

    let time = 0;
    let currentBeaconX = width / 2;
    let currentBeaconY = height / 2;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.018;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const stepX = (cubeSize + gap) * cos30 * 2;
      const stepY = (cubeSize + gap) * sin30 * 2;

      // Smooth target calculation
      const targetBeaconX = mouse.isHovering && mouse.x > 0 
        ? mouse.x 
        : width * (0.5 + 0.35 * Math.sin(time * 0.6));
      const targetBeaconY = mouse.isHovering && mouse.y > 0 
        ? mouse.y 
        : height * (0.5 + 0.28 * Math.cos(time * 0.5));

      // Lerp beacon position so it glides smoothly without stutter
      currentBeaconX += (targetBeaconX - currentBeaconX) * 0.08;
      currentBeaconY += (targetBeaconY - currentBeaconY) * 0.08;

      const activeProximity = proximity * 1.1;

      const cols = Math.ceil(width / stepX) + 2;
      const rows = Math.ceil(height / stepY) + 4;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const offsetX = (r % 2) * (stepX / 2);
          const baseX = c * stepX + offsetX;
          const baseY = r * stepY;

          // Gentle ambient wave
          const ambientWave = Math.sin(time + c * 0.3 + r * 0.3) * 3.5;

          const dx = currentBeaconX - baseX;
          const dy = currentBeaconY - baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let elevation = ambientWave;
          let glowFactor = 0;

          if (dist < activeProximity) {
            const factor = 1 - dist / activeProximity;
            elevation -= factor * maxElevation;
            glowFactor = Math.pow(factor, 1.3);
          }

          const curX = baseX;
          const curY = baseY + elevation;

          const s = cubeSize;
          const h = s * 0.85;

          // 1. Top Face
          ctx.beginPath();
          ctx.moveTo(curX, curY - h);
          ctx.lineTo(curX + s * cos30, curY - h + s * sin30);
          ctx.lineTo(curX, curY - h + s * sin30 * 2);
          ctx.lineTo(curX - s * cos30, curY - h + s * sin30);
          ctx.closePath();

          ctx.fillStyle = glowFactor > 0
            ? `rgba(255, 255, 255, ${0.12 + glowFactor * 0.45})`
            : `rgba(255, 255, 255, 0.05)`;
          ctx.fill();

          ctx.strokeStyle = glowFactor > 0 
            ? themeColor 
            : 'rgba(255, 255, 255, 0.16)';
          ctx.lineWidth = glowFactor > 0 ? 1.4 : 0.9;
          ctx.stroke();

          // 2. Left Face
          ctx.beginPath();
          ctx.moveTo(curX - s * cos30, curY - h + s * sin30);
          ctx.lineTo(curX, curY - h + s * sin30 * 2);
          ctx.lineTo(curX, curY + s * sin30);
          ctx.lineTo(curX - s * cos30, curY);
          ctx.closePath();

          ctx.fillStyle = glowFactor > 0
            ? `${themeColor}44`
            : 'rgba(255, 255, 255, 0.025)';
          ctx.fill();

          ctx.strokeStyle = glowFactor > 0 
            ? `${themeColor}aa` 
            : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // 3. Right Face
          ctx.beginPath();
          ctx.moveTo(curX, curY - h + s * sin30 * 2);
          ctx.lineTo(curX + s * cos30, curY - h + s * sin30);
          ctx.lineTo(curX + s * cos30, curY);
          ctx.lineTo(curX, curY + s * sin30);
          ctx.closePath();

          ctx.fillStyle = glowFactor > 0
            ? `${themeColor}66`
            : 'rgba(255, 255, 255, 0.04)';
          ctx.fill();

          ctx.strokeStyle = glowFactor > 0 
            ? `${themeColor}cc` 
            : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (parentEl) {
        parentEl.removeEventListener('mousemove', handleMouseMove);
        parentEl.removeEventListener('mouseleave', handleMouseLeave);
        parentEl.removeEventListener('touchstart', handleTouchMove);
        parentEl.removeEventListener('touchmove', handleTouchMove);
        parentEl.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [themeColor, cubeSize, gap, maxElevation, proximity]);

  return (
    <canvas
      ref={canvasRef}
      className={`cubes-canvas-mesh ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
