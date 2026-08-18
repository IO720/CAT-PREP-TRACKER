/**
 * Utilities for text processing and sanitization
 */

// Regular expression covering emoji ranges: standard emojis, symbols, pictographs, transport, flags, modifiers
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/gu;

/**
 * Strips all emojis from a given string and trims extra whitespace.
 * @param {string} str - Input text
 * @returns {string} Clean text without emojis
 */
export function stripEmojis(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(EMOJI_REGEX, '');
}
