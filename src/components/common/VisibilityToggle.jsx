import React from 'react';
import { Eye, EyeOff, Globe, Lock, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VISIBILITY_OPTIONS = [
  { id: 'public', label: 'Öffentlich', icon: Globe, description: 'Für alle sichtbar' },
  { id: 'neighbors', label: 'Nachbarn', icon: Users, description: 'Nur für Hausbewohner' },
  { id: 'private', label: 'Privat', icon: Lock, description: 'Nur für dich sichtbar' },
];

export default function VisibilityToggle({ 
  visibility, 
  onVisibilityChange,
  variant = 'switch', // 'switch' or 'select'
  label = 'Sichtbarkeit',
  showDescription = true,
}) {
  if (variant === 'switch') {
    const isPublic = visibility === 'public' || visibility === true;
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <Eye className="w-4 h-4 text-green-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-500" />
          )}
          <div>
            <p className="text-sm font-medium">{label}</p>
            {showDescription && (
              <p className="text-xs text-gray-500">
                {isPublic ? 'Öffentlich sichtbar' : 'Nur für dich sichtbar'}
              </p>
            )}
          </div>
        </div>
        <Switch
          checked={isPublic}
          onCheckedChange={(checked) => onVisibilityChange(checked ? 'public' : 'private')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500 block">{label}</label>
      <Select value={visibility} onValueChange={onVisibilityChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <SelectItem key={opt.id} value={opt.id}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <div>
                    <span>{opt.label}</span>
                    {showDescription && (
                      <span className="text-xs text-gray-400 ml-2">– {opt.description}</span>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export { VISIBILITY_OPTIONS };