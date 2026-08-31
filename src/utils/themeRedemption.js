// Premium Theme Redemption and Authorization System

export const PREMIUM_THEME_IDS = [
  'kyoto-zen',
  'maneki-gold',
  'sunset-magenta',
  'crimson-twilight',
  'cosmic-nebula',
  'electric-lilac',
  'royal-cobalt',
  'deep-abyss'
];

const STORAGE_KEY = 'cat_unlocked_premium_themes';

// Secret redemption code lookup table (Case-insensitive, stripped of extra spaces/dashes)
const REDEMPTION_CODES = {
  // Japanese Stamp Rally Themes
  'KYOTO-ZEN': 'kyoto-zen',
  'ZEN-NEKO': 'kyoto-zen',
  'MANEKI-GOLD': 'maneki-gold',
  'MANEKI-NEKO': 'maneki-gold',
  'NEKO-STAMP': 'kyoto-zen',

  // Individual Theme Codes
  'SUNSET-MAGENTA': 'sunset-magenta',
  'MAGENTA-VIP': 'sunset-magenta',
  'SUNSET2026': 'sunset-magenta',
  'GRADIENT-SUNSET': 'sunset-magenta',
  'ORCHID2026': 'sunset-magenta',

  'CRIMSON-TWILIGHT': 'crimson-twilight',
  'DUSK-VIP': 'crimson-twilight',
  'TWILIGHT2026': 'crimson-twilight',
  'GRADIENT-CRIMSON': 'crimson-twilight',

  'COSMIC-NEBULA': 'cosmic-nebula',
  'NEBULA-VIP': 'cosmic-nebula',
  'COSMIC2026': 'cosmic-nebula',
  'GRADIENT-NEBULA': 'cosmic-nebula',

  'ELECTRIC-LILAC': 'electric-lilac',
  'LILAC-VIP': 'electric-lilac',
  'CYBER2026': 'electric-lilac',
  'GRADIENT-LILAC': 'electric-lilac',
  'LAVENDER-VIP': 'electric-lilac',

  'ROYAL-COBALT': 'royal-cobalt',
  'COBALT-VIP': 'royal-cobalt',
  'ROYAL2026': 'royal-cobalt',
  'GRADIENT-COBALT': 'royal-cobalt',

  'DEEP-ABYSS': 'deep-abyss',
  'ABYSS-VIP': 'deep-abyss',
  'OCEAN2026': 'deep-abyss',
  'GRADIENT-ABYSS': 'deep-abyss',
  'VOID2026': 'deep-abyss',

  // Master / Bundle Unlock Codes (Unlocks all 6 premium gradient themes)
  'PREMIUM-ALL': 'ALL',
  'GRADIENTS-VIP': 'ALL',
  'CATALYZE-PRO': 'ALL',
  'AT1ITUDE-PACK': 'ALL',
  'ADMIN-ACCESS': 'ALL',
  'MASTER-THEMES': 'ALL',
  'VIP-UNLOCK': 'ALL'
};

const THEME_NAMES = {
  'kyoto-zen': 'Kyoto Zen Sanctuary',
  'maneki-gold': 'Maneki Fortune Gold',
  'sunset-magenta': 'Sunset Magenta',
  'crimson-twilight': 'Crimson Twilight',
  'cosmic-nebula': 'Cosmic Nebula',
  'electric-lilac': 'Electric Lilac',
  'royal-cobalt': 'Royal Cobalt',
  'deep-abyss': 'Deep Abyss'
};

/**
 * Direct unlock helper for Stamp Rally rewards
 */
export function unlockThemeDirectly(themeId) {
  try {
    const current = getUnlockedThemes();
    if (!current.includes(themeId)) {
      const next = [...current, themeId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }
    return current;
  } catch (e) {
    return [];
  }
}

/**
 * Get the list of unlocked premium theme IDs from localStorage
 */
export function getUnlockedThemes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Check if a theme is unlocked for the user
 */
export function isThemeUnlocked(themeId, unlockedThemesList = null) {
  // If not a premium theme, it is always free & unlocked
  if (!PREMIUM_THEME_IDS.includes(themeId)) {
    return true;
  }
  const unlocked = unlockedThemesList !== null ? unlockedThemesList : getUnlockedThemes();
  return unlocked.includes(themeId);
}

/**
 * Redeem a code and unlock theme(s)
 */
export function redeemThemeCode(inputCode) {
  if (!inputCode || typeof inputCode !== 'string') {
    return { success: false, error: 'Please enter a valid redemption code.' };
  }

  const normalized = inputCode.trim().toUpperCase().replace(/\s+/g, '-');
  const targetThemeId = REDEMPTION_CODES[normalized];

  if (!targetThemeId) {
    return {
      success: false,
      error: 'Invalid or unrecognized redemption code. Please verify and try again.'
    };
  }

  const currentUnlocked = getUnlockedThemes();

  if (targetThemeId === 'ALL') {
    const allAlreadyUnlocked = PREMIUM_THEME_IDS.every(id => currentUnlocked.includes(id));
    if (allAlreadyUnlocked) {
      return {
        success: false,
        error: 'You have already unlocked all 6 exclusive gradient themes!'
      };
    }

    const updated = Array.from(new Set([...currentUnlocked, ...PREMIUM_THEME_IDS]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return {
      success: true,
      targetId: 'ALL',
      themeName: 'All 6 Exclusive Gradient Themes',
      unlockedThemes: updated,
      message: 'Master code accepted! All 6 exclusive gradient themes have been unlocked.'
    };
  }

  if (currentUnlocked.includes(targetThemeId)) {
    return {
      success: false,
      error: `You have already unlocked "${THEME_NAMES[targetThemeId] || targetThemeId}"!`
    };
  }

  const updated = Array.from(new Set([...currentUnlocked, targetThemeId]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return {
    success: true,
    targetId: targetThemeId,
    themeName: THEME_NAMES[targetThemeId] || targetThemeId,
    unlockedThemes: updated,
    message: `Congratulations! "${THEME_NAMES[targetThemeId] || targetThemeId}" has been unlocked!`
  };
}
