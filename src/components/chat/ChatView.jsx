import { useState, useEffect, useRef } from 'react';
import { 
  getMessages, 
  sendMessage, 
  sendImageMessage,
  subscribeToConversation 
} from '../services/messaging';
import { setTypingStatus } from '../services/messagingAdvanced';
import { getCurrentUser } from '../services/supabase';
import { Send, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TypingIndicators } from './TypingIndicators';
import { MessageReactions } from './MessageReactions';
import { ReadReceipts } from './ReadReceipts';

export default function ChatView({ conversationId, conversation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // User ID laden
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);
  
  // Nachrichten laden
  useEffect(() => {
    loadMessages();
    
    // Realtime Subscription
    const subscription = subscribeToConversation(conversationId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => scrollToBottom(), 100);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);
  
  async function loadMessages() {
    setLoading(true);
    const data = await getMessages(conversationId);
    setMessages(data);
    setLoading(false);
    setTimeout(() => scrollToBottom(), 100);
  }
  
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  
  async function handleSend() {
    if (!input.trim() || sending) return;
    
    setSending(true);
    const result = await sendMessage(conversationId, input);
    setSending(false);
    
    if (result.success) {
      setInput('');
    }
  }

  async function handleInputChange(e) {
    setInput(e.target.value);
    // Typing indicator
    await setTypingStatus(conversationId);
  }
  
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSending(true);
    await sendImageMessage(conversationId, file);
    setSending(false);
  }
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <h3 className="font-semibold text-lg">{conversation?.title || 'Chat'}</h3>
        {conversation?.task_status && (
          <span className="text-sm text-gray-500">
            Status: {conversation.task_status}
          </span>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Noch keine Nachrichten
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isMine={msg.sender_id === currentUserId}
            />
          ))
        )}
        <TypingIndicators conversationId={conversationId} />
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t bg-white shadow-lg">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <Image size={20} />
          </Button>
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nachricht schreiben..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="icon"
            className="rounded-full"
          >
            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isMine }) {
  const isSystem = message.content_type === 'system' || message.content_type === 'status';
  
  if (isSystem) {
    return (
      <div className="text-center">
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isMine ? 'bg-blue-600 text-white' : 'bg-white border'} rounded-2xl p-3 shadow-sm`}>
        {!isMine && (
          <div className="text-xs font-semibold mb-1">
            {message.sender_name}
            <span className="font-normal text-gray-500 ml-1">
              ({message.sender_type === 'tenant' ? 'Mieter' : message.sender_type === 'landlord' ? 'Vermieter' : 'Hausmeister'})
            </span>
          </div>
        )}
        
        {/* Bild-Anhang */}
        {message.content_type === 'image' && message.message_attachments?.[0] && (
          <img 
            src={message.message_attachments[0].file_url}
            alt="Bild"
            className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90"
            onClick={() => window.open(message.message_attachments[0].file_url, '_blank')}
          />
        )}
        
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        
        <div className={`text-xs mt-2 flex items-center justify-between gap-2`}>
          <span className={isMine ? 'text-blue-200' : 'text-gray-500'}>
            {new Date(message.created_at).toLocaleTimeString('de-DE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isMine && <ReadReceipts messageId={message.id} status={message.status} />}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-2">
            <MessageReactions messageId={message.id} reactions={message.reactions} />
          </div>
        )}
      </div>
    </div>
  );
}