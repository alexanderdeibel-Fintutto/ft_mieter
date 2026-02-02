import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar, 
    MessageCircle, 
    Star, 
    FileText, 
    ShoppingBag, 
    Wrench,
    ClipboardList,
    ChevronRight,
    Heart,
    Users,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { createPageUrl } from '../../utils';

const FEED_TYPE_CONFIG = {
    announcement: {
        icon: Star,
        label: 'Ankündigung',
        color: 'bg-amber-100 text-amber-700',
        bgGradient: 'from-amber-50 to-orange-50',
        link: 'Ankuendigungen'
    },
    event: {
        icon: Calendar,
        label: 'Veranstaltung',
        color: 'bg-purple-100 text-purple-700',
        bgGradient: 'from-purple-50 to-violet-50',
        link: 'Events'
    },
    group_post: {
        icon: MessageCircle,
        label: 'Beitrag',
        color: 'bg-blue-100 text-blue-700',
        bgGradient: 'from-blue-50 to-indigo-50',
        link: 'Community'
    },
    repair: {
        icon: Wrench,
        label: 'Reparatur',
        color: 'bg-orange-100 text-orange-700',
        bgGradient: 'from-orange-50 to-red-50',
        link: 'Reparaturen'
    },
    survey: {
        icon: ClipboardList,
        label: 'Umfrage',
        color: 'bg-green-100 text-green-700',
        bgGradient: 'from-green-50 to-emerald-50',
        link: 'Umfragen'
    },
    document: {
        icon: FileText,
        label: 'Dokument',
        color: 'bg-gray-100 text-gray-700',
        bgGradient: 'from-gray-50 to-slate-50',
        link: 'Dokumente'
    },
    marketplace: {
        icon: ShoppingBag,
        label: 'Marktplatz',
        color: 'bg-emerald-100 text-emerald-700',
        bgGradient: 'from-emerald-50 to-teal-50',
        link: 'Marktplatz'
    }
};

export default function FeedItemCard({ item, onHide, showActions = true }) {
    const config = FEED_TYPE_CONFIG[item.type] || FEED_TYPE_CONFIG.announcement;
    const Icon = config.icon;

    const getTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `vor ${minutes} Min.`;
        if (hours < 24) return `vor ${hours} Std.`;
        if (days < 7) return `vor ${days} Tagen`;
        return format(date, 'dd. MMM', { locale: de });
    };

    return (
        <Card className={`p-4 hover:shadow-md transition-shadow bg-gradient-to-br ${config.bgGradient}`}>
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${config.color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={`text-xs ${config.color}`}>
                            {config.label}
                        </Badge>
                        {item.priority === 'hoch' && (
                            <Badge className="bg-red-100 text-red-700 text-xs">Wichtig</Badge>
                        )}
                        {item.isNew && (
                            <Badge className="bg-violet-100 text-violet-700 text-xs">Neu</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(item.created_at || item.created_date)}</span>
                        {item.author && (
                            <>
                                <span>•</span>
                                <span>{item.author}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mt-3">
                <h4 className="font-semibold text-gray-900 line-clamp-2">
                    {item.title || item.name}
                </h4>
                {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                    </p>
                )}
            </div>

            {/* Event-specific info */}
            {item.type === 'event' && item.date && (
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(item.date), 'EEE, dd. MMM', { locale: de })}</span>
                        {item.time && <span>• {item.time}</span>}
                    </div>
                    {item.participants && (
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{item.participants} Teilnehmer</span>
                        </div>
                    )}
                </div>
            )}

            {/* Marketplace-specific info */}
            {item.type === 'marketplace' && item.price !== undefined && (
                <div className="mt-2">
                    <span className="font-bold text-emerald-600">
                        {item.price === 0 ? 'Kostenlos' : `€${item.price}`}
                    </span>
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50">
                    <div className="flex items-center gap-3">
                        {item.likes !== undefined && (
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span>{item.likes}</span>
                            </button>
                        )}
                        {item.comments !== undefined && (
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span>{item.comments}</span>
                            </button>
                        )}
                    </div>
                    <Link 
                        to={createPageUrl(config.link)}
                        className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                    >
                        Details
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </Card>
    );
}