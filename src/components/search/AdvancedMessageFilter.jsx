import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

export default function AdvancedMessageFilter({ onFilter, onSaveFilter }) {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sender, setSender] = useState('');
  const [messageType, setMessageType] = useState('');
  const [filterName, setFilterName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const handleFilter = () => {
    onFilter({
      search,
      dateFrom,
      dateTo,
      sender,
      messageType
    });
  };

  const handleSave = () => {
    if (!filterName.trim()) return;
    onSaveFilter({
      name: filterName,
      config: { search, dateFrom, dateTo, sender, messageType }
    });
    setShowSave(false);
    setFilterName('');
  };

  const handleReset = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSender('');
    setMessageType('');
    onFilter({});
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter size={18} />
          Nachrichtenfilter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Suchtext</label>
            <Input
              placeholder="Nachricht durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Nachrichtentyp</label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Alle Typen</SelectItem>
                <SelectItem value="direct">Direkt</SelectItem>
                <SelectItem value="group">Gruppe</SelectItem>
                <SelectItem value="broadcast">Durchsage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Von Datum</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Bis Datum</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
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