import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PrivateChat({ friend, onClose, onVoiceCall }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatSessionId, setChatSessionId] = useState('');
  const [myProfile, setMyProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, [friend]);

  useEffect(() => {
    if (!chatSessionId) return;

    // Subscribe to new messages
    const unsubscribe = base44.entities.PrivateChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.chat_session_id === chatSessionId) {
        setMessages(prev => [...prev, event.data]);
        scrollToBottom();
      }
    });

    return unsubscribe;
  }, [chatSessionId]);

  const loadChat = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.TurtleProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        setMyProfile(profiles[0]);
        
        // Generate chat session ID (sorted to ensure same ID for both users)
        const ids = [profiles[0].turtle_id, friend.turtle_id].sort();
        const sessionId = `${ids[0]}_${ids[1]}`;
        setChatSessionId(sessionId);
        
        // Load existing messages
        const msgs = await base44.entities.PrivateChatMessage.filter({ chat_session_id: sessionId });
        setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !myProfile) return;

    try {
      await base44.entities.PrivateChatMessage.create({
        chat_session_id: chatSessionId,
        sender_turtle_id: myProfile.turtle_id,
        sender_name: myProfile.display_name,
        message: inputMessage.trim(),
        timestamp: new Date().toISOString()
      });

      setInputMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col border-4 border-purple-500"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-${friend.turtle_color}-500 flex items-center justify-center text-2xl border-2 border-white/30`}>
              🐢
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{friend.display_name}</h3>
              <p className="text-white/60 text-sm">{friend.turtle_id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onVoiceCall}
              variant="outline"
              size="icon"
              className="border-green-500 text-green-400 hover:bg-green-500/20"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => {
            const isMe = myProfile && msg.sender_turtle_id === myProfile.turtle_id;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMe 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-white'
                }`}>
                  {!isMe && (
                    <p className="text-xs text-white/60 mb-1">{msg.sender_name}</p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(msg.timestamp || msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入消息..."
              className="flex-1 bg-slate-800 border-purple-500/50 text-white"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}