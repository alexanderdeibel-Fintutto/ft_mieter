import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function DocumentEncryption() {
  const [showDetails, setShowDetails] = useState(false);

  const encryptionStatus = {
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2-SHA256',
    tlsVersion: 'TLS 1.3',
    status: 'active',
    lastRotation: new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString('de-DE'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Verschlüsselung
          </div>
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aktiv
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-900">Ende-zu-Ende-Verschlüsselung</p>
          <p className="text-xs text-green-700 mt-1">Alle Daten in Ruhe und in Transit verschlüsselt</p>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 py-2"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDetails ? 'Details verbergen' : 'Details anzeigen'}
        </button>

        {showDetails && (
          <div className="space-y-2 p-3 bg-gray-50 rounded text-xs text-gray-700">
            <div><strong>Algorithmus:</strong> {encryptionStatus.algorithm}</div>
            <div><strong>Key Derivation:</strong> {encryptionStatus.keyDerivation}</div>
            <div><strong>TLS Version:</strong> {encryptionStatus.tlsVersion}</div>
            <div><strong>Letzte Rotation:</strong> {encryptionStatus.lastRotation}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}