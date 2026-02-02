import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    shareCreated: true,
    shareRevoked: true,
    shareViewed: false,
    shareDownloaded: true,
    shareExpiring: true,
    shareExpired: true,
    auditAlert: true,
    securityAlert: true,
  });

  const [channels, setChannels] = useState({
    email: true,
    inApp: true,
    sms: false,
  });

  const handleSave = async () => {
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Benachrichtigungen aktualisiert');
    } catch (error) {
      toast.error('Fehler');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notification Types */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Share-Ereignisse</h4>
          {[
            { id: 'shareCreated', label: 'Dokument geteilt' },
            { id: 'shareRevoked', label: 'Freigabe widerrufen' },
            { id: 'shareViewed', label: 'Dokument angesehen' },
            { id: 'shareDownloaded', label: 'Heruntergeladen' },
          ].map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={settings[item.id]}
                onCheckedChange={(checked) => 
                  setSettings({...settings, [item.id]: checked})
                }
              />
              <label className="text-sm text-gray-700 cursor-pointer">{item.label}</label>
            </div>
          ))}
        </div>

        {/* Channels */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">Kanäle</h4>
          {[
            { id: 'email', label: 'E-Mail', icon: Mail },
            { id: 'inApp', label: 'In-App', icon: Bell },
            { id: 'sms', label: 'SMS', icon: Smartphone },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <Checkbox
                  checked={channels[item.id]}
                  onCheckedChange={(checked) => 
                    setChannels({...channels, [item.id]: checked})
                  }
                />
                <label className="text-sm text-gray-700 cursor-pointer">{item.label}</label>
              </div>
            );
          })}
        </div>

        <Button onClick={handleSave} className="w-full bg-blue-600">
          Speichern
        </Button>
      </CardContent>
    </Card>
  );
}