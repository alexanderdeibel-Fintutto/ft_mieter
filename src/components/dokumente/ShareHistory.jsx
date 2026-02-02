import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Eye, MoreVertical, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareHistory() {
  const [shares, setShares] = useState([]);
  const [activeTab, setActiveTab] = useState('outgoing');

  // Mock data
  const mockShares = [
    {
      id: 1,
      file: 'Mietvertrag_2025.pdf',
      sharedWith: 'landlord@example.com',
      date: new Date(Date.now() - 86400000),
      accessLevel: 'view',
      status: 'active',
      views: 3,
    },
    {
      id: 2,
      file: 'Nebenkosten_Abrechnung.pdf',
      sharedWith: 'tenant@example.com',
      date: new Date(Date.now() - 604800000),
      accessLevel: 'download',
      status: 'expired',
      views: 12,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outgoing">Geteilt von mir</TabsTrigger>
            <TabsTrigger value="incoming">Mit mir geteilt</TabsTrigger>
          </TabsList>

          <TabsContent value="outgoing" className="space-y-3 mt-4">
            {mockShares.map(share => (
              <div key={share.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{share.file}</p>
                    <p className="text-xs text-gray-600">{share.sharedWith}</p>
                  </div>
                  <Badge className={getStatusColor(share.status)} variant="outline">
                    {share.status === 'active' ? '✓ Aktiv' : 'Abgelaufen'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{share.date.toLocaleDateString('de-DE')}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {share.views}
                    </span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="incoming" className="space-y-3 mt-4">
            <p className="text-sm text-gray-600 text-center py-4">Keine Dokumente mit dir geteilt</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}