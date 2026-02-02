import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Lock, MoreVertical, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DocumentCard({ document, onShare, onDelete, onDownload }) {
  const getCategoryColor = (category) => {
    const colors = {
      contract: 'bg-blue-100 text-blue-800',
      invoice: 'bg-green-100 text-green-800',
      insurance: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      permit: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  return (
    <Card className="hover:shadow-lg transition">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <FileText size={24} className="text-gray-400 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm truncate">{document.file_name}</h3>
              <p className="text-xs text-gray-500">{formatDate(document.created_date)}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload(document)}>
                <Download size={14} className="mr-2" />
                Herunterladen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(document)}>
                <Share2 size={14} className="mr-2" />
                Teilen
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(document.id)}
                className="text-red-600"
              >
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={getCategoryColor(document.category)}>
            {document.category}
          </Badge>

          {document.is_public && (
            <Badge variant="secondary" className="text-xs">
              Öffentlich
            </Badge>
          )}

          {!document.is_public && (
            <Badge variant="outline" className="text-xs gap-1">
              <Lock size={12} />
              Privat
            </Badge>
          )}

          {document.tags && document.tags.length > 0 && (
            <div className="text-xs text-gray-500">
              {document.tags.slice(0, 2).map(tag => (
                <span key={tag} className="ml-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}