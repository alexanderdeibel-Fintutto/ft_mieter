import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Plus, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import ChatList from '../components/chat/ChatList';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import ChatHeader from '../components/chat/ChatHeader';
import { toast } from 'sonner';
import { useFeatureLimits } from '../components/featuregate/useFeatureLimits';
import ChatUpgradeNudge from '../components/featuregate/ChatUpgradeNudge';

const DEMO_CONVERSATIONS = [
  {
    id: 1,
    type: 'direct',
    participantId: 'user-101',
    participantName: 'Maria K.',
    lastMessage: 'Super, dann bis Samstag! 👋',
    lastMessageTime: '14:32',
    unreadCount: 2,
    online: true,
    lastSeen: 'Online',
    context: 'Einkaufshilfe für Senioren',
    lastMessageIsOwn: false,
    lastMessageRead: true,
  },
  {
    id: 2,
    type: 'direct',
    participantId: 'user-102',
    participantName: 'Jonas M.',
    lastMessage: 'Ich kann morgen ab 18 Uhr vorbeikommen',
    lastMessageTime: '12:15',
    unreadCount: 0,
    online: false,
    lastSeen: 'vor 2 Std.',
    context: 'Computer & Handy Hilfe',
    lastMessageIsOwn: false,
    lastMessageRead: true,
  },
  {
    id: 3,
    type: 'direct',
    participantId: 'user-103',
    participantName: 'Peter S.',
    lastMessage: 'Das Werkzeug bringe ich mit',
    lastMessageTime: 'Gestern',
    unreadCount: 0,
    online: false,
    lastSeen: 'gestern',
    lastMessageIsOwn: false,
    lastMessageRead: true,
  },
  {
    id: 4,
    type: 'direct',
    participantId: 'user-104',
    participantName: 'Anna L.',
    lastMessage: 'Danke für die schnelle Antwort!',
    lastMessageTime: 'Mo',
    unreadCount: 1,
    online: true,
    lastSeen: 'Online',
    context: 'Pflanzenpflege',
    lastMessageIsOwn: false,
    lastMessageRead: false,
  },
];

const DEMO_GROUP_CONVERSATIONS = [
  {
    id: 101,
    type: 'group',
    name: 'Eltern mit Kindern',
    icon: '👨‍👩‍👧‍👦',
    members: ['Maria K.', 'Lisa M.', 'Max H.', 'Du'],
    memberCount: 4,
    lastMessage: 'Maria K.: Wer kommt morgen zum Spielplatz?',
    lastMessageTime: '15:45',
    unreadCount: 3,
    lastMessageIsOwn: false,
  },
  {
    id: 102,
    type: 'group',
    name: 'Sportgruppe',
    icon: '⚽',
    members: ['Peter S.', 'Tim B.', 'Jonas M.', 'Du'],
    memberCount: 5,
    lastMessage: 'Lauftreff morgen 18:30 am Haupteingang!',
    lastMessageTime: '10:20',
    unreadCount: 0,
    lastMessageIsOwn: false,
  },
  {
    id: 103,
    type: 'group',
    name: '2. Etage',
    icon: '🏢',
    members: ['Jonas M.', 'Du'],
    memberCount: 2,
    lastMessage: 'Du: Hat jemand ein Paket für mich angenommen?',
    lastMessageTime: 'Gestern',
    unreadCount: 0,
    lastMessageIsOwn: true,
  },
];

