import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus } from 'lucide-react';

const WORKFLOWS = [
  { id: 1, name: 'Repair Notification', trigger: 'repair_created', actions: 3, executions: 2450, status: 'active' },
  { id: 2, name: 'Payment Reminder', trigger: 'payment_overdue', actions: 2, executions: 1240, status: 'active' },
  { id: 3, name: 'Document Cleanup', trigger: 'scheduled_daily', actions: 1, executions: 45, status: 'active' },
];

const TRIGGERS = [
  'repair_created', 'payment_received', 'payment_overdue', 'document_uploaded',
  'user_registered', 'scheduled_daily', 'scheduled_weekly', 'custom_webhook'
];

const ACTIONS = [
  'send_email', 'send_sms', 'create_task', 'update_user', 'send_webhook', 'log_event'
];

export default function AdminWorkflowAutomation() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6" /> Workflow Automation & Triggers
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-yellow-600 hover:bg-yellow-700">
          <Plus className="w-4 h-4" /> Workflow erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Workflow definieren
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Workflow Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>- Trigger wählen -</option>
              {TRIGGERS.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions:</label>
              {ACTIONS.map(action => (
                <label key={action} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" /> {action}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Workflows', value: '3', color: 'text-blue-600' },
          { label: 'Total Executions', value: '3.7K', color: 'text-green-600' },
          { label: 'Success Rate', value: '99.8%', color: 'text-yellow-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {WORKFLOWS.map(workflow => (
            <div key={workflow.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {workflow.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{workflow.trigger}</span>
                <span>{workflow.actions} actions</span>
                <span>{workflow.executions.toLocaleString()} executions</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Logs</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Triggers & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium text-gray-900 mb-2">Triggers:</p>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map(trigger => (
                <Badge key={trigger} variant="outline" className="text-xs">{trigger}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">Actions:</p>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map(action => (
                <Badge key={action} variant="outline" className="text-xs">{action}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}