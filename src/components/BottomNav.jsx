import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ShoppingBag, LogIn, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BottomNav({ onLanguageClick, onShopClick, onMiniGamesClick, showShop = true }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 p-2 flex justify-center gap-2 z-50">
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
          className="gap-1 text-xs h-8"
        >
          <ShoppingBag className="w-3 h-3" />
          商店
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.href = createPageUrl('Game')}
        className="gap-1 text-xs h-8"
      >
        <LogIn className="w-3 h-3" />
        登录
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onMiniGamesClick}
        className="gap-1 text-xs h-8"
      >
        <Gamepad2 className="w-3 h-3" />
        小游戏
      </Button>
    </div>
  );
}