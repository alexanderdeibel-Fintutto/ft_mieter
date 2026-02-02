import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        isOwn 
          ? 'bg-[#8B5CF6] text-white rounded-br-sm' 
          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
      }`}>
        {!isOwn && (
          <p className="text-xs font-medium text-[#8B5CF6] mb-1">{message.sender_name || 'Verwaltung'}</p>
        )}
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-violet-200' : 'text-gray-400'}`}>
          {new Date(message.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function ConversationItem({ conversation, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left rounded-xl transition-all ${
        isActive ? 'bg-violet-50 border-[#8B5CF6]' : 'bg-white hover:bg-gray-50'
      } border`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
          <User className="w-5 h-5 text-[#8B5CF6]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{conversation.title || 'Verwaltung'}</h4>
          <p className="text-xs text-gray-500 truncate">{conversation.last_message || 'Keine Nachrichten'}</p>
        </div>
        {conversation.unread_count > 0 && (
          <span className="bg-[#8B5CF6] text-white text-xs px-2 py-0.5 rounded-full">
            {conversation.unread_count}
          </span>
        )}
      </div>
    </button>
  );
}

export default function Nachrichten() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadConversations();
  }, [user, authLoading]);

  useEffect(() => {
    if (activeConversation) loadMessages(activeConversation.id);
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('updated_at', { ascending: false });
    
    if (!error && data && data.length > 0) {
      setConversations(data);
      if (!activeConversation) {
        setActiveConversation(data[0]);
      }
    } else {
      // Demo conversations
      const demoConversations = [
        { id: 'demo-1', title: 'Hausverwaltung Müller', last_message: 'Vielen Dank für Ihre Nachricht!', unread_count: 1 },
        { id: 'demo-2', title: 'Hausmeister Schmidt', last_message: 'Die Reparatur ist abgeschlossen.', unread_count: 0 },
      ];
      setConversations(demoConversations);
      setActiveConversation(demoConversations[0]);
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (!error && data && data.length > 0) {
      setMessages(data);
    } else {
      // Demo messages
      const demoMessages = conversationId === 'demo-1' ? [
        { id: 1, sender_id: 'admin', sender_name: 'Hausverwaltung Müller', content: 'Guten Tag! Wie können wir Ihnen helfen?', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, sender_id: user.id, content: 'Ich habe eine Frage zur Nebenkostenabrechnung.', created_at: new Date(Date.now() - 82800000).toISOString() },
        { id: 3, sender_id: 'admin', sender_name: 'Hausverwaltung Müller', content: 'Selbstverständlich! Die Abrechnung für 2024 wird Ende Januar verschickt. Bei Fragen können Sie sich gerne melden.', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 4, sender_id: 'admin', sender_name: 'Hausverwaltung Müller', content: 'Vielen Dank für Ihre Nachricht!', created_at: new Date().toISOString() },
      ] : [
        { id: 1, sender_id: 'admin', sender_name: 'Hausmeister Schmidt', content: 'Hallo! Ich wollte Bescheid geben, dass die Heizungswartung morgen stattfindet.', created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: 2, sender_id: user.id, content: 'Danke für die Info! Um welche Uhrzeit ungefähr?', created_at: new Date(Date.now() - 169200000).toISOString() },
        { id: 3, sender_id: 'admin', sender_name: 'Hausmeister Schmidt', content: 'Zwischen 9 und 12 Uhr. Die Reparatur ist abgeschlossen.', created_at: new Date(Date.now() - 86400000).toISOString() },
      ];
      setMessages(demoMessages);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    
    // For demo conversations, just add locally
    if (activeConversation.id.startsWith('demo-')) {
      const newMsg = {
        id: Date.now(),
        sender_id: user.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      toast.success('Nachricht gesendet (Demo)');
      setSending(false);
      return;
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error('Nachricht konnte nicht gesendet werden');
    } else {
      setNewMessage('');
      loadMessages(activeConversation.id);
    }
    setSending(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">💬 Nachrichten</h1>
      </header>

      {conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
          <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-center">Noch keine Konversationen</p>
          <p className="text-sm text-center">Sobald du mit deiner Verwaltung verknüpft bist, kannst du hier chatten.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Conversations List (mobile: show if no active, desktop: always show) */}
          {!activeConversation && (
            <div className="p-4 space-y-2">
              {conversations.map(c => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  isActive={activeConversation?.id === c.id}
                  onClick={() => setActiveConversation(c)}
                />
              ))}
            </div>
          )}

          {/* Messages View */}
          {activeConversation && (
            <>
              <div className="p-3 border-b bg-white flex items-center gap-3">
                <button onClick={() => setActiveConversation(null)} className="text-[#8B5CF6] text-sm">
                  ← Zurück
                </button>
                <span className="font-medium">{activeConversation.title || 'Verwaltung'}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map(m => (
                  <MessageBubble 
                    key={m.id} 
                    message={m} 
                    isOwn={m.sender_id === user.id} 
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
                <Input
                  placeholder="Nachricht schreiben..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !newMessage.trim()} className="bg-[#8B5CF6] hover:bg-violet-700">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}