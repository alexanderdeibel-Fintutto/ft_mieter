import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, MessageSquare, CheckSquare } from 'lucide-react';
import AdvancedMessageFilter from './AdvancedMessageFilter';
import AdvancedTaskFilter from './AdvancedTaskFilter';
import SavedFiltersPanel from './SavedFiltersPanel';

export default function UnifiedSearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');

  const handleSearch = async (searchType, filters = {}) => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) return;

    setSearching(true);
    const response = await base44.functions.invoke('advancedSearchEngine', {
      searchType,
      query: searchQuery,
      filters
    });
    setResults(response.data?.results || []);
    setSearching(false);
  };

  const handleSaveFilter = async (filterData) => {
    await base44.entities.SavedFilter.create({
      filter_name: filterData.name,
      filter_type: activeTab,
      filter_config: filterData.config
    });
  };

  const handleLoadFilter = (config) => {
    // Apply loaded filter configuration
    if (config.search) setSearchQuery(config.search);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Global suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(activeTab)}
          className="pr-10"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleSearch(activeTab)}
          className="absolute right-1 top-1"
        >
          <Search size={18} />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversations" className="gap-2">
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Chats</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare size={16} />
            <span className="hidden sm:inline">Aufgaben</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">Nutzer</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Nachr.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <Button onClick={() => handleSearch('conversations')} className="w-full">
            Konversationen durchsuchen
          </Button>
          <SavedFiltersPanel filterType="conversations" onLoadFilter={handleLoadFilter} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <AdvancedTaskFilter
            onFilter={(filters) => handleSearch('tasks', filters)}
            onSaveFilter={handleSaveFilter}
          />
          <SavedFiltersPanel filterType="tasks" onLoadFilter={handleLoadFilter} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Button onClick={() => handleSearch('users')} className="w-full">
            Nutzer durchsuchen
          </Button>
          <SavedFiltersPanel filterType="users" onLoadFilter={handleLoadFilter} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <AdvancedMessageFilter
            onFilter={(filters) => handleSearch('messages', filters)}
            onSaveFilter={handleSaveFilter}
          />
          <SavedFiltersPanel filterType="messages" onLoadFilter={handleLoadFilter} />
        </TabsContent>
      </Tabs>

      {searching && (
        <div className="text-center py-4 text-gray-500">Wird gesucht...</div>
      )}

      {!searching && results.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {results.map((result, idx) => (
                <div key={idx} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">{result.title || result.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.description || result.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!searching && results.length === 0 && searchQuery && (
        <div className="text-center py-4 text-gray-500">Keine Ergebnisse gefunden</div>
      )}
    </div>
  );
}