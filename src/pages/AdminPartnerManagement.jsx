import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus } from 'lucide-react';

const PARTNERS = [
  { id: 1, name: 'Handymann Services', type: 'Repairs', status: 'active', revenue: '€12,450', jobs: 245 },
  { id: 2, name: 'Cleaning Pro', type: 'Cleaning', status: 'active', revenue: '€8,920', jobs: 180 },
  { id: 3, name: 'Electrical Experts', type: 'Repairs', status: 'pending', revenue: '€0', jobs: 0 },
];

const COMMISSIONS = [
  { partner: 'Handymann Services', rate: '15%', revenue: '€12,450', commission: '€1,867.50', period: 'Jan 2026' },
  { partner: 'Cleaning Pro', rate: '12%', revenue: '€8,920', commission: '€1,070.40', period: 'Jan 2026' },
];

export default function AdminPartnerManagement() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" /> Partner Management
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Partner hinzufügen
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Neuer Partner
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Company Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Repairs</option>
              <option>Cleaning</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
            <input type="email" placeholder="Contact Email" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Commission Rate (%)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Einladen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Partners', value: '2', color: 'text-blue-600' },
          { label: 'Total Revenue', value: '€21.4K', color: 'text-green-600' },
          { label: 'Total Jobs', value: '425', color: 'text-violet-600' },
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
          <CardTitle>Partners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PARTNERS.map(partner => (
            <div key={partner.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{partner.name}</h3>
                <Badge className={partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {partner.status === 'active' ? '✓ Active' : 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{partner.type}</span>
                <span>{partner.jobs} jobs</span>
                <span className="font-bold">{partner.revenue}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Manage</Button>
                <Button size="sm" variant="outline" className="text-xs">Statement</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {COMMISSIONS.map((comm, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{comm.partner}</h3>
                <Badge variant="outline" className="text-xs">{comm.period}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{comm.revenue} @ {comm.rate}</span>
                <span className="font-bold text-violet-600">{comm.commission}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">Pay Out</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}