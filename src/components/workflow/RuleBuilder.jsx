import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import ConditionBuilder from './ConditionBuilder';
import ActionBuilder from './ActionBuilder';

export default function RuleBuilder({ onSave }) {
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEntity, setTriggerEntity] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('');
  const [conditions, setConditions] = useState([]);
  const [actions, setActions] = useState([]);

  const handleAddCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const handleUpdateCondition = (idx, condition) => {
    const updated = [...conditions];
    updated[idx] = condition;
    setConditions(updated);
  };

  const handleRemoveCondition = (idx) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const handleAddAction = () => {
    setActions([...actions, { type: 'notify', config: {} }]);
  };

  const handleUpdateAction = (idx, action) => {
    const updated = [...actions];
    updated[idx] = action;
    setActions(updated);
  };

  const handleRemoveAction = (idx) => {
    setActions(actions.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!ruleName.trim() || !triggerEntity || !triggerEvent) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus');
      return;
    }

    onSave({
      rule_name: ruleName,
      description,
      trigger_entity: triggerEntity,
      trigger_event: triggerEvent,
      conditions,
      actions
    });

    // Reset form
    setRuleName('');
    setDescription('');
    setTriggerEntity('');
    setTriggerEvent('');
    setConditions([]);
    setActions([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Regel-Grundeinstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Regelname *</label>
            <Input
              placeholder="z.B. Hochpriorisierte Aufgaben benachrichtigen"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Beschreibung</label>
            <Input
              placeholder="Was macht diese Regel?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Auslöser-Entität *</label>
              <Select value={triggerEntity} onValueChange={setTriggerEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MaintenanceTask">Wartungsaufgabe</SelectItem>
                  <SelectItem value="Message">Nachricht</SelectItem>
                  <SelectItem value="MeterReading">Zählerstand</SelectItem>
                  <SelectItem value="Broadcast">Durchsage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Auslöser-Ereignis *</label>
              <Select value={triggerEvent} onValueChange={setTriggerEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Erstellen</SelectItem>
                  <SelectItem value="update">Aktualisieren</SelectItem>
                  <SelectItem value="delete">Löschen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bedingungen</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCondition}
              className="gap-2"
            >
              <Plus size={16} />
              Bedingung hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {conditions.length === 0 ? (
            <p className="text-sm text-gray-500">Keine Bedingungen hinzugefügt</p>
          ) : (
            conditions.map((condition, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <ConditionBuilder
                    condition={condition}
                    onChange={(updated) => handleUpdateCondition(idx, updated)}
                    entity={triggerEntity}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCondition(idx)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Aktionen</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAction}
              className="gap-2"
            >
              <Plus size={16} />
              Aktion hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.length === 0 ? (
            <p className="text-sm text-gray-500">Keine Aktionen hinzugefügt</p>
          ) : (
            actions.map((action, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <ActionBuilder
                    action={action}
                    onChange={(updated) => handleUpdateAction(idx, updated)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAction(idx)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full gap-2">
        <Save size={16} />
        Regel speichern
      </Button>
    </div>
  );
}