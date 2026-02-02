import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const REPORT_TYPES = {
    financial: { name: 'Finanzbericht', desc: 'Einnahmen, Ausgaben, Rechnungen' },
    activity: { name: 'Aktivitätsbericht', desc: 'Nutzer-Aktionen und Ereignisse' },
    repairs: { name: 'Reparaturbericht', desc: 'Status und Historie von Reparaturen' },
    documents: { name: 'Dokumentbericht', desc: 'Hochgeladene und archivierte Dokumente' },
};

const METRICS = {
    financial: ['Gesamteinnahmen', 'Ausstehende Zahlungen', 'Durchschnittliche Miete'],
    activity: ['Neue Nutzer', 'Logins', 'Dokument-Uploads'],
    repairs: ['Offene Reparaturen', 'Durchschnittliche Dauer', 'Status-Übersicht'],
    documents: ['Gesamt-Dokumente', 'Neue uploads', 'Lagernutzung'],
};

export default function ReportBuilder({ onGenerate }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('financial');
    const [schedule, setSchedule] = useState('once');
    const [selectedMetrics, setSelectedMetrics] = useState(['Gesamteinnahmen']);

    const toggleMetric = (metric) => {
        setSelectedMetrics(prev =>
            prev.includes(metric)
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    const handleGenerate = () => {
        if (name.trim()) {
            onGenerate({
                name,
                type,
                schedule: schedule === 'once' ? 'Einmalig' : schedule === 'weekly' ? 'Wöchentlich' : 'Monatlich',
                metrics: selectedMetrics
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Report Name</label>
                <Input
                    placeholder="z.B. Monatliche Finanzübersicht"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* Type Selection */}
            <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Report Typ</label>
                <div className="grid gap-2">
                    {Object.entries(REPORT_TYPES).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setType(key);
                                setSelectedMetrics([METRICS[key][0]]);
                            }}
                            className={`p-3 rounded-lg border text-left transition-all ${
                                type === key ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <p className="font-medium text-gray-900">{config.name}</p>
                            <p className="text-sm text-gray-500">{config.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics */}
            <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Metriken</label>
                <div className="space-y-2">
                    {METRICS[type].map(metric => (
                        <div key={metric} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                                checked={selectedMetrics.includes(metric)}
                                onCheckedChange={() => toggleMetric(metric)}
                            />
                            <label className="text-sm text-gray-900 cursor-pointer">{metric}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Schedule */}
            <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Häufigkeit</label>
                <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="once">Einmalig generieren</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                    Abbrechen
                </Button>
                <Button onClick={handleGenerate} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    Report generieren
                </Button>
            </div>
        </div>
    );
}