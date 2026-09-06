import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icons } from './AspirantIcons';

/**
 * ThemedDatePicker - High-tech, dark glassmorphic datepicker
 * Replaces native browser date inputs with a cyberpunk/glassmorphic calendar popup.
 * Zero emojis, fully responsive, and adheres to CATalyze design tokens.
 */
export default function ThemedDatePicker({
  value = '',
  onChange,
  className = '',
  placeholder = 'Select start date'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current selected date or fallback to today
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  }, [value]);

  // Current view month & year state
  const [viewYear, setViewYear] = useState(() => {
    return selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    return selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  });

  // When selectedDate changes externally, sync view
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Handle click outside to close popover
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayShorts = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generate calendar days for current view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: viewMonth === 0 ? 11 : viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true
      });
    }

    // Next month padding days to complete 6-week (42 cell) or 5-week grid
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: viewMonth === 11 ? 0 : viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        isCurrentMonth: false
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Today comparison
  const today = useMemo(() => new Date(), []);
  const isToday = (y, m, d) => {
    return today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
  };

  const isSelected = (y, m, d) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === y && selectedDate.getMonth() === m && selectedDate.getDate() === d;
  };

  const formatOutputDate = (y, m, d) => {
    const monthStr = String(m + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    return `${y}-${monthStr}-${dayStr}`;
  };

  const handleSelectDay = (cell) => {
    const dateStr = formatOutputDate(cell.year, cell.month, cell.day);
    if (onChange) {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    setViewYear(y);
    setViewMonth(m);
    if (onChange) {
      onChange(formatOutputDate(y, m, d));
    }
    setIsOpen(false);
  };

  // Formatted trigger label
  const formattedDisplayValue = useMemo(() => {
    if (!selectedDate) return placeholder;
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${m}/${d}/${y}`;
  }, [selectedDate, placeholder]);

  return (
    <div className={`themed-date-picker-wrap ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`themed-date-picker-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Select preparation start date"
      >
        <div className="themed-date-trigger-content">
          <Icons.Calendar size={15} className="themed-date-cal-icon" />
          <span className="themed-date-val-text">{formattedDisplayValue}</span>
        </div>
        <Icons.ChevronDown 
          size={14} 
          className={`themed-date-arrow ${isOpen ? 'open' : ''}`} 
        />
      </button>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="themed-date-popover" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="themed-date-header">
            <button
              type="button"
              className="themed-date-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              title="Previous month"
            >
              <Icons.ChevronLeft size={16} />
            </button>

            <div className="themed-date-title">
              <span className="themed-date-month">{monthNames[viewMonth]}</span>
              <span className="themed-date-year">{viewYear}</span>
            </div>

            <button
              type="button"
              className="themed-date-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
              title="Next month"
            >
              <Icons.ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="themed-date-weekdays-row">
            {weekdayShorts.map(short => (
              <span key={short} className="themed-date-weekday-label">
                {short}
              </span>
            ))}
          </div>

          {/* Grid of Days */}
          <div className="themed-date-grid">
            {calendarDays.map((cell, idx) => {
              const selected = isSelected(cell.year, cell.month, cell.day);
              const currentDay = isToday(cell.year, cell.month, cell.day);

              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  type="button"
                  className={`themed-date-cell ${!cell.isCurrentMonth ? 'outside' : ''} ${selected ? 'selected' : ''} ${currentDay ? 'today' : ''}`}
                  onClick={() => handleSelectDay(cell)}
                  aria-label={`${monthNames[cell.month]} ${cell.day}, ${cell.year}`}
                >
                  <span className="themed-date-number">{cell.day}</span>
                  {currentDay && !selected && <span className="themed-date-today-dot" />}
                </button>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="themed-date-footer">
            <button
              type="button"
              className="themed-date-action-btn secondary"
              onClick={handleSelectToday}
            >
              <Icons.Clock size={12} />
              <span>Today</span>
            </button>
            <button
              type="button"
              className="themed-date-action-btn primary"
              onClick={() => setIsOpen(false)}
            >
              <Icons.Check size={12} />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
