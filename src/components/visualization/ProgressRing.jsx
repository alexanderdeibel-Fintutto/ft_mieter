import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProgressRing({
  percentage = 0,
  size = 120,
  strokeWidth = 8,
  label,
  color = 'blue',
  animated = true,
  children
}) {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayPercentage(percentage);
    }
  }, [percentage, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  const colorMap = {
    blue: '#3B82F6',
    green: '#22C55E',
    red: '#EF4444',
    orange: '#F97316',
    purple: '#A855F7',
    gray: '#6B7280',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorMap[color]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{
              strokeDashoffset,
            }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
            }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {displayPercentage}%
            </div>
            {label && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-16">
                {label}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {children}
    </div>
  );
}

// Mini Progress Ring (für kleine Displays)
export function MiniProgressRing({ percentage = 0, size = 60, color = 'blue', label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <ProgressRing
        percentage={percentage}
        size={size}
        strokeWidth={4}
        color={color}
      />
      {label && (
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
}

// Multiple Progress Rings
export function ProgressRingGroup({ items = [] }) {
  return (
    <div className="flex justify-center items-end gap-6 flex-wrap">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <ProgressRing
            percentage={item.percentage}
            size={item.size || 120}
            color={item.color}
            label={item.label}
          />
        </motion.div>
      ))}
    </div>
  );
}