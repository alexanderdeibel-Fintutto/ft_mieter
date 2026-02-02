import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Calendar, Wrench, Users, HelpCircle, Filter } from 'lucide-react';

const MARKER_TYPES = [
    { id: 'event', label: 'Veranstaltungen', icon: Calendar, color: 'bg-purple-500' },
    { id: 'service', label: 'Dienstleistungen', icon: Wrench, color: 'bg-blue-500' },
    { id: 'group', label: 'Gruppen', icon: Users, color: 'bg-green-500' },
    { id: 'request', label: 'Anfragen', icon: HelpCircle, color: 'bg-orange-500' }
];

export default function MapFilterPanel({ 
    searchQuery, 
    onSearchChange, 
    activeFilters, 
    onFilterToggle,
    markerCounts 
}) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
            {/* Suchfeld */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Suche nach Ort, Titel..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter-Buttons */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {MARKER_TYPES.map((type) => {
                        const isActive = activeFilters.includes(type.id);
                        const Icon = type.icon;
                        const count = markerCounts?.[type.id] || 0;
                        
                        return (
                            <Button
                                key={type.id}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFilterToggle(type.id)}
                                className={`gap-1.5 ${isActive ? '' : 'text-gray-600'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${type.color}`} />
                                <Icon className="w-3.5 h-3.5" />
                                <span>{type.label}</span>
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                    {count}
                                </Badge>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Aktive Filter anzeigen */}
            {activeFilters.length > 0 && activeFilters.length < MARKER_TYPES.length && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                        {activeFilters.length} von {MARKER_TYPES.length} Kategorien aktiv
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => MARKER_TYPES.forEach(t => {
                            if (!activeFilters.includes(t.id)) onFilterToggle(t.id);
                        })}
                        className="text-xs"
                    >
                        Alle anzeigen
                    </Button>
                </div>
            )}
        </div>
    );
}