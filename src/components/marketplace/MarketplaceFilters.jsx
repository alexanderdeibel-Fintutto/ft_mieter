import React from 'react';
import { Filter, X, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  { id: 'all', label: 'Alle Kategorien' },
  { id: 'electronics', label: '📱 Elektronik' },
  { id: 'furniture', label: '🪑 Möbel' },
  { id: 'clothing', label: '👕 Kleidung' },
  { id: 'books', label: '📚 Bücher' },
  { id: 'sports', label: '⚽ Sport' },
  { id: 'garden', label: '🌱 Garten' },
  { id: 'kids', label: '👶 Kinder' },
  { id: 'household', label: '🏠 Haushalt' },
  { id: 'other', label: '📦 Sonstiges' },
];

const TRANSACTION_TYPES = [
  { id: 'all', label: 'Alle Angebote' },
  { id: 'sell', label: '💰 Verkaufen' },
  { id: 'gift', label: '🎁 Verschenken' },
  { id: 'trade', label: '🔄 Tauschen' },
];

export const CONDITIONS = [
  { id: 'all', label: 'Alle Zustände' },
  { id: 'new', label: '✨ Neu' },
  { id: 'like_new', label: '🌟 Wie neu' },
  { id: 'good', label: '👍 Gut' },
  { id: 'used', label: '📦 Gebraucht' },
  { id: 'defective', label: '🔧 Defekt' },
];

export const SORT_OPTIONS = [
  { id: 'date_desc', label: 'Neueste zuerst' },
  { id: 'date_asc', label: 'Älteste zuerst' },
  { id: 'price_asc', label: 'Preis aufsteigend' },
  { id: 'price_desc', label: 'Preis absteigend' },
  { id: 'title_asc', label: 'A-Z' },
];

export default function MarketplaceFilters({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  transactionType,
  onTransactionTypeChange,
  condition,
  onConditionChange,
  sortBy,
  onSortChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  onClearFilters,
}) {
  const hasActiveFilters = 
    category !== 'all' || 
    transactionType !== 'all' ||
    condition !== 'all' ||
    priceMin ||
    priceMax;

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

      {/* Type Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => onTypeChange('all')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            type === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => onTypeChange('offer')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            type === 'offer' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Biete
        </button>
        <button
          onClick={() => onTypeChange('search')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            type === 'search' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Suche
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Category */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Transaction Type */}
        <Select value={transactionType} onValueChange={onTransactionTypeChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Art" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TYPES.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Condition */}
        <Select value={condition} onValueChange={onConditionChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Zustand" />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9">
            <ArrowUpDown className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range (only when sell is selected or all) */}
      {(transactionType === 'all' || transactionType === 'sell') && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min €"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            className="h-9"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max €"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="h-9"
          />
        </div>
      )}

    </div>
  );
}

// Separate component for active filter badges above results
export function ActiveFilterBadges({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  transactionType,
  onTransactionTypeChange,
  condition,
  onConditionChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  sortBy,
}) {
  const hasActiveFilters = 
    type !== 'all' ||
    category !== 'all' || 
    transactionType !== 'all' ||
    condition !== 'all' ||
    priceMin ||
    priceMax;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {type !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          {type === 'offer' ? '🏷️ Biete' : '🔍 Suche'}
          <button onClick={() => onTypeChange('all')} className="hover:text-gray-900 ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {category !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
          {CATEGORIES.find(c => c.id === category)?.label}
          <button onClick={() => onCategoryChange('all')} className="hover:text-violet-900 ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {transactionType !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          {TRANSACTION_TYPES.find(t => t.id === transactionType)?.label}
          <button onClick={() => onTransactionTypeChange('all')} className="hover:text-green-900 ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {condition !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
          {CONDITIONS.find(c => c.id === condition)?.label}
          <button onClick={() => onConditionChange('all')} className="hover:text-amber-900 ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {(priceMin || priceMax) && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
          💶 {priceMin || '0'}€ - {priceMax || '∞'}€
          <button onClick={() => { onPriceMinChange(''); onPriceMaxChange(''); }} className="hover:text-blue-900 ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {sortBy && sortBy !== 'date_desc' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
          ↕️ {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
        </span>
      )}
    </div>
  );
}