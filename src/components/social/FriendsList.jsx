import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Users, Phone, MessageCircle, Gamepad2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FriendsList({ onClose, onStartVoiceCall }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('friends');

  useEffect(() => {
    loadFriends();
    loadRequests();
    
    const unsubscribe = base44.entities.Friend.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        loadFriends();
        loadRequests();
      }
    });
    
    return unsubscribe;
  }, []);

  const loadFriends = async () => {
    try {
      const user = await base44.auth.me();
      const friendsList = await base44.entities.Friend.filter({
        user_email: user.email,
        status: 'accepted'
      });
      
      const friendProfiles = await Promise.all(
        friendsList.map(async (f) => {
          const profiles = await base44.entities.PlayerProfile.filter({
            user_email: f.friend_email
          });
          return profiles[0];
        })
      );
      
      setFriends(friendProfiles.filter(Boolean));
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const user = await base44.auth.me();
      const pendingRequests = await base44.entities.Friend.filter({
        friend_email: user.email,
        status: 'pending'
      });
      
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const acceptRequest = async (request) => {
    try {
      await base44.entities.Friend.update(request.id, { status: 'accepted' });
      
      // Create reverse friendship
      const user = await base44.auth.me();
      await base44.entities.Friend.create({
        user_email: user.email,
        friend_email: request.user_email,
        status: 'accepted'
      });
      
      loadRequests();
      loadFriends();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const rejectRequest = async (request) => {
    try {
      await base44.entities.Friend.delete(request.id);
      loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border-2 border-cyan-500/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4">好友列表</h2>
        
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setTab('friends')}
            className={tab === 'friends' ? 'bg-cyan-600' : 'bg-slate-700'}
          >
            好友 ({friends.length})
          </Button>
          <Button
            onClick={() => setTab('requests')}
            className={tab === 'requests' ? 'bg-cyan-600' : 'bg-slate-700'}
          >
            请求 ({requests.length})
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {tab === 'friends' && (
            <AnimatePresence>
              {friends.map((friend) => (
                <motion.div
                  key={friend.turtle_id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-800/50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">{friend.display_name || '玩家'}</div>
                      <div className="text-cyan-400 text-sm font-mono">{friend.turtle_id}</div>
                      {friend.is_online && (
                        <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          在线
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-blue-600">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-purple-600">
                        <Gamepad2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {tab === 'requests' && (
            <AnimatePresence>
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-800/50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">{request.turtle_id}</div>
                      <div className="text-white/60 text-sm">想要添加你为好友</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptRequest(request)} className="bg-green-600">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => rejectRequest(request)} className="bg-red-600">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <Button onClick={onClose} variant="outline" className="w-full mt-4">
          关闭
        </Button>
      </motion.div>
    </motion.div>
  );
}