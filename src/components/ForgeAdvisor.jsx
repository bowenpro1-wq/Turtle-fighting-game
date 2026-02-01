import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, X, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ForgeAdvisor({ weapons, coins, onClose }) {
  const [messages, setMessages] = useState([]);
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
        agent_name: 'forge_advisor',
        metadata: { name: 'Forge Advisor' }
      });
      setConversation(conv);

      // Send initial context about player stats
      const context = `Player stats: Coins: ${coins}, Weapons: ${Object.entries(weapons).map(([id, w]) => `${id} Lv${w.level} ${w.unlocked ? 'unlocked' : 'locked'}`).join(', ')}. Upgrade costs: Level N costs N×500 coins. Total to max level 10: 27,500 coins.`;
      
      await base44.agents.addMessage(conv, {
        role: 'user',
        content: `${context}\n\n你好！请分析我的武器状态，推荐最优升级路径，并预测战力提升。`
      });

      const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages);
        setLoading(false);
        unsubscribe();
      });
      setLoading(true);
    } catch (error) {
      console.error('Failed to init conversation:', error);
      setMessages([{ role: 'assistant', content: '抱歉，AI顾问暂时无法连接。请稍后再试。' }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });

      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages);
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage.role === 'assistant' && !lastMessage.tool_calls?.some(tc => tc.status === 'running')) {
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
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-orange-900 to-slate-900 rounded-2xl w-full max-w-2xl border-2 border-orange-500/30 shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 md:p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <h2 className="text-sm md:text-lg font-bold text-white">AI锻造顾问</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>

        <div className="h-64 md:h-96 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 bg-slate-900/50">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2 md:p-3 rounded-lg text-xs md:text-sm ${
                    msg.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
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
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 md:p-4 border-t border-slate-700 bg-slate-900/80">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="询问升级建议..."
              className="bg-slate-800 border-slate-700 text-xs md:text-sm h-9"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-orange-600 hover:bg-orange-500 h-9 px-3"
            >
              <Send className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 mt-2">
            💡 AI会分析你的武器并推荐最佳升级路径和战力预测
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}