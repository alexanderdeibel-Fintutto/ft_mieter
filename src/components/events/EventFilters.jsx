import React from 'react';
import { Filter, X, Calendar, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { de } from 'date-fns/locale';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'all', label: 'Alle Kategorien' },
  { id: 'fest', label: '🎉 Feste' },
  { id: 'flohmarkt', label: '🛍️ Flohmarkt' },
  { id: 'sport', label: '⚽ Sport' },
  { id: 'kultur', label: '🎭 Kultur' },
  { id: 'kinder', label: '👶 Kinder' },
  { id: 'sonstiges', label: '📋 Sonstiges' },
];

const RECURRENCE_OPTIONS = [
  { id: 'all', label: 'Alle Events' },
  { id: 'single', label: 'Einmalige Events' },
  { id: 'recurring', label: 'Wiederkehrende Events' },
];

const DATE_RANGES = [
  { id: 'all', label: 'Alle Termine' },
  { id: 'today', label: 'Heute' },
  { id: 'week', label: 'Diese Woche' },
  { id: 'month', label: 'Dieser Monat' },
  { id: 'custom', label: 'Datum wählen...' },
];

export default function EventFilters({
  selectedCategory,
  onCategoryChange,
  selectedDateRange,
  onDateRangeChange,
  customDate,
  onCustomDateChange,
  selectedRecurrence,
  onRecurrenceChange,
  onClearFilters,
}) {
  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedDateRange !== 'all' || 
    selectedRecurrence !== 'all';

  return (
    <div className="bg-white rounded-xl border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filter
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-gray-500 h-7"
          >
            <X className="w-3 h-3 mr-1" />
            Zurücksetzen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Kategorie */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Datum */}
        <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map(range => (
              <SelectItem key={range.id} value={range.id}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Wiederholung */}
        <Select value={selectedRecurrence} onValueChange={onRecurrenceChange}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5" />
              <SelectValue placeholder="Wiederholung" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {RECURRENCE_OPTIONS.map(opt => (
              <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Picker */}
      {selectedDateRange === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start h-9 text-left font-normal">
              <Calendar className="w-4 h-4 mr-2" />
              {customDate ? format(customDate, 'PPP', { locale: de }) : 'Datum auswählen'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarPicker
              mode="single"
              selected={customDate}
              onSelect={onCustomDateChange}
              locale={de}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Active filters badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs">
              {CATEGORIES.find(c => c.id === selectedCategory)?.label}
              <button onClick={() => onCategoryChange('all')} className="hover:text-violet-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedDateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
              {selectedDateRange === 'custom' && customDate 
                ? format(customDate, 'dd.MM.yyyy')
                : DATE_RANGES.find(d => d.id === selectedDateRange)?.label}
              <button onClick={() => onDateRangeChange('all')} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedRecurrence !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
              {RECURRENCE_OPTIONS.find(r => r.id === selectedRecurrence)?.label}
              <button onClick={() => onRecurrenceChange('all')} className="hover:text-green-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}