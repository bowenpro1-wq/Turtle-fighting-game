import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Coins, Gamepad2, Target, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.PlayerProfile.filter({
        user_email: user.email
      });

      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        // Create new profile
        const newProfile = await base44.entities.PlayerProfile.create({
          user_email: user.email,
          total_gold_earned: 0,
          total_games_played: 0,
          total_bosses_defeated: 0,
          highest_score: 0,
          total_playtime_minutes: 0,
          achievements: [],
          difficulty_preference: 'adaptive',
          performance_stats: {
            win_rate: 0,
            avg_damage_taken: 0,
            avg_completion_time: 0
          }
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    { id: 'first_boss', name: '首次击败Boss', icon: '⚔️', unlocked: profile?.achievements?.includes('first_boss') },
    { id: 'boss_master', name: 'Boss大师', desc: '击败20个Boss', icon: '🏆', unlocked: profile?.achievements?.includes('boss_master') },
    { id: 'gold_collector', name: '金币收藏家', desc: '累计获得100,000金币', icon: '💰', unlocked: profile?.achievements?.includes('gold_collector') },
    { id: 'speed_runner', name: '速通高手', desc: '5分钟内通关', icon: '⚡', unlocked: profile?.achievements?.includes('speed_runner') },
    { id: 'survivor', name: '生存专家', desc: '生存模式坚持30分钟', icon: '🛡️', unlocked: profile?.achievements?.includes('survivor') },
    { id: 'tower_climber', name: '爬塔勇士', desc: '通关中大林之塔', icon: '🗿', unlocked: profile?.achievements?.includes('tower_climber') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline" size="sm" className="text-white border-white/30">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
            玩家档案
          </h1>
          <p className="text-white/70">{profile?.user_email}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-600 to-orange-600 p-4 rounded-xl"
          >
            <Coins className="w-8 h-8 text-white mb-2" />
            <div className="text-2xl font-bold text-white">{profile?.total_gold_earned?.toLocaleString() || 0}</div>
            <div className="text-white/80 text-sm">累计金币</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-xl"
          >
            <Gamepad2 className="w-8 h-8 text-white mb-2" />
            <div className="text-2xl font-bold text-white">{profile?.total_games_played || 0}</div>
            <div className="text-white/80 text-sm">游戏局数</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-600 to-pink-600 p-4 rounded-xl"
          >
            <Target className="w-8 h-8 text-white mb-2" />
            <div className="text-2xl font-bold text-white">{profile?.total_bosses_defeated || 0}</div>
            <div className="text-white/80 text-sm">击败Boss</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-600 to-teal-600 p-4 rounded-xl"
          >
            <Trophy className="w-8 h-8 text-white mb-2" />
            <div className="text-2xl font-bold text-white">{profile?.highest_score?.toLocaleString() || 0}</div>
            <div className="text-white/80 text-sm">最高分数</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-indigo-600 to-blue-600 p-4 rounded-xl"
          >
            <Clock className="w-8 h-8 text-white mb-2" />
            <div className="text-2xl font-bold text-white">{Math.floor(profile?.total_playtime_minutes || 0)}</div>
            <div className="text-white/80 text-sm">游戏时长(分)</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-xl"
          >
            <Award className="w-8 h-8 text-white mb-2" />
            <div className="text-2xl font-bold text-white">{profile?.achievements?.length || 0}/6</div>
            <div className="text-white/80 text-sm">成就</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            成就系统
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50'
                    : 'bg-slate-700/30 border-slate-600/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className={`font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-white/50'}`}>
                      {achievement.name}
                    </div>
                    {achievement.desc && (
                      <div className="text-xs text-white/60">{achievement.desc}</div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="text-green-400">✓</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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