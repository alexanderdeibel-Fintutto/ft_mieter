import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LeaseDetailsSection() {
  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => await base44.auth.me()
  });

  const { data: leases = [], isLoading: leasesLoading } = useQuery({
    queryKey: ['my_leases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await base44.entities.Lease.filter({
        tenant_id: user.id,
        status: 'active'
      });
      return result || [];
    },
    enabled: !!user?.id
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['lease_documents'],
    queryFn: async () => {
      if (!leases.length) return [];
      const result = await base44.entities.Document.filter({
        entity_type: 'lease',
        category: 'contract'
      }, '-created_date', 20);
      return result || [];
    },
    enabled: leases.length > 0
  });

  const isLoading = leasesLoading || docsLoading;

  if (isLoading) {
    return <div className="text-center py-8">Lädt...</div>;
  }

  if (!leases || leases.length === 0) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-blue-900 dark:text-blue-300">
            Keine aktiven Mietverträge gefunden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {leases.map(lease => (
        <Card key={lease.id} className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Mietvertrag Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lease Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Monatliche Miete</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{lease.rent_amount?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Kaution</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{lease.deposit_amount?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Mietbeginn</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(lease.start_date).toLocaleDateString('de-DE')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Nebenkosten</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lease.utilities_included ? '✓ Enthalten' : '✗ Nicht enthalten'}
                </p>
              </div>
            </div>

            {/* Documents Section */}
            {documents.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Wichtige Dokumente
                </h3>
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(doc.created_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Herunterladen
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}