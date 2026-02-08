import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock, Target, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GameCanvas from '@/components/game/GameCanvas';
import { soundManager } from '@/components/game/SoundManager';

export default function PublicGame() {
  const [gameSession, setGameSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [gameState, setGameState] = useState('lobby');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [bossHealth, setBossHealth] = useState(50000);
  const [totalKills, setTotalKills] = useState(0);

  useEffect(() => {
    loadProfile();
    findOrCreateGame();
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && gameSession) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      let profiles = await base44.entities.TurtleProfile.filter({ user_email: user.email });
      
      if (profiles.length === 0) {
        const newProfile = await base44.entities.TurtleProfile.create({
          user_email: user.email,
          turtle_id: `TURTLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          display_name: user.full_name || 'Player',
          turtle_color: ['green', 'blue', 'red', 'purple', 'yellow'][Math.floor(Math.random() * 5)]
        });
        setProfile(newProfile);
      } else {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const findOrCreateGame = async () => {
    try {
      const user = await base44.auth.me();
      
      // Find active games
      const activeGames = await base44.entities.PublicGame.filter({ status: 'waiting' });
      
      if (activeGames.length > 0) {
        // Join existing game
        const game = activeGames[0];
        const updatedPlayers = [...game.players, {
          email: user.email,
          name: user.full_name,
          turtle_id: profile?.turtle_id || 'TURTLE-NEW',
          score: 0,
          kills: 0
        }];
        
        await base44.entities.PublicGame.update(game.id, { players: updatedPlayers });
        setGameSession(game);
      } else {
        // Create new game
        const newGame = await base44.entities.PublicGame.create({
          game_id: `GAME-${Date.now()}`,
          status: 'waiting',
          players: [{
            email: user.email,
            name: user.full_name,
            turtle_id: profile?.turtle_id || 'TURTLE-NEW',
            score: 0,
            kills: 0
          }],
          started_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 600000).toISOString()
        });
        setGameSession(newGame);
      }
    } catch (error) {
      console.error('Failed to find/create game:', error);
    }
  };

  const startGame = async () => {
    if (!gameSession) return;
    
    try {
      await base44.entities.PublicGame.update(gameSession.id, { status: 'active' });
      setGameState('playing');
      soundManager.playBackgroundMusic('boss');
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const endGame = async () => {
    if (!gameSession) return;
    
    try {
      await base44.entities.PublicGame.update(gameSession.id, { status: 'completed' });
      setGameState('ended');
      soundManager.stopBackgroundMusic();
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  const exitGame = () => {
    soundManager.stopBackgroundMusic();
    window.location.href = createPageUrl('Game');
  };

  const handlePlayerDamage = (damage) => {
    setPlayerHealth(prev => Math.max(0, prev - damage));
  };

  const handleEnemyKill = () => {
    setScore(prev => prev + 100);
    setTotalKills(prev => prev + 1);
  };

  const handleBossDamage = (damage) => {
    setBossHealth(prev => Math.max(0, prev - damage));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to={createPageUrl('Game')}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                退出
              </Button>
            </Link>
            {profile && (
              <div className="text-white text-lg">
                🐢 {profile.turtle_id}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            🌐 公共游戏大厅
          </h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">游戏信息</h2>
            <div className="space-y-3 text-white/80">
              <p>⏱️ 游戏时长: 10分钟</p>
              <p>👹 敌人总数: 10,000只</p>
              <p>🐲 Boss血量: 50,000</p>
              <p>🤝 合作击败Boss获得胜利！</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              <Users className="w-5 h-5 inline mr-2" />
              当前玩家 ({gameSession?.players?.length || 0})
            </h2>
            <div className="space-y-2">
              {gameSession?.players?.map((player, idx) => (
                <div key={idx} className="bg-black/40 rounded-lg p-3 text-white">
                  🐢 {player.turtle_id} - {player.name}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={startGame}
            className="w-full py-6 text-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            开始游戏
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="relative w-full h-screen bg-black">
        {/* Top UI */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 space-y-2">
            <div className="text-white">
              ❤️ 生命: {playerHealth}/100
            </div>
            <div className="text-yellow-400">
              ⭐ 分数: {score}
            </div>
            <div className="text-cyan-400">
              🎯 击杀: {totalKills}
            </div>
          </div>

          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-white text-2xl font-bold">
              ⏱️ {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
            <div className="text-red-400 font-bold mb-1">
              🐲 Boss
            </div>
            <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-orange-600 transition-all"
                style={{ width: `${(bossHealth / 50000) * 100}%` }}
              />
            </div>
            <div className="text-white text-sm mt-1">
              {bossHealth.toLocaleString()} / 50,000
            </div>
          </div>
        </div>

        {/* Exit Button */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Button
            onClick={exitGame}
            variant="outline"
            className="bg-red-600/80 hover:bg-red-700 text-white border-red-400"
          >
            退出游戏
          </Button>
        </div>

        <GameCanvas
          gameState="playing"
          gameMode="publicgame"
          onPlayerDamage={handlePlayerDamage}
          onEnemyKill={handleEnemyKill}
          onBossDamage={handleBossDamage}
          score={score}
        />
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            {bossHealth <= 0 ? '🎉 胜利！' : '⏰ 时间到！'}
          </h1>
          <div className="space-y-3 text-white text-lg mb-8">
            <p>你的分数: {score}</p>
            <p>击杀数: {totalKills}</p>
            <p>Boss剩余血量: {bossHealth}</p>
          </div>
          <Link to={createPageUrl('Game')}>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
              返回主菜单
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}