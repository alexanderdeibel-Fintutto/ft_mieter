import React, { useState, useEffect } from 'react';
import { getMyConversations } from '../components/services/messaging';
import ConversationList from '../components/chat/ConversationList';
import ChatView from '../components/chat/ChatView';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Mobile: Zeige entweder Liste oder Chat
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        {selectedConversation ? (
          <div className="h-full">
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-4 border-b bg-white w-full text-left text-blue-600 font-medium"
            >
              ← Zurück zu Unterhaltungen
            </button>
            <div className="h-[calc(100%-4rem)]">
              <ChatView 
                conversationId={selectedConversation.id} 
                conversation={selectedConversation}
              />
            </div>
          </div>
        ) : (
          <Card className="h-full">
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-bold">Nachrichten</h2>
            </div>
            <ConversationList 
              onSelectConversation={setSelectedConversation}
              selectedId={selectedConversation?.id}
            />
          </Card>
        )}
      </div>
    );
  }
  
  // Desktop: Zeige beide Seiten
  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-3 gap-4">
      {/* Conversation List */}
      <Card className="col-span-1 overflow-hidden">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold">Nachrichten</h2>
        </div>
        <ConversationList 
          onSelectConversation={setSelectedConversation}
          selectedId={selectedConversation?.id}
        />
      </Card>
      
      {/* Chat View */}
      <Card className="col-span-2 overflow-hidden">
        {selectedConversation ? (
          <ChatView 
            conversationId={selectedConversation.id} 
            conversation={selectedConversation}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle size={64} className="mb-4" />
            <p className="text-lg">Wähle eine Unterhaltung aus</p>
          </div>
        )}
      </Card>
    </div>
  );
}