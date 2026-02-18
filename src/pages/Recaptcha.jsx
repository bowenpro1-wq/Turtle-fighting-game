import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function Recaptcha() {
  const [ip, setIp] = useState('获取中...');
  const [verified, setVerified] = useState(false);

  // Load site key from localStorage (admin-configurable), fallback to default
  const siteKey = localStorage.getItem('recaptcha_site_key') || '6LebhG8sAAAAAP-KBMASY0M6Tj5SyPHils4MGSXn';

  useEffect(() => {
    // Fetch user IP
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('无法获取'));

    // Load reCAPTCHA script
    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Global callback
    window.onRecaptchaSuccess = () => {
      // Save verified timestamp
      localStorage.setItem('recaptcha_verified_at', Date.now().toString());
      setVerified(true);
      setTimeout(() => {
        window.location.href = createPageUrl('Game');
      }, 1200);
    };

    return () => { delete window.onRecaptchaSuccess; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 mb-3">
          龟龟冒险岛
        </h1>
        <p className="text-cyan-200/80 text-base md:text-lg font-semibold mb-2">
          Turtle Adventure Island
        </p>
        <p className="text-white/60 text-sm mt-4">
          正在验证您是真实用户，请完成下方验证
        </p>
        <p className="text-white/40 text-xs mt-1">
          We are verifying you are a human
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600 flex flex-col items-center gap-6 w-full max-w-sm"
      >
        {!verified ? (
          <>
            <div
              className="g-recaptcha"
              data-sitekey={siteKey}
              data-callback="onRecaptchaSuccess"
              data-theme="dark"
            />
            <div className="text-white/50 text-xs text-center mt-2">
              您的 IP 地址：<span className="text-cyan-400 font-mono">{ip}</span>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">✅</div>
            <p className="text-green-400 text-xl font-bold">验证成功！</p>
            <p className="text-white/60 text-sm mt-2">正在跳转游戏...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}