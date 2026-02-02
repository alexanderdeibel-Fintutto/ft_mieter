import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Megaphone, 
    Plus, 
    Check, 
    CheckCheck, 
    Clock, 
    AlertTriangle,
    Info,
    Wrench,
    Calendar,
    ChevronRight,
    Eye,
    Users,
    Filter,
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import CreateAnnouncementDialog from '../components/ankuendigungen/CreateAnnouncementDialog';
import AnnouncementDetailDialog from '../components/ankuendigungen/AnnouncementDetailDialog';
import { useAppNotifications } from '../components/notifications/useAppNotifications';

const PRIORITY_STYLES = {
    urgent: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, label: 'Dringend' },
    important: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Bell, label: 'Wichtig' },
    normal: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info, label: 'Info' },
};

const CATEGORY_STYLES = {
    allgemein: { icon: Megaphone, label: 'Allgemein', color: 'text-violet-600' },
    wartung: { icon: Wrench, label: 'Wartung', color: 'text-amber-600' },
    termin: { icon: Calendar, label: 'Termin', color: 'text-blue-600' },
    sicherheit: { icon: AlertTriangle, label: 'Sicherheit', color: 'text-red-600' },
};

// Demo data
const DEMO_ANNOUNCEMENTS = [
    {
        id: 'ann-1',
        title: 'Wartungsarbeiten am Aufzug',
        content: 'Am kommenden Montag (27.01.) werden von 9:00 bis 14:00 Uhr Wartungsarbeiten am Aufzug durchgeführt. Der Aufzug ist in dieser Zeit außer Betrieb. Bitte nutzen Sie die Treppen.',
        category: 'wartung',
        priority: 'important',
        created_at: '2025-01-20T10:00:00',
        expires_at: '2025-01-27T18:00:00',
        author: 'Hausverwaltung Schmidt',
        read_by: ['user-1', 'user-2', 'user-3'],
        total_recipients: 12,
    },
    {
        id: 'ann-2',
        title: 'Treppenhausreinigung - Neuer Zeitplan',
        content: 'Ab Februar gilt ein neuer Reinigungsplan für das Treppenhaus. Die Reinigung erfolgt nun jeden Dienstag und Freitag. Der aktuelle Plan hängt im Eingangsbereich aus.',
        category: 'allgemein',
        priority: 'normal',
        created_at: '2025-01-18T14:30:00',
        expires_at: null,
        author: 'Hausverwaltung Schmidt',
        read_by: ['user-1', 'user-4'],
        total_recipients: 12,
    },
    {
        id: 'ann-3',
        title: 'Wichtig: Heizungsablesung am 15.02.',
        content: 'Am 15. Februar findet die jährliche Heizungsablesung statt. Bitte stellen Sie sicher, dass zwischen 8:00 und 16:00 Uhr jemand in der Wohnung erreichbar ist oder hinterlegen Sie einen Schlüssel bei einem Nachbarn.',
        category: 'termin',
        priority: 'urgent',
        created_at: '2025-01-21T08:00:00',
        expires_at: '2025-02-15T18:00:00',
        author: 'Hausverwaltung Schmidt',
        read_by: [],
        total_recipients: 12,
    },
    {
        id: 'ann-4',
        title: 'Rauchmelder-Prüfung erforderlich',
        content: 'Gemäß gesetzlicher Vorschriften werden alle Rauchmelder in den Wohnungen überprüft. Der genaue Termin wird noch bekannt gegeben. Bitte achten Sie auf weitere Ankündigungen.',
        category: 'sicherheit',
        priority: 'important',
        created_at: '2025-01-15T09:00:00',
        expires_at: '2025-03-01T00:00:00',
        author: 'Hausverwaltung Schmidt',
        read_by: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
        total_recipients: 12,
    },
];

