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

export const audioEngine = {
  playGamingAchievementSound,
  playSoftZenChime,
  playSoftClick
};
