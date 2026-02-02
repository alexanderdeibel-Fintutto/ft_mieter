import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, User, UserCog, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function RepairChat({ repairId, currentUser, isAdmin }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (repairId) {
            loadMessages();
            // Subscribe to real-time updates
            const unsubscribe = base44.entities.RepairMessage.subscribe((event) => {
                if (event.data?.repair_id === repairId) {
                    if (event.type === 'create') {
                        setMessages(prev => [...prev, event.data]);
                    }
                }
            });
            return unsubscribe;
        }
    }, [repairId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.RepairMessage.filter({ repair_id: repairId }, 'created_date');
            setMessages(data || []);
        } catch (error) {
            console.error('Fehler beim Laden der Nachrichten:', error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await base44.entities.RepairMessage.create({
                repair_id: repairId,
                sender_id: currentUser?.id || currentUser?.email,
                sender_name: currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Unbekannt',
                sender_role: isAdmin ? 'verwaltung' : 'mieter',
                message: newMessage.trim(),
                is_read: false
            });
            setNewMessage('');
        } catch (error) {
            console.error('Fehler beim Senden:', error);
        } finally {
            setIsSending(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'verwaltung':
            case 'hausmeister':
                return <UserCog className="w-3 h-3" />;
            default:
                return <User className="w-3 h-3" />;
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'verwaltung':
                return <Badge className="bg-purple-100 text-purple-700 text-xs">Verwaltung</Badge>;
            case 'hausmeister':
                return <Badge className="bg-blue-100 text-blue-700 text-xs">Hausmeister</Badge>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 max-h-[300px] min-h-[200px]">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                        <MessageCircle className="w-10 h-10 mb-2" />
                        <p className="text-sm">Noch keine Nachrichten</p>
                        <p className="text-xs">Starten Sie die Kommunikation</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.sender_id === (currentUser?.id || currentUser?.email);
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                    {/* Sender Info */}
                                    <div className={`flex items-center gap-1 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        {getRoleIcon(msg.sender_role)}
                                        <span className="text-xs text-gray-500">{msg.sender_name}</span>
                                        {getRoleBadge(msg.sender_role)}
                                    </div>
                                    {/* Message Bubble */}
                                    <div
                                        className={`p-3 rounded-2xl ${
                                            isOwn
                                                ? 'bg-amber-500 text-white rounded-br-md'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-md'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    {/* Timestamp */}
                                    <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                        {format(new Date(msg.created_date), 'dd.MM. HH:mm', { locale: de })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t mt-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht schreiben..."
                    className="flex-1"
                    disabled={isSending}
                />
                <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || isSending}
                    className="bg-amber-500 hover:bg-amber-600"
                >
                    {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}