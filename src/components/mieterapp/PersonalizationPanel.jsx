import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Palette, Grid3x3, Bell, Moon, Globe } from 'lucide-react';
import { useToast } from '@/components/notifications/ToastSystem';

const WIDGET_OPTIONS = [
  { id: 'quickActions', label: 'Schnellzugriffe', enabled: true },
  { id: 'realtimeUpdates', label: 'Live-Updates', enabled: true },
  { id: 'finances', label: 'Finanzen', enabled: true },
  { id: 'messages', label: 'Nachrichten', enabled: true },
  { id: 'repairs', label: 'Reparaturen', enabled: true },
  { id: 'notifications', label: 'Benachrichtigungen', enabled: false }
];

const THEME_OPTIONS = [
  { id: 'light', label: 'Hell', icon: '☀️' },
  { id: 'dark', label: 'Dunkel', icon: '🌙' },
  { id: 'auto', label: 'Auto', icon: '⚙️' }
];

const LANGUAGE_OPTIONS = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' }
];

export default function PersonalizationPanel() {
  const { addToast } = useToast();
  const [widgets, setWidgets] = useState(WIDGET_OPTIONS);
  const [theme, setTheme] = useState('auto');
  const [language, setLanguage] = useState('de');
  const [notifications, setNotifications] = useState(true);

  const toggleWidget = (id) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
    addToast('Widget-Einstellung gespeichert', 'success', 1500);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    addToast(`Design geändert: ${THEME_OPTIONS.find(t => t.id === newTheme)?.label}`, 'success', 1500);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    addToast(`Sprache geändert: ${LANGUAGE_OPTIONS.find(l => l.id === newLang)?.label}`, 'success', 1500);
  };

  return (
    <div className="space-y-6">
      {/* Widget Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Dashboard Widgets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wählen Sie, welche Widgets auf Ihrer Startseite angezeigt werden
          </p>
          <div className="space-y-2">
            {widgets.map(widget => (
              <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">{widget.label}</span>
                <Switch
                  checked={widget.enabled}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  theme === t.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                }`}
              >
                <span className="text-2xl mb-2 block">{t.icon}</span>
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sprache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {LANGUAGE_OPTIONS.map(lang => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  language === lang.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                }`}
              >
                <span className="font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Benachrichtigungen aktiviert</span>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Erhalten Sie Benachrichtigungen für wichtige Updates und Zahlungserinnerungen
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button className="w-full" size="lg" onClick={() => addToast('Einstellungen gespeichert', 'success')}>
        Speichern
      </Button>
    </div>
  );
}