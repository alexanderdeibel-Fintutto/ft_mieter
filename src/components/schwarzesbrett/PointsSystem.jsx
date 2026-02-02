import React, { useState } from 'react';
import { Star, Gift, Award, TrendingUp, ChevronRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const REWARDS = [
  { id: 1, title: 'Kaffee-Gutschein', description: 'Ein Kaffee im Gemeinschaftsraum', points: 50, icon: '☕', available: true },
  { id: 2, title: 'Wäsche-Slot', description: 'Bevorzugter Wäscheraum-Termin', points: 100, icon: '🧺', available: true },
  { id: 3, title: 'Gratis Paketannahme', description: '5x kostenlose Paketannahme', points: 150, icon: '📦', available: true },
  { id: 4, title: 'Gemeinschaftsraum', description: '2 Std. Gemeinschaftsraum reservieren', points: 200, icon: '🏠', available: true },
  { id: 5, title: 'Parkplatz-Tag', description: 'Ein Tag Gästeparkplatz', points: 300, icon: '🚗', available: false },
];

const LEVELS = [
  { name: 'Nachbar', minPoints: 0, icon: '🏠' },
  { name: 'Helfer', minPoints: 100, icon: '🤝' },
  { name: 'Engagiert', minPoints: 300, icon: '⭐' },
  { name: 'Held der Nachbarschaft', minPoints: 500, icon: '🦸' },
  { name: 'Legende', minPoints: 1000, icon: '👑' },
];

const POINT_VALUES = {
  help_given: 25,
  help_given_urgent: 50,
  five_star_review: 10,
  first_help: 50,
};

export function getUserLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getNextLevel(points) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (points < LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return null;
}

export function PointsBadge({ points, showLevel = true, size = 'md' }) {
  const level = getUserLevel(points);
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={`bg-amber-100 text-amber-700 ${sizes[size]}`}>
        <Coins className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        {points} Punkte
      </Badge>
      {showLevel && (
        <Badge variant="outline" className={sizes[size]}>
          {level.icon} {level.name}
        </Badge>
      )}
    </div>
  );
}

export function PointsOverview({ points, onOpenRewards }) {
  const level = getUserLevel(points);
  const nextLevel = getNextLevel(points);
  const progress = nextLevel 
    ? ((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100
    : 100;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
            {level.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{level.name}</p>
            <p className="text-xs text-gray-500">{points} Punkte gesammelt</p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onOpenRewards}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <Gift className="w-4 h-4 mr-1" />
          Einlösen
        </Button>
      </div>

      {nextLevel && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{level.name}</span>
            <span>{nextLevel.name} ({nextLevel.minPoints - points} Punkte)</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}

export function RewardsDialog({ open, onOpenChange, userPoints, onRedeem }) {
  const [redeeming, setRedeeming] = useState(null);

  const handleRedeem = async (reward) => {
    if (userPoints < reward.points) {
      toast.error('Nicht genug Punkte');
      return;
    }
    
    setRedeeming(reward.id);
    await new Promise(r => setTimeout(r, 1000));
    onRedeem(reward);
    setRedeeming(null);
    toast.success(`${reward.title} eingelöst! 🎉`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            Belohnungen einlösen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Current Points */}
          <div className="bg-amber-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Dein Guthaben:</span>
            <span className="font-bold text-amber-700 flex items-center gap-1">
              <Coins className="w-4 h-4" />
              {userPoints} Punkte
            </span>
          </div>

          {/* Rewards List */}
          <div className="space-y-3">
            {REWARDS.map(reward => {
              const canAfford = userPoints >= reward.points;
              const isRedeeming = redeeming === reward.id;

              return (
                <div 
                  key={reward.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    canAfford && reward.available 
                      ? 'border-amber-200 bg-white hover:bg-amber-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{reward.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{reward.title}</h4>
                      <p className="text-xs text-gray-500">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-100 text-amber-700 mb-1">
                        {reward.points} P
                      </Badge>
                      <Button
                        size="sm"
                        disabled={!canAfford || !reward.available || isRedeeming}
                        onClick={() => handleRedeem(reward)}
                        className="w-full text-xs"
                      >
                        {isRedeeming ? '...' : canAfford ? 'Einlösen' : 'Zu wenig'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How to earn */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              So sammelst du Punkte
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Hilfe leisten: +{POINT_VALUES.help_given} Punkte</li>
              <li>• Dringende Hilfe: +{POINT_VALUES.help_given_urgent} Punkte</li>
              <li>• 5-Sterne Bewertung erhalten: +{POINT_VALUES.five_star_review} Punkte</li>
              <li>• Erste Hilfe geben: +{POINT_VALUES.first_help} Bonus</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { POINT_VALUES };