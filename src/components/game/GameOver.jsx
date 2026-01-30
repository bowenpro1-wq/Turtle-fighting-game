import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Skull } from 'lucide-react';

export default function GameOver({ victory, score, defeatedBosses, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center z-50"
    >
      {/* Background */}
      <div className={`absolute inset-0 ${
        victory 
          ? 'bg-gradient-to-b from-yellow-900/90 via-orange-900/90 to-black/95'
          : 'bg-gradient-to-b from-red-900/90 via-gray-900/90 to-black/95'
      }`} />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${victory ? 'text-yellow-400' : 'text-red-500'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: Math.random() * 20 + 10
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {victory ? '⭐' : '💀'}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative text-center px-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className={`w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center ${
            victory 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50'
              : 'bg-gradient-to-br from-red-500 to-gray-700 shadow-lg shadow-red-500/50'
          }`}
        >
          {victory ? (
            <Trophy className="w-16 h-16 text-white" />
          ) : (
            <Skull className="w-16 h-16 text-white" />
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-5xl md:text-7xl font-bold mb-4 ${
            victory ? 'text-yellow-400' : 'text-red-500'
          }`}
          style={{
            textShadow: victory 
              ? '0 0 30px rgba(250, 204, 21, 0.5)'
              : '0 0 30px rgba(239, 68, 68, 0.5)'
          }}
        >
          {victory ? '🎉 胜利！' : '💀 游戏结束'}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-white/80 mb-8"
        >
          {victory 
            ? '恭喜你击败了所有BOSS！你是真正的海洋霸主！'
            : '别灰心，再试一次吧！'
          }
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-8 mb-10"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-1">
              {score.toLocaleString()}
            </div>
            <div className="text-white/60">总分数</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-1">
              {defeatedBosses}
            </div>
            <div className="text-white/60">击败BOSS</div>
          </div>
        </motion.div>

        {/* Restart button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onRestart}
            size="lg"
            className={`px-10 py-6 text-xl font-bold rounded-full ${
              victory
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-lg shadow-yellow-500/30'
                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 shadow-lg shadow-red-500/30'
            }`}
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            再来一次
          </Button>
        </motion.div>

        {/* Tips */}
        {!victory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-white/50 text-sm"
          >
            💡 提示：按 H 恢复生命，按 O 可以飞行躲避攻击！
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}