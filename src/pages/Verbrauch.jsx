import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Droplets, Flame, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';

// Demo data
const CONSUMPTION_DATA = {
  strom: {
    unit: 'kWh',
    icon: Zap,
    color: '#EAB308',
    bgColor: 'bg-yellow-100',
    current: 245,
    lastMonth: 268,
    monthly: [
      { month: 'Jul', value: 220 },
      { month: 'Aug', value: 235 },
      { month: 'Sep', value: 250 },
      { month: 'Okt', value: 280 },
      { month: 'Nov', value: 310 },
      { month: 'Dez', value: 340 },
      { month: 'Jan', value: 245 },
    ],
    avgHousehold: 230,
    pricePerUnit: 0.35,
  },
  wasser: {
    unit: 'm³',
    icon: Droplets,
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    current: 3.2,
    lastMonth: 3.5,
    monthly: [
      { month: 'Jul', value: 3.8 },
      { month: 'Aug', value: 4.0 },
      { month: 'Sep', value: 3.6 },
      { month: 'Okt', value: 3.4 },
      { month: 'Nov', value: 3.2 },
      { month: 'Dez', value: 3.0 },
      { month: 'Jan', value: 3.2 },
    ],
    avgHousehold: 3.0,
    pricePerUnit: 2.50,
  },
  gas: {
    unit: 'm³',
    icon: Flame,
    color: '#F97316',
    bgColor: 'bg-orange-100',
    current: 85,
    lastMonth: 120,
    monthly: [
      { month: 'Jul', value: 15 },
      { month: 'Aug', value: 12 },
      { month: 'Sep', value: 25 },
      { month: 'Okt', value: 60 },
      { month: 'Nov', value: 95 },
      { month: 'Dez', value: 130 },
      { month: 'Jan', value: 85 },
    ],
    avgHousehold: 90,
    pricePerUnit: 0.12,
  },
};

function TrendIndicator({ current, previous }) {
  const diff = ((current - previous) / previous * 100).toFixed(1);
  const isUp = current > previous;
  const isEqual = current === previous;
  
  if (isEqual) {
    return (
      <span className="flex items-center text-gray-500 text-sm">
        <Minus className="w-4 h-4 mr-1" /> Gleich
      </span>
    );
  }
  
  return (
    <span className={`flex items-center text-sm ${isUp ? 'text-red-500' : 'text-green-500'}`}>
      {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
      {Math.abs(diff)}%
    </span>
  );
}

function ConsumptionCard({ type, data }) {
  const Icon = data.icon;
  const cost = (data.current * data.pricePerUnit).toFixed(2);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${data.bgColor}`}>
            <Icon className="w-5 h-5" style={{ color: data.color }} />
          </div>
          <span className="font-medium text-gray-700 capitalize">{type}</span>
        </div>
        <TrendIndicator current={data.current} previous={data.lastMonth} />
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {data.current} <span className="text-lg font-normal text-gray-500">{data.unit}</span>
          </p>
          <p className="text-sm text-gray-500">
            ~{cost} € diesen Monat
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-400">Vormonat</p>
          <p className="text-gray-600">{data.lastMonth} {data.unit}</p>
        </div>
      </div>
      
      {/* Comparison bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Vergleich Durchschnitt</span>
          <span>{data.avgHousehold} {data.unit}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${Math.min((data.current / data.avgHousehold) * 100, 100)}%`,
              backgroundColor: data.current > data.avgHousehold ? '#EF4444' : '#22C55E'
            }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: data.current > data.avgHousehold ? '#EF4444' : '#22C55E' }}>
          {data.current > data.avgHousehold 
            ? `${((data.current / data.avgHousehold - 1) * 100).toFixed(0)}% über Durchschnitt`
            : `${((1 - data.current / data.avgHousehold) * 100).toFixed(0)}% unter Durchschnitt`
          }
        </p>
      </div>
    </div>
  );
}

function ConsumptionChart({ type, data }) {
  const Icon = data.icon;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5" style={{ color: data.color }} />
        <span className="font-medium text-gray-700 capitalize">{type}verbrauch</span>
      </div>
      
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data.monthly}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value) => [`${value} ${data.unit}`, type]}
            contentStyle={{ borderRadius: 8 }}
          />
          <Bar 
            dataKey="value" 
            fill={data.color} 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Verbrauch() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  const totalCost = Object.values(CONSUMPTION_DATA).reduce(
    (sum, d) => sum + d.current * d.pricePerUnit, 0
  ).toFixed(2);

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">📊 Verbrauchsstatistiken</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Geschätzte Kosten diesen Monat</p>
          <p className="text-3xl font-bold mt-1">{totalCost} €</p>
          <p className="text-xs opacity-70 mt-2">Basierend auf aktuellem Verbrauch</p>
        </div>

        {/* Filter */}
        <div className="flex justify-end">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle anzeigen</SelectItem>
              <SelectItem value="strom">Strom</SelectItem>
              <SelectItem value="wasser">Wasser</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {Object.entries(CONSUMPTION_DATA)
            .filter(([type]) => selectedType === 'all' || selectedType === type)
            .map(([type, data]) => (
              <ConsumptionCard key={type} type={type} data={data} />
            ))}
        </div>

        {/* Charts */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Verlauf (letzte 7 Monate)</h2>
          {Object.entries(CONSUMPTION_DATA)
            .filter(([type]) => selectedType === 'all' || selectedType === type)
            .map(([type, data]) => (
              <ConsumptionChart key={type} type={type} data={data} />
            ))}
        </div>

        {/* Tips */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">💡 Spartipps</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• LED-Lampen statt Glühbirnen verwenden</li>
            <li>• Stoßlüften statt Fenster kippen</li>
            <li>• Warmwasser sparsam nutzen</li>
            <li>• Heizung nachts um 2-3°C senken</li>
            <li>• Geräte nicht auf Standby lassen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}