import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';

export default function SupabaseIntegrityDashboard() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const runIntegrityCheck = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await base44.functions.invoke('supabaseIntegrityCheck', {
        action: 'run-integrity-check'
      });

      if (response.data?.success) {
        setReport(response.data);
      } else {
        setError(response.data?.error || 'Integritätsprüfung fehlgeschlagen');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `integrity-report-${new Date().toISOString()}.json`;
    link.click();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      default:
        return <AlertCircle className="text-gray-600" size={20} />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-800';
      case 'failed':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supabase Integritätsprüfung</h1>
        <p className="text-gray-600">
          Überprüfen Sie die Integrität Ihrer Supabase-Konfiguration, Authentifizierung und Daten
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-800">Fehler bei der Integritätsprüfung</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex gap-3">
        <Button
          onClick={runIntegrityCheck}
          disabled={loading}
          className="gap-2"
          size="lg"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Prüfung läuft...' : 'Integritätsprüfung starten'}
        </Button>

        {report && (
          <Button
            onClick={downloadReport}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Download size={18} />
            Bericht herunterladen
          </Button>
        )}
      </div>

      {report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Gesamttests</p>
                  <p className="text-3xl font-bold">{report.summary.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-green-700 mb-1">Bestanden</p>
                  <p className="text-3xl font-bold text-green-600">{report.summary.passed}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-yellow-700 mb-1">Warnungen</p>
                  <p className="text-3xl font-bold text-yellow-600">{report.summary.warnings}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-red-700 mb-1">Fehler</p>
                  <p className="text-3xl font-bold text-red-600">{report.summary.failed}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Status */}
          <Card className={`border ${getStatusBgColor(report.overallStatus)}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {getStatusIcon(report.overallStatus)}
                <div className="flex-1">
                  <p className={`font-semibold ${getStatusTextColor(report.overallStatus)}`}>
                    {report.overallStatus === 'passed'
                      ? 'Alle Tests bestanden'
                      : report.overallStatus === 'warning'
                      ? 'Mit Warnungen bestanden'
                      : 'Tests fehlgeschlagen'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Geprüft: {new Date(report.timestamp).toLocaleString('de-DE')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Testergebnisse</h2>

            {report.results.map((result, idx) => (
              <Card key={idx} className={`border ${getStatusBgColor(result.status)}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <CardTitle className={getStatusTextColor(result.status)}>
                        {result.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    </div>
                  </div>
                </CardHeader>

                {Object.keys(result.details).length > 0 && (
                  <CardContent>
                    {result.name === 'Entitäten' && result.details.tables && (
                      <div className="space-y-2">
                        {result.details.tables.map((table, tidx) => (
                          <div
                            key={tidx}
                            className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                          >
                            <div>
                              <p className="font-medium text-sm">{table.name}</p>
                              <p className="text-xs text-gray-500">
                                Datensätze: {table.count ?? 'N/A'}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                table.status === 'ok'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {table.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.name === 'Datenintegrität' && result.details.issues && (
                      <div>
                        {result.details.issues.length === 0 ? (
                          <p className="text-sm text-green-700">✓ Keine Probleme gefunden</p>
                        ) : (
                          <div className="space-y-2">
                            {result.details.issues.map((issue, iidx) => (
                              <div key={iidx} className="p-2 bg-white rounded border border-gray-200">
                                <div className="flex items-start gap-2">
                                  {issue.severity === 'error' ? (
                                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium capitalize">
                                      {issue.type.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xs text-gray-600">{issue.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {result.name === 'Abhängigkeiten' && result.details.dependencies && (
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(result.details.dependencies).map(([dep, available]) => (
                          <div key={dep} className="p-2 bg-white rounded border border-gray-200">
                            <p className="text-sm font-medium">{dep}</p>
                            <p
                              className={`text-xs mt-1 ${
                                available ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {available ? '✓ Verfügbar' : '✗ Nicht verfügbar'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.name === 'Row Level Security (RLS)' && (
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Policies:</span>{' '}
                          {result.details.policies}
                        </p>
                        {result.details.error && (
                          <p className="text-xs text-red-600">{result.details.error}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {!report && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-6">
              Klicken Sie auf "Integritätsprüfung starten" um die Supabase-Konfiguration zu überprüfen
            </p>
            <Button onClick={runIntegrityCheck} size="lg">
              Jetzt starten
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}