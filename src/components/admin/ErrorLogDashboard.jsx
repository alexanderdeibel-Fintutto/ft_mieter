import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, XCircle, Code, Globe, Server, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ErrorLogDashboard() {
    const [errors, setErrors] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        severity: '',
        app_source: '',
        error_type: '',
        resolved: false
    });

    useEffect(() => {
        loadErrors();
    }, [filters]);

    const loadErrors = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('getErrorLogs', filters);
            setErrors(response.data.errors);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Load errors error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (errorId) => {
        try {
            const user = await base44.auth.me();
            await base44.entities.ErrorLog.update(errorId, {
                resolved: true,
                resolved_at: new Date().toISOString(),
                resolved_by: user.id
            });
            loadErrors();
        } catch (error) {
            console.error('Resolve error:', error);
        }
    };

    const severityColors = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800'
    };

    const typeIcons = {
        frontend: <Globe className="w-4 h-4" />,
        backend: <Server className="w-4 h-4" />,
        api: <Code className="w-4 h-4" />,
        integration: <Code className="w-4 h-4" />
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Gesamt</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Kritisch</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.by_severity.critical}</p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Ungelöst</p>
                                    <p className="text-2xl font-bold">{stats.unresolved}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Gelöst</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select 
                            value={filters.severity} 
                            onValueChange={(value) => setFilters({...filters, severity: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Schweregrad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Alle</SelectItem>
                                <SelectItem value="low">Niedrig</SelectItem>
                                <SelectItem value="medium">Mittel</SelectItem>
                                <SelectItem value="high">Hoch</SelectItem>
                                <SelectItem value="critical">Kritisch</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select 
                            value={filters.error_type} 
                            onValueChange={(value) => setFilters({...filters, error_type: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Typ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Alle</SelectItem>
                                <SelectItem value="frontend">Frontend</SelectItem>
                                <SelectItem value="backend">Backend</SelectItem>
                                <SelectItem value="api">API</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select 
                            value={filters.app_source} 
                            onValueChange={(value) => setFilters({...filters, app_source: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="App" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Alle</SelectItem>
                                <SelectItem value="mieterapp">MieterApp</SelectItem>
                                <SelectItem value="vermietify">Vermietify</SelectItem>
                                <SelectItem value="hausmeisterpro">HausmeisterPro</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button 
                            variant="outline" 
                            onClick={() => setFilters({...filters, resolved: !filters.resolved})}
                        >
                            {filters.resolved ? 'Gelöste' : 'Ungelöste'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error List */}
            <div className="space-y-3">
                {errors.map(error => (
                    <Card key={error.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {typeIcons[error.error_type]}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-red-900 mb-1">
                                                {error.message}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {format(new Date(error.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                                                {error.app_source && ` • ${error.app_source}`}
                                                {error.function_name && ` • ${error.function_name}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Badge className={severityColors[error.severity]}>
                                                {error.severity}
                                            </Badge>
                                            {!error.resolved && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleResolve(error.id)}
                                                >
                                                    Als gelöst markieren
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {error.stack_trace && (
                                        <details className="mt-2">
                                            <summary className="text-sm text-gray-600 cursor-pointer">
                                                Stack Trace
                                            </summary>
                                            <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                                                {error.stack_trace}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {errors.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Fehler gefunden
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}