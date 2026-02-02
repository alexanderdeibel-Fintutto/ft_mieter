import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../components/services/supabase';
import ChatView from '../components/chat/ChatView';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wrench, MapPin, Calendar } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function TaskChat() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  
  const [task, setTask] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (taskId) {
      loadTaskAndConversation();
    }
  }, [taskId]);
  
  async function loadTaskAndConversation() {
    setLoading(true);
    
    // Task laden
    const { data: taskData } = await supabase
      .from('tasks')
      .select(`
        *,
        buildings (name, address),
        units (unit_number)
      `)
      .eq('id', taskId)
      .single();
    
    if (taskData) {
      setTask(taskData);
      
      // Zugehörige Conversation laden
      const { data: convData } = await supabase
        .from('conversations')
        .select('*')
        .eq('task_id', taskId)
        .single();
      
      if (convData) {
        setConversation(convData);
      }
    }
    
    setLoading(false);
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!task || !conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Aufgabe oder Chat nicht gefunden</p>
        <Link to={createPageUrl('MieterRepairs')}>
          <Button variant="outline">Zurück zu Reparaturen</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('MieterRepairs')}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Schadensmeldung</h1>
          <p className="text-gray-600">Chat mit Ihrem Vermieter</p>
        </div>
      </div>
      
      {/* Task Info Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Wrench className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">{task.title}</h2>
              <p className="text-gray-600">{task.description}</p>
            </div>
          </div>
          <Badge className={getStatusColor(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {task.buildings && (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{task.buildings.name}</span>
            </div>
          )}
          {task.units && (
            <div className="flex items-center gap-2">
              <span>Wohnung {task.units.unit_number}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>
              Erstellt: {new Date(task.created_at).toLocaleDateString('de-DE')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Priorität: {getPriorityLabel(task.priority)}</span>
          </div>
        </div>
      </Card>
      
      {/* Chat */}
      <Card className="h-[calc(100vh-24rem)] overflow-hidden">
        <ChatView 
          conversationId={conversation.id} 
          conversation={conversation}
        />
      </Card>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    open: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || colors.open;
}

function getStatusLabel(status) {
  const labels = {
    open: 'Offen',
    in_progress: 'In Bearbeitung',
    completed: 'Erledigt',
    cancelled: 'Abgebrochen'
  };
  return labels[status] || status;
}

function getPriorityLabel(priority) {
  const labels = {
    low: 'Niedrig',
    normal: 'Normal',
    high: 'Hoch',
    urgent: 'Dringend'
  };
  return labels[priority] || priority;
}