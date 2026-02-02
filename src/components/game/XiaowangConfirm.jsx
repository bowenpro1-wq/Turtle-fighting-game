import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, User } from 'lucide-react';

export default function XiaowangConfirm({ onSelectTrue, onSelectClone, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-amber-900 to-orange-900 p-8 rounded-2xl border-4 border-amber-500 max-w-md w-full mx-4"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🐉</div>
          <h2 className="text-3xl font-bold text-amber-100 mb-2">小黄龙挑战</h2>
          <p className="text-amber-200/80 text-lg">确定要开始战斗吗？</p>
          <p className="text-red-400 text-sm mt-2 font-bold">⚠️ 此boss唯Ethan本尊可以挑战</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onSelectTrue}
            className="w-full py-6 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 border-2 border-amber-400"
          >
            <Flame className="w-5 h-5 mr-2" />
            挑战真身
          </Button>

          <Button
            onClick={onSelectClone}
            className="w-full py-6 text-lg bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 border-2 border-amber-600"
          >
            <User className="w-5 h-5 mr-2" />
            挑战分身
          </Button>

          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full py-4 border-2 border-amber-500 text-amber-100 hover:bg-amber-800/50"
          >
            取消
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}