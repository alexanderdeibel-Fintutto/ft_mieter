import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Paperclip, Image, User, Building2, Wrench, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ROLE_CONFIG = {
    tenant: {
        label: 'Mieter',
        icon: User,
        bgColor: 'bg-violet-100',
        textColor: 'text-violet-700',
        bubbleColor: 'bg-violet-50 border-violet-200'
    },
    management: {
        label: 'Hausverwaltung',
        icon: Building2,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        bubbleColor: 'bg-blue-50 border-blue-200'
    },
    technician: {
        label: 'Hausmeister',
        icon: Wrench,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        bubbleColor: 'bg-amber-50 border-amber-200'
    }
};

function CommentBubble({ comment, isOwn }) {
    const role = ROLE_CONFIG[comment.role] || ROLE_CONFIG.tenant;
    const RoleIcon = role.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback className={role.bgColor}>
                    <RoleIcon className={`w-4 h-4 ${role.textColor}`} />
                </AvatarFallback>
            </Avatar>

            <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${role.textColor}`}>
                        {comment.authorName || role.label}
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

                <div className={`rounded-xl p-3 border ${role.bubbleColor}`}>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                    
                    {comment.attachments?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {comment.attachments.map((att, i) => (
                                <a
                                    key={i}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-violet-600 hover:underline bg-white px-2 py-1 rounded border"
                                >
                                    {att.type === 'image' ? <Image className="w-3 h-3" /> : <Paperclip className="w-3 h-3" />}
                                    {att.name || 'Anhang'}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function CommentSection({ 
    comments = [], 
    onAddComment, 
    currentUserId,
    disabled = false 
}) {
    const [newComment, setNewComment] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;

        setSending(true);
        try {
            await onAddComment({
                text: newComment.trim(),
                timestamp: new Date().toISOString(),
                role: 'tenant',
                authorId: currentUserId
            });
            setNewComment('');
            toast.success('Kommentar gesendet');
        } catch (error) {
            toast.error('Fehler beim Senden');
        }
        setSending(false);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-violet-600" />
                Kommunikation
            </h3>

            {/* Comments List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto p-2">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Noch keine Nachrichten. Stellen Sie hier Rückfragen oder geben Sie zusätzliche Informationen.
                    </p>
                ) : (
                    <AnimatePresence>
                        {comments.map((comment, index) => (
                            <CommentBubble
                                key={comment.id || index}
                                comment={comment}
                                isOwn={comment.authorId === currentUserId}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Input */}
            {!disabled && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Nachricht schreiben..."
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
        </div>
    );
}