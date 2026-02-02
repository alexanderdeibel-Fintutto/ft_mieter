import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeatureAccess } from './hooks';
import UpgradeModal from './UpgradeModal';

export default function FeatureGate({ 
  children, 
  requiredTier = "pro", 
  appId, 
  feature = "diese Funktion",
  showLockIcon = true,
  fallback = null
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { hasAccess, loading, currentTier, requiredTier: reqTier } = useFeatureAccess(requiredTier, appId);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-8">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="relative">
        <div className="filter blur-sm pointer-events-none select-none opacity-40">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
          <div className="text-center max-w-md p-6">
            {showLockIcon && (
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Feature gesperrt
            </h3>
            <p className="text-gray-600 mb-4">
              {feature} erfordert den <span className="font-semibold capitalize">{requiredTier}</span>-Plan
            </p>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Jetzt upgraden
            </Button>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        appId={appId}
        highlightTier={requiredTier}
      />
    </>
  );
}