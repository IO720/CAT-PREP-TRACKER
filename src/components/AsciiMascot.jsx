import React, { useState, useEffect } from 'react';

/**
 * AsciiMascot
 * Animated ASCII characters that breathe, blink, and study
 */
export default function AsciiMascot({ isRunning = false, subject = 'QUANT', size = 160 }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 4);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Frame animations
  const eye = frame === 2 ? ' -   - ' : ' ^   ^ ';
  const mouth = isRunning ? '  ---  ' : '  (w)  ';
  const pencilHand = frame % 2 === 0 ? ' [/]' : '  [/]';

  return (
    <div className="ascii-mascot-container" style={{ minHeight: `${size}px` }}>
      <pre className="ascii-mascot-pre">
{`   .-----------------------.
  /  [ SCHOLAR_BOT // 01 ]  \\
 |     +---------------+     |
 |     |  ${eye} |     |
 |     |  ${mouth} |     |
 |     +---------------+     |
  \\_________________________/
          |       |
      /===+=======+===\\
     |  [${subject.slice(0, 5).padEnd(5, ' ')}]     |
     |   CAT PREP  ${pencilHand}|
      \\_______________/
         ||       ||
       _//_     _//_`}
      </pre>
      <div className="ascii-mascot-tag">
        <span className="liminal-crt-pulse"></span>
        <span>{isRunning ? `PROCESSING ${subject}` : 'STANDBY MODE'}</span>
      </div>
    </div>
  );
}
