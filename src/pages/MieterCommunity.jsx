import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Plus, X } from 'lucide-react';

export default function MieterCommunity() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', post_type: 'allgemein' });
  const queryClient = useQueryClient();

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => base44.entities.MieterBuilding.list(),
  });

  const { data: posts } = useQuery({
    queryKey: ['communityPosts', selectedBuilding],
    queryFn: async () => {
      if (!selectedBuilding) return [];
      return base44.entities.CommunityPost.filter(
        { building_id: selectedBuilding, status: 'active' },
        '-created_date'
      );
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.CommunityPost.create({
        building_id: selectedBuilding,
        author_id: user.email,
        ...newPost,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setNewPost({ title: '', content: '', post_type: 'allgemein' });
      setShowNewPost(false);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const user = await base44.auth.me();
      return base44.entities.CommunityLike.create({
        user_id: user.email,
        target_type: 'post',
        target_id: postId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const postTypeColors = {
    allgemein: 'bg-blue-100 text-blue-800',
    suche: 'bg-purple-100 text-purple-800',
    biete: 'bg-green-100 text-green-800',
    event: 'bg-yellow-100 text-yellow-800',
    warnung: 'bg-red-100 text-red-800',
    frage: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Nachbarschaft</h1>
          <Button onClick={() => setShowNewPost(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" /> Neuer Beitrag
          </Button>
        </div>

        {/* Building Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {buildings?.map((building) => (
            <Button
              key={building.id}
              variant={selectedBuilding === building.id ? 'default' : 'outline'}
              onClick={() => setSelectedBuilding(building.id)}
              className="whitespace-nowrap"
            >
              {building.name}
            </Button>
          ))}
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card className="bg-white border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Neuen Beitrag erstellen</CardTitle>
                <button onClick={() => setShowNewPost(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Titel"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <textarea
                placeholder="Inhalt..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="4"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
              <select
                value={newPost.post_type}
                onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="allgemein">Allgemein</option>
                <option value="suche">Suche</option>
                <option value="biete">Biete</option>
                <option value="event">Event</option>
                <option value="warnung">Warnung</option>
                <option value="frage">Frage</option>
              </select>
              <Button
                onClick={() => createPostMutation.mutate()}
                disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Veröffentlichen
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <Badge className={`mt-2 ${postTypeColors[post.post_type] || ''}`}>
                      {post.post_type}
                    </Badge>
                  </div>
                  {post.is_pinned && (
                    <Badge className="bg-red-100 text-red-800 ml-2">📌 Gepinnt</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{post.content}</p>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => likeMutation.mutate(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.likes_count}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!selectedBuilding && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center text-gray-600">
              Wähle ein Gebäude aus, um Beiträge zu sehen.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}