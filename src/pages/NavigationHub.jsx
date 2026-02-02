import React from 'react';
import useAuth from '../components/useAuth';
import { NAVIGATION_HUBS, LESS_USED_FEATURES } from '../components/navigation/NavigationHubs';
import HubGrid from '../components/navigation/HubGrid';
import SmartQuickAccess from '../components/navigation/SmartQuickAccess';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Settings } from 'lucide-react';

export default function NavigationHub() {
  const { user } = useAuth();
  
  // Bestimme die Rolle des Benutzers (vereinfacht)
  const userRole = user?.role === 'admin' ? 'admin' : 'mieter'; // Kann erweitert werden

  const hubs = NAVIGATION_HUBS[userRole] || NAVIGATION_HUBS.mieter;
  const lessUsed = LESS_USED_FEATURES[userRole] || LESS_USED_FEATURES.mieter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Alle Funktionen
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organisiert nach Kategorie für bessere Übersicht
              </p>
            </div>
            <Link to={createPageUrl('Settings')}>
              <Button variant="outline" size="icon" title="Einstellungen">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Quick Access */}
      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        <SmartQuickAccess />

        {/* Hubs Grid */}
        <HubGrid hubs={hubs} />

        {/* Weitere Funktionen */}
        <div className="mt-8 pb-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Weitere Funktionen
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {lessUsed.map(item => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs text-center">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}