import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return null;
}