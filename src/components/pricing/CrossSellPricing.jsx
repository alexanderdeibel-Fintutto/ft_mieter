import { useState, useEffect } from 'react';
import { supabase } from '@/components/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function CrossSellPricing({ appId = 'vermietify', onSelectTier }) {
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularTier();
  }, [appId]);

  async function loadPopularTier() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_app_pricing')
        .select('*')
        .eq('app_id', appId)
        .eq('is_popular', true)
        .eq('livemode', true)
        .single();

      if (error) throw error;
      setTier(data);
    } catch (error) {
      console.error('Fehler beim Laden der Cross-Sell Preise:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!tier) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base text-amber-900">
              💡 Sind Sie auch Vermieter?
            </CardTitle>
            <CardDescription className="text-amber-800 mt-1">
              Verwalten Sie Ihre Immobilien professionell mit {tier.app_name}
            </CardDescription>
          </div>
          <Badge className="bg-amber-600 text-white whitespace-nowrap">Cross-Sell</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-amber-900">
          {tier.product_name} ab <span className="font-bold">€{tier.monthly_price?.toFixed(2)}/Monat</span>
        </p>
        <Button
          onClick={() => onSelectTier?.(tier)}
          variant="outline"
          className="w-full gap-2 border-amber-600 text-amber-600 hover:bg-amber-100"
        >
          Erfahren Sie mehr <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}