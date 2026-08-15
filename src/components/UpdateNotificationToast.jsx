import React from 'react';
import { applyInstantUpdate } from '../utils/versionCheck';

export default function UpdateNotificationToast({ updateData, onDismiss }) {
  if (!updateData) return null;

  return (
    <div className="update-toast-banner animate-slide-up">
      <div className="update-toast-content">
        <div className="update-toast-icon">🚀</div>
        <div className="update-toast-text">
          <div className="update-toast-title">
            New App Update (v{updateData.version})
          </div>
          <div className="update-toast-subtitle">
            {updateData.releaseNotes || 'New features and UI improvements are ready.'}
          </div>
        </div>
      </div>
      <div className="update-toast-actions">
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
          ✕
        </button>
      </div>
    </div>
  );
}
