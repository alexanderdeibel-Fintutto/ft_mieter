import React, { useState } from 'react';
import { Search, ChevronDown, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const SERVICE_TYPES = ['Alle', 'Handwerk', 'Dienstleistungen', 'Nachbarschaftshilfe', 'Sonstiges'];
const RATINGS = ['Alle', '⭐ 4.5+', '⭐ 4+', '⭐ 3+'];
const AVAILABILITY = ['Alle', 'Sofort', 'Diese Woche', 'Diesen Monat'];

export default function AdvancedBulletinFilter({ onFilterChange, totalListings }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        serviceType: 'Alle',
        minRating: 'Alle',
        minPrice: 0,
        maxPrice: 500,
        availability: 'Alle',
        onlyVerified: false,
        onlyAvailable: false
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const defaultFilters = {
            search: '',
            serviceType: 'Alle',
            minRating: 'Alle',
            minPrice: 0,
            maxPrice: 500,
            availability: 'Alle',
            onlyVerified: false,
            onlyAvailable: false
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const activeFilters = [
        filters.search,
        filters.serviceType !== 'Alle',
        filters.minRating !== 'Alle',
        filters.minPrice > 0 || filters.maxPrice < 500,
        filters.availability !== 'Alle',
        filters.onlyVerified,
        filters.onlyAvailable
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
                        <p className="text-xs text-gray-500">{totalListings} Einträge</p>
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
                            placeholder="Leistung oder Person suchen..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Type & Rating */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Leistungstyp</label>
                            <Select value={filters.serviceType} onValueChange={(v) => handleFilterChange('serviceType', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SERVICE_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Bewertung</label>
                            <Select value={filters.minRating} onValueChange={(v) => handleFilterChange('minRating', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RATINGS.map(rating => (
                                        <SelectItem key={rating} value={rating}>{rating}</SelectItem>
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
                            max={500}
                            step={10}
                            className="w-full"
                        />
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Verfügbarkeit</label>
                        <Select value={filters.availability} onValueChange={(v) => handleFilterChange('availability', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABILITY.map(avail => (
                                    <SelectItem key={avail} value={avail}>{avail}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.onlyVerified}
                                onChange={(e) => handleFilterChange('onlyVerified', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Nur verifizierte Profile</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.onlyAvailable}
                                onChange={(e) => handleFilterChange('onlyAvailable', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Nur verfügbar</span>
                        </label>
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