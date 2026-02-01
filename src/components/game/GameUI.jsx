import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Coins, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  hasCannonUpgrade,
  hasHomingBullets,
  gameMode,
  currentFloor,
  checkpoint,
  towerSpecialFloor,
  selectedWeapon,
  onBoostBoss
}) {
  const [prevBossHealth, setPrevBossHealth] = useState(bossHealth);
  const [healthShake, setHealthShake] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);

  // Boss血量变化动画
  useEffect(() => {
    if (bossHealth !== null && prevBossHealth !== null && bossHealth < prevBossHealth) {
      const damage = prevBossHealth - bossHealth;
      setDamageAmount(Math.round(damage));
      setHealthShake(true);
      setShowDamage(true);
      
      setTimeout(() => setHealthShake(false), 300);
      setTimeout(() => setShowDamage(false), 800);
    }
    setPrevBossHealth(bossHealth);
  }, [bossHealth, prevBossHealth]);
  // 根据武器自定义技能名称
  const getSkillNames = () => {
    if (selectedWeapon === 'chichao') {
      return {
        shoot: 'K-火焰喷射',
        heal: 'H-火焰斩',
        fly: 'O-飞行',
        large: 'L-炎爆',
        allOut: 'P-广志真身'
      };
    } else if (selectedWeapon === 'dianchao') {
      return {
        shoot: 'K-电流四射',
        heal: 'H-治疗',
        fly: 'O-飞行',
        large: 'L-雷暴',
        allOut: 'P-终极清屏'
      };
    } else if (selectedWeapon === 'totem') {
      return {
        shoot: 'K-图腾射击',
        heal: 'H-治疗',
        fly: 'O-飞行',
        large: 'L-召唤军团',
        allOut: 'P-终极清屏'
      };
    } else if (selectedWeapon === 'guigui') {
      return {
        shoot: 'K-光束',
        heal: 'H-治疗',
        fly: 'O-飞行',
        large: 'L-龟圈',
        allOut: 'P-龟文诅咒'
      };
    }
    return {
      shoot: 'K-射击',
      heal: 'H-治疗',
      fly: 'O-飞行',
      large: 'L-大招',
      allOut: 'P-终极清屏'
    };
  };

  const skillNames = getSkillNames();
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

          {gameMode !== 'tower' && (
            <div className="text-orange-400 text-sm font-semibold">
              BOSS: {defeatedBosses} / 20
            </div>
          )}

          {gameMode === 'tower' && (
            <div className="space-y-2">
              <div className="text-green-400 text-2xl font-bold">
                第 {currentFloor} 层 / 100
              </div>
              <div className="text-emerald-300 text-sm">
                存档点: 第 {checkpoint} 层
              </div>
              {towerSpecialFloor && (
                <div className="text-yellow-300 text-sm font-bold bg-yellow-500/20 px-2 py-1 rounded">
                  ⚠️ 特殊关卡: {towerSpecialFloor}
                </div>
              )}
            </div>
          )}

          {!hasCannonUpgrade && defeatedBosses < 5 && (
            <div className="text-cyan-400 text-sm font-semibold">
              大炮解锁: {defeatedBosses} / 5 BOSS 🎯
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
          <div className="text-center mb-2 flex items-center justify-center gap-4">
            <span className="text-orange-400 text-2xl font-bold drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">
              BOSS: {bossName}
            </span>

            {/* Boss强化按钮 */}
            <Button
              onClick={() => onBoostBoss && onBoostBoss()}
              disabled={coins < 500}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              强化Boss (500💰)
            </Button>
          </div>

          <motion.div 
            className="relative w-96 h-10 bg-black/60 rounded-lg overflow-hidden backdrop-blur-sm border-2 border-orange-500/50"
            animate={healthShake ? { 
              x: [-5, 5, -5, 5, 0],
              scale: [1, 1.02, 1, 1.02, 1]
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* 血条背景闪光效果 */}
            <AnimatePresence>
              {healthShake && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-white/30 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* 血条 */}
            <motion.div
              className="h-full bg-gradient-to-r from-orange-600 via-red-500 to-orange-600"
              initial={false}
              animate={{ 
                width: `${(bossHealth / bossMaxHealth) * 100}%`,
                boxShadow: healthShake ? '0 0 20px rgba(255, 0, 0, 0.8)' : 'none'
              }}
              transition={{ type: "spring", stiffness: 200 }}
            />

            {/* 血量文字 */}
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-lg">
              {Math.round(bossHealth)} / {bossMaxHealth}
            </span>

            {/* 伤害数字 */}
            <AnimatePresence>
              {showDamage && (
                <motion.div
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -50, opacity: 0, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <span className="text-red-400 font-bold text-3xl drop-shadow-[0_0_10px_rgba(239,68,68,1)]">
                    -{damageAmount}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <CooldownButton
          label={skillNames.shoot}
          cooldown={shootCooldown}
          color="red"
        />
        <CooldownButton
          label="J - 近战"
          cooldown={0}
          color="cyan"
        />
        <CooldownButton
          label={skillNames.heal}
          cooldown={healCooldown}
          color="green"
        />
        <CooldownButton
          label={skillNames.fly}
          cooldown={flyCooldown}
          color="blue"
          active={isFlying}
        />
        <CooldownButton
          label={skillNames.large}
          cooldown={largeAttackCooldown}
          color="orange"
          large
        />
        <CooldownButton
          label={skillNames.allOut}
          cooldown={allOutAttackCooldown}
          color="purple"
          active={isAllOutAttack}
          large
        />
      </div>

      <div className="absolute bottom-6 right-6 text-white/70 text-sm bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm space-y-1">
        <div>按 B 打开商店</div>
        <div>按 F 打开锻造处</div>
      </div>
    </div>
  );
}

function CooldownButton({ label, cooldown, color, active, large }) {
  const isReady = cooldown <= 0;
  
  const colorClasses = {
    red: 'from-red-600 to-red-500 border-red-400',
    cyan: 'from-cyan-600 to-cyan-500 border-cyan-400',
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