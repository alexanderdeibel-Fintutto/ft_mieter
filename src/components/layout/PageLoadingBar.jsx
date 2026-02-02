import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PageLoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setIsVisible(true);
      setProgress(10);
    };

    const handleEnd = () => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
    };

    // Listen for navigation events
    window.addEventListener('beforeunload', handleStart);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          return prev + Math.random() * 30;
        }
        return prev;
      });
    }, 500);

    // Clean up
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress / 100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 z-50 origin-left shadow-lg"
      style={{
        boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
      }}
    />
  );
}