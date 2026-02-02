import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import SmartTooltip from '../onboarding/SmartTooltip';
import { Star } from 'lucide-react';

export default function AITopFeaturesTable() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopFeatures();
  }, []);

  const loadTopFeatures = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const logs = await base44.entities.AIUsageLog.filter({
        created_date: { $gte: startOfMonth.toISOString() },
        success: true
      });

      // Gruppiere nach Feature
      const featureData = {};
      logs.forEach(log => {
        const feature = log.feature || 'unknown';
        if (!featureData[feature]) {
          featureData[feature] = { feature, cost: 0, requests: 0 };
        }
        featureData[feature].cost += log.cost_eur || 0;
        featureData[feature].requests += 1;
      });

      // Top 5 nach Kosten
      const topFeatures = Object.values(featureData)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5)
        .map(item => ({
          ...item,
          cost: Math.round(item.cost * 100) / 100,
          avgCost: Math.round((item.cost / item.requests) * 10000) / 10000
        }));

      setFeatures(topFeatures);
    } catch (error) {
      console.error('Failed to load top features:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureName = (key) => {
    const names = {
      chat: 'Mietrecht Chat',
      ocr: 'Zählerstand-Erkennung',
      analysis: 'Dokument-Analyse',
      categorization: 'Kategorisierung'
    };
    return names[key] || key;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Lade Top Features...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <SmartTooltip
      elementId="top_features_table"
      title="Top Features nach Kosten"
      content="Die teuersten Features diesen Monat. Nutzen Sie diese Informationen zur Kostenoptimierung und Budget-Planung."
      tips={[
        'Features mit hohem Durchschnittspreis könnten mit günstigeren Modellen arbeiten',
        'Vergleichen Sie Anfragemengen mit Kosten'
      ]}
      isNew={true}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Top 5 AI-Features (diesen Monat)
          </CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead className="text-right">Anfragen</TableHead>
              <TableHead className="text-right">Kosten</TableHead>
              <TableHead className="text-right">Ø pro Anfrage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Keine Daten verfügbar
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature, index) => (
                <TableRow key={feature.feature}>
                  <TableCell className="flex items-center gap-2">
                    {index === 0 && <Badge variant="secondary">🥇</Badge>}
                    {index === 1 && <Badge variant="secondary">🥈</Badge>}
                    {index === 2 && <Badge variant="secondary">🥉</Badge>}
                    {getFeatureName(feature.feature)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {feature.requests}
                  </TableCell>
                  <TableCell className="text-right font-medium text-blue-600">
                    {feature.cost.toFixed(2)}€
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {feature.avgCost.toFixed(4)}€
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
    </SmartTooltip>
  );
}