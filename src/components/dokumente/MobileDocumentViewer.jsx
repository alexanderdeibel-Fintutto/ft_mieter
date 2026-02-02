import React, { useState } from 'react';
import { Smartphone, Download, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MobileDocumentViewer({ document }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2 md:hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-sm">Mobile Viewer</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Share2 className="w-3 h-3 mr-1" />
              Teilen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}