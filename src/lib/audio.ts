// Procedural Web Audio API sound generator for Open World Survival RPG
// This avoids broken external asset links and is lightweight.

class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private nextNoteTime = 0;
  private scheduleAheadTime = 0.1; // seconds
  private tempo = 100; // BPM
  private musicIntervalId: any = null;
  private currentMood: 'day' | 'night' | 'combat' | 'storm' = 'day';

  constructor() {
    // Context is created lazily on user interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.error('Failed to initialize Web Audio API:', e);
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.resume();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  public setMusicVolume(vol: number) {
    this.resume();
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  public setSfxVolume(vol: number) {
    this.resume();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  // SOUND EFFECTS GENERATORS
  public playSfx(type: 'hit' | 'swing' | 'zombie_growl' | 'zombie_hit' | 'coin' | 'craft' | 'fish_bite' | 'level_up' | 'water' | 'build' | 'footstep' | 'power_on' | 'shoot') {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'swing': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'hit': {
        // Synthesize physical impact
        const osc = this.ctx.createOscillator();
        const noise = this.createNoiseBufferNode();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);

        if (noise) {
          const noiseGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, now);
          
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.sfxGain);

          noiseGain.gain.setValueAtTime(0.3, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

          noise.start(now);
          noise.stop(now + 0.08);
        }
        break;
      }
      case 'zombie_growl': {
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency); // Modulate pitch

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);

        lfo.frequency.setValueAtTime(15, now); // Growl speed
        lfoGain.gain.setValueAtTime(30, now); // Pitch wobble amount

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.5);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.6);
        osc.stop(now + 0.6);
        break;
      }
      case 'zombie_hit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'coin': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
        break;
      }
      case 'craft': {
        // Clicky metallic sounds
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(800, now + 0.05);
        osc.frequency.setValueAtTime(1200, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'fish_bite': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'level_up': {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
        notes.forEach((freq, index) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.connect(gain);
          gain.connect(this.sfxGain!);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + index * 0.08);

          gain.gain.setValueAtTime(0.01, now + index * 0.08);
          gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.3);

          osc.start(now + index * 0.08);
          osc.stop(now + index * 0.08 + 0.35);
        });
        break;
      }
      case 'water': {
        // Water splash
        const noise = this.createNoiseBufferNode();
        if (noise) {
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(600, now);
          filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          noise.start(now);
          noise.stop(now + 0.2);
        }
        break;
      }
      case 'build': {
        // Wooden thud
        const osc = this.ctx.createOscillator();
        const noise = this.createNoiseBufferNode();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.1);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);

        if (noise) {
          const noiseGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(300, now);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.sfxGain);

          noiseGain.gain.setValueAtTime(0.2, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

          noise.start(now);
          noise.stop(now + 0.08);
        }
        break;
      }
      case 'footstep': {
        // Soft rustle
        const noise = this.createNoiseBufferNode();
        if (noise) {
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(150, now);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

          noise.start(now);
          noise.stop(now + 0.05);
        }
        break;
      }
      case 'power_on': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.8);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }
      case 'shoot': {
        const osc = this.ctx.createOscillator();
        const noise = this.createNoiseBufferNode();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.14);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        osc.start(now);
        osc.stop(now + 0.14);

        if (noise) {
          const noiseGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);
          
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.sfxGain);

          noiseGain.gain.setValueAtTime(0.55, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

          noise.start(now);
          noise.stop(now + 0.12);
        }
        break;
      }
    }
  }

  // DYNAMIC PROCEDURAL BGM SYNTHESIZER
  public startMusic() {
    this.resume();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime;
    }
    
    this.musicIntervalId = setInterval(() => {
      this.scheduler();
    }, 100);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  public setMood(mood: 'day' | 'night' | 'combat' | 'storm') {
    this.currentMood = mood;
    if (mood === 'combat') {
      this.tempo = 120;
    } else if (mood === 'night') {
      this.tempo = 80;
    } else {
      this.tempo = 95;
    }
  }

  private scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNextNote(this.nextNoteTime);
      const secondsPerBeat = 60.0 / this.tempo;
      // schedule either 8th notes, quarter notes or dotted notes based on feel
      this.nextNoteTime += 0.5 * secondsPerBeat;
    }
  }

  // Pentatonic scale frequencies in C
  private getNoteFreq(scaleIdx: number, octave: number): number {
    const scale = [0, 2, 4, 7, 9]; // Major Pentatonic (Day)
    const minorScale = [0, 3, 5, 7, 10]; // Minor Pentatonic (Night / Storm / Combat)
    
    const useScale = (this.currentMood === 'day') ? scale : minorScale;
    
    let rootNote = 60; // Middle C (C4)
    if (this.currentMood === 'combat') rootNote = 57; // A3 (more driving/dark)
    if (this.currentMood === 'night') rootNote = 57; // A3

    const index = scaleIdx % useScale.length;
    const extraOctave = Math.floor(scaleIdx / useScale.length);
    const midi = rootNote + useScale[index] + (octave + extraOctave) * 12;
    return Math.pow(2, (midi - 69) / 12) * 440;
  }

  private stepCount = 0;
  private scheduleNextNote(time: number) {
    if (!this.ctx || !this.musicGain) return;

    const step = this.stepCount % 16;
    this.stepCount++;

    // Ambient Bass Drone (plays every 8 steps)
    if (step % 8 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.type = this.currentMood === 'combat' ? 'sawtooth' : 'triangle';
      
      // Drone root note
      let freq = this.getNoteFreq(0, -2);
      if (this.currentMood === 'night') freq = this.getNoteFreq(0, -2); // Lower A
      if (this.currentMood === 'combat' && step === 8) freq = this.getNoteFreq(3, -2); // Alternate bass

      bassOsc.frequency.setValueAtTime(freq, time);

      bassGain.gain.setValueAtTime(0.01, time);
      bassGain.gain.linearRampToValueAtTime(this.currentMood === 'combat' ? 0.2 : 0.15, time + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + (60.0 / this.tempo) * 4);

      bassOsc.start(time);
      bassOsc.stop(time + (60.0 / this.tempo) * 4.1);
    }

    // Melodic Arpeggios (conditional on mood)
    let playMelody = false;
    let melodyNoteIndex = 0;
    let melodyOctave = 0;

    if (this.currentMood === 'day') {
      // Light, random, relaxed melodies
      if (step === 0 || step === 3 || step === 6 || step === 8 || step === 11 || step === 14) {
        playMelody = Math.random() > 0.3;
        melodyNoteIndex = Math.floor(Math.random() * 5);
        melodyOctave = 1;
      }
    } else if (this.currentMood === 'night') {
      // Sparsely placed eerie melody notes
      if (step === 0 || step === 4 || step === 10) {
        playMelody = Math.random() > 0.4;
        melodyNoteIndex = Math.floor(Math.random() * 4);
        melodyOctave = 1;
      }
    } else if (this.currentMood === 'combat') {
      // Faster driving driving rhythm
      if (step % 2 === 0) {
        playMelody = true;
        // Simple driving pattern
        const pattern = [0, 2, 3, 2, 4, 3, 5, 4];
        melodyNoteIndex = pattern[Math.floor(step / 2) % pattern.length];
        melodyOctave = 0;
      }
    } else if (this.currentMood === 'storm') {
      // Storm mood: eerie pad swells, occasionally high notes
      if (step === 0 || step === 8) {
        playMelody = true;
        melodyNoteIndex = Math.floor(Math.random() * 3);
        melodyOctave = 1;
      }
    }

    if (playMelody) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGain);

      // Sweet triangle wave during day, moody sine/saw during night/combat
      osc.type = this.currentMood === 'day' ? 'triangle' : (this.currentMood === 'combat' ? 'triangle' : 'sine');
      
      const freq = this.getNoteFreq(melodyNoteIndex, melodyOctave);
      osc.frequency.setValueAtTime(freq, time);

      // Decay times
      let decay = 0.5;
      if (this.currentMood === 'combat') decay = 0.2;
      if (this.currentMood === 'night') decay = 1.2;

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.06, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

      osc.start(time);
      osc.stop(time + decay + 0.05);
    }

    // Weather Effects Synthesized in Background: Rain/Wind Noise
    if (this.currentMood === 'storm' || this.currentMood === 'night') {
      // Random wind sweep (1 in 16 beats)
      if (step === 0 && Math.random() > 0.5) {
        const noise = this.createNoiseBufferNode();
        if (noise) {
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(300, time);
          filter.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, time + 2);
          filter.frequency.exponentialRampToValueAtTime(250, time + 4);
          filter.Q.setValueAtTime(3.0, time);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);

          gain.gain.setValueAtTime(0.001, time);
          gain.gain.linearRampToValueAtTime(0.04, time + 2);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 4.5);

          noise.start(time);
          noise.stop(time + 4.5);
        }
      }
    }
  }

  // HELPER: Generate white noise buffer
  private createNoiseBufferNode(): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }
}

// Export singleton instance
export const GameAudio = new AudioSynthManager();
