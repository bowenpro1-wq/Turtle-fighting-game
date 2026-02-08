import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';

const AVAILABLE_BOSSES = [
  { id: 'zhongdalin', name: '中大林', color: '#4ade80', icon: '🗿' },
  { id: 'xiaowang', name: '小黄龙', color: '#fbbf24', icon: '🐉' },
  { id: 'longhaixing', name: '海星', color: '#22d3ee', icon: '⭐' },
  { id: 'qigong', name: '气功大师', color: '#a855f7', icon: '☯️' },
  { id: 'guangzhi', name: '广智', color: '#ff4500', icon: '🔥' }
];

export default function MultiBossSelect({ onConfirm, onCancel }) {
  const [selectedBosses, setSelectedBosses] = useState(['zhongdalin']);
  const [bossCount, setBossCount] = useState(1);

  const toggleBoss = (bossId) => {
    if (selectedBosses.includes(bossId)) {
      if (selectedBosses.length > 1) {
        setSelectedBosses(prev => prev.filter(id => id !== bossId));
        setBossCount(prev => prev - 1);
      }
    } else {
      if (selectedBosses.length < 5) {
        setSelectedBosses(prev => [...prev, bossId]);
        setBossCount(prev => prev + 1);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 max-w-2xl w-full border-4 border-purple-500 relative"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 text-center">
          🔥 多Boss挑战
        </h2>
        <p className="text-white/80 text-center mb-6">
          选择要同时挑战的Boss（最多5个）
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {AVAILABLE_BOSSES.map((boss) => {
            const isSelected = selectedBosses.includes(boss.id);
            return (
              <motion.button
                key={boss.id}
                onClick={() => toggleBoss(boss.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl border-4 transition-all ${
                  isSelected
                    ? 'bg-white/20 border-yellow-400 shadow-lg shadow-yellow-500/50'
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="text-5xl mb-2">{boss.icon}</div>
                <div className="text-white font-bold text-sm">{boss.name}</div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 text-yellow-400 text-xs font-bold"
                  >
                    ✓ 已选择
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <div className="text-white text-center mb-3">
            <span className="text-yellow-400 font-bold text-2xl">{bossCount}</span>
            <span className="text-white/80 ml-2">个Boss同时战斗</span>
          </div>
          <div className="text-white/60 text-xs text-center">
            难度系数: <span className="text-red-400 font-bold">×{bossCount}</span>
          </div>
        </div>

        <Button
          onClick={() => onConfirm(selectedBosses)}
          disabled={selectedBosses.length === 0}
          className="w-full py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xl font-bold"
        >
          开始挑战 {bossCount} 个Boss！
        </Button>
      </motion.div>
    </motion.div>
  );
}