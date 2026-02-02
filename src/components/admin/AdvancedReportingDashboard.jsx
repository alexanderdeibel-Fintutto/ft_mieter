import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Download, Clock, TrendingUp, FileText } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'finance', label: 'Finanzen' },
    { value: 'operations', label: 'Operationen' },
    { value: 'sales', label: 'Verkauf' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'compliance', label: 'Compliance' }
];

const FREQUENCIES = [
    { value: 'daily', label: 'Täglich' },
    { value: 'weekly', label: 'Wöchentlich' },
    { value: 'monthly', label: 'Monatlich' },
    { value: 'quarterly', label: 'Vierteljährlich' }
];

export default function AdvancedReportingDashboard({ organizationId }) {
    const [templates, setTemplates] = useState([]);
    const [reports, setReports] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('templates');
    const [showNewTemplate, setShowNewTemplate] = useState(false);
    const [showNewSchedule, setShowNewSchedule] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({
        template_name: '',
        category: 'finance'
    });

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [templatesRes, analyticsRes] = await Promise.all([
                base44.functions.invoke('reportingEngine', {
                    action: 'get_templates',
                    organization_id: organizationId
                }),
                base44.functions.invoke('reportingEngine', {
                    action: 'get_analytics',
                    organization_id: organizationId
                })
            ]);

            setTemplates(templatesRes.data.templates || []);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!templateForm.template_name) {
            toast.error('Template-Name erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('reportingEngine', {
                action: 'create_template',
                organization_id: organizationId,
                template_name: templateForm.template_name,
                category: templateForm.category
            });

            toast.success('Template erstellt');
            setTemplateForm({ template_name: '', category: 'finance' });
            setShowNewTemplate(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleGenerateReport = async (templateId) => {
        try {
            const res = await base44.functions.invoke('reportingEngine', {
                action: 'generate_report',
                organization_id: organizationId,
                template_id: templateId,
                report_name: `Report ${new Date().toLocaleDateString()}`
            });

            toast.success('Report wird generiert...');
            setTimeout(loadData, 1000);
        } catch (error) {
            console.error('Generate error:', error);
            toast.error('Fehler beim Generieren');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['templates', 'reports', 'schedules'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'templates' && '📋 Templates'}
                        {tab === 'reports' && '📊 Reports'}
                        {tab === 'schedules' && '⏰ Zeitpläne'}
                    </button>
                ))}
            </div>

            {/* Analytics Overview */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{analytics.total_templates}</div>
                            <div className="text-xs text-gray-600">Templates</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{analytics.total_reports_generated}</div>
                            <div className="text-xs text-gray-600">Reports</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{analytics.total_schedules}</div>
                            <div className="text-xs text-gray-600">Zeitpläne</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{analytics.schedule_success_rate}%</div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <>
                    {showNewTemplate && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Neues Template</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Template-Name"
                                    value={templateForm.template_name}
                                    onChange={(e) => setTemplateForm({...templateForm, template_name: e.target.value})}
                                />
                                <Select value={templateForm.category} onValueChange={(v) => setTemplateForm({...templateForm, category: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateTemplate} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewTemplate(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!showNewTemplate && (
                        <Button onClick={() => setShowNewTemplate(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neues Template
                        </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map(template => (
                            <Card key={template.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-sm">{template.template_name}</h4>
                                            <Badge className="mt-1">{template.category}</Badge>
                                        </div>
                                        <FileText className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-xs text-gray-600 mb-3">
                                        Verwendet: {template.usage_count} mal
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleGenerateReport(template.id)}
                                        className="w-full"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Report generieren
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Generierte Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics?.recent_reports.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.recent_reports.map(report => (
                                    <div
                                        key={report.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                                    >
                                        <div>
                                            <h5 className="font-medium text-sm">{report.report_name}</h5>
                                            <p className="text-xs text-gray-600">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`text-xs ${
                                                report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {report.status}
                                            </Badge>
                                            {report.export_urls?.pdf && (
                                                <Button size="sm" variant="outline">
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 text-sm">Noch keine Reports generiert</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Geplante Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics?.total_schedules > 0 ? (
                                <p className="text-sm text-gray-600">
                                    {analytics.total_schedules} aktive Zeitpläne konfiguriert
                                </p>
                            ) : (
                                <p className="text-center text-gray-500 text-sm">Keine Zeitpläne eingerichtet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}