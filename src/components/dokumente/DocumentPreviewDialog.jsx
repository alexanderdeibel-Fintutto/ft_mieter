import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Download, 
    ExternalLink, 
    FileText, 
    Image as ImageIcon, 
    FileSpreadsheet,
    File,
    Calendar,
    HardDrive,
    Shield,
    Loader2,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';

function getFileIcon(fileType) {
    if (fileType?.includes('image')) return <ImageIcon className="w-6 h-6 text-green-600" />;
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
    if (fileType?.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    return <File className="w-6 h-6 text-violet-600" />;
}

function formatFileSize(bytes) {
    if (!bytes) return 'Unbekannt';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const CATEGORY_LABELS = {
    mietvertrag: { label: 'Mietvertrag', color: 'bg-blue-100 text-blue-700' },
    nebenkostenabrechnung: { label: 'Nebenkosten', color: 'bg-green-100 text-green-700' },
    protokolle: { label: 'Protokoll', color: 'bg-amber-100 text-amber-700' },
    hausordnung: { label: 'Hausordnung', color: 'bg-purple-100 text-purple-700' },
    bescheinigungen: { label: 'Bescheinigung', color: 'bg-teal-100 text-teal-700' },
    sonstige: { label: 'Sonstiges', color: 'bg-gray-100 text-gray-700' }
};

export default function DocumentPreviewDialog({ open, onOpenChange, document }) {
    const [loading, setLoading] = useState(false);

    if (!document) return null;

    const categoryInfo = CATEGORY_LABELS[document.category] || CATEGORY_LABELS.sonstige;
    const isImage = document.file_type?.includes('image');
    const isPdf = document.file_type?.includes('pdf');
    const isFromManagement = document.source === 'management';

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await fetch(document.file_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.name + (document.file_type?.includes('pdf') ? '.pdf' : '');
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            window.open(document.file_url, '_blank');
        }
        setLoading(false);
    };

    const handleOpenInNew = () => {
        window.open(document.file_url, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-3 bg-violet-100 rounded-xl">
                            {getFileIcon(document.file_type)}
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg">{document.name}</DialogTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge className={categoryInfo.color}>
                                    {categoryInfo.label}
                                </Badge>
                                {isFromManagement && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Von der Verwaltung
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Document Info */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                            {new Date(document.created_at).toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span>{formatFileSize(document.file_size)}</span>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-hidden bg-gray-50 rounded-xl min-h-[300px] flex items-center justify-center">
                    {isImage ? (
                        <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={document.file_url}
                            alt={document.name}
                            className="max-w-full max-h-[400px] object-contain rounded-lg"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={document.file_url}
                            className="w-full h-[400px] rounded-lg"
                            title={document.name}
                        />
                    ) : (
                        <div className="text-center p-8">
                            <div className="p-4 bg-white rounded-full inline-block mb-4 shadow-sm">
                                {getFileIcon(document.file_type)}
                            </div>
                            <p className="text-gray-600 mb-2">Vorschau nicht verfügbar</p>
                            <p className="text-sm text-gray-400">Klicke auf "Öffnen" um das Dokument anzuzeigen</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                    <Button 
                        onClick={handleDownload}
                        className="flex-1 bg-violet-600 hover:bg-violet-700"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Herunterladen
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={handleOpenInNew}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Öffnen
                    </Button>
                </div>

                {/* Security Notice */}
                {isFromManagement && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                        <Shield className="w-4 h-4 flex-shrink-0" />
                        <span>Dieses Dokument wurde von deiner Hausverwaltung bereitgestellt.</span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}