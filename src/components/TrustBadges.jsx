import React from 'react';
import { Lock, Globe, Zap, Clock } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'SSL verschlüsselt',
      subtitle: 'Sichere Datenübertragung'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Made in Germany',
      subtitle: 'DSGVO-konform'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '100% Kostenlos',
      subtitle: 'Keine versteckten Kosten'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Sofort-Ergebnis',
      subtitle: 'In 30 Sekunden'
    }
  ];

  return (
    <div className="bg-gray-50 border-t border-b border-gray-200 py-3 md:py-6">
      <div className="max-w-6xl mx-auto px-3 md:px-4">
        <div className="grid grid-cols-2 md:flex md:justify-center gap-3 md:gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 md:gap-3">
              <div className="text-green-600 flex-shrink-0 w-5 h-5 md:w-6 md:h-6">{badge.icon}</div>
              <div className="min-w-0">
                <div className="font-semibold text-xs md:text-sm text-gray-900 leading-tight">{badge.title}</div>
                <div className="text-[10px] md:text-xs text-gray-600">{badge.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}