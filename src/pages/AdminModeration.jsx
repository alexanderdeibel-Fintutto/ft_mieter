import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Ban, Eye } from 'lucide-react';

const REPORTS = [
  { id: 1, type: 'Inappropriate Content', author: 'Max M.', content: 'Negative comment on bulletin board', status: 'pending', reported: '2026-01-24 14:32' },
  { id: 2, type: 'Spam', author: 'Bot User', content: 'Multiple promotional posts', status: 'pending', reported: '2026-01-24 13:15' },
  { id: 3, type: 'Harassment', author: 'User123', content: 'Offensive message in chat', status: 'resolved', reported: '2026-01-23 10:00' },
];

export default function AdminModeration() {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" /> Content Moderation
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Reports', value: '2', color: 'text-orange-600' },
          { label: 'Resolved', value: '18', color: 'text-green-600' },
          { label: 'Banned Users', value: '3', color: 'text-red-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {REPORTS.map(report => (
          <Card key={report.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{report.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">"{report.content}"</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{report.author}</Badge>
                    <p className="text-xs text-gray-500">{report.reported}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={report.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                    {report.status === 'pending' ? 'Ausstehend' : 'Gelöst'}
                  </Badge>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Eye className="w-3 h-3" /> Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle>Moderation Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Approve</option>
              <option>Reject</option>
              <option>Ban User</option>
              <option>Request More Info</option>
            </select>
            <textarea placeholder="Notes..." rows="3" className="w-full px-3 py-2 border rounded-lg" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>Abbrechen</Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700">Submit Action</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}