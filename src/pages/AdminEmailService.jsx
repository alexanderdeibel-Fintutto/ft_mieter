import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus } from 'lucide-react';

const TEMPLATES = [
  { id: 1, name: 'Welcome Email', category: 'onboarding', status: 'published', sent: 245 },
  { id: 2, name: 'Password Reset', category: 'auth', status: 'published', sent: 89 },
  { id: 3, name: 'Repair Notification', category: 'notifications', status: 'draft', sent: 0 },
];

const CAMPAIGNS = [
  { id: 1, name: 'Monthly Newsletter', status: 'sent', recipients: 1240, opens: 456, clicks: 123 },
  { id: 2, name: 'Feature Announcement', status: 'scheduled', recipients: 1240, scheduledFor: '2026-01-25' },
];

export default function AdminEmailService() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-6 h-6" /> Email Service
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neue Template
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Email Template erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Template Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Onboarding</option>
              <option>Authentication</option>
              <option>Notifications</option>
              <option>Marketing</option>
            </select>
            <textarea placeholder="Email Content (HTML)" rows="6" className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-xs" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: '334', color: 'text-blue-600' },
          { label: 'Avg Open Rate', value: '34.2%', color: 'text-green-600' },
          { label: 'Bounce Rate', value: '1.2%', color: 'text-orange-600' },
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
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TEMPLATES.map(template => (
            <div key={template.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <Badge className={template.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {template.status === 'published' ? '✓ Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{template.category}</span>
                <span>{template.sent} sent</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Preview</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CAMPAIGNS.map(campaign => (
            <div key={campaign.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                <Badge className={campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {campaign.status === 'sent' ? '✓ Sent' : 'Scheduled'}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {campaign.status === 'sent' ? (
                  <>
                    <p>{campaign.recipients} recipients • {campaign.opens} opens ({Math.round(campaign.opens/campaign.recipients*100)}%)</p>
                    <p>{campaign.clicks} clicks ({Math.round(campaign.clicks/campaign.opens*100)}%)</p>
                  </>
                ) : (
                  <p>Scheduled for {campaign.scheduledFor}</p>
                )}
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">Analytics</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}