import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus } from 'lucide-react';

const CAMPAIGNS = [
  { id: 1, name: 'Q1 Newsletter', type: 'Newsletter', sent: 2840, opens: 1865, clicks: 420, status: 'active' },
  { id: 2, name: 'Winter Promotion', type: 'Promotional', sent: 3120, opens: 1560, clicks: 312, status: 'completed' },
  { id: 3, name: 'Maintenance Alert', type: 'Transactional', sent: 4500, opens: 4320, clicks: 1080, status: 'completed' },
];

const TEMPLATES = [
  { id: 1, name: 'Welcome Email', category: 'Onboarding', usage: 1245 },
  { id: 2, name: 'Reset Password', category: 'Security', usage: 3420 },
  { id: 3, name: 'Repair Update', category: 'Notification', usage: 2860 },
];

export default function AdminEmailCampaigns() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-6 h-6" /> Email Campaign Manager
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Campaign starten
        </Button>
      </div>

      {showNew && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Email Kampagne
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Campaign Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Newsletter</option>
              <option>Promotional</option>
              <option>Transactional</option>
            </select>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Welcome Email</option>
              <option>Reset Password</option>
              <option>Repair Update</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: '10.46K', color: 'text-blue-600' },
          { label: 'Avg Open Rate', value: '68.2%', color: 'text-green-600' },
          { label: 'Avg CTR', value: '12.8%', color: 'text-amber-600' },
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
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CAMPAIGNS.map(campaign => (
            <div key={campaign.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                <Badge className={campaign.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                  {campaign.status === 'active' ? '▶ Active' : 'Completed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{campaign.type} • {campaign.sent} sent</span>
                <span>{Math.round(campaign.opens/campaign.sent*100)}% open</span>
                <span>{Math.round(campaign.clicks/campaign.sent*100)}% CTR</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">Analytics</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TEMPLATES.map(template => (
            <div key={template.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <Badge variant="outline" className="text-xs">{template.usage} uses</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">{template.category}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">Edit</Button>
                  <Button size="sm" variant="outline" className="text-xs">Preview</Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}