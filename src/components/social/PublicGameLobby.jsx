import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Users, Play, Clock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TURTLE_COLORS = [
  '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f59e0b',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#8b5cf6',
  '#14b8a6', '#f43f5e', '#eab308', '#6366f1', '#10b981',
  '#f472b6', '#facc15', '#60a5fa', '#34d399', '#fb923c'
];

export default function PublicGameLobby({ onClose, onStartGame }) {
  const [activeGames, setActiveGames] = useState([]);
  const [turtleId, setTurtleId] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    loadActiveGames();
    loadTurtleId();
    
    const interval = setInterval(loadActiveGames, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTurtleId = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.PlayerProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        setTurtleId(profiles[0].turtle_id);
      }
    } catch (error) {
      console.error('Failed to load Turtle ID:', error);
    }
  };

  const loadActiveGames = async () => {
    try {
      const games = await base44.entities.PublicGame.filter({
        status: { $in: ['waiting', 'active'] }
      });
      setActiveGames(games);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const createNewGame = async () => {
    try {
      const user = await base44.auth.me();
      const gameId = `GAME-${Date.now()}`;
      
      const game = await base44.entities.PublicGame.create({
        game_id: gameId,
        status: 'waiting',
        players: [{
          email: user.email,
          turtle_id: turtleId,
          color: TURTLE_COLORS[0],
          position: { x: 200, y: 200 },
          health: 100,
          score: 0,
          kills: 0
        }],
        started_at: new Date().toISOString()
      });
      
      onStartGame(game);
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const joinGame = async (game) => {
    try {
      const user = await base44.auth.me();
      const colorIndex = game.players.length % TURTLE_COLORS.length;
      
      const updatedPlayers = [
        ...game.players,
        {
          email: user.email,
          turtle_id: turtleId,
          color: TURTLE_COLORS[colorIndex],
          position: { x: 200 + game.players.length * 100, y: 200 },
          health: 100,
          score: 0,
          kills: 0
        }
      ];
      
      await base44.entities.PublicGame.update(game.id, {
        players: updatedPlayers,
        status: updatedPlayers.length >= 2 ? 'active' : 'waiting'
      });
      
      onStartGame({ ...game, players: updatedPlayers });
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col border-2 border-cyan-500/30"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">公共游戏大厅</h2>
        
        <div className="bg-cyan-500/20 p-4 rounded-lg mb-6 border border-cyan-500/30">
          <h3 className="text-cyan-400 font-bold mb-2">游戏规则</h3>
          <div className="text-white/80 text-sm space-y-1">
            <div>• 合作击杀 10,000 个敌人</div>
            <div>• 每局 10 分钟</div>
            <div>• 10-20 个彩色AI龟龟助战</div>
            <div>• 随时加入，共同作战！</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-lg">活跃游戏</h3>
          <Button onClick={createNewGame} className="bg-green-600">
            <Play className="w-4 h-4 mr-2" />
            创建新游戏
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          <AnimatePresence>
            {activeGames.map((game) => {
              const timeElapsed = game.started_at 
                ? Math.floor((Date.now() - new Date(game.started_at).getTime()) / 1000)
                : 0;
              const timeRemaining = Math.max(0, 600 - timeElapsed);
              const minutes = Math.floor(timeRemaining / 60);
              const seconds = timeRemaining % 60;

              return (
                <motion.div
                  key={game.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-800/50 p-6 rounded-lg border border-cyan-500/20"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-white font-bold text-lg">游戏 #{game.game_id.slice(-6)}</div>
                      <div className="flex gap-4 text-sm mt-2">
                        <div className="text-cyan-400 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {game.players.length} 玩家
                        </div>
                        <div className="text-orange-400 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {game.enemies_killed}/10000
                        </div>
                        <div className="text-green-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {minutes}:{seconds.toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => joinGame(game)}
                      disabled={game.status === 'completed' || timeRemaining <= 0}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      加入游戏
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {game.players.map((player, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="text-white/80 text-xs font-mono">{player.turtle_id}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {activeGames.length === 0 && (
            <div className="text-white/60 text-center py-12">
              暂无活跃游戏，创建一个开始吧！
            </div>
          )}
        </div>

        <Button onClick={onClose} variant="outline" className="w-full mt-4">
          关闭
        </Button>
      </motion.div>
    </motion.div>
  );
}