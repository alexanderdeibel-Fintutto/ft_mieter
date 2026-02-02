import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Sparkles } from 'lucide-react';

export default function FeatureSpotlight({ feature, onDismiss, onTryIt }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing to avoid overwhelming user
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!show || !feature) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-24 right-4 z-40 w-80 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl text-white overflow-hidden"
      >
        {/* Sparkle Effect */}
        <div className="absolute top-2 right-2">
          <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-12">
          <div className="text-4xl mb-3">{feature.icon}</div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-white/90 text-sm mb-4">{feature.description}</p>

          <div className="flex gap-2">
            <Button
              onClick={onTryIt}
              className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
            >
              Ausprobieren <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={onDismiss}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              Später
            </Button>
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl" />
      </motion.div>
    </AnimatePresence>
  );
}