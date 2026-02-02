import React from 'react';
import { Users, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GroupCard({ group, onJoin, onOpen, isMember, currentUserId }) {
  const memberCount = group.members?.length || 0;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => isMember && onOpen(group)}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-2xl">
          {group.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
            {group.isPrivate && (
              <Lock className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{group.description}</p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {memberCount} Mitglieder
            </span>
            <span>•</span>
            <span>{group.recentActivity}</span>
          </div>
        </div>

        {isMember ? (
          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
        ) : (
          <Button
            onClick={(e) => { e.stopPropagation(); onJoin(group); }}
            size="sm"
            className="bg-[#8B5CF6] hover:bg-violet-700 flex-shrink-0"
          >
            Beitreten
          </Button>
        )}
      </div>
    </div>
  );
}