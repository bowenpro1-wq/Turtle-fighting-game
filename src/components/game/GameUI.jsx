import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Coins } from 'lucide-react';

export default function GameUI({
  health,
  maxHealth,
  score,
  coins,
  shootCooldown,
  healCooldown,
  flyCooldown,
  largeAttackCooldown,
  allOutAttackCooldown,
  isFlying,
  isAllOutAttack,
  bossHealth,
  bossMaxHealth,
  bossName,
  defeatedBosses,
  tankKills,
  hasCannonUpgrade,
  hasHomingBullets
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        <div className="space-y-3 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" fill="#ef4444" />
            <div className="relative">
              <div className="w-48 h-8 bg-gray-800 rounded-lg overflow-hidden border-2 border-red-900">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  initial={false}
                  animate={{ width: `${(health / maxHealth) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow-lg">
                {Math.round(health)} / {maxHealth}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-yellow-400">
            <span className="text-xl font-bold">分数:</span>
            <span className="text-2xl font-bold">{score.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 text-xl font-bold">{coins}</span>
          </div>

          <div className="text-orange-400 text-sm font-semibold">
            BOSS: {defeatedBosses} / 20
          </div>

          {!hasCannonUpgrade && (
            <div className="text-cyan-400 text-sm font-semibold">
              坦克: {tankKills} / 5 🎯
            </div>
          )}

          {hasCannonUpgrade && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-orange-500/80 to-red-500/80 rounded-full text-white text-xs font-bold"
            >
              🎯 大炮已解锁
            </motion.div>
          )}

          {hasHomingBullets && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-purple-500/80 to-pink-500/80 rounded-full text-white text-xs font-bold"
            >
              🎯 追踪弹
            </motion.div>
          )}
          </div>

        {isFlying && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-full backdrop-blur-sm border-2 border-cyan-300/50"
          >
            <span className="text-white font-bold text-lg">无敌飞行中!</span>
          </motion.div>
        )}
      </div>

      {bossHealth !== null && bossMaxHealth > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-1/2 -translate-x-1/2"
        >
          <div className="text-center mb-2">
            <span className="text-orange-400 text-2xl font-bold drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">
              BOSS: {bossName}
            </span>
          </div>
          <div className="relative w-96 h-10 bg-black/60 rounded-lg overflow-hidden backdrop-blur-sm border-2 border-orange-500/50">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-600 via-red-500 to-orange-600"
              initial={false}
              animate={{ width: `${(bossHealth / bossMaxHealth) * 100}%` }}
              transition={{ type: "spring", stiffness: 200 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-lg">
              {Math.round(bossHealth)} / {bossMaxHealth}
            </span>
          </div>
        </motion.div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <CooldownButton
          label="K - 射击"
          cooldown={shootCooldown}
          color="red"
        />
        <CooldownButton
          label="H - 恢复"
          cooldown={healCooldown}
          color="green"
        />
        <CooldownButton
          label="O - 飞行"
          cooldown={flyCooldown}
          color="blue"
          active={isFlying}
        />
        <CooldownButton
          label="L - 大招"
          cooldown={largeAttackCooldown}
          color="orange"
          large
        />
        <CooldownButton
          label="P - 终极"
          cooldown={allOutAttackCooldown}
          color="purple"
          active={isAllOutAttack}
          large
        />
      </div>

      <div className="absolute bottom-6 right-6 text-white/70 text-sm bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm">
        <div>按 B 打开商店</div>
      </div>
    </div>
  );
}

function CooldownButton({ label, cooldown, color, active, large }) {
  const isReady = cooldown <= 0;
  
  const colorClasses = {
    red: 'from-red-600 to-red-500 border-red-400',
    green: 'from-green-600 to-green-500 border-green-400',
    blue: 'from-blue-600 to-blue-500 border-blue-400',
    orange: 'from-orange-600 to-orange-500 border-orange-400',
    purple: 'from-purple-600 to-purple-500 border-purple-400'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 ${
          isReady ? colorClasses[color] : 'border-gray-600'
        } ${active ? 'ring-2 ring-white' : ''}`}
      >
        <div className={`absolute inset-0 ${
          isReady 
            ? `bg-gradient-to-b ${colorClasses[color]}`
            : 'bg-gray-800'
        }`} />

        {!isReady && (
          <div 
            className="absolute inset-0 bg-black/70"
            style={{
              clipPath: `polygon(0 ${cooldown * 100}%, 100% ${cooldown * 100}%, 100% 100%, 0 100%)`
            }}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs text-center px-1">{label}</span>
        </div>
      </div>
    </div>
  );
}