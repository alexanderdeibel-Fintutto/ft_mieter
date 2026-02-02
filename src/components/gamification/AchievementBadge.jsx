import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BADGES = {
  first_payment: {
    icon: '💰',
    title: 'Erste Zahlung',
    description: 'Erste Zahlung erfolgreich',
    rarity: 'common'
  },
  first_repair: {
    icon: '🔧',
    title: 'Handwerker',
    description: 'Erste Reparatur gemeldet',
    rarity: 'common'
  },
  first_meter: {
    icon: '⚡',
    title: 'Zähler-Champion',
    description: 'Erste Zählerablesung eingegeben',
    rarity: 'common'
  },
  streak_7: {
    icon: '🔥',
    title: '7-Tage-Streak',
    description: '7 Tage hintereinander aktiv',
    rarity: 'rare'
  },
  streak_30: {
    icon: '🌟',
    title: 'Monatlicher Champion',
    description: '30 Tage hintereinander aktiv',
    rarity: 'epic'
  },
  speedster: {
    icon: '⚡',
    title: 'Speedster',
    description: 'Zahlung innerhalb 24h eingereicht',
    rarity: 'rare'
  },
  organizer: {
    icon: '📚',
    title: 'Organizer',
    description: '10 Dokumente hochgeladen',
    rarity: 'rare'
  },
  legend: {
    icon: '👑',
    title: 'Legend',
    description: 'Alle Challenges abgeschlossen',
    rarity: 'legendary'
  }
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600'
};

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
};

export default function AchievementBadge({
  badgeId,
  isUnlocked = false,
  showAnimation = true,
  size = 'md',
  onClick
}) {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-4xl',
    lg: 'w-32 h-32 text-6xl'
  };

  return (
    <motion.div
      initial={showAnimation ? { scale: 0, rotate: -180, opacity: 0 } : {}}
      animate={{ scale: isUnlocked ? 1 : 0.8, rotate: 0, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      className="cursor-pointer text-center"
    >
      {/* Badge */}
      <motion.div
        className={cn(
          'relative rounded-full flex items-center justify-center mx-auto',
          'border-4 shadow-lg',
          `bg-gradient-to-br ${rarityColors[badge.rarity]}`,
          rarityBorders[badge.rarity],
          sizeClasses[size],
          !isUnlocked && 'opacity-40 grayscale'
        )}
        whileTap={{ scale: 0.95 }}
      >
        {/* Icon */}
        <motion.span
          animate={isUnlocked ? { rotate: 360 } : {}}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {badge.icon}
        </motion.span>

        {/* Locked Indicator */}
        {!isUnlocked && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
        )}

        {/* Glow Effect */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 rounded-full opacity-0"
            animate={{
              boxShadow: [
                'inset 0 0 0px rgba(255,255,255,0)',
                'inset 0 0 20px rgba(255,255,255,0.5)',
                'inset 0 0 0px rgba(255,255,255,0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-3"
      >
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
          {badge.title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {badge.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

// Badge Collection Grid
export function AchievementGrid({ achievedBadges = [], totalBadges = Object.keys(BADGES) }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {totalBadges.map((badgeId, idx) => (
        <motion.div
          key={badgeId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <AchievementBadge
            badgeId={badgeId}
            isUnlocked={achievedBadges.includes(badgeId)}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Badge Unlock Animation (Toast)
export function BadgeUnlockToast({ badgeId, onClose }) {
  const badge = BADGES[badgeId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center border-2 border-yellow-400">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6 }}
          className="text-6xl mb-4"
        >
          {badge.icon}
        </motion.div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {badge.title} freigeschaltet! 🎉
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {badge.description}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Awesome!
        </motion.button>
      </div>
    </motion.div>
  );
}