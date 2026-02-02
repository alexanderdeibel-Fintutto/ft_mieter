import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, Ruler, Calendar, User, Phone, Mail, FileText, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="p-2 bg-violet-50 rounded-lg">
        <Icon className="w-4 h-4 text-[#8B5CF6]" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function MeineWohnung() {
  const navigate = useNavigate();
  const { user, supabaseProfile, loading: authLoading } = useAuth();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadApartment();
  }, [user, authLoading]);

  const loadApartment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('apartments')
      .select('*, buildings(*)')
      .eq('tenant_id', user.id)
      .single();
    
    if (!error && data) setApartment(data);
    setLoading(false);
  };

  // Demo data if no apartment exists
  const displayData = apartment || {
    unit_number: 'Whg. 12',
    floor: '3. OG',
    size_sqm: 65,
    rooms: 2.5,
    rent_cold: 750,
    rent_warm: 950,
    move_in_date: '2023-06-01',
    address: 'Musterstraße 42, 10115 Berlin',
    buildings: { name: 'Musterhaus' }
  };

  const landlord = supabaseProfile?.landlord || {
    name: 'Hausverwaltung Mustermann GmbH',
    phone: '+49 30 12345678',
    email: 'verwaltung@muster.de'
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">🏠 Meine Wohnung</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Apartment Header */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-violet-700 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-violet-200 text-sm">Wohneinheit</p>
              <h2 className="text-2xl font-bold">{displayData.unit_number}</h2>
              <p className="text-violet-200 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {displayData.address}
              </p>
            </div>
            <Home className="w-10 h-10 text-violet-200" />
          </div>
        </div>

        {/* Apartment Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Wohnungsdetails</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow icon={Ruler} label="Wohnfläche" value={`${displayData.size_sqm} m²`} />
            <InfoRow icon={Home} label="Zimmer" value={displayData.rooms} />
            <InfoRow icon={MapPin} label="Etage" value={displayData.floor} />
            <InfoRow icon={Calendar} label="Einzugsdatum" value={
              displayData.move_in_date 
                ? new Date(displayData.move_in_date).toLocaleDateString('de-DE') 
                : '—'
            } />
          </CardContent>
        </Card>

        {/* Rent Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mietkosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Kaltmiete</p>
                <p className="text-xl font-bold text-gray-900">€{displayData.rent_cold}</p>
              </div>
              <div className="p-3 bg-violet-50 rounded-lg">
                <p className="text-xs text-gray-500">Warmmiete</p>
                <p className="text-xl font-bold text-[#8B5CF6]">€{displayData.rent_warm}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landlord Contact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vermieter / Hausverwaltung</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow icon={User} label="Name" value={landlord.name} />
            <InfoRow icon={Phone} label="Telefon" value={landlord.phone} />
            <InfoRow icon={Mail} label="E-Mail" value={landlord.email} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col gap-1"
            onClick={() => navigate(createPageUrl('Dokumente'))}
          >
            <FileText className="w-5 h-5 text-[#8B5CF6]" />
            <span className="text-xs">Mietvertrag</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col gap-1"
            onClick={() => navigate(createPageUrl('Maengel'))}
          >
            <Edit2 className="w-5 h-5 text-[#8B5CF6]" />
            <span className="text-xs">Mangel melden</span>
          </Button>
        </div>
      </div>
    </div>
  );
}