import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCanvas from '@/components/game/GameCanvas';
import GameUI from '@/components/game/GameUI';
import GameOver from '@/components/game/GameOver';
import BossIntro from '@/components/game/BossIntro';
import StartScreen from '@/components/game/StartScreen';
import Shop from '@/components/game/Shop';
import VirtualKeyboard from '@/components/game/VirtualKeyboard';
import WeaponSelect from '@/components/game/WeaponSelect';
import Forge from '@/components/game/Forge';

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
  { id: 20, name: "广智", health: 2500, damage: 120, speed: 2, size: 220, color: "#ff4500", pattern: "flame" }
];

export default function Game() {
  const [gameState, setGameState] = useState('start');
  const [gameMode, setGameMode] = useState('normal');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(1000);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [defeatedBosses, setDefeatedBosses] = useState([]);
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showWeaponSelect, setShowWeaponSelect] = useState(false);
  const [showForge, setShowForge] = useState(false);
  const [waveNumber, setWaveNumber] = useState(1);
  const [survivalTime, setSurvivalTime] = useState(0);
  
  // Weapon system
  const [selectedWeapon, setSelectedWeapon] = useState('none');
  const [upgradeTemplates, setUpgradeTemplates] = useState(0);
  const [weapons, setWeapons] = useState({
    chichao: { level: 0, unlocked: false },
    guigui: { level: 0, unlocked: false },
    dianchao: { level: 0, unlocked: false },
    totem: { level: 0, unlocked: false }
  });
  const [dailyBossesDefeated, setDailyBossesDefeated] = useState({
    zhongdalin: false,
    guangzhi: false,
    xiaowang: false,
    longhaixing: false,
    qigong: false
  });
  
  // Tower mode state
  const [currentFloor, setCurrentFloor] = useState(1);
  const [checkpoint, setCheckpoint] = useState(1);
  const [hasTheHand, setHasTheHand] = useState(false);
  const [towerSpecialFloor, setTowerSpecialFloor] = useState(null);
  const [gemDefeated, setGemDefeated] = useState(false);
  
  const [shootCooldown, setShootCooldown] = useState(0);
  const [healCooldown, setHealCooldown] = useState(0);
  const [flyCooldown, setFlyCooldown] = useState(0);
  const [largeAttackCooldown, setLargeAttackCooldown] = useState(0);
  const [allOutAttackCooldown, setAllOutAttackCooldown] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [isAllOutAttack, setIsAllOutAttack] = useState(false);
  const [isMeleeAttacking, setIsMeleeAttacking] = useState(false);

  // Bullet upgrades
  const [hasCannonUpgrade, setHasCannonUpgrade] = useState(false);
  const [hasHomingBullets, setHasHomingBullets] = useState(false);
  const [hasPiercingShots, setHasPiercingShots] = useState(false);
  const [hasExplosiveShots, setHasExplosiveShots] = useState(false);
  const [weaponType, setWeaponType] = useState('normal');
  const [playerColor, setPlayerColor] = useState('green');
  const [bulletColor, setBulletColor] = useState('yellow');

  // Upgrades
  const [upgrades, setUpgrades] = useState({
    damage: 1,
    fireRate: 1,
    speed: 1,
    maxHealth: 1,
    cooldownReduction: 1,
    abilityPower: 1,
    critChance: 0,
    lifeSteal: 0,
    armor: 0,
    dodgeChance: 0
  });

  const SHOOT_CD = 300 / upgrades.fireRate;
  const HEAL_CD = 5000 / upgrades.cooldownReduction;
  const FLY_CD = 10000 / upgrades.cooldownReduction;
  const FLY_DURATION = 3000 + (upgrades.abilityPower - 1) * 500;
  const LARGE_ATTACK_CD = 15000 / upgrades.cooldownReduction;
  const ALL_OUT_ATTACK_CD = 12000 / upgrades.cooldownReduction;
  const ALL_OUT_DURATION = 800 + (upgrades.abilityPower - 1) * 200;
  const MELEE_DURATION = 150;

  const startGame = (mode = 'normal', fromCheckpoint = false) => {
    if (mode === 'busbreak') {
      // Boss试炼模式直接开始,显示boss选择
      setGameMode(mode);
      setGameState('busbreak_select');
      return;
    }
    
    if (mode !== 'busbreak') {
      // Show weapon select for all modes except busbreak
      setGameMode(mode);
      setShowWeaponSelect(true);
      return;
    }
    
    continueGameAfterWeaponSelect(mode, fromCheckpoint);
  };

  const continueGameAfterWeaponSelect = (mode, fromCheckpoint = false) => {
    setGameMode(mode);
    setPlayerHealth(100 * upgrades.maxHealth);
    setMaxHealth(100 * upgrades.maxHealth);
    setScore(0);
    setDefeatedBosses([]);
    setCurrentBoss(null);
    setShootCooldown(0);
    setHealCooldown(0);
    setFlyCooldown(0);
    setLargeAttackCooldown(0);
    setAllOutAttackCooldown(0);
    setWaveNumber(1);
    setSurvivalTime(0);
    setShowBossIntro(false);
    setBossHealth(0);
    setBossMaxHealth(0);
    
    if (mode === 'tower') {
      if (fromCheckpoint) {
        setCurrentFloor(checkpoint);
      } else {
        setCurrentFloor(1);
        setCheckpoint(1);
      }
      setGemDefeated(false);
      setTowerSpecialFloor(null);
    } else if (mode === 'busbreak') {
      // Bus失恋模式直接开始
    }
    
    setTimeout(() => {
      setGameState('playing');
    }, 0);
  };

  const handleWeaponSelect = (weaponId) => {
    setSelectedWeapon(weaponId);
    setShowWeaponSelect(false);
    continueGameAfterWeaponSelect(gameMode);
  };

  const handleWeaponUpgrade = (weaponId) => {
    if (upgradeTemplates > 0) {
      setUpgradeTemplates(prev => prev - 1);
      setWeapons(prev => ({
        ...prev,
        [weaponId]: {
          ...prev[weaponId],
          level: prev[weaponId].level + 1,
          unlocked: weaponId === 'guigui' ? prev[weaponId].level + 1 >= 8 : true
        }
      }));
    }
  };

  const handleBusBreakBossDefeat = (bossName) => {
    // Mark daily boss as defeated
    setDailyBossesDefeated(prev => {
      const newDefeated = {
        ...prev,
        [bossName]: true
      };
      
      // Count total defeated bosses
      const defeatedCount = Object.values(newDefeated).filter(Boolean).length;
      
      // Every 4 bosses defeated, give a random weapon
      if (defeatedCount % 4 === 0) {
        const availableWeapons = ['chichao', 'guigui', 'dianchao', 'totem'];
        const randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
        
        setWeapons(prev => ({
          ...prev,
          [randomWeapon]: {
            ...prev[randomWeapon],
            unlocked: true,
            level: Math.max(prev[randomWeapon].level, 1)
          }
        }));
      }
      
      // All 5 bosses defeated, give 1 template
      if (defeatedCount === 5) {
        setUpgradeTemplates(prev => prev + 1);
      }
      
      return newDefeated;
    });
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
      const newDefeatedCount = defeatedBosses.length + 1;
      setDefeatedBosses(prev => [...prev, currentBoss.id]);
      setScore(prev => prev + currentBoss.health * 10);
      setCoins(prev => prev + 100);
      setPlayerHealth(prev => Math.min(maxHealth, prev + 50));
      setCurrentBoss(null);
      
      // Tower mode floor progression
      if (gameMode === 'tower') {
        const nextFloor = currentFloor + 1;
        if (nextFloor > 100) {
          setHasTheHand(true);
          setGameState('victory');
        } else {
          setCurrentFloor(nextFloor);
          // Save checkpoint every 10 floors
          if (nextFloor % 10 === 1 && nextFloor > 1) {
            setCheckpoint(nextFloor);
          }
          setGameState('playing');
        }
      } else {
        setGameState('playing');
        
        // Unlock cannon after 5 bosses
        if (newDefeatedCount >= 5 && !hasCannonUpgrade) {
          setHasCannonUpgrade(true);
        }
        
        if (newDefeatedCount >= 20) {
          setGameState('victory');
        }
      }
    }
  }, [currentBoss, defeatedBosses.length, maxHealth, hasCannonUpgrade, gameMode, currentFloor]);

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

  const handleEnemyKill = useCallback((enemyType) => {
    // Floor complete trigger for tower mode
    if (enemyType === 'floor_complete' && gameMode === 'tower') {
      const nextFloor = currentFloor + 1;
      if (nextFloor > 100) {
        setHasTheHand(true);
        setGameState('victory');
      } else {
        setCurrentFloor(nextFloor);
        // Save checkpoint every 10 floors
        if (nextFloor % 10 === 1 && nextFloor > 1) {
          setCheckpoint(nextFloor);
        }
      }
      return;
    }

    setScore(prev => {
      const newScore = prev + 100;
      // Trigger boss every 800 score (not in tower mode)
      if (gameMode !== 'tower' && Math.floor(newScore / 800) > Math.floor(prev / 800)) {
        const bossIndex = defeatedBosses.length;
        if (bossIndex < BOSSES.length) {
          setTimeout(() => triggerBoss(bossIndex), 1000);
        }
      }
      return newScore;
    });
    setCoins(prev => prev + 10);

    // Life steal passive
    if (upgrades.lifeSteal > 0) {
      const lifeStealAmount = 10 * (upgrades.lifeSteal * 0.05);
      setPlayerHealth(prev => Math.min(maxHealth, prev + lifeStealAmount));
    } else {
      setPlayerHealth(prev => Math.min(maxHealth, prev + 10));
    }
  }, [maxHealth, defeatedBosses.length, triggerBoss, gameMode, upgrades.lifeSteal, currentFloor]);

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
      const healAmount = 30 + (upgrades.abilityPower - 1) * 10;
      setPlayerHealth(prev => Math.min(maxHealth, prev + healAmount));
      return true;
    }
    return false;
  }, [healCooldown, playerHealth, maxHealth, HEAL_CD, upgrades.abilityPower]);

  const fly = useCallback(() => {
    if (flyCooldown <= 0 && !isFlying) {
      setFlyCooldown(FLY_CD);
      setIsFlying(true);
      setTimeout(() => setIsFlying(false), FLY_DURATION);
      return true;
    }
    return false;
  }, [flyCooldown, isFlying]);

  const largeAttack = useCallback(() => {
    if (largeAttackCooldown <= 0) {
      setLargeAttackCooldown(LARGE_ATTACK_CD);
      return true;
    }
    return false;
  }, [largeAttackCooldown]);

  const allOutAttack = useCallback(() => {
    if (allOutAttackCooldown <= 0) {
      setAllOutAttackCooldown(ALL_OUT_ATTACK_CD);
      setIsAllOutAttack(true);
      setTimeout(() => setIsAllOutAttack(false), ALL_OUT_DURATION);
      return true;
    }
    return false;
  }, [allOutAttackCooldown]);

  const meleeAttack = useCallback(() => {
    setIsMeleeAttacking(true);
    setTimeout(() => setIsMeleeAttacking(false), MELEE_DURATION);
    return true;
  }, []);

  const handlePurchase = (upgrade, cost) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      
      if (upgrade === 'homingBullets') {
        setHasHomingBullets(true);
      } else if (upgrade === 'piercingShots') {
        setHasPiercingShots(true);
      } else if (upgrade === 'explosiveShots') {
        setHasExplosiveShots(true);
      } else if (upgrade === 'weaponSpread') {
        setWeaponType('spread');
      } else if (upgrade === 'weaponLaser') {
        setWeaponType('laser');
      } else if (upgrade.startsWith('color_')) {
        const [, type, color] = upgrade.split('_');
        if (type === 'player') setPlayerColor(color);
        else if (type === 'bullet') setBulletColor(color);
      } else if (upgrade === 'reset') {
        setUpgrades({
          damage: 1,
          fireRate: 1,
          speed: 1,
          maxHealth: 1,
          cooldownReduction: 1,
          abilityPower: 1,
          critChance: 0,
          lifeSteal: 0,
          armor: 0,
          dodgeChance: 0
        });
        setHasHomingBullets(false);
        setHasPiercingShots(false);
        setHasExplosiveShots(false);
        setWeaponType('normal');
        setCoins(prev => prev + Math.floor(cost * 0.5));
      } else {
        setUpgrades(prev => ({
          ...prev,
          [upgrade]: prev[upgrade] + 1
        }));
        if (upgrade === 'maxHealth') {
          const newMax = 100 * (upgrades.maxHealth + 1);
          setMaxHealth(newMax);
          setPlayerHealth(prev => Math.min(newMax, prev + 50));
        }
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
      setFlyCooldown(prev => Math.max(0, prev - 50));
      setLargeAttackCooldown(prev => Math.max(0, prev - 50));
      setAllOutAttackCooldown(prev => Math.max(0, prev - 50));
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'b' && (gameState === 'playing' || gameState === 'boss')) {
        setShowShop(prev => !prev);
      }
      if (e.key.toLowerCase() === 'f' && (gameState === 'playing' || gameState === 'boss')) {
        setShowForge(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#87CEEB] via-[#5F9EA0] to-[#2F4F4F] overflow-hidden relative">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <StartScreen onStart={startGame} defeatedBosses={defeatedBosses} />
        )}
        
        {(gameState === 'playing' || gameState === 'boss') && (
          <>
            <VirtualKeyboard />
            
            {/* Forge Button */}
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowForge(true)}
              className="fixed top-6 right-6 z-40 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg border-2 border-orange-300/50 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span className="text-2xl">🔨</span>
              <span>锻造处</span>
            </motion.button>

            <GameCanvas
              gameState={gameState}
              gameMode={gameMode}
              onPlayerDamage={handlePlayerDamage}
              onEnemyKill={handleEnemyKill}
              onBossDamage={handleBossDamage}
              onTriggerBoss={triggerBoss}
              shoot={shoot}
              heal={heal}
              fly={fly}
              largeAttack={largeAttack}
              allOutAttack={allOutAttack}
              meleeAttack={meleeAttack}
              isFlying={isFlying}
              isAllOutAttack={isAllOutAttack}
              isMeleeAttacking={isMeleeAttacking}
              currentBoss={currentBoss}
              defeatedBosses={defeatedBosses}
              score={score}
              upgrades={upgrades}
              hasCannonUpgrade={hasCannonUpgrade}
              hasHomingBullets={hasHomingBullets}
              hasPiercingShots={hasPiercingShots}
              hasExplosiveShots={hasExplosiveShots}
              weaponType={weaponType}
              playerColor={playerColor}
              bulletColor={bulletColor}
              currentFloor={currentFloor}
              towerSpecialFloor={towerSpecialFloor}
              onTowerSpecialFloor={setTowerSpecialFloor}
              gemDefeated={gemDefeated}
              onGemDefeated={setGemDefeated}
            />
            
            <GameUI
              health={playerHealth}
              maxHealth={maxHealth}
              score={score}
              coins={coins}
              shootCooldown={shootCooldown / SHOOT_CD}
              healCooldown={healCooldown / HEAL_CD}
              flyCooldown={flyCooldown / FLY_CD}
              largeAttackCooldown={largeAttackCooldown / LARGE_ATTACK_CD}
              allOutAttackCooldown={allOutAttackCooldown / ALL_OUT_ATTACK_CD}
              isFlying={isFlying}
              isAllOutAttack={isAllOutAttack}
              bossHealth={currentBoss ? bossHealth : null}
              bossMaxHealth={bossMaxHealth}
              bossName={currentBoss?.name}
              defeatedBosses={defeatedBosses.length}
              hasCannonUpgrade={hasCannonUpgrade}
              hasHomingBullets={hasHomingBullets}
              gameMode={gameMode}
              currentFloor={currentFloor}
              checkpoint={checkpoint}
              towerSpecialFloor={towerSpecialFloor}
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
                  hasHomingBullets={hasHomingBullets}
                  hasPiercingShots={hasPiercingShots}
                  hasExplosiveShots={hasExplosiveShots}
                  weaponType={weaponType}
                  playerColor={playerColor}
                  bulletColor={bulletColor}
                  onPurchase={handlePurchase}
                  onClose={() => setShowShop(false)}
                />
              )}

              {showWeaponSelect && (
                <WeaponSelect
                  availableWeapons={weapons}
                  onSelect={handleWeaponSelect}
                  onClose={() => {
                    setShowWeaponSelect(false);
                    setGameState('start');
                  }}
                />
              )}

              {showForge && (
                <Forge
                  weapons={weapons}
                  templates={upgradeTemplates}
                  onUpgrade={handleWeaponUpgrade}
                  onClose={() => setShowForge(false)}
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
            gameMode={gameMode}
            currentFloor={currentFloor}
            checkpoint={checkpoint}
            hasTheHand={hasTheHand}
          />
        )}
      </AnimatePresence>
    </div>
  );
}