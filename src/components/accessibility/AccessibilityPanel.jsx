import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Volume2, Eye, Zap } from 'lucide-react';

export default function AccessibilityPanel() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return {};
    return {
      reducedMotion: localStorage.getItem('reduce-motion') === 'true',
      highContrast: localStorage.getItem('high-contrast') === 'true',
      fontSize: parseInt(localStorage.getItem('font-scale') || '1') * 100,
      screenReader: localStorage.getItem('screen-reader') === 'true'
    };
  });

  useEffect(() => {
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--transition-base', '0ms');
    } else {
      document.documentElement.style.removeProperty('--transition-base');
    }

    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply font scaling
    document.documentElement.style.fontSize = `${settings.fontSize * 0.16}px`;

    // Save settings
    localStorage.setItem('reduce-motion', settings.reducedMotion);
    localStorage.setItem('high-contrast', settings.highContrast);
    localStorage.setItem('font-scale', (settings.fontSize / 100).toString());
    localStorage.setItem('screen-reader', settings.screenReader);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Barrierefreiheit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reduced Motion */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">Bewegungen reduzieren</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Weniger Animationen & Übergänge</p>
            </div>
          </div>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(val) => updateSetting('reducedMotion', val)}
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-sm">Hoher Kontrast</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Bessere Lesbarkeit für Sehschwäche</p>
            </div>
          </div>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(val) => updateSetting('highContrast', val)}
          />
        </div>

        {/* Font Size */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-purple-600" />
            <p className="font-semibold text-sm">Schriftgröße: {settings.fontSize}%</p>
          </div>
          <Slider
            value={[settings.fontSize]}
            onValueChange={(val) => updateSetting('fontSize', val[0])}
            min={80}
            max={150}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Klein</span>
            <span>Normal</span>
            <span>Groß</span>
          </div>
        </div>

        {/* Screen Reader */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-semibold text-sm">Bildschirmlesegerät</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Screen Reader unterstützen</p>
            </div>
          </div>
          <Switch
            checked={settings.screenReader}
            onCheckedChange={(val) => updateSetting('screenReader', val)}
          />
        </div>
      </CardContent>
    </Card>
  );
}