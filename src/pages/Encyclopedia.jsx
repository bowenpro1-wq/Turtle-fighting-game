import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Flame, Zap, Shield, Users, Swords, Heart, Gauge, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';

const ENCYCLOPEDIA_DATA = {
  bosses: [
    { id: 'boss_1', name: '海星守卫', icon: '⭐', color: '#ff6b6b', health: 100, damage: 15, speed: 1.5, pattern: '圆形移动', weakness: '速度类攻击', drops: '100金币', description: '守护海域的第一道防线，移动呈圆形轨迹。' },
    { id: 'boss_2', name: '水母刺客', icon: '🪼', color: '#a855f7', health: 150, damage: 20, speed: 2, pattern: 'Z字移动', weakness: '范围伤害', drops: '150金币', description: '擅长快速突袭的水母杀手。' },
    { id: 'boss_3', name: '螃蟹将军', icon: '🦀', color: '#ef4444', health: 200, damage: 25, speed: 1, pattern: '追击玩家', weakness: '远程攻击', drops: '200金币', description: '拥有坚硬外壳的螃蟹统帅。' },
    { id: 'boss_4', name: '章鱼巫师', icon: '🐙', color: '#8b5cf6', health: 250, damage: 30, speed: 1.8, pattern: '瞬移攻击', weakness: '持续伤害', drops: '250金币', description: '掌握空间魔法的神秘章鱼。' },
    { id: 'boss_5', name: '鲨鱼猎人', icon: '🦈', color: '#6366f1', health: 300, damage: 35, speed: 2.5, pattern: '冲刺攻击', weakness: '控制技能', drops: '300金币', description: '海洋中最凶猛的掠食者。' },
    { id: 'boss_6', name: '海龙王子', icon: '🐉', color: '#22d3ee', health: 400, damage: 40, speed: 1.5, pattern: '螺旋攻击', weakness: '火焰伤害', drops: '400金币', description: '海龙一族的年轻王子。' },
    { id: 'boss_7', name: '深海怪兽', icon: '🦑', color: '#14b8a6', health: 500, damage: 45, speed: 1.2, pattern: '随机移动', weakness: '雷电伤害', drops: '500金币', description: '深海中的恐怖生物。' },
    { id: 'boss_8', name: '珊瑚守护者', icon: '🪸', color: '#f472b6', health: 350, damage: 30, speed: 2, pattern: '弹跳攻击', weakness: '冰冻效果', drops: '350金币', description: '保护珊瑚礁的古老守卫。' },
    { id: 'boss_9', name: '海蛇女王', icon: '🐍', color: '#84cc16', health: 600, damage: 50, speed: 2.2, pattern: '波浪攻击', weakness: '毒抗装备', drops: '600金币', description: '统治海蛇族群的女王。' },
    { id: 'boss_10', name: '冰霜海妖', icon: '❄️', color: '#06b6d4', health: 700, damage: 55, speed: 1.8, pattern: '冰冻攻击', weakness: '火焰攻击', drops: '700金币', description: '能够冰冻一切的海妖。' },
    { id: 'boss_11', name: '火焰海神', icon: '🔥', color: '#f97316', health: 800, damage: 60, speed: 2, pattern: '爆发攻击', weakness: '水属性', drops: '800金币', description: '掌控火焰之力的海神。' },
    { id: 'boss_12', name: '雷电鳐鱼', icon: '⚡', color: '#fbbf24', health: 550, damage: 45, speed: 3, pattern: '闪电攻击', weakness: '绝缘装备', drops: '550金币', description: '释放雷电的高速鳐鱼。' },
    { id: 'boss_13', name: '暗影鲸鱼', icon: '🐋', color: '#374151', health: 900, damage: 65, speed: 1.5, pattern: '暗影攻击', weakness: '光明魔法', drops: '900金币', description: '隐藏在黑暗中的巨型鲸鱼。' },
    { id: 'boss_14', name: '毒液水母王', icon: '☠️', color: '#a3e635', health: 450, damage: 40, speed: 2.5, pattern: '毒液攻击', weakness: '解毒药', drops: '450金币', description: '散发致命毒液的水母之王。' },
    { id: 'boss_15', name: '巨型海马', icon: '🐴', color: '#fb923c', health: 750, damage: 55, speed: 2.2, pattern: '冲锋攻击', weakness: '陷阱', drops: '750金币', description: '体型巨大的海马战士。' },
    { id: 'boss_16', name: '远古海龟王', icon: '🐢', color: '#059669', health: 1000, damage: 50, speed: 1, pattern: '防御反击', weakness: '魔法穿透', drops: '1000金币', description: '拥有最强防御的海龟王。' },
    { id: 'boss_17', name: '幻影海豚', icon: '🐬', color: '#818cf8', health: 650, damage: 60, speed: 3.5, pattern: '分身攻击', weakness: '范围攻击', drops: '650金币', description: '能制造幻影的神秘海豚。' },
    { id: 'boss_18', name: '末日海怪', icon: '👹', color: '#dc2626', health: 1200, damage: 70, speed: 1.8, pattern: '混沌攻击', weakness: '神圣之力', drops: '1200金币', description: '带来末日的恐怖海怪。' },
    { id: 'boss_19', name: '深渊领主', icon: '👿', color: '#1e1b4b', health: 1500, damage: 80, speed: 2, pattern: '虚空攻击', weakness: '真实伤害', drops: '1500金币', description: '深渊的统治者。' },
    { id: 'boss_20', name: '广智', icon: '🎓', color: '#ff4500', health: 5000, damage: 150, speed: 2.5, pattern: '火焰攻击', weakness: '无', drops: '5000金币 + 赤潮武器', description: '最终Boss，掌握所有知识的智者。' }
  ],
  special_bosses: [
    { id: 'boss_zhongdalin', name: '中大林', icon: '🌳', color: '#4ade80', health: 3000, damage: 40, speed: 2.0, pattern: '追击', weakness: '火焰', drops: '图腾武器', description: 'Boss试炼特殊Boss，击败后解锁图腾武器。' },
    { id: 'boss_xiaowang', name: '小黄龙', icon: '🐲', color: '#f59e0b', health: 3500, damage: 50, speed: 3.5, pattern: '冲刺', weakness: '冰冻', drops: '电巢武器', description: 'Boss试炼特殊Boss，拥有强大的速度和伤害。' },
    { id: 'boss_longhaixing', name: '海星', icon: '⭐', color: '#06b6d4', health: 2800, damage: 38, speed: 2.5, pattern: '瞬移', weakness: '范围攻击', drops: '稀有道具', description: 'Boss试炼特殊Boss。' },
    { id: 'boss_qigong', name: '气功大师', icon: '🥋', color: '#8b5cf6', health: 3500, damage: 45, speed: 1.5, pattern: '螺旋', weakness: '远程攻击', drops: '稀有道具', description: 'Boss试炼特殊Boss，掌握气功之力。' },
    { id: 'boss_guangzhi', name: '广智', icon: '🎓', color: '#ff4500', health: 3000, damage: 60, speed: 2.3, pattern: '火焰', weakness: '无', drops: '赤潮武器', description: 'Boss试炼特殊Boss版本。' }
  ],
  weapons: [
    { id: 'weapon_chichao', name: '赤潮', icon: <Flame className="w-6 h-6" />, color: '#f97316', unlock: '击败广智', description: '火焰系武器，拥有强大的火焰攻击技能。', skills: ['火焰喷射', '火焰斩', '炎爆', '广志真身'] },
    { id: 'weapon_guigui', name: '龟龟之手', icon: <Shield className="w-6 h-6" />, color: '#10b981', unlock: '升级到8级', description: '防御与光束结合的终极武器。', skills: ['光束', '龟圈', '龟文诅咒'] },
    { id: 'weapon_dianchao', name: '电巢', icon: <Zap className="w-6 h-6" />, color: '#eab308', unlock: '击败小黄龙', description: '电系武器，释放强大的电流攻击。', skills: ['电流四射', '雷暴'] },
    { id: 'weapon_totem', name: '中大林图腾', icon: <Users className="w-6 h-6" />, color: '#22c55e', unlock: '击败中大林', description: '召唤系武器，可以召唤中大林助战。', skills: ['图腾射击', '召唤军团'] }
  ],
  upgrades: [
    { id: 'upgrade_damage', name: '伤害提升', icon: <Swords className="w-6 h-6" />, color: '#ef4444', description: '增加武器伤害输出。', effect: '每级+10%伤害' },
    { id: 'upgrade_firerate', name: '攻速提升', icon: <Gauge className="w-6 h-6" />, color: '#f59e0b', description: '提高攻击速度。', effect: '每级+15%攻速' },
    { id: 'upgrade_speed', name: '移速提升', icon: <Wind className="w-6 h-6" />, color: '#06b6d4', description: '提升移动速度。', effect: '每级+10%移速' },
    { id: 'upgrade_health', name: '生命提升', icon: <Heart className="w-6 h-6" />, color: '#10b981', description: '增加最大生命值。', effect: '每级+100生命' }
  ]
};

