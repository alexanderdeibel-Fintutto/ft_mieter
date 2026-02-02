import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationManagementDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('templates');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('notificationManager', {
                action: 'get_dashboard_data',
                organization_id: organizationId
            });
            setData(res.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const typeColors = {
        email: 'bg-blue-100 text-blue-800',
        sms: 'bg-green-100 text-green-800',
        push: 'bg-purple-100 text-purple-800',
        in_app: 'bg-orange-100 text-orange-800',
        webhook: 'bg-pink-100 text-pink-800',
        slack: 'bg-indigo-100 text-indigo-800',
        teams: 'bg-cyan-100 text-cyan-800',
        pending: 'bg-yellow-100 text-yellow-800',
        sent: 'bg-blue-100 text-blue-800',
        delivered: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        bounced: 'bg-orange-100 text-orange-800'
    };

    const iconMap = {
        email: Mail,
        sms: MessageSquare,
        push: Bell,
        in_app: Bell,
        webhook: Send
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['templates', 'logs', 'channels', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'templates' && '📋 Vorlagen'}
                        {tab === 'logs' && '📝 Logs'}
                        {tab === 'channels' && '📡 Kanäle'}
                        {tab === 'analytics' && '📊 Analytik'}
                    </button>
                ))}
            </div>

            {activeTab === 'templates' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.template_stats.total_templates}
                            </div>
                            <div className="text-xs text-gray-600">Vorlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.template_stats.active_templates}
                            </div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.template_stats.total_sent}
                            </div>
                            <div className="text-xs text-gray-600">Versendet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.template_stats.success_count}
                            </div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.success_rate}%
                            </div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.templates.map(template => (
                            <Card key={template.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{template.template_name}</h5>
                                                <Badge className={typeColors[template.template_type]}>
                                                    {template.template_type}
                                                </Badge>
                                                <Badge variant="outline" className={typeColors[template.priority]}>
                                                    {template.priority}
                                                </Badge>
                                            </div>
                                            {template.trigger_event && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Event: {template.trigger_event}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Versendet: {template.total_sent}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Erfolg: {template.success_count}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Fehler: {template.failure_count}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Retry: {template.retry_count}x
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {template.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'logs' && (
                <>
                    <div className="grid grid-cols-6 gap-3">
                        <Card><CardContent className="p-3">
                            <div className="text-2xl font-bold text-blue-600">{data.log_stats.total_logs}</div>
                            <div className="text-xs text-gray-600">Gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-3">
                            <div className="text-2xl font-bold text-yellow-600">{data.log_stats.pending}</div>
                            <div className="text-xs text-gray-600">Ausstehend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-3">
                            <div className="text-2xl font-bold text-blue-600">{data.log_stats.sent}</div>
                            <div className="text-xs text-gray-600">Versendet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-3">
                            <div className="text-2xl font-bold text-green-600">{data.log_stats.delivered}</div>
                            <div className="text-xs text-gray-600">Zugestellt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-3">
                            <div className="text-2xl font-bold text-red-600">{data.log_stats.failed}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-3">
                            <div className="text-2xl font-bold text-orange-600">{data.log_stats.bounced}</div>
                            <div className="text-xs text-gray-600">Abgesprungen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.logs.map(log => (
                            <Card key={log.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-gray-600">
                                                    {log.notification_id?.substring(0, 12)}
                                                </span>
                                                <Badge className={typeColors[log.notification_type]}>
                                                    {log.notification_type}
                                                </Badge>
                                            </div>
                                            <p className="text-xs font-semibold mt-1 truncate">
                                                {log.subject || log.body.substring(0, 50)}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    An: {log.recipient_address}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Versuche: {log.retry_count}
                                                </span>
                                                {log.opened_at && (
                                                    <span className="text-xs text-green-600">
                                                        👁️ Geöffnet
                                                    </span>
                                                )}
                                                {log.clicked_at && (
                                                    <span className="text-xs text-blue-600">
                                                        🔗 Geklickt
                                                    </span>
                                                )}
                                                {log.error_message && (
                                                    <span className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {log.error_message}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={typeColors[log.status]}>
                                            {log.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'channels' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.channel_stats.total_channels}
                            </div>
                            <div className="text-xs text-gray-600">Kanäle</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.channel_stats.active_channels}
                            </div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.channel_stats.primary_channels}
                            </div>
                            <div className="text-xs text-gray-600">Primär</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.channels.map(channel => (
                            <Card key={channel.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-semibold text-sm">{channel.channel_name}</h5>
                                                <Badge className={typeColors[channel.channel_type]}>
                                                    {channel.channel_type}
                                                </Badge>
                                                {channel.is_primary && (
                                                    <Badge variant="outline">⭐ Primär</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Provider: {channel.provider}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Versendet: {channel.total_sent}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Erfolgsrate: {channel.success_rate?.toFixed(1)}%
                                                </span>
                                                <span className="text-xs text-blue-600">
                                                    Ø Zeit: {channel.avg_delivery_time_ms}ms
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Rate Limit: {channel.rate_limit_per_hour}/h
                                                </span>
                                            </div>
                                            {channel.last_used_at && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Zuletzt: {new Date(channel.last_used_at).toLocaleString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={channel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {channel.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'analytics' && (
                <>
                    <Card><CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-3">Template-Verteilung</h4>
                        <div className="grid grid-cols-5 gap-3">
                            {Object.entries(data.type_distribution || {}).map(([type, count]) => (
                                <div key={type} className="bg-gray-50 p-3 rounded">
                                    <Badge className={typeColors[type]} variant="outline">
                                        {type}
                                    </Badge>
                                    <div className="text-lg font-bold text-gray-900 mt-2">
                                        {count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card></CardContent>

                    <Card><CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-3">Log-Status Übersicht</h4>
                        <div className="space-y-2">
                            {[
                                { label: 'Ausstehend', value: data.log_stats.pending, color: 'bg-yellow-200' },
                                { label: 'Versendet', value: data.log_stats.sent, color: 'bg-blue-200' },
                                { label: 'Zugestellt', value: data.log_stats.delivered, color: 'bg-green-200' },
                                { label: 'Fehlgeschlagen', value: data.log_stats.failed, color: 'bg-red-200' },
                                { label: 'Abgesprungen', value: data.log_stats.bounced, color: 'bg-orange-200' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-200 rounded-full h-2 w-32">
                                            <div 
                                                className={`h-2 rounded-full ${item.color}`}
                                                style={{ 
                                                    width: `${Math.min(100, (item.value / (data.log_stats.total_logs || 1)) * 100)}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold w-8 text-right">{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card></CardContent>
                </>
            )}
        </div>
    );
}