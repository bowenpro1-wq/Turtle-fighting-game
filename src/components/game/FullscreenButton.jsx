import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleFullscreen}
      className="w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors"
    >
      {isFullscreen ? (
        <Minimize className="w-5 h-5 text-cyan-400" />
      ) : (
        <Maximize className="w-5 h-5 text-cyan-400" />
      )}
    </motion.button>
  );
}