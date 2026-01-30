import React, { useEffect, useRef } from 'react';

export default function BossCanvas({ boss, bossHealth, onBossDamage, playerX, playerY, isFlying, camera }) {
  const canvasRef = useRef(null);
  const bossRef = useRef({
    x: 2000,
    y: 1500,
    vx: 0,
    vy: 0,
    lastShot: Date.now(),
    phase: 0,
    bullets: [],
    rotation: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !boss) return;

    const ctx = canvas.getContext('2d');
    const bossState = bossRef.current;
    let animationId;

    const gameLoop = () => {
      // Boss AI based on pattern
      const dx = playerX - bossState.x;
      const dy = playerY - bossState.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      bossState.rotation += 0.02;

      switch (boss.pattern) {
        case 'circle':
          // Circle movement
          bossState.x = 2000 + Math.cos(Date.now() * 0.001) * 300;
          bossState.y = 1500 + Math.sin(Date.now() * 0.001) * 300;
          
          // Shoot in 8 directions
          if (Date.now() - bossState.lastShot > 2000) {
            for (let i = 0; i < 8; i++) {
              const angle = (Math.PI * 2 / 8) * i;
              bossState.bullets.push({
                x: bossState.x,
                y: bossState.y,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6,
                damage: boss.damage,
                type: 'star'
              });
            }
            bossState.lastShot = Date.now();
          }
          break;

        case 'zigzag':
          // Zigzag movement toward player
          bossState.vx = (dx / dist) * boss.speed + Math.sin(Date.now() * 0.005) * 3;
          bossState.vy = (dy / dist) * boss.speed;
          bossState.x += bossState.vx;
          bossState.y += bossState.vy;
          
          // Shoot triple shots
          if (Date.now() - bossState.lastShot > 1500) {
            for (let i = -1; i <= 1; i++) {
              const angle = Math.atan2(dy, dx) + i * 0.3;
              bossState.bullets.push({
                x: bossState.x,
                y: bossState.y,
                vx: Math.cos(angle) * 8,
                vy: Math.sin(angle) * 8,
                damage: boss.damage,
                type: 'laser'
              });
            }
            bossState.lastShot = Date.now();
          }
          break;

        case 'teleport':
          // Teleport periodically
          if (Date.now() - bossState.lastShot > 3000) {
            bossState.x = playerX + (Math.random() - 0.5) * 600;
            bossState.y = playerY + (Math.random() - 0.5) * 600;
            
            // Summon ring of bullets
            for (let i = 0; i < 16; i++) {
              const angle = (Math.PI * 2 / 16) * i;
              bossState.bullets.push({
                x: bossState.x,
                y: bossState.y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                damage: boss.damage,
                type: 'orb'
              });
            }
            bossState.lastShot = Date.now();
          }
          break;

        case 'spiral':
          // Spiral pattern
          bossState.x = playerX + Math.cos(Date.now() * 0.002) * (400 - Date.now() * 0.05 % 400);
          bossState.y = playerY + Math.sin(Date.now() * 0.002) * (400 - Date.now() * 0.05 % 400);
          
          if (Date.now() - bossState.lastShot > 500) {
            const angle = bossState.rotation;
            bossState.bullets.push({
              x: bossState.x,
              y: bossState.y,
              vx: Math.cos(angle) * 7,
              vy: Math.sin(angle) * 7,
              damage: boss.damage,
              type: 'spiral'
            });
            bossState.lastShot = Date.now();
          }
          break;

        default:
          // Chase player
          bossState.vx = (dx / dist) * boss.speed;
          bossState.vy = (dy / dist) * boss.speed;
          bossState.x += bossState.vx;
          bossState.y += bossState.vy;
          
          if (Date.now() - bossState.lastShot > 2000) {
            const angle = Math.atan2(dy, dx);
            bossState.bullets.push({
              x: bossState.x,
              y: bossState.y,
              vx: Math.cos(angle) * 10,
              vy: Math.sin(angle) * 10,
              damage: boss.damage,
              type: 'normal'
            });
            bossState.lastShot = Date.now();
          }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [boss, playerX, playerY]);

  return null; // Boss rendering handled in main canvas
}