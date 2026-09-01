import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './AspirantIcons';

/**
 * TermsAndPrivacyModal - Side Scroll Navigation
 * 100% Inspired by Skiper UI 60 (https://skiper-ui.com/v1/skiper60#system-requirements)
 * Features:
 * - Clean sticky sidebar navigation with animated active section indicator & badges
 * - Smooth scroll-triggered section tracking with IntersectionObserver
 * - High-tech Bento grid cards for System Requirements & Architecture
 * - Prominent, elegant Ownership & Intellectual Property declaration
 * - Free License & Local-First Privacy architecture breakdown
 */

const SECTIONS = [
  {
    id: 'system-requirements',
    num: '01',
    title: 'System Requirements',
    badge: 'SPECS'
  },
  {
    id: 'platform-ownership',
    num: '02',
    title: 'Ownership & Copyright',
    badge: 'LEGAL'
  },
  {
    id: 'free-license',
    num: '03',
    title: 'Basic Free License',
    badge: 'LICENSE'
  },
  {
    id: 'data-privacy',
    num: '04',
    title: 'Privacy & Storage',
    badge: 'SECURITY'
  },
  {
    id: 'community-lounge',
    num: '05',
    title: 'Study Lounge & Conduct',
    badge: 'COMMUNITY'
  },
  {
    id: 'disclaimers',
    num: '06',
    title: 'Fair Use & Disclaimers',
    badge: 'TERMS'
  }
];

