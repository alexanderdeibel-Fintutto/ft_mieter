import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Link2, Calendar, Lock, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PublicShareLinkDialog({ open, onOpenChange, documentId }) {
  const [shareLink, setShareLink] = useState(null);
  const [config, setConfig] = useState({
    expires_in_days: 7,
    max_downloads: null,
    password: '',
    access_level: 'view',
  });
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateExpiringShareLink', {
        document_id: documentId,
        ...config,
      });

      setShareLink(response.data.share_link);
      toast.success('Share Link erstellt');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Erstellen');
    }
    setLoading(false);
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink.share_url);
      toast.success('Link kopiert');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Public Share Link
          </DialogTitle>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Ablauf (Tage)</label>
              <Input
                type="number"
                value={config.expires_in_days}
                onChange={(e) => setConfig({...config, expires_in_days: parseInt(e.target.value)})}
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="text-xs font-medium">Max. Downloads</label>
              <Input
                type="number"
                placeholder="Keine Limitierung"
                value={config.max_downloads || ''}
                onChange={(e) => setConfig({...config, max_downloads: e.target.value ? parseInt(e.target.value) : null})}
              />
            </div>

            <div>
              <label className="text-xs font-medium">Passwort (optional)</label>
              <Input
                type="password"
                placeholder="Passwort setzen..."
                value={config.password}
                onChange={(e) => setConfig({...config, password: e.target.value})}
              />
            </div>

            <Button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full bg-blue-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              Link erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Badge className="bg-green-100 text-green-700 mb-2">✓ Erstellt</Badge>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-700">
                    Ablauf: {new Date(shareLink.expires_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                {shareLink.max_downloads && (
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-700">
                      Downloads: 0/{shareLink.max_downloads}
                    </span>
                  </div>
                )}
                {shareLink.password_protected && (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-700">Mit Passwort geschützt</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block">Share Link</label>
              <div className="flex gap-2">
                <Input
                  value={shareLink.share_url}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button size="sm" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button onClick={() => setShareLink(null)} variant="outline" className="w-full">
              Neuer Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}