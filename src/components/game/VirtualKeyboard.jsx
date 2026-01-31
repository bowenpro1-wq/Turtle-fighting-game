import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function VirtualKeyboard() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeKeys, setActiveKeys] = useState(new Set());

  useEffect(() => {
    // Detect if it's a touch device
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const handleKeyDown = (key) => {
    setActiveKeys(prev => new Set(prev).add(key));
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };

  const handleKeyUp = (key) => {
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
    window.dispatchEvent(new KeyboardEvent('keyup', { key }));
  };

  if (!isTouchDevice) return null;

  const KeyButton = ({ keyLabel, displayLabel, size = 'default', color = 'gray' }) => {
    const isActive = activeKeys.has(keyLabel.toLowerCase());
    
    const colorClasses = {
      gray: 'from-gray-600 to-gray-700 active:from-gray-700 active:to-gray-800',
      red: 'from-red-500 to-red-600 active:from-red-600 active:to-red-700',
      green: 'from-green-500 to-green-600 active:from-green-600 active:to-green-700',
      blue: 'from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700',
      cyan: 'from-cyan-500 to-cyan-600 active:from-cyan-600 active:to-cyan-700',
      orange: 'from-orange-500 to-orange-600 active:from-orange-600 active:to-orange-700',
      purple: 'from-purple-500 to-purple-600 active:from-purple-600 active:to-purple-700',
      yellow: 'from-yellow-500 to-yellow-600 active:from-yellow-600 active:to-yellow-700'
    };

    const sizeClasses = {
      small: 'w-12 h-12 text-sm',
      default: 'w-14 h-14 text-base',
      large: 'w-16 h-16 text-lg'
    };

    return (
      <motion.button
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleKeyDown(keyLabel);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleKeyUp(keyLabel);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleKeyUp(keyLabel);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleKeyDown(keyLabel);
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          handleKeyUp(keyLabel);
        }}
        onMouseLeave={(e) => {
          e.preventDefault();
          handleKeyUp(keyLabel);
        }}
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-b ${colorClasses[color]} 
          text-white font-bold shadow-lg border-2 border-white/20 
          ${isActive ? 'scale-95 brightness-75' : ''} 
          transition-all select-none pointer-events-auto`}
        whileTap={{ scale: 0.9 }}
      >
        {displayLabel || keyLabel.toUpperCase()}
      </motion.button>
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Movement Controls - Left */}
      <div className="absolute left-4 bottom-32 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-3 border-2 border-white/10 pointer-events-auto">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <KeyButton keyLabel="w" displayLabel="↑" color="gray" />
            <div />
            <KeyButton keyLabel="a" displayLabel="←" color="gray" />
            <KeyButton keyLabel="s" displayLabel="↓" color="gray" />
            <KeyButton keyLabel="d" displayLabel="→" color="gray" />
          </div>
        </div>
      </div>

      {/* Action Controls - Right */}
      <div className="absolute right-4 bottom-32 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-3 border-2 border-white/10 pointer-events-auto">
          <div className="grid grid-cols-2 gap-3">
            <KeyButton keyLabel="k" displayLabel="射击" color="red" size="large" />
            <KeyButton keyLabel="j" displayLabel="近战" color="cyan" size="large" />
            <KeyButton keyLabel="h" displayLabel="恢复" color="green" />
            <KeyButton keyLabel="o" displayLabel="飞行" color="blue" />
            <KeyButton keyLabel="l" displayLabel="大招" color="orange" />
            <KeyButton keyLabel="p" displayLabel="终极" color="purple" />
          </div>
        </div>
      </div>

      {/* Shop Button - Top Right */}
      <div className="absolute right-4 top-24 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-2 border-2 border-white/10 pointer-events-auto">
          <KeyButton keyLabel="b" displayLabel="商店" color="yellow" size="small" />
        </div>
      </div>
    </div>
  );
}