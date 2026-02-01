import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coins, X, ShoppingCart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GoldShop({ onClose, currentCoins, onCoinsUpdate }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      const goldAmount = parseInt(params.get('gold') || '0');
      if (goldAmount > 0) {
        const currentCoins = parseInt(localStorage.getItem('gameCoins') || '0');
        const newTotal = currentCoins + goldAmount;
        localStorage.setItem('gameCoins', newTotal.toString());
        if (onCoinsUpdate) onCoinsUpdate(newTotal);
        
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        alert(`购买成功！获得 ${goldAmount} 金币！`);
      }
    }
  }, [onCoinsUpdate]);

  const handlePurchase = async (priceId, goldAmount) => {
    // Check if running in iframe
    if (window.self !== window.top) {
      alert('请在发布的应用中使用支付功能，预览模式下无法支付。');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckout', {
        priceId,
        goldAmount
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('购买失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-yellow-500/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            购买金币
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold text-yellow-400">当前: {currentCoins.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 rounded-xl"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  10,000 金币
                </div>
                <div className="text-white/80 text-sm">最超值选择！</div>
              </div>
              <div className="text-3xl font-bold text-white">$10</div>
            </div>
            <Button
              onClick={() => handlePurchase('price_1Svz3t5exc20KFX6kogPLPyc', 10000)}
              disabled={loading}
              className="w-full bg-white text-orange-600 hover:bg-white/90 font-bold py-3"
            >
              {loading ? '处理中...' : '立即购买'}
            </Button>
          </motion.div>
        </div>

        <p className="text-white/60 text-xs text-center mt-4">
          安全支付由 Stripe 提供
        </p>
      </motion.div>
    </motion.div>
  );
}