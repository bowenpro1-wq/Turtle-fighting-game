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
      className={`bg-gradient-to-br ${gradient} p-4 md:p-6 rounded-xl cursor-pointer ${disabled ? 'opacity-50' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="text-3xl md:text-4xl mb-2">{emoji}</div>
      <h3 className="text-base md:text-xl font-bold text-white mb-1">{title}</h3>
      <p className="text-white/80 text-xs md:text-sm">{reward}</p>
    </motion.div>
  );
}

export default function MiniGames() {
  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem('gameCoins');
    return savedCoins ? parseInt(savedCoins) : 0;
  });
  const [currentGame, setCurrentGame] = useState(null);
  const [hasSubscribed, setHasSubscribed] = useState(() => localStorage.getItem('youtubeSubscribed') === 'true');
  
  // Clicker
  const [clickerScore, setClickerScore] = useState(0);
  
  // Memory
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  
  // Reaction
  const [reactionWaiting, setReactionWaiting] = useState(false);
  const [reactionActive, setReactionActive] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionScore, setReactionScore] = useState(null);
  
  // Quiz
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const QUIZ_QUESTIONS = [
    { q: '中国的首都是？', options: ['北京', '上海', '广州', '深圳'], answer: 0 },
    { q: '世界最高峰是？', options: ['珠穆朗玛峰', '乞力马扎罗', 'K2', '富士山'], answer: 0 },
    { q: '太阳系有多少颗行星？', options: ['7', '8', '9', '10'], answer: 1 },
    { q: '水的化学式是？', options: ['H2O', 'CO2', 'O2', 'H2'], answer: 0 },
    { q: '1+1等于？', options: ['1', '2', '3', '11'], answer: 1 }
  ];
  
  // Whack-a-mole
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [moleScore, setMoleScore] = useState(0);
  const [moleTime, setMoleTime] = useState(30);
  const [moleIntervalId, setMoleIntervalId] = useState(null);
  const [timeIntervalId, setTimeIntervalId] = useState(null);
  
  // Simon
  const [simonSequence, setSimonSequence] = useState([]);
  const [simonInput, setSimonInput] = useState([]);
  const [simonRound, setSimonRound] = useState(0);
  const [simonActive, setSimonActive] = useState(false);
  
  // Number Guess
  const [targetNumber, setTargetNumber] = useState(0);
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [guessHint, setGuessHint] = useState('');
  
  // Typing
  const [typingText, setTypingText] = useState('');
  const [typingInput, setTypingInput] = useState('');
  const [typingStartTime, setTypingStartTime] = useState(0);

  useEffect(() => {
    if (!document.getElementById('youtube-platform-script')) {
      const script = document.createElement('script');
      script.id = 'youtube-platform-script';
      script.src = 'https://apis.google.com/js/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleCoinClick = () => {
    setClickerScore(prev => prev + 1);
    if (clickerScore + 1 >= 50) {
      const earnedCoins = 100;
      setCoins(prev => prev + earnedCoins);
      localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
      setClickerScore(0);
      alert(`恭喜！获得 ${earnedCoins} 金币！`);
    }
  };

  const handleYouTubeSubscribe = () => {
    if (hasSubscribed) return;
    const earnedCoins = 8888;
    setCoins(prev => prev + earnedCoins);
    localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
    localStorage.setItem('youtubeSubscribed', 'true');
    setHasSubscribed(true);
    alert(`感谢订阅！获得 ${earnedCoins} 金币！🎉`);
  };

  const startMemoryGame = () => {
    const symbols = ['🎮', '⚔️', '🛡️', '💎', '🔥', '⚡', '🌟', '🎯'];
    const cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }));
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
          setCoins(prev => prev + earnedCoins);
          localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
          setTimeout(() => alert(`完成！获得 ${earnedCoins} 金币！`), 500);
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const startReactionGame = () => {
    setReactionScore(null);
    setReactionWaiting(false);
    setReactionActive(false);
    setCurrentGame('reaction');
  };
  
  const handleReactionStart = () => {
    setReactionWaiting(true);
    setReactionScore(null);
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
        setCoins(prev => prev + earnedCoins);
        localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
        setTimeout(() => alert(`反应神速！获得 ${earnedCoins} 金币！`), 100);
      }
    }
  };

  const startQuizGame = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setCurrentGame('quiz');
  };
  
  const handleQuizAnswer = (selectedIndex) => {
    const question = QUIZ_QUESTIONS[quizIndex];
    if (selectedIndex === question.answer) {
      const newScore = quizScore + 1;
      setQuizScore(newScore);
      
      if (quizIndex + 1 >= QUIZ_QUESTIONS.length) {
        const earnedCoins = newScore * 60;
        setCoins(prev => prev + earnedCoins);
        localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
        alert(`完成！答对 ${newScore}/${QUIZ_QUESTIONS.length}，获得 ${earnedCoins} 金币！`);
        setCurrentGame(null);
      } else {
        setQuizIndex(quizIndex + 1);
      }
    } else {
      alert('回答错误！游戏结束');
      setCurrentGame(null);
    }
  };

  const startWhackAMole = () => {
    setMoleScore(0);
    setMoleTime(30);
    setCurrentGame('mole');
    
    const moleInt = setInterval(() => {
      const newMoles = Array(9).fill(false);
      newMoles[Math.floor(Math.random() * 9)] = true;
      setMoles(newMoles);
    }, 800);
    setMoleIntervalId(moleInt);
    
    const timeInt = setInterval(() => {
      setMoleTime(prev => {
        if (prev <= 1) {
          clearInterval(moleInt);
          clearInterval(timeInt);
          const earnedCoins = moleScore * 10;
          setCoins(prevCoins => prevCoins + earnedCoins);
          localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
          setTimeout(() => alert(`打中 ${moleScore} 只！获得 ${earnedCoins} 金币！`), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimeIntervalId(timeInt);
  };
  
  const whackMole = (index) => {
    if (moles[index]) {
      setMoleScore(prev => prev + 1);
      setMoles(prev => prev.map((m, i) => i === index ? false : m));
    }
  };

  const startSimonSays = () => {
    setSimonSequence([Math.floor(Math.random() * 4)]);
    setSimonInput([]);
    setSimonRound(1);
    setSimonActive(true);
    setCurrentGame('simon');
  };
  
  const handleSimonClick = (colorIndex) => {
    const newInput = [...simonInput, colorIndex];
    setSimonInput(newInput);
    
    if (newInput[newInput.length - 1] !== simonSequence[newInput.length - 1]) {
      const earnedCoins = simonRound * 40;
      setCoins(prev => prev + earnedCoins);
      localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
      alert(`完成 ${simonRound} 轮！获得 ${earnedCoins} 金币！`);
      setCurrentGame(null);
      return;
    }
    
    if (newInput.length === simonSequence.length) {
      setTimeout(() => {
        setSimonSequence([...simonSequence, Math.floor(Math.random() * 4)]);
        setSimonInput([]);
        setSimonRound(simonRound + 1);
      }, 500);
    }
  };

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
      setCoins(prev => prev + earnedCoins);
      localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
      alert(`猜对了！${newAttempts} 次，获得 ${earnedCoins} 金币！`);
      setCurrentGame(null);
    } else if (guess < targetNumber) {
      setGuessHint('太小了！');
    } else {
      setGuessHint('太大了！');
    }
    setGuessInput('');
  };

  const TYPING_TEXTS = [
    '龟龟冒险岛是一款激动人心的射击游戏',
    'Turtle Adventure Island is exciting',
    '快速打字获得更多金币'
  ];
  
  const startTypingGame = () => {
    setTypingText(TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]);
    setTypingInput('');
    setTypingStartTime(Date.now());
    setCurrentGame('typing');
  };
  
  const handleTypingChange = (e) => {
    const input = e.target.value;
    setTypingInput(input);
    
    if (input === typingText) {
      const timeSeconds = (Date.now() - typingStartTime) / 1000;
      const wpm = Math.round((typingText.length / 5 / timeSeconds) * 60);
      const earnedCoins = wpm > 30 ? 250 : wpm > 20 ? 150 : 100;
      setCoins(prev => prev + earnedCoins);
      localStorage.setItem('gameCoins', (coins + earnedCoins).toString());
      setTimeout(() => alert(`${wpm} WPM！获得 ${earnedCoins} 金币！`), 100);
      setCurrentGame(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black p-4 pb-20">
      <div className="max-w-6xl mx-auto">
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

        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          小游戏中心
        </h1>

        {!currentGame && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <GameCard emoji="💰" title="点击金币" reward="100金币" gradient="from-blue-600 to-purple-600" onClick={() => setCurrentGame('clicker')} />
            <GameCard emoji="🎴" title="记忆翻牌" reward="200金币" gradient="from-green-600 to-teal-600" onClick={startMemoryGame} />
            <GameCard emoji="⚡" title="反应速度" reward="150金币" gradient="from-red-600 to-orange-600" onClick={startReactionGame} />
            <GameCard emoji="🧠" title="知识问答" reward="300金币" gradient="from-pink-600 to-purple-600" onClick={startQuizGame} />
            <GameCard emoji="🎯" title="打地鼠" reward="金币" gradient="from-yellow-600 to-orange-600" onClick={startWhackAMole} />
            <GameCard emoji="🎵" title="西蒙记忆" reward="金币" gradient="from-indigo-600 to-blue-600" onClick={startSimonSays} />
            <GameCard emoji="🔢" title="猜数字" reward="100金币" gradient="from-emerald-600 to-green-600" onClick={startNumberGuess} />
            <GameCard emoji="⌨️" title="打字速度" reward="250金币" gradient="from-cyan-600 to-blue-600" onClick={startTypingGame} />
            <GameCard emoji="📺" title="订阅YouTube" reward={hasSubscribed ? '已领取' : '8888金币'} gradient="from-red-600 to-pink-600" onClick={() => setCurrentGame('youtube')} disabled={hasSubscribed} />
          </div>
        )}

        {currentGame === 'clicker' && (
          <div className="text-center">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <div className="bg-slate-800 p-8 rounded-xl">
              <h2 className="text-3xl font-bold text-white mb-4">💰 点击金币</h2>
              <p className="text-xl text-white/80 mb-6">进度: {clickerScore}/50</p>
              <motion.div whileTap={{ scale: 0.9 }} className="inline-block">
                <Button onClick={handleCoinClick} className="w-32 h-32 text-6xl bg-gradient-to-br from-yellow-400 to-orange-500">💰</Button>
              </motion.div>
            </div>
          </div>
        )}

        {currentGame === 'memory' && (
          <div className="text-center">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <div className="bg-slate-800 p-6 rounded-xl max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">🎴 记忆翻牌</h2>
              <div className="grid grid-cols-4 gap-3">
                {memoryCards.map(card => (
                  <motion.button
                    key={card.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square text-4xl rounded-lg ${
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

        {currentGame === 'reaction' && (
          <div className="text-center">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-white mb-6">⚡ 反应速度</h2>
              {!reactionWaiting && !reactionActive && !reactionScore && (
                <Button onClick={handleReactionStart} className="w-full bg-green-600 text-2xl py-8">开始测试</Button>
              )}
              {reactionWaiting && (
                <div onClick={handleReactionClick} className="w-full h-64 bg-red-600 rounded-xl flex items-center justify-center cursor-pointer">
                  <p className="text-white text-2xl font-bold">等待...</p>
                </div>
              )}
              {reactionActive && (
                <div onClick={handleReactionClick} className="w-full h-64 bg-green-600 rounded-xl flex items-center justify-center cursor-pointer animate-pulse">
                  <p className="text-white text-4xl font-bold">点击！</p>
                </div>
              )}
              {reactionScore && (
                <div className="bg-blue-600 p-6 rounded-xl">
                  <p className="text-white text-3xl font-bold mb-4">{reactionScore}</p>
                  <Button onClick={handleReactionStart} className="w-full">再试一次</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentGame === 'quiz' && (
          <div className="bg-slate-800 p-8 rounded-xl max-w-2xl mx-auto">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <div className="mb-6 flex justify-between">
              <span className="text-cyan-400 text-lg">题目 {quizIndex + 1}/{QUIZ_QUESTIONS.length}</span>
              <span className="text-green-400 text-lg">得分: {quizScore}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6">{QUIZ_QUESTIONS[quizIndex].q}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUIZ_QUESTIONS[quizIndex].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentGame === 'mole' && (
          <div className="bg-slate-800 p-8 rounded-xl max-w-2xl mx-auto">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <div className="flex justify-between mb-6">
              <span className="text-white text-xl">得分: {moleScore}</span>
              <span className="text-yellow-400 text-xl">时间: {moleTime}s</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {moles.map((isMole, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => whackMole(index)}
                  className={`aspect-square text-6xl rounded-xl ${isMole ? 'bg-yellow-600' : 'bg-slate-700'}`}
                >
                  {isMole ? '🐹' : '🕳️'}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {currentGame === 'simon' && (
          <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <h2 className="text-2xl font-bold text-white mb-4">🎵 西蒙记忆</h2>
            <p className="text-white/80 mb-6">轮数: {simonRound}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { color: 'bg-red-600', emoji: '🔴' },
                { color: 'bg-blue-600', emoji: '🔵' },
                { color: 'bg-green-600', emoji: '🟢' },
                { color: 'bg-yellow-600', emoji: '🟡' }
              ].map((btn, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSimonClick(index)}
                  className={`aspect-square rounded-xl text-4xl ${btn.color}`}
                >
                  {btn.emoji}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {currentGame === 'guess' && (
          <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <h2 className="text-3xl font-bold text-white mb-4">🔢 猜数字</h2>
            <p className="text-white/80 mb-4">尝试: {guessAttempts}</p>
            <p className="text-cyan-400 text-xl mb-6">{guessHint}</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="输入数字"
                className="text-2xl h-16"
              />
              <Button onClick={handleGuess} className="h-16 px-8 text-xl">猜</Button>
            </div>
          </div>
        )}

        {currentGame === 'typing' && (
          <div className="bg-slate-800 p-8 rounded-xl max-w-2xl mx-auto">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <h2 className="text-3xl font-bold text-white mb-6">⌨️ 打字速度</h2>
            <div className="bg-slate-700 p-4 rounded-lg mb-4">
              <p className="text-white text-xl">{typingText}</p>
            </div>
            <Input
              value={typingInput}
              onChange={handleTypingChange}
              placeholder="开始打字..."
              className="text-xl h-16"
              autoFocus
            />
            <p className="text-white/60 mt-2">进度: {typingInput.length}/{typingText.length}</p>
          </div>
        )}

        {currentGame === 'youtube' && (
          <div className="text-center">
            <Button onClick={() => setCurrentGame(null)} variant="outline" className="mb-4">返回</Button>
            <div className="bg-slate-800 p-8 rounded-xl max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">📺 订阅YouTube</h2>
              <p className="text-white/80 mb-6">订阅获得 8888 金币！</p>
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
                  <Button onClick={handleYouTubeSubscribe} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-lg py-6">
                    ✅ 我已订阅，领取奖励！
                  </Button>
                </>
              ) : (
                <div className="bg-green-600/20 border border-green-500 rounded-lg p-6">
                  <p className="text-green-400 text-xl font-bold">✅ 已领取！</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav onLanguageClick={() => {}} onShopClick={() => {}} onMiniGamesClick={() => {}} showShop={false} />
    </div>
  );
}