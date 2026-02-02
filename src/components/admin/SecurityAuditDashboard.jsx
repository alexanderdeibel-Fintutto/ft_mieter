import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SecurityAuditDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Security Score</p>
                <p className="text-2xl font-bold">98/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Vulnerabilities</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Compliance</p>
                <p className="text-2xl font-bold">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { event: 'Failed Login Attempt', severity: 'medium', time: '2h ago' },
            { event: 'API Key Generated', severity: 'low', time: '4h ago' },
            { event: 'Permission Changed', severity: 'medium', time: '1d ago' },
          ].map((e, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
              <span>{e.event}</span>
              <Badge className={e.severity === 'critical' ? 'bg-red-100' : e.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}>
                {e.severity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}