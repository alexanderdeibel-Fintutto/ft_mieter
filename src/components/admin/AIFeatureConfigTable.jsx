import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const MODEL_OPTIONS = [
  { value: "claude-sonnet-4-20250514", label: "Sonnet 4", description: "Ausgewogen" },
  { value: "claude-haiku-3-5-20241022", label: "Haiku 3.5", description: "Schnell & günstig" },
  { value: "claude-opus-4-20250514", label: "Opus 4", description: "Höchste Qualität" },
];

const SUBSCRIPTION_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
];

export default function AIFeatureConfigTable() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      loadFeatures();
      loadLastUsage();
  }, []);

  const loadLastUsage = async () => {
      try {
          const logs = await base44.entities.AIUsageLog.list('-created_date', 1000);
          const lastUsageMap = {};

          logs.forEach(log => {
              const feature = log.feature;
              if (!lastUsageMap[feature] || new Date(log.created_date) > new Date(lastUsageMap[feature])) {
                  lastUsageMap[feature] = log.created_date;
              }
          });

          setFeatures(prev => prev.map(f => ({
              ...f,
              last_used: lastUsageMap[f.feature_key] || null
          })));
      } catch (error) {
          console.error('Failed to load last usage:', error);
      }
  };

  async function loadFeatures() {
    try {
      const data = await base44.entities.AIFeatureConfig.list();
      setFeatures(data || []);
    } catch (e) {
      console.error("Failed to load features:", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateFeature(featureId, updates) {
    try {
      await base44.entities.AIFeatureConfig.update(featureId, updates);
      setFeatures(prev => prev.map(f => f.id === featureId ? { ...f, ...updates } : f));
    } catch (e) {
      console.error("Failed to update feature:", e);
    }
  }

  async function saveAll() {
    setSaving(true);
    try {
      for (const feature of features) {
        await base44.entities.AIFeatureConfig.update(feature.id, {
          is_enabled: feature.is_enabled,
          preferred_model: feature.preferred_model,
          max_tokens: feature.max_tokens,
          requires_subscription: feature.requires_subscription,
        });
      }
      alert("Einstellungen gespeichert");
    } catch (e) {
      console.error("Failed to save:", e);
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Lade Features...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🎛️ Feature-Konfiguration
          </CardTitle>
          <Button onClick={saveAll} disabled={saving}>
            {saving ? "Speichern..." : "Alle speichern"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Feature</th>
                <th className="text-center p-2 font-semibold">Aktiv</th>
                <th className="text-left p-2 font-semibold">Modell</th>
                <th className="text-left p-2 font-semibold">Max Tokens</th>
                <th className="text-left p-2 font-semibold">Min. Abo</th>
                <th className="text-left p-2 font-semibold">Letzte Nutzung</th>
              </tr>
            </thead>
            <tbody>
              {features.map(feature => (
                <tr key={feature.id} className="border-b">
                  <td className="p-2">
                    <div className="font-medium">{feature.display_name}</div>
                    {feature.description && (
                      <div className="text-xs text-muted-foreground mt-1">{feature.description}</div>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <Switch
                      checked={feature.is_enabled}
                      onCheckedChange={(checked) => 
                        setFeatures(prev => prev.map(f => 
                          f.id === feature.id ? { ...f, is_enabled: checked } : f
                        ))
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={feature.preferred_model || "claude-sonnet-4-20250514"}
                      onValueChange={(value) =>
                        setFeatures(prev => prev.map(f =>
                          f.id === feature.id ? { ...f, preferred_model: value } : f
                        ))
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={feature.max_tokens || 1024}
                      onChange={(e) =>
                        setFeatures(prev => prev.map(f =>
                          f.id === feature.id ? { ...f, max_tokens: parseInt(e.target.value) } : f
                        ))
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={feature.requires_subscription || "free"}
                      onValueChange={(value) =>
                        setFeatures(prev => prev.map(f =>
                          f.id === feature.id ? { ...f, requires_subscription: value } : f
                        ))
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBSCRIPTION_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">
                    {feature.last_used 
                      ? new Date(feature.last_used).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Noch nicht genutzt'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}