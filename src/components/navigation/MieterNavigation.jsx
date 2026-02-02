import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Home, MessageSquare, FileText, Wrench, Zap, Settings, LogOut,
  ChevronRight, Menu, X, DollarSign, AlertCircle, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const MIETER_MENU = [
  { icon: Home, label: 'Startseite', page: 'MieterHome', badge: null },
  { icon: DollarSign, label: 'Finanzen', page: 'MieterFinances', badge: null },
  { icon: MessageSquare, label: 'Nachrichten', page: 'MieterMessages', badge: 'messages', count: unreadCount },
  { icon: AlertCircle, label: 'Mängel & Reparaturen', page: 'MieterRepairs', badge: null },
  { icon: Zap, label: 'Zähler', page: 'MieterMeters', badge: null },
  { icon: FileText, label: 'Dokumente', page: 'Dokumente', badge: null },
  { icon: MessageSquare, label: 'Mietrecht-Chat', page: 'MietrechtChat', badge: 'premium' },
  { icon: Bell, label: 'Benachrichtigungen', page: 'Notifications', badge: null },
];

export default function MieterNavigation({ isCollapsed, onToggleCollapse }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load unread notification count
    const loadUnreadCount = async () => {
      try {
        // Mock - replace with actual entity call
        const user = await base44.auth.me();
        // In production: fetch from Message entity where is_read=false
        setUnreadCount(0);
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (confirm('Wirklich abmelden?')) {
      await base44.auth.logout();
    }
  };

  const getItemUrl = (page) => createPageUrl(page);
  const isActive = (page) => location.pathname.includes(page.toLowerCase());

  const NavigationItems = () => (
    <>
      {MIETER_MENU.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.page);
        return (
          <a
            key={item.page}
            href={getItemUrl(item.page)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
              active
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label={item.label}
          >
            <div className="relative">
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.count && item.count > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {item.count}
                </Badge>
              )}
            </div>
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge === 'premium' ? '✨' : '!'}
                  </span>
                )}
              </>
            )}
          </a>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-blue-600">Mietapp</h1>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronRight className={`h-5 w-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          <NavigationItems />
        </nav>

        {/* Settings & Logout */}
        <div className="border-t dark:border-gray-800 p-4 space-y-2">
          <a
            href={getItemUrl('Settings')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Einstellungen</span>}
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Abmelden</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <h1 className="text-xl font-bold text-blue-600 ml-4">Mietapp</h1>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-black/50 z-30 pt-4">
          <nav className="bg-white dark:bg-gray-900 mx-2 rounded-lg p-2 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
            <NavigationItems />
            <hr className="my-2 dark:border-gray-800" />
            <a
              href={getItemUrl('Settings')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="h-5 w-5" />
              <span>Einstellungen</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              <span>Abmelden</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}