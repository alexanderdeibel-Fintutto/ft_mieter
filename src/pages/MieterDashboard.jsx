import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AccessGate from '@/components/AccessGate';
import { Home, AlertCircle, FileText, CreditCard, Phone, Mail, MapPin, Wrench, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Custom hook: Lädt Wohnungsdaten des Mieters
function useMyUnit() {
  const [unit, setUnit] = useState(null);
  const [building, setBuilding] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    loadUnitDetails();
  }, []);

  const loadUnitDetails = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      
      // Get seat allocation
      const allocations = await base44.entities.SeatAllocation.filter({
        receiving_user_id: user.id,
        app_id: 'mieterapp',
        is_active: true
      });

      if (allocations.length === 0) {
        setLoading(false);
        return;
      }

      const scope = allocations[0].access_scope || {};
      if (!scope.unit_id) {
        setLoading(false);
        return;
      }

      // Load unit
      const units = await base44.entities.Unit.filter({
        id: scope.unit_id
      });
      const u = units[0];
      setUnit(u);

      if (u?.building_id) {
        const buildings = await base44.entities.Building.filter({
          id: u.building_id
        });
        setBuilding(buildings[0]);

        // Load organization
        if (buildings[0]?.organization_id) {
          const orgs = await base44.entities.Organization.filter({
            id: buildings[0].organization_id
          });
          setOrg(orgs[0]);
        }
      }

      // Load active contract
      if (u?.id) {
        const leases = await base44.entities.Lease.filter({
          unit_id: u.id,
          status: 'active'
        });
        setContract(leases[0] || null);
      }
    } catch (error) {
      console.error('Load unit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { unit, building, contract, org, loading, refresh: loadUnitDetails };
}

function MieterDashboardContent() {
  const { unit, building, contract, org, loading } = useMyUnit();

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Daten werden geladen...</p>
      </div>
    );
  }

  if (!unit || !building) {
    return (
      <div className="p-6 text-center text-red-600">
        Wohnungsdaten konnten nicht geladen werden.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Home className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Wohnung {unit.unit_number}</h1>
              <p className="text-blue-100 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {building.address?.street} {building.address?.house_number}, {building.address?.zip} {building.address?.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <OverviewTab unit={unit} building={building} contract={contract} />
      </div>
    </div>
  );
}

// Übersicht Tab
function OverviewTab({ unit, building, contract }) {
  return (
    <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/service-requests"
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Schaden melden</p>
                <p className="text-xs text-gray-500">Schnell erfassen</p>
              </div>
            </div>
          </a>

          <a
            href="/documents"
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Dokumente</p>
                <p className="text-xs text-gray-500">Verträge ansehen</p>
              </div>
            </div>
          </a>

          <a
            href="/billing"
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Zahlungen</p>
                <p className="text-xs text-gray-500">Übersicht</p>
              </div>
            </div>
          </a>
        </div>

        {/* Mietvertrag */}
        {contract && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Mietvertrag
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Kaltmiete</p>
                  <p className="font-bold">€{(contract.rent_cold || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Nebenkosten</p>
                  <p className="font-bold">€{(contract.rent_utilities || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Kaution</p>
                  <p className="font-bold">€{(contract.deposit_amount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">Gesamtmiete</p>
                  <p className="font-bold text-blue-600">€{((contract.rent_cold || 0) + (contract.rent_utilities || 0)).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wohnungs-Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Wohnungsdetails
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold">{unit.size_sqm || '—'}</p>
              <p className="text-xs text-gray-600">m²</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold">{unit.rooms || '—'}</p>
              <p className="text-xs text-gray-600">Zimmer</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold">{unit.floor || 'EG'}</p>
              <p className="text-xs text-gray-600">Etage</p>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Fragen oder Probleme?</h2>
          <p className="text-sm text-gray-700 mb-3">Kontaktiere deine Hausverwaltung direkt</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Anrufen
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              E-Mail
            </Button>
          </div>
        </div>
      </div>
    );
}

function MieterDashboardPage() {
  return (
    <AccessGate>
      <MieterDashboardContent />
    </AccessGate>
  );
}

export default MieterDashboardPage;