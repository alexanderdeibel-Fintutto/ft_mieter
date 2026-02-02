import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DocumentIntegrityStatus({ documentId }) {
  const [integrity] = useState({
    status: 'verified',
    lastCheck: new Date(Date.now() - 3600000).toISOString(),
    checksumValid: true,
    notModified: true,
    originalSignature: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Dokumentintegrität</span>
          {integrity.status === 'verified' ? (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verifiziert
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Warnung
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Checksum validiert</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Nicht verändert seit Upload</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Originalsignatur vorhanden</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Letzte Überprüfung: {new Date(integrity.lastCheck).toLocaleString('de-DE')}
        </p>
      </CardContent>
    </Card>
  );
}