import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';

const TENANTS = [
  { id: 1, name: 'Apartment Complex 1', domain: 'complex1.de', status: 'active', users: 245, storage: '12.5 GB' },
  { id: 2, name: 'Apartment Complex 2', domain: 'complex2.de', status: 'active', users: 189, storage: '8.3 GB' },
  { id: 3, name: 'Test Tenant', domain: 'test.de', status: 'suspended', users: 12, storage: '0.5 GB' },
];

export default function AdminTenants() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6" /> Multi-Tenancy Management
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neuer Tenant
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tenant erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Organization Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Custom Domain" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Basic Plan</option>
              <option>Pro Plan</option>
              <option>Enterprise Plan</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Tenants', value: '3', color: 'text-blue-600' },
          { label: 'Active', value: '2', color: 'text-green-600' },
          { label: 'Total Users', value: '446', color: 'text-violet-600' },
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
          <CardTitle>Tenants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TENANTS.map(tenant => (
            <div key={tenant.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{tenant.name}</h3>
                <Badge className={tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {tenant.status === 'active' ? '✓ Active' : 'Suspended'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{tenant.domain}</p>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{tenant.users} users</span>
                <span>{tenant.storage} storage</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Manage</Button>
                <Button size="sm" variant="outline" className="text-xs">Suspend</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}