import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/BottomNav';
import ReactionGame from '@/components/minigames/ReactionGame';
import QuizGame from '@/components/minigames/QuizGame';
import LuckyWheel from '@/components/minigames/LuckyWheel';
import DiceGame from '@/components/minigames/DiceGame';
import ColorMatch from '@/components/minigames/ColorMatch';
import NumberGuess from '@/components/minigames/NumberGuess';
import SnakeGame from '@/components/minigames/SnakeGame';

export default function MiniGames() {
  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem('gameCoins');
    return savedCoins ? parseInt(savedCoins) : 0;
  });
  const [clickerScore, setClickerScore] = useState(0);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [hasSubscribed, setHasSubscribed] = useState(() => localStorage.getItem('youtubeSubscribed') === 'true');
  
  // Reaction game
  const [reactionState, setReactionState] = useState('waiting');
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionScore, setReactionScore] = useState(0);
  
  // Quiz game
  const [quizQuestions] = useState([
    { q: '龟龟冒险岛中最终Boss是谁？', a: ['广智', '小黄龙', '中大林', '海星'], correct: 0 },
    { q: 'What key is used to shoot?', a: ['K', 'J', 'L', 'H'], correct: 0 },
    { q: '塔模式有多少层？', a: ['50', '100', '200', '150'], correct: 1 },
    { q: 'Which weapon summons allies?', a: ['Totem', 'Chichao', 'Dianchao', 'Guigui'], correct: 0 },
    { q: '每击败多少Boss获胜？', a: ['10', '15', '20', '25'], correct: 2 }
  ]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  
  // Lucky wheel
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  
  // Dice game
  const [diceValue, setDiceValue] = useState(1);
  const [diceRolling, setDiceRolling] = useState(false);
  
  // Color match
  const [colorTarget, setColorTarget] = useState('#ff0000');
  const [colorOptions, setColorOptions] = useState([]);
  const [colorScore, setColorScore] = useState(0);
  
  // Number guess
  const [targetNumber, setTargetNumber] = useState(50);
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);

  useEffect(() => {
    // Load YouTube API
    if (!document.getElementById('youtube-platform-script')) {
      const script = document.createElement('script');
      script.id = 'youtube-platform-script';
      script.src = 'https://apis.google.com/js/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

  // YouTube Subscribe Handler
  const handleYouTubeSubscribe = () => {
    if (hasSubscribed) {
      alert('你已经订阅过了！');
      return;
    }
    
    const earnedCoins = 8888;
    const newTotal = coins + earnedCoins;
    setCoins(newTotal);
    localStorage.setItem('gameCoins', newTotal.toString());
    localStorage.setItem('youtubeSubscribed', 'true');
    setHasSubscribed(true);
    alert(`感谢订阅！获得 ${earnedCoins} 金币！🎉`);
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
              <p className="text-white/80">测试反应获得200金币</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-pink-600 to-purple-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('quiz')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🧠 知识问答</h2>
              <p className="text-white/80">答对获得150金币</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-yellow-600 to-orange-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('wheel')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🎡 幸运转盘</h2>
              <p className="text-white/80">转盘赢取大奖</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('dice')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🎲 骰子游戏</h2>
              <p className="text-white/80">赌大小赢金币</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-cyan-600 to-blue-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('color')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🎨 颜色配对</h2>
              <p className="text-white/80">快速配对获得金币</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('guess')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🔢 猜数字</h2>
              <p className="text-white/80">猜中数字赢金币</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 rounded-xl cursor-pointer"
              onClick={() => setCurrentGame('snake')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">🐍 贪吃蛇</h2>
              <p className="text-white/80">经典贪吃蛇游戏</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br from-red-600 to-pink-600 p-6 rounded-xl cursor-pointer ${hasSubscribed ? 'opacity-50' : ''}`}
              onClick={() => setCurrentGame('youtube')}
            >
              <h2 className="text-2xl font-bold text-white mb-2">📺 订阅YouTube</h2>
              <p className="text-white/80">{hasSubscribed ? '已领取' : '订阅获得8888金币！'}</p>
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

        {currentGame === 'youtube' && (
          <div className="text-center">
            <Button
              onClick={() => setCurrentGame(null)}
              variant="outline"
              className="mb-4"
            >
              返回
            </Button>
            <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">📺 订阅YouTube频道</h2>
              <p className="text-white/80 mb-6">订阅我们的频道即可获得 8888 金币！</p>
              
              {!hasSubscribed ? (
                <>
                  <div className="youtube-subscribe flex justify-center mb-6">
                    <div 
                      className="g-ytsubscribe"
                      data-channelid="UCmcm-JjZJ7oQ9BrF7YUi7ww"
                      data-layout="full"
                      data-count="default"
                      data-theme="dark"
                    />
                  </div>
                  
                  <Button
                    onClick={handleYouTubeSubscribe}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-lg py-6"
                  >
                    ✅ 我已订阅，领取奖励！
                  </Button>
                </>
              ) : (
                <div className="bg-green-600/20 border border-green-500 rounded-lg p-6">
                  <p className="text-green-400 text-xl font-bold">✅ 已领取奖励！</p>
                  <p className="text-white/60 mt-2">感谢你的订阅！</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentGame === 'reaction' && (
          <ReactionGame 
            onBack={() => setCurrentGame(null)}
            onReward={(amount) => {
              const newTotal = coins + amount;
              setCoins(newTotal);
              localStorage.setItem('gameCoins', newTotal.toString());
            }}
          />
        )}

        {currentGame === 'quiz' && (
          <QuizGame
            onBack={() => setCurrentGame(null)}
            onReward={(amount) => {
              const newTotal = coins + amount;
              setCoins(newTotal);
              localStorage.setItem('gameCoins', newTotal.toString());
            }}
          />
        )}

        {currentGame === 'wheel' && (
          <LuckyWheel
            onBack={() => setCurrentGame(null)}
            onReward={(amount) => {
              const newTotal = coins + amount;
              setCoins(newTotal);
              localStorage.setItem('gameCoins', newTotal.toString());
            }}
          />
        )}

        {currentGame === 'dice' && (
          <DiceGame
            coins={coins}
            onBack={() => setCurrentGame(null)}
            onCoinsChange={(newCoins) => {
              setCoins(newCoins);
              localStorage.setItem('gameCoins', newCoins.toString());
            }}
          />
        )}

        {currentGame === 'color' && (
          <ColorMatch
            onBack={() => setCurrentGame(null)}
            onReward={(amount) => {
              const newTotal = coins + amount;
              setCoins(newTotal);
              localStorage.setItem('gameCoins', newTotal.toString());
            }}
          />
        )}

        {currentGame === 'guess' && (
          <NumberGuess
            onBack={() => setCurrentGame(null)}
            onReward={(amount) => {
              const newTotal = coins + amount;
              setCoins(newTotal);
              localStorage.setItem('gameCoins', newTotal.toString());
            }}
          />
        )}

        {currentGame === 'snake' && (
          <SnakeGame
            onBack={() => setCurrentGame(null)}
            onReward={(amount) => {
              const newTotal = coins + amount;
              setCoins(newTotal);
              localStorage.setItem('gameCoins', newTotal.toString());
            }}
          />
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