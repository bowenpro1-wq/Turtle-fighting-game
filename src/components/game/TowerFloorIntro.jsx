import React from 'react';
import { motion } from 'framer-motion';

export default function TowerFloorIntro({ floor, specialFloor }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-8">
            第 {floor} 层
          </h1>
        </motion.div>

        {specialFloor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-500/20 border-4 border-yellow-500 rounded-2xl p-8"
          >
            <div className="text-yellow-300 text-4xl mb-4">⚠️ 特殊关卡 ⚠️</div>
            <div className="text-yellow-200 text-3xl font-bold">{specialFloor}</div>
            {specialFloor === '磐石迷宫' && (
              <p className="text-yellow-100 text-lg mt-4">找到出口才能挑战BOSS</p>
            )}
            {specialFloor === '中大林狂欢节' && (
              <p className="text-yellow-100 text-lg mt-4">敌人数量最多但较弱</p>
            )}
            {specialFloor === '石头体' && (
              <p className="text-yellow-100 text-lg mt-4">利用石头作为掩护</p>
            )}
          </motion.div>
        )}

        {floor % 10 === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-orange-400 text-3xl font-bold"
          >
            {floor === 100 ? '🗿 中大林真身 🗿' : `中大林分身 ${floor / 10} 号`}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}