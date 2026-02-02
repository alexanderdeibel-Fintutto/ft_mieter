import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Wrench, Calendar, AlertTriangle, BarChart3, 
  Tag, Package, Users, HelpCircle, Building, Home as HomeIcon,
  Euro, Gauge, ChevronRight, Bell, ShoppingBag, CreditCard
} from 'lucide-react';
import { createPageUrl } from '../utils';
import useAuth from '../components/useAuth';

const MENU_SECTIONS = [
  {
    title: 'Wohnung & Haus',
    items: [
      { icon: HomeIcon, label: 'Meine Wohnung', page: 'MeineWohnung', color: 'bg-violet-100 text-violet-600' },
      { icon: Building, label: 'Mein Haus', page: 'MeinHaus', color: 'bg-indigo-100 text-indigo-600' },
      { icon: FileText, label: 'Dokumente', page: 'Dokumente', color: 'bg-blue-100 text-blue-600' },
      { icon: FileText, label: 'Vertrag', page: 'Vertrag', color: 'bg-cyan-100 text-cyan-600' },
    ]
  },
  {
    title: 'Finanzen & Verbrauch',
    items: [
      { icon: Euro, label: 'Finanzen', page: 'Finanzen', color: 'bg-green-100 text-green-600' },
      { icon: Gauge, label: 'Zählerstand', page: 'Zaehler', color: 'bg-teal-100 text-teal-600' },
      { icon: BarChart3, label: 'Verbrauch', page: 'Verbrauch', color: 'bg-emerald-100 text-emerald-600' },
    ]
  },
  {
    title: 'Service & Termine',
    items: [
      { icon: Wrench, label: 'Mängelmeldung', page: 'Maengel', color: 'bg-orange-100 text-orange-600' },
      { icon: Calendar, label: 'Termine', page: 'Termine', color: 'bg-pink-100 text-pink-600' },
      { icon: Calendar, label: 'Kalender', page: 'Kalender', color: 'bg-rose-100 text-rose-600' },
      { icon: Package, label: 'Pakete', page: 'Pakete', color: 'bg-amber-100 text-amber-600' },
    ]
  },
  {
    title: 'Community',
    items: [
      { icon: Users, label: 'Community', page: 'Community', color: 'bg-purple-100 text-purple-600' },
      { icon: Tag, label: 'Schwarzes Brett', page: 'Schwarzesbrett', color: 'bg-fuchsia-100 text-fuchsia-600' },
      { icon: Calendar, label: 'Nachbarschafts-Events', page: 'Events', color: 'bg-pink-100 text-pink-600' },
      { icon: ShoppingBag, label: 'Marktplatz', page: 'Marktplatz', color: 'bg-emerald-100 text-emerald-600' },
    ]
  },
  {
    title: 'Sonstiges',
    items: [
      { icon: Bell, label: 'Benachrichtigungen', page: 'Benachrichtigungen', color: 'bg-yellow-100 text-yellow-600' },
      { icon: Wrench, label: 'Tools & Rechner', page: 'Tools', color: 'bg-slate-100 text-slate-600' },
      { icon: AlertTriangle, label: 'Notfallkontakte', page: 'Notfall', color: 'bg-red-100 text-red-600' },
      { icon: HelpCircle, label: 'Hilfe & FAQ', page: 'Help', color: 'bg-gray-100 text-gray-600' },
    ]
  },
];

function MenuItem({ item }) {
  const Icon = item.icon;
  
  return (
    <Link
      to={createPageUrl(item.page)}
      className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className={`p-2 rounded-lg ${item.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="flex-1 font-medium text-gray-900">{item.label}</span>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}

export default function Mehr() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminSection = isAdmin ? {
    title: 'Verwaltung',
    items: [
      { icon: CreditCard, label: 'Zahlungsverwaltung', page: 'AdminPayments', color: 'bg-violet-100 text-violet-600' }
    ]
  } : null;

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">📱 Mehr</h1>
      </header>

      <div className="p-4 space-y-6">
        {MENU_SECTIONS.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => (
                <MenuItem key={itemIdx} item={item} />
              ))}
            </div>
          </div>
        ))}
        
        {adminSection && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              {adminSection.title}
            </h2>
            <div className="space-y-2">
              {adminSection.items.map((item, itemIdx) => (
                <MenuItem key={itemIdx} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}