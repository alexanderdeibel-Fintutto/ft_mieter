import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import DocumentSharingDashboardV2 from '../components/admin/DocumentSharingDashboardV2';
import RoleBasedAccessControl from '../components/dokumente/RoleBasedAccessControl';
import DocumentEncryption from '../components/dokumente/DocumentEncryption';
import DocumentIntegrityStatus from '../components/dokumente/DocumentIntegrityStatus';
import ComplianceDashboard from '../components/dokumente/ComplianceDashboard';

export default function AdminDocumentSharingV2() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📄 Document Sharing (V2)</h1>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="integrity">Integrity</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <DocumentSharingDashboardV2 />
          </TabsContent>

          <TabsContent value="access">
            <RoleBasedAccessControl />
          </TabsContent>

          <TabsContent value="encryption">
            <DocumentEncryption />
          </TabsContent>

          <TabsContent value="integrity">
            <Card className="p-6">
              <DocumentIntegrityStatus documentId="doc_123" />
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}