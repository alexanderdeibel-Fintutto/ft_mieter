import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, FolderOpen } from 'lucide-react';
import DocumentUploadDialog from '../components/documents/DocumentUploadDialog';
import DocumentSearchFilter from '../components/documents/DocumentSearchFilter';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentPermissionManager from '../components/documents/DocumentPermissionManager';

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [permissionManagerOpen, setPermissionManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await base44.entities.Document.list();
    setDocuments(docs || []);
    setFilteredDocuments(docs || []);
    setLoading(false);
  };

  const handleFilter = (filters) => {
    let filtered = documents;

    if (filters.search) {
      filtered = filtered.filter(doc =>
        doc.file_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.category) {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      filtered = filtered.filter(doc => new Date(doc.created_date) >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      filtered = filtered.filter(doc => new Date(doc.created_date) <= to);
    }

    setFilteredDocuments(filtered);
  };

  const handleDownload = async (doc) => {
    window.open(doc.file_url, '_blank');
  };

  const handleDelete = async (docId) => {
    if (confirm('Dokument wirklich löschen?')) {
      await base44.entities.Document.delete(docId);
      loadDocuments();
    }
  };

  const handleUploadSuccess = () => {
    loadDocuments();
  };

  const getDocumentsByCategory = (category) => {
    return filteredDocuments.filter(doc => doc.category === category);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Wird geladen...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={32} className="text-blue-600" />
              <h1 className="text-3xl font-bold">Dokumentenverwaltung</h1>
            </div>
            <Button
              onClick={() => setUploadOpen(true)}
              className="gap-2"
            >
              <Plus size={16} />
              Dokument hochladen
            </Button>
          </div>
          <p className="text-gray-600">
            Verwalten Sie alle Dokumente zentral mit Versionskontrolle und Zugriffsverwaltung
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{filteredDocuments.length}</div>
                <div className="text-sm text-gray-600">Dokumente insgesamt</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {filteredDocuments.filter(d => d.is_public).length}
                </div>
                <div className="text-sm text-gray-600">Öffentliche Dokumente</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(filteredDocuments.map(d => d.category)).size}
                </div>
                <div className="text-sm text-gray-600">Kategorien</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Dialog */}
        <DocumentUploadDialog
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Search & Filter */}
        <DocumentSearchFilter onFilter={handleFilter} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="contract">Verträge</TabsTrigger>
            <TabsTrigger value="invoice">Rechnungen</TabsTrigger>
            <TabsTrigger value="maintenance">Wartung</TabsTrigger>
            <TabsTrigger value="insurance">Versicherung</TabsTrigger>
            <TabsTrigger value="permit">Genehmigung</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredDocuments.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Keine Dokumente gefunden
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <div key={doc.id}>
                    <DocumentCard
                      document={doc}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onShare={() => {
                        setSelectedDoc(doc);
                        setPermissionManagerOpen(true);
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {['contract', 'invoice', 'maintenance', 'insurance', 'permit'].map(cat => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {getDocumentsByCategory(cat).length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Keine {cat === 'contract' ? 'Verträge' : 'Dokumente'} gefunden
                  </div>
                ) : (
                  getDocumentsByCategory(cat).map(doc => (
                    <div key={doc.id}>
                      <DocumentCard
                        document={doc}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onShare={() => {
                          setSelectedDoc(doc);
                          setPermissionManagerOpen(true);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Permission Manager Modal */}
        {permissionManagerOpen && selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="font-semibold">{selectedDoc.file_name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPermissionManagerOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <DocumentPermissionManager
                  documentId={selectedDoc.id}
                  onClose={() => setPermissionManagerOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}