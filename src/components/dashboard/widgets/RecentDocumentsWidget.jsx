import React from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function RecentDocumentsWidget() {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['recent_documents'],
    queryFn: async () => {
      const result = await base44.entities.Document.filter({}, '-created_date', 5);
      return result || [];
    }
  });

  const getCategoryIcon = (category) => {
    const icons = {
      contract: '📋',
      invoice: '💳',
      insurance: '🛡️',
      maintenance: '🔧',
      permit: '📜',
      other: '📄'
    };
    return icons[category] || '📄';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Kürzlich hochgeladene Dokumente
        </h3>
        <FileText className="w-5 h-5 text-purple-500" />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-gray-500">Lädt...</div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500">Keine Dokumente vorhanden</p>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getCategoryIcon(doc.category)} {doc.file_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(doc.created_date).toLocaleDateString('de-DE')}
                </p>
              </div>
              <button
                onClick={() => window.open(doc.file_url, '_blank')}
                className="ml-2 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Herunterladen"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}