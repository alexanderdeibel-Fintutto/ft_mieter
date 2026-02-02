import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HubGrid({ hubs }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('nav_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (page, label, icon) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.page === page);
      if (exists) {
        return prev.filter(f => f.page !== page);
      }
      return [...prev, { page, label, icon }];
    });
    localStorage.setItem('nav_favorites', JSON.stringify(
      favorites.some(f => f.page === page)
        ? favorites.filter(f => f.page !== page)
        : [...favorites, { page, label, icon }]
    ));
  };

  const isFavorited = (page) => favorites.some(f => f.page === page);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
      {hubs.map(hub => (
        <Card key={hub.id} className="hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className={`${hub.color} border-b`}>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{hub.icon}</span>
              {hub.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {hub.items.map(item => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="block"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <span className="flex items-center gap-2 text-left">
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}