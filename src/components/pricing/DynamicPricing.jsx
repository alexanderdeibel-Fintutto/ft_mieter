import { useState, useEffect } from 'react';
import { supabase } from '@/components/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Star } from 'lucide-react';
import { APP_CONFIG } from '@/components/config/appConfig';
import { initiateCheckout } from './CheckoutHandler';

export default function DynamicPricing({ appId = 'mieterapp', onSelectTier }) {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearly, setYearly] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  useEffect(() => {
    loadPricing();
  }, [appId]);

  async function loadPricing() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_app_pricing')
        .select('*')
        .eq('app_id', appId)
        .eq('livemode', true)
        .order('sort_order');

      if (error) throw error;
      setPricing(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Preise:', error);
      setPricing([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectTier = async (tier) => {
    setSelectedTier(tier.tier);
    const tierData = {
      ...tier,
      priceId: yearly ? tier.yearly_price_id : tier.monthly_price_id,
      billingCycle: yearly ? 'yearly' : 'monthly'
    };
    
    if (onSelectTier) {
      onSelectTier(tierData);
    } else if (tier.tier !== 'free') {
      // Auto-Checkout wenn kein Handler definiert
      try {
        await initiateCheckout(tierData, tierData.billingCycle);
      } catch (error) {
        console.error('Checkout-Fehler:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (pricing.length === 0) {
    return <div className="text-center py-8 text-gray-500">Keine Preise verfügbar</div>;
  }

  const savings = pricing.some(t => t.yearly_price && t.monthly_price)
    ? Math.round(((1 - (pricing[0].yearly_price || 0) / 12 / (pricing[0].monthly_price || 1)) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Toggle Monatlich/Jährlich */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setYearly(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !yearly ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Monatlich
        </button>
        <button
          onClick={() => setYearly(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            yearly ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Jährlich {savings > 0 && <span className="text-xs ml-1">-{savings}%</span>}
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pricing.map((tier) => {
          const price = yearly ? tier.yearly_price : tier.monthly_price;
          const priceId = yearly ? tier.yearly_price_id : tier.monthly_price_id;

          return (
            <Card
              key={tier.tier}
              className={`relative transition-all ${
                tier.is_popular
                  ? 'ring-2 ring-blue-600 md:scale-105'
                  : 'hover:shadow-lg'
              }`}
            >
              {tier.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white gap-1">
                    <Star className="w-3 h-3" /> Beliebt
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg">{tier.product_name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>

                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    €{price?.toFixed(2) || '0,00'}
                  </div>
                  <div className="text-sm text-gray-600">
                    pro {yearly ? 'Jahr' : 'Monat'}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {tier.features && Array.isArray(tier.features) && 
                    tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))
                  }
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectTier(tier)}
                  variant={tier.is_popular ? 'default' : 'outline'}
                  className="w-full"
                  disabled={!priceId}
                >
                  {tier.tier === 'free' ? 'Kostenlos starten' : 'Wählen'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}