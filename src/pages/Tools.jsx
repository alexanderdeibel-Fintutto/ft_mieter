import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, FileText, Scale, Thermometer, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '../utils';

const TOOLS = [
  { id: 'nebenkosten', label: 'Nebenkostenrechner', icon: Calculator, color: 'bg-blue-100 text-blue-600' },
  { id: 'mietpreisbremse', label: 'Mietpreisbremse prüfen', icon: Scale, color: 'bg-green-100 text-green-600' },
  { id: 'heizkosten', label: 'Heizkostenrechner', icon: Thermometer, color: 'bg-orange-100 text-orange-600' },
  { id: 'kuendigung', label: 'Kündigungsfrist berechnen', icon: FileText, color: 'bg-red-100 text-red-600' },
];

function ToolCard({ tool, onClick }) {
  const Icon = tool.icon;
  return (
    <button onClick={onClick} className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 text-left transition-all active:scale-98">
      <div className={`p-3 rounded-xl ${tool.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{tool.label}</h3>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

function NebenkostenRechner({ onBack }) {
  const [values, setValues] = useState({ flaeche: '', gesamtkosten: '', wohnungen: '' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const f = parseFloat(values.flaeche) || 0;
    const g = parseFloat(values.gesamtkosten) || 0;
    const anteil = f > 0 && g > 0 ? (g / 100) * f : 0;
    setResult({ anteil: anteil.toFixed(2), proQm: (g / 100).toFixed(2) });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-[#8B5CF6] mb-4">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#8B5CF6]" />
            Nebenkostenrechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Deine Wohnfläche (m²)</Label>
            <Input type="number" value={values.flaeche} onChange={(e) => setValues({...values, flaeche: e.target.value})} placeholder="z.B. 65" />
          </div>
          <div>
            <Label>Gesamtnebenkosten des Hauses (€)</Label>
            <Input type="number" value={values.gesamtkosten} onChange={(e) => setValues({...values, gesamtkosten: e.target.value})} placeholder="z.B. 12000" />
          </div>
          <Button onClick={calculate} className="w-full bg-[#8B5CF6] hover:bg-violet-700">Berechnen</Button>
          {result && (
            <div className="p-4 bg-violet-50 rounded-xl">
              <p className="text-sm text-gray-600">Dein geschätzter Anteil:</p>
              <p className="text-2xl font-bold text-[#8B5CF6]">€{result.anteil}</p>
              <p className="text-xs text-gray-500 mt-1">({result.proQm} €/m²)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MietpreisbremseRechner({ onBack }) {
  const [values, setValues] = useState({ aktuelle: '', vergleich: '' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const a = parseFloat(values.aktuelle) || 0;
    const v = parseFloat(values.vergleich) || 0;
    const grenze = v * 1.1;
    const ueberhoehung = a > grenze ? a - grenze : 0;
    setResult({ grenze: grenze.toFixed(2), ueberhoehung: ueberhoehung.toFixed(2), istUeberhoet: a > grenze });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-[#8B5CF6] mb-4">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#8B5CF6]" />
            Mietpreisbremse prüfen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Deine aktuelle Kaltmiete (€/m²)</Label>
            <Input type="number" value={values.aktuelle} onChange={(e) => setValues({...values, aktuelle: e.target.value})} placeholder="z.B. 12.50" />
          </div>
          <div>
            <Label>Ortsübliche Vergleichsmiete (€/m²)</Label>
            <Input type="number" value={values.vergleich} onChange={(e) => setValues({...values, vergleich: e.target.value})} placeholder="z.B. 10.00" />
          </div>
          <Button onClick={calculate} className="w-full bg-[#8B5CF6] hover:bg-violet-700">Prüfen</Button>
          {result && (
            <div className={`p-4 rounded-xl ${result.istUeberhoet ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-sm text-gray-600">Maximal zulässige Miete (+10%):</p>
              <p className="text-2xl font-bold">{result.grenze} €/m²</p>
              {result.istUeberhoet ? (
                <p className="text-sm text-red-600 mt-2">⚠️ Mögliche Überhöhung: {result.ueberhoehung} €/m²</p>
              ) : (
                <p className="text-sm text-green-600 mt-2">✓ Miete liegt im zulässigen Rahmen</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HeizkostenRechner({ onBack }) {
  const [values, setValues] = useState({ verbrauch: '', preis: '' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const v = parseFloat(values.verbrauch) || 0;
    const p = parseFloat(values.preis) || 0;
    const kosten = v * p;
    setResult({ kosten: kosten.toFixed(2), monatlich: (kosten / 12).toFixed(2) });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-[#8B5CF6] mb-4">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-[#8B5CF6]" />
            Heizkostenrechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Jahresverbrauch (kWh)</Label>
            <Input type="number" value={values.verbrauch} onChange={(e) => setValues({...values, verbrauch: e.target.value})} placeholder="z.B. 8000" />
          </div>
          <div>
            <Label>Preis pro kWh (€)</Label>
            <Input type="number" step="0.01" value={values.preis} onChange={(e) => setValues({...values, preis: e.target.value})} placeholder="z.B. 0.12" />
          </div>
          <Button onClick={calculate} className="w-full bg-[#8B5CF6] hover:bg-violet-700">Berechnen</Button>
          {result && (
            <div className="p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-600">Geschätzte Jahreskosten:</p>
              <p className="text-2xl font-bold text-orange-600">€{result.kosten}</p>
              <p className="text-sm text-gray-500 mt-1">≈ €{result.monatlich}/Monat</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KuendigungsfristRechner({ onBack }) {
  const [mietdauer, setMietdauer] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const jahre = parseInt(mietdauer) || 0;
    let frist = 3;
    if (jahre >= 8) frist = 9;
    else if (jahre >= 5) frist = 6;
    setResult({ frist, jahre });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-[#8B5CF6] mb-4">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8B5CF6]" />
            Kündigungsfrist berechnen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Mietdauer (Jahre)</Label>
            <Input type="number" value={mietdauer} onChange={(e) => setMietdauer(e.target.value)} placeholder="z.B. 3" />
          </div>
          <Button onClick={calculate} className="w-full bg-[#8B5CF6] hover:bg-violet-700">Berechnen</Button>
          {result && (
            <div className="p-4 bg-violet-50 rounded-xl">
              <p className="text-sm text-gray-600">Kündigungsfrist für Vermieter:</p>
              <p className="text-2xl font-bold text-[#8B5CF6]">{result.frist} Monate</p>
              <p className="text-xs text-gray-500 mt-2">
                {result.jahre < 5 && 'Bis 5 Jahre: 3 Monate'}
                {result.jahre >= 5 && result.jahre < 8 && '5-8 Jahre: 6 Monate'}
                {result.jahre >= 8 && 'Ab 8 Jahre: 9 Monate'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Mieter: immer 3 Monate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Tools() {
  const [activeTool, setActiveTool] = useState(null);

  const renderTool = () => {
    switch (activeTool) {
      case 'nebenkosten': return <NebenkostenRechner onBack={() => setActiveTool(null)} />;
      case 'mietpreisbremse': return <MietpreisbremseRechner onBack={() => setActiveTool(null)} />;
      case 'heizkosten': return <HeizkostenRechner onBack={() => setActiveTool(null)} />;
      case 'kuendigung': return <KuendigungsfristRechner onBack={() => setActiveTool(null)} />;
      default: return null;
    }
  };

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">🛠️ Tools & Rechner</h1>
      </header>

      <div className="p-4">
        {activeTool ? (
          renderTool()
        ) : (
          <div className="space-y-3">
            {TOOLS.map(tool => (
              <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}