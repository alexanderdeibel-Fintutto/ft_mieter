import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Plus } from 'lucide-react';

const FEATURES = [
  { key: 'chat_ai', name: 'AI Chat Assistant', status: 'enabled', rollout: 100, users: 'all' },
  { key: 'advanced_search', name: 'Advanced Search', status: 'enabled', rollout: 80, users: 'beta' },
  { key: 'video_calls', name: 'Video Calls', status: 'disabled', rollout: 0, users: 'none' },
  { key: 'dark_mode', name: 'Dark Mode', status: 'enabled', rollout: 100, users: 'all' },
];

export default function AdminFeatureFlags() {
  const [features, setFeatures] = useState(FEATURES);
  const [showNew, setShowNew] = useState(false);

  const toggleFeature = (key) => {
    setFeatures(features.map(f =>
      f.key === key ? { ...f, status: f.status === 'enabled' ? 'disabled' : 'enabled' } : f
    ));
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6" /> Feature Flags
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neue Flag
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Feature Flag erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Feature Key" className="w-full px-3 py-2 border rounded-lg" />
            <input type="text" placeholder="Feature Name" className="w-full px-3 py-2 border rounded-lg" />
            <div>
              <label className="text-sm font-medium block mb-2">Rollout Percentage</label>
              <input type="range" min="0" max="100" className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {features.map(feature => (
          <Card key={feature.key} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{feature.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{feature.key}</Badge>
                    <Badge className={feature.status === 'enabled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {feature.status === 'enabled' ? '✓ Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {feature.status === 'enabled' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Rollout: {feature.rollout}%</span>
                        <span className="text-gray-500">{feature.users}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-violet-600 h-2 rounded-full"
                          style={{ width: `${feature.rollout}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Switch
                  checked={feature.status === 'enabled'}
                  onCheckedChange={() => toggleFeature(feature.key)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}