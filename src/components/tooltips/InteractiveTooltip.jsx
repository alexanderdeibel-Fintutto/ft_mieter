import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InteractiveTooltip({ id, title, description, position = 'bottom', onDismiss }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if tooltip was already shown
    const shown = localStorage.getItem(`tooltip_${id}`);
    if (!shown) {
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(`tooltip_${id}`, 'true');
    if (onDismiss) onDismiss();
  };

  if (!show) return null;

  const positions = {
    top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
    left: '-left-2 top-1/2 -translate-y-1/2 -translate-x-full',
    right: '-right-2 top-1/2 -translate-y-1/2 translate-x-full',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute ${positions[position]} z-50 pointer-events-auto`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-2xl p-4 max-w-xs">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-4 h-4" />
          </button>

          <h4 className="font-bold mb-1 pr-6">{title}</h4>
          <p className="text-sm text-white/90 mb-3">{description}</p>

          <Button
            onClick={handleDismiss}
            className="w-full bg-white text-purple-600 hover:bg-gray-100 text-sm"
          >
            Verstanden <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Arrow */}
          <div
            className={`absolute w-3 h-3 bg-purple-600 transform rotate-45 ${
              position === 'bottom'
                ? '-top-1.5 left-1/2 -translate-x-1/2'
                : position === 'top'
                  ? '-bottom-1.5 left-1/2 -translate-x-1/2'
                  : position === 'left'
                    ? '-right-1.5 top-1/2 -translate-y-1/2'
                    : '-left-1.5 top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}