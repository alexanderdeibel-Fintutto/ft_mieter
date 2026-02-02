import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp, Users } from 'lucide-react';

const SUBSCRIPTION_TIERS = [
  { name: 'Basic', price: '€29/mo', users: 234, revenue: '€6,786', status: 'active' },
  { name: 'Pro', price: '€79/mo', users: 156, revenue: '€12,324', status: 'active' },
  { name: 'Enterprise', price: 'Custom', users: 12, revenue: '€18,500', status: 'active' },
];

const RECENT_TRANSACTIONS = [
  { id: 1, user: 'Max M.', amount: '€79', status: 'success', date: '2026-01-24' },
  { id: 2, user: 'Anna S.', amount: '€29', status: 'success', date: '2026-01-23' },
  { id: 3, user: 'Peter W.', amount: '€79', status: 'failed', date: '2026-01-22' },
  { id: 4, user: 'Lisa M.', amount: '€29', status: 'pending', date: '2026-01-24' },
];

export default function AdminBilling() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-6 h-6" /> Billing & Abos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Monatliche Einnahmen', value: '€37,610', trend: '+12.5%' },
          { label: 'Aktive Abos', value: '402', trend: '+8 diese Woche' },
          { label: 'Churn Rate', value: '2.3%', trend: '-0.5%' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-green-600 mt-2">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Tiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SUBSCRIPTION_TIERS.map((tier, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{tier.name}</h3>
                  <p className="text-sm text-violet-600 font-semibold">{tier.price}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{tier.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Benutzer</p>
                    <p className="font-semibold text-gray-900">{tier.users}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Umsatz</p>
                    <p className="font-semibold text-gray-900">{tier.revenue}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Transaktionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECENT_TRANSACTIONS.map(tx => (
            <div key={tx.id} className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{tx.user}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-gray-900">{tx.amount}</p>
                <Badge className={
                  tx.status === 'success' ? 'bg-green-100 text-green-800' :
                  tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {tx.status === 'success' ? 'Erfolgreich' : tx.status === 'failed' ? 'Fehler' : 'Ausstehend'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}