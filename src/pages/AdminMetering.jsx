import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

const USAGE_DATA = [
  { day: 'Mon', apiCalls: 24000, storage: 156, bandwidth: 340 },
  { day: 'Tue', apiCalls: 28000, storage: 162, bandwidth: 385 },
  { day: 'Wed', apiCalls: 32000, storage: 168, bandwidth: 420 },
  { day: 'Thu', apiCalls: 29000, storage: 175, bandwidth: 395 },
  { day: 'Fri', apiCalls: 35000, storage: 182, bandwidth: 450 },
];

const METERS = [
  { name: 'API Calls', value: '152K/month', limit: '1M', percent: 15, trend: '+5%' },
  { name: 'Storage', value: '845 GB', limit: '1 TB', percent: 85, trend: '+12%' },
  { name: 'Bandwidth', value: '1.9 TB', limit: '10 TB', percent: 19, trend: '+8%' },
  { name: 'Users', value: '1,245', limit: '5K', percent: 25, trend: '+3%' },
];

export default function AdminMetering() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-6 h-6" /> Usage Metering & Analytics
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Usage Metrics (This Month)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {METERS.map((meter, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{meter.name}</h3>
                <Badge variant="outline" className="text-xs">{meter.trend}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    meter.percent > 80 ? 'bg-red-500' : meter.percent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${meter.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{meter.value}</span>
                <span>Limit: {meter.limit}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Usage (API Calls)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={USAGE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="apiCalls" fill="#8B5CF6" name="API Calls" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cost Projection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { item: 'API Calls', cost: '€152' },
              { item: 'Storage', cost: '€84.50' },
              { item: 'Bandwidth', cost: '€190' },
            ].map((item, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <p className="text-sm text-gray-900">{item.item}</p>
                <p className="text-sm font-bold text-gray-900">{item.cost}</p>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex items-center justify-between">
              <p className="font-bold text-gray-900">Est. Monthly</p>
              <p className="text-lg font-bold text-violet-600">€426.50</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { event: 'Storage overage', time: '2h ago', amount: '+€42' },
              { event: 'API rate limit', time: '6h ago', amount: '+€15' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{item.event}</p>
                  <p className="text-sm font-bold text-orange-600">{item.amount}</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}