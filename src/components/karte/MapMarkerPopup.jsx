import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Wrench, Users, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const TYPE_CONFIG = {
    event: {
        label: 'Veranstaltung',
        icon: Calendar,
        color: 'bg-purple-100 text-purple-800'
    },
    service: {
        label: 'Dienstleistung',
        icon: Wrench,
        color: 'bg-blue-100 text-blue-800'
    },
    group: {
        label: 'Gruppe',
        icon: Users,
        color: 'bg-green-100 text-green-800'
    },
    request: {
        label: 'Anfrage',
        icon: HelpCircle,
        color: 'bg-orange-100 text-orange-800'
    }
};

export default function MapMarkerPopup({ item, type, onViewDetails }) {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.request;
    const Icon = config.icon;

    return (
        <div className="min-w-[200px] max-w-[280px]">
            <div className="flex items-start gap-2 mb-2">
                <Badge className={`${config.color} shrink-0`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                </Badge>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {item.title || item.name}
            </h3>
            
            {item.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                </p>
            )}
            
            <div className="space-y-1 text-xs text-gray-500 mb-3">
                {item.location?.address && (
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{item.location.address}</span>
                    </div>
                )}
                
                {item.date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(item.date), 'dd. MMM yyyy', { locale: de })}</span>
                    </div>
                )}
                
                {item.created_by && (
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{item.created_by}</span>
                    </div>
                )}
            </div>
            
            {onViewDetails && (
                <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => onViewDetails(item, type)}
                >
                    Details anzeigen
                </Button>
            )}
        </div>
    );
}