import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function DownloadLimitSettings({ open, onOpenChange, onSave }) {
  const [limitDownloads, setLimitDownloads] = useState(false);
  const [downloadLimit, setDownloadLimit] = useState('1');
  const [expirationDays, setExpirationDays] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        limitDownloads,
        downloadLimit: limitDownloads ? parseInt(downloadLimit) : null,
        expirationDays: parseInt(expirationDays),
      });

      onOpenChange(false);
      toast.success('Download-Limits gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download-Limits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Checkbox
              checked={limitDownloads}
              onCheckedChange={setLimitDownloads}
            />
            <label className="text-sm font-medium text-gray-700">
              Anzahl der Downloads begrenzen
            </label>
          </div>

          {limitDownloads && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Maximale Downloads
              </label>
              <Select value={downloadLimit} onValueChange={setDownloadLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x Download</SelectItem>
                  <SelectItem value="3">3x Downloads</SelectItem>
                  <SelectItem value="5">5x Downloads</SelectItem>
                  <SelectItem value="10">10x Downloads</SelectItem>
                  <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Automatische Ablauf (Tage)
            </label>
            <Select value={expirationDays} onValueChange={setExpirationDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Tag</SelectItem>
                <SelectItem value="7">7 Tage</SelectItem>
                <SelectItem value="30">30 Tage</SelectItem>
                <SelectItem value="90">90 Tage</SelectItem>
                <SelectItem value="365">1 Jahr</SelectItem>
                <SelectItem value="never">Niemals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
            ℹ️ Nach dem Ablauf wird die Freigabe automatisch widerrufen
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Speichern
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}