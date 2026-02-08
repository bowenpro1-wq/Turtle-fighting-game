import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState('logo'); // logo, story, complete

  useEffect(() => {
    // Show logo for 5 seconds
    const logoTimer = setTimeout(() => {
      setStage('story');
    }, 5000);

    return () => clearTimeout(logoTimer);
  }, []);

  const handleStoryComplete = () => {
    setStage('complete');
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  if (stage === 'complete') return null;

  return (
    <AnimatePresence>
      {stage === 'logo' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-[200] flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <motion.img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjg9Q9oRLQyEo2OC7whIYLx6-yBWUurkrJZQ&s"
              alt="Mentu Tech"
              className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-2xl"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 mb-4">
                Turtle Adventure Island
              </h1>
              <p className="text-xl md:text-2xl text-cyan-300/80 mb-8">
                龟龟冒险岛
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-white/60 text-sm"
            >
              Produced by <span className="text-cyan-400 font-bold">Mentu Tech</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 text-white/40 text-xs"
          >
            Loading...
          </motion.div>
        </motion.div>
      )}

      {stage === 'story' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-b from-slate-900 via-blue-900/30 to-slate-900 z-[200] flex items-center justify-center p-8"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="max-w-3xl text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-8"
            >
              🐢
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-6"
            >
              The Legend Begins
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-4 text-white/90 text-base md:text-xl leading-relaxed"
            >
              <p>
                Long ago, when the world was not yet filled with life, 
                there lived a wise and brave turtle in the vast ocean...
              </p>
              <p className="text-cyan-300">
                很久以前，当世界还未充满生命时，
                在广阔的海洋中住着一只智慧而勇敢的乌龟...
              </p>
              <p>
                This turtle dreamed of exploring mysterious islands 
                and defeating the ancient evils that lurked in the shadows.
              </p>
              <p className="text-emerald-300">
                这只乌龟梦想着探索神秘的岛屿，
                并击败潜伏在阴影中的远古邪恶。
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              onClick={handleStoryComplete}
              className="mt-12 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl text-white text-xl font-bold shadow-2xl active:scale-95 transition-transform"
            >
              Begin Your Adventure 开始冒险
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}