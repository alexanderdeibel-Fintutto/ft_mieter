import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, DollarSign, Wrench, MessageSquare, Settings, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, page: 'MieterHome' },
  { id: 'finances', label: 'Finanzen', icon: DollarSign, page: 'MieterFinances', badge: 0 },
  { id: 'repairs', label: 'Reparaturen', icon: Wrench, page: 'MieterRepairs', badge: 0 },
  { id: 'messages', label: 'Nachrichten', icon: MessageSquare, page: 'MieterMessages', badge: 0 },
];

export default function EnhancedBottomNav({ activeTab, onTabChange }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(item.page)}
              className="relative flex-1 py-3 px-4 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              {/* Active Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20"
                  initial={{ borderRadius: '50%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={isActive ? { scale: 1.2, y: -2 } : {}}
                className={cn(
                  'relative z-10 transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <Icon className="w-6 h-6" />

                {/* Badge */}
                {item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge className="bg-red-500 text-xs px-1.5 py-0.5">
                      {item.badge}
                    </Badge>
                  </motion.div>
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                animate={isActive ? { fontSize: 11, opacity: 1 } : { fontSize: 10, opacity: 0.7 }}
                className={cn(
                  'relative z-10 text-xs font-semibold transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}

        {/* More Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMore(!showMore)}
          className="relative flex-1 py-3 px-4 flex flex-col items-center justify-center gap-1"
        >
          <MoreHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Mehr</span>
        </motion.button>
      </div>
    </motion.div>
  );
}