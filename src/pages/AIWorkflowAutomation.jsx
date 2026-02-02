import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import useAuth from '../components/useAuth';
import WorkflowOptimizer from '../components/admin/WorkflowOptimizer';
import WorkflowBuilder from '../components/admin/WorkflowBuilder';

export default function AIWorkflowAutomation() {
    const { user } = useAuth();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    
    const [formData, setFormData] = useState({
        rule_name: '',
        description: '',
        trigger_type: 'budget_threshold',
        trigger_config: {},
        action_type: 'send_email',
        action_config: {},
        is_active: true,
        cooldown_minutes: 60
    });

    if (user && user.role !== 'admin') {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-red-800">
                            <ShieldAlert className="h-8 w-8" />
                            <div>
                                <h3 className="font-semibold text-lg">Zugriff verweigert</h3>
                                <p>Nur Administratoren können Workflow-Regeln verwalten.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    useEffect(() => {
        if (user && user.role === 'admin') {
            loadRules();
        }
    }, [user]);

    const loadRules = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.AIWorkflowRule.list('-created_date');
            setRules(data);
        } catch (error) {
            console.error('Failed to load rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingRule) {
                await base44.entities.AIWorkflowRule.update(editingRule.id, formData);
            } else {
                await base44.entities.AIWorkflowRule.create(formData);
            }
            setDialogOpen(false);
            resetForm();
            loadRules();
        } catch (error) {
            console.error('Failed to save rule:', error);
            alert('Fehler beim Speichern');
        }
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            rule_name: rule.rule_name,
            description: rule.description || '',
            trigger_type: rule.trigger_type,
            trigger_config: rule.trigger_config || {},
            action_type: rule.action_type,
            action_config: rule.action_config || {},
            is_active: rule.is_active,
            cooldown_minutes: rule.cooldown_minutes || 60
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Regel wirklich löschen?')) return;
        try {
            await base44.entities.AIWorkflowRule.delete(id);
            loadRules();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const toggleActive = async (rule) => {
        try {
            await base44.entities.AIWorkflowRule.update(rule.id, {
                is_active: !rule.is_active
            });
            loadRules();
        } catch (error) {
            console.error('Failed to toggle:', error);
        }
    };

    const resetForm = () => {
        setEditingRule(null);
        setFormData({
            rule_name: '',
            description: '',
            trigger_type: 'budget_threshold',
            trigger_config: {},
            action_type: 'send_email',
            action_config: {},
            is_active: true,
            cooldown_minutes: 60
        });
    };

    const getTriggerName = (type) => {
        const names = {
            budget_threshold: 'Budget-Schwellenwert',
            feature_usage: 'Feature-Nutzung',
            ai_classification: 'AI-Klassifizierung',
            cost_spike: 'Kosten-Anstieg',
            error_rate: 'Fehlerrate'
        };
        return names[type] || type;
    };

    const getActionName = (type) => {
        const names = {
            send_email: 'E-Mail senden',
            send_notification: 'Benachrichtigung',
            create_task: 'Aufgabe erstellen',
            webhook: 'Webhook aufrufen',
            disable_feature: 'Feature deaktivieren'
        };
        return names[type] || type;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">⚙️ AI-Workflow-Automatisierung</h1>
            
            {/* Optimization & Builder Section */}
            <div className="space-y-6">
                <WorkflowOptimizer />
                <WorkflowBuilder />
            </div>

            {/* Workflow Rules */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        Workflow-Regeln
                    </h2>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Neue Regel
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingRule ? 'Regel bearbeiten' : 'Neue Workflow-Regel'}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Regelname*</Label>
                                <Input
                                    value={formData.rule_name}
                                    onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                                    placeholder="z.B. Budget-Warnung bei 80%"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Beschreibung</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Beschreiben Sie, was diese Regel macht..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Auslöser*</Label>
                                    <Select
                                        value={formData.trigger_type}
                                        onValueChange={(value) => setFormData({...formData, trigger_type: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="budget_threshold">Budget-Schwellenwert</SelectItem>
                                            <SelectItem value="cost_spike">Kosten-Anstieg</SelectItem>
                                            <SelectItem value="ai_classification">AI-Klassifizierung</SelectItem>
                                            <SelectItem value="error_rate">Fehlerrate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Aktion*</Label>
                                    <Select
                                        value={formData.action_type}
                                        onValueChange={(value) => setFormData({...formData, action_type: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="send_email">E-Mail senden</SelectItem>
                                            <SelectItem value="send_notification">Benachrichtigung</SelectItem>
                                            <SelectItem value="create_task">Aufgabe erstellen</SelectItem>
                                            <SelectItem value="webhook">Webhook</SelectItem>
                                            <SelectItem value="disable_feature">Feature deaktivieren</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Wartezeit zwischen Ausführungen (Minuten)</Label>
                                <Input
                                    type="number"
                                    value={formData.cooldown_minutes}
                                    onChange={(e) => setFormData({...formData, cooldown_minutes: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                                />
                                <Label>Regel ist aktiv</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Abbrechen
                                </Button>
                                <Button onClick={handleSave}>
                                    Speichern
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                    </Dialog>
                </div>

            <Card>
                <CardHeader>
                    <CardTitle>Aktive Workflow-Regeln</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Lade Regeln...</div>
                    ) : rules.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Noch keine Workflow-Regeln erstellt
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Auslöser</TableHead>
                                    <TableHead>Aktion</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ausführungen</TableHead>
                                    <TableHead>Letzte Ausführung</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell>
                                            <div className="font-medium">{rule.rule_name}</div>
                                            {rule.description && (
                                                <div className="text-sm text-gray-500">{rule.description}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getTriggerName(rule.trigger_type)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge>{getActionName(rule.action_type)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={rule.is_active}
                                                onCheckedChange={() => toggleActive(rule)}
                                            />
                                        </TableCell>
                                        <TableCell>{rule.execution_count || 0}</TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {rule.last_execution 
                                                ? new Date(rule.last_execution).toLocaleString('de-DE')
                                                : 'Noch nie'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(rule)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(rule.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    );
}