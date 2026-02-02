import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DataRetentionPolicy() {
  const [policy, setPolicy] = useState({
    documentRetention: 365, // Tage
    auditLogRetention: 730,
    shareHistoryRetention: 365,
    backupRetention: 90,
    autoDeleteExpired: true,
  });

  const [changes, setChanges] = useState({});

  const handlePolicySave = async () => {
    try {
      await new Promise(r => setTimeout(r, 1000));
      setChanges({});
      toast.success('Richtlinie gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Datenspeicherrichtlinie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Retention */}
        <div className="p-3 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Dokumente</p>
              <p className="text-xs text-gray-600">Aufbewahrung nach Löschung</p>
            </div>
            <Badge>{policy.documentRetention} Tage</Badge>
          </div>
          <Select value={policy.documentRetention.toString()} onValueChange={(v) => setPolicy({...policy, documentRetention: parseInt(v)})}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Tage</SelectItem>
              <SelectItem value="90">90 Tage</SelectItem>
              <SelectItem value="365">1 Jahr</SelectItem>
              <SelectItem value="730">2 Jahre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Log Retention */}
        <div className="p-3 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Audit Logs</p>
              <p className="text-xs text-gray-600">Für Compliance & Forensik</p>
            </div>
            <Badge variant="secondary">{policy.auditLogRetention} Tage</Badge>
          </div>
          <Select value={policy.auditLogRetention.toString()} onValueChange={(v) => setPolicy({...policy, auditLogRetention: parseInt(v)})}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="365">1 Jahr</SelectItem>
              <SelectItem value="730">2 Jahre</SelectItem>
              <SelectItem value="1095">3 Jahre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto Delete */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-900">Auto-Löschung nach Ablauf</span>
          </div>
          <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
        </div>

        <Button onClick={handlePolicySave} className="w-full bg-blue-600">
          <Calendar className="w-4 h-4 mr-2" />
          Richtlinie speichern
        </Button>
      </CardContent>
    </Card>
  );
}