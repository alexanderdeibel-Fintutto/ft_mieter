import React from 'react';
import { Users, Calendar, MapPin, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const STATUS_CONFIG = {
  planning: { label: 'In Planung', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'Aktiv', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Abgeschlossen', color: 'bg-gray-100 text-gray-700' },
};

const CATEGORY_ICONS = {
  umwelt: '🌱',
  nachbarschaft: '🏘️',
  sozial: '❤️',
  kultur: '🎭',
  sport: '⚽',
  sonstiges: '📋',
};

export default function ProjectCard({ project, onJoin, onOpen, isMember, currentUserId }) {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
  const progress = project.tasks?.length > 0 
    ? Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100)
    : 0;
  const isCreator = project.creatorId === currentUserId;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpen(project)}
    >
      {project.image && (
        <div className="h-32 bg-gradient-to-br from-violet-100 to-purple-100 relative">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2">
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </div>
      )}
      
      {!project.image && (
        <div className="h-24 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative">
          <span className="text-4xl">{CATEGORY_ICONS[project.category] || '📋'}</span>
          <div className="absolute top-2 right-2">
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>

        {/* Progress */}
        {project.tasks?.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Fortschritt</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Info Row */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{project.participants?.length || 0} Helfer</span>
          </div>
          {project.targetDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(project.targetDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{project.location}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {isMember ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onOpen(project)}
              >
                <Target className="w-4 h-4 mr-1" /> Details
              </Button>
              {!isCreator && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onJoin(project)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Verlassen
                </Button>
              )}
            </>
          ) : (
            <Button 
              size="sm" 
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              onClick={() => onJoin(project)}
            >
              <Users className="w-4 h-4 mr-1" /> Mitmachen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}