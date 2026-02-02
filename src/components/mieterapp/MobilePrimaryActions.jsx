import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus } from 'lucide-react';

export default function MobilePrimaryActions() {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 flex gap-3">
      <Button
        size="lg"
        className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2 h-14 text-base rounded-full shadow-lg"
      >
        <DollarSign className="h-5 w-5" />
        Zahlen
      </Button>
      <Button
        size="lg"
        className="flex-1 bg-green-600 hover:bg-green-700 gap-2 h-14 text-base rounded-full shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Melden
      </Button>
    </div>
  );
}