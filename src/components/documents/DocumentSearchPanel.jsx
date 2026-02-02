import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Tag, X } from 'lucide-react';

export default function DocumentSearchPanel({ documents, onFilterChange }) {
  const [searchParams, setSearchParams] = useState({
    filename: '',
    tags: '',
    dateFrom: '',
    dateTo: '',
    minSize: '',
    maxSize: '',
    category: [],
    entityType: [],
  });
  const [results, setResults] = useState([]);

  useEffect(() => {
    performSearch();
  }, [searchParams, documents]);

  const performSearch = () => {
    let filtered = [...documents];

    // Filename search
    if (searchParams.filename) {
      const query = searchParams.filename.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.file_name.toLowerCase().includes(query)
      );
    }

    // Tag search
    if (searchParams.tags) {
      const searchTags = searchParams.tags.split(',').map(t => t.trim().toLowerCase());
      filtered = filtered.filter(doc =>
        doc.tags?.some(tag => 
          searchTags.some(st => tag.toLowerCase().includes(st))
        )
      );
    }

    // Date range
    if (searchParams.dateFrom) {
      filtered = filtered.filter(doc =>
        new Date(doc.created_date) >= new Date(searchParams.dateFrom)
      );
    }
    if (searchParams.dateTo) {
      filtered = filtered.filter(doc =>
        new Date(doc.created_date) <= new Date(searchParams.dateTo)
      );
    }

    // File size range
    if (searchParams.minSize) {
      const minBytes = parseInt(searchParams.minSize) * 1024 * 1024;
      filtered = filtered.filter(doc =>
        (doc.metadata?.file_size || 0) >= minBytes
      );
    }
    if (searchParams.maxSize) {
      const maxBytes = parseInt(searchParams.maxSize) * 1024 * 1024;
      filtered = filtered.filter(doc =>
        (doc.metadata?.file_size || 0) <= maxBytes
      );
    }

    // Category filter
    if (searchParams.category.length > 0) {
      filtered = filtered.filter(doc =>
        searchParams.category.includes(doc.category)
      );
    }

    // Entity type filter
    if (searchParams.entityType.length > 0) {
      filtered = filtered.filter(doc =>
        searchParams.entityType.includes(doc.entity_type)
      );
    }

    setResults(filtered);
    onFilterChange?.(filtered);
  };

  const toggleArrayFilter = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const resetFilters = () => {
    setSearchParams({
      filename: '',
      tags: '',
      dateFrom: '',
      dateTo: '',
      minSize: '',
      maxSize: '',
      category: [],
      entityType: [],
    });
  };

  const hasActiveFilters = Object.values(searchParams).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== ''
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Erweiterte Suche</CardTitle>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="w-4 h-4 mr-2" />
                Filter zurücksetzen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filename */}
          <div>
            <Label>Dateiname</Label>
            <Input
              placeholder="Suche nach Dateiname..."
              value={searchParams.filename}
              onChange={(e) => setSearchParams({ ...searchParams, filename: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (kommasepariert)</Label>
            <Input
              placeholder="z.B. wichtig, 2024"
              value={searchParams.tags}
              onChange={(e) => setSearchParams({ ...searchParams, tags: e.target.value })}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Von Datum</Label>
              <Input
                type="date"
                value={searchParams.dateFrom}
                onChange={(e) => setSearchParams({ ...searchParams, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label>Bis Datum</Label>
              <Input
                type="date"
                value={searchParams.dateTo}
                onChange={(e) => setSearchParams({ ...searchParams, dateTo: e.target.value })}
              />
            </div>
          </div>

          {/* File Size Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min. Größe (MB)</Label>
              <Input
                type="number"
                placeholder="0"
                value={searchParams.minSize}
                onChange={(e) => setSearchParams({ ...searchParams, minSize: e.target.value })}
              />
            </div>
            <div>
              <Label>Max. Größe (MB)</Label>
              <Input
                type="number"
                placeholder="50"
                value={searchParams.maxSize}
                onChange={(e) => setSearchParams({ ...searchParams, maxSize: e.target.value })}
              />
            </div>
          </div>

          {/* Category Badges */}
          <div>
            <Label>Kategorien</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['contract', 'invoice', 'insurance', 'maintenance', 'permit', 'other'].map(cat => (
                <Badge
                  key={cat}
                  variant={searchParams.category.includes(cat) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('category', cat)}
                >
                  {cat === 'contract' && 'Vertrag'}
                  {cat === 'invoice' && 'Rechnung'}
                  {cat === 'insurance' && 'Versicherung'}
                  {cat === 'maintenance' && 'Wartung'}
                  {cat === 'permit' && 'Genehmigung'}
                  {cat === 'other' && 'Sonstige'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Entity Type Badges */}
          <div>
            <Label>Entitätstypen</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['building', 'unit', 'lease', 'tenant', 'transaction'].map(type => (
                <Badge
                  key={type}
                  variant={searchParams.entityType.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('entityType', type)}
                >
                  {type === 'building' && 'Gebäude'}
                  {type === 'unit' && 'Einheit'}
                  {type === 'lease' && 'Mietvertrag'}
                  {type === 'tenant' && 'Mieter'}
                  {type === 'transaction' && 'Transaktion'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600">
              <Search className="w-4 h-4 inline mr-2" />
              {results.length} Ergebnis(se) gefunden
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}