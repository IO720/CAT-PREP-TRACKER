import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

/**
 * Skiper106 - Smooth Caret Input
 * Features:
 * - Offscreen canvas text measurement to accurately compute cursor position
 * - Spring-interpolated glowing caret that glides smoothly across text
 * - Idle blink animation with solid illumination while typing
 * - Full pass-through for all HTML input attributes
 */
export default function SmoothCaretInput({
  type = 'text',
  value = '',
  onChange,
  placeholder = '',
  className = '',
  wrapperClassName = '',
  disabled = false,
  required = false,
  autoFocus = false,
  name,
  id,
  children,
  ...restProps
}) {
  const inputRef = useRef(null);
  const [caretLeft, setCaretLeft] = useState(14);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);
  const canvasRef = useRef(null);

  // Measure text width using offscreen canvas with matching computed font
  const measureTextWidth = (textToCursor, inputEl) => {
    if (!inputEl) return 0;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return 0;

    const style = window.getComputedStyle(inputEl);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return ctx.measureText(textToCursor).width;
  };

  const updateCaretPosition = () => {
    const input = inputRef.current;
    if (!input) return;

    const cursorIndex = input.selectionStart ?? (value ? String(value).length : 0);
    const style = window.getComputedStyle(input);
    const paddingLeft = parseFloat(style.paddingLeft) || 14;

    // For password input, convert string to bullet characters of same length
    const displayedText = type === 'password'
      ? '•'.repeat(cursorIndex)
      : String(value || '').slice(0, cursorIndex);

    const textWidth = measureTextWidth(displayedText, input);
    // Scroll offset adjustment
    const scrollLeft = input.scrollLeft || 0;

    // Clamp caret position within visible input bounds so it never spills over on mobile
    const inputWidth = input.clientWidth || 300;
    const maxCaretLeft = Math.max(paddingLeft, inputWidth - 12);
    const calculatedLeft = paddingLeft + textWidth - scrollLeft;

    setCaretLeft(Math.min(maxCaretLeft, Math.max(paddingLeft, calculatedLeft)));
  };

  useLayoutEffect(() => {
    updateCaretPosition();
  }, [value, type]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleSelectionChange = () => {
      if (document.activeElement === input) {
        updateCaretPosition();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [value, type]);

  const handleInputChange = (e) => {
    setIsTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    if (onChange) onChange(e);
  };

  return (
    <div className={`skiper106-input-wrapper ${isFocused ? 'is-focused' : ''} ${wrapperClassName}`}>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleInputChange}
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
        name={name}
        id={id}
        className={`skiper106-input-field ${className}`}
        {...restProps}
      />

      {/* Smooth Spring Caret (Hidden when input is blurred) */}
      {isFocused && (
        <span 
          className={`skiper106-smooth-caret ${isTyping ? 'is-typing' : 'is-idle'}`}
          style={{ transform: `translate3d(${caretLeft}px, -50%, 0)` }}
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
}
