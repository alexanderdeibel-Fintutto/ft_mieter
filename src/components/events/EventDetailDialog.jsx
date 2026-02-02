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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    MessageSquare, 
    Send,
    UserCheck,
    UserX,
    HelpCircle,
    Pencil,
    X,
    Share2,
    Loader2,
    Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const RSVP_STATUS = {
    attending: { label: 'Zusage', icon: UserCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    maybe: { label: 'Vielleicht', icon: HelpCircle, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    declined: { label: 'Absage', icon: UserX, color: 'bg-red-100 text-red-700 border-red-200' }
};

const CATEGORY_COLORS = {
    fest: 'bg-pink-100 text-pink-700',
    flohmarkt: 'bg-green-100 text-green-700',
    sport: 'bg-blue-100 text-blue-700',
    kultur: 'bg-purple-100 text-purple-700',
    kinder: 'bg-yellow-100 text-yellow-700',
    sonstiges: 'bg-gray-100 text-gray-700'
};

// Demo participants with RSVP status
const DEMO_PARTICIPANTS = [
    { id: 'user-101', name: 'Maria K.', avatar: null, rsvpStatus: 'attending' },
    { id: 'user-102', name: 'Jonas M.', avatar: null, rsvpStatus: 'attending' },
    { id: 'user-103', name: 'Peter S.', avatar: null, rsvpStatus: 'maybe' },
    { id: 'current-user', name: 'Du', avatar: null, rsvpStatus: 'attending' },
];

// Demo comments
const DEMO_COMMENTS = [
    { id: 1, authorId: 'user-101', authorName: 'Maria K.', text: 'Freue mich schon! Soll ich Salat mitbringen?', timestamp: '2026-01-20T14:30:00Z' },
    { id: 2, authorId: 'user-102', authorName: 'Jonas M.', text: 'Super Idee! Ich bringe Getränke mit.', timestamp: '2026-01-20T15:45:00Z' },
];

function RSVPButton({ status, isActive, onClick, count }) {
    const config = RSVP_STATUS[status];
    const Icon = config.icon;
    
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                isActive 
                    ? `${config.color} border-current` 
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
            }`}
        >
            <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${isActive ? '' : 'text-gray-600'}`}>{config.label}</span>
            {count > 0 && (
                <span className="text-xs text-gray-500">{count}</span>
            )}
        </button>
    );
}

