import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SECURITY_TIPS = [
  {
    title: 'HTTPS Only',
    description: 'Alle Verbindungen sind verschlüsselt',
    status: 'secure',
    icon: Shield
  },
  {
    title: 'Password Security',
    description: 'Mindestens 12 Zeichen mit Großbuchstaben',
    status: 'info',
    icon: Lock
  },
  {
    title: 'Two-Factor Auth',
    description: 'Aktivieren für zusätzliche Sicherheit',
    status: 'warning',
    icon: AlertTriangle
  },
  {
    title: 'Session Management',
    description: 'Automatische Abmeldung nach 30 Min.',
    status: 'secure',
    icon: CheckCircle2
  }
];

export default function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Security Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Schützen Sie Ihr Konto</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="password">Passwort</TabsTrigger>
            <TabsTrigger value="devices">Geräte</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            {SECURITY_TIPS.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon className={`w-6 h-6 ${tip.status === 'secure' ? 'text-green-600' : 'text-yellow-600'}`} />
                        <div>
                          <p className="font-semibold">{tip.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
                        </div>
                      </div>
                      <Badge className={tip.status === 'secure' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {tip.status.charAt(0).toUpperCase() + tip.status.slice(1)}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Password */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Passwort ändern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Aktuelles Passwort</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Neues Passwort</label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  />
                </div>
                <Button className="w-full">Passwort ändern</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Geräte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold">Dieses Gerät</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chrome on macOS • Zuletzt aktiv: gerade eben</p>
                  <Button variant="outline" size="sm" className="mt-3">Abmelden</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}