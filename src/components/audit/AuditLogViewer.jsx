import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AuditLogSearchFilter from './AuditLogSearchFilter';

const ACTION_COLORS = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  download: 'bg-purple-100 text-purple-800',
  share: 'bg-yellow-100 text-yellow-800',
  permission_change: 'bg-orange-100 text-orange-800',
  view: 'bg-gray-100 text-gray-800'
};

const ENTITY_ICONS = {
  Document: '📄',
  DocumentPermission: '🔐',
  WorkflowRule: '⚙️',
  MaintenanceTask: '🔧',
  Message: '💬',
  User: '👤'
};

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const auditLogs = await base44.entities.AuditLog.list('-created_date', 100);
    setLogs(auditLogs || []);
    setFilteredLogs(auditLogs || []);
    setLoading(false);
  };

  const handleFilter = (filters) => {
    let filtered = logs;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.user_email?.toLowerCase().includes(searchLower) ||
        log.entity_name?.toLowerCase().includes(searchLower) ||
        log.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.entityType) {
      filtered = filtered.filter(log => log.entity_type === filters.entityType);
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      filtered = filtered.filter(log => new Date(log.created_date) >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      filtered = filtered.filter(log => new Date(log.created_date) <= to);
    }

    setFilteredLogs(filtered);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('de-DE');
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Erstellt',
      update: 'Aktualisiert',
      delete: 'Gelöscht',
      download: 'Heruntergeladen',
      share: 'Geteilt',
      permission_change: 'Berechtigung geändert',
      view: 'Angeschaut'
    };
    return labels[action] || action;
  };

  if (loading) {
    return <div className="text-center py-8">Wird geladen...</div>;
  }

  return (
    <div className="space-y-4">
      <AuditLogSearchFilter onFilter={handleFilter} />

      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Keine Audit-Logs gefunden
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(log => (
            <Card key={log.id} className="hover:shadow-md transition">
              <CardContent className="pt-4">
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedLog(expandedLog === log.id ? null : log.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">
                        {ENTITY_ICONS[log.entity_type] || '📋'}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={ACTION_COLORS[log.action]}>
                            {getActionLabel(log.action)}
                          </Badge>
                          <span className="font-semibold text-sm">
                            {log.entity_name}
                          </span>
                          {log.status === 'failed' && (
                            <Badge variant="destructive" className="text-xs">
                              Fehler
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Benutzer:</span> {log.user_email}
                          </div>
                          <div>
                            <span className="font-medium">Entität:</span> {log.entity_type}
                          </div>
                          <div>
                            <span className="font-medium">Zeit:</span>{' '}
                            {formatDate(log.created_date)}
                          </div>
                          <div>
                            <span className="font-medium">IP:</span> {log.ip_address}
                          </div>
                        </div>

                        {log.description && (
                          <p className="text-sm text-gray-700 mt-2">
                            {log.description}
                          </p>
                        )}

                        {log.changes_summary && (
                          <p className="text-sm text-blue-600 mt-1">
                            {log.changes_summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                    >
                      {expandedLog === log.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedLog === log.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {log.old_values && Object.keys(log.old_values).length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Alte Werte:</h4>
                        <div className="bg-red-50 p-3 rounded text-sm space-y-1">
                          {Object.entries(log.old_values).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.new_values && Object.keys(log.new_values).length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Neue Werte:</h4>
                        <div className="bg-green-50 p-3 rounded text-sm space-y-1">
                          {Object.entries(log.new_values).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.error_message && (
                      <div className="bg-red-100 border border-red-300 p-3 rounded text-sm">
                        <span className="font-medium">Fehler:</span> {log.error_message}
                      </div>
                    )}

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Metadaten:</h4>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 text-sm text-blue-800">
          <p className="font-medium mb-2">ℹ️ Audit-Logs Information</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Zeigt die letzten 100 Aktionen an</li>
            <li>Alle Änderungen werden mit Benutzer, Zeit und IP-Adresse protokolliert</li>
            <li>Fehlerhafte Aktionen werden separat gekennzeichnet</li>
            <li>Alte und neue Werte werden für Updates gespeichert</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}