import React from 'react';
import { motion } from 'framer-motion';
import { Play, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StartScreen({ onStart, defeatedBosses = [] }) {
  const [selectedMode, setSelectedMode] = React.useState(null);
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
          <div className="flex items-center gap-3 col-span-2 justify-center">
            <kbd className="px-4 py-2 bg-white/20 rounded-lg font-mono font-bold">W A S D</kbd>
            <span>全方向移动</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-red-500/40 rounded-lg font-mono font-bold">K</kbd>
            <span>射击</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-cyan-500/40 rounded-lg font-mono font-bold">J</kbd>
            <span>近战攻击</span>
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
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-orange-500/40 rounded-lg font-mono font-bold">L</kbd>
            <span>大招 (100发)</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-4 py-2 bg-purple-500/40 rounded-lg font-mono font-bold">P</kbd>
            <span>终极技 (全灭)</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.7 }}
        className="space-y-3 md:space-y-4 px-4 w-full max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <Button
            onClick={() => handleModeSelect('normal')}
            className="px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl md:rounded-2xl text-white text-sm md:text-lg font-bold shadow-2xl"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="white" />
            正常
          </Button>
          <Button
            onClick={() => handleModeSelect('endless')}
            className="px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl md:rounded-2xl text-white text-sm md:text-lg font-bold shadow-2xl"
          >
            无尽
          </Button>
          <Button
            onClick={() => handleModeSelect('survival')}
            className="px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl md:rounded-2xl text-white text-sm md:text-lg font-bold shadow-2xl"
          >
            生存
          </Button>
          {defeatedBosses.length > 0 && (
            <Button
              onClick={() => handleModeSelect('bossrush')}
              className="px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl md:rounded-2xl text-white text-sm md:text-lg font-bold shadow-2xl"
            >
              BOSS
            </Button>
          )}
          </div>
          <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
          <Button
            onClick={() => handleModeSelect('tower')}
            className="w-full px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 rounded-xl md:rounded-2xl text-white text-lg md:text-2xl font-bold shadow-2xl border-2 md:border-4 border-green-400/50"
          >
            🗿 中大林之塔
          </Button>
          <p className="text-green-300 text-xs text-center">挑战100层塔！</p>
          
          <Button
            onClick={() => handleModeSelect('busbreak')}
            className="w-full px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 rounded-xl md:rounded-2xl text-white text-lg md:text-2xl font-bold shadow-2xl border-2 md:border-4 border-purple-400/50"
          >
            ⚔️ Boss试炼
          </Button>
          <p className="text-purple-300 text-xs text-center">击败BOSS获得武器！</p>
          
          <Link to={createPageUrl('Forge')} className="block">
            <Button
              className="w-full px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 rounded-xl md:rounded-2xl text-white text-lg md:text-2xl font-bold shadow-2xl border-2 md:border-4 border-amber-400/50"
            >
              <Hammer className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              锻造处
            </Button>
          </Link>
          <p className="text-amber-300 text-xs text-center">AI智能升级！</p>
          </div>
          </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-center space-y-2"
      >
        <p className="text-orange-300/80 text-base font-medium">
          击败 20 个 BOSS 赢得胜利！
        </p>
        <p className="text-cyan-300/70 text-sm">
          每得 800 分挑战一个 BOSS
        </p>
      </motion.div>
      
      <BottomNav 
        onLanguageClick={() => {}}
        onShopClick={() => {}}
        onMiniGamesClick={() => window.location.href = createPageUrl('MiniGames')}
        showShop={false}
      />
    </motion.div>
  );
}