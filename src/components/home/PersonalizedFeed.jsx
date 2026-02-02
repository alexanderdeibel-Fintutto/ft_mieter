import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Star, MessageCircle, Heart, ChevronRight, 
  Sparkles, Settings2, X, Eye, EyeOff, Wrench, ClipboardList, FileText, ShoppingBag, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import FeedItemCard from '../feed/FeedItemCard';
import FeedPreferencesPanel from '../feed/FeedPreferencesPanel';

// Demo user data
const USER_GROUPS = ['group-1', 'group-3'];
const USER_INTERESTS = ['familie', 'sport', 'umwelt'];

// Demo feed items
const DEMO_FEED = [
  {
    id: 1,
    type: 'group_post',
    groupId: 'group-1',
    groupName: 'Eltern mit Kindern',
    groupIcon: '👨‍👩‍👧‍👦',
    author: 'Maria K.',
    content: 'Hat jemand Lust auf einen gemeinsamen Spielplatz-Besuch am Samstag?',
    likes: 5,
    comments: 3,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    type: 'group_event',
    groupId: 'group-1',
    groupName: 'Eltern mit Kindern',
    groupIcon: '👨‍👩‍👧‍👦',
    title: 'Spielplatz-Treffen',
    date: '2026-01-25',
    time: '15:00',
    location: 'Stadtpark',
    participants: 8,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    type: 'group_post',
    groupId: 'group-3',
    groupName: 'Sportgruppe',
    groupIcon: '⚽',
    author: 'Jonas M.',
    content: 'Morgen Abend 18:30 Lauftreff am Haupteingang! Wer ist dabei? 🏃‍♂️',
    likes: 12,
    comments: 7,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 4,
    type: 'announcement',
    author: 'Hausverwaltung',
    title: 'Heizungswartung am Freitag',
    content: 'Am Freitag findet die jährliche Heizungswartung statt.',
    important: true,
    created_at: new Date(Date.now() - 28800000).toISOString(),
  },
];

const SUGGESTIONS = {
  groups: [
    { id: 'group-2', name: 'Gartenfreunde', icon: '🌱', members: 8, reason: 'Basierend auf deinen Interessen', category: 'umwelt' },
    { id: 'group-4', name: 'Yoga & Meditation', icon: '🧘', members: 6, reason: 'Beliebt bei Sport-Interessierten', category: 'sport' },
  ],
  events: [
    { id: 'event-1', title: 'Sommerfest', date: '2026-02-15', category: 'fest', reason: 'Beliebtes Community-Event' },
  ],
  services: [
    { id: 'service-1', title: 'Kinderbetreuung', author: 'Anna L.', rating: 4.8, reason: 'Passend zu deinen Gruppen', category: 'familie' },
  ],
};

function FeedItem({ item, onHide }) {
  const getIcon = () => {
    switch (item.type) {
      case 'group_post': return <MessageCircle className="w-4 h-4" />;
      case 'group_event': return <Calendar className="w-4 h-4" />;
      case 'announcement': return <Star className="w-4 h-4" />;
      default: return null;
    }
  };

  const getBadgeColor = () => {
    switch (item.type) {
      case 'group_post': return 'bg-purple-100 text-purple-700';
      case 'group_event': return 'bg-rose-100 text-rose-700';
      case 'announcement': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="p-4 mb-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        {item.groupIcon ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xl">
            {item.groupIcon}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {item.groupName && (
              <span className="font-medium text-sm">{item.groupName}</span>
            )}
            <Badge className={`text-xs ${getBadgeColor()}`}>
              {getIcon()}
              <span className="ml-1">
                {item.type === 'group_post' && 'Beitrag'}
                {item.type === 'group_event' && 'Event'}
                {item.type === 'announcement' && 'Ankündigung'}
              </span>
            </Badge>
          </div>
          <p className="text-xs text-gray-400">
            {item.author && `${item.author} • `}
            {format(new Date(item.created_at), 'dd. MMM, HH:mm', { locale: de })}
          </p>
        </div>
        <button 
          onClick={() => onHide(item.id)}
          className="text-gray-300 hover:text-gray-500 p-1"
          title="Weniger davon zeigen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-3">
        {item.title && <h4 className="font-semibold text-sm mb-1">{item.title}</h4>}
        <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
        
        {/* Event Details */}
        {item.type === 'group_event' && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(item.date), 'EEE, dd. MMM', { locale: de })} {item.time}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {item.participants} Teilnehmer
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {item.type === 'group_post' && (
        <div className="flex items-center gap-4 mt-3 pt-2 border-t">
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500">
            <Heart className="w-4 h-4" /> {item.likes}
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#8B5CF6]">
            <MessageCircle className="w-4 h-4" /> {item.comments}
          </button>
        </div>
      )}
    </Card>
  );
}

