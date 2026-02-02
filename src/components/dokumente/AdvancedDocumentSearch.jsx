import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
    Search, 
    Filter, 
    X, 
    Calendar as CalendarIcon,
    FileText,
    SlidersHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const FILE_TYPES = [
    { id: 'all', label: 'Alle Typen' },
    { id: 'pdf', label: 'PDF', match: 'pdf' },
    { id: 'image', label: 'Bilder', match: 'image' },
    { id: 'spreadsheet', label: 'Tabellen', match: 'spreadsheet,excel' },
    { id: 'document', label: 'Dokumente', match: 'doc,word' },
];

export default function AdvancedDocumentSearch({ 
    documents, 
    onFilteredDocuments, 
    categories,
    folders 
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [fileType, setFileType] = useState('all');
    const [category, setCategory] = useState('all');
    const [folder, setFolder] = useState('all');
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [showFilters, setShowFilters] = useState(false);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchQuery) count++;
        if (fileType !== 'all') count++;
        if (category !== 'all') count++;
        if (folder !== 'all') count++;
        if (dateRange.from || dateRange.to) count++;
        return count;
    }, [searchQuery, fileType, category, folder, dateRange]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = doc.name?.toLowerCase().includes(query);
                const matchesContent = doc.content?.toLowerCase().includes(query);
                if (!matchesName && !matchesContent) return false;
            }

            // File type
            if (fileType !== 'all') {
                const typeConfig = FILE_TYPES.find(t => t.id === fileType);
                if (typeConfig?.match) {
                    const matches = typeConfig.match.split(',');
                    const docType = doc.file_type?.toLowerCase() || '';
                    if (!matches.some(m => docType.includes(m))) return false;
                }
            }

            // Category
            if (category !== 'all' && doc.category !== category) return false;

            // Folder
            if (folder !== 'all' && doc.folder_id !== folder) return false;

            // Date range
            if (dateRange.from) {
                const docDate = new Date(doc.created_at);
                if (docDate < dateRange.from) return false;
            }
            if (dateRange.to) {
                const docDate = new Date(doc.created_at);
                if (docDate > dateRange.to) return false;
            }

            return true;
        });
    }, [documents, searchQuery, fileType, category, folder, dateRange]);

    useEffect(() => {
        onFilteredDocuments(filteredDocuments);
    }, [filteredDocuments, onFilteredDocuments]);

    const clearFilters = () => {
        setSearchQuery('');
        setFileType('all');
        setCategory('all');
        setFolder('all');
        setDateRange({ from: null, to: null });
    };

    return (
        <div className="space-y-3">
            {/* Main Search */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Dokument suchen..."
                        className="pl-9 pr-9"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant={showFilters ? 'secondary' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                    {activeFiltersCount > 0 && (
                        <Badge className="bg-violet-600 text-white h-5 w-5 p-0 flex items-center justify-center">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Extended Filters */}
            {showFilters && (
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {/* File Type */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Dateityp</label>
                            <Select value={fileType} onValueChange={setFileType}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FILE_TYPES.map(type => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Kategorie</label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Alle Kategorien</SelectItem>
                                    {categories?.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Folder */}
                        {folders?.length > 0 && (
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Ordner</label>
                                <Select value={folder} onValueChange={setFolder}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Alle Ordner</SelectItem>
                                        {folders.map(f => (
                                            <SelectItem key={f.id} value={f.id}>
                                                {f.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Date Range */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Zeitraum</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full h-9 text-sm justify-start">
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                `${format(dateRange.from, 'dd.MM.yy')} - ${format(dateRange.to, 'dd.MM.yy')}`
                                            ) : (
                                                format(dateRange.from, 'dd.MM.yyyy')
                                            )
                                        ) : (
                                            'Datum wählen'
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        locale={de}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Active Filters & Clear */}
                    {activeFiltersCount > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-gray-500">
                                {filteredDocuments.length} von {documents.length} Dokumenten
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Filter zurücksetzen
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>
                        {filteredDocuments.length} Ergebnis{filteredDocuments.length !== 1 ? 'se' : ''} für "{searchQuery}"
                    </span>
                </div>
            )}
        </div>
    );
}