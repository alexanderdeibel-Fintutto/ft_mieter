import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { File, Download, Eye, Trash2, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function DocumentList({ 
    organizationId, 
    entityType, 
    entityId,
    showSearch = true
}) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadDocuments();
    }, [organizationId, entityType, entityId]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('getDocuments', {
                organization_id: organizationId,
                entity_type: entityType,
                entity_id: entityId,
                search_query: searchQuery
            });
            setDocuments(response.data.documents);
        } catch (error) {
            console.error('Load documents error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadDocuments();
    };

    const handleDownload = async (doc) => {
        window.open(doc.file_url, '_blank');
    };

    const categoryColors = {
        contract: 'bg-blue-100 text-blue-800',
        invoice: 'bg-green-100 text-green-800',
        insurance: 'bg-purple-100 text-purple-800',
        maintenance: 'bg-orange-100 text-orange-800',
        permit: 'bg-yellow-100 text-yellow-800',
        other: 'bg-gray-100 text-gray-800'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showSearch && (
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Dokumente durchsuchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSearch}>
                        Suchen
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                {documents.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Dokumente gefunden
                        </CardContent>
                    </Card>
                ) : (
                    documents.map(doc => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <File className="w-5 h-5 text-blue-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">
                                                    {doc.file_name}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Hochgeladen von {doc.uploader_name} • {' '}
                                                    {format(new Date(doc.created_date), 'dd.MM.yyyy', { locale: de })}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDownload(doc)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <Badge className={categoryColors[doc.category]}>
                                                {doc.category}
                                            </Badge>
                                            {doc.tags?.map(tag => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}