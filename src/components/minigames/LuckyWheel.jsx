import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LuckyWheel({ onBack, onReward }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const prizes = [50, 100, 200, 500, 1000, 2000, 5000, 10000];

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + 360 * spins + Math.random() * 360;
    setRotation(finalRotation);
    
    setTimeout(() => {
      const prizeIndex = Math.floor(((finalRotation % 360) / 360) * prizes.length);
      const prize = prizes[prizeIndex];
      onReward(prize);
      alert(`恭喜！获得 ${prize} 金币！`);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="text-center">
      <Button onClick={onBack} variant="outline" className="mb-4">返回</Button>
      
      <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">🎡 幸运转盘</h2>
        
        <div className="relative w-64 h-64 mx-auto mb-6">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="w-full h-full rounded-full border-8 border-yellow-500 relative overflow-hidden"
            style={{
              background: `conic-gradient(
                #ef4444 0deg 45deg,
                #f59e0b 45deg 90deg,
                #22c55e 90deg 135deg,
                #3b82f6 135deg 180deg,
                #8b5cf6 180deg 225deg,
                #ec4899 225deg 270deg,
                #14b8a6 270deg 315deg,
                #fbbf24 315deg 360deg
              )`
            }}
          >
            {prizes.map((prize, idx) => (
              <div
                key={idx}
                className="absolute top-1/2 left-1/2 text-white font-bold text-sm"
                style={{
                  transform: `rotate(${idx * 45}deg) translateY(-80px)`,
                  transformOrigin: 'center'
                }}
              >
                {prize}
              </div>
            ))}
          </motion.div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-yellow-500 z-10" />
        </div>
        
        <Button
          onClick={spin}
          disabled={spinning}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-xl py-6"
        >
          {spinning ? '旋转中...' : '🎰 转动转盘'}
        </Button>
      </div>
    </div>
  );
}