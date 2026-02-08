import { useEffect, useRef } from 'react';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.music = {};
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;
    this.musicMuted = false;
    this.currentMusic = null;
    
    // Initialize audio context
    this.audioContext = null;
    this.init();
  }

  init() {
    // Create simple sound effects using Web Audio API
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playSound(type) {
    if (this.muted || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.value = this.volume * 0.3;
    
    switch(type) {
      case 'shoot':
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
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
        oscillator.frequency.value = 150;
        oscillator.type = 'sawtooth';
        gainNode.gain.value = this.volume * 0.5;
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.8);
        break;
      
      case 'victory':
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
      
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