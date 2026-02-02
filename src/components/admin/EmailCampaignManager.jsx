import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Send, Pause, Eye, Trash2, TrendingUp, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';

const CAMPAIGN_TYPES = [
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promotional', label: 'Promotion' },
    { value: 'announcement', label: 'Ankündigung' },
    { value: 'drip', label: 'Drip' }
];

const STATUS_COLORS = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    running: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800'
};

export default function EmailCampaignManager({ organizationId }) {
    const [campaigns, setCampaigns] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [activeTab, setActiveTab] = useState('campaigns');
    const [formData, setFormData] = useState({
        campaign_name: '',
        campaign_type: 'newsletter',
        subject_line: '',
        sender_email: 'noreply@example.com',
        sender_name: ''
    });

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [campaignsRes, subscribersRes] = await Promise.all([
                base44.functions.invoke('emailCampaignEngine', {
                    action: 'get_campaigns',
                    organization_id: organizationId
                }),
                base44.functions.invoke('emailCampaignEngine', {
                    action: 'get_subscribers',
                    organization_id: organizationId
                })
            ]);

            setCampaigns(campaignsRes.data.campaigns || []);
            setSubscribers(subscribersRes.data.subscribers || []);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async () => {
        if (!formData.campaign_name || !formData.subject_line) {
            toast.error('Bitte füllen Sie erforderliche Felder aus');
            return;
        }

        try {
            await base44.functions.invoke('emailCampaignEngine', {
                action: 'create_campaign',
                organization_id: organizationId,
                campaign_name: formData.campaign_name,
                campaign_type: formData.campaign_type,
                subject_line: formData.subject_line,
                sender_email: formData.sender_email,
                sender_name: formData.sender_name
            });

            toast.success('Kampagne erstellt');
            setFormData({ campaign_name: '', campaign_type: 'newsletter', subject_line: '', sender_email: 'noreply@example.com', sender_name: '' });
            setShowNewForm(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleSendCampaign = async (campaignId) => {
        try {
            await base44.functions.invoke('emailCampaignEngine', {
                action: 'send_campaign',
                organization_id: organizationId,
                campaign_id: campaignId
            });
            toast.success('Kampagne gesendet');
            loadData();
        } catch (error) {
            console.error('Send error:', error);
            toast.error('Fehler beim Senden');
        }
    };

    const handleViewAnalytics = async (campaignId) => {
        try {
            const res = await base44.functions.invoke('emailCampaignEngine', {
                action: 'get_analytics',
                organization_id: organizationId,
                campaign_id: campaignId
            });
            setAnalytics(res.data);
            setSelectedCampaign(campaignId);
        } catch (error) {
            console.error('Analytics error:', error);
            toast.error('Fehler beim Laden Analytics');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const stats = campaigns.length > 0 
        ? {
            total: campaigns.length,
            sent: campaigns.filter(c => c.status === 'completed').length,
            draft: campaigns.filter(c => c.status === 'draft').length,
            avg_open_rate: Math.round(campaigns.reduce((sum, c) => sum + Math.round((c.opens / Math.max(c.emails_sent, 1)) * 100), 0) / campaigns.length)
        }
        : { total: 0, sent: 0, draft: 0, avg_open_rate: 0 };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['campaigns', 'subscribers', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'campaigns' && '📧 Kampagnen'}
                        {tab === 'subscribers' && '👥 Subscriber'}
                        {tab === 'analytics' && '📊 Analytik'}
                    </button>
                ))}
            </div>

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                <div className="text-xs text-gray-600">Gesamt</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                                <div className="text-xs text-gray-600">Gesendet</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                                <div className="text-xs text-gray-600">Entwurf</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-purple-600">{stats.avg_open_rate}%</div>
                                <div className="text-xs text-gray-600">Ø Öffnungsrate</div>
                            </CardContent>
                        </Card>
                    </div>

                    {showNewForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Neue Kampagne</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Kampagnen-Name"
                                    value={formData.campaign_name}
                                    onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                                />
                                <Textarea
                                    placeholder="Betreffzeile"
                                    value={formData.subject_line}
                                    onChange={(e) => setFormData({...formData, subject_line: e.target.value})}
                                />
                                <Select value={formData.campaign_type} onValueChange={(v) => setFormData({...formData, campaign_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CAMPAIGN_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Absender-Email"
                                    value={formData.sender_email}
                                    onChange={(e) => setFormData({...formData, sender_email: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateCampaign} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewForm(false)} className="flex-1">Abbrechen</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!showNewForm && (
                        <Button onClick={() => setShowNewForm(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neue Kampagne
                        </Button>
                    )}

                    <div className="space-y-3">
                        {campaigns.map(campaign => (
                            <Card key={campaign.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{campaign.campaign_name}</h4>
                                                <Badge className={STATUS_COLORS[campaign.status]}>
                                                    {campaign.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{campaign.subject_line}</p>
                                            <div className="flex gap-4 text-xs text-gray-600">
                                                <span>📤 {campaign.emails_sent || 0} versendet</span>
                                                <span>👁️ {campaign.opens || 0} Öffnungen</span>
                                                <span>🔗 {campaign.clicks || 0} Klicks</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {campaign.status === 'draft' && (
                                                <Button size="sm" onClick={() => handleSendCampaign(campaign.id)}>
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" onClick={() => handleViewAnalytics(campaign.id)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Subscribers Tab */}
            {activeTab === 'subscribers' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{subscribers.length}</div>
                                <div className="text-xs text-gray-600">Gesamt</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {subscribers.filter(s => s.status === 'subscribed').length}
                                </div>
                                <div className="text-xs text-gray-600">Aktiv</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">
                                    {subscribers.filter(s => s.status === 'unsubscribed').length}
                                </div>
                                <div className="text-xs text-gray-600">Abgemeldet</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Subscriber-Liste</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-3">Email</th>
                                            <th className="text-left py-2 px-3">Status</th>
                                            <th className="text-right py-2 px-3">Öffnungen</th>
                                            <th className="text-right py-2 px-3">Klicks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.slice(0, 20).map(sub => (
                                            <tr key={sub.id} className="border-b hover:bg-gray-50">
                                                <td className="py-2 px-3">{sub.email}</td>
                                                <td className="py-2 px-3">
                                                    <Badge className={`text-xs ${
                                                        sub.status === 'subscribed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {sub.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-right py-2 px-3">{sub.total_opens || 0}</td>
                                                <td className="text-right py-2 px-3">{sub.total_clicks || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{analytics.stats.sent}</div>
                                <div className="text-xs text-gray-600">Versendet</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">{analytics.stats.open_rate}%</div>
                                <div className="text-xs text-gray-600">Öffnungsrate</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-purple-600">{analytics.stats.click_rate}%</div>
                                <div className="text-xs text-gray-600">Klickrate</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-orange-600">€{analytics.stats.revenue.toFixed(2)}</div>
                                <div className="text-xs text-gray-600">Umsatz</div>
                            </CardContent>
                        </Card>
                    </div>

                    {analytics.overtime.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Leistung über Zeit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={analytics.overtime}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="opens" stroke="#3b82f6" />
                                        <Line type="monotone" dataKey="clicks" stroke="#10b981" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}