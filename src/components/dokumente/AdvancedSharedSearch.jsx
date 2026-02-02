import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

export default function AdvancedSharedSearch({ onResults }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    app: 'all',
    accessLevel: 'all',
    dateRange: '30',
    isExpired: false,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const search = async () => {
    if (!query.trim()) {
      toast.error('Suchbegriff erforderlich');
      return;
    }

    setLoading(true);
    try {
      // Suche in Dokumenten
      const { data: shares, error } = await supabase
        .from('document_shares')
        .select(`
          *,
          documents:document_id(
            id,
            file_name,
            category,
            created_at,
            metadata
          )
        `)
        .ilike('documents.file_name', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Wende Filter an
      let filtered = shares || [];

      if (filters.app !== 'all') {
        filtered = filtered.filter(s => s.source_app === filters.app);
      }

      if (filters.accessLevel !== 'all') {
        filtered = filtered.filter(s => s.access_level === filters.accessLevel);
      }

      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filtered = filtered.filter(s => new Date(s.created_at) >= cutoff);
      }

      if (filters.isExpired) {
        filtered = filtered.filter(s => s.expires_at && new Date(s.expires_at) < new Date());
      }

      setResults(filtered);
      onResults?.(filtered);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Fehler bei der Suche');
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  return (
    <div className="space-y-3 bg-white rounded-lg p-4 border">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Nach Dokumenten suchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button
          onClick={search}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          size="sm"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <label className="text-xs font-medium mb-1 block">App</label>
            <Select value={filters.app} onValueChange={(v) => setFilters({...filters, app: v})}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Apps</SelectItem>
                <SelectItem value="mieterapp">MieterApp</SelectItem>
                <SelectItem value="vermietify">Vermietify</SelectItem>
                <SelectItem value="hausmeisterapp">HausmeisterPro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Zugriff</label>
            <Select value={filters.accessLevel} onValueChange={(v) => setFilters({...filters, accessLevel: v})}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="view">Nur ansehen</SelectItem>
                <SelectItem value="download">Download</SelectItem>
                <SelectItem value="edit">Bearbeiten</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Datum</label>
            <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="7">Letzte 7 Tage</SelectItem>
                <SelectItem value="30">Letzte 30 Tage</SelectItem>
                <SelectItem value="90">Letzte 90 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
          {results.length} Ergebnisse gefunden
        </div>
      )}
    </div>
  );
}