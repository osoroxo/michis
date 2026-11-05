/** Sonidos sintetizados con WebAudio: no hay archivos que empaquetar. */
export class Audio {
  private ac: AudioContext | null = null;
  muted = false;

  /** Debe llamarse desde un gesto del usuario (tecla o clic). */
  unlock() {
    if (!this.ac) {
      try { this.ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); } catch { /* sin audio */ }
    } else if (this.ac.state === 'suspended') void this.ac.resume();
  }

  sfx(freq: number, dur: number, type: OscillatorType, vol: number) {
    const ac = this.ac;
    if (!ac || this.muted) return;
    try {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = vol;
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch { /* ignorar */ }
  }

  dispose() { void this.ac?.close(); this.ac = null; }
}
