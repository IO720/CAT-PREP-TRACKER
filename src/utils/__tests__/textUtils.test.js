import { describe, it, expect } from 'vitest';
import { stripEmojis } from '../textUtils';

describe('textUtils - stripEmojis', () => {
  it('should remove standard emojis and icons from text while preserving spaces', () => {
    const input = 'Quant practice 🎯 solved 18 questions! ';
    const output = stripEmojis(input);
    expect(output).toBe('Quant practice  solved 18 questions! ');
  });

  it('should remove symbols and smileys', () => {
    const input = 'Time & Work level 2 😀 (Done) ';
    const output = stripEmojis(input);
    expect(output).toBe('Time & Work level 2  (Done) ');
  });

  it('should handle strings without emojis unchanged', () => {
    const input = 'Solved 4 sets of LRDI games and tournaments';
    const output = stripEmojis(input);
    expect(output).toBe(input);
  });

  it('should return empty string for null, undefined, or empty input', () => {
    expect(stripEmojis('')).toBe('');
    expect(stripEmojis(null)).toBe('');
    expect(stripEmojis(undefined)).toBe('');
  });
});
