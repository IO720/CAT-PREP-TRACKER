import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { stripEmojis } from '../utils/textUtils';

/**
 * Converts 12-hour time string (e.g. "09:55 PM" or "9:55 pm") to 24-hour "HH:MM"
 */
function to24Hour(timeStr) {
  if (!timeStr) return '';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Converts 24-hour "HH:MM" to 12-hour "hh:mm AM/PM"
 */
function to12Hour(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return time24;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export default function EditSessionModal({
  isOpen,
  session,
  onClose,
  onSave
}) {
  if (!isOpen || !session) return null;

  const [subject, setSubject] = useState(session.subject || 'General');
  const [durationMinutes, setDurationMinutes] = useState(session.durationMinutes || 1);
  const [startTime24, setStartTime24] = useState(to24Hour(session.startTime || ''));
  const [endTime24, setEndTime24] = useState(to24Hour(session.endTime || ''));
  const [notes, setNotes] = useState(session.notes || '');

  useEffect(() => {
    if (session) {
      setSubject(session.subject || 'General');
      setDurationMinutes(Number(session.durationMinutes) || 1);
      setStartTime24(to24Hour(session.startTime || ''));
      setEndTime24(to24Hour(session.endTime || ''));
      setNotes(session.notes || '');
    }
  }, [session]);

  // Handle duration changes: update duration and auto-calculate endTime
  const updateDuration = (newMins) => {
    const validMins = Math.max(1, Math.min(720, parseInt(newMins, 10) || 1));
    setDurationMinutes(validMins);

    // Auto-calculate endTime if startTime is set
    if (startTime24) {
      const [sh, sm] = startTime24.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm)) {
        const totalStartMins = sh * 60 + sm;
        const totalEndMins = (totalStartMins + validMins) % (24 * 60);
        const eh = String(Math.floor(totalEndMins / 60)).padStart(2, '0');
        const em = String(totalEndMins % 60).padStart(2, '0');
        setEndTime24(`${eh}:${em}`);
      }
    }
  };

  const handleStepMinutes = (delta) => {
    updateDuration(durationMinutes + delta);
  };

  // Handle time changes: auto-calculate duration
  const handleTimeChange = (type, newTime) => {
    const nextStart = type === 'start' ? newTime : startTime24;
    const nextEnd = type === 'end' ? newTime : endTime24;

    if (type === 'start') setStartTime24(newTime);
    if (type === 'end') setEndTime24(newTime);

    if (nextStart && nextEnd) {
      const [sh, sm] = nextStart.split(':').map(Number);
      const [eh, em] = nextEnd.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff < 0) diff += 24 * 60; // crossed midnight
        if (diff > 0 && diff <= 720) {
          setDurationMinutes(diff);
        }
      }
    }
  };

  const handleDurationKeyDown = (e) => {
    // Restrict typing: only digits, backspace, delete, tab, arrows
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleDurationInputChange = (e) => {
    const cleanVal = e.target.value.replace(/\D/g, '');
    if (cleanVal === '') {
      setDurationMinutes('');
    } else {
      updateDuration(cleanVal);
    }
  };

  const handleDurationBlur = () => {
    if (!durationMinutes || durationMinutes < 1) {
      updateDuration(1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalMins = Math.max(1, parseInt(durationMinutes, 10) || 1);
    onSave(session.id, {
      subject: stripEmojis(subject),
      durationMinutes: finalMins,
      startTime: to12Hour(startTime24).trim(),
      endTime: to12Hour(endTime24).trim(),
      notes: stripEmojis(notes)
    });
    onClose();
  };

  const calculatedHours = (Math.max(1, parseInt(durationMinutes, 10) || 1) / 60).toFixed(1);

  return createPortal(
    <div 
      className="edit-session-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-session-title"
    >
      <div 
        className="edit-session-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="edit-session-head">
          <div className="edit-session-head-left">
            <span className="edit-session-badge">Correction</span>
            <h2 id="edit-session-title" className="edit-session-title">
              Edit Recorded Session
            </h2>
          </div>
          <button 
            type="button" 
            className="edit-session-close-btn"
            onClick={onClose}
            title="Close"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-session-body">
          <p className="edit-session-hint">
            Forgot to start the timer, or stopped it early? Adjust your duration and details below so your study telemetry stays 100% accurate.
          </p>

          {/* Subject Selector */}
          <div className="edit-form-group">
            <label className="edit-form-label">Subject</label>
            <div className="edit-subject-pills">
              {['Quant', 'LRDI', 'VARC', 'General'].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`edit-subj-pill ${subject.toLowerCase() === s.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSubject(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Duration in Minutes with Quick Stepper */}
          <div className="edit-form-group">
            <div className="edit-label-row">
              <label htmlFor="edit-duration-input" className="edit-form-label">Study Duration</label>
              <span className="edit-hours-preview font-mono">
                {calculatedHours} {Number(calculatedHours) === 1 ? 'hr' : 'hrs'}
              </span>
            </div>

            <div className="edit-stepper-box">
              <div className="edit-input-stepper-wrap">
                <button 
                  type="button" 
                  className="edit-step-btn"
                  onClick={() => handleStepMinutes(-5)}
                  title="Decrease 5 mins"
                >
                  -5
                </button>
                <button 
                  type="button" 
                  className="edit-step-btn"
                  onClick={() => handleStepMinutes(-1)}
                  title="Decrease 1 min"
                >
                  -1
                </button>

                <div className="edit-minutes-display">
                  <input
                    id="edit-duration-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="edit-duration-input font-mono"
                    value={durationMinutes}
                    onKeyDown={handleDurationKeyDown}
                    onChange={handleDurationInputChange}
                    onBlur={handleDurationBlur}
                    placeholder="Mins"
                  />
                  <span className="edit-mins-unit font-mono">mins</span>
                </div>

                <button 
                  type="button" 
                  className="edit-step-btn"
                  onClick={() => handleStepMinutes(1)}
                  title="Increase 1 min"
                >
                  +1
                </button>
                <button 
                  type="button" 
                  className="edit-step-btn"
                  onClick={() => handleStepMinutes(5)}
                  title="Increase 5 mins"
                >
                  +5
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="edit-quick-presets">
                {[15, 25, 45, 60, 90, 120].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    className={`edit-preset-chip ${Number(durationMinutes) === mins ? 'selected' : ''}`}
                    onClick={() => updateDuration(mins)}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Range with Auto-Calculate and Overflow Prevention */}
          <div className="edit-form-group">
            <label className="edit-form-label">Time Interval (Auto-Calculated)</label>
            <div className="edit-time-range-row">
              <div className="edit-time-input-wrap">
                <input
                  type="time"
                  className="edit-time-input font-mono"
                  value={startTime24}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  title="Start Time"
                />
              </div>
              <span className="edit-time-separator">to</span>
              <div className="edit-time-input-wrap">
                <input
                  type="time"
                  className="edit-time-input font-mono"
                  value={endTime24}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  title="End Time"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="edit-form-group">
            <label htmlFor="edit-notes-input" className="edit-form-label">Session Notes & Errors</label>
            <textarea
              id="edit-notes-input"
              className="edit-notes-textarea"
              placeholder="Formulas covered, tricky questions, or reason for adjusting time..."
              value={notes}
              onChange={(e) => setNotes(stripEmojis(e.target.value))}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="edit-modal-actions">
            <button 
              type="button" 
              className="edit-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="edit-save-btn"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
