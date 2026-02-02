import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NOTIFICATION_TYPES = [
  { id: 'workflow', label: 'Workflow-Automatisierung', icon: '⚙️' },
  { id: 'document', label: 'Dokument-Änderungen', icon: '📄' },
  { id: 'task', label: 'Aufgaben-Updates', icon: '✅' },
  { id: 'alert', label: 'Kritische Warnungen', icon: '🔔' },
  { id: 'permission', label: 'Zugriffs-Anfragen', icon: '🔐' }
];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    const prefs = await base44.entities.NotificationPreference.list();
    const prefMap = {};
    prefs?.forEach(p => {
      prefMap[p.notification_type] = p;
    });
    setPreferences(prefMap);
    setLoading(false);
  };

  const handleToggle = async (type, field, value) => {
    setSaving(true);
    const pref = preferences[type];
    
    if (pref) {
      await base44.entities.NotificationPreference.update(pref.id, {
        [field]: value
      });
    } else {
      await base44.entities.NotificationPreference.create({
        notification_type: type,
        [field]: value
      });
    }

    loadPreferences();
    setSaving(false);
  };

  const getPref = (type, field, defaultValue = true) => {
    return preferences[type]?.[field] ?? defaultValue;
  };

  if (loading) {
    return <div className="text-center py-8">Wird geladen...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="channels">Kanäle</TabsTrigger>
          <TabsTrigger value="schedule">Zeitplan</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benachrichtigungstypen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATION_TYPES.map(type => (
                <div key={type.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <Label className="cursor-pointer">{type.label}</Label>
                  </div>
                  <Switch
                    checked={getPref(type.id, 'enabled')}
                    onCheckedChange={(value) =>
                      handleToggle(type.id, 'enabled', value)
                    }
                    disabled={saving}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels */}
        <TabsContent value="channels" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benachrichtigungskanäle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATION_TYPES.map(type => (
                <div key={type.id} className="p-3 border rounded space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{type.icon}</span>
                    <p className="font-medium text-sm">{type.label}</p>
                  </div>

                  <div className="flex items-center justify-between pl-6">
                    <Label className="text-sm">In-App Benachrichtigung</Label>
                    <Switch
                      checked={getPref(type.id, 'push_enabled')}
                      onCheckedChange={(value) =>
                        handleToggle(type.id, 'push_enabled', value)
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between pl-6">
                    <Label className="text-sm">Email-Benachrichtigung</Label>
                    <Switch
                      checked={getPref(type.id, 'email_enabled')}
                      onCheckedChange={(value) =>
                        handleToggle(type.id, 'email_enabled', value)
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between pl-6">
                    <Label className="text-sm">Sound aktivieren</Label>
                    <Switch
                      checked={getPref(type.id, 'sound_enabled')}
                      onCheckedChange={(value) =>
                        handleToggle(type.id, 'sound_enabled', value)
                      }
                      disabled={saving}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zeitplan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daily Digest */}
              <div className="p-3 border rounded space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Täglich Zusammenfassung statt einzelner Benachrichtigungen</Label>
                  <Switch
                    checked={getPref('all', 'digest_enabled')}
                    onCheckedChange={(value) =>
                      handleToggle('all', 'digest_enabled', value)
                    }
                    disabled={saving}
                  />
                </div>

                {getPref('all', 'digest_enabled') && (
                  <div className="pl-6">
                    <Label className="text-sm">Zusammenfassung um</Label>
                    <Input
                      type="time"
                      defaultValue="09:00"
                      onChange={(e) =>
                        handleToggle('all', 'digest_time', e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Quiet Hours */}
              <div className="p-3 border rounded space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Ruhestunden aktivieren</Label>
                  <Switch
                    checked={getPref('all', 'quiet_hours_enabled')}
                    onCheckedChange={(value) =>
                      handleToggle('all', 'quiet_hours_enabled', value)
                    }
                    disabled={saving}
                  />
                </div>

                {getPref('all', 'quiet_hours_enabled') && (
                  <div className="pl-6 space-y-2">
                    <div>
                      <Label className="text-sm">Von</Label>
                      <Input
                        type="time"
                        defaultValue="22:00"
                        onChange={(e) =>
                          handleToggle('all', 'quiet_hours_start', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Bis</Label>
                      <Input
                        type="time"
                        defaultValue="08:00"
                        onChange={(e) =>
                          handleToggle('all', 'quiet_hours_end', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 text-sm text-blue-800">
              <p className="font-medium mb-2">💡 Hinweis zu Ruhestunden</p>
              <p>
                Während der Ruhestunden werden keine Benachrichtigungen angezeigt, aber 
                kritische Warnungen erscheinen immer noch.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}