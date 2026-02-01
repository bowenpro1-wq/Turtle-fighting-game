import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Heart, Star } from 'lucide-react';

export default function PowerUpSystem({ gameRef, onPowerUpCollect }) {
  const [powerUps, setPowerUps] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Spawn random power-ups
      if (Math.random() < 0.05 && powerUps.length < 5) {
        const types = ['shield', 'speed', 'heal', 'damage'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        setPowerUps(prev => [...prev, {
          id: Date.now(),
          type,
          x: Math.random() * 3000 + 500,
          y: Math.random() * 2500 + 250,
          lifetime: 300
        }]);
      }

      setPowerUps(prev => prev.map(p => ({
        ...p,
        lifetime: p.lifetime - 1
      })).filter(p => p.lifetime > 0));
    }, 100);

    return () => clearInterval(interval);
  }, [powerUps.length]);

  const powerUpInfo = {
    shield: { icon: Shield, color: '#60a5fa', label: '护盾' },
    speed: { icon: Zap, color: '#fbbf24', label: '加速' },
    heal: { icon: Heart, color: '#22c55e', label: '治疗' },
    damage: { icon: Star, color: '#f97316', label: '伤害' }
  };

  return { powerUps, powerUpInfo };
}