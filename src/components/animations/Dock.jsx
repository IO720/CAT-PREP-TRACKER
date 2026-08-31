import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

/**
 * Dock & DockItem
 * Inspired by React Bits (https://reactbits.dev/components/dock)
 * Interactive macOS-style magnification dock for both desktop (left vertical dock)
 * and mobile (bottom horizontal dock) with smooth spring transforms and touch support.
 */

const DockContext = createContext({
  mousePos: null,
  direction: 'vertical',
  magnification: 1.4,
  distance: 120,
  baseItemSize: 46
});

export function Dock({
  children,
  direction = 'vertical', // 'vertical' | 'horizontal'
  magnification = 1.35,
  distance = 110,
  baseItemSize = 44,
  className = '',
  style = {}
}) {
  const [mousePos, setMousePos] = useState(null);
  const containerRef = useRef(null);
  const cachedRectRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      cachedRectRef.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    // Throttle with rAF to prevent layout thrashing
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!cachedRectRef.current && containerRef.current) {
        cachedRectRef.current = containerRef.current.getBoundingClientRect();
      }
      const rect = cachedRectRef.current;
      if (!rect) return;

      if (direction === 'vertical') {
        setMousePos(e.clientY - rect.top);
      } else {
        setMousePos(e.clientX - rect.left);
      }
    });
  }, [direction]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    cachedRectRef.current = null;
    setMousePos(null);
  }, []);

  return (
    <DockContext.Provider value={{ mousePos, direction, magnification, distance, baseItemSize }}>
      <div
        ref={containerRef}
        className={`reactbits-dock-container ${direction} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

export function DockItem({
  children,
  onClick,
  active = false,
  className = '',
  ariaLabel = '',
  tooltipTitle = '',
  tooltipTag = '',
  style = {}
}) {
  const { mousePos, direction, magnification, distance, baseItemSize } = useContext(DockContext);
  const itemRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!itemRef.current || mousePos === null) {
      setScale(1);
      return;
    }

    const item = itemRef.current;
    const itemCenter = direction === 'vertical'
      ? item.offsetTop + item.offsetHeight / 2
      : item.offsetLeft + item.offsetWidth / 2;

    const delta = Math.abs(mousePos - itemCenter);

    if (delta < distance) {
      // Cosine bell-curve falloff
      const factor = Math.cos((delta / distance) * (Math.PI / 2));
      const targetScale = 1 + (magnification - 1) * Math.pow(factor, 1.5);
      setScale(targetScale);
    } else {
      setScale(1);
    }
  }, [mousePos, direction, magnification, distance]);

  return (
    <button
      ref={itemRef}
      type="button"
      className={`reactbits-dock-item dock-nav-item ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={ariaLabel || tooltipTitle}
      style={{
        width: baseItemSize,
        height: baseItemSize,
        transform: `scale(${scale})`,
        transition: mousePos !== null ? 'transform 0.1s ease-out' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: direction === 'vertical' ? 'left center' : 'center bottom',
        zIndex: scale > 1.05 || isHovered ? 20 : 1,
        ...style
      }}
    >
      {active && <span className="dock-active-glow-pill" />}
      <div className="dock-icon-wrapper">
        {children}
      </div>

      {tooltipTitle && (
        <div className={`dock-floating-tooltip ${isHovered ? 'visible' : ''}`}>
          <span className="tooltip-title">{tooltipTitle}</span>
          {tooltipTag && <span className="tooltip-tag">{tooltipTag}</span>}
        </div>
      )}
    </button>
  );
}
