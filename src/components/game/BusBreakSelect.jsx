import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const BUSBREAK_BOSSES = [
  {
    id: 'zhongdalin',
    name: '中大林',
    color: '#4ade80',
    health: 3000,
    reward: '🗿 中大林图腾'
  },
  {
    id: 'xiaowang',
    name: '小黄龙',
    color: '#f59e0b',
    health: 2500,
    reward: '⚡ 电巢'
  },
  {
    id: 'longhaixing',
    name: '海星',
    color: '#06b6d4',
    health: 2800,
    reward: '📦 升级模板'
  },
  {
    id: 'qigong',
    name: '气功大师',
    color: '#8b5cf6',
    health: 3500,
    reward: '📦 升级模板'
  },
  {
    id: 'guangzhi',
    name: '广智',
    color: '#ff4500',
    health: 5000,
    reward: '🔥 赤潮'
  }
];

export default function BusBreakSelect({ onSelectBoss, onCancel, defeatedBosses }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-b from-purple-900 to-slate-900 rounded-2xl p-4 md:p-8 max-w-5xl w-full max-h-[90vh] border-4 border-purple-500/50 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4 md:mb-6 flex-shrink-0">
          <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            ⚔️ Boss试炼 ⚔️
          </h2>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <p className="text-center text-purple-300 mb-4 md:mb-8 text-sm md:text-xl flex-shrink-0">
          挑战特殊Boss，解锁强力武器和升级模板！<br />
          击败每个Boss解锁对应奖励，每4个Boss额外获得1个升级模板
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 md:mb-6 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {BUSBREAK_BOSSES.map((boss) => {
            const isDefeated = defeatedBosses?.[boss.id] || false;
            
            return (
              <motion.button
                key={boss.id}
                onClick={() => !isDefeated && onSelectBoss(boss.id)}
                disabled={isDefeated}
                whileHover={!isDefeated ? { scale: 1.05 } : {}}
                whileTap={!isDefeated ? { scale: 0.95 } : {}}
                className={`relative p-1 rounded-xl ${
                  isDefeated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${boss.color}40, ${boss.color}80)`
                }}
              >
                <div className="bg-slate-900/80 rounded-lg p-6">
                  <div 
                    className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl font-bold"
                    style={{ backgroundColor: boss.color + '40', color: boss.color }}
                  >
                    {boss.name[0]}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{boss.name}</h3>
                  <div className="text-sm space-y-1">
                    <p className="text-red-400">❤️ {boss.health} HP</p>
                    <p className="text-yellow-400">🎁 {boss.reward}</p>
                  </div>
                  
                  {isDefeated && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-green-500/90 rounded-lg px-4 py-2">
                        <p className="text-white font-bold text-xl">✓ 已击败</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="text-center text-purple-300/60 text-sm">
          提示: Boss每日可重复挑战，但只有首次击败才能获得奖励
        </div>
      </motion.div>
    </motion.div>
  );
}