import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, AlertCircle } from 'lucide-react';

export default function MieterMeters() {
  const [showNewReading, setShowNewReading] = useState(false);
  const [newReading, setNewReading] = useState({
    meter_type: 'strom',
    reading_value: '',
    reading_date: new Date().toISOString().split('T')[0],
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: meterReadings } = useQuery({
    queryKey: ['meterReadings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.MeterReading.filter(
        { user_id: user.email },
        '-reading_date'
      );
    },
  });

  // Group by meter type
  const groupedByType = React.useMemo(() => {
    if (!meterReadings) return {};
    const grouped = {};
    meterReadings.forEach((reading) => {
      if (!grouped[reading.meter_type]) {
        grouped[reading.meter_type] = [];
      }
      grouped[reading.meter_type].push(reading);
    });
    return grouped;
  }, [meterReadings]);

  const createReadingMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MeterReading.create({
        user_id: user.email,
        reading_value: parseFloat(newReading.reading_value),
        reading_date: newReading.reading_date,
        meter_type: newReading.meter_type,
        source: 'manual',
        is_verified: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meterReadings'] });
      setNewReading({ meter_type: 'strom', reading_value: '', reading_date: new Date().toISOString().split('T')[0] });
      setShowNewReading(false);
    },
  });

  const meterTypeLabels = {
    strom: '⚡ Strom',
    gas: '🔥 Gas',
    wasser: '💧 Wasser',
    heizung: '🌡️ Heizung',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Zählerstände</h1>
          <Button onClick={() => setShowNewReading(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" /> Neuer Zählerstand
          </Button>
        </div>

        {/* New Reading Form */}
        {showNewReading && (
          <Card className="bg-white border-2 border-orange-200">
            <CardHeader>
              <CardTitle>Zählerstand erfassen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Zählertyp</label>
                <select
                  value={newReading.meter_type}
                  onChange={(e) => setNewReading({ ...newReading, meter_type: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="strom">Strom</option>
                  <option value="gas">Gas</option>
                  <option value="wasser">Wasser</option>
                  <option value="heizung">Heizung</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Zählerstand</label>
                <Input
                  type="number"
                  placeholder="z.B. 3456.78"
                  value={newReading.reading_value}
                  onChange={(e) => setNewReading({ ...newReading, reading_value: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Datum</label>
                <Input
                  type="date"
                  value={newReading.reading_date}
                  onChange={(e) => setNewReading({ ...newReading, reading_date: e.target.value })}
                />
              </div>
              <Button
                onClick={() => createReadingMutation.mutate()}
                disabled={!newReading.reading_value || createReadingMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Speichern
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Meter Readings by Type */}
        {Object.entries(groupedByType).map(([meterType, readings]) => (
          <div key={meterType}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {meterTypeLabels[meterType]}
            </h2>
            <div className="space-y-3">
              {readings.map((reading) => (
                <Card key={reading.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-gray-900">{reading.reading_value}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(reading.reading_date).toLocaleDateString('de-DE')}
                        </p>
                        {reading.meter_number && (
                          <p className="text-xs text-gray-500 mt-1">
                            Zähler: {reading.meter_number}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {reading.is_verified ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verifiziert
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Ausstehend
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {meterReadings?.length === 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center text-gray-600">
              Noch keine Zählerstände erfasst. Beginne mit der Erfassung deiner ersten Zählerstände.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}