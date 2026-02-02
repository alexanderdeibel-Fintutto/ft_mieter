import React, { useRef, useEffect, useState } from 'react';
import { Check, CheckCheck, File, Image, Clock, Flame, AlertTriangle, MapPin, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function MessageBubble({ message, isOwn, showAvatar, showSenderName, participantName, isGroupChat, onExpire }) {
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Auto-delete countdown
  useEffect(() => {
    if (!message.autoDeleteAt) return;
    
    const updateCountdown = () => {
      const now = Date.now();
      const deleteTime = new Date(message.autoDeleteAt).getTime();
      const remaining = deleteTime - now;
      
      if (remaining <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire(message.id);
        return;
      }
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [message.autoDeleteAt, message.id, onExpire]);

  if (isExpired) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
        {!isOwn && showAvatar && <div className="w-8" />}
        <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-400 text-sm italic flex items-center gap-2">
          <Flame className="w-4 h-4" />
          Nachricht wurde gelöscht
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {(message.senderName || participantName)?.charAt(0) || '?'}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}
      <div className={`max-w-[75%]`}>
        {/* Sender name for group chats */}
        {isGroupChat && !isOwn && showSenderName && (
          <p className="text-xs text-[#8B5CF6] font-medium mb-1 ml-1">{message.senderName}</p>
        )}
        
        {/* Attachments */}
        {hasAttachments && (
          <div className="space-y-1 mb-1">
            {message.attachments.map((attachment, idx) => (
              <div key={idx} className={`rounded-xl overflow-hidden ${isOwn ? 'bg-[#7C3AED]' : 'bg-gray-200'}`}>
                {attachment.type === 'image' ? (
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="max-w-full max-h-60 object-cover cursor-pointer hover:opacity-90"
                    onClick={() => window.open(attachment.url, '_blank')}
                  />
                ) : attachment.type === 'location' ? (
                  <a 
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 ${isOwn ? 'text-white hover:bg-violet-600' : 'text-gray-700 hover:bg-gray-300'} transition-colors`}
                  >
                    <MapPin className="w-5 h-5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">📍 Standort geteilt</p>
                      <p className="text-xs opacity-70">Tippen zum Öffnen in Maps</p>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                ) : (
                  <div className={`flex items-center gap-2 px-3 py-2 ${isOwn ? 'text-white' : 'text-gray-700'}`}>
                    <File className="w-5 h-5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message text */}
        {message.text && (
          <div className={`px-4 py-2 rounded-2xl ${
            isOwn 
              ? 'bg-[#8B5CF6] text-white rounded-br-md' 
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
        )}
        
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">{message.time}</span>
          {isOwn && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center cursor-help">
                    {message.read 
                      ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      : message.delivered
                        ? <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                        : <Check className="w-3.5 h-3.5 text-gray-400" />
                    }
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {message.read ? 'Gelesen' : message.delivered ? 'Zugestellt' : 'Gesendet'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {message.autoDeleteAt && timeLeft && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 text-xs text-orange-500 cursor-help">
                    <Flame className="w-3 h-3" />
                    {timeLeft}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Diese Nachricht wird automatisch gelöscht
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
        {name?.charAt(0) || '?'}
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{name} tippt</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DateSeparator({ date }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border">
        {date}
      </span>
    </div>
  );
}

export default function ChatMessages({ messages, currentUserId, isTyping, typingUserName, participantName, isGroupChat = false, onMessageExpire }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  let lastDate = null;
  let lastSenderId = null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Noch keine Nachrichten</p>
          <p className="text-xs mt-1">Schreibe die erste Nachricht!</p>
        </div>
      )}
      {messages.map((message, index) => {
        const messageDate = new Date(message.timestamp).toLocaleDateString('de-DE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        const showDate = messageDate !== lastDate;
        lastDate = messageDate;
        
        const isOwn = message.senderId === currentUserId;
        const showAvatar = !isOwn && message.senderId !== lastSenderId;
        const showSenderName = isGroupChat && !isOwn && message.senderId !== lastSenderId;
        lastSenderId = message.senderId;

        return (
          <React.Fragment key={message.id}>
            {showDate && <DateSeparator date={messageDate} />}
            <MessageBubble 
              message={message} 
              isOwn={isOwn}
              showAvatar={showAvatar}
              showSenderName={showSenderName}
              participantName={participantName}
              isGroupChat={isGroupChat}
              onExpire={onMessageExpire}
            />
          </React.Fragment>
        );
      })}
      {isTyping && <TypingIndicator name={typingUserName || participantName} />}
      <div ref={endRef} />
    </div>
  );
}