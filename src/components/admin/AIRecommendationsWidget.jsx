import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, X, CheckCircle, RefreshCw } from 'lucide-react';

export default function AIRecommendationsWidget() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const recs = await base44.entities.AIRecommendation.filter({
        is_dismissed: false,
        is_implemented: false
      });
      setRecommendations(recs.slice(0, 3)); // Top 3
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNew = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('generateAIRecommendations');
      loadRecommendations();
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = async (id) => {
    try {
      await base44.entities.AIRecommendation.update(id, { is_dismissed: true });
      loadRecommendations();
    } catch (error) {
      console.error('Failed to dismiss:', error);
    }
  };

  const markImplemented = async (id) => {
    try {
      await base44.entities.AIRecommendation.update(id, { is_implemented: true });
      loadRecommendations();
    } catch (error) {
      console.error('Failed to mark:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Lade Empfehlungen...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI-Empfehlungen
          </CardTitle>
          <Button variant="outline" size="sm" onClick={generateNew}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Neu generieren
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Keine aktiven Empfehlungen
          </div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    {rec.potential_savings_eur > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        💰 {rec.potential_savings_eur.toFixed(2)}€ sparen
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  
                  {rec.action_items && rec.action_items.length > 0 && (
                    <ul className="mt-2 text-sm space-y-1">
                      {rec.action_items.map((item, i) => (
                        <li key={i} className="text-gray-700">→ {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markImplemented(rec.id)}
                    title="Als umgesetzt markieren"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismiss(rec.id)}
                    title="Ignorieren"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}