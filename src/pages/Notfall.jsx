import React from 'react';
import { Phone, AlertTriangle, Flame, Droplets, Zap, Shield, Building, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EMERGENCY_CONTACTS = [
  { 
    id: 'notruf', 
    label: 'Notruf', 
    number: '112', 
    icon: AlertTriangle, 
    color: 'bg-red-500',
    description: 'Feuerwehr & Rettungsdienst'
  },
  { 
    id: 'polizei', 
    label: 'Polizei', 
    number: '110', 
    icon: Shield, 
    color: 'bg-blue-600',
    description: 'Bei Einbruch, Gewalt, Verdacht'
  },
  { 
    id: 'giftnotruf', 
    label: 'Giftnotruf', 
    number: '030 19240', 
    icon: AlertTriangle, 
    color: 'bg-purple-500',
    description: '24h Giftinformationszentrale'
  },
  { 
    id: 'aerztlich', 
    label: 'Ärztl. Bereitschaft', 
    number: '116 117', 
    icon: Heart, 
    color: 'bg-pink-500',
    description: 'Außerhalb Sprechzeiten'
  },
];

const PROPERTY_CONTACTS = [
  { 
    id: 'hausmeister', 
    label: 'Hausmeister', 
    name: 'Herr Schmidt', 
    number: '+49 170 1234567', 
    available: 'Mo-Fr 7-18 Uhr',
    icon: Building
  },
  { 
    id: 'hausverwaltung', 
    label: 'Hausverwaltung', 
    name: 'Müller Immobilien', 
    number: '+49 30 9876543', 
    available: 'Mo-Fr 9-17 Uhr',
    icon: Building
  },
  { 
    id: 'notdienst', 
    label: 'Notdienst 24h', 
    name: 'Haustechnik Berlin', 
    number: '+49 30 5555555', 
    available: 'Rund um die Uhr',
    icon: Zap
  },
];

const UTILITY_CONTACTS = [
  { id: 'strom', label: 'Stromausfall', number: '+49 30 1234567', icon: Zap, color: 'text-yellow-500' },
  { id: 'gas', label: 'Gasnotdienst', number: '+49 30 2345678', icon: Flame, color: 'text-orange-500' },
  { id: 'wasser', label: 'Wassernotdienst', number: '+49 30 3456789', icon: Droplets, color: 'text-blue-500' },
];

function EmergencyCard({ contact }) {
  const Icon = contact.icon;
  
  return (
    <a 
      href={`tel:${contact.number.replace(/\s/g, '')}`}
      className="block"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`p-3 rounded-full ${contact.color} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{contact.label}</h3>
            <p className="text-sm text-gray-500">{contact.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{contact.number}</p>
            <p className="text-xs text-green-600 flex items-center justify-end gap-1">
              <Phone className="w-3 h-3" /> Anrufen
            </p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function PropertyContactCard({ contact }) {
  const Icon = contact.icon;
  
  return (
    <a 
      href={`tel:${contact.number.replace(/\s/g, '')}`}
      className="block bg-white rounded-xl shadow-sm border p-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-100 rounded-lg">
          <Icon className="w-5 h-5 text-[#8B5CF6]" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{contact.label}</h4>
          <p className="text-sm text-gray-600">{contact.name}</p>
          <p className="text-xs text-gray-400">{contact.available}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-[#8B5CF6]">{contact.number}</p>
          <p className="text-xs text-gray-500">
            <Phone className="w-3 h-3 inline mr-1" />Anrufen
          </p>
        </div>
      </div>
    </a>
  );
}

function UtilityContactCard({ contact }) {
  const Icon = contact.icon;
  
  return (
    <a 
      href={`tel:${contact.number.replace(/\s/g, '')}`}
      className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border"
    >
      <Icon className={`w-5 h-5 ${contact.color}`} />
      <div className="flex-1">
        <p className="font-medium text-gray-900">{contact.label}</p>
      </div>
      <p className="text-sm font-medium text-gray-600">{contact.number}</p>
    </a>
  );
}

export default function Notfall() {
  return (
    <div>
      <header className="p-4 border-b bg-red-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">🚨 Notfallkontakte</h1>
            <p className="text-sm text-gray-600">Schnelle Hilfe im Notfall</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Emergency Numbers */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Notrufe
          </h2>
          <div className="space-y-3">
            {EMERGENCY_CONTACTS.map(contact => (
              <EmergencyCard key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        {/* Property Contacts */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#8B5CF6]" />
            Haus & Verwaltung
          </h2>
          <div className="space-y-3">
            {PROPERTY_CONTACTS.map(contact => (
              <PropertyContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        {/* Utility Contacts */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Versorgung & Störungen
          </h2>
          <div className="space-y-2">
            {UTILITY_CONTACTS.map(contact => (
              <UtilityContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        {/* Quick Tips */}
        <section className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Wichtige Hinweise</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Bei Gasgeruch: Fenster öffnen, kein Licht anschalten, Haus verlassen</li>
            <li>• Bei Wasserrohrbruch: Haupthahn abdrehen (Keller)</li>
            <li>• Bei Stromausfall: Sicherungskasten prüfen</li>
            <li>• Notruf: Wer, Wo, Was, Wieviele, Warten</li>
          </ul>
        </section>
      </div>
    </div>
  );
}