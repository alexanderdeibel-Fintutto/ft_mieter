import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Trash2, Clock, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function DocumentListView({ 
  documents, 
  onRefresh, 
  onViewVersions,
  categoryLabels,
  entityTypeLabels,
  entityIcons 
}) {
  const [deleting, setDeleting] = useState({});

  const handleDownload = (doc) => {
    window.open(doc.file_url, '_blank');
  };

  const handleDelete = async (docId) => {
    if (!confirm('Möchten Sie dieses Dokument wirklich löschen?')) return;

    setDeleting(prev => ({ ...prev, [docId]: true }));
    try {
      await base44.entities.Document.delete(docId);
      toast.success('Dokument gelöscht');
      onRefresh?.();
    } catch (error) {
      toast.error('Fehler beim Löschen');
      console.error(error);
    } finally {
      setDeleting(prev => ({ ...prev, [docId]: false }));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      contract: 'bg-blue-100 text-blue-800',
      invoice: 'bg-green-100 text-green-800',
      insurance: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-orange-100 text-orange-800',
      permit: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Keine Dokumente gefunden</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const EntityIcon = entityIcons[doc.entity_type] || FileText;
        
        return (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{doc.file_name}</h3>
                      <Badge className={getCategoryColor(doc.category)}>
                        {categoryLabels[doc.category]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <EntityIcon className="w-4 h-4" />
                        <span>{entityTypeLabels[doc.entity_type]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(doc.created_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                      {doc.metadata?.file_size && (
                        <span>
                          {(doc.metadata.file_size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onViewVersions?.(doc)}>
                    <Clock className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(doc)}>
                        <Download className="w-4 h-4 mr-2" />
                        Herunterladen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewVersions?.(doc)}>
                        <Clock className="w-4 h-4 mr-2" />
                        Versionen
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600"
                        disabled={deleting[doc.id]}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}