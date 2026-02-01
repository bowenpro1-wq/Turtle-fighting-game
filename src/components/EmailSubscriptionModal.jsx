import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EmailSubscriptionModal({ onClose, onSubscribe }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already subscribed or dismissed
    const hasSubscribed = localStorage.getItem('turtleGameEmailSubscribed');
    if (!hasSubscribed) {
      setShow(true);
    } else {
      onClose();
    }
  }, [onClose]);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      alert('请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.EmailSubscription.create({
        email,
        subscribed: true
      });
      
      localStorage.setItem('turtleGameEmailSubscribed', 'true');
      alert('订阅成功！您将每周收到游戏更新邮件 📧');
      onSubscribe();
      setShow(false);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('订阅失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('turtleGameEmailSubscribed', 'skipped');
    setShow(false);
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-cyan-900 to-slate-900 rounded-2xl p-8 max-w-md w-full border-2 border-cyan-500/50 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
              <Mail className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
              订阅游戏更新
            </h2>
            <p className="text-white/80 text-sm">
              每周获取新小游戏、更新内容和独家奖励！
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="输入您的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-cyan-500/50 text-white placeholder:text-white/50 h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
              />
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg"
            >
              {loading ? '订阅中...' : '✉️ 立即订阅'}
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-white/60 hover:text-white hover:bg-white/10"
            >
              暂时跳过
            </Button>
          </div>

          <p className="text-white/40 text-xs text-center mt-6">
            您可以随时取消订阅。我们尊重您的隐私 🔒
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}