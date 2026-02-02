import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, Crown, Building, Star } from 'lucide-react';
import { useSubscription } from './hooks';

const TIER_CONFIG = {
  free: { color: 'bg-gray-100 text-gray-700', icon: null, label: 'Free' },
  starter: { color: 'bg-yellow-100 text-yellow-700', icon: Zap, label: 'Starter' },
  basic: { color: 'bg-blue-100 text-blue-700', icon: Sparkles, label: 'Basic' },
  pro: { color: 'bg-violet-100 text-violet-700', icon: Sparkles, label: 'Pro' },
  premium: { color: 'bg-amber-100 text-amber-700', icon: Crown, label: 'Premium' },
  business: { color: 'bg-gray-100 text-gray-700', icon: Building, label: 'Business' },
  bundle: { color: 'bg-orange-100 text-orange-700', icon: Star, label: 'Bundle' }
};

export default function SubscriptionBadge({ showIcon = true, className = "" }) {
  const { tier, hasBundle, loading } = useSubscription();

  if (loading) {
    return <Badge className={`bg-gray-100 text-gray-400 ${className}`}>...</Badge>;
  }

  const displayTier = hasBundle ? 'bundle' : tier;
  const config = TIER_CONFIG[displayTier] || TIER_CONFIG.free;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} ${className}`}>
      {showIcon && Icon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}