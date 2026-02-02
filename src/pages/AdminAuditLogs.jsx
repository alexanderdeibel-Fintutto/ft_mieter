import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Filter } from 'lucide-react';

const AUDIT_LOGS = [
  { id: 1, user: 'Max Mustermann', action: 'Nutzer gelöscht', resource: 'User #123', timestamp: '2026-01-24 14:32', status: 'success' },
  { id: 2, user: 'Anna Schmidt', action: 'Dokument hochgeladen', resource: 'Document #456', timestamp: '2026-01-24 13:15', status: 'success' },
  { id: 3, user: 'Admin System', action: 'Backup durchgeführt', resource: 'Database', timestamp: '2026-01-24 02:00', status: 'success' },
  { id: 4, user: 'Peter Weber', action: 'Einstellungen geändert', resource: 'Settings', timestamp: '2026-01-23 10:45', status: 'warning' },
  { id: 5, user: 'Lisa Müller', action: 'Reparaturanfrage erstellt', resource: 'Repair #789', timestamp: '2026-01-23 09:20', status: 'success' },
];

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredLogs = AUDIT_LOGS.filter(log =>
    (log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())) &&
    (selectedStatus === 'all' || log.status === selectedStatus)
  );

  const handleExport = () => {
    const csv = 'User,Action,Resource,Timestamp,Status\n' +
      filteredLogs.map(log => `${log.user},${log.action},${log.resource},${log.timestamp},${log.status}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    a.click();
  };

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <FileText className="w-6 h-6" /> Audit-Protokolle
      </h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Nach Aktion oder Benutzer suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Alle Status</option>
          <option value="success">Erfolgreich</option>
          <option value="warning">Warnung</option>
          <option value="error">Fehler</option>
        </select>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="space-y-2">
        {filteredLogs.map(log => (
          <Card key={log.id} className="hover:shadow-sm transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{log.action}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Benutzer: <span className="font-medium">{log.user}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Resource: <span className="font-medium">{log.resource}</span>
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.status === 'success' ? '✓' : '⚠'} {log.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2">{log.timestamp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}