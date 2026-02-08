import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Users, Globe, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CHAT_ROOMS = [
  { id: 'chinese', name: '中文聊天室', flag: '🇨🇳' },
  { id: 'english', name: 'English Chat', flag: '🇺🇸' },
  { id: 'spanish', name: 'Español', flag: '🇪🇸' },
  { id: 'french', name: 'Français', flag: '🇫🇷' },
  { id: 'japanese', name: '日本語', flag: '🇯🇵' }
];

export default function PublicChatRoom({ onClose }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [turtleId, setTurtleId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [roomStats, setRoomStats] = useState({ total: 0, online: 0 });
  const [inVoiceCall, setInVoiceCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages();
      loadRoomStats();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [selectedRoom]);

  const loadUserData = async () => {
    try {
      const user = await base44.auth.me();
      setUserEmail(user.email);
      
      const profiles = await base44.entities.PlayerProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        setTurtleId(profiles[0].turtle_id);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadRoomStats = async () => {
    if (!selectedRoom) return;
    
    try {
      const allStatuses = await base44.entities.OnlineStatus.list();
      const roomUsers = allStatuses.filter(s => s.current_room === selectedRoom);
      const onlineUsers = roomUsers.filter(s => s.is_online);
      
      setRoomStats({
        total: roomUsers.length,
        online: onlineUsers.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.ChatMessage.filter(
        { room_id: selectedRoom },
        '-created_date',
        50
      );
      setMessages(msgs.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const subscribeToMessages = () => {
    return base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.room_id === selectedRoom) {
        setMessages(prev => [...prev, event.data]);
      }
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    try {
      const user = await base44.auth.me();
      await base44.entities.ChatMessage.create({
        room_id: selectedRoom,
        sender_email: userEmail,
        sender_name: user.full_name,
        turtle_id: turtleId,
        message: inputMessage
      });
      
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setInVoiceCall(true);
      
      // Update status
      const statuses = await base44.entities.OnlineStatus.filter({ user_email: userEmail });
      if (statuses.length > 0) {
        await base44.entities.OnlineStatus.update(statuses[0].id, {
          current_activity: 'in_voice_call'
        });
      }
    } catch (error) {
      console.error('Failed to start voice call:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const endVoiceCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setInVoiceCall(false);
    
    Object.values(peerConnections).forEach(pc => pc.close());
    setPeerConnections({});
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  if (!selectedRoom) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-2xl w-full border-2 border-cyan-500/30"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">公共聊天室</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHAT_ROOMS.map(room => (
              <motion.button
                key={room.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRoom(room.id)}
                className="bg-gradient-to-br from-cyan-600 to-blue-600 p-6 rounded-xl text-white text-left"
              >
                <div className="text-4xl mb-2">{room.flag}</div>
                <div className="font-bold text-lg">{room.name}</div>
                <div className="text-white/70 text-sm mt-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>在线: --</span>
                </div>
              </motion.button>
            ))}
          </div>

          <Button onClick={onClose} variant="outline" className="w-full mt-6">
            关闭
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const currentRoom = CHAT_ROOMS.find(r => r.id === selectedRoom);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-4xl w-full h-[80vh] flex flex-col border-2 border-cyan-500/30"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentRoom.flag}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{currentRoom.name}</h2>
              <div className="text-cyan-400 text-sm flex items-center gap-3">
                <span>总计: {roomStats.total}</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  在线: {roomStats.online}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {inVoiceCall ? (
              <>
                <Button
                  size="sm"
                  onClick={toggleMute}
                  className={isMuted ? 'bg-red-600' : 'bg-green-600'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button size="sm" onClick={endVoiceCall} className="bg-red-600">
                  <PhoneOff className="w-4 h-4 mr-1" />
                  挂断
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={startVoiceCall} className="bg-green-600">
                <Phone className="w-4 h-4 mr-1" />
                语音
              </Button>
            )}
            
            <Button size="sm" variant="outline" onClick={() => setSelectedRoom(null)}>
              返回
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-slate-950/50 rounded-lg p-4 overflow-y-auto mb-4 space-y-2">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`${msg.sender_email === userEmail ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block max-w-[70%] ${
                  msg.sender_email === userEmail
                    ? 'bg-cyan-600'
                    : 'bg-slate-700'
                } rounded-lg p-3`}>
                  <div className="text-xs text-white/60 mb-1">
                    {msg.turtle_id} - {msg.sender_name}
                  </div>
                  <div className="text-white">{msg.message}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="输入消息..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="bg-slate-800 border-cyan-500/30 text-white"
          />
          <Button onClick={sendMessage} className="bg-cyan-600">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}