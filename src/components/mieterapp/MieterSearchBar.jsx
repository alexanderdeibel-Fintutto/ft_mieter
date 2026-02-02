import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function MieterSearchBar({ 
  items, 
  searchFields, 
  onResults,
  placeholder = 'Suchen...' 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      onResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = items.filter(item => {
      return searchFields.some(field => {
        const value = String(item[field]).toLowerCase();
        return value.includes(lowerQuery);
      });
    });

    setResults(filtered);
    onResults(filtered);
  }, [query, items, searchFields]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    onResults([]);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {results.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0"
            >
              <p className="text-sm font-medium">{item.title || item.name}</p>
              <p className="text-xs text-gray-500">{item.description || item.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}