function AnnouncementCard({ announcement, onRead, onViewDetails, isAdmin, currentUserId }) {
    const priorityStyle = PRIORITY_STYLES[announcement.priority] || PRIORITY_STYLES.normal;
    const categoryStyle = CATEGORY_STYLES[announcement.category] || CATEGORY_STYLES.allgemein;
    const PriorityIcon = priorityStyle.icon;
    const CategoryIcon = categoryStyle.icon;
    
    const isRead = announcement.read_by?.includes(currentUserId);
    const readCount = announcement.read_by?.length || 0;
    const readPercentage = Math.round((readCount / announcement.total_recipients) * 100);
    
    const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                !isRead ? 'border-l-4 border-l-violet-500' : 'border-gray-100'
            } ${isExpired ? 'opacity-60' : ''}`}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <Badge className={`${priorityStyle.bg} ${priorityStyle.text} gap-1`}>
                            <PriorityIcon className="w-3 h-3" />
                            {priorityStyle.label}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                            <CategoryIcon className={`w-3 h-3 ${categoryStyle.color}`} />
                            {categoryStyle.label}
                        </Badge>
                    </div>
                    {!isRead && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            Neu
                        </span>
                    )}
                </div>

                {/* Title & Content */}
                <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(announcement.created_at).toLocaleDateString('de-DE')}
                        </span>
                        {isAdmin && (
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {readCount}/{announcement.total_recipients} gelesen ({readPercentage}%)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isRead && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onRead(announcement.id)}
                                className="text-xs h-7"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Gelesen
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails(announcement)}
                            className="text-xs h-7"
                        >
                            Details
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </div>

                {/* Read Status Indicator (for tenant) */}
                {isRead && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                        <CheckCheck className="w-3 h-3" />
                        <span>Gelesen am {new Date().toLocaleDateString('de-DE')}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function Ankuendigungen() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [announcements, setAnnouncements] = useState(DEMO_ANNOUNCEMENTS);
    const [activeTab, setActiveTab] = useState('alle');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    // Simulate admin check (in real app, check user.role)
    const isAdmin = user?.email?.includes('admin') || user?.role === 'admin';
    const currentUserId = user?.id || 'user-1';
    const { notifyNewAnnouncement } = useAppNotifications();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
        }
    }, [user, authLoading, navigate]);

    const handleMarkAsRead = (announcementId) => {
        setAnnouncements(prev => 
            prev.map(a => 
                a.id === announcementId 
                    ? { ...a, read_by: [...(a.read_by || []), currentUserId] }
                    : a
            )
        );
        toast.success('Als gelesen markiert');
    };

    const handleCreateAnnouncement = (newAnnouncement) => {
        const announcement = {
            id: `ann-${Date.now()}`,
            ...newAnnouncement,
            created_at: new Date().toISOString(),
            author: 'Hausverwaltung',
            read_by: [],
            total_recipients: 12,
        };
        setAnnouncements(prev => [announcement, ...prev]);
        setCreateDialogOpen(false);
        toast.success('Ankündigung erstellt');
        
        // Notify all tenants about new announcement
        notifyNewAnnouncement(announcement);
    };

    // Filter announcements
    const unreadAnnouncements = announcements.filter(a => !a.read_by?.includes(currentUserId));
    const filteredAnnouncements = activeTab === 'alle' 
        ? announcements 
        : activeTab === 'ungelesen'
            ? unreadAnnouncements
            : announcements.filter(a => a.category === activeTab);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <Megaphone className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Ankündigungen</h1>
                            <p className="text-xs text-gray-500">
                                {unreadAnnouncements.length} ungelesen
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-violet-600 hover:bg-violet-700"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Neue Ankündigung
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start px-4 h-12 bg-transparent overflow-x-auto">
                        <TabsTrigger value="alle" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Alle ({announcements.length})
                        </TabsTrigger>
                        <TabsTrigger value="ungelesen" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Ungelesen ({unreadAnnouncements.length})
                        </TabsTrigger>
                        <TabsTrigger value="wartung" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Wartung
                        </TabsTrigger>
                        <TabsTrigger value="termin" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Termine
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            {/* Stats for Admin */}
            {isAdmin && (
                <div className="p-4 pb-0">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-violet-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-violet-600">{announcements.length}</p>
                            <p className="text-xs text-violet-600">Gesamt</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-green-600">
                                {Math.round(announcements.reduce((acc, a) => acc + (a.read_by?.length || 0), 0) / announcements.length)}
                            </p>
                            <p className="text-xs text-green-600">Ø Gelesen</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-blue-600">12</p>
                            <p className="text-xs text-blue-600">Mieter</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcements List */}
            <div className="p-4 space-y-3">
                <AnimatePresence>
                    {filteredAnnouncements.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>Keine Ankündigungen</p>
                            <p className="text-sm">Es gibt aktuell keine neuen Mitteilungen.</p>
                        </div>
                    ) : (
                        filteredAnnouncements.map(announcement => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onRead={handleMarkAsRead}
                                onViewDetails={setSelectedAnnouncement}
                                isAdmin={isAdmin}
                                currentUserId={currentUserId}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Create Dialog (Admin only) */}
            {isAdmin && (
                <CreateAnnouncementDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onSubmit={handleCreateAnnouncement}
                />
            )}

            {/* Detail Dialog */}
            <AnnouncementDetailDialog
                open={!!selectedAnnouncement}
                onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
                announcement={selectedAnnouncement}
                isAdmin={isAdmin}
                onMarkAsRead={handleMarkAsRead}
                currentUserId={currentUserId}
            />
        </div>
    );
}