import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ReactionGame({ onBack, onReward }) {
  const [state, setState] = useState('start');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);

  const startTest = () => {
    setState('waiting');
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
      setState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      
      if (time < 300) {
        onReward(300);
        alert(`惊人！反应时间: ${time}ms - 获得300金币！`);
      } else if (time < 500) {
        onReward(200);
        alert(`很快！反应时间: ${time}ms - 获得200金币！`);
      } else {
        onReward(100);
        alert(`不错！反应时间: ${time}ms - 获得100金币！`);
      }
      
      setState('start');
    } else if (state === 'waiting') {
      alert('太早了！等待绿色出现！');
      setState('start');
    }
  };

  return (
    <div className="text-center">
      <Button onClick={onBack} variant="outline" className="mb-4">返回</Button>
      
      <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">⚡ 反应速度测试</h2>
        
        {state === 'start' && (
          <>
            <p className="text-white/80 mb-6">当方块变绿时立即点击！</p>
            <Button
              onClick={startTest}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-xl py-8"
            >
              开始测试
            </Button>
          </>
        )}
        
        {state === 'waiting' && (
          <motion.div
            onClick={handleClick}
            className="w-64 h-64 mx-auto bg-red-600 rounded-xl flex items-center justify-center cursor-pointer"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <p className="text-white text-2xl font-bold">等待...</p>
          </motion.div>
        )}
        
        {state === 'go' && (
          <motion.div
            onClick={handleClick}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-64 h-64 mx-auto bg-green-500 rounded-xl flex items-center justify-center cursor-pointer"
          >
            <p className="text-white text-4xl font-bold">点击！</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}