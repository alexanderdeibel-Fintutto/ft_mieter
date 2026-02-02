import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '../services/supabase';
import { Loader2, Eye, Download, Share2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditDashboard({ documentId }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    views: 0,
    downloads: 0,
    shares: 0,
    deletions: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (documentId) {
      loadAuditData();
    }
  }, [documentId]);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const { data: logs, error } = await supabase
        .from('document_share_audit')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      setAuditLogs(logs || []);

      // Berechne Statistiken
      const stats = {
        totalEvents: logs?.length || 0,
        views: logs?.filter(l => l.action === 'viewed').length || 0,
        downloads: logs?.filter(l => l.action === 'downloaded').length || 0,
        shares: logs?.filter(l => l.action === 'shared').length || 0,
        deletions: logs?.filter(l => l.action === 'revoked').length || 0,
      };
      setStats(stats);

      // Generiere Chart-Daten (letzte 30 Tage)
      const chartData = generateChartData(logs || []);
      setChartData(chartData);
    } catch (error) {
      console.error('Error loading audit data:', error);
      toast.error('Fehler beim Laden der Audit-Daten');
    }
    setLoading(false);
  };

  const generateChartData = (logs) => {
    const last30Days = {};
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('de-DE');
      last30Days[dateStr] = { views: 0, downloads: 0, shares: 0 };
    }

    logs.forEach(log => {
      const dateStr = new Date(log.created_at).toLocaleDateString('de-DE');
      if (last30Days[dateStr]) {
        if (log.action === 'viewed') last30Days[dateStr].views++;
        else if (log.action === 'downloaded') last30Days[dateStr].downloads++;
        else if (log.action === 'shared') last30Days[dateStr].shares++;
      }
    });

    return Object.entries(last30Days)
      .map(([date, data]) => ({ date, ...data }))
      .reverse();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'viewed': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'downloaded': return <Download className="w-4 h-4 text-green-600" />;
      case 'shared': return <Share2 className="w-4 h-4 text-purple-600" />;
      case 'revoked': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Eye className="w-8 h-8 text-blue-100 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
                  <p className="text-xs text-gray-500">Ansichten</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Download className="w-8 h-8 text-green-100 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.downloads}</p>
                  <p className="text-xs text-gray-500">Downloads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Share2 className="w-8 h-8 text-purple-100 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.shares}</p>
                  <p className="text-xs text-gray-500">Shares</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Trash2 className="w-8 h-8 text-red-100 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.deletions}</p>
                  <p className="text-xs text-gray-500">Widerrufen</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Letzte Aktivitäten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {auditLogs.slice(0, 20).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {log.action}
                      </p>
                      <p className="text-xs text-gray-600">{log.user_email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Trends (30 Tage)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" />
                    <Bar dataKey="downloads" fill="#10b981" />
                    <Bar dataKey="shares" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Keine Daten verfügbar</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}