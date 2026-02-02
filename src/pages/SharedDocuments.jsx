import React, { useState, useEffect } from 'react';
import { Share2, Download, Eye, Building, Users, Calendar, Lock, Loader2, Search, Filter, X, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import DocumentPreviewDialog from '../components/dokumente/DocumentPreviewDialog';
import PaginatedSharedDocuments from '../components/dokumente/PaginatedSharedDocuments';
import ShareAnalyticsDashboard from '../components/dokumente/ShareAnalyticsDashboard';
import BatchShareDialog from '../components/dokumente/BatchShareDialog';
import { useShareNotifications } from '../components/dokumente/ShareNotifications';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ACCESS_LEVEL_COLORS = {
  view: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Ansicht' },
  download: { bg: 'bg-green-50', text: 'text-green-700', label: 'Download' },
  edit: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Bearbeitung' },
};

function SharedDocumentCard({ share, onPreview, onRevoke }) {
  const doc = share.documents;
  const accessLevel = ACCESS_LEVEL_COLORS[share.access_level] || ACCESS_LEVEL_COLORS.view;
  const isExpired = share.expires_at && new Date(share.expires_at) < new Date();

  if (isExpired) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-100 rounded-lg">
          <Share2 className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{doc?.title || doc?.file_name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            {doc?.buildings?.name && (
              <>
                <Building className="w-3 h-3" />
                <span>{doc.buildings.name}</span>
              </>
            )}
            {doc?.created_at && (
              <>
                <Calendar className="w-3 h-3" />
                <span>{new Date(doc.created_at).toLocaleDateString('de-DE')}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${accessLevel.bg} ${accessLevel.text}`}>
            {accessLevel.label}
          </Badge>
          {share.expires_at && (
            <Badge variant="outline" className="text-xs">
              Läuft ab: {new Date(share.expires_at).toLocaleDateString('de-DE')}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(doc)}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ansehen
        </Button>
        {share.access_level === 'download' && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(share.id)}
          className="text-red-500 hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function SharedDocuments() {
  const { user, loading: authLoading } = useAuth();
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [filterApp, setFilterApp] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('received');
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [analyticsDoc, setAnalyticsDoc] = useState(null);

  useShareNotifications(user?.id);

  useEffect(() => {
    if (!authLoading && user) {
      loadSharedDocuments();
    }
  }, [user, authLoading]);

  const loadSharedDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_shares')
        .select(`
          id,
          access_level,
          expires_at,
          shared_by,
          created_at,
          documents (
            id,
            title,
            file_name,
            file_url,
            document_type,
            file_type,
            file_size,
            created_at,
            buildings (name),
            units (unit_number)
          )
        `)
        .eq('shared_with_user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharedDocs(data || []);
    } catch (error) {
      console.error('Error loading shared documents:', error);
      toast.error('Fehler beim Laden von geteilten Dokumenten');
    }
    setLoading(false);
  };

  const handleRevoke = async (shareId) => {
    if (!window.confirm('Freigabe wirklich entfernen?')) return;

    try {
      const { error } = await supabase
        .from('document_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      setSharedDocs(prev => prev.filter(s => s.id !== shareId));
      toast.success('Freigabe entfernt');
    } catch (error) {
      console.error('Error revoking share:', error);
      toast.error('Fehler beim Entfernen der Freigabe');
    }
  };

  const filteredDocs = sharedDocs.filter(share => {
    const doc = share.documents;
    const matchSearch = !searchTerm ||
      (doc?.title || doc?.file_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchApp = filterApp === 'all' || doc?.document_type === filterApp;
    return matchSearch && matchApp;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Geteilte Dokumente</h1>
              <p className="text-xs text-gray-500">Von anderen Apps gemeinsam genutzt</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Dokumente suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterApp} onValueChange={setFilterApp}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Apps</SelectItem>
                  <SelectItem value="mietvertrag">Mietverträge</SelectItem>
                  <SelectItem value="nebenkostenabrechnung">NK-Abrechnungen</SelectItem>
                  <SelectItem value="kuendigung">Kündigungen</SelectItem>
                  <SelectItem value="rechnung">Rechnungen</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBatchDialogOpen(true)}
                disabled={filteredDocs.length === 0}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start px-4 h-12 bg-transparent">
            <TabsTrigger value="received" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Erhalten ({filteredDocs.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Statistik
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="p-4">
        {activeTab === 'stats' ? (
          analyticsDoc ? (
            <ShareAnalyticsDashboard documentId={analyticsDoc.id} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Wähle ein Dokument um Statistiken zu sehen</p>
            </div>
          )
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Share2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Keine geteilten Dokumente</p>
            <p className="text-sm">Dokumente werden hier angezeigt, wenn Nutzer von anderen Apps sie mit dir teilen</p>
          </div>
        ) : (
          <PaginatedSharedDocuments
            documents={filteredDocs}
            renderItem={(share) => (
              <div key={share.id} className="flex items-center gap-2">
                <SharedDocumentCard
                  share={share}
                  onPreview={setPreviewDoc}
                  onRevoke={handleRevoke}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setAnalyticsDoc(share.documents)}>
                      Statistiken
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRevoke(share.id)} className="text-red-600">
                      Entfernen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          />
        )}
      </div>

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        document={previewDoc}
      />

      {/* Batch Share Dialog */}
      <BatchShareDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        documents={filteredDocs.map(s => s.documents)}
        onSuccess={loadSharedDocuments}
      />
    </div>
  );
}