import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { usePendingMeterReadings, useApproveMeterReading } from '@/components/hooks/useLandlordData';
import { Textarea } from '@/components/ui/textarea';

export default function PendingMeterReadingsPanel() {
  const { data: readings = [], isLoading } = usePendingMeterReadings();
  const approveMutation = useApproveMeterReading();
  const [selectedReading, setSelectedReading] = useState(null);
  const [notes, setNotes] = useState('');

  const handleApprove = async (readingId, approved) => {
    await approveMutation.mutateAsync({
      readingId,
      approved,
      notes
    });
    setSelectedReading(null);
    setNotes('');
  };

  const getMeterTypeIcon = (type) => {
    if (type === 'electricity') return <Zap className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Zählerablesen - Genehmigung erforderlich
          </CardTitle>
          <Badge variant="outline">{readings.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : readings.length === 0 ? (
          <p className="text-center text-gray-600 py-6">Keine ausstehenden Genehmigungen</p>
        ) : (
          <div className="space-y-2">
            {readings.map((reading) => (
              <div
                key={reading.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedReading(reading)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">Zähler {reading.meter_number}</p>
                    <p className="text-sm text-gray-600">
                      Stand: {reading.reading_value} | {new Date(reading.reading_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReading(reading);
                    }}
                  >
                    Prüfen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedReading} onOpenChange={() => setSelectedReading(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zählerablesung genehmigen/ablehnen</DialogTitle>
              <DialogDescription>
                Zähler: {selectedReading?.meter_number} | Stand: {selectedReading?.reading_value}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedReading?.photo_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Foto:</p>
                  <img src={selectedReading.photo_url} alt="Zähler" className="max-w-sm rounded-lg" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Notizen (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="z.B. Abweichung bemerkt..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedReading.id, true)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Genehmigen
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => handleApprove(selectedReading.id, false)}
                  disabled={approveMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Ablehnen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}