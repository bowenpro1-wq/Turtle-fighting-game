import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

const CANVAS_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;
const CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;

// Static buildings/structures
const BUILDINGS = [
  { x: 150, y: 200, width: 120, height: 150, type: 'tower' },
  { x: CANVAS_WIDTH - 270, y: 200, width: 120, height: 150, type: 'tower' },
  { x: 400, y: 450, width: 100, height: 80, type: 'house' },
  { x: CANVAS_WIDTH - 500, y: 450, width: 100, height: 80, type: 'house' },
  { x: CANVAS_WIDTH / 2 - 60, y: 150, width: 120, height: 100, type: 'castle' },
  { x: 200, y: CANVAS_HEIGHT - 250, width: 90, height: 90, type: 'house' },
  { x: CANVAS_WIDTH - 290, y: CANVAS_HEIGHT - 250, width: 90, height: 90, type: 'house' },
];

const FENCES = [
  { x1: 100, y1: 100, x2: 300, y2: 100 },
  { x1: CANVAS_WIDTH - 300, y1: 100, x2: CANVAS_WIDTH - 100, y2: 100 },
  { x1: 100, y1: CANVAS_HEIGHT - 100, x2: 400, y2: CANVAS_HEIGHT - 100 },
  { x1: CANVAS_WIDTH - 400, y1: CANVAS_HEIGHT - 100, x2: CANVAS_WIDTH - 100, y2: CANVAS_HEIGHT - 100 },
];

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
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, width: 50, height: 50, speed: 5, angle: 0 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    particles: [],
    coins: [],
    keys: {},
    lastEnemySpawn: 0,
    lastCoinSpawn: 0,
    bossSpawnScore: 500,
    animationFrame: 0
  });

  const spawnEnemy = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
      case 0: x = Math.random() * CANVAS_WIDTH; y = -50; break;
      case 1: x = CANVAS_WIDTH + 50; y = Math.random() * CANVAS_HEIGHT; break;
      case 2: x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + 50; break;
      default: x = -50; y = Math.random() * CANVAS_HEIGHT; break;
    }

    const types = ['jellyfish', 'crab', 'fish', 'starfish'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      x, y,
      type,
      health: 30,
      speed: 1 + Math.random() * 1.5,
      lastShot: Date.now(),
      shootInterval: 1500 + Math.random() * 1000,
      angle: 0,
      size: 35 + Math.random() * 15
    };
  }, []);

  const spawnBossEnemy = useCallback((boss) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 300;
    return {
      x: CANVAS_WIDTH / 2 + Math.cos(angle) * distance,
      y: CANVAS_HEIGHT / 2 + Math.sin(angle) * distance,
      health: boss.health,
      maxHealth: boss.health,
      speed: boss.speed,
      damage: boss.damage,
      size: boss.size,
      color: boss.color,
      pattern: boss.pattern,
      lastShot: Date.now(),
      shootInterval: 800,
      angle: 0,
      patternTimer: 0,
      isBoss: true,
      name: boss.name
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

    if (e.key.toLowerCase() === 'k') {
      if (shoot()) {
        const bullet = {
          x: game.player.x,
          y: game.player.y - 20,
          speed: 12,
          damage: 10 * upgrades.damage,
          size: 8,
          angle: game.player.angle
        };
        game.bullets.push(bullet);
          
          // Muzzle flash particles
          for (let i = 0; i < 5; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: (Math.random() - 0.5) * 3,
              vy: -Math.random() * 3,
              life: 20,
              color: '#4ade80',
              size: 4
            });
          }
        }
      }
      
      if (e.key.toLowerCase() === 'h') {
        if (heal()) {
          // Heal particles
          for (let i = 0; i < 20; i++) {
            game.particles.push({
              x: game.player.x + (Math.random() - 0.5) * 50,
              y: game.player.y + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 2,
              vy: -Math.random() * 3,
              life: 40,
              color: '#22c55e',
              size: 6,
              type: 'heal'
            });
          }
        }
      }
      
      if (e.key.toLowerCase() === 'o') {
        if (fly()) {
          // Fly activation particles
          for (let i = 0; i < 30; i++) {
            game.particles.push({
              x: game.player.x + (Math.random() - 0.5) * 60,
              y: game.player.y + (Math.random() - 0.5) * 60,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 50,
              color: '#38bdf8',
              size: 5,
              type: 'fly'
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

      // Draw background (grass/terrain)
      drawBackground(ctx, game.animationFrame);

      // Draw buildings and fences
      drawBuildings(ctx, BUILDINGS);
      drawFences(ctx, FENCES);

      // Player movement
      const baseSpeed = 5 * upgrades.speed;
      let moveX = 0, moveY = 0;
      if (game.keys['w'] || game.keys['arrowup']) moveY -= baseSpeed;
      if (game.keys['s'] || game.keys['arrowdown']) moveY += baseSpeed;
      if (game.keys['a'] || game.keys['arrowleft']) moveX -= baseSpeed;
      if (game.keys['d'] || game.keys['arrowright']) moveX += baseSpeed;

      // Calculate player angle based on movement
      if (moveX !== 0 || moveY !== 0) {
        game.player.angle = Math.atan2(moveY, moveX);
      }

      game.player.x += moveX;
      game.player.y += moveY;

      // Keep player in bounds
      game.player.x = Math.max(25, Math.min(CANVAS_WIDTH - 25, game.player.x));
      game.player.y = Math.max(25, Math.min(CANVAS_HEIGHT - 25, game.player.y));

      // Spawn enemies (not during boss fight)
      if (gameState === 'playing') {
        if (Date.now() - game.lastEnemySpawn > 2000) {
          game.enemies.push(spawnEnemy());
          game.lastEnemySpawn = Date.now();
        }

        // Spawn collectible coins
        if (Date.now() - game.lastCoinSpawn > 5000) {
          game.coins.push({
            x: Math.random() * (CANVAS_WIDTH - 100) + 50,
            y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
            size: 15,
            collected: false
          });
          game.lastCoinSpawn = Date.now();
        }

        // Check for boss spawn based on score
        const bossIndex = Math.floor(score / 500);
        if (bossIndex < 20 && !defeatedBosses.includes(bossIndex + 1) && score >= (bossIndex + 1) * 500 - 100) {
          onTriggerBoss(bossIndex);
        }
      }

      // Update and draw coins
      game.coins = game.coins.filter(coin => {
        if (!coin.collected) {
          const dx = game.player.x - coin.x;
          const dy = game.player.y - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 30) {
            coin.collected = true;
            return false;
          }

          // Draw coin
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Inner shine
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.arc(coin.x - 3, coin.y - 3, coin.size / 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          return true;
        }
        return false;
      });

      // Spawn boss
      if (gameState === 'boss' && currentBoss && !game.enemies.find(e => e.isBoss)) {
        game.enemies = game.enemies.filter(e => !e.isBoss);
        game.enemies.push(spawnBossEnemy(currentBoss));
      }

      // Update and draw enemies
      game.enemies = game.enemies.filter(enemy => {
        // Move towards player
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (enemy.isBoss) {
          // Boss movement patterns
          enemy.patternTimer++;
          const patternMove = getBossMovement(enemy, game.player, enemy.patternTimer);
          enemy.x += patternMove.x;
          enemy.y += patternMove.y;
        } else {
          enemy.x += (dx / dist) * enemy.speed;
          enemy.y += (dy / dist) * enemy.speed;
        }

        enemy.angle = Math.atan2(dy, dx);

        // Enemy shooting
        if (Date.now() - enemy.lastShot > enemy.shootInterval) {
          const bulletSpeed = enemy.isBoss ? 6 : 4;
          const bulletDamage = enemy.isBoss ? enemy.damage : 10;
          
          if (enemy.isBoss && enemy.pattern === 'burst') {
            // Burst pattern - multiple bullets
            for (let i = 0; i < 8; i++) {
              const angle = (Math.PI * 2 / 8) * i;
              game.enemyBullets.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * bulletSpeed,
                vy: Math.sin(angle) * bulletSpeed,
                damage: bulletDamage,
                size: 6,
                color: enemy.color || '#ef4444'
              });
            }
          } else {
            game.enemyBullets.push({
              x: enemy.x,
              y: enemy.y,
              vx: (dx / dist) * bulletSpeed,
              vy: (dy / dist) * bulletSpeed,
              damage: bulletDamage,
              size: enemy.isBoss ? 8 : 5,
              color: enemy.color || '#ef4444'
            });
          }
          enemy.lastShot = Date.now();
        }

        // Draw enemy
        drawEnemy(ctx, enemy, game.animationFrame);

        // Keep enemy
        return enemy.health > 0;
      });

      // Update bullets
      game.bullets = game.bullets.filter(bullet => {
        bullet.y -= bullet.speed;

        // Check collision with enemies
        for (let enemy of game.enemies) {
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < enemy.size / 2 + bullet.size) {
            enemy.health -= bullet.damage;
            
            // Hit particles
            for (let i = 0; i < 8; i++) {
              game.particles.push({
                x: bullet.x,
                y: bullet.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 25,
                color: enemy.isBoss ? enemy.color : '#fbbf24',
                size: 4
              });
            }

            if (enemy.health <= 0) {
              // Death explosion
              for (let i = 0; i < 20; i++) {
                game.particles.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  life: 40,
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

        // Draw bullet
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#4ade80';
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return bullet.y > -20;
      });

      // Update enemy bullets
      game.enemyBullets = game.enemyBullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Check collision with player
        const dx = bullet.x - game.player.x;
        const dy = bullet.y - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 25 + bullet.size) {
          onPlayerDamage(bullet.damage);
          
          // Hit particles
          for (let i = 0; i < 10; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 20,
              color: '#ef4444',
              size: 4
            });
          }
          return false;
        }

        // Draw enemy bullet
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color;
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return bullet.x > -20 && bullet.x < CANVAS_WIDTH + 20 && 
               bullet.y > -20 && bullet.y < CANVAS_HEIGHT + 20;
      });

      // Update particles
      game.particles = game.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        const alpha = particle.life / 50;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return particle.life > 0;
      });

      // Draw player
      drawPlayer(ctx, game.player, isFlying, game.animationFrame);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameState, isFlying, shoot, heal, fly, onPlayerDamage, onEnemyKill, onBossDamage, onTriggerBoss, spawnEnemy, spawnBossEnemy, currentBoss, defeatedBosses, score, upgrades]);

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

