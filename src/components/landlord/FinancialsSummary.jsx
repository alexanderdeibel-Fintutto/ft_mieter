import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { useLandlordFinancials } from '@/components/hooks/useLandlordData';

export default function FinancialsSummary() {
  const { data: financials = [], isLoading } = useLandlordFinancials();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const totalRent = financials.reduce((sum, f) => sum + (f.total_rent || 0), 0);
  const totalUtilities = financials.reduce((sum, f) => sum + (f.total_utilities || 0), 0);
  const totalCollected = financials.reduce((sum, f) => sum + (f.collected_amount || 0), 0);
  const totalOutstanding = financials.reduce((sum, f) => sum + (f.outstanding_amount || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Gesamtmiete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalRent.toLocaleString('de-DE')}€</p>
          <p className="text-xs text-gray-600 mt-1">pro Monat</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Eingegangen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString('de-DE')}€</p>
          <p className="text-xs text-gray-600 mt-1">diesen Monat</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Ausstehend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{totalOutstanding.toLocaleString('de-DE')}€</p>
          <p className="text-xs text-gray-600 mt-1">offene Beträge</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            Nebenkosten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalUtilities.toLocaleString('de-DE')}€</p>
          <p className="text-xs text-gray-600 mt-1">monatlich</p>
        </CardContent>
      </Card>
    </div>
  );
}