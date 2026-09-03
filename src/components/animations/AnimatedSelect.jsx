import React, { useState, useRef, useEffect } from 'react';

/**
 * AnimatedSelect - Modern, Luxury Animated Dropdown Component
 * Features:
 * - Fluid trigger button with hover glow and rotating vector chevron
 * - Spring slide-down fade-in glassmorphic dropdown menu
 * - Hover elevation and slide effect on option items
 * - Animated vector SVG checkmark for active item (Zero-Emoji policy compliant)
 * - Click-outside and Escape key dismissal
 * - Fully responsive for both mobile touch and desktop cursor
 */
export default function AnimatedSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  wrapperClassName = '',
  name,
  id,
  size = 'medium' // 'small' | 'medium' | 'large'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options array into [{ value, label, badge }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return {
      value: opt.value,
      label: opt.label || opt.value,
      badge: opt.badge,
      icon: opt.icon
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    value: value || '',
    label: value || placeholder
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optVal) => {
    if (disabled) return;
    if (onChange) {
      // Support both event-like signature and direct value signature
      onChange({ target: { value: optVal, name } });
    }
    setIsOpen(false);
  };

  return (
    <div 
      className={`animated-select-container ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${wrapperClassName}`}
      ref={containerRef}
    >
      {/* Hidden input for standard form submission */}
      {name && <input type="hidden" name={name} value={value || ''} />}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        className={`animated-select-trigger ${size} ${className}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-content">
          {selectedOption.icon && (
            <span className="trigger-icon">{selectedOption.icon}</span>
          )}
          <span className="trigger-label">{selectedOption.label}</span>
          {selectedOption.badge && (
            <span className="trigger-badge">{selectedOption.badge}</span>
          )}
        </div>

        {/* Smooth Rotating Vector Chevron */}
        <div className={`trigger-chevron ${isOpen ? 'is-rotated' : ''}`} aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Animated Dropdown Menu Panel */}
      {isOpen && (
        <div 
          className="animated-select-menu"
          role="listbox"
          tabIndex={-1}
        >
          <div className="menu-scroll-container">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`animated-select-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className="option-label-wrap">
                    {opt.icon && <span className="option-icon">{opt.icon}</span>}
                    <span className="option-text">{opt.label}</span>
                    {opt.badge && <span className="option-badge">{opt.badge}</span>}
                  </div>

                  {/* Animated Vector Checkmark */}
                  {isSelected && (
                    <div className="option-check-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
