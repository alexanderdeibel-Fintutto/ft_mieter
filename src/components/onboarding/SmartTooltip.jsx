import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export default function SmartTooltip({
  elementId,
  title,
  content,
  tips = [],
  videoUrl = null,
  children,
  isNew = false
}) {
  const [showNew, setShowNew] = useState(isNew);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (showNew) {
      trackTooltipView(elementId);
      // Auto-hide "New" Badge nach 5 Sekunden
      const timer = setTimeout(() => setShowNew(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNew, elementId]);

  const trackTooltipView = async () => {
    try {
      await base44.functions.invoke('trackUserInteraction', {
        interaction_type: 'tooltip_viewed',
        element_id: elementId,
        metadata: { title }
      });
    } catch (error) {
      console.error('Failed to track tooltip:', error);
    }
  };

  const watchVideo = async () => {
    try {
      await base44.functions.invoke('trackUserInteraction', {
        interaction_type: 'tutorial_watched',
        element_id: elementId,
        metadata: { title, video_url: videoUrl }
      });
      if (videoUrl) {
        window.open(videoUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to track video:', error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex" ref={tooltipRef}>
            {children}
            {isNew && showNew && (
              <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full animate-pulse">
                NEU
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs z-50">
          <div className="space-y-2">
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm">{content}</p>

            {tips.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p className="text-xs font-semibold mb-1">💡 Tipps:</p>
                <ul className="text-xs space-y-1">
                  {tips.map((tip, i) => (
                    <li key={i}>→ {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {videoUrl && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <button
                  onClick={watchVideo}
                  className="text-xs text-blue-300 hover:text-blue-200 underline"
                >
                  ▶️ Video ansehen
                </button>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}