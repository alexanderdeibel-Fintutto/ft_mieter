import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Wrench, 
    Plus, 
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Home,
    Calendar,
    User,
    ChevronRight,
    Image as ImageIcon,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import CreateRepairDialog from '../components/reparaturen/CreateRepairDialog';
import RepairDetailDialog from '../components/reparaturen/RepairDetailDialog';
import { useAppNotifications } from '../components/notifications/useAppNotifications';
import { useFeatureLimits } from '../components/featuregate/useFeatureLimits';
import RepairsUpgradeNudge from '../components/featuregate/RepairsUpgradeNudge';

const STATUS_CONFIG = {
    gemeldet: { label: 'Gemeldet', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    in_bearbeitung: { label: 'In Bearbeitung', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
    handwerker_beauftragt: { label: 'Handwerker beauftragt', color: 'bg-purple-100 text-purple-700', icon: User },
    termin_vereinbart: { label: 'Termin vereinbart', color: 'bg-indigo-100 text-indigo-700', icon: Calendar },
    abgeschlossen: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

const CATEGORY_CONFIG = {
    sanitaer: { label: 'Sanitär', emoji: '🚿' },
    elektrik: { label: 'Elektrik', emoji: '💡' },
    heizung: { label: 'Heizung', emoji: '🔥' },
    fenster_tueren: { label: 'Fenster/Türen', emoji: '🚪' },
    boden: { label: 'Boden', emoji: '🏠' },
    wand_decke: { label: 'Wand/Decke', emoji: '🧱' },
    geraete: { label: 'Geräte', emoji: '🔧' },
    sonstiges: { label: 'Sonstiges', emoji: '📋' },
};

const DEMO_REPAIRS = [
    {
        id: 'rep-1',
        title: 'Wasserhahn tropft',
        description: 'Der Wasserhahn im Badezimmer tropft seit einer Woche kontinuierlich. Das Wasser lässt sich nicht komplett abstellen.',
        category: 'sanitaer',
        location: 'Badezimmer',
        apartment: 'Wohnung 3B',
        status: 'handwerker_beauftragt',
        priority: 'normal',
        created_at: '2025-01-15T10:30:00',
        updated_at: '2025-01-18T14:00:00',
        created_by: 'user-1',
        tenant_name: 'Anna Müller',
        photos: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400'],
        history: [
            { date: '2025-01-15T10:30:00', action: 'Meldung erstellt', by: 'Anna Müller' },
            { date: '2025-01-16T09:00:00', action: 'Status: In Bearbeitung', by: 'Hausverwaltung' },
            { date: '2025-01-18T14:00:00', action: 'Handwerker Sanitär Meier beauftragt', by: 'Hausverwaltung' },
        ],
        contractor: { name: 'Sanitär Meier', phone: '0171 1234567', scheduled_date: '2025-01-22' },
    },
    {
        id: 'rep-2',
        title: 'Heizung wird nicht warm',
        description: 'Die Heizung im Wohnzimmer heizt nicht mehr richtig. Trotz maximaler Einstellung bleibt der Heizkörper kalt.',
        category: 'heizung',
        location: 'Wohnzimmer',
        apartment: 'Wohnung 3B',
        status: 'termin_vereinbart',
        priority: 'hoch',
        created_at: '2025-01-10T08:00:00',
        updated_at: '2025-01-19T11:00:00',
        created_by: 'user-1',
        tenant_name: 'Anna Müller',
        photos: [],
        history: [
            { date: '2025-01-10T08:00:00', action: 'Meldung erstellt', by: 'Anna Müller' },
            { date: '2025-01-10T10:00:00', action: 'Als dringend markiert', by: 'Hausverwaltung' },
            { date: '2025-01-11T09:00:00', action: 'Handwerker Heizungsbau Schmidt beauftragt', by: 'Hausverwaltung' },
            { date: '2025-01-19T11:00:00', action: 'Termin vereinbart: 20.01.2025, 10:00 Uhr', by: 'Hausverwaltung' },
        ],
        contractor: { name: 'Heizungsbau Schmidt', phone: '0172 9876543', scheduled_date: '2025-01-20', scheduled_time: '10:00' },
    },
    {
        id: 'rep-3',
        title: 'Steckdose defekt',
        description: 'Die Steckdose neben dem Fenster im Schlafzimmer funktioniert nicht mehr. Kein Strom vorhanden.',
        category: 'elektrik',
        location: 'Schlafzimmer',
        apartment: 'Wohnung 2A',
        status: 'gemeldet',
        priority: 'normal',
        created_at: '2025-01-20T16:00:00',
        updated_at: '2025-01-20T16:00:00',
        created_by: 'user-2',
        tenant_name: 'Thomas Schmidt',
        photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        history: [
            { date: '2025-01-20T16:00:00', action: 'Meldung erstellt', by: 'Thomas Schmidt' },
        ],
        contractor: null,
    },
    {
        id: 'rep-4',
        title: 'Fenster schließt nicht richtig',
        description: 'Das Fenster im Kinderzimmer lässt sich nicht mehr vollständig schließen. Es zieht kalt rein.',
        category: 'fenster_tueren',
        location: 'Kinderzimmer',
        apartment: 'Wohnung 1C',
        status: 'abgeschlossen',
        priority: 'normal',
        created_at: '2025-01-05T14:00:00',
        updated_at: '2025-01-12T15:30:00',
        created_by: 'user-3',
        tenant_name: 'Maria Weber',
        photos: [],
        history: [
            { date: '2025-01-05T14:00:00', action: 'Meldung erstellt', by: 'Maria Weber' },
            { date: '2025-01-06T09:00:00', action: 'Status: In Bearbeitung', by: 'Hausverwaltung' },
            { date: '2025-01-08T10:00:00', action: 'Handwerker Fensterbau Huber beauftragt', by: 'Hausverwaltung' },
            { date: '2025-01-10T14:00:00', action: 'Reparatur durchgeführt', by: 'Fensterbau Huber' },
            { date: '2025-01-12T15:30:00', action: 'Abgeschlossen - Mieter bestätigt', by: 'Hausverwaltung' },
        ],
        contractor: { name: 'Fensterbau Huber', phone: '0173 5555555' },
    },
];

function RepairCard({ repair, onClick, isAdmin }) {
    const status = STATUS_CONFIG[repair.status];
    const category = CATEGORY_CONFIG[repair.category];
    const StatusIcon = status?.icon || AlertCircle;
    
    const isNew = new Date() - new Date(repair.created_at) < 24 * 60 * 60 * 1000;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all"
        >
            <div className="flex items-start gap-3">
                {/* Category Icon */}
                <div className="p-2 bg-gray-100 rounded-lg text-2xl">
                    {category?.emoji || '🔧'}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 truncate">{repair.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>{repair.location}</span>
                                {isAdmin && (
                                    <>
                                        <span>•</span>
                                        <Home className="w-3 h-3" />
                                        <span>{repair.apartment}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {isNew && repair.status === 'gemeldet' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Neu</span>
                        )}
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{repair.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                        <Badge className={`${status?.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status?.label}
                        </Badge>
                        <div className="flex items-center gap-2">
                            {repair.photos?.length > 0 && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <ImageIcon className="w-3 h-3" />
                                    {repair.photos.length}
                                </span>
                            )}
                            <span className="text-xs text-gray-400">
                                {new Date(repair.created_at).toLocaleDateString('de-DE')}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function Reparaturen() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { usage: repairCount } = useFeatureLimits('repairRequests');
    const [repairs, setRepairs] = useState(DEMO_REPAIRS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('alle');
    const [categoryFilter, setCategoryFilter] = useState('alle');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState(null);

    const isAdmin = user?.email?.includes('admin') || user?.role === 'admin';
    const currentUserId = user?.id || 'user-1';
    const { notifyNewRepair, notifyRepairStatusUpdate } = useAppNotifications();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
        }
    }, [user, authLoading, navigate]);

    const handleCreateRepair = (newRepair) => {
        const repair = {
            id: `rep-${Date.now()}`,
            ...newRepair,
            status: 'gemeldet',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: currentUserId,
            tenant_name: user?.full_name || 'Mieter',
            apartment: 'Wohnung 3B',
            history: [
                { date: new Date().toISOString(), action: 'Meldung erstellt', by: user?.full_name || 'Mieter' }
            ],
            contractor: null,
        };
        setRepairs(prev => [repair, ...prev]);
        setCreateDialogOpen(false);
        toast.success('Reparatur gemeldet');
        
        // Notify admin about new repair
        notifyNewRepair(repair, true);
    };

    const handleUpdateRepair = (repairId, updates) => {
        setRepairs(prev => prev.map(r => {
            if (r.id === repairId) {
                const newHistory = [...r.history];
                if (updates.historyEntry) {
                    newHistory.push({
                        date: new Date().toISOString(),
                        action: updates.historyEntry,
                        by: 'Hausverwaltung'
                    });
                }
                
                // Notify tenant about status update
                if (updates.status && updates.status !== r.status) {
                    notifyRepairStatusUpdate(r, updates.status);
                }
                
                return {
                    ...r,
                    ...updates,
                    updated_at: new Date().toISOString(),
                    history: newHistory
                };
            }
            return r;
        }));
        toast.success('Reparatur aktualisiert');
    };

    // Filter repairs
    const myRepairs = isAdmin ? repairs : repairs.filter(r => r.created_by === currentUserId);
    
    const filteredRepairs = myRepairs.filter(repair => {
        const matchesSearch = repair.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              repair.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'alle' || repair.status === statusFilter;
        const matchesCategory = categoryFilter === 'alle' || repair.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Stats
    const openRepairs = myRepairs.filter(r => r.status !== 'abgeschlossen').length;
    const newRepairs = myRepairs.filter(r => r.status === 'gemeldet').length;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <RepairsUpgradeNudge onUpgradeClick={() => {}} />
            
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <Wrench className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Reparaturen</h1>
                            <p className="text-xs text-gray-500">
                                {openRepairs} offen{newRepairs > 0 && ` • ${newRepairs} neu`}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Melden
                    </Button>
                </div>

                {/* Search */}
                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Reparatur suchen..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alle">Alle Status</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Kategorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alle">Alle Kategorien</SelectItem>
                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.emoji} {config.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            {/* Stats (Admin) */}
            {isAdmin && (
                <div className="p-4 pb-0">
                    <div className="grid grid-cols-4 gap-2">
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-amber-600">{newRepairs}</p>
                            <p className="text-xs text-amber-600">Neu</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-blue-600">
                                {myRepairs.filter(r => r.status === 'in_bearbeitung').length}
                            </p>
                            <p className="text-xs text-blue-600">In Arbeit</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-purple-600">
                                {myRepairs.filter(r => ['handwerker_beauftragt', 'termin_vereinbart'].includes(r.status)).length}
                            </p>
                            <p className="text-xs text-purple-600">Handwerker</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-green-600">
                                {myRepairs.filter(r => r.status === 'abgeschlossen').length}
                            </p>
                            <p className="text-xs text-green-600">Erledigt</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Repairs List */}
            <div className="p-4 space-y-3">
                <AnimatePresence>
                    {filteredRepairs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>Keine Reparaturen gefunden</p>
                            <p className="text-sm mb-4">
                                {searchQuery || statusFilter !== 'alle' || categoryFilter !== 'alle'
                                    ? 'Versuche andere Filterkriterien.'
                                    : 'Melde einen Schaden, wenn etwas repariert werden muss.'}
                            </p>
                            {!searchQuery && statusFilter === 'alle' && categoryFilter === 'alle' && (
                                <Button onClick={() => setCreateDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Schaden melden
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredRepairs.map(repair => (
                            <RepairCard
                                key={repair.id}
                                repair={repair}
                                onClick={() => setSelectedRepair(repair)}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Create Dialog */}
            <CreateRepairDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateRepair}
            />

            {/* Detail Dialog */}
            <RepairDetailDialog
                open={!!selectedRepair}
                onOpenChange={(open) => !open && setSelectedRepair(null)}
                repair={selectedRepair}
                isAdmin={isAdmin}
                onUpdate={handleUpdateRepair}
                currentUser={user}
            />
        </div>
    );
}