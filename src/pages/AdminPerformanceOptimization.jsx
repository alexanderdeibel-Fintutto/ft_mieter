import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertCircle } from 'lucide-react';

const RECOMMENDATIONS = [
  { id: 1, title: 'Enable Query Caching', impact: 'High', effort: 'Low', savings: '~35% latency', status: 'recommended' },
  { id: 2, title: 'Optimize Database Indexes', impact: 'High', effort: 'Medium', savings: '~28% latency', status: 'recommended' },
  { id: 3, title: 'Compress API Responses', impact: 'Medium', effort: 'Low', savings: '~15% bandwidth', status: 'implemented' },
  { id: 4, title: 'Implement CDN', impact: 'High', effort: 'High', savings: '~40% bandwidth', status: 'planned' },
];

const METRICS = [
  { name: 'Average Response Time', current: '52ms', baseline: '45ms', trend: '↑ +7ms', status: 'warning' },
  { name: 'P99 Latency', current: '285ms', baseline: '250ms', trend: '↑ +35ms', status: 'warning' },
  { name: 'Database Query Time', current: '12ms', baseline: '10ms', trend: '↑ +2ms', status: 'ok' },
  { name: 'Cache Hit Rate', current: '78%', baseline: '85%', trend: '↓ -7%', status: 'warning' },
];

export default function AdminPerformanceOptimization() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-6 h-6" /> Performance Optimization
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Potential Improvement', value: '~40%', color: 'text-blue-600' },
          { label: 'Estimated Cost Savings', value: '~€8.4K/mo', color: 'text-green-600' },
          { label: 'Quick Wins', value: '3', color: 'text-yellow-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <AlertCircle className="w-5 h-5" /> Performance Warnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-yellow-800">
          <p>• Response time increased 15% over last 7 days</p>
          <p>• Database queries approaching performance threshold</p>
          <p>• Cache hit rate declined - consider optimization</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {METRICS.map((metric, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${metric.status === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{metric.name}</h3>
                <Badge className={metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                  {metric.status === 'warning' ? '⚠ Warning' : '✓ OK'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Current: <strong>{metric.current}</strong></span>
                <span>Baseline: {metric.baseline}</span>
                <span className={metric.trend.startsWith('↑') ? 'text-red-600' : 'text-green-600'}>{metric.trend}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECOMMENDATIONS.map(rec => (
            <div key={rec.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{rec.title}</h3>
                <Badge className={
                  rec.status === 'recommended' ? 'bg-blue-100 text-blue-800' :
                  rec.status === 'implemented' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }>
                  {rec.status === 'recommended' ? 'Recommended' : rec.status === 'implemented' ? 'Implemented' : 'Planned'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Impact: <strong>{rec.impact}</strong></span>
                <span>Effort: <strong>{rec.effort}</strong></span>
                <span className="text-green-600 font-semibold">{rec.savings}</span>
              </div>
              {rec.status === 'recommended' && (
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">Implement</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}