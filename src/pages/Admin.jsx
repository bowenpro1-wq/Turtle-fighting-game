import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Mail, Coins, Gift, Sparkles, Send, Loader2, BarChart3, TrendingUp, Users, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [goldAmount, setGoldAmount] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoValue, setPromoValue] = useState('');
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handleLogin = () => {
    if (password === '20150525') {
      setIsAuthenticated(true);
      setMessage('登录成功！');
      loadAnalytics();
    } else {
      setMessage('密码错误,你个 2B');
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const profiles = await base44.entities.PlayerProfile.list();
      const progress = await base44.entities.GameProgress.list();
      
      // Calculate statistics
      const totalPlayers = profiles.length;
      const avgScore = profiles.reduce((sum, p) => sum + (p.highest_score || 0), 0) / totalPlayers || 0;
      const totalGamesPlayed = profiles.reduce((sum, p) => sum + (p.total_games_played || 0), 0);
      const totalBossesDefeated = profiles.reduce((sum, p) => sum + (p.total_bosses_defeated || 0), 0);
      
      // Game mode preferences
      const modeCount = {};
      progress.forEach(p => {
        modeCount[p.game_mode] = (modeCount[p.game_mode] || 0) + 1;
      });
      
      // Highest floor in tower mode
      const towerProgress = progress.filter(p => p.game_mode === 'tower');
      const highestFloor = towerProgress.length > 0 
        ? Math.max(...towerProgress.map(p => p.current_floor || 1))
        : 0;
      
      setAnalytics({
        totalPlayers,
        avgScore: Math.round(avgScore),
        totalGamesPlayed,
        totalBossesDefeated,
        modePreferences: modeCount,
        highestFloor,
        topPlayers: profiles
          .sort((a, b) => (b.highest_score || 0) - (a.highest_score || 0))
          .slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    setLoadingAnalytics(false);
  };

  const handleDraftEmail = async () => {
    setIsDraftingEmail(true);
    setMessage('');
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `请为我们的游戏"龟龟冒险岛"撰写一封吸引人的周更新邮件。包含以下内容：
        - 欢迎语
        - 游戏最新动态和更新
        - 鼓励玩家回来游戏
        - 结束语
        
        请用中文撰写，语气友好热情。邮件标题也请一并提供。`,
      });

      const lines = response.split('\n');
      const subjectLine = lines.find(line => line.includes('标题') || line.includes('主题'));
      if (subjectLine) {
        setEmailSubject(subjectLine.replace(/.*[:：]/, '').trim());
        setEmailBody(lines.slice(1).join('\n').trim());
      } else {
        setEmailSubject('🎮 龟龟冒险岛 - 本周更新');
        setEmailBody(response);
      }
      setMessage('邮件草稿生成成功！');
    } catch (error) {
      setMessage('生成失败: ' + error.message);
    }
    setIsDraftingEmail(false);
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      setMessage('请填写邮件主题和内容');
      return;
    }

    setIsSendingEmail(true);
    setMessage('');
    try {
      const subscriptions = await base44.entities.EmailSubscription.filter({ subscribed: true });
      
      let successCount = 0;
      for (const sub of subscriptions) {
        try {
          await base44.integrations.Core.SendEmail({
            from_name: 'Star Pro Games',
            to: sub.email,
            subject: emailSubject,
            body: emailBody
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${sub.email}:`, error);
        }
      }
      
      setMessage(`成功发送邮件给 ${successCount} 位订阅用户！`);
    } catch (error) {
      setMessage('发送失败: ' + error.message);
    }
    setIsSendingEmail(false);
  };

  const handleGiveGold = async () => {
    if (!userEmail || !goldAmount) {
      setMessage('请填写用户邮箱和金币数量');
      return;
    }

    try {
      const profiles = await base44.entities.PlayerProfile.filter({ user_email: userEmail });
      if (profiles.length === 0) {
        setMessage('未找到该用户');
        return;
      }

      const profile = profiles[0];
      await base44.entities.PlayerProfile.update(profile.id, {
        total_gold_earned: (profile.total_gold_earned || 0) + parseInt(goldAmount)
      });

      setMessage(`成功赠送 ${goldAmount} 金币给 ${userEmail}！`);
      setUserEmail('');
      setGoldAmount('');
    } catch (error) {
      setMessage('赠送失败: ' + error.message);
    }
  };

  const handleCreatePromo = async () => {
    if (!promoCode || !promoValue) {
      setMessage('请填写优惠码和金额');
      return;
    }

    try {
      // Store in localStorage for simplicity
      const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '{}');
      promoCodes[promoCode] = parseInt(promoValue);
      localStorage.setItem('promoCodes', JSON.stringify(promoCodes));

      setMessage(`优惠码 "${promoCode}" 创建成功！价值 ${promoValue} 金币`);
      setPromoCode('');
      setPromoValue('');
    } catch (error) {
      setMessage('创建失败: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700"
        >
          <h1 className="text-3xl font-bold text-white mb-6 text-center">🔐 管理员登录</h1>
          <Input
            type="password"
            placeholder="请输入管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="mb-4"
          />
          <Button onClick={handleLogin} className="w-full">
            登录
          </Button>
          {message && (
            <p className="mt-4 text-center text-red-400">{message}</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回游戏
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            🔧 管理员面板
          </h1>
          <div className="w-24" />
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 text-green-300 text-center"
          >
            {message}
          </motion.div>
        )}

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/50 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">📊 游戏数据分析</h2>
            </div>
            <Button
              onClick={loadAnalytics}
              disabled={loadingAnalytics}
              variant="outline"
              size="sm"
            >
              {loadingAnalytics ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔄 刷新'}
            </Button>
          </div>

          {analytics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <p className="text-white/70 text-sm">总玩家数</p>
                </div>
                <p className="text-3xl font-bold text-white">{analytics.totalPlayers}</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <p className="text-white/70 text-sm">平均分数</p>
                </div>
                <p className="text-3xl font-bold text-white">{analytics.avgScore}</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <p className="text-white/70 text-sm">最高楼层</p>
                </div>
                <p className="text-3xl font-bold text-white">{analytics.highestFloor}F</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <p className="text-white/70 text-sm">Boss击败</p>
                </div>
                <p className="text-3xl font-bold text-white">{analytics.totalBossesDefeated}</p>
              </div>

              <div className="col-span-2 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-white/70 text-sm mb-3">游戏模式偏好</p>
                <div className="space-y-2">
                  {Object.entries(analytics.modePreferences).map(([mode, count]) => (
                    <div key={mode} className="flex justify-between items-center">
                      <span className="text-white text-sm capitalize">{mode}</span>
                      <span className="text-white/80 font-bold">{count}次</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-white/70 text-sm mb-3">排行榜 TOP 5</p>
                <div className="space-y-2">
                  {analytics.topPlayers.map((player, idx) => (
                    <div key={player.id} className="flex justify-between items-center">
                      <span className="text-white text-sm flex items-center gap-2">
                        <span className="text-yellow-400">#{idx + 1}</span>
                        {player.user_email?.split('@')[0]}
                      </span>
                      <span className="text-white/80 font-bold">{player.highest_score || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              点击刷新按钮加载数据...
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">群发邮件</h2>
            </div>

            <Button
              onClick={handleDraftEmail}
              disabled={isDraftingEmail}
              className="w-full mb-4 bg-purple-600 hover:bg-purple-700"
            >
              {isDraftingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 撰写中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 生成邮件草稿
                </>
              )}
            </Button>

            <Input
              placeholder="邮件主题"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="mb-4"
            />

            <Textarea
              placeholder="邮件内容"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="mb-4 h-40"
            />

            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  立即发送给所有订阅用户
                </>
              )}
            </Button>
          </motion.div>

          {/* Gold & Promo Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <Coins className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">赠送金币</h2>
              </div>

              <Input
                placeholder="用户邮箱"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mb-4"
              />

              <Input
                type="number"
                placeholder="金币数量"
                value={goldAmount}
                onChange={(e) => setGoldAmount(e.target.value)}
                className="mb-4"
              />

              <Button
                onClick={handleGiveGold}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <Coins className="w-4 h-4 mr-2" />
                赠送金币
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-6 h-6 text-pink-400" />
                <h2 className="text-2xl font-bold text-white">创建优惠码</h2>
              </div>

              <Input
                placeholder="优惠码名称"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="mb-4"
              />

              <Input
                type="number"
                placeholder="金币价值"
                value={promoValue}
                onChange={(e) => setPromoValue(e.target.value)}
                className="mb-4"
              />

              <Button
                onClick={handleCreatePromo}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <Gift className="w-4 h-4 mr-2" />
                创建优惠码
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}