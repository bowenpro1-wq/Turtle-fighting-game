import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Wind } from 'lucide-react';

export default function GameUI({
  health,
  maxHealth,
  score,
  shootCooldown,
  healCooldown,
  flyCooldown,
  isFlying,
  bossHealth,
  bossMaxHealth,
  bossName,
  defeatedBosses
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Health and Score */}
        <div className="space-y-3">
          {/* Health bar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" fill="#ef4444" />
            </div>
            <div className="relative">
              <div className="w-48 h-6 bg-black/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                  initial={false}
                  animate={{ width: `${(health / maxHealth) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow">
                {health} / {maxHealth}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="text-2xl">⭐</span>
            <span className="text-2xl font-bold">{score.toLocaleString()}</span>
          </div>

          {/* Bosses defeated */}
          <div className="flex items-center gap-2 text-orange-400">
            <span className="text-lg">👑</span>
            <span className="text-lg font-semibold">{defeatedBosses} / 20 BOSS</span>
          </div>
        </div>

        {/* Flying indicator */}
        {isFlying && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-full backdrop-blur-sm border border-cyan-300/50"
          >
            <div className="flex items-center gap-2 text-white font-bold">
              <Wind className="w-5 h-5 animate-pulse" />
              <span>无敌飞行中!</span>
              <span className="text-xl">✨</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Boss health bar */}
      {bossHealth !== null && bossMaxHealth > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-1/2 -translate-x-1/2"
        >
          <div className="text-center mb-2">
            <span className="text-orange-400 text-xl font-bold drop-shadow-lg">
              👑 {bossName}
            </span>
          </div>
          <div className="relative w-80 h-8 bg-black/60 rounded-full overflow-hidden backdrop-blur-sm border-2 border-orange-500/50">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 rounded-full"
              initial={false}
              animate={{ width: `${(bossHealth / bossMaxHealth) * 100}%` }}
              transition={{ type: "spring", stiffness: 200 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow">
              {bossHealth} / {bossMaxHealth}
            </span>
          </div>
        </motion.div>
      )}

      {/* Ability cooldowns */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <CooldownButton
          icon="K"
          label="射击"
          cooldown={shootCooldown}
          color="red"
          emoji="💥"
        />
        <CooldownButton
          icon="H"
          label="恢复"
          cooldown={healCooldown}
          color="green"
          emoji="💚"
        />
        <CooldownButton
          icon="O"
          label="飞行"
          cooldown={flyCooldown}
          color="blue"
          emoji="✨"
          active={isFlying}
        />
      </div>

      {/* Controls reminder */}
      <div className="absolute bottom-6 right-6 text-white/50 text-sm">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs">W A S D</kbd>
          <span>移动</span>
        </div>
      </div>
    </div>
  );
}

function CooldownButton({ icon, label, cooldown, color, emoji, active }) {
  const isReady = cooldown <= 0;
  
  const colorClasses = {
    red: 'from-red-600 to-red-500 border-red-400',
    green: 'from-green-600 to-green-500 border-green-400',
    blue: 'from-blue-600 to-blue-500 border-blue-400'
  };

  const glowClasses = {
    red: 'shadow-red-500/50',
    green: 'shadow-green-500/50',
    blue: 'shadow-blue-500/50'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 ${
          isReady ? colorClasses[color] : 'border-gray-600'
        } ${isReady ? `shadow-lg ${glowClasses[color]}` : ''} ${
          active ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
        }`}
        animate={isReady ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: isReady ? Infinity : 0 }}
      >
        {/* Background */}
        <div className={`absolute inset-0 ${
          isReady 
            ? `bg-gradient-to-b ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`
            : 'bg-gray-800'
        }`} />

        {/* Cooldown overlay */}
        {!isReady && (
          <div 
            className="absolute inset-0 bg-black/70"
            style={{
              clipPath: `polygon(0 ${cooldown * 100}%, 100% ${cooldown * 100}%, 100% 100%, 0 100%)`
            }}
          />
        )}

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white drop-shadow-lg">
            {isReady ? emoji : icon}
          </span>
        </div>

        {/* Ready pulse */}
        {isReady && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-t ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}
            animate={{ opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
      <span className={`text-xs font-medium ${isReady ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}