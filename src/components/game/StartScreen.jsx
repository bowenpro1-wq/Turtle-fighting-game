import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StartScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900"
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 drop-shadow-2xl mb-4">
          龟龟冒险岛
        </h1>
        <p className="text-2xl md:text-3xl text-cyan-200/80 font-semibold">
          Turtle Adventure Island
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 mb-8 border-2 border-cyan-500/30 max-w-2xl"
      >
        <h3 className="text-cyan-300 text-2xl font-semibold mb-6 text-center">操作指南</h3>
        <div className="grid grid-cols-2 gap-6 text-white/90 text-lg">
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-white/20 rounded-lg font-mono font-bold">A / D</kbd>
            <span>左右移动</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-white/20 rounded-lg font-mono font-bold">空格</kbd>
            <span>跳跃</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-red-500/40 rounded-lg font-mono font-bold">K</kbd>
            <span>射击</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-green-500/40 rounded-lg font-mono font-bold">H</kbd>
            <span>恢复生命</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-blue-500/40 rounded-lg font-mono font-bold">O</kbd>
            <span>飞行 3秒</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-yellow-500/40 rounded-lg font-mono font-bold">B</kbd>
            <span>打开商店</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.7 }}
      >
        <Button
          onClick={onStart}
          size="lg"
          className="px-16 py-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full text-white text-3xl font-bold shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all hover:scale-110"
        >
          <Play className="w-8 h-8 mr-3" fill="white" />
          开始游戏
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center space-y-2"
      >
        <p className="text-orange-300/80 text-xl font-medium">
          击败 20 个 BOSS 赢得胜利！
        </p>
        <p className="text-cyan-300/70 text-lg">
          保护建筑物免受敌人攻击
        </p>
      </motion.div>
    </motion.div>
  );
}