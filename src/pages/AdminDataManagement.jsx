import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataManagementDashboard from '../components/admin/DataManagementDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminDataManagement() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">💾 Data Management</h1>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quotas">Quotas</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="recovery">Recovery</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DataManagementDashboard />
          </TabsContent>

          <TabsContent value="quotas">
            <Card>
              <CardHeader>
                <CardTitle>Resource Quotas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Documents', limit: 1000, used: 234, pct: 23 },
                  { name: 'Storage (GB)', limit: 100, used: 34.5, pct: 35 },
                  { name: 'API Calls', limit: 100000, used: 45234, pct: 45 },
                ].map(q => (
                  <div key={q.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{q.name}</span>
                      <Badge className="bg-blue-100 text-blue-700">{q.pct}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${q.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>Daily analytics report sent to admin@mieterapp.de</p>
                <p>Weekly usage report sent to team@mieterapp.de</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recovery">
            <Card>
              <CardHeader>
                <CardTitle>Disaster Recovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>RPO (Recovery Point Objective)</span>
                  <Badge className="bg-green-100 text-green-700">15 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span>RTO (Recovery Time Objective)</span>
                  <Badge className="bg-green-100 text-green-700">30 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Backup</span>
                  <Badge className="bg-green-100 text-green-700">2 hours ago</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}