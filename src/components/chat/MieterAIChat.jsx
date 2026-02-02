import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, 
    Send, 
    Loader2, 
    Bot, 
    User,
    Wrench,
    FileText,
    Euro,
    Home,
    Users,
    Shield,
    HelpCircle,
    Sparkles,
    X,
    Minimize2,
    Maximize2,
    ExternalLink,
    Plus,
    MessageCircle,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCrossSell } from '../crosssell/CrossSellProvider';
import useSubscription from '../useSubscription';
import { UpgradeModal } from '../integrations/stripe';

// Prüft ob eine Frage komplex/rechtlich ist
const isComplexLegalQuestion = (message) => {
    const text = message.toLowerCase();
    const complexKeywords = [
        'mieterhöhung', 'mieterhöhungen', 'erhöhen', 'erhöht',
        'kündigung', 'kündigen', 'kündigungsfrist', 'gekündigt',
        'nebenkostenabrechnung', 'nebenkosten', 'abrechnung', 'nachzahlung',
        'kaution', 'kautionsrückzahlung', 'kaution zurück',
        'mietminderung', 'mindern', 'mängel', 'schimmel', 'wasserschaden',
        'eigenbedarfskündigung', 'eigenbedarf',
        'mietpreisbremse', 'mietspiegel', 'ortsübliche vergleichsmiete',
        'rechte', 'pflichten', 'rechtlich', 'gesetz', 'bgb', 'paragraph', '§',
        'anwalt', 'verklagen', 'klage', 'gericht',
        'frist', 'fristen', 'verspätet', 'zu spät',
        'vertrag', 'mietvertrag', 'klausel', 'unwirksam',
        'renovierung', 'schönheitsreparaturen', 'streichen',
        'untervermietung', 'untermieter',
        'hausordnung verletzt', 'ruhezeiten', 'lärm beschwerde',
        'betriebskosten prüfen', 'heizkosten', 'warmwasser'
    ];
    
    const simpleKeywords = [
        'wo finde ich', 'wie kann ich', 'zeig mir', 'öffne',
        'navigation', 'app', 'funktion', 'feature', 'button'
    ];
    
    // Wenn eindeutig simple Frage
    if (simpleKeywords.some(keyword => text.includes(keyword))) {
        return false;
    }
    
    // Wenn komplexe Keywords enthalten
    return complexKeywords.some(keyword => text.includes(keyword));
};

// Kurze Antworten für Teaser
const getShortLegalAnswer = (message) => {
    const text = message.toLowerCase();
    
    if (text.includes('mieterhöhung') || text.includes('erhöhen')) {
        return 'Mieterhöhungen müssen bestimmte gesetzliche Voraussetzungen erfüllen. Es gibt die Kappungsgrenze (max. 20% in 3 Jahren) und die ortsübliche Vergleichsmiete als Obergrenze.';
    }
    if (text.includes('kündigung') || text.includes('kündigungsfrist')) {
        return 'Als Mieter hast du eine gesetzliche Kündigungsfrist von 3 Monaten. Bei Vermieterkündigungen gelten längere Fristen je nach Mietdauer.';
    }
    if (text.includes('nebenkostenabrechnung') || text.includes('nebenkosten')) {
        return 'Die Nebenkostenabrechnung muss innerhalb von 12 Monaten nach Ende des Abrechnungszeitraums kommen. Du hast dann Zeit, sie zu prüfen.';
    }
    if (text.includes('kaution')) {
        return 'Die Kaution darf maximal 3 Monatsmieten betragen und muss verzinst angelegt werden. Nach Auszug muss sie innerhalb von 3-6 Monaten zurückgezahlt werden.';
    }
    if (text.includes('mietminderung') || text.includes('mängel') || text.includes('schimmel')) {
        return 'Bei Mängeln in der Wohnung kannst du unter Umständen die Miete mindern. Wichtig: Erst den Mangel dem Vermieter melden!';
    }
    if (text.includes('eigenbedarf')) {
        return 'Eigenbedarfskündigungen müssen gut begründet sein. Der Vermieter muss nachweisen, dass er die Wohnung für sich oder nahe Angehörige braucht.';
    }
    
    return 'Das ist ein wichtiges Mietrecht-Thema. Die genaue Antwort hängt von den Details deiner Situation ab.';
};

