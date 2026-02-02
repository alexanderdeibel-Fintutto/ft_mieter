import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, Calendar, MessageCircle, Settings, LogOut, Send, Plus, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import GroupPostCard from './GroupPostCard';
import GroupEventCard from './GroupEventCard';
import CreateGroupEventDialog from './CreateGroupEventDialog';
import GroupGallery from './GroupGallery';

// Demo group posts
const DEMO_POSTS = [
  { 
    id: 1, 
    author: 'Maria K.', 
    content: 'Hat jemand Lust auf einen gemeinsamen Spielplatz-Besuch am Wochenende?', 
    created_at: new Date(Date.now() - 3600000).toISOString(), 
    likes: ['user-105'],
    comments: [
      { id: 1, author: 'Lisa M.', text: 'Ja, sehr gerne! Samstag passt bei uns.', created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 2, author: 'Max H.', text: 'Bin auch dabei 👍', created_at: new Date(Date.now() - 900000).toISOString() },
    ],
  },
  { 
    id: 2, 
    author: 'Tim B.', 
    content: 'Willkommen in der Gruppe! Freue mich auf den Austausch 😊', 
    created_at: new Date(Date.now() - 86400000).toISOString(), 
    isPinned: true,
    likes: ['user-101', 'user-105', 'user-107'],
    comments: [],
  },
];

const DEMO_EVENTS = [
  {
    id: 1,
    title: 'Spielplatz-Treffen',
    description: 'Gemeinsamer Ausflug zum Spielplatz',
    date: '2026-01-25',
    time: '15:00',
    location: 'Stadtpark Spielplatz',
    participants: ['user-101', 'user-105'],
    image: 'https://images.unsplash.com/photo-1566897819059-db42e135fa69?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: 'Eltern-Kaffee',
    description: 'Gemütlicher Kaffeeklatsch',
    date: '2026-02-01',
    time: '10:00',
    location: 'Gemeinschaftsraum',
    participants: ['user-101'],
  },
];

const DEMO_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=400&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=150&h=150&fit=crop', author: 'Maria K.', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 2, url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&h=150&fit=crop', author: 'Lisa M.', created_at: new Date(Date.now() - 432000000).toISOString() },
  { id: 3, url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=400&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=150&h=150&fit=crop', author: 'Max H.', created_at: new Date(Date.now() - 604800000).toISOString() },
];

const DEMO_MEMBERS = [
  { id: 'user-101', name: 'Maria K.', floor: '1. OG', isAdmin: true },
  { id: 'user-105', name: 'Lisa M.', floor: '3. OG', isAdmin: false },
  { id: 'user-107', name: 'Max H.', floor: 'EG', isAdmin: false },
  { id: 'current-user', name: 'Du', floor: '2. OG', isAdmin: false },
];

export default function GroupDetailDialog({ open, onOpenChange, group, onJoin, currentUserId }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  if (!group) return null;

  const isMember = group.members?.includes(currentUserId);
  const isCreator = group.creatorId === currentUserId;

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      author: 'Du',
      content: newPost,
      created_at: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    setPosts([post, ...posts]);
    setNewPost('');
    toast.success('Beitrag veröffentlicht!');
  };

  const handlePostLike = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const likes = p.likes || [];
        const hasLiked = likes.includes(currentUserId);
        return {
          ...p,
          likes: hasLiked ? likes.filter(id => id !== currentUserId) : [...likes, currentUserId],
        };
      }
      return p;
    }));
  };

  const handlePostComment = (postId, text) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), {
            id: Date.now(),
            author: 'Du',
            text,
            created_at: new Date().toISOString(),
          }],
        };
      }
      return p;
    }));
    toast.success('Kommentar hinzugefügt');
  };

  const handleCreateEvent = (data) => {
    const newEvent = {
      id: Date.now(),
      ...data,
      participants: [currentUserId],
    };
    setEvents([newEvent, ...events]);
    toast.success('Event erstellt!');
  };

  const handleJoinEvent = (eventId) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        const isParticipant = e.participants?.includes(currentUserId);
        return {
          ...e,
          participants: isParticipant 
            ? e.participants.filter(id => id !== currentUserId)
            : [...(e.participants || []), currentUserId],
        };
      }
      return e;
    }));
  };

  const handlePhotoUpload = (photo) => {
    setPhotos([photo, ...photos]);
    toast.success('Foto hochgeladen!');
  };

  const handleLeaveGroup = () => {
    onJoin(group);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-2xl">
              {group.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle>{group.name}</DialogTitle>
                {group.isPrivate && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-sm text-gray-500">{group.members?.length || 0} Mitglieder</p>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-gray-600 mt-2">{group.description}</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="posts" className="text-xs">
              <MessageCircle className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Beiträge</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs">
              <Calendar className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs">
              <Image className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Galerie</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs">
              <Users className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Mitglieder</span>
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4 mt-4">
            {/* New Post */}
            <div className="flex gap-2">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Schreibe etwas..."
                rows={2}
                className="flex-1"
              />
              <Button 
                onClick={handlePostSubmit}
                disabled={!newPost.trim()}
                size="icon"
                className="bg-[#8B5CF6] hover:bg-violet-700 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Posts List */}
            {posts.length > 0 ? (
              <div className="space-y-3">
                {posts.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(post => (
                  <GroupPostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onLike={handlePostLike}
                    onComment={handlePostComment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Noch keine Beiträge</p>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4 space-y-4">
            <Button 
              onClick={() => setShowCreateEvent(true)}
              className="w-full bg-[#8B5CF6] hover:bg-violet-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Event erstellen
            </Button>

            {events.length > 0 ? (
              <div className="space-y-3">
                {events.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => (
                  <GroupEventCard
                    key={event.id}
                    event={event}
                    currentUserId={currentUserId}
                    onJoin={handleJoinEvent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Noch keine Gruppen-Events</p>
              </div>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-4">
            <GroupGallery
              photos={photos}
              onUpload={handlePhotoUpload}
              canUpload={isMember}
            />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-2 mt-4">
            {DEMO_MEMBERS.map(member => (
              <div 
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (member.id !== 'current-user') {
                    navigate(createPageUrl('NachbarProfil') + `?id=${member.id}`);
                    onOpenChange(false);
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.floor}</p>
                </div>
                {member.isAdmin && (
                  <span className="text-xs bg-[#8B5CF6] text-white px-2 py-0.5 rounded-full">Admin</span>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Create Event Dialog */}
        <CreateGroupEventDialog
          open={showCreateEvent}
          onOpenChange={setShowCreateEvent}
          onSubmit={handleCreateEvent}
          groupName={group.name}
        />

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {isCreator ? (
            <Button variant="outline" className="flex-1">
              <Settings className="w-4 h-4 mr-2" /> Einstellungen
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLeaveGroup}
            >
              <LogOut className="w-4 h-4 mr-2" /> Gruppe verlassen
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}