const DEMO_MESSAGES = {
  1: [
    { id: 1, senderId: 'user-101', senderName: 'Maria K.', text: 'Hallo! Ich habe gesehen, dass du Hilfe beim Einkaufen brauchst?', time: '14:20', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true, delivered: true },
    { id: 2, senderId: 'current', text: 'Ja genau! Könntest du morgen für mich zum Supermarkt gehen?', time: '14:25', timestamp: new Date(Date.now() - 3000000).toISOString(), read: true, delivered: true },
    { id: 3, senderId: 'user-101', senderName: 'Maria K.', text: 'Klar, das mache ich gerne! Was brauchst du denn alles?', time: '14:28', timestamp: new Date(Date.now() - 2400000).toISOString(), read: true, delivered: true },
    { id: 4, senderId: 'current', text: 'Hauptsächlich Grundnahrungsmittel: Milch, Brot, Eier und etwas Obst', time: '14:30', timestamp: new Date(Date.now() - 1800000).toISOString(), read: true, delivered: true },
    { id: 5, senderId: 'user-101', senderName: 'Maria K.', text: 'Super, dann bis Samstag! 👋', time: '14:32', timestamp: new Date(Date.now() - 1200000).toISOString(), read: false, delivered: true },
  ],
  2: [
    { id: 1, senderId: 'current', text: 'Hallo Jonas, ich habe Probleme mit meinem Laptop. Kannst du mir helfen?', time: '11:45', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, delivered: true },
    { id: 2, senderId: 'user-102', senderName: 'Jonas M.', text: 'Hi! Klar, was ist denn das Problem?', time: '11:50', timestamp: new Date(Date.now() - 85000000).toISOString(), read: true, delivered: true },
    { id: 3, senderId: 'current', text: 'Er ist sehr langsam geworden und stürzt manchmal ab', time: '12:00', timestamp: new Date(Date.now() - 84000000).toISOString(), read: true, delivered: true },
    { id: 4, senderId: 'user-102', senderName: 'Jonas M.', text: 'Ich kann morgen ab 18 Uhr vorbeikommen', time: '12:15', timestamp: new Date(Date.now() - 82800000).toISOString(), read: true, delivered: true },
  ],
  3: [
    { id: 1, senderId: 'user-103', senderName: 'Peter S.', text: 'Hallo, ich komme dann Freitag vorbei für die Regalmontage', time: '16:00', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true, delivered: true },
    { id: 2, senderId: 'current', text: 'Super, danke! Soll ich was besorgen?', time: '16:05', timestamp: new Date(Date.now() - 172500000).toISOString(), read: true, delivered: true },
    { id: 3, senderId: 'user-103', senderName: 'Peter S.', text: 'Das Werkzeug bringe ich mit', time: '16:10', timestamp: new Date(Date.now() - 172200000).toISOString(), read: true, delivered: true },
  ],
  4: [
    { id: 1, senderId: 'current', text: 'Hallo Anna, ich könnte deine Pflanzen gießen während du weg bist', time: '10:00', timestamp: new Date(Date.now() - 259200000).toISOString(), read: true, delivered: true },
    { id: 2, senderId: 'user-104', senderName: 'Anna L.', text: 'Oh das wäre toll! Ich bin nächste Woche geschäftlich unterwegs', time: '10:30', timestamp: new Date(Date.now() - 258000000).toISOString(), read: true, delivered: true },
    { id: 3, senderId: 'user-104', senderName: 'Anna L.', text: 'Danke für die schnelle Antwort!', time: '10:32', timestamp: new Date(Date.now() - 257800000).toISOString(), read: false, delivered: true },
  ],
  101: [
    { id: 1, senderId: 'user-101', senderName: 'Maria K.', text: 'Hallo zusammen! Wollen wir uns am Wochenende auf dem Spielplatz treffen?', time: '14:00', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true, delivered: true },
    { id: 2, senderId: 'user-105', senderName: 'Lisa M.', text: 'Gute Idee! Samstag wäre gut bei uns', time: '14:15', timestamp: new Date(Date.now() - 6000000).toISOString(), read: true, delivered: true },
    { id: 3, senderId: 'current', text: 'Samstag passt auch bei uns! Gegen 15 Uhr?', time: '14:30', timestamp: new Date(Date.now() - 4800000).toISOString(), read: true, delivered: true },
    { id: 4, senderId: 'user-107', senderName: 'Max H.', text: 'Wir sind dabei! 👍', time: '15:00', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true, delivered: true },
    { id: 5, senderId: 'user-101', senderName: 'Maria K.', text: 'Wer kommt morgen zum Spielplatz?', time: '15:45', timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, delivered: true },
  ],
  102: [
    { id: 1, senderId: 'user-103', senderName: 'Peter S.', text: 'Wer ist morgen beim Lauftreff dabei?', time: '09:00', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, delivered: true },
    { id: 2, senderId: 'current', text: 'Ich komme!', time: '09:30', timestamp: new Date(Date.now() - 84600000).toISOString(), read: true, delivered: true },
    { id: 3, senderId: 'user-102', senderName: 'Jonas M.', text: 'Bin auch dabei', time: '10:00', timestamp: new Date(Date.now() - 82800000).toISOString(), read: true, delivered: true },
    { id: 4, senderId: 'user-103', senderName: 'Peter S.', text: 'Lauftreff morgen 18:30 am Haupteingang!', time: '10:20', timestamp: new Date(Date.now() - 81000000).toISOString(), read: true, delivered: true },
  ],
  103: [
    { id: 1, senderId: 'current', text: 'Hat jemand ein Paket für mich angenommen?', time: '16:00', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, delivered: true },
  ],
};

