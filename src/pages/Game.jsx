import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCanvas from '@/components/game/GameCanvas';
import GameUI from '@/components/game/GameUI';
import GameOver from '@/components/game/GameOver';
import BossIntro from '@/components/game/BossIntro';
import StartScreen from '@/components/game/StartScreen';
import Shop from '@/components/game/Shop';

const BOSSES = [
  { id: 1, name: "机械蜘蛛", health: 150, damage: 15, speed: 2, size: 80, color: "#ff6b6b", pattern: "web" },
  { id: 2, name: "突击机器人", health: 200, damage: 20, speed: 3, size: 90, color: "#a855f7", pattern: "rush" },
  { id: 3, name: "重型坦克", health: 300, damage: 25, speed: 1, size: 120, color: "#ef4444", pattern: "artillery" },
  { id: 4, name: "飞行无人机", health: 180, damage: 30, speed: 4, size: 70, color: "#8b5cf6", pattern: "aerial" },
  { id: 5, name: "狙击机器人", health: 250, damage: 40, speed: 1.5, size: 85, color: "#6366f1", pattern: "sniper" },
  { id: 6, name: "激光卫士", health: 350, damage: 35, speed: 2, size: 100, color: "#22d3ee", pattern: "laser" },
  { id: 7, name: "爆破专家", health: 280, damage: 50, speed: 2.5, size: 95, color: "#f97316", pattern: "explosive" },
  { id: 8, name: "护盾机器人", health: 400, damage: 25, speed: 1.2, size: 110, color: "#14b8a6", pattern: "shield" },
  { id: 9, name: "毒液喷射器", health: 320, damage: 30, speed: 2, size: 90, color: "#84cc16", pattern: "poison" },
  { id: 10, name: "冰霜守卫", health: 380, damage: 35, speed: 1.8, size: 105, color: "#06b6d4", pattern: "freeze" },
  { id: 11, name: "火焰泰坦", health: 450, damage: 45, speed: 1.5, size: 130, color: "#f97316", pattern: "flame" },
  { id: 12, name: "雷电执行者", health: 350, damage: 40, speed: 3, size: 95, color: "#fbbf24", pattern: "electric" },
  { id: 13, name: "暗影刺客", health: 300, damage: 50, speed: 4, size: 80, color: "#374151", pattern: "stealth" },
  { id: 14, name: "等离子炮", health: 500, damage: 55, speed: 1, size: 140, color: "#a3e635", pattern: "plasma" },
  { id: 15, name: "冲锋队长", health: 400, damage: 45, speed: 3.5, size: 100, color: "#fb923c", pattern: "charge" },
  { id: 16, name: "堡垒机甲", health: 600, damage: 40, speed: 0.8, size: 150, color: "#059669", pattern: "fortress" },
  { id: 17, name: "量子幻影", health: 350, damage: 60, speed: 5, size: 85, color: "#818cf8", pattern: "teleport" },
  { id: 18, name: "毁灭者", health: 700, damage: 70, speed: 2, size: 160, color: "#dc2626", pattern: "destroyer" },
  { id: 19, name: "终极战神", health: 800, damage: 80, speed: 2.5, size: 170, color: "#1e1b4b", pattern: "ultimate" },
  { id: 20, name: "核心统治者", health: 1000, damage: 100, speed: 2, size: 200, color: "#fcd34d", pattern: "godmode" }
];

