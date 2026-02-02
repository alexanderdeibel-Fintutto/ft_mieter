import React from 'react';
import { base44 } from '@/api/base44Client';
import { Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function UpcomingRepairsWidget() {
  const { data: repairs = [], isLoading } = useQuery({
    queryKey: ['upcoming_repairs'],
    queryFn: async () => {
      const result = await base44.entities.MaintenanceTask.filter({
        status: 'open'
      }, 'due_date', 50);
      return result || [];
    }
  });

  const urgent = repairs.filter(r => r.priority === 'urgent').length;
  const high = repairs.filter(r => r.priority === 'high').length;
  const medium = repairs.filter(r => r.priority === 'medium').length;

  const priorityColor = {
    urgent: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    high: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bevorstehende Reparaturen
        </h3>
        <Wrench className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {repairs.length}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg ${priorityColor.urgent}`}>
            <p className="text-xs font-medium">Dringend</p>
            <p className="text-2xl font-bold">{urgent}</p>
          </div>
          <div className={`p-3 rounded-lg ${priorityColor.high}`}>
            <p className="text-xs font-medium">Hoch</p>
            <p className="text-2xl font-bold">{high}</p>
          </div>
          <div className={`p-3 rounded-lg ${priorityColor.medium}`}>
            <p className="text-xs font-medium">Mittel</p>
            <p className="text-2xl font-bold">{medium}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-500">Lädt...</div>
        ) : repairs.length === 0 ? (
          <p className="text-sm text-green-600 dark:text-green-400">✓ Keine offenen Reparaturen</p>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Nächste Reparatur</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {repairs[0]?.title}
            </p>
            {repairs[0]?.due_date && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(repairs[0].due_date).toLocaleDateString('de-DE')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}