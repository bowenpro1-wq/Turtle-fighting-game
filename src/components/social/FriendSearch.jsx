import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FriendSearch({ onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const profiles = await base44.entities.PlayerProfile.filter({
        turtle_id: searchQuery.toUpperCase()
      });
      
      setSearchResults(profiles);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const sendFriendRequest = async (profile) => {
    try {
      const user = await base44.auth.me();
      const myProfile = await base44.entities.PlayerProfile.filter({ user_email: user.email });
      
      await base44.entities.Friend.create({
        user_email: user.email,
        friend_email: profile.user_email,
        turtle_id: profile.turtle_id,
        status: 'pending'
      });
      
      setSentRequests([...sentRequests, profile.turtle_id]);
    } catch (error) {
      console.error('Failed to send request:', error);
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
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border-2 border-cyan-500/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4">搜索好友</h2>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="输入 Turtle ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-slate-800 border-cyan-500/30 text-white"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {searchResults.map((profile) => (
              <motion.div
                key={profile.turtle_id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <div className="text-white font-bold">{profile.display_name || '玩家'}</div>
                  <div className="text-cyan-400 text-sm font-mono">{profile.turtle_id}</div>
                  {profile.is_online && (
                    <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      在线
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => sendFriendRequest(profile)}
                  disabled={sentRequests.includes(profile.turtle_id)}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {sentRequests.includes(profile.turtle_id) ? (
                    <><Check className="w-4 h-4 mr-1" /> 已发送</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-1" /> 添加</>
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {searchResults.length === 0 && !loading && searchQuery && (
            <div className="text-white/60 text-center py-8">未找到玩家</div>
          )}
        </div>

        <Button onClick={onClose} variant="outline" className="w-full mt-4">
          关闭
        </Button>
      </motion.div>
    </motion.div>
  );
}