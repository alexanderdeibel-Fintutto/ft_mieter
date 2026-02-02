import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Search, BookOpen, MessageCircle, Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuickHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const helpTopics = [
    {
      icon: MessageCircle,
      title: 'Wie nutze ich die Mietrechtsberatung?',
      description: 'Klicken Sie auf "Mietrecht" und stellen Sie Ihre Frage',
      category: 'Mietrecht',
    },
    {
      icon: BookOpen,
      title: 'Wie melde ich einen Mangel?',
      description: 'Gehen Sie zu "Reparaturen" und klicken Sie auf "Mangel melden"',
      category: 'Reparaturen',
    },
    {
      icon: Video,
      title: 'Wie lade ich Dokumente hoch?',
      description: 'Unter "Dokumente" können Sie Dateien hochladen',
      category: 'Dokumente',
    },
    {
      icon: Phone,
      title: 'Wie kontaktiere ich meinen Vermieter?',
      description: 'Nutzen Sie die Nachrichten-Funktion',
      category: 'Kommunikation',
    },
  ];

  const filteredTopics = helpTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-4 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Hilfe & Support</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Wonach suchen Sie?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Häufige Fragen</h3>
                  {filteredTopics.map((topic, idx) => {
                    const Icon = topic.icon;
                    return (
                      <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{topic.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Video Tutorials */}
                <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Video-Tutorials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/90 mb-3">
                      Lernen Sie die App in kurzen Videos kennen
                    </p>
                    <Button className="bg-white text-purple-600 hover:bg-gray-100 w-full">
                      Videos ansehen
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Support kontaktieren
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Unser Team hilft Ihnen gerne weiter
                    </p>
                    <Button variant="outline" className="w-full">
                      Chat starten
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}