import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const VULNERABILITIES = [
  { id: 1, title: 'Outdated Dependency', severity: 'medium', cvss: 5.3, status: 'open', found: '2026-01-20' },
  { id: 2, title: 'Missing CSRF Token', severity: 'high', cvss: 7.1, status: 'open', found: '2026-01-18' },
  { id: 3, title: 'SQL Injection Risk', severity: 'critical', cvss: 9.8, status: 'resolved', found: '2026-01-10' },
];

const SECURITY_SCORE = [
  { category: 'Authentication', score: 92 },
  { category: 'Authorization', score: 85 },
  { category: 'Data Protection', score: 88 },
  { category: 'Network Security', score: 90 },
];

export default function AdminSecurityAudit() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-6 h-6" /> Security Audit & Penetration Testing
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Overall Score', value: '89%', color: 'text-green-600' },
          { label: 'Vulnerabilities', value: '2', color: 'text-orange-600' },
          { label: 'Last Audit', value: '2 days ago', color: 'text-blue-600' },
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
          <CardTitle>Security Score by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SECURITY_SCORE.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{item.category}</p>
                <p className="font-bold text-gray-900">{item.score}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.score >= 90 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Found Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {VULNERABILITIES.map(vuln => (
            <div key={vuln.id} className={`p-3 rounded-lg border ${
              vuln.severity === 'critical' ? 'bg-red-50 border-red-200' :
              vuln.severity === 'high' ? 'bg-orange-50 border-orange-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{vuln.title}</h3>
                <Badge className={
                  vuln.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  vuln.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  CVSS {vuln.cvss}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Found: {vuln.found}</span>
                <Badge variant="outline" className={vuln.status === 'open' ? 'text-red-700' : 'text-green-700'}>
                  {vuln.status === 'open' ? 'Open' : 'Resolved'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Details</Button>
                <Button size="sm" variant="outline" className="text-xs">Fix</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penetration Test Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { test: 'Full Security Audit', date: '2026-02-15', status: 'scheduled' },
            { test: 'API Penetration Testing', date: '2026-02-20', status: 'scheduled' },
            { test: 'Infrastructure Scan', date: '2026-02-28', status: 'scheduled' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.test}</p>
                <p className="text-xs text-gray-600 mt-1">{item.date}</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs">Manage</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}