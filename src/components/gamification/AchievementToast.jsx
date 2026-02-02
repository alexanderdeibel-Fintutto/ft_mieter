import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function AchievementToast({ achievement }) {
  useEffect(() => {
    if (achievement) {
      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Show toast
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-2xl max-w-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 fill-white" />
                  <p className="font-bold">Neuer Erfolg!</p>
                </div>
                <p className="text-sm font-semibold">{achievement.title}</p>
                <p className="text-xs text-white/90">{achievement.description}</p>
              </div>
            </div>
          </motion.div>
        ),
        { duration: 5000 }
      );
    }
  }, [achievement]);

  return null;
}

export const ACHIEVEMENTS = {
  first_login: {
    title: 'Willkommen! 🎉',
    description: 'Sie haben sich zum ersten Mal angemeldet',
    points: 10,
  },
  first_message: {
    title: 'Kontaktfreudig',
    description: 'Erste Nachricht an einen Nachbarn gesendet',
    points: 20,
  },
  first_repair: {
    title: 'Aufmerksam',
    description: 'Ersten Mangel gemeldet',
    points: 15,
  },
  community_member: {
    title: 'Nachbar des Monats',
    description: '10 Beiträge in der Community erstellt',
    points: 50,
  },
  document_master: {
    title: 'Organisiert',
    description: '5 Dokumente hochgeladen',
    points: 30,
  },
  payment_pro: {
    title: 'Pünktlich',
    description: '3 Zahlungen rechtzeitig durchgeführt',
    points: 40,
  },
};