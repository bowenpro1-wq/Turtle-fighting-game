import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Hammer, User, Settings, Gift, Users, Save, LogIn, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import PreBattleChat from '../PreBattleChat';
import LanguageSwitcher from '../LanguageSwitcher';
import BottomNav from '../BottomNav';
import PromoCodeInput from '../PromoCodeInput';
import ChatInvitationBanner from '../social/ChatInvitationBanner';

export default function StartScreen({ onStart, onStartTutorial, defeatedBosses = [] }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [showPreBattleChat, setShowPreBattleChat] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await base44.auth.isAuthenticated();
        setIsLoggedIn(loggedIn);
        
        if (loggedIn) {
          const user = await base44.auth.me();
          const progress = await base44.entities.GameProgress.filter({ user_email: user.email });
          setHasProgress(progress.length > 0);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleLoadProgress = async () => {
    try {
      const user = await base44.auth.me();
      const progress = await base44.entities.GameProgress.filter({ user_email: user.email });
      
      if (progress.length > 0) {
        // Let parent component handle loading
        onStart(progress[0].game_mode, true);
      }
    } catch (error) {
      console.error('Load progress error:', error);
      alert('加载进度失败');
    }
  };

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

  const handleDownloadApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    if (window.matchMedia('(display-mode: standalone)').matches) {
      alert('应用已安装！');
      return;
    }

    if (isIOS) {
      alert('📱 iOS安装步骤：\n\n1. 点击底部分享按钮 (□↑)\n2. 向下滚动\n3. 选择"添加到主屏幕"\n4. 点击"添加"');
    } else if (isAndroid) {
      alert('📱 安卓安装步骤：\n\n1. 点击浏览器菜单 (⋮)\n2. 选择"安装应用"或"添加到主屏幕"\n3. 确认安装');
    } else {
      // Desktop browsers
      alert('💻 电脑安装步骤：\n\n1. 点击地址栏右侧的安装图标\n或\n2. 按 Ctrl+D (Windows) / Cmd+D (Mac) 添加书签\n\n推荐使用Chrome或Edge浏览器');
    }
  };

  return (
    <>
      <ChatInvitationBanner />
      
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
        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 drop-shadow-2xl mb-3 px-4 text-center">
          龟龟冒险岛
        </h1>
        <p className="text-sm md:text-lg text-cyan-200/80 font-semibold">
          Turtle Adventure Island
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 border-2 border-cyan-500/30 max-w-2xl mx-4"
      >
        <h3 className="text-cyan-300 text-sm md:text-base font-semibold mb-3 text-center">操作指南</h3>
        <div className="grid grid-cols-2 gap-2 md:gap-3 text-white/90 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2 col-span-2 justify-center">
            <kbd className="px-2 py-1 bg-white/20 rounded font-mono font-bold text-[10px] md:text-xs">WASD</kbd>
            <span className="text-[10px] md:text-xs">移动</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-red-500/40 rounded font-mono font-bold text-[10px] md:text-xs">K</kbd>
            <span className="text-[10px] md:text-xs">射击</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-cyan-500/40 rounded font-mono font-bold text-[10px] md:text-xs">J</kbd>
            <span className="text-[10px] md:text-xs">近战</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-green-500/40 rounded font-mono font-bold text-[10px] md:text-xs">H</kbd>
            <span className="text-[10px] md:text-xs">治疗</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-blue-500/40 rounded font-mono font-bold text-[10px] md:text-xs">O</kbd>
            <span className="text-[10px] md:text-xs">飞行</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-yellow-500/40 rounded font-mono font-bold text-[10px] md:text-xs">B</kbd>
            <span className="text-[10px] md:text-xs">商店</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-orange-500/40 rounded font-mono font-bold text-[10px] md:text-xs">L</kbd>
            <span className="text-[10px] md:text-xs">大招</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-purple-500/40 rounded font-mono font-bold text-[10px] md:text-xs">U</kbd>
            <span className="text-[10px] md:text-xs">召唤</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-pink-500/40 rounded font-mono font-bold text-[10px] md:text-xs">P</kbd>
            <span className="text-[10px] md:text-xs">终极</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.7 }}
        className="space-y-2 md:space-y-3 px-4 w-full max-w-md"
      >
        {/* Tutorial Button */}
        <Button
          onClick={onStartTutorial}
          className="w-full px-5 py-5 md:py-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-cyan-400/50 active:scale-95 transition-transform"
        >
          <Play className="w-5 h-5 mr-2" fill="white" />
          📖 新手教程
        </Button>

        {/* Login / Load Progress */}
        {!isLoggedIn ? (
          <Button
            onClick={handleLogin}
            className="w-full px-5 py-5 md:py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-blue-400/50 active:scale-95 transition-transform"
          >
            <LogIn className="w-5 h-5 mr-2" />
            🔐 登录保存进度
          </Button>
        ) : hasProgress && (
          <Button
            onClick={handleLoadProgress}
            className="w-full px-5 py-5 md:py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-green-400/50 active:scale-95 transition-transform animate-pulse"
          >
            <Save className="w-5 h-5 mr-2" />
            📂 继续上次游戏
          </Button>
        )}

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Button
            onClick={() => handleModeSelect('normal')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            <Play className="w-3.5 h-3.5 mr-1" fill="white" />
            正常
          </Button>
          <Button
            onClick={() => handleModeSelect('endless')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            ♾️ 无尽
          </Button>
          <Button
            onClick={() => handleModeSelect('survival')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            🛡️ 生存
          </Button>
          <Button
            onClick={() => handleModeSelect('bossrush')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            ⚔️ 连战
          </Button>
          <Button
            onClick={() => handleModeSelect('defense')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            🏰 防守
          </Button>
          <Button
            onClick={() => handleModeSelect('timeattack')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            ⏱️ 限时
          </Button>
          <Button
            onClick={() => handleModeSelect('multiboss')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            🔥 多Boss
          </Button>
          <Button
            onClick={() => handleModeSelect('superattack')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            ⚡ 超攻
          </Button>
          <Button
            onClick={() => handleModeSelect('raid')}
            className="px-3 py-4 md:py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl text-white text-xs md:text-sm font-bold shadow-xl active:scale-95 transition-transform"
          >
            🗡️ 突袭
          </Button>
          </div>
        
        <Button
          onClick={() => handleModeSelect('tower')}
          className="w-full px-5 py-5 md:py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-green-400/50 active:scale-95 transition-transform"
        >
          🗿 中大林之塔
        </Button>
        
        <Button
          onClick={() => handleModeSelect('busbreak')}
          className="w-full px-5 py-5 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-purple-400/50 active:scale-95 transition-transform"
        >
          ⚔️ Boss试炼
        </Button>
        
        <Link to={createPageUrl('PublicGame')} className="block">
          <Button
            className="w-full px-5 py-5 md:py-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-cyan-400/50 active:scale-95 transition-transform"
          >
            <Users className="w-5 h-5 mr-2" />
            🌐 公共游戏
          </Button>
        </Link>
        
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Link to={createPageUrl('PublicChat')} className="block">
            <Button
              className="w-full px-3 py-4 md:py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-white text-sm md:text-base font-bold border-2 border-purple-400/50 active:scale-95 transition-transform"
            >
              💬 公共聊天室
            </Button>
          </Link>
          
          <Link to={createPageUrl('Friends')} className="block">
            <Button
              className="w-full px-3 py-4 md:py-5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-xl text-white text-sm md:text-base font-bold border-2 border-pink-400/50 active:scale-95 transition-transform"
            >
              👥 添加好友
            </Button>
          </Link>
        </div>
        
        <Link to={createPageUrl('Forge')} className="block">
          <Button
            className="w-full px-5 py-5 md:py-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 rounded-xl text-white text-base md:text-lg font-bold border-2 border-amber-400/50 active:scale-95 transition-transform"
          >
            <Hammer className="w-4 h-4 mr-2" />
            🔨 锻造处
          </Button>
        </Link>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Link to={createPageUrl('Skins')} className="block">
            <Button
              className="w-full px-3 py-4 md:py-5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-xl text-white text-sm md:text-base font-bold border-2 border-pink-400/50 active:scale-95 transition-transform"
            >
              ✨ 皮肤商店
            </Button>
          </Link>

          <Link to={createPageUrl('Encyclopedia')} className="block">
            <Button
              className="w-full px-3 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white text-sm md:text-base font-bold border-2 border-blue-400/50 active:scale-95 transition-transform"
            >
              📖 游戏百科
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Link to={createPageUrl('Profile')} className="block">
            <Button
              className="w-full px-3 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white text-sm md:text-base font-bold border-2 border-blue-400/50 active:scale-95 transition-transform"
            >
              <User className="w-3.5 h-3.5 mr-1" />
              玩家档案
            </Button>
          </Link>
          
          <Link to={createPageUrl('Settings')} className="block">
            <Button
              className="w-full px-3 py-4 md:py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white text-sm md:text-base font-bold border-2 border-purple-400/50 active:scale-95 transition-transform"
            >
              <Settings className="w-3.5 h-3.5 mr-1" />
              游戏设置
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Button
            onClick={() => setShowPromoCode(true)}
            className="px-2 py-4 md:py-5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-xl text-white text-xs md:text-sm font-bold border-2 border-pink-400/50 active:scale-95 transition-transform"
          >
            <Gift className="w-3.5 h-3.5 mr-1" />
            优惠码
          </Button>

          <Link to={createPageUrl('Admin')} className="block">
            <Button
              className="px-2 py-4 md:py-5 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black rounded-xl text-white text-xs md:text-sm font-bold border-2 border-slate-500/50 active:scale-95 transition-transform"
            >
              🔧 管理员
            </Button>
          </Link>

          <Button
            onClick={handleDownloadApp}
            className="px-2 py-4 md:py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white text-xs md:text-sm font-bold border-2 border-green-400/50 active:scale-95 transition-transform"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            下载
          </Button>
        </div>
        </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-3 md:mt-4 text-center space-y-0.5 px-4"
      >
        <p className="text-orange-300/80 text-xs md:text-sm font-medium">
          击败 20 个 BOSS 赢得胜利！
        </p>
        <p className="text-cyan-300/70 text-[10px] md:text-xs">
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
    </>
  );
}