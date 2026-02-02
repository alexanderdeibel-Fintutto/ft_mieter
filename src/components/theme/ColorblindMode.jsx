import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORBLIND_MODES = {
  normal: {
    name: 'Normal',
    description: 'Standard Farbpalette',
    style: {}
  },
  deuteranopia: {
    name: 'Deuteranopia (Rot-Grün)',
    description: 'Rot und Grün sind schwer zu unterscheiden',
    style: {
      '--primary': '200 100% 50%',
      '--success': '30 100% 50%',
      '--warning': '48 96% 53%',
      '--destructive': '280 100% 50%'
    }
  },
  protanopia: {
    name: 'Protanopia (Rot-Grün)',
    description: 'Rote Farben erscheinen dunkler',
    style: {
      '--primary': '210 100% 45%',
      '--success': '75 100% 45%',
      '--warning': '45 100% 50%',
      '--destructive': '260 100% 50%'
    }
  },
  tritanopia: {
    name: 'Tritanopia (Blau-Gelb)',
    description: 'Blau und Gelb sind schwer zu unterscheiden',
    style: {
      '--primary': '180 100% 50%',
      '--success': '100 100% 50%',
      '--warning': '300 100% 50%',
      '--destructive': '60 100% 50%'
    }
  },
  monochromacy: {
    name: 'Monochromacy (Vollständig)',
    description: 'Nur Graustufen',
    style: {
      filter: 'grayscale(100%)'
    }
  }
};

export default function ColorblindMode() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'normal';
    return localStorage.getItem('colorblind-mode') || 'normal';
  });

  useEffect(() => {
    localStorage.setItem('colorblind-mode', mode);

    const root = document.documentElement;
    const modeConfig = COLORBLIND_MODES[mode];

    // Apply CSS variables
    Object.entries(modeConfig.style).forEach(([key, value]) => {
      if (key !== 'filter') {
        root.style.setProperty(key, value);
      }
    });

    // Apply filter
    if (modeConfig.style.filter) {
      root.style.filter = modeConfig.style.filter;
    } else {
      root.style.filter = 'none';
    }
  }, [mode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farbsehschwäche-Modus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={mode} onValueChange={setMode}>
          {Object.entries(COLORBLIND_MODES).map(([key, config]) => (
            <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <RadioGroupItem value={key} id={key} />
              <Label htmlFor={key} className="flex-1 cursor-pointer">
                <div>
                  <p className="font-semibold">{config.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {config.description}
                  </p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Test Colors */}
        <div className="mt-6 space-y-2">
          <p className="font-semibold text-sm">Farb-Test:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 bg-primary rounded" />
            <div className="h-12 bg-success rounded" />
            <div className="h-12 bg-warning rounded" />
            <div className="h-12 bg-destructive rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}