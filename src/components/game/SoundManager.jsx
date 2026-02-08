class SoundManager {
  constructor() {
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;
    this.musicMuted = false;
    this.currentMusicMode = null;
    this.musicInterval = null;
    this.musicNoteIndex = 0;
    this.audioContext = null;
    this.init();
  }

  init() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  
  playBackgroundMusic(mode = 'normal') {
    if (this.musicMuted || !this.audioContext || this.currentMusicMode === mode) return;
    
    this.stopBackgroundMusic();
    this.currentMusicMode = mode;
    
    // Rich musical patterns for each mode
    const melodies = {
      normal: [
        { freq: 523, duration: 400 }, // C5
        { freq: 587, duration: 400 }, // D5
        { freq: 659, duration: 400 }, // E5
        { freq: 523, duration: 400 }, // C5
        { freq: 659, duration: 400 }, // E5
        { freq: 784, duration: 800 }, // G5
        { freq: 659, duration: 400 }, // E5
        { freq: 587, duration: 800 }  // D5
      ],
      boss: [
        { freq: 220, duration: 300 }, // A3 - dark theme
        { freq: 233, duration: 150 }, // A#3
        { freq: 220, duration: 300 }, // A3
        { freq: 196, duration: 300 }, // G3
        { freq: 175, duration: 300 }, // F3
        { freq: 196, duration: 300 }, // G3
        { freq: 220, duration: 600 }, // A3
        { freq: 233, duration: 300 }  // A#3
      ],
      tower: [
        { freq: 392, duration: 500 }, // G4 - mysterious theme
        { freq: 523, duration: 500 }, // C5
        { freq: 494, duration: 500 }, // B4
        { freq: 440, duration: 500 }, // A4
        { freq: 392, duration: 500 }, // G4
        { freq: 330, duration: 500 }, // E4
        { freq: 392, duration: 1000 }  // G4
      ]
    };
    
    const melody = melodies[mode] || melodies.normal;
    this.musicNoteIndex = 0;
    
    const playNote = () => {
      if (!this.audioContext || this.musicMuted || !this.currentMusicMode) return;
      
      const note = melody[this.musicNoteIndex % melody.length];
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.value = note.freq;
      osc.type = mode === 'boss' ? 'sawtooth' : mode === 'tower' ? 'triangle' : 'sine';
      
      gain.gain.setValueAtTime(this.musicVolume * 0.18, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + (note.duration / 1000) * 0.8);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + note.duration / 1000);
      
      this.musicNoteIndex++;
    };
    
    playNote();
    this.musicInterval = setInterval(() => {
      const currentNote = melody[this.musicNoteIndex % melody.length];
      playNote();
    }, melody[this.musicNoteIndex % melody.length]?.duration || 400);
  }
  
  stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentMusicMode = null;
    this.musicNoteIndex = 0;
  }

  playSound(type) {
    if (this.muted || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.value = this.volume * 0.2;

    switch(type) {
      case 'shoot':
        oscillator.frequency.value = 1000;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
        break;

      case 'hit':
        oscillator.frequency.value = 150;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.12);
        
        const hit2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        hit2.connect(gain2);
        gain2.connect(ctx.destination);
        hit2.frequency.value = 800;
        hit2.type = 'square';
        gain2.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        hit2.start(ctx.currentTime);
        hit2.stop(ctx.currentTime + 0.05);
        break;

      case 'enemyDie':
        [400, 300, 200].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15);
          osc.start(ctx.currentTime + i * 0.05);
          osc.stop(ctx.currentTime + i * 0.05 + 0.15);
        });
        return;

      case 'heal':
        [659, 784, 880, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
        return;

      case 'jump':
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;

      case 'powerup':
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.2);
        });
        return;

      case 'bossSpawn':
        oscillator.frequency.value = 100;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1.2);
        
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.frequency.value = 50;
        bass.type = 'sine';
        bassGain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        bass.start(ctx.currentTime);
        bass.stop(ctx.currentTime + 1);
        break;

      case 'victory':
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.4);
        });
        return;

      case 'gameOver':
        [523, 494, 440, 392, 349, 330].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.4);
        });
        return;

      default:
        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopBackgroundMusic();
    } else if (this.currentMusicMode) {
      const mode = this.currentMusicMode;
      this.currentMusicMode = null;
      this.playBackgroundMusic(mode);
    }
    return this.musicMuted;
  }
}

export const soundManager = new SoundManager();