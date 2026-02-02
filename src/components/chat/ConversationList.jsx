import { useState, useEffect } from 'react';
import { getMyConversations, subscribeToNotifications } from '../services/messaging';
import { getCurrentUser } from '../services/supabase';
import { MessageCircle, CheckCheck, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ConversationList({ onSelectConversation, selectedId = null }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadConversations();
    
    // Realtime Updates für neue Nachrichten
    getCurrentUser().then(user => {
      if (user) {
        const subscription = subscribeToNotifications(user.id, () => {
          loadConversations();
        });
        
        return () => subscription.unsubscribe();
      }
    });
  }, []);
  
  async function loadConversations() {
    setLoading(true);
    const data = await getMyConversations({ limit: 50 });
    setConversations(data);
    setLoading(false);
  }
  
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <MessageCircle className="mx-auto mb-3 text-gray-300" size={48} />
        <p>Noch keine Unterhaltungen</p>
      </div>
    );
  }
  
  return (
    <div className="divide-y">
      {conversations.map(conv => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
          onClick={() => onSelectConversation(conv)}
        />
      ))}
    </div>
  );
}

function ConversationItem({ conversation, isSelected, onClick }) {
  const hasUnread = conversation.unread_count > 0;
  
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar/Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          hasUnread ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
        }`}>
          <MessageCircle size={24} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {conversation.title || 'Unbenannt'}
            </h4>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(conversation.last_message_at || conversation.created_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {conversation.last_message_content || 'Keine Nachrichten'}
            </p>
            
            {hasUnread && (
              <Badge className="ml-2 bg-blue-600 text-white">
                {conversation.unread_count}
              </Badge>
            )}
          </div>
          
          {/* Zusätzliche Info */}
          {conversation.task_status && (
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getStatusLabel(conversation.task_status)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function getStatusLabel(status) {
  const labels = {
    open: 'Offen',
    in_progress: 'In Bearbeitung',
    completed: 'Erledigt',
    cancelled: 'Abgebrochen'
  };
  return labels[status] || status;
}