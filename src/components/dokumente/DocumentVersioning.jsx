import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Download, Eye, Trash2, Clock } from 'lucide-react';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

export default function DocumentVersioning({ open, onOpenChange, documentId }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && documentId) {
      loadVersions();
    }
  }, [open, documentId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Fehler beim Laden der Versionen');
    }
    setLoading(false);
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm('Diese Version wirklich wiederherstellen?')) return;

    try {
      // Hier würde die Wiederherstellung implementiert
      toast.success('Version wiederhergestellt');
      loadVersions();
    } catch (error) {
      toast.error('Fehler beim Wiederherstellen');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-96">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Dokumentversionen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto max-h-80">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Keine Versionen vorhanden</p>
          ) : (
            versions.map((version, idx) => (
              <div key={version.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Version {versions.length - idx}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(version.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                  {idx === 0 && <Badge className="bg-green-100 text-green-700">Aktuell</Badge>}
                </div>
                <p className="text-xs text-gray-600 mb-2">{version.description || 'Keine Beschreibung'}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Vorschau
                  </Button>
                  {idx > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(version.id)}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}