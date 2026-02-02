import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Wrench,
    MapPin,
    Home,
    Clock,
    User,
    Calendar,
    Phone,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Image as ImageIcon,
    MessageSquare,
    History,
    UserCog,
    Send,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import RepairChat from './RepairChat';
import RepairProgressBar from './RepairProgressBar';

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

// Demo contractors
const CONTRACTORS = [
    { id: 'c1', name: 'Sanitär Meier', phone: '0171 1234567', specialty: 'sanitaer' },
    { id: 'c2', name: 'Elektro Fischer', phone: '0172 2345678', specialty: 'elektrik' },
    { id: 'c3', name: 'Heizungsbau Schmidt', phone: '0173 3456789', specialty: 'heizung' },
    { id: 'c4', name: 'Fensterbau Huber', phone: '0174 4567890', specialty: 'fenster_tueren' },
    { id: 'c5', name: 'Allround Handwerker Weber', phone: '0175 5678901', specialty: 'sonstiges' },
];

function HistoryTimeline({ history }) {
    return (
        <div className="space-y-3">
            {history.map((entry, index) => (
                <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-violet-500' : 'bg-gray-300'}`} />
                        {index < history.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                        <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })} • {entry.by}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function RepairDetailDialog({ open, onOpenChange, repair, isAdmin, onUpdate, currentUser }) {
    const [activeTab, setActiveTab] = useState('details');
    const [contractorForm, setContractorForm] = useState({
        contractor_id: '',
        scheduled_date: '',
        scheduled_time: '',
        notes: ''
    });
    const [statusNote, setStatusNote] = useState('');
    const [photoIndex, setPhotoIndex] = useState(0);
    const [showPhotoLightbox, setShowPhotoLightbox] = useState(false);

    if (!repair) return null;

    const status = STATUS_CONFIG[repair.status];
    const category = CATEGORY_CONFIG[repair.category];
    const StatusIcon = status?.icon || AlertCircle;

    const handleStatusUpdate = (newStatus) => {
        onUpdate(repair.id, {
            status: newStatus,
            historyEntry: `Status: ${STATUS_CONFIG[newStatus].label}`
        });
    };

    const handleAssignContractor = () => {
        const contractor = CONTRACTORS.find(c => c.id === contractorForm.contractor_id);
        if (!contractor) return;

        onUpdate(repair.id, {
            status: contractorForm.scheduled_date ? 'termin_vereinbart' : 'handwerker_beauftragt',
            contractor: {
                name: contractor.name,
                phone: contractor.phone,
                scheduled_date: contractorForm.scheduled_date || null,
                scheduled_time: contractorForm.scheduled_time || null,
            },
            historyEntry: contractorForm.scheduled_date 
                ? `Termin vereinbart mit ${contractor.name}: ${new Date(contractorForm.scheduled_date).toLocaleDateString('de-DE')}${contractorForm.scheduled_time ? ` um ${contractorForm.scheduled_time} Uhr` : ''}`
                : `Handwerker ${contractor.name} beauftragt`
        });

        setContractorForm({ contractor_id: '', scheduled_date: '', scheduled_time: '', notes: '' });
    };

    const handleComplete = () => {
        onUpdate(repair.id, {
            status: 'abgeschlossen',
            historyEntry: 'Reparatur abgeschlossen'
        });
    };

    const handleSendNote = () => {
        if (!statusNote.trim()) return;
        onUpdate(repair.id, {
            historyEntry: `Nachricht: ${statusNote}`
        });
        setStatusNote('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-2xl">
                            {category?.emoji || '🔧'}
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg">{repair.title}</DialogTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge className={status?.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status?.label}
                                </Badge>
                                {repair.priority === 'hoch' && (
                                    <Badge className="bg-orange-100 text-orange-700">Dringend</Badge>
                                )}
                                {repair.priority === 'notfall' && (
                                    <Badge className="bg-red-100 text-red-700">Notfall</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="w-full">
                        <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                        <TabsTrigger value="chat" className="flex-1">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex-1">Verlauf</TabsTrigger>
                        {isAdmin && <TabsTrigger value="manage" className="flex-1">Verwalten</TabsTrigger>}
                    </TabsList>

                    <div className="flex-1 overflow-y-auto">
                        <TabsContent value="details" className="mt-4 space-y-4">
                            {/* Progress Bar */}
                            <RepairProgressBar status={repair.status} />

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{repair.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Home className="w-4 h-4 text-gray-400" />
                                    <span>{repair.apartment}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>{repair.tenant_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{new Date(repair.created_at).toLocaleDateString('de-DE')}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Beschreibung</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {repair.description || 'Keine weitere Beschreibung'}
                                </p>
                            </div>

                            {/* Photos with Gallery */}
                            {repair.photos?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Fotos ({repair.photos.length})
                                    </h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {repair.photos.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Foto ${index + 1}`}
                                                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    setPhotoIndex(index);
                                                    setShowPhotoLightbox(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Photo Lightbox */}
                            {showPhotoLightbox && repair.photos?.length > 0 && (
                                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                                    <button
                                        onClick={() => setShowPhotoLightbox(false)}
                                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    
                                    {repair.photos.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setPhotoIndex(prev => prev === 0 ? repair.photos.length - 1 : prev - 1)}
                                                className="absolute left-4 text-white p-2 hover:bg-white/20 rounded-full"
                                            >
                                                <ChevronLeft className="w-8 h-8" />
                                            </button>
                                            <button
                                                onClick={() => setPhotoIndex(prev => prev === repair.photos.length - 1 ? 0 : prev + 1)}
                                                className="absolute right-4 text-white p-2 hover:bg-white/20 rounded-full"
                                            >
                                                <ChevronRight className="w-8 h-8" />
                                            </button>
                                        </>
                                    )}
                                    
                                    <img
                                        src={repair.photos[photoIndex]}
                                        alt={`Foto ${photoIndex + 1}`}
                                        className="max-w-[90vw] max-h-[80vh] object-contain"
                                    />
                                    
                                    <div className="absolute bottom-4 text-white text-sm">
                                        {photoIndex + 1} / {repair.photos.length}
                                    </div>
                                </div>
                            )}

                            {/* Contractor Info */}
                            {repair.contractor && (
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                                        <UserCog className="w-4 h-4" />
                                        Beauftragter Handwerker
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{repair.contractor.name}</p>
                                        <p className="flex items-center gap-2 text-purple-600">
                                            <Phone className="w-3 h-3" />
                                            {repair.contractor.phone}
                                        </p>
                                        {repair.contractor.scheduled_date && (
                                            <p className="flex items-center gap-2 text-purple-600">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(repair.contractor.scheduled_date).toLocaleDateString('de-DE')}
                                                {repair.contractor.scheduled_time && ` um ${repair.contractor.scheduled_time} Uhr`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="chat" className="mt-4">
                            <RepairChat 
                                repairId={repair.id} 
                                currentUser={currentUser}
                                isAdmin={isAdmin}
                            />
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <HistoryTimeline history={[...repair.history].reverse()} />
                        </TabsContent>

                        {isAdmin && (
                            <TabsContent value="manage" className="mt-4 space-y-4">
                                {/* Status Update */}
                                <div>
                                    <Label>Status ändern</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleStatusUpdate(key)}
                                                    disabled={repair.status === key}
                                                    className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                                                        repair.status === key
                                                            ? 'border-violet-500 bg-violet-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Icon className="w-3 h-3" />
                                                    {config.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Assign Contractor */}
                                {repair.status !== 'abgeschlossen' && (
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                                        <h4 className="font-medium text-sm flex items-center gap-2">
                                            <UserCog className="w-4 h-4" />
                                            Handwerker beauftragen
                                        </h4>
                                        <Select 
                                            value={contractorForm.contractor_id} 
                                            onValueChange={(v) => setContractorForm(prev => ({ ...prev, contractor_id: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Handwerker auswählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CONTRACTORS.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                type="date"
                                                value={contractorForm.scheduled_date}
                                                onChange={(e) => setContractorForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <Input
                                                type="time"
                                                value={contractorForm.scheduled_time}
                                                onChange={(e) => setContractorForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleAssignContractor}
                                            disabled={!contractorForm.contractor_id}
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                            size="sm"
                                        >
                                            Handwerker beauftragen
                                        </Button>
                                    </div>
                                )}

                                {/* Send Note */}
                                <div>
                                    <Label>Nachricht an Mieter</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            value={statusNote}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                            placeholder="Status-Update oder Nachricht..."
                                        />
                                        <Button onClick={handleSendNote} disabled={!statusNote.trim()} size="icon">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Complete Button */}
                                {repair.status !== 'abgeschlossen' && (
                                    <Button
                                        onClick={handleComplete}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Reparatur abschließen
                                    </Button>
                                )}
                            </TabsContent>
                        )}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}