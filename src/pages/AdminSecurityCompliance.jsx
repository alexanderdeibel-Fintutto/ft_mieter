import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecurityAuditDashboard from '../components/admin/SecurityAuditDashboard';
import ComplianceDashboard from '../components/dokumente/ComplianceDashboard';
import DocumentEncryption from '../components/dokumente/DocumentEncryption';

export default function AdminSecurityCompliance() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔒 Security & Compliance</h1>

        <Tabs defaultValue="audit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audit">Security Audit</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
          </TabsList>

          <TabsContent value="audit">
            <SecurityAuditDashboard />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>

          <TabsContent value="encryption">
            <DocumentEncryption />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}