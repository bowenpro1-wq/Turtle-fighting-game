import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCanvas from '@/components/game/GameCanvas';
import GameUI from '@/components/game/GameUI';
import GameOver from '@/components/game/GameOver';
import BossIntro from '@/components/game/BossIntro';
import StartScreen from '@/components/game/StartScreen';

const BOSSES = [
  { id: 1, name: "海星守卫", health: 100, damage: 15, speed: 1.5, size: 60, color: "#ff6b6b", pattern: "circle" },
  { id: 2, name: "水母刺客", health: 150, damage: 20, speed: 2, size: 70, color: "#a855f7", pattern: "zigzag" },
  { id: 3, name: "螃蟹将军", health: 200, damage: 25, speed: 1, size: 80, color: "#ef4444", pattern: "chase" },
  { id: 4, name: "章鱼巫师", health: 250, damage: 30, speed: 1.8, size: 90, color: "#8b5cf6", pattern: "teleport" },
  { id: 5, name: "鲨鱼猎人", health: 300, damage: 35, speed: 2.5, size: 100, color: "#6366f1", pattern: "dash" },
  { id: 6, name: "海龙王子", health: 400, damage: 40, speed: 1.5, size: 110, color: "#22d3ee", pattern: "spiral" },
  { id: 7, name: "深海怪兽", health: 500, damage: 45, speed: 1.2, size: 120, color: "#14b8a6", pattern: "random" },
  { id: 8, name: "珊瑚守护者", health: 350, damage: 30, speed: 2, size: 85, color: "#f472b6", pattern: "bounce" },
  { id: 9, name: "海蛇女王", health: 600, damage: 50, speed: 2.2, size: 130, color: "#84cc16", pattern: "wave" },
  { id: 10, name: "冰霜海妖", health: 700, damage: 55, speed: 1.8, size: 140, color: "#06b6d4", pattern: "freeze" },
  { id: 11, name: "火焰海神", health: 800, damage: 60, speed: 2, size: 150, color: "#f97316", pattern: "burst" },
  { id: 12, name: "雷电鳐鱼", health: 550, damage: 45, speed: 3, size: 95, color: "#fbbf24", pattern: "lightning" },
  { id: 13, name: "暗影鲸鱼", health: 900, damage: 65, speed: 1.5, size: 160, color: "#374151", pattern: "shadow" },
  { id: 14, name: "毒液水母王", health: 450, damage: 40, speed: 2.5, size: 100, color: "#a3e635", pattern: "poison" },
  { id: 15, name: "巨型海马", health: 750, damage: 55, speed: 2.2, size: 135, color: "#fb923c", pattern: "charge" },
  { id: 16, name: "远古海龟王", health: 1000, damage: 50, speed: 1, size: 170, color: "#059669", pattern: "defend" },
  { id: 17, name: "幻影海豚", health: 650, damage: 60, speed: 3.5, size: 105, color: "#818cf8", pattern: "clone" },
  { id: 18, name: "末日海怪", health: 1200, damage: 70, speed: 1.8, size: 180, color: "#dc2626", pattern: "chaos" },
  { id: 19, name: "深渊领主", health: 1500, damage: 80, speed: 2, size: 190, color: "#1e1b4b", pattern: "void" },
  { id: 20, name: "海洋霸主", health: 2000, damage: 100, speed: 2.5, size: 200, color: "#fcd34d", pattern: "ultimate" }
];

export default function Game() {
  const [gameState, setGameState] = useState('start'); // start, playing, paused, boss, gameover, victory
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [defeatedBosses, setDefeatedBosses] = useState([]);
  const [showBossIntro, setShowBossIntro] = useState(false);
  
  // Cooldowns (in ms)
  const [shootCooldown, setShootCooldown] = useState(0);
  const [healCooldown, setHealCooldown] = useState(0);
  const [flyCooldown, setFlyCooldown] = useState(0);
  const [isFlying, setIsFlying] = useState(false);

  const SHOOT_CD = 500;
  const HEAL_CD = 5000;
  const FLY_CD = 10000;
  const FLY_DURATION = 3000;

  const startGame = () => {
    setGameState('playing');
    setPlayerHealth(100);
    setMaxHealth(100);
    setScore(0);
    setDefeatedBosses([]);
    setCurrentBoss(null);
    setShootCooldown(0);
    setHealCooldown(0);
    setFlyCooldown(0);
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
      }, 2000);
    }
  }, [defeatedBosses]);

  const defeatBoss = useCallback(() => {
    if (currentBoss) {
      setDefeatedBosses(prev => [...prev, currentBoss.id]);
      setScore(prev => prev + currentBoss.health * 10);
      setPlayerHealth(prev => Math.min(maxHealth, prev + 50));
      setCurrentBoss(null);
      setGameState('playing');
      
      if (defeatedBosses.length + 1 >= 20) {
        setGameState('victory');
      }
    }
  }, [currentBoss, defeatedBosses.length, maxHealth]);

  const handlePlayerDamage = useCallback((damage) => {
    if (isFlying) return;
    setPlayerHealth(prev => {
      const newHealth = prev - damage;
      if (newHealth <= 0) {
        setGameState('gameover');
        return 0;
      }
      return newHealth;
    });
  }, [isFlying]);

  const handleEnemyKill = useCallback(() => {
    setScore(prev => prev + 100);
    setPlayerHealth(prev => Math.min(maxHealth, prev + 10));
  }, [maxHealth]);

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
  }, [shootCooldown]);

  const heal = useCallback(() => {
    if (healCooldown <= 0 && playerHealth < maxHealth) {
      setHealCooldown(HEAL_CD);
      setPlayerHealth(prev => Math.min(maxHealth, prev + 30));
      return true;
    }
    return false;
  }, [healCooldown, playerHealth, maxHealth]);

  const fly = useCallback(() => {
    if (flyCooldown <= 0 && !isFlying) {
      setFlyCooldown(FLY_CD);
      setIsFlying(true);
      setTimeout(() => setIsFlying(false), FLY_DURATION);
      return true;
    }
    return false;
  }, [flyCooldown, isFlying]);

  // Cooldown timer
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'boss') return;
    
    const interval = setInterval(() => {
      setShootCooldown(prev => Math.max(0, prev - 50));
      setHealCooldown(prev => Math.max(0, prev - 50));
      setFlyCooldown(prev => Math.max(0, prev - 50));
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4a] to-[#0f172a] overflow-hidden relative">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <StartScreen onStart={startGame} />
        )}
        
        {(gameState === 'playing' || gameState === 'boss') && (
          <>
            <GameCanvas
              gameState={gameState}
              onPlayerDamage={handlePlayerDamage}
              onEnemyKill={handleEnemyKill}
              onBossDamage={handleBossDamage}
              onTriggerBoss={triggerBoss}
              shoot={shoot}
              heal={heal}
              fly={fly}
              isFlying={isFlying}
              currentBoss={currentBoss}
              defeatedBosses={defeatedBosses}
              score={score}
            />
            
            <GameUI
              health={playerHealth}
              maxHealth={maxHealth}
              score={score}
              shootCooldown={shootCooldown / SHOOT_CD}
              healCooldown={healCooldown / HEAL_CD}
              flyCooldown={flyCooldown / FLY_CD}
              isFlying={isFlying}
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
          </>
        )}
        
        {(gameState === 'gameover' || gameState === 'victory') && (
          <GameOver
            victory={gameState === 'victory'}
            score={score}
            defeatedBosses={defeatedBosses.length}
            onRestart={startGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}