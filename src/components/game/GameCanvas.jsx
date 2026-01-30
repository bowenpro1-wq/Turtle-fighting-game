import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

const CANVAS_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;
const CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;

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
  score
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, width: 50, height: 50, speed: 5 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    particles: [],
    keys: {},
    lastEnemySpawn: 0,
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
            damage: 10,
            size: 8
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

      // Draw underwater background
      drawBackground(ctx, game.animationFrame);

      // Player movement
      if (game.keys['w'] || game.keys['arrowup']) game.player.y -= game.player.speed;
      if (game.keys['s'] || game.keys['arrowdown']) game.player.y += game.player.speed;
      if (game.keys['a'] || game.keys['arrowleft']) game.player.x -= game.player.speed;
      if (game.keys['d'] || game.keys['arrowright']) game.player.x += game.player.speed;

      // Keep player in bounds
      game.player.x = Math.max(25, Math.min(CANVAS_WIDTH - 25, game.player.x));
      game.player.y = Math.max(25, Math.min(CANVAS_HEIGHT - 25, game.player.y));

      // Spawn enemies (not during boss fight)
      if (gameState === 'playing') {
        if (Date.now() - game.lastEnemySpawn > 2000) {
          game.enemies.push(spawnEnemy());
          game.lastEnemySpawn = Date.now();
        }

        // Check for boss spawn based on score
        const bossIndex = Math.floor(score / 500);
        if (bossIndex < 20 && !defeatedBosses.includes(bossIndex + 1) && score >= (bossIndex + 1) * 500 - 100) {
          onTriggerBoss(bossIndex);
        }
      }

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
  }, [gameState, isFlying, shoot, heal, fly, onPlayerDamage, onEnemyKill, onBossDamage, onTriggerBoss, spawnEnemy, spawnBossEnemy, currentBoss, defeatedBosses, score]);

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
  // Animated water caustics
  ctx.save();
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 10; i++) {
    const x = (frame * 0.5 + i * 150) % (CANVAS_WIDTH + 200) - 100;
    const y = Math.sin(frame * 0.02 + i) * 50 + CANVAS_HEIGHT / 2;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(x, y, 100, 30, Math.sin(frame * 0.01 + i), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Floating seaweed
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 8; i++) {
    const baseX = (i + 1) * (CANVAS_WIDTH / 9);
    const waveOffset = Math.sin(frame * 0.03 + i) * 20;
    
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(baseX, CANVAS_HEIGHT);
    ctx.bezierCurveTo(
      baseX + waveOffset, CANVAS_HEIGHT - 100,
      baseX - waveOffset, CANVAS_HEIGHT - 200,
      baseX + waveOffset * 0.5, CANVAS_HEIGHT - 300
    );
    ctx.stroke();
  }
  ctx.restore();

  // Bubbles
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 15; i++) {
    const x = (i * 100 + frame * 0.3) % CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - ((frame + i * 50) % CANVAS_HEIGHT);
    const size = 5 + Math.sin(frame * 0.1 + i) * 3;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer(ctx, player, isFlying, frame) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Flying glow effect
  if (isFlying) {
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#38bdf8';
    
    // Flying particles trail
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

  // Turtle body (shell)
  const bobOffset = Math.sin(frame * 0.1) * 3;
  
  // Shell shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(3, 3 + bobOffset, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell base
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.ellipse(0, bobOffset, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(0, bobOffset, 20, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell highlights
  ctx.fillStyle = '#4ade80';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i + frame * 0.02;
    const x = Math.cos(angle) * 10;
    const y = Math.sin(angle) * 8 + bobOffset;
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 4, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.ellipse(0, -25 + bobOffset, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-4, -27 + bobOffset, 3, 0, Math.PI * 2);
  ctx.arc(4, -27 + bobOffset, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-3, -28 + bobOffset, 1, 0, Math.PI * 2);
  ctx.arc(5, -28 + bobOffset, 1, 0, Math.PI * 2);
  ctx.fill();

  // Flippers
  const flipperAngle = Math.sin(frame * 0.15) * 0.3;
  ctx.fillStyle = '#86efac';
  
  // Left flipper
  ctx.save();
  ctx.translate(-25, bobOffset);
  ctx.rotate(-0.5 + flipperAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right flipper
  ctx.save();
  ctx.translate(25, bobOffset);
  ctx.rotate(0.5 - flipperAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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