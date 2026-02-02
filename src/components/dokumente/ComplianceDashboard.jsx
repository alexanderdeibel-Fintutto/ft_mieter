import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, BarChart3 } from 'lucide-react';

const standards = [
  { name: 'GDPR', status: 'compliant' },
  { name: 'ISO 27001', status: 'compliant' },
  { name: 'HIPAA', status: 'compliant' },
  { name: 'SOC 2', status: 'compliant' },
];

export default function ComplianceDashboard() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Compliance-Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {standards.map(std => (
            <div key={std.name} className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="font-medium text-sm">{std.name}</p>
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">Konform</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sicherheitsmetriken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Betriebsverfügbarkeit</span>
            <Badge className="bg-green-100 text-green-700">99.99% SLA</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Sicherheitsvorfälle</span>
            <Badge className="bg-green-100 text-green-700">0 dieses Jahr</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Datenpannen</span>
            <Badge className="bg-green-100 text-green-700">0 jemals</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}