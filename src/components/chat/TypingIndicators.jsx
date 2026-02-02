import React, { useEffect, useState } from 'react';
import { subscribeToTypingIndicators } from '../services/messagingAdvanced';

export function TypingIndicators({ conversationId }) {
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    const subscription = subscribeToTypingIndicators(conversationId, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.user_id !== payload.new.user_id);
          return [...filtered, payload.new];
        });

        // Auto-remove nach 5 Sekunden
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.user_id !== payload.new.user_id));
        }, 5000);
      } else if (payload.eventType === 'DELETE') {
        setTypingUsers(prev => prev.filter(u => u.user_id !== payload.old.user_id));
      }
    });

    return () => subscription?.unsubscribe();
  }, [conversationId]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
      <span>
        {typingUsers.length === 1 
          ? `${typingUsers[0].user_name} tippt...`
          : `${typingUsers.length} Personen tippen...`}
      </span>
    </div>
  );
}