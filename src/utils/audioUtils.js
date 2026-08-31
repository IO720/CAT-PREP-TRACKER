/**
 * Web Audio API synthesized retro gaming achievement & jump sound effect.
 * Zero external audio files required, zero latency, ultra-lightweight.
 * Tuned with 75% volume attenuation and low-pass filtering to be gentle on the ears.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a playful 8-bit retro gaming jump & achievement sound (Mario-style upward spring).
 * Frequency sweeps rapidly upward from 160 Hz to 580 Hz with a warm, low-passed triangle wave.
 * Attenuated by ~75% to ensure it is soft, subtle, and never piercing to the ears.
 * @param {number} volume - Volume multiplier (default 0.035, already 75% attenuated)
 */
export function playGamingAchievementSound(volume = 0.035) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Apply 75% attenuation so the sound is soft and pleasant
    const effectiveVolume = Math.min(volume * 0.25, 0.035);
    const now = ctx.currentTime;

    // Low-pass filter to remove any harsh or piercing high-frequency buzz
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.connect(ctx.destination);

    // Master Gain for smooth envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    masterGain.connect(filter);

    // 1. Mario-style upward frequency sweep oscillator (triangle wave for warm retro feel)
    const jumpOsc = ctx.createOscillator();
    jumpOsc.type = 'triangle';
    jumpOsc.frequency.setValueAtTime(160, now);
    jumpOsc.frequency.exponentialRampToValueAtTime(580, now + 0.13);
    jumpOsc.connect(masterGain);

    // 2. Playful subtle top bounce ping (at peak of the jump)
    const pingGain = ctx.createGain();
    pingGain.gain.setValueAtTime(0, now);
    pingGain.gain.setValueAtTime(effectiveVolume * 0.65, now + 0.12);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    pingGain.connect(filter);

    const pingOsc = ctx.createOscillator();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(659.25, now + 0.12); // E5 note
    pingOsc.connect(pingGain);

    // Trigger jump sweep
    jumpOsc.start(now);
    jumpOsc.stop(now + 0.15);

    // Trigger peak ping
    pingOsc.start(now + 0.12);
    pingOsc.stop(now + 0.25);
  } catch (err) {
    // Gracefully ignore audio errors if blocked by browser policy
    console.warn('Audio playback notice:', err);
  }
}

/**
 * Plays a gentle, rewarding 8-bit / 16-bit victory arpeggio when all daily quotas are completed.
 * Features a soft 4-note ascending major chime (C5 -> E5 -> G5 -> C6) with warm triangle waves,
 * low-pass filtering at 1300Hz, and low volume attenuation to be pleasant and relaxing.
 * @param {number} volume - Volume multiplier (default 0.035, attenuated to match soft levels)
 */
export function playObjectiveCompleteGameSound(volume = 0.035) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const effectiveVolume = Math.min(volume * 0.22, 0.028);
    const now = ctx.currentTime;

    // Warm low-pass filter to prevent any harsh click or high-frequency piercing
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1350, now);
    filter.connect(ctx.destination);

    // 4-Note gentle victory chord arpeggio: C5, E5, G5, C6
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.12, gainMult: 0.85 },
      { freq: 659.25, time: 0.07, dur: 0.12, gainMult: 0.90 },
      { freq: 783.99, time: 0.14, dur: 0.15, gainMult: 0.95 },
      { freq: 1046.50, time: 0.22, dur: 0.42, gainMult: 1.05 }
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      const noteGain = effectiveVolume * note.gainMult;
      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(noteGain, now + note.time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  } catch (err) {
    console.warn('Audio playback notice:', err);
  }
}

/**
 * Backward-compatible alias for existing imports.
 * Replaced the old high-pitched zen chime with the gentle gaming jump sound.
 */
export function playSoftZenChime(volume = 0.035) {
  playGamingAchievementSound(volume);
}

/**
 * Plays a quiet, soft tap when toggling buttons or pausing the timer.
 */
export function playSoftClick(volume = 0.03) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const effectiveVolume = Math.min(volume * 0.25, 0.02);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);

    gain.gain.setValueAtTime(effectiveVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (err) {
    // Ignore autoplay restriction before first user gesture
  }
}

/**
 * Plays an authentic tactile Japanese Hanko / ink stamp sound.
 * Features a soft wooden seal press with warm paper thud resonance.
 * Attenuated by ~75% to be subtle, gentle, and satisfying.
 * @param {number} volume - Volume multiplier (default 0.035)
 */
export function playHankoStampSound(volume = 0.035) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const effectiveVolume = Math.min(volume * 0.22, 0.03);
    const now = ctx.currentTime;

    // Filter for warm wooden paper thud
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);
    filter.connect(ctx.destination);

    // 1. Wooden block thud oscillator
    const woodOsc = ctx.createOscillator();
    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(140, now);
    woodOsc.frequency.exponentialRampToValueAtTime(55, now + 0.09);

    const woodGain = ctx.createGain();
    woodGain.gain.setValueAtTime(effectiveVolume * 1.2, now);
    woodGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    woodOsc.connect(woodGain);
    woodGain.connect(filter);

    // 2. Paper ink press resonance
    const inkOsc = ctx.createOscillator();
    inkOsc.type = 'sine';
    inkOsc.frequency.setValueAtTime(320, now);
    inkOsc.frequency.exponentialRampToValueAtTime(160, now + 0.06);

    const inkGain = ctx.createGain();
    inkGain.gain.setValueAtTime(effectiveVolume * 0.6, now);
    inkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    inkOsc.connect(inkGain);
    inkGain.connect(filter);

    woodOsc.start(now);
    woodOsc.stop(now + 0.12);

    inkOsc.start(now);
    inkOsc.stop(now + 0.09);
  } catch (err) {
    // Gracefully handle audio policy
  }
}

export const audioEngine = {
  playGamingAchievementSound,
  playObjectiveCompleteGameSound,
  playSoftZenChime,
  playSoftClick,
  playHankoStampSound
};
