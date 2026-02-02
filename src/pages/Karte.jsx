import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Plus, 
    List, 
    Map as MapIcon,
    Loader2,
    RefreshCw
} from 'lucide-react';
import MapComponent from '@/components/karte/MapComponent';
import MapFilterPanel from '@/components/karte/MapFilterPanel';
import CreateMapRequestDialog from '@/components/karte/CreateMapRequestDialog';
import { toast } from 'sonner';

// Demo-Daten für die Karte
const DEMO_MARKERS = [
    {
        id: '1',
        type: 'event',
        title: 'Sommerfest im Innenhof',
        description: 'Gemeinsames Grillen und Feiern für alle Nachbarn',
        location: { latitude: 52.521, longitude: 13.405, address: 'Innenhof, Gebäude A' },
        date: '2026-02-15'
    },
    {
        id: '2',
        type: 'service',
        title: 'Babysitting angeboten',
        description: 'Erfahrene Babysitterin bietet Betreuung am Wochenende',
        location: { latitude: 52.519, longitude: 13.408, address: 'Gebäude B, 3. OG' },
        created_by: 'Maria M.'
    },
    {
        id: '3',
        type: 'group',
        title: 'Laufgruppe',
        description: 'Wöchentliches Treffen zum gemeinsamen Joggen',
        location: { latitude: 52.522, longitude: 13.402, address: 'Haupteingang' },
        created_by: 'Thomas K.'
    },
    {
        id: '4',
        type: 'request',
        title: 'Wer hat eine Bohrmaschine?',
        description: 'Bräuchte kurz eine Bohrmaschine für ein Regal',
        location: { latitude: 52.520, longitude: 13.406, address: 'Gebäude C, 1. OG' },
        created_by: 'Stefan W.',
        status: 'offen'
    }
];

export default function Karte() {
    const [markers, setMarkers] = useState(DEMO_MARKERS);
    const [mapRequests, setMapRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState(['event', 'service', 'group', 'request']);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [viewMode, setViewMode] = useState('map'); // 'map' oder 'list'
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            // Lade MapRequests aus der Datenbank
            const requests = await base44.entities.MapRequest.list();
            setMapRequests(requests);

            // Kombiniere Demo-Daten mit echten Anfragen
            const requestMarkers = requests
                .filter(r => r.status === 'offen')
                .map(r => ({
                    ...r,
                    type: 'request'
                }));

            setMarkers([
                ...DEMO_MARKERS.filter(d => d.type !== 'request'),
                ...requestMarkers
            ]);
        } catch (error) {
            console.error('Fehler beim Laden:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRequest = async (requestData) => {
        try {
            const newRequest = await base44.entities.MapRequest.create(requestData);
            setMapRequests([...mapRequests, newRequest]);
            setMarkers([...markers, { ...newRequest, type: 'request' }]);
            toast.success('Anfrage erfolgreich erstellt!');
        } catch (error) {
            console.error('Fehler beim Erstellen:', error);
            toast.error('Fehler beim Erstellen der Anfrage');
        }
    };

    const handleFilterToggle = (filterId) => {
        setActiveFilters(prev => 
            prev.includes(filterId)
                ? prev.filter(f => f !== filterId)
                : [...prev, filterId]
        );
    };

    // Gefilterte Marker
    const filteredMarkers = useMemo(() => {
        return markers.filter(marker => {
            // Filter nach Typ
            if (!activeFilters.includes(marker.type)) return false;
            
            // Filter nach Suchbegriff
            if (searchQuery) {
                const search = searchQuery.toLowerCase();
                const matchTitle = marker.title?.toLowerCase().includes(search);
                const matchDesc = marker.description?.toLowerCase().includes(search);
                const matchAddress = marker.location?.address?.toLowerCase().includes(search);
                if (!matchTitle && !matchDesc && !matchAddress) return false;
            }
            
            return true;
        });
    }, [markers, activeFilters, searchQuery]);

    // Zähle Marker pro Typ
    const markerCounts = useMemo(() => {
        return markers.reduce((acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1;
            return acc;
        }, {});
    }, [markers]);

    const handleViewDetails = (item, type) => {
        toast.info(`Details für "${item.title}" werden angezeigt`);
        // Hier könnte Navigation zu Detail-Seite oder Dialog erfolgen
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            <h1 className="text-xl font-bold">Nachbarschaftskarte</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={loadData}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <div className="flex border rounded-lg overflow-hidden">
                                <Button
                                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('map')}
                                    className="rounded-none"
                                >
                                    <MapIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-none"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="px-4 py-3">
                <MapFilterPanel
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilters={activeFilters}
                    onFilterToggle={handleFilterToggle}
                    markerCounts={markerCounts}
                />
            </div>

            {/* Karten/Listen-Ansicht */}
            <div className="px-4 pb-24">
                {viewMode === 'map' ? (
                    <div className="h-[60vh] rounded-lg overflow-hidden shadow-lg">
                        <MapComponent
                            markers={filteredMarkers}
                            onViewDetails={handleViewDetails}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredMarkers.length === 0 ? (
                            <Card className="p-8 text-center">
                                <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">Keine Einträge gefunden</p>
                            </Card>
                        ) : (
                            filteredMarkers.map((marker) => (
                                <Card 
                                    key={`${marker.type}-${marker.id}`}
                                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleViewDetails(marker, marker.type)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                            ${marker.type === 'event' ? 'bg-purple-100 text-purple-600' : ''}
                                            ${marker.type === 'service' ? 'bg-blue-100 text-blue-600' : ''}
                                            ${marker.type === 'group' ? 'bg-green-100 text-green-600' : ''}
                                            ${marker.type === 'request' ? 'bg-orange-100 text-orange-600' : ''}
                                        `}>
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {marker.type === 'event' && 'Veranstaltung'}
                                                    {marker.type === 'service' && 'Dienstleistung'}
                                                    {marker.type === 'group' && 'Gruppe'}
                                                    {marker.type === 'request' && 'Anfrage'}
                                                </Badge>
                                                {marker.status === 'offen' && (
                                                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                                                        Offen
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {marker.title || marker.name}
                                            </h3>
                                            {marker.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                    {marker.description}
                                                </p>
                                            )}
                                            {marker.location?.address && (
                                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {marker.location.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* FAB für neue Anfrage */}
            <Button
                className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-10"
                onClick={() => setShowCreateDialog(true)}
            >
                <Plus className="w-6 h-6" />
            </Button>

            {/* Dialog für neue Anfrage */}
            <CreateMapRequestDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={handleCreateRequest}
            />
        </div>
    );
}