import React from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function BuildingMetricsWidget() {
  const { data: buildings = [], isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const result = await base44.entities.MieterBuilding.list();
      return result || [];
    }
  });

  const { data: leases = [], isLoading: leasesLoading } = useQuery({
    queryKey: ['leases_count'],
    queryFn: async () => {
      const result = await base44.entities.Lease.filter({ status: 'active' });
      return result || [];
    }
  });

  const isLoading = buildingsLoading || leasesLoading;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gebäudemetriken
        </h3>
        <Building2 className="w-5 h-5 text-green-500" />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-gray-500">Lädt...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Gebäude</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {buildings.length}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktive Mietverträge</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {leases.length}
                </p>
              </div>
            </div>

            {buildings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-3">Gebäudeübersicht</p>
                <div className="space-y-2">
                  {buildings.slice(0, 2).map(building => (
                    <div key={building.id} className="flex justify-between text-sm">
                      <p className="text-gray-700 dark:text-gray-300 truncate">{building.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">{building.city}</p>
                    </div>
                  ))}
                  {buildings.length > 2 && (
                    <p className="text-xs text-gray-500 pt-2">
                      +{buildings.length - 2} weitere Gebäude
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}