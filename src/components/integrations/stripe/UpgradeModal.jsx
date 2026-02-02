import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, Crown, Building, Star, Check, Loader2, X } from 'lucide-react';
import { useSubscription } from './hooks';
import { motion } from 'framer-motion';
import DynamicPricing from '@/components/pricing/DynamicPricing';
import CrossSellPricing from '@/components/pricing/CrossSellPricing';
import { initiateCheckout } from '@/components/pricing/CheckoutHandler';

const TIER_ICONS = {
  starter: Zap,
  basic: Sparkles,
  pro: Sparkles,
  premium: Crown,
  business: Building,
  bundle: Star
};

const TIER_COLORS = {
  starter: 'from-yellow-400 to-orange-500',
  basic: 'from-blue-400 to-cyan-500',
  pro: 'from-violet-500 to-purple-600',
  premium: 'from-amber-400 to-orange-600',
  business: 'from-gray-700 to-gray-900',
  bundle: 'from-orange-500 to-pink-600'
};

export default function UpgradeModal({ isOpen, onClose, appId = 'mieterapp', showCrossSell = true }) {
  const { tier: currentTier, userEmail } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleSelectTier = async (tierData) => {
    if (!userEmail) {
      alert('Bitte melde dich an, um fortzufahren.');
      return;
    }
    setLoading(true);
    try {
      await initiateCheckout(tierData, tierData.billingCycle);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Wähle deinen Plan
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-600 mt-2">Starte noch heute und nutze alle Vorteile</p>
        </DialogHeader>

        <DynamicPricing 
          appId={appId} 
          onSelectTier={handleSelectTier}
          currentTier={currentTier}
        />

        {showCrossSell && (
          <div className="mt-6 px-4">
            <CrossSellPricing 
              appId="vermietify" 
              onSelectTier={handleSelectTier}
            />
          </div>
        )}

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            14 Tage Geld-zurück-Garantie • Jederzeit kündbar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}