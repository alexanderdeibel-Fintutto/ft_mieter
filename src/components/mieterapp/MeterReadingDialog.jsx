import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MeterReadingDialog({ isOpen, onClose, meter, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!reading || isNaN(reading) || parseFloat(reading) < 0) {
        setError('Bitte gib einen gültigen Zählerstand ein');
        setLoading(false);
        return;
      }

      const result = await base44.functions.invoke('tenantMeterReading', {
        meterNumber: meter.meter_number,
        meterType: meter.meter_type,
        readingValue: parseFloat(reading)
      });

      if (result.data?.success) {
        setReading('');
        onSuccess?.();
        onClose();
      } else {
        setError(result.data?.error || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError(err.message || 'Fehler beim Übermitteln');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zählerstand übermitteln</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <p><strong>Zähler:</strong> {meter?.meter_number}</p>
              <p><strong>Typ:</strong> {meter?.meter_type}</p>
              <p><strong>Letzte Ablesung:</strong> {meter?.last_reading_value || 'Keine'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Aktueller Zählerstand *</label>
            <Input
              type="number"
              required
              placeholder="z.B. 12345"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              disabled={loading}
              step="0.01"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Muss höher sein als die letzte Ablesung
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird übermittelt...
                </>
              ) : (
                'Zählerstand übermitteln'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}