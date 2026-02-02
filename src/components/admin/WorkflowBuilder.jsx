import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Trash2, Eye } from 'lucide-react';

const FEATURES = ['chat', 'ocr', 'analysis', 'categorization'];
const MODELS = [
  'claude-opus-4-1-20250805',
  'claude-sonnet-4-20250514',
  'claude-haiku-3-5-20241022'
];

export default function WorkflowBuilder() {
  const [templates, setTemplates] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  const [newWorkflow, setNewWorkflow] = useState({
    workflow_name: '',
    description: '',
    steps: []
  });

  const [currentStep, setCurrentStep] = useState({
    feature: 'analysis',
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000
  });

  useEffect(() => {
    loadTemplatesAndWorkflows();
  }, []);

  const loadTemplatesAndWorkflows = async () => {
    try {
      const [templatesData, workflowsData] = await Promise.all([
        base44.entities.AIWorkflow.filter({ is_template: true }),
        base44.entities.AIWorkflow.filter({ is_template: false })
      ]);
      setTemplates(templatesData);
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    if (!currentStep.feature) return;
    setNewWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, { ...currentStep, step_id: `step_${Date.now()}`, order: prev.steps.length + 1 }]
    }));
    setCurrentStep({
      feature: 'analysis',
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000
    });
  };

  const removeStep = (stepId) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.step_id !== stepId).map((s, i) => ({ ...s, order: i + 1 }))
    }));
  };

  const createWorkflow = async () => {
    if (!newWorkflow.workflow_name || newWorkflow.steps.length === 0) {
      alert('Name und mind. 1 Schritt erforderlich');
      return;
    }

    try {
      await base44.entities.AIWorkflow.create({
        ...newWorkflow,
        is_template: false,
        is_active: true,
        estimated_cost_per_run: calculateCost(newWorkflow.steps)
      });
      setShowBuilder(false);
      setNewWorkflow({ workflow_name: '', description: '', steps: [] });
      await loadTemplatesAndWorkflows();
    } catch (error) {
      console.error('Failed to create:', error);
      alert('Fehler beim Erstellen');
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      await base44.entities.AIWorkflow.create({
        workflow_name: `${template.workflow_name} (Kopie)`,
        description: template.description,
        steps: template.steps,
        is_template: false,
        is_active: true,
        estimated_cost_per_run: template.estimated_cost_per_run
      });
      await loadTemplatesAndWorkflows();
      alert('Template dupliziert');
    } catch (error) {
      console.error('Failed to duplicate:', error);
    }
  };

  const calculateCost = (steps) => {
    const PRICING = {
      'claude-opus-4-1-20250805': 0.015,
      'claude-sonnet-4-20250514': 0.003,
      'claude-haiku-3-5-20241022': 0.0008
    };

    return steps.reduce((sum, step) => {
      const costPerToken = PRICING[step.model] || 0.003;
      return sum + ((step.max_tokens || 1000) * costPerToken / 1000);
    }, 0);
  };

  if (loading) {
    return <div className="text-center py-4">Lade Workflows...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Standard-Workflow-Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {templates.map(template => (
              <div key={template.id} className="border rounded p-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-semibold">{template.workflow_name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <div className="flex gap-2 mt-2">
                    {template.steps.slice(0, 3).map((step, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {step.feature}
                      </Badge>
                    ))}
                    {template.steps.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{template.steps.length - 3}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ {template.estimated_cost_per_run.toFixed(4)}€ pro Ausführung
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateTemplate(template)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Verwenden
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Workflows */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>⚙️ Meine Workflows</CardTitle>
            <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Workflow erstellen</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name*</Label>
                    <Input
                      value={newWorkflow.workflow_name}
                      onChange={(e) => setNewWorkflow({...newWorkflow, workflow_name: e.target.value})}
                      placeholder="z.B. Meine Dokumentenanalyse"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Input
                      value={newWorkflow.description}
                      onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                      placeholder="Was macht dieser Workflow?"
                    />
                  </div>

                  {/* Step Builder */}
                  <div className="border rounded p-3 bg-gray-50 space-y-3">
                    <h4 className="font-semibold text-sm">Schritte hinzufügen</h4>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={currentStep.feature} onValueChange={(v) => setCurrentStep({...currentStep, feature: v})}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEATURES.map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={currentStep.model} onValueChange={(v) => setCurrentStep({...currentStep, model: v})}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MODELS.map(m => (
                            <SelectItem key={m} value={m}>{m.split('-')[1]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        min="100"
                        value={currentStep.max_tokens}
                        onChange={(e) => setCurrentStep({...currentStep, max_tokens: parseInt(e.target.value)})}
                        placeholder="Tokens"
                        className="text-sm"
                      />
                    </div>

                    <Button onClick={addStep} className="w-full text-sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Schritt hinzufügen
                    </Button>
                  </div>

                  {/* Steps Preview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Schritte ({newWorkflow.steps.length})</h4>
                    {newWorkflow.steps.map(step => (
                      <div key={step.step_id} className="bg-white border rounded p-2 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{step.order}</span>
                          <span className="ml-2">{step.feature}</span>
                          <span className="text-gray-500 text-xs ml-2">• {step.model.split('-')[1]}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.step_id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowBuilder(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={createWorkflow} disabled={!newWorkflow.workflow_name || newWorkflow.steps.length === 0}>
                      Erstellen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Keine benutzerdefinierten Workflows
            </div>
          ) : (
            <div className="grid gap-3">
              {workflows.map(workflow => (
                <div key={workflow.id} className="border rounded p-3">
                  <h4 className="font-semibold">{workflow.workflow_name}</h4>
                  <div className="text-sm text-gray-600 mt-1">{workflow.steps.length} Schritte</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}