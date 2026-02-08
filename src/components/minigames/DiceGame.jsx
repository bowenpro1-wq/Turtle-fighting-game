import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DiceGame({ coins, onBack, onCoinsChange }) {
  const [bet, setBet] = useState(50);
  const [choice, setChoice] = useState(null);
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (rolling || !choice || coins < bet) return;
    
    setRolling(true);
    onCoinsChange(coins - bet);
    
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 6) + 1;
        setDiceValue(final);
        
        const isWin = (choice === 'big' && final >= 4) || (choice === 'small' && final <= 3);
        if (isWin) {
          const winAmount = bet * 2;
          onCoinsChange(coins - bet + winAmount);
          alert(`获胜！骰子点数: ${final}，赢得 ${winAmount} 金币！`);
        } else {
          alert(`失败！骰子点数: ${final}`);
        }
        
        setRolling(false);
        setChoice(null);
      }
    }, 100);
  };

  return (
    <div className="text-center">
      <Button onClick={onBack} variant="outline" className="mb-4">返回</Button>
      
      <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">🎲 骰子游戏</h2>
        
        <motion.div
          animate={rolling ? { rotate: 360 } : {}}
          transition={{ repeat: rolling ? Infinity : 0, duration: 0.3 }}
          className="w-32 h-32 mx-auto mb-6 bg-white rounded-xl flex items-center justify-center text-6xl shadow-xl"
        >
          {diceValue === 1 && '⚀'}
          {diceValue === 2 && '⚁'}
          {diceValue === 3 && '⚂'}
          {diceValue === 4 && '⚃'}
          {diceValue === 5 && '⚄'}
          {diceValue === 6 && '⚅'}
        </motion.div>
        
        <div className="mb-6">
          <label className="text-white mb-2 block">下注金额</label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Math.max(10, parseInt(e.target.value) || 10))}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
            min="10"
            step="10"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => setChoice('big')}
            className={`py-6 text-xl ${choice === 'big' ? 'bg-green-600' : 'bg-blue-600'}`}
          >
            大 (4-6)
          </Button>
          <Button
            onClick={() => setChoice('small')}
            className={`py-6 text-xl ${choice === 'small' ? 'bg-green-600' : 'bg-blue-600'}`}
          >
            小 (1-3)
          </Button>
        </div>
        
        <Button
          onClick={roll}
          disabled={!choice || rolling || coins < bet}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-xl py-6"
        >
          {rolling ? '掷骰子中...' : '🎲 掷骰子'}
        </Button>
      </div>
    </div>
  );
}