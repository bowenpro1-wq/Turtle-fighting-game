import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChatInvitationBanner() {
  const [invitations, setInvitations] = useState([]);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    loadInvitations();
    
    // Subscribe to new invitations
    const unsubscribe = base44.entities.ChatInvitation.subscribe((event) => {
      if (event.type === 'create') {
        loadInvitations();
      }
    });

    return unsubscribe;
  }, []);

  const loadInvitations = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.TurtleProfile.filter({ user_email: user.email });
      
      if (profiles.length > 0) {
        setMyProfile(profiles[0]);
        
        const pending = await base44.entities.ChatInvitation.filter({
          to_turtle_id: profiles[0].turtle_id,
          status: 'pending'
        });
        
        setInvitations(pending);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const handleAccept = async (invitation) => {
    try {
      const sessionId = [invitation.from_turtle_id, myProfile.turtle_id].sort().join('_');
      
      await base44.entities.ChatInvitation.update(invitation.id, {
        status: 'accepted',
        chat_session_id: sessionId
      });
      
      // Redirect to Friends page with chat open
      window.location.href = `/pages/Friends?chat=${invitation.from_turtle_id}`;
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleReject = async (invitation) => {
    try {
      await base44.entities.ChatInvitation.update(invitation.id, {
        status: 'rejected'
      });
      
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (error) {
      console.error('Failed to reject invitation:', error);
    }
  };

  return (
    <AnimatePresence>
      {invitations.map((inv, idx) => (
        <motion.div
          key={inv.id}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          style={{ top: `${80 + idx * 90}px` }}
          className="fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 shadow-2xl border-2 border-white/30">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-6 h-6 text-white" />
              <div className="flex-1">
                <p className="text-white font-bold text-lg">聊天邀请</p>
                <p className="text-white/90 text-sm">
                  {inv.from_name} 想和你聊天
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleAccept(inv)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1" />
                接受
              </Button>
              <Button
                onClick={() => handleReject(inv)}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-1" />
                拒绝
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}