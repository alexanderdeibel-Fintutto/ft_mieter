import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_ICONS = {
  completed: CheckCircle,
  pending: Clock,
  failed: AlertCircle,
  in_progress: Clock
};

const STATUS_COLORS = {
  completed: 'bg-green-500',
  pending: 'bg-blue-500',
  failed: 'bg-red-500',
  in_progress: 'bg-blue-500'
};

export default function StatusTimeline({ events = [] }) {
  return (
    <div className="space-y-6">
      {events.map((event, idx) => {
        const Icon = STATUS_ICONS[event.status] || Clock;
        const isLast = idx === events.length - 1;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-4"
          >
            {/* Timeline Line & Icon */}
            <div className="flex flex-col items-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.1, type: 'spring' }}
                className={cn(
                  'p-2 rounded-full text-white',
                  STATUS_COLORS[event.status]
                )}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              {/* Connector Line */}
              {!isLast && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 60 }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                  className="w-1 bg-gray-300 dark:bg-gray-600 mt-2"
                />
              )}
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 + 0.1 }}
              className="flex-1 pt-1"
            >
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {event.title}
                  </h4>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {event.time}
                  </span>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {event.description}
                  </p>
                )}

                {event.details && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {event.details.map((detail, i) => (
                      <p key={i}>• {detail}</p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Compact Timeline (horizontal)
export function CompactTimeline({ events = [] }) {
  return (
    <div className="flex gap-2 items-center justify-between">
      {events.map((event, idx) => {
        const Icon = STATUS_ICONS[event.status];
        const isLast = idx === events.length - 1;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center"
          >
            {/* Icon */}
            <div className={cn(
              'p-2 rounded-full text-white mb-2',
              STATUS_COLORS[event.status]
            )}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Label */}
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
              {event.title}
            </span>

            {/* Connector */}
            {!isLast && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                className="h-1 bg-gray-300 dark:bg-gray-600 absolute"
                style={{ marginLeft: '100%' }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}