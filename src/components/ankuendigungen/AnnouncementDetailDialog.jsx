import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Megaphone, 
    Wrench, 
    Calendar, 
    AlertTriangle,
    Bell,
    Info,
    Clock,
    User,
    CheckCheck,
    Check,
    Eye,
    Users
} from 'lucide-react';

const PRIORITY_STYLES = {
    urgent: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, label: 'Dringend' },
    important: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Bell, label: 'Wichtig' },
    normal: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info, label: 'Info' },
};

const CATEGORY_STYLES = {
    allgemein: { icon: Megaphone, label: 'Allgemein', color: 'text-violet-600', bg: 'bg-violet-100' },
    wartung: { icon: Wrench, label: 'Wartung', color: 'text-amber-600', bg: 'bg-amber-100' },
    termin: { icon: Calendar, label: 'Termin', color: 'text-blue-600', bg: 'bg-blue-100' },
    sicherheit: { icon: AlertTriangle, label: 'Sicherheit', color: 'text-red-600', bg: 'bg-red-100' },
};

// Demo read confirmations
const DEMO_READERS = [
    { id: 'user-1', name: 'Anna Müller', read_at: '2025-01-20T14:30:00' },
    { id: 'user-2', name: 'Thomas Schmidt', read_at: '2025-01-20T15:45:00' },
    { id: 'user-3', name: 'Maria Weber', read_at: '2025-01-21T09:00:00' },
    { id: 'user-4', name: 'Klaus Fischer', read_at: '2025-01-21T10:15:00' },
    { id: 'user-5', name: 'Sabine Braun', read_at: '2025-01-21T11:30:00' },
];

export default function AnnouncementDetailDialog({ 
    open, 
    onOpenChange, 
    announcement,
    isAdmin,
    onMarkAsRead,
    currentUserId
}) {
    if (!announcement) return null;

    const priorityStyle = PRIORITY_STYLES[announcement.priority] || PRIORITY_STYLES.normal;
    const categoryStyle = CATEGORY_STYLES[announcement.category] || CATEGORY_STYLES.allgemein;
    const PriorityIcon = priorityStyle.icon;
    const CategoryIcon = categoryStyle.icon;
    
    const isRead = announcement.read_by?.includes(currentUserId);
    const readCount = announcement.read_by?.length || 0;
    const readPercentage = Math.round((readCount / announcement.total_recipients) * 100);

    // Get readers (demo)
    const readers = DEMO_READERS.filter(r => announcement.read_by?.includes(r.id));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${categoryStyle.bg}`}>
                            <CategoryIcon className={`w-5 h-5 ${categoryStyle.color}`} />
                        </div>
                        <Badge className={`${priorityStyle.bg} ${priorityStyle.text} gap-1`}>
                            <PriorityIcon className="w-3 h-3" />
                            {priorityStyle.label}
                        </Badge>
                    </div>
                    <DialogTitle className="text-xl">{announcement.title}</DialogTitle>
                </DialogHeader>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pb-4 border-b">
                    <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {announcement.author}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(announcement.created_at).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>

                {/* Content */}
                <div className="py-4">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {announcement.content}
                    </p>
                </div>

                {/* Expiry Info */}
                {announcement.expires_at && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-700 mb-4">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                            Gültig bis: {new Date(announcement.expires_at).toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                )}

                {/* Read Status (for tenant) */}
                {!isAdmin && (
                    <div className="pt-4 border-t">
                        {isRead ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCheck className="w-5 h-5" />
                                <span>Du hast diese Ankündigung gelesen</span>
                            </div>
                        ) : (
                            <Button
                                onClick={() => onMarkAsRead(announcement.id)}
                                className="w-full bg-violet-600 hover:bg-violet-700"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Als gelesen markieren
                            </Button>
                        )}
                    </div>
                )}

                {/* Read Confirmations (Admin only) */}
                {isAdmin && (
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Lesebestätigungen
                        </h4>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">
                                    {readCount} von {announcement.total_recipients} Mietern
                                </span>
                                <span className="font-medium text-violet-600">{readPercentage}%</span>
                            </div>
                            <Progress value={readPercentage} className="h-2" />
                        </div>

                        {/* Readers List */}
                        {readers.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {readers.map(reader => (
                                    <div 
                                        key={reader.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                {reader.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{reader.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(reader.read_at).toLocaleDateString('de-DE', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>Noch keine Lesebestätigungen</p>
                            </div>
                        )}

                        {/* Unread info */}
                        {readCount < announcement.total_recipients && (
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                {announcement.total_recipients - readCount} Mieter haben die Ankündigung noch nicht gelesen
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}