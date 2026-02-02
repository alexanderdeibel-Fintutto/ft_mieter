import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus } from 'lucide-react';

const INSTALLED = [
  { id: 1, name: 'Stripe Payments', category: 'Payments', version: '2.1.0', status: 'active', installs: 2840 },
  { id: 2, name: 'Brevo Email', category: 'Email', version: '1.5.2', status: 'active', installs: 1520 },
  { id: 3, name: 'LetterXpress', category: 'Communication', version: '1.2.3', status: 'active', installs: 890 },
];

const AVAILABLE = [
  { id: 1, name: 'Slack Integration', category: 'Communication', rating: 4.8, reviews: 342 },
  { id: 2, name: 'Zapier', category: 'Automation', rating: 4.9, reviews: 1240 },
  { id: 3, name: 'HubSpot CRM', category: 'CRM', rating: 4.7, reviews: 567 },
];

export default function AdminIntegrationMarketplace() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6" /> Integration Marketplace
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Browse
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Integrations durchsuchen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Search..." className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>All Categories</option>
              <option>Payments</option>
              <option>Email</option>
              <option>Communication</option>
              <option>Analytics</option>
            </select>
            <Button className="w-full bg-violet-600 hover:bg-violet-700">Suchen</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Installed Apps', value: '3', color: 'text-blue-600' },
          { label: 'Total Installs', value: '5.25K', color: 'text-green-600' },
          { label: 'Available', value: '47', color: 'text-violet-600' },
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
          <CardTitle>Installed Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {INSTALLED.map(app => (
            <div key={app.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{app.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {app.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{app.category}</span>
                <span className="font-mono">v{app.version}</span>
                <span>{app.installs} installs</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Settings</Button>
                <Button size="sm" variant="outline" className="text-xs">Uninstall</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {AVAILABLE.map(app => (
            <div key={app.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{app.name}</h3>
                <Badge variant="outline" className="text-xs">{app.rating}★</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{app.category}</span>
                <span>{app.reviews} reviews</span>
              </div>
              <Button size="sm" className="w-full text-xs bg-violet-600 hover:bg-violet-700">Install</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}