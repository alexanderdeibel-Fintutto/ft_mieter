import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus } from 'lucide-react';

const LANGUAGES = [
  { id: 1, name: 'Deutsch (German)', code: 'de', status: 'active', strings: 1240, translated: '98%', region: 'DE/AT/CH' },
  { id: 2, name: 'English', code: 'en', status: 'active', strings: 1240, translated: '95%', region: 'GB/US/AU' },
  { id: 3, name: 'Français', code: 'fr', status: 'active', strings: 1240, translated: '85%', region: 'FR/BE/CH' },
];

const TRANSLATIONS = [
  { key: 'button.submit', en: 'Submit', de: 'Absenden', fr: 'Soumettre', status: 'translated' },
  { key: 'error.required', en: 'This field is required', de: 'Dieses Feld ist erforderlich', fr: 'Ce champ est requis', status: 'translated' },
  { key: 'repair.status', en: 'Repair Status', de: 'Reparaturstatus', fr: 'État de la réparation', status: 'translated' },
];

export default function AdminInternationalization() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6" /> Internationalization & Multi-Language
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" /> Sprache hinzufügen
        </Button>
      </div>

      {showNew && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sprache aktivieren
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>- Sprache wählen -</option>
              <option>Español (Spanish)</option>
              <option>Italiano (Italian)</option>
              <option>Português (Portuguese)</option>
              <option>Nederlands (Dutch)</option>
            </select>
            <input type="text" placeholder="Language Code (e.g., es)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Regions (e.g., ES/MX)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">Aktivieren</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Supported Languages', value: '3', color: 'text-blue-600' },
          { label: 'Translation Coverage', value: '92.7%', color: 'text-green-600' },
          { label: 'Total Strings', value: '1.24K', color: 'text-green-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LANGUAGES.map(lang => (
            <div key={lang.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{lang.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {lang.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-mono">{lang.code}</span>
                <span>{lang.strings} strings</span>
                <span>{lang.translated} translated</span>
                <span>{lang.region}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Manage</Button>
                <Button size="sm" variant="outline" className="text-xs">Export</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Translation Strings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TRANSLATIONS.map((trans, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-xs text-gray-700">{trans.key}</p>
                <Badge variant="outline" className="text-xs">Translated</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">English</p>
                  <p className="text-gray-900 font-medium">{trans.en}</p>
                </div>
                <div>
                  <p className="text-gray-600">Deutsch</p>
                  <p className="text-gray-900 font-medium">{trans.de}</p>
                </div>
                <div>
                  <p className="text-gray-600">Français</p>
                  <p className="text-gray-900 font-medium">{trans.fr}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}