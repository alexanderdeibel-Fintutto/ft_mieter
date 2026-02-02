import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

export default function AdvancedTaskFilter({ onFilter, onSaveFilter }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [building, setBuilding] = useState('');
  const [unit, setUnit] = useState('');
  const [filterName, setFilterName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const handleFilter = () => {
    onFilter({
      search,
      status,
      priority,
      building,
      unit
    });
  };

  const handleSave = () => {
    if (!filterName.trim()) return;
    onSaveFilter({
      name: filterName,
      config: { search, status, priority, building, unit }
    });
    setShowSave(false);
    setFilterName('');
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setBuilding('');
    setUnit('');
    onFilter({});
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter size={18} />
          Aufgabenfilter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Suchtext</label>
            <Input
              placeholder="Aufgabe durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Alle Status</SelectItem>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Priorität</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Prioritäten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Alle Prioritäten</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Gebäude</label>
            <Input
              placeholder="Gebäude-ID"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Einheit</label>
            <Input
              placeholder="Einheit-ID"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleFilter} className="gap-2">
            <Search size={16} />
            Filtern
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <X size={16} />
            Zurücksetzen
          </Button>
          <Button variant="ghost" onClick={() => setShowSave(!showSave)}>
            Filter speichern
          </Button>
        </div>

        {showSave && (
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Filtername..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <Button onClick={handleSave} size="sm">
                Speichern
              </Button>
              <Button variant="outline" onClick={() => setShowSave(false)} size="sm">
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}