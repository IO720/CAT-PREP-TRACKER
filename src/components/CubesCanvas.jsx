import React, { useEffect, useRef } from 'react';

/**
 * CubesCanvas - ReactBits Interactive 3D Cube Mesh Animation
 * Features:
 * - HTML5 Canvas rendering of isometric 3D cube matrix
 * - Dynamic mouse proximity reaction (cubes elevate and illuminate near cursor)
 * - Harmonious theme color shading (top, left, right isometric faces)
 * - Low CPU overhead with RAF throttling and automatic resize handling
 */
export default function CubesCanvas({
  themeColor = '#38bdf8',
  cubeSize = 22,
  gap = 14,
  maxElevation = 24,
  proximity = 120,
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

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    // Iso conversion helpers
    const isoAngle = Math.PI / 6; // 30 degrees
    const cos30 = Math.cos(isoAngle);
    const sin30 = Math.sin(isoAngle);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const stepX = (cubeSize + gap) * cos30 * 2;
      const stepY = (cubeSize + gap) * sin30 * 2;

      // Determine grid bounds
      const cols = Math.ceil(width / stepX) + 2;
      const rows = Math.ceil(height / stepY) + 4;

      for (let r = -2; r < rows; r++) {
        for (let c = -2; c < cols; c++) {
          const offsetX = (r % 2) * (stepX / 2);
          const baseX = c * stepX + offsetX;
          const baseY = r * stepY;

          // Ambient floating sine wave
          const ambientWave = Math.sin(time + c * 0.4 + r * 0.4) * 4;

          // Mouse proximity reaction
          const dx = mouse.x - baseX;
          const dy = mouse.y - baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let elevation = ambientWave;
          let glowFactor = 0;

          if (dist < proximity) {
            const factor = (1 - dist / proximity);
            elevation -= factor * maxElevation;
            glowFactor = factor;
          }

          const curX = baseX;
          const curY = baseY + elevation;

          // Draw Isometric 3D Cube
          const s = cubeSize;
          const h = s * 0.85;

          // Top Face
          ctx.beginPath();
          ctx.moveTo(curX, curY - h);
          ctx.lineTo(curX + s * cos30, curY - h + s * sin30);
          ctx.lineTo(curX, curY - h + s * sin30 * 2);
          ctx.lineTo(curX - s * cos30, curY - h + s * sin30);
          ctx.closePath();
          ctx.fillStyle = glowFactor > 0 
            ? `rgba(255, 255, 255, ${0.15 + glowFactor * 0.45})` 
            : `rgba(255, 255, 255, 0.06)`;
          ctx.fill();
          ctx.strokeStyle = glowFactor > 0 ? themeColor : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = glowFactor > 0 ? 1.4 : 0.8;
          ctx.stroke();

          // Left Face
          ctx.beginPath();
          ctx.moveTo(curX - s * cos30, curY - h + s * sin30);
          ctx.lineTo(curX, curY - h + s * sin30 * 2);
          ctx.lineTo(curX, curY + s * sin30);
          ctx.lineTo(curX - s * cos30, curY);
          ctx.closePath();
          ctx.fillStyle = glowFactor > 0 
            ? `${themeColor}33` 
            : 'rgba(255, 255, 255, 0.02)';
          ctx.fill();
          ctx.strokeStyle = glowFactor > 0 ? `${themeColor}aa` : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Right Face
          ctx.beginPath();
          ctx.moveTo(curX, curY - h + s * sin30 * 2);
          ctx.lineTo(curX + s * cos30, curY - h + s * sin30);
          ctx.lineTo(curX + s * cos30, curY);
          ctx.lineTo(curX, curY + s * sin30);
          ctx.closePath();
          ctx.fillStyle = glowFactor > 0 
            ? `${themeColor}55` 
            : 'rgba(255, 255, 255, 0.04)';
          ctx.fill();
          ctx.strokeStyle = glowFactor > 0 ? `${themeColor}cc` : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
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
