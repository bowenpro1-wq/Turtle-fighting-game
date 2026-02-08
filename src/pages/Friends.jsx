import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, UserPlus, Phone, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import VoiceCall from '@/components/social/VoiceCall';

export default function Friends() {
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadFriends();
      loadRequests();
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      let profiles = await base44.entities.TurtleProfile.filter({ user_email: user.email });
      
      if (profiles.length === 0) {
        // Create profile if doesn't exist
        const newProfile = await base44.entities.TurtleProfile.create({
          user_email: user.email,
          turtle_id: `TURTLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          display_name: user.full_name || 'Player',
          turtle_color: ['green', 'blue', 'red', 'purple', 'yellow'][Math.floor(Math.random() * 5)],
          online_status: true
        });
        setProfile(newProfile);
      } else {
        setProfile(profiles[0]);
        // Update online status
        await base44.entities.TurtleProfile.update(profiles[0].id, {
          online_status: true,
          last_online: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const allProfiles = await base44.entities.TurtleProfile.list();
      const friendProfiles = allProfiles.filter(p => 
        profile.friends?.includes(p.turtle_id)
      );
      setFriends(friendProfiles);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const reqs = await base44.entities.FriendRequest.filter({
        to_turtle_id: profile.turtle_id,
        status: 'pending'
      });
      setRequests(reqs);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await base44.entities.TurtleProfile.filter({});
      const filtered = results.filter(p => 
        p.turtle_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        p.turtle_id !== profile.turtle_id
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Failed to search:', error);
    }
  };

  const sendFriendRequest = async (targetTurtleId, targetEmail) => {
    try {
      await base44.entities.FriendRequest.create({
        from_turtle_id: profile.turtle_id,
        to_turtle_id: targetTurtleId,
        from_email: profile.user_email,
        to_email: targetEmail,
        status: 'pending'
      });
      alert('好友请求已发送！');
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

  const acceptRequest = async (request) => {
    try {
      await base44.entities.FriendRequest.update(request.id, { status: 'accepted' });
      
      // Add to friends list
      const updatedFriends = [...(profile.friends || []), request.from_turtle_id];
      await base44.entities.TurtleProfile.update(profile.id, {
        friends: updatedFriends
      });
      
      // Update friend's list too
      const friendProfiles = await base44.entities.TurtleProfile.filter({
        turtle_id: request.from_turtle_id
      });
      if (friendProfiles.length > 0) {
        const friendProfile = friendProfiles[0];
        await base44.entities.TurtleProfile.update(friendProfile.id, {
          friends: [...(friendProfile.friends || []), profile.turtle_id]
        });
      }
      
      loadProfile();
      loadRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const rejectRequest = async (request) => {
    try {
      await base44.entities.FriendRequest.update(request.id, { status: 'rejected' });
      loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const startCall = (friend) => {
    setActiveCall(friend);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回游戏
            </Button>
          </Link>
          {profile && (
            <div className="text-white text-lg">
              🐢 {profile.turtle_id}
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          👥 好友系统
        </h1>

        {/* Search */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">🔍 搜索玩家</h2>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="输入 Turtle ID..."
              className="flex-1"
            />
            <Button onClick={searchUsers} className="bg-cyan-600 hover:bg-cyan-700">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map(user => (
                <div key={user.id} className="bg-black/40 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">🐢 {user.turtle_id}</div>
                    <div className="text-cyan-400 text-sm">{user.display_name}</div>
                  </div>
                  <Button
                    onClick={() => sendFriendRequest(user.turtle_id, user.user_email)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <h2 className="text-xl font-bold text-white mb-3">📬 好友请求 ({requests.length})</h2>
            <div className="space-y-2">
              {requests.map(req => (
                <div key={req.id} className="bg-black/40 rounded-lg p-3 flex justify-between items-center">
                  <div className="text-white">
                    🐢 {req.from_turtle_id} 想加你为好友
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => acceptRequest(req)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      接受
                    </Button>
                    <Button
                      onClick={() => rejectRequest(req)}
                      size="sm"
                      variant="outline"
                    >
                      拒绝
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h2 className="text-xl font-bold text-white mb-3">👥 好友列表 ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="text-white/60 text-center py-8">还没有好友，快去搜索添加吧！</p>
          ) : (
            <div className="space-y-2">
              {friends.map(friend => (
                <div key={friend.id} className="bg-black/40 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">
                      🐢 {friend.turtle_id}
                      {friend.online_status && (
                        <span className="ml-2 text-green-400 text-sm">● 在线</span>
                      )}
                    </div>
                    <div className="text-cyan-400 text-sm">{friend.display_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startCall(friend)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeCall && (
        <VoiceCall
          friend={activeCall}
          myProfile={profile}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}