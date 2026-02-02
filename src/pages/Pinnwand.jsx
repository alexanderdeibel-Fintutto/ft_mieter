import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Plus, Heart, MessageCircle, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

const POST_CATEGORIES = [
  { value: 'news', label: '📢 Ankündigung' },
  { value: 'suche', label: '🔍 Suche' },
  { value: 'biete', label: '🎁 Biete' },
  { value: 'hilfe', label: '🤝 Hilfe gesucht' },
  { value: 'allgemein', label: '💬 Allgemein' },
];

function PostCard({ post, currentUserId, onLike }) {
  const isLiked = post.likes?.includes(currentUserId);
  const category = POST_CATEGORIES.find(c => c.value === post.category);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-[#8B5CF6] font-bold">
          {post.author_name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{post.author_name || 'Anonym'}</h4>
            {category && (
              <span className="text-xs bg-violet-100 text-[#8B5CF6] px-2 py-0.5 rounded-full">
                {category.label}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString('de-DE', { 
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{post.content}</p>
      
      {post.image_url && (
        <img src={post.image_url} alt="" className="mt-3 rounded-lg w-full max-h-64 object-cover" />
      )}
      
      <div className="flex items-center gap-4 mt-4 pt-3 border-t">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {post.likes?.length || 0}
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-500">
          <MessageCircle className="w-4 h-4" />
          {post.comments_count || 0}
        </button>
      </div>
    </div>
  );
}

export default function Pinnwand() {
  const navigate = useNavigate();
  const { user, supabaseProfile, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'allgemein',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadPosts();
  }, [user, authLoading]);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Bitte Titel und Inhalt angeben');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('community_posts').insert({
      title: form.title,
      content: form.content,
      category: form.category,
      author_id: user.id,
      author_name: supabaseProfile?.first_name || 'Anonym',
      likes: [],
    });

    if (error) {
      toast.error('Fehler beim Erstellen');
    } else {
      toast.success('Beitrag veröffentlicht!');
      setShowForm(false);
      setForm({ title: '', content: '', category: 'allgemein' });
      loadPosts();
    }
    setSubmitting(false);
  };

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const likes = post.likes || [];
    const newLikes = likes.includes(user.id)
      ? likes.filter(id => id !== user.id)
      : [...likes, user.id];

    await supabase.from('community_posts').update({ likes: newLikes }).eq('id', postId);
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.category === filter);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 border-b bg-white flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">📌 Pinnwand</h1>
        <Button onClick={() => setShowForm(true)} className="bg-[#8B5CF6] hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-1" /> Posten
        </Button>
      </header>

      {/* Filter */}
      <div className="p-4 pb-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            filter === 'all' ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Alle
        </button>
        {POST_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filter === cat.value ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Keine Beiträge vorhanden</p>
            <p className="text-sm">Sei der Erste, der etwas postet!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={user.id} onLike={handleLike} />
          ))
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neuer Beitrag</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Titel"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Was möchtest du teilen?"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Abbrechen
              </Button>
              <Button type="submit" className="flex-1 bg-[#8B5CF6] hover:bg-violet-700" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Veröffentlichen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}