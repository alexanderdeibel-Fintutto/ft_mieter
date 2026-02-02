import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoTutorials() {
  const [watchedVideos, setWatchedVideos] = useState([]);

  const tutorials = [
    {
      id: 'intro',
      title: 'Willkommen bei FinTuttO',
      duration: '2:30',
      thumbnail: '🏠',
      category: 'Erste Schritte',
      description: 'Eine kurze Einführung in die wichtigsten Funktionen',
    },
    {
      id: 'mietrecht',
      title: 'Mietrechtsberatung nutzen',
      duration: '3:45',
      thumbnail: '💬',
      category: 'Mietrecht',
      description: 'So stellen Sie Fragen und erhalten Antworten',
    },
    {
      id: 'repairs',
      title: 'Mängel melden',
      duration: '2:15',
      thumbnail: '🔧',
      category: 'Reparaturen',
      description: 'Schritt-für-Schritt Anleitung mit Fotos',
    },
    {
      id: 'community',
      title: 'Community kennenlernen',
      duration: '4:00',
      thumbnail: '👥',
      category: 'Community',
      description: 'Nachbarn finden und sich austauschen',
    },
    {
      id: 'payments',
      title: 'Zahlungen verwalten',
      duration: '3:20',
      thumbnail: '💰',
      category: 'Finanzen',
      description: 'Miete zahlen und Übersicht behalten',
    },
  ];

  const handleWatch = (videoId) => {
    if (!watchedVideos.includes(videoId)) {
      setWatchedVideos([...watchedVideos, videoId]);
      localStorage.setItem('watched_tutorials', JSON.stringify([...watchedVideos, videoId]));
    }
  };

  const categories = [...new Set(tutorials.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Video-Tutorials</h2>
        <p className="text-gray-600">Lernen Sie die App in kurzen Videos kennen</p>
      </div>

      {categories.map((category, catIdx) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {tutorials
              .filter(t => t.category === category)
              .map((tutorial, idx) => {
                const isWatched = watchedVideos.includes(tutorial.id);
                return (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (catIdx * 2 + idx) * 0.1 }}
                  >
                    <Card className={`hover:shadow-lg transition-all ${isWatched ? 'border-green-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-4xl">{tutorial.thumbnail}</span>
                            {!isWatched && (
                              <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                <Play className="w-8 h-8 text-white" />
                              </div>
                            )}
                            {isWatched && (
                              <div className="absolute top-1 right-1">
                                <CheckCircle className="w-5 h-5 text-green-400" fill="currentColor" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {tutorial.category}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tutorial.duration}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{tutorial.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                            <Button
                              size="sm"
                              variant={isWatched ? 'outline' : 'default'}
                              onClick={() => handleWatch(tutorial.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {isWatched ? 'Erneut ansehen' : 'Ansehen'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}