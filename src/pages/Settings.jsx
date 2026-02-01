import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('adaptive');

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
        setDifficulty(profiles[0].difficulty_preference || 'adaptive');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDifficulty = async (newDifficulty) => {
    setDifficulty(newDifficulty);
    if (profile) {
      try {
        await base44.entities.PlayerProfile.update(profile.id, {
          difficulty_preference: newDifficulty
        });
        alert('难度设置已保存！');
      } catch (error) {
        console.error('Error saving difficulty:', error);
      }
    }
  };

  const difficulties = [
    { id: 'easy', name: '简单', desc: '敌人血量-30%，伤害-30%', color: 'from-green-600 to-teal-600' },
    { id: 'normal', name: '普通', desc: '标准游戏难度', color: 'from-blue-600 to-cyan-600' },
    { id: 'hard', name: '困难', desc: '敌人血量+50%，伤害+50%', color: 'from-red-600 to-orange-600' },
    { id: 'adaptive', name: '自适应', desc: '根据表现动态调整难度', color: 'from-purple-600 to-pink-600' },
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
      <div className="max-w-2xl mx-auto">
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
          <SettingsIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            游戏设置
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">难度设置</h2>
          <div className="space-y-3">
            {difficulties.map((diff, index) => (
              <motion.button
                key={diff.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => saveDifficulty(diff.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  difficulty === diff.id
                    ? `bg-gradient-to-r ${diff.color} border-white/50 scale-105`
                    : 'bg-slate-700/30 border-slate-600/30 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">{diff.name}</div>
                    <div className="text-sm text-white/70">{diff.desc}</div>
                  </div>
                  {difficulty === diff.id && (
                    <div className="text-white text-2xl">✓</div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
            <p className="text-white/80 text-sm">
              💡 <strong>提示：</strong>自适应难度会根据你的表现自动调整游戏难度，让你始终保持合适的挑战感！
            </p>
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