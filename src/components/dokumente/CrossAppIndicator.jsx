import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const APP_INFO = {
  mieterapp: { name: 'MieterApp', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  vermietify: { name: 'Vermietify', icon: Globe, color: 'bg-purple-100 text-purple-700' },
  hausmeisterapp: { name: 'HausmeisterPro', icon: Zap, color: 'bg-orange-100 text-orange-700' },
  nkrechner: { name: 'NK-Rechner', icon: Building2, color: 'bg-green-100 text-green-700' },
  ftocr: { name: 'FT-OCR', icon: Zap, color: 'bg-red-100 text-red-700' },
};

export default function CrossAppIndicator({ documentId, sharedWithApps = [], sourceApp }) {
  const [visibleApps, setVisibleApps] = useState([]);

  useEffect(() => {
    if (sharedWithApps && sharedWithApps.length > 0) {
      setVisibleApps(sharedWithApps.slice(0, 2));
    }
  }, [sharedWithApps]);

  if (!sourceApp && (!sharedWithApps || sharedWithApps.length === 0)) {
    return null;
  }

  const moreApps = sharedWithApps ? Math.max(0, sharedWithApps.length - 2) : 0;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Source App Badge */}
        {sourceApp && APP_INFO[sourceApp] && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${APP_INFO[sourceApp].color}`}>
                {React.createElement(APP_INFO[sourceApp].icon, { className: 'w-3 h-3' })}
                {APP_INFO[sourceApp].name}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Von {APP_INFO[sourceApp].name} geteilt</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Shared With Apps */}
        {visibleApps.map(app => 
          APP_INFO[app] && (
            <Tooltip key={app}>
              <TooltipTrigger asChild>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${APP_INFO[app].color}`}>
                  {React.createElement(APP_INFO[app].icon, { className: 'w-3 h-3' })}
                  {APP_INFO[app].name}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Geteilt mit {APP_INFO[app].name}</p>
              </TooltipContent>
            </Tooltip>
          )
        )}

        {/* More Apps Indicator */}
        {moreApps > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs">
                +{moreApps}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Weitere {moreApps} Apps</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}