import React, { useEffect } from 'react';
import { Icons } from './AspirantIcons';

export default function ActivityNotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    if (!notification) return;
    // Auto-dismiss after 6 seconds if not permanent
    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isTimerLogged = notification.type === 'timer_logged';
  const isUnsavedWarning = notification.type === 'unsaved_warning';
  const isAutoSaved = notification.type === 'auto_saved';

  return (
    <div className={`activity-toast-banner animate-slide-up ${notification.type || ''}`}>
      <div className="activity-toast-content">
        <div className="activity-toast-icon">
          {isTimerLogged ? (
            <Icons.CheckCircle size={18} color="#22c55e" />
          ) : isUnsavedWarning ? (
            <Icons.AlertCircle size={18} color="#f59e0b" />
          ) : (
            <Icons.Cloud size={18} color="#38bdf8" />
          )}
        </div>
        <div className="activity-toast-text">
          <div className="activity-toast-title">
            {notification.title}
          </div>
          <div className="activity-toast-subtitle">
            {notification.message}
          </div>
        </div>
      </div>

      <div className="activity-toast-actions">
        {notification.actionLabel && notification.onAction && (
          <button 
            className="activity-toast-btn-action"
            onClick={notification.onAction}
          >
            {notification.actionLabel}
          </button>
        )}
        <button 
          className="activity-toast-btn-dismiss"
          onClick={onDismiss}
          title="Dismiss notice"
        >
          <Icons.X size={14} />
        </button>
      </div>
    </div>
  );
}
