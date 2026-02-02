import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Grid3x3, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NAVIGATION_HUBS, LESS_USED_FEATURES } from './NavigationHubs';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SmartNavigationSystem({ userRole = 'mieter' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const hubs = NAVIGATION_HUBS[userRole] || NAVIGATION_HUBS.mieter;
  const lessUsed = LESS_USED_FEATURES[userRole] || LESS_USED_FEATURES.mieter;

  // Alle Seiten für die Suche sammeln
  const allPages = [
    ...hubs.flatMap(hub => hub.items),
    ...lessUsed
  ];

  const filteredPages = searchQuery
    ? allPages.filter(page =>
        page.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Alle Funktionen"
          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Grid3x3 className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alle Funktionen</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Funktion suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Search Results */}
        {searchQuery && filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredPages.map(page => (
              <Link
                key={page.page}
                to={createPageUrl(page.page)}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <span className="text-lg mr-2">{page.icon}</span>
                  {page.label}
                </Button>
              </Link>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-8 text-gray-500">
            Keine Ergebnisse für "{searchQuery}"
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="more">Mehr</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {hubs.map(hub => (
                <div key={hub.id}>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className="text-lg">{hub.icon}</span>
                    {hub.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hub.items.map(item => (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={() => setOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                        >
                          <span className="text-lg mr-2">{item.icon}</span>
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="more">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lessUsed.map(item => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-lg mr-2">{item.icon}</span>
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}