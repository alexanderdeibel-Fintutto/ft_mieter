import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, Download, Eye, Folder, ChevronRight, Loader2, Upload, Plus, X, 
    File, Image, FileSpreadsheet, Shield, Lock, Share2, FolderPlus, MoreVertical,
    Users, Building, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useFeatureLimits } from '../components/featuregate/useFeatureLimits';
import DocumentUploadLimitBanner from '../components/featuregate/DocumentUploadLimitBanner';
import DocumentPreviewDialog from '../components/dokumente/DocumentPreviewDialog';
import { FolderList, CreateFolderDialog } from '../components/dokumente/FolderManagement';
import DocumentShareDialog from '../components/dokumente/DocumentShareDialog';
import AdvancedDocumentSearch from '../components/dokumente/AdvancedDocumentSearch';
import AdvancedDocumentFilter from '../components/dokumente/AdvancedDocumentFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppNotifications } from '../components/notifications/useAppNotifications';
import { UpgradeModal } from '@/components/integrations/stripe';

const DOCUMENT_CATEGORIES = [
    { id: 'mietvertrag', label: '📄 Mietvertrag', icon: FileText, description: 'Mietverträge und Nachträge' },
    { id: 'nebenkostenabrechnung', label: '📊 Nebenkostenabrechnungen', icon: FileText, description: 'Jährliche Abrechnungen' },
    { id: 'protokolle', label: '📋 Übergabeprotokolle', icon: FileText, description: 'Ein- und Auszugsprotokolle' },
    { id: 'hausordnung', label: '🏠 Hausordnung', icon: FileText, description: 'Regeln und Ordnungen' },
    { id: 'bescheinigungen', label: '📝 Bescheinigungen', icon: FileText, description: 'Mietbescheinigungen, Wohnungsgeberbestätigung' },
    { id: 'sonstige', label: '📁 Sonstige Dokumente', icon: Folder, description: 'Weitere Unterlagen' },
];

const DEMO_FOLDERS = [
    { id: 'folder-1', name: 'Baupläne', color: 'blue' },
    { id: 'folder-2', name: 'Versicherungen', color: 'green' },
    { id: 'folder-3', name: 'Wartungsprotokolle', color: 'amber' },
];

function getFileIcon(fileType) {
    if (fileType?.includes('image')) return <Image className="w-5 h-5 text-green-600" />;
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-violet-600" />;
}

