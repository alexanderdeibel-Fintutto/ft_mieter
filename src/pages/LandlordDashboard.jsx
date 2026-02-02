import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import BuildingOverviewCard from '../components/landlord/BuildingOverviewCard';
import PendingMeterReadingsPanel from '../components/landlord/PendingMeterReadingsPanel';
import MaintenanceTasksPanel from '../components/landlord/MaintenanceTasksPanel';
import TenantManagementPanel from '../components/landlord/TenantManagementPanel';
import FinancialsSummary from '../components/landlord/FinancialsSummary';

export default function LandlordDashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => await base44.auth.me(),
  });

  const { data: buildings = [], isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getLandlordData', { dataType: 'buildings' });
      return data;
    },
  });

  if (userLoading || buildingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Vermieter-Dashboard</h1>
          <p className="text-gray-600 mt-2">Willkommen, {user?.full_name}! Verwalte deine Immobilien effizienter.</p>
        </div>

        {/* Financial Summary */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Finanzübersicht</h2>
          <FinancialsSummary />
        </section>

        {/* Buildings Overview */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Deine Gebäude</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <BuildingOverviewCard key={building.building_id} building={building} />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Approvals & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <PendingMeterReadingsPanel />
            <MaintenanceTasksPanel />
          </div>

          {/* Right Column - Tenants */}
          <div>
            <TenantManagementPanel />
          </div>
        </div>

        {/* Empty State */}
        {buildings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-600">Noch keine Gebäude hinzugefügt.</p>
            <p className="text-sm text-gray-500 mt-1">Füge deine erste Immobilie hinzu, um zu beginnen.</p>
          </div>
        )}
      </div>
    </div>
  );
}