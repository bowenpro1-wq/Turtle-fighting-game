import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Target, Clock, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function CoopGame() {
  const [games, setGames] = useState([]);
  const [turtleProfile, setTurtleProfile] = useState(null);

  useEffect(() => {
    loadProfile();
    loadGames();

    const interval = setInterval(loadGames, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      let profile = await base44.entities.TurtleProfile.filter({ user_email: user.email });
      
      if (profile.length === 0) {
        const newId = `TURTLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        profile = [await base44.entities.TurtleProfile.create({
          user_email: user.email,
          turtle_id: newId,
          display_name: user.full_name
        })];
      }
      
      setTurtleProfile(profile[0]);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadGames = async () => {
    try {
      const activeGames = await base44.entities.CoopGame.filter({ status: 'waiting' });
      setGames(activeGames);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const createGame = async () => {
    if (!turtleProfile) return;

    try {
      const gameId = `GAME-${Date.now()}`;
      await base44.entities.CoopGame.create({
        game_id: gameId,
        status: 'waiting',
        players: [{
          email: turtleProfile.user_email,
          turtle_id: turtleProfile.turtle_id,
          ready: false
        }],
        total_enemies_killed: 0,
        enemies_remaining: 10000,
        boss_health: 50000
      });
      loadGames();
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const joinGame = async (game) => {
    if (!turtleProfile) return;

    try {
      const updatedPlayers = [
        ...game.players,
        {
          email: turtleProfile.user_email,
          turtle_id: turtleProfile.turtle_id,
          ready: false
        }
      ];

      await base44.entities.CoopGame.update(game.id, { players: updatedPlayers });
      loadGames();
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          公共合作游戏
        </h1>

        <div className="mb-6 text-center">
          <Button onClick={createGame} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-lg px-8 py-6">
            创建新游戏
          </Button>
        </div>

        <div className="grid gap-4">
          {games.map(game => {
            const timeElapsed = game.start_time ? Math.floor((Date.now() - new Date(game.start_time)) / 1000) : 0;
            const timeRemaining = Math.max(0, 600 - timeElapsed);

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-cyan-400 font-bold text-xl">游戏 #{game.game_id.slice(-6)}</div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          game.status === 'waiting' ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                          {game.status === 'waiting' ? '等待中' : '进行中'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-white">
                          <Users className="w-5 h-5 text-purple-400" />
                          <span>{game.players.length}/{game.max_players} 玩家</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Target className="w-5 h-5 text-red-400" />
                          <span>{game.enemies_remaining}/10000 敌人</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Swords className="w-5 h-5 text-orange-400" />
                          <span>Boss: {game.boss_health}/50000</span>
                        </div>
                        {game.status === 'active' && (
                          <div className="flex items-center gap-2 text-white">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {game.players.map((p, idx) => (
                          <div key={idx} className="px-3 py-1 bg-slate-700 rounded-full text-sm text-cyan-400">
                            🐢 {p.turtle_id}
                          </div>
                        ))}
                      </div>
                    </div>

                    {game.status === 'waiting' && game.players.length < game.max_players && (
                      <Button onClick={() => joinGame(game)} className="bg-green-600 hover:bg-green-700">
                        加入游戏
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {games.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              暂无游戏，创建一个新游戏吧！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}