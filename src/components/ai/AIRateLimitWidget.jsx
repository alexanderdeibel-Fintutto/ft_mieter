import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Clock } from 'lucide-react';

export default function AIRateLimitWidget({ userEmail }) {
  const [limits, setLimits] = useState({ hourly: 0, daily: 0, maxHourly: 20, maxDaily: 100 });

  useEffect(() => {
    if (!userEmail) return;
    checkRateLimits();
    const interval = setInterval(checkRateLimits, 60000); // Alle 60s
    return () => clearInterval(interval);
  }, [userEmail]);

  const checkRateLimits = async () => {
    try {
      const settings = await base44.entities.AISettings.list();
      const config = settings?.[0];
      
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const hourlyLogs = await base44.entities.AIUsageLog.filter({
        user_email: userEmail,
        created_date: { $gte: oneHourAgo.toISOString() }
      });

      const dailyLogs = await base44.entities.AIUsageLog.filter({
        user_email: userEmail,
        created_date: { $gte: oneDayAgo.toISOString() }
      });

      setLimits({
        hourly: hourlyLogs?.length || 0,
        daily: dailyLogs?.length || 0,
        maxHourly: config?.rate_limit_per_user_hour || 20,
        maxDaily: config?.rate_limit_per_user_day || 100,
      });
    } catch (error) {
      console.error('Rate limit check failed:', error);
    }
  };

  const hourlyPercent = (limits.hourly / limits.maxHourly) * 100;
  const dailyPercent = (limits.daily / limits.maxDaily) * 100;

  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <Clock className="h-4 w-4" />
      <div className="flex gap-4">
        <div>
          <span className={hourlyPercent > 80 ? 'text-red-600 font-semibold' : ''}>
            {limits.hourly}/{limits.maxHourly}
          </span>
          <span className="text-gray-400 ml-1">pro Stunde</span>
        </div>
        <div>
          <span className={dailyPercent > 80 ? 'text-red-600 font-semibold' : ''}>
            {limits.daily}/{limits.maxDaily}
          </span>
          <span className="text-gray-400 ml-1">pro Tag</span>
        </div>
      </div>
    </div>
  );
}