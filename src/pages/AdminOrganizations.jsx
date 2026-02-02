import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Users } from 'lucide-react';

const ORGANIZATIONS = [
  { id: 1, name: 'Hausverwaltung Berlin', users: 45, plan: 'Pro', status: 'active', created: '2025-06-15' },
  { id: 2, name: 'Property Management München', users: 28, plan: 'Basic', status: 'active', created: '2025-09-20' },
  { id: 3, name: 'Admin Test Org', users: 2, plan: 'Enterprise', status: 'active', created: '2026-01-01' },
];

export default function AdminOrganizations() {
  const [showNewOrg, setShowNewOrg] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6" /> Organisationen
        </h1>
        <Button onClick={() => setShowNewOrg(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neue Org
        </Button>
      </div>

      {showNewOrg && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Organisation erstellen
              <button onClick={() => setShowNewOrg(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Organisation Name" className="w-full px-3 py-2 border rounded-lg" />
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Basic</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNewOrg(false)}>Cancel</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Organizations', value: ORGANIZATIONS.length, color: 'text-blue-600' },
          { label: 'Active Users', value: ORGANIZATIONS.reduce((sum, org) => sum + org.users, 0), color: 'text-green-600' },
          { label: 'Monthly Revenue', value: '€4,280', color: 'text-violet-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {ORGANIZATIONS.map(org => (
          <Card key={org.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{org.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" /> {org.users}
                    </Badge>
                    <Badge className="text-xs bg-violet-100 text-violet-800">{org.plan}</Badge>
                    <Badge className="text-xs bg-green-100 text-green-800">✓ {org.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Erstellt: {org.created}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Verwalten</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}