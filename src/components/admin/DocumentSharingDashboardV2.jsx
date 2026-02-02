import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

const shareData = [
  { week: 'W1', shares: 234, downloads: 89, users: 156 },
  { week: 'W2', shares: 267, downloads: 102, users: 178 },
  { week: 'W3', shares: 312, downloads: 134, users: 201 },
  { week: 'W4', shares: 289, downloads: 118, users: 189 },
];

export default function DocumentSharingDashboardV2() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Shares', value: '1,234', icon: FileText, color: 'blue' },
          { label: 'Active Users', value: '456', icon: Users, color: 'green' },
          { label: 'Downloads', value: '789', icon: TrendingUp, color: 'purple' },
          { label: 'Share Rate', value: '12.5%', icon: BarChart3, color: 'orange' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${stat.color}-600`} />
                  <div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={shareData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="shares" fill="#3b82f6" />
              <Bar dataKey="downloads" fill="#10b981" />
              <Bar dataKey="users" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}