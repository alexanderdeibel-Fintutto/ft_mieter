import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabase';

export default function BatchShareDialog({ open, onOpenChange, documents, onSuccess }) {
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [action, setAction] = useState('revoke'); // revoke, share
  const [accessLevel, setAccessLevel] = useState('view');
  const [loading, setLoading] = useState(false);

  const handleToggleDoc = (docId) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleBatchRevoke = async () => {
    if (selectedDocs.size === 0) {
      toast.error('Keine Dokumente ausgewählt');
      return;
    }

    setLoading(true);
    try {
      const docArray = Array.from(selectedDocs);
      
      // Alle Shares für diese Dokumente löschen
      const { error } = await supabase
        .from('document_shares')
        .delete()
        .in('document_id', docArray);

      if (error) throw error;

      toast.success(`${docArray.length} Freigaben widerrufen`);
      setSelectedDocs(new Set());
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error revoking shares:', error);
      toast.error('Fehler beim Widerrufen');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Freigaben verwalten</DialogTitle>
          <DialogDescription>
            Mehrere Dokumente gleichzeitig freigeben oder Freigabe widerrufen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Aktion</label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revoke">Freigaben widerrufen</SelectItem>
                <SelectItem value="share">Freigaben erstellen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Dokumente ({selectedDocs.size}/{documents.length})
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedDocs.has(doc.id)}
                    onCheckedChange={() => handleToggleDoc(doc.id)}
                  />
                  <span className="text-sm flex-1 truncate">{doc.name || doc.file_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Access Level (für Share-Aktion) */}
          {action === 'share' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Zugriffslevel</label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Nur ansehen</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="edit">Bearbeitung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {action === 'revoke' ? (
              <>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleBatchRevoke}
                  disabled={loading || selectedDocs.size === 0}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Widerrufen ({selectedDocs.size})
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading || selectedDocs.size === 0}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Teilen ({selectedDocs.size})
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}