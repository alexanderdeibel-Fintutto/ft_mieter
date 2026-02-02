import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FIELD_MAP = {
  MaintenanceTask: ['status', 'priority', 'category', 'assigned_to'],
  Message: ['message_type', 'sender_type', 'content'],
  MeterReading: ['meter_type', 'is_verified'],
  Broadcast: ['target_type', 'status']
};

export default function ConditionBuilder({ condition, onChange, entity }) {
  const fields = FIELD_MAP[entity] || [];

  const handleFieldChange = (field) => {
    onChange({ ...condition, field });
  };

  const handleOperatorChange = (operator) => {
    onChange({ ...condition, operator });
  };

  const handleValueChange = (value) => {
    onChange({ ...condition, value });
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={condition.field} onValueChange={handleFieldChange}>
        <SelectTrigger>
          <SelectValue placeholder="Feld" />
        </SelectTrigger>
        <SelectContent>
          {fields.map(field => (
            <SelectItem key={field} value={field}>
              {field}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition.operator} onValueChange={handleOperatorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equals">Gleich</SelectItem>
          <SelectItem value="contains">Enthält</SelectItem>
          <SelectItem value="greaterThan">Größer als</SelectItem>
          <SelectItem value="lessThan">Kleiner als</SelectItem>
          <SelectItem value="in">In Liste</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Wert"
        value={condition.value}
        onChange={(e) => handleValueChange(e.target.value)}
      />
    </div>
  );
}