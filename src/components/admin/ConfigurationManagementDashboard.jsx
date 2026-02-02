import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, History, Copy } from 'lucide-react';
import { toast } from 'sonner';

const ENVIRONMENTS = [
    { value: 'development', label: 'Entwicklung' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Produktion' }
];

const CATEGORIES = [
    { value: 'system', label: 'System' },
    { value: 'application', label: 'Anwendung' },
    { value: 'feature', label: 'Feature' },
    { value: 'integration', label: 'Integration' },
    { value: 'security', label: 'Sicherheit' },
    { value: 'performance', label: 'Performance' }
];

export default function ConfigurationManagementDashboard({ organizationId }) {
    const [configs, setConfigs] = useState([]);
    const [flags, setFlags] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('configs');
    const [selectedEnv, setSelectedEnv] = useState('production');
    const [showNewConfig, setShowNewConfig] = useState(false);
    const [showNewFlag, setShowNewFlag] = useState(false);
    const [configForm, setConfigForm] = useState({
        config_name: '',
        config_key: '',
        value: '',
        category: 'custom',
        environment: 'production'
    });
    const [flagForm, setFlagForm] = useState({
        flag_name: '',
        flag_key: '',
        flag_type: 'boolean',
        rollout_percentage: 0
    });

    useEffect(() => {
        loadData();
    }, [organizationId, selectedEnv]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [configsRes, flagsRes, historyRes] = await Promise.all([
                base44.functions.invoke('configurationManager', {
                    action: 'get_configs',
                    organization_id: organizationId,
                    environment: selectedEnv
                }),
                base44.functions.invoke('configurationManager', {
                    action: 'get_flags',
                    organization_id: organizationId,
                    environment: selectedEnv
                }),
                base44.functions.invoke('configurationManager', {
                    action: 'get_history',
                    organization_id: organizationId
                })
            ]);

            setConfigs(configsRes.data.configs || []);
            setFlags(flagsRes.data.flags || []);
            setHistory(historyRes.data.history || []);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConfig = async () => {
        if (!configForm.config_name || !configForm.config_key || configForm.value === '') {
            toast.error('Name, Key und Wert erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('configurationManager', {
                action: 'create_config',
                organization_id: organizationId,
                ...configForm
            });

            toast.success('Konfiguration erstellt');
            setConfigForm({ config_name: '', config_key: '', value: '', category: 'custom', environment: 'production' });
            setShowNewConfig(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleCreateFlag = async () => {
        if (!flagForm.flag_name || !flagForm.flag_key) {
            toast.error('Name und Key erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('configurationManager', {
                action: 'create_flag',
                organization_id: organizationId,
                ...flagForm,
                environment: selectedEnv
            });

            toast.success('Feature Flag erstellt');
            setFlagForm({ flag_name: '', flag_key: '', flag_type: 'boolean', rollout_percentage: 0 });
            setShowNewFlag(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleToggleFlag = async (flagId) => {
        try {
            await base44.functions.invoke('configurationManager', {
                action: 'toggle_flag',
                organization_id: organizationId,
                flag_id: flagId
            });

            toast.success('Flag aktualisiert');
            loadData();
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('Fehler beim Aktualisieren');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['configs', 'flags', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'configs' && '⚙️ Konfigurationen'}
                        {tab === 'flags' && '🚩 Feature Flags'}
                        {tab === 'history' && '📜 Historie'}
                    </button>
                ))}
            </div>

            {/* Environment Selector */}
            <div className="flex gap-2">
                <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ENVIRONMENTS.map(env => (
                            <SelectItem key={env.value} value={env.value}>{env.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Configs Tab */}
            {activeTab === 'configs' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{configs.length}</div>
                                <div className="text-xs text-gray-600">Konfigurationen</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {configs.filter(c => c.is_active).length}
                                </div>
                                <div className="text-xs text-gray-600">Aktiv</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {configs.filter(c => c.is_secret).length}
                                </div>
                                <div className="text-xs text-gray-600">Geheim</div>
                            </CardContent>
                        </Card>
                    </div>

                    {!showNewConfig && (
                        <Button onClick={() => setShowNewConfig(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neue Konfiguration
                        </Button>
                    )}

                    {showNewConfig && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Neue Konfiguration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Name"
                                    value={configForm.config_name}
                                    onChange={(e) => setConfigForm({...configForm, config_name: e.target.value})}
                                />
                                <Input
                                    placeholder="Key (z.B. 'max_upload_size')"
                                    value={configForm.config_key}
                                    onChange={(e) => setConfigForm({...configForm, config_key: e.target.value})}
                                />
                                <Input
                                    placeholder="Wert"
                                    value={configForm.value}
                                    onChange={(e) => setConfigForm({...configForm, value: e.target.value})}
                                />
                                <Select value={configForm.category} onValueChange={(v) => setConfigForm({...configForm, category: v})}>
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
                                    <Button onClick={handleCreateConfig} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewConfig(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {configs.map(config => (
                            <Card key={config.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{config.config_name}</h5>
                                            <p className="text-xs text-gray-600 mt-1">Key: {config.config_key}</p>
                                            <p className="text-xs text-gray-600 mt-1 font-mono bg-gray-100 p-1 rounded">
                                                {config.is_secret ? '••••••••' : config.value}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge className="bg-blue-100 text-blue-800">{config.category}</Badge>
                                                {config.is_secret && <Badge className="bg-red-100 text-red-800">🔐 Geheim</Badge>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Flags Tab */}
            {activeTab === 'flags' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{flags.length}</div>
                                <div className="text-xs text-gray-600">Feature Flags</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {flags.filter(f => f.is_enabled).length}
                                </div>
                                <div className="text-xs text-gray-600">Aktiviert</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-orange-600">
                                    {flags.filter(f => f.rollout_percentage > 0 && f.rollout_percentage < 100).length}
                                </div>
                                <div className="text-xs text-gray-600">Rollout</div>
                            </CardContent>
                        </Card>
                    </div>

                    {!showNewFlag && (
                        <Button onClick={() => setShowNewFlag(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neues Flag
                        </Button>
                    )}

                    {showNewFlag && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Neues Feature Flag</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Flag Name"
                                    value={flagForm.flag_name}
                                    onChange={(e) => setFlagForm({...flagForm, flag_name: e.target.value})}
                                />
                                <Input
                                    placeholder="Flag Key (z.B. 'new_dashboard')"
                                    value={flagForm.flag_key}
                                    onChange={(e) => setFlagForm({...flagForm, flag_key: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Rollout % (0-100)"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={flagForm.rollout_percentage}
                                        onChange={(e) => setFlagForm({...flagForm, rollout_percentage: parseInt(e.target.value)})}
                                        className="flex-1"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateFlag} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewFlag(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {flags.map(flag => (
                            <Card key={flag.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{flag.flag_name}</h5>
                                            <p className="text-xs text-gray-600 mt-1">Key: {flag.flag_key}</p>
                                            {flag.rollout_percentage > 0 && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{width: `${flag.rollout_percentage}%`}}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">{flag.rollout_percentage}% Rollout</p>
                                                </div>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <Badge className={flag.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {flag.is_enabled ? '✓ Aktiv' : '✗ Inaktiv'}
                                                </Badge>
                                                <Badge className="bg-blue-100 text-blue-800">{flag.status}</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleToggleFlag(flag.id)}
                                            className={flag.is_enabled ? 'bg-green-600' : 'bg-gray-600'}
                                        >
                                            {flag.is_enabled ? 'Deaktivieren' : 'Aktivieren'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.slice(0, 50).map(entry => (
                        <Card key={entry.id}>
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{entry.change_type}</p>
                                        <p className="text-xs text-gray-600">Von: {entry.changed_by}</p>
                                        {entry.old_value && (
                                            <p className="text-xs text-gray-600 mt-1">{entry.old_value} → {entry.new_value}</p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {new Date(entry.changed_at).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}