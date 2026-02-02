import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Trash2, Edit2, Eye } from 'lucide-react';

export default function RulesList({ onEdit }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    const loadedRules = await base44.entities.WorkflowRule.list();
    setRules(loadedRules || []);
    setLoading(false);
  };

  const handleToggle = async (rule) => {
    await base44.entities.WorkflowRule.update(rule.id, {
      is_active: !rule.is_active
    });
    loadRules();
  };

  const handleDelete = async (ruleId) => {
    if (confirm('Regel wirklich löschen?')) {
      await base44.entities.WorkflowRule.delete(ruleId);
      loadRules();
    }
  };

  if (loading) {
    return <div className="text-center py-4">Wird geladen...</div>;
  }

  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          Keine Regeln erstellt
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map(rule => (
        <Card key={rule.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{rule.rule_name}</h3>
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>

                {rule.description && (
                  <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <span className="font-medium">Auslöser:</span> {rule.trigger_entity} ({rule.trigger_event})
                  </div>
                  <div>
                    <span className="font-medium">Bedingungen:</span> {rule.conditions?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Aktionen:</span> {rule.actions?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Ausgeführt:</span> {rule.execution_count} Mal
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Toggle
                  pressed={rule.is_active}
                  onPressedChange={() => handleToggle(rule)}
                  className="h-9 px-3"
                >
                  <Eye size={16} />
                </Toggle>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(rule)}
                  className="gap-2"
                >
                  <Edit2 size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(rule.id)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}