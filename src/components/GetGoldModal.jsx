import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Coins } from 'lucide-react';

export default function GetGoldModal({ onClose }) {
  const handlePlanClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-yellow-900 via-amber-900 to-orange-900 rounded-2xl p-6 max-w-md w-full border-4 border-yellow-400 relative"
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center mb-6">
          <Coins className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">获取金币</h2>
        </div>

        <div className="bg-red-600/20 border-2 border-red-400 rounded-lg p-4 mb-6">
          <p className="text-red-200 font-bold text-center">
            ⚠️ You Are Blocked! Please Close Your VPN! THANK YOU!
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handlePlanClick('https://aii.sh/Silver-plan')}
            className="w-full py-6 text-xl bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold"
          >
            💎 10,000 金币
          </Button>

          <Button
            onClick={() => handlePlanClick('https://aii.sh/gold-plan')}
            className="w-full py-6 text-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold"
          >
            👑 150,000 金币
          </Button>
        </div>

        <p className="text-white/60 text-xs text-center mt-4">
          完成支付后返回页面获取兑换码
        </p>
      </motion.div>
    </motion.div>
  );
}