function getFileIconBg(fileType) {
    if (fileType?.includes('image')) return 'bg-green-100';
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return 'bg-emerald-100';
    if (fileType?.includes('pdf')) return 'bg-red-100';
    return 'bg-violet-100';
}

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function DocumentCard({ doc, onDelete, onPreview, onShare, isAdmin }) {
    const isFromManagement = doc.source === 'management';
    const hasSharing = doc.shared_with && (doc.shared_with.type !== 'none');

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-violet-200 transition-all"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getFileIconBg(doc.file_type)} cursor-pointer`} onClick={() => onPreview(doc)}>
                    {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPreview(doc)}>
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                        {isFromManagement && (
                            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" title="Von der Verwaltung" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{new Date(doc.created_at).toLocaleDateString('de-DE')}</span>
                        {doc.file_size && <span>• {formatFileSize(doc.file_size)}</span>}
                        {hasSharing && (
                            <Badge variant="outline" className="text-xs h-5 gap-1 bg-blue-50 text-blue-700 border-blue-200">
                                <Share2 className="w-3 h-3" />
                                {doc.shared_with.type === 'all' ? 'Geteilt: Alle' : 
                                 doc.shared_with.type === 'apartments' ? `Geteilt: ${doc.shared_with.apartments?.length} Wohnungen` :
                                 `Geteilt: ${doc.shared_with.tenants?.length} Mieter`}
                            </Badge>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onPreview(doc)} 
                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    
                    {isAdmin && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onShare(doc)}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Freigeben
                                </DropdownMenuItem>
                                {!isFromManagement && (
                                    <DropdownMenuItem 
                                        onClick={() => onDelete(doc)}
                                        className="text-red-600"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Löschen
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    
                    {!isAdmin && onDelete && !isFromManagement && (
                        <button 
                            onClick={() => onDelete(doc)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function FolderSection({ folder, documents, onPreview, onDelete, onShare, isAdmin }) {
    const [expanded, setExpanded] = useState(true);
    const folderDocs = documents.filter(d => d.folder_id === folder.id);

    if (folderDocs.length === 0) return null;

    const colorClasses = {
        violet: 'bg-violet-100 text-violet-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        amber: 'bg-amber-100 text-amber-600',
        red: 'bg-red-100 text-red-600',
        pink: 'bg-pink-100 text-pink-600',
    };

    return (
        <div className="mb-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[folder.color] || colorClasses.violet}`}>
                        <Folder className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900">{folder.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                        {folderDocs.length}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </div>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2"
                    >
                        {folderDocs.map(doc => (
                            <DocumentCard 
                                key={doc.id} 
                                doc={doc} 
                                onDelete={onDelete} 
                                onPreview={onPreview}
                                onShare={onShare}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CategorySection({ category, documents, onDelete, onPreview, onShare, isAdmin }) {
    const [expanded, setExpanded] = useState(true);
    const categoryDocs = documents.filter(d => d.category === category.id && !d.folder_id);

    if (categoryDocs.length === 0) return null;

    return (
        <div className="mb-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
                <div className="text-left">
                    <span className="font-medium text-gray-900">{category.label}</span>
                    {category.description && (
                        <p className="text-xs text-gray-500">{category.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                        {categoryDocs.length}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </div>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2"
                    >
                        {categoryDocs.map(doc => (
                            <DocumentCard 
                                key={doc.id} 
                                doc={doc} 
                                onDelete={doc.source !== 'management' ? onDelete : null} 
                                onPreview={onPreview}
                                onShare={onShare}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Dokumente() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { usage: docCount, remaining, allowed } = useFeatureLimits('documentUpload');
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [folders, setFolders] = useState(DEMO_FOLDERS);
    const [loading, setLoading] = useState(true);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({ name: '', category: 'sonstige', folder_id: '', file: null });
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('all');
    const [previewDoc, setPreviewDoc] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [shareDialogDoc, setShareDialogDoc] = useState(null);
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isAdmin = user?.email?.includes('admin') || user?.role === 'admin';
    const { notifyNewDocument } = useAppNotifications();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
            return;
        }
        if (user) loadDocuments();
    }, [user, authLoading]);

    const loadDocuments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tenant_documents')
            .select('*')
            .eq('tenant_id', user.id)
            .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
            setDocuments(data);
            setFilteredDocuments(data);
        } else {
            const demoData = [
                { id: 'demo-1', name: 'Mietvertrag 2023', category: 'mietvertrag', file_type: 'application/pdf', file_size: 245000, created_at: '2023-06-01', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', shared_with: { type: 'all' } },
                { id: 'demo-2', name: 'Nebenkostenabrechnung 2023', category: 'nebenkostenabrechnung', file_type: 'application/pdf', file_size: 128000, created_at: '2024-03-15', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', shared_with: { type: 'all' } },
                { id: 'demo-3', name: 'Übergabeprotokoll Einzug', category: 'protokolle', file_type: 'application/pdf', file_size: 89000, created_at: '2023-06-01', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', shared_with: { type: 'tenants', tenants: ['tenant-1'] } },
                { id: 'demo-4', name: 'Hausordnung', category: 'hausordnung', file_type: 'application/pdf', file_size: 156000, created_at: '2023-01-15', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', shared_with: { type: 'all' } },
                { id: 'demo-5', name: 'Gebäudeplan EG', category: 'sonstige', file_type: 'application/pdf', file_size: 890000, created_at: '2023-01-15', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', folder_id: 'folder-1', shared_with: { type: 'all' } },
                { id: 'demo-6', name: 'Gebäudeplan 1.OG', category: 'sonstige', file_type: 'application/pdf', file_size: 920000, created_at: '2023-01-15', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', folder_id: 'folder-1', shared_with: { type: 'all' } },
                { id: 'demo-7', name: 'Gebäudeversicherung 2024', category: 'sonstige', file_type: 'application/pdf', file_size: 156000, created_at: '2024-01-01', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', folder_id: 'folder-2', shared_with: { type: 'all' } },
                { id: 'demo-8', name: 'Heizungswartung 01/2024', category: 'sonstige', file_type: 'application/pdf', file_size: 67000, created_at: '2024-01-10', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'management', folder_id: 'folder-3', shared_with: { type: 'apartments', apartments: ['apt-1', 'apt-2'] } },
                { id: 'demo-9', name: 'Meine Versicherungspolice', category: 'sonstige', file_type: 'application/pdf', file_size: 67000, created_at: '2024-01-10', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', source: 'user' },
            ];
            setDocuments(demoData);
            setFilteredDocuments(demoData);
        }
        setLoading(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadForm(prev => ({ 
                ...prev, 
                file, 
                name: prev.name || file.name.replace(/\.[^/.]+$/, '') 
            }));
        }
    };

    const handleUpload = async () => {
        if (!allowed) {
            setShowUpgradeModal(true);
            return;
        }

        if (!uploadForm.file || !uploadForm.name) {
            toast.error('Bitte fülle alle Felder aus');
            return;
        }

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadForm.file });
            const { error } = await supabase.from('tenant_documents').insert({
                tenant_id: user.id,
                name: uploadForm.name,
                category: uploadForm.category,
                folder_id: uploadForm.folder_id || null,
                file_url: file_url,
                file_type: uploadForm.file.type,
                file_size: uploadForm.file.size,
                source: isAdmin ? 'management' : 'user',
            });

            if (error) throw error;

            toast.success('Dokument erfolgreich hochgeladen');
            setUploadDialogOpen(false);
            setUploadForm({ name: '', category: 'sonstige', folder_id: '', file: null });
            
            // Notify tenants if admin uploads a document
            if (isAdmin) {
                notifyNewDocument({ id: Date.now(), name: uploadForm.name });
            }
            
            loadDocuments();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Fehler beim Hochladen');
        }
        setUploading(false);
    };

    const handleDelete = async (doc) => {
        if (doc.id.startsWith('demo-')) {
            setDocuments(prev => prev.filter(d => d.id !== doc.id));
            toast.success('Dokument gelöscht');
            return;
        }

        const { error } = await supabase.from('tenant_documents').delete().eq('id', doc.id);
        if (error) {
            toast.error('Fehler beim Löschen');
        } else {
            toast.success('Dokument gelöscht');
            loadDocuments();
        }
    };

    const handleCreateFolder = (folder) => {
        const newFolder = { id: `folder-${Date.now()}`, ...folder };
        setFolders(prev => [...prev, newFolder]);
        toast.success('Ordner erstellt');
    };

    const handleDeleteFolder = (folder) => {
        setFolders(prev => prev.filter(f => f.id !== folder.id));
        setDocuments(prev => prev.map(d => d.folder_id === folder.id ? { ...d, folder_id: null } : d));
        if (selectedFolder?.id === folder.id) setSelectedFolder(null);
        toast.success('Ordner gelöscht');
    };

    const handleShareDocument = (docId, shareConfig) => {
        setDocuments(prev => prev.map(d => 
            d.id === docId ? { ...d, shared_with: shareConfig } : d
        ));
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    const managementDocs = filteredDocuments.filter(d => d.source === 'management');
    const userDocs = filteredDocuments.filter(d => d.source !== 'management');
    
    const displayDocs = activeTab === 'all' 
        ? filteredDocuments 
        : activeTab === 'management' 
            ? managementDocs 
            : activeTab === 'my'
            ? userDocs
            : [];
    
    const folderFilteredDocs = selectedFolder 
        ? displayDocs.filter(d => d.folder_id === selectedFolder.id)
        : displayDocs;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <FileText className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Dokumente</h1>
                            <p className="text-xs text-gray-500">{documents.length} Dokumente</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <Button 
                                variant="outline"
                                onClick={() => setCreateFolderOpen(true)}
                                size="sm"
                            >
                                <FolderPlus className="w-4 h-4 mr-1" /> Ordner
                            </Button>
                        )}
                        <Button 
                            onClick={() => setUploadDialogOpen(true)}
                            className="bg-violet-600 hover:bg-violet-700"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Hochladen
                        </Button>
                    </div>
                </div>

                {/* Advanced Search & Filter */}
                <div className="px-4 pb-3 space-y-3">
                    <AdvancedDocumentFilter 
                        onFilterChange={(filters) => {
                            const filtered = documents.filter(doc => {
                                const matchSearch = !filters.search || doc.name.toLowerCase().includes(filters.search.toLowerCase());
                                const matchCategory = filters.category === 'Alle' || doc.category === filters.category;
                                const matchType = filters.fileType === 'Alle' || doc.file_type?.includes(filters.fileType.toLowerCase());
                                const matchDate = (!filters.dateFrom || new Date(doc.created_at) >= new Date(filters.dateFrom)) &&
                                                 (!filters.dateTo || new Date(doc.created_at) <= new Date(filters.dateTo));
                                return matchSearch && matchCategory && matchType && matchDate;
                            });
                            setFilteredDocuments(filtered);
                        }}
                        totalDocuments={documents.length}
                    />
                    <AdvancedDocumentSearch
                        documents={documents}
                        onFilteredDocuments={setFilteredDocuments}
                        categories={DOCUMENT_CATEGORIES}
                        folders={folders}
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start px-4 h-12 bg-transparent">
                        <TabsTrigger value="all" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Alle ({filteredDocuments.length})
                        </TabsTrigger>
                        <TabsTrigger value="management" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            <Shield className="w-3 h-3 mr-1" />
                            Verwaltung ({managementDocs.length})
                        </TabsTrigger>
                        <TabsTrigger value="my" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Meine ({userDocs.length})
                        </TabsTrigger>
                        <TabsTrigger value="shared" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                            <Share2 className="w-3 h-3 mr-1" />
                            Geteilt
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            <div className="p-4">
                {/* Feature Gate Banner */}
                {!allowed && (
                    <DocumentUploadLimitBanner
                        currentCount={docCount}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                    />
                )}

                {allowed && remaining > 0 && remaining < 3 && (
                    <DocumentUploadLimitBanner
                        currentCount={docCount}
                        isWarning={true}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                    />
                )}

                {/* Security Notice */}
                {activeTab === 'management' && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mb-4 text-sm text-blue-700">
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>Diese Dokumente wurden von deiner Hausverwaltung bereitgestellt.</span>
                    </div>
                )}

                {/* Folder List (horizontal scroll on mobile) */}
                {folders.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Ordner</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedFolder(null)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 transition-all ${
                                    !selectedFolder 
                                        ? 'bg-violet-50 border-violet-300' 
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Alle</span>
                                </div>
                            </button>
                            {folders.map(folder => {
                                const docCount = displayDocs.filter(d => d.folder_id === folder.id).length;
                                return (
                                    <button
                                        key={folder.id}
                                        onClick={() => setSelectedFolder(selectedFolder?.id === folder.id ? null : folder)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 transition-all ${
                                            selectedFolder?.id === folder.id 
                                                ? 'bg-violet-50 border-violet-300' 
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Folder className={`w-4 h-4 text-${folder.color}-500`} />
                                            <span className="text-sm font-medium">{folder.name}</span>
                                            <Badge variant="secondary" className="text-xs">{docCount}</Badge>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Documents */}
                {folderFilteredDocs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Keine Dokumente gefunden</p>
                        <p className="text-sm mb-4">
                            {selectedFolder ? 'Dieser Ordner ist leer.' : 'Lade dein erstes Dokument hoch.'}
                        </p>
                        <Button onClick={() => setUploadDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                            <Upload className="w-4 h-4 mr-2" /> Dokument hochladen
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Folder Sections */}
                        {!selectedFolder && folders.map(folder => (
                            <FolderSection
                                key={folder.id}
                                folder={folder}
                                documents={displayDocs}
                                onPreview={setPreviewDoc}
                                onDelete={handleDelete}
                                onShare={setShareDialogDoc}
                                isAdmin={isAdmin}
                            />
                        ))}

                        {/* Category Sections for non-folder docs */}
                        {selectedFolder ? (
                            <div className="space-y-2">
                                {folderFilteredDocs.map(doc => (
                                    <DocumentCard
                                        key={doc.id}
                                        doc={doc}
                                        onDelete={doc.source !== 'management' ? handleDelete : null}
                                        onPreview={setPreviewDoc}
                                        onShare={setShareDialogDoc}
                                        isAdmin={isAdmin}
                                    />
                                ))}
                            </div>
                        ) : (
                            DOCUMENT_CATEGORIES.map(cat => (
                                <CategorySection 
                                    key={cat.id} 
                                    category={cat} 
                                    documents={displayDocs}
                                    onDelete={handleDelete}
                                    onPreview={setPreviewDoc}
                                    onShare={setShareDialogDoc}
                                    isAdmin={isAdmin}
                                />
                            ))
                        )}
                    </>
                )}
            </div>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Dokument hochladen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                uploadForm.file ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {uploadForm.file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className={`p-2 rounded-lg ${getFileIconBg(uploadForm.file.type)}`}>
                                        {getFileIcon(uploadForm.file.type)}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{uploadForm.file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(uploadForm.file.size)}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setUploadForm(prev => ({ ...prev, file: null })); }}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">Klicke oder ziehe eine Datei hierher</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, Bilder, Excel bis 10MB</p>
                                </>
                            )}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
                                onChange={handleFileSelect}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Dokumentname</label>
                            <Input 
                                value={uploadForm.name}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="z.B. Mietvertrag 2024"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Kategorie</label>
                            <Select value={uploadForm.category} onValueChange={(v) => setUploadForm(prev => ({ ...prev, category: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isAdmin && folders.length > 0 && (
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Ordner (optional)</label>
                                <Select value={uploadForm.folder_id} onValueChange={(v) => setUploadForm(prev => ({ ...prev, folder_id: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kein Ordner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null}>Kein Ordner</SelectItem>
                                        {folders.map(folder => (
                                            <SelectItem key={folder.id} value={folder.id}>
                                                <div className="flex items-center gap-2">
                                                    <Folder className={`w-4 h-4 text-${folder.color}-500`} />
                                                    {folder.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button 
                                onClick={handleUpload} 
                                disabled={uploading || !uploadForm.file}
                                className="flex-1 bg-violet-600 hover:bg-violet-700"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Hochladen...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Hochladen
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                Abbrechen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Folder Dialog */}
            <CreateFolderDialog
                open={createFolderOpen}
                onOpenChange={setCreateFolderOpen}
                onCreateFolder={handleCreateFolder}
                existingFolders={folders}
            />

            {/* Preview Dialog */}
            <DocumentPreviewDialog
                open={!!previewDoc}
                onOpenChange={(open) => !open && setPreviewDoc(null)}
                document={previewDoc}
            />

            {/* Share Dialog */}
            <DocumentShareDialog
                open={!!shareDialogDoc}
                onOpenChange={(open) => !open && setShareDialogDoc(null)}
                document={shareDialogDoc}
                onShare={handleShareDocument}
            />

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
            )}
        </div>
    );
}