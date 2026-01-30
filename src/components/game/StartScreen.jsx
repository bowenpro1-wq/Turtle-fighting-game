import React from 'react';
import { motion } from 'framer-motion';

export default function StartScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-50"
    >
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              left: `${Math.random() * 100}%`,
              bottom: -50
            }}
            animate={{
              y: [0, -window.innerHeight - 100],
              x: [0, Math.random() * 100 - 50]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 drop-shadow-2xl mb-4">
          🐢 龟龟冒险岛
        </h1>
        <p className="text-xl md:text-2xl text-cyan-200/80">
          Turtle Adventure Island
        </p>
      </motion.div>

      {/* Turtle character preview */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-9xl mb-12"
      >
        🐢
      </motion.div>

      {/* Controls info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10"
      >
        <h3 className="text-cyan-300 text-lg font-semibold mb-4 text-center">操作指南</h3>
        <div className="grid grid-cols-2 gap-4 text-white/80">
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1 bg-white/20 rounded-lg font-mono">W A S D</kbd>
            <span>移动</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1 bg-red-500/40 rounded-lg font-mono">K</kbd>
            <span>射击 💥</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1 bg-green-500/40 rounded-lg font-mono">H</kbd>
            <span>恢复生命 💚</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1 bg-blue-500/40 rounded-lg font-mono">O</kbd>
            <span>飞行 3秒 ✨</span>
          </div>
        </div>
      </motion.div>

      {/* Start button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.7 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="px-12 py-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full text-white text-2xl font-bold shadow-lg shadow-green-500/50 hover:shadow-green-500/70 transition-shadow"
      >
        开始冒险 🚀
      </motion.button>

      {/* Boss count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-orange-300/80"
      >
        击败 20 个 BOSS 赢得胜利！
      </motion.p>
    </motion.div>
  );
}