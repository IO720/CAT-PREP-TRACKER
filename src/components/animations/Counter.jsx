import React, { useMemo } from 'react';

/**
 * Counter
 * Inspired by React Bits (https://reactbits.dev/components/counter)
 * Mechanical vertical odometer/rolling digit animation for numbers.
 */

function DigitColumn({ digit, height = '1em' }) {
  const parsed = parseInt(digit, 10);
  const isNumber = !isNaN(parsed);

  if (!isNumber) {
    return <span className="counter-symbol">{digit}</span>;
  }

  return (
    <div className="counter-digit-window" style={{ height, overflow: 'hidden', display: 'inline-block' }}>
      <div
        className="counter-digit-track"
        style={{
          transform: `translateY(-${parsed * 10}%)`,
          transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          lineHeight: height
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="counter-number-val"
            style={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Counter({
  value = 0,
  fontSize = undefined,
  className = '',
  style = {}
}) {
  const stringValue = useMemo(() => {
    return String(value ?? 0);
  }, [value]);

  const characters = useMemo(() => {
    return stringValue.split('');
  }, [stringValue]);

  return (
    <span
      className={`reactbits-counter-root ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontVariantNumeric: 'tabular-nums',
        fontSize,
        ...style
      }}
    >
      {characters.map((char, index) => (
        <DigitColumn key={`${index}-${char}`} digit={char} />
      ))}
    </span>
  );
}
