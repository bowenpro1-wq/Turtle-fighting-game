import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';

const AVAILABLE_BOSSES = [
  { id: 'zhongdalin', name: '中大林', color: '#4ade80', emoji: '🗿' },
  { id: 'xiaowang', name: '小黄龙', color: '#f59e0b', emoji: '🐲' },
  { id: 'longhaixing', name: '海星', color: '#06b6d4', emoji: '⭐' },
  { id: 'qigong', name: '气功大师', color: '#8b5cf6', emoji: '🥋' },
  { id: 'guangzhi', name: '广智', color: '#ff4500', emoji: '🔥' }
];

export default function MultiBossSelect({ onStart, onCancel }) {
  const [selectedBosses, setSelectedBosses] = useState([]);
  const [bossCount, setBossCount] = useState(2);

  const toggleBoss = (bossId) => {
    setSelectedBosses(prev => 
      prev.includes(bossId) 
        ? prev.filter(id => id !== bossId)
        : [...prev, bossId]
    );
  };

  const handleStart = () => {
    if (selectedBosses.length === 0) {
      alert('请至少选择一个Boss！');
      return;
    }
    onStart(selectedBosses, bossCount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 max-w-2xl w-full border-4 border-purple-500"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">🔥 多Boss挑战</h2>
          <button onClick={onCancel} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-white/80 mb-6">选择你要挑战的Boss（可以多选）</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {AVAILABLE_BOSSES.map(boss => (
            <motion.button
              key={boss.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleBoss(boss.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedBosses.includes(boss.id)
                  ? 'border-yellow-400 bg-yellow-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-4xl mb-2">{boss.emoji}</div>
              <div className="text-white font-bold text-sm">{boss.name}</div>
              {selectedBosses.includes(boss.id) && (
                <div className="text-yellow-400 text-xs mt-1">✓ 已选</div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <p className="text-white/80 mb-3">同时出现的Boss数量</p>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setBossCount(Math.max(1, bossCount - 1))}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="text-3xl font-bold text-white flex-1 text-center">
              {bossCount}
            </div>
            <Button
              onClick={() => setBossCount(Math.min(selectedBosses.length || 5, bossCount + 1))}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleStart}
            disabled={selectedBosses.length === 0}
            className="flex-1 py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-lg font-bold"
          >
            开始挑战！
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="px-6"
          >
            取消
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}