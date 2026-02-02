import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus } from 'lucide-react';

const PENDING = [
  { id: 1, content: 'Repair request from user', type: 'repair', author: 'john@example.de', submitted: '2026-01-24 14:30', flagged: 'spam' },
  { id: 2, content: 'Community post about parking', type: 'post', author: 'alice@example.de', submitted: '2026-01-24 13:15', flagged: 'inappropriate' },
];

const RULES = [
  { id: 1, pattern: 'forbidden_words', action: 'auto_reject', status: 'active', matches: 42 },
  { id: 2, pattern: 'email_pattern', action: 'flag', status: 'active', matches: 128 },
  { id: 3, pattern: 'phone_pattern', action: 'flag', status: 'active', matches: 95 },
];

export default function AdminContentModeration() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Eye className="w-6 h-6" /> Content Moderation & Safety
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4" /> Regel hinzufügen
        </Button>
      </div>

      {showNew && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Moderationsregel
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Pattern/Keyword" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Auto Reject</option>
              <option>Flag for Review</option>
              <option>Warn Author</option>
              <option>Quarantine</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: '2', color: 'text-orange-600' },
          { label: 'Auto Rejected', value: '42', color: 'text-red-600' },
          { label: 'Moderation Rules', value: '3', color: 'text-blue-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PENDING.map(item => (
            <div key={item.id} className="p-3 border-l-4 border-orange-400 bg-orange-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{item.content}</h3>
                <Badge className="bg-orange-100 text-orange-800">{item.flagged}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{item.type} • {item.author}</span>
                <span>{item.submitted}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">View</Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">Approve</Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">Reject</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moderation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RULES.map(rule => (
            <div key={rule.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 font-mono text-sm">{rule.pattern}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {rule.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Action: <strong>{rule.action}</strong></span>
                <span>{rule.matches} matches</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Disable</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}