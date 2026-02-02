import React from 'react';
import { Check, CheckCheck, Users } from 'lucide-react';

export default function ChatList({ conversations, activeConversationId, onSelectConversation, typingUsers = {} }) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p className="text-sm">Keine Chats gefunden</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map(conv => {
        const isActive = conv.id === activeConversationId;
        const isGroup = conv.type === 'group';
        const isTyping = typingUsers[conv.id];
        const name = isGroup ? conv.name : conv.participantName;
        const initial = isGroup ? conv.icon : name?.charAt(0);

        return (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
              isActive ? 'bg-violet-50' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              {isGroup ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xl">
                  {initial}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {initial}
                </div>
              )}
              {!isGroup && conv.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
              {isGroup && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#8B5CF6] rounded-full border-2 border-white flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                  {name}
                </h3>
                <span className={`text-xs flex-shrink-0 ${conv.unreadCount > 0 ? 'text-[#8B5CF6] font-medium' : 'text-gray-400'}`}>
                  {conv.lastMessageTime}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                {isTyping ? (
                  <p className="text-sm text-[#8B5CF6] font-medium truncate flex items-center gap-1">
                    {isGroup ? `${isTyping} tippt` : 'tippt'}
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                      <span className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    </span>
                  </p>
                ) : (
                  <p className={`text-sm truncate flex items-center gap-1 ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                    {conv.lastMessageIsOwn && (
                      <span className="flex-shrink-0">
                        {conv.lastMessageRead 
                          ? <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                          : <Check className="w-3.5 h-3.5 text-gray-400 inline" />
                        }
                      </span>
                    )}
                    {conv.lastMessage || 'Keine Nachrichten'}
                  </p>
                )}
                {conv.unreadCount > 0 && (
                  <span className="bg-[#8B5CF6] text-white text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.context && !isGroup && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{conv.context}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}