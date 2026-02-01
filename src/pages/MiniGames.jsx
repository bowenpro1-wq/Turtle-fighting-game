import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MiniGames() {
  const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('gameCoins') || '0'));
  const [clickerScore, setClickerScore] = useState(0);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);

  // Coin Clicker Game
  const handleCoinClick = () => {
    setClickerScore(prev => prev + 1);
    if (clickerScore + 1 >= 50) {
      const earnedCoins = 100;
      const newTotal = coins + earnedCoins;
      setCoins(newTotal);
      localStorage.setItem('gameCoins', newTotal.toString());
      setClickerScore(0);
      alert(`恭喜！获得 ${earnedCoins} 金币！`);
    }
  };

  // Memory Card Game
  const startMemoryGame = () => {
    const symbols = ['🎮', '⚔️', '🛡️', '💎', '🔥', '⚡', '🌟', '🎯'];
    const cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false }));
    setMemoryCards(cards);
    setFlippedCards([]);
    setMatchedCards([]);
    setCurrentGame('memory');
  };

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) return;
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const firstCard = memoryCards.find(c => c.id === first);
      const secondCard = memoryCards.find(c => c.id === second);

      if (firstCard.symbol === secondCard.symbol) {
        setMatchedCards([...matchedCards, first, second]);
        setFlippedCards([]);
        
        if (matchedCards.length + 2 === memoryCards.length) {
          const earnedCoins = 200;
          const newTotal = coins + earnedCoins;
          setCoins(newTotal);
          localStorage.setItem('gameCoins', newTotal.toString());
          setTimeout(() => alert(`完成记忆游戏！获得 ${earnedCoins} 金币！`), 500);
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </Link>
          <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-yellow-400">{coins}</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          小游戏中心
        </h1>

        {!currentGame && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('clicker')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">💰 点击金币</h2>
              <p className="text-white/80">点击50次获得100金币</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-600 to-teal-600 p-6 rounded-xl cursor-pointer"
              onClick={startMemoryGame}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🎴 记忆翻牌</h2>
              <p className="text-white/80">配对成功获得200金币</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('reaction')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">⚡ 反应速度</h2>
              <p className="text-white/80">即将推出...</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-pink-600 to-purple-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('quiz')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🧠 知识问答</h2>
              <p className="text-white/80">即将推出...</p>
            </motion.div>
          </div>
        )}

        {currentGame === 'clicker' && (
          <div className="text-center">
            <Button
              onClick={() => setCurrentGame(null)}
              variant="outline"
              className="mb-4"
            >
              返回
            </Button>
            <div className="bg-slate-800 p-8 rounded-xl">
              <h2 className="text-3xl font-bold text-white mb-4">点击金币游戏</h2>
              <p className="text-xl text-white/80 mb-6">进度: {clickerScore}/50</p>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="inline-block"
              >
                <Button
                  onClick={handleCoinClick}
                  className="w-32 h-32 text-6xl bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400"
                >
                  💰
                </Button>
              </motion.div>
            </div>
          </div>
        )}

        {currentGame === 'memory' && (
          <div className="text-center">
            <Button
              onClick={() => setCurrentGame(null)}
              variant="outline"
              className="mb-4"
            >
              返回
            </Button>
            <div className="bg-slate-800 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-4">记忆翻牌游戏</h2>
              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                {memoryCards.map(card => (
                  <motion.button
                    key={card.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(card.id)}
                    className={`w-full aspect-square text-4xl rounded-lg ${
                      flippedCards.includes(card.id) || matchedCards.includes(card.id)
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                        : 'bg-slate-700'
                    }`}
                  >
                    {flippedCards.includes(card.id) || matchedCards.includes(card.id) ? card.symbol : '❓'}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(currentGame === 'reaction' || currentGame === 'quiz') && (
          <div className="text-center bg-slate-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-4">即将推出</h2>
            <Button onClick={() => setCurrentGame(null)} variant="outline">
              返回
            </Button>
          </div>
        )}
      </div>

      <BottomNav 
        onLanguageClick={() => {}}
        onShopClick={() => {}}
        onMiniGamesClick={() => {}}
        showShop={false}
      />
    </div>
  );
}