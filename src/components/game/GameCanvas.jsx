import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const CANVAS_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;
const CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;

// Zhongdalin enemy for tower mode
const ZHONGDALIN = {
  name: 'zhongdalin',
  width: 50,
  height: 70,
  speed: 0.5,
  health: 15,
  damage: 3,
  shootInterval: 0, // No ranged attack
  color: '#4ade80',
  behaviorType: 'melee',
  attacksBuildings: false,
  ramAttack: true,
  vineAttack: true
};

// Boss试炼 special bosses
const BUSBREAK_BOSSES = {
  zhongdalin: {
    name: '中大林',
    width: 120,
    height: 150,
    speed: 2.0,
    health: 3000,
    damage: 40,
    color: '#4ade80',
    pattern: 'chase',
    shootInterval: 2000,
    isSpecialBoss: true
  },
  xiaowang: {
    name: '小黄龙',
    width: 100,
    height: 120,
    speed: 3.0,
    health: 2500,
    damage: 35,
    color: '#f59e0b',
    pattern: 'dash',
    shootInterval: 1500,
    isSpecialBoss: true
  },
  longhaixing: {
    name: '海星',
    width: 110,
    height: 130,
    speed: 2.5,
    health: 2800,
    damage: 38,
    color: '#06b6d4',
    pattern: 'teleport',
    shootInterval: 1800,
    isSpecialBoss: true
  },
  qigong: {
    name: '气功大师',
    width: 130,
    height: 160,
    speed: 1.5,
    health: 3500,
    damage: 45,
    color: '#8b5cf6',
    pattern: 'spiral',
    shootInterval: 2500,
    isSpecialBoss: true
  },
  guangzhi: {
    name: '广智',
    width: 180,
    height: 220,
    speed: 2.8,
    health: 8000,
    damage: 80,
    color: '#ff4500',
    pattern: 'flame',
    shootInterval: 1500,
    isSpecialBoss: true
  }
};

// Enemy types with unique behaviors
const ENEMY_TYPES = {
  ZHONGDALIN: ZHONGDALIN,
  SOLDIER: {
    name: 'soldier',
    width: 40,
    height: 50,
    speed: 1.5,
    health: 40,
    damage: 10,
    shootInterval: 6000,
    color: '#7c3aed',
    behaviorType: 'patrol',
    attacksBuildings: false
  },
  SCOUT: {
    name: 'scout',
    width: 35,
    height: 45,
    speed: 2.5,
    health: 30,
    damage: 8,
    shootInterval: 5000,
    color: '#06b6d4',
    behaviorType: 'patrol',
    attacksBuildings: false
  },
  HEAVY: {
    name: 'heavy',
    width: 60,
    height: 70,
    speed: 0.8,
    health: 150,
    damage: 30,
    shootInterval: 7000,
    color: '#71717a',
    behaviorType: 'assault',
    attacksBuildings: true
  },
  ASSASSIN: {
    name: 'assassin',
    width: 35,
    height: 50,
    speed: 3.0,
    health: 50,
    damage: 25,
    shootInterval: 4000,
    color: '#8b5cf6',
    behaviorType: 'kamikaze',
    attacksBuildings: false
  },
  MAGE: {
    name: 'mage',
    width: 40,
    height: 55,
    speed: 1.0,
    health: 60,
    damage: 20,
    shootInterval: 8000,
    color: '#a855f7',
    behaviorType: 'stationary',
    attacksBuildings: false,
    longRange: true
  },
  WARRIOR: {
    name: 'warrior',
    width: 50,
    height: 60,
    speed: 1.2,
    health: 100,
    damage: 20,
    shootInterval: 6000,
    color: '#ef4444',
    behaviorType: 'assault',
    attacksBuildings: false
  },
  TANK: {
    name: 'tank',
    width: 80,
    height: 60,
    speed: 0.8,
    health: 100,
    damage: 25,
    shootInterval: 8000,
    color: '#dc2626',
    behaviorType: 'assault',
    attacksBuildings: true
  },
  DRONE: {
    name: 'drone',
    width: 35,
    height: 35,
    speed: 2.5,
    health: 25,
    damage: 8,
    shootInterval: 5000,
    color: '#0891b2',
    behaviorType: 'flying',
    attacksBuildings: false
  },
  ENGINEER: {
    name: 'engineer',
    width: 40,
    height: 50,
    speed: 1.2,
    health: 30,
    damage: 5,
    shootInterval: 10000,
    color: '#ea580c',
    behaviorType: 'support',
    attacksBuildings: false,
    deploysObstacles: true
  },
  ARTILLERY: {
    name: 'artillery',
    width: 70,
    height: 55,
    speed: 0.3,
    health: 80,
    damage: 40,
    shootInterval: 9000,
    color: '#65a30d',
    behaviorType: 'stationary',
    attacksBuildings: true,
    createsHazards: true
  },
  SNIPER: {
    name: 'sniper',
    width: 45,
    height: 55,
    speed: 0.5,
    health: 50,
    damage: 35,
    shootInterval: 12000,
    color: '#f59e0b',
    behaviorType: 'stationary',
    attacksBuildings: false,
    longRange: true
  },
  HEALER: {
    name: 'healer',
    width: 38,
    height: 48,
    speed: 1.0,
    health: 35,
    damage: 3,
    shootInterval: 15000,
    color: '#10b981',
    behaviorType: 'support',
    attacksBuildings: false,
    healsAllies: true
  },
  BOMBER: {
    name: 'bomber',
    width: 50,
    height: 50,
    speed: 2.0,
    health: 60,
    damage: 15,
    shootInterval: 7000,
    color: '#f43f5e',
    behaviorType: 'kamikaze',
    attacksBuildings: false,
    explodeOnDeath: true
  },
  SCOUT: {
    name: 'scout',
    width: 35,
    height: 45,
    speed: 3.0,
    health: 30,
    damage: 8,
    shootInterval: 5000,
    color: '#06b6d4',
    behaviorType: 'patrol',
    attacksBuildings: false,
    canDodge: true
  },
  HEAVY: {
    name: 'heavy',
    width: 60,
    height: 70,
    speed: 0.8,
    health: 150,
    damage: 30,
    shootInterval: 7000,
    color: '#71717a',
    behaviorType: 'assault',
    attacksBuildings: true
  },
  ASSASSIN: {
    name: 'assassin',
    width: 35,
    height: 50,
    speed: 3.5,
    health: 50,
    damage: 25,
    shootInterval: 4000,
    color: '#8b5cf6',
    behaviorType: 'stealth',
    attacksBuildings: false,
    canDodge: true,
    teleportAttack: true
  },
  MAGE: {
    name: 'mage',
    width: 40,
    height: 55,
    speed: 1.0,
    health: 60,
    damage: 20,
    shootInterval: 8000,
    color: '#a855f7',
    behaviorType: 'stationary',
    attacksBuildings: false,
    longRange: true,
    aoeAttack: true
  },
  WARRIOR: {
    name: 'warrior',
    width: 50,
    height: 60,
    speed: 1.5,
    health: 100,
    damage: 20,
    shootInterval: 6000,
    color: '#ef4444',
    behaviorType: 'assault',
    attacksBuildings: false,
    shielded: true
  },
  COMMANDER: {
    name: 'commander',
    width: 55,
    height: 65,
    speed: 1.2,
    health: 120,
    damage: 18,
    shootInterval: 7000,
    color: '#fbbf24',
    behaviorType: 'support',
    attacksBuildings: false,
    buffAllies: true
  },
  NECROMANCER: {
    name: 'necromancer',
    width: 45,
    height: 60,
    speed: 0.8,
    health: 80,
    damage: 15,
    shootInterval: 10000,
    color: '#6366f1',
    behaviorType: 'stationary',
    attacksBuildings: false,
    summonMinions: true
  },
  BERSERKER: {
    name: 'berserker',
    width: 55,
    height: 65,
    speed: 2.8,
    health: 120,
    damage: 35,
    shootInterval: 5000,
    color: '#dc2626',
    behaviorType: 'rage',
    attacksBuildings: false,
    enrageOnLowHealth: true
  },
  SHIELD_BEARER: {
    name: 'shield_bearer',
    width: 50,
    height: 60,
    speed: 1.0,
    health: 180,
    damage: 15,
    shootInterval: 8000,
    color: '#94a3b8',
    behaviorType: 'tank',
    attacksBuildings: false,
    reflectsDamage: true
  },
  SUMMONER: {
    name: 'summoner',
    width: 40,
    height: 55,
    speed: 0.9,
    health: 70,
    damage: 10,
    shootInterval: 12000,
    color: '#7c3aed',
    behaviorType: 'support',
    attacksBuildings: false,
    spawnMinions: true
  },
  RANGER: {
    name: 'ranger',
    width: 38,
    height: 50,
    speed: 2.2,
    health: 55,
    damage: 22,
    shootInterval: 6000,
    color: '#16a34a',
    behaviorType: 'kiting',
    attacksBuildings: false,
    longRange: true
  },
  KAMIKAZE: {
    name: 'kamikaze',
    width: 35,
    height: 40,
    speed: 4.0,
    health: 40,
    damage: 50,
    shootInterval: 0,
    color: '#f59e0b',
    behaviorType: 'suicide',
    attacksBuildings: false,
    explodeOnContact: true
  },
  FROST_MAGE: {
    name: 'frost_mage',
    width: 42,
    height: 58,
    speed: 0.7,
    health: 65,
    damage: 18,
    shootInterval: 9000,
    color: '#38bdf8',
    behaviorType: 'stationary',
    attacksBuildings: false,
    slowsPlayer: true,
    longRange: true
  },
  VAMPIRE: {
    name: 'vampire',
    width: 45,
    height: 55,
    speed: 2.5,
    health: 90,
    damage: 28,
    shootInterval: 7000,
    color: '#991b1b',
    behaviorType: 'lifesteal',
    attacksBuildings: false,
    healsOnHit: true
  },
  GHOST: {
    name: 'ghost',
    width: 40,
    height: 50,
    speed: 1.5,
    health: 50,
    damage: 20,
    shootInterval: 8000,
    color: '#a78bfa',
    behaviorType: 'phase',
    attacksBuildings: false,
    canPhase: true,
    phaseInterval: 4000
  },
  JUGGERNAUT: {
    name: 'juggernaut',
    width: 70,
    height: 80,
    speed: 0.6,
    health: 250,
    damage: 40,
    shootInterval: 10000,
    color: '#44403c',
    behaviorType: 'unstoppable',
    attacksBuildings: true,
    immuneToKnockback: true
  },
  TELEPORTER: {
    name: 'teleporter',
    width: 38,
    height: 48,
    speed: 1.8,
    health: 60,
    damage: 24,
    shootInterval: 6000,
    color: '#ec4899',
    behaviorType: 'blink',
    attacksBuildings: false,
    teleportFrequency: 3000
  }
};

