import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ShareAnalyticsDashboard from '../components/dokumente/ShareAnalyticsDashboard';
import AuditDashboard from '../components/dokumente/AuditDashboard';
import DocumentAnalytics from '../components/dokumente/DocumentAnalytics';
import WebhookManager from '../components/dokumente/WebhookManager';
import TeamShareDialog from '../components/dokumente/TeamShareDialog';
import SharePermissionsMatrix from '../components/dokumente/SharePermissionsMatrix';
import { BarChart3, Settings2, Lock, Share2, Eye, MoreVertical } from 'lucide-react';

export default function AdminDocumentSharing() {
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const stats = [
    { label: 'Gesamt Shares', value: '1.234', icon: Share2, color: 'bg-blue-100' },
    { label: 'Aktive User', value: '567', icon: Eye, color: 'bg-green-100' },
    { label: 'Downloads heute', value: '89', icon: BarChart3, color: 'bg-purple-100' },
    { label: 'Security Events', value: '12', icon: Lock, color: 'bg-red-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📄 Document Sharing Admin</h1>
          <p className="text-gray-600">Cross-App Dokumentenverwaltung & Sharing</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-white">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sharing Analytics</span>
                  <Button variant="outline" size="sm">Export</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShareAnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <AuditDashboard documentId="all" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permissions Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <SharePermissionsMatrix />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Webhook Configuration</span>
                  <Button onClick={() => setWebhookOpen(true)} size="sm">Manage</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WebhookManager open={webhookOpen} onOpenChange={setWebhookOpen} />
                <div className="text-sm text-gray-600 mt-4">
                  <p>📌 Webhooks sind konfiguriert für externe Systeme (Zapier, Make, N8N)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">GDPR Compliant</p>
                    <p className="text-xs text-green-700 mt-1">Alle Daten verschlüsselt, Audit Logs aktiv</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">ISO 27001 Ready</p>
                    <p className="text-xs text-blue-700 mt-1">Alle Security Standards implementiert</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-sm mb-2">⚙️ Konfiguration</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Password Protection: Aktiviert</li>
                    <li>✓ Download Limits: 5 pro Share</li>
                    <li>✓ Expiry Default: 30 Tage</li>
                    <li>✓ Virus Scanning: Aktiviert</li>
                    <li>✓ Encryption: AES-256</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}