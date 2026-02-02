import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const CATEGORIES = ['Alle', 'Möbel', 'Elektronik', 'Haushalt', 'Sport', 'Kleidung', 'Sonstiges'];
const CONDITIONS = ['Alle', 'Neu', 'Wie neu', 'Gut', 'Gebraucht'];
const SORT_OPTIONS = ['Neueste', 'Preis: Niedrig', 'Preis: Hoch', 'Beliebtheit'];

export default function AdvancedMarketplaceFilter({ onFilterChange, totalListings }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: 'Alle',
        condition: 'Alle',
        minPrice: 0,
        maxPrice: 1000,
        location: '',
        sortBy: 'Neueste',
        hasPhotos: false
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
            condition: 'Alle',
            minPrice: 0,
            maxPrice: 1000,
            location: '',
            sortBy: 'Neueste',
            hasPhotos: false
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const activeFilters = [
        filters.search,
        filters.category !== 'Alle',
        filters.condition !== 'Alle',
        filters.minPrice > 0 || filters.maxPrice < 1000,
        filters.location,
        filters.hasPhotos
    ].filter(Boolean).length;

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
                        <p className="text-xs text-gray-500">{totalListings} Anzeigen</p>
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
                            placeholder="Was suchst du?"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Category & Condition */}
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
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Zustand</label>
                            <Select value={filters.condition} onValueChange={(v) => handleFilterChange('condition', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONDITIONS.map(cond => (
                                        <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                            Preis: €{filters.minPrice} - €{filters.maxPrice}
                        </label>
                        <Slider
                            value={[filters.minPrice, filters.maxPrice]}
                            onValueChange={(values) => {
                                handleFilterChange('minPrice', values[0]);
                                handleFilterChange('maxPrice', values[1]);
                            }}
                            min={0}
                            max={1000}
                            step={10}
                            className="w-full"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Standort/Etage</label>
                        <Input
                            placeholder="z.B. 2. OG"
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                        />
                    </div>

                    {/* Sort & Photos */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Sortieren</label>
                            <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.hasPhotos}
                                    onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Mit Fotos</span>
                            </label>
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