const NEIGHBORS = [
  { id: 'user-105', name: 'Tim B.', floor: '2. OG', online: true },
  { id: 'user-106', name: 'Lisa W.', floor: '1. OG', online: false },
  { id: 'user-107', name: 'Max H.', floor: 'EG', online: true },
];

const COMMUNITY_GROUPS = [
  { id: 'grp-1', name: 'Gartenfreunde', icon: '🌱', memberCount: 8 },
  { id: 'grp-2', name: 'Haustierbesitzer', icon: '🐕', memberCount: 5 },
];

export default function Chat() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { usage: aiMessages } = useFeatureLimits('aiChatMessages');
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [groupConversations, setGroupConversations] = useState(DEMO_GROUP_CONVERSATIONS);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [chatTab, setChatTab] = useState('direct');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, authLoading]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipientId = params.get('recipient');
    
    if (recipientId) {
      const existing = conversations.find(c => c.participantId === recipientId);
      if (existing) {
        setActiveConversation(existing);
      }
    }
  }, []);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    if (conv.type === 'direct') {
      setConversations(prev => prev.map(c => 
        c.id === conv.id ? { ...c, unreadCount: 0 } : c
      ));
    } else {
      setGroupConversations(prev => prev.map(c => 
        c.id === conv.id ? { ...c, unreadCount: 0 } : c
      ));
    }
    setMessages(prev => ({
      ...prev,
      [conv.id]: (prev[conv.id] || []).map(m => ({ ...m, read: true }))
    }));
  };

  const handleSendMessage = (text, attachments = [], autoDeleteAt = null) => {
    if (!activeConversation) return;

    const newMessage = {
      id: Date.now(),
      senderId: 'current',
      senderName: 'Du',
      text,
      attachments,
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      read: false,
      delivered: false,
      autoDeleteAt,
    };

    setMessages(prev => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMessage]
    }));

    const updateConv = (convList) => convList.map(c => 
      c.id === activeConversation.id 
        ? { ...c, lastMessage: attachments.length > 0 ? '📎 Anhang' : text, lastMessageTime: newMessage.time, lastMessageIsOwn: true, lastMessageRead: false }
        : c
    );

    if (activeConversation.type === 'direct') {
      setConversations(updateConv);
    } else {
      setGroupConversations(updateConv);
    }

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeConversation.id]: prev[activeConversation.id].map(m => 
          m.id === newMessage.id ? { ...m, delivered: true } : m
        )
      }));
    }, 500);

    // Simulate response for direct chats
    if (activeConversation.type === 'direct' && activeConversation.online) {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [activeConversation.id]: prev[activeConversation.id].map(m => 
            m.id === newMessage.id ? { ...m, read: true } : m
          )
        }));
        setConversations(prev => prev.map(c => 
          c.id === activeConversation.id ? { ...c, lastMessageRead: true } : c
        ));
      }, 2000);

      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [activeConversation.id]: activeConversation.participantName }));
      }, 2500);

      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [activeConversation.id]: null }));
        const responses = ['👍', 'Alles klar!', 'Verstanden', 'Super!', 'Okay'];
        const responseText = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage = {
          id: Date.now(),
          senderId: activeConversation.participantId,
          senderName: activeConversation.participantName,
          text: responseText,
          time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          read: true,
          delivered: true,
        };
        setMessages(prev => ({
          ...prev,
          [activeConversation.id]: [...(prev[activeConversation.id] || []), responseMessage]
        }));
        setConversations(prev => prev.map(c => 
          c.id === activeConversation.id 
            ? { ...c, lastMessage: responseText, lastMessageTime: responseMessage.time, lastMessageIsOwn: false }
            : c
        ));
      }, 4500);
    }

    // Simulate group response
    if (activeConversation.type === 'group') {
      const groupMembers = activeConversation.members.filter(m => m !== 'Du');
      const randomMember = groupMembers[Math.floor(Math.random() * groupMembers.length)];
      
      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [activeConversation.id]: randomMember }));
      }, 3000);

      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [activeConversation.id]: null }));
        const responses = ['👍', 'Super!', 'Danke für die Info!', 'Okay, verstanden'];
        const responseText = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage = {
          id: Date.now(),
          senderId: 'user-random',
          senderName: randomMember,
          text: responseText,
          time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          read: true,
          delivered: true,
        };
        setMessages(prev => ({
          ...prev,
          [activeConversation.id]: [...(prev[activeConversation.id] || []), responseMessage]
        }));
        setGroupConversations(prev => prev.map(c => 
          c.id === activeConversation.id 
            ? { ...c, lastMessage: `${randomMember}: ${responseText}`, lastMessageTime: responseMessage.time, lastMessageIsOwn: false }
            : c
        ));
      }, 5000);
    }
  };

  const handleTyping = (typing) => {
    setIsTyping(typing);
  };

  const handleClearChat = () => {
    if (!activeConversation) return;
    setMessages(prev => ({ ...prev, [activeConversation.id]: [] }));
    const updateConv = (convList) => convList.map(c => 
      c.id === activeConversation.id ? { ...c, lastMessage: '' } : c
    );
    if (activeConversation.type === 'direct') {
      setConversations(updateConv);
    } else {
      setGroupConversations(updateConv);
    }
  };

  const handleBlockUser = () => {
    if (!activeConversation || activeConversation.type !== 'direct') return;
    toast.success(`${activeConversation.participantName} wurde blockiert`);
    setConversations(prev => prev.filter(c => c.id !== activeConversation.id));
    setActiveConversation(null);
  };

  const handleLeaveGroup = () => {
    if (!activeConversation || activeConversation.type !== 'group') return;
    toast.success(`Du hast "${activeConversation.name}" verlassen`);
    setGroupConversations(prev => prev.filter(c => c.id !== activeConversation.id));
    setActiveConversation(null);
  };

  const handleArchiveChat = () => {
    if (!activeConversation) return;
    
    if (activeConversation.type === 'direct') {
      setConversations(prev => prev.filter(c => c.id !== activeConversation.id));
    } else {
      setGroupConversations(prev => prev.filter(c => c.id !== activeConversation.id));
    }
    
    toast.success('Chat archiviert');
    setActiveConversation(null);
  };

  const handleStartNewChat = (neighbor) => {
    const existingConv = conversations.find(c => c.participantId === neighbor.id);
    
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      const newConv = {
        id: Date.now(),
        type: 'direct',
        participantId: neighbor.id,
        participantName: neighbor.name,
        lastMessage: '',
        lastMessageTime: 'Jetzt',
        unreadCount: 0,
        online: neighbor.online,
      };
      setConversations(prev => [newConv, ...prev]);
      setMessages(prev => ({ ...prev, [newConv.id]: [] }));
      setActiveConversation(newConv);
    }
    setNewChatDialogOpen(false);
  };

  const handleJoinGroupChat = (group) => {
    const existingConv = groupConversations.find(c => c.name === group.name);
    
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      const newConv = {
        id: Date.now(),
        type: 'group',
        name: group.name,
        icon: group.icon,
        members: ['Du'],
        memberCount: group.memberCount,
        lastMessage: '',
        lastMessageTime: 'Jetzt',
        unreadCount: 0,
        lastMessageIsOwn: false,
      };
      setGroupConversations(prev => [newConv, ...prev]);
      setMessages(prev => ({ ...prev, [newConv.id]: [] }));
      setActiveConversation(newConv);
      toast.success(`Du bist "${group.name}" beigetreten`);
    }
    setNewChatDialogOpen(false);
  };

  const handleBack = () => {
    setActiveConversation(null);
  };

  const handleMessageExpire = (messageId) => {
    if (!activeConversation) return;
    setMessages(prev => ({
      ...prev,
      [activeConversation.id]: prev[activeConversation.id]?.filter(m => m.id !== messageId) || []
    }));
  };

  const allConversations = chatTab === 'direct' ? conversations : groupConversations;
  const filteredConversations = allConversations.filter(c =>
    (c.participantName || c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = [...conversations, ...groupConversations].reduce((sum, c) => sum + c.unreadCount, 0);
  const currentMessages = activeConversation ? (messages[activeConversation.id] || []) : [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  const currentTypingUser = activeConversation ? typingUsers[activeConversation.id] : null;

  // Mobile: Show either list or chat
  if (isMobileView) {
    if (activeConversation) {
      return (
        <>
          <ChatUpgradeNudge onUpgradeClick={() => {}} />
          <div className="flex flex-col h-[calc(100vh-80px)]">
            <ChatHeader 
              conversation={activeConversation} 
              onBack={handleBack}
              isTyping={!!currentTypingUser}
              typingUserName={currentTypingUser}
              onClearChat={handleClearChat}
              onArchiveChat={handleArchiveChat}
              onBlockUser={activeConversation.type === 'direct' ? handleBlockUser : undefined}
              onLeaveGroup={activeConversation.type === 'group' ? handleLeaveGroup : undefined}
            />
            <ChatMessages 
              messages={currentMessages} 
              currentUserId="current"
              isTyping={!!currentTypingUser}
              typingUserName={currentTypingUser}
              participantName={activeConversation.participantName || activeConversation.name}
              isGroupChat={activeConversation.type === 'group'}
              onMessageExpire={handleMessageExpire}
            />
            <ChatInput 
              onSend={handleSendMessage} 
              onTyping={handleTyping}
              enableAttachments={true}
            />
          </div>
        </>
      );
    }

    return (
      <>
        <ChatUpgradeNudge onUpgradeClick={() => {}} />
        <div>
          <header className="p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">💬 Chats</h1>
                {totalUnread > 0 && (
                  <span className="bg-[#8B5CF6] text-white text-xs px-2 py-0.5 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </div>
              <Button 
                onClick={() => setNewChatDialogOpen(true)}
                size="icon"
                variant="ghost"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <Tabs value={chatTab} onValueChange={setChatTab} className="mb-3">
              <TabsList className="w-full">
                <TabsTrigger value="direct" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-1" /> Direkt
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex-1">
                  <Users className="w-4 h-4 mr-1" /> Gruppen
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Chat suchen..."
                className="pl-10"
              />
            </div>
          </header>
          <ChatList 
            conversations={filteredConversations}
            activeConversationId={null}
            onSelectConversation={handleSelectConversation}
            typingUsers={typingUsers}
          />
          <NewChatDialog 
            open={newChatDialogOpen} 
            onOpenChange={setNewChatDialogOpen}
            neighbors={NEIGHBORS}
            groups={COMMUNITY_GROUPS}
            onSelectNeighbor={handleStartNewChat}
            onJoinGroup={handleJoinGroupChat}
          />
        </div>
      </>
    );
  }

  // Desktop: Split view
  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">💬 Chats</h1>
              {totalUnread > 0 && (
                <span className="bg-[#8B5CF6] text-white text-xs px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            <Button 
              onClick={() => setNewChatDialogOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <Tabs value={chatTab} onValueChange={setChatTab} className="mb-3">
            <TabsList className="w-full">
              <TabsTrigger value="direct" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-1" /> Direkt
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">
                <Users className="w-4 h-4 mr-1" /> Gruppen
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chat suchen..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList 
            conversations={filteredConversations}
            activeConversationId={activeConversation?.id}
            onSelectConversation={handleSelectConversation}
            typingUsers={typingUsers}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeConversation ? (
          <>
            <ChatHeader 
              conversation={activeConversation} 
              onBack={handleBack}
              isTyping={!!currentTypingUser}
              typingUserName={currentTypingUser}
              onClearChat={handleClearChat}
              onBlockUser={activeConversation.type === 'direct' ? handleBlockUser : undefined}
              onLeaveGroup={activeConversation.type === 'group' ? handleLeaveGroup : undefined}
            />
            <ChatMessages 
              messages={currentMessages} 
              currentUserId="current"
              isTyping={!!currentTypingUser}
              typingUserName={currentTypingUser}
              participantName={activeConversation.participantName || activeConversation.name}
              isGroupChat={activeConversation.type === 'group'}
            />
            <ChatInput 
              onSend={handleSendMessage} 
              onTyping={handleTyping}
              enableAttachments={true}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Wähle einen Chat aus</p>
              <p className="text-sm mt-1">oder starte eine neue Unterhaltung</p>
            </div>
          </div>
        )}
      </div>

      <NewChatDialog 
        open={newChatDialogOpen} 
        onOpenChange={setNewChatDialogOpen}
        neighbors={NEIGHBORS}
        groups={COMMUNITY_GROUPS}
        onSelectNeighbor={handleStartNewChat}
        onJoinGroup={handleJoinGroupChat}
      />
    </div>
  );
}

function NewChatDialog({ open, onOpenChange, neighbors, groups, onSelectNeighbor, onJoinGroup }) {
  const [tab, setTab] = useState('direct');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Neuer Chat</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-3">
            <TabsTrigger value="direct" className="flex-1">Direktnachricht</TabsTrigger>
            <TabsTrigger value="group" className="flex-1">Gruppe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct" className="space-y-2">
            {neighbors.map(neighbor => (
              <button
                key={neighbor.id}
                onClick={() => onSelectNeighbor(neighbor)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {neighbor.name.charAt(0)}
                  </div>
                  {neighbor.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{neighbor.name}</p>
                  <p className="text-xs text-gray-500">{neighbor.floor}</p>
                </div>
              </button>
            ))}
          </TabsContent>
          
          <TabsContent value="group" className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">Community-Gruppen beitreten:</p>
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => onJoinGroup(group)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xl">
                  {group.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-500">{group.memberCount} Mitglieder</p>
                </div>
              </button>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}