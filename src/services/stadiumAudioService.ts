/**
 * Procedural Stadium Sound Synthesizer using Web Audio API
 * Generates realistic stadium audio (Vuvuzela, Crowd Cheering, Clapping, Whistle, Dhol/Drums, Ambient Loop)
 * without external media files or network bandwidth!
 */

class StadiumAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioNode | null = null;
  private isAmbientPlaying = false;
  private masterGain: GainNode | null = null;
  private volume = 0.8;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * 🎺 Vuvuzela Horn Blast
   * Dual sawtooth waves with subtle vibrato and resonant low-pass filter
   */
  public playVuvuzela(duration = 2.2) {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Vuvuzela fundamental is typically B-flat (~233Hz) with strong harmonics
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(233, now);
    osc1.frequency.linearRampToValueAtTime(236, now + 0.3);
    osc1.frequency.linearRampToValueAtTime(231, now + duration);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(235, now);
    osc2.frequency.linearRampToValueAtTime(238, now + 0.4);
    osc2.frequency.linearRampToValueAtTime(233, now + duration);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(116.5, now);

    // Filter to capture plastic horn resonance
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(3.5, now);

    // Envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.12);
    gain.gain.setValueAtTime(0.5, now + duration - 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || ctx.destination);

    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    subOsc.stop(now + duration);
  }

  /**
   * 👏 Stadium Crowd Clapping
   * High-density rhythmic noise burst clusters
   */
  public playApplause(duration = 2.8) {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const clapsCount = Math.floor(duration * 9);

    for (let i = 0; i < clapsCount; i++) {
      const clapTime = now + (i * 0.11) + (Math.random() * 0.05);
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400 + (Math.random() * 600);
      filter.Q.value = 2.0;

      const gain = ctx.createGain();
      const intensity = 0.2 + (Math.sin((i / clapsCount) * Math.PI) * 0.25);
      gain.gain.setValueAtTime(intensity, clapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      noise.start(clapTime);
    }
  }

  /**
   * 📣 Goal / Sixer Crowd Roar
   * Deep swell of filtered crowd noise with rising excitement
   */
  public playCrowdRoar(duration = 3.5) {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation for warm human crowd roar
        lastOut = (lastOut * 0.95) + (white * 0.05);
        data[i] = lastOut * 3;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.8);
    gain.gain.setValueAtTime(0.6, now + 2.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  /**
   * ⚡ Referee Whistle
   * Dual piercing sine tones with vibrato
   */
  public playWhistle(duration = 0.9) {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2600, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2850, now);

    // Whistle pea flutter (tremolo/vibrato)
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(32, now);
    lfoGain.gain.setValueAtTime(40, now);
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.setValueAtTime(0.35, now + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain || ctx.destination);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);

    lfo.stop(now + duration);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * 🥁 Bangladeshi Dhol / Stadium Drums Beat
   * Realistic sub-bass punch and rim slap sequence
   */
  public playStadiumDhol(duration = 3.0) {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const beats = [0, 0.35, 0.7, 1.05, 1.4, 1.75, 2.1, 2.45];

    beats.forEach((tOffset, idx) => {
      const beatTime = now + tOffset;
      const isDha = idx % 2 === 0;

      // Bass punch (Dha)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isDha ? 120 : 160, beatTime);
      osc.frequency.exponentialRampToValueAtTime(45, beatTime + 0.18);

      oscGain.gain.setValueAtTime(isDha ? 0.7 : 0.4, beatTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.2);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain || ctx.destination);

      osc.start(beatTime);
      osc.stop(beatTime + 0.2);

      // Rim slap noise (Ta / Tin)
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.value = 2200;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.3, beatTime);
      nGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.05);

      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.masterGain || ctx.destination);
      noise.start(beatTime);
    });
  }

  /**
   * 🏟️ Continuous Ambient Stadium Crowd Murmur Loop
   */
  public toggleAmbientLoop(enable?: boolean): boolean {
    const ctx = this.initContext();
    const targetState = enable !== undefined ? enable : !this.isAmbientPlaying;

    if (!targetState && this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      setTimeout(() => {
        if (this.ambientSource) {
          try {
            (this.ambientSource as AudioBufferSourceNode).stop();
          } catch {
            // Already stopped
          }
          this.ambientSource = null;
        }
      }, 500);
      this.isAmbientPlaying = false;
      return false;
    }

    if (targetState && !this.isAmbientPlaying) {
      const bufferSize = ctx.sampleRate * 4; // 4 second loopable noise
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.15;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 650;
      filter.Q.value = 1.2;

      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.01, ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 1.0);

      source.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain || ctx.destination);

      source.start();
      this.ambientSource = source;
      this.isAmbientPlaying = true;
      return true;
    }

    return this.isAmbientPlaying;
  }

  public getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const stadiumAudio = new StadiumAudioEngine();
