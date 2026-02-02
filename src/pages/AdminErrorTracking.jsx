import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const ERRORS = [
  { id: 1, type: 'NullPointerException', count: 234, severity: 'critical', lastOccurrence: '2 min ago', status: 'unresolved' },
  { id: 2, type: 'ValidationError', count: 145, severity: 'warning', lastOccurrence: '15 min ago', status: 'investigating' },
  { id: 3, type: 'TimeoutException', count: 89, severity: 'error', lastOccurrence: '1 hour ago', status: 'unresolved' },
  { id: 4, type: 'PermissionDeniedException', count: 34, severity: 'warning', lastOccurrence: '3 hours ago', status: 'resolved' },
];

export default function AdminErrorTracking() {
  const [selectedError, setSelectedError] = useState(null);

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6" /> Error Tracking
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Errors', value: '502', trend: '-8.2%' },
          { label: 'Unresolved', value: '3', trend: '-1 today' },
          { label: 'Error Rate', value: '0.23%', trend: 'of requests' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-green-600 mt-1">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {ERRORS.map(error => (
          <Card key={error.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedError(error)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-mono text-sm font-medium text-gray-900">{error.type}</h3>
                  <p className="text-xs text-gray-600 mt-1">Letztes Vorkommen: {error.lastOccurrence}</p>
                </div>
                <div className="text-right">
                  <Badge className={
                    error.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    error.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {error.count}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2 capitalize">{error.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedError && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Error Details: {selectedError.type}
              <button onClick={() => setSelectedError(null)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <p className="text-xs text-gray-600 mb-1">Stack Trace:</p>
              <pre className="text-xs font-mono text-gray-900 overflow-auto max-h-32 bg-gray-50 p-2 rounded">
{`at handleRepairCreate (repairs.js:145)
at processRepairRequest (api.js:82)
at async submitForm (form.js:234)
at async validateInput (validator.js:56)`}
              </pre>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">Mark as Resolved</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}