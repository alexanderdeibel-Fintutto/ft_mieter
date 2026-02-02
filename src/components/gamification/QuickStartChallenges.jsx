import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuickStartChallenges() {
  const [completedChallenges, setCompletedChallenges] = useState([]);

  const challenges = [
    {
      id: 'profile_complete',
      title: 'Profil vervollständigen',
      description: 'Fügen Sie Ihre persönlichen Informationen hinzu',
      points: 10,
      page: 'Settings',
    },
    {
      id: 'first_chat',
      title: 'Erste Frage stellen',
      description: 'Nutzen Sie die Mietrechtsberatung',
      points: 20,
      page: 'MietrechtChat',
    },
    {
      id: 'join_community',
      title: 'Community beitreten',
      description: 'Vernetzen Sie sich mit Ihren Nachbarn',
      points: 15,
      page: 'MieterCommunity',
    },
    {
      id: 'upload_document',
      title: 'Erstes Dokument hochladen',
      description: 'Laden Sie einen Mietvertrag oder andere Dokumente hoch',
      points: 15,
      page: 'Dokumente',
    },
    {
      id: 'report_repair',
      title: 'Mangel melden',
      description: 'Melden Sie Ihre erste Reparatur',
      points: 20,
      page: 'MieterRepairs',
    },
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completed_challenges') || '[]');
    setCompletedChallenges(saved);
  }, []);

  const completeChallenge = (id) => {
    if (!completedChallenges.includes(id)) {
      const updated = [...completedChallenges, id];
      setCompletedChallenges(updated);
      localStorage.setItem('completed_challenges', JSON.stringify(updated));
    }
  };

  const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);
  const earnedPoints = challenges
    .filter((c) => completedChallenges.includes(c.id))
    .reduce((sum, c) => sum + c.points, 0);
  const progress = (earnedPoints / totalPoints) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Schnellstart-Challenges
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fortschritt</span>
            <span className="font-semibold">{earnedPoints} / {totalPoints} Punkte</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge, idx) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          const isLocked = idx > 0 && !completedChallenges.includes(challenges[idx - 1].id);

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                className={`p-4 rounded-lg border-2 ${
                  isCompleted
                    ? 'bg-green-50 border-green-500'
                    : isLocked
                      ? 'bg-gray-50 border-gray-300 opacity-60'
                      : 'bg-white border-gray-200 hover:border-blue-500'
                } transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-green-500'
                        : isLocked
                          ? 'bg-gray-300'
                          : 'bg-blue-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                      <Badge variant={isCompleted ? 'default' : 'outline'}>
                        {challenge.points} XP
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                    {!isCompleted && !isLocked && (
                      <Link to={createPageUrl(challenge.page)}>
                        <Button size="sm" variant="outline">
                          Jetzt starten
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}