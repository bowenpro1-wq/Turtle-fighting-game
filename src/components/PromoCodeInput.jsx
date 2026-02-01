import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, X } from 'lucide-react';

export default function PromoCodeInput({ onRedeem, onClose }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleRedeem = () => {
    const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '{}');
    const usedCodes = JSON.parse(localStorage.getItem('usedPromoCodes') || '[]');

    if (usedCodes.includes(code)) {
      setMessage('此优惠码已使用过');
      return;
    }

    if (promoCodes[code]) {
      const value = promoCodes[code];
      onRedeem(value);
      
      usedCodes.push(code);
      localStorage.setItem('usedPromoCodes', JSON.stringify(usedCodes));
      
      setMessage(`成功兑换 ${value} 金币！`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setMessage('无效的优惠码');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border-2 border-pink-500/50 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-pink-400" />
            <h2 className="text-3xl font-bold text-white">兑换优惠码</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <Input
          placeholder="请输入优惠码"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleRedeem()}
          className="mb-4 text-lg"
        />

        <Button
          onClick={handleRedeem}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
        >
          兑换
        </Button>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-center font-semibold ${
              message.includes('成功') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}