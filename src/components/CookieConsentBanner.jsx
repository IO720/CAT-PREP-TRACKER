import React, { useState, useEffect } from 'react';
import { Icons } from './AspirantIcons';

export default function CookieConsentBanner({ onOpenTerms }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cat_storage_consent');
      if (!consent) {
        // Show after a brief delay for a polished experience
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cat_storage_consent', 'accepted');
    } catch (e) {}
    setShowBanner(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('cat_storage_consent', 'dismissed');
    } catch (e) {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-banner-content">
        <div className="cookie-icon-wrap">
          <Icons.Shield size={20} color="#38bdf8" />
        </div>
        <div className="cookie-text-wrap">
          <p className="cookie-title">
            <strong>Local Storage, Cache & Privacy Notice</strong>
          </p>
          <p className="cookie-desc">
            CATalyze uses browser cookies, cache, and local storage to save your preparation progress, account authentication, active study timers, and message history locally for fast offline access.
          </p>
        </div>
      </div>

      <div className="cookie-banner-actions">
        <button 
          type="button" 
          className="cookie-link-btn"
          onClick={onOpenTerms}
        >
          <span>Privacy Policy & Terms</span>
        </button>
        <button 
          type="button" 
          className="btn-secondary cookie-dismiss-btn"
          onClick={handleDismiss}
        >
          <span>Essential Only</span>
        </button>
        <button 
          type="button" 
          className="btn-primary cookie-accept-btn"
          onClick={handleAccept}
        >
          <span>Accept & Enable Caching</span>
        </button>
      </div>
    </div>
  );
}
