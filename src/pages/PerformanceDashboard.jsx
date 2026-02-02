import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, BarChart3, Database, AlertTriangle } from 'lucide-react';

const mockMetrics = {
  pageLoad: [
    { name: 'Home', time: 1200 },
    { name: 'Dashboard', time: 2100 },
    { name: 'Finances', time: 1800 },
    { name: 'Repairs', time: 2400 },
    { name: 'Messages', time: 950 }
  ],
  memoryUsage: [
    { time: '00:00', value: 45 },
    { time: '06:00', value: 52 },
    { time: '12:00', value: 68 },
    { time: '18:00', value: 72 },
    { time: '23:59', value: 55 }
  ],
  componentMetrics: [
    { name: 'MieterDashboard', renders: 145, avgTime: 234 },
    { name: 'QuickActions', renders: 312, avgTime: 89 },
    { name: 'StreakCounter', renders: 89, avgTime: 45 },
    { name: 'AchievementBadge', renders: 245, avgTime: 78 }
  ],
  networkRequests: [
    { status: 'Success', count: 2841 },
    { status: 'Error', count: 34 },
    { status: 'Timeout', count: 12 }
  ]
};

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export default function PerformanceDashboard() {
  const [uptime, setUptime] = useState(99.94);
  const [avgResponseTime, setAvgResponseTime] = useState(245);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">Performance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time Metriken und Optimierungsempfehlungen
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Activity, label: 'Uptime', value: uptime + '%', color: 'bg-green-500' },
            { icon: Zap, label: 'Avg Response', value: avgResponseTime + 'ms', color: 'bg-blue-500' },
            { icon: BarChart3, label: 'Total Requests', value: '2,887', color: 'bg-purple-500' },
            { icon: Database, label: 'Memory', value: '72%', color: 'bg-orange-500' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.label}</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                      {item.value}
                    </p>
                  </div>
                  <div className={`${item.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Tabs defaultValue="pageload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pageload">Page Load</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          {/* Page Load Times */}
          <TabsContent value="pageload">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Times</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockMetrics.pageLoad}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="time" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Usage */}
          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockMetrics.memoryUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components */}
          <TabsContent value="components">
            <Card>
              <CardHeader>
                <CardTitle>Component Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMetrics.componentMetrics.map((comp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{comp.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {comp.renders} renders • {comp.avgTime}ms avg
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-semibold">
                          {comp.renders}x
                        </div>
                        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-semibold">
                          {comp.avgTime}ms
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network */}
          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle>Network Requests</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockMetrics.networkRequests}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, count }) => `${name}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {mockMetrics.networkRequests.map((req, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="font-semibold flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        {req.status}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{req.count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alerts */}
        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-bold">Alerts & Recommendations</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">High Memory Usage Detected</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Memory usage reached 72%. Consider implementing virtual lists for long data sets.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}