export default function TermsAndPrivacyModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('system-requirements');
  const scrollContainerRef = useRef(null);

  // Smooth scroll observation for active section highlighting
  useEffect(() => {
    if (!isOpen) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop + 120;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scrollToSection = (id) => {
    setActiveSection(id);
    const target = document.getElementById(id);
    const container = scrollContainerRef.current;
    if (target && container) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: target.offsetTop - 14,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = target.offsetTop - 14;
      }
    }
  };

  return createPortal(
    <div className="skiper-tos-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="skiper-tos-modal skiper60-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Skiper60 Header */}
        <div className="skiper-tos-header">
          <div className="tos-header-brand">
            <div className="tos-shield-icon">
              <Icons.Shield size={18} />
            </div>
            <div>
              <div className="tos-protocol-tag">// CATALYZE ARCHITECTURE & LEGAL</div>
              <h2 className="tos-modal-title">Terms of Service & Licensing</h2>
            </div>
          </div>
          <button 
            type="button" 
            className="tos-modal-close-btn"
            onClick={onClose}
            title="Close"
            aria-label="Close modal"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Skiper60 Dual-Column Body */}
        <div className="skiper-tos-body">
          {/* Left Sticky Sidebar Navigation */}
          <aside className="skiper-tos-sidebar">
            <div className="tos-nav-title">// SECTIONS NAVIGATION</div>
            <nav className="tos-sidebar-nav">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    className={`tos-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => scrollToSection(sec.id)}
                  >
                    <span className="tos-nav-num font-mono">{sec.num}</span>
                    <span className="tos-nav-label">{sec.title}</span>
                    <span className="tos-nav-badge">{sec.badge}</span>
                  </button>
                );
              })}
            </nav>
            <div className="tos-sidebar-footer">
              <span className="tos-version-tag font-mono">CATALYZE // ARCHITECTURE • 2026</span>
            </div>
          </aside>

          {/* Right Scrollable Content Pane */}
          <main className="skiper-tos-content" ref={scrollContainerRef}>
            
            {/* Section 1: System Requirements & Architecture */}
            <section id="system-requirements" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">01</span>
                <span className="tos-sec-badge">SPECS</span>
                <h3 className="tos-sec-title">System Requirements & Architecture</h3>
              </div>
              <p className="tos-sec-lead">
                CATalyze is engineered as an ultra-responsive, progressive local-first web application. It runs natively across all modern web browsers supporting ECMAScript 2022+ and Web Animations API.
              </p>
              
              <div className="tos-card-grid">
                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">BROWSERS</span>
                    <strong>Supported Browsers</strong>
                  </div>
                  <p>Google Chrome 110+, Apple Safari 16+, Mozilla Firefox 115+, Microsoft Edge 110+ with WebKit and Chromium engines.</p>
                </div>

                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">PLATFORM</span>
                    <strong>Local-First Engine</strong>
                  </div>
                  <p>Zero network dependencies for offline core operations. Local storage caching preserves uninterrupted focus drills.</p>
                </div>

                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">PHYSICS</span>
                    <strong>Hardware Acceleration</strong>
                  </div>
                  <p>60/120fps GPU accelerated rendering with zero-re-render custom reticles and smooth canvas heatmaps.</p>
                </div>

                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">MOBILE</span>
                    <strong>Mobile & Tablet</strong>
                  </div>
                  <p>Fully responsive iOS Safari & Android Chrome with touch gesture navigation and PWA installation support.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Platform Ownership & Intellectual Property */}
            <section id="platform-ownership" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">02</span>
                <span className="tos-sec-badge">LEGAL</span>
                <h3 className="tos-sec-title">Ownership & Intellectual Property</h3>
              </div>

              <div className="tos-ownership-banner">
                <div className="tos-ownership-quote">
                  "I own this site and all associated proprietary digital assets."
                </div>
                <div className="tos-ownership-author font-mono">
                  // EXCLUSIVE CREATOR RIGHTS RESERVED
                </div>
              </div>

              <p>
                The CATalyze platform, including but not limited to the user interface designs, custom vector iconography, mascot character illustrations, automated quota verification algorithms, 16-week study schedule frameworks, and source architecture, is the exclusive intellectual property of the site owner and developer.
              </p>
              <p>
                Unauthorized commercial resale, distribution, mass scraping, or repackaging of this platform without explicit prior written authorization is strictly prohibited.
              </p>
            </section>

            {/* Section 3: Basic Free User License */}
            <section id="free-license" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">03</span>
                <span className="tos-sec-badge">LICENSE</span>
                <h3 className="tos-sec-title">Basic Free User License</h3>
              </div>
              <p className="tos-sec-lead">
                The owner grants every aspirant a <strong>free, worldwide, non-exclusive, non-transferable personal license</strong> to use the CATalyze Tracker platform for educational, non-commercial self-preparation for the Common Admission Test (CAT) and allied management examinations.
              </p>
              
              <div className="tos-license-grid">
                <div className="tos-license-item">
                  <div className="tos-license-icon-box">
                    <Icons.Check size={16} />
                  </div>
                  <div>
                    <strong>100% Free Forever</strong>
                    <p>Access to all 16 curriculum weeks, daily quota tracking, focus timer suites, and local study rooms is 100% free.</p>
                  </div>
                </div>

                <div className="tos-license-item">
                  <div className="tos-license-icon-box">
                    <Icons.Shield size={16} />
                  </div>
                  <div>
                    <strong>Complete Data Ownership</strong>
                    <p>You retain complete ownership of all study sessions, question counts, mock scores, and journal notes you record on this site.</p>
                  </div>
                </div>

                <div className="tos-license-item">
                  <div className="tos-license-icon-box">
                    <Icons.Download size={16} />
                  </div>
                  <div>
                    <strong>Full JSON Portability</strong>
                    <p>You may export your entire study history as a raw JSON backup at any time from the Settings menu.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Privacy & Local-First Storage */}
            <section id="data-privacy" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">04</span>
                <span className="tos-sec-badge">SECURITY</span>
                <h3 className="tos-sec-title">Privacy & Local-First Storage</h3>
              </div>
              <p>
                CATalyze operates under a strict privacy-first doctrine. Essential study data is stored primarily on your own device using <code>localStorage</code> and IndexedDB.
              </p>
              <p>
                When cloud sync is activated via Google Firebase Authentication, your preparation metrics are transmitted securely over SSL/TLS and stored in isolated user Firestore document vaults. We do not sell, rent, or trade your telemetry data or study habits to advertising aggregators.
              </p>
            </section>

            {/* Section 5: Study Lounge & Community Conduct */}
            <section id="community-lounge" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">05</span>
                <span className="tos-sec-badge">COMMUNITY</span>
                <h3 className="tos-sec-title">Study Lounge & Community Conduct</h3>
              </div>
              <p>
                The Live Study Lounge is a collaborative digital sanctuary designed to foster focus, mutual encouragement, and shared discipline among aspirants. Users agree to engage with respect, abstain from harassment or advertising, and preserve a clean learning atmosphere.
              </p>
            </section>

            {/* Section 6: Disclaimers & Fair Use */}
            <section id="disclaimers" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">06</span>
                <span className="tos-sec-badge">TERMS</span>
                <h3 className="tos-sec-title">Educational Fair Use & Disclaimers</h3>
              </div>
              <p>
                CATalyze is an independent student study suite and is not officially affiliated with, endorsed by, or sponsored by the Indian Institutes of Management (IIMs) or the CAT Convening Committee. Suggested percentile benchmarks, drill allocations, and syllabi are derived from public exam formats for analytical preparation guidance.
              </p>
            </section>

          </main>
        </div>

        {/* Skiper60 Footer */}
        <div className="skiper-tos-footer">
          <span className="tos-footer-note">
            By using CATalyze Tracker, you acknowledge and agree to these terms.
          </span>
          <button 
            type="button" 
            className="tos-confirm-btn"
            onClick={onClose}
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
