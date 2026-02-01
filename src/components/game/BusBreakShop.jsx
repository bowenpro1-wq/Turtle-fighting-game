import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Zap, Heart, Shield, Swords } from 'lucide-react';

export default function BusBreakShop({ coins, onPurchase, onClose }) {
  const items = [
    {
      id: 'health_potion',
      name: '生命药水',
      icon: Heart,
      cost: 200,
      description: '恢复50%生命值',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'attack_boost',
      name: '攻击强化',
      icon: Swords,
      cost: 300,
      description: '提升30%伤害，持续整场战斗',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'defense_boost',
      name: '防御强化',
      icon: Shield,
      cost: 300,
      description: '减少20%受到的伤害',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'energy_drink',
      name: '能量饮料',
      icon: Zap,
      cost: 250,
      description: '减少50%技能冷却时间',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 max-w-3xl w-full border-2 border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Boss修炼商店
            </h2>
            <p className="text-yellow-400 text-lg md:text-xl mt-2">金币: {coins} 💰</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 h-10 w-10 md:h-12 md:w-12"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            const canAfford = coins >= item.cost;

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-br ${item.color} p-1 rounded-xl`}
              >
                <div className="bg-slate-900 rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white truncate">{item.name}</h3>
                      <p className="text-xs md:text-sm text-gray-300 mt-1">{item.description}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => onPurchase(item.id, item.cost)}
                    disabled={!canAfford}
                    className={`w-full ${
                      canAfford
                        ? `bg-gradient-to-r ${item.color} hover:opacity-90`
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    购买 ({item.cost}💰)
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
          <div className="text-sm text-gray-300">
            <span className="text-purple-400">💡 提示：</span>
            购买增益道具可以让Boss战斗更轻松！
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}