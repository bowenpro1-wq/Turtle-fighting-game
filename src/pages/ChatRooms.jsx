import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Users, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_ROOMS = [
  { id: 'zh', name: '中文聊天室', flag: '🇨🇳', language: 'zh' },
  { id: 'en', name: 'English Chat Room', flag: '🇺🇸', language: 'en' },
  { id: 'es', name: 'Sala de Chat Español', flag: '🇪🇸', language: 'es' },
  { id: 'jp', name: '日本語チャット', flag: '🇯🇵', language: 'jp' },
  { id: 'global', name: 'Global Chat', flag: '🌍', language: 'all' }
];

export default function ChatRooms() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [turtleProfile, setTurtleProfile] = useState(null);
  const [roomStats, setRoomStats] = useState({});

  useEffect(() => {
    loadProfile();
    loadRoomStats();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages();
      const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
        if (event.data.room_id === selectedRoom.id) {
          loadMessages();
        }
      });
      return unsubscribe;
    }
  }, [selectedRoom]);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      let profile = await base44.entities.TurtleProfile.filter({ user_email: user.email });
      
      if (profile.length === 0) {
        const newId = `TURTLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        profile = [await base44.entities.TurtleProfile.create({
          user_email: user.email,
          turtle_id: newId,
          display_name: user.full_name,
          is_online: true
        })];
      }
      
      setTurtleProfile(profile[0]);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadRoomStats = async () => {
    try {
      const stats = {};
      for (const room of CHAT_ROOMS) {
        const messages = await base44.entities.ChatMessage.filter({ room_id: room.id });
        const uniqueUsers = [...new Set(messages.map(m => m.sender_email))];
        stats[room.id] = { total: uniqueUsers.length, online: Math.floor(uniqueUsers.length * 0.7) };
      }
      setRoomStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.ChatMessage.filter({ room_id: selectedRoom.id }, '-created_date', 50);
      setMessages(msgs.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !turtleProfile) return;

    try {
      await base44.entities.ChatMessage.create({
        room_id: selectedRoom.id,
        sender_email: turtleProfile.user_email,
        sender_name: turtleProfile.display_name,
        turtle_id: turtleProfile.turtle_id,
        message: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!selectedRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            公共聊天室
          </h1>

          <div className="grid gap-4">
            {CHAT_ROOMS.map(room => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedRoom(room)}
                className="cursor-pointer"
              >
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-6 hover:border-cyan-500/50 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{room.flag}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{room.name}</h3>
                        <div className="text-slate-400 text-sm flex items-center gap-4 mt-1">
                          <span>总用户: {roomStats[room.id]?.total || 0}</span>
                          <span className="text-green-400">● 在线: {roomStats[room.id]?.online || 0}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                      进入 →
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => setSelectedRoom(null)} variant="outline" size="sm">
              ← 返回
            </Button>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {selectedRoom.flag} {selectedRoom.name}
            </h2>
          </div>
          <div className="text-slate-400 text-sm">
            <Users className="w-4 h-4 inline mr-1" />
            {roomStats[selectedRoom.id]?.online || 0} 在线
          </div>
        </div>

        <Card className="flex-1 bg-slate-800/80 backdrop-blur-sm border-slate-700 p-4 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.sender_email === turtleProfile?.user_email ? 'justify-end' : ''}`}
                >
                  <div className={`max-w-[70%] ${msg.sender_email === turtleProfile?.user_email ? 'order-2' : ''}`}>
                    <div className="text-xs text-slate-400 mb-1">
                      {msg.turtle_id} - {msg.sender_name}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      msg.sender_email === turtleProfile?.user_email
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息..."
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} className="bg-cyan-600 hover:bg-cyan-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}