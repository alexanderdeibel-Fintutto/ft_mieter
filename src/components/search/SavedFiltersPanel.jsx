import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Star } from 'lucide-react';

export default function SavedFiltersPanel({ filterType, onLoadFilter }) {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedFilters();
  }, [filterType]);

  const loadSavedFilters = async () => {
    setLoading(true);
    const savedFilters = await base44.entities.SavedFilter.filter({
      filter_type: filterType
    });
    setFilters(savedFilters || []);
    setLoading(false);
  };

  const handleLoadFilter = (filter) => {
    // Update usage count
    base44.entities.SavedFilter.update(filter.id, {
      usage_count: (filter.usage_count || 0) + 1
    });
    onLoadFilter(filter.filter_config);
  };

  const handleDeleteFilter = async (filterId) => {
    await base44.entities.SavedFilter.delete(filterId);
    loadSavedFilters();
  };

  const handleSetDefault = async (filterId) => {
    // Reset all other defaults
    const otherFilters = filters.filter(f => f.id !== filterId && f.is_default);
    for (const f of otherFilters) {
      await base44.entities.SavedFilter.update(f.id, { is_default: false });
    }
    // Set this as default
    await base44.entities.SavedFilter.update(filterId, { is_default: true });
    loadSavedFilters();
  };

  if (loading) {
    return <div className="text-center py-4">Wird geladen...</div>;
  }

  if (filters.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Keine gespeicherten Filter
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Gespeicherte Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {filters.map(filter => (
          <div
            key={filter.id}
            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{filter.filter_name}</div>
              <div className="text-xs text-gray-500">
                {filter.usage_count} Mal verwendet
              </div>
            </div>

            <div className="flex gap-2">
              {filter.is_default && (
                <Badge variant="secondary" className="text-xs">
                  <Star size={12} className="mr-1" />
                  Standard
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLoadFilter(filter)}
              >
                Laden
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSetDefault(filter.id)}
              >
                <Star size={14} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteFilter(filter.id)}
              >
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}