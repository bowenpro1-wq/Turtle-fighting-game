import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const CANVAS_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;
const CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 1200;
const GRAVITY = 0.6;
const GROUND_LEVEL = WORLD_HEIGHT - 100;

// Enemy types with unique behaviors
const ENEMY_TYPES = {
  SOLDIER: {
    name: 'soldier',
    width: 40,
    height: 50,
    speed: 2,
    health: 40,
    damage: 10,
    shootInterval: 2000,
    color: '#7c3aed',
    behaviorType: 'patrol',
    attacksBuildings: false
  },
  TANK: {
    name: 'tank',
    width: 80,
    height: 60,
    speed: 1,
    health: 100,
    damage: 25,
    shootInterval: 3000,
    color: '#dc2626',
    behaviorType: 'assault',
    attacksBuildings: true
  },
  DRONE: {
    name: 'drone',
    width: 35,
    height: 35,
    speed: 3,
    health: 25,
    damage: 8,
    shootInterval: 1500,
    color: '#0891b2',
    behaviorType: 'flying',
    attacksBuildings: false
  },
  ENGINEER: {
    name: 'engineer',
    width: 40,
    height: 50,
    speed: 1.5,
    health: 30,
    damage: 5,
    shootInterval: 5000,
    color: '#ea580c',
    behaviorType: 'support',
    attacksBuildings: false,
    deploysObstacles: true
  },
  ARTILLERY: {
    name: 'artillery',
    width: 70,
    height: 55,
    speed: 0.5,
    health: 80,
    damage: 40,
    shootInterval: 4000,
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
  isFlying,
  currentBoss,
  defeatedBosses,
  score,
  upgrades
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: {
      x: 200,
      y: GROUND_LEVEL - 60,
      vx: 0,
      vy: 0,
      width: 50,
      height: 60,
      speed: 6,
      jumpPower: 15,
      onGround: false,
      facingRight: true,
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
    keys: {},
    lastEnemySpawn: 0,
    lastObstacleCheck: 0,
    animationFrame: 0,
    worldGenerated: false
  });

  const generateWorld = useCallback(() => {
    const buildings = [];
    
    // Generate buildings across the world
    for (let i = 0; i < 15; i++) {
      const x = 300 + i * 300 + Math.random() * 100;
      const buildingType = Math.random();
      
      if (buildingType < 0.4) {
        // House
        buildings.push({
          x,
          y: GROUND_LEVEL - 120,
          width: 100,
          height: 120,
          type: 'house',
          health: 100,
          maxHealth: 100,
          important: true
        });
      } else if (buildingType < 0.7) {
        // Tower
        buildings.push({
          x,
          y: GROUND_LEVEL - 180,
          width: 80,
          height: 180,
          type: 'tower',
          health: 150,
          maxHealth: 150,
          important: true
        });
      } else {
        // Bunker
        buildings.push({
          x,
          y: GROUND_LEVEL - 100,
          width: 120,
          height: 100,
          type: 'bunker',
          health: 200,
          maxHealth: 200,
          important: true
        });
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

    const spawnX = gameRef.current.camera.x + CANVAS_WIDTH + 100;
    const isFlying = type.behaviorType === 'flying';
    
    return {
      ...type,
      x: spawnX,
      y: isFlying ? GROUND_LEVEL - 200 - Math.random() * 100 : GROUND_LEVEL - type.height,
      vx: 0,
      vy: 0,
      health: type.health,
      maxHealth: type.health,
      lastShot: Date.now(),
      state: 'patrol',
      target: null,
      patrolDirection: -1,
      stunned: false,
      isFlying: isFlying
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
      
      if (e.key === ' ' && game.player.onGround) {
        game.player.vy = -game.player.jumpPower;
        game.player.onGround = false;
      }
      
      if (e.key.toLowerCase() === 'k') {
        if (shoot()) {
          const direction = game.player.facingRight ? 1 : -1;
          const bullet = {
            x: game.player.x + (game.player.facingRight ? game.player.width : 0),
            y: game.player.y + game.player.height / 2,
            vx: direction * 15,
            vy: 0,
            damage: 10 * upgrades.damage,
            size: 8,
            fromPlayer: true
          };
          game.bullets.push(bullet);
          
          // Muzzle flash
          for (let i = 0; i < 8; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: direction * (Math.random() * 3 + 2),
              vy: (Math.random() - 0.5) * 4,
              life: 15,
              color: '#fbbf24',
              size: 3
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

      // Player movement
      const baseSpeed = 6 * upgrades.speed;
      if (game.keys['a'] || game.keys['arrowleft']) {
        game.player.vx = -baseSpeed;
        game.player.facingRight = false;
      } else if (game.keys['d'] || game.keys['arrowright']) {
        game.player.vx = baseSpeed;
        game.player.facingRight = true;
      } else {
        game.player.vx *= 0.8;
      }

      // Gravity
      if (!isFlying) {
        game.player.vy += GRAVITY;
      } else {
        game.player.vy = 0;
        if (game.keys['w'] || game.keys['arrowup']) {
          game.player.y -= 5;
        }
        if (game.keys['s'] || game.keys['arrowdown']) {
          game.player.y += 5;
        }
      }

      game.player.x += game.player.vx;
      game.player.y += game.player.vy;

      // Ground collision
      if (game.player.y >= GROUND_LEVEL - game.player.height) {
        game.player.y = GROUND_LEVEL - game.player.height;
        game.player.vy = 0;
        game.player.onGround = true;
      } else {
        game.player.onGround = false;
      }

      // Keep player in world bounds
      game.player.x = Math.max(0, Math.min(WORLD_WIDTH - game.player.width, game.player.x));
      game.player.y = Math.max(0, game.player.y);

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
        // AI behavior
        if (enemy.behaviorType === 'patrol') {
          enemy.vx = enemy.patrolDirection * enemy.speed;
          
          // Find nearest building or player
          const targetBuilding = game.buildings
            .filter(b => Math.abs(b.x - enemy.x) < 300)
            .sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
          
          const distToPlayer = Math.abs(game.player.x - enemy.x);
          
          if (distToPlayer < 400) {
            enemy.state = 'attack';
            enemy.patrolDirection = game.player.x > enemy.x ? 1 : -1;
          }
        } else if (enemy.behaviorType === 'assault') {
          // Tanks target buildings first
          const nearestBuilding = game.buildings
            .filter(b => b.important)
            .sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
          
          if (nearestBuilding && Math.abs(nearestBuilding.x - enemy.x) < 500) {
            enemy.target = nearestBuilding;
            enemy.vx = (nearestBuilding.x - enemy.x) > 0 ? enemy.speed : -enemy.speed;
          } else {
            enemy.vx = -enemy.speed;
          }
        } else if (enemy.behaviorType === 'flying') {
          // Drones fly in waves
          enemy.y += Math.sin(game.animationFrame * 0.05 + enemy.x) * 2;
          enemy.vx = -enemy.speed;
        } else if (enemy.behaviorType === 'support') {
          // Engineers deploy obstacles
          enemy.vx = -enemy.speed * 0.5;
          
          if (Date.now() - game.lastObstacleCheck > 8000 && Math.random() < 0.3) {
            game.obstacles.push({
              x: enemy.x,
              y: GROUND_LEVEL - 40,
              width: 60,
              height: 40,
              type: 'barrier',
              health: 50
            });
            game.lastObstacleCheck = Date.now();
          }
        } else if (enemy.behaviorType === 'stationary') {
          enemy.vx = 0;
          
          // Artillery creates hazard zones
          if (enemy.createsHazards && Date.now() - enemy.lastShot > enemy.shootInterval - 500) {
            const targetX = game.player.x + (Math.random() - 0.5) * 200;
            game.hazardZones.push({
              x: targetX,
              y: GROUND_LEVEL - 100,
              radius: 80,
              damage: 20,
              life: 100,
              warning: 50
            });
          }
        }

        enemy.x += enemy.vx;
        
        if (!enemy.isFlying) {
          enemy.vy += GRAVITY;
          enemy.y += enemy.vy;
          
          if (enemy.y >= GROUND_LEVEL - enemy.height) {
            enemy.y = GROUND_LEVEL - enemy.height;
            enemy.vy = 0;
          }
        }

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

      // Update bullets
      game.bullets = game.bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Check enemy collision
        for (let enemy of game.enemies) {
          if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
              bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
            enemy.health -= bullet.damage;
            
            // Hit particles
            for (let i = 0; i < 10; i++) {
              game.particles.push({
                x: bullet.x,
                y: bullet.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 20,
                color: '#fbbf24',
                size: 3
              });
            }

            if (enemy.health <= 0) {
              onEnemyKill();
              
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
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
  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGradient.addColorStop(0, '#87CEEB');
  skyGradient.addColorStop(0.6, '#B0E0E6');
  skyGradient.addColorStop(1, '#98D8C8');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Clouds
  ctx.save();
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 8; i++) {
    const x = ((i * 400 - camera.x * 0.3 + frame * 0.2) % (CANVAS_WIDTH + 200)) - 100;
    const y = 50 + i * 40;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y, 60, 25, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 30, y - 10, 50, 30, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 60, y, 55, 28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Ground - grass layer
  const groundY = GROUND_LEVEL - camera.y;
  const grassGradient = ctx.createLinearGradient(0, groundY, 0, CANVAS_HEIGHT);
  grassGradient.addColorStop(0, '#7cb342');
  grassGradient.addColorStop(0.3, '#689f38');
  grassGradient.addColorStop(1, '#558b2f');
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, groundY, CANVAS_WIDTH, CANVAS_HEIGHT - groundY);

  // Grass texture
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 100; i++) {
    const x = ((i * 47) % WORLD_WIDTH) - camera.x;
    if (x < -20 || x > CANVAS_WIDTH + 20) continue;
    
    const grassY = groundY + (i % 3) * 3;
    ctx.fillStyle = i % 2 === 0 ? '#558b2f' : '#689f38';
    
    // Grass blade
    ctx.beginPath();
    ctx.moveTo(x, grassY + 15);
    ctx.quadraticCurveTo(x - 3, grassY + 7, x, grassY);
    ctx.quadraticCurveTo(x + 3, grassY + 7, x, grassY + 15);
    ctx.fill();
  }
  ctx.restore();

  // Dirt/rocks on ground
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 50; i++) {
    const x = ((i * 123 + 37) % WORLD_WIDTH) - camera.x;
    if (x < -30 || x > CANVAS_WIDTH + 30) continue;
    
    const y = groundY + 20 + (i % 5) * 5;
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.arc(x, y, 8 + (i % 3) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Distant trees
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 20; i++) {
    const x = ((i * 234) % WORLD_WIDTH) - camera.x * 0.7;
    if (x < -50 || x > CANVAS_WIDTH + 50) continue;
    
    const treeY = groundY - 80;
    
    // Trunk
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 8, treeY, 16, 60);
    
    // Foliage
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(x, treeY - 10, 30, 0, Math.PI * 2);
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
    ctx.fillRect(x, y + 40, building.width, building.height - 40);
    ctx.strokeRect(x, y + 40, building.width, building.height - 40);
    
    // Roof
    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 40);
    ctx.lineTo(x + building.width / 2, y);
    ctx.lineTo(x + building.width + 10, y + 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + building.width / 2 - 15, y + 75, 30, 45);
    ctx.strokeRect(x + building.width / 2 - 15, y + 75, 30, 45);
    
    // Windows
    ctx.fillStyle = '#93c5fd';
    ctx.strokeStyle = '#1e3a8a';
    ctx.fillRect(x + 15, y + 60, 25, 25);
    ctx.strokeRect(x + 15, y + 60, 25, 25);
    ctx.fillRect(x + building.width - 40, y + 60, 25, 25);
    ctx.strokeRect(x + building.width - 40, y + 60, 25, 25);
    
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
  if (!player.facingRight) {
    ctx.scale(-1, 1);
  }
  
  // Flying glow
  if (isFlying) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#38bdf8';
  }
  
  const bobOffset = player.onGround ? Math.sin(frame * 0.15) * 2 : 0;
  
  // Shell
  ctx.fillStyle = '#2d5016';
  ctx.strokeStyle = '#1a3010';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, bobOffset - 15, 22, 18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Shell pattern
  ctx.fillStyle = '#4a7c2f';
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * i;
    const px = Math.cos(angle) * 12;
    const py = Math.sin(angle) * 10 + bobOffset - 15;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Head
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(15, bobOffset - 20, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(17, bobOffset - 22, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(18, bobOffset - 22, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Legs
  const legBob = Math.sin(frame * 0.2) * 3;
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
  ctx.lineWidth = 2;
  
  // Front legs
  ctx.beginPath();
  ctx.ellipse(10, bobOffset + 5, 5, 10, legBob * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Back legs
  ctx.beginPath();
  ctx.ellipse(-8, bobOffset + 5, 5, 10, -legBob * 0.1, 0, Math.PI * 2);
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