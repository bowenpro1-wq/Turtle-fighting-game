import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TurtleIDDisplay() {
  const [turtleId, setTurtleId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTurtleId();
  }, []);

  const loadTurtleId = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.PlayerProfile.filter({ user_email: user.email });
      
      if (profiles.length > 0 && profiles[0].turtle_id) {
        setTurtleId(profiles[0].turtle_id);
      } else {
        // Generate new Turtle ID
        const newId = `TURTLE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        if (profiles.length > 0) {
          await base44.entities.PlayerProfile.update(profiles[0].id, { turtle_id: newId });
        } else {
          await base44.entities.PlayerProfile.create({
            user_email: user.email,
            turtle_id: newId
          });
        }
        setTurtleId(newId);
      }
    } catch (error) {
      console.error('Failed to load Turtle ID:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(turtleId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2 rounded-lg border border-cyan-500/30">
      <span className="text-cyan-400 font-mono text-sm font-bold">🐢 {turtleId}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={copyToClipboard}
        className="h-6 w-6"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
      </Button>
    </div>
  );
}