export default function Encyclopedia() {
  const [activeTab, setActiveTab] = useState('bosses');
  const [userEntries, setUserEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserEntries();
  }, []);

  const loadUserEntries = async () => {
    try {
      const user = await base44.auth.me();
      
      // Admin users get all entries unlocked automatically
      if (user.role === 'admin') {
        const allEntries = [
          ...ENCYCLOPEDIA_DATA.bosses.map(b => ({ entry_id: b.id, entry_type: 'boss' })),
          ...ENCYCLOPEDIA_DATA.special_bosses.map(b => ({ entry_id: b.id, entry_type: 'boss' })),
          ...ENCYCLOPEDIA_DATA.weapons.map(w => ({ entry_id: w.id, entry_type: 'weapon' })),
          ...ENCYCLOPEDIA_DATA.upgrades.map(u => ({ entry_id: u.id, entry_type: 'upgrade' }))
        ];
        
        const mockEntries = allEntries.map(e => ({
          user_email: user.email,
          entry_id: e.entry_id,
          entry_type: e.entry_type,
          unlocked: true,
          times_encountered: 999,
          times_defeated: 999
        }));
        
        setUserEntries(mockEntries);
      } else {
        const entries = await base44.entities.EncyclopediaEntry.filter({ user_email: user.email });
        setUserEntries(entries);
      }
    } catch (error) {
      console.error('Failed to load encyclopedia entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (entryId) => {
    return userEntries.some(e => e.entry_id === entryId && e.unlocked);
  };

  const getEntryStats = (entryId) => {
    return userEntries.find(e => e.entry_id === entryId) || {};
  };

  const renderEntryCard = (entry, type) => {
    const unlocked = isUnlocked(entry.id);
    const stats = getEntryStats(entry.id);

    return (
      <motion.button
        key={entry.id}
        onClick={() => unlocked && setSelectedEntry({ ...entry, type, stats })}
        whileHover={unlocked ? { scale: 1.05 } : {}}
        whileTap={unlocked ? { scale: 0.95 } : {}}
        className={`relative bg-gradient-to-br ${unlocked ? 'from-slate-700 to-slate-800' : 'from-slate-800 to-slate-900'} p-4 rounded-xl border-2 ${unlocked ? 'border-cyan-500/30' : 'border-slate-700'} ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`text-3xl ${!unlocked && 'grayscale blur-sm'}`}>{entry.icon}</div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-white">{unlocked ? entry.name : '???'}</h3>
            {unlocked && stats.times_defeated > 0 && (
              <p className="text-xs text-cyan-400">击败: {stats.times_defeated}次</p>
            )}
          </div>
        </div>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-slate-500" />
          </div>
        )}
      </motion.button>
    );
  };

  const renderWeaponCard = (weapon) => {
    const unlocked = isUnlocked(weapon.id);

    return (
      <motion.button
        key={weapon.id}
        onClick={() => unlocked && setSelectedEntry({ ...weapon, type: 'weapon' })}
        whileHover={unlocked ? { scale: 1.05 } : {}}
        whileTap={unlocked ? { scale: 0.95 } : {}}
        className={`relative bg-gradient-to-br ${unlocked ? 'from-slate-700 to-slate-800' : 'from-slate-800 to-slate-900'} p-4 rounded-xl border-2 ${unlocked ? 'border-cyan-500/30' : 'border-slate-700'} ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`${!unlocked && 'grayscale opacity-50'}`} style={{ color: weapon.color }}>
            {weapon.icon}
          </div>
          <h3 className="text-lg font-bold text-white">{unlocked ? weapon.name : '???'}</h3>
        </div>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-slate-500" />
          </div>
        )}
      </motion.button>
    );
  };

  const renderUpgradeCard = (upgrade) => {
    return (
      <motion.button
        key={upgrade.id}
        onClick={() => setSelectedEntry({ ...upgrade, type: 'upgrade' })}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border-2 border-cyan-500/30 cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-2">
          <div style={{ color: upgrade.color }}>
            {upgrade.icon}
          </div>
          <h3 className="text-lg font-bold text-white">{upgrade.name}</h3>
        </div>
      </motion.button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            📖 游戏百科
          </h1>
          <div className="w-20" />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => setActiveTab('bosses')}
            className={activeTab === 'bosses' ? 'bg-cyan-600' : 'bg-slate-700'}
          >
            常规Boss
          </Button>
          <Button
            onClick={() => setActiveTab('special')}
            className={activeTab === 'special' ? 'bg-cyan-600' : 'bg-slate-700'}
          >
            特殊Boss
          </Button>
          <Button
            onClick={() => setActiveTab('weapons')}
            className={activeTab === 'weapons' ? 'bg-cyan-600' : 'bg-slate-700'}
          >
            武器
          </Button>
          <Button
            onClick={() => setActiveTab('upgrades')}
            className={activeTab === 'upgrades' ? 'bg-cyan-600' : 'bg-slate-700'}
          >
            升级
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {activeTab === 'bosses' && ENCYCLOPEDIA_DATA.bosses.map(boss => renderEntryCard(boss, 'boss'))}
          {activeTab === 'special' && ENCYCLOPEDIA_DATA.special_bosses.map(boss => renderEntryCard(boss, 'boss'))}
          {activeTab === 'weapons' && ENCYCLOPEDIA_DATA.weapons.map(weapon => renderWeaponCard(weapon))}
          {activeTab === 'upgrades' && ENCYCLOPEDIA_DATA.upgrades.map(upgrade => renderUpgradeCard(upgrade))}
        </div>

        <AnimatePresence>
          {selectedEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedEntry(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-cyan-500/30 max-h-[80vh] overflow-y-auto"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{selectedEntry.icon}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedEntry.name}</h2>
                    {selectedEntry.stats?.times_defeated > 0 && (
                      <p className="text-cyan-400">击败次数: {selectedEntry.stats.times_defeated}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 text-white">
                  <p className="text-gray-300">{selectedEntry.description}</p>

                  {selectedEntry.type === 'boss' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <p className="text-sm text-gray-400">生命值</p>
                          <p className="text-xl font-bold text-red-400">{selectedEntry.health}</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <p className="text-sm text-gray-400">伤害</p>
                          <p className="text-xl font-bold text-orange-400">{selectedEntry.damage}</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <p className="text-sm text-gray-400">速度</p>
                          <p className="text-xl font-bold text-blue-400">{selectedEntry.speed}</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <p className="text-sm text-gray-400">攻击模式</p>
                          <p className="text-lg font-bold text-purple-400">{selectedEntry.pattern}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
                        <p className="text-sm text-yellow-400 mb-1">弱点</p>
                        <p className="text-lg font-bold text-yellow-300">{selectedEntry.weakness}</p>
                      </div>
                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                        <p className="text-sm text-green-400 mb-1">掉落物品</p>
                        <p className="text-lg font-bold text-green-300">{selectedEntry.drops}</p>
                      </div>
                    </>
                  )}

                  {selectedEntry.type === 'weapon' && (
                    <>
                      <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                        <p className="text-sm text-purple-400 mb-2">解锁条件</p>
                        <p className="text-lg font-bold text-purple-300">{selectedEntry.unlock}</p>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-3">技能列表</p>
                        <div className="space-y-2">
                          {selectedEntry.skills.map((skill, idx) => (
                            <p key={idx} className="text-cyan-300">• {skill}</p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedEntry.type === 'upgrade' && (
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">效果</p>
                      <p className="text-lg font-bold text-green-300">{selectedEntry.effect}</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedEntry(null)}
                  className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700"
                >
                  关闭
                </Button>
              </motion.div>
            </motion.div>
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