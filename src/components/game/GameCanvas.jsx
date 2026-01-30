import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const CANVAS_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1400;
const CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
const GROUND_Y = CANVAS_HEIGHT - 150;
const GRAVITY = 0.6;
const JUMP_FORCE = -15;

export default function GameCanvas({
  gameState,
  onPlayerDamage,
  onStructureDamage,
  onEnemyKill,
  onBossDamage,
  onTriggerBoss,
  shoot,
  heal,
  dash,
  isDashing,
  currentBoss,
  defeatedBosses,
  score,
  upgrades
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { 
      x: 200, 
      y: GROUND_Y - 50, 
      width: 50, 
      height: 50, 
      velocityY: 0,
      velocityX: 0,
      onGround: true,
      facing: 1,
      animFrame: 0
    },
    camera: { x: 0 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    particles: [],
    hazards: [],
    coins: [],
    structures: [
      { x: 600, y: GROUND_Y - 180, width: 100, height: 180, type: 'tower', health: 100, maxHealth: 100 },
      { x: 1200, y: GROUND_Y - 120, width: 120, height: 120, type: 'bunker', health: 150, maxHealth: 150 },
      { x: 1800, y: GROUND_Y - 150, width: 90, height: 150, type: 'generator', health: 80, maxHealth: 80 },
    ],
    platforms: [
      { x: 400, y: GROUND_Y - 200, width: 150, height: 20 },
      { x: 800, y: GROUND_Y - 250, width: 120, height: 20 },
      { x: 1400, y: GROUND_Y - 220, width: 160, height: 20 },
      { x: 2000, y: GROUND_Y - 280, width: 140, height: 20 },
    ],
    keys: {},
    lastEnemySpawn: 0,
    lastCoinSpawn: 0,
    animationFrame: 0,
    worldWidth: 3000
  });

  const spawnEnemy = useCallback((type = null) => {
    const types = [
      'grunt',      // Basic ground enemy
      'flyer',      // Flying enemy
      'destroyer',  // Targets structures
      'miner',      // Deploys obstacles
      'sniper',     // Long range
      'bomber'      // Creates hazard zones
    ];
    
    const enemyType = type || types[Math.floor(Math.random() * types.length)];
    const spawnX = gameRef.current.camera.x + CANVAS_WIDTH + 100;
    
    const configs = {
      grunt: { health: 40, speed: 2, damage: 10, size: 40, canJump: true, color: '#ef4444' },
      flyer: { health: 30, speed: 3, damage: 8, size: 35, flying: true, color: '#8b5cf6', altitude: -150 },
      destroyer: { health: 60, speed: 1.5, damage: 20, size: 50, targetsStructures: true, color: '#dc2626' },
      miner: { health: 35, speed: 1.8, damage: 5, size: 38, deploysObstacles: true, color: '#f59e0b', lastDeploy: 0 },
      sniper: { health: 25, speed: 1, damage: 25, size: 35, longRange: true, color: '#6366f1', shootDist: 600 },
      bomber: { health: 45, speed: 2.2, damage: 15, size: 42, createsHazards: true, color: '#10b981', lastHazard: 0 }
    };
    
    const config = configs[enemyType];
    
    return {
      x: spawnX,
      y: config.flying ? GROUND_Y + config.altitude : GROUND_Y - config.size,
      velocityY: 0,
      type: enemyType,
      ...config,
      lastShot: Date.now(),
      shootInterval: 2000 + Math.random() * 1000,
      animFrame: 0
    };
  }, []);

  const spawnBossEnemy = useCallback((boss) => {
    return {
      x: gameRef.current.camera.x + CANVAS_WIDTH - 200,
      y: GROUND_Y - boss.size - 20,
      velocityY: 0,
      health: boss.health,
      maxHealth: boss.health,
      speed: boss.speed,
      damage: boss.damage,
      size: boss.size,
      color: boss.color,
      pattern: boss.pattern,
      lastShot: Date.now(),
      shootInterval: 1200,
      isBoss: true,
      name: boss.name,
      animFrame: 0,
      patternPhase: 0
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    let animationId;

    const handleKeyDown = (e) => {
      game.keys[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' && game.player.onGround) {
        game.player.velocityY = JUMP_FORCE;
        game.player.onGround = false;
      }
      
      if (e.key.toLowerCase() === 'j') {
        if (shoot()) {
          const direction = game.player.facing;
          const bullet = {
            x: game.player.x + (direction > 0 ? 40 : -10),
            y: game.player.y + 15,
            velocityX: direction * 15,
            velocityY: 0,
            damage: 10 * upgrades.damage,
            size: 6
          };
          game.bullets.push(bullet);
          
          for (let i = 0; i < 8; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: -direction * Math.random() * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 20,
              color: '#fbbf24',
              size: 3
            });
          }
        }
      }
      
      if (e.key.toLowerCase() === 'h') {
        if (heal()) {
          for (let i = 0; i < 30; i++) {
            game.particles.push({
              x: game.player.x + (Math.random() - 0.5) * 50,
              y: game.player.y + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 3,
              vy: -Math.random() * 5,
              life: 50,
              color: '#22c55e',
              size: 5,
              type: 'heal'
            });
          }
        }
      }
      
      if (e.key.toLowerCase() === 'k') {
        if (dash()) {
          game.player.velocityX = game.player.facing * 20;
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
      if (!isDashing) {
        if (game.keys['a'] || game.keys['arrowleft']) {
          game.player.velocityX = -baseSpeed;
          game.player.facing = -1;
        } else if (game.keys['d'] || game.keys['arrowright']) {
          game.player.velocityX = baseSpeed;
          game.player.facing = 1;
        } else {
          game.player.velocityX *= 0.8;
        }
      }

      game.player.x += game.player.velocityX;
      
      // Apply gravity
      if (!game.player.onGround) {
        game.player.velocityY += GRAVITY;
      }
      game.player.y += game.player.velocityY;

      // Ground collision
      if (game.player.y >= GROUND_Y - game.player.height) {
        game.player.y = GROUND_Y - game.player.height;
        game.player.velocityY = 0;
        game.player.onGround = true;
      }

      // Platform collision
      game.player.onGround = game.player.y >= GROUND_Y - game.player.height;
      for (let platform of game.platforms) {
        if (game.player.velocityY >= 0 &&
            game.player.x + 40 > platform.x &&
            game.player.x < platform.x + platform.width &&
            game.player.y + game.player.height <= platform.y + 10 &&
            game.player.y + game.player.height + game.player.velocityY >= platform.y) {
          game.player.y = platform.y - game.player.height;
          game.player.velocityY = 0;
          game.player.onGround = true;
        }
      }

      // Keep player in bounds
      game.player.x = Math.max(game.camera.x + 50, Math.min(game.player.x, game.camera.x + CANVAS_WIDTH - 100));

      // Camera follow player
      const targetCameraX = Math.max(0, Math.min(game.player.x - CANVAS_WIDTH / 3, game.worldWidth - CANVAS_WIDTH));
      game.camera.x += (targetCameraX - game.camera.x) * 0.1;

      // Draw background
      drawBackground(ctx, game.camera.x, game.animationFrame);
      drawGround(ctx, game.camera.x);

      // Draw platforms
      game.platforms.forEach(platform => {
        const screenX = platform.x - game.camera.x;
        ctx.fillStyle = '#4b5563';
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        ctx.fillRect(screenX, platform.y, platform.width, platform.height);
        ctx.strokeRect(screenX, platform.y, platform.width, platform.height);
        
        // Platform details
        ctx.fillStyle = '#6b7280';
        for (let i = 0; i < platform.width; i += 20) {
          ctx.fillRect(screenX + i, platform.y, 18, 4);
        }
      });

      // Spawn enemies
      if (gameState === 'playing') {
        if (Date.now() - game.lastEnemySpawn > 3000) {
          game.enemies.push(spawnEnemy());
          game.lastEnemySpawn = Date.now();
        }

        if (Date.now() - game.lastCoinSpawn > 6000) {
          game.coins.push({
            x: game.camera.x + CANVAS_WIDTH + Math.random() * 200,
            y: GROUND_Y - 80 - Math.random() * 150,
            size: 12,
            velocityY: 0,
            bounce: 0
          });
          game.lastCoinSpawn = Date.now();
        }

        const bossIndex = Math.floor(score / 800);
        if (bossIndex < 20 && !defeatedBosses.includes(bossIndex + 1) && score >= (bossIndex + 1) * 800 - 150) {
          onTriggerBoss(bossIndex);
        }
      }

      // Spawn boss
      if (gameState === 'boss' && currentBoss && !game.enemies.find(e => e.isBoss)) {
        game.enemies = game.enemies.filter(e => !e.isBoss);
        game.enemies.push(spawnBossEnemy(currentBoss));
      }

      // Update structures
      game.structures.forEach(structure => {
        const screenX = structure.x - game.camera.x;
        drawStructure(ctx, structure, screenX, game.animationFrame);
      });

      // Update enemies
      game.enemies = game.enemies.filter(enemy => {
        if (enemy.flying) {
          const targetY = GROUND_Y + enemy.altitude + Math.sin(game.animationFrame * 0.05 + enemy.x * 0.01) * 30;
          enemy.y += (targetY - enemy.y) * 0.05;
        } else {
          enemy.velocityY += GRAVITY;
          enemy.y += enemy.velocityY;
          
          if (enemy.y >= GROUND_Y - enemy.size) {
            enemy.y = GROUND_Y - enemy.size;
            enemy.velocityY = 0;
          }
        }

        // Enemy AI
        if (!enemy.isBoss) {
          if (enemy.targetsStructures) {
            const nearest = game.structures.reduce((closest, struct) => {
              if (!struct.health || struct.health <= 0) return closest;
              const dist = Math.abs(struct.x - enemy.x);
              return !closest || dist < Math.abs(closest.x - enemy.x) ? struct : closest;
            }, null);
            
            if (nearest) {
              enemy.x += (nearest.x < enemy.x ? -enemy.speed : enemy.speed);
            } else {
              enemy.x -= enemy.speed;
            }
          } else {
            const playerDist = Math.abs(game.player.x - enemy.x);
            if (playerDist > 100) {
              enemy.x += (game.player.x < enemy.x ? -enemy.speed : enemy.speed);
            }
          }

          // Deploy obstacles
          if (enemy.deploysObstacles && Date.now() - enemy.lastDeploy > 4000) {
            game.hazards.push({
              x: enemy.x,
              y: GROUND_Y - 40,
              width: 50,
              height: 40,
              type: 'spikes',
              damage: 5,
              life: 300
            });
            enemy.lastDeploy = Date.now();
          }

          // Create hazard zones
          if (enemy.createsHazards && Date.now() - enemy.lastHazard > 5000) {
            game.hazards.push({
              x: enemy.x - 60,
              y: GROUND_Y - 80,
              width: 120,
              height: 80,
              type: 'toxic',
              damage: 2,
              life: 400,
              alpha: 0.6
            });
            enemy.lastHazard = Date.now();
          }
        } else {
          // Boss AI
          enemy.patternPhase++;
          const targetX = game.player.x + Math.cos(enemy.patternPhase * 0.02) * 300;
          enemy.x += (targetX - enemy.x) * 0.01 * enemy.speed;
        }

        // Enemy shooting
        if (Date.now() - enemy.lastShot > enemy.shootInterval) {
          const dx = game.player.x - enemy.x;
          const dy = game.player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (enemy.longRange && dist > 200 || dist < 500) {
            game.enemyBullets.push({
              x: enemy.x,
              y: enemy.y + enemy.size / 2,
              vx: (dx / dist) * 8,
              vy: (dy / dist) * 8 + GRAVITY,
              damage: enemy.damage,
              size: enemy.isBoss ? 10 : 6,
              color: enemy.color || '#ef4444'
            });
          }
          enemy.lastShot = Date.now();
        }

        const screenX = enemy.x - game.camera.x;
        drawEnemy(ctx, enemy, screenX, game.animationFrame);

        return enemy.health > 0 && enemy.x > game.camera.x - 200;
      });

      // Update hazards
      game.hazards = game.hazards.filter(hazard => {
        hazard.life--;
        const screenX = hazard.x - game.camera.x;
        
        ctx.save();
        ctx.globalAlpha = hazard.alpha || 0.8;
        
        if (hazard.type === 'spikes') {
          ctx.fillStyle = '#78716c';
          ctx.fillRect(screenX, hazard.y, hazard.width, hazard.height);
          ctx.fillStyle = '#57534e';
          for (let i = 0; i < hazard.width; i += 12) {
            ctx.beginPath();
            ctx.moveTo(screenX + i, hazard.y + hazard.height);
            ctx.lineTo(screenX + i + 6, hazard.y);
            ctx.lineTo(screenX + i + 12, hazard.y + hazard.height);
            ctx.fill();
          }
        } else if (hazard.type === 'toxic') {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(screenX, hazard.y, hazard.width, hazard.height);
          ctx.fillStyle = '#059669';
          for (let i = 0; i < 5; i++) {
            const bx = screenX + Math.random() * hazard.width;
            const by = hazard.y + Math.random() * hazard.height;
            ctx.beginPath();
            ctx.arc(bx, by, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // Hazard collision with player
        if (game.player.x + 40 > hazard.x &&
            game.player.x < hazard.x + hazard.width &&
            game.player.y + game.player.height > hazard.y &&
            game.player.y < hazard.y + hazard.height &&
            game.animationFrame % 30 === 0) {
          onPlayerDamage(hazard.damage);
        }

        return hazard.life > 0;
      });

      // Update bullets
      game.bullets = game.bullets.filter(bullet => {
        bullet.x += bullet.velocityX;
        bullet.velocityY += GRAVITY * 0.2;
        bullet.y += bullet.velocityY;

        for (let enemy of game.enemies) {
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - (enemy.y + enemy.size / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < enemy.size / 2 + bullet.size) {
            enemy.health -= bullet.damage;
            
            for (let i = 0; i < 12; i++) {
              game.particles.push({
                x: bullet.x,
                y: bullet.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                color: enemy.color || '#fbbf24',
                size: 4
              });
            }

            if (enemy.health <= 0) {
              for (let i = 0; i < 25; i++) {
                game.particles.push({
                  x: enemy.x,
                  y: enemy.y + enemy.size / 2,
                  vx: (Math.random() - 0.5) * 12,
                  vy: (Math.random() - 0.5) * 12,
                  life: 50,
                  color: enemy.isBoss ? enemy.color : '#f97316',
                  size: 6
                });
              }
              
              if (enemy.isBoss) {
                onBossDamage(enemy.maxHealth);
              } else {
                onEnemyKill();
              }
            }

            return false;
          }
        }

        const screenX = bullet.x - game.camera.x;
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(screenX, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return bullet.x > game.camera.x - 50 && bullet.x < game.camera.x + CANVAS_WIDTH + 50;
      });

      // Update enemy bullets
      game.enemyBullets = game.enemyBullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.vy += GRAVITY * 0.1;

        const dx = bullet.x - game.player.x - 20;
        const dy = bullet.y - game.player.y - 25;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 25 + bullet.size) {
          onPlayerDamage(bullet.damage);
          
          for (let i = 0; i < 10; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 25,
              color: '#ef4444',
              size: 4
            });
          }
          return false;
        }

        // Check structure collision
        for (let structure of game.structures) {
          if (structure.health > 0 &&
              bullet.x > structure.x && bullet.x < structure.x + structure.width &&
              bullet.y > structure.y && bullet.y < structure.y + structure.height) {
            structure.health -= bullet.damage;
            onStructureDamage(bullet.damage);
            
            for (let i = 0; i < 8; i++) {
              game.particles.push({
                x: bullet.x,
                y: bullet.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 20,
                color: '#9ca3af',
                size: 3
              });
            }
            return false;
          }
        }

        const screenX = bullet.x - game.camera.x;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color;
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(screenX, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return bullet.x > game.camera.x - 50 && bullet.x < game.camera.x + CANVAS_WIDTH + 50;
      });

      // Update coins
      game.coins = game.coins.filter(coin => {
        coin.velocityY += GRAVITY * 0.3;
        coin.y += coin.velocityY;
        
        if (coin.y >= GROUND_Y - coin.size - 5) {
          coin.y = GROUND_Y - coin.size - 5;
          coin.velocityY = -coin.velocityY * 0.6;
          coin.bounce++;
          if (coin.bounce > 5) coin.velocityY = 0;
        }

        const dx = game.player.x + 20 - coin.x;
        const dy = game.player.y + 25 - coin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40) {
          return false;
        }

        const screenX = coin.x - game.camera.x;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, coin.y, coin.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(screenX - 3, coin.y - 3, coin.size / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return coin.x > game.camera.x - 100 && coin.x < game.camera.x + CANVAS_WIDTH + 100;
      });

      // Update particles
      game.particles = game.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += GRAVITY * 0.2;
        particle.life--;

        const screenX = particle.x - game.camera.x;
        const alpha = particle.life / 50;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(screenX, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return particle.life > 0;
      });

      // Draw player
      const playerScreenX = game.player.x - game.camera.x;
      drawPlayer(ctx, game.player, playerScreenX, isDashing, game.animationFrame);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameState, isDashing, shoot, heal, dash, onPlayerDamage, onStructureDamage, onEnemyKill, onBossDamage, onTriggerBoss, spawnEnemy, spawnBossEnemy, currentBoss, defeatedBosses, score, upgrades]);

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

function drawBackground(ctx, cameraX, frame) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#1e293b');
  gradient.addColorStop(0.6, '#334155');
  gradient.addColorStop(1, '#475569');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Distant buildings
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 10; i++) {
    const x = (i * 250 - cameraX * 0.2) % (CANVAS_WIDTH + 500);
    const height = 150 + (i % 3) * 80;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, CANVAS_HEIGHT - 150 - height, 120, height);
    
    // Windows
    ctx.fillStyle = '#fbbf24';
    for (let j = 0; j < height / 30; j++) {
      for (let k = 0; k < 3; k++) {
        if (Math.random() > 0.3) {
          ctx.fillRect(x + 15 + k * 35, CANVAS_HEIGHT - 150 - height + 15 + j * 30, 20, 15);
        }
      }
    }
  }
  ctx.restore();

  // Stars/distant lights
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 50; i++) {
    const x = (i * 37 - cameraX * 0.05) % CANVAS_WIDTH;
    const y = (i * 29) % (CANVAS_HEIGHT - 200);
    ctx.globalAlpha = 0.3 + Math.sin(frame * 0.05 + i) * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, 1 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGround(ctx, cameraX) {
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
  
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.stroke();
  
  // Ground details
  ctx.fillStyle = '#374151';
  for (let i = 0; i < CANVAS_WIDTH; i += 40) {
    const x = i - (cameraX % 40);
    ctx.fillRect(x, GROUND_Y + 10, 30, 4);
    ctx.fillRect(x + 10, GROUND_Y + 25, 20, 4);
  }
}

function drawStructure(ctx, structure, screenX, frame) {
  if (structure.health <= 0) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(screenX, structure.y, structure.width, structure.height);
    ctx.restore();
    return;
  }

  ctx.save();
  
  if (structure.type === 'tower') {
    // Main structure
    ctx.fillStyle = '#475569';
    ctx.fillRect(screenX, structure.y, structure.width, structure.height);
    
    // Windows
    ctx.fillStyle = '#0ea5e9';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(screenX + 20, structure.y + 20 + i * 40, 25, 25);
      ctx.fillRect(screenX + 55, structure.y + 20 + i * 40, 25, 25);
    }
    
    // Top antenna
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX + structure.width / 2, structure.y);
    ctx.lineTo(screenX + structure.width / 2, structure.y - 30);
    ctx.stroke();
    
    ctx.fillStyle = frame % 40 < 20 ? '#ef4444' : '#dc2626';
    ctx.beginPath();
    ctx.arc(screenX + structure.width / 2, structure.y - 35, 6, 0, Math.PI * 2);
    ctx.fill();
    
  } else if (structure.type === 'bunker') {
    // Base
    ctx.fillStyle = '#334155';
    ctx.fillRect(screenX, structure.y, structure.width, structure.height);
    
    // Armored plating
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    for (let i = 0; i < structure.width; i += 30) {
      ctx.strokeRect(screenX + i, structure.y, 28, structure.height);
    }
    
    // Gun turret
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(screenX + structure.width / 2, structure.y + 30, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#475569';
    ctx.fillRect(screenX + structure.width / 2 - 30, structure.y + 25, 60, 10);
    
  } else if (structure.type === 'generator') {
    // Base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX, structure.y, structure.width, structure.height);
    
    // Core
    const pulse = 1 + Math.sin(frame * 0.1) * 0.1;
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(screenX + structure.width / 2, structure.y + structure.height / 2, 30 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Energy lines
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + frame * 0.05;
      const x1 = screenX + structure.width / 2 + Math.cos(angle) * 32;
      const y1 = structure.y + structure.height / 2 + Math.sin(angle) * 32;
      const x2 = screenX + structure.width / 2 + Math.cos(angle) * 45;
      const y2 = structure.y + structure.height / 2 + Math.sin(angle) * 45;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  
  // Health bar
  if (structure.health < structure.maxHealth) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(screenX, structure.y - 15, structure.width, 8);
    
    const healthPercent = structure.health / structure.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(screenX, structure.y - 15, structure.width * healthPercent, 8);
  }
  
  ctx.restore();
}

function drawPlayer(ctx, player, screenX, isDashing, frame) {
  ctx.save();
  ctx.translate(screenX + 25, player.y + 25);
  if (player.facing < 0) ctx.scale(-1, 1);

  if (isDashing) {
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#38bdf8';
    
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.3 - i * 0.05;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-i * 8 * player.facing, 0, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const walkCycle = Math.sin(frame * 0.2) * (player.velocityX !== 0 ? 5 : 0);
  
  // Shadow
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 35, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Body (armored suit)
  ctx.fillStyle = '#2563eb';
  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 2;
  
  // Torso
  ctx.beginPath();
  ctx.roundRect(-15, -10, 30, 35, 5);
  ctx.fill();
  ctx.stroke();
  
  // Armor plates
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(-12, -8, 24, 8);
  ctx.fillRect(-12, 5, 24, 8);
  
  // Head
  ctx.fillStyle = '#1e40af';
  ctx.strokeStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.roundRect(-12, -25, 24, 18, 3);
  ctx.fill();
  ctx.stroke();
  
  // Visor
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(-10, -22, 20, 10);
  
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(-8, -21, 4, 8);
  ctx.fillRect(4, -21, 4, 8);
  
  // Arms
  ctx.fillStyle = '#2563eb';
  ctx.strokeStyle = '#1e40af';
  
  // Left arm
  ctx.save();
  ctx.translate(-15, 0);
  ctx.rotate(walkCycle * 0.03);
  ctx.fillRect(-6, -5, 10, 20);
  ctx.strokeRect(-6, -5, 10, 20);
  
  // Gun
  ctx.fillStyle = '#374151';
  ctx.fillRect(-8, 8, 14, 6);
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(6, 9, 8, 4);
  ctx.restore();
  
  // Right arm
  ctx.save();
  ctx.translate(15, 0);
  ctx.rotate(-walkCycle * 0.03);
  ctx.fillRect(-4, -5, 10, 20);
  ctx.strokeRect(-4, -5, 10, 20);
  ctx.restore();
  
  // Legs
  const legOffset = player.onGround ? walkCycle : 0;
  
  // Left leg
  ctx.save();
  ctx.translate(-8, 25);
  ctx.rotate(legOffset * 0.02);
  ctx.fillRect(-5, 0, 10, 18);
  ctx.strokeRect(-5, 0, 10, 18);
  ctx.restore();
  
  // Right leg
  ctx.save();
  ctx.translate(8, 25);
  ctx.rotate(-legOffset * 0.02);
  ctx.fillRect(-5, 0, 10, 18);
  ctx.strokeRect(-5, 0, 10, 18);
  ctx.restore();
  
  // Boots
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(-13, 40, 10, 6);
  ctx.fillRect(3, 40, 10, 6);

  ctx.restore();
}

function drawEnemy(ctx, enemy, screenX, frame) {
  ctx.save();
  ctx.translate(screenX, enemy.y + enemy.size / 2);

  const wobble = Math.sin(frame * 0.1 + enemy.x * 0.01) * 2;

  if (enemy.isBoss) {
    const pulse = 1 + Math.sin(frame * 0.08) * 0.08;
    
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = enemy.color;
    
    // Boss body
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size / 2 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Armor segments
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + frame * 0.02;
      const dist = enemy.size / 2.5 * pulse;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Glowing core
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size / 4 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Menacing eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(-enemy.size / 5, -enemy.size / 6, 10, 0, Math.PI * 2);
    ctx.arc(enemy.size / 5, -enemy.size / 6, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Health bar
    ctx.shadowBlur = 0;
    const barWidth = enemy.size;
    const barHeight = 8;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(-barWidth / 2, enemy.size / 2 + 15, barWidth, barHeight);
    
    const healthPercent = enemy.health / enemy.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-barWidth / 2, enemy.size / 2 + 15, barWidth * healthPercent, barHeight);
  } else {
    // Regular enemies
    ctx.shadowBlur = 8;
    ctx.shadowColor = enemy.color;
    
    switch (enemy.type) {
      case 'grunt':
        // Simple robot
        ctx.fillStyle = enemy.color;
        ctx.fillRect(-enemy.size / 2, -enemy.size / 2 + wobble, enemy.size, enemy.size);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-enemy.size / 2, -enemy.size / 2 + wobble, enemy.size, enemy.size);
        
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-enemy.size / 4, -enemy.size / 3 + wobble, 6, 6);
        ctx.fillRect(enemy.size / 6, -enemy.size / 3 + wobble, 6, 6);
        break;
        
      case 'flyer':
        // Drone
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(0, wobble, enemy.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Propellers
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 2 / 4) * i + frame * 0.2;
          const px = Math.cos(angle) * enemy.size / 1.8;
          const py = Math.sin(angle) * enemy.size / 1.8 + wobble;
          ctx.strokeStyle = '#a78bfa';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px - 8, py);
          ctx.lineTo(px + 8, py);
          ctx.stroke();
        }
        break;
        
      case 'destroyer':
        // Tank-like
        ctx.fillStyle = enemy.color;
        ctx.fillRect(-enemy.size / 2, -enemy.size / 3 + wobble, enemy.size, enemy.size * 0.7);
        ctx.strokeRect(-enemy.size / 2, -enemy.size / 3 + wobble, enemy.size, enemy.size * 0.7);
        
        ctx.beginPath();
        ctx.arc(0, wobble, enemy.size / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillRect(-4, wobble - enemy.size / 2, 8, enemy.size / 2);
        break;
        
      case 'miner':
        // Builder bot
        ctx.fillStyle = enemy.color;
        ctx.fillRect(-enemy.size / 2.5, -enemy.size / 2 + wobble, enemy.size / 1.25, enemy.size);
        ctx.strokeRect(-enemy.size / 2.5, -enemy.size / 2 + wobble, enemy.size / 1.25, enemy.size);
        
        // Drill arm
        ctx.save();
        ctx.translate(-enemy.size / 2, wobble);
        ctx.rotate(frame * 0.1);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(-15, -3, 20, 6);
        ctx.restore();
        break;
        
      case 'sniper':
        // Long range unit
        ctx.fillStyle = enemy.color;
        ctx.fillRect(-enemy.size / 3, -enemy.size / 2 + wobble, enemy.size * 0.65, enemy.size);
        ctx.strokeRect(-enemy.size / 3, -enemy.size / 2 + wobble, enemy.size * 0.65, enemy.size);
        
        // Long barrel
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(enemy.size / 3, wobble - 3, 25, 6);
        
        // Scope
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(enemy.size / 4, wobble - enemy.size / 4, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'bomber':
        // Heavy unit
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.ellipse(0, wobble, enemy.size / 1.8, enemy.size / 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Bombs
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#1f2937';
          ctx.beginPath();
          ctx.arc(-enemy.size / 3 + i * enemy.size / 3, wobble + enemy.size / 3, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
  }

  ctx.restore();
}