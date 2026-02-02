import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function OnlineIndicator() {
  const [onlineCount, setOnlineCount] = useState(12);
  const [peakTime, setPeakTime] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => Math.max(8, prev + Math.floor((Math.random() - 0.4) * 5)));
      setPeakTime(new Date().getHours() >= 9 && new Date().getHours() <= 17);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge className={`flex items-center gap-2 ${peakTime ? 'bg-green-600' : 'bg-gray-600'}`}>
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <Users className="w-3 h-3" />
      {onlineCount} Online
    </Badge>
  );
}