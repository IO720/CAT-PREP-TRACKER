import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './AspirantIcons';

/**
 * TermsAndPrivacyModal
 * Inspired by Skiper UI 60 (https://skiper-ui.com/v1/skiper60)
 * Side Scroll Navigation for Terms of Service, Ownership, Basic Free License & System Requirements.
 * Features:
 * - Sticky sidebar navigation with animated active section indicator
 * - Real-time scroll observation
 * - Official Site Ownership Declaration & Basic Free User License
 */

const SECTIONS = [
  {
    id: 'system-requirements',
    title: '1. System Requirements',
    badge: 'SPECS'
  },
  {
    id: 'platform-ownership',
    title: '2. Ownership & Copyright',
    badge: 'LEGAL'
  },
  {
    id: 'free-license',
    title: '3. Basic Free License',
    badge: 'LICENSE'
  },
  {
    id: 'data-privacy',
    title: '4. Privacy & Local Storage',
    badge: 'SECURITY'
  },
  {
    id: 'community-lounge',
    title: '5. Lounge & Conduct',
    badge: 'COMMUNITY'
  },
  {
    id: 'disclaimers',
    title: '6. Fair Use & Disclaimers',
    badge: 'TERMS'
  }
];

export default function TermsAndPrivacyModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('system-requirements');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop + 100;
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

  if (!isOpen) return null;

  const scrollToSection = (id) => {
    setActiveSection(id);
    const target = document.getElementById(id);
    const container = scrollContainerRef.current;
    if (target && container) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: target.offsetTop - 16,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = target.offsetTop - 16;
      }
    }
  };

  return createPortal(
    <div className="skiper-tos-backdrop" onClick={onClose}>
      <div 
        className="skiper-tos-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="skiper-tos-header">
          <div className="tos-header-brand">
            <div className="tos-shield-icon">
              <Icons.Shield size={18} />
            </div>
            <div>
              <h2 className="tos-modal-title">Terms of Service & Licensing</h2>
              <span className="tos-modal-subtitle">CATalyze Platform Architecture & Legal Framework</span>
            </div>
          </div>
          <button 
            type="button" 
            className="tos-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Dual Column Side-Scroll Navigation Layout */}
        <div className="skiper-tos-body">
          {/* Left Sticky Sidebar Navigation */}
          <aside className="skiper-tos-sidebar">
            <div className="tos-nav-title">SECTIONS</div>
            <nav className="tos-sidebar-nav">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`tos-nav-item ${activeSection === sec.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(sec.id)}
                >
                  <span className="tos-nav-indicator" />
                  <span className="tos-nav-label">{sec.title}</span>
                  <span className="tos-nav-badge">{sec.badge}</span>
                </button>
              ))}
            </nav>
            <div className="tos-sidebar-footer">
              <span className="tos-version-tag">VER 1.0.80 • 2026</span>
            </div>
          </aside>

          {/* Right Scrollable Content Area */}
          <main className="skiper-tos-content" ref={scrollContainerRef}>
            
            {/* Section 1: System Requirements */}
            <section id="system-requirements" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-badge">SPECS</span>
                <h3 className="tos-sec-title">1. System Requirements & Architecture</h3>
              </div>
              <p>
                CATalyze is engineered as a modern, progressive local-first web application. It runs natively across all modern web browsers supporting ECMAScript 2022+ and Web Animations API.
              </p>
              <div className="tos-card-grid">
                <div className="tos-spec-card">
                  <strong>Supported Browsers:</strong>
                  <span>Google Chrome 110+, Apple Safari 16+, Mozilla Firefox 115+, Microsoft Edge 110+</span>
                </div>
                <div className="tos-spec-card">
                  <strong>Mobile Support:</strong>
                  <span>Fully responsive iOS Safari & Android Chrome with touch gesture navigation and PWA support.</span>
                </div>
                <div className="tos-spec-card">
                  <strong>Hardware Acceleration:</strong>
                  <span>60/120fps GSAP physics rendering with zero-re-render custom hardware reticles.</span>
                </div>
              </div>
            </section>

            {/* Section 2: Platform Ownership & Copyright */}
            <section id="platform-ownership" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-badge">LEGAL</span>
                <h3 className="tos-sec-title">2. Ownership & Intellectual Property</h3>
              </div>
              <p className="tos-highlight-quote">
                "I own this site and all associated proprietary digital assets."
              </p>
              <p>
                The CATalyze platform, including but not limited to the user interface designs, custom vector iconography, cat companion character illustrations, automated quota verification algorithms, 16-week study schedule frameworks, and source architecture, is the exclusive intellectual property of the site owner and developer.
              </p>
              <p>
                Unauthorized commercial resale, distribution, mass scraping, or repackaging of this platform without explicit prior written authorization is strictly prohibited.
              </p>
            </section>

            {/* Section 3: Basic Free License */}
            <section id="free-license" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-badge">LICENSE</span>
                <h3 className="tos-sec-title">3. Basic Free User License</h3>
              </div>
              <p>
                The owner grants every aspirant a <strong>free, worldwide, non-exclusive, non-transferable personal license</strong> to use the CATalyze Tracker platform for educational, non-commercial self-preparation for the Common Admission Test (CAT) and allied management examinations.
              </p>
              <ul className="tos-list">
                <li><strong>Free Access:</strong> Access to all 16 curriculum weeks, daily quota tracking, focus timer suites, and local study rooms is 100% free.</li>
                <li><strong>Your Data Ownership:</strong> You retain complete ownership of all study sessions, question counts, mock scores, and journal notes you record on this site.</li>
                <li><strong>Full Portability:</strong> You may export your entire study history as a raw JSON backup at any time from the Settings menu.</li>
              </ul>
            </section>

            {/* Section 4: Privacy & Local Storage */}
            <section id="data-privacy" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-badge">SECURITY</span>
                <h3 className="tos-sec-title">4. Privacy & Local-First Storage</h3>
              </div>
              <p>
                CATalyze operates under a privacy-first doctrine. Essential study data is stored primarily on your own device using <code>localStorage</code> and IndexedDB.
              </p>
              <p>
                When cloud sync is activated via Google Firebase Authentication, your preparation metrics are transmitted securely over SSL/TLS and stored in isolated user Firestore document vaults. We do not sell, rent, or trade your telemetry data or study habits to advertising aggregators.
              </p>
            </section>

            {/* Section 5: Study Lounge & Community Guidelines */}
            <section id="community-lounge" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-badge">COMMUNITY</span>
                <h3 className="tos-sec-title">5. Study Lounge & Community Conduct</h3>
              </div>
              <p>
                The Live Study Lounge is a collaborative digital sanctuary designed to foster focus, mutual encouragement, and shared discipline among aspirants. Users agree to engage with respect, abstain from harassment or advertising, and preserve a clean learning atmosphere.
              </p>
            </section>

            {/* Section 6: Disclaimers & Fair Use */}
            <section id="disclaimers" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-badge">TERMS</span>
                <h3 className="tos-sec-title">6. Educational Fair Use & Disclaimers</h3>
              </div>
              <p>
                CATalyze is an independent student study suite and is not officially affiliated with, endorsed by, or sponsored by the Indian Institutes of Management (IIMs) or the CAT Convening Committee. Suggested percentile benchmarks, drill allocations, and syllabi are derived from public exam formats for analytical preparation guidance.
              </p>
            </section>

          </main>
        </div>

        {/* Footer */}
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
