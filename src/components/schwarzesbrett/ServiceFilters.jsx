import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'Alle Kategorien', icon: '📋' },
  { id: 'gartenarbeit', label: 'Gartenarbeit', icon: '🌱' },
  { id: 'handwerk', label: 'Handwerk', icon: '🔧' },
  { id: 'kinderbetreuung', label: 'Kinderbetreuung', icon: '👶' },
  { id: 'einkaufshilfe', label: 'Einkaufshilfe', icon: '🛒' },
  { id: 'technik', label: 'Technik-Hilfe', icon: '💻' },
  { id: 'tiersitting', label: 'Tiersitting', icon: '🐕' },
  { id: 'nachhilfe', label: 'Nachhilfe', icon: '📚' },
  { id: 'haushalt', label: 'Haushalt', icon: '🏠' },
  { id: 'sonstiges', label: 'Sonstiges', icon: '✨' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'Alle Status', color: 'gray' },
  { id: 'offen', label: 'Offen', color: 'green' },
  { id: 'in_bearbeitung', label: 'In Bearbeitung', color: 'yellow' },
  { id: 'abgeschlossen', label: 'Abgeschlossen', color: 'blue' },
];

const TYPE_OPTIONS = [
  { id: 'all', label: 'Alle', icon: '📋' },
  { id: 'bietet', label: 'Angebote', icon: '🎁' },
  { id: 'sucht', label: 'Gesuche', icon: '🔍' },
];

export { SERVICE_CATEGORIES, STATUS_OPTIONS, TYPE_OPTIONS };

export default function ServiceFilters({ 
  selectedCategory, 
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  onReset 
}) {
  const hasFilters = selectedCategory !== 'all' || selectedStatus !== 'all' || selectedType !== 'all';

  return (
    <div className="space-y-3">
      {/* Type Buttons */}
      <div className="flex gap-2">
        {TYPE_OPTIONS.map(type => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedType === type.id
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* Category & Status Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status.id} value={status.id}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                  {status.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500">
            <X className="w-4 h-4 mr-1" /> Filter zurücksetzen
          </Button>
        )}
      </div>
    </div>
  );
}