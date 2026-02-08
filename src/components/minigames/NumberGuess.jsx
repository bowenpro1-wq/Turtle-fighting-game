import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NumberGuess({ onBack, onReward }) {
  const [target] = useState(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState([]);

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) {
      alert('请输入1-100之间的数字！');
      return;
    }
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (num === target) {
      const reward = Math.max(50, 300 - newAttempts * 20);
      onReward(reward);
      alert(`恭喜！用${newAttempts}次猜中数字${target}，获得${reward}金币！`);
      onBack();
    } else {
      const hint = num < target ? `${num} 太小了！` : `${num} 太大了！`;
      setHints([...hints, hint]);
      setGuess('');
    }
  };

  return (
    <div className="text-center">
      <Button onClick={onBack} variant="outline" className="mb-4">返回</Button>
      
      <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">🔢 猜数字</h2>
        <p className="text-white/80 mb-6">猜一个1-100之间的数字 | 尝试次数: {attempts}</p>
        
        <div className="mb-6">
          <Input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            placeholder="输入你的猜测"
            className="text-center text-2xl h-16 bg-slate-700 text-white border-cyan-500"
            min="1"
            max="100"
          />
        </div>
        
        <Button
          onClick={handleGuess}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-xl py-6 mb-6"
        >
          确认猜测
        </Button>
        
        <div className="max-h-40 overflow-y-auto space-y-2">
          {hints.map((hint, idx) => (
            <p key={idx} className="text-white/70">{hint}</p>
          ))}
        </div>
      </div>
    </div>
  );
}