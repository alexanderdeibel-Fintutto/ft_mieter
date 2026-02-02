import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborationPanel({ documentId, organizationId, onVersionRestore }) {
    const [collaborators, setCollaborators] = useState([]);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('collaborators');

    useEffect(() => {
        loadCollaborationData();
        // Poll every 3 seconds for updates
        const interval = setInterval(loadCollaborationData, 3000);
        return () => clearInterval(interval);
    }, [documentId, organizationId]);

    const loadCollaborationData = async () => {
        try {
            setLoading(true);
            const [collabRes, versionsRes] = await Promise.all([
                base44.functions.invoke('collaborateOnDocument', {
                    action: 'get_collaborators',
                    document_id: documentId,
                    organization_id: organizationId
                }),
                base44.functions.invoke('collaborateOnDocument', {
                    action: 'get_versions',
                    document_id: documentId,
                    organization_id: organizationId
                })
            ]);

            setCollaborators(collabRes.data.collaborators || []);
            setVersions(versionsRes.data.versions || []);
        } catch (error) {
            console.error('Load collaboration data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreVersion = async (version) => {
        if (!confirm(`Version ${version.version_number} wiederherstellen?`)) return;

        try {
            onVersionRestore(version);
            toast.success('Version wiederhergestellt');
        } catch (error) {
            console.error('Restore error:', error);
            toast.error('Fehler beim Wiederherstellen');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Zusammenarbeit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab('collaborators')}
                        className={`pb-2 px-2 text-sm font-medium transition-colors ${
                            activeTab === 'collaborators'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-1" />
                        Mitwirkende
                    </button>
                    <button
                        onClick={() => setActiveTab('versions')}
                        className={`pb-2 px-2 text-sm font-medium transition-colors ${
                            activeTab === 'versions'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Clock className="w-4 h-4 inline mr-1" />
                        Versionen
                    </button>
                </div>

                {/* Collaborators Tab */}
                {activeTab === 'collaborators' && (
                    <div className="space-y-3">
                        {collaborators.length > 0 ? (
                            collaborators.map(collab => (
                                <div key={collab.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: collab.color }}
                                        title={collab.status}
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            {collab.editor_id}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Cursor: {collab.cursor_position || 0}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {collab.status === 'editing' ? 'Editiert' : 'Angeschaut'}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                Keine anderen Mitwirkenden
                            </div>
                        )}
                    </div>
                )}

                {/* Versions Tab */}
                {activeTab === 'versions' && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {versions.length > 0 ? (
                            versions.map(version => (
                                <div key={version.id} className="p-2 rounded border hover:bg-blue-50 transition-colors">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div>
                                            <div className="text-sm font-medium">
                                                Version {version.version_number}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {formatDate(version.created_at)}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRestoreVersion(version)}
                                            title="Diese Version wiederherstellen"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    {version.change_description && (
                                        <div className="text-xs text-gray-700 bg-gray-50 p-1 rounded">
                                            {version.change_description}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                Keine Versionen
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}