import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SnakeGame({ onBack, onReward }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 }
  });

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const cellSize = 20;
    const game = gameRef.current;
    
    const handleKey = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') game.nextDirection = { x: 0, y: -1 };
      if (key === 's' || key === 'arrowdown') game.nextDirection = { x: 0, y: 1 };
      if (key === 'a' || key === 'arrowleft') game.nextDirection = { x: -1, y: 0 };
      if (key === 'd' || key === 'arrowright') game.nextDirection = { x: 1, y: 0 };
    };
    
    window.addEventListener('keydown', handleKey);
    
    const interval = setInterval(() => {
      game.direction = game.nextDirection;
      const head = { ...game.snake[0] };
      head.x += game.direction.x;
      head.y += game.direction.y;
      
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || 
          game.snake.some(s => s.x === head.x && s.y === head.y)) {
        const reward = score * 10;
        if (reward > 0) {
          onReward(reward);
          alert(`游戏结束！得分: ${score}，获得${reward}金币！`);
        }
        setGameState('ready');
        setScore(0);
        game.snake = [{ x: 10, y: 10 }];
        game.direction = { x: 1, y: 0 };
        game.nextDirection = { x: 1, y: 0 };
        return;
      }
      
      game.snake.unshift(head);
      
      if (head.x === game.food.x && head.y === game.food.y) {
        setScore(s => s + 1);
        game.food = {
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20)
        };
      } else {
        game.snake.pop();
      }
      
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 400, 400);
      
      ctx.fillStyle = '#22c55e';
      game.snake.forEach(segment => {
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 2, cellSize - 2);
      });
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(game.food.x * cellSize, game.food.y * cellSize, cellSize - 2, cellSize - 2);
    }, 150);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [gameState, score, onReward]);

  return (
    <div className="text-center">
      <Button onClick={onBack} variant="outline" className="mb-4">返回</Button>
      
      <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">🐍 贪吃蛇</h2>
        <p className="text-white/80 mb-4">得分: {score} | 使用WASD或方向键</p>
        
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-4 border-cyan-500 rounded-lg mx-auto mb-4"
        />
        
        {gameState === 'ready' && (
          <Button
            onClick={() => setGameState('playing')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-xl py-6"
          >
            开始游戏
          </Button>
        )}
      </div>
    </div>
  );
}