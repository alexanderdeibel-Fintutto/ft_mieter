import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Database } from 'lucide-react';

export default function DataManagementDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Data</p>
                <p className="text-2xl font-bold">2.4GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-xs text-gray-600 mb-2">Storage Usage</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }} />
              </div>
              <p className="text-xs text-gray-600 mt-1">67 of 100GB</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-600 mb-2">Records</p>
            <p className="text-2xl font-bold">12,847</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button variant="outline" className="w-full justify-center gap-2">
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}