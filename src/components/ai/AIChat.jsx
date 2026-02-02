import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIService } from './useAIService';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => {
      const { base44 } = await import('@/api/base44Client');
      return await base44.auth.me();
    }
  });

  const { context, currentPersona, loading, processMessage } = useAIService(
    user?.role || 'tenant',
    user?.subscription_tier || 'free'
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: userMessage
    }]);

    setIsLoading(true);

    try {
      const response = await processMessage(userMessage);

      // Add KI response
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: response?.answer || 'Entschuldigung, ich konnte keine Antwort generieren.',
        crossSell: response?.crossSell
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        content: 'Fehler beim Verarbeiten der Anfrage. Bitte versuche es später erneut.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle>KI-Assistent</CardTitle>
        {currentPersona && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Persona: {currentPersona.persona_name}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Stelle mir eine Frage!</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : msg.type === 'error'
                        ? 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-300 rounded-bl-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="break-words text-sm">{msg.content}</p>
                  </div>
                </div>

                {/* Cross-Sell Recommendation */}
                {msg.crossSell && (
                  <div className="mt-2 flex justify-start">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 max-w-xs lg:max-w-md text-sm">
                      <p className="text-purple-900 dark:text-purple-300 font-semibold mb-1">
                        💡 Empfehlung:
                      </p>
                      <p className="text-purple-800 dark:text-purple-200">
                        {msg.crossSell.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Input
            placeholder="Stelle eine Frage..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}