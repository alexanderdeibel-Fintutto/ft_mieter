import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Plus } from 'lucide-react';

const COST_BY_SERVICE = [
  { name: 'Repair Service', value: 34500, percent: 35, color: '#3B82F6' },
  { name: 'Storage', value: 28200, percent: 29, color: '#10B981' },
  { name: 'API Gateway', value: 18900, percent: 19, color: '#F59E0B' },
  { name: 'Database', value: 16400, percent: 17, color: '#8B5CF6' },
];

const COST_BY_TEAM = [
  { team: 'Engineering', allocated: 45600, actual: 47200, variance: '+3.5%' },
  { team: 'Operations', allocated: 28300, actual: 26800, variance: '-5.3%' },
  { team: 'Analytics', allocated: 18200, actual: 19100, variance: '+4.9%' },
];

const ALLOCATION_RULES = [
  { id: 1, metric: 'API Calls', rule: 'Distributed by volume', teams: 3, status: 'active' },
  { id: 2, metric: 'Storage', rule: 'Distributed by usage', teams: 2, status: 'active' },
  { id: 3, metric: 'Compute', rule: 'Fixed allocation', teams: 4, status: 'active' },
];

export default function AdminCostAttribution() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6" /> Cost Attribution & Chargeback
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" /> Regel erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Allocation Rule
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Metric Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Distributed by volume</option>
              <option>Distributed by usage</option>
              <option>Fixed allocation</option>
              <option>Time-based</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Monthly Cost', value: '€98.4K', color: 'text-blue-600' },
          { label: 'Allocation Accuracy', value: '98.2%', color: 'text-green-600' },
          { label: 'Cost Variance', value: '-1.2%', color: 'text-green-600' },
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
          <CardTitle>Cost Distribution by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={COST_BY_SERVICE} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: €${value}`} outerRadius={80}>
                {COST_BY_SERVICE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `€${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost by Team (Budget vs Actual)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={COST_BY_TEAM}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}`} />
              <Bar dataKey="allocated" fill="#8B5CF6" name="Allocated" />
              <Bar dataKey="actual" fill="#10B981" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ALLOCATION_RULES.map(rule => (
            <div key={rule.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{rule.metric}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {rule.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{rule.rule}</span>
                <span>{rule.teams} teams</span>
                <Button size="sm" variant="outline" className="text-xs">Edit</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}