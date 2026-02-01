import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Trophy, Medal, Crown, Star, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/BottomNav';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('score');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user.email);
      
      const profiles = await base44.entities.PlayerProfile.list();
      
      let sorted = [...profiles];
      if (filter === 'score') {
        sorted.sort((a, b) => (b.highest_score || 0) - (a.highest_score || 0));
      } else if (filter === 'gold') {
        sorted.sort((a, b) => (b.total_gold_earned || 0) - (a.total_gold_earned || 0));
      } else if (filter === 'bosses') {
        sorted.sort((a, b) => (b.total_bosses_defeated || 0) - (a.total_bosses_defeated || 0));
      } else if (filter === 'games') {
        sorted.sort((a, b) => (b.total_games_played || 0) - (a.total_games_played || 0));
      }
      
      setLeaderboard(sorted.slice(0, 100));
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" fill="#fbbf24" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getStatValue = (profile) => {
    if (filter === 'score') return profile.highest_score || 0;
    if (filter === 'gold') return profile.total_gold_earned || 0;
    if (filter === 'bosses') return profile.total_bosses_defeated || 0;
    if (filter === 'games') return profile.total_games_played || 0;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center gap-2">
            <Trophy className="w-10 h-10 text-yellow-400" />
            排行榜
          </h1>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          <Button
            onClick={() => setFilter('score')}
            variant={filter === 'score' ? 'default' : 'outline'}
            className={filter === 'score' ? 'bg-purple-600' : ''}
          >
            最高分
          </Button>
          <Button
            onClick={() => setFilter('gold')}
            variant={filter === 'gold' ? 'default' : 'outline'}
            className={filter === 'gold' ? 'bg-yellow-600' : ''}
          >
            总金币
          </Button>
          <Button
            onClick={() => setFilter('bosses')}
            variant={filter === 'bosses' ? 'default' : 'outline'}
            className={filter === 'bosses' ? 'bg-red-600' : ''}
          >
            击败BOSS
          </Button>
          <Button
            onClick={() => setFilter('games')}
            variant={filter === 'games' ? 'default' : 'outline'}
            className={filter === 'games' ? 'bg-blue-600' : ''}
          >
            游戏次数
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-white py-12">加载中...</div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((profile, index) => {
              const rank = index + 1;
              const isCurrentUser = profile.user_email === currentUser;
              
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border-2 ${
                    isCurrentUser ? 'border-green-500 bg-green-900/20' : 'border-slate-700'
                  } ${rank <= 3 ? 'shadow-lg shadow-yellow-500/20' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-bold ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                        {profile.user_email.split('@')[0]}
                        {isCurrentUser && <span className="ml-2 text-xs">(你)</span>}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>成就: {profile.achievements?.length || 0}</span>
                        {rank <= 10 && <Star className="w-3 h-3 text-yellow-400" fill="#fbbf24" />}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">
                      {getStatValue(profile).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav 
        onLanguageClick={() => {}}
        onShopClick={() => {}}
        onMiniGamesClick={() => window.location.href = createPageUrl('MiniGames')}
        showShop={false}
      />
    </div>
  );
}