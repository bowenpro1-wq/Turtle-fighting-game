import React from 'react';
import { motion } from 'framer-motion';

export default function BossIntro({ boss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black"
      />

      {/* Boss intro content */}
      <div className="relative text-center">
        {/* Warning lines */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
        />

        {/* Warning text */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-red-500 text-xl font-bold tracking-[0.3em] mb-4"
        >
          ⚠️ WARNING ⚠️
        </motion.div>

        {/* Boss icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${boss.color}40, ${boss.color}10)`,
            boxShadow: `0 0 60px ${boss.color}80`
          }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-6xl"
          >
            👑
          </motion.div>
        </motion.div>

        {/* Boss name */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          className="text-5xl md:text-6xl font-bold mb-4"
          style={{
            color: boss.color,
            textShadow: `0 0 30px ${boss.color}, 0 0 60px ${boss.color}50`
          }}
        >
          {boss.name}
        </motion.h1>

        {/* Boss stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-8 text-white/80"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{boss.health}</div>
            <div className="text-sm">生命值</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{boss.damage}</div>
            <div className="text-sm">攻击力</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">#{boss.id}</div>
            <div className="text-sm">等级</div>
          </div>
        </motion.div>

        {/* Get ready text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: 1, repeat: Infinity }}
          className="mt-8 text-2xl text-white font-bold"
        >
          准备战斗！
        </motion.div>
      </div>
    </motion.div>
  );
}