import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TenantMessaging() {
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => await base44.auth.me()
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await base44.entities.Message.filter(
        {
          $or: [
            { sender_id: user.id },
            { recipient_id: user.id }
          ]
        },
        '-created_date',
        100
      );
      return result || [];
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      // For now, send to a default property manager recipient
      // In production, you'd select the recipient
      return await base44.entities.Message.create({
        sender_id: user.id,
        recipient_id: 'property_manager', // Placeholder
        subject: 'Tenant Message',
        content: content,
        message_type: 'direct',
      });
    },
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate(messageContent);
  };

  if (isLoading) {
    return <div className="text-center py-8">Lädt...</div>;
  }

  return (
    <Card className="bg-white dark:bg-gray-800 flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Nachrichtenaustauch mit Hausverwaltung
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Noch keine Nachrichten. Starten Sie ein Gespräch!</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender_id === user?.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.created_date).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Input
            placeholder="Nachricht schreiben..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!messageContent.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}