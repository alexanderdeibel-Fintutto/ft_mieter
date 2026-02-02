import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const FLOOR_OPTIONS = [
  { id: 'all', label: 'Alle Etagen' },
  { id: 'eg', label: 'EG' },
  { id: '1og', label: '1. OG' },
  { id: '2og', label: '2. OG' },
  { id: '3og', label: '3. OG' },
  { id: '4og', label: '4. OG' },
];

const AVAILABILITY_OPTIONS = [
  { id: 'all', label: 'Alle Verfügbarkeiten' },
  { id: 'sofort', label: 'Sofort verfügbar' },
  { id: 'morgens', label: 'Morgens' },
  { id: 'nachmittags', label: 'Nachmittags' },
  { id: 'abends', label: 'Abends' },
  { id: 'wochenende', label: 'Wochenende' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevanz' },
  { id: 'rating_desc', label: 'Beste Bewertung' },
  { id: 'date_desc', label: 'Neueste zuerst' },
  { id: 'date_asc', label: 'Älteste zuerst' },
];

export default function AdvancedSearchFilters({
  searchQuery,
  onSearchChange,
  showAdvanced = false,
  onToggleAdvanced,
  // Advanced filters
  selectedFloor,
  onFloorChange,
  minRating,
  onMinRatingChange,
  selectedAvailability,
  onAvailabilityChange,
  sortBy,
  onSortChange,
  // Keywords
  keywords,
  onKeywordsChange,
  onReset,
  activeFilterCount = 0,
}) {
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (!keywordInput.trim() || keywords?.includes(keywordInput.trim())) return;
    onKeywordsChange([...(keywords || []), keywordInput.trim()]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (keyword) => {
    onKeywordsChange(keywords.filter(k => k !== keyword));
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Suchen..."
            className="pl-10"
          />
        </div>
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          size="icon"
          onClick={onToggleAdvanced}
          className={showAdvanced ? 'bg-[#8B5CF6]' : ''}
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && !showAdvanced && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-white rounded-xl border p-4 space-y-4 animate-in slide-in-from-top-2">
          {/* Row 1: Floor & Availability */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Standort/Etage
              </label>
              <Select value={selectedFloor} onValueChange={onFloorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Etage wählen" />
                </SelectTrigger>
                <SelectContent>
                  {FLOOR_OPTIONS.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Clock className="w-3 h-3" /> Verfügbarkeit
              </label>
              <Select value={selectedAvailability} onValueChange={onAvailabilityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Verfügbarkeit" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Rating */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
              <Star className="w-3 h-3" /> Mindestbewertung: {minRating > 0 ? `${minRating}+ Sterne` : 'Alle'}
            </label>
            <div className="flex items-center gap-3">
              <Slider
                value={[minRating]}
                onValueChange={([v]) => onMinRatingChange(v)}
                min={0}
                max={5}
                step={1}
                className="flex-1"
              />
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= minRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Keywords */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Schlüsselwörter</label>
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="z.B. flexibel, erfahren..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleAddKeyword}>
                Hinzufügen
              </Button>
            </div>
            {keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {keywords.map(kw => (
                  <Badge key={kw} variant="secondary" className="gap-1">
                    {kw}
                    <button onClick={() => handleRemoveKeyword(kw)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Row 4: Sort & Reset */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Sortieren:</label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500">
              <X className="w-4 h-4 mr-1" /> Zurücksetzen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { FLOOR_OPTIONS, AVAILABILITY_OPTIONS, SORT_OPTIONS };