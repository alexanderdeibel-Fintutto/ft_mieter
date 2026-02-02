import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, Clock, CheckCircle, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function DocumentVersionHistory({ document, open, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [changeNotes, setChangeNotes] = useState('');

  useEffect(() => {
    if (document) {
      loadVersions();
    }
  }, [document]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const versionList = await base44.entities.DocumentVersion.filter(
        { document_id: document.id },
        '-version_number'
      );
      setVersions(versionList || []);
    } catch (error) {
      console.error('Fehler beim Laden der Versionen:', error);
      toast.error('Fehler beim Laden der Versionen');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewVersion = async () => {
    if (!newVersionFile) {
      toast.error('Bitte wählen Sie eine Datei aus');
      return;
    }

    setUploading(true);
    try {
      // Upload new file
      const uploadResult = await base44.integrations.Core.UploadFile({ file: newVersionFile });
      const fileUrl = uploadResult.file_url;

      // Get current max version
      const maxVersion = versions.length > 0 
        ? Math.max(...versions.map(v => v.version_number))
        : 0;

      // Mark all previous versions as not current
      for (const v of versions) {
        if (v.is_current) {
          await base44.entities.DocumentVersion.update(v.id, { is_current: false });
        }
      }

      // Create new version
      const user = await base44.auth.me();
      await base44.entities.DocumentVersion.create({
        document_id: document.id,
        version_number: maxVersion + 1,
        file_url: fileUrl,
        file_size: newVersionFile.size,
        uploaded_by: user.id,
        change_notes: changeNotes || 'Neue Version',
        is_current: true,
      });

      // Update main document
      await base44.entities.Document.update(document.id, {
        file_url: fileUrl,
        metadata: {
          ...document.metadata,
          file_size: newVersionFile.size,
          last_version: maxVersion + 1,
        },
      });

      toast.success('Neue Version hochgeladen');
      setNewVersionFile(null);
      setChangeNotes('');
      loadVersions();
    } catch (error) {
      console.error('Upload-Fehler:', error);
      toast.error('Fehler beim Hochladen der neuen Version');
    } finally {
      setUploading(false);
    }
  };

  const handleRestoreVersion = async (version) => {
    if (!confirm(`Version ${version.version_number} als aktuelle Version wiederherstellen?`)) {
      return;
    }

    try {
      // Mark all as not current
      for (const v of versions) {
        if (v.is_current) {
          await base44.entities.DocumentVersion.update(v.id, { is_current: false });
        }
      }

      // Mark selected as current
      await base44.entities.DocumentVersion.update(version.id, { is_current: true });

      // Update main document
      await base44.entities.Document.update(document.id, {
        file_url: version.file_url,
      });

      toast.success(`Version ${version.version_number} wiederhergestellt`);
      loadVersions();
    } catch (error) {
      console.error('Restore-Fehler:', error);
      toast.error('Fehler beim Wiederherstellen');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Versionsverlauf - {document?.file_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload New Version */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Neue Version hochladen</h3>
            <div className="space-y-3">
              <div>
                {!newVersionFile ? (
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="mt-1 text-sm text-gray-600">Datei auswählen</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setNewVersionFile(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">{newVersionFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewVersionFile(null)}
                    >
                      Entfernen
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label>Änderungsnotizen</Label>
                <Textarea
                  placeholder="Was wurde geändert?"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                onClick={handleUploadNewVersion}
                disabled={!newVersionFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Version hochladen
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Version List */}
          <div>
            <h3 className="font-semibold mb-3">Alle Versionen</h3>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : versions.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Keine Versionen vorhanden</p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 ${
                      version.is_current ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={version.is_current ? 'default' : 'outline'}>
                            Version {version.version_number}
                          </Badge>
                          {version.is_current && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aktuell
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(new Date(version.created_date), 'dd.MM.yyyy HH:mm', { locale: de })}
                            </span>
                          </div>
                          {version.file_size && (
                            <div>
                              Größe: {(version.file_size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          )}
                          {version.change_notes && (
                            <div className="mt-2 text-gray-700">
                              <strong>Änderungen:</strong> {version.change_notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(version.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {!version.is_current && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreVersion(version)}
                          >
                            Wiederherstellen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}