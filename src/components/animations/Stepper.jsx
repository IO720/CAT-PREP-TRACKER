import React from 'react';

/**
 * Stepper - React Bits inspired sleek wizard indicator
 * Minimal, theme-aligned, high-tech progress tracker.
 */
export default function Stepper({
  steps = [],
  currentStep = 1,
  onStepChange,
  className = '',
  style = {}
}) {
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 
    ? Math.max(0, Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100))
    : 100;

  return (
    <div className={`rb-stepper-root ${className}`} style={style} role="region" aria-label="Progress Stepper">
      <div className="rb-stepper-track-wrap">
        {/* Background track line */}
        <div className="rb-stepper-line-bg" />
        {/* Animated fill track line */}
        <div 
          className="rb-stepper-line-fill" 
          style={{ width: `${progressPercent}%` }} 
        />

        {/* Step Nodes */}
        <div className="rb-stepper-nodes">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <div 
                key={step.id || stepNum}
                className={`rb-stepper-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <button
                  type="button"
                  className="rb-stepper-circle"
                  onClick={() => onStepChange && onStepChange(stepNum)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${stepNum}: ${step.title || ''}`}
                >
                  {isCompleted ? (
                    <svg 
                      className="rb-stepper-check-icon"
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="rb-stepper-num">{String(stepNum).padStart(2, '0')}</span>
                  )}
                  {isActive && <span className="rb-stepper-glow-ring" />}
                </button>

                <span className="rb-stepper-title">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rb-stepper-root {
          width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .rb-stepper-track-wrap {
          position: relative;
          width: 100%;
          padding: 4px 16px 6px 16px;
          box-sizing: border-box;
        }

        .rb-stepper-line-bg {
          position: absolute;
          top: 18px;
          left: 40px;
          right: 40px;
          height: 1.5px;
          background: rgba(255, 255, 255, 0.08);
          z-index: 1;
        }

        .rb-stepper-line-fill {
          position: absolute;
          top: 18px;
          left: 40px;
          height: 1.5px;
          max-width: calc(100% - 80px);
          background: linear-gradient(90deg, var(--accent-color, #38bdf8), var(--accent-secondary, #818cf8));
          z-index: 2;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
        }

        .rb-stepper-nodes {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 3;
        }

        .rb-stepper-node {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .rb-stepper-circle {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--card-bg, #0b0f19);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          color: var(--text-tertiary, #64748b);
        }

        .rb-stepper-circle:hover {
          border-color: var(--accent-color, #38bdf8);
          color: var(--text-primary, #ffffff);
        }

        .rb-stepper-node.active .rb-stepper-circle {
          background: var(--bg-primary, #0b0f19);
          border-color: var(--accent-color, #38bdf8);
          color: var(--accent-color, #38bdf8);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15), 0 0 10px rgba(56, 189, 248, 0.3);
        }

        .rb-stepper-node.completed .rb-stepper-circle {
          background: var(--accent-color, #38bdf8);
          border-color: var(--accent-color, #38bdf8);
          color: #0b0f19;
        }

        .rb-stepper-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
        }

        .rb-stepper-glow-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px dashed var(--accent-color, #38bdf8);
          opacity: 0.5;
          animation: rbSpin 10s linear infinite;
        }

        @keyframes rbSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .rb-stepper-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary, #64748b);
          transition: color 0.2s ease;
          letter-spacing: 0.02em;
        }

        .rb-stepper-node.active .rb-stepper-title {
          color: var(--text-primary, #ffffff);
          font-weight: 700;
        }

        .rb-stepper-node.completed .rb-stepper-title {
          color: var(--text-secondary, #94a3b8);
        }

        @media (max-width: 500px) {
          .rb-stepper-title {
            font-size: 9.5px;
            white-space: nowrap;
          }
          .rb-stepper-track-wrap {
            padding: 2px 8px 4px 8px;
          }
          .rb-stepper-line-bg, .rb-stepper-line-fill {
            left: 28px;
            right: 28px;
            max-width: calc(100% - 56px);
          }
        }
      `}} />
    </div>
  );
}
