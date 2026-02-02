import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus } from 'lucide-react';

const PLANS = [
  { id: 1, name: 'Free', price: '€0', billing: 'monthly', users: 1245, status: 'active', features: 5 },
  { id: 2, name: 'Pro', price: '€29', billing: 'monthly', users: 3420, status: 'active', features: 12 },
  { id: 3, name: 'Enterprise', price: 'Custom', billing: 'custom', users: 240, status: 'active', features: 'unlimited' },
];

const FEATURES = [
  { id: 1, name: 'Document Storage', plans: ['Pro', 'Enterprise'], limit: '5 GB / 100 GB' },
  { id: 2, name: 'Repair Tracking', plans: ['Free', 'Pro', 'Enterprise'], limit: 'All' },
  { id: 3, name: 'API Access', plans: ['Pro', 'Enterprise'], limit: '10K calls/month' },
];

export default function AdminBillingPlans() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6" /> Subscription Plans & Pricing
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" /> Plan erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Plan erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Plan Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Price (€)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Monthly</option>
              <option>Yearly</option>
              <option>Custom</option>
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
          { label: 'Total Subscribers', value: '4.9K', color: 'text-blue-600' },
          { label: 'MRR', value: '€98.4K', color: 'text-green-600' },
          { label: 'Active Plans', value: '3', color: 'text-purple-600' },
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
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PLANS.map(plan => (
            <div key={plan.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{plan.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {plan.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="text-lg font-bold text-gray-900">{plan.price}</span>
                <span>{plan.billing}</span>
                <span>{plan.users.toLocaleString()} subscribers</span>
                <span>{plan.features} features</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Manage</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Matrix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FEATURES.map(feature => (
            <div key={feature.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{feature.name}</h3>
                <span className="text-xs font-mono text-gray-600">{feature.limit}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {feature.plans.map(plan => (
                  <Badge key={plan} variant="outline" className="text-xs">{plan}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}