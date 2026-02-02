import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Bell, Lock, Globe, Palette, Crown } from 'lucide-react';
import { useLanguage } from '../components/i18n/LanguageProvider';
import LanguageSwitcher from '../components/i18n/LanguageSwitcher';
import { useSubscription } from '../components/integrations/stripe/hooks';
import UpgradeModal from '../components/integrations/stripe/UpgradeModal';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const { t } = useLanguage();
  const { tier, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailDigest: true,
    darkMode: false,
    compactView: false,
  });

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" /> {t('navigation.settings')}
      </h1>

      {/* Subscription Card */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-violet-600" />
              Dein Abo
            </span>
            <Badge className="bg-violet-600 text-white capitalize">
              {tier || 'free'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {tier === 'free' 
              ? 'Upgrade für erweiterte Funktionen und unbegrenzte Nutzung' 
              : `Du nutzt aktuell den ${tier} Plan`}
          </p>
          <Button 
            onClick={() => setShowUpgrade(true)}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {tier === 'free' ? 'Jetzt upgraden' : 'Plan verwalten'}
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="language">Sprache</TabsTrigger>
          <TabsTrigger value="appearance">Erscheinungsbild</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Grundeinstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Zwei-Faktor-Authentifizierung</p>
                  <p className="text-sm text-gray-500">Zusätzliche Sicherheit für dein Konto</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sitzung synchronisieren</p>
                  <p className="text-sm text-gray-500">Auf allen Geräten angemeldet bleiben</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" /> Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Push-Benachrichtigungen</p>
                  <p className="text-sm text-gray-500">Erhalte wichtige Updates sofort</p>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={() => handlePreferenceChange('notifications')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">E-Mail-Zusammenfassung</p>
                  <p className="text-sm text-gray-500">Wöchentliche Zusammenfassung per E-Mail</p>
                </div>
                <Switch
                  checked={preferences.emailDigest}
                  onCheckedChange={() => handlePreferenceChange('emailDigest')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" /> Sprache
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-3">
                  Wähle deine Sprache
                </label>
                <LanguageSwitcher />
              </div>

              <p className="text-sm text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                Die App wird sofort in der ausgewählten Sprache angezeigt.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" /> Erscheinungsbild
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Dunkler Modus</p>
                  <p className="text-sm text-gray-500">Schont deine Augen bei schlechten Lichtverhältnissen</p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={() => handlePreferenceChange('darkMode')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Kompakte Ansicht</p>
                  <p className="text-sm text-gray-500">Weniger Abstände zwischen Elementen</p>
                </div>
                <Switch
                  checked={preferences.compactView}
                  onCheckedChange={() => handlePreferenceChange('compactView')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save */}
      <Button className="w-full bg-violet-600 hover:bg-violet-700">
        Einstellungen speichern
      </Button>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        appId="mieterapp"
      />
    </div>
  );
}