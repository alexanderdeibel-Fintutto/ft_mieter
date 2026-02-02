import React from 'react';
import { Shield, Activity } from 'lucide-react';
import AuditLogViewer from '../components/audit/AuditLogViewer';

export default function AuditLogs() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold">Audit-Logs</h1>
          </div>
          <p className="text-gray-600">
            Überwachen Sie alle Aktivitäten in der Anwendung. Dokumenten-Uploads, Berechtigungsänderungen, 
            Workflow-Modifikationen und Aufgaben-Updates werden vollständig protokolliert.
          </p>
        </div>

        {/* Audit Log Viewer */}
        <AuditLogViewer />
      </div>
    </div>
  );
}