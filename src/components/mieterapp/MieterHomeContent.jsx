import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap, Wrench, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { useTenantDashboard, useMeters, useOpenTasks } from '@/components/hooks/useTenantData';
import { base44 } from '@/api/base44Client';
import CreateMaintenanceTaskDialog from './CreateMaintenanceTaskDialog';
import MeterReadingDialog from './MeterReadingDialog';
import RealTimeDataSync from './RealTimeDataSync';

export default function MieterHomeContent() {
  const [user, setUser] = React.useState(null);
  const { data: dashboard, loading: dashLoading, refresh: refreshDashboard } = useTenantDashboard(user?.id);
  const { meters, loading: metersLoading } = useMeters(dashboard?.building_id);
  const { tasks, loading: tasksLoading, refresh: refreshTasks } = useOpenTasks(dashboard?.org_id);
  
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showMeterDialog, setShowMeterDialog] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);

  React.useEffect(() => {
    const load = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    load();
  }, []);

  const handleMeterClick = (meter) => {
    setSelectedMeter(meter);
    setShowMeterDialog(true);
  };

  const handleMaintenanceSuccess = () => {
    refreshDashboard();
    refreshTasks();
  };

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="font-semibold text-red-900 mb-1">Mieterdaten nicht gefunden</h3>
        <p className="text-sm text-red-700">Bitte kontaktiere deinen Vermieter</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RealTimeDataSync userId={user?.id} />
      {/* Willkommen */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle>Willkommen, {user?.full_name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Gebäude:</strong> {dashboard.building_name}</p>
            <p><strong>Einheit:</strong> {dashboard.unit_number}</p>
            <p><strong>Miete:</strong> {dashboard.total_rent}€</p>
          </div>
        </CardContent>
      </Card>

      {/* Schnellaktionen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => setShowMaintenanceDialog(true)}
          className="h-20 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Wrench className="w-5 h-5 mr-2" />
          <span>Schaden melden</span>
        </Button>

        <Button
          onClick={() => {
            if (meters && meters.length > 0) {
              handleMeterClick(meters[0]);
            }
          }}
          disabled={!meters || meters.length === 0}
          className="h-20 bg-green-600 hover:bg-green-700 text-white"
        >
          <Zap className="w-5 h-5 mr-2" />
          <span>Zähler ablesen</span>
        </Button>
      </div>

      {/* Offene Aufgaben */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Offene Schadensmeldungen ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : tasks.length === 0 ? (
            <p className="text-sm text-gray-600">Keine offenen Schadensmeldungen</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                        ${task.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                        ${task.priority === 'normal' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${task.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                      `}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zähler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Zähler ({meters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metersLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : meters.length === 0 ? (
            <p className="text-sm text-gray-600">Keine Zähler vorhanden</p>
          ) : (
            <div className="space-y-3">
              {meters.map((meter) => (
                <div key={meter.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{meter.meter_number} ({meter.meter_type})</p>
                      <p className="text-sm text-gray-600">Letzte: {meter.last_reading_value || '-'}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleMeterClick(meter)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Ablesen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialoge */}
      <CreateMaintenanceTaskDialog
        isOpen={showMaintenanceDialog}
        onClose={() => setShowMaintenanceDialog(false)}
        onSuccess={handleMaintenanceSuccess}
      />

      {selectedMeter && (
        <MeterReadingDialog
          isOpen={showMeterDialog}
          onClose={() => setShowMeterDialog(false)}
          meter={selectedMeter}
          onSuccess={() => {
            refreshDashboard();
            setShowMeterDialog(false);
          }}
        />
      )}
    </div>
  );
}