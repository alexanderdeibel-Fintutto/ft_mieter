import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MieterSearchBar from '@/components/mieterapp/MieterSearchBar';
import DataFilter from '@/components/mieterapp/DataFilter';
import EmptyState from '@/components/states/EmptyState';
import { MessageSquare, Archive } from 'lucide-react';

export default function MieterMessagesWithSearch({ messages = [] }) {
  const [searchResults, setSearchResults] = useState(messages);
  const [filters, setFilters] = useState({ status: null });
  const [selectedId, setSelectedId] = useState(null);

  const filteredMessages = useMemo(() => {
    let result = searchResults;

    if (filters.status) {
      result = result.filter(m => {
        if (filters.status === 'unread') return !m.is_read;
        if (filters.status === 'archived') return m.status === 'archived';
        return m.status === filters.status;
      });
    }

    return result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [searchResults, filters]);

  const unreadCount = messages.filter(m => !m.is_read).length;

  const selectedMessage = messages.find(m => m.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Messages List */}
      <div className="lg:col-span-1 space-y-3 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 pb-3 space-y-2">
          <MieterSearchBar
            items={messages}
            searchFields={['subject', 'content']}
            onResults={setSearchResults}
            placeholder="Nachrichten durchsuchen..."
          />
          <div className="flex gap-2">
            <DataFilter
              filters={filters}
              onFilterChange={setFilters}
              statuses={['unread', 'read', 'archived']}
            />
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount} neu</Badge>
            )}
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Keine Nachrichten"
            description="Keine Nachrichten gefunden"
          />
        ) : (
          <div className="space-y-2">
            {filteredMessages.map(message => (
              <Card
                key={message.id}
                onClick={() => setSelectedId(message.id)}
                className={`cursor-pointer transition-all ${
                  selectedId === message.id
                    ? 'ring-2 ring-blue-500 shadow-md'
                    : !message.is_read
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`text-sm font-medium line-clamp-2 ${!message.is_read ? 'font-bold' : ''}`}>
                      {message.subject}
                    </h4>
                    {!message.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(message.created_date).toLocaleDateString('de-DE')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail */}
      <div className="lg:col-span-2">
        {selectedMessage ? (
          <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>{selectedMessage.sender_id}</span>
                  <span>•</span>
                  <span>{new Date(selectedMessage.created_date).toLocaleString('de-DE')}</span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                {selectedMessage.content}
              </div>

              {selectedMessage.attachments && Object.keys(selectedMessage.attachments).length > 0 && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <h3 className="font-semibold mb-3">Anhänge</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedMessage.attachments).map(([name, url]) => (
                      <a
                        key={name}
                        href={url}
                        className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                      >
                        📎 {name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Keine Nachricht ausgewählt"
            description="Wählen Sie eine Nachricht aus, um sie zu lesen"
          />
        )}
      </div>
    </div>
  );
}