const QUICK_TOPICS = [
    { 
        id: 'reparatur', 
        label: 'Reparatur melden', 
        icon: Wrench, 
        color: 'bg-amber-100 text-amber-700',
        prompt: 'Ich möchte einen Schaden oder ein Problem in meiner Wohnung melden. Wie gehe ich am besten vor?'
    },
    { 
        id: 'nebenkosten', 
        label: 'Nebenkosten', 
        icon: Euro, 
        color: 'bg-green-100 text-green-700',
        prompt: 'Kannst du mir meine Nebenkostenabrechnung erklären? Was sind typische Positionen und wie werden sie berechnet?'
    },
    { 
        id: 'mietvertrag', 
        label: 'Mietvertrag', 
        icon: FileText, 
        color: 'bg-blue-100 text-blue-700',
        prompt: 'Ich habe eine Frage zu meinem Mietvertrag. Was sind meine wichtigsten Rechte und Pflichten als Mieter?'
    },
    { 
        id: 'hausordnung', 
        label: 'Hausordnung', 
        icon: Home, 
        color: 'bg-purple-100 text-purple-700',
        prompt: 'Was steht in der Hausordnung? Welche Ruhezeiten gelten und was muss ich beachten?'
    },
    { 
        id: 'nachbarn', 
        label: 'Nachbarschaft', 
        icon: Users, 
        color: 'bg-pink-100 text-pink-700',
        prompt: 'Wie kann ich Konflikte mit Nachbarn lösen? Gibt es Tipps für ein gutes Zusammenleben?'
    },
    { 
        id: 'sicherheit', 
        label: 'Sicherheit', 
        icon: Shield, 
        color: 'bg-red-100 text-red-700',
        prompt: 'Was muss ich bei Sicherheitsthemen beachten? Rauchmelder, Notausgänge, Einbruchschutz?'
    },
];

const SYSTEM_PROMPT = `Du bist ein freundlicher und hilfreicher AI-Assistent für Mieter in einer Community-Wohnanlage. 
Du kennst die App und hilfst Mietern, sich zurechtzufinden und ihre Anliegen zu lösen.

🎯 CROSS-SELLING HINWEISE:
Bei passenden Gelegenheiten erwähne subtil Premium-Features:
- Dokumenten-Upload unlimitiert → Basic (4,90€/Monat)
- LetterXpress Integration → Basic (Briefe direkt aus der App)
- Mietrecht-Assistent unlimited → Pro (9,90€/Monat)
- Automatische Zahlungserinnerungen → Basic
Bleibe dezent und nutzerorientiert, keine aggressive Verkaufssprache!

WICHTIGE APP-FUNKTIONEN, DIE DU KENNEN SOLLST:

📍 NAVIGATION IN DER APP:
- Home: Personalisierter Feed mit News und Updates
- Karte: Nachbarschaftskarte für lokale Anfragen und Angebote
- Reparaturen: Schäden melden und Status verfolgen
- Chat: Mit Nachbarn kommunizieren
- Marktplatz: Gegenstände kaufen, verkaufen oder verschenken
- Finanzen: Miete, Nebenkosten, Abrechnungen einsehen
- Dokumente: Verträge, Abrechnungen und wichtige Unterlagen
- Ankündigungen: Wichtige Mitteilungen der Verwaltung
- Events: Community-Events entdecken und teilnehmen
- Profile: Eigenes Profil und Nachbarprofile ansehen

🔧 REPARATUREN MELDEN:
- Gehe zur Seite "Reparaturen" (Hammer-Symbol in der Navigation)
- Klicke auf "Reparatur melden"
- Wähle Kategorie, Raum und Priorität
- Füge Fotos hinzu (sehr hilfreich!)
- Verfolge den Status in Echtzeit mit Chat-Funktion

💶 FINANZEN & RECHNUNGEN:
- Bereich "Finanzen" zeigt alle Zahlungen
- Filter nach Status (offen/bezahlt) und Datum
- Suchfunktion für spezifische Rechnungen
- PDF-Abrechnungen direkt herunterladen
- Zahlungshistorie einsehen

🗺️ NACHBARSCHAFTSKARTE:
- "Karte"-Seite für lokale Hilfsanfragen
- Werkzeuge leihen, Hilfe anbieten/suchen
- Zeitlich begrenzte Anfragen erstellen

🏪 MARKTPLATZ:
- Gegenstände in verschiedenen Kategorien listen
- Verschenken, verkaufen oder tauschen
- Direkt mit Anbietern per In-App-Chat kommunizieren

📄 DOKUMENTE:
- Alle wichtigen Unterlagen zentral gespeichert
- Nach Kategorien sortiert (Verträge, Abrechnungen, etc.)
- Suchfunktion für schnelles Finden

ANTWORTE SO:
✅ Gib KONKRETE App-Anweisungen mit direkten Links
✅ Verwende Links im Format: [Linktext](SeitenName) z.B. [zur Reparatur-Seite](Reparaturen)
✅ Verfügbare Seiten: Home, Karte, Reparaturen, Chat, Marktplatz, Finanzen, Dokumente, Ankuendigungen, Events, Profile, Schwarzesbrett, Umfragen, Community, Vertrag
✅ IMMER mindestens einen relevanten Link einfügen
✅ Erkläre kurz WARUM und WIE (1-2 Sätze), dann Link
✅ Halte Antworten sehr kurz (2-3 Zeilen + Link)
✅ Sei freundlich und direkt
✅ Nutze Emojis sparsam

BEISPIEL EINER GUTEN ANTWORT:
"Um einen Schaden zu melden, kannst du ganz einfach Fotos hochladen und die Kategorie auswählen. Das geht hier: [Reparatur jetzt melden](Reparaturen) 🔧"

❌ Keine langen Erklärungen - lieber Link zur richtigen Stelle
❌ Keine rechtlichen Beratungen (weise auf Hausverwaltung hin)
❌ Bei Notfällen: Immer sofort Hausverwaltung kontaktieren

Dein Ziel: Schnell zum Ziel führen mit direkten Links in die App!`;

