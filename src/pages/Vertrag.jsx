import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Euro, Users, Clock, Download, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';

function ContractInfoRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-medium ${highlight ? 'text-[#8B5CF6]' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

function TimelineItem({ date, title, description, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
        {!isLast && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
      </div>
      <div className="pb-4">
        <p className="text-xs text-gray-500">{date}</p>
        <p className="font-medium text-gray-900">{title}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
}

export default function Vertrag() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadContract();
  }, [user, authLoading]);

  const loadContract = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('tenant_id', user.id)
      .single();
    
    if (!error && data) setContract(data);
    setLoading(false);
  };

  // Demo data
  const displayData = contract || {
    contract_number: 'MV-2023-0042',
    contract_type: 'Unbefristet',
    start_date: '2023-06-01',
    end_date: null,
    rent_cold: 750,
    rent_utilities: 200,
    rent_total: 950,
    deposit: 2250,
    deposit_paid: true,
    notice_period_months: 3,
    tenants: ['Max Mustermann', 'Maria Mustermann'],
    landlord: 'Hausverwaltung Mustermann GmbH',
    property_address: 'Musterstraße 42, Whg. 12, 10115 Berlin',
  };

  const contractHistory = [
    { date: '01.06.2023', title: 'Mietbeginn', description: 'Schlüsselübergabe erfolgt' },
    { date: '15.05.2023', title: 'Kaution gezahlt', description: '€2.250 auf Mietkautionskonto' },
    { date: '01.05.2023', title: 'Vertrag unterzeichnet', description: 'Beide Parteien' },
  ];

  // Calculate contract duration
  const startDate = new Date(displayData.start_date);
  const now = new Date();
  const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const durationText = years > 0 
    ? `${years} Jahr${years > 1 ? 'e' : ''} ${remainingMonths > 0 ? `${remainingMonths} Monate` : ''}`
    : `${remainingMonths} Monate`;

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
        <h1 className="text-xl font-bold text-gray-900">📄 Mein Mietvertrag</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Contract Header */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-violet-700 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-violet-200 text-sm">Vertragsnummer</p>
              <h2 className="text-xl font-bold">{displayData.contract_number}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  displayData.contract_type === 'Unbefristet' 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-yellow-500/20 text-yellow-100'
                }`}>
                  {displayData.contract_type}
                </span>
                <span className="text-violet-200 text-sm">• Seit {durationText}</span>
              </div>
            </div>
            <FileText className="w-10 h-10 text-violet-200" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700">Kaution</span>
              </div>
              <p className="text-lg font-bold text-green-800">€{displayData.deposit}</p>
              <p className="text-xs text-green-600">{displayData.deposit_paid ? '✓ Vollständig gezahlt' : 'Ausstehend'}</p>
            </CardContent>
          </Card>
          <Card className="bg-violet-50 border-violet-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs text-violet-700">Kündigungsfrist</span>
              </div>
              <p className="text-lg font-bold text-violet-800">{displayData.notice_period_months} Monate</p>
              <p className="text-xs text-violet-600">Zum Monatsende</p>
            </CardContent>
          </Card>
        </div>

        {/* Contract Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vertragsdetails</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractInfoRow label="Mietbeginn" value={new Date(displayData.start_date).toLocaleDateString('de-DE')} />
            <ContractInfoRow label="Vertragsart" value={displayData.contract_type} />
            <ContractInfoRow label="Objekt" value={displayData.property_address} />
            <ContractInfoRow label="Vermieter" value={displayData.landlord} />
          </CardContent>
        </Card>

        {/* Rent Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Euro className="w-4 h-4 text-[#8B5CF6]" />
              Mietkosten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContractInfoRow label="Kaltmiete" value={`€${displayData.rent_cold}`} />
            <ContractInfoRow label="Nebenkosten (Vorauszahlung)" value={`€${displayData.rent_utilities}`} />
            <div className="flex justify-between items-center py-3 bg-violet-50 -mx-4 px-4 mt-2 rounded-b-lg">
              <span className="font-medium text-gray-900">Gesamtmiete</span>
              <span className="text-xl font-bold text-[#8B5CF6]">€{displayData.rent_total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tenants */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8B5CF6]" />
              Mieter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayData.tenants.map((tenant, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-[#8B5CF6] font-medium text-sm">
                  {tenant.charAt(0)}
                </div>
                <span className="text-gray-900">{tenant}</span>
                {i === 0 && <span className="text-xs bg-violet-100 text-[#8B5CF6] px-2 py-0.5 rounded-full">Hauptmieter</span>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contract History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B5CF6]" />
              Vertragshistorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contractHistory.map((item, i) => (
              <TimelineItem 
                key={i} 
                {...item} 
                isLast={i === contractHistory.length - 1} 
              />
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => navigate(createPageUrl('Dokumente'))}
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Mietvertrag herunterladen
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-between text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Kündigung einreichen
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}