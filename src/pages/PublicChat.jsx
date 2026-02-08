import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Users, Mic, MicOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CHAT_ROOMS = [
  { id: 'english', name: 'English Chat Room', flag: '🇬🇧' },
  { id: 'chinese', name: '中文聊天室', flag: '🇨🇳' },
  { id: 'spanish', name: 'Sala de Chat Español', flag: '🇪🇸' },
  { id: 'french', name: 'Salon de Chat Français', flag: '🇫🇷' },
  { id: 'german', name: 'Deutscher Chatraum', flag: '🇩🇪' },
  { id: 'japanese', name: '日本語チャットルーム', flag: '🇯🇵' }
];

export default function PublicChat() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [totalUsers, setTotalUsers] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadRoomStats();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages();
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.TurtleProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadRoomStats = async () => {
    try {
      const profiles = await base44.entities.TurtleProfile.list();
      const online = {};
      const total = {};
      
      for (const room of CHAT_ROOMS) {
        // In real app, track active users per room
        online[room.id] = Math.floor(Math.random() * 50) + 10;
        total[room.id] = Math.floor(Math.random() * 200) + 100;
      }
      
      setOnlineUsers(online);
      setTotalUsers(total);
    } catch (error) {
      console.error('Failed to load room stats:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.ChatMessage.filter(
        { room: selectedRoom },
        '-created_date',
        50
      );
      setMessages(msgs.reverse());
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !profile) return;

    try {
      await base44.entities.ChatMessage.create({
        room: selectedRoom,
        sender_turtle_id: profile.turtle_id,
        sender_name: profile.display_name,
        message: inputMessage,
        timestamp: new Date().toISOString()
      });
      setInputMessage('');
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!selectedRoom) {
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
            🌐 公共聊天室
          </h1>

          <div className="grid gap-4">
            {CHAT_ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-cyan-400 rounded-xl p-6 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{room.flag}</span>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">{room.name}</h3>
                      <p className="text-cyan-400 text-sm">
                        <Users className="w-4 h-4 inline mr-1" />
                        在线: {onlineUsers[room.id] || 0} / 总计: {totalUsers[room.id] || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-cyan-400 text-3xl">→</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentRoom = CHAT_ROOMS.find(r => r.id === selectedRoom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => setSelectedRoom(null)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="text-white text-center">
            <h2 className="text-xl font-bold">{currentRoom?.flag} {currentRoom?.name}</h2>
            <p className="text-sm text-cyan-400">
              在线: {onlineUsers[selectedRoom]} 人
            </p>
          </div>
          {profile && (
            <div className="text-white">
              🐢 {profile.turtle_id}
            </div>
          )}
        </div>

        <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl p-4 overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 ${msg.sender_turtle_id === profile?.turtle_id ? 'text-right' : ''}`}
            >
              <div className={`inline-block max-w-[70%] ${
                msg.sender_turtle_id === profile?.turtle_id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/10 text-white'
              } rounded-lg px-4 py-2`}>
                <div className="text-xs opacity-80 mb-1">
                  🐢 {msg.sender_turtle_id}
                </div>
                <div>{msg.message}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入消息..."
            className="flex-1"
          />
          <Button onClick={sendMessage} className="bg-cyan-600 hover:bg-cyan-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}