export default function Game() {
  const [gameState, setGameState] = useState('start');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(100);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [defeatedBosses, setDefeatedBosses] = useState([]);
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [structureHealth, setStructureHealth] = useState(100);
  
  const [shootCooldown, setShootCooldown] = useState(0);
  const [healCooldown, setHealCooldown] = useState(0);
  const [dashCooldown, setDashCooldown] = useState(0);
  const [isDashing, setIsDashing] = useState(false);

  const [upgrades, setUpgrades] = useState({
    damage: 1,
    fireRate: 1,
    speed: 1,
    maxHealth: 1,
    structureArmor: 1
  });

  const SHOOT_CD = 300 / upgrades.fireRate;
  const HEAL_CD = 8000;
  const DASH_CD = 5000;
  const DASH_DURATION = 300;

  const startGame = () => {
    setGameState('playing');
    setPlayerHealth(100 * upgrades.maxHealth);
    setMaxHealth(100 * upgrades.maxHealth);
    setStructureHealth(100);
    setScore(0);
    setDefeatedBosses([]);
    setCurrentBoss(null);
    setShootCooldown(0);
    setHealCooldown(0);
    setDashCooldown(0);
  };

  const triggerBoss = useCallback((bossIndex) => {
    const boss = BOSSES[bossIndex];
    if (boss && !defeatedBosses.includes(boss.id)) {
      setCurrentBoss(boss);
      setBossHealth(boss.health);
      setBossMaxHealth(boss.health);
      setShowBossIntro(true);
      setGameState('boss');
      
      setTimeout(() => {
        setShowBossIntro(false);
      }, 2500);
    }
  }, [defeatedBosses]);

  const defeatBoss = useCallback(() => {
    if (currentBoss) {
      setDefeatedBosses(prev => [...prev, currentBoss.id]);
      setScore(prev => prev + currentBoss.health * 10);
      setCoins(prev => prev + 150);
      setPlayerHealth(prev => Math.min(maxHealth, prev + 50));
      setCurrentBoss(null);
      setGameState('playing');
      
      if (defeatedBosses.length + 1 >= 20) {
        setGameState('victory');
      }
    }
  }, [currentBoss, defeatedBosses.length, maxHealth]);

  const handlePlayerDamage = useCallback((damage) => {
    if (isDashing) return;
    setPlayerHealth(prev => {
      const newHealth = prev - damage;
      if (newHealth <= 0) {
        setGameState('gameover');
        return 0;
      }
      return newHealth;
    });
  }, [isDashing]);

  const handleStructureDamage = useCallback((damage) => {
    const actualDamage = damage / upgrades.structureArmor;
    setStructureHealth(prev => {
      const newHealth = prev - actualDamage;
      if (newHealth <= 0) {
        setGameState('gameover');
        return 0;
      }
      return newHealth;
    });
  }, [upgrades.structureArmor]);

  const handleEnemyKill = useCallback(() => {
    setScore(prev => prev + 100);
    setCoins(prev => prev + 15);
  }, []);

  const handleBossDamage = useCallback((damage) => {
    setBossHealth(prev => {
      const newHealth = prev - damage;
      if (newHealth <= 0) {
        defeatBoss();
        return 0;
      }
      return newHealth;
    });
  }, [defeatBoss]);

  const shoot = useCallback(() => {
    if (shootCooldown <= 0) {
      setShootCooldown(SHOOT_CD);
      return true;
    }
    return false;
  }, [shootCooldown, SHOOT_CD]);

  const heal = useCallback(() => {
    if (healCooldown <= 0 && playerHealth < maxHealth) {
      setHealCooldown(HEAL_CD);
      setPlayerHealth(prev => Math.min(maxHealth, prev + 40));
      return true;
    }
    return false;
  }, [healCooldown, playerHealth, maxHealth]);

  const dash = useCallback(() => {
    if (dashCooldown <= 0 && !isDashing) {
      setDashCooldown(DASH_CD);
      setIsDashing(true);
      setTimeout(() => setIsDashing(false), DASH_DURATION);
      return true;
    }
    return false;
  }, [dashCooldown, isDashing]);

  const handlePurchase = (upgrade, cost) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setUpgrades(prev => ({
        ...prev,
        [upgrade]: prev[upgrade] + 1
      }));
      if (upgrade === 'maxHealth') {
        const newMax = 100 * (upgrades.maxHealth + 1);
        setMaxHealth(newMax);
        setPlayerHealth(prev => Math.min(newMax, prev + 50));
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'boss') return;
    
    const interval = setInterval(() => {
      setShootCooldown(prev => Math.max(0, prev - 50));
      setHealCooldown(prev => Math.max(0, prev - 50));
      setDashCooldown(prev => Math.max(0, prev - 50));
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'b' && (gameState === 'playing' || gameState === 'boss')) {
        setShowShop(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <StartScreen onStart={startGame} />
        )}
        
        {(gameState === 'playing' || gameState === 'boss') && (
          <>
            <GameCanvas
              gameState={gameState}
              onPlayerDamage={handlePlayerDamage}
              onStructureDamage={handleStructureDamage}
              onEnemyKill={handleEnemyKill}
              onBossDamage={handleBossDamage}
              onTriggerBoss={triggerBoss}
              shoot={shoot}
              heal={heal}
              dash={dash}
              isDashing={isDashing}
              currentBoss={currentBoss}
              defeatedBosses={defeatedBosses}
              score={score}
              upgrades={upgrades}
            />
            
            <GameUI
              health={playerHealth}
              maxHealth={maxHealth}
              structureHealth={structureHealth}
              score={score}
              coins={coins}
              shootCooldown={shootCooldown / SHOOT_CD}
              healCooldown={healCooldown / HEAL_CD}
              dashCooldown={dashCooldown / DASH_CD}
              isDashing={isDashing}
              bossHealth={currentBoss ? bossHealth : null}
              bossMaxHealth={bossMaxHealth}
              bossName={currentBoss?.name}
              defeatedBosses={defeatedBosses.length}
            />
            
            <AnimatePresence>
              {showBossIntro && currentBoss && (
                <BossIntro boss={currentBoss} />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showShop && (
                <Shop
                  coins={coins}
                  upgrades={upgrades}
                  onPurchase={handlePurchase}
                  onClose={() => setShowShop(false)}
                />
              )}
            </AnimatePresence>
          </>
        )}
        
        {(gameState === 'gameover' || gameState === 'victory') && (
          <GameOver
            victory={gameState === 'victory'}
            score={score}
            coins={coins}
            defeatedBosses={defeatedBosses.length}
            onRestart={startGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}