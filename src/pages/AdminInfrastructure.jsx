import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import APIGatewayDashboard from '../components/admin/APIGatewayDashboard';
import CostManagementDashboard from '../components/admin/CostManagementDashboard';

export default function AdminInfrastructure() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">⚙️ Infrastructure</h1>

        <Tabs defaultValue="gateway" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gateway">API Gateway</TabsTrigger>
            <TabsTrigger value="costs">Cost Management</TabsTrigger>
          </TabsList>

          <TabsContent value="gateway">
            <APIGatewayDashboard />
          </TabsContent>

          <TabsContent value="costs">
            <CostManagementDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}