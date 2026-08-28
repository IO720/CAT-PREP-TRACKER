import React, { useState, useEffect } from 'react';
import { AnimatedPawIcon } from './AnimatedUiIcons';

/**
 * ComicPeekingCatBuddy - Emotive Zen Scholar Cat Peeking from Right Edge
 * - Exact same vector character art style as StudyCompanionEntity
 * - Rich emotional expressions: Rosy blush cheeks, sparkling eyes, animated wink
 * - Smooth feline paw beckoning inward toward itself ("Come study with me!")
 * - Theme-reactive gradient shading (matches CRT, Tokyo Night, Dark, Royal Cobalt, etc.)
 * - Glassmorphic comic speech bubble with rotating focus callouts
 * - Minimized discrete paw tab when dismissed
 */
export default function ComicPeekingCatBuddy({
  onOpenTimer,
  timerState,
  activeTheme = 'dark'
}) {
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [speechIdx, setSpeechIdx] = useState(0);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [isPeekingPrompt, setIsPeekingPrompt] = useState(false);

  const comicCallouts = [
    { sound: "*PSST!*", text: "Hey! A 25-minute sprint today makes all the difference. Come study!" },
    { sound: "*AHEM!*", text: "Your daily momentum is waiting! Let's conquer Quant together." },
    { sound: "*MEOW!*", text: "I've got the notes ready—click me to launch the study timer!" },
    { sound: "*FOCUS!*", text: "Top 1% percentile discipline starts right now. Ready when you are!" }
  ];

  // When timer starts, display cheer for 4.5s then auto-collapse so it doesn't crowd mobile view
  useEffect(() => {
    if (isTimerRunning) {
      setIsBubbleVisible(true);
      const timer = setTimeout(() => {
        setIsBubbleVisible(false);
      }, 4500);
      return () => clearTimeout(timer);
    } else {
      setIsBubbleVisible(true);
    }
  }, [isTimerRunning]);

  // Rotate comic speech periodically when not running
  useEffect(() => {
    if (isTimerRunning || isDismissed) return;
    const interval = setInterval(() => {
      setSpeechIdx((prev) => (prev + 1) % comicCallouts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isDismissed, comicCallouts.length]);

  if (isDismissed) {
    // Discrete edge tab to bring buddy back
    return (
      <button 
        type="button" 
        className="comic-peeking-minimized-tab"
        onClick={() => setIsDismissed(false)}
        title="Summon Cat Study Buddy"
      >
        <span className="minimized-paw-icon">
          <AnimatedPawIcon size={16} />
        </span>
        <span className="minimized-label">BUDDY</span>
      </button>
    );
  }

  // Edge Peek Stance (After initial click: just paws, ears, and head showing with "Will you continue?")
  if (isPeekingPrompt) {
    return (
      <div className="comic-edge-peek-container animate-slide-up">
        {/* Sleek Glassmorphic "Will you continue?" Speech Bubble */}
        <div className="comic-peek-dialogue-bubble">
          <div className="comic-peek-bubble-top">
            <span className="comic-peek-title">Will you continue?</span>
            <button 
              type="button" 
              className="comic-peek-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsPeekingPrompt(false);
              }}
              title="Close"
            >
              ×
            </button>
          </div>
          <p className="comic-peek-subtitle">
            Ready to lock in for your {timerState?.subject || 'Quant'} session?
          </p>
          <div className="comic-peek-btn-row">
            <button 
              type="button" 
              className="comic-peek-continue-btn"
              onClick={() => {
                setIsPeekingPrompt(false);
                onOpenTimer();
              }}
            >
              Continue ➔
            </button>
            <button 
              type="button" 
              className="comic-peek-cancel-btn"
              onClick={() => setIsPeekingPrompt(false)}
            >
              Not now
            </button>
          </div>
          <div className="comic-peek-bubble-tail" />
        </div>

        {/* Paws, Ears, and Top of Head Peeking Over the Edge (Identical Scholar Cat) */}
        <div 
          className="comic-ears-paws-peek-body"
          onClick={() => {
            setIsPeekingPrompt(false);
            onOpenTimer();
          }}
          role="button"
          tabIndex={0}
          title="Click to continue focus session"
        >
          <svg viewBox="0 0 160 96" className="cat-ears-paws-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="edgePeekHeadGrad" x1="20" y1="10" x2="140" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
                <stop offset="50%" stopColor="var(--accent-secondary, #818cf8)" />
                <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="edgePeekEarGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
              </linearGradient>
            </defs>

            {/* Left Ear */}
            <polygon points="46,52 56,16 74,44" fill="var(--accent-color, #38bdf8)" />
            <polygon points="51,48 58,23 70,44" fill="url(#edgePeekEarGrad)" opacity="0.85" />

            {/* Right Ear */}
            <polygon points="114,52 104,16 86,44" fill="var(--accent-secondary, #c084fc)" />
            <polygon points="109,48 102,23 90,44" fill="url(#edgePeekEarGrad)" opacity="0.85" />

            {/* Scholar Head Silhouette */}
            <circle cx="80" cy="62" r="34" fill="url(#edgePeekHeadGrad)" />

            {/* Glowing Focus Headphones Arch */}
            <path 
              d="M46 62 C46 38, 114 38, 114 62" 
              stroke="#f1f5f9" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              fill="none" 
            />
            {/* Left Ear Cup */}
            <rect 
              x="39" 
              y="52" 
              width="11" 
              height="20" 
              rx="5.5" 
              fill="#0f172a" 
              stroke="var(--accent-color, #38bdf8)" 
              strokeWidth="2" 
            />
            {/* Right Ear Cup */}
            <rect 
              x="110" 
              y="52" 
              width="11" 
              height="20" 
              rx="5.5" 
              fill="#0f172a" 
              stroke="var(--accent-secondary, #c084fc)" 
              strokeWidth="2" 
            />

            {/* Identical Round Scholar Glasses */}
            <circle cx="68" cy="62" r="9.5" fill="rgba(15, 23, 42, 0.65)" stroke="#f8fafc" strokeWidth="1.8" />
            <circle cx="92" cy="62" r="9.5" fill="rgba(15, 23, 42, 0.65)" stroke="#f8fafc" strokeWidth="1.8" />
            <line x1="77.5" y1="62" x2="82.5" y2="62" stroke="#f8fafc" strokeWidth="1.8" />

            {/* Expressive Emotive Eyes (Sparkling inside glasses) */}
            <circle cx="68" cy="62" r="3.2" fill="var(--accent-color, #38bdf8)" />
            <circle cx="69.2" cy="60.8" r="1.1" fill="#ffffff" />
            <circle cx="67" cy="63" r="0.5" fill="#ffffff" />

            <circle cx="92" cy="62" r="3.2" fill="var(--accent-color, #38bdf8)" />
            <circle cx="93.2" cy="60.8" r="1.1" fill="#ffffff" />
            <circle cx="91" cy="63" r="0.5" fill="#ffffff" />

            {/* Rosy Blushing Cheeks */}
            <ellipse cx="57" cy="69" rx="4" ry="2.2" fill="#f472b6" opacity="0.6" />
            <ellipse cx="103" cy="69" rx="4" ry="2.2" fill="#f472b6" opacity="0.6" />

            {/* Cute Nose & Happy Mouth (:3) */}
            <circle cx="80" cy="70" r="1.8" fill="#f8fafc" />
            <path 
              d="M76 72 Q80 75 80 72 Q80 75 84 72" 
              stroke="#f8fafc" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Soft Whiskers */}
            <line x1="51" y1="69" x2="59" y2="70" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="51" y1="73" x2="59" y2="73" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="109" y1="69" x2="101" y2="70" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="109" y1="73" x2="101" y2="73" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" strokeLinecap="round" />

            {/* Two Front Paws Resting and Gripping the Edge (Matching Cat Body Gradient) */}
            {/* Left Paw */}
            <g className="scholar-peek-paw-left">
              <ellipse 
                cx="52" 
                cy="84" 
                rx="11" 
                ry="7.5" 
                fill="url(#edgePeekHeadGrad)" 
                stroke="rgba(255, 255, 255, 0.35)" 
                strokeWidth="1.4" 
              />
              {/* Soft white mitt highlight */}
              <ellipse cx="52" cy="85.5" rx="7" ry="4" fill="rgba(255, 255, 255, 0.15)" />
              {/* Toe indentations */}
              <line x1="48.5" y1="81" x2="48.5" y2="87" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeLinecap="round" />
              <line x1="55.5" y1="81" x2="55.5" y2="87" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeLinecap="round" />
              {/* Pink Toe Beans */}
              <circle cx="46" cy="84" r="1.5" fill="#f472b6" />
              <circle cx="52" cy="82" r="1.6" fill="#f472b6" />
              <circle cx="58" cy="84" r="1.5" fill="#f472b6" />
            </g>

            {/* Right Paw */}
            <g className="scholar-peek-paw-right">
              <ellipse 
                cx="108" 
                cy="84" 
                rx="11" 
                ry="7.5" 
                fill="url(#edgePeekHeadGrad)" 
                stroke="rgba(255, 255, 255, 0.35)" 
                strokeWidth="1.4" 
              />
              {/* Soft white mitt highlight */}
              <ellipse cx="108" cy="85.5" rx="7" ry="4" fill="rgba(255, 255, 255, 0.15)" />
              {/* Toe indentations */}
              <line x1="104.5" y1="81" x2="104.5" y2="87" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeLinecap="round" />
              <line x1="111.5" y1="81" x2="111.5" y2="87" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeLinecap="round" />
              {/* Pink Toe Beans */}
              <circle cx="102" cy="84" r="1.5" fill="#f472b6" />
              <circle cx="108" cy="82" r="1.6" fill="#f472b6" />
              <circle cx="114" cy="84" r="1.5" fill="#f472b6" />
            </g>
          </svg>
        </div>
      </div>
    );
  }

  const currentCallout = isTimerRunning 
    ? { sound: "*FOCUSED!*", text: `Studying ${timerState?.subject || 'Quant'} alongside you! Keep up the momentum!` }
    : comicCallouts[speechIdx];

  const showBubble = isBubbleVisible || isHovered;

  return (
    <div 
      className={`comic-peeking-cat-container ${isTimerRunning ? 'is-studying' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sleek Glassmorphic Comic Speech Bubble */}
      {showBubble && (
        <div 
          className={`comic-speech-bubble ${isHovered ? 'hover-expanded' : ''}`}
          onClick={() => setIsPeekingPrompt(true)}
          role="button"
          tabIndex={0}
          title="Click to launch Study Session"
        >
          <button 
            type="button" 
            className="comic-bubble-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            title="Minimize Buddy"
          >
            ×
          </button>

        <div className="comic-sound-effect">{currentCallout.sound}</div>
        <div className="comic-speech-body">
          <p className="comic-dialogue">{currentCallout.text}</p>
          <span className="comic-cta-hint">
            {isTimerRunning ? 'RESUME SESSION ➔' : 'START FOCUS TIMER ➔'}
          </span>
        </div>

        {/* Pointer notch pointing directly toward the cat */}
        <div className="comic-bubble-tail" />
      </div>
      )}

      {/* Identical Vector Scholar Cat Peeking In with Rich Emotion & Beckoning Paw */}
      <div 
        className="comic-cat-peeking-body" 
        onClick={() => setIsPeekingPrompt(true)}
        role="button"
        tabIndex={0}
        title="Cat Study Buddy - Click to open Study Timer"
      >
        <svg 
          viewBox="0 0 170 190" 
          className="comic-peeking-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Same Body Gradient as StudyCompanionEntity */}
            <linearGradient id="peekingBodyGrad" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
              <stop offset="50%" stopColor="var(--accent-secondary, #818cf8)" />
              <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" stopOpacity="0.9" />
            </linearGradient>

            {/* Same Inner Ear Gradient as StudyCompanionEntity */}
            <linearGradient id="peekingEarGrad" x1="88" y1="38" x2="108" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-secondary, #ec4899)" />
              <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
            </linearGradient>

            <filter id="buddySoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Slender Torso Peeking In from Right Edge */}
          <path 
            d="M94 110 C92 125, 88 150, 88 185 L165 185 L165 110 C155 105, 125 105, 94 110 Z" 
            fill="url(#peekingBodyGrad)" 
            opacity="0.95"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />

          {/* Cute Scholar Collar Line */}
          <path 
            d="M104 110 L114 120 L124 110" 
            stroke="rgba(255, 255, 255, 0.45)" 
            strokeWidth="1.6" 
            fill="none" 
            strokeLinecap="round" 
          />

          {/* Scholar Head Group (Tilted with rich emotion) */}
          <g className="scholar-peeking-head-group">
            {/* Left Ear */}
            <polygon points="76,64 88,26 108,56" fill="var(--accent-color, #38bdf8)" />
            <polygon points="82,60 90,34 104,56" fill="url(#peekingEarGrad)" opacity="0.85" />

            {/* Right Ear */}
            <polygon points="152,64 140,26 122,56" fill="var(--accent-secondary, #c084fc)" />
            <polygon points="146,60 138,34 126,56" fill="url(#peekingEarGrad)" opacity="0.85" />

            {/* Head Silhouette */}
            <circle cx="114" cy="76" r="38" fill="url(#peekingBodyGrad)" />

            {/* Glowing Focus Headphones */}
            <path 
              d="M76 76 C76 48, 152 48, 152 76" 
              stroke="#f1f5f9" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none" 
            />
            {/* Left Ear Cup */}
            <rect 
              x="70" 
              y="66" 
              width="12" 
              height="22" 
              rx="6" 
              fill="#0f172a" 
              stroke="var(--accent-color, #38bdf8)" 
              strokeWidth="2" 
            />
            {/* Right Ear Cup */}
            <rect 
              x="146" 
              y="66" 
              width="12" 
              height="22" 
              rx="6" 
              fill="#0f172a" 
              stroke="var(--accent-secondary, #c084fc)" 
              strokeWidth="2" 
            />

            {/* Cute Scholar Glasses */}
            <g className="scholar-glasses">
              {/* Left Lens */}
              <circle cx="100" cy="76" r="10.5" fill="rgba(15, 23, 42, 0.65)" stroke="#f8fafc" strokeWidth="1.8" />
              {/* Right Lens */}
              <circle cx="128" cy="76" r="10.5" fill="rgba(15, 23, 42, 0.65)" stroke="#f8fafc" strokeWidth="1.8" />
              {/* Bridge */}
              <line x1="110.5" y1="76" x2="117.5" y2="76" stroke="#f8fafc" strokeWidth="1.8" />

              {/* Expressive Emotive Eyes (Sparkling, Happy & Blinking) */}
              <g className="scholar-emotive-eyes">
                {/* Left Eye: Big Inquisitive Eye with Star Sparkle */}
                <g fill="var(--accent-color, #38bdf8)">
                  <circle cx="100" cy="76" r="3.4" />
                  <circle cx="101.5" cy="74.5" r="1.2" fill="#ffffff" />
                  <circle cx="98.8" cy="77.2" r="0.6" fill="#ffffff" />
                </g>

                {/* Right Eye: Playful Sparkle or Happy Wink */}
                <g fill="var(--accent-color, #38bdf8)">
                  <circle cx="128" cy="76" r="3.4" />
                  <circle cx="129.5" cy="74.5" r="1.2" fill="#ffffff" />
                  <circle cx="126.8" cy="77.2" r="0.6" fill="#ffffff" />
                </g>
              </g>
            </g>

            {/* Rosy Blushing Cheeks (Adds warm feline emotion) */}
            <ellipse cx="90" cy="84" rx="4.5" ry="2.5" fill="#f472b6" opacity="0.6" />
            <ellipse cx="138" cy="84" rx="4.5" ry="2.5" fill="#f472b6" opacity="0.6" />

            {/* Cute Nose & Happy Feline Mouth (:3) */}
            <circle cx="114" cy="85" r="2" fill="#f8fafc" />
            <path 
              d="M109 88 Q114 92 114 88 Q114 92 119 88" 
              stroke="#f8fafc" 
              strokeWidth="1.4" 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Soft Translucent Whiskers */}
            <line x1="84" y1="84" x2="94" y2="86" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="84" y1="89" x2="94" y2="89" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="144" y1="84" x2="134" y2="86" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="144" y1="89" x2="134" y2="89" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* Slender Emotive Beckoning Front Paw */}
          <g className="scholar-beckoning-paw">
            {/* Slender Forearm Anchored at Shoulder */}
            <path 
              d="M96 118 C82 120, 60 110, 45 98 C38 92, 42 86, 50 88 C62 94, 82 108, 98 114 Z" 
              fill="url(#peekingBodyGrad)" 
              stroke="rgba(255, 255, 255, 0.15)" 
              strokeWidth="1"
            />
            {/* Soft White Paw Cushion */}
            <ellipse cx="44" cy="92" rx="8" ry="6.5" fill="#f8fafc" opacity="0.95" />
            {/* Pink Toe Beans */}
            <circle cx="39" cy="88" r="1.6" fill="#f472b6" />
            <circle cx="43.5" cy="85.5" r="1.8" fill="#f472b6" />
            <circle cx="48" cy="88" r="1.6" fill="#f472b6" />
            <ellipse cx="44" cy="93" rx="3.2" ry="2.2" fill="#f472b6" />

            {/* Glowing Beckon Wave Rings */}
            <g className="beckon-signal-waves">
              <path d="M32 80 Q26 90 32 100" stroke="var(--accent-color, #38bdf8)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M25 82 Q19 92 25 102" stroke="var(--accent-secondary, #818cf8)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
