import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Zap, Heart, TrendingUp, Target, Sparkles, Shield, CircleDot, Coins, Crosshair } from 'lucide-react';

export default function Shop({ coins, upgrades, hasHomingBullets, onPurchase, onClose }) {
  const [lastPurchased, setLastPurchased] = useState(null);
  
  const handlePurchase = (id, cost) => {
    const success = onPurchase(id, cost);
    if (success) {
      setLastPurchased(id);
      setTimeout(() => setLastPurchased(null), 1000);
    }
  };

  const items = [
    {
      id: 'damage',
      name: '伤害提升',
      icon: Target,
      description: '每级增加100%伤害',
      level: upgrades.damage,
      cost: upgrades.damage * 50,
      color: 'from-red-500 to-orange-500',
      stats: `+${(upgrades.damage - 1) * 100}% 伤害`
    },
    {
      id: 'fireRate',
      name: '射速提升',
      icon: Zap,
      description: '每级提高100%射速',
      level: upgrades.fireRate,
      cost: upgrades.fireRate * 75,
      color: 'from-yellow-500 to-orange-500',
      stats: `+${(upgrades.fireRate - 1) * 100}% 射速`
    },
    {
      id: 'speed',
      name: '移动速度',
      icon: TrendingUp,
      description: '每级提高100%移速',
      level: upgrades.speed,
      cost: upgrades.speed * 60,
      color: 'from-blue-500 to-cyan-500',
      stats: `+${(upgrades.speed - 1) * 100}% 移速`
    },
    {
      id: 'maxHealth',
      name: '最大生命',
      icon: Heart,
      description: '每级增加100生命值',
      level: upgrades.maxHealth,
      cost: upgrades.maxHealth * 100,
      color: 'from-green-500 to-emerald-500',
      stats: `${upgrades.maxHealth * 100} HP`
    },
    {
      id: 'cooldownReduction',
      name: '技能冷却',
      icon: Shield,
      description: '每级减少50%技能冷却',
      level: upgrades.cooldownReduction,
      cost: upgrades.cooldownReduction * 120,
      color: 'from-purple-500 to-indigo-500',
      stats: `-${Math.round((1 - 1/upgrades.cooldownReduction) * 100)}% 冷却`
    },
    {
      id: 'abilityPower',
      name: '技能强度',
      icon: Sparkles,
      description: '提升技能持续时间和效果',
      level: upgrades.abilityPower,
      cost: upgrades.abilityPower * 100,
      color: 'from-pink-500 to-rose-500',
      stats: `+${(upgrades.abilityPower - 1) * 50}% 效果`
    }
  ];

  const specialItems = hasHomingBullets ? [] : [
    {
      id: 'homingBullets',
      name: '追踪炮弹',
      icon: Crosshair,
      description: '子弹自动追踪敌人，射程减半',
      level: 0,
      cost: 500,
      color: 'from-purple-500 to-pink-500',
      stats: '自动追踪 | 射程-50%',
      special: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border-2 border-cyan-500/30 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              商店
            </h2>
            <p className="text-yellow-400 text-xl mt-2">金币: {coins}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 h-12 w-12"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {specialItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              特殊升级
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {specialItems.map((item) => {
                const Icon = item.icon;
                const canAfford = coins >= item.cost;
                const isPurchased = lastPurchased === item.id;
                
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: canAfford ? 1.02 : 1 }}
                    className={`relative bg-gradient-to-br ${item.color} p-1 rounded-xl ${
                      !canAfford && 'opacity-50'
                    }`}
                  >
                    <AnimatePresence>
                      {isPurchased && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.5, 1] }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex items-center justify-center"
                        >
                          <div className="bg-purple-500 rounded-full p-4">
                            <Sparkles className="w-12 h-12 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="bg-slate-900 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                            animate={isPurchased ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, 360]
                            } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-10 h-10 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">{item.name}</h3>
                            <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                            <div className="flex items-center gap-2">
                              <CircleDot className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-300 font-semibold text-sm">{item.stats}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePurchase(item.id, item.cost)}
                          disabled={!canAfford}
                          className={`${
                            canAfford
                              ? `bg-gradient-to-r ${item.color} hover:opacity-90 shadow-lg`
                              : 'bg-gray-600 cursor-not-allowed'
                          } font-bold text-xl px-8 py-4`}
                        >
                          <Coins className="w-6 h-6 mr-2" />
                          {item.cost}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
          永久升级
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            const canAfford = coins >= item.cost;
            const isPurchased = lastPurchased === item.id;
            
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: canAfford ? 1.02 : 1 }}
                className={`relative bg-gradient-to-br ${item.color} p-1 rounded-xl ${
                  !canAfford && 'opacity-50'
                }`}
              >
                <AnimatePresence>
                  {isPurchased && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5, 1] }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex items-center justify-center"
                    >
                      <div className="bg-green-500 rounded-full p-4">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-slate-900 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                        animate={isPurchased ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{item.name}</h3>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CircleDot className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 font-semibold">{item.stats}</span>
                    </div>
                    <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.level * 10, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <span className="text-gray-400 text-sm">等级 </span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        {item.level}
                      </span>
                    </div>
                    <Button
                      onClick={() => handlePurchase(item.id, item.cost)}
                      disabled={!canAfford}
                      className={`${
                        canAfford
                          ? `bg-gradient-to-r ${item.color} hover:opacity-90 shadow-lg`
                          : 'bg-gray-600 cursor-not-allowed'
                      } font-bold text-lg px-6 py-3 transition-all`}
                    >
                      <Coins className="w-5 h-5 mr-2" />
                      {item.cost}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">升级效果</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-300">
                <span className="text-purple-400">• </span>
                升级后立即生效
              </div>
              <div className="text-gray-300">
                <span className="text-purple-400">• </span>
                永久增强能力
              </div>
              <div className="text-gray-300">
                <span className="text-purple-400">• </span>
                可多次购买
              </div>
              <div className="text-gray-300">
                <span className="text-purple-400">• </span>
                效果可叠加
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm">
            按 B 键关闭商店
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}