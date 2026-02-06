import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ShoppingBag, LogIn, Gamepad2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BottomNav({ onLanguageClick, onShopClick, onMiniGamesClick, showShop = true }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('请使用支持的浏览器安装应用');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 p-2 flex justify-center gap-2 z-50 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={onLanguageClick}
        className="gap-1 text-xs h-8"
      >
        <Globe className="w-3 h-3" />
        语言
      </Button>
      
      {showShop && (
        <Button
          variant="outline"
          size="sm"
          onClick={onShopClick}
          className="gap-1 text-xs h-7 md:h-8 px-2 md:px-3"
        >
          <ShoppingBag className="w-3 h-3" />
          <span className="hidden sm:inline">商店</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.href = createPageUrl('Game')}
        className="gap-1 text-xs h-7 md:h-8 px-2 md:px-3"
      >
        <LogIn className="w-3 h-3" />
        <span className="hidden sm:inline">游戏</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onMiniGamesClick}
        className="gap-1 text-xs h-7 md:h-8 px-2 md:px-3"
      >
        <Gamepad2 className="w-3 h-3" />
        <span className="hidden sm:inline">小游戏</span>
      </Button>

      {showInstallButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstallClick}
          className="gap-1 text-xs h-7 md:h-8 px-2 md:px-3 bg-green-600/20 border-green-500 hover:bg-green-600/30"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">下载应用</span>
        </Button>
      )}
    </div>
  );
}