import React from 'react';
import { applyInstantUpdate } from '../utils/versionCheck';
import { Icons } from './AspirantIcons';

export default function UpdateNotificationToast({ updateData, onDismiss, onOpenPatchNotes }) {
  if (!updateData) return null;

  return (
    <div className="update-toast-banner animate-slide-up">
      <div className="update-toast-content">
        <div className="update-toast-icon">
          <Icons.Sparkles size={16} color="#3b82f6" />
        </div>
        <div className="update-toast-text">
          <div className="update-toast-title">
            New App Update (v{updateData.version})
          </div>
          <div className="update-toast-subtitle">
            {updateData.releaseNotes || 'New features, security hardening, and UI improvements are ready.'}
          </div>
        </div>
      </div>
      <div className="update-toast-actions">
        {onOpenPatchNotes && (
          <button
            type="button"
            className="update-toast-btn-notes"
            onClick={onOpenPatchNotes}
            style={{
              padding: '6px 10px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Patch Notes
          </button>
        )}
        <button 
          className="update-toast-btn-apply"
          onClick={() => applyInstantUpdate(updateData.version)}
        >
          Update Now
        </button>
        <button 
          className="update-toast-btn-dismiss"
          onClick={onDismiss}
          title="Dismiss for now"
        >
          <Icons.X size={14} />
        </button>
      </div>
    </div>
  );
}
