import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus, Loader2, Droplet, Flame, Zap, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ZaehlerOCR from '../components/zaehler/ZaehlerOCR';

const METER_TYPES = [
  { value: 'strom', label: 'Strom', icon: Zap, unit: 'kWh', color: 'text-yellow-500' },
  { value: 'gas', label: 'Gas', icon: Flame, unit: 'm³', color: 'text-orange-500' },
  { value: 'kaltwasser', label: 'Kaltwasser', icon: Droplet, unit: 'm³', color: 'text-blue-500' },
  { value: 'warmwasser', label: 'Warmwasser', icon: Droplet, unit: 'm³', color: 'text-red-500' },
];

function MeterCard({ reading, type }) {
  const meterType = METER_TYPES.find(t => t.value === type) || METER_TYPES[0];
  const Icon = meterType.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-gray-100 ${meterType.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{meterType.label}</h3>
          <p className="text-xs text-gray-500">Zähler: {reading.meter_number || 'Unbekannt'}</p>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold text-gray-900">{reading.value?.toLocaleString('de-DE')}</p>
          <p className="text-xs text-gray-500">{meterType.unit}</p>
        </div>
        <p className="text-xs text-gray-400">{new Date(reading.reading_date).toLocaleDateString('de-DE')}</p>
      </div>
    </div>
  );
}

export default function Zaehler() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    meter_type: '',
    value: '',
    meter_number: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadReadings();
  }, [user, authLoading]);

  const loadReadings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*')
      .eq('submitted_by', user.id)
      .order('reading_date', { ascending: false });
    
    if (!error && data) setReadings(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.meter_type || !form.value) {
      toast.error('Bitte Zählertyp und Stand angeben');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('meter_readings').insert({
      meter_type: form.meter_type,
      value: parseFloat(form.value),
      meter_number: form.meter_number,
      reading_date: new Date().toISOString(),
      submitted_by: user.id,
    });

    if (error) {
      toast.error('Fehler beim Speichern');
    } else {
      toast.success('Zählerstand erfolgreich übermittelt!');
      setShowForm(false);
      setForm({ meter_type: '', value: '', meter_number: '' });
      loadReadings();
    }
    setSubmitting(false);
  };

  // Group readings by meter type (show only latest per type)
  const latestReadings = METER_TYPES.map(type => {
    const latest = readings.find(r => r.meter_type === type.value);
    return latest ? { ...latest, type: type.value } : null;
  }).filter(Boolean);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 border-b bg-white flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">📊 Zählerablesung</h1>
        <Button onClick={() => setShowForm(true)} className="bg-[#8B5CF6] hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-1" /> Erfassen
        </Button>
      </header>

      <div className="p-4 space-y-3">
        {latestReadings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Keine Zählerstände erfasst</p>
            <p className="text-sm">Tippe auf "Erfassen" um einen Stand zu übermitteln</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {latestReadings.map(r => <MeterCard key={r.id} reading={r} type={r.type} />)}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Zählerstand erfassen</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="ocr" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ocr" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Mit Foto (KI)
              </TabsTrigger>
              <TabsTrigger value="manual">Manuell eingeben</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ocr" className="mt-4">
              <ZaehlerOCR
                meterType={form.meter_type}
                appSource="mieterapp"
                onSuccess={(result) => {
                  toast.success('Zählerstand erfolgreich erfasst!');
                  setShowForm(false);
                  loadReadings();
                }}
                onError={(error) => {
                  toast.error('Fehler bei der Erkennung');
                }}
              />
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select value={form.meter_type} onValueChange={(v) => setForm({ ...form, meter_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zählertyp wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {METER_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Zählerstand"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
                <Input
                  placeholder="Zählernummer (optional)"
                  value={form.meter_number}
                  onChange={(e) => setForm({ ...form, meter_number: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#8B5CF6] hover:bg-violet-700" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}