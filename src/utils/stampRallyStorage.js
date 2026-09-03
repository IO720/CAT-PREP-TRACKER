import { STAMP_DEFINITIONS } from '../data/stampDefinitions';
import { unlockThemeDirectly } from './themeRedemption';

const STAMP_STORAGE_KEY = 'cat_stamp_rally_data';

const DEFAULT_STAMP_DATA = {
  totalStamps: 0,
  currentCardStamps: [],
  redeemedThemes: [],
  completedCards: 0,
  lastStampedDate: null,
  stampsHistory: []
};

/**
 * Retrieves the user's Stamp Rally data from localStorage
 */
export function getStampRallyData() {
  try {
    const raw = localStorage.getItem(STAMP_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STAMP_DATA };
    const parsed = JSON.parse(raw);
    return {
      totalStamps: Number(parsed.totalStamps) || 0,
      currentCardStamps: Array.isArray(parsed.currentCardStamps) ? parsed.currentCardStamps : [],
      redeemedThemes: Array.isArray(parsed.redeemedThemes) ? parsed.redeemedThemes : [],
      completedCards: Number(parsed.completedCards) || 0,
      lastStampedDate: parsed.lastStampedDate || null,
      stampsHistory: Array.isArray(parsed.stampsHistory) ? parsed.stampsHistory : []
    };
  } catch (e) {
    return { ...DEFAULT_STAMP_DATA };
  }
}

/**
 * Persists Stamp Rally data to localStorage
 */
export function saveStampRallyData(data) {
  try {
    localStorage.setItem(STAMP_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // LocalStorage fallback
  }
}

/**
 * Awards a new Japanese Hanko stamp upon conquering all 3 daily drill quotas
 */
export function awardDailyQuotaStamp(dateStr = new Date().toISOString().split('T')[0], dayName = 'Today') {
  const current = getStampRallyData();

  // If already stamped for this exact date, still return current (or allow if test)
  if (current.lastStampedDate === dateStr && current.currentCardStamps.length > 0) {
    return { current, newStampAwarded: false, stampDef: null };
  }

  // Determine next stamp in sequence (0 to 5 for the 6 slots)
  let currentStamps = [...current.currentCardStamps];
  let completedCards = current.completedCards;

  if (currentStamps.length >= 6) {
    // Previous card was full, rollover to next card!
    completedCards += 1;
    currentStamps = [];
  }

  const nextIndex = currentStamps.length;
  const stampDef = STAMP_DEFINITIONS[nextIndex] || STAMP_DEFINITIONS[0];

  currentStamps.push(stampDef.id);
  const totalStamps = current.totalStamps + 1;

  const historyItem = {
    stampId: stampDef.id,
    date: dateStr,
    dayName,
    timestamp: Date.now()
  };

  const updatedData = {
    ...current,
    totalStamps,
    currentCardStamps: currentStamps,
    completedCards,
    lastStampedDate: dateStr,
    stampsHistory: [historyItem, ...(current.stampsHistory || [])]
  };

  saveStampRallyData(updatedData);
  return { updatedData, newStampAwarded: true, stampDef };
}

/**
 * Redeems a cultural theme unlocked through the Stamp Rally
 */
export function redeemStampReward(themeId) {
  const current = getStampRallyData();
  const currentStamps = current.currentCardStamps || [];

  if (themeId === 'kyoto-zen' && currentStamps.length < 3 && current.totalStamps < 3) {
    return { success: false, error: 'You need at least 3 stamps to redeem Kyoto Zen Sanctuary.' };
  }

  if (themeId === 'maneki-gold' && currentStamps.length < 6 && current.totalStamps < 6) {
    return { success: false, error: 'You need all 6 stamps to redeem Maneki Fortune Gold.' };
  }

  // Unlock theme directly in premium themes storage
  unlockThemeDirectly(themeId);

  const redeemed = current.redeemedThemes.includes(themeId)
    ? current.redeemedThemes
    : [...current.redeemedThemes, themeId];

  const updatedData = {
    ...current,
    redeemedThemes: redeemed
  };

  saveStampRallyData(updatedData);
  return { success: true, updatedData, themeId };
}
