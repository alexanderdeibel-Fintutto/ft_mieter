import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProductionReadyChecklist() {
  const [checklistData, setChecklistData] = useState(null);
  const [deploymentGuide, setDeploymentGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, deployRes] = await Promise.all([
        base44.functions.invoke('productionHealthCheck'),
        base44.functions.invoke('productionDeploymentGuide'),
      ]);
      setChecklistData(healthRes.data.health_check);
      setDeploymentGuide(deployRes.data.deployment_guide);
      toast.success('Checklisten geladen');
    } catch (error) {
      toast.error('Fehler beim Laden der Daten');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!checklistData || !deploymentGuide) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 Production Ready Checklist</h1>
          <p className="text-gray-600">Vollständige Vorbereitung zur Produktionsbereitschaft</p>
        </div>

        {/* Health Status */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Health Status</span>
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Healthy
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(checklistData.results).map(([key, value]) => (
                <div key={key} className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                  <Badge className={value.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {value.status || 'OK'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pre-Deployment Checklist */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pre-Deployment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(deploymentGuide.pre_deployment).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="capitalize">{key.replace(/_/g, ' ')}: {value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Post-Deployment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(deploymentGuide.post_deployment).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="capitalize">{key.replace(/_/g, ' ')}: {value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Deployment Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Deployment Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deploymentGuide.deployment_steps.map((step) => (
                <div key={step.step} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Badge className="bg-blue-100 text-blue-700">{step.step}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.action}</p>
                    <p className="text-xs text-gray-500">{step.duration}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{step.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rollback Plan */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Rollback Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Trigger:</strong> {deploymentGuide.rollback_plan.trigger}</div>
            <div><strong>Rollback Time:</strong> {deploymentGuide.rollback_plan.rollback_time}</div>
            <div><strong>Communication:</strong> {deploymentGuide.rollback_plan.communication}</div>
            <div><strong>Recovery:</strong> {deploymentGuide.rollback_plan.recovery_point}</div>
          </CardContent>
        </Card>

        {/* Success Criteria */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Success Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deploymentGuide.success_criteria.map((criterion, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{criterion}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700" onClick={loadData}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Refresh Checklist
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}