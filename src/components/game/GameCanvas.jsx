import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const CANVAS_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;
const CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 3000;

// Enemy types with unique behaviors
const ENEMY_TYPES = {
  SOLDIER: {
    name: 'soldier',
    width: 40,
    height: 50,
    speed: 1.5,
    health: 40,
    damage: 10,
    shootInterval: 4000,
    color: '#7c3aed',
    behaviorType: 'patrol',
    attacksBuildings: false
  },
  TANK: {
    name: 'tank',
    width: 80,
    height: 60,
    speed: 0.8,
    health: 100,
    damage: 25,
    shootInterval: 5000,
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
    shootInterval: 3000,
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
    shootInterval: 7000,
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
    shootInterval: 6000,
    color: '#65a30d',
    behaviorType: 'stationary',
    attacksBuildings: true,
    createsHazards: true
  }
};

export default function GameCanvas({
  gameState,
  onPlayerDamage,
  onEnemyKill,
  onBossDamage,
  onTriggerBoss,
  shoot,
  heal,
  fly,
  largeAttack,
  allOutAttack,
  isFlying,
  isAllOutAttack,
  currentBoss,
  defeatedBosses,
  score,
  upgrades,
  hasCannonUpgrade,
  hasHomingBullets
}) {
  const canvasRef = useRef(null);
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
    particles: [],
    obstacles: [],
    hazardZones: [],
    buildings: [],
    explosions: [],
    flameAttacks: [],
    keys: {},
    lastEnemySpawn: 0,
    lastObstacleCheck: 0,
    animationFrame: 0,
    worldGenerated: false
  });

  const generateWorld = useCallback(() => {
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
  }, []);

  const spawnEnemy = useCallback((type = null) => {
    if (!type) {
      const types = Object.values(ENEMY_TYPES);
      type = types[Math.floor(Math.random() * types.length)];
    }

    const side = Math.floor(Math.random() * 4);
    let spawnX, spawnY;
    
    switch(side) {
      case 0: spawnX = Math.random() * WORLD_WIDTH; spawnY = -50; break;
      case 1: spawnX = WORLD_WIDTH + 50; spawnY = Math.random() * WORLD_HEIGHT; break;
      case 2: spawnX = Math.random() * WORLD_WIDTH; spawnY = WORLD_HEIGHT + 50; break;
      default: spawnX = -50; spawnY = Math.random() * WORLD_HEIGHT; break;
    }
    
    return {
      ...type,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      health: type.health,
      maxHealth: type.health,
      lastShot: Date.now(),
      state: 'patrol',
      target: null,
      patrolAngle: Math.random() * Math.PI * 2,
      stunned: false
    };
  }, []);

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
      
      if (e.key.toLowerCase() === 'k') {
        if (shoot()) {
          const angle = game.player.angle;
          const baseSpeed = hasHomingBullets ? 10 : 15;
          const bulletDamage = hasCannonUpgrade ? 25 * upgrades.damage : 10 * upgrades.damage;
          const bulletSize = hasCannonUpgrade ? 12 : 8;

          const bullet = {
            x: game.player.x + game.player.width / 2,
            y: game.player.y + game.player.height / 2,
            vx: Math.cos(angle) * baseSpeed,
            vy: Math.sin(angle) * baseSpeed,
            damage: bulletDamage,
            size: bulletSize,
            fromPlayer: true,
            isCannon: hasCannonUpgrade,
            isHoming: hasHomingBullets,
            distanceTraveled: 0,
            maxDistance: hasHomingBullets ? 400 : 800
          };
          game.bullets.push(bullet);

          // Muzzle flash
          const flashCount = hasCannonUpgrade ? 15 : 8;
          const flashColor = hasCannonUpgrade ? '#ff4500' : '#fbbf24';
          for (let i = 0; i < flashCount; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: Math.cos(angle) * (Math.random() * 5 + 3),
              vy: Math.sin(angle) * (Math.random() * 5 + 3) + (Math.random() - 0.5) * 4,
              life: hasCannonUpgrade ? 20 : 15,
              color: flashColor,
              size: hasCannonUpgrade ? 5 : 3
            });
          }
        }
      }
      
      if (e.key.toLowerCase() === 'h') {
        if (heal()) {
          for (let i = 0; i < 20; i++) {
            game.particles.push({
              x: game.player.x + game.player.width / 2,
              y: game.player.y + game.player.height / 2,
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

      if (e.key.toLowerCase() === 'l') {
        if (largeAttack()) {
          // 100 bullets in all directions
          for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 / 100) * i;
            const bulletDamage = hasCannonUpgrade ? 30 * upgrades.damage : 15 * upgrades.damage;
            const bulletSize = hasCannonUpgrade ? 14 : 10;

            game.bullets.push({
              x: game.player.x + game.player.width / 2,
              y: game.player.y + game.player.height / 2,
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

          // Epic particles
          const particleColor = hasCannonUpgrade ? '#ff4500' : '#fbbf24';
          for (let i = 0; i < 50; i++) {
            game.particles.push({
              x: game.player.x + game.player.width / 2,
              y: game.player.y + game.player.height / 2,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 50,
              color: particleColor,
              size: 8
            });
          }
        }
      }

      if (e.key.toLowerCase() === 'p') {
        if (allOutAttack()) {
          // Kill all enemies instantly
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

          // Epic explosion particles
          for (let i = 0; i < 100; i++) {
            game.particles.push({
              x: game.player.x + game.player.width / 2,
              y: game.player.y + game.player.height / 2,
              vx: (Math.random() - 0.5) * 20,
              vy: (Math.random() - 0.5) * 20,
              life: 80,
              color: '#ef4444',
              size: 10
            });
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      game.keys[e.key.toLowerCase()] = false;
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
      drawBackground(ctx, game.camera, game.animationFrame);

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

      // Spawn enemies
      if (Date.now() - game.lastEnemySpawn > 3000) {
        game.enemies.push(spawnEnemy());
        game.lastEnemySpawn = Date.now();
      }

      // Update enemies
      game.enemies = game.enemies.filter(enemy => {
        // AI behavior - top-down movement
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        
        if (enemy.behaviorType === 'patrol') {
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
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Enemy shooting
        if (Date.now() - enemy.lastShot > enemy.shootInterval) {
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
          if (!isFlying) {
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

        // Check enemy collision
        for (let enemy of game.enemies) {
          if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
              bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
            enemy.health -= bullet.damage;

            // Cannon explosion
            if (bullet.isCannon) {
              game.explosions.push({
                x: bullet.x,
                y: bullet.y,
                radius: 10,
                damage: bullet.damage * 0.5,
                life: 30
              });
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
              onEnemyKill(enemy.name);

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

        // Draw bullet
        const screenX = bullet.x - game.camera.x;
        const screenY = bullet.y - game.camera.y;

        ctx.save();

        if (bullet.isCannon) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff4500';

          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, bullet.size);
          gradient.addColorStop(0, '#ffa500');
          gradient.addColorStop(0.5, '#ff6347');
          gradient.addColorStop(1, '#ff4500');
          ctx.fillStyle = gradient;
        } else if (bullet.isHoming) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#a855f7';

          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, bullet.size);
          gradient.addColorStop(0, '#e879f9');
          gradient.addColorStop(0.5, '#c084fc');
          gradient.addColorStop(1, '#a855f7');
          ctx.fillStyle = gradient;

          // Homing trail
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX - bullet.vx * 2, screenY - bullet.vy * 2);
          ctx.stroke();
        } else {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#fbbf24';
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
        if (!isFlying &&
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
          if (Math.sqrt(dx * dx + dy * dy) < zone.radius && !isFlying) {
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

      // Draw player
      drawPlayer(ctx, game.player, isFlying, game.camera, game.animationFrame);

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

function drawBackground(ctx, camera, frame) {
  // Grass base
  const grassGradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH
  );
  grassGradient.addColorStop(0, '#7cb342');
  grassGradient.addColorStop(0.6, '#689f38');
  grassGradient.addColorStop(1, '#558b2f');
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grass texture - scattered across world
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 200; i++) {
    const worldX = (i * 67 + 23) % WORLD_WIDTH;
    const worldY = (i * 91 + 41) % WORLD_HEIGHT;
    const x = worldX - camera.x;
    const y = worldY - camera.y;
    
    if (x < -30 || x > CANVAS_WIDTH + 30 || y < -30 || y > CANVAS_HEIGHT + 30) continue;
    
    ctx.fillStyle = i % 3 === 0 ? '#558b2f' : '#689f38';
    ctx.beginPath();
    ctx.ellipse(x, y, 15 + (i % 8), 8 + (i % 5), i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Dirt patches
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 80; i++) {
    const worldX = (i * 127 + 53) % WORLD_WIDTH;
    const worldY = (i * 143 + 71) % WORLD_HEIGHT;
    const x = worldX - camera.x;
    const y = worldY - camera.y;
    
    if (x < -50 || x > CANVAS_WIDTH + 50 || y < -50 || y > CANVAS_HEIGHT + 50) continue;
    
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.arc(x, y, 12 + (i % 6), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Trees scattered in world
  ctx.save();
  for (let i = 0; i < 30; i++) {
    const worldX = (i * 237 + 117) % WORLD_WIDTH;
    const worldY = (i * 193 + 89) % WORLD_HEIGHT;
    const x = worldX - camera.x;
    const y = worldY - camera.y;
    
    if (x < -60 || x > CANVAS_WIDTH + 60 || y < -60 || y > CANVAS_HEIGHT + 60) continue;
    
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 8, y - 10, 16, 40);
    
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(x, y - 20, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#388e3c';
    ctx.beginPath();
    ctx.arc(x - 10, y - 15, 18, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 15, 18, 0, Math.PI * 2);
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

function drawPlayer(ctx, player, isFlying, camera, frame) {
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
  
  // Shell - detailed with gradient
  const shellGradient = ctx.createRadialGradient(0, bobOffset - 15, 0, 0, bobOffset - 15, 22);
  shellGradient.addColorStop(0, '#4a7c2f');
  shellGradient.addColorStop(0.5, '#2d5016');
  shellGradient.addColorStop(1, '#1a3010');
  ctx.fillStyle = shellGradient;
  ctx.strokeStyle = '#1a3010';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, bobOffset - 15, 22, 18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Shell hexagon pattern
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
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
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
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
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
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
  }
  
  ctx.restore();
}