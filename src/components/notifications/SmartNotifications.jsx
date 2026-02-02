import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const notificationStore = new Map();
let notificationId = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const add = useCallback((config) => {
    const id = notificationId++;
    const notification = {
      id,
      duration: 5000,
      ...config
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }

    return id;
  }, []);

  const remove = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, add, remove };
}

const TypeIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: Zap,
  info: Info
};

const TypeColors = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
};

const TypeTextColors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400'
};

export function NotificationContainer({ notifications, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const Icon = TypeIcons[notif.type || 'info'];

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 400, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 400, scale: 0.8 }}
              className={cn(
                'pointer-events-auto rounded-lg border p-4 shadow-lg backdrop-blur-sm',
                TypeColors[notif.type || 'info']
              )}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={cn('w-5 h-5 mt-0.5', TypeTextColors[notif.type || 'info'])} />
                </motion.div>

                <div className="flex-1">
                  {notif.title && (
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {notif.title}
                    </p>
                  )}
                  {notif.message && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {notif.message}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onRemove(notif.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              {notif.duration > 0 && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: notif.duration / 1000, ease: 'linear' }}
                  className="h-1 bg-current/30 rounded mt-2 origin-left"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function SmartNotifications() {
  const { notifications, remove } = useNotification();

  return <NotificationContainer notifications={notifications} onRemove={remove} />;
}