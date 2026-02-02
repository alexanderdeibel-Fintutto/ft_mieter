import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ScheduledReportManager({ organizationId }) {
    const [schedule, setSchedule] = useState('');
    const [reportType, setReportType] = useState('payments');
    const [format, setFormat] = useState('pdf');
    const [recipients, setRecipients] = useState('');
    const [loading, setLoading] = useState(false);
    const [dayOfWeek, setDayOfWeek] = useState('1');
    const [dayOfMonth, setDayOfMonth] = useState('1');

    const handleCreateSchedule = async () => {
        if (!schedule || !recipients.trim()) {
            toast.error('Bitte füllen Sie alle Felder aus');
            return;
        }

        try {
            setLoading(true);
            await base44.functions.invoke('scheduleReport', {
                organization_id: organizationId,
                report_type: reportType,
                format: format,
                schedule: schedule,
                day_of_week: schedule === 'weekly' ? parseInt(dayOfWeek) : undefined,
                day_of_month: schedule === 'monthly' ? parseInt(dayOfMonth) : undefined,
                recipients: recipients.split(',').map(r => r.trim()),
                title: `${reportType} Report - ${schedule}`
            });

            toast.success('Report-Schedule erstellt');
            setRecipients('');
        } catch (error) {
            console.error('Create schedule error:', error);
            toast.error('Fehler beim Erstellen des Schedules');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Automatisierte Reports
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Report-Typ</label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payments">Zahlungen</SelectItem>
                                <SelectItem value="tenants">Mieter</SelectItem>
                                <SelectItem value="properties">Immobilien</SelectItem>
                                <SelectItem value="maintenance">Instandhaltung</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Zeitplan</label>
                        <Select value={schedule} onValueChange={setSchedule}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Täglich</SelectItem>
                                <SelectItem value="weekly">Wöchentlich</SelectItem>
                                <SelectItem value="monthly">Monatlich</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {schedule === 'weekly' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Wochentag</label>
                        <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Sonntag</SelectItem>
                                <SelectItem value="1">Montag</SelectItem>
                                <SelectItem value="2">Dienstag</SelectItem>
                                <SelectItem value="3">Mittwoch</SelectItem>
                                <SelectItem value="4">Donnerstag</SelectItem>
                                <SelectItem value="5">Freitag</SelectItem>
                                <SelectItem value="6">Samstag</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {schedule === 'monthly' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Monatstag</label>
                        <Input 
                            type="number"
                            min="1"
                            max="31"
                            value={dayOfMonth}
                            onChange={(e) => setDayOfMonth(e.target.value)}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2">Empfänger (kommagetrennt)</label>
                    <Input
                        placeholder="max@example.com, john@example.com"
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                    />
                </div>

                <Button 
                    onClick={handleCreateSchedule}
                    disabled={loading || !schedule}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Wird erstellt...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule erstellen
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}