import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from './hooks';
import UpgradeModal from './UpgradeModal';

export default function UpgradeButton({ 
  appId, 
  variant = "default", 
  size = "default", 
  className = "", 
  children 
}) {
  const [showModal, setShowModal] = useState(false);
  const { hasBundle } = useSubscription();

  if (hasBundle) return null;

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        size={size}
        className={`bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white ${className}`}
      >
        <Crown className="w-4 h-4 mr-2" />
        {children || 'Upgrade'}
      </Button>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        appId={appId}
      />
    </>
  );
}