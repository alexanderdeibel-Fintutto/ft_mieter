import React, { useState, useEffect } from 'react';
import { searchMessages } from '../services/messagingAdvanced';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

export function MessageSearch({ conversationId, onSelectMessage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        const messages = await searchMessages(query, {
          conversationId,
          limit: 10
        });
        setResults(messages);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, conversationId]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <Input
          type="text"
          placeholder="Nachrichten durchsuchen..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          className="flex-1"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
          {results.map((message) => (
            <button
              key={message.id}
              onClick={() => {
                onSelectMessage?.(message);
                setShowResults(false);
                setQuery('');
              }}
              className="w-full text-left p-3 border-b hover:bg-gray-50 transition"
            >
              <p className="text-sm text-gray-600">{message.sender_name}</p>
              <p className="text-sm truncate">{message.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(message.created_at).toLocaleString('de-DE')}
              </p>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm text-gray-500">Keine Nachrichten gefunden</p>
        </div>
      )}
    </div>
  );
}