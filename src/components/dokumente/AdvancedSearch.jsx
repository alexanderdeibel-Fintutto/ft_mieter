import React, { useState } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdvancedSearch({ onResults }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: '90',
    sender: 'all',
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Suchbegriff erforderlich');
      return;
    }

    setLoading(true);
    try {
      // Simuliere Suche
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Suche abgeschlossen');
      onResults?.([]);
    } catch (error) {
      toast.error('Fehler bei der Suche');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Volltextsuche..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="bg-violet-600">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Select value={filters.category} onValueChange={(v) => setFilters({...filters, category: v})}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="contract">Verträge</SelectItem>
            <SelectItem value="invoice">Rechnungen</SelectItem>
            <SelectItem value="report">Berichte</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sender} onValueChange={(v) => setFilters({...filters, sender: v})}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle User</SelectItem>
            <SelectItem value="current">Nur meine</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}