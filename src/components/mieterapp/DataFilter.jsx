import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

export default function DataFilter({ 
  filters = {}, 
  onFilterChange,
  categories = [],
  statuses = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const updated = { ...activeFilters, [key]: value };
    setActiveFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared = Object.keys(activeFilters).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});
    setActiveFilters(cleared);
    onFilterChange(cleared);
  };

  const activeCount = Object.values(activeFilters).filter(v => v !== null).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Filter {activeCount > 0 && `(${activeCount})`}
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 w-80 z-10 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter</CardTitle>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status Filter */}
            {statuses.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="space-y-2">
                  {statuses.map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.status === status}
                        onChange={(e) => handleFilterChange('status', e.target.checked ? status : null)}
                        className="rounded"
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Kategorie</label>
                <select
                  value={activeFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || null)}
                  className="w-full px-2 py-2 border rounded-md text-sm"
                >
                  <option value="">Alle</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Von</label>
              <input
                type="date"
                value={activeFilters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                className="w-full px-2 py-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bis</label>
              <input
                type="date"
                value={activeFilters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                className="w-full px-2 py-2 border rounded-md text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex-1"
              >
                Zurücksetzen
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Fertig
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}