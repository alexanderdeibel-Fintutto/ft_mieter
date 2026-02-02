import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function SparklineChart({
  data = [],
  color = '#3B82F6',
  height = 60,
  label,
  trend,
  animate = true
}) {
  const isUpTrend = trend === 'up';
  const trendColor = isUpTrend ? '#22C55E' : '#EF4444';

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : {}}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2"
    >
      {label && (
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {label}
        </p>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            isAnimationActive={animate}
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>

      {trend && (
        <div className={`text-xs font-semibold ${isUpTrend ? 'text-green-600' : 'text-red-600'}`}>
          {isUpTrend ? '↑' : '↓'} {trend}
        </div>
      )}
    </motion.div>
  );
}

// Mini Chart für Card-Corners
export function MiniSparkline({ data = [], color = '#3B82F6', height = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Bar Sparkline
export function BarSparkline({ data = [], color = '#3B82F6' }) {
  return (
    <div className="flex items-end gap-1 justify-center h-12">
      {data.map((item, idx) => {
        const maxValue = Math.max(...data.map(d => d.value));
        const height = (item.value / maxValue) * 100;

        return (
          <motion.div
            key={idx}
            className="flex-1 rounded-sm"
            style={{
              backgroundColor: color,
              height: `${height}%`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          />
        );
      })}
    </div>
  );
}