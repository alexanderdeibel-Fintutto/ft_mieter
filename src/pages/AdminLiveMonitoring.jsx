import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Zap } from 'lucide-react';
import RealtimeNotificationCenter from '../components/realtime/RealtimeNotificationCenter';
import LiveActivityFeed from '../components/realtime/LiveActivityFeed';
import OnlineIndicator from '../components/realtime/OnlineIndicator';

const REALTIME_METRICS = [
  { time: '00:00', requests: 240, errors: 8, latency: 45 },
  { time: '00:15', requests: 320, errors: 12, latency: 52 },
  { time: '00:30', requests: 280, errors: 10, latency: 48 },
  { time: '00:45', requests: 450, errors: 15, latency: 67 },
  { time: '01:00', requests: 520, errors: 18, latency: 75 },
];

export default function AdminLiveMonitoring() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6" /> Live Monitoring
        </h1>
        <div className="flex items-center gap-2">
          <OnlineIndicator />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-Refresh
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Requests/Min', value: '520', trend: '+8.2%', icon: TrendingUp },
          { label: 'Error Rate', value: '3.5%', trend: '-2.1%', icon: Zap },
          { label: 'Avg. Latency', value: '75ms', trend: '+12ms', icon: Activity },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className={`text-xs mt-2 ${metric.trend.includes('-') ? 'text-green-600' : 'text-orange-600'}`}>
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Requests Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Request-Volumen</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={REALTIME_METRICS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="requests" fill="#8B5CF6" stroke="#8B5CF6" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Notifications */}
        <RealtimeNotificationCenter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="md:col-span-2">
          <LiveActivityFeed />
        </div>

        {/* Error Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fehler-Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={REALTIME_METRICS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}