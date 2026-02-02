import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function AutomationWorkflowBuilder({ open, onOpenChange }) {
  const [workflows, setWorkflows] = useState([]);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger: '',
    actions: [],
  });
  const [loading, setLoading] = useState(false);

  const TRIGGERS = [
    { id: 'on_share', label: 'Dokument geteilt' },
    { id: 'on_expire', label: 'Share läuft ab' },
    { id: 'on_download', label: 'Heruntergeladen' },
  ];

  const ACTIONS = [
    { id: 'send_email', label: 'E-Mail senden' },
    { id: 'create_log', label: 'Log erstellen' },
    { id: 'notify_admin', label: 'Admin benachrichtigen' },
  ];

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.trigger) {
      toast.error('Name und Trigger erforderlich');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('documentAutomationWorkflow', {
        workflow_name: newWorkflow.name,
        trigger_event: newWorkflow.trigger,
        actions: newWorkflow.actions,
      });

      setWorkflows([...workflows, response.data.workflow]);
      setNewWorkflow({ name: '', trigger: '', actions: [] });
      toast.success('Workflow erstellt');
    } catch (error) {
      toast.error('Fehler beim Erstellen');
    }
    setLoading(false);
  };

  const handleToggleAction = (actionId) => {
    const updated = newWorkflow.actions.includes(actionId)
      ? newWorkflow.actions.filter(a => a !== actionId)
      : [...newWorkflow.actions, actionId];
    setNewWorkflow({ ...newWorkflow, actions: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automation Workflows
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create Workflow */}
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
            <Input
              placeholder="Workflow Name"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
            />

            <Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow({...newWorkflow, trigger: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Trigger wählen" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGERS.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <label className="text-xs font-medium mb-2 block">Aktionen</label>
              <div className="space-y-2">
                {ACTIONS.map(action => (
                  <div key={action.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newWorkflow.actions.includes(action.id)}
                      onChange={() => handleToggleAction(action.id)}
                    />
                    <label className="text-xs">{action.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateWorkflow}
              disabled={loading}
              className="w-full bg-blue-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Workflow erstellen
            </Button>
          </div>

          {/* Workflows List */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Aktive Workflows ({workflows.length})</h4>
            {workflows.map(wf => (
              <div key={wf.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{wf.name}</p>
                  <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  Trigger: {TRIGGERS.find(t => t.id === wf.trigger)?.label}
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <Play className="w-3 h-3 mr-1" />
                  Test
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}