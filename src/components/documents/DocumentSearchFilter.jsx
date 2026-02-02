import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

export default function DocumentSearchFilter({ onFilter }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleFilter = () => {
    onFilter({
      search,
      category,
      dateFrom,
      dateTo
    });
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
    onFilter({});
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <Input
            placeholder="Dokumente suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Alle Kategorien</SelectItem>
                <SelectItem value="contract">Vertrag</SelectItem>
                <SelectItem value="invoice">Rechnung</SelectItem>
                <SelectItem value="insurance">Versicherung</SelectItem>
                <SelectItem value="maintenance">Wartung</SelectItem>
                <SelectItem value="permit">Genehmigung</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Von"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="Bis"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFilter} className="gap-2 flex-1">
              <Search size={16} />
              Filtern
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <X size={16} />
              Zurücksetzen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}