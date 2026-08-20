/**
 * Web Audio API synthesized soft zen chime and ambient focus audio.
 * Zero external audio files required, zero latency, ultra-lightweight.
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
 * Plays a calm, gentle harmonic singing bowl / zen chime.
 * Uses 528 Hz (the 'Miracle / Transformation' frequency) with warm 1056 Hz & 1584 Hz overtones.
 * Soft attack and gentle exponential decay to let the user know their session is completed peacefully.
 * @param {number} volume - Volume multiplier (reduced by 50% for subtle ambient quietness, default 0.14)
 */
export function playSoftZenChime(volume = 0.14) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Apply 50% attenuation to any supplied volume
    const effectiveVolume = Math.min(volume * 0.5, 0.2);

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    // Soft smooth attack to avoid harsh sudden pop
    masterGain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.12);
    // Gentle lingering decay
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
    masterGain.connect(ctx.destination);

    // Fundamental note: 528 Hz (C5)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);

    // 1st harmonic overtone: 1056 Hz (gentle singing bowl shimmer)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1056, now);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.25, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    // 2nd subtle harmonic: 1584 Hz
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1584, now);
    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.12, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc1.connect(masterGain);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 3.5);
    osc2.stop(now + 3.5);
    osc3.stop(now + 3.5);
  } catch (err) {
    console.warn('Zen chime audio playback notice:', err);
  }
}

/**
 * Plays a quiet, soft glass tap when starting or pausing the timer.
 */
export function playSoftClick(volume = 0.04) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const effectiveVolume = Math.min(volume * 0.5, 0.05);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);

    gain.gain.setValueAtTime(effectiveVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (err) {
    // Ignore autoplay restriction before first user gesture
  }
}

export const audioEngine = {
  playSoftZenChime,
  playSoftClick
};
