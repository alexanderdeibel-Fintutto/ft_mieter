import React, { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['Alle', 'Mietvertrag', 'Reparaturen', 'Nebenkosten', 'Versicherung', 'Sonstiges'];
const FILE_TYPES = ['Alle', 'PDF', 'Bild', 'Word', 'Excel'];

export default function AdvancedDocumentFilter({ onFilterChange, totalDocuments }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: 'Alle',
        fileType: 'Alle',
        dateFrom: '',
        dateTo: '',
        minSize: '',
        maxSize: ''
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const defaultFilters = {
            search: '',
            category: 'Alle',
            fileType: 'Alle',
            dateFrom: '',
            dateTo: '',
            minSize: '',
            maxSize: ''
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const activeFilters = Object.values(filters).filter(v => v && v !== 'Alle').length;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-violet-600" />
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Erweiterte Suche</h3>
                        <p className="text-xs text-gray-500">{totalDocuments} Dokumente</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {activeFilters > 0 && (
                        <span className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full font-medium">
                            {activeFilters}
                        </span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                    {/* Search */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Suchtext</label>
                        <Input
                            placeholder="Dokumentname durchsuchen..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Category & Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Kategorie</label>
                            <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Dateityp</label>
                            <Select value={filters.fileType} onValueChange={(v) => handleFilterChange('fileType', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FILE_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Zeitraum</label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                placeholder="Von"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            />
                            <Input
                                type="date"
                                placeholder="Bis"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Size Range */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Dateigröße (MB)</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={filters.minSize}
                                onChange={(e) => handleFilterChange('minSize', e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="Max"
                                value={filters.maxSize}
                                onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="flex-1"
                        >
                            Zurücksetzen
                        </Button>
                        <Button
                            onClick={() => setIsExpanded(false)}
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                        >
                            Fertig
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}