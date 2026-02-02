import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Activity } from 'lucide-react';

export default function CachePerformanceMonitor() {
  const metrics = {
    hitRate: 87,
    avgResponseTime: 245,
    cacheSize: 2.4,
    totalCached: 127,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Cache Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Hit Rate</span>
            <Badge className="bg-green-100 text-green-700">{metrics.hitRate}%</Badge>
          </div>
          <Progress value={metrics.hitRate} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <p className="text-xs text-gray-600">Avg Response</p>
            <p className="text-lg font-bold text-blue-600">{metrics.avgResponseTime}ms</p>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <p className="text-xs text-gray-600">Size</p>
            <p className="text-lg font-bold text-purple-600">{metrics.cacheSize}GB</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-xs text-gray-600">Cached</p>
            <p className="text-lg font-bold text-green-600">{metrics.totalCached}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}