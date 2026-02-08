import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music, Music4 } from 'lucide-react';
import { soundManager } from './SoundManager';

export default function SoundSettings() {
  const [volume, setVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    soundManager.loadSettings();
    setVolume(soundManager.volume);
    setMusicVolume(soundManager.musicVolume);
    setMuted(soundManager.muted);
    setMusicMuted(soundManager.musicMuted);
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const handleMusicVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
    soundManager.setMusicVolume(newVolume);
  };

  const toggleMute = () => {
    soundManager.toggleMute();
    setMuted(soundManager.muted);
  };

  const toggleMusicMute = () => {
    soundManager.toggleMusicMute();
    setMusicMuted(soundManager.musicMuted);
  };

  return (
    <div className="fixed top-4 left-4 z-40">
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors"
        >
          {muted ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusicMute}
          className="w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-purple-500/50 hover:border-purple-400 transition-colors"
        >
          {musicMuted ? (
            <Music4 className="w-5 h-5 text-red-400" />
          ) : (
            <Music className="w-5 h-5 text-purple-400" />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full text-white text-sm font-bold border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors"
        >
          ⚙️
        </motion.button>
      </div>

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border-2 border-cyan-500/50 min-w-[200px]"
        >
          <div className="space-y-4">
            <div>
              <label className="text-white text-xs mb-1 block">音效音量</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white text-xs mb-1 block">音乐音量</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                className="w-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}