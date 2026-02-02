import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  message = 'Fehler beim Laden der Daten',
  onRetry,
  className = ''
}) {
  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Ups, ein Fehler ist aufgetreten
        </h3>
        
        <p className="text-sm text-red-700 mb-6 max-w-md">
          {message}
        </p>
        
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-red-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Erneut versuchen
          </Button>
        )}
      </CardContent>
    </Card>
  );
}