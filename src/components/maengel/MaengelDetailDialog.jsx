import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    AlertTriangle, 
    Clock, 
    MessageSquare, 
    MapPin, 
    Image as ImageIcon,
    Film,
    Calendar,
    Tag,
    X
} from 'lucide-react';
import StatusTimeline from './StatusTimeline';
import CommentSection from './CommentSection';
import FloorplanMarker from './FloorplanMarker';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = {
    heizung: { label: 'Heizung', icon: '🔥' },
    wasser: { label: 'Wasser/Sanitär', icon: '💧' },
    elektrik: { label: 'Elektrik', icon: '⚡' },
    fenster_tueren: { label: 'Fenster/Türen', icon: '🚪' },
    schimmel: { label: 'Schimmel/Feuchtigkeit', icon: '🦠' },
    sonstiges: { label: 'Sonstiges', icon: '📋' }
};

const STATUS_COLORS = {
    reported: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-violet-100 text-violet-700',
    resolved: 'bg-emerald-100 text-emerald-700'
};

const STATUS_LABELS = {
    reported: 'Gemeldet',
    confirmed: 'Bestätigt',
    in_progress: 'In Bearbeitung',
    resolved: 'Behoben'
};

export default function MaengelDetailDialog({ 
    open, 
    onOpenChange, 
    mangel, 
    currentUserId,
    onAddComment,
    onClose
}) {
    const [activeTab, setActiveTab] = useState('info');
    const [selectedMedia, setSelectedMedia] = useState(null);

    if (!mangel) return null;

    const category = CATEGORIES[mangel.category] || CATEGORIES.sonstiges;
    const status = mangel.status || 'reported';

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <DialogTitle className="flex items-center gap-2 text-lg">
                                    <span className="text-xl">{category.icon}</span>
                                    {mangel.title}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={STATUS_COLORS[status]}>
                                        {STATUS_LABELS[status]}
                                    </Badge>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(mangel.created_at).toLocaleDateString('de-DE')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                        <TabsList className="grid grid-cols-3 mb-2">
                            <TabsTrigger value="info" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Details
                            </TabsTrigger>
                            <TabsTrigger value="status" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Status
                            </TabsTrigger>
                            <TabsTrigger value="comments" className="text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Chat
                                {mangel.comments?.length > 0 && (
                                    <span className="ml-1 bg-violet-500 text-white text-[10px] px-1.5 rounded-full">
                                        {mangel.comments.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto">
                            <TabsContent value="info" className="m-0 space-y-4">
                                {/* Description */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Beschreibung</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        {mangel.description || 'Keine weitere Beschreibung'}
                                    </p>
                                </div>

                                {/* Media Gallery */}
                                {mangel.media?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                            <ImageIcon className="w-4 h-4" />
                                            Fotos & Videos ({mangel.media.length})
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {mangel.media.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                                    onClick={() => setSelectedMedia(item)}
                                                >
                                                    {item.type === 'video' ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                            <Film className="w-6 h-6 text-white" />
                                                            <video 
                                                                src={item.url}
                                                                className="absolute inset-0 w-full h-full object-cover opacity-50"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            src={item.url}
                                                            alt={`Mangel Foto ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Floorplan Marker */}
                                {mangel.floorplanMarker && (
                                    <FloorplanMarker 
                                        marker={mangel.floorplanMarker}
                                        onMarkerChange={() => {}}
                                    />
                                )}

                                {/* Category */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Tag className="w-4 h-4" />
                                    Kategorie: <Badge variant="outline">{category.icon} {category.label}</Badge>
                                </div>
                            </TabsContent>

                            <TabsContent value="status" className="m-0">
                                <StatusTimeline 
                                    currentStatus={status}
                                    statusHistory={mangel.statusHistory || [
                                        { status: 'reported', timestamp: mangel.created_at }
                                    ]}
                                />
                            </TabsContent>

                            <TabsContent value="comments" className="m-0">
                                <CommentSection
                                    comments={mangel.comments || []}
                                    currentUserId={currentUserId}
                                    onAddComment={(comment) => onAddComment(mangel.id, comment)}
                                    disabled={status === 'resolved'}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Media Lightbox */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/20"
                            onClick={() => setSelectedMedia(null)}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                        {selectedMedia.type === 'video' ? (
                            <video
                                src={selectedMedia.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-full rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <img
                                src={selectedMedia.url}
                                alt="Mangel"
                                className="max-w-full max-h-full object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}