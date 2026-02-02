import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from './hooks';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function SuccessPage() {
  const { refresh, tier, loading } = useSubscription();
  const [confettiShown, setConfettiShown] = useState(false);

  useEffect(() => {
    refresh();

    // Confetti animation
    if (!confettiShown && typeof window !== 'undefined' && window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setConfettiShown(true);
    }
  }, [refresh, confettiShown]);

  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const appId = urlParams.get('app_id');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Aktiviere dein Abo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Willkommen bei {tier.charAt(0).toUpperCase() + tier.slice(1)}!
        </h1>

        <p className="text-gray-600 mb-8">
          Dein Abo wurde erfolgreich aktiviert. Du hast jetzt Zugriff auf alle Premium-Features!
        </p>

        <div className="space-y-3">
          <Link to={createPageUrl('Home')}>
            <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
              Zur App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link to={createPageUrl('Settings')}>
            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Abo-Einstellungen
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-500">
            Session ID: {sessionId?.slice(0, 20)}...
          </p>
        </div>
      </motion.div>
    </div>
  );
}