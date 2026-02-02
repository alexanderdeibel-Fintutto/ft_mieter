import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Plus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const SEVERITY_COLORS = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
};

const STATUS_COLORS = {
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    monitoring: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
};

const CATEGORIES = [
    { value: 'security', label: '🔒 Security' },
    { value: 'performance', label: '⚡ Performance' },
    { value: 'availability', label: '📡 Availability' },
    { value: 'data_loss', label: '📊 Data Loss' },
    { value: 'compliance', label: '⚖️ Compliance' },
    { value: 'operational', label: '🔧 Operational' }
];

export default function IncidentManagementDashboard({ organizationId }) {
    const [incidents, setIncidents] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [expandedIncident, setExpandedIncident] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'medium',
        category: 'operational',
        affected_systems: ''
    });

    useEffect(() => {
        loadIncidents();
    }, [organizationId]);

    const loadIncidents = async () => {
        try {
            setLoading(true);
            const [incidentsRes, statsRes] = await Promise.all([
                base44.functions.invoke('incidentManagement', {
                    action: 'get_incidents',
                    organization_id: organizationId
                }),
                base44.functions.invoke('incidentManagement', {
                    action: 'get_statistics',
                    organization_id: organizationId
                })
            ]);

            setIncidents(incidentsRes.data.incidents || []);
            setStatistics(statsRes.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden der Incidents');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateIncident = async () => {
        if (!formData.title || !formData.severity || !formData.category) {
            toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
            return;
        }

        try {
            await base44.functions.invoke('incidentManagement', {
                action: 'create_incident',
                organization_id: organizationId,
                title: formData.title,
                description: formData.description,
                severity: formData.severity,
                category: formData.category,
                affected_systems: formData.affected_systems
                    ? formData.affected_systems.split(',').map(s => s.trim())
                    : []
            });

            toast.success('Incident erstellt');
            setFormData({ title: '', description: '', severity: 'medium', category: 'operational', affected_systems: '' });
            setShowNewForm(false);
            loadIncidents();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen des Incidents');
        }
    };

    const handleResolveIncident = async (incidentId) => {
        const resolution = prompt('Beschreiben Sie die Behebung:');
        if (!resolution) return;

        try {
            await base44.functions.invoke('incidentManagement', {
                action: 'update_incident',
                organization_id: organizationId,
                incident_id: incidentId,
                resolution: resolution
            });

            toast.success('Incident gelöst');
            loadIncidents();
        } catch (error) {
            console.error('Resolve error:', error);
            toast.error('Fehler beim Lösen des Incidents');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOpenIncidents = () => incidents.filter(i => i.status === 'open' || i.status === 'investigating');
    const getCriticalIncidents = () => incidents.filter(i => i.severity === 'critical');

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Statistics */}
            {statistics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{statistics.total}</div>
                            <div className="text-xs text-gray-600">Diesen Monat</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{statistics.by_severity.critical}</div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{statistics.by_severity.high}</div>
                            <div className="text-xs text-gray-600">Hoch</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {Math.round(statistics.average_resolution_time || 0)}
                            </div>
                            <div className="text-xs text-gray-600">Ø Behebung (min)</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{statistics.by_status.closed}</div>
                            <div className="text-xs text-gray-600">Geschlossen</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Create Form */}
            {showNewForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Neuer Incident</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Incident-Titel"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                        <Textarea
                            placeholder="Beschreibung"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Select value={formData.severity} onValueChange={(v) => setFormData({...formData, severity: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Input
                            placeholder="Betroffene Systeme (komma-getrennt)"
                            value={formData.affected_systems}
                            onChange={(e) => setFormData({...formData, affected_systems: e.target.value})}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleCreateIncident} className="flex-1">Erstellen</Button>
                            <Button variant="outline" onClick={() => setShowNewForm(false)} className="flex-1">Abbrechen</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* New Incident Button */}
            {!showNewForm && (
                <Button onClick={() => setShowNewForm(true)} className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Incident
                </Button>
            )}

            {/* Incidents List */}
            <div className="space-y-3">
                {getOpenIncidents().length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-red-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {getOpenIncidents().length} Offene Incidents
                        </h3>
                    </div>
                )}

                {incidents.map(incident => (
                    <Card
                        key={incident.id}
                        className={incident.severity === 'critical' ? 'border-red-300' : ''}
                    >
                        <CardContent className="p-4">
                            <div
                                className="cursor-pointer"
                                onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                            >
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold">{incident.incident_id}</h4>
                                            <Badge className={SEVERITY_COLORS[incident.severity]}>
                                                {incident.severity.toUpperCase()}
                                            </Badge>
                                            <Badge className={STATUS_COLORS[incident.status]}>
                                                {incident.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Erkannt: {formatDate(incident.detected_at)}
                                        </p>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition-transform ${
                                            expandedIncident === incident.id ? 'rotate-180' : ''
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedIncident === incident.id && (
                                <div className="mt-4 pt-4 border-t space-y-3">
                                    {incident.description && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600">Beschreibung</p>
                                            <p className="text-sm text-gray-700">{incident.description}</p>
                                        </div>
                                    )}

                                    {incident.affected_systems?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600">Betroffene Systeme</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {incident.affected_systems.map((sys, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {sys}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {incident.root_cause && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600">Ursache</p>
                                            <p className="text-sm text-gray-700">{incident.root_cause}</p>
                                        </div>
                                    )}

                                    {incident.resolution && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600">Lösung</p>
                                            <p className="text-sm text-gray-700">{incident.resolution}</p>
                                        </div>
                                    )}

                                    {(incident.status === 'open' || incident.status === 'investigating') && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleResolveIncident(incident.id)}
                                            className="mt-3"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Als Gelöst Markieren
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {incidents.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Incidents 🎉
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}