function ParticipantsList({ participants, currentUserId }) {
    const grouped = {
        attending: participants.filter(p => p.rsvpStatus === 'attending'),
        maybe: participants.filter(p => p.rsvpStatus === 'maybe'),
        declined: participants.filter(p => p.rsvpStatus === 'declined')
    };

    return (
        <div className="space-y-4">
            {Object.entries(grouped).map(([status, list]) => {
                if (list.length === 0) return null;
                const config = RSVP_STATUS[status];
                const Icon = config.icon;
                
                return (
                    <div key={status}>
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-4 h-4 ${
                                status === 'attending' ? 'text-emerald-600' :
                                status === 'maybe' ? 'text-amber-600' : 'text-red-600'
                            }`} />
                            <span className="text-sm font-medium text-gray-700">
                                {config.label} ({list.length})
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {list.map(participant => (
                                <Link
                                    key={participant.id}
                                    to={createPageUrl('NachbarProfil') + `?id=${participant.id}`}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={participant.avatar} />
                                        <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                                            {participant.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-gray-700">
                                        {participant.id === currentUserId ? 'Du' : participant.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function CommentItem({ comment, isOwn }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                    {comment.authorName.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                        {isOwn ? 'Du' : comment.authorName}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(comment.timestamp).toLocaleString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
                <div className={`rounded-xl p-3 ${
                    isOwn ? 'bg-violet-100 border-violet-200' : 'bg-gray-100 border-gray-200'
                } border`}>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default function EventDetailDialog({ 
    open, 
    onOpenChange, 
    event,
    currentUserId,
    onRSVPChange,
    onAddComment,
    onEdit,
    onCancel
}) {
    const [activeTab, setActiveTab] = useState('info');
    const [newComment, setNewComment] = useState('');
    const [sending, setSending] = useState(false);

    if (!event) return null;

    const isPast = new Date(event.date) < new Date();
    const isCancelled = event.status === 'cancelled';
    const isCreator = event.creatorId === currentUserId;
    
    // Get participants with RSVP status (use demo data or event data)
    const participants = event.participantsData || DEMO_PARTICIPANTS.filter(p => 
        event.participants?.includes(p.id)
    );
    
    // Get current user's RSVP status
    const currentUserRSVP = participants.find(p => p.id === currentUserId)?.rsvpStatus || null;
    const isJoined = event.participants?.includes(currentUserId);

    // Get comments
    const comments = event.comments || DEMO_COMMENTS;

    const handleRSVPClick = (status) => {
        if (isPast || isCancelled) return;
        onRSVPChange(event, status);
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;

        setSending(true);
        await onAddComment(event.id, {
            text: newComment.trim(),
            timestamp: new Date().toISOString(),
            authorId: currentUserId,
            authorName: 'Du'
        });
        setNewComment('');
        setSending(false);
        toast.success('Kommentar gesendet');
    };

    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `${event.title} - ${new Date(event.date).toLocaleDateString('de-DE')} um ${event.time} Uhr`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
                toast.success('In Zwischenablage kopiert!');
            }
        } catch (err) {
            // User cancelled share
        }
    };

    const spotsLeft = event.maxParticipants 
        ? event.maxParticipants - (event.participants?.length || 0) 
        : null;

    const attendingCount = participants.filter(p => p.rsvpStatus === 'attending').length;
    const maybeCount = participants.filter(p => p.rsvpStatus === 'maybe').length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header Image */}
                {event.image && (
                    <div className="h-40 relative">
                        <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4">
                            <Badge className={`${CATEGORY_COLORS[event.category]} mb-2`}>
                                {event.categoryLabel}
                            </Badge>
                            <h2 className="text-xl font-bold text-white">{event.title}</h2>
                        </div>
                        {isCancelled && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Badge variant="destructive" className="text-lg py-2 px-4">ABGESAGT</Badge>
                            </div>
                        )}
                    </div>
                )}

                {!event.image && (
                    <DialogHeader className="p-4 pb-2">
                        <div className="flex items-start gap-2">
                            <Badge className={CATEGORY_COLORS[event.category]}>
                                {event.categoryLabel}
                            </Badge>
                            {event.isRecurring && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Repeat className="w-3 h-3" />
                                    Wiederkehrend
                                </Badge>
                            )}
                        </div>
                        <DialogTitle className="text-xl">{event.title}</DialogTitle>
                    </DialogHeader>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid grid-cols-3 mx-4 mb-2">
                        <TabsTrigger value="info" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="participants" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Teilnehmer
                            <span className="ml-1 bg-violet-500 text-white text-[10px] px-1.5 rounded-full">
                                {participants.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="discussion" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Diskussion
                            {comments.length > 0 && (
                                <span className="ml-1 bg-violet-500 text-white text-[10px] px-1.5 rounded-full">
                                    {comments.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto px-4">
                        <TabsContent value="info" className="m-0 space-y-4 pb-4">
                            {/* Description */}
                            <p className="text-sm text-gray-600">{event.description}</p>

                            {/* Event Details */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-violet-600" />
                                    <span>
                                        {new Date(event.date).toLocaleDateString('de-DE', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="w-4 h-4 text-violet-600" />
                                    <span>{event.time} Uhr</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-violet-600" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="w-4 h-4 text-violet-600" />
                                    <span>
                                        {attendingCount} Zusagen
                                        {maybeCount > 0 && `, ${maybeCount} vielleicht`}
                                        {spotsLeft !== null && spotsLeft > 0 && ` · ${spotsLeft} Plätze frei`}
                                        {spotsLeft === 0 && ' · Ausgebucht'}
                                    </span>
                                </div>
                            </div>

                            {/* Organizer */}
                            <div className="flex items-center justify-between">
                                <Link 
                                    to={createPageUrl('NachbarProfil') + `?id=${event.creatorId}`}
                                    className="flex items-center gap-2 hover:opacity-80"
                                >
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="bg-violet-100 text-violet-700">
                                            {event.creator.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{event.creator}</p>
                                        <p className="text-xs text-gray-500">Organisator</p>
                                    </div>
                                </Link>
                                <Button variant="outline" size="sm" onClick={handleShare}>
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Teilen
                                </Button>
                            </div>

                            {/* RSVP Section */}
                            {!isPast && !isCancelled && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Deine Antwort</p>
                                    <div className="flex gap-2">
                                        <RSVPButton 
                                            status="attending" 
                                            isActive={currentUserRSVP === 'attending' || (isJoined && !currentUserRSVP)}
                                            onClick={() => handleRSVPClick('attending')}
                                            count={attendingCount}
                                        />
                                        <RSVPButton 
                                            status="maybe" 
                                            isActive={currentUserRSVP === 'maybe'}
                                            onClick={() => handleRSVPClick('maybe')}
                                            count={maybeCount}
                                        />
                                        <RSVPButton 
                                            status="declined" 
                                            isActive={currentUserRSVP === 'declined'}
                                            onClick={() => handleRSVPClick('declined')}
                                            count={0}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Creator Actions */}
                            {isCreator && !isPast && !isCancelled && (
                                <div className="flex gap-2 border-t pt-4">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => {
                                            onOpenChange(false);
                                            onEdit(event);
                                        }}
                                    >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Bearbeiten
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            onOpenChange(false);
                                            onCancel(event);
                                        }}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Absagen
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="participants" className="m-0 pb-4">
                            <ParticipantsList 
                                participants={participants}
                                currentUserId={currentUserId}
                            />
                        </TabsContent>

                        <TabsContent value="discussion" className="m-0 pb-4 flex flex-col h-full">
                            {/* Comments List */}
                            <div className="space-y-4 flex-1 mb-4">
                                {comments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">Noch keine Kommentare</p>
                                        <p className="text-xs">Starte die Diskussion!</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {comments.map(comment => (
                                            <CommentItem
                                                key={comment.id}
                                                comment={comment}
                                                isOwn={comment.authorId === currentUserId}
                                            />
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* Comment Input */}
                            {!isCancelled && (
                                <form onSubmit={handleSendComment} className="flex gap-2 sticky bottom-0 bg-white pt-2">
                                    <Textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Schreibe einen Kommentar..."
                                        className="resize-none min-h-[60px]"
                                        disabled={sending}
                                    />
                                    <Button 
                                        type="submit" 
                                        disabled={!newComment.trim() || sending}
                                        className="bg-violet-600 hover:bg-violet-700 self-end"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </Button>
                                </form>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}