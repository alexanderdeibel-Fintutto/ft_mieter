import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  trendLabel,
  subtitle,
  onClick,
  className
}) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-800',
  };

  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className={cn(
        'border-2 transition-all hover:shadow-lg',
        colorMap[color],
        className
      )}>
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            {Icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="p-2 rounded-lg bg-white/50 dark:bg-black/20"
              >
                <Icon className="w-6 h-6" />
              </motion.div>
            )}

            {trend && (
              <div className={cn('flex items-center gap-1 text-sm font-semibold', trendColor)}>
                <TrendIcon className="w-4 h-4" />
                {trendLabel}
              </div>
            )}
          </div>

          {/* Value */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </div>
          </motion.div>

          {/* Label */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {label}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Stat Cards Grid
export function StatCardsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}

// Compact Stat Card
export function CompactStatCard({ label, value, color = 'blue' }) {
  const colorMap = {
    blue: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20',
    red: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20',
    orange: 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <Card className={cn('p-4', colorMap[color])}>
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </Card>
  );
}