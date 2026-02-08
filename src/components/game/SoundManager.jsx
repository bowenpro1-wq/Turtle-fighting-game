import { useEffect, useRef } from 'react';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;
    this.musicMuted = false;
    this.currentMusicMode = null;
    
    // Initialize audio context
    this.audioContext = null;
    this.musicOscillator = null;
    this.musicGain = null;
    this.init();
  }

  init() {
    // Create simple sound effects using Web Audio API
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  
  playBackgroundMusic(mode = 'normal') {
    if (this.musicMuted || !this.audioContext || this.currentMusicMode === mode) return;
    
    this.stopBackgroundMusic();
    this.currentMusicMode = mode;
    
    const ctx = this.audioContext;
    this.musicOscillator = ctx.createOscillator();
    this.musicGain = ctx.createGain();
    
    this.musicOscillator.connect(this.musicGain);
    this.musicGain.connect(ctx.destination);
    
    this.musicGain.gain.value = this.musicVolume * 0.1;
    
    // Different music for different modes
    if (mode === 'boss' || mode === 'multiboss') {
      this.musicOscillator.frequency.value = 220; // A3
      this.musicOscillator.type = 'sawtooth';
    } else if (mode === 'tower') {
      this.musicOscillator.frequency.value = 196; // G3
      this.musicOscillator.type = 'triangle';
    } else {
      this.musicOscillator.frequency.value = 262; // C4
      this.musicOscillator.type = 'sine';
    }
    
    this.musicOscillator.start();
  }
  
  stopBackgroundMusic() {
    if (this.musicOscillator) {
      this.musicOscillator.stop();
      this.musicOscillator = null;
    }
    if (this.musicGain) {
      this.musicGain = null;
    }
    this.currentMusicMode = null;
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
      
      case 'heal':
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      
      case 'jump':
        oscillator.frequency.value = 400;
        oscillator.type = 'triangle';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      
      case 'enemyDie':
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      
      case 'enemySpawn':
        oscillator.frequency.value = 300;
        oscillator.type = 'sine';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      
      case 'bossSpawn':
        oscillator.frequency.value = 100;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1.2);
        
        // Additional bass rumble
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
        // Victory fanfare
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
        oscillator.frequency.value = 110;
        oscillator.type = 'triangle';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1);
        break;
      
      case 'powerup':
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      
      case 'hit':
        oscillator.frequency.value = 250;
        oscillator.type = 'square';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('gameVolume', this.volume.toString());
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('gameMusicVolume', this.musicVolume.toString());
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('gameMuted', this.muted.toString());
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    localStorage.setItem('gameMusicMuted', this.musicMuted.toString());
  }

  loadSettings() {
    this.volume = parseFloat(localStorage.getItem('gameVolume') || '0.5');
    this.musicVolume = parseFloat(localStorage.getItem('gameMusicVolume') || '0.3');
    this.muted = localStorage.getItem('gameMuted') === 'true';
    this.musicMuted = localStorage.getItem('gameMusicMuted') === 'true';
  }
}

export const soundManager = new SoundManager();

export default function SoundControls({ className = '' }) {
  useEffect(() => {
    soundManager.loadSettings();
  }, []);

  return null;
}