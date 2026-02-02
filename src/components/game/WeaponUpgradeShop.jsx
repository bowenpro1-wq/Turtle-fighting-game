import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Zap, Target, TrendingUp, Sparkles, Lock, Coins } from 'lucide-react';

const WEAPON_UPGRADES = {
  chichao: {
    name: '赤潮',
    icon: '🔥',
    stats: {
      damage: { name: '基础伤害', icon: '⚔️', baseCost: 200, max: 10 },
      fireRate: { name: '射速', icon: '⚡', baseCost: 250, max: 8 },
      range: { name: '射程', icon: '🎯', baseCost: 180, max: 8 },
      special: { name: '火焰强度', icon: '🔥', baseCost: 300, max: 5 }
    }
  },
  guigui: {
    name: '龟龟之手',
    icon: '🐢',
    stats: {
      damage: { name: '光束伤害', icon: '⚔️', baseCost: 200, max: 10 },
      fireRate: { name: '能量恢复', icon: '⚡', baseCost: 250, max: 8 },
      range: { name: '光束距离', icon: '🎯', baseCost: 180, max: 8 },
      special: { name: '召唤强度', icon: '🐢', baseCost: 300, max: 5 }
    }
  },
  dianchao: {
    name: '电巢',
    icon: '⚡',
    stats: {
      damage: { name: '电流伤害', icon: '⚔️', baseCost: 200, max: 10 },
      fireRate: { name: '电流频率', icon: '⚡', baseCost: 250, max: 8 },
      range: { name: '扩散范围', icon: '🎯', baseCost: 180, max: 8 },
      special: { name: '雷暴强度', icon: '⚡', baseCost: 300, max: 5 }
    }
  },
  totem: {
    name: '图腾',
    icon: '🗿',
    stats: {
      damage: { name: '召唤伤害', icon: '⚔️', baseCost: 200, max: 10 },
      fireRate: { name: '召唤速度', icon: '⚡', baseCost: 250, max: 8 },
      range: { name: '射程', icon: '🎯', baseCost: 180, max: 8 },
      special: { name: '军团数量', icon: '🗿', baseCost: 300, max: 5 }
    }
  }
};

export default function WeaponUpgradeShop({ weapon, coins, onUpgrade, onClose }) {
  const [weaponStats, setWeaponStats] = useState(() => {
    const saved = localStorage.getItem('weaponStats');
    return saved ? JSON.parse(saved) : {
      chichao: { damage: 0, fireRate: 0, range: 0, special: 0 },
      guigui: { damage: 0, fireRate: 0, range: 0, special: 0 },
      dianchao: { damage: 0, fireRate: 0, range: 0, special: 0 },
      totem: { damage: 0, fireRate: 0, range: 0, special: 0 }
    };
  });

  if (!weapon || !WEAPON_UPGRADES[weapon]) return null;

  const weaponData = WEAPON_UPGRADES[weapon];
  const currentStats = weaponStats[weapon];

  const handleUpgrade = (statName) => {
    const stat = weaponData.stats[statName];
    const currentLevel = currentStats[statName];
    
    if (currentLevel >= stat.max) return;
    
    const cost = stat.baseCost * (currentLevel + 1);
    
    if (onUpgrade(cost)) {
      const newStats = {
        ...weaponStats,
        [weapon]: {
          ...currentStats,
          [statName]: currentLevel + 1
        }
      };
      setWeaponStats(newStats);
      localStorage.setItem('weaponStats', JSON.stringify(newStats));
    }
  };

  const getTotalPower = () => {
    return Object.values(currentStats).reduce((sum, val) => sum + val, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 max-w-2xl w-full border-4 border-purple-500/50 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{weaponData.icon}</span>
            <div>
              <h2 className="text-3xl font-bold text-white">{weaponData.name}</h2>
              <p className="text-purple-300">武器强化中心</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="mb-6 bg-black/40 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{coins}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-lg text-white">总强度: {getTotalPower()}</span>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(weaponData.stats).map(([statName, stat]) => {
            const currentLevel = currentStats[statName];
            const cost = stat.baseCost * (currentLevel + 1);
            const isMaxed = currentLevel >= stat.max;
            const canAfford = coins >= cost;

            return (
              <div
                key={statName}
                className="bg-slate-800/60 rounded-xl p-4 border-2 border-slate-700 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{stat.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: stat.max }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < currentLevel
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                  : 'bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">
                          {currentLevel}/{stat.max}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isMaxed ? (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-lg">
                      <span className="text-white font-bold flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        MAX
                      </span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(statName)}
                      disabled={!canAfford}
                      className={`${
                        canAfford
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                          : 'bg-gray-600 cursor-not-allowed'
                      } px-6 py-2 font-bold`}
                    >
                      {canAfford ? (
                        <span className="flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          {cost}
                        </span>
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  {statName === 'damage' && `+${currentLevel * 15}% 伤害加成`}
                  {statName === 'fireRate' && `+${currentLevel * 12}% 射速加成`}
                  {statName === 'range' && `+${currentLevel * 10}% 射程加成`}
                  {statName === 'special' && `+${currentLevel * 20}% 特殊技能强度`}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-purple-900/40 rounded-lg p-4 border border-purple-500/30">
          <p className="text-purple-200 text-sm text-center">
            💡 提示：升级会永久保存，所有游戏模式通用！
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}