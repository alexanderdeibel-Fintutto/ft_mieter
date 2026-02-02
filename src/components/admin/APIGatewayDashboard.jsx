import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, AlertCircle } from 'lucide-react';

export default function APIGatewayDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">RPS</p>
                <p className="text-2xl font-bold">5,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">99.99%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Errors</p>
                <p className="text-2xl font-bold">0.02%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Endpoints Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['documents', 'shares', 'audit', 'webhooks'].map(ep => (
            <div key={ep} className="flex items-center justify-between text-sm">
              <span>/{ep}</span>
              <Badge className="bg-green-100 text-green-700">Healthy</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}