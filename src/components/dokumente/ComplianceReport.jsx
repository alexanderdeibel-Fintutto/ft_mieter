import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

export default function ComplianceReport({ documentId }) {
  const [compliance, setCompliance] = useState({
    hasAuditTrail: true,
    isPasswordProtected: false,
    hasDownloadLimits: false,
    isExpiringShare: false,
    hasAccessControl: true,
    lastAuditCheck: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);

  const handleExportReport = async () => {
    setLoading(true);
    try {
      const report = {
        documentId,
        generatedAt: new Date().toISOString(),
        compliance,
        recommendations: generateRecommendations(compliance),
      };

      const dataStr = JSON.stringify(report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${documentId}.json`;
      link.click();

      toast.success('Report heruntergeladen');
    } catch (error) {
      toast.error('Fehler beim Export');
    }
    setLoading(false);
  };

  const generateRecommendations = (comp) => {
    const recs = [];
    if (!comp.isPasswordProtected) recs.push('Passwort-Schutz aktivieren für sensitive Dokumente');
    if (!comp.hasDownloadLimits) recs.push('Download-Limits setzen');
    if (!comp.isExpiringShare) recs.push('Auto-Ablauf für Shares konfigurieren');
    return recs;
  };

  const ComplianceItem = ({ icon: Icon, label, status, description }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <div className="mt-1">
        {status ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-gray-900">{label}</p>
          <Badge variant={status ? 'default' : 'secondary'} className="text-xs">
            {status ? '✓ Aktiv' : '⚠️ Inaktiv'}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Compliance Status</CardTitle>
          <CardDescription className="text-xs">
            Überprüfung der Share-Sicherheit und Compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ComplianceItem
            icon={FileText}
            label="Audit Trail"
            status={compliance.hasAuditTrail}
            description="Alle Aktivitäten werden protokolliert"
          />
          <ComplianceItem
            icon={AlertCircle}
            label="Passwort-Schutz"
            status={compliance.isPasswordProtected}
            description="Shares sind mit Passwort geschützt"
          />
          <ComplianceItem
            icon={Clock}
            label="Download-Limits"
            status={compliance.hasDownloadLimits}
            description="Anzahl der Downloads ist begrenzt"
          />
          <ComplianceItem
            icon={Clock}
            label="Auto-Ablauf"
            status={compliance.isExpiringShare}
            description="Shares verfallen automatisch"
          />
          <ComplianceItem
            icon={CheckCircle2}
            label="Zugriffskontrolle"
            status={compliance.hasAccessControl}
            description="Rollen-basierte Berechtigungen aktiv"
          />
        </CardContent>
      </Card>

      {/* Recommendations */}
      {generateRecommendations(compliance).length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-sm text-amber-900">Empfehlungen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generateRecommendations(compliance).map((rec, idx) => (
                <li key={idx} className="text-xs text-amber-800 flex gap-2">
                  <span>→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExportReport}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Report exportieren
      </Button>
    </div>
  );
}