import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SmartQuickAccess() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('nav_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nav_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (page, label, icon) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.page === page);
      if (exists) {
        return prev.filter(f => f.page !== page);
      }
      return [...prev, { page, label, icon }];
    });
  };

  const removeFavorite = (page) => {
    setFavorites(prev => prev.filter(f => f.page !== page));
  };

  if (favorites.length === 0) return null;

  return (
    <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          Schnellzugriff
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {favorites.map(fav => (
            <Link key={fav.page} to={createPageUrl(fav.page)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-white/50 dark:hover:bg-white/10 transition-all group relative"
                title={fav.label}
              >
                <span className="text-lg">{fav.icon}</span>
                <span className="text-xs truncate ml-1">{fav.label}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFavorite(fav.page);
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
                </button>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function useQuickAccessToggle() {
  const isFavorite = (page) => {
    const saved = localStorage.getItem('nav_favorites');
    const favorites = saved ? JSON.parse(saved) : [];
    return favorites.some(f => f.page === page);
  };

  return isFavorite;
}