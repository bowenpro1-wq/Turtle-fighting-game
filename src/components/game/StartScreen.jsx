import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Hammer, User, Settings, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PreBattleChat from '../PreBattleChat';
import LanguageSwitcher from '../LanguageSwitcher';
import BottomNav from '../BottomNav';
import PromoCodeInput from '../PromoCodeInput';
import { AnimatePresence } from 'framer-motion';

export default function StartScreen({ onStart, defeatedBosses = [] }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [showPreBattleChat, setShowPreBattleChat] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [showPromoCode, setShowPromoCode] = useState(false);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowPreBattleChat(true);
  };

  const handleStartBattle = () => {
    setShowPreBattleChat(false);
    onStart(selectedMode);
  };

  const handlePromoRedeem = (value) => {
    const currentCoins = parseInt(localStorage.getItem('gameCoins') || '0');
    const newCoins = currentCoins + value;
    localStorage.setItem('gameCoins', newCoins.toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 pb-16 overflow-y-auto"
    >
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
      </div>

      <AnimatePresence>
        {showPreBattleChat && (
          <PreBattleChat 
            onClose={() => setShowPreBattleChat(false)} 
            onStartBattle={handleStartBattle}
            language={language}
          />
        )}
        {showPromoCode && (
          <PromoCodeInput
            onRedeem={handlePromoRedeem}
            onClose={() => setShowPromoCode(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 drop-shadow-2xl mb-4 px-4 text-center">
          龟龟冒险岛
        </h1>
        <p className="text-lg md:text-2xl text-cyan-200/80 font-semibold">
          Turtle Adventure Island
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 border-2 border-cyan-500/30 max-w-2xl mx-4"
      >
        <h3 className="text-cyan-300 text-lg md:text-xl font-semibold mb-4 text-center">操作指南</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4 text-white/90 text-sm md:text-base">
          <div className="flex items-center gap-2 md:gap-3 col-span-2 justify-center">
            <kbd className="px-3 py-2 bg-white/20 rounded-lg font-mono font-bold text-xs md:text-sm">WASD</kbd>
            <span className="text-xs md:text-sm">移动</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-2 bg-red-500/40 rounded-lg font-mono font-bold text-xs md:text-sm">K</kbd>
            <span className="text-xs md:text-sm">射击</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-2 bg-cyan-500/40 rounded-lg font-mono font-bold text-xs md:text-sm">J</kbd>
            <span className="text-xs md:text-sm">近战</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-2 bg-green-500/40 rounded-lg font-mono font-bold text-xs md:text-sm">H</kbd>
            <span className="text-xs md:text-sm">治疗</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-2 bg-blue-500/40 rounded-lg font-mono font-bold text-xs md:text-sm">O</kbd>
            <span className="text-xs md:text-sm">飞行</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-2 bg-yellow-500/40 rounded-lg font-mono font-bold text-xs md:text-sm">B</kbd>
            <span className="text-xs md:text-sm">商店</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-2 bg-orange-500/40 rounded-lg font-mono font-bold text-xs md:text-sm">L</kbd>
            <span className="text-xs md:text-sm">大招</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-2 bg-purple-500/40 rounded-lg font-mono font-bold text-xs md:text-sm">P</kbd>
            <span className="text-xs md:text-sm">终极</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.7 }}
        className="space-y-2 md:space-y-3 px-4 w-full max-w-md"
      >
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Button
            onClick={() => handleModeSelect('normal')}
            className="px-4 py-5 md:py-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white text-sm md:text-base font-bold shadow-xl active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 mr-1" fill="white" />
            正常
          </Button>
          <Button
            onClick={() => handleModeSelect('endless')}
            className="px-4 py-5 md:py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white text-sm md:text-base font-bold shadow-xl active:scale-95 transition-transform"
          >
            无尽
          </Button>
          <Button
            onClick={() => handleModeSelect('survival')}
            className="px-4 py-5 md:py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-white text-sm md:text-base font-bold shadow-xl active:scale-95 transition-transform"
          >
            生存
          </Button>
          <Button
            onClick={() => handleModeSelect('bossrush')}
            className="px-4 py-5 md:py-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-white text-sm md:text-base font-bold shadow-xl active:scale-95 transition-transform"
          >
            连战
          </Button>
        </div>
        
        <Button
          onClick={() => handleModeSelect('tower')}
          className="w-full px-6 py-6 md:py-7 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 rounded-xl text-white text-lg md:text-xl font-bold border-2 border-green-400/50 active:scale-95 transition-transform"
        >
          🗿 中大林之塔
        </Button>
        
        <Button
          onClick={() => handleModeSelect('busbreak')}
          className="w-full px-6 py-6 md:py-7 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 rounded-xl text-white text-lg md:text-xl font-bold border-2 border-purple-400/50 active:scale-95 transition-transform"
        >
          ⚔️ Boss试炼
        </Button>
        
        <Link to={createPageUrl('Forge')} className="block">
          <Button
            className="w-full px-6 py-6 md:py-7 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 rounded-xl text-white text-lg md:text-xl font-bold border-2 border-amber-400/50 active:scale-95 transition-transform"
          >
            <Hammer className="w-5 h-5 mr-2" />
            🔨 锻造处
          </Button>
        </Link>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Link to={createPageUrl('Profile')} className="block">
            <Button
              className="w-full px-4 py-5 md:py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-blue-400/50 active:scale-95 transition-transform"
            >
              <User className="w-4 h-4 mr-1" />
              玩家档案
            </Button>
          </Link>
          
          <Link to={createPageUrl('Settings')} className="block">
            <Button
              className="w-full px-4 py-5 md:py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-purple-400/50 active:scale-95 transition-transform"
            >
              <Settings className="w-4 h-4 mr-1" />
              游戏设置
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Button
            onClick={() => setShowPromoCode(true)}
            className="px-4 py-5 md:py-6 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-pink-400/50 active:scale-95 transition-transform"
          >
            <Gift className="w-4 h-4 mr-1" />
            优惠码
          </Button>
          
          <Link to={createPageUrl('Admin')} className="block">
            <Button
              className="px-4 py-5 md:py-6 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black rounded-xl text-white text-base md:text-lg font-bold border-2 border-slate-500/50 active:scale-95 transition-transform"
            >
              🔧 管理员
            </Button>
          </Link>
        </div>
        </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 md:mt-6 text-center space-y-1 px-4"
      >
        <p className="text-orange-300/80 text-sm md:text-base font-medium">
          击败 20 个 BOSS 赢得胜利！
        </p>
        <p className="text-cyan-300/70 text-xs md:text-sm">
          每得 800 分挑战一个 BOSS
        </p>
      </motion.div>
      
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-2">
        <BottomNav 
          onLanguageClick={() => {}}
          onShopClick={() => {}}
          onMiniGamesClick={() => window.location.href = createPageUrl('MiniGames')}
          showShop={false}
        />
      </div>
    </motion.div>
  );
}