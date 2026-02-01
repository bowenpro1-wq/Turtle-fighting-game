import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon, Zap, Shield, Flame, Skull } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const DIFFICULTIES = [
  { id: 'easy', name: '简单', icon: '🟢', desc: '敌人更弱，适合新手', color: 'from-green-500 to-emerald-500' },
  { id: 'normal', name: '普通', icon: '🟡', desc: '标准难度，平衡体验', color: 'from-yellow-500 to-orange-500' },
  { id: 'hard', name: '困难', icon: '🟠', desc: '更强的敌人，更大挑战', color: 'from-orange-500 to-red-500' },
  { id: 'expert', name: '专家', icon: '🔴', desc: '极限挑战，仅供高手', color: 'from-red-500 to-red-700' },
  { id: 'auto', name: '自动', icon: '⚡', desc: 'AI自动调整难度', color: 'from-purple-500 to-pink-500' }
];

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.PlayerProfile.filter({ user_email: user.email });
      
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDifficulty = async (difficulty) => {
    setSaving(true);
    try {
      await base44.entities.PlayerProfile.update(profile.id, {
        difficulty_preference: difficulty
      });
      setProfile({ ...profile, difficulty_preference: difficulty });
    } catch (error) {
      console.error('Failed to update difficulty:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to={createPageUrl('Profile')}>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 mb-6 text-center"
        >
          <SettingsIcon className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white">游戏设置</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4">难度设置</h2>
          <p className="text-white/70 mb-4 text-sm">
            当前表现评分: <span className="text-cyan-400 font-bold">{profile.performance_score}/100</span>
          </p>
          
          <div className="space-y-3">
            {DIFFICULTIES.map((diff) => (
              <motion.button
                key={diff.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateDifficulty(diff.id)}
                disabled={saving}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  profile.difficulty_preference === diff.id
                    ? `bg-gradient-to-r ${diff.color} border-white/50 shadow-lg`
                    : 'bg-slate-700/30 border-slate-600/30 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{diff.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">{diff.name}</div>
                      <div className="text-white/70 text-sm">{diff.desc}</div>
                    </div>
                  </div>
                  {profile.difficulty_preference === diff.id && (
                    <div className="text-white text-2xl">✓</div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4">难度说明</h2>
          <div className="space-y-3 text-white/80 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <strong className="text-white">简单:</strong> 敌人血量和伤害-30%，获得金币+50%
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <strong className="text-white">普通:</strong> 标准平衡，推荐大部分玩家
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Flame className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <strong className="text-white">困难:</strong> 敌人血量和伤害+40%，金币+100%
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Skull className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <strong className="text-white">专家:</strong> 敌人血量和伤害+80%，金币+200%
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <strong className="text-white">自动:</strong> AI根据你的表现动态调整难度
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}