function SuggestionCard({ suggestion, type }) {
  const getLink = () => {
    switch (type) {
      case 'group': return createPageUrl('Community') + '?tab=gruppen';
      case 'event': return createPageUrl('Events');
      case 'service': return createPageUrl('Schwarzesbrett') + '?tab=hilfe';
      default: return '#';
    }
  };

  return (
    <Link to={getLink()} className="block min-w-[200px] max-w-[200px]">
      <Card className="p-3 h-full hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          {type === 'group' && (
            <span className="text-2xl">{suggestion.icon}</span>
          )}
          {type === 'event' && (
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
          )}
          {type === 'service' && (
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{suggestion.name || suggestion.title}</h4>
            {suggestion.members && (
              <p className="text-xs text-gray-400">{suggestion.members} Mitglieder</p>
            )}
            {suggestion.rating && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {suggestion.rating}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">{suggestion.reason}</p>
      </Card>
    </Link>
  );
}

function FeedPreferencesDialog({ open, onOpenChange, preferences, onSave }) {
  const [prefs, setPrefs] = useState(preferences);

  const handleSave = () => {
    onSave(prefs);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Feed anpassen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">Wähle aus, welche Inhalte du in deinem Feed sehen möchtest:</p>
          
          <div className="space-y-3">
            {[
              { key: 'groupPosts', label: 'Gruppen-Beiträge', icon: MessageCircle },
              { key: 'groupEvents', label: 'Gruppen-Events', icon: Calendar },
              { key: 'announcements', label: 'Ankündigungen', icon: Star },
              { key: 'suggestions', label: 'Empfehlungen', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, [key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1 bg-[#8B5CF6] hover:bg-violet-700">
            Speichern
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PersonalizedFeed({ userGroups = USER_GROUPS, userInterests = USER_INTERESTS, user }) {
  const [hiddenItems, setHiddenItems] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    contentTypes: {
      announcements: true,
      events: true,
      groupPosts: true,
      repairs: true,
      surveys: true,
      documents: true,
      marketplace: true
    },
    interests: userInterests,
    showSuggestions: true
  });
  const [aggregatedFeed, setAggregatedFeed] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.feed_preferences) {
        setPreferences(prev => ({
          ...prev,
          ...user.feed_preferences
        }));
      }
    };
    loadPreferences();
  }, [user]);

  // Aggregate feed from multiple sources
  useEffect(() => {
    const loadAggregatedFeed = async () => {
      setIsLoadingFeed(true);
      try {
        const feedItems = [];
        
        // Add demo feed items
        DEMO_FEED.forEach(item => {
          feedItems.push({
            ...item,
            created_at: item.created_at
          });
        });

        // Sort by date
        feedItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAggregatedFeed(feedItems);
      } catch (error) {
        console.error('Fehler beim Laden des Feeds:', error);
      } finally {
        setIsLoadingFeed(false);
      }
    };

    loadAggregatedFeed();
  }, [preferences]);

  // Filter feed based on user's groups and preferences
  const feed = useMemo(() => {
    const allItems = [...aggregatedFeed, ...DEMO_FEED];
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id && t.type === item.type)
    );
    
    return uniqueItems
      .filter(item => !hiddenItems.includes(item.id))
      .filter(item => {
        const contentTypes = preferences.contentTypes || {};
        if (item.type === 'group_post' && contentTypes.groupPosts === false) return false;
        if (item.type === 'group_event' && contentTypes.events === false) return false;
        if (item.type === 'announcement' && contentTypes.announcements === false) return false;
        if (item.type === 'repair' && contentTypes.repairs === false) return false;
        if (item.type === 'survey' && contentTypes.surveys === false) return false;
        if (item.type === 'document' && contentTypes.documents === false) return false;
        if (item.type === 'marketplace' && contentTypes.marketplace === false) return false;
        return true;
      })
      .sort((a, b) => {
        // Prioritize items from user's groups
        const aIsUserGroup = userGroups.includes(a.groupId);
        const bIsUserGroup = userGroups.includes(b.groupId);
        if (aIsUserGroup && !bIsUserGroup) return -1;
        if (!aIsUserGroup && bIsUserGroup) return 1;
        // Then by date
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [aggregatedFeed, hiddenItems, preferences, userGroups]);

  // Filter suggestions based on user interests
  const relevantSuggestions = {
    groups: SUGGESTIONS.groups.filter(g => 
      userInterests.some(i => g.category === i) && !userGroups.includes(g.id)
    ),
    events: SUGGESTIONS.events,
    services: SUGGESTIONS.services.filter(s => 
      userInterests.some(i => s.category === i)
    ),
  };

  const handleHideItem = (id) => {
    setHiddenItems([...hiddenItems, id]);
  };

  const hasSuggestions = preferences.suggestions && (
    relevantSuggestions.groups.length > 0 ||
    relevantSuggestions.events.length > 0 ||
    relevantSuggestions.services.length > 0
  );

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-gray-900">Dein Feed</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowPreferences(true)}
        >
          <Settings2 className="w-4 h-4 mr-1" />
          Anpassen
        </Button>
      </div>

      {/* Suggestions Section */}
      {hasSuggestions && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Für dich empfohlen</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {relevantSuggestions.groups.map(g => (
              <SuggestionCard key={g.id} suggestion={g} type="group" />
            ))}
            {relevantSuggestions.events.map(e => (
              <SuggestionCard key={e.id} suggestion={e} type="event" />
            ))}
            {relevantSuggestions.services.map(s => (
              <SuggestionCard key={s.id} suggestion={s} type="service" />
            ))}
          </div>
        </div>
      )}

      {/* Feed Items */}
      {feed.length > 0 ? (
        feed.map(item => (
          <FeedItem key={item.id} item={item} onHide={handleHideItem} />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Keine Neuigkeiten</p>
          <p className="text-xs">Tritt Gruppen bei, um Updates zu sehen</p>
        </div>
      )}

      {/* View More Link */}
      {feed.length > 0 && (
        <Link 
          to={createPageUrl('Community')}
          className="flex items-center justify-center gap-1 text-sm text-[#8B5CF6] py-2"
        >
          Mehr in der Community <ChevronRight className="w-4 h-4" />
        </Link>
      )}

      {/* Loading State */}
      {isLoadingFeed && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      )}

      {/* Preferences Dialog */}
      <FeedPreferencesPanel
        open={showPreferences}
        onOpenChange={setShowPreferences}
        preferences={preferences}
        onSave={setPreferences}
      />
    </div>
  );
}