import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState('logo');

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setStage('story');
    }, 3000);

    const storyTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(storyTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage === 'logo' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-[200] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-black opacity-40" />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center px-4 w-full"
          >
            <motion.img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjg9Q9oRLQyEo2OC7whIYLx6-yBWUurkrJZQ&s"
              alt="Mentu Tech"
              className="w-full max-w-2xl h-auto mx-auto mb-8 rounded-3xl shadow-2xl border-4 border-cyan-500/50"
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
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
            >
              Produced by Mentus tech
            </motion.h1>
          </motion.div>
        </motion.div>
      )}

      {stage === 'story' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 z-[200] flex items-center justify-center p-8"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center max-w-3xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-cyan-400 mb-6">
              龟龟冒险岛
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-white/90 leading-relaxed"
            >
              在遥远的海底世界，勇敢的龟龟战士踏上了守护家园的征程。
              <br />
              面对无尽的敌人和强大的Boss，只有最勇敢的战士才能获得最终的胜利...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}