function ChatMessage({ message, isUser }) {
    const { triggerCrossSell } = useCrossSell();
    
    const parseLinks = (text) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
            }
            parts.push({ type: 'link', text: match[1], page: match[2] });
            lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < text.length) {
            parts.push({ type: 'text', content: text.slice(lastIndex) });
        }

        return parts.length > 0 ? parts : [{ type: 'text', content: text }];
    };

    const parts = parseLinks(message.text);
    
    // Special styling for teaser and pro messages
    const messageClasses = message.isTeaser 
        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 text-gray-800 rounded-tl-sm'
        : message.isPro
        ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-l-4 border-violet-500 text-gray-800 rounded-tl-sm'
        : isUser 
        ? 'bg-violet-600 text-white rounded-tr-sm' 
        : 'bg-gray-100 text-gray-800 rounded-tl-sm';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUser ? 'bg-violet-100' : 'bg-gradient-to-br from-violet-500 to-purple-600'
            }`}>
                {isUser ? (
                    <User className="w-4 h-4 text-violet-600" />
                ) : (
                    <Bot className="w-4 h-4 text-white" />
                )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${messageClasses}`}>
                {message.isPro && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-violet-200">
                        <span className="text-xs font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white px-2 py-0.5 rounded-full">
                            ✨ Pro Feature
                        </span>
                    </div>
                )}
                <div className="text-sm whitespace-pre-wrap">
                    {parts.map((part, idx) => {
                        if (part.type === 'link') {
                            return (
                                <Link
                                    key={idx}
                                    to={createPageUrl(part.page)}
                                    className={`inline-flex items-center gap-1 underline font-medium hover:opacity-80 ${
                                        isUser ? 'text-white' : 'text-violet-600'
                                    }`}
                                >
                                    {part.text}
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            );
                        }
                        return <span key={idx}>{part.content}</span>;
                    })}
                </div>
                {message.isTeaser && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                        <Button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                        >
                            🚀 Jetzt upgraden für volle KI-Power
                        </Button>
                    </div>
                )}
                {message.isPro && (
                    <div className="mt-3 pt-3 border-t border-violet-200 text-xs text-gray-600">
                        ⚠️ Dies ist keine Rechtsberatung. Bei Unsicherheit wende dich an einen Mieterverein oder Anwalt.
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function MieterAIChat({ isOpen, onClose, isMinimized, onToggleMinimize }) {
    const { triggerCrossSell } = useCrossSell();
    const { subscription } = useSubscription();
    const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('ai_chats');
        return saved ? JSON.parse(saved) : [{
            id: Date.now(),
            title: 'Neuer Chat',
            messages: [
                { 
                    id: 'welcome', 
                    text: 'Hallo! 👋 Ich bin dein digitaler Wohnassistent und kenne mich in der App bestens aus. Wie kann ich dir helfen?\n\nIch kann dir z.B. zeigen wie du:\n• Reparaturen meldest\n• Rechnungen findest\n• Den Marktplatz nutzt\n• Mit Nachbarn vernetzt bleibst', 
                    isUser: false 
                }
            ]
        }];
    });
    const [currentChatId, setCurrentChatId] = useState(() => {
        const saved = localStorage.getItem('ai_chats');
        const savedChats = saved ? JSON.parse(saved) : null;
        return savedChats?.[0]?.id || Date.now();
    });
    const [showChatList, setShowChatList] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
    const messages = currentChat?.messages || [];

    useEffect(() => {
        localStorage.setItem('ai_chats', JSON.stringify(chats));
    }, [chats]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    const createNewChat = () => {
        const newChat = {
            id: Date.now(),
            title: 'Neuer Chat',
            messages: [
                { 
                    id: 'welcome-' + Date.now(), 
                    text: 'Hallo! 👋 Wie kann ich dir helfen?', 
                    isUser: false 
                }
            ]
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setShowChatList(false);
    };

    const deleteChat = (chatId) => {
        if (chats.length === 1) return;
        const newChats = chats.filter(c => c.id !== chatId);
        setChats(newChats);
        if (currentChatId === chatId) {
            setCurrentChatId(newChats[0].id);
        }
    };

    const updateChatTitle = (chatId, firstMessage) => {
        setChats(prev => prev.map(chat => {
            if (chat.id === chatId && chat.title === 'Neuer Chat') {
                return {
                    ...chat,
                    title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')
                };
            }
            return chat;
        }));
    };

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;

        const userMessage = { id: Date.now(), text: text.trim(), isUser: true };
        
        setChats(prev => prev.map(chat => {
            if (chat.id === currentChatId) {
                const newMessages = [...chat.messages, userMessage];
                if (chat.messages.filter(m => m.isUser).length === 0) {
                    updateChatTitle(chat.id, text.trim());
                }
                return { ...chat, messages: newMessages };
            }
            return chat;
        }));
        
        setInput('');
        setLoading(true);

        try {
            const isComplex = isComplexLegalQuestion(text.trim());
            const userTier = subscription?.tier || 'free';
            const hasProKI = userTier === 'pro' || userTier === 'business';

            let aiMessage;

            if (!isComplex) {
                // Einfache Frage - normale Antwort
                const conversationHistory = messages
                    .slice(-6)
                    .map(m => `${m.isUser ? 'Mieter' : 'Assistent'}: ${m.text}`)
                    .join('\n');

                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: `${SYSTEM_PROMPT}

Bisheriger Gesprächsverlauf:
${conversationHistory}

Aktuelle Frage des Mieters: ${text.trim()}

Antworte hilfreich und freundlich:`,
                });

                aiMessage = { 
                    id: Date.now() + 1, 
                    text: response || 'Entschuldigung, ich konnte keine Antwort generieren.', 
                    isUser: false 
                };
            } else if (isComplex && !hasProKI) {
                // Komplexe Frage + kein Pro - Teaser
                const shortAnswer = getShortLegalAnswer(text.trim());
                const teaserText = `🤔 Das ist eine wichtige Frage!

${shortAnswer}

─────────────────────────────────────

💡 **Möchtest du eine detaillierte Analyse?**

Mit **MieterApp Pro** bekommst du:
✨ KI-Recherche zu deiner konkreten Situation
✨ Detaillierte Erklärungen mit Gesetzesverweisen
✨ Prüfung ob dein Fall rechtens ist
✨ Musterantworten für deinen Vermieter

Powered by Claude AI - dem smartesten KI-Assistenten.

⚠️ Hinweis: Auch KI-Beratung ersetzt keine Rechtsberatung.`;

                aiMessage = { 
                    id: Date.now() + 1, 
                    text: teaserText, 
                    isUser: false,
                    isTeaser: true
                };

                // Trigger Upgrade-Modal nach kurzer Verzögerung
                setTimeout(() => {
                    setShowUpgradeModal(true);
                }, 2000);
            } else {
                // Komplexe Frage + Pro User - Claude KI
                const response = await base44.functions.invoke('callFinTuttoKI', {
                    message: text.trim(),
                    user_tier: userTier,
                    context: {}
                });

                if (response.data?.success && response.data?.answer) {
                    aiMessage = { 
                        id: Date.now() + 1, 
                        text: response.data.answer, 
                        isUser: false,
                        isPro: true
                    };
                } else {
                    aiMessage = { 
                        id: Date.now() + 1, 
                        text: 'Entschuldigung, die KI-Analyse konnte nicht durchgeführt werden. Bitte versuche es erneut.', 
                        isUser: false 
                    };
                }
            }
            
            setChats(prev => prev.map(chat => {
                if (chat.id === currentChatId) {
                    return { ...chat, messages: [...chat.messages, aiMessage] };
                }
                return chat;
            }));

        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage = { 
                id: Date.now() + 1, 
                text: 'Entschuldigung, es gab ein Problem. Bitte versuche es später erneut.', 
                isUser: false 
            };
            
            setChats(prev => prev.map(chat => {
                if (chat.id === currentChatId) {
                    return { ...chat, messages: [...chat.messages, errorMessage] };
                }
                return chat;
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleQuickTopic = (topic) => {
        sendMessage(topic.prompt);
    };

    if (!isOpen) return null;

    if (isMinimized) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="fixed bottom-24 right-4 z-50"
            >
                <Button
                    onClick={onToggleMinimize}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg hover:shadow-xl"
                >
                    <Bot className="w-6 h-6" />
                </Button>
                {messages.length > 1 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {messages.filter(m => !m.isUser).length - 1}
                    </span>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowChatList(!showChatList)}
                        className="text-white hover:bg-white/20 h-10 w-10 flex-shrink-0"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{currentChat?.title || 'Chat'}</h3>
                        <p className="text-xs text-white/80">Dein digitaler Helfer</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={createNewChat}
                        className="text-white hover:bg-white/20 h-8 w-8"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onToggleMinimize}
                        className="text-white hover:bg-white/20 h-8 w-8"
                    >
                        <Minimize2 className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose}
                        className="text-white hover:bg-white/20 h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Chat List */}
            {showChatList && (
                <div className="border-b bg-gray-50 max-h-48 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            className={`p-3 border-b last:border-b-0 flex items-center justify-between cursor-pointer hover:bg-gray-100 ${
                                chat.id === currentChatId ? 'bg-violet-50' : ''
                            }`}
                            onClick={() => {
                                setCurrentChatId(chat.id);
                                setShowChatList(false);
                            }}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm truncate">{chat.title}</span>
                            </div>
                            {chats.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteChat(chat.id);
                                    }}
                                    className="h-7 w-7 text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]">
                <AnimatePresence>
                    {messages.map(message => (
                        <ChatMessage key={message.id} message={message} isUser={message.isUser} />
                    ))}
                </AnimatePresence>
                
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Topics */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <p className="text-xs text-gray-500 mb-2">Häufige Themen:</p>
                    <div className="flex flex-wrap gap-2">
                        {QUICK_TOPICS.map(topic => {
                            const Icon = topic.icon;
                            return (
                                <button
                                    key={topic.id}
                                    onClick={() => handleQuickTopic(topic)}
                                    disabled={loading}
                                    className={`${topic.color} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {topic.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-3 border-t bg-gray-50">
                <form 
                    onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                    className="flex gap-2"
                >
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Schreibe eine Nachricht..."
                        disabled={loading}
                        className="flex-1 bg-white"
                    />
                    <Button 
                        type="submit" 
                        disabled={!input.trim() || loading}
                        className="bg-violet-600 hover:bg-violet-700"
                        size="icon"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                appId="mieterapp"
                highlightTier="pro"
            />
        </motion.div>
    );
}