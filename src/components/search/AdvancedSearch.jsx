import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function AdvancedSearch({
  items = [],
  searchFields = ['title', 'description'],
  filters = {},
  onSearch,
  onFiltersChange,
  placeholder = 'Suchen...'
}) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const results = useMemo(() => {
    let filtered = items;

    // Text search
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field =>
          String(item[field]).toLowerCase().includes(q)
        )
      );
    }

    // Filter search
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        filtered = filtered.filter(item =>
          value.includes(String(item[key]))
        );
      }
    });

    return filtered;
  }, [query, items, searchFields, activeFilters]);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters };
    if (newFilters[filterKey]?.includes(value)) {
      newFilters[filterKey] = newFilters[filterKey].filter(v => v !== value);
    } else {
      newFilters[filterKey] = [...(newFilters[filterKey] || []), value];
    }
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setQuery('');
  };

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full gap-2"
      >
        <Filter className="w-4 h-4" />
        Filter
        {activeFilterCount > 0 && (
          <Badge className="ml-auto">{activeFilterCount}</Badge>
        )}
      </Button>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700"
        >
          {Object.entries(filters).map(([filterKey, options]) => (
            <div key={filterKey}>
              <p className="font-semibold text-sm mb-2 capitalize">{filterKey}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilterChange(filterKey, option)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-all',
                      activeFilters[filterKey]?.includes(option)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full"
          >
            Clear All
          </Button>
        </motion.div>
      )}

      {/* Results Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-600 dark:text-gray-400"
      >
        {results.length} results found
      </motion.div>
    </div>
  );
}