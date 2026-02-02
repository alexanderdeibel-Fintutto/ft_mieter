import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Zap, Loader2, CheckCircle, AlertCircle, Pause, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner';

const ENTITY_TYPES = [
    'PaymentTransaction',
    'Document',
    'Tenant',
    'BillingStatement',
    'MaintenanceTask'
];

const OPERATION_TYPES = [
    { value: 'create', label: 'Erstellen' },
    { value: 'update', label: 'Aktualisieren' },
    { value: 'delete', label: 'Löschen' },
    { value: 'export', label: 'Exportieren' }
];

export default function BatchOperationManager({ organizationId }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        entity_type: '',
        operation_type: '',
        csv_data: ''
    });
    const [polling, setPolling] = useState(null);

    useEffect(() => {
        loadJobs();
        // Poll für Status Updates alle 2 Sekunden wenn Jobs laufen
        const interval = setInterval(() => {
            loadJobs();
        }, 2000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            // Fetch recent batch jobs
            const allJobs = await base44.entities.BatchJob.filter({
                organization_id: organizationId
            }, '-created_date', 20);
            setJobs(allJobs);
        } catch (error) {
            console.error('Load jobs error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.entity_type || !formData.operation_type || !formData.csv_data.trim()) {
            toast.error('Bitte füllen Sie alle Felder aus');
            return;
        }

        try {
            // Parse CSV data
            const lines = formData.csv_data.trim().split('\n');
            const batchData = lines.map(line => {
                // Simple CSV parsing - assuming comma-separated
                const parts = line.split(',');
                return { raw_data: line };
            });

            const response = await base44.functions.invoke('processBatchOperation', {
                action: 'submit',
                organization_id: organizationId,
                entity_type: formData.entity_type,
                operation_type: formData.operation_type,
                batch_data: batchData
            });

            toast.success('Batch-Operation eingereicht');
            setFormData({ entity_type: '', operation_type: '', csv_data: '' });
            setShowForm(false);
            loadJobs();
        } catch (error) {
            console.error('Submit batch error:', error);
            toast.error('Fehler beim Einreichen der Batch-Operation');
        }
    };

    const handleCancel = async (jobId) => {
        try {
            await base44.functions.invoke('processBatchOperation', {
                action: 'cancel',
                organization_id: organizationId,
                batch_job_id: jobId
            });
            toast.success('Batch pausiert');
            loadJobs();
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error('Fehler beim Pausieren');
        }
    };

    const handleRetry = async (jobId) => {
        try {
            await base44.functions.invoke('processBatchOperation', {
                action: 'retry',
                organization_id: organizationId,
                batch_job_id: jobId
            });
            toast.success('Batch wird erneut verarbeitet');
            loadJobs();
        } catch (error) {
            console.error('Retry error:', error);
            toast.error('Fehler beim Neustarten');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-gray-100 text-gray-800',
            running: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            paused: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'running':
                return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
            default:
                return <Zap className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Create Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Neue Batch-Operation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Entity-Typ</label>
                            <Select 
                                value={formData.entity_type}
                                onValueChange={(value) => setFormData({...formData, entity_type: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ENTITY_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Operationstyp</label>
                            <Select 
                                value={formData.operation_type}
                                onValueChange={(value) => setFormData({...formData, operation_type: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATION_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">CSV-Daten</label>
                            <textarea
                                placeholder="CSV-Daten hier einfügen..."
                                value={formData.csv_data}
                                onChange={(e) => setFormData({...formData, csv_data: e.target.value})}
                                className="w-full h-40 border rounded px-3 py-2 font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} className="flex-1">
                                Absenden
                            </Button>
                            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                                Abbrechen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Jobs List */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Batch-Operationen</h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Zap className="w-4 h-4 mr-2" />
                        Neue Operation
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {jobs.map(job => (
                    <Card key={job.id}>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getStatusIcon(job.status)}
                                        <div className="flex-1">
                                            <div className="font-semibold">
                                                {job.entity_type} - {job.operation_type.toUpperCase()}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {job.total_items} Items
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(job.status)}>
                                        {job.status}
                                    </Badge>
                                </div>

                                {/* Progress */}
                                {(job.status === 'running' || job.status === 'pending') && (
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span>{job.processed_items} / {job.total_items}</span>
                                            <span className="text-gray-600">{job.progress_percentage}%</span>
                                        </div>
                                        <Progress value={job.progress_percentage} className="h-2" />
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="bg-green-50 rounded p-2">
                                        <div className="text-gray-600">Erfolgreich</div>
                                        <div className="font-semibold text-green-600">{job.successful_items}</div>
                                    </div>
                                    <div className="bg-red-50 rounded p-2">
                                        <div className="text-gray-600">Fehler</div>
                                        <div className="font-semibold text-red-600">{job.failed_items}</div>
                                    </div>
                                    <div className="bg-blue-50 rounded p-2">
                                        <div className="text-gray-600">Ausstehend</div>
                                        <div className="font-semibold text-blue-600">
                                            {job.total_items - job.processed_items}
                                        </div>
                                    </div>
                                </div>

                                {/* Error Log */}
                                {job.error_log && job.error_log.length > 0 && (
                                    <details className="text-sm">
                                        <summary className="cursor-pointer text-red-600 font-medium">
                                            Fehler anzeigen ({job.error_log.length})
                                        </summary>
                                        <div className="mt-2 space-y-1 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
                                            {job.error_log.slice(0, 5).map((err, i) => (
                                                <div key={i} className="text-xs text-red-700">
                                                    Item {err.item_index}: {err.error}
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}

                                {/* Actions */}
                                {job.status === 'running' && (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleCancel(job.id)}
                                    >
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pausieren
                                    </Button>
                                )}
                                {job.status === 'failed' && (
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleRetry(job.id)}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Erneut versuchen
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {jobs.length === 0 && !showForm && !loading && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Batch-Operationen
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}