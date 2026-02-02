import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import CreateDamageReportDialog from '../components/repair/CreateDamageReportDialog';
import { supabase, getCurrentUser, getPrimaryOrg } from '../components/services/supabase';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function MieterRepairs() {
  const [showNewRepair, setShowNewRepair] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [buildingId, setBuildingId] = useState(null);
  const [unitId, setUnitId] = useState(null);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    loadTasksAndBuilding();
  }, []);

  async function loadTasksAndBuilding() {
    const supaUser = await getCurrentUser();
    if (!supaUser) return;

    const org = await getPrimaryOrg(supaUser.id);
    if (org) {
      setBuildingId(org.id);
    }

    // Tasks aus Supabase laden
    const { data } = await supabase
      .from('tasks')
      .select(`
        *,
        conversations (id)
      `)
      .eq('reporter_id', supaUser.id)
      .order('created_at', { ascending: false });

    if (data) {
      setTasks(data);
    }
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    open: <AlertCircle className="w-4 h-4 text-orange-600" />,
    in_progress: <Clock className="w-4 h-4 text-blue-600" />,
    completed: <CheckCircle className="w-4 h-4 text-green-600" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Reparaturen & Mängel</h1>
          <Button onClick={() => setShowNewRepair(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" /> Schaden melden
          </Button>
        </div>

        {/* Repairs List */}
        <div className="space-y-4">
          {tasks?.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {statusIcons[task.status]}
                      <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                    </div>
                    <p className="text-gray-600 mt-2">{task.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority === 'low' ? 'Niedrig' : task.priority === 'normal' ? 'Normal' : task.priority === 'high' ? 'Hoch' : 'Dringend'}
                      </Badge>
                      <Badge variant="outline">
                        {task.status === 'open' ? 'Offen' : task.status === 'in_progress' ? 'In Bearbeitung' : 'Erledigt'}
                      </Badge>
                    </div>
                  </div>
                  {task.conversations?.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(createPageUrl('TaskChat') + `?taskId=${task.id}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat öffnen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tasks?.length === 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center text-gray-600">
              Keine Schadensmeldungen vorhanden.
            </CardContent>
          </Card>
        )}
      </div>
      
      <CreateDamageReportDialog 
        open={showNewRepair}
        onOpenChange={(open) => {
          setShowNewRepair(open);
          if (!open) loadTasksAndBuilding();
        }}
        buildingId={buildingId}
        unitId={unitId}
      />
    </div>
  );
}