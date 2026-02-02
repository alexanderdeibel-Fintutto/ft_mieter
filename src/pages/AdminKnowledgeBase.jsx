import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus } from 'lucide-react';

const ARTICLES = [
  { id: 1, title: 'Reparaturantrag stellen', category: 'Repairs', status: 'published', views: 2450, updated: '2026-01-20', lang: 'de' },
  { id: 2, title: 'How to Submit Repair', category: 'Repairs', status: 'published', views: 1280, updated: '2026-01-20', lang: 'en' },
  { id: 3, title: 'Zahlung verwalten', category: 'Billing', status: 'draft', views: 0, updated: '2026-01-22', lang: 'de' },
];

const CATEGORIES = [
  { name: 'Repairs', articles: 5, views: 4250 },
  { name: 'Billing', articles: 3, views: 2180 },
  { name: 'Documents', articles: 4, views: 1890 },
  { name: 'Community', articles: 2, views: 950 },
];

export default function AdminKnowledgeBase() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6" /> Knowledge Base & Help Center
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Artikel erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Neuer Artikel
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Title" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Repairs</option>
              <option>Billing</option>
              <option>Documents</option>
              <option>Community</option>
            </select>
            <textarea placeholder="Content" className="w-full px-3 py-2 border rounded-lg text-sm h-24" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Articles', value: '14', color: 'text-blue-600' },
          { label: 'Monthly Views', value: '9.3K', color: 'text-green-600' },
          { label: 'Categories', value: '4', color: 'text-blue-600' },
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
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ARTICLES.map(article => (
            <div key={article.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{article.title}</h3>
                <Badge className={article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {article.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{article.category}</span>
                <span>{article.lang}</span>
                <span>{article.views} views</span>
                <span>Updated: {article.updated}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Preview</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CATEGORIES.map((cat, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-600">{cat.articles} articles</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{cat.views}</p>
                <p className="text-xs text-gray-600">views</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}