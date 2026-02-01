import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target, Coins, Zap, Skull, Flame, Crown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/BottomNav';

const ACHIEVEMENTS = {
  first_win: { icon: '🎉', name: '首胜', desc: '赢得第一场胜利' },
  boss_slayer: { icon: '⚔️', name: 'Boss杀手', desc: '击败10个Boss' },
  boss_master: { icon: '👑', name: 'Boss大师', desc: '击败50个Boss' },
  gold_collector: { icon: '💰', name: '富豪', desc: '累计获得10万金币' },
  survivor: { icon: '🛡️', name: '生存者', desc: '玩20场游戏' },
  veteran: { icon: '🎖️', name: '老兵', desc: '玩100场游戏' },
  perfectionist: { icon: '✨', name: '完美主义者', desc: '连胜5场' },
  legend: { icon: '🌟', name: '传奇', desc: '连胜10场' },
  speed_runner: { icon: '⚡', name: '速通者', desc: '5分钟内通关' },
  tower_climber: { icon: '🗿', name: '登塔者', desc: '爬到塔50层' }
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.PlayerProfile.filter({ user_email: user.email });
      
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        const newProfile = await base44.entities.PlayerProfile.create({
          user_email: user.email
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const winRate = profile.games_played > 0 ? ((profile.wins / profile.games_played) * 100).toFixed(1) : 0;
  const avgScore = profile.games_played > 0 ? Math.floor(profile.highest_score / profile.games_played) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 mb-6 text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">玩家档案</h1>
          <p className="text-white/80">累计游玩时间: {Math.floor(profile.total_playtime_minutes)} 分钟</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Trophy className="w-6 h-6" />} label="胜利" value={profile.wins} color="from-yellow-500 to-orange-500" />
          <StatCard icon={<Target className="w-6 h-6" />} label="游戏场次" value={profile.games_played} color="from-blue-500 to-cyan-500" />
          <StatCard icon={<Coins className="w-6 h-6" />} label="金币" value={profile.total_gold_earned.toLocaleString()} color="from-yellow-600 to-yellow-400" />
          <StatCard icon={<Zap className="w-6 h-6" />} label="最高分" value={profile.highest_score.toLocaleString()} color="from-purple-500 to-pink-500" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <SmallStatCard icon={<Flame className="w-5 h-5" />} label="击败Boss" value={profile.bosses_defeated} />
          <SmallStatCard icon={<Target className="w-5 h-5" />} label="消灭敌人" value={profile.enemies_killed} />
          <SmallStatCard icon={<Skull className="w-5 h-5" />} label="死亡次数" value={profile.deaths} />
          <SmallStatCard icon={<Star className="w-5 h-5" />} label="胜率" value={`${winRate}%`} />
          <SmallStatCard icon={<Flame className="w-5 h-5" />} label="连胜" value={profile.current_win_streak} />
          <SmallStatCard icon={<Trophy className="w-5 h-5" />} label="最佳连胜" value={profile.best_win_streak} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            成就系统
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(ACHIEVEMENTS).map(([key, achievement]) => (
              <AchievementCard
                key={key}
                achievement={achievement}
                unlocked={profile.achievements.includes(key)}
              />
            ))}
          </div>
        </motion.div>

        <Link to={createPageUrl('Settings')}>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6">
            ⚙️ 游戏设置
          </Button>
        </Link>
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

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-center">{value}</div>
      <div className="text-xs text-center opacity-90">{label}</div>
    </motion.div>
  );
}

function SmallStatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg p-3 flex items-center gap-3">
      <div className="text-cyan-400">{icon}</div>
      <div>
        <div className="text-white font-bold">{value}</div>
        <div className="text-white/60 text-xs">{label}</div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, unlocked }) {
  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      className={`rounded-lg p-3 ${
        unlocked 
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50' 
          : 'bg-slate-700/30 border border-slate-600/30 opacity-50'
      }`}
    >
      <div className="text-3xl mb-1 text-center">{achievement.icon}</div>
      <div className="text-white text-sm font-bold text-center">{achievement.name}</div>
      <div className="text-white/60 text-xs text-center">{achievement.desc}</div>
    </motion.div>
  );
}