import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function ActionBuilder({ action, onChange }) {
  const [actionType, setActionType] = useState(action.type);

  const handleTypeChange = (type) => {
    setActionType(type);
    onChange({ type, config: {} });
  };

  const handleConfigChange = (key, value) => {
    onChange({
      type: actionType,
      config: { ...action.config, [key]: value }
    });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <Select value={actionType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Aktionstyp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notify">Benachrichtigung senden</SelectItem>
              <SelectItem value="create_task">Aufgabe erstellen</SelectItem>
              <SelectItem value="update_field">Feld aktualisieren</SelectItem>
              <SelectItem value="send_email">Email senden</SelectItem>
            </SelectContent>
          </Select>

          {actionType === 'notify' && (
            <>
              <Input
                placeholder="Empfänger (User-ID oder 'assigned_to')"
                value={action.config.recipient || ''}
                onChange={(e) => handleConfigChange('recipient', e.target.value)}
              />
              <Input
                placeholder="Nachricht"
                value={action.config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
              />
            </>
          )}

          {actionType === 'create_task' && (
            <>
              <Input
                placeholder="Aufgabentitel"
                value={action.config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
              />
              <Select value={action.config.priority || ''} onValueChange={(val) => handleConfigChange('priority', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Zugewiesen an (User-ID)"
                value={action.config.assigned_to || ''}
                onChange={(e) => handleConfigChange('assigned_to', e.target.value)}
              />
            </>
          )}

          {actionType === 'update_field' && (
            <>
              <Input
                placeholder="Feldname"
                value={action.config.field || ''}
                onChange={(e) => handleConfigChange('field', e.target.value)}
              />
              <Input
                placeholder="Neuer Wert"
                value={action.config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
              />
            </>
          )}

          {actionType === 'send_email' && (
            <>
              <Input
                placeholder="Empfänger Email"
                value={action.config.email || ''}
                onChange={(e) => handleConfigChange('email', e.target.value)}
              />
              <Input
                placeholder="Betreff"
                value={action.config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
              />
              <textarea
                placeholder="Email-Text"
                value={action.config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}