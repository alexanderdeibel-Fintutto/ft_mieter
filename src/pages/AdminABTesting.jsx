import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Plus } from 'lucide-react';

const TESTS = [
  { id: 1, name: 'New Repair Form', control: 'Original', variant: 'Simplified', status: 'running', duration: '14 days', users: 2450, conversion: 12.8 },
  { id: 2, name: 'Payment Button Color', control: 'Blue', variant: 'Green', status: 'completed', duration: '7 days', users: 1840, conversion: 15.2 },
  { id: 3, name: 'Document Upload', control: 'Single', variant: 'Batch', status: 'running', duration: '10 days', users: 980, conversion: 18.5 },
];

const TEST_DATA = [
  { variant: 'Control', users: 1225, conversions: 157, rate: 12.8 },
  { variant: 'Variant', users: 1225, conversions: 187, rate: 15.3 },
];

export default function AdminABTesting() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6" /> A/B Testing & Experiments
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-rose-600 hover:bg-rose-700">
          <Plus className="w-4 h-4" /> Test starten
        </Button>
      </div>

      {showNew && (
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              A/B Test erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Test Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Control Description" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Variant Description" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Conversion Rate</option>
              <option>Click Rate</option>
              <option>Time on Page</option>
              <option>Custom Metric</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700">Starten</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Tests', value: '2', color: 'text-blue-600' },
          { label: 'Participants', value: '4.3K', color: 'text-green-600' },
          { label: 'Completed Tests', value: '8', color: 'text-rose-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={TEST_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variant" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="users" fill="#8B5CF6" name="Users" />
              <Bar yAxisId="right" dataKey="rate" fill="#F97316" name="Conv. Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Running Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TESTS.map(test => (
            <div key={test.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{test.name}</h3>
                <Badge className={test.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                  {test.status === 'running' ? '▶ Running' : 'Completed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{test.control} vs {test.variant}</span>
                <span>{test.duration}</span>
                <span>{test.users} users</span>
                <span className="font-bold text-rose-600">{test.conversion}% conv.</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">View Results</Button>
                {test.status === 'running' && <Button size="sm" variant="outline" className="text-xs">Stop Test</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}