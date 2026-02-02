import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Clock, FileText } from 'lucide-react';

const mockData = {
  usage: [
    { name: 'Mo', shares: 40, views: 24, downloads: 12 },
    { name: 'Di', shares: 30, views: 13, downloads: 22 },
    { name: 'Mi', shares: 20, views: 98, downloads: 29 },
    { name: 'Do', shares: 27, views: 39, downloads: 20 },
    { name: 'Fr', shares: 50, views: 48, downloads: 21 },
  ],
  distribution: [
    { name: 'View Only', value: 40 },
    { name: 'Download', value: 30 },
    { name: 'Edit', value: 20 },
    { name: 'Owner', value: 10 },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DocumentAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Avg. Share/Woche</p>
                <p className="text-2xl font-bold">33.4</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Aktive User</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <Users className="w-8 h-8 text-green-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Wöchentliche Aktivität</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockData.usage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="shares" fill="#3b82f6" />
              <Bar dataKey="views" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Zugriffs-Verteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockData.distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {mockData.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}