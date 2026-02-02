import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, GitBranch, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function TemplateDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('templates');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('templateEngine', {
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

    const statusColors = {
        rendered: 'bg-blue-100 text-blue-800',
        sent: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['templates', 'versions', 'rendered'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'templates' && '📄 Templates'}
                        {tab === 'versions' && '🔀 Versionen'}
                        {tab === 'rendered' && '📨 Rendered'}
                    </button>
                ))}
            </div>

            {activeTab === 'templates' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_templates}</div>
                            <div className="text-xs text-gray-600">Templates</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_templates}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_renders}</div>
                            <div className="text-xs text-gray-600">Renders</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.templates_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.templates.map(template => (
                            <Card key={template.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{template.template_name}</h5>
                                                <Badge variant="outline">{template.template_type}</Badge>
                                                {template.is_active && (
                                                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Key: {template.template_key}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Version: {template.version}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Locale: {template.locale}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Renders: {template.render_count || 0}
                                                </span>
                                            </div>
                                            {template.variables && template.variables.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    <span className="text-xs text-gray-600">Variablen:</span>
                                                    {template.variables.slice(0, 5).map(v => (
                                                        <Badge key={v} variant="outline" className="text-xs">
                                                            {v}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                                {template.content.substring(0, 150)}...
                                            </p>
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

            {activeTab === 'versions' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_versions}</div>
                            <div className="text-xs text-gray-600">Versionen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.published_versions}</div>
                            <div className="text-xs text-gray-600">Veröffentlicht</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.stats.total_versions - data.stats.published_versions}
                            </div>
                            <div className="text-xs text-gray-600">Draft</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_templates}</div>
                            <div className="text-xs text-gray-600">Templates</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.versions.map(version => {
                            const template = data.templates.find(t => t.id === version.template_id);
                            return (
                                <Card key={version.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <GitBranch className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">v{version.version_number}</span>
                                                    <Badge variant="outline">
                                                        {template?.template_name || 'Unknown'}
                                                    </Badge>
                                                </div>
                                                {version.changelog && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {version.changelog}
                                                    </p>
                                                )}
                                                {version.created_by_user && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Ersteller: {version.created_by_user.substring(0, 8)}...
                                                    </p>
                                                )}
                                                {version.published_at && (
                                                    <span className="text-xs text-gray-600 mt-2 inline-block">
                                                        Veröffentlicht: {new Date(version.published_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                                    {version.content.substring(0, 120)}...
                                                </p>
                                            </div>
                                            <Badge className={version.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {version.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'rendered' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.rendered.length}</div>
                            <div className="text-xs text-gray-600">Rendered</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.successful_deliveries}</div>
                            <div className="text-xs text-gray-600">Zugestellt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.failed_deliveries}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.delivery_rate}%</div>
                            <div className="text-xs text-gray-600">Delivery Rate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.rendered.map(render => {
                            const template = data.templates.find(t => t.id === render.template_id);
                            return (
                                <Card key={render.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Send className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">
                                                        {template?.template_name || 'Unknown'}
                                                    </span>
                                                    {render.delivery_channel && (
                                                        <Badge variant="outline">{render.delivery_channel}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Render ID: {render.render_id.substring(0, 16)}...
                                                </p>
                                                {render.recipient_id && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Empfänger: {render.recipient_id.substring(0, 12)}...
                                                    </p>
                                                )}
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    {new Date(render.rendered_at).toLocaleString('de-DE')}
                                                </span>
                                                {Object.keys(render.variables_used || {}).length > 0 && (
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        {Object.entries(render.variables_used).slice(0, 3).map(([key, value]) => (
                                                            <Badge key={key} variant="outline" className="text-xs">
                                                                {key}: {String(value).substring(0, 20)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {render.error_message && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Error: {render.error_message}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={statusColors[render.status]}>
                                                {render.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}