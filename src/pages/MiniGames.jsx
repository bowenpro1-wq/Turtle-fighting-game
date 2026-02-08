import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/BottomNav';

function GameCard({ emoji, title, reward, gradient, onClick, disabled }) {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05 } : {}}
      className={`bg-gradient-to-br ${gradient} p-4 rounded-xl cursor-pointer ${disabled ? 'opacity-50' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-white/80 text-sm">{reward}</p>
    </motion.div>
  );
}
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
  const [reactionWaiting, setReactionWaiting] = useState(false);
  const [reactionActive, setReactionActive] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionScore, setReactionScore] = useState(null);
  
  // Quiz game
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  
  // Whack-a-mole
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [moleScore, setMoleScore] = useState(0);
  const [moleTime, setMoleTime] = useState(30);
  const [moleActive, setMoleActive] = useState(false);
  
  // Simon Says
  const [simonSequence, setSimonSequence] = useState([]);
  const [simonInput, setSimonInput] = useState([]);
  const [simonRound, setSimonRound] = useState(0);
  const [simonPlaying, setSimonPlaying] = useState(false);
  
  // Number Guess
  const [targetNumber, setTargetNumber] = useState(0);
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [guessHint, setGuessHint] = useState('');
  
  // Typing Speed
  const [typingText, setTypingText] = useState('');
  const [typingInput, setTypingInput] = useState('');
  const [typingStartTime, setTypingStartTime] = useState(0);
  const [typingWPM, setTypingWPM] = useState(0);
  
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
  
  // Reaction Game
  const startReactionGame = () => {
    setReactionScore(null);
    setReactionWaiting(false);
    setReactionActive(false);
    setCurrentGame('reaction');
  };
  
  const handleReactionStart = () => {
    setReactionWaiting(true);
    const delay = Math.random() * 3000 + 1000;
    setTimeout(() => {
      setReactionWaiting(false);
      setReactionActive(true);
      setReactionStartTime(Date.now());
    }, delay);
  };
  
  const handleReactionClick = () => {
    if (reactionWaiting) {
      setReactionScore('太早了！');
      setReactionWaiting(false);
    } else if (reactionActive) {
      const time = Date.now() - reactionStartTime;
      setReactionScore(`${time}ms`);
      setReactionActive(false);
      if (time < 300) {
        const earnedCoins = 150;
        setCoins(prev => {
          const newCoins = prev + earnedCoins;
          localStorage.setItem('gameCoins', newCoins.toString());
          return newCoins;
        });
        setTimeout(() => alert(`反应神速！获得 ${earnedCoins} 金币！`), 100);
      }
    }
  };
  
  // Quiz Game
  const QUIZ_QUESTIONS = [
    { q: '中国的首都是？', options: ['北京', '上海', '广州', '深圳'], answer: 0 },
    { q: '世界最高峰是？', options: ['珠穆朗玛峰', '乞力马扎罗', 'K2', '富士山'], answer: 0 },
    { q: '太阳系有多少颗行星？', options: ['7', '8', '9', '10'], answer: 1 },
    { q: '水的化学式是？', options: ['H2O', 'CO2', 'O2', 'H2'], answer: 0 },
    { q: '1+1等于？', options: ['1', '2', '3', '11'], answer: 1 }
  ];
  
  const startQuizGame = () => {
    setQuizScore(0);
    setQuizIndex(0);
    setQuizQuestion(QUIZ_QUESTIONS[0]);
    setCurrentGame('quiz');
  };
  
  const handleQuizAnswer = (selectedIndex) => {
    if (selectedIndex === quizQuestion.answer) {
      const newScore = quizScore + 1;
      setQuizScore(newScore);
      
      if (quizIndex + 1 >= QUIZ_QUESTIONS.length) {
        const earnedCoins = newScore * 60;
        setCoins(prev => {
          const newCoins = prev + earnedCoins;
          localStorage.setItem('gameCoins', newCoins.toString());
          return newCoins;
        });
        alert(`完成问答！答对 ${newScore}/${QUIZ_QUESTIONS.length} 题，获得 ${earnedCoins} 金币！`);
        setCurrentGame(null);
      } else {
        setQuizIndex(quizIndex + 1);
        setQuizQuestion(QUIZ_QUESTIONS[quizIndex + 1]);
      }
    } else {
      alert('回答错误！游戏结束');
      setCurrentGame(null);
    }
  };
  
  // Whack-a-Mole
  const startWhackAMole = () => {
    setMoleScore(0);
    setMoleTime(30);
    setMoleActive(true);
    setCurrentGame('mole');
    
    const moleInterval = setInterval(() => {
      const newMoles = Array(9).fill(false);
      const randomIndex = Math.floor(Math.random() * 9);
      newMoles[randomIndex] = true;
      setMoles(newMoles);
    }, 800);
    
    const timeInterval = setInterval(() => {
      setMoleTime(prev => {
        if (prev <= 1) {
          clearInterval(moleInterval);
          clearInterval(timeInterval);
          setMoleActive(false);
          const earnedCoins = moleScore * 10;
          setCoins(prevCoins => {
            const newCoins = prevCoins + earnedCoins;
            localStorage.setItem('gameCoins', newCoins.toString());
            return newCoins;
          });
          setTimeout(() => alert(`打中 ${moleScore} 只地鼠！获得 ${earnedCoins} 金币！`), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const whackMole = (index) => {
    if (moles[index] && moleActive) {
      setMoleScore(prev => prev + 1);
      setMoles(prev => {
        const newMoles = [...prev];
        newMoles[index] = false;
        return newMoles;
      });
    }
  };
  
  // Simon Says
  const startSimonSays = () => {
    setSimonSequence([Math.floor(Math.random() * 4)]);
    setSimonInput([]);
    setSimonRound(1);
    setSimonPlaying(true);
    setCurrentGame('simon');
  };
  
  const handleSimonClick = (color) => {
    if (!simonPlaying) return;
    
    const newInput = [...simonInput, color];
    setSimonInput(newInput);
    
    if (newInput[newInput.length - 1] !== simonSequence[newInput.length - 1]) {
      alert(`游戏结束！完成 ${simonRound} 轮`);
      setCurrentGame(null);
      const earnedCoins = simonRound * 40;
      setCoins(prev => {
        const newCoins = prev + earnedCoins;
        localStorage.setItem('gameCoins', newCoins.toString());
        return newCoins;
      });
      return;
    }
    
    if (newInput.length === simonSequence.length) {
      const newRound = simonRound + 1;
      setSimonRound(newRound);
      setTimeout(() => {
        const newSequence = [...simonSequence, Math.floor(Math.random() * 4)];
        setSimonSequence(newSequence);
        setSimonInput([]);
      }, 500);
    }
  };
  
  // Number Guess
  const startNumberGuess = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuessAttempts(0);
    setGuessInput('');
    setGuessHint('猜一个1-100的数字');
    setCurrentGame('guess');
  };
  
  const handleGuess = () => {
    const guess = parseInt(guessInput);
    const newAttempts = guessAttempts + 1;
    setGuessAttempts(newAttempts);
    
    if (guess === targetNumber) {
      const earnedCoins = Math.max(100 - newAttempts * 10, 20);
      setCoins(prev => {
        const newCoins = prev + earnedCoins;
        localStorage.setItem('gameCoins', newCoins.toString());
        return newCoins;
      });
      alert(`猜对了！用了 ${newAttempts} 次，获得 ${earnedCoins} 金币！`);
      setCurrentGame(null);
    } else if (guess < targetNumber) {
      setGuessHint('太小了！');
    } else {
      setGuessHint('太大了！');
    }
    setGuessInput('');
  };
  
  // Typing Speed
  const TYPING_TEXTS = [
    '龟龟冒险岛是一款激动人心的射击游戏',
    'Turtle Adventure Island is an exciting game',
    '快速打字可以获得更多金币奖励',
    '坚持就是胜利加油加油加油'
  ];
  
  const startTypingGame = () => {
    setTypingText(TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]);
    setTypingInput('');
    setTypingStartTime(Date.now());
    setTypingWPM(0);
    setCurrentGame('typing');
  };
  
  const handleTypingChange = (e) => {
    const input = e.target.value;
    setTypingInput(input);
    
    if (input === typingText) {
      const timeSeconds = (Date.now() - typingStartTime) / 1000;
      const words = typingText.length / 5;
      const wpm = Math.round((words / timeSeconds) * 60);
      setTypingWPM(wpm);
      
      const earnedCoins = wpm > 30 ? 250 : wpm > 20 ? 150 : 100;
      setCoins(prev => {
        const newCoins = prev + earnedCoins;
        localStorage.setItem('gameCoins', newCoins.toString());
        return newCoins;
      });
      
      setTimeout(() => alert(`速度：${wpm} WPM！获得 ${earnedCoins} 金币！`), 100);
      setCurrentGame(null);
    }
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