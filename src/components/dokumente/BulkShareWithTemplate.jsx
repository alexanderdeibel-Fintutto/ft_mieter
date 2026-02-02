import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import ShareTemplates from './ShareTemplates';

export default function BulkShareWithTemplate({ open, onOpenChange, documents = [] }) {
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
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

  const handleSelectTemplate = (config) => {
    setSelectedTemplate(config);
  };

  const handleApply = async () => {
    if (selectedDocs.size === 0) {
      toast.error('Mindestens ein Dokument auswählen');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Template auswählen');
      return;
    }

    setLoading(true);
    try {
      const docArray = Array.from(selectedDocs);
      
      // Simuliere die Anwendung des Templates auf alle Dokumente
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Template auf ${docArray.length} Dokumente angewendet`);
      setSelectedDocs(new Set());
      setSelectedTemplate(null);
      onOpenChange(false);
    } catch (error) {
      toast.error('Fehler beim Anwenden');
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Bulk Share mit Template
            </DialogTitle>
            <DialogDescription>
              Mehrere Dokumente mit einem Template teilen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template Selection */}
            {selectedTemplate ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">Template ausgewählt</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Ändern
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.isPublic && (
                    <Badge className="bg-green-100 text-green-700 text-xs">Öffentlich</Badge>
                  )}
                  {selectedTemplate.accessLevel && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      {selectedTemplate.accessLevel}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setTemplateDialogOpen(true)}
              >
                Template auswählen
              </Button>
            )}

            {/* Document Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Dokumente ({selectedDocs.size}/{documents.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={selectedDocs.has(doc.id)}
                      onCheckedChange={() => handleToggleDoc(doc.id)}
                    />
                    <span className="text-sm flex-1 truncate">{doc.name || doc.file_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                onClick={handleApply}
                disabled={loading || selectedDocs.size === 0 || !selectedTemplate}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Anwenden ({selectedDocs.size})
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <ShareTemplates
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
}