import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Zap, Heart, TrendingUp, Target, Sparkles, Shield, CircleDot, Coins, Crosshair, Flame, Divide, Layers, Palette, RotateCcw, Star, Activity, ArrowUpCircle } from 'lucide-react';

export default function Shop({ coins, upgrades, hasHomingBullets, hasPiercingShots, hasExplosiveShots, weaponType, playerColor, bulletColor, onPurchase, onClose }) {
  const [lastPurchased, setLastPurchased] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  
  const handlePurchase = (id, cost) => {
    const success = onPurchase(id, cost);
    if (success) {
      setLastPurchased(id);
      setTimeout(() => setLastPurchased(null), 1000);
    }
  };

  const activeSkills = [
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
    },
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
    }
  ];

  const passiveSkills = [
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
      id: 'critChance',
      name: '暴击几率',
      icon: Star,
      description: '每级+10%暴击几率',
      level: upgrades.critChance,
      cost: (upgrades.critChance + 1) * 150,
      color: 'from-yellow-500 to-amber-500',
      stats: `${upgrades.critChance * 10}% 暴击`,
      maxLevel: 5
    },
    {
      id: 'lifeSteal',
      name: '生命偷取',
      icon: Heart,
      description: '每级+5%生命偷取',
      level: upgrades.lifeSteal,
      cost: (upgrades.lifeSteal + 1) * 200,
      color: 'from-red-500 to-pink-500',
      stats: `${upgrades.lifeSteal * 5}% 偷取`,
      maxLevel: 5
    },
    {
      id: 'armor',
      name: '护甲',
      icon: Shield,
      description: '每级减少10%受到的伤害',
      level: upgrades.armor,
      cost: (upgrades.armor + 1) * 180,
      color: 'from-gray-500 to-slate-500',
      stats: `-${upgrades.armor * 10}% 伤害`,
      maxLevel: 5
    },
    {
      id: 'dodgeChance',
      name: '闪避几率',
      icon: ArrowUpCircle,
      description: '每级+8%闪避几率',
      level: upgrades.dodgeChance,
      cost: (upgrades.dodgeChance + 1) * 220,
      color: 'from-blue-500 to-cyan-500',
      stats: `${upgrades.dodgeChance * 8}% 闪避`,
      maxLevel: 5
    }
  ];

  const specialItems = [
    !hasHomingBullets && {
      id: 'homingBullets',
      name: '追踪炮弹',
      icon: Crosshair,
      description: '子弹自动追踪敌人',
      level: 0,
      cost: 500,
      color: 'from-purple-500 to-pink-500',
      stats: '自动追踪敌人'
    },
    !hasPiercingShots && {
      id: 'piercingShots',
      name: '穿透射击',
      icon: Divide,
      description: '子弹穿透多个敌人',
      level: 0,
      cost: 600,
      color: 'from-cyan-500 to-blue-500',
      stats: '穿透所有敌人'
    },
    !hasExplosiveShots && {
      id: 'explosiveShots',
      name: '爆炸弹药',
      icon: Flame,
      description: '子弹爆炸造成范围伤害',
      level: 0,
      cost: 700,
      color: 'from-orange-500 to-red-500',
      stats: '爆炸范围伤害'
    },
    weaponType === 'normal' && {
      id: 'weaponSpread',
      name: '散弹枪',
      icon: Layers,
      description: '一次发射5发子弹',
      level: 0,
      cost: 800,
      color: 'from-yellow-500 to-orange-500',
      stats: '散弹射击模式'
    },
    weaponType === 'normal' && {
      id: 'weaponLaser',
      name: '激光枪',
      icon: Activity,
      description: '连续激光伤害',
      level: 0,
      cost: 900,
      color: 'from-red-500 to-pink-500',
      stats: '激光射击模式'
    }
  ].filter(Boolean);

  const passiveItems = [
    {
      id: 'critChance',
      name: '暴击几率',
      icon: Star,
      description: '每级+10%暴击几率',
      level: upgrades.critChance,
      cost: (upgrades.critChance + 1) * 150,
      color: 'from-yellow-500 to-amber-500',
      stats: `${upgrades.critChance * 10}% 暴击`,
      maxLevel: 5
    },
    {
      id: 'lifeSteal',
      name: '生命偷取',
      icon: Heart,
      description: '每级+5%生命偷取',
      level: upgrades.lifeSteal,
      cost: (upgrades.lifeSteal + 1) * 200,
      color: 'from-red-500 to-pink-500',
      stats: `${upgrades.lifeSteal * 5}% 偷取`,
      maxLevel: 5
    },
    {
      id: 'armor',
      name: '护甲',
      icon: Shield,
      description: '每级减少10%受到的伤害',
      level: upgrades.armor,
      cost: (upgrades.armor + 1) * 180,
      color: 'from-gray-500 to-slate-500',
      stats: `-${upgrades.armor * 10}% 伤害`,
      maxLevel: 5
    },
    {
      id: 'dodgeChance',
      name: '闪避几率',
      icon: ArrowUpCircle,
      description: '每级+8%闪避几率',
      level: upgrades.dodgeChance,
      cost: (upgrades.dodgeChance + 1) * 220,
      color: 'from-blue-500 to-cyan-500',
      stats: `${upgrades.dodgeChance * 8}% 闪避`,
      maxLevel: 5
    }
  ];

  const cosmeticItems = [
    {
      id: 'color_player_blue',
      name: '蓝色外观',
      icon: Palette,
      description: '改变角色颜色为蓝色',
      cost: 100,
      color: 'from-blue-500 to-blue-600',
      purchased: playerColor === 'blue'
    },
    {
      id: 'color_player_red',
      name: '红色外观',
      icon: Palette,
      description: '改变角色颜色为红色',
      cost: 100,
      color: 'from-red-500 to-red-600',
      purchased: playerColor === 'red'
    },
    {
      id: 'color_player_purple',
      name: '紫色外观',
      icon: Palette,
      description: '改变角色颜色为紫色',
      cost: 100,
      color: 'from-purple-500 to-purple-600',
      purchased: playerColor === 'purple'
    },
    {
      id: 'color_bullet_red',
      name: '红色子弹',
      icon: Palette,
      description: '改变子弹颜色为红色',
      cost: 150,
      color: 'from-red-400 to-red-500',
      purchased: bulletColor === 'red'
    },
    {
      id: 'color_bullet_blue',
      name: '蓝色子弹',
      icon: Palette,
      description: '改变子弹颜色为蓝色',
      cost: 150,
      color: 'from-blue-400 to-blue-500',
      purchased: bulletColor === 'blue'
    },
    {
      id: 'color_bullet_green',
      name: '绿色子弹',
      icon: Palette,
      description: '改变子弹颜色为绿色',
      cost: 150,
      color: 'from-green-400 to-green-500',
      purchased: bulletColor === 'green'
    }
  ];

  const totalUpgradeCost = Object.values(upgrades).reduce((sum, val) => sum + val * 50, 0);
  const resetItem = {
    id: 'reset',
    name: '重置升级',
    icon: RotateCcw,
    description: '重置所有升级，返回50%金币',
    cost: 500,
    refund: Math.floor(totalUpgradeCost * 0.5),
    color: 'from-gray-500 to-gray-600'
  };

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
        <div className="flex justify-between items-center mb-6">
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
          <Button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-6 text-lg font-bold ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-slate-700/50 text-white/60'
            }`}
          >
            <Zap className="w-5 h-5 mr-2" />
            主动技能
          </Button>
          <Button
            onClick={() => setActiveTab('passive')}
            className={`flex-1 py-6 text-lg font-bold ${
              activeTab === 'passive'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                : 'bg-slate-700/50 text-white/60'
            }`}
          >
            <Shield className="w-5 h-5 mr-2" />
            被动技能
          </Button>
        </div>

        {/* Invincibility Notice */}
        <div className="mb-6 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl p-4 text-center">
          <p className="text-yellow-400 font-bold text-lg">
            🛡️ 商店无敌状态 - 不会受到任何伤害
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {activeTab === 'active' && (
            <>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-4">
                主动技能升级
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activeSkills.map((item) => {
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
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
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
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <span className="text-gray-400 text-sm">等级 </span>
                            <span className="text-2xl font-bold">{item.level}</span>
                          </div>
                          <Button
                            onClick={() => handlePurchase(item.id, item.cost)}
                            disabled={!canAfford}
                            className={`${
                              canAfford
                                ? `bg-gradient-to-r ${item.color} hover:opacity-90`
                                : 'bg-gray-600 cursor-not-allowed'
                            } font-bold px-6 py-3`}
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
            </>
          )}

          {activeTab === 'passive' && (
            <>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                被动技能升级
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {passiveSkills.map((item) => {
                  const Icon = item.icon;
                  const canAfford = coins >= item.cost;
                  const maxed = item.maxLevel && item.level >= item.maxLevel;
                  const isPurchased = lastPurchased === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: canAfford && !maxed ? 1.02 : 1 }}
                      className={`relative bg-gradient-to-br ${item.color} p-1 rounded-xl ${
                        (!canAfford || maxed) && 'opacity-50'
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
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
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
                              animate={{ width: item.maxLevel ? `${(item.level / item.maxLevel) * 100}%` : `${Math.min(item.level * 10, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <span className="text-gray-400 text-sm">等级 </span>
                            <span className="text-2xl font-bold">{item.level}{item.maxLevel ? `/${item.maxLevel}` : ''}</span>
                          </div>
                          <Button
                            onClick={() => handlePurchase(item.id, item.cost)}
                            disabled={!canAfford || maxed}
                            className={`${
                              canAfford && !maxed
                                ? `bg-gradient-to-r ${item.color} hover:opacity-90`
                                : 'bg-gray-600 cursor-not-allowed'
                            } font-bold px-6 py-3`}
                          >
                            {maxed ? '已满级' : (
                              <>
                                <Coins className="w-5 h-5 mr-2" />
                                {item.cost}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

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

          {cosmeticItems.length > 0 && (
                <div className="mt-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
                  外观定制
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {cosmeticItems.map((item) => {
                    const Icon = item.icon;
                    const canAfford = coins >= item.cost && !item.purchased;

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: canAfford ? 1.05 : 1 }}
                        className={`relative bg-gradient-to-br ${item.color} p-1 rounded-lg ${
                          item.purchased ? 'ring-2 ring-green-400' : !canAfford && 'opacity-50'
                        }`}
                      >
                        <div className="bg-slate-900 rounded-md p-3 text-center">
                          <Icon className="w-8 h-8 text-white mx-auto mb-2" />
                          <p className="text-white text-xs font-semibold mb-2">{item.name}</p>
                          <Button
                            onClick={() => handlePurchase(item.id, item.cost)}
                            disabled={!canAfford}
                            size="sm"
                            className={`${
                              item.purchased
                                ? 'bg-green-600'
                                : canAfford
                                ? `bg-gradient-to-r ${item.color}`
                                : 'bg-gray-600'
                            } w-full text-xs`}
                          >
                            {item.purchased ? '已购买' : `${item.cost} 币`}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                </div>
                )}

                <div className="mt-6">
                <motion.div
                whileHover={{ scale: coins >= resetItem.cost ? 1.02 : 1 }}
                className={`bg-gradient-to-br ${resetItem.color} p-1 rounded-xl ${
                  coins < resetItem.cost && 'opacity-50'
                }`}
                >
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-10 h-10 text-gray-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{resetItem.name}</h3>
                        <p className="text-gray-400 text-sm">{resetItem.description}</p>
                        <p className="text-green-400 text-sm mt-1">返还: {resetItem.refund} 金币</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePurchase(resetItem.id, resetItem.cost)}
                      disabled={coins < resetItem.cost}
                      className={`${
                        coins >= resetItem.cost
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:opacity-90'
                          : 'bg-gray-700 cursor-not-allowed'
                      } font-bold px-6 py-3`}
                    >
                      <Coins className="w-5 h-5 mr-2" />
                      {resetItem.cost}
                    </Button>
                  </div>
                </div>
                </motion.div>
                </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}