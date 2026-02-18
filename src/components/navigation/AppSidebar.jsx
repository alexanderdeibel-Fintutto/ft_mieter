import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home, MessageSquare, Users, Wrench, Euro, Settings,
  Pin, X, ChevronLeft, ChevronRight, Sparkles, Bot, Gift, Crown, Building2, DollarSign, Zap, FlaskConical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ALL_PAGES = [
  { id: 'Home', label: 'Startseite', icon: Home, path: 'Home' },
  { id: 'MieterHome', label: 'Mieter Dashboard', icon: Home, path: 'MieterHome' },
  { id: 'Chat', label: 'Chat', icon: MessageSquare, path: 'Chat' },
  { id: 'MieterCommunity', label: 'Community', icon: Users, path: 'MieterCommunity' },
  { id: 'MieterRepairs', label: 'Reparaturen', icon: Wrench, path: 'MieterRepairs' },
  { id: 'MieterFinances', label: 'Finanzen', icon: Euro, path: 'MieterFinances' },
  { id: 'MieterMessages', label: 'Nachrichten', icon: MessageSquare, path: 'MieterMessages' },
  { id: 'AISettings', label: 'KI-Einstellungen', icon: Bot, path: 'AISettings' },
  { id: 'AffiliatePartnerOffers', label: 'Vergünstigungen', icon: Gift, path: 'AffiliatePartnerOffers' },
  { id: 'EcosystemPricing', label: 'Ecosystem Bundles', icon: Crown, path: 'EcosystemPricing' },
  { id: 'AdminTransactionRevenue', label: 'Revenue Dashboard', icon: DollarSign, path: 'AdminTransactionRevenue' },
  { id: 'AdminWhiteLabel', label: 'White-Label B2B', icon: Building2, path: 'AdminWhiteLabel' },
  { id: 'AdminABTestResults', label: 'A/B-Tests', icon: FlaskConical, path: 'AdminABTestResults' },
  { id: 'AdminFullSetup', label: 'Revenue Setup', icon: Zap, path: 'AdminFullSetup' },
  { id: 'Settings', label: 'Einstellungen', icon: Settings, path: 'Settings' },
  { id: 'NavigationHub', label: 'Navigation Hub', icon: Sparkles, path: 'NavigationHub' },
];

export default function AppSidebar({ isCollapsed, onToggleCollapse }) {
  const [pinnedPages, setPinnedPages] = useState([]);
  const [hoveredPage, setHoveredPage] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_pinned_pages');
    if (saved) {
      setPinnedPages(JSON.parse(saved));
    } else {
      // Default pinned pages
      setPinnedPages(['Home', 'Chat', 'Settings']);
    }
  }, []);

  const togglePin = (pageId) => {
    const newPinned = pinnedPages.includes(pageId)
      ? pinnedPages.filter(id => id !== pageId)
      : [...pinnedPages, pageId];
    
    setPinnedPages(newPinned);
    localStorage.setItem('sidebar_pinned_pages', JSON.stringify(newPinned));
  };

  const pinnedPagesData = ALL_PAGES.filter(page => pinnedPages.includes(page.id));
  const unpinnedPagesData = ALL_PAGES.filter(page => !pinnedPages.includes(page.id));

  const PageItem = ({ page, isPinned }) => {
    const Icon = page.icon;
    const isHovered = hoveredPage === page.id;

    return (
      <div
        className="relative"
        onMouseEnter={() => setHoveredPage(page.id)}
        onMouseLeave={() => setHoveredPage(null)}
      >
        <Link
          to={createPageUrl(page.path)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {!isCollapsed && (
            <span className="text-sm font-medium flex-1">{page.label}</span>
          )}
        </Link>
        
        {!isCollapsed && isHovered && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              togglePin(page.id);
            }}
          >
            <Pin 
              className={`w-4 h-4 ${isPinned ? 'fill-blue-500 text-blue-500' : ''}`} 
            />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b dark:border-gray-800">
        {!isCollapsed && (
          <h2 className="font-semibold text-lg">Navigation</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3">
        {/* Pinned Section */}
        {pinnedPagesData.length > 0 && (
          <div className="mb-6">
            {!isCollapsed && (
              <div className="px-3 mb-2 flex items-center gap-2">
                <Pin className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Angeheftet
                </span>
              </div>
            )}
            <div className="space-y-1">
              {pinnedPagesData.map(page => (
                <PageItem key={page.id} page={page} isPinned />
              ))}
            </div>
          </div>
        )}

        <Separator className="my-3" />

        {/* All Pages */}
        {!isCollapsed && (
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Alle Seiten
            </span>
          </div>
        )}
        <div className="space-y-1">
          {unpinnedPagesData.map(page => (
            <PageItem key={page.id} page={page} isPinned={false} />
          ))}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Hover über Seiten für Pin-Option</p>
          </div>
        </div>
      )}
    </div>
  );
}