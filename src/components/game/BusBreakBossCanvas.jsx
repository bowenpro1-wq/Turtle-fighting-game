import React, { useEffect, useRef } from 'react';

const BUSBREAK_BOSSES = {
  zhongdalin: {
    name: '中大林广志',
    width: 120,
    height: 150,
    speed: 2.0,
    health: 3000,
    damage: 40,
    color: '#4ade80',
    pattern: 'chase'
  },
  xiaowang: {
    name: '小王',
    width: 100,
    height: 120,
    speed: 3.0,
    health: 2500,
    damage: 35,
    color: '#f59e0b',
    pattern: 'dash'
  },
  longhaixing: {
    name: '龙海星',
    width: 110,
    height: 130,
    speed: 2.5,
    health: 2800,
    damage: 38,
    color: '#06b6d4',
    pattern: 'teleport'
  },
  qigong: {
    name: '启功大师',
    width: 130,
    height: 160,
    speed: 1.5,
    health: 3500,
    damage: 45,
    color: '#8b5cf6',
    pattern: 'spiral'
  },
  guangzhi: {
    name: '广智',
    width: 150,
    height: 180,
    speed: 2.2,
    health: 5000,
    damage: 60,
    color: '#ff4500',
    pattern: 'flame'
  }
};

export default function BusBreakBossCanvas({ 
  bossId, 
  playerPos, 
  onPlayerDamage, 
  onBossDamage, 
  isFlying,
  camera,
  gameState 
}) {
  const bossRef = useRef({
    x: 2000,
    y: 1500,
    vx: 0,
    vy: 0,
    bullets: [],
    lastShot: Date.now(),
    dashCooldown: 0,
    teleportCooldown: 0
  });

  useEffect(() => {
    if (gameState !== 'boss') return;
    
    const boss = bossRef.current;
    const bossTemplate = BUSBREAK_BOSSES[bossId];
    if (!bossTemplate) return;

    let animationId;
    
    const gameLoop = () => {
      if (gameState !== 'boss') return;

      // Calculate distance to player
      const dx = playerPos.x - boss.x;
      const dy = playerPos.y - boss.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Boss AI based on pattern
      if (bossTemplate.pattern === 'chase') {
        // Direct chase
        boss.vx = (dx / dist) * bossTemplate.speed;
        boss.vy = (dy / dist) * bossTemplate.speed;
      } else if (bossTemplate.pattern === 'dash') {
        // Dash attack
        if (boss.dashCooldown <= 0 && dist < 400) {
          boss.vx = (dx / dist) * bossTemplate.speed * 3;
          boss.vy = (dy / dist) * bossTemplate.speed * 3;
          boss.dashCooldown = 100;
        } else {
          boss.vx *= 0.95;
          boss.vy *= 0.95;
          boss.dashCooldown--;
        }
      } else if (bossTemplate.pattern === 'teleport') {
        // Teleport
        if (boss.teleportCooldown <= 0 && dist > 300) {
          boss.x = playerPos.x + (Math.random() - 0.5) * 400;
          boss.y = playerPos.y + (Math.random() - 0.5) * 400;
          boss.teleportCooldown = 200;
        } else {
          boss.teleportCooldown--;
          boss.vx = (dx / dist) * bossTemplate.speed * 0.5;
          boss.vy = (dy / dist) * bossTemplate.speed * 0.5;
        }
      } else if (bossTemplate.pattern === 'spiral') {
        // Spiral movement
        const angle = Math.atan2(dy, dx) + Math.sin(Date.now() * 0.002) * 1.5;
        boss.vx = Math.cos(angle) * bossTemplate.speed;
        boss.vy = Math.sin(angle) * bossTemplate.speed;
      } else if (bossTemplate.pattern === 'flame') {
        // Stay at distance and shoot
        if (dist > 400) {
          boss.vx = (dx / dist) * bossTemplate.speed;
          boss.vy = (dy / dist) * bossTemplate.speed;
        } else if (dist < 300) {
          boss.vx = -(dx / dist) * bossTemplate.speed;
          boss.vy = -(dy / dist) * bossTemplate.speed;
        } else {
          boss.vx *= 0.9;
          boss.vy *= 0.9;
        }
      }

      boss.x += boss.vx;
      boss.y += boss.vy;

      // Keep in bounds
      boss.x = Math.max(bossTemplate.width / 2, Math.min(3900, boss.x));
      boss.y = Math.max(bossTemplate.height / 2, Math.min(2900, boss.y));

      // Collision damage
      if (dist < (bossTemplate.width / 2 + 25) && !isFlying) {
        onPlayerDamage(bossTemplate.damage * 0.1);
      }

      // Update bullets
      boss.bullets = boss.bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Check player collision
        const bdx = bullet.x - playerPos.x;
        const bdy = bullet.y - playerPos.y;
        const bdist = Math.sqrt(bdx * bdx + bdy * bdy);

        if (bdist < 30 && !isFlying) {
          onPlayerDamage(bossTemplate.damage * 0.5);
          return false;
        }

        return bullet.x > 0 && bullet.x < 4000 && bullet.y > 0 && bullet.y < 3000;
      });

      // Shooting
      if (Date.now() - boss.lastShot > 2000) {
        for (let i = 0; i < 5; i++) {
          const angle = Math.atan2(dy, dx) + (i - 2) * 0.3;
          boss.bullets.push({
            x: boss.x,
            y: boss.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            size: 12,
            color: bossTemplate.color
          });
        }
        boss.lastShot = Date.now();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [bossId, playerPos, onPlayerDamage, gameState, isFlying]);

  // Return boss state for rendering
  return { boss: bossRef.current, bossTemplate: BUSBREAK_BOSSES[bossId] };
}