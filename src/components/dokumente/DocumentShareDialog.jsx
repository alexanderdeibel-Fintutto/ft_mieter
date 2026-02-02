import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Share2, 
    Users, 
    Home, 
    Search,
    Check,
    X,
    Loader2,
    Globe,
    Lock,
    Building
} from 'lucide-react';
import { toast } from 'sonner';

// Demo tenants and apartments
const DEMO_APARTMENTS = [
    { id: 'apt-1', name: 'Wohnung 1A', floor: 'EG' },
    { id: 'apt-2', name: 'Wohnung 1B', floor: 'EG' },
    { id: 'apt-3', name: 'Wohnung 2A', floor: '1. OG' },
    { id: 'apt-4', name: 'Wohnung 2B', floor: '1. OG' },
    { id: 'apt-5', name: 'Wohnung 3A', floor: '2. OG' },
    { id: 'apt-6', name: 'Wohnung 3B', floor: '2. OG' },
];

const DEMO_TENANTS = [
    { id: 'tenant-1', name: 'Anna Müller', apartment: 'Wohnung 1A', email: 'anna@example.com' },
    { id: 'tenant-2', name: 'Thomas Schmidt', apartment: 'Wohnung 1B', email: 'thomas@example.com' },
    { id: 'tenant-3', name: 'Maria Weber', apartment: 'Wohnung 2A', email: 'maria@example.com' },
    { id: 'tenant-4', name: 'Klaus Fischer', apartment: 'Wohnung 2B', email: 'klaus@example.com' },
    { id: 'tenant-5', name: 'Sabine Braun', apartment: 'Wohnung 3A', email: 'sabine@example.com' },
    { id: 'tenant-6', name: 'Peter Hoffmann', apartment: 'Wohnung 3B', email: 'peter@example.com' },
];

export default function DocumentShareDialog({ open, onOpenChange, document, onShare }) {
    const [shareType, setShareType] = useState('all'); // 'all', 'apartments', 'tenants'
    const [selectedApartments, setSelectedApartments] = useState([]);
    const [selectedTenants, setSelectedTenants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    if (!document) return null;

    const toggleApartment = (aptId) => {
        setSelectedApartments(prev => 
            prev.includes(aptId) 
                ? prev.filter(id => id !== aptId)
                : [...prev, aptId]
        );
    };

    const toggleTenant = (tenantId) => {
        setSelectedTenants(prev => 
            prev.includes(tenantId) 
                ? prev.filter(id => id !== tenantId)
                : [...prev, tenantId]
        );
    };

    const selectAllApartments = () => {
        if (selectedApartments.length === DEMO_APARTMENTS.length) {
            setSelectedApartments([]);
        } else {
            setSelectedApartments(DEMO_APARTMENTS.map(a => a.id));
        }
    };

    const selectAllTenants = () => {
        if (selectedTenants.length === DEMO_TENANTS.length) {
            setSelectedTenants([]);
        } else {
            setSelectedTenants(DEMO_TENANTS.map(t => t.id));
        }
    };

    const handleShare = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        
        const shareConfig = {
            type: shareType,
            apartments: shareType === 'apartments' ? selectedApartments : [],
            tenants: shareType === 'tenants' ? selectedTenants : [],
        };
        
        onShare(document.id, shareConfig);
        setLoading(false);
        onOpenChange(false);
        
        const recipientCount = shareType === 'all' 
            ? DEMO_TENANTS.length 
            : shareType === 'apartments' 
                ? selectedApartments.length 
                : selectedTenants.length;
        
        toast.success(`Dokument für ${recipientCount} ${shareType === 'apartments' ? 'Wohnungen' : 'Mieter'} freigegeben`);
    };

    const filteredTenants = DEMO_TENANTS.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.apartment.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const canShare = shareType === 'all' || 
        (shareType === 'apartments' && selectedApartments.length > 0) ||
        (shareType === 'tenants' && selectedTenants.length > 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-violet-600" />
                        Dokument freigeben
                    </DialogTitle>
                </DialogHeader>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{document.name}</p>
                </div>

                <Tabs value={shareType} onValueChange={setShareType} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="w-full">
                        <TabsTrigger value="all" className="flex-1 gap-1">
                            <Globe className="w-3 h-3" />
                            Alle
                        </TabsTrigger>
                        <TabsTrigger value="apartments" className="flex-1 gap-1">
                            <Building className="w-3 h-3" />
                            Wohnungen
                        </TabsTrigger>
                        <TabsTrigger value="tenants" className="flex-1 gap-1">
                            <Users className="w-3 h-3" />
                            Mieter
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-4">
                        <TabsContent value="all" className="mt-0">
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Globe className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">Für alle Mieter freigeben</h4>
                                <p className="text-sm text-gray-500">
                                    Alle {DEMO_TENANTS.length} Mieter erhalten Zugriff auf dieses Dokument.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="apartments" className="mt-0 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">
                                    {selectedApartments.length} von {DEMO_APARTMENTS.length} ausgewählt
                                </span>
                                <Button variant="ghost" size="sm" onClick={selectAllApartments} className="h-7 text-xs">
                                    {selectedApartments.length === DEMO_APARTMENTS.length ? 'Keine' : 'Alle'} auswählen
                                </Button>
                            </div>
                            {DEMO_APARTMENTS.map(apt => (
                                <div
                                    key={apt.id}
                                    onClick={() => toggleApartment(apt.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                        selectedApartments.includes(apt.id)
                                            ? 'bg-violet-50 border-2 border-violet-200'
                                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                        selectedApartments.includes(apt.id)
                                            ? 'bg-violet-600'
                                            : 'border-2 border-gray-300'
                                    }`}>
                                        {selectedApartments.includes(apt.id) && (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    <div className="p-2 bg-white rounded-lg">
                                        <Home className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{apt.name}</p>
                                        <p className="text-xs text-gray-500">{apt.floor}</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="tenants" className="mt-0 space-y-2">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Mieter suchen..."
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">
                                    {selectedTenants.length} von {DEMO_TENANTS.length} ausgewählt
                                </span>
                                <Button variant="ghost" size="sm" onClick={selectAllTenants} className="h-7 text-xs">
                                    {selectedTenants.length === DEMO_TENANTS.length ? 'Keine' : 'Alle'} auswählen
                                </Button>
                            </div>
                            {filteredTenants.map(tenant => (
                                <div
                                    key={tenant.id}
                                    onClick={() => toggleTenant(tenant.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                        selectedTenants.includes(tenant.id)
                                            ? 'bg-violet-50 border-2 border-violet-200'
                                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                        selectedTenants.includes(tenant.id)
                                            ? 'bg-violet-600'
                                            : 'border-2 border-gray-300'
                                    }`}>
                                        {selectedTenants.includes(tenant.id) && (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">{tenant.name}</p>
                                        <p className="text-xs text-gray-500">{tenant.apartment}</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="flex gap-2 pt-4 border-t">
                    <Button
                        onClick={handleShare}
                        disabled={loading || !canShare}
                        className="flex-1 bg-violet-600 hover:bg-violet-700"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Share2 className="w-4 h-4 mr-2" />
                                Freigeben
                            </>
                        )}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}