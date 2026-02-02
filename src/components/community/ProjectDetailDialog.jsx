import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, Calendar, MapPin, Target, MessageCircle, Plus, X, 
  CheckCircle2, Circle, Send, Trash2 
} from 'lucide-react';

const STATUS_CONFIG = {
  planning: { label: 'In Planung', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'Aktiv', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Abgeschlossen', color: 'bg-gray-100 text-gray-700' },
};

export default function ProjectDetailDialog({ 
  open, 
  onOpenChange, 
  project, 
  onJoin,
  onTaskToggle,
  onAddTask,
  onAddComment,
  onStatusChange,
  currentUserId,
  isMember
}) {
  const [newTask, setNewTask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  if (!project) return null;

  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
  const isCreator = project.creatorId === currentUserId;
  const progress = project.tasks?.length > 0 
    ? Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100)
    : 0;

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    onAddTask(project.id, newTask.trim());
    setNewTask('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(project.id, newComment.trim());
    setNewComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-lg pr-8">{project.title}</DialogTitle>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {['info', 'aufgaben', 'diskussion'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab 
                  ? 'border-[#8B5CF6] text-[#8B5CF6]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' && 'Info'}
              {tab === 'aufgaben' && `Aufgaben (${project.tasks?.length || 0})`}
              {tab === 'diskussion' && `Diskussion (${project.comments?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{project.description}</p>

            {/* Progress */}
            {project.tasks?.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Fortschritt</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Users className="w-3 h-3" /> Teilnehmer
                </div>
                <p className="font-medium">
                  {project.participants?.length || 0}
                  {project.maxParticipants && ` / ${project.maxParticipants}`}
                </p>
              </div>
              {project.targetDate && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Calendar className="w-3 h-3" /> Zieldatum
                  </div>
                  <p className="font-medium">
                    {new Date(project.targetDate).toLocaleDateString('de-DE')}
                  </p>
                </div>
              )}
              {project.location && (
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <MapPin className="w-3 h-3" /> Ort
                  </div>
                  <p className="font-medium">{project.location}</p>
                </div>
              )}
            </div>

            {/* Participants */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Teilnehmer</h4>
              <div className="flex flex-wrap gap-2">
                {project.participantNames?.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 bg-violet-50 rounded-full text-sm">
                    <div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-medium">
                      {name.charAt(0)}
                    </div>
                    <span>{name}</span>
                    {project.creatorId === project.participants?.[i] && (
                      <Badge variant="secondary" className="text-xs">Initiator</Badge>
                    )}
                  </div>
                )) || (
                  <span className="text-sm text-gray-500">Noch keine Teilnehmer</span>
                )}
              </div>
            </div>

            {/* Status Change (Creator only) */}
            {isCreator && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-2">Status ändern</p>
                <div className="flex gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => onStatusChange(project.id, key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        project.status === key ? config.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aufgaben Tab */}
        {activeTab === 'aufgaben' && (
          <div className="space-y-3">
            {isMember && (
              <div className="flex gap-2">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Neue Aufgabe hinzufügen..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Button variant="outline" size="icon" onClick={handleAddTask}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {project.tasks?.length > 0 ? (
              <div className="space-y-2">
                {project.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      task.completed ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    {isMember && (
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => onTaskToggle(project.id, task.id)}
                      />
                    )}
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.text}
                    </span>
                    {task.assignee && (
                      <Badge variant="secondary" className="text-xs">{task.assignee}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Noch keine Aufgaben definiert</p>
            )}
          </div>
        )}

        {/* Diskussion Tab */}
        {activeTab === 'diskussion' && (
          <div className="space-y-3">
            {isMember && (
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Kommentar schreiben..."
                  rows={2}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={handleAddComment} className="self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}

            {project.comments?.length > 0 ? (
              <div className="space-y-3">
                {project.comments.map(comment => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-medium">
                        {comment.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 pl-8">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Noch keine Kommentare</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {isMember ? (
            <>
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Schließen
              </Button>
              {!isCreator && (
                <Button 
                  variant="ghost" 
                  onClick={() => { onJoin(project); onOpenChange(false); }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Verlassen
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
                onClick={() => onJoin(project)}
                disabled={project.maxParticipants && project.participants?.length >= project.maxParticipants}
              >
                <Users className="w-4 h-4 mr-1" /> Mitmachen
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Schließen
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}