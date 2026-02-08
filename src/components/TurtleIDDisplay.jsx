import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function TurtleIDDisplay() {
  const [turtleId, setTurtleId] = useState('');

  useEffect(() => {
    const loadTurtleId = async () => {
      try {
        const user = await base44.auth.me();
        let profile = await base44.entities.TurtleProfile.filter({ user_email: user.email });
        
        if (profile.length === 0) {
          const newId = `TURTLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          await base44.entities.TurtleProfile.create({
            user_email: user.email,
            turtle_id: newId,
            display_name: user.full_name,
            is_online: true
          });
          setTurtleId(newId);
        } else {
          setTurtleId(profile[0].turtle_id);
        }
      } catch (error) {
        console.error('Failed to load Turtle ID:', error);
      }
    };
    
    loadTurtleId();
  }, []);

  if (!turtleId) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-cyan-500/50 z-30">
      <div className="text-center">
        <div className="text-cyan-400 text-xs">龟龟ID</div>
        <div className="text-white font-bold text-lg">{turtleId}</div>
      </div>
    </div>
  );
}