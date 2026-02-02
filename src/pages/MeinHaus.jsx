import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, Phone, Clock, MapPin, Info, Trash2, Car, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';

function InfoCard({ icon: Icon, title, value, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-100 text-[#8B5CF6]',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ContactCard({ name, role, phone, available }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-[#8B5CF6] font-bold">
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
          {phone && (
            <a href={`tel:${phone}`} className="text-sm text-[#8B5CF6] flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" /> {phone}
            </a>
          )}
          {available && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {available}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function HouseRule({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default function MeinHaus() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadBuilding();
  }, [user, authLoading]);

  const loadBuilding = async () => {
    setLoading(true);
    try {
      // Get first building member from user
      const { data: memberData } = await supabase
        .from('mieter_building_members')
        .select('building_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (!memberData) {
        setLoading(false);
        return;
      }

      // Fetch full building from central buildings table
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', memberData.building_id)
        .single();

      if (buildingData) {
        setBuilding(buildingData);
      }
    } catch (error) {
      console.error('Error loading building:', error);
    }
    setLoading(false);
  };

  // Demo data if no building exists
  const displayData = building || {
    name: 'Musterhaus',
    address: 'Musterstraße 42, 10115 Berlin',
    units_count: 24,
    floors: 5,
    year_built: 1985,
  };

  const contacts = [
    { name: 'Thomas Müller', role: 'Hausmeister', phone: '+49 170 1234567', available: 'Mo-Fr, 8-16 Uhr' },
    { name: 'Hausverwaltung Mustermann', role: 'Verwaltung', phone: '+49 30 12345678', available: 'Mo-Fr, 9-17 Uhr' },
  ];

  const rules = [
    { icon: Clock, title: 'Ruhezeiten', description: 'Mo-Sa 22-7 Uhr, So & Feiertage ganztags' },
    { icon: Trash2, title: 'Müllentsorgung', description: 'Mülltonnen im Hinterhof, Abholung Mi & Sa' },
    { icon: Car, title: 'Parken', description: 'Tiefgarage mit Stellplätzen, Besucher Innenhof' },
    { icon: Wifi, title: 'Internet', description: 'Glasfaser verfügbar, Anbieter frei wählbar' },
  ];

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
        <h1 className="text-xl font-bold text-gray-900">🏢 Mein Haus</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Building Header */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-violet-700 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{displayData.name}</h2>
              <p className="text-violet-200 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {displayData.address}
              </p>
            </div>
            <Building className="w-10 h-10 text-violet-200" />
          </div>
        </div>

        {/* Building Stats */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard icon={Users} title="Wohneinheiten" value={displayData.units_count} color="violet" />
          <InfoCard icon={Building} title="Etagen" value={displayData.floors} color="blue" />
        </div>

        {/* Contacts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ansprechpartner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contacts.map((contact, i) => (
              <ContactCard key={i} {...contact} />
            ))}
          </CardContent>
        </Card>

        {/* House Rules */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-[#8B5CF6]" />
              Hausordnung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rules.map((rule, i) => (
              <HouseRule key={i} {...rule} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}