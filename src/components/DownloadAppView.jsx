import React, { useState } from 'react';

const DownloadAppView = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadDone, setDownloadDone] = useState(false);

  const handleTriggerDownload = () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadDone(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        setDownloadProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setDownloading(false);
          setDownloadDone(true);

          // Trigger file download from GitHub Raw
          const link = document.createElement('a');
          link.href = 'https://raw.githubusercontent.com/IO720/CAT-PREP-TRACKER/main/Aspiranto-v1.0.apk';
          link.download = 'Aspiranto-v1.0.apk';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 300);
      } else {
        setDownloadProgress(current);
      }
    }, 120);
  };

  return (
    <div className="download-app-container animate-fade-in">
      {/* Background Ambient Glow */}
      <div className="download-ambient-glow glow-1"></div>
      <div className="download-ambient-glow glow-2"></div>

      {/* Header Banner */}
      <header className="page-header text-center">
        <div className="badge-pill mb-2 animate-bounce-subtle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          Official Android & Mobile Release
        </div>
        <h1 className="header-title">Get Aspiranto for Android</h1>
        <p className="header-subtitle">
          Experience ultra-fluid exam preparation tracking, focus timers, and cloud sync directly on your smartphone.
        </p>
      </header>

      {/* Main Download Card & Phone Mockup Grid */}
      <div className="download-hero-grid">
        {/* Left Side: APK Download Card */}
        <div className="download-card glass-panel">
          <div className="download-card-header">
            <div className="app-brand-badge">
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="10" width="44" height="42" rx="10" fill="var(--accent-color)" stroke="currentColor" strokeWidth="3" />
                <path d="M18 18 H42 M18 24 H34" stroke="var(--bg-primary)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                <path d="M32 26 L35 34 L43 35 L37 41 L39 49 L32 44 L25 49 L27 41 L21 35 L29 34 Z" fill="#fbbf24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="download-app-name">Aspiranto Mobile</h2>
              <p className="download-app-version">Version 1.0.0 &bull; Android APK (4.4 MB)</p>
            </div>
          </div>

          <p className="download-desc">
            Direct standalone Android Package file (.apk). Installs smoothly on all Android devices (Android 7.0 and up). No app store login needed!
          </p>

          {/* Direct Download Button */}
          <div className="download-action-box">
            <button 
              className={`download-primary-btn ${downloading ? 'is-downloading' : ''} ${downloadDone ? 'is-done' : ''}`}
              onClick={handleTriggerDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <div className="download-spinner"></div>
                  <span>Preparing Download ({downloadProgress}%)...</span>
                </>
              ) : downloadDone ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Downloaded! Click to Download Again</span>
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download Android APK</span>
                </>
              )}
            </button>
            
            {downloading && (
              <div className="download-progress-bar-bg">
                <div className="download-progress-bar-fill" style={{ width: `${downloadProgress}%` }}></div>
              </div>
            )}
          </div>

          {/* Specs List */}
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Package Format</span>
              <span className="spec-value">Standalone APK</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">File Size</span>
              <span className="spec-value">4.42 MB</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Android OS</span>
              <span className="spec-value">7.0 or Newer</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Permissions</span>
              <span className="spec-value">Offline / Safe</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Animated Phone Showcase */}
        <div className="phone-showcase-panel glass-panel">
          <div className="phone-mockup-frame">
            <div className="phone-camera-notch"></div>
            <div className="phone-screen-content">
              <div className="phone-screen-header">
                <span className="phone-screen-title">Aspiranto Mobile</span>
                <span className="phone-screen-badge">PRO</span>
              </div>
              
              <div className="phone-timer-card">
                <div className="phone-ring-circle">
                  <span className="phone-timer-val">25:00</span>
                  <span className="phone-timer-sub">Focusing</span>
                </div>
              </div>

              <div className="phone-metrics-preview">
                <div className="phone-metric-pill">
                  <span className="metric-dot quant"></span> Quant: 85%
                </div>
                <div className="phone-metric-pill">
                  <span className="metric-dot lrdi"></span> LRDI: 92%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="features-grid-section">
        <h3 className="section-title text-center">Why You'll Love Aspiranto on Mobile</h3>
        
        <div className="features-cards-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h4>Radial Study & Focus Timer</h4>
            <p>Track your preparation sessions with ambient rain, forest, and coffee shop soundscapes directly from your mobile lockscreen.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
              </svg>
            </div>
            <h4>Automatic Cloud Backup</h4>
            <p>Seamlessly sync your study progress, mock scores, and error logs across mobile and desktop devices with Firebase cloud sync.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h4>9 Beautiful Theme Colors</h4>
            <p>Customize your preparation workspace with Sun Set, Dark Mode, Emerald, Sunset, Coral, and Midnight tones.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppView;
