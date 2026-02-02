import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StreakCounter({ days = 0, goal = 30, color = 'orange' }) {
  const percentage = (days / goal) * 100;
  const isActive = days > 0;

  const colorMap = {
    orange: 'from-orange-400 to-red-500',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
  };

  const shadowMap = {
    orange: 'shadow-orange-500/50',
    blue: 'shadow-blue-500/50',
    green: 'shadow-green-500/50',
    purple: 'shadow-purple-500/50',
  };

  return (
    <Card className={cn('bg-gradient-to-br', colorMap[color], 'border-0 text-white overflow-hidden')}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold opacity-90">Aktivitäts-Streak</h3>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              className="flex items-center gap-2 mt-2"
            >
              <motion.div
                animate={isActive ? { rotate: [0, 360] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-8 h-8" />
              </motion.div>
              <span className="text-4xl font-black">{days}</span>
            </motion.div>
          </div>

          {/* Goal Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-right"
          >
            <p className="text-sm opacity-90">Goal: {goal} Tage</p>
            <p className="text-2xl font-bold">{percentage.toFixed(0)}%</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-white rounded-full shadow-lg"
          />
        </div>

        {/* Milestone Messages */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-xs font-semibold opacity-90"
        >
          {days === 0 && 'Starten Sie heute noch! 🚀'}
          {days === 1 && 'Guter Start! Morgen wieder? 💪'}
          {days === 7 && '🌟 1 Woche! Fantastisch!'}
          {days === 14 && '🔥 2 Wochen! Du bist im Rhythmus!'}
          {days === 30 && '🏆 1 Monat! Du bist ein Champion!'}
          {days >= 30 && days % 7 === 0 && `${Math.floor(days / 7)} Wochen am Stück! 🎉`}
          {days > 0 && days < 7 && `Tag ${days} - Weiter so! 💯`}
        </motion.div>
      </CardContent>
    </Card>
  );
}

// Streak History (Timeline)
export function StreakHistory({ entries = [] }) {
  return (
    <div className="space-y-2">
      {entries.map((entry, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <span className="text-lg">{entry.date.split('T')[0]}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{entry.action}</p>
          </div>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-xl"
          >
            {entry.points > 0 ? '🔥' : '✓'}
          </motion.span>
          <span className="font-semibold text-green-600">+{entry.points}pts</span>
        </motion.div>
      ))}
    </div>
  );
}

// Leaderboard
export function StreakLeaderboard({ users = [] }) {
  return (
    <div className="space-y-2">
      {users.map((user, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-l-4 border-blue-500"
        >
          {/* Rank */}
          <motion.div
            className="text-2xl font-black w-10 text-center"
            animate={idx === 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {idx === 0 && '🥇'}
            {idx === 1 && '🥈'}
            {idx === 2 && '🥉'}
            {idx > 2 && idx + 1}
          </motion.div>

          {/* User Info */}
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {user.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user.streak} Tage Streak
            </p>
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="text-2xl font-black text-orange-500">🔥{user.streak}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user.points} Punkte
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}