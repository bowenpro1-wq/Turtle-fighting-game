import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ColorMatch({ onBack, onReward }) {
  const [targetColor, setTargetColor] = useState('');
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#fbbf24'];

  const startRound = () => {
    const target = colors[Math.floor(Math.random() * colors.length)];
    setTargetColor(target);
    
    const opts = [target];
    while (opts.length < 4) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      if (!opts.includes(color)) opts.push(color);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleChoice = (color) => {
    if (color === targetColor) {
      setScore(score + 1);
      
      if (round + 1 >= 10) {
        const reward = (score + 1) * 20;
        onReward(reward);
        alert(`完成！答对${score + 1}题，获得${reward}金币！`);
        onBack();
      } else {
        setRound(round + 1);
        startRound();
      }
    } else {
      alert(`错误！答对${score}题`);
      onBack();
    }
  };

  return (
    <div className="text-center">
      <Button onClick={onBack} variant="outline" className="mb-4">返回</Button>
      
      <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">🎨 颜色配对</h2>
        <p className="text-white/80 mb-6">回合 {round + 1}/10 | 得分: {score}</p>
        
        <div 
          className="w-48 h-48 mx-auto mb-6 rounded-xl border-4 border-white/30"
          style={{ backgroundColor: targetColor }}
        />
        
        <p className="text-white mb-4 text-xl">选择相同颜色:</p>
        
        <div className="grid grid-cols-2 gap-4">
          {options.map((color, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(color)}
              className="w-full h-24 rounded-xl border-4 border-white/50 hover:border-white transition-all"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}