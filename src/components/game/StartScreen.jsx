import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PreBattleChat from '@/components/PreBattleChat';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import BottomNav from '@/components/BottomNav';

export default function StartScreen({ onStart, defeatedBosses = [] }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [showPreBattleChat, setShowPreBattleChat] = useState(false);
  const [language, setLanguage] = useState('zh');
  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowPreBattleChat(true);
  };

  const handleStartBattle = () => {
    setShowPreBattleChat(false);
    onStart(selectedMode);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 pb-16"
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
      </div>

      <AnimatePresence>
        {showPreBattleChat && (
          <PreBattleChat 
            onClose={() => setShowPreBattleChat(false)} 
            onStartBattle={handleStartBattle}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 drop-shadow-2xl mb-4">
          龟龟冒险岛
        </h1>
        <p className="text-lg md:text-xl text-cyan-200/80 font-semibold">
          Turtle Adventure Island
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 mb-6 border-2 border-cyan-500/30 max-w-2xl"
      >
        <h3 className="text-cyan-300 text-lg font-semibold mb-3 text-center">操作指南</h3>
        <div className="grid grid-cols-2 gap-3 text-white/90 text-sm">
          <div className="flex items-center gap-2 col-span-2 justify-center">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono font-bold">WASD</kbd>
            <span className="text-xs">移动</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-red-500/40 rounded text-xs font-mono font-bold">K</kbd>
            <span className="text-xs">射击</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-cyan-500/40 rounded text-xs font-mono font-bold">J</kbd>
            <span className="text-xs">近战</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-green-500/40 rounded text-xs font-mono font-bold">H</kbd>
            <span className="text-xs">治疗</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-blue-500/40 rounded text-xs font-mono font-bold">O</kbd>
            <span className="text-xs">飞行</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-yellow-500/40 rounded text-xs font-mono font-bold">B</kbd>
            <span className="text-xs">商店</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-orange-500/40 rounded text-xs font-mono font-bold">L</kbd>
            <span className="text-xs">大招</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-purple-500/40 rounded text-xs font-mono font-bold">P</kbd>
            <span className="text-xs">终极</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.7 }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleModeSelect('normal')}
            size="sm"
            className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white text-base font-bold"
          >
            <Play className="w-4 h-4 mr-1" fill="white" />
            正常模式
          </Button>
          <Button
            onClick={() => handleModeSelect('endless')}
            size="sm"
            className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white text-base font-bold"
          >
            无尽模式
          </Button>
          <Button
            onClick={() => handleModeSelect('survival')}
            size="sm"
            className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-white text-base font-bold"
          >
            生存模式
          </Button>
          {defeatedBosses.length > 0 && (
            <Button
              onClick={() => handleModeSelect('bossrush')}
              size="sm"
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-white text-base font-bold"
            >
              BOSS连战
            </Button>
          )}
          </div>
          <div className="mt-3 space-y-2">
          <Button
            onClick={() => handleModeSelect('tower')}
            size="sm"
            className="w-full px-8 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 rounded-xl text-white text-xl font-bold border-2 border-green-400/50"
          >
            🗿 中大林之塔
          </Button>
          <p className="text-green-300 text-xs text-center">挑战100层塔！</p>
          
          <Button
            onClick={() => handleModeSelect('busbreak')}
            size="sm"
            className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 rounded-xl text-white text-xl font-bold border-2 border-purple-400/50"
          >
            ⚔️ Boss试炼
          </Button>
          <p className="text-purple-300 text-xs text-center">击败Boss获得武器！</p>
          
          <Link to={createPageUrl('Forge')}>
            <Button
              size="sm"
              className="w-full px-8 py-5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 rounded-xl text-white text-xl font-bold border-2 border-amber-400/50"
            >
              <Hammer className="w-6 h-6 mr-2" />
              锻造处
            </Button>
          </Link>
          <p className="text-amber-300 text-xs text-center">使用金币升级武器！</p>
          </div>
          </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-center space-y-1"
      >
        <p className="text-orange-300/80 text-sm font-medium">
          击败20个BOSS赢得胜利！
        </p>
        <p className="text-cyan-300/70 text-xs">
          每800分挑战一个BOSS
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