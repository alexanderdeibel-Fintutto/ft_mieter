import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IncomingRequests({ requests, onAccept, onDecline, onChat }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Keine offenen Anfragen</p>
        <p className="text-sm mt-1">Hier erscheinen Buchungsanfragen für deine Hilfsangebote</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map(request => {
        const isPending = request.status === 'pending';
        
        return (
          <div key={request.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                {request.requesterName?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{request.requesterName}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isPending ? 'bg-yellow-100 text-yellow-700' : 
                    request.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {isPending ? 'Neu' : request.status === 'confirmed' ? 'Bestätigt' : 'Abgelehnt'}
                  </span>
                </div>
                <p className="text-sm text-violet-600 font-medium">{request.serviceTitle}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(request.date).toLocaleDateString('de-DE', { 
                      weekday: 'short', day: 'numeric', month: 'short' 
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {request.time} Uhr
                  </span>
                </div>
                {request.message && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2 italic">
                    "{request.message}"
                  </p>
                )}
              </div>
            </div>

            {isPending && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button 
                  onClick={() => onAccept(request)}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Annehmen
                </Button>
                <Button 
                  onClick={() => onDecline(request)}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Ablehnen
                </Button>
                <Button 
                  onClick={() => onChat(request)}
                  size="icon"
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}