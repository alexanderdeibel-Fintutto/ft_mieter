import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Phone, Video, Users, LogOut, Trash2, Ban, Archive, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createPageUrl } from '../../utils';

export default function ChatHeader({ 
  conversation, 
  onBack, 
  isTyping, 
  typingUserName,
  onClearChat,
  onArchiveChat,
  onBlockUser,
  onLeaveGroup 
}) {
  const isGroup = conversation.type === 'group';
  const name = isGroup ? conversation.name : conversation.participantName;
  const initial = isGroup ? conversation.icon : name?.charAt(0);

  const getStatusText = () => {
    if (isTyping) {
      return typingUserName ? `${typingUserName} tippt...` : 'tippt...';
    }
    if (isGroup) {
      return `${conversation.memberCount || conversation.members?.length || 0} Mitglieder`;
    }
    if (conversation.online) return 'Online';
    return conversation.lastSeen || 'Offline';
  };

  const getStatusColor = () => {
    if (conversation.online) return 'text-green-500';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white border-b p-3 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="md:hidden"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {isGroup ? (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xl">
          {initial}
        </div>
      ) : (
        <Link to={createPageUrl('NachbarProfil') + `?id=${conversation.participantId}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {initial}
            </div>
            {conversation.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
        </Link>
      )}

      <div className="flex-1 min-w-0">
        {isGroup ? (
          <h2 className="font-semibold text-gray-900 truncate flex items-center gap-2">
            {name}
            <Users className="w-4 h-4 text-gray-400" />
          </h2>
        ) : (
          <Link to={createPageUrl('NachbarProfil') + `?id=${conversation.participantId}`}>
            <h2 className="font-semibold text-gray-900 truncate hover:text-[#8B5CF6]">{name}</h2>
          </Link>
        )}
        <p className={`text-xs truncate flex items-center gap-1 ${isTyping ? 'text-[#8B5CF6] font-medium' : getStatusColor()}`}>
          {!isGroup && !isTyping && (
            <span className={`w-2 h-2 rounded-full ${conversation.online ? 'bg-green-500' : 'bg-gray-400'}`} />
          )}
          {getStatusText()}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isGroup && (
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" />
              Mitglieder anzeigen
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onClearChat}>
            <Trash2 className="w-4 h-4 mr-2" />
            Chat leeren
          </DropdownMenuItem>
          {onArchiveChat && (
            <DropdownMenuItem onClick={onArchiveChat}>
              <Archive className="w-4 h-4 mr-2" />
              Chat archivieren
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isGroup ? (
            <DropdownMenuItem onClick={onLeaveGroup} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Gruppe verlassen
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onBlockUser} className="text-red-600">
              <Ban className="w-4 h-4 mr-2" />
              Blockieren
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}