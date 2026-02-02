import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';

const VENDORS = [
  { id: 1, name: 'LetterXpress', service: 'Mail Service', status: 'active', cost: '€3.2K/mo', reliability: '99.95%', support: '24/7' },
  { id: 2, name: 'Stripe', service: 'Payments', status: 'active', cost: '€2.8K/mo', reliability: '99.98%', support: '24/7' },
  { id: 3, name: 'AWS', service: 'Infrastructure', status: 'active', cost: '€18.5K/mo', reliability: '99.99%', support: 'Premium' },
  { id: 4, name: 'SendGrid', service: 'Email', status: 'negotiation', cost: '€0.8K/mo', reliability: '99.9%', support: 'Business' },
];

const CONTRACTS = [
  { id: 1, vendor: 'LetterXpress', startDate: '2025-01-01', endDate: '2026-12-31', value: '€38.4K', status: 'active' },
  { id: 2, vendor: 'Stripe', startDate: '2024-06-01', endDate: 'Rolling', value: 'Usage-based', status: 'active' },
  { id: 3, vendor: 'AWS', startDate: '2023-01-01', endDate: '2025-12-31', value: '€222K', status: 'renewal_pending' },
];

export default function AdminVendorManagement() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6" /> Vendor Management & SLAs
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Vendor hinzufügen
        </Button>
      </div>

      {showNew && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Vendor eintragen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Vendor Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Service" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Cost/Month (€)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">Hinzufügen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Vendors', value: '3', color: 'text-blue-600' },
          { label: 'Monthly Spend', value: '€24.5K', color: 'text-red-600' },
          { label: 'Avg Reliability', value: '99.96%', color: 'text-green-600' },
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
          <CardTitle>Active Vendors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {VENDORS.map(vendor => (
            <div key={vendor.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                <Badge className={
                  vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                  vendor.status === 'negotiation' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {vendor.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{vendor.service}</span>
                <span className="font-semibold text-gray-900">{vendor.cost}</span>
                <span>SLA: {vendor.reliability}</span>
                <span>{vendor.support}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">View SLA</Button>
                <Button size="sm" variant="outline" className="text-xs">Contact</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contracts & Renewals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CONTRACTS.map(contract => (
            <div key={contract.id} className={`p-3 rounded-lg ${contract.status === 'renewal_pending' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{contract.vendor}</h3>
                <Badge className={contract.status === 'renewal_pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                  {contract.status === 'renewal_pending' ? 'Renewal Due' : contract.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{contract.startDate} - {contract.endDate}</span>
                <span className="font-semibold text-gray-900">{contract.value}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">View Contract</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}