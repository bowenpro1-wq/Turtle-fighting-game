import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PreBattleChat({ onClose, onStartBattle, language = 'zh' }) {
  const greetings = {
    zh: '嘿，战士！💪 准备好战斗了吗？',
    en: 'Hey warrior! 💪 Ready for battle?',
    es: '¡Hola guerrero! 💪 ¿Listo para la batalla?',
    fr: 'Salut guerrier! 💪 Prêt pour le combat?',
    ja: 'やあ戦士！💪 戦闘の準備はいいか？',
    ko: '안녕 전사! 💪 전투 준비됐어?'
  };
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: greetings[language] || greetings.zh }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'pre_battle_chat',
        metadata: { name: 'Pre-Battle Chat' }
      });
      setConversation(conv);
    } catch (error) {
      console.error('Failed to init conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const langPrefix = language !== 'zh' ? `[Language: ${language}] ` : '';
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: langPrefix + userMessage
      });

      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage.role === 'assistant') {
          setMessages(prev => {
            const filtered = prev.filter(m => !(m.role === 'assistant' && m.loading));
            return [...filtered, { role: 'assistant', content: lastMessage.content }];
          });
          setLoading(false);
          unsubscribe();
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-lg border-2 border-cyan-500/30 shadow-2xl max-h-[85vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 md:p-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="text-base md:text-lg font-bold text-white">战前对话</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-700 text-white p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 md:p-4 border-t border-slate-700 flex-shrink-0">
          <Button
            onClick={onStartBattle}
            className="w-full mb-3 py-5 md:py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-lg md:text-xl font-bold active:scale-95 transition-transform"
          >
            ⚔️ 开始战斗！
          </Button>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="和AI聊聊战术..."
              className="bg-slate-800 border-slate-700 text-sm md:text-base h-12"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 h-12 px-4 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}