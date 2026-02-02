import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3 } from 'lucide-react';

const trendData = [
  { date: 'Mo', shares: 120, downloads: 45, users: 89 },
  { date: 'Di', shares: 145, downloads: 52, users: 95 },
  { date: 'Mi', shares: 132, downloads: 48, users: 92 },
  { date: 'Do', shares: 167, downloads: 61, users: 108 },
  { date: 'Fr', shares: 189, downloads: 71, users: 124 },
];

export default function AdvancedAnalyticsPanel() {
  const [metric, setMetric] = useState('shares');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Advanced Analytics
          </div>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shares">Shares</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {metric === 'shares' && <Bar dataKey="shares" fill="#3b82f6" />}
            {metric === 'downloads' && <Bar dataKey="downloads" fill="#10b981" />}
            {metric === 'users' && <Bar dataKey="users" fill="#a855f7" />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}