import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';

/**
 * Skiper106 - Smooth Caret Textarea
 * Features:
 * - Offscreen DOM mirror measurement to compute precise multiline (x, y) caret coordinates
 * - Spring-interpolated glowing cyan caret that glides smoothly across characters and lines
 * - Solid glow illumination while actively typing, gentle pulse blink when idle
 * - Handles auto word-wrapping, manual line breaks (\n), and textarea scrolling
 * - Full pass-through for all HTML textarea attributes
 */

const MIRROR_PROPERTIES = [
  'boxSizing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'wordSpacing',
  'textIndent',
  'whiteSpace',
  'wordWrap',
  'overflowWrap',
  'tabSize'
];

export default function SmoothCaretTextarea({
  value = '',
  onChange,
  placeholder = '',
  className = '',
  wrapperClassName = '',
  style = {},
  disabled = false,
  required = false,
  autoFocus = false,
  rows,
  name,
  id,
  children,
  ...restProps
}) {
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);
  const [caretLeft, setCaretLeft] = useState(12);
  const [caretTop, setCaretTop] = useState(10);
  const [caretHeight, setCaretHeight] = useState(17);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);

  const getOrCreateMirror = useCallback(() => {
    if (!mirrorRef.current && typeof document !== 'undefined') {
      const mirror = document.createElement('div');
      mirror.setAttribute('aria-hidden', 'true');
      mirror.style.position = 'absolute';
      mirror.style.top = '-99999px';
      mirror.style.left = '-99999px';
      mirror.style.visibility = 'hidden';
      mirror.style.pointerEvents = 'none';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.wordWrap = 'break-word';
      mirror.style.overflowWrap = 'break-word';
      mirror.style.overflow = 'hidden';
      document.body.appendChild(mirror);
      mirrorRef.current = mirror;
    }
    return mirrorRef.current;
  }, []);

  const updateCaretPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const mirror = getOrCreateMirror();
    if (!mirror) return;

    const styleComputed = window.getComputedStyle(textarea);

    // Sync box and typography styles
    MIRROR_PROPERTIES.forEach((prop) => {
      mirror.style[prop] = styleComputed[prop];
    });

    // Match exact width of client area (excluding scrollbar)
    const clientWidth = textarea.clientWidth || 300;
    mirror.style.width = `${clientWidth}px`;

    const cursorIndex = textarea.selectionStart ?? (value ? String(value).length : 0);
    const textStr = String(value || '');
    const textBefore = textStr.slice(0, cursorIndex);

    // Populate mirror with text up to cursor and a zero-width space measurement span
    mirror.textContent = textBefore;

    const marker = document.createElement('span');
    marker.textContent = '\u200B';
    mirror.appendChild(marker);

    const paddingLeft = parseFloat(styleComputed.paddingLeft) || 12;
    const paddingTop = parseFloat(styleComputed.paddingTop) || 10;
    const fontSize = parseFloat(styleComputed.fontSize) || 13;
    const computedLineHeight = parseFloat(styleComputed.lineHeight) || (fontSize * 1.45);

    const markerLeft = marker.offsetLeft;
    const markerTop = marker.offsetTop;

    const scrollLeft = textarea.scrollLeft || 0;
    const scrollTop = textarea.scrollTop || 0;

    const calculatedLeft = markerLeft - scrollLeft;
    const calculatedTop = markerTop - scrollTop;

    const maxLeft = Math.max(paddingLeft, clientWidth - 8);

    setCaretLeft(Math.min(maxLeft, Math.max(paddingLeft, calculatedLeft)));
    setCaretTop(Math.max(paddingTop, calculatedTop));
    setCaretHeight(Math.max(14, Math.round(computedLineHeight * 0.85)));
  }, [value, getOrCreateMirror]);

  useLayoutEffect(() => {
    updateCaretPosition();
  }, [value, updateCaretPosition]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
      if (document.activeElement === textarea) {
        updateCaretPosition();
      }
    };

    const handleScroll = () => {
      updateCaretPosition();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    textarea.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      textarea.removeEventListener('scroll', handleScroll);
    };
  }, [updateCaretPosition]);

  useEffect(() => {
    return () => {
      if (mirrorRef.current && mirrorRef.current.parentNode) {
        mirrorRef.current.parentNode.removeChild(mirrorRef.current);
        mirrorRef.current = null;
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const handleTextareaChange = (e) => {
    setIsTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 450);

    if (onChange) onChange(e);
  };

  return (
    <div className={`skiper106-textarea-wrapper ${isFocused ? 'is-focused' : ''} ${wrapperClassName}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onFocus={(e) => {
          setIsFocused(true);
          updateCaretPosition();
          if (restProps.onFocus) restProps.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (restProps.onBlur) restProps.onBlur(e);
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        rows={rows}
        name={name}
        id={id}
        style={style}
        className={`skiper106-textarea-field ${className}`}
        {...restProps}
      />

      {/* Smooth Spring Caret for multiline textarea */}
      {isFocused && (
        <span
          className={`skiper106-smooth-caret skiper106-textarea-caret ${isTyping ? 'is-typing' : 'is-idle'}`}
          style={{
            transform: `translate3d(${caretLeft}px, ${caretTop}px, 0)`,
            height: `${caretHeight}px`
          }}
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
}
