import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Zap } from 'lucide-react';
import RuleBuilder from '../components/workflow/RuleBuilder';
import RulesList from '../components/workflow/RulesList';

export default function WorkflowAutomation() {
  const [activeTab, setActiveTab] = useState('list');
  const [editingRule, setEditingRule] = useState(null);

  const handleSaveRule = async (ruleData) => {
    if (editingRule) {
      await base44.entities.WorkflowRule.update(editingRule.id, ruleData);
      setEditingRule(null);
    } else {
      await base44.entities.WorkflowRule.create(ruleData);
    }
    setActiveTab('list');
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setActiveTab('builder');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-500" size={32} />
            <h1 className="text-3xl font-bold">Workflow-Automatisierung</h1>
          </div>
          <p className="text-gray-600">
            Erstellen Sie Regeln, um wiederkehrende Aufgaben zu automatisieren und Aktionen bei bestimmten Bedingungen auszulösen.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Meine Regeln</TabsTrigger>
            <TabsTrigger value="builder">Neue Regel erstellen</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Workflow-Regeln</h2>
                <Button
                  onClick={() => setActiveTab('builder')}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Neue Regel
                </Button>
              </div>
              <RulesList onEdit={handleEdit} />
            </div>
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {editingRule ? 'Regel bearbeiten' : 'Neue Regel erstellen'}
                </h2>
                <RuleBuilder onSave={handleSaveRule} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Beispiele */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Regel-Beispiele</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>1. Hochpriorisierte Aufgaben benachrichtigen</strong>
              <p className="text-gray-700">
                Wenn MaintenanceTask aktualisiert wird UND status="open" UND priority="high", 
                dann Benachrichtigung an assigned_to senden
              </p>
            </div>
            <div>
              <strong>2. Automatische Facility-Aufgabe bei Schadensmeldung</strong>
              <p className="text-gray-700">
                Wenn MaintenanceTask erstellt wird, dann Aufgabe für Facility Management erstellen 
                und Mieter benachrichtigen
              </p>
            </div>
            <div>
              <strong>3. Zählerstand Validierung</strong>
              <p className="text-gray-700">
                Wenn MeterReading erstellt wird UND is_verified=false, 
                dann Nachricht an Administrator senden
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}