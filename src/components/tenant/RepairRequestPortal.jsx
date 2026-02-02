import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CreateRepairDialog from './CreateRepairDialog';

export default function RepairRequestPortal() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => await base44.auth.me()
  });

  const { data: repairs = [], isLoading } = useQuery({
    queryKey: ['my_repairs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await base44.entities.MaintenanceTask.filter({
        assigned_to: user.id
      }, '-created_date', 50);
      return result || [];
    },
    enabled: !!user?.id
  });

  const statusConfig = {
    open: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Offen' },
    in_progress: { icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'In Bearbeitung' },
    completed: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Abgeschlossen' },
  };

  const statusStats = {
    open: repairs.filter(r => r.status === 'open').length,
    in_progress: repairs.filter(r => r.status === 'in_progress').length,
    completed: repairs.filter(r => r.status === 'completed').length,
  };

  if (isLoading) {
    return <div className="text-center py-8">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(statusStats).map(([status, count]) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Card key={status} className={`${config.bg}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Icon className={`w-8 h-8 ${config.color}`} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{config.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Request Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Neue Reparaturanfrage
        </Button>
      </div>

      {/* Repairs List */}
      {repairs.length === 0 ? (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <p className="text-green-900 dark:text-green-300">
              ✓ Keine offenen Reparaturanfragen
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {repairs.map(repair => {
            const config = statusConfig[repair.status];
            const Icon = config.icon;
            return (
              <Card key={repair.id} className="bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {repair.title}
                        </h3>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </div>
                      </div>
                      {repair.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{repair.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-500">Kategorie</p>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {repair.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-500">Priorität</p>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {repair.priority}
                          </p>
                        </div>
                        {repair.due_date && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-500">Fälligkeitsdatum</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(repair.due_date).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateRepairDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my_repairs'] });
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}