export default function GameCanvas({
  gameState,
  gameMode,
  selectedWeapon,
  weaponLevel,
  onPlayerDamage,
  onEnemyKill,
  onBossDamage,
  onTriggerBoss,
  shoot,
  heal,
  fly,
  largeAttack,
  allOutAttack,
  meleeAttack,
  isFlying,
  isAllOutAttack,
  isMeleeAttacking,
  currentBoss,
  defeatedBosses,
  score,
  upgrades,
  difficultyMultiplier = 1,
  hasCannonUpgrade,
  hasHomingBullets,
  hasPiercingShots,
  hasExplosiveShots,
  weaponType,
  playerColor,
  bulletColor,
  currentFloor,
  towerSpecialFloor,
  onTowerSpecialFloor,
  gemDefeated,
  onGemDefeated,
  maxLevelHelper,
  helperTimer,
  isInShop = false,
  towerKillCount = 0,
  towerRequiredKills = 10
}) {
  const canvasRef = useRef(null);
  const WORLD_WIDTH = gameMode === 'tower' ? 1800 : 4000;
  const WORLD_HEIGHT = gameMode === 'tower' ? 2000 : 3000;
  
  const gameRef = useRef({
    player: {
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
      width: 50,
      height: 50,
      speed: 6,
      angle: 0
    },
    camera: { x: 0, y: 0 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    allies: [],
    particles: [],
    obstacles: [],
    hazardZones: [],
    buildings: [],
    explosions: [],
    flameAttacks: [],
    keys: {},
    lastEnemySpawn: 0,
    lastObstacleCheck: 0,
    lastHealCheck: 0,
    lastBossEnemySpawn: 0,
    animationFrame: 0,
    worldGenerated: false,
    screenShake: 0,
    totemShotCount: 0,
    towerKillCount: 0,
    towerRequiredKills: 10,
    isHoldingK: false,
    lastBeamTick: 0,
    flameLineActive: false,
    lastFlameLineTick: 0
  });

  const generateWorld = useCallback(() => {
    // Skip building generation in tower mode
    if (gameMode === 'tower') {
      gameRef.current.buildings = [];
      gameRef.current.worldGenerated = true;
      return;
    }
    
    const buildings = [];
    
    // Generate buildings across the world in a grid pattern
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 400 + col * 700 + Math.random() * 100;
        const y = 400 + row * 600 + Math.random() * 100;
        const buildingType = Math.random();
        
        if (buildingType < 0.4) {
          buildings.push({
            x, y,
            width: 100,
            height: 100,
            type: 'house',
            health: 100,
            maxHealth: 100,
            important: true
          });
        } else if (buildingType < 0.7) {
          buildings.push({
            x, y,
            width: 90,
            height: 90,
            type: 'tower',
            health: 150,
            maxHealth: 150,
            important: true
          });
        } else {
          buildings.push({
            x, y,
            width: 120,
            height: 100,
            type: 'bunker',
            health: 200,
            maxHealth: 200,
            important: true
          });
        }
      }
    }
    
    gameRef.current.buildings = buildings;
    gameRef.current.worldGenerated = true;
  }, [gameMode]);

  const spawnEnemy = useCallback((type = null, forcedType = null) => {
    if (forcedType) {
      type = forcedType;
    } else if (!type) {
      // In tower mode, only spawn Zhongdalin
      if (gameMode === 'tower') {
        type = ZHONGDALIN;
      } else {
        const types = Object.values(ENEMY_TYPES).filter(t => t.name !== 'zhongdalin');
        type = types[Math.floor(Math.random() * types.length)];
      }
    }

    let spawnX, spawnY;
    
    // In tower mode, spawn near player
    if (gameMode === 'tower') {
      const angle = Math.random() * Math.PI * 2;
      const distance = 300 + Math.random() * 200;
      spawnX = gameRef.current.player.x + Math.cos(angle) * distance;
      spawnY = gameRef.current.player.y + Math.sin(angle) * distance;
      // Keep in bounds
      const TOWER_WIDTH = 1800;
      const TOWER_HEIGHT = 2000;
      spawnX = Math.max(50, Math.min(TOWER_WIDTH - 50, spawnX));
      spawnY = Math.max(50, Math.min(TOWER_HEIGHT - 50, spawnY));
    } else {
      const side = Math.floor(Math.random() * 4);
      switch(side) {
        case 0: spawnX = Math.random() * WORLD_WIDTH; spawnY = -50; break;
        case 1: spawnX = WORLD_WIDTH + 50; spawnY = Math.random() * WORLD_HEIGHT; break;
        case 2: spawnX = Math.random() * WORLD_WIDTH; spawnY = WORLD_HEIGHT + 50; break;
        default: spawnX = -50; spawnY = Math.random() * WORLD_HEIGHT; break;
      }
    }
    
    const adjustedHealth = type.health * difficultyMultiplier;
    const adjustedDamage = type.damage * difficultyMultiplier;
    
    return {
      ...type,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      health: adjustedHealth,
      maxHealth: adjustedHealth,
      damage: adjustedDamage,
      lastShot: Date.now(),
      state: 'patrol',
      target: null,
      patrolAngle: Math.random() * Math.PI * 2,
      stunned: false,
      floorMultiplier: gameMode === 'tower' ? Math.floor(currentFloor / 10) + 1 : 1
    };
  }, [gameMode, currentFloor, difficultyMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    let animationId;

    if (!game.worldGenerated) {
      generateWorld();
    }

    const handleKeyDown = (e) => {
      game.keys[e.key.toLowerCase()] = true;

      // K键 - 根据武器改变攻击方式
      if (e.key.toLowerCase() === 'k') {
        if (shoot()) {
          const angle = game.player.angle;
          const px = game.player.x + game.player.width / 2;
          const py = game.player.y + game.player.height / 2;

          if (selectedWeapon === 'chichao') {
            // 赤潮 - 开始蓄力火线
            game.flameLineActive = true;
          } else if (selectedWeapon === 'dianchao') {
            // 电巢 - 四周喷射电流
            for (let i = 0; i < 8; i++) {
              const spreadAngle = (Math.PI * 2 / 8) * i;
              game.bullets.push({
                x: px,
                y: py,
                vx: Math.cos(spreadAngle) * 10,
                vy: Math.sin(spreadAngle) * 10,
                damage: (12 + weaponLevel * 2) * upgrades.damage,
                size: 8,
                color: '#fbbf24',
                fromPlayer: true,
                weaponType: 'electric',
                distanceTraveled: 0,
                maxDistance: 350
              });
            }
            // 电流粒子
            for (let i = 0; i < 20; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 15,
                color: '#fbbf24',
                size: 4
              });
            }
          } else if (selectedWeapon === 'totem') {
            // 图腾 - 普通射击 + 召唤中大林
            game.bullets.push({
              x: px,
              y: py,
              vx: Math.cos(angle) * 12,
              vy: Math.sin(angle) * 12,
              damage: (10 + weaponLevel * 2) * upgrades.damage,
              size: 9,
              color: '#4ade80',
              fromPlayer: true,
              weaponType: 'totem',
              distanceTraveled: 0,
              maxDistance: 500
            });

            // 每5次射击召唤一个中大林
            game.totemShotCount = (game.totemShotCount || 0) + 1;
            if (game.totemShotCount >= 5) {
              game.allies = game.allies || [];
              if (game.allies.length < 3) {
                const spawnAngle = Math.random() * Math.PI * 2;
                const spawnDist = 100;
                game.allies.push({
                  x: px + Math.cos(spawnAngle) * spawnDist,
                  y: py + Math.sin(spawnAngle) * spawnDist,
                  width: 40,
                  height: 50,
                  health: 50 + weaponLevel * 10,
                  maxHealth: 50 + weaponLevel * 10,
                  damage: 8 + weaponLevel,
                  lifetime: 300 + weaponLevel * 50,
                  lastShot: Date.now()
                });

                // 召唤特效
                for (let i = 0; i < 20; i++) {
                  game.particles.push({
                    x: px,
                    y: py,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 25,
                    color: '#4ade80',
                    size: 6
                  });
                }
              }
              game.totemShotCount = 0;
            }

            // 射击粒子
            for (let i = 0; i < 8; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * (Math.random() * 5 + 3),
                vy: Math.sin(angle) * (Math.random() * 5 + 3),
                life: 15,
                color: '#4ade80',
                size: 4
              });
            }
          } else if (selectedWeapon === 'guigui') {
            // 龟龟之手 - 开始蓄力光束
            game.isHoldingK = true;
          } else {
            // 默认射击
            const baseSpeed = hasHomingBullets ? 10 : 15;
            const bulletDamage = hasCannonUpgrade ? 25 * upgrades.damage : 10 * upgrades.damage;
            const bulletSize = hasCannonUpgrade ? 12 : 8;

            game.bullets.push({
              x: px,
              y: py,
              vx: Math.cos(angle) * baseSpeed,
              vy: Math.sin(angle) * baseSpeed,
              damage: bulletDamage,
              size: bulletSize,
              fromPlayer: true,
              isCannon: hasCannonUpgrade,
              isHoming: hasHomingBullets,
              distanceTraveled: 0,
              maxDistance: hasHomingBullets ? 400 : 800
            });

            const flashCount = hasCannonUpgrade ? 20 : 10;
            const flashColor = hasCannonUpgrade ? '#ff4500' : '#fbbf24';
            for (let i = 0; i < flashCount; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * (Math.random() * 5 + 3),
                vy: Math.sin(angle) * (Math.random() * 5 + 3) + (Math.random() - 0.5) * 4,
                life: hasCannonUpgrade ? 25 : 18,
                color: flashColor,
                size: hasCannonUpgrade ? 6 : 4
              });
            }

            if (hasCannonUpgrade) {
              game.screenShake = 2;
            }
          }
        }
      }
      
      // U键 - 龟龟之手召唤技能
      if (e.key.toLowerCase() === 'u' && selectedWeapon === 'guigui') {
        const px = game.player.x + game.player.width / 2;
        const py = game.player.y + game.player.height / 2;
        
        game.allies = game.allies || [];
        if (game.allies.length < 5) {
          for (let i = 0; i < 2; i++) {
            const spawnAngle = Math.random() * Math.PI * 2;
            const spawnDist = 100;
            game.allies.push({
              x: px + Math.cos(spawnAngle) * spawnDist,
              y: py + Math.sin(spawnAngle) * spawnDist,
              width: 45,
              height: 55,
              health: 80 + weaponLevel * 15,
              maxHealth: 80 + weaponLevel * 15,
              damage: 12 + weaponLevel * 2,
              lifetime: 400 + weaponLevel * 60,
              lastShot: Date.now()
            });
          }
          
          // 召唤特效
          for (let i = 0; i < 30; i++) {
            game.particles.push({
              x: px,
              y: py,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 35,
              color: '#22c55e',
              size: 8
            });
          }
        }
      }

      // H键 - 根据武器改变技能
      if (e.key.toLowerCase() === 'h') {
        if (heal()) {
          const px = game.player.x + game.player.width / 2;
          const py = game.player.y + game.player.height / 2;

          if (selectedWeapon === 'guigui') {
            // 龟龟之手 - 超强治疗
            for (let i = 0; i < 30; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 8,
                life: 40,
                color: '#22c55e',
                size: 6,
                type: 'heal'
              });
            }
          } else if (selectedWeapon === 'chichao') {
            // 赤潮 - 火焰近战攻击
            const meleeRange = 120;
            const meleeDamage = (25 + weaponLevel * 3) * upgrades.damage;

            // Damage boss
            if (gameMode === 'busbreak' && game.busBreakBoss && currentBoss) {
              const boss = game.busBreakBoss;
              const dx = boss.x - px;
              const dy = boss.y - py;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < meleeRange + currentBoss.size / 2) {
                onBossDamage(meleeDamage);
                
                for (let i = 0; i < 20; i++) {
                  game.particles.push({
                    x: boss.x,
                    y: boss.y,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    life: 30,
                    color: '#ff4500',
                    size: 7
                  });
                }
              }
            }

            game.enemies.forEach(enemy => {
              const dx = enemy.x + enemy.width / 2 - px;
              const dy = enemy.y + enemy.height / 2 - py;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < meleeRange) {
                enemy.health -= meleeDamage;
                // 火焰爆炸
                for (let i = 0; i < 15; i++) {
                  game.particles.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height / 2,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 25,
                    color: '#ff4500',
                    size: 6
                  });
                }
              }
            });

            // 火焰环绕特效
            for (let i = 0; i < 40; i++) {
              const angle = (Math.PI * 2 / 40) * i;
              game.particles.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * 8,
                vy: Math.sin(angle) * 8,
                life: 25,
                color: '#ffa500',
                size: 5
              });
            }
          } else {
            // 默认治疗
            for (let i = 0; i < 20; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 5,
                life: 30,
                color: '#22c55e',
                size: 4,
                type: 'heal'
              });
            }
          }
        }
      }
      
      if (e.key.toLowerCase() === 'o') {
        if (fly()) {
          for (let i = 0; i < 30; i++) {
            game.particles.push({
              x: game.player.x + game.player.width / 2,
              y: game.player.y + game.player.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 40,
              color: '#38bdf8',
              size: 5
            });
          }
        }
      }

      // L键 - 武器强力技能
      if (e.key.toLowerCase() === 'l') {
        if (largeAttack()) {
          const px = game.player.x + game.player.width / 2;
          const py = game.player.y + game.player.height / 2;
          game.screenShake = 15;

          if (selectedWeapon === 'chichao') {
            // 赤潮 - 超级火焰弹
            for (let i = 0; i < 50; i++) {
              const angle = (Math.PI * 2 / 50) * i;
              game.bullets.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * 10,
                vy: Math.sin(angle) * 10,
                damage: (40 + weaponLevel * 5) * upgrades.damage,
                size: 15,
                color: '#ff4500',
                fromPlayer: true,
                weaponType: 'superflame',
                distanceTraveled: 0,
                maxDistance: 600
              });
            }
            for (let i = 0; i < 60; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 60,
                color: '#ff4500',
                size: 10
              });
            }
          } else if (selectedWeapon === 'dianchao') {
            // 电巢 - 电气攻击
            for (let i = 0; i < 80; i++) {
              const angle = Math.random() * Math.PI * 2;
              game.bullets.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * (8 + Math.random() * 6),
                vy: Math.sin(angle) * (8 + Math.random() * 6),
                damage: (35 + weaponLevel * 4) * upgrades.damage,
                size: 12,
                color: '#fbbf24',
                fromPlayer: true,
                weaponType: 'thunder',
                distanceTraveled: 0,
                maxDistance: 500
              });
            }
            for (let i = 0; i < 70; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 50,
                color: '#fbbf24',
                size: 8
              });
            }
          } else if (selectedWeapon === 'guigui') {
            // 龟龟之手 - 超大龟圈 (持续伤害区域)
            game.turtleRing = {
              x: px,
              y: py,
              radius: 350,
              damage: (15 + weaponLevel * 2) * upgrades.damage,
              life: 300,
              maxLife: 300
            };
            for (let i = 0; i < 120; i++) {
              const angle = (Math.PI * 2 / 120) * i;
              game.particles.push({
                x: px + Math.cos(angle) * 350,
                y: py + Math.sin(angle) * 350,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                life: 60,
                color: '#22c55e',
                size: 10
              });
            }
          } else if (selectedWeapon === 'totem') {
            // 图腾 - 召唤3个强化中大林
            game.allies = game.allies || [];
            for (let i = 0; i < 3; i++) {
              const angle = (Math.PI * 2 / 3) * i;
              const spawnDist = 150;
              game.allies.push({
                x: px + Math.cos(angle) * spawnDist,
                y: py + Math.sin(angle) * spawnDist,
                width: 50,
                height: 60,
                health: 100 + weaponLevel * 15,
                maxHealth: 100 + weaponLevel * 15,
                damage: 15 + weaponLevel * 2,
                lifetime: 400 + weaponLevel * 60,
                lastShot: Date.now(),
                enhanced: true
              });
            }
            for (let i = 0; i < 50; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 60,
                color: '#4ade80',
                size: 10
              });
            }
          } else {
            // 默认大招
            for (let i = 0; i < 100; i++) {
              const angle = (Math.PI * 2 / 100) * i;
              const bulletDamage = hasCannonUpgrade ? 30 * upgrades.damage : 15 * upgrades.damage;
              const bulletSize = hasCannonUpgrade ? 14 : 10;

              game.bullets.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                damage: bulletDamage,
                size: bulletSize,
                fromPlayer: true,
                isCannon: hasCannonUpgrade,
                isHoming: false,
                distanceTraveled: 0,
                maxDistance: 800
              });
            }

            const particleColor = hasCannonUpgrade ? '#ff4500' : '#fbbf24';
            for (let i = 0; i < 50; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 50,
                color: particleColor,
                size: 8
              });
            }
          }
        }
      }

      if (e.key.toLowerCase() === 'j') {
        if (meleeAttack()) {
          // Melee particles - 360 degrees
          for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 / 40) * i;
            game.particles.push({
              x: game.player.x + game.player.width / 2,
              y: game.player.y + game.player.height / 2,
              vx: Math.cos(angle) * (Math.random() * 6 + 6),
              vy: Math.sin(angle) * (Math.random() * 6 + 6),
              life: 20,
              color: '#60a5fa',
              size: 5
            });
          }
        }
      }

      // P键 - 武器终极技能
      if (e.key.toLowerCase() === 'p') {
        if (allOutAttack()) {
          const px = game.player.x + game.player.width / 2;
          const py = game.player.y + game.player.height / 2;
          game.screenShake = 25;

          if (selectedWeapon === 'chichao') {
            // 赤潮 - 广志真身
            game.guangzhiSpirit = {
              x: px,
              y: py - 200,
              width: 150,
              height: 180,
              damage: (80 + weaponLevel * 10) * upgrades.damage,
              lifetime: 150 + weaponLevel * 20,
              lastAttack: Date.now()
            };
            for (let i = 0; i < 100; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 0.5) * 25,
                life: 80,
                color: '#ff4500',
                size: 12
              });
            }
          } else if (selectedWeapon === 'guigui') {
            // 龟龟之手 - 超强龟文诅咒
            for (let i = 0; i < 300; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * 600;
              game.particles.push({
                x: px + Math.cos(angle) * dist,
                y: py + Math.sin(angle) * dist,
                vx: 0,
                vy: 0,
                life: 120,
                color: '#22c55e',
                size: 12,
                type: 'curse'
              });
            }
            
            // 对Boss造成超大伤害
            if (currentBoss && gameState === 'boss') {
              const bossDamage = 1500 + weaponLevel * 150;
              onBossDamage(bossDamage);
            }
            
            // 秒杀所有普通敌人
            game.enemies.forEach(enemy => {
              enemy.health = 0;
              for (let i = 0; i < 50; i++) {
                game.particles.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y + enemy.height / 2,
                  vx: (Math.random() - 0.5) * 15,
                  vy: (Math.random() - 0.5) * 15,
                  life: 80,
                  color: '#22c55e',
                  size: 8
                });
              }
            });
          } else {
            // 默认终极技 - 对普通敌人清屏，对Boss造成大量伤害
            if (currentBoss && gameState === 'boss') {
              // 对Boss造成大量伤害，但不秒杀
              const bossDamage = 500 + weaponLevel * 50;
              onBossDamage(bossDamage);
              
              // Boss特效
              for (let i = 0; i < 80; i++) {
                game.particles.push({
                  x: px,
                  y: py,
                  vx: (Math.random() - 0.5) * 25,
                  vy: (Math.random() - 0.5) * 25,
                  life: 80,
                  color: '#ef4444',
                  size: 10
                });
              }
            }
            
            // 清除普通敌人
            game.enemies.forEach(enemy => {
              for (let i = 0; i < 30; i++) {
                game.particles.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y + enemy.height / 2,
                  vx: (Math.random() - 0.5) * 15,
                  vy: (Math.random() - 0.5) * 15,
                  life: 60,
                  color: '#ef4444',
                  size: 6
                });
              }
              onEnemyKill(enemy.name);
            });
            game.enemies = [];

            for (let i = 0; i < 100; i++) {
              game.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 80,
                color: '#ef4444',
                size: 10
              });
            }
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      game.keys[e.key.toLowerCase()] = false;
      
      // 释放K键 - 停止光束/火线
      if (e.key.toLowerCase() === 'k') {
        if (selectedWeapon === 'guigui') {
          game.isHoldingK = false;
        } else if (selectedWeapon === 'chichao') {
          game.flameLineActive = false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (gameState !== 'playing' && gameState !== 'boss') {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      game.animationFrame++;

      // Screen shake effect
      if (game.screenShake > 0) {
        ctx.save();
        ctx.translate(
          (Math.random() - 0.5) * game.screenShake,
          (Math.random() - 0.5) * game.screenShake
        );
        game.screenShake *= 0.9;
        if (game.screenShake < 0.5) game.screenShake = 0;
      }

      // All Out Attack red overlay
      if (isAllOutAttack) {
        ctx.save();
        ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + Math.sin(game.animationFrame * 0.3) * 0.2})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }

      // Player movement - all 4 directions
      const baseSpeed = 6 * upgrades.speed;
      let moveX = 0, moveY = 0;
      
      if (game.keys['w'] || game.keys['arrowup']) moveY -= baseSpeed;
      if (game.keys['s'] || game.keys['arrowdown']) moveY += baseSpeed;
      if (game.keys['a'] || game.keys['arrowleft']) moveX -= baseSpeed;
      if (game.keys['d'] || game.keys['arrowright']) moveX += baseSpeed;

      // Normalize diagonal movement
      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707;
        moveY *= 0.707;
      }

      game.player.x += moveX;
      game.player.y += moveY;

      // Update player angle based on movement
      if (moveX !== 0 || moveY !== 0) {
        game.player.angle = Math.atan2(moveY, moveX);
      }

      // Keep player in world bounds
      game.player.x = Math.max(0, Math.min(WORLD_WIDTH - game.player.width, game.player.x));
      game.player.y = Math.max(0, Math.min(WORLD_HEIGHT - game.player.height, game.player.y));

      // Camera follows player
      game.camera.x = Math.max(0, Math.min(
        WORLD_WIDTH - CANVAS_WIDTH,
        game.player.x - CANVAS_WIDTH / 3
      ));
      game.camera.y = Math.max(0, Math.min(
        WORLD_HEIGHT - CANVAS_HEIGHT,
        game.player.y - CANVAS_HEIGHT / 2
      ));

      // Draw background
      drawBackground(ctx, game.camera, game.animationFrame, gameMode, WORLD_WIDTH, WORLD_HEIGHT);

      // Draw buildings
      game.buildings.forEach(building => {
        if (building.x + building.width < game.camera.x || building.x > game.camera.x + CANVAS_WIDTH) return;
        
        drawBuilding(ctx, building, game.camera);
        
        // Building health bar
        if (building.health < building.maxHealth) {
          const screenX = building.x - game.camera.x;
          const screenY = building.y - game.camera.y - 15;
          
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(screenX, screenY, building.width, 8);
          
          const healthPercent = building.health / building.maxHealth;
          ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(screenX, screenY, building.width * healthPercent, 8);
        }
      });

      // Remove destroyed buildings
      game.buildings = game.buildings.filter(b => b.health > 0);

      // Spawn LOTS of enemies every 2 seconds in normal mode
      if (gameMode !== 'tower' && gameMode !== 'busbreak' && gameState === 'playing' && Date.now() - game.lastEnemySpawn > 2000) {
        const baseSpawn = Math.floor(score / 1000) + 5;
        const spawnCount = Math.floor(Math.random() * baseSpawn) + baseSpawn;
        for (let i = 0; i < spawnCount; i++) {
          game.enemies.push(spawnEnemy());
        }
        game.lastEnemySpawn = Date.now();
      }

      // Boss mode: spawn LOTS of enemies continuously
      if (gameMode !== 'tower' && gameMode !== 'busbreak' && gameState === 'boss') {
        // Initial spawn of 30-50 enemies when boss appears
        if (game.lastBossEnemySpawn === 0) {
          const initialCount = Math.floor(Math.random() * 21) + 30;
          for (let i = 0; i < initialCount; i++) {
            game.enemies.push(spawnEnemy());
          }
          game.lastBossEnemySpawn = Date.now();
        } else if (Date.now() - game.lastBossEnemySpawn > 1500) {
          // Spawn 8-15 enemies every 1.5 seconds
          const spawnCount = Math.floor(Math.random() * 8) + 8;
          for (let i = 0; i < spawnCount; i++) {
            game.enemies.push(spawnEnemy());
          }
          game.lastBossEnemySpawn = Date.now();
        }
      } else if (gameMode !== 'tower' && gameMode !== 'busbreak') {
        game.lastBossEnemySpawn = 0;
      }

      // 赤潮持续火线攻击
      if (selectedWeapon === 'chichao' && game.flameLineActive && Date.now() - game.lastFlameLineTick > 50) {
        const px = game.player.x + game.player.width / 2;
        const py = game.player.y + game.player.height / 2;
        const angle = game.player.angle;
        
        const flameLength = 350;
        
        // 创建火线伤害检测点
        for (let dist = 40; dist < flameLength; dist += 25) {
          const flameX = px + Math.cos(angle) * dist;
          const flameY = py + Math.sin(angle) * dist;
          
          // Boss伤害检测
          if (gameMode === 'busbreak' && game.busBreakBoss && currentBoss) {
            const boss = game.busBreakBoss;
            const dx = boss.x - flameX;
            const dy = boss.y - flameY;
            const distToBoss = Math.sqrt(dx * dx + dy * dy);
            
            if (distToBoss < currentBoss.size / 2 + 20) {
              onBossDamage((4 + weaponLevel * 0.8) * upgrades.damage);
            }
          }
          
          // 敌人伤害检测
          game.enemies.forEach(enemy => {
            const dx = enemy.x + enemy.width / 2 - flameX;
            const dy = enemy.y + enemy.height / 2 - flameY;
            const distToEnemy = Math.sqrt(dx * dx + dy * dy);
            
            if (distToEnemy < 30) {
              enemy.health -= (4 + weaponLevel * 0.8) * upgrades.damage;
            }
          });
          
          // 火焰粒子
          game.particles.push({
            x: flameX,
            y: flameY,
            vx: Math.cos(angle) * 3 + (Math.random() - 0.5) * 2,
            vy: Math.sin(angle) * 3 + (Math.random() - 0.5) * 2,
            life: 12,
            color: Math.random() > 0.5 ? '#ff4500' : '#ffa500',
            size: 9
          });
        }
        
        game.lastFlameLineTick = Date.now();
      }

      // 龟龟之手持续光束攻击
      if (selectedWeapon === 'guigui' && game.isHoldingK && Date.now() - game.lastBeamTick > 50) {
        const px = game.player.x + game.player.width / 2;
        const py = game.player.y + game.player.height / 2;
        const angle = game.player.angle;
        
        // 发射散射光束
        for (let i = 0; i < 3; i++) {
          const spreadAngle = angle + (i - 1) * 0.08;
          const beamLength = 400;
          
          // 创建光束伤害检测点
          for (let dist = 50; dist < beamLength; dist += 30) {
            const beamX = px + Math.cos(spreadAngle) * dist;
            const beamY = py + Math.sin(spreadAngle) * dist;
            
            // 检测敌人碰撞
            game.enemies.forEach(enemy => {
              const dx = enemy.x + enemy.width / 2 - beamX;
              const dy = enemy.y + enemy.height / 2 - beamY;
              const distToEnemy = Math.sqrt(dx * dx + dy * dy);
              
              if (distToEnemy < 25) {
                enemy.health -= (3 + weaponLevel * 0.5) * upgrades.damage;
              }
            });
            
            // 光束粒子
            game.particles.push({
              x: beamX,
              y: beamY,
              vx: Math.cos(spreadAngle) * 2,
              vy: Math.sin(spreadAngle) * 2,
              life: 8,
              color: '#22c55e',
              size: 8
            });
          }
        }
        
        game.lastBeamTick = Date.now();
      }

      // Tower mode spawning
      if (gameMode === 'tower' && gameState === 'playing') {
        // Check for special floors
        if (currentFloor === 15 && !towerSpecialFloor) {
          onTowerSpecialFloor('磐石迷宫');
        } else if (currentFloor === 60 && !towerSpecialFloor) {
          onTowerSpecialFloor('中大林狂欢节');
        } else if (currentFloor === 99 && !towerSpecialFloor) {
          onTowerSpecialFloor('石头体');
        } else if (currentFloor % 10 !== 0 && towerSpecialFloor && ![15, 60, 99].includes(currentFloor)) {
          onTowerSpecialFloor(null);
        }

        // Spawn fewer Zhongdalin
        if (Date.now() - game.lastEnemySpawn > 2500 && game.enemies.length < game.towerRequiredKills) {
          const baseCount = Math.min(Math.floor(currentFloor / 10) + 2, 5);
          let spawnCount = baseCount;

          // Floor 60: Carnival - more enemies but weaker
          if (currentFloor === 60) {
            spawnCount = baseCount * 2;
          }

          for (let i = 0; i < spawnCount; i++) {
            const zhongdalin = spawnEnemy(null, ZHONGDALIN);
            // Scale stats with floor (very slow growth)
            zhongdalin.health = ZHONGDALIN.health * (1 + currentFloor * 0.03);
            zhongdalin.damage = ZHONGDALIN.damage * (1 + currentFloor * 0.02);
            zhongdalin.speed = ZHONGDALIN.speed * (1 + currentFloor * 0.01);

            // Floor 60: Weaken enemies
            if (currentFloor === 60) {
              zhongdalin.health *= 0.5;
              zhongdalin.damage *= 0.5;
            }

            game.enemies.push(zhongdalin);
          }
          game.lastEnemySpawn = Date.now();
        }

        // Check if enough kills to advance
        if (game.towerKillCount >= game.towerRequiredKills && game.enemies.length === 0) {
          // Advance floor
          if (currentFloor % 10 === 0 && !currentBoss) {
            const bossNumber = Math.floor(currentFloor / 10);
            setTimeout(() => {
              if (currentFloor === 100) {
                // Final boss - handled separately with gem mechanic
              } else {
                onTriggerBoss(bossNumber - 1);
              }
            }, 1000);
          } else if (currentFloor % 10 !== 0) {
            // Normal floor complete
            game.towerKillCount = 0;
            game.towerRequiredKills = 10 + Math.floor(currentFloor / 10) * 2;
            onEnemyKill('floor_complete');
          }
        }
      }

      // Melee attack damage - 360 degrees
      if (isMeleeAttacking) {
        const meleeRange = 80;
        const meleeDamage = 10 * upgrades.damage;

        // Damage boss
        if (gameMode === 'busbreak' && game.busBreakBoss && currentBoss) {
          const boss = game.busBreakBoss;
          const dx = boss.x - (game.player.x + game.player.width / 2);
          const dy = boss.y - (game.player.y + game.player.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < meleeRange + currentBoss.size / 2) {
            onBossDamage(meleeDamage);
            
            // Boss melee hit particles
            for (let i = 0; i < 20; i++) {
              game.particles.push({
                x: boss.x,
                y: boss.y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 35,
                color: '#60a5fa',
                size: 6
              });
            }
          }
        }

        game.enemies.forEach(enemy => {
          const dx = enemy.x + enemy.width / 2 - (game.player.x + game.player.width / 2);
          const dy = enemy.y + enemy.height / 2 - (game.player.y + game.player.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < meleeRange) {
            enemy.health -= meleeDamage;

            // Melee hit particles
            for (let i = 0; i < 15; i++) {
              game.particles.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                color: '#60a5fa',
                size: 5
              });
            }
          }
        });
      }

      // Healer behavior - heal nearby allies
      if (Date.now() - game.lastHealCheck > 2000) {
        game.enemies.forEach(healer => {
          if (healer.healsAllies) {
            game.enemies.forEach(ally => {
              if (ally !== healer && ally.health < ally.maxHealth) {
                const dx = ally.x - healer.x;
                const dy = ally.y - healer.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200) {
                  ally.health = Math.min(ally.maxHealth, ally.health + 10);

                  // Heal particles
                  for (let i = 0; i < 5; i++) {
                    game.particles.push({
                      x: ally.x + ally.width / 2,
                      y: ally.y + ally.height / 2,
                      vx: (Math.random() - 0.5) * 2,
                      vy: -Math.random() * 3,
                      life: 20,
                      color: '#10b981',
                      size: 3
                    });
                  }
                }
              }
            });
          }
        });
        game.lastHealCheck = Date.now();
      }

      // Bus Break boss AI and rendering
      if (gameState === 'boss' && currentBoss && gameMode === 'busbreak') {
        // Initialize boss position if not set
        if (!game.busBreakBoss) {
          game.busBreakBoss = {
            x: game.player.x,
            y: game.player.y - 300,
            vx: 0,
            vy: 0,
            lastShot: Date.now(),
            lastDash: Date.now(),
            lastSpecialAttack: Date.now(),
            dashCooldown: 3000,
            specialAttackCooldown: 5000
          };
        }

        const boss = game.busBreakBoss;
        const dx = game.player.x - boss.x;
        const dy = game.player.y - boss.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        // Boss AI based on pattern
        if (currentBoss.pattern === 'chase') {
          // 中大林 - 冲撞攻击
          boss.vx = (dx / distToPlayer) * currentBoss.speed;
          boss.vy = (dy / distToPlayer) * currentBoss.speed;
          
          // 特殊攻击：召唤石柱
          if (Date.now() - boss.lastSpecialAttack > boss.specialAttackCooldown) {
            for (let i = 0; i < 4; i++) {
              const angle = (Math.PI * 2 / 4) * i;
              const dist = 200;
              game.hazardZones.push({
                x: game.player.x + Math.cos(angle) * dist,
                y: game.player.y + Math.sin(angle) * dist,
                radius: 60,
                damage: 30,
                life: 100,
                warning: 40
              });
            }
            boss.lastSpecialAttack = Date.now();
          }
        } else if (currentBoss.pattern === 'dash') {
          // 小黄龙 - 龙卷风冲刺
          if (Date.now() - boss.lastDash > boss.dashCooldown) {
            boss.vx = (dx / distToPlayer) * currentBoss.speed * 4;
            boss.vy = (dy / distToPlayer) * currentBoss.speed * 4;
            boss.lastDash = Date.now();
            
            // 冲刺时散发能量波
            for (let i = 0; i < 20; i++) {
              game.particles.push({
                x: boss.x,
                y: boss.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                color: '#fbbf24',
                size: 6
              });
            }
          } else {
            boss.vx *= 0.95;
            boss.vy *= 0.95;
          }
          
          // 特殊攻击：龙息
          if (Date.now() - boss.lastSpecialAttack > boss.specialAttackCooldown) {
            for (let i = 0; i < 12; i++) {
              const angle = Math.atan2(dy, dx) + (i - 6) * 0.15;
              game.enemyBullets.push({
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angle) * 10,
                vy: Math.sin(angle) * 10,
                damage: currentBoss.damage * 0.8,
                size: 12,
                color: '#fbbf24'
              });
            }
            boss.lastSpecialAttack = Date.now();
          }
        } else if (currentBoss.pattern === 'teleport') {
          // 海星 - 瞬移攻击
          if (Date.now() - boss.lastDash > 2000 && distToPlayer > 200) {
            const angle = Math.random() * Math.PI * 2;
            boss.x = game.player.x + Math.cos(angle) * 150;
            boss.y = game.player.y + Math.sin(angle) * 150;
            boss.lastDash = Date.now();
            
            // 瞬移时产生水波
            for (let i = 0; i < 30; i++) {
              game.particles.push({
                x: boss.x,
                y: boss.y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 40,
                color: '#22d3ee',
                size: 5
              });
            }
          }
          boss.vx = (dx / distToPlayer) * currentBoss.speed * 0.5;
          boss.vy = (dy / distToPlayer) * currentBoss.speed * 0.5;
          
          // 特殊攻击：五芒星攻击
          if (Date.now() - boss.lastSpecialAttack > boss.specialAttackCooldown) {
            for (let i = 0; i < 5; i++) {
              const angle = (Math.PI * 2 / 5) * i;
              for (let j = 1; j <= 3; j++) {
                game.enemyBullets.push({
                  x: boss.x,
                  y: boss.y,
                  vx: Math.cos(angle) * (6 * j),
                  vy: Math.sin(angle) * (6 * j),
                  damage: currentBoss.damage * 0.6,
                  size: 10,
                  color: '#06b6d4'
                });
              }
            }
            boss.lastSpecialAttack = Date.now();
          }
        } else if (currentBoss.pattern === 'spiral') {
          // 气功大师 - 螺旋气功
          const angle = Math.atan2(dy, dx) + Math.sin(game.animationFrame * 0.05) * 0.5;
          boss.vx = Math.cos(angle) * currentBoss.speed;
          boss.vy = Math.sin(angle) * currentBoss.speed;
          
          // 特殊攻击：能量波动
          if (Date.now() - boss.lastSpecialAttack > boss.specialAttackCooldown) {
            for (let ring = 1; ring <= 3; ring++) {
              for (let i = 0; i < 16; i++) {
                const angle = (Math.PI * 2 / 16) * i;
                setTimeout(() => {
                  game.enemyBullets.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * (4 * ring),
                    vy: Math.sin(angle) * (4 * ring),
                    damage: currentBoss.damage * 0.5,
                    size: 8,
                    color: '#a855f7'
                  });
                }, ring * 200);
              }
            }
            boss.lastSpecialAttack = Date.now();
          }
        } else if (currentBoss.pattern === 'flame') {
          // 广智 - 火焰攻击
          if (distToPlayer > 250) {
            boss.vx = (dx / distToPlayer) * currentBoss.speed;
            boss.vy = (dy / distToPlayer) * currentBoss.speed;
          } else if (distToPlayer < 200) {
            boss.vx = -(dx / distToPlayer) * currentBoss.speed;
            boss.vy = -(dy / distToPlayer) * currentBoss.speed;
          } else {
            boss.vx *= 0.9;
            boss.vy *= 0.9;
          }
          
          // 特殊攻击：火焰风暴
          if (Date.now() - boss.lastSpecialAttack > boss.specialAttackCooldown) {
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                game.flameAttacks.push({
                  x: game.player.x + (Math.random() - 0.5) * 200,
                  y: game.player.y + (Math.random() - 0.5) * 200,
                  radius: 30,
                  damage: 80,
                  life: 100,
                  maxLife: 100
                });
              }, i * 500);
            }
            boss.lastSpecialAttack = Date.now();
          }
        }

        // Update boss position
        boss.x += boss.vx;
        boss.y += boss.vy;

        // Keep boss in bounds
        boss.x = Math.max(currentBoss.size, Math.min(WORLD_WIDTH - currentBoss.size, boss.x));
        boss.y = Math.max(currentBoss.size, Math.min(WORLD_HEIGHT - currentBoss.size, boss.y));

        // Boss shooting
        if (Date.now() - boss.lastShot > 2000 && distToPlayer < 600) {
          const bulletCount = currentBoss.id === 'guangzhi' ? 8 : 5;
          for (let i = 0; i < bulletCount; i++) {
            const spreadAngle = Math.atan2(dy, dx) + (i - bulletCount/2) * 0.2;
            game.enemyBullets.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(spreadAngle) * 8,
              vy: Math.sin(spreadAngle) * 8,
              damage: currentBoss.damage,
              size: 10,
              color: currentBoss.color
            });
          }
          boss.lastShot = Date.now();
        }

        // Boss collision damage
        if (distToPlayer < currentBoss.size + 25 && !isFlying && !isInShop) {
          if (game.animationFrame % 30 === 0) {
            onPlayerDamage(currentBoss.damage * 0.5);
          }
        }

        // Draw boss with custom visuals
        const bossScreenX = boss.x - game.camera.x;
        const bossScreenY = boss.y - game.camera.y;
        
        // Import and use custom boss drawing
        drawBusBreakBoss(ctx, boss, game.camera, game.animationFrame, bossScreenX, bossScreenY, currentBoss);

        // Boss name tag
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(bossScreenX - 80, bossScreenY - currentBoss.size/2 - 50, 160, 25);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentBoss.name, bossScreenX, bossScreenY - currentBoss.size/2 - 30);
        ctx.restore();
      } else if (gameMode === 'busbreak') {
        // Reset boss when not in boss state
        game.busBreakBoss = null;
      }
      
      // Helper function to draw custom boss visuals
      function drawBusBreakBoss(ctx, boss, camera, frame, bossScreenX, bossScreenY, currentBoss) {
        ctx.save();
        
        if (currentBoss.id === 'zhongdalin') {
          // 中大林 - 石头巨人
          const baseSize = currentBoss.size || 120;
          ctx.fillStyle = '#4ade80';
          ctx.strokeStyle = '#166534';
          ctx.lineWidth = 4;
          
          const bodyWidth = baseSize * 0.8;
          const bodyHeight = baseSize;
          ctx.fillRect(bossScreenX - bodyWidth/2, bossScreenY - bodyHeight/2, bodyWidth, bodyHeight);
          ctx.strokeRect(bossScreenX - bodyWidth/2, bossScreenY - bodyHeight/2, bodyWidth, bodyHeight);
          
          ctx.fillStyle = '#22c55e';
          for (let i = 0; i < 5; i++) {
            ctx.fillRect(bossScreenX - bodyWidth/2 + 10, bossScreenY - bodyHeight/2 + i * 20, bodyWidth - 20, 8);
          }
          
          const headSize = baseSize * 0.35;
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(bossScreenX, bossScreenY - bodyHeight/2 - headSize, headSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.arc(bossScreenX - 12, bossScreenY - bodyHeight/2 - headSize, 5, 0, Math.PI * 2);
          ctx.arc(bossScreenX + 12, bossScreenY - bodyHeight/2 - headSize, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (currentBoss.id === 'xiaowang') {
          // 小黄龙 - 东方神龙形象
          const baseSize = currentBoss.size || 100;
          
          // 龙身 - 金色渐变蛇形身体
          const bodySegments = 6;
          for (let i = 0; i < bodySegments; i++) {
            const offsetX = Math.sin((frame * 0.08) + i * 0.7) * 20;
            const offsetY = Math.cos((frame * 0.08) + i * 0.5) * 8;
            const y = bossScreenY - baseSize/2 + (i * 18) + offsetY;
            const segmentSize = 28 - i * 2;
            
            // 龙鳞渐变色
            const gradient = ctx.createRadialGradient(bossScreenX + offsetX, y, 0, bossScreenX + offsetX, y, segmentSize);
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(0.5, '#f59e0b');
            gradient.addColorStop(1, '#d97706');
            
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(bossScreenX + offsetX, y, segmentSize, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // 龙鳞纹理
            ctx.fillStyle = '#fed7aa';
            for (let j = 0; j < 4; j++) {
              const scaleX = bossScreenX + offsetX - segmentSize + j * (segmentSize / 2);
              const scaleY = y;
              ctx.beginPath();
              ctx.arc(scaleX, scaleY, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          
          // 龙头 - 更威严的形状
          const headX = bossScreenX;
          const headY = bossScreenY - baseSize/2 - 30;
          
          // 头部轮廓
          const headGradient = ctx.createRadialGradient(headX, headY, 0, headX, headY, 40);
          headGradient.addColorStop(0, '#fbbf24');
          headGradient.addColorStop(0.6, '#f59e0b');
          headGradient.addColorStop(1, '#ea580c');
          
          ctx.fillStyle = headGradient;
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(headX, headY, 40, 35, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // 龙角 - 金色威武
          ctx.strokeStyle = '#fcd34d';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(headX - 25, headY - 25);
          ctx.quadraticCurveTo(headX - 35, headY - 45, headX - 30, headY - 60);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(headX + 25, headY - 25);
          ctx.quadraticCurveTo(headX + 35, headY - 45, headX + 30, headY - 60);
          ctx.stroke();
          
          // 龙须 - 飘逸的须髯
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 4;
          const whiskerWave = Math.sin(frame * 0.1) * 10;
          ctx.beginPath();
          ctx.moveTo(headX - 40, headY - 10);
          ctx.quadraticCurveTo(headX - 60 + whiskerWave, headY, headX - 55 + whiskerWave, headY + 20);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(headX + 40, headY - 10);
          ctx.quadraticCurveTo(headX + 60 - whiskerWave, headY, headX + 55 - whiskerWave, headY + 20);
          ctx.stroke();
          
          // 龙眼 - 威严的金色眼睛
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.ellipse(headX - 15, headY - 5, 10, 12, 0.3, 0, Math.PI * 2);
          ctx.ellipse(headX + 15, headY - 5, 10, 12, -0.3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(headX - 15, headY - 5, 5, 0, Math.PI * 2);
          ctx.arc(headX + 15, headY - 5, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // 龙鼻和嘴
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(headX - 8, headY + 15);
          ctx.quadraticCurveTo(headX, headY + 18, headX + 8, headY + 15);
          ctx.stroke();
          
          // 龙爪装饰
          for (let i = 1; i <= 2; i++) {
            const clawY = bossScreenY - baseSize/2 + (i * 35);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(bossScreenX - 25, clawY);
            ctx.lineTo(bossScreenX - 40, clawY + 10);
            ctx.moveTo(bossScreenX + 25, clawY);
            ctx.lineTo(bossScreenX + 40, clawY + 10);
            ctx.stroke();
          }
          
          // 能量光环
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.4 + Math.sin(frame * 0.15) * 0.3;
          ctx.beginPath();
          ctx.arc(headX, headY, 50 + Math.sin(frame * 0.1) * 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (currentBoss.id === 'guangzhi') {
          // 广智 - 火焰战神，参考天命人形态
          const baseSize = currentBoss.size || 150;
          
          // 火焰斗篷 - 动态火焰效果
          const cloakFlames = 16;
          for (let i = 0; i < cloakFlames; i++) {
            const angle = (Math.PI * 2 / cloakFlames) * i;
            const flameHeight = 35 + Math.sin(frame * 0.15 + i * 0.5) * 15;
            const x1 = bossScreenX + Math.cos(angle) * (baseSize * 0.4);
            const y1 = bossScreenY + Math.sin(angle) * (baseSize * 0.45);
            const x2 = bossScreenX + Math.cos(angle) * (baseSize * 0.4 + flameHeight);
            const y2 = bossScreenY + Math.sin(angle) * (baseSize * 0.45 + flameHeight);
            
            const flameGradient = ctx.createLinearGradient(x1, y1, x2, y2);
            flameGradient.addColorStop(0, '#ff6347');
            flameGradient.addColorStop(0.5, '#ff4500');
            flameGradient.addColorStop(1, '#dc2626');
            
            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            const nextAngle = angle + (Math.PI * 2 / cloakFlames);
            ctx.lineTo(
              bossScreenX + Math.cos(nextAngle) * (baseSize * 0.4),
              bossScreenY + Math.sin(nextAngle) * (baseSize * 0.45)
            );
            ctx.closePath();
            ctx.fill();
          }
          
          // 身体主体 - 战甲形态
          const bodyGradient = ctx.createRadialGradient(bossScreenX, bossScreenY, 0, bossScreenX, bossScreenY, baseSize * 0.4);
          bodyGradient.addColorStop(0, '#fbbf24');
          bodyGradient.addColorStop(0.3, '#f59e0b');
          bodyGradient.addColorStop(0.6, '#dc2626');
          bodyGradient.addColorStop(1, '#7f1d1d');
          
          ctx.fillStyle = bodyGradient;
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.ellipse(bossScreenX, bossScreenY, baseSize * 0.4, baseSize * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // 战甲纹路
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.8;
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const x = bossScreenX + Math.cos(angle) * (baseSize * 0.25);
            const y = bossScreenY + Math.sin(angle) * (baseSize * 0.3);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(bossScreenX, bossScreenY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          
          // 头部 - 威严的面具
          const headY = bossScreenY - baseSize * 0.35;
          ctx.fillStyle = '#dc2626';
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(bossScreenX, headY, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // 面具装饰 - 火焰纹样
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(bossScreenX - 25, headY - 10);
          ctx.quadraticCurveTo(bossScreenX - 20, headY - 25, bossScreenX - 10, headY - 30);
          ctx.moveTo(bossScreenX + 25, headY - 10);
          ctx.quadraticCurveTo(bossScreenX + 20, headY - 25, bossScreenX + 10, headY - 30);
          ctx.stroke();
          
          // 眼睛 - 炽热的火焰之眼
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#ff4500';
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.ellipse(bossScreenX - 15, headY, 10, 14, 0.2, 0, Math.PI * 2);
          ctx.ellipse(bossScreenX + 15, headY, 10, 14, -0.2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#ff4500';
          ctx.beginPath();
          ctx.arc(bossScreenX - 15, headY, 6, 0, Math.PI * 2);
          ctx.arc(bossScreenX + 15, headY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // 火焰王冠
          for (let i = 0; i < 5; i++) {
            const crownX = bossScreenX - 30 + i * 15;
            const crownHeight = 20 + (i === 2 ? 15 : 0);
            const flameGradient = ctx.createLinearGradient(crownX, headY - 35, crownX, headY - 35 - crownHeight);
            flameGradient.addColorStop(0, '#fbbf24');
            flameGradient.addColorStop(1, '#ff4500');
            
            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.moveTo(crownX - 5, headY - 35);
            ctx.lineTo(crownX, headY - 35 - crownHeight);
            ctx.lineTo(crownX + 5, headY - 35);
            ctx.closePath();
            ctx.fill();
          }
          
          // 神力标记 - "广智"符文
          ctx.fillStyle = '#fef3c7';
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 2;
          ctx.font = 'bold 28px "STKaiti", "KaiTi", serif';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ff4500';
          ctx.strokeText('广', bossScreenX, bossScreenY - 5);
          ctx.fillText('广', bossScreenX, bossScreenY - 5);
          ctx.strokeText('智', bossScreenX, bossScreenY + 20);
          ctx.fillText('智', bossScreenX, bossScreenY + 20);
          ctx.shadowBlur = 0;
          
          // 能量光环 - 脉动的火焰能量
          ctx.strokeStyle = '#ff6347';
          ctx.lineWidth = 4;
          ctx.globalAlpha = 0.5 + Math.sin(frame * 0.2) * 0.3;
          for (let i = 1; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(bossScreenX, bossScreenY, (baseSize * 0.5 + i * 15) + Math.sin(frame * 0.15 + i) * 8, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        } else {
          // 默认形象
          ctx.fillStyle = currentBoss.color;
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          ctx.shadowBlur = 20;
          ctx.shadowColor = currentBoss.color;
          const pulseSize = currentBoss.size / 2 + Math.sin(frame * 0.1) * 5;
          ctx.beginPath();
          ctx.arc(bossScreenX, bossScreenY, pulseSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        
        ctx.restore();
      }

      // Update allies (summoned creatures)
      game.allies = (game.allies || []).filter(ally => {
        ally.lifetime--;
        if (ally.lifetime <= 0) return false;

        // Find nearest enemy
        let closestEnemy = null;
        let closestDist = Infinity;
        
        game.enemies.forEach(enemy => {
          const dx = enemy.x + enemy.width / 2 - ally.x;
          const dy = enemy.y + enemy.height / 2 - ally.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            closestEnemy = enemy;
          }
        });

        // Move towards enemy
        if (closestEnemy && closestDist < 600) {
          const dx = closestEnemy.x - ally.x;
          const dy = closestEnemy.y - ally.y;
          const angle = Math.atan2(dy, dx);
          ally.vx = Math.cos(angle) * 3;
          ally.vy = Math.sin(angle) * 3;
        } else {
          // Follow player
          const dx = game.player.x - ally.x;
          const dy = game.player.y - ally.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 100) {
            const angle = Math.atan2(dy, dx);
            ally.vx = Math.cos(angle) * 2;
            ally.vy = Math.sin(angle) * 2;
          } else {
            ally.vx *= 0.9;
            ally.vy *= 0.9;
          }
        }

        ally.x += ally.vx;
        ally.y += ally.vy;

        // Shoot at enemies
        if (closestEnemy && closestDist < 400 && Date.now() - ally.lastShot > 1000) {
          const dx = closestEnemy.x + closestEnemy.width / 2 - ally.x;
          const dy = closestEnemy.y + closestEnemy.height / 2 - ally.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          game.bullets.push({
            x: ally.x,
            y: ally.y,
            vx: (dx / dist) * 10,
            vy: (dy / dist) * 10,
            damage: ally.damage,
            size: 6,
            color: ally.enhanced ? '#22c55e' : '#4ade80',
            fromPlayer: true,
            fromAlly: true
          });
          
          ally.lastShot = Date.now();
        }

        // Draw ally
        if (ally.x + ally.width > game.camera.x && ally.x < game.camera.x + CANVAS_WIDTH) {
          const screenX = ally.x - game.camera.x;
          const screenY = ally.y - game.camera.y;

          ctx.save();
          
          // Zhongdalin ally appearance
          ctx.fillStyle = ally.enhanced ? '#22c55e' : '#4ade80';
          ctx.strokeStyle = '#166534';
          ctx.lineWidth = 2;
          
          // Body
          ctx.fillRect(screenX, screenY + ally.height * 0.3, ally.width, ally.height * 0.7);
          ctx.strokeRect(screenX, screenY + ally.height * 0.3, ally.width, ally.height * 0.7);
          
          // Head
          ctx.beginPath();
          ctx.arc(screenX + ally.width / 2, screenY + ally.height * 0.2, ally.width * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Eyes
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.arc(screenX + ally.width / 2 - 5, screenY + ally.height * 0.15, 2, 0, Math.PI * 2);
          ctx.arc(screenX + ally.width / 2 + 5, screenY + ally.height * 0.15, 2, 0, Math.PI * 2);
          ctx.fill();

          // Health bar
          const healthPercent = ally.health / ally.maxHealth;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(screenX, screenY - 8, ally.width, 5);
          ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : '#ef4444';
          ctx.fillRect(screenX, screenY - 8, ally.width * healthPercent, 5);
          
          // Friendly marker
          ctx.fillStyle = '#22c55e';
          ctx.strokeStyle = '#166534';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(screenX + ally.width / 2, screenY - 15, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.restore();
        }

        // Collision with enemies
        game.enemies.forEach(enemy => {
          const dx = Math.abs((ally.x + ally.width / 2) - (enemy.x + enemy.width / 2));
          const dy = Math.abs((ally.y + ally.height / 2) - (enemy.y + enemy.height / 2));
          
          if (dx < (ally.width + enemy.width) / 2 && dy < (ally.height + enemy.height) / 2) {
            if (game.animationFrame % 30 === 0) {
              enemy.health -= ally.damage * 0.5;
              ally.health -= enemy.damage * 0.3;
            }
          }
        });

        return ally.health > 0;
      });

      // MAX level helper allies
      if (maxLevelHelper && helperTimer > 0) {
        // Spawn helper if not exists
        if (!game.maxLevelHelperUnit) {
          const helperStats = {
            guangzhi: { width: 80, height: 100, health: 500, damage: 40, color: '#ff4500' },
            xiaowang: { width: 60, height: 80, health: 400, damage: 35, color: '#fbbf24' },
            longhaixing: { width: 70, height: 90, health: 450, damage: 38, color: '#22d3ee' },
            zhongdalin: { width: 50, height: 70, health: 400, damage: 30, color: '#4ade80' }
          };
          
          const stats = helperStats[maxLevelHelper];
          if (stats) {
            game.maxLevelHelperUnit = {
              type: maxLevelHelper,
              x: game.player.x + 100,
              y: game.player.y,
              vx: 0,
              vy: 0,
              width: stats.width,
              height: stats.height,
              health: stats.health,
              maxHealth: stats.health,
              damage: stats.damage,
              color: stats.color,
              lastShot: Date.now()
            };
          }
        }

        // Update helper
        if (game.maxLevelHelperUnit) {
          const helper = game.maxLevelHelperUnit;
          
          // Find nearest enemy
          let closestEnemy = null;
          let closestDist = Infinity;
          
          game.enemies.forEach(enemy => {
            const dx = enemy.x + enemy.width / 2 - helper.x;
            const dy = enemy.y + enemy.height / 2 - helper.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          });

          // AI behavior
          if (closestEnemy && closestDist < 500) {
            const dx = closestEnemy.x - helper.x;
            const dy = closestEnemy.y - helper.y;
            const angle = Math.atan2(dy, dx);
            helper.vx = Math.cos(angle) * 4;
            helper.vy = Math.sin(angle) * 4;
          } else {
            // Follow player
            const dx = game.player.x - helper.x;
            const dy = game.player.y - helper.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 150) {
              const angle = Math.atan2(dy, dx);
              helper.vx = Math.cos(angle) * 3;
              helper.vy = Math.sin(angle) * 3;
            } else {
              helper.vx *= 0.9;
              helper.vy *= 0.9;
            }
          }

          helper.x += helper.vx;
          helper.y += helper.vy;

          // Shoot at enemies
          if (closestEnemy && closestDist < 450 && Date.now() - helper.lastShot > 800) {
            const dx = closestEnemy.x + closestEnemy.width / 2 - helper.x;
            const dy = closestEnemy.y + closestEnemy.height / 2 - helper.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            for (let i = 0; i < 3; i++) {
              const spreadAngle = Math.atan2(dy, dx) + (i - 1) * 0.15;
              game.bullets.push({
                x: helper.x,
                y: helper.y,
                vx: Math.cos(spreadAngle) * 12,
                vy: Math.sin(spreadAngle) * 12,
                damage: helper.damage,
                size: 10,
                color: helper.color,
                fromPlayer: true,
                fromHelper: true
              });
            }
            
            helper.lastShot = Date.now();
          }

          // Draw helper
          const screenX = helper.x - game.camera.x;
          const screenY = helper.y - game.camera.y;

          ctx.save();
          
          // Draw based on type
          if (helper.type === 'guangzhi') {
            // Simplified Guangzhi
            ctx.fillStyle = '#ff4500';
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 4;
            
            ctx.beginPath();
            ctx.ellipse(screenX, screenY, helper.width / 2, helper.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Flame aura
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(screenX, screenY, helper.width / 2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          } else if (helper.type === 'xiaowang') {
            // Dragon
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 3;
            
            for (let i = 0; i < 4; i++) {
              const y = screenY - helper.height / 2 + i * 20;
              ctx.beginPath();
              ctx.ellipse(screenX, y, 20 - i * 2, 15, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
          } else if (helper.type === 'longhaixing') {
            // Star
            ctx.fillStyle = '#22d3ee';
            ctx.strokeStyle = '#0e7490';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
              const x = screenX + Math.cos(angle) * helper.width / 2;
              const y = screenY + Math.sin(angle) * helper.height / 2;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (helper.type === 'zhongdalin') {
            // Stone person
            ctx.fillStyle = '#4ade80';
            ctx.strokeStyle = '#166534';
            ctx.lineWidth = 3;
            
            ctx.fillRect(screenX - helper.width / 2, screenY, helper.width, helper.height / 2);
            ctx.strokeRect(screenX - helper.width / 2, screenY, helper.width, helper.height / 2);
            
            ctx.beginPath();
            ctx.arc(screenX, screenY - 10, helper.width / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          // Health bar
          const healthPercent = helper.health / helper.maxHealth;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(screenX - helper.width / 2, screenY - helper.height / 2 - 15, helper.width, 8);
          ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : '#ef4444';
          ctx.fillRect(screenX - helper.width / 2, screenY - helper.height / 2 - 15, helper.width * healthPercent, 8);
          
          ctx.restore();

          // Collision with enemies
          game.enemies.forEach(enemy => {
            const dx = Math.abs(helper.x - (enemy.x + enemy.width / 2));
            const dy = Math.abs(helper.y - (enemy.y + enemy.height / 2));
            
            if (dx < (helper.width + enemy.width) / 2 && dy < (helper.height + enemy.height) / 2) {
              if (game.animationFrame % 30 === 0) {
                enemy.health -= helper.damage;
                helper.health -= enemy.damage * 0.5;
              }
            }
          });
        }
      } else {
        game.maxLevelHelperUnit = null;
      }

      // Update enemies
      game.enemies = game.enemies.filter(enemy => {
        // AI behavior - top-down movement
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        // Zhongdalin melee behavior
        if (enemy.behaviorType === 'melee' && enemy.name === 'zhongdalin') {
          // Ram attack - charge at player
          enemy.vx = (dx / distToPlayer) * enemy.speed;
          enemy.vy = (dy / distToPlayer) * enemy.speed;
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;

          // Collision damage (ram attack)
          if (distToPlayer < 60 && !isFlying && !isInShop) {
            if (game.animationFrame % 30 === 0) {
              onPlayerDamage(enemy.damage * 0.5);
            }
          }

          // Vine attack - slow moving vines
          if (Date.now() - enemy.lastShot > 3000 && distToPlayer < 400) {
            for (let i = 0; i < 3; i++) {
              const angle = Math.atan2(dy, dx) + (i - 1) * 0.4;
              game.enemyBullets.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                damage: enemy.damage * 0.7,
                size: 8,
                color: '#22c55e',
                type: 'vine'
              });
            }
            enemy.lastShot = Date.now();
          }
        } else if (enemy.behaviorType === 'patrol') {
          if (distToPlayer < 400) {
            enemy.state = 'attack';
            enemy.vx = (dx / distToPlayer) * enemy.speed;
            enemy.vy = (dy / distToPlayer) * enemy.speed;
          } else {
            enemy.patrolAngle += 0.02;
            enemy.vx = Math.cos(enemy.patrolAngle) * enemy.speed * 0.5;
            enemy.vy = Math.sin(enemy.patrolAngle) * enemy.speed * 0.5;
          }
        } else if (enemy.behaviorType === 'assault') {
          const nearestBuilding = game.buildings
            .filter(b => b.important)
            .sort((a, b) => {
              const distA = Math.sqrt((a.x - enemy.x)**2 + (a.y - enemy.y)**2);
              const distB = Math.sqrt((b.x - enemy.x)**2 + (b.y - enemy.y)**2);
              return distA - distB;
            })[0];
          
          if (nearestBuilding) {
            const bdx = nearestBuilding.x - enemy.x;
            const bdy = nearestBuilding.y - enemy.y;
            const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
            enemy.target = nearestBuilding;
            enemy.vx = (bdx / bdist) * enemy.speed;
            enemy.vy = (bdy / bdist) * enemy.speed;
          }
        } else if (enemy.behaviorType === 'flying') {
          const angle = Math.atan2(dy, dx);
          enemy.vx = Math.cos(angle + Math.sin(game.animationFrame * 0.05) * 0.5) * enemy.speed;
          enemy.vy = Math.sin(angle + Math.sin(game.animationFrame * 0.05) * 0.5) * enemy.speed;
        } else if (enemy.behaviorType === 'support') {
          enemy.vx = (dx / distToPlayer) * enemy.speed * 0.3;
          enemy.vy = (dy / distToPlayer) * enemy.speed * 0.3;
          
          if (enemy.buffAllies && game.animationFrame % 120 === 0) {
            game.enemies.forEach(ally => {
              if (ally !== enemy && ally.name !== 'commander') {
                const adx = ally.x - enemy.x;
                const ady = ally.y - enemy.y;
                const adist = Math.sqrt(adx * adx + ady * ady);
                if (adist < 250) {
                  ally.buffed = 60;
                }
              }
            });
          }
          
          if (Date.now() - game.lastObstacleCheck > 8000 && Math.random() < 0.3) {
            game.obstacles.push({
              x: enemy.x,
              y: enemy.y,
              width: 60,
              height: 60,
              type: 'barrier',
              health: 50
            });
            game.lastObstacleCheck = Date.now();
          }
        } else if (enemy.behaviorType === 'stealth') {
          if (Date.now() - (enemy.lastTeleport || 0) > 4000 && distToPlayer > 150) {
            const angle = Math.random() * Math.PI * 2;
            enemy.x = game.player.x + Math.cos(angle) * 100;
            enemy.y = game.player.y + Math.sin(angle) * 100;
            enemy.lastTeleport = Date.now();
            for (let i = 0; i < 15; i++) {
              game.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 20,
                color: '#8b5cf6',
                size: 4
              });
            }
          } else {
            const angle = Math.atan2(dy, dx);
            enemy.vx = Math.cos(angle) * enemy.speed;
            enemy.vy = Math.sin(angle) * enemy.speed;
          }
        } else if (enemy.behaviorType === 'stationary') {
          enemy.vx = 0;
          enemy.vy = 0;

          if (enemy.createsHazards && Date.now() - enemy.lastShot > enemy.shootInterval + 2000) {
            game.hazardZones.push({
              x: game.player.x + (Math.random() - 0.5) * 200,
              y: game.player.y + (Math.random() - 0.5) * 200,
              radius: 80,
              damage: 20,
              life: 100,
              warning: 50
            });
          }
        } else if (enemy.behaviorType === 'kamikaze') {
          // Rush towards player
          const angle = Math.atan2(dy, dx);
          enemy.vx = Math.cos(angle) * enemy.speed;
          enemy.vy = Math.sin(angle) * enemy.speed;

          // Explode if close to player
          if (distToPlayer < 60) {
            enemy.health = 0;
          }
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Enemy shooting (snipers have longer range) - skip for melee enemies
        const shootRange = enemy.longRange ? 800 : 600;
        if (enemy.behaviorType !== 'melee' && Date.now() - enemy.lastShot > enemy.shootInterval && distToPlayer < shootRange) {
          const target = enemy.target || game.player;
          const dx = (target.x || target.x) - enemy.x;
          const dy = ((target.y || target.y) + (target.height || 0) / 2) - (enemy.y + enemy.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          game.enemyBullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            vx: (dx / dist) * 8,
            vy: (dy / dist) * 8,
            damage: enemy.damage,
            size: 6,
            color: enemy.color,
            targetBuilding: enemy.attacksBuildings && enemy.target
          });
          
          enemy.lastShot = Date.now();
        }

        // Draw enemy
        if (enemy.x + enemy.width > game.camera.x && enemy.x < game.camera.x + CANVAS_WIDTH) {
          drawEnemy(ctx, enemy, game.camera, game.animationFrame);
        }

        return enemy.health > 0 && enemy.x > -200;
        });

        // Update flame attacks (for boss)
        if (currentBoss?.pattern === 'flame') {
        game.flameAttacks = game.flameAttacks.filter(flame => {
          flame.life--;
          flame.radius += 2;

          const screenX = flame.x - game.camera.x;
          const screenY = flame.y - game.camera.y;

          // Draw flame
          ctx.save();
          const alpha = flame.life / flame.maxLife;
          ctx.globalAlpha = alpha * 0.6;

          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, flame.radius);
          gradient.addColorStop(0, '#ff4500');
          gradient.addColorStop(0.5, '#ff6347');
          gradient.addColorStop(1, '#ff8c00');
          ctx.fillStyle = gradient;

          ctx.beginPath();
          ctx.arc(screenX, screenY, flame.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Flame particles
          if (flame.life % 3 === 0) {
            for (let i = 0; i < 5; i++) {
              game.particles.push({
                x: flame.x + (Math.random() - 0.5) * flame.radius,
                y: flame.y + (Math.random() - 0.5) * flame.radius,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 4,
                life: 20,
                color: Math.random() > 0.5 ? '#ff4500' : '#ffa500',
                size: 4
              });
            }
          }

          // Damage player
          if (!isFlying && !isInShop) {
            const dx = game.player.x + game.player.width / 2 - flame.x;
            const dy = game.player.y + game.player.height / 2 - flame.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < flame.radius && game.animationFrame % 15 === 0) {
              onPlayerDamage(flame.damage / 3);
            }
          }

          return flame.life > 0;
        });

        // Spawn flame attacks
        if (game.animationFrame % 180 === 0 && Math.random() < 0.3) {
          game.flameAttacks.push({
            x: game.player.x + (Math.random() - 0.5) * 300,
            y: game.player.y + (Math.random() - 0.5) * 300,
            radius: 20,
            damage: 60,
            life: 80,
            maxLife: 80
          });
        }
        }

        // Update explosions
        game.explosions = game.explosions.filter(explosion => {
        explosion.life--;
        explosion.radius += 3;

        const screenX = explosion.x - game.camera.x;
        const screenY = explosion.y - game.camera.y;

        // Draw explosion
        ctx.save();
        const alpha = explosion.life / 30;
        ctx.globalAlpha = alpha;

        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, explosion.radius);
        gradient.addColorStop(0, '#ffa500');
        gradient.addColorStop(0.5, '#ff6347');
        gradient.addColorStop(1, '#ff4500');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(screenX, screenY, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Explosion damage enemies
        if (explosion.life === 25) {
          game.enemies.forEach(enemy => {
            const dx = enemy.x + enemy.width / 2 - explosion.x;
            const dy = enemy.y + enemy.height / 2 - explosion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < explosion.radius) {
              enemy.health -= explosion.damage;
            }
          });
        }

        return explosion.life > 0;
        });

        // Update bullets
        game.bullets = game.bullets.filter(bullet => {
        // Homing logic
        if (bullet.isHoming && game.enemies.length > 0) {
          let closestEnemy = null;
          let closestDist = Infinity;

          game.enemies.forEach(enemy => {
            const dx = enemy.x + enemy.width / 2 - bullet.x;
            const dy = enemy.y + enemy.height / 2 - bullet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist && dist < 300) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          });

          if (closestEnemy) {
            const dx = closestEnemy.x + closestEnemy.width / 2 - bullet.x;
            const dy = closestEnemy.y + closestEnemy.height / 2 - bullet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const turnSpeed = 0.15;

            bullet.vx += (dx / dist) * turnSpeed;
            bullet.vy += (dy / dist) * turnSpeed;

            const speed = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);
            bullet.vx = (bullet.vx / speed) * 10;
            bullet.vy = (bullet.vy / speed) * 10;
          }
        }

        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.distanceTraveled += Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);

        // Check max distance
        if (bullet.distanceTraveled > bullet.maxDistance) {
          return false;
        }

        // Check boss collision (Bus Break mode)
        if (gameMode === 'busbreak' && game.busBreakBoss && currentBoss) {
          const boss = game.busBreakBoss;
          const bossRadius = currentBoss.size / 2;
          const dx = bullet.x - boss.x;
          const dy = bullet.y - boss.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < bossRadius) {
            onBossDamage(bullet.damage);
            
            const particleCount = bullet.isCannon ? 30 : 15;
            const particleColor = bullet.isCannon ? '#ff4500' : '#fbbf24';
            for (let i = 0; i < particleCount; i++) {
              game.particles.push({
                x: bullet.x,
                y: bullet.y,
                vx: (Math.random() - 0.5) * (bullet.isCannon ? 15 : 10),
                vy: (Math.random() - 0.5) * (bullet.isCannon ? 15 : 10),
                life: bullet.isCannon ? 35 : 25,
                color: particleColor,
                size: bullet.isCannon ? 6 : 4
              });
            }
            
            if (bullet.isCannon) {
              game.screenShake = 5;
            }
            
            return false;
          }
        }
        
        // Check enemy collision
        for (let enemy of game.enemies) {
          if (enemy.canDodge && Math.random() < 0.15) {
            enemy.dodging = true;
            setTimeout(() => { enemy.dodging = false; }, 300);
            continue;
          }
          
          if (enemy.shielded && !enemy.shieldBroken) {
            enemy.shieldHealth = enemy.shieldHealth || 50;
            enemy.shieldHealth -= bullet.damage * 0.3;
            if (enemy.shieldHealth <= 0) {
              enemy.shieldBroken = true;
            }
            continue;
          }
          
          if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
              bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
            const damageMultiplier = enemy.buffed ? 0.7 : 1;
            enemy.health -= bullet.damage * damageMultiplier;
            if (enemy.buffed) enemy.buffed--;

            // Cannon explosion with screen shake
            if (bullet.isCannon) {
              game.screenShake = 4;
              game.explosions.push({
                x: bullet.x,
                y: bullet.y,
                radius: 10,
                damage: bullet.damage * 0.5,
                life: 30
              });

              // Extra explosion particles
              for (let i = 0; i < 10; i++) {
                game.particles.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 25,
                  color: '#ff6347',
                  size: 4
                });
              }
            }

            // Hit particles
            const particleCount = bullet.isCannon ? 20 : 10;
            const particleColor = bullet.isCannon ? '#ff4500' : '#fbbf24';
            for (let i = 0; i < particleCount; i++) {
              game.particles.push({
                x: bullet.x,
                y: bullet.y,
                vx: (Math.random() - 0.5) * (bullet.isCannon ? 12 : 8),
                vy: (Math.random() - 0.5) * (bullet.isCannon ? 12 : 8),
                life: bullet.isCannon ? 30 : 20,
                color: particleColor,
                size: bullet.isCannon ? 5 : 3
              });
            }

            if (enemy.health <= 0) {
              // Track tower mode kills
              if (gameMode === 'tower' && enemy.name === 'zhongdalin') {
                game.towerKillCount = (game.towerKillCount || 0) + 1;
              }
              
              onEnemyKill(enemy.name);
              game.screenShake = 3;

              // Bomber explosion on death
              if (enemy.explodeOnDeath) {
                game.screenShake = 10;
                game.explosions.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y + enemy.height / 2,
                  radius: 10,
                  damage: 80,
                  life: 30
                });
              }

              // Death explosion
              for (let i = 0; i < 25; i++) {
                game.particles.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y + enemy.height / 2,
                  vx: (Math.random() - 0.5) * 12,
                  vy: (Math.random() - 0.5) * 12,
                  life: 35,
                  color: enemy.color,
                  size: 5
                });
              }
            }

            return false;
          }
        }

        // Check obstacle collision
        for (let obstacle of game.obstacles) {
          if (bullet.x > obstacle.x && bullet.x < obstacle.x + obstacle.width &&
              bullet.y > obstacle.y && bullet.y < obstacle.y + obstacle.height) {
            obstacle.health -= bullet.damage;
            return false;
          }
        }

        // Draw bullet with trail effects
        const screenX = bullet.x - game.camera.x;
        const screenY = bullet.y - game.camera.y;

        ctx.save();

        if (bullet.isCannon) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ff4500';

          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, bullet.size);
          gradient.addColorStop(0, '#fff');
          gradient.addColorStop(0.3, '#ffa500');
          gradient.addColorStop(0.7, '#ff6347');
          gradient.addColorStop(1, '#ff4500');
          ctx.fillStyle = gradient;

          // Cannon bullet trail
          for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = 0.3 / i;
            ctx.beginPath();
            ctx.arc(screenX - bullet.vx * i * 0.5, screenY - bullet.vy * i * 0.5, bullet.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (bullet.isHoming) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#a855f7';

          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, bullet.size);
          gradient.addColorStop(0, '#fff');
          gradient.addColorStop(0.4, '#e879f9');
          gradient.addColorStop(0.8, '#c084fc');
          gradient.addColorStop(1, '#a855f7');
          ctx.fillStyle = gradient;

          // Homing trail
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX - bullet.vx * 3, screenY - bullet.vy * 3);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#fbbf24';
          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, bullet.size);
          gradient.addColorStop(0, '#fff');
          gradient.addColorStop(0.5, '#fbbf24');
          gradient.addColorStop(1, '#f59e0b');
          ctx.fillStyle = gradient;
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return bullet.x > -50 && bullet.x < WORLD_WIDTH + 50;
      });

      // Update enemy bullets
      game.enemyBullets = game.enemyBullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Check player collision
        if (!isFlying && !isInShop &&
            bullet.x > game.player.x && bullet.x < game.player.x + game.player.width &&
            bullet.y > game.player.y && bullet.y < game.player.y + game.player.height) {
          onPlayerDamage(bullet.damage);
          
          for (let i = 0; i < 8; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 15,
              color: '#ef4444',
              size: 3
            });
          }
          return false;
        }

        // Check building collision
        if (bullet.targetBuilding) {
          for (let building of game.buildings) {
            if (bullet.x > building.x && bullet.x < building.x + building.width &&
                bullet.y > building.y && bullet.y < building.y + building.height) {
              building.health -= bullet.damage;
              
              for (let i = 0; i < 5; i++) {
                game.particles.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: -Math.random() * 4,
                  life: 20,
                  color: '#78716c',
                  size: 4
                });
              }
              return false;
            }
          }
        }

        // Draw bullet
        const screenX = bullet.x - game.camera.x;
        const screenY = bullet.y - game.camera.y;
        
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = bullet.color;
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return bullet.x > -50 && bullet.x < WORLD_WIDTH + 50;
      });

      // Update hazard zones
      game.hazardZones = game.hazardZones.filter(zone => {
        zone.life--;
        
        const screenX = zone.x - game.camera.x;
        const screenY = zone.y - game.camera.y;
        
        if (zone.life > zone.warning) {
          // Warning indicator
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(screenX, screenY, zone.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else if (zone.life > 0) {
          // Active hazard
          ctx.save();
          const alpha = zone.life / zone.warning;
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, zone.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // Damage player
          const dx = game.player.x - zone.x;
          const dy = game.player.y - zone.y;
          if (Math.sqrt(dx * dx + dy * dy) < zone.radius && !isFlying && !isInShop) {
            if (game.animationFrame % 30 === 0) {
              onPlayerDamage(zone.damage / 5);
            }
          }
        }
        
        return zone.life > 0;
      });

      // Update obstacles
      game.obstacles = game.obstacles.filter(obstacle => {
        if (obstacle.health <= 0) return false;
        
        const screenX = obstacle.x - game.camera.x;
        const screenY = obstacle.y - game.camera.y;
        
        ctx.save();
        ctx.fillStyle = '#57534e';
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 3;
        ctx.fillRect(screenX, screenY, obstacle.width, obstacle.height);
        ctx.strokeRect(screenX, screenY, obstacle.width, obstacle.height);
        
        // Metal bars pattern
        ctx.fillStyle = '#78716c';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(screenX + i * 20 + 5, screenY, 8, obstacle.height);
        }
        ctx.restore();
        
        return true;
      });

      // Update particles
      game.particles = game.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.3;
        particle.life--;

        const screenX = particle.x - game.camera.x;
        const screenY = particle.y - game.camera.y;
        
        const alpha = particle.life / 40;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return particle.life > 0;
      });

      // Draw aiming indicator
      if (moveX !== 0 || moveY !== 0) {
        const screenX = game.player.x - game.camera.x + game.player.width / 2;
        const screenY = game.player.y - game.camera.y + game.player.height / 2;
        const aimLength = 80;
        const aimEndX = screenX + Math.cos(game.player.angle) * aimLength;
        const aimEndY = screenY + Math.sin(game.player.angle) * aimLength;

        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(aimEndX, aimEndY);
        ctx.stroke();
        
        // Aim point
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(aimEndX, aimEndY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Draw chichao flame line
      if (selectedWeapon === 'chichao' && game.flameLineActive) {
        const px = game.player.x - game.camera.x + game.player.width / 2;
        const py = game.player.y - game.camera.y + game.player.height / 2;
        const angle = game.player.angle;
        const flameLength = 350;
        
        ctx.save();
        const endX = px + Math.cos(angle) * flameLength;
        const endY = py + Math.sin(angle) * flameLength;
        
        const gradient = ctx.createLinearGradient(px, py, endX, endY);
        gradient.addColorStop(0, 'rgba(255, 69, 0, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20 + Math.sin(game.animationFrame * 0.3) * 4;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff4500';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
      }

      // Draw guigui beam
      if (selectedWeapon === 'guigui' && game.isHoldingK) {
        const px = game.player.x - game.camera.x + game.player.width / 2;
        const py = game.player.y - game.camera.y + game.player.height / 2;
        const angle = game.player.angle;
        const beamLength = 400;
        
        ctx.save();
        for (let i = 0; i < 3; i++) {
          const spreadAngle = angle + (i - 1) * 0.08;
          const endX = px + Math.cos(spreadAngle) * beamLength;
          const endY = py + Math.sin(spreadAngle) * beamLength;
          
          const gradient = ctx.createLinearGradient(px, py, endX, endY);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
          gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.5)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 15 + Math.sin(game.animationFrame * 0.3) * 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#22c55e';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw player
      drawPlayer(ctx, game.player, isFlying || isInShop, game.camera, game.animationFrame, playerColor);
      
      // Draw shop invincibility indicator
      if (isInShop) {
        const screenX = game.player.x - game.camera.x + game.player.width / 2;
        const screenY = game.player.y - game.camera.y + game.player.height / 2;
        
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.6 + Math.sin(game.animationFrame * 0.15) * 0.3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 40 + Math.sin(game.animationFrame * 0.1) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Draw melee attack circle - 360 degrees
      if (isMeleeAttacking) {
        const screenX = game.player.x - game.camera.x + game.player.width / 2;
        const screenY = game.player.y - game.camera.y + game.player.height / 2;

        ctx.save();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 8;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#60a5fa';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 75, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Restore from screen shake
      if (game.screenShake > 0) {
        ctx.restore();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameState, isFlying, shoot, heal, fly, onPlayerDamage, onEnemyKill, onBossDamage, upgrades, generateWorld, spawnEnemy]);

  return (
    <motion.canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  );
}

function drawBackground(ctx, camera, frame, gameMode, WORLD_WIDTH, WORLD_HEIGHT) {
  // Check if tower mode
  if (gameMode === 'tower') {
    // Tower stone floor
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Stone tiles
  ctx.save();
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 2;
  const tileSize = 100;
  
  for (let y = -tileSize; y < CANVAS_HEIGHT + tileSize; y += tileSize) {
    for (let x = -tileSize; x < CANVAS_WIDTH + tileSize; x += tileSize) {
      const worldX = x + camera.x;
      const worldY = y + camera.y;
      const tileX = x - (camera.x % tileSize);
      const tileY = y - (camera.y % tileSize);
      
      // Darker tiles for pattern
      if ((Math.floor(worldX / tileSize) + Math.floor(worldY / tileSize)) % 2 === 0) {
        ctx.fillStyle = '#3a4556';
      } else {
        ctx.fillStyle = '#4a5568';
      }
      ctx.fillRect(tileX, tileY, tileSize, tileSize);
      ctx.strokeRect(tileX, tileY, tileSize, tileSize);
    }
  }
  ctx.restore();
  
  // Tower walls on edges
  ctx.save();
  const wallThickness = 40;
  ctx.fillStyle = '#1a202c';
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 4;
  
  // Left wall
  if (camera.x < 200) {
    const wallX = -camera.x;
    ctx.fillRect(wallX, 0, wallThickness, CANVAS_HEIGHT);
    ctx.strokeRect(wallX, 0, wallThickness, CANVAS_HEIGHT);
    // Wall bricks
    ctx.fillStyle = '#2d3748';
    for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
      ctx.fillRect(wallX + 5, i, 10, 20);
      ctx.fillRect(wallX + 25, i + 15, 10, 20);
    }
  }
  
  // Right wall
  if (camera.x > WORLD_WIDTH - CANVAS_WIDTH - 200) {
    const wallX = WORLD_WIDTH - camera.x - wallThickness;
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(wallX, 0, wallThickness, CANVAS_HEIGHT);
    ctx.strokeRect(wallX, 0, wallThickness, CANVAS_HEIGHT);
    ctx.fillStyle = '#2d3748';
    for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
      ctx.fillRect(wallX + 5, i, 10, 20);
      ctx.fillRect(wallX + 25, i + 15, 10, 20);
    }
  }
  
  // Top wall
  if (camera.y < 200) {
    const wallY = -camera.y;
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, wallY, CANVAS_WIDTH, wallThickness);
    ctx.strokeRect(0, wallY, CANVAS_WIDTH, wallThickness);
  }
  
  // Bottom wall
  if (camera.y > WORLD_HEIGHT - CANVAS_HEIGHT - 200) {
    const wallY = WORLD_HEIGHT - camera.y - wallThickness;
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, wallY, CANVAS_WIDTH, wallThickness);
    ctx.strokeRect(0, wallY, CANVAS_WIDTH, wallThickness);
  }
  ctx.restore();
  
  // Scattered debris
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 50; i++) {
    const worldX = (i * 157 + 73) % 1800;
    const worldY = (i * 193 + 103) % 2000;
    const x = worldX - camera.x;
    const y = worldY - camera.y;
    
    if (x < -30 || x > CANVAS_WIDTH + 30 || y < -30 || y > CANVAS_HEIGHT + 30) continue;
    
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(x, y, 8 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
    return;
  }
  
  // Original background for other modes
  const grassGradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH
  );
  grassGradient.addColorStop(0, '#7cb342');
  grassGradient.addColorStop(0.6, '#689f38');
  grassGradient.addColorStop(1, '#558b2f');
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 200; i++) {
    const worldX = (i * 67 + 23) % 4000;
    const worldY = (i * 91 + 41) % 3000;
    const x = worldX - camera.x;
    const y = worldY - camera.y;
    if (x < -30 || x > CANVAS_WIDTH + 30 || y < -30 || y > CANVAS_HEIGHT + 30) continue;
    ctx.fillStyle = i % 3 === 0 ? '#558b2f' : '#689f38';
    ctx.beginPath();
    ctx.ellipse(x, y, 15 + (i % 8), 8 + (i % 5), i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBuilding(ctx, building, camera) {
  const x = building.x - camera.x;
  const y = building.y - camera.y;
  
  ctx.save();
  
  if (building.type === 'house') {
    // Walls
    ctx.fillStyle = '#e7e5e4';
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, building.width, building.height);
    ctx.strokeRect(x, y, building.width, building.height);
    
    // Door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + building.width / 2 - 12, y + building.height - 35, 24, 35);
    ctx.strokeRect(x + building.width / 2 - 12, y + building.height - 35, 24, 35);
    
    // Windows
    ctx.fillStyle = '#93c5fd';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.fillRect(x + 15, y + 20, 20, 20);
    ctx.strokeRect(x + 15, y + 20, 20, 20);
    ctx.fillRect(x + building.width - 35, y + 20, 20, 20);
    ctx.strokeRect(x + building.width - 35, y + 20, 20, 20);
    ctx.fillRect(x + 15, y + 55, 20, 20);
    ctx.strokeRect(x + 15, y + 55, 20, 20);
    ctx.fillRect(x + building.width - 35, y + 55, 20, 20);
    ctx.strokeRect(x + building.width - 35, y + 55, 20, 20);
    
  } else if (building.type === 'tower') {
    // Main structure
    ctx.fillStyle = '#9ca3af';
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 4;
    ctx.fillRect(x, y, building.width, building.height);
    ctx.strokeRect(x, y, building.width, building.height);
    
    // Stone bricks
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    for (let i = 0; i < building.height; i += 25) {
      for (let j = 0; j < building.width; j += 30) {
        ctx.strokeRect(x + j, y + i, 30, 25);
      }
    }
    
    // Windows
    ctx.fillStyle = '#1e293b';
    for (let i = 30; i < building.height - 30; i += 50) {
      ctx.fillRect(x + building.width / 2 - 12, y + i, 24, 35);
    }
    
    // Top
    ctx.fillStyle = '#6b7280';
    for (let i = 0; i < building.width; i += 20) {
      ctx.fillRect(x + i, y - 15, 15, 15);
    }
    
  } else if (building.type === 'bunker') {
    // Base
    ctx.fillStyle = '#78716c';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 4;
    ctx.fillRect(x, y + 20, building.width, building.height - 20);
    ctx.strokeRect(x, y + 20, building.width, building.height - 20);
    
    // Top dome
    ctx.fillStyle = '#57534e';
    ctx.strokeStyle = '#292524';
    ctx.beginPath();
    ctx.arc(x + building.width / 2, y + 20, building.width / 2, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    
    // Entrance
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + building.width / 2 - 20, y + 60, 40, 40);
    ctx.strokeRect(x + building.width / 2 - 20, y + 60, 40, 40);
    
    // Metal plates
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 2;
    for (let i = 0; i < building.width; i += 40) {
      ctx.strokeRect(x + i, y + 30, 40, 35);
    }
  }
  
  ctx.restore();
}

function drawPlayer(ctx, player, isFlying, camera, frame, playerColor = 'green') {
  const x = player.x - camera.x;
  const y = player.y - camera.y;
  
  ctx.save();
  ctx.translate(x + player.width / 2, y + player.height / 2);
  ctx.rotate(player.angle + Math.PI / 2);
  
  // Flying glow
  if (isFlying) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#38bdf8';
  }
  
  const bobOffset = Math.sin(frame * 0.15) * 1.5;

  // Custom player color support
  const shellColors = {
    green: { light: '#4a7c2f', mid: '#2d5016', dark: '#1a3010', accent: '#6b9b4c' },
    blue: { light: '#3b82f6', mid: '#1d4ed8', dark: '#1e3a8a', accent: '#60a5fa' },
    red: { light: '#ef4444', mid: '#b91c1c', dark: '#7f1d1d', accent: '#f87171' },
    purple: { light: '#a855f7', mid: '#7e22ce', dark: '#581c87', accent: '#c084fc' },
    yellow: { light: '#eab308', mid: '#ca8a04', dark: '#854d0e', accent: '#fde047' }
  };
  const colors = shellColors[playerColor] || shellColors.green;

  const shellGradient = ctx.createRadialGradient(0, bobOffset - 15, 0, 0, bobOffset - 15, 22);
  shellGradient.addColorStop(0, colors.light);
  shellGradient.addColorStop(0.5, colors.mid);
  shellGradient.addColorStop(1, colors.dark);
  ctx.fillStyle = shellGradient;
  ctx.strokeStyle = '#1a3010';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, bobOffset - 15, 22, 18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Shell hexagon pattern
  ctx.fillStyle = colors.accent;
  ctx.strokeStyle = colors.light;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i;
    const px = Math.cos(angle) * 10;
    const py = Math.sin(angle) * 8 + bobOffset - 15;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  
  // Center shell ornament
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, bobOffset - 15, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = colors.accent;
  ctx.strokeStyle = colors.light;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, bobOffset - 22, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-3, bobOffset - 24, 2.5, 0, Math.PI * 2);
  ctx.arc(3, bobOffset - 24, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-3, bobOffset - 24, 1.2, 0, Math.PI * 2);
  ctx.arc(3, bobOffset - 24, 1.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Legs
  const legBob = Math.sin(frame * 0.2) * 2;
  ctx.fillStyle = colors.accent;
  ctx.strokeStyle = colors.light;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.ellipse(-12, bobOffset, 5, 9, legBob * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.ellipse(12, bobOffset, 5, 9, -legBob * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.ellipse(-8, bobOffset + 12, 5, 8, legBob * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.ellipse(8, bobOffset + 12, 5, 8, -legBob * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

function drawEnemy(ctx, enemy, camera, frame) {
  const x = enemy.x - camera.x;
  const y = enemy.y - camera.y;
  
  ctx.save();
  
  if (enemy.name === 'soldier') {
    // Robot soldier
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Body
    ctx.fillRect(x + 10, y + 15, 20, 25);
    ctx.strokeRect(x + 10, y + 15, 20, 25);
    
    // Head
    ctx.fillRect(x + 12, y, 16, 15);
    ctx.strokeRect(x + 12, y, 16, 15);
    
    // Eye
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 17, y + 5, 6, 4);
    
    // Arms
    ctx.fillStyle = enemy.color;
    ctx.fillRect(x + 5, y + 20, 5, 15);
    ctx.fillRect(x + 30, y + 20, 5, 15);
    
    // Legs
    ctx.fillRect(x + 13, y + 40, 6, 10);
    ctx.fillRect(x + 21, y + 40, 6, 10);
    
  } else if (enemy.name === 'tank') {
    // Tank
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    
    // Treads
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 5, y + 40, 70, 15);
    ctx.strokeRect(x + 5, y + 40, 70, 15);
    
    // Body
    ctx.fillStyle = enemy.color;
    ctx.fillRect(x + 10, y + 20, 60, 20);
    ctx.strokeRect(x + 10, y + 20, 60, 20);
    
    // Turret
    ctx.beginPath();
    ctx.arc(x + 40, y + 20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Cannon
    ctx.fillRect(x + 50, y + 16, 25, 8);
    ctx.strokeRect(x + 50, y + 16, 25, 8);
    
  } else if (enemy.name === 'drone') {
    // Flying drone
    const hover = Math.sin(frame * 0.1) * 3;
    
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Body
    ctx.beginPath();
    ctx.arc(x + 17, y + 17 + hover, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Propellers
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i + frame * 0.2;
      const px = x + 17 + Math.cos(angle) * 15;
      const py = y + 17 + hover + Math.sin(angle) * 15;
      
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Camera/eye
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + 17, y + 17 + hover, 5, 0, Math.PI * 2);
    ctx.fill();
    
  } else if (enemy.name === 'engineer') {
    // Engineer robot
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Body
    ctx.fillRect(x + 10, y + 15, 20, 25);
    ctx.strokeRect(x + 10, y + 15, 20, 25);
    
    // Head with antenna
    ctx.fillRect(x + 12, y, 16, 15);
    ctx.strokeRect(x + 12, y, 16, 15);
    
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 20, y);
    ctx.lineTo(x + 20, y - 8);
    ctx.stroke();
    
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + 20, y - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Tool arm
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 25);
    ctx.lineTo(x + 40, y + 20);
    ctx.stroke();
    
  } else if (enemy.name === 'artillery') {
    // Artillery unit
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    // Base
    ctx.fillRect(x + 5, y + 35, 60, 20);
    ctx.strokeRect(x + 5, y + 35, 60, 20);

    // Platform
    ctx.fillRect(x + 15, y + 20, 40, 15);
    ctx.strokeRect(x + 15, y + 20, 40, 15);

    // Barrel
    ctx.save();
    ctx.translate(x + 35, y + 27);
    ctx.rotate(-0.3);
    ctx.fillRect(0, -4, 35, 8);
    ctx.strokeRect(0, -4, 35, 8);
    ctx.restore();

  } else if (enemy.name === 'sniper') {
    // Sniper unit
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Body
    ctx.fillRect(x + 10, y + 20, 25, 30);
    ctx.strokeRect(x + 10, y + 20, 25, 30);

    // Head
    ctx.fillRect(x + 12, y + 5, 21, 15);
    ctx.strokeRect(x + 12, y + 5, 21, 15);

    // Sniper scope
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(x + 18, y + 10, 9, 5);

    // Long rifle
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 35, y + 30);
    ctx.lineTo(x + 55, y + 25);
    ctx.stroke();

  } else if (enemy.name === 'healer') {
    // Healer unit
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Body
    ctx.fillRect(x + 11, y + 18, 16, 25);
    ctx.strokeRect(x + 11, y + 18, 16, 25);

    // Head
    ctx.fillRect(x + 13, y + 5, 12, 13);
    ctx.strokeRect(x + 13, y + 5, 12, 13);

    // Medical cross
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 16, y + 8, 6, 2);
    ctx.fillRect(x + 17, y + 7, 4, 4);

    // Healing aura
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.1) * 0.3;
    ctx.beginPath();
    ctx.arc(x + 19, y + 30, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

  } else if (enemy.name === 'scout') {
    // Scout - fast light unit
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Slim body
    ctx.fillRect(x + 12, y + 18, 14, 22);
    ctx.strokeRect(x + 12, y + 18, 14, 22);

    // Head
    ctx.fillRect(x + 14, y + 5, 10, 13);
    ctx.strokeRect(x + 14, y + 5, 10, 13);

    // Visor
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(x + 16, y + 9, 6, 4);

  } else if (enemy.name === 'heavy') {
    // Heavy armored unit
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    // Large body
    ctx.fillRect(x + 5, y + 25, 50, 35);
    ctx.strokeRect(x + 5, y + 25, 50, 35);

    // Head
    ctx.fillRect(x + 15, y + 5, 30, 20);
    ctx.strokeRect(x + 15, y + 5, 30, 20);

    // Armor plates
    ctx.fillStyle = '#52525b';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 10 + i * 13, y + 30, 10, 10);
    }

  } else if (enemy.name === 'assassin') {
    // Assassin - ninja style
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Body
    ctx.fillRect(x + 12, y + 18, 14, 25);
    ctx.strokeRect(x + 12, y + 18, 14, 25);

    // Head with mask
    ctx.fillRect(x + 14, y + 5, 10, 13);
    ctx.strokeRect(x + 14, y + 5, 10, 13);

    // Eyes only
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 16, y + 9, 2, 2);
    ctx.fillRect(x + 20, y + 9, 2, 2);

    // Shadow trail
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(x + 19 - 5, y + 30, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

  } else if (enemy.name === 'mage') {
    // Mage with staff
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Robe
    ctx.beginPath();
    ctx.moveTo(x + 19, y + 15);
    ctx.lineTo(x + 10, y + 50);
    ctx.lineTo(x + 28, y + 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillRect(x + 14, y + 5, 10, 10);
    ctx.strokeRect(x + 14, y + 5, 10, 10);

    // Hat
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.moveTo(x + 19, y);
    ctx.lineTo(x + 12, y + 5);
    ctx.lineTo(x + 26, y + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Staff
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 20);
    ctx.lineTo(x + 5, y + 45);
    ctx.stroke();

    // Magic orb
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(x + 5, y + 17, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (enemy.name === 'warrior') {
    // Warrior with sword
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Body
    ctx.fillRect(x + 12, y + 20, 24, 30);
    ctx.strokeRect(x + 12, y + 20, 24, 30);

    // Head
    ctx.fillRect(x + 15, y + 5, 18, 15);
    ctx.strokeRect(x + 15, y + 5, 18, 15);

    // Helmet horn
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(x + 24, y);
    ctx.lineTo(x + 20, y + 5);
    ctx.lineTo(x + 28, y + 5);
    ctx.closePath();
    ctx.fill();

    // Sword
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 38, y + 25);
    ctx.lineTo(x + 48, y + 20);
    ctx.stroke();

  } else if (enemy.name === 'bomber') {
    // Bomber unit
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Body with bombs
    ctx.beginPath();
    ctx.arc(x + 25, y + 25, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Warning symbol
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 15);
    ctx.lineTo(x + 30, y + 25);
    ctx.lineTo(x + 20, y + 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.fillRect(x + 24, y + 20, 2, 3);

    // Bombs attached
    ctx.fillStyle = '#1c1917';
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i + frame * 0.05;
      const bx = x + 25 + Math.cos(angle) * 15;
      const by = y + 25 + Math.sin(angle) * 15;
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (enemy.name === 'zhongdalin') {
    // Zhongdalin - stone with head on top
    ctx.fillStyle = '#4ade80';
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;

    // Stone body (rectangular base)
    const bodyHeight = enemy.height * 0.65;
    const headHeight = enemy.height * 0.35;
    
    ctx.fillRect(x + 5, y + headHeight, enemy.width - 10, bodyHeight);
    ctx.strokeRect(x + 5, y + headHeight, enemy.width - 10, bodyHeight);

    // Stone texture - horizontal lines
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 4; i++) {
      const sy = y + headHeight + 10 + i * 12;
      ctx.fillRect(x + 8, sy, enemy.width - 16, 6);
    }

    // Cracks on stone
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + headHeight + 15);
    ctx.lineTo(x + 20, y + headHeight + 25);
    ctx.moveTo(x + 35, y + headHeight + 20);
    ctx.lineTo(x + 32, y + headHeight + 35);
    ctx.stroke();

    // Head on top of stone
    ctx.fillStyle = '#4ade80';
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + enemy.width / 2, y + headHeight * 0.6, headHeight * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(x + enemy.width / 2 - 8, y + headHeight * 0.5, 3, 0, Math.PI * 2);
    ctx.arc(x + enemy.width / 2 + 8, y + headHeight * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyebrows
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + enemy.width / 2 - 12, y + headHeight * 0.4);
    ctx.lineTo(x + enemy.width / 2 - 5, y + headHeight * 0.45);
    ctx.moveTo(x + enemy.width / 2 + 12, y + headHeight * 0.4);
    ctx.lineTo(x + enemy.width / 2 + 5, y + headHeight * 0.45);
    ctx.stroke();

    // Angry mouth
    ctx.beginPath();
    ctx.moveTo(x + enemy.width / 2 - 6, y + headHeight * 0.75);
    ctx.lineTo(x + enemy.width / 2, y + headHeight * 0.7);
    ctx.lineTo(x + enemy.width / 2 + 6, y + headHeight * 0.75);
    ctx.stroke();

    // Green aura for aggression
    if (frame % 20 < 10) {
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(x + enemy.width / 2, y + enemy.height / 2, enemy.width / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();
  }