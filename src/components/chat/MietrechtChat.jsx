import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Scale, ExternalLink, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import AICostDisplay from '../ai/AICostDisplay';
import AIRateLimitWidget from '../ai/AIRateLimitWidget';
import useAuth from '../useAuth';

export default function MietrechtChat({ 
    userType = null,
    appSource = 'mieterapp',
    contextData = null,
    existingChatId = null,
    onClose
}) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(existingChatId);
    const [suggestedTool, setSuggestedTool] = useState(null);
    const [crossSell, setCrossSell] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0) {
            const welcomeMessage = userType === 'vermieter'
                ? 'Hallo! Ich bin dein Mietrecht-Assistent. Wie kann ich dir als Vermieter heute helfen? 🏠'
                : userType === 'mieter'
                    ? 'Hallo! Ich bin dein Mietrecht-Assistent. Wie kann ich dir als Mieter heute helfen? 🏠'
                    : 'Hallo! Ich bin dein Mietrecht-Assistent. Bist du Mieter oder Vermieter? Wie kann ich dir helfen? 🏠';
            
            setMessages([{
                role: 'assistant',
                content: welcomeMessage,
                timestamp: new Date().toISOString()
            }]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setSuggestedTool(null);

        try {
            // Nutzer-Subscription info abrufen
            const userSubscription = await base44.auth.me().catch(() => null);
            
            const response = await base44.functions.invoke('mietrechtChatV2', {
                message: input,
                chat_id: chatId,
                user_type: userType,
                topic: 'sonstiges',
                app_source: appSource,
                context_data: contextData,
                user_tier: userSubscription?.subscription_tier || 'free'
            });

            const data = response.data;
            setChatId(data.chat_id);

            const assistantMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString(),
                usage: data.tokens_used ? { 
                    cost_eur: data.cost_eur, 
                    savings_eur: data.savings_eur 
                } : null
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (data.suggested_tool) {
                setSuggestedTool(data.suggested_tool);
            }

            if (data.cross_sell) {
                setCrossSell(data.cross_sell);
            }

        } catch (error) {
            console.error('Chat Error:', error);
            
            // Bessere Fehlerbehandlung
            let errorMessage = 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.';
            
            if (error.response?.status === 429 || error.message?.includes('Rate-Limit') || error.message?.includes('Budget')) {
                errorMessage = error.message || 'Rate-Limit oder Budget erreicht. Bitte später erneut versuchen.';
                toast.error('AI-Limit erreicht');
            } else if (error.message?.includes('Unauthorized')) {
                errorMessage = 'Bitte melde dich an, um den Chat zu nutzen.';
                toast.error('Anmeldung erforderlich');
            } else {
                toast.error('Fehler beim Chat');
            }
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date().toISOString(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const formatMessage = (text) => {
        return text.split(/(\*\*.*?\*\*)/).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-xl">
            
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold">Mietrecht-Assistent</h3>
                    <p className="text-sm text-white/80">Deine Fragen zum deutschen Mietrecht</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        ✕
                    </button>
                )}
            </div>

            {/* Disclaimer + Rate Limit */}
            <div className="px-4 py-2 bg-yellow-50 border-b text-xs text-yellow-700">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Dies ist keine Rechtsberatung. Bei wichtigen Entscheidungen einen Anwalt konsultieren.</span>
                    </div>
                    {user && <AIRateLimitWidget userEmail={user.email} />}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : msg.isError 
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-gray-100 text-gray-800'
                        }`}>
                            <div className="whitespace-pre-wrap text-sm">
                                {formatMessage(msg.content)}
                            </div>
                            
                            {msg.metadata?.complexity === 'komplex' && (
                                <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Komplexer Fall - Anwalt empfohlen
                                </div>
                            )}

                            {msg.role === 'assistant' && msg.usage && (
                                <AICostDisplay usage={msg.usage} />
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Tool */}
            {suggestedTool && (
                <div className="mx-4 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-blue-900">{suggestedTool.icon} {suggestedTool.name}</p>
                            <p className="text-sm text-blue-700">{suggestedTool.description}</p>
                        </div>
                        <a 
                            href={suggestedTool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            Öffnen
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            )}

            {/* Cross-Sell Banner */}
            {crossSell && crossSell.priority !== 'low' && (
                <div className="mx-4 mb-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{crossSell.message}</p>
                    <a 
                        href={crossSell.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                        {crossSell.cta}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Stelle deine Frage zum Mietrecht..."
                        disabled={loading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                    {[
                        'Nebenkosten prüfen',
                        'Mieterhöhung',
                        'Kündigung',
                        'Mängel melden'
                    ].map((action) => (
                        <button
                            key={action}
                            onClick={() => setInput(action)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}