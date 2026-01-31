import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Waves, Sparkles, Skull } from 'lucide-react';

const BOSSES = [
  {
    id: 'zhongdalin',
    name: '中大林广志',
    icon: Sparkles,
    color: 'from-green-500 to-emerald-600',
    health: 3000,
    difficulty: '⭐⭐⭐',
    description: '石头与意志的化身，拥有强大的冲撞和藤蔓攻击'
  },
  {
    id: 'xiaowang',
    name: '小王',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    health: 2500,
    difficulty: '⭐⭐',
    description: '速度极快的战士，擅长突进攻击'
  },
  {
    id: 'longhaixing',
    name: '龙海星',
    icon: Waves,
    color: 'from-cyan-500 to-blue-600',
    health: 2800,
    difficulty: '⭐⭐⭐',
    description: '神秘的海洋守护者，能够瞬移和释放水流'
  },
  {
    id: 'qigong',
    name: '启功大师',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-600',
    health: 3500,
    difficulty: '⭐⭐⭐⭐',
    description: '武学宗师，使用螺旋能量攻击'
  },
  {
    id: 'guangzhi',
    name: '广智',
    icon: Flame,
    color: 'from-red-500 to-orange-500',
    health: 5000,
    difficulty: '⭐⭐⭐⭐⭐',
    description: '最强BOSS，掌控火焰的力量'
  }
];

export default function BusBreakBossSelect({ onSelect, onClose, defeatedBosses }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border-4 border-purple-500/50 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            ⚔️ Boss试炼模式 ⚔️
          </h2>
          <p className="text-gray-300 text-lg">选择你要挑战的Boss</p>
          <p className="text-orange-400 text-sm mt-2">
            击败4个Boss随机获得武器 • 击败全部5个Boss获得升级模板
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {BOSSES.map((boss, index) => {
            const Icon = boss.icon;
            const isDefeated = defeatedBosses[boss.id];
            
            return (
              <motion.div
                key={boss.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl ${
                  isDefeated ? 'opacity-60' : ''
                }`}
              >
                <div className={`bg-gradient-to-br ${boss.color} p-1`}>
                  <div className="bg-slate-900 rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${boss.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1">{boss.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-400">{boss.difficulty}</span>
                          <span className="text-red-400 font-bold">HP: {boss.health}</span>
                        </div>
                      </div>
                      {isDefeated && (
                        <div className="bg-green-500/20 border-2 border-green-500 rounded-full px-3 py-1 text-green-400 text-xs font-bold">
                          已击败
                        </div>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{boss.description}</p>

                    <Button
                      onClick={() => onSelect(boss.id)}
                      disabled={isDefeated}
                      className={`w-full py-6 text-lg font-bold ${
                        isDefeated
                          ? 'bg-gray-600 cursor-not-allowed'
                          : `bg-gradient-to-r ${boss.color} hover:opacity-90`
                      }`}
                    >
                      {isDefeated ? (
                        <>
                          <Skull className="w-5 h-5 mr-2" />
                          今日已击败
                        </>
                      ) : (
                        <>挑战 {boss.name}</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full py-6 text-lg font-bold border-2 border-gray-600 hover:bg-gray-800"
        >
          返回主菜单
        </Button>
      </motion.div>
    </motion.div>
  );
}