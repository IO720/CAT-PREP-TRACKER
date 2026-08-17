// Audio utility - All sound effects disabled

class AudioEngine {
  constructor() {
    this.ctx = null;
  }

  initContext() {
    // Disabled
  }

  playCompletionSound() {
    // Completely muted - no sound effects
  }

  playTickSound() {
    // Completely muted - no sound effects
  }
}

export const audioEngine = new AudioEngine();


