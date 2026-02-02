import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, FileText, MessageSquare, Users, Wrench, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function GlobalSearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    setRecentSearches(recent);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const user = await base44.auth.me();
        
        // Search in multiple sources
        const [repairs, posts, documents, messages] = await Promise.all([
          base44.entities.MaintenanceTask.filter({ created_by: user.email }).catch(() => []),
          base44.entities.CommunityPost.list().catch(() => []),
          // Add more entity searches as needed
        ]);

        const allResults = [
          ...repairs.filter(r => 
            r.title?.toLowerCase().includes(query.toLowerCase()) ||
            r.description?.toLowerCase().includes(query.toLowerCase())
          ).map(r => ({
            type: 'repair',
            icon: Wrench,
            title: r.title,
            subtitle: r.description,
            page: 'MieterRepairs',
            id: r.id,
          })),
          ...posts.filter(p => 
            p.title?.toLowerCase().includes(query.toLowerCase()) ||
            p.content?.toLowerCase().includes(query.toLowerCase())
          ).map(p => ({
            type: 'community',
            icon: Users,
            title: p.title,
            subtitle: p.content.substring(0, 100),
            page: 'MieterCommunity',
            id: p.id,
          })),
        ];

        // Add pages/features
        const features = searchFeatures(query);
        setResults([...features, ...allResults].slice(0, 10));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const searchFeatures = (q) => {
    const allFeatures = [
      { name: 'Mietrecht Chat', page: 'MietrechtChat', keywords: ['mietrecht', 'chat', 'beratung', 'frage'] },
      { name: 'Reparaturen', page: 'MieterRepairs', keywords: ['reparatur', 'mangel', 'defekt', 'kaputt'] },
      { name: 'Finanzen', page: 'MieterFinances', keywords: ['finanzen', 'zahlung', 'miete', 'geld'] },
      { name: 'Community', page: 'MieterCommunity', keywords: ['community', 'nachbar', 'gemeinschaft'] },
      { name: 'Pakete', page: 'MieterPackages', keywords: ['paket', 'post', 'lieferung'] },
      { name: 'Dokumente', page: 'Dokumente', keywords: ['dokument', 'datei', 'upload'] },
      { name: 'Briefe versenden', page: 'LetterXpress', keywords: ['brief', 'post', 'einschreiben'] },
    ];

    return allFeatures
      .filter(f => 
        f.name.toLowerCase().includes(q.toLowerCase()) ||
        f.keywords.some(k => k.includes(q.toLowerCase()))
      )
      .map(f => ({
        type: 'feature',
        icon: Search,
        title: f.name,
        subtitle: 'Funktion öffnen',
        page: f.page,
      }));
  };

  const handleResultClick = (result) => {
    // Save to recent searches
    const recent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
    localStorage.setItem('recent_searches', JSON.stringify(recent));
    
    navigate(createPageUrl(result.page));
    onClose();
  };

  const handleRecentClick = (search) => {
    setQuery(search);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Suchen Sie nach Funktionen, Dokumenten, Chats..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 text-lg h-12"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {query.length < 2 && recentSearches.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Letzte Suchen
                </p>
                <div className="space-y-2">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRecentClick(search)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8 text-gray-500">
                Suche läuft...
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Keine Ergebnisse gefunden
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-2">
                {results.map((result, idx) => {
                  const Icon = result.icon;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-colors flex items-start gap-3"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{result.title}</p>
                          <Badge variant="outline" className="text-xs">{result.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}