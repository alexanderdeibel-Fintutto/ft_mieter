import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedGlobalSearch from './EnhancedGlobalSearch';

export default function GlobalSearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative w-full md:w-64 justify-start text-left font-normal"
      >
        <Search className="w-4 h-4 mr-2 shrink-0" />
        <span className="flex-1">Suchen...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <EnhancedGlobalSearch isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}