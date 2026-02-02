import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, FileText, Users, Wrench, Euro, MessageSquare, 
  Settings, Home, Building, Calendar, BarChart, ArrowRight
} from 'lucide-react';

const SEARCHABLE_PAGES = [
  { 
    id: 'Home', 
    title: 'Startseite', 
    description: 'Dashboard und Übersicht',
    icon: Home, 
    keywords: ['home', 'dashboard', 'start', 'übersicht'],
    category: 'Navigation'
  },
  { 
    id: 'MieterHome', 
    title: 'Mieter Dashboard', 
    description: 'Mieter-spezifisches Dashboard',
    icon: Home, 
    keywords: ['mieter', 'dashboard', 'wohnung'],
    category: 'Mieter'
  },
  { 
    id: 'Chat', 
    title: 'Chat', 
    description: 'Nachrichten und Kommunikation',
    icon: MessageSquare, 
    keywords: ['chat', 'nachrichten', 'kommunikation'],
    category: 'Kommunikation'
  },
  { 
    id: 'MieterCommunity', 
    title: 'Community', 
    description: 'Nachbarschafts-Community',
    icon: Users, 
    keywords: ['community', 'nachbarn', 'gemeinschaft'],
    category: 'Soziales'
  },
  { 
    id: 'MieterRepairs', 
    title: 'Reparaturen', 
    description: 'Reparaturanfragen verwalten',
    icon: Wrench, 
    keywords: ['reparatur', 'mängel', 'defekt', 'instandhaltung'],
    category: 'Verwaltung'
  },
  { 
    id: 'MieterFinances', 
    title: 'Finanzen', 
    description: 'Zahlungen und Rechnungen',
    icon: Euro, 
    keywords: ['finanzen', 'zahlung', 'miete', 'rechnung'],
    category: 'Finanzen'
  },
  { 
    id: 'Settings', 
    title: 'Einstellungen', 
    description: 'App-Einstellungen anpassen',
    icon: Settings, 
    keywords: ['einstellungen', 'profil', 'konto', 'settings'],
    category: 'System'
  },
  { 
    id: 'Dokumente', 
    title: 'Dokumente', 
    description: 'Dokumente verwalten',
    icon: FileText, 
    keywords: ['dokumente', 'dateien', 'uploads'],
    category: 'Verwaltung'
  },
  { 
    id: 'NavigationHub', 
    title: 'Navigation Hub', 
    description: 'Zentrale Navigation',
    icon: BarChart, 
    keywords: ['navigation', 'hub', 'zentral'],
    category: 'Navigation'
  },
  { 
    id: 'FormExamples', 
    title: 'Formular-Beispiele', 
    description: 'Beispiel-Formulare',
    icon: FileText, 
    keywords: ['formulare', 'beispiele', 'forms'],
    category: 'Beispiele'
  },
];

export default function EnhancedGlobalSearch({ isOpen, onClose, trigger }) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    
    return SEARCHABLE_PAGES.filter(page => {
      const titleMatch = page.title.toLowerCase().includes(lowerQuery);
      const descMatch = page.description.toLowerCase().includes(lowerQuery);
      const keywordMatch = page.keywords.some(kw => kw.includes(lowerQuery));
      
      return titleMatch || descMatch || keywordMatch;
    }).slice(0, 8);
  }, [query]);

  const saveRecentSearch = (page) => {
    const newRecent = [
      page,
      ...recentSearches.filter(p => p.id !== page.id)
    ].slice(0, 5);
    
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  };

  const handleSelect = (page) => {
    saveRecentSearch(page);
    navigate(createPageUrl(page.id));
    onClose();
    setQuery('');
  };

  const SearchResult = ({ page }) => {
    const Icon = page.icon;
    
    return (
      <button
        onClick={() => handleSelect(page)}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{page.title}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {page.description}
          </div>
        </div>
        <Badge variant="outline" className="flex-shrink-0">
          {page.category}
        </Badge>
      </button>
    );
  };

  const content = (
    <div className="relative">
      <div className="sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Seiten durchsuchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
            autoFocus
          />
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Suche nach Seiten, Features oder Funktionen
        </div>
      </div>

      <ScrollArea className="h-[400px] mt-4">
        {query && results.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ergebnisse ({results.length})
            </div>
            {results.map(page => (
              <SearchResult key={page.id} page={page} />
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Keine Ergebnisse für "{query}"
            </p>
          </div>
        )}

        {!query && recentSearches.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Kürzlich besucht
            </div>
            {recentSearches.map(page => (
              <SearchResult key={page.id} page={page} />
            ))}
          </div>
        )}

        {!query && recentSearches.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Beginne mit der Suche nach Seiten
            </p>
          </div>
        )}
      </ScrollArea>

      <div className="mt-4 pt-4 border-t dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd>
              Navigation
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd>
              Öffnen
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd>
            Schließen
          </span>
        </div>
      </div>
    </div>
  );

  if (trigger === 'inline') {
    return <div className="p-4">{content}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {content}
      </DialogContent>
    </Dialog>
  );
}