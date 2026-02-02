import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../services/supabase';
import { Loader2, Download, Eye, Share2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareAnalyticsDashboard({ documentId }) {
  const [stats, setStats] = useState({
    totalShares: 0,
    totalDownloads: 0,
    totalViews: 0,
    activeShares: 0,
  });
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [documentId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Lade Share-Statistiken
      const { data: shares, error: sharesError } = await supabase
        .from('document_shares')
        .select('id, created_at, expires_at')
        .eq('document_id', documentId);

      if (sharesError) throw sharesError;

      // Lade Audit-Logs
      const { data: audits, error: auditsError } = await supabase
        .from('document_share_audit')
        .select('action, created_at')
        .eq('document_id', documentId);

      if (auditsError) throw auditsError;

      // Berechne Statistiken
      const downloads = audits?.filter(a => a.action === 'downloaded').length || 0;
      const views = audits?.filter(a => a.action === 'viewed').length || 0;
      const active = shares?.filter(s => !s.expires_at || new Date(s.expires_at) > new Date()).length || 0;

      setStats({
        totalShares: shares?.length || 0,
        totalDownloads: downloads,
        totalViews: views,
        activeShares: active,
      });

      // Berechne Trends (letzte 30 Tage)
      const trendData = generateTrendData(audits || []);
      setTrends(trendData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Fehler beim Laden der Analysen');
    }
    setLoading(false);
  };

  const generateTrendData = (audits) => {
    const last30Days = {};
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('de-DE');
      last30Days[dateStr] = { downloads: 0, views: 0 };
    }

    audits.forEach(audit => {
      const dateStr = new Date(audit.created_at).toLocaleDateString('de-DE');
      if (last30Days[dateStr]) {
        if (audit.action === 'downloaded') last30Days[dateStr].downloads++;
        else if (audit.action === 'viewed') last30Days[dateStr].views++;
      }
    });

    return Object.entries(last30Days)
      .map(([date, data]) => ({ date, ...data }))
      .reverse();
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Gesamt Shares</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShares}</p>
              </div>
              <Share2 className="w-8 h-8 text-blue-100 text-opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
              <Download className="w-8 h-8 text-green-100 text-opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Ansichten</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-100 text-opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Aktive Shares</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeShares}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-100 text-opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trends (30 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="downloads" fill="#10b981" />
                <Bar dataKey="views" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}