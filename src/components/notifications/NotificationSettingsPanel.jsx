import React from 'react';
import { Bell, BellOff, Volume2, VolumeX, MessageSquare, Calendar, Target, Users, Megaphone, FileCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePushNotifications } from './PushNotificationService';
import { toast } from 'sonner';

const NOTIFICATION_CATEGORIES = [
  { 
    key: 'messages', 
    label: 'Nachrichten & Anfragen', 
    description: 'Neue Chat-Nachrichten und Kontaktanfragen',
    icon: MessageSquare,
    color: 'text-blue-500',
  },
  { 
    key: 'events', 
    label: 'Events', 
    description: 'Event-Erinnerungen, Änderungen und Absagen',
    icon: Calendar,
    color: 'text-rose-500',
  },
  { 
    key: 'projects', 
    label: 'Projekte', 
    description: 'Aktualisierungen bei Gemeinschaftsprojekten',
    icon: Target,
    color: 'text-emerald-500',
  },
  { 
    key: 'groups', 
    label: 'Gruppen', 
    description: 'Neue Beiträge in deinen Gruppen',
    icon: Users,
    color: 'text-purple-500',
  },
  { 
    key: 'pinnwand', 
    label: 'Pinnwand', 
    description: 'Neue Beiträge auf der Community-Pinnwand',
    icon: Megaphone,
    color: 'text-amber-500',
  },
  { 
    key: 'bookings', 
    label: 'Buchungen', 
    description: 'Buchungsanfragen und Bestätigungen',
    icon: FileCheck,
    color: 'text-cyan-500',
  },
];

export default function NotificationSettingsPanel() {
  const { 
    permission, 
    requestPermission, 
    settings, 
    updateSettings,
    isSupported,
  } = usePushNotifications();

  const handleToggle = (category, field) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [field]: !settings[category][field],
      },
    };
    updateSettings(newSettings);
    toast.success('Einstellungen gespeichert');
  };

  const handleEnableAll = () => {
    const newSettings = {};
    NOTIFICATION_CATEGORIES.forEach(cat => {
      newSettings[cat.key] = { enabled: true, sound: true, badge: true };
    });
    updateSettings(newSettings);
    toast.success('Alle Benachrichtigungen aktiviert');
  };

  const handleDisableAll = () => {
    const newSettings = {};
    NOTIFICATION_CATEGORIES.forEach(cat => {
      newSettings[cat.key] = { enabled: false, sound: false, badge: false };
    });
    updateSettings(newSettings);
    toast.success('Alle Benachrichtigungen deaktiviert');
  };

  return (
    <div className="space-y-4">
      {/* Browser Permission */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#8B5CF6]" />
            Push-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Erhalte Benachrichtigungen auch wenn die App im Hintergrund ist
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupported ? (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Dein Browser unterstützt keine Push-Benachrichtigungen
            </p>
          ) : permission === 'granted' ? (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <Bell className="w-4 h-4" />
              Push-Benachrichtigungen sind aktiviert
            </div>
          ) : permission === 'denied' ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <p className="font-medium">Push-Benachrichtigungen blockiert</p>
              <p className="text-xs mt-1">Bitte aktiviere sie in deinen Browser-Einstellungen</p>
            </div>
          ) : (
            <Button 
              onClick={requestPermission}
              className="w-full bg-[#8B5CF6] hover:bg-violet-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Push-Benachrichtigungen aktivieren
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleEnableAll} className="flex-1">
          <Bell className="w-4 h-4 mr-1" /> Alle aktivieren
        </Button>
        <Button variant="outline" size="sm" onClick={handleDisableAll} className="flex-1">
          <BellOff className="w-4 h-4 mr-1" /> Alle deaktivieren
        </Button>
      </div>

      {/* Category Settings */}
      <div className="space-y-3">
        {NOTIFICATION_CATEGORIES.map(category => {
          const Icon = category.icon;
          const catSettings = settings[category.key] || { enabled: true, sound: true, badge: true };
          
          return (
            <Card key={category.key} className={!catSettings.enabled ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100 ${category.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{category.label}</h4>
                      <Switch
                        checked={catSettings.enabled}
                        onCheckedChange={() => handleToggle(category.key, 'enabled')}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                    
                    {catSettings.enabled && (
                      <div className="flex gap-4 mt-3 pt-3 border-t">
                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                          {catSettings.sound ? (
                            <Volume2 className="w-4 h-4 text-[#8B5CF6]" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-gray-400" />
                          )}
                          <Switch
                            checked={catSettings.sound}
                            onCheckedChange={() => handleToggle(category.key, 'sound')}
                            className="scale-75"
                          />
                          <span>Ton</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                          <Bell className={`w-4 h-4 ${catSettings.badge ? 'text-[#8B5CF6]' : 'text-gray-400'}`} />
                          <Switch
                            checked={catSettings.badge}
                            onCheckedChange={() => handleToggle(category.key, 'badge')}
                            className="scale-75"
                          />
                          <span>Badge</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}