import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TouchShopButton({ onShopClick }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    };
    
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  if (!isTouchDevice) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onShopClick}
      className="fixed top-20 right-4 z-40 w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-2xl border-4 border-yellow-300 flex items-center justify-center active:scale-90 transition-transform"
      style={{ touchAction: 'manipulation' }}
    >
      <ShoppingBag className="w-8 h-8 text-white" strokeWidth={3} />
    </motion.button>
  );
}