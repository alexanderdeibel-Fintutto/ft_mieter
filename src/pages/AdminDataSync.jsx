import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Database, AlertCircle, CheckCircle, Clock, ArrowRightLeft, Settings } from 'lucide-react';
import { toast } from 'sonner';

const ENTITY_TABLE_MAP = {
  'UserProfile': 'user_profiles',
  'MieterBuilding': 'mieter_buildings',
  'MieterBuildingMember': 'mieter_building_members',
  'CommunityPost': 'community_posts',
  'CommunityComment': 'community_comments',
  'CommunityLike': 'community_likes',
  'PackageNotification': 'package_notifications',
  'MeterReading': 'meter_readings',
  'Message': 'messages',
  'LetterOrder': 'letter_orders',
  'SchufaOrder': 'schufa_orders',
  'MietrechtChat': 'mietrecht_chats',
};

export default function AdminDataSync() {
  const [syncConfigs, setSyncConfigs] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configs, logs] = await Promise.all([
        base44.entities.SyncConfig.list('-updated_date', 100),
        base44.entities.SyncLog.list('-created_date', 200),
      ]);

      setSyncConfigs(configs || []);
      setSyncLogs(logs || []);

      // Initialize configs if empty
      if (!configs || configs.length === 0) {
        await initializeSyncConfigs();
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Daten');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSyncConfigs = async () => {
    const configsToCreate = Object.entries(ENTITY_TABLE_MAP).map(([entity, table]) => ({
      entity_name: entity,
      supabase_table: table,
      sync_enabled: true,
      sync_direction: 'both',
      auto_sync: false,
      sync_interval_minutes: 60,
    }));

    try {
      await base44.entities.SyncConfig.bulkCreate(configsToCreate);
      await loadData();
      toast.success('Sync-Konfigurationen initialisiert');
    } catch (error) {
      toast.error('Fehler beim Initialisieren');
      console.error(error);
    }
  };

  const updateConfig = async (configId, updates) => {
    try {
      await base44.entities.SyncConfig.update(configId, updates);
      await loadData();
      toast.success('Konfiguration aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
      console.error(error);
    }
  };

  const triggerSync = async (config, direction) => {
    setSyncing(prev => ({ ...prev, [config.id]: true }));
    try {
      if (direction === 'supabase_to_base44') {
        await base44.functions.invoke('syncFromSupabase', { 
          table_name: config.supabase_table 
        });
      } else {
        // Trigger Base44 to Supabase sync
        const entities = await base44.entities[config.entity_name].list();
        for (const entity of entities) {
          await base44.functions.invoke('syncSupabaseEntity', {
            entity_name: config.entity_name,
            entity_id: entity.id,
            operation: 'update',
            data: entity,
          });
        }
      }
      
      await updateConfig(config.id, {
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
      });
      
      toast.success(`Synchronisation gestartet: ${config.entity_name}`);
      await loadData();
    } catch (error) {
      await updateConfig(config.id, {
        last_sync_status: 'failed',
        error_count: (config.error_count || 0) + 1,
      });
      toast.error('Synchronisation fehlgeschlagen');
      console.error(error);
    } finally {
      setSyncing(prev => ({ ...prev, [config.id]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: { variant: 'default', icon: CheckCircle, text: 'Erfolg' },
      failed: { variant: 'destructive', icon: AlertCircle, text: 'Fehler' },
      partial: { variant: 'secondary', icon: Clock, text: 'Teilweise' },
    };
    const config = variants[status] || variants.success;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const filteredLogs = syncLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'errors') return log.status === 'failed';
    return log.sync_direction === filter;
  });

  const stats = {
    total: syncLogs.length,
    success: syncLogs.filter(l => l.status === 'success').length,
    failed: syncLogs.filter(l => l.status === 'failed').length,
    avgDuration: syncLogs.length > 0 
      ? Math.round(syncLogs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / syncLogs.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Daten-Synchronisation</h1>
        <p className="text-gray-600">
          Verwalte die bidirektionale Synchronisation zwischen Supabase und Base44
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Gesamt Syncs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-gray-600">Erfolgreich</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Fehler</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.avgDuration}ms</div>
            <div className="text-sm text-gray-600">Ø Dauer</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="configs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configs">Konfigurationen</TabsTrigger>
          <TabsTrigger value="logs">Sync-Protokoll</TabsTrigger>
        </TabsList>

        {/* Configurations Tab */}
        <TabsContent value="configs" className="space-y-4">
          {syncConfigs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{config.entity_name}</CardTitle>
                    <CardDescription>
                      Supabase Tabelle: {config.supabase_table}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {config.last_sync_status && getStatusBadge(config.last_sync_status)}
                    <Switch
                      checked={config.sync_enabled}
                      onCheckedChange={(checked) => 
                        updateConfig(config.id, { sync_enabled: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sync-Richtung</label>
                    <Select
                      value={config.sync_direction}
                      onValueChange={(value) => 
                        updateConfig(config.id, { sync_direction: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Bidirektional</SelectItem>
                        <SelectItem value="supabase_to_base44">Supabase → Base44</SelectItem>
                        <SelectItem value="base44_to_supabase">Base44 → Supabase</SelectItem>
                        <SelectItem value="disabled">Deaktiviert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Intervall (Minuten)</label>
                    <Select
                      value={String(config.sync_interval_minutes)}
                      onValueChange={(value) => 
                        updateConfig(config.id, { sync_interval_minutes: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Min</SelectItem>
                        <SelectItem value="30">30 Min</SelectItem>
                        <SelectItem value="60">1 Stunde</SelectItem>
                        <SelectItem value="360">6 Stunden</SelectItem>
                        <SelectItem value="1440">24 Stunden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Letzter Sync</label>
                    <div className="text-sm text-gray-600">
                      {config.last_sync_at 
                        ? new Date(config.last_sync_at).toLocaleString('de-DE')
                        : 'Noch nie'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!config.sync_enabled || syncing[config.id] || 
                      config.sync_direction === 'base44_to_supabase' ||
                      config.sync_direction === 'disabled'}
                    onClick={() => triggerSync(config, 'supabase_to_base44')}
                  >
                    {syncing[config.id] ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                    Supabase → Base44
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!config.sync_enabled || syncing[config.id] ||
                      config.sync_direction === 'supabase_to_base44' ||
                      config.sync_direction === 'disabled'}
                    onClick={() => triggerSync(config, 'base44_to_supabase')}
                  >
                    {syncing[config.id] ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRightLeft className="w-4 h-4" />
                    )}
                    Base44 → Supabase
                  </Button>
                </div>

                {config.error_count > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
                    {config.error_count} Fehler seit letztem erfolgreichen Sync
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Logs</SelectItem>
                <SelectItem value="errors">Nur Fehler</SelectItem>
                <SelectItem value="supabase_to_base44">Supabase → Base44</SelectItem>
                <SelectItem value="base44_to_supabase">Base44 → Supabase</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
          </div>

          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{log.entity_name}</Badge>
                        <Badge variant="secondary">{log.operation}</Badge>
                        {log.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Richtung: {log.sync_direction === 'supabase_to_base44' ? 'Supabase → Base44' : 'Base44 → Supabase'}
                        {' • '}
                        {new Date(log.created_date).toLocaleString('de-DE')}
                        {log.duration_ms && ` • ${log.duration_ms}ms`}
                      </div>
                      {log.error_message && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
                          {log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredLogs.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Keine Sync-Protokolle gefunden
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}