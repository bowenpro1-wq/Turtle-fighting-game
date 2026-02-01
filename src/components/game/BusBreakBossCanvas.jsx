import React, { useEffect, useRef } from 'react';

// 绘制不同Boss的独特形象
export function drawBusBreakBoss(ctx, boss, camera, frame, bossScreenX, bossScreenY, currentBoss) {
  ctx.save();
  
  if (currentBoss.id === 'zhongdalin') {
    // 中大林 - 石头巨人形象
    const baseSize = currentBoss.size || 120;
    
    // 身体 - 石头
    ctx.fillStyle = '#4ade80';
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 4;
    
    // 身体主体（矩形石块）
    const bodyWidth = baseSize * 0.8;
    const bodyHeight = baseSize;
    ctx.fillRect(bossScreenX - bodyWidth/2, bossScreenY - bodyHeight/2, bodyWidth, bodyHeight);
    ctx.strokeRect(bossScreenX - bodyWidth/2, bossScreenY - bodyHeight/2, bodyWidth, bodyHeight);
    
    // 石头纹理
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(
        bossScreenX - bodyWidth/2 + 10, 
        bossScreenY - bodyHeight/2 + i * 20, 
        bodyWidth - 20, 
        8
      );
    }
    
    // 裂痕
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bossScreenX - 20, bossScreenY - 30);
    ctx.lineTo(bossScreenX - 15, bossScreenY);
    ctx.moveTo(bossScreenX + 15, bossScreenY - 20);
    ctx.lineTo(bossScreenX + 20, bossScreenY + 10);
    ctx.stroke();
    
    // 头部 - 圆形
    const headSize = baseSize * 0.35;
    ctx.fillStyle = '#4ade80';
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY - bodyHeight/2 - headSize, headSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 愤怒的眼睛
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(bossScreenX - 12, bossScreenY - bodyHeight/2 - headSize, 5, 0, Math.PI * 2);
    ctx.arc(bossScreenX + 12, bossScreenY - bodyHeight/2 - headSize, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 愤怒眉毛
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bossScreenX - 18, bossScreenY - bodyHeight/2 - headSize - 8);
    ctx.lineTo(bossScreenX - 8, bossScreenY - bodyHeight/2 - headSize - 3);
    ctx.moveTo(bossScreenX + 18, bossScreenY - bodyHeight/2 - headSize - 8);
    ctx.lineTo(bossScreenX + 8, bossScreenY - bodyHeight/2 - headSize - 3);
    ctx.stroke();
    
    // 愤怒的嘴
    ctx.beginPath();
    ctx.moveTo(bossScreenX - 10, bossScreenY - bodyHeight/2 - headSize + 15);
    ctx.lineTo(bossScreenX, bossScreenY - bodyHeight/2 - headSize + 10);
    ctx.lineTo(bossScreenX + 10, bossScreenY - bodyHeight/2 - headSize + 15);
    ctx.stroke();
    
    // 绿色能量光环
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.1) * 0.3;
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY, baseSize * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
  } else if (currentBoss.id === 'xiaowang') {
    // 小黄龙 - 龙形态，参考黑神话悟空
    const baseSize = currentBoss.size || 100;
    
    // 身体主干 - 金色龙身
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    
    // 龙身曲线
    const bodySegments = 5;
    const segmentWidth = 25;
    const wave = Math.sin(frame * 0.05);
    
    for (let i = 0; i < bodySegments; i++) {
      const offsetX = Math.sin((frame * 0.05) + i * 0.5) * 15;
      const y = bossScreenY - baseSize/2 + (i * 20);
      
      ctx.beginPath();
      ctx.ellipse(bossScreenX + offsetX, y, segmentWidth, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 龙鳞
      ctx.fillStyle = '#fbbf24';
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(bossScreenX + offsetX - 10 + j * 10, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f59e0b';
    }
    
    // 龙头
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(bossScreenX, bossScreenY - baseSize/2 - 25, 35, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 龙角
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bossScreenX - 20, bossScreenY - baseSize/2 - 35);
    ctx.lineTo(bossScreenX - 30, bossScreenY - baseSize/2 - 55);
    ctx.moveTo(bossScreenX + 20, bossScreenY - baseSize/2 - 35);
    ctx.lineTo(bossScreenX + 30, bossScreenY - baseSize/2 - 55);
    ctx.stroke();
    
    // 龙眼 - 发光的红色眼睛
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(bossScreenX - 12, bossScreenY - baseSize/2 - 28, 6, 0, Math.PI * 2);
    ctx.arc(bossScreenX + 12, bossScreenY - baseSize/2 - 28, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 龙须
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bossScreenX - 35, bossScreenY - baseSize/2 - 25);
    ctx.quadraticCurveTo(
      bossScreenX - 50, bossScreenY - baseSize/2 - 15,
      bossScreenX - 45, bossScreenY - baseSize/2 - 5
    );
    ctx.moveTo(bossScreenX + 35, bossScreenY - baseSize/2 - 25);
    ctx.quadraticCurveTo(
      bossScreenX + 50, bossScreenY - baseSize/2 - 15,
      bossScreenX + 45, bossScreenY - baseSize/2 - 5
    );
    ctx.stroke();
    
    // 能量光环
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5 + Math.sin(frame * 0.15) * 0.3;
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY - baseSize/4, baseSize * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
  } else if (currentBoss.id === 'guangzhi') {
    // 广智 - 火焰战神形态，参考黑神话悟空
    const baseSize = currentBoss.size || 150;
    
    // 身体 - 火焰能量体
    const gradient = ctx.createRadialGradient(
      bossScreenX, bossScreenY, 0,
      bossScreenX, bossScreenY, baseSize * 0.6
    );
    gradient.addColorStop(0, '#ff4500');
    gradient.addColorStop(0.5, '#ff6347');
    gradient.addColorStop(1, '#dc2626');
    
    // 主体
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(bossScreenX, bossScreenY, baseSize * 0.5, baseSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 火焰斗篷
    const cloakPoints = 12;
    ctx.fillStyle = '#ff6347';
    for (let i = 0; i < cloakPoints; i++) {
      const angle = (Math.PI * 2 / cloakPoints) * i;
      const flameLength = 40 + Math.sin(frame * 0.1 + i) * 20;
      const x1 = bossScreenX + Math.cos(angle) * baseSize * 0.5;
      const y1 = bossScreenY + Math.sin(angle) * baseSize * 0.6;
      const x2 = bossScreenX + Math.cos(angle) * (baseSize * 0.5 + flameLength);
      const y2 = bossScreenY + Math.sin(angle) * (baseSize * 0.6 + flameLength);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(
        bossScreenX + Math.cos(angle + 0.2) * baseSize * 0.5,
        bossScreenY + Math.sin(angle + 0.2) * baseSize * 0.6
      );
      ctx.closePath();
      ctx.fill();
    }
    
    // 头部标志 - "广智"字样效果
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('广', bossScreenX, bossScreenY - 15);
    ctx.fillText('广', bossScreenX, bossScreenY - 15);
    ctx.strokeText('智', bossScreenX, bossScreenY + 25);
    ctx.fillText('智', bossScreenX, bossScreenY + 25);
    
    // 火焰眼睛
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4500';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bossScreenX - 25, bossScreenY - 40, 8, 0, Math.PI * 2);
    ctx.arc(bossScreenX + 25, bossScreenY - 40, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 火焰光环
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.6 + Math.sin(frame * 0.2) * 0.4;
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY, baseSize * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
  } else if (currentBoss.id === 'longhaixing') {
    // 海星 - 水之守护者形态
    const baseSize = currentBoss.size || 110;
    
    // 五角星身体
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#0e7490';
    ctx.lineWidth = 4;
    
    const points = 5;
    const outerRadius = baseSize * 0.5;
    const innerRadius = baseSize * 0.25;
    
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = bossScreenX + Math.cos(angle) * radius;
      const y = bossScreenY + Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 中心宝石
    const gemGradient = ctx.createRadialGradient(
      bossScreenX, bossScreenY, 0,
      bossScreenX, bossScreenY, 20
    );
    gemGradient.addColorStop(0, '#22d3ee');
    gemGradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = gemGradient;
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // 神秘符文
    ctx.strokeStyle = '#ecfeff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 / points) * i - Math.PI / 2;
      const x = bossScreenX + Math.cos(angle) * outerRadius * 0.6;
      const y = bossScreenY + Math.sin(angle) * outerRadius * 0.6;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // 水波纹
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.1) * 0.3;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(bossScreenX, bossScreenY, baseSize * 0.4 * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
  } else if (currentBoss.id === 'qigong') {
    // 气功大师 - 气功能量形态
    const baseSize = currentBoss.size || 130;
    
    // 能量球体
    const energyGradient = ctx.createRadialGradient(
      bossScreenX, bossScreenY, 0,
      bossScreenX, bossScreenY, baseSize * 0.5
    );
    energyGradient.addColorStop(0, '#c084fc');
    energyGradient.addColorStop(0.5, '#a855f7');
    energyGradient.addColorStop(1, '#7c3aed');
    
    ctx.fillStyle = energyGradient;
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY, baseSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 旋转的能量环
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(bossScreenX, bossScreenY);
      ctx.rotate((frame * 0.02) + (i * Math.PI / 3));
      ctx.globalAlpha = 0.6;
      
      ctx.beginPath();
      ctx.ellipse(0, 0, baseSize * 0.4 + i * 10, baseSize * 0.2 + i * 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    
    // 太极图案
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY - 20, 15, 0, Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY + 20, 15, Math.PI, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bossScreenX, bossScreenY + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 能量粒子
    ctx.fillStyle = '#e9d5ff';
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + frame * 0.05;
      const radius = baseSize * 0.6;
      const x = bossScreenX + Math.cos(angle) * radius;
      const y = bossScreenY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

export default drawBusBreakBoss;