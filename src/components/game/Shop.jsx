import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Zap, Heart, TrendingUp, Target, Shield } from 'lucide-react';

export default function Shop({ coins, upgrades, onPurchase, onClose }) {
  const items = [
    {
      id: 'damage',
      name: '伤害提升',
      icon: Target,
      description: '增加子弹伤害',
      level: upgrades.damage,
      cost: upgrades.damage * 50,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'fireRate',
      name: '射速提升',
      icon: Zap,
      description: '提高射击速度',
      level: upgrades.fireRate,
      cost: upgrades.fireRate * 75,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'speed',
      name: '移动速度',
      icon: TrendingUp,
      description: '提高移动速度',
      level: upgrades.speed,
      cost: upgrades.speed * 60,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'maxHealth',
      name: '最大生命',
      icon: Heart,
      description: '增加最大生命值',
      level: upgrades.maxHealth,
      cost: upgrades.maxHealth * 100,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'structureArmor',
      name: '基地护甲',
      icon: Shield,
      description: '减少基地受到的伤害',
      level: upgrades.structureArmor,
      cost: upgrades.structureArmor * 120,
      color: 'from-purple-500 to-pink-500'
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            const canAfford = coins >= item.cost;
            
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: canAfford ? 1.02 : 1 }}
                className={`bg-gradient-to-br ${item.color} p-1 rounded-xl ${
                  !canAfford && 'opacity-50'
                }`}
              >
                <div className="bg-slate-900 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{item.name}</h3>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-white">
                      <span className="text-gray-400 text-sm">等级: </span>
                      <span className="text-2xl font-bold">{item.level}</span>
                    </div>
                    <Button
                      onClick={() => onPurchase(item.id, item.cost)}
                      disabled={!canAfford}
                      className={`${
                        canAfford
                          ? `bg-gradient-to-r ${item.color} hover:opacity-90`
                          : 'bg-gray-600 cursor-not-allowed'
                      } font-bold text-lg px-6 py-3`}
                    >
                      {item.cost} 金币
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          按 B 键关闭商店
        </div>
      </motion.div>
    </motion.div>
  );
}