import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, TrendingUp, Zap, Gift, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WhatsNew() {
  const updates = [
    {
      date: '2026-01-24',
      category: 'Neu',
      title: 'KI-Mietrechtsberatung jetzt 24/7',
      description: 'Stellen Sie jederzeit Fragen zu Ihrem Mietvertrag und erhalten Sie sofort Antworten von unserer KI.',
      icon: Sparkles,
      color: 'green',
      page: 'MietrechtChat',
    },
    {
      date: '2026-01-20',
      category: 'Verbessert',
      title: 'Schnellere Paket-Benachrichtigungen',
      description: 'Sie werden jetzt in Echtzeit benachrichtigt, wenn ein Paket für Sie ankommt.',
      icon: Zap,
      color: 'blue',
      page: 'MieterPackages',
    },
    {
      date: '2026-01-15',
      category: 'Neu',
      title: 'Community-Features erweitert',
      description: 'Neue Gruppenfunktionen und Events machen das Zusammenleben noch schöner.',
      icon: Star,
      color: 'purple',
      page: 'MieterCommunity',
    },
    {
      date: '2026-01-10',
      category: 'Verbesserung',
      title: 'Schnellere Zahlungsabwicklung',
      description: 'Mietzahlungen werden jetzt noch schneller verarbeitet.',
      icon: TrendingUp,
      color: 'orange',
      page: 'MieterFinances',
    },
  ];

  const recommendations = [
    {
      title: 'Probieren Sie die Mietrechtsberatung',
      description: 'Kostenlos und sofort verfügbar',
      icon: '💬',
      page: 'MietrechtChat',
    },
    {
      title: 'Lernen Sie Ihre Nachbarn kennen',
      description: 'In der Community-Sektion',
      icon: '👥',
      page: 'MieterCommunity',
    },
    {
      title: 'Dokumente digital verwalten',
      description: 'Alle wichtigen Unterlagen an einem Ort',
      icon: '📄',
      page: 'Dokumente',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Was ist neu?</h1>
          <p className="text-gray-600">Entdecken Sie neue Funktionen und Verbesserungen</p>
        </motion.div>

        {/* Updates Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Neueste Updates</h2>
          {updates.map((update, idx) => {
            const Icon = update.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 bg-${update.color}-100 rounded-full flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 text-${update.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`bg-${update.color}-100 text-${update.color}-700`}>
                            {update.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{update.date}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{update.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{update.description}</p>
                        <Link to={createPageUrl(update.page)}>
                          <Button variant="outline" size="sm">
                            Ausprobieren <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recommendations */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              Empfehlungen für Sie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, idx) => (
              <Link key={idx} to={createPageUrl(rec.page)}>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{rec.title}</p>
                      <p className="text-sm text-white/80">{rec.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}