function drawBackground(ctx, frame) {
  // Grass/terrain base
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#7cb342');
  gradient.addColorStop(0.5, '#8bc34a');
  gradient.addColorStop(1, '#689f38');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grass patches
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 50; i++) {
    const x = (i * 77 + Math.sin(i) * 50) % CANVAS_WIDTH;
    const y = (i * 93 + Math.cos(i) * 30) % CANVAS_HEIGHT;
    
    ctx.fillStyle = i % 3 === 0 ? '#558b2f' : '#7cb342';
    ctx.beginPath();
    ctx.ellipse(x, y, 20 + (i % 10), 10 + (i % 5), i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Dirt paths
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(CANVAS_WIDTH / 2 - 40, 0, 80, CANVAS_HEIGHT);
  ctx.fillRect(0, CANVAS_HEIGHT / 2 - 40, CANVAS_WIDTH, 80);
  ctx.restore();

  // Trees (simple)
  const trees = [
    { x: 80, y: 80 },
    { x: CANVAS_WIDTH - 80, y: 80 },
    { x: 80, y: CANVAS_HEIGHT - 80 },
    { x: CANVAS_WIDTH - 80, y: CANVAS_HEIGHT - 80 },
    { x: 300, y: 300 },
    { x: CANVAS_WIDTH - 300, y: 300 },
  ];

  trees.forEach(tree => {
    // Trunk
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(tree.x - 8, tree.y, 16, 40);
    
    // Foliage
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(tree.x, tree.y - 10, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#388e3c';
    ctx.beginPath();
    ctx.arc(tree.x - 10, tree.y - 5, 20, 0, Math.PI * 2);
    ctx.arc(tree.x + 10, tree.y - 5, 20, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBuildings(ctx, buildings) {
  buildings.forEach(building => {
    ctx.save();
    
    if (building.type === 'tower') {
      // Stone tower
      ctx.fillStyle = '#757575';
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Stones texture
      ctx.strokeStyle = '#616161';
      ctx.lineWidth = 2;
      for (let i = 0; i < building.height; i += 30) {
        for (let j = 0; j < building.width; j += 40) {
          ctx.strokeRect(building.x + j, building.y + i, 40, 30);
        }
      }
      
      // Top battlements
      ctx.fillStyle = '#616161';
      for (let i = 0; i < building.width; i += 30) {
        ctx.fillRect(building.x + i, building.y - 20, 20, 20);
      }
      
      // Windows
      ctx.fillStyle = '#424242';
      ctx.fillRect(building.x + building.width / 2 - 15, building.y + 40, 30, 40);
      ctx.fillRect(building.x + building.width / 2 - 15, building.y + 100, 30, 40);
      
    } else if (building.type === 'house') {
      // Walls
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(building.x, building.y + 30, building.width, building.height - 30);
      
      // Roof
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.moveTo(building.x - 10, building.y + 30);
      ctx.lineTo(building.x + building.width / 2, building.y);
      ctx.lineTo(building.x + building.width + 10, building.y + 30);
      ctx.closePath();
      ctx.fill();
      
      // Door
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(building.x + building.width / 2 - 15, building.y + 60, 30, 50);
      
      // Windows
      ctx.fillStyle = '#81d4fa';
      ctx.fillRect(building.x + 15, building.y + 50, 25, 25);
      ctx.fillRect(building.x + building.width - 40, building.y + 50, 25, 25);
      
      // Window frames
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2;
      ctx.strokeRect(building.x + 15, building.y + 50, 25, 25);
      ctx.strokeRect(building.x + building.width - 40, building.y + 50, 25, 25);
      
    } else if (building.type === 'castle') {
      // Main structure
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(building.x, building.y + 20, building.width, building.height - 20);
      
      // Towers on sides
      ctx.fillStyle = '#757575';
      ctx.fillRect(building.x - 20, building.y, 25, building.height + 20);
      ctx.fillRect(building.x + building.width - 5, building.y, 25, building.height + 20);
      
      // Battlements
      ctx.fillStyle = '#616161';
      for (let i = 0; i < building.width; i += 25) {
        ctx.fillRect(building.x + i, building.y - 10, 18, 15);
      }
      
      // Gate
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(building.x + building.width / 2 - 25, building.y + 50, 50, 70);
      
      // Gate arch
      ctx.beginPath();
      ctx.arc(building.x + building.width / 2, building.y + 50, 25, 0, Math.PI, true);
      ctx.fill();
    }
    
    ctx.restore();
  });
}

function drawFences(ctx, fences) {
  fences.forEach(fence => {
    ctx.save();
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Horizontal rails
    ctx.beginPath();
    ctx.moveTo(fence.x1, fence.y1);
    ctx.lineTo(fence.x2, fence.y2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(fence.x1, fence.y1 + 20);
    ctx.lineTo(fence.x2, fence.y2 + 20);
    ctx.stroke();
    
    // Vertical posts
    const numPosts = Math.floor(Math.abs(fence.x2 - fence.x1) / 40);
    for (let i = 0; i <= numPosts; i++) {
      const x = fence.x1 + (fence.x2 - fence.x1) * (i / numPosts);
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(x - 4, fence.y1 - 10, 8, 40);
    }
    
    ctx.restore();
  });
}

function drawPlayer(ctx, player, isFlying, frame) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle + Math.PI / 2);

  const scale = 1;
  
  // Flying glow effect
  if (isFlying) {
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#38bdf8';
    
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
      const angle = (frame * 0.1 + i * (Math.PI * 2 / 5));
      const dist = 40 + Math.sin(frame * 0.2 + i) * 10;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const bobOffset = Math.sin(frame * 0.1) * 2;
  
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(2, 2 + bobOffset, 25 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell base (darker green)
  ctx.fillStyle = '#2d5016';
  ctx.strokeStyle = '#1a3010';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, bobOffset, 25 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shell pattern (hexagons)
  ctx.fillStyle = '#4a7c2f';
  const hexSize = 6 * scale;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const hx = i * hexSize * 1.5;
      const hy = j * hexSize * 1.8 + bobOffset;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const angle = (Math.PI / 3) * k;
        const px = hx + Math.cos(angle) * hexSize;
        const py = hy + Math.sin(angle) * hexSize;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1a3010';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Shell highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-8, -8 + bobOffset, 10 * scale, 8 * scale, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -28 + bobOffset, 10 * scale, 9 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-4, -29 + bobOffset, 3.5, 0, Math.PI * 2);
  ctx.arc(4, -29 + bobOffset, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-4, -28 + bobOffset, 2, 0, Math.PI * 2);
  ctx.arc(4, -28 + bobOffset, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-3.5, -29 + bobOffset, 1, 0, Math.PI * 2);
  ctx.arc(4.5, -29 + bobOffset, 1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -25 + bobOffset, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Flippers (legs)
  const flipperAngle = Math.sin(frame * 0.15) * 0.2;
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
  ctx.lineWidth = 2;
  
  // Left front flipper
  ctx.save();
  ctx.translate(-20, -5 + bobOffset);
  ctx.rotate(-0.3 + flipperAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 12 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right front flipper
  ctx.save();
  ctx.translate(20, -5 + bobOffset);
  ctx.rotate(0.3 - flipperAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 12 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Back flippers
  ctx.save();
  ctx.translate(-18, 15 + bobOffset);
  ctx.rotate(-0.5 - flipperAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(18, 15 + bobOffset);
  ctx.rotate(0.5 + flipperAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Tail
  ctx.fillStyle = '#6b9b4c';
  ctx.strokeStyle = '#4a7c2f';
  ctx.beginPath();
  ctx.moveTo(0, 20 + bobOffset);
  ctx.lineTo(-5, 28 + bobOffset);
  ctx.lineTo(5, 28 + bobOffset);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawEnemy(ctx, enemy, frame) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  if (enemy.isBoss) {
    // Boss glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = enemy.color;

    // Boss body
    const pulse = 1 + Math.sin(frame * 0.1) * 0.1;
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size / 2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Boss inner glow
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size / 3 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Boss eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-enemy.size / 6, -enemy.size / 8, enemy.size / 10, 0, Math.PI * 2);
    ctx.arc(enemy.size / 6, -enemy.size / 8, enemy.size / 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-enemy.size / 6, -enemy.size / 8, enemy.size / 20, 0, Math.PI * 2);
    ctx.arc(enemy.size / 6, -enemy.size / 8, enemy.size / 20, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const barWidth = enemy.size;
    const barHeight = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-barWidth / 2, enemy.size / 2 + 10, barWidth, barHeight);
    ctx.fillStyle = enemy.health > enemy.maxHealth * 0.3 ? '#22c55e' : '#ef4444';
    ctx.fillRect(-barWidth / 2, enemy.size / 2 + 10, barWidth * (enemy.health / enemy.maxHealth), barHeight);
  } else {
    // Regular enemy
    const wobble = Math.sin(frame * 0.1 + enemy.x) * 5;
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';

    // Body based on type
    switch (enemy.type) {
      case 'jellyfish':
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, wobble, enemy.size / 2, Math.PI, 0);
        ctx.fill();
        // Tentacles
        for (let i = 0; i < 5; i++) {
          const tx = (i - 2) * 8;
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx, wobble);
          ctx.bezierCurveTo(tx + wobble / 2, wobble + 15, tx - wobble / 2, wobble + 25, tx + wobble / 3, wobble + 35);
          ctx.stroke();
        }
        break;
      case 'crab':
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(0, wobble, enemy.size / 2, enemy.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Claws
        ctx.beginPath();
        ctx.arc(-enemy.size / 2 - 10, wobble, 10, 0, Math.PI * 2);
        ctx.arc(enemy.size / 2 + 10, wobble, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'fish':
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(0, wobble, enemy.size / 2, enemy.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(-enemy.size / 2, wobble);
        ctx.lineTo(-enemy.size / 2 - 15, wobble - 10);
        ctx.lineTo(-enemy.size / 2 - 15, wobble + 10);
        ctx.closePath();
        ctx.fill();
        break;
      default: // starfish
        ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(0, wobble);
          ctx.lineTo(Math.cos(angle) * enemy.size / 2, Math.sin(angle) * enemy.size / 2 + wobble);
          ctx.lineTo(Math.cos(angle + 0.3) * enemy.size / 4, Math.sin(angle + 0.3) * enemy.size / 4 + wobble);
          ctx.closePath();
          ctx.fill();
        }
    }

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-5, wobble - 5, 4, 0, Math.PI * 2);
    ctx.arc(5, wobble - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, wobble - 5, 2, 0, Math.PI * 2);
    ctx.arc(5, wobble - 5, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function getBossMovement(boss, player, timer) {
  const dx = player.x - boss.x;
  const dy = player.y - boss.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  switch (boss.pattern) {
    case 'circle':
      return {
        x: Math.cos(timer * 0.02) * boss.speed * 2,
        y: Math.sin(timer * 0.02) * boss.speed * 2
      };
    case 'zigzag':
      return {
        x: Math.sin(timer * 0.05) * boss.speed * 3,
        y: (dy / dist) * boss.speed * 0.5
      };
    case 'chase':
      return {
        x: (dx / dist) * boss.speed,
        y: (dy / dist) * boss.speed
      };
    case 'teleport':
      if (timer % 120 === 0) {
        return {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200
        };
      }
      return { x: 0, y: 0 };
    case 'dash':
      if (timer % 100 < 20) {
        return {
          x: (dx / dist) * boss.speed * 4,
          y: (dy / dist) * boss.speed * 4
        };
      }
      return { x: 0, y: 0 };
    case 'spiral':
      const spiralAngle = timer * 0.03;
      const spiralDist = 100 + Math.sin(timer * 0.01) * 50;
      return {
        x: (player.x + Math.cos(spiralAngle) * spiralDist - boss.x) * 0.02,
        y: (player.y + Math.sin(spiralAngle) * spiralDist - boss.y) * 0.02
      };
    case 'bounce':
      return {
        x: Math.sin(timer * 0.04) * boss.speed * 2,
        y: Math.cos(timer * 0.03) * boss.speed * 2
      };
    case 'wave':
      return {
        x: (dx / dist) * boss.speed * 0.5,
        y: Math.sin(timer * 0.05) * boss.speed * 3
      };
    default:
      return {
        x: (dx / dist) * boss.speed * 0.8,
        y: (dy / dist) * boss.speed * 0.8
      };
  }
}