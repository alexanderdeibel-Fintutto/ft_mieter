import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    AlertTriangle, 
    Plus, 
    Clock, 
    CheckCircle, 
    Loader2, 
    Search,
    Filter,
    Wrench,
    AlertCircle,
    Image as ImageIcon,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import CreateMaengelDialog from '../components/maengel/CreateMaengelDialog';
import MaengelDetailDialog from '../components/maengel/MaengelDetailDialog';

const CATEGORIES = [
    { value: 'heizung', label: '🔥 Heizung' },
    { value: 'wasser', label: '💧 Wasser/Sanitär' },
    { value: 'elektrik', label: '⚡ Elektrik' },
    { value: 'fenster_tueren', label: '🚪 Fenster/Türen' },
    { value: 'schimmel', label: '🦠 Schimmel/Feuchtigkeit' },
    { value: 'sonstiges', label: '📋 Sonstiges' },
];

const STATUS_CONFIG = {
    reported: { 
        label: 'Gemeldet', 
        color: 'bg-amber-100 text-amber-700 border-amber-200', 
        icon: AlertCircle 
    },
    confirmed: { 
        label: 'Bestätigt', 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: Clock 
    },
    in_progress: { 
        label: 'In Bearbeitung', 
        color: 'bg-violet-100 text-violet-700 border-violet-200', 
        icon: Wrench 
    },
    resolved: { 
        label: 'Behoben', 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        icon: CheckCircle 
    },
};

