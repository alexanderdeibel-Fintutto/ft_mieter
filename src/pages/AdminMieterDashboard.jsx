import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Home, MessageSquare, Zap, Settings, Trash2 } from 'lucide-react';

export default function AdminMieterDashboard() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const u = await base44.auth.me();
      if (u?.role !== 'admin') throw new Error('Admin access required');
      return u;
    },
  });

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => base44.entities.MieterBuilding.list(),
  });

  const { data: users } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const { data: posts } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 100),
  });

  const { data: meterReadings } = useQuery({
    queryKey: ['allMeterReadings'],
    queryFn: () => base44.entities.MeterReading.list('-reading_date', 100),
  });

  const { data: messages } = useQuery({
    queryKey: ['allMessages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      totalBuildings: buildings?.length || 0,
      totalUsers: users?.length || 0,
      totalPosts: posts?.length || 0,
      activePosts: posts?.filter((p) => p.status === 'active').length || 0,
      totalReadings: meterReadings?.length || 0,
      verifiedReadings: meterReadings?.filter((r) => r.is_verified).length || 0,
      totalMessages: messages?.length || 0,
      unreadMessages: messages?.filter((m) => !m.is_read).length || 0,
    };
  }, [buildings, users, posts, meterReadings, messages]);

  // Post type distribution
  const postTypeData = React.useMemo(() => {
    const grouped = {};
    posts?.forEach((post) => {
      grouped[post.post_type] = (grouped[post.post_type] || 0) + 1;
    });
    return Object.entries(grouped).map(([type, count]) => ({ type, count }));
  }, [posts]);

  // Meter type distribution
  const meterTypeData = React.useMemo(() => {
    const grouped = {};
    meterReadings?.forEach((reading) => {
      grouped[reading.meter_type] = (grouped[reading.meter_type] || 0) + 1;
    });
    return Object.entries(grouped).map(([type, count]) => ({ type, count }));
  }, [meterReadings]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-red-50 p-8 flex items-center justify-center">
        <Card className="bg-white border-2 border-red-200 max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 font-bold">Zugriff verweigert: Admin-Berechtigungen erforderlich</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-white">MieterApp Admin Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Home className="w-4 h-4" /> Gebäude
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBuildings}</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" /> Nutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.activePosts}</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Zählerstände
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.totalReadings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Beiträge nach Typ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={postTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Zählerstände nach Typ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={meterTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={80}
                    fill="#8b5cf6"
                    dataKey="count"
                  >
                    {meterTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Buildings Management */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Verwaltete Gebäude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {buildings?.map((building) => (
                <div
                  key={building.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{building.name}</p>
                    <p className="text-sm text-gray-600">
                      {building.street} {building.house_number}, {building.zip} {building.city}
                    </p>
                    <Badge className={`mt-2 ${building.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {building.is_verified ? '✓ Verifiziert' : 'Unverified'}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sync Status */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900">Supabase Sync Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-indigo-800">
            <p>✓ UserProfile: {stats.totalUsers} Einträge</p>
            <p>✓ CommunityPost: {stats.totalPosts} Einträge</p>
            <p>✓ MeterReading: {stats.totalReadings} Einträge</p>
            <p>✓ Message: {stats.totalMessages} Einträge</p>
            <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 w-full">
              Force Sync to Supabase
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}