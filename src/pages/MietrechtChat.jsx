import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader, AlertCircle, CheckCircle } from 'lucide-react';

export default function MietrechtChat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newChatTopic, setNewChatTopic] = useState('miethoehe');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: chats } = useQuery({
    queryKey: ['mietrechtChats', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.MietrechtChat.filter(
        { user_id: user.email },
        '-created_date'
      );
    },
  });

  const createChatMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MietrechtChat.create({
        user_id: user.email,
        title: newChatTitle,
        topic_category: newChatTopic,
        messages: {},
        status: 'active',
      });
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['mietrechtChats'] });
      setSelectedChat(newChat.id);
      setNewChatTitle('');
      setShowNewChat(false);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const currentChat = chats?.find((c) => c.id === selectedChat);
      const updatedMessages = {
        ...currentChat.messages,
        [Date.now()]: {
          role: 'user',
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      };

      // Call AI function
      const response = await base44.functions.invoke('mietrechtChatV2', {
        chat_id: selectedChat,
        user_message: newMessage,
        topic: currentChat.topic_category,
      });

      const aiMessage = response.data?.response || 'Entschuldigung, ein Fehler ist aufgetreten.';

      updatedMessages[Date.now() + 1] = {
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date().toISOString(),
      };

      return base44.entities.MietrechtChat.update(selectedChat, {
        messages: updatedMessages,
        tokens_used: (currentChat.tokens_used || 0) + 100,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mietrechtChats'] });
      setNewMessage('');
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const currentChat = chats?.find((c) => c.id === selectedChat);
  const messages = currentChat?.messages ? Object.entries(currentChat.messages) : [];

  const topicLabels = {
    miethoehe: '💰 Miethöhe',
    maengel: '🔧 Mängel',
    kuendigung: '📋 Kündigung',
    nebenkosten: '📊 Nebenkosten',
    sonstiges: '❓ Sonstiges',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Chats</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewChat(true)}
                >
                  +
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showNewChat && (
                <div className="space-y-3 mb-4 pb-4 border-b">
                  <Input
                    placeholder="Chat-Titel"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                  />
                  <select
                    value={newChatTopic}
                    onChange={(e) => setNewChatTopic(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="miethoehe">Miethöhe</option>
                    <option value="maengel">Mängel</option>
                    <option value="kuendigung">Kündigung</option>
                    <option value="nebenkosten">Nebenkosten</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                  <Button
                    onClick={() => createChatMutation.mutate()}
                    disabled={!newChatTitle || createChatMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
                  >
                    Starten
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {chats?.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedChat === chat.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium truncate">{chat.title}</p>
                    <Badge className="text-xs mt-1">
                      {topicLabels[chat.topic_category]}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2">
          {currentChat ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentChat.title}</CardTitle>
                    <Badge className="mt-2">
                      {topicLabels[currentChat.topic_category]}
                    </Badge>
                  </div>
                  {currentChat.is_resolved && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Gelöst
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(([timestamp, msg]) => (
                  <div
                    key={timestamp}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 p-4 rounded-lg flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Denke nach...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Frage stellen..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        sendMessageMutation.mutate();
                      }
                    }}
                  />
                  <Button
                    onClick={() => sendMessageMutation.mutate()}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Tokens verwendet: {currentChat.tokens_used || 0}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Starte einen neuen Chat oder wähle einen bestehenden aus</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}