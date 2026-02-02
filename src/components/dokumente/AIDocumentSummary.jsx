import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function AIDocumentSummary({ documentId, fileName }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateDocumentSummary', {
        document_id: documentId,
        document_name: fileName,
      });

      setSummary(response.data.summary);
      toast.success('Zusammenfassung generiert');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Generieren');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          AI-Zusammenfassung
        </h4>
      </div>

      {summary ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-700">{summary}</p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(summary);
              toast.success('Kopiert');
            }}
          >
            <Copy className="w-3 h-3 mr-1" />
            Kopieren
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          onClick={handleGenerateSummary}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 mr-1" />
          )}
          Zusammenfassung generieren
        </Button>
      )}
    </div>
  );
}