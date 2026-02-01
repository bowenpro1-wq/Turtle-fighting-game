import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame, Zap, Shield, Users, ArrowUpCircle, Star, Sparkles, Coins, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ForgeAdvisor from '@/components/ForgeAdvisor';
import BottomNav from '@/components/BottomNav';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ForgePage() {
  const [weapons, setWeapons] = useState(() => {
    const saved = localStorage.getItem('weapons');
    return saved ? JSON.parse(saved) : {
      chichao: { level: 0, unlocked: false },
      guigui: { level: 0, unlocked: false },
      dianchao: { level: 0, unlocked: false },
      totem: { level: 0, unlocked: false }
    };
  });

  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('gameCoins');
    return saved ? parseInt(saved) : 0;
  });

  const [showAdvisor, setShowAdvisor] = useState(false);
  const [language, setLanguage] = useState('zh');

  useEffect(() => {
    localStorage.setItem('weapons', JSON.stringify(weapons));
  }, [weapons]);

  useEffect(() => {
    localStorage.setItem('gameCoins', coins.toString());
  }, [coins]);

  const weaponData = {
    chichao: {
      id: 'chichao',
      name: '赤潮',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      maxLevel: 10,
      description: '火焰攻击武器，拥有强大的群体伤害能力',
      skills: [
        { name: '火焰喷射', desc: '发射火焰弹', level: 1 },
        { name: '火焰近战', desc: '近距离火焰攻击', level: 3 },
        { name: '超级火焰弹', desc: '喷发大量火焰', level: 6 },
        { name: '广志真身', desc: '召唤广志攻击敌人', level: 10 }
      ]
    },
    guigui: {
      id: 'guigui',
      name: '龟龟之手',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      maxLevel: 8,
      special: true,
      description: '传说级武器，需要8个模板完全解锁',
      skills: [
        { name: '光喷射', desc: '向前喷射龟光', level: 2 },
        { name: '龟圈', desc: '散发致命光圈(10秒)', level: 4 },
        { name: '外龟法', desc: '召唤龟龟军团', level: 6 },
        { name: '龟文诅咒', desc: '散发诅咒文字', level: 8 }
      ]
    },
    dianchao: {
      id: 'dianchao',
      name: '电巢',
      icon: Zap,
      color: 'from-yellow-500 to-blue-500',
      maxLevel: 10,
      description: '电系武器，向四周释放电流攻击',
      skills: [
        { name: '电流喷射', desc: '四周释放电流', level: 1 },
        { name: '电气攻击', desc: '大量电气伤害', level: 5 }
      ]
    },
    totem: {
      id: 'totem',
      name: '中大林图腾',
      icon: Users,
      color: 'from-green-400 to-green-600',
      maxLevel: 10,
      description: '召唤系武器，中大林协助战斗',
      skills: [
        { name: '召唤中大林', desc: '帮助攻击敌人', level: 1 }
      ]
    }
  };

  const handleUpgrade = (weaponId) => {
    const weapon = weapons[weaponId];
    const data = weaponData[weaponId];
    const upgradeCost = (weapon.level + 1) * 500;
    
    if (coins >= upgradeCost && weapon.level < data.maxLevel) {
      setCoins(prev => prev - upgradeCost);
      setWeapons(prev => ({
        ...prev,
        [weaponId]: {
          ...prev[weaponId],
          level: prev[weaponId].level + 1,
          unlocked: weaponId === 'guigui' ? prev[weaponId].level + 1 >= 8 : true
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 pb-20">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline" className="gap-2 text-sm md:text-base">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              返回游戏
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 mb-2">
              🔨 锻造处 🔨
            </h1>
            <Button
              onClick={() => setShowAdvisor(true)}
              size="sm"
              className="gap-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500 text-xs md:text-sm"
            >
              <Bot className="w-3 h-3 md:w-4 md:h-4" />
              AI顾问
            </Button>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl px-4 md:px-6 py-2 md:py-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <span className="text-xl md:text-2xl font-bold text-yellow-400">{coins}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(weapons).map(([weaponId, weapon]) => {
            const data = weaponData[weaponId];
            if (!data) return null;

            const Icon = data.icon;
            const isMaxLevel = weapon.level >= data.maxLevel;
            const upgradeCost = (weapon.level + 1) * 500;
            const canUpgrade = coins >= upgradeCost && !isMaxLevel;
            const progressPercent = (weapon.level / data.maxLevel) * 100;

            return (
              <motion.div
                key={weaponId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * Object.keys(weapons).indexOf(weaponId) }}
                className={`bg-gradient-to-br ${data.color} p-1 rounded-2xl`}
              >
                <div className="bg-slate-900 rounded-xl p-6 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${data.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{data.name}</h3>
                      {data.special && (
                        <div className="flex items-center gap-1 mb-2">
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-bold">传说武器</span>
                        </div>
                      )}
                      <p className="text-gray-400 text-sm">{data.description}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">等级</span>
                        <span className="text-white font-bold">
                          {weapon.level} / {data.maxLevel}
                        </span>
                      </div>
                      <div className="bg-slate-800 rounded-full h-4 overflow-hidden relative">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${data.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5 }}
                        />
                        {isMaxLevel && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" fill="white" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">伤害加成</p>
                        <p className="text-lg font-bold text-orange-400">+{weapon.level * 20}%</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">效果强度</p>
                        <p className="text-lg font-bold text-cyan-400">+{weapon.level * 15}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-300">技能列表:</p>
                      {data.skills.map((skill, idx) => {
                        const unlocked = weapon.level >= skill.level;
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 text-sm p-2 rounded-lg ${
                              unlocked ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/30 opacity-50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              unlocked ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
                            }`}>
                              {skill.level}
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${unlocked ? 'text-green-300' : 'text-gray-500'}`}>
                                {skill.name}
                              </p>
                              <p className="text-xs text-gray-400">{skill.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleUpgrade(weaponId)}
                    disabled={!canUpgrade}
                    className={`w-full py-6 text-lg font-bold ${
                      canUpgrade
                        ? `bg-gradient-to-r ${data.color} hover:opacity-90 shadow-lg`
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isMaxLevel ? (
                      <>
                        <Star className="w-5 h-5 mr-2" fill="white" />
                        已满级
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle className="w-5 h-5 mr-2" />
                        升级 ({(weapon.level + 1) * 500} 💰)
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border-2 border-purple-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">锻造说明</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl p-4">
              <h4 className="text-yellow-400 font-bold mb-2">💰 升级费用</h4>
              <p className="text-gray-300 text-sm">升级费用递增：Lv1=500, Lv2=1000, Lv3=1500...满级需27,500金币</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <h4 className="text-cyan-400 font-bold mb-2">⚔️ 解锁武器</h4>
              <p className="text-gray-300 text-sm">击败Boss试炼解锁武器，龟龟之手需8级解锁</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <h4 className="text-purple-400 font-bold mb-2">🤖 AI顾问</h4>
              <p className="text-gray-300 text-sm">点击AI顾问获取智能升级建议和战力预测</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showAdvisor && (
            <ForgeAdvisor
              weapons={weapons}
              coins={coins}
              onClose={() => setShowAdvisor(false)}
            />
          )}
        </AnimatePresence>
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