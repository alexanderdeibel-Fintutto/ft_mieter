import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Bell, Mail, Smartphone, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentReminderSettings({ open, onOpenChange, settings, onSave }) {
    const [reminderSettings, setReminderSettings] = useState(settings || {
        enabled: true,
        daysBefore: '3',
        pushNotification: true,
        emailNotification: true,
        repeatReminder: true,
        autoPayEnabled: false
    });

    const handleSave = () => {
        onSave?.(reminderSettings);
        toast.success('Erinnerungseinstellungen gespeichert!');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-violet-600" />
                        Zahlungserinnerungen
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Enable Reminders */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Erinnerungen aktivieren</Label>
                            <p className="text-sm text-gray-500">
                                Erhalte Benachrichtigungen vor Fälligkeit
                            </p>
                        </div>
                        <Switch
                            checked={reminderSettings.enabled}
                            onCheckedChange={(checked) => 
                                setReminderSettings({ ...reminderSettings, enabled: checked })
                            }
                        />
                    </div>

                    {reminderSettings.enabled && (
                        <>
                            {/* Days Before */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    Tage vor Fälligkeit
                                </Label>
                                <Select
                                    value={reminderSettings.daysBefore}
                                    onValueChange={(value) => 
                                        setReminderSettings({ ...reminderSettings, daysBefore: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Tag vorher</SelectItem>
                                        <SelectItem value="3">3 Tage vorher</SelectItem>
                                        <SelectItem value="5">5 Tage vorher</SelectItem>
                                        <SelectItem value="7">1 Woche vorher</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notification Methods */}
                            <div className="space-y-3">
                                <Label>Benachrichtigungsart</Label>
                                
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-violet-600" />
                                        <div>
                                            <p className="text-sm font-medium">Push-Benachrichtigung</p>
                                            <p className="text-xs text-gray-500">Auf deinem Smartphone</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={reminderSettings.pushNotification}
                                        onCheckedChange={(checked) => 
                                            setReminderSettings({ ...reminderSettings, pushNotification: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium">E-Mail</p>
                                            <p className="text-xs text-gray-500">An deine E-Mail-Adresse</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={reminderSettings.emailNotification}
                                        onCheckedChange={(checked) => 
                                            setReminderSettings({ ...reminderSettings, emailNotification: checked })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Repeat Reminder */}
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Wiederholte Erinnerung</p>
                                    <p className="text-xs text-amber-600">
                                        Täglich erinnern bis zur Zahlung
                                    </p>
                                </div>
                                <Switch
                                    checked={reminderSettings.repeatReminder}
                                    onCheckedChange={(checked) => 
                                        setReminderSettings({ ...reminderSettings, repeatReminder: checked })
                                    }
                                />
                            </div>

                            {/* Auto Pay (Coming Soon) */}
                            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg opacity-60">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Automatische Zahlung
                                        <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                                            Bald verfügbar
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Miete automatisch am Fälligkeitstag abbuchen
                                    </p>
                                </div>
                                <Switch disabled checked={false} />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                    <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                        <Check className="w-4 h-4 mr-2" />
                        Speichern
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}