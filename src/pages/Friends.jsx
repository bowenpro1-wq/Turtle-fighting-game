import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, UserPlus, Phone, MessageCircle, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Friends() {
  const [turtleId, setTurtleId] = useState('');
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndFriends();
  }, []);

  const loadUserAndFriends = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Get or create Turtle ID
      let profile = await base44.entities.TurtleProfile.filter({ user_email: currentUser.email });
      if (profile.length === 0) {
        const newId = `TURTLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        profile = await base44.entities.TurtleProfile.create({
          user_email: currentUser.email,
          turtle_id: newId,
          display_name: currentUser.full_name,
          is_online: true
        });
        setTurtleId(newId);
      } else {
        setTurtleId(profile[0].turtle_id);
        await base44.entities.TurtleProfile.update(profile[0].id, { is_online: true });
      }

      // Load friends
      const friendsList = await base44.entities.Friend.filter({ user_email: currentUser.email, status: 'accepted' });
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await base44.entities.TurtleProfile.filter({
        turtle_id: searchQuery.toUpperCase()
      });
      setSearchResults(results.filter(r => r.user_email !== user.email));
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleAddFriend = async (friendProfile) => {
    try {
      await base44.entities.Friend.create({
        user_email: user.email,
        friend_email: friendProfile.user_email,
        turtle_id: friendProfile.turtle_id,
        status: 'accepted'
      });

      await base44.entities.Friend.create({
        user_email: friendProfile.user_email,
        friend_email: user.email,
        turtle_id: turtleId,
        status: 'accepted'
      });

      loadUserAndFriends();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-cyan-500/30">
          <div className="text-center">
            <div className="text-cyan-400 text-sm mb-1">你的龟龟ID</div>
            <div className="text-3xl font-bold text-white">{turtleId}</div>
          </div>
        </div>

        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-400" />
            搜索好友
          </h2>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入龟龟ID搜索..."
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} className="bg-cyan-600 hover:bg-cyan-700">
              搜索
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map(result => (
                <div key={result.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                  <div>
                    <div className="text-white font-bold">{result.display_name}</div>
                    <div className="text-slate-400 text-sm">{result.turtle_id}</div>
                  </div>
                  <Button onClick={() => handleAddFriend(result)} size="sm" className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">我的好友</h2>
          <div className="space-y-2">
            {friends.map(friend => (
              <motion.div
                key={friend.id}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <div className="text-white font-bold">{friend.turtle_id}</div>
                  <div className="text-green-400 text-sm">● 在线</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Gamepad2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {friends.length === 0 && (
              <div className="text-slate-400 text-center py-8">还没有好友，搜索并添加吧！</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}