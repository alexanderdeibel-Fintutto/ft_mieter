import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FloatingActionButton({
  icon: Icon = Plus,
  label,
  onClick,
  color = 'blue',
  position = 'bottom-right',
  size = 'lg',
  className
}) {
  const colorMap = {
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/50',
    green: 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-600/50',
    red: 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-600/50',
    purple: 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-600/50',
  };

  const sizeMap = {
    sm: 'w-12 h-12 p-3',
    md: 'w-14 h-14 p-3',
    lg: 'w-16 h-16 p-4',
  };

  const positionMap = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'fixed z-50 rounded-full text-white transition-all duration-300 flex items-center justify-center gap-2',
        colorMap[color],
        sizeMap[size],
        positionMap[position],
        className
      )}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
      {label && <span className="hidden md:inline text-sm font-semibold">{label}</span>}
    </motion.button>
  );
}

// FAB with Menu
export function FloatingActionButtonMenu({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Menu Items */}
            {items.map((item, idx) => (
              <motion.button
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={cn(
                  'absolute w-14 h-14 rounded-full text-white flex items-center justify-center',
                  `bottom-${20 + idx * 20}`,
                  'shadow-lg hover:shadow-xl transition-all',
                  item.color || 'bg-gray-600 hover:bg-gray-700'
                )}
                style={{
                  bottom: `${20 + idx * 20}px`,
                }}
              >
                {item.icon}
              </motion.button>
            ))}

            {/* Label tooltip */}
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute bottom-6 right-20 bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-semibold"
              >
                {items.length} Aktionen verfügbar
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}

// Speed Dial (circular menu)
export function SpeedDial({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const radius = 100;
  const angle = (Math.PI * 2) / items.length;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-24 h-24">
      {/* Menu Items */}
      {items.map((item, idx) => {
        const x = Math.cos(angle * idx - Math.PI / 2) * radius;
        const y = Math.sin(angle * idx - Math.PI / 2) * radius;

        return (
          <motion.button
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.15 }}
            onClick={() => {
              item.onClick?.();
              setIsOpen(false);
            }}
            className={cn(
              'absolute w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg',
              item.color || 'bg-gray-600 hover:bg-gray-700'
            )}
            style={{
              left: '48px',
              top: '48px',
              transform: isOpen
                ? `translate(${x}px, ${y}px)`
                : 'translate(0, 0)',
            }}
            title={item.label}
          >
            {item.icon}
          </motion.button>
        );
      })}

      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-0 right-0 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}