import React from 'react';
import { Icons } from './AspirantIcons';

export default function TermsAndPrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="aspirant-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="aspirant-modal-box terms-privacy-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="aspirant-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
              <Icons.Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>Terms of Service & Privacy Policy</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>CATalyze Preparation Tracker & Study Lounge</p>
            </div>
          </div>
          <button 
            type="button" 
            className="aspirant-modal-close-btn"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="terms-privacy-content" style={{ padding: '20px 24px', overflowY: 'auto', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginTop: 0, marginBottom: '6px', fontSize: '14px' }}>1. Local Storage, Cookies & Offline Cache</h4>
          <p>
            CATalyze uses browser <code>localStorage</code> and session storage to keep your preparation drills, active focus timers, question quotas, and recent chat history fast and accessible offline. No unnecessary tracking cookies or third-party advertising cookies are stored.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '16px', marginBottom: '6px', fontSize: '14px' }}>2. Data Collection & Cloud Sync</h4>
          <p>
            When you sign in with Google or Email, your preparation metrics (Quant/LRDI/VARC questions solved, mock test percentiles, study streaks, and badges) are securely synced with Google Firebase Firestore to enable multi-device synchronization and mutual study buddy progress tracking.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '16px', marginBottom: '6px', fontSize: '14px' }}>3. Study Lounge & Chat Privacy</h4>
          <p>
            - <strong>Public Study Hall:</strong> Messages sent in public channels (e.g. <code>#general-hall</code>, <code>#quant-sprints</code>) are visible to connected CAT aspirants.
            <br />
            - <strong>Personal Connections & DMs:</strong> Direct 1-on-1 chats and buddy circle rooms are routed privately between you and your mutual study buddies.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '16px', marginBottom: '6px', fontSize: '14px' }}>4. Offline Timer & Interruption Handling</h4>
          <p>
            If your connection is lost or the browser tab closes during an active focus sprint, your timer state is preserved locally and reconciled upon return to ensure zero study minutes are lost.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '16px', marginBottom: '6px', fontSize: '14px' }}>5. User Rights & Data Export</h4>
          <p>
            You retain 100% ownership of your study records. You can export your full preparation backup at any time from the Settings tab in JSON format, or permanently reset your cloud profile.
          </p>
        </div>

        <div className="aspirant-modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '8px' }}
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
