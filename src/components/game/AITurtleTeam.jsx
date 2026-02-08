// AI Turtle Team System - 10-20 colored turtles fighting separately
export function createAITurtleTeam(count = 15) {
  const colors = [
    '#4ade80', '#3b82f6', '#ef4444', '#a855f7', '#eab308',
    '#f97316', '#ec4899', '#06b6d4', '#84cc16', '#d946ef',
    '#0ea5e9', '#f43f5e', '#8b5cf6', '#14b8a6', '#f59e0b',
    '#10b981', '#6366f1', '#22d3ee', '#a3e635', '#fb923c'
  ];

  const turtles = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    const spreadDist = 300 + Math.random() * 500; // Spread them out!
    
    turtles.push({
      id: `ai_turtle_${i}`,
      color: colors[i % colors.length],
      x: 0, // Will be set relative to spawn point
      y: 0,
      offsetX: Math.cos(angle) * spreadDist,
      offsetY: Math.sin(angle) * spreadDist,
      width: 40,
      height: 50,
      health: 150,
      maxHealth: 150,
      damage: 15,
      speed: 2.5 + Math.random() * 1.5,
      vx: 0,
      vy: 0,
      lastShot: Date.now(),
      behaviorPattern: ['aggressive', 'defensive', 'support'][i % 3],
      preferredRange: 200 + Math.random() * 300
    });
  }
  
  return turtles;
}

export function updateAITurtles(turtles, playerPos, enemies, game) {
  turtles.forEach(turtle => {
    // Find nearest enemy
    let closestEnemy = null;
    let closestDist = Infinity;
    
    enemies.forEach(enemy => {
      const dx = enemy.x + enemy.width / 2 - turtle.x;
      const dy = enemy.y + enemy.height / 2 - turtle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closestEnemy = enemy;
      }
    });

    // Behavior based on pattern
    if (turtle.behaviorPattern === 'aggressive') {
      // Chase and attack enemies
      if (closestEnemy && closestDist < 800) {
        const dx = closestEnemy.x - turtle.x;
        const dy = closestEnemy.y - turtle.y;
        const angle = Math.atan2(dy, dx);
        turtle.vx = Math.cos(angle) * turtle.speed;
        turtle.vy = Math.sin(angle) * turtle.speed;
      } else {
        // Patrol randomly
        if (Math.random() < 0.02) {
          const randomAngle = Math.random() * Math.PI * 2;
          turtle.vx = Math.cos(randomAngle) * turtle.speed * 0.5;
          turtle.vy = Math.sin(randomAngle) * turtle.speed * 0.5;
        }
      }
    } else if (turtle.behaviorPattern === 'defensive') {
      // Stay near player but attack enemies
      const dx = playerPos.x - turtle.x;
      const dy = playerPos.y - turtle.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);
      
      if (distToPlayer > 200) {
        const angle = Math.atan2(dy, dx);
        turtle.vx = Math.cos(angle) * turtle.speed;
        turtle.vy = Math.sin(angle) * turtle.speed;
      } else if (closestEnemy && closestDist < 400) {
        // Attack from defensive position
        const edx = closestEnemy.x - turtle.x;
        const edy = closestEnemy.y - turtle.y;
        if (closestDist > 150) {
          const angle = Math.atan2(edy, edx);
          turtle.vx = Math.cos(angle) * turtle.speed * 0.5;
          turtle.vy = Math.sin(angle) * turtle.speed * 0.5;
        }
      } else {
        turtle.vx *= 0.9;
        turtle.vy *= 0.9;
      }
    } else {
      // Support - stay back and shoot
      const dx = playerPos.x - turtle.x;
      const dy = playerPos.y - turtle.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);
      
      if (distToPlayer > 300) {
        const angle = Math.atan2(dy, dx);
        turtle.vx = Math.cos(angle) * turtle.speed * 0.8;
        turtle.vy = Math.sin(angle) * turtle.speed * 0.8;
      } else if (distToPlayer < 200) {
        const angle = Math.atan2(dy, dx);
        turtle.vx = -Math.cos(angle) * turtle.speed * 0.5;
        turtle.vy = -Math.sin(angle) * turtle.speed * 0.5;
      } else {
        turtle.vx *= 0.95;
        turtle.vy *= 0.95;
      }
    }

    turtle.x += turtle.vx;
    turtle.y += turtle.vy;

    // Shoot at enemies
    if (closestEnemy && closestDist < turtle.preferredRange && Date.now() - turtle.lastShot > 800) {
      const dx = closestEnemy.x + closestEnemy.width / 2 - turtle.x;
      const dy = closestEnemy.y + closestEnemy.height / 2 - turtle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      game.bullets.push({
        x: turtle.x,
        y: turtle.y,
        vx: (dx / dist) * 12,
        vy: (dy / dist) * 12,
        damage: turtle.damage,
        size: 6,
        color: turtle.color,
        fromPlayer: true,
        fromAITurtle: true
      });
      
      turtle.lastShot = Date.now();
    }
  });
}

export function drawAITurtle(ctx, turtle, camera, frame) {
  const x = turtle.x - camera.x;
  const y = turtle.y - camera.y;
  
  ctx.save();
  
  const bobOffset = Math.sin(frame * 0.15 + turtle.id.charCodeAt(10)) * 1.5;
  
  // Shell
  ctx.fillStyle = turtle.color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y + bobOffset, 18, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Head
  ctx.fillStyle = turtle.color;
  ctx.beginPath();
  ctx.ellipse(x, y + bobOffset - 18, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - 2, y + bobOffset - 19, 1.5, 0, Math.PI * 2);
  ctx.arc(x + 2, y + bobOffset - 19, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Health bar
  const healthPercent = turtle.health / turtle.maxHealth;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(x - 20, y - 35, 40, 4);
  ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : '#ef4444';
  ctx.fillRect(x - 20, y - 35, 40 * healthPercent, 4);
  
  ctx.restore();
}