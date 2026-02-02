import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  actions,
  isDismissible = true,
  maxHeight = '80vh'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isDismissible ? onClose : undefined}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl"
            style={{ maxHeight }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
                {isDismissible && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 180px)` }}>
              {children}
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
                {actions.map((action, idx) => (
                  <Button
                    key={idx}
                    onClick={action.onClick}
                    variant={action.variant || (idx === actions.length - 1 ? 'default' : 'outline')}
                    className="flex-1"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Sheet mit Selection (für Auswahloptionen)
export function SelectBottomSheet({
  isOpen,
  onClose,
  title,
  options = [],
  onSelect,
  selectedValue
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <motion.button
            key={idx}
            whileHover={{ x: 8 }}
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
            className={cn(
              'w-full p-4 rounded-lg text-left transition-all',
              selectedValue === option.value
                ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 font-semibold'
                : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              {selectedValue === option.value && (
                <span className="text-blue-600 text-lg">✓</span>
              )}
            </div>
            {option.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {option.description}
              </p>
            )}
          </motion.button>
        ))}
      </div>
    </BottomSheet>
  );
}