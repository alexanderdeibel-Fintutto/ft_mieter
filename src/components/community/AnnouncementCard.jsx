import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Pin, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const CATEGORY_STYLES = {
  info: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📢 Info' },
  ankuendigung: { bg: 'bg-orange-100', text: 'text-orange-700', label: '📣 Ankündigung' },
  hilfe: { bg: 'bg-red-100', text: 'text-red-700', label: '🆘 Hilfe' },
  diskussion: { bg: 'bg-green-100', text: 'text-green-700', label: '💬 Diskussion' },
};

const REACTIONS = ['👍', '❤️', '😢', '😂', '🎉', '🤔'];

export default function AnnouncementCard({ announcement, onReact, onComment, currentUserId }) {
  const categoryStyle = CATEGORY_STYLES[announcement.category] || CATEGORY_STYLES.info;
  const totalReactions = Object.values(announcement.reactions || {}).reduce((a, b) => a + b, 0);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Gerade eben';
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffHours < 48) return 'Gestern';
    return format(date, 'dd. MMM', { locale: de });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${announcement.isPinned ? 'ring-2 ring-[#8B5CF6] ring-opacity-50' : ''}`}>
      {announcement.isPinned && (
        <div className="bg-violet-50 px-4 py-1.5 flex items-center gap-2 text-xs text-[#8B5CF6] font-medium">
          <Pin className="w-3 h-3" /> Angepinnt
        </div>
      )}
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link 
            to={createPageUrl('NachbarProfil') + `?id=${announcement.authorId}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {announcement.author.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{announcement.author}</p>
              <p className="text-xs text-gray-400">{formatDate(announcement.created_at)}</p>
            </div>
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>
            {categoryStyle.label}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line">{announcement.content}</p>

        {/* Image */}
        {announcement.image && (
          <img 
            src={announcement.image} 
            alt="" 
            className="w-full h-40 object-cover rounded-lg mt-3"
          />
        )}

        {/* Reactions */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t">
          <div className="flex items-center gap-1">
            {REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => onReact(announcement.id, emoji)}
                className="text-lg hover:scale-125 transition-transform"
                title={`${emoji} reagieren`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {totalReactions > 0 && (
            <span className="text-xs text-gray-500">{totalReactions}</span>
          )}
          <button 
            onClick={onComment}
            className="flex items-center gap-1 text-gray-500 hover:text-[#8B5CF6] ml-auto"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{announcement.comments}</span>
          </button>
        </div>

        {/* Existing Reactions Display */}
        {Object.keys(announcement.reactions || {}).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(announcement.reactions).map(([emoji, count]) => (
              <span 
                key={emoji}
                className="text-xs bg-gray-100 px-2 py-1 rounded-full"
              >
                {emoji} {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}