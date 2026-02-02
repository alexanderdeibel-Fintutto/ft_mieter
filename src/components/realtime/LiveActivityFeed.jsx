import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, MessageSquare, FileText } from 'lucide-react';

const ACTIVITY_TYPES = {
  'user_login': { icon: Users, label: 'Benutzer angemeldet', color: 'bg-blue-100' },
  'document_upload': { icon: FileText, label: 'Dokument hochgeladen', color: 'bg-green-100' },
  'comment': { icon: MessageSquare, label: 'Kommentar hinzugefügt', color: 'bg-purple-100' },
  'repair_created': { icon: Activity, label: 'Reparatur erstellt', color: 'bg-orange-100' },
};

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState([
    { id: 1, type: 'user_login', user: 'Max M.', time: '2 Min. ago' },
    { id: 2, type: 'document_upload', user: 'Anna S.', time: '5 Min. ago' },
    { id: 3, type: 'repair_created', user: 'Peter W.', time: '12 Min. ago' },
    { id: 4, type: 'comment', user: 'Lisa M.', time: '15 Min. ago' },
  ]);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Activity className="w-5 h-5" /> Live Activity
      </h3>
      
      {activities.map(activity => {
        const typeInfo = ACTIVITY_TYPES[activity.type];
        const Icon = typeInfo?.icon;
        
        return (
          <Card key={activity.id} className="hover:shadow-sm transition-all">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeInfo?.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{typeInfo?.label}</p>
                <p className="text-xs text-gray-600">{activity.user}</p>
              </div>
              <Badge variant="outline" className="text-xs">{activity.time}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}