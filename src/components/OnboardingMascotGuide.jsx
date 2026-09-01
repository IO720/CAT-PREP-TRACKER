import React from 'react';

/**
 * OnboardingMascotGuide
 * Minimal, theme-aligned Scholar Cat companion guide.
 * Displays an animated vector cat mascot with an organic speech bubble.
 * Zero-Emoji policy: 100% vector SVG art and icons.
 */
export default function OnboardingMascotGuide({
  currentStep = 1,
  selectedExamConfig,
  selectedHorizon,
  adjustedQuotas
}) {
  const getSpeech = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Select your target examination",
          detail: selectedExamConfig 
            ? `${selectedExamConfig.name} selected — calibrates ${selectedExamConfig.sections.map(s => s.shortName).join(', ')} syllabus & benchmarks.`
            : "Choose an exam to automatically calibrate your subject drill quotas."
        };
      case 2:
        return {
          title: "Choose your preparation horizon",
          detail: selectedHorizon
            ? `${selectedHorizon.label} (${selectedHorizon.badge}) — targets ${selectedHorizon.dailyHours} hrs/day with balanced weekly pacing.`
            : "Select your prep timeline to adjust daily study hours and drill intensity."
        };
      case 3:
      default:
        return {
          title: "Workspace calibration complete!",
          detail: `Daily Quotas: ${adjustedQuotas?.quant} ${selectedExamConfig?.sections?.[0]?.unit || 'Qs'}, ${adjustedQuotas?.lrdi} ${selectedExamConfig?.sections?.[1]?.unit || 'Sets'}, and ${adjustedQuotas?.varc} ${selectedExamConfig?.sections?.[2]?.unit || 'RCs'}. Ready to launch!`
        };
    }
  };

  const speech = getSpeech();

  return (
    <div className="mascot-bar-root" role="region" aria-label="Mascot Guide">
      {/* Animated Scholar Cat Vector */}
      <div className="mascot-cat-avatar">
        <div className="mascot-cat-glow" />
        <svg 
          viewBox="0 0 100 90" 
          className="mascot-cat-svg"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mascotSkinGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
              <stop offset="100%" stopColor="var(--accent-secondary, #818cf8)" />
            </linearGradient>
            <linearGradient id="mascotEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
            </linearGradient>
          </defs>

          {/* Shoulders / Torso */}
          <path 
            d="M26 72 C26 58, 74 58, 74 72 L80 90 H20 Z" 
            fill="url(#mascotSkinGrad)" 
            opacity="0.95"
          />

          {/* Bobbing Head Group */}
          <g className="mascot-bob-head">
            {/* Seamless Organic Cat Head & Ears Silhouette */}
            <path 
              d="M 50,66 C 26,66 26,42 30,28 L 32,12 L 42,22 Q 50,19 58,22 L 68,12 L 70,28 C 74,42 74,66 50,66 Z" 
              fill="url(#mascotSkinGrad)" 
            />

            {/* Inner Ear Gradient Flaps */}
            <polygon points="34,26 33,16 41,23" fill="url(#mascotEarInnerGrad)" opacity="0.85" />
            <polygon points="66,26 67,16 59,23" fill="url(#mascotEarInnerGrad)" opacity="0.85" />


            {/* Glasses */}
            <g className="cat-glasses">
              <circle cx="41" cy="42" r="7" fill="rgba(11, 15, 25, 0.75)" stroke="#ffffff" strokeWidth="1.3" />
              <circle cx="59" cy="42" r="7" fill="rgba(11, 15, 25, 0.75)" stroke="#ffffff" strokeWidth="1.3" />
              <path d="M48 42 Q50 40 52 42" stroke="#ffffff" strokeWidth="1.3" fill="none" />
              <line x1="38" y1="39" x2="41" y2="39" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
              <line x1="56" y1="39" x2="59" y2="39" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

              {/* Eyes */}
              {currentStep === 3 ? (
                // Cheerful eyes
                <g>
                  <path d="M38 42 Q41 39 44 42" stroke="var(--accent-color, #38bdf8)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M56 42 Q59 39 62 42" stroke="var(--accent-color, #38bdf8)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                // Focused round pupils
                <g>
                  <circle cx="41" cy="42" r="2.2" fill="#ffffff" />
                  <circle cx="59" cy="42" r="2.2" fill="#ffffff" />
                </g>
              )}
            </g>

            {/* Cute Nose & Whiskers */}
            <path d="M48.5 48.5 L51.5 48.5 L50 50.5 Z" fill="#f472b6" />
            <path d="M50 50.5 L50 52.5" stroke="rgba(255,255,255,0.7)" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M34 49 L25 47 M34 51 L24 52" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M66 49 L75 47 M66 51 L76 52" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeLinecap="round" />

            {/* Little Paws on ledge */}
            <ellipse cx="39" cy="74" rx="5" ry="3.5" fill="url(#mascotSkinGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            <ellipse cx="61" cy="74" rx="5" ry="3.5" fill="url(#mascotSkinGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
          </g>
        </svg>
      </div>

      {/* Sleek Organic Speech Bubble */}
      <div className="mascot-speech-bubble">
        <div className="mascot-speech-notch" />
        <div className="mascot-speech-content">
          <div className="mascot-speech-title-row">
            <span className="mascot-badge-tag">// COMPANION GUIDE</span>
            <span className="mascot-speech-title">{speech.title}</span>
          </div>
          <p className="mascot-speech-detail">{speech.detail}</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mascot-bar-root {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .mascot-cat-avatar {
          position: relative;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mascot-cat-glow {
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent-color, #38bdf8) 0%, transparent 70%);
          opacity: 0.15;
          animation: catAuraPulse 3s ease-in-out infinite alternate;
        }

        @keyframes catAuraPulse {
          0% { transform: scale(0.95); opacity: 0.1; }
          100% { transform: scale(1.1); opacity: 0.22; }
        }

        .mascot-cat-svg {
          width: 46px;
          height: 46px;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
        }

        .mascot-bob-head {
          animation: catHeadBob 2.8s ease-in-out infinite alternate;
          transform-origin: 50px 65px;
        }

        @keyframes catHeadBob {
          0% { transform: rotate(-1.5deg) translateY(0); }
          100% { transform: rotate(1.5deg) translateY(-1.5px); }
        }

        .cat-ear-left {
          animation: catEarWiggleL 5s ease-in-out infinite;
          transform-origin: 32px 35px;
        }

        .cat-ear-right {
          animation: catEarWiggleR 5s ease-in-out infinite 2.5s;
          transform-origin: 68px 35px;
        }

        @keyframes catEarWiggleL {
          0%, 90%, 100% { transform: rotate(0deg); }
          94% { transform: rotate(-5deg); }
        }

        @keyframes catEarWiggleR {
          0%, 90%, 100% { transform: rotate(0deg); }
          94% { transform: rotate(5deg); }
        }

        .mascot-speech-bubble {
          position: relative;
          flex: 1;
          background: rgba(56, 189, 248, 0.04);
          border: 1px solid rgba(56, 189, 248, 0.14);
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .mascot-speech-notch {
          position: absolute;
          left: -5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: rgba(11, 15, 25, 0.95);
          border-left: 1px solid rgba(56, 189, 248, 0.14);
          border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        }

        .mascot-speech-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .mascot-speech-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .mascot-badge-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent-color, #38bdf8);
        }

        .mascot-speech-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary, #ffffff);
        }

        .mascot-speech-detail {
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
          line-height: 1.35;
          margin: 0;
          white-space: normal;
        }
      `}} />
    </div>
  );
}
