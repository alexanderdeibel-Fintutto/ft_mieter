import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Clock, Star } from 'lucide-react';

const SEARCH_RESULTS = [
  { id: 1, title: 'Heizung defekt', category: 'Reparatur', date: '2026-01-24', status: 'Offen', relevance: 98 },
  { id: 2, title: 'Mietvertrag PDF', category: 'Dokument', date: '2026-01-15', status: 'Archiviert', relevance: 95 },
  { id: 3, title: 'Zahlung Januar', category: 'Zahlung', date: '2026-01-10', status: 'Bezahlt', relevance: 92 },
  { id: 4, title: 'Hausmeister-Sprechstunde', category: 'Event', date: '2026-01-22', status: 'Geplant', relevance: 88 },
  { id: 5, title: 'Nebenkosten-Abrechnung', category: 'Dokument', date: '2026-01-20', status: 'Verfügbar', relevance: 85 },
];

const RECENT_SEARCHES = ['Heizung', 'Mietvertrag', 'Zahlung', 'Dokumente'];
const SUGGESTIONS = ['Reparaturen', 'Zahlungshistorie', 'Dokumente hochladen', 'Ankündigungen'];

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(SEARCH_RESULTS);
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: 'all',
    status: 'all',
  });
  const [activeTab, setActiveTab] = useState('results');

  const handleSearch = (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim()) {
      setActiveTab('results');
    }
  };

  const filterResults = () => {
    let filtered = SEARCH_RESULTS;
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(r => r.category.toLowerCase() === filters.category);
    }
    
    setResults(filtered);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Search className="w-6 h-6" /> Erweiterte Suche
      </h1>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Nach Reparaturen, Dokumenten, Zahlungen suchen..."
          value={query}
          onChange={handleSearch}
          className="pl-10 text-base"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-900 block mb-2">Kategorie</label>
            <div className="grid grid-cols-3 gap-2">
              {['Alle', 'Reparatur', 'Dokument', 'Zahlung', 'Event'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat.toLowerCase() })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    filters.category === cat.toLowerCase()
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 block mb-2">Zeitraum</label>
            <div className="flex gap-2">
              {['Alle', 'Diese Woche', 'Diesen Monat', 'Dieses Jahr'].map(period => (
                <button
                  key={period}
                  onClick={() => setFilters({ ...filters, dateRange: period.toLowerCase() })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    filters.dateRange === period.toLowerCase()
                      ? 'bg-violet-600 text-white'
                      : 'border border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={filterResults} className="w-full bg-violet-600 hover:bg-violet-700">
            Filter anwenden
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Ergebnisse ({results.length})</TabsTrigger>
          <TabsTrigger value="suggestions">Vorschläge</TabsTrigger>
        </TabsList>

        {/* Results */}
        <TabsContent value="results" className="space-y-2">
          {results.length > 0 ? (
            results.map(result => (
              <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{result.title}</h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{result.category}</Badge>
                        <Badge className="text-xs bg-gray-100 text-gray-700">{result.status}</Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {result.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{result.relevance}%</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(result.relevance / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Keine Ergebnisse gefunden
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zuletzt gesucht</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {RECENT_SEARCHES.map(search => (
                <button
                  key={search}
                  onClick={() => setQuery(search)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-900 transition-all"
                >
                  {search}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vorschläge</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1 bg-violet-50 hover:bg-violet-100 rounded-full text-sm text-violet-900 transition-all"
                >
                  + {suggestion}
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}