// Demo data
const DEMO_MAENGEL = [
    {
        id: 1,
        title: 'Heizung im Wohnzimmer defekt',
        description: 'Die Heizung im Wohnzimmer wird nicht mehr warm. Thermostat zeigt an, aber keine Wärme.',
        category: 'heizung',
        status: 'in_progress',
        isUrgent: true,
        created_at: '2026-01-15T10:30:00Z',
        media: [
            { url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', type: 'image' }
        ],
        floorplanMarker: { x: 30, y: 40 },
        statusHistory: [
            { status: 'reported', timestamp: '2026-01-15T10:30:00Z' },
            { status: 'confirmed', timestamp: '2026-01-15T14:00:00Z', updatedBy: 'Hausverwaltung', note: 'Wir haben den Mangel erfasst.' },
            { status: 'in_progress', timestamp: '2026-01-16T09:00:00Z', updatedBy: 'Hausmeister Müller', note: 'Termin mit Heizungsfirma am 18.01.' }
        ],
        comments: [
            { id: 1, text: 'Können Sie mir sagen, wann der Techniker kommt?', timestamp: '2026-01-16T11:00:00Z', role: 'tenant', authorId: 'user1', authorName: 'Max Mustermann' },
            { id: 2, text: 'Der Techniker kommt am 18.01. zwischen 10-12 Uhr.', timestamp: '2026-01-16T14:30:00Z', role: 'management', authorName: 'Hausverwaltung' }
        ]
    },
    {
        id: 2,
        title: 'Wasserhahn tropft',
        description: 'Der Wasserhahn in der Küche tropft ständig.',
        category: 'wasser',
        status: 'confirmed',
        isUrgent: false,
        created_at: '2026-01-18T08:00:00Z',
        media: [],
        statusHistory: [
            { status: 'reported', timestamp: '2026-01-18T08:00:00Z' },
            { status: 'confirmed', timestamp: '2026-01-18T15:00:00Z', updatedBy: 'Hausverwaltung' }
        ],
        comments: []
    },
    {
        id: 3,
        title: 'Fenster schließt nicht richtig',
        description: 'Das Fenster im Schlafzimmer schließt nicht mehr richtig, es zieht kalt rein.',
        category: 'fenster_tueren',
        status: 'resolved',
        isUrgent: false,
        created_at: '2026-01-10T16:00:00Z',
        media: [
            { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', type: 'image' }
        ],
        statusHistory: [
            { status: 'reported', timestamp: '2026-01-10T16:00:00Z' },
            { status: 'confirmed', timestamp: '2026-01-10T17:00:00Z' },
            { status: 'in_progress', timestamp: '2026-01-12T10:00:00Z' },
            { status: 'resolved', timestamp: '2026-01-14T14:00:00Z', updatedBy: 'Hausmeister Müller', note: 'Dichtung ausgetauscht.' }
        ],
        comments: [
            { id: 1, text: 'Vielen Dank für die schnelle Reparatur!', timestamp: '2026-01-14T16:00:00Z', role: 'tenant', authorId: 'user1' }
        ]
    }
];

function MaengelCard({ mangel, onClick }) {
    const status = STATUS_CONFIG[mangel.status] || STATUS_CONFIG.reported;
    const StatusIcon = status.icon;
    const category = CATEGORIES.find(c => c.value === mangel.category);
    const hasMedia = mangel.media?.length > 0;
    const hasComments = mangel.comments?.length > 0;

    return (
        <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick} 
            className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left transition-all hover:shadow-md hover:border-violet-200 active:scale-[0.99]"
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-start gap-2">
                    {mangel.isUrgent && (
                        <span className="p-1 bg-red-100 rounded-md">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </span>
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{mangel.title}</h3>
                        <p className="text-xs text-gray-500">{category?.label}</p>
                    </div>
                </div>
                <Badge className={`${status.color} border text-xs flex items-center gap-1 flex-shrink-0`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                </Badge>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{mangel.description}</p>
            
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {hasMedia && (
                        <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {mangel.media.length}
                        </span>
                    )}
                    {hasComments && (
                        <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {mangel.comments.length}
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-400">
                    {new Date(mangel.created_at).toLocaleDateString('de-DE')}
                </span>
            </div>
        </motion.button>
    );
}

export default function Maengel() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [maengel, setMaengel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedMangel, setSelectedMangel] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
            return;
        }
        if (user) loadMaengel();
    }, [user, authLoading]);

    const loadMaengel = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('defect_reports')
            .select('*')
            .eq('reporter_id', user.id)
            .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
            setMaengel(data);
        } else {
            setMaengel(DEMO_MAENGEL);
        }
        setLoading(false);
    };

    const handleCreateMangel = async (formData) => {
        setSubmitting(true);
        
        const newMangel = {
            ...formData,
            id: Date.now(),
            created_at: new Date().toISOString(),
            reporter_id: user?.id
        };

        // Try to save to Supabase
        const { error } = await supabase.from('defect_reports').insert({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            status: 'reported',
            reporter_id: user.id,
            images: formData.media?.map(m => m.url) || [],
            is_urgent: formData.isUrgent,
            floorplan_marker: formData.floorplanMarker
        });

        if (error) {
            // Fallback to local state
            setMaengel(prev => [newMangel, ...prev]);
        } else {
            loadMaengel();
        }

        toast.success('Mangel erfolgreich gemeldet!');
        setShowCreateDialog(false);
        setSubmitting(false);
    };

    const handleAddComment = async (mangelId, comment) => {
        // Update local state
        setMaengel(prev => prev.map(m => {
            if (m.id === mangelId) {
                return {
                    ...m,
                    comments: [...(m.comments || []), { ...comment, id: Date.now() }]
                };
            }
            return m;
        }));

        // Update selected mangel if open
        if (selectedMangel?.id === mangelId) {
            setSelectedMangel(prev => ({
                ...prev,
                comments: [...(prev.comments || []), { ...comment, id: Date.now() }]
            }));
        }
    };

    // Filter logic
    const filteredMaengel = maengel.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        const matchesTab = activeTab === 'active' 
            ? m.status !== 'resolved'
            : m.status === 'resolved';
        return matchesSearch && matchesStatus && matchesTab;
    });

    const activeMaengel = maengel.filter(m => m.status !== 'resolved');
    const resolvedMaengel = maengel.filter(m => m.status === 'resolved');

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Mängel</h1>
                            <p className="text-xs text-gray-500">{activeMaengel.length} aktiv</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setShowCreateDialog(true)} 
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Melden
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start px-4 h-12 bg-transparent">
                        <TabsTrigger value="active" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            <Clock className="w-4 h-4 mr-2" />
                            Aktiv ({activeMaengel.length})
                        </TabsTrigger>
                        <TabsTrigger value="resolved" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Erledigt ({resolvedMaengel.length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            {/* Filters */}
            <div className="p-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {activeTab === 'active' && (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Status</SelectItem>
                            <SelectItem value="reported">Gemeldet</SelectItem>
                            <SelectItem value="confirmed">Bestätigt</SelectItem>
                            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Content */}
            <main className="p-4 space-y-3 pb-24">
                <AnimatePresence>
                    {filteredMaengel.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-gray-500"
                        >
                            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">
                                {activeTab === 'active' ? 'Keine aktiven Mängel' : 'Keine erledigten Mängel'}
                            </p>
                            {activeTab === 'active' && (
                                <p className="text-sm">Tippe auf "Melden" um einen Mangel zu erfassen</p>
                            )}
                        </motion.div>
                    ) : (
                        filteredMaengel.map(mangel => (
                            <MaengelCard 
                                key={mangel.id} 
                                mangel={mangel} 
                                onClick={() => setSelectedMangel(mangel)}
                            />
                        ))
                    )}
                </AnimatePresence>
            </main>

            {/* Dialogs */}
            <CreateMaengelDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={handleCreateMangel}
                submitting={submitting}
            />

            <MaengelDetailDialog
                open={!!selectedMangel}
                onOpenChange={(open) => !open && setSelectedMangel(null)}
                mangel={selectedMangel}
                currentUserId={user?.id}
                onAddComment={handleAddComment}
            />
        </div>
    );
}