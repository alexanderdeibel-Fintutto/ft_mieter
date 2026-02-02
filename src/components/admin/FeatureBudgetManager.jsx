import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function FeatureBudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [formData, setFormData] = useState({
    feature_key: '',
    display_name: '',
    monthly_budget_eur: 0,
    alert_threshold_percent: 80,
    action_on_overage: 'warn',
    is_enabled: true,
    preferred_model: ''
  });

  useEffect(() => {
    loadBudgets();
    loadFeatures();
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await base44.entities.FeatureBudget.list('-created_date');
      setBudgets(data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    try {
      const data = await base44.entities.AIFeatureConfig.list();
      setFeatures(data);
    } catch (error) {
      console.error('Failed to load features:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingBudget) {
        await base44.entities.FeatureBudget.update(editingBudget.id, formData);
      } else {
        await base44.entities.FeatureBudget.create(formData);
      }
      setDialogOpen(false);
      resetForm();
      loadBudgets();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      feature_key: budget.feature_key,
      display_name: budget.display_name,
      monthly_budget_eur: budget.monthly_budget_eur,
      alert_threshold_percent: budget.alert_threshold_percent,
      action_on_overage: budget.action_on_overage,
      is_enabled: budget.is_enabled,
      preferred_model: budget.preferred_model || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Sicher?')) return;
    try {
      await base44.entities.FeatureBudget.delete(id);
      loadBudgets();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const resetForm = () => {
    setEditingBudget(null);
    setFormData({
      feature_key: '',
      display_name: '',
      monthly_budget_eur: 0,
      alert_threshold_percent: 80,
      action_on_overage: 'warn',
      is_enabled: true,
      preferred_model: ''
    });
  };

  const getFeatureDisplay = (key) => {
    const feature = features.find(f => f.feature_key === key);
    return feature?.display_name || key;
  };

  const getActionColor = (action) => {
    const colors = {
      none: 'bg-gray-100 text-gray-800',
      warn: 'bg-yellow-100 text-yellow-800',
      disable: 'bg-red-100 text-red-800',
      throttle: 'bg-orange-100 text-orange-800'
    };
    return colors[action] || colors.warn;
  };

  if (loading) {
    return <div className="text-center py-4">Lade Budgets...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>💰 Feature-Budgets</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neues Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? 'Budget bearbeiten' : 'Neues Budget erstellen'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Feature*</Label>
                  <Select
                    value={formData.feature_key}
                    onValueChange={(value) => {
                      const feature = features.find(f => f.feature_key === value);
                      setFormData({
                        ...formData,
                        feature_key: value,
                        display_name: feature?.display_name || value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {features.map(f => (
                        <SelectItem key={f.id} value={f.feature_key}>
                          {f.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monatliches Budget (€)*</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthly_budget_eur}
                    onChange={(e) => setFormData({...formData, monthly_budget_eur: parseFloat(e.target.value)})}
                    placeholder="0 = unbegrenzt"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Warnungsschwelle (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.alert_threshold_percent}
                    onChange={(e) => setFormData({...formData, alert_threshold_percent: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aktion bei Überschreitung</Label>
                  <Select
                    value={formData.action_on_overage}
                    onValueChange={(value) => setFormData({...formData, action_on_overage: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine</SelectItem>
                      <SelectItem value="warn">Warnen</SelectItem>
                      <SelectItem value="disable">Deaktivieren</SelectItem>
                      <SelectItem value="throttle">Drosseln</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
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
      </CardHeader>

      <CardContent>
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Keine Feature-Budgets konfiguriert
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Diese Woche</TableHead>
                <TableHead>Auslastung</TableHead>
                <TableHead>Aktion</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map(budget => {
                const usage = budget.monthly_budget_eur > 0 
                  ? Math.round(((budget.cost_tracker?.current_month_cost || 0) / budget.monthly_budget_eur) * 100)
                  : 0;
                
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">
                      {budget.display_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {budget.monthly_budget_eur === 0 ? '∞' : `${budget.monthly_budget_eur.toFixed(2)}€`}
                    </TableCell>
                    <TableCell className="text-right">
                      {(budget.cost_tracker?.current_month_cost || 0).toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {budget.monthly_budget_eur > 0 && (
                          <>
                            <Progress value={Math.min(usage, 100)} />
                            <span className="text-xs text-gray-500">{usage}%</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(budget.action_on_overage)}>
                        {budget.action_on_overage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}