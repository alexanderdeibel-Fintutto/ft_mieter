import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Calendar, MessageSquare, Bell, Megaphone, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

import AnnouncementCard from '../components/community/AnnouncementCard';
import GroupCard from '../components/community/GroupCard';
import ProjectCard from '../components/community/ProjectCard';
import CreateAnnouncementDialog from '../components/community/CreateAnnouncementDialog';
import CreateGroupDialog from '../components/community/CreateGroupDialog';
import CreateProjectDialog from '../components/community/CreateProjectDialog';
import GroupDetailDialog from '../components/community/GroupDetailDialog';
import ProjectDetailDialog from '../components/community/ProjectDetailDialog';

// Demo data
const DEMO_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Treppenhausreinigung am Samstag',
    content: 'Liebe Nachbarn, am Samstag findet die Reinigung des Treppenhauses statt. Bitte keine Schuhe vor den Türen lassen.',
    author: 'Hausverwaltung',
    authorId: 'admin-1',
    category: 'info',
    isPinned: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    comments: 3,
    reactions: { '👍': 5, '❤️': 2 },
  },
  {
    id: 2,
    title: 'Neuer Paketkasten im Eingang',
    content: 'Es wurde ein neuer Paketkasten installiert. Die Codes werden per Post zugestellt. Bei Fragen bitte an die Verwaltung wenden.',
    author: 'Hausverwaltung',
    authorId: 'admin-1',
    category: 'info',
    isPinned: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    comments: 8,
    reactions: { '👍': 12, '🎉': 4 },
  },
  {
    id: 3,
    title: 'Hat jemand meine Katze gesehen?',
    content: 'Unsere graue Katze "Minka" ist seit gestern vermisst. Sie trägt ein rotes Halsband. Bitte meldet euch bei mir (3. OG links)!',
    author: 'Lisa M.',
    authorId: 'user-105',
    category: 'hilfe',
    isPinned: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    comments: 12,
    reactions: { '😢': 3, '🤞': 8 },
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop',
  },
  {
    id: 4,
    title: 'Lärm am Wochenende - bitte um Verständnis',
    content: 'Wir feiern am Samstag den 30. Geburtstag. Es wird ab 22 Uhr leiser. Alle Nachbarn sind herzlich eingeladen!',
    author: 'Max H.',
    authorId: 'user-107',
    category: 'ankuendigung',
    isPinned: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    comments: 5,
    reactions: { '🎉': 15, '👍': 8 },
  },
];

const DEMO_GROUPS = [
  {
    id: 1,
    name: 'Eltern mit Kindern',
    description: 'Austausch für Familien mit Kindern. Spielverabredungen, Babysitting-Tausch und mehr.',
    category: 'familie',
    icon: '👨‍👩‍👧‍👦',
    members: ['user-101', 'user-105', 'user-107', 'current-user'],
    creator: 'Maria K.',
    creatorId: 'user-101',
    isPrivate: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    recentActivity: 'Neuer Beitrag vor 2 Std.',
  },
  {
    id: 2,
    name: 'Gartenfreunde',
    description: 'Für alle mit grünem Daumen! Tipps, Pflanzentausch und gemeinsame Gartenpflege.',
    category: 'hobby',
    icon: '🌱',
    members: ['user-102', 'user-103', 'user-104'],
    creator: 'Peter S.',
    creatorId: 'user-103',
    isPrivate: false,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    recentActivity: 'Neues Mitglied beigetreten',
  },
  {
    id: 3,
    name: '2. Etage',
    description: 'Gruppe für alle Bewohner der 2. Etage. Stockwerks-spezifische Themen.',
    category: 'stockwerk',
    icon: '🏢',
    members: ['user-101', 'user-102'],
    creator: 'Jonas M.',
    creatorId: 'user-102',
    isPrivate: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    recentActivity: 'Gestern',
  },
  {
    id: 4,
    name: 'Sportgruppe',
    description: 'Gemeinsam fit bleiben! Lauftreff, Yoga im Park, Fahrradtouren.',
    category: 'sport',
    icon: '⚽',
    members: ['user-103', 'user-102', 'user-107', 'user-101', 'current-user'],
    creator: 'Tim B.',
    creatorId: 'user-105',
    isPrivate: false,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    recentActivity: 'Event: Lauftreff Mittwoch 18:30',
  },
  {
    id: 5,
    name: 'Haustierbesitzer',
    description: 'Hunde, Katzen & Co. – Tiersitting, Gassi-Gruppen, Tierarzt-Empfehlungen.',
    category: 'hobby',
    icon: '🐕',
    members: ['user-105', 'user-104'],
    creator: 'Lisa M.',
    creatorId: 'user-105',
    isPrivate: false,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    recentActivity: 'Neue Diskussion gestartet',
  },
];

const ANNOUNCEMENT_CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'info', label: '📢 Info' },
  { id: 'ankuendigung', label: '📣 Ankündigung' },
  { id: 'hilfe', label: '🆘 Hilfe' },
  { id: 'diskussion', label: '💬 Diskussion' },
];

const GROUP_CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'stockwerk', label: '🏢 Stockwerk' },
  { id: 'familie', label: '👨‍👩‍👧' },
  { id: 'hobby', label: '🎯 Hobbys' },
  { id: 'sport', label: '⚽ Sport' },
];

const PROJECT_CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'umwelt', label: '🌱 Umwelt' },
  { id: 'nachbarschaft', label: '🏘️ Nachbarschaft' },
  { id: 'sozial', label: '❤️ Sozial' },
  { id: 'kultur', label: '🎭 Kultur' },
];

const DEMO_PROJECTS = [
  {
    id: 1,
    title: 'Gemeinschaftsgarten anlegen',
    description: 'Wir möchten im Innenhof einen kleinen Gemeinschaftsgarten mit Hochbeeten anlegen. Gemüse, Kräuter und Blumen für alle!',
    category: 'umwelt',
    status: 'active',
    targetDate: '2026-04-15',
    location: 'Innenhof',
    maxParticipants: 15,
    participants: ['user-101', 'user-103', 'current-user'],
    participantNames: ['Maria K.', 'Peter S.', 'Du'],
    creator: 'Maria K.',
    creatorId: 'user-101',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
    tasks: [
      { id: 1, text: 'Genehmigung bei Verwaltung einholen', completed: true },
      { id: 2, text: 'Hochbeete kaufen', completed: true },
      { id: 3, text: 'Erde und Pflanzen besorgen', completed: false },
      { id: 4, text: 'Aufbautag organisieren', completed: false },
    ],
    comments: [
      { id: 1, author: 'Peter S.', text: 'Tolle Idee! Ich habe Erfahrung mit Hochbeeten.', created_at: new Date(Date.now() - 86400000).toISOString() },
    ],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: 'Treppenhaus-Verschönerung',
    description: 'Gemeinsam das Treppenhaus streichen und mit Pflanzen dekorieren. Material wird gestellt!',
    category: 'nachbarschaft',
    status: 'planning',
    targetDate: '2026-03-01',
    location: 'Treppenhaus A',
    maxParticipants: 8,
    participants: ['user-102'],
    participantNames: ['Jonas M.'],
    creator: 'Jonas M.',
    creatorId: 'user-102',
    tasks: [
      { id: 1, text: 'Farben auswählen', completed: false },
      { id: 2, text: 'Termin festlegen', completed: false },
    ],
    comments: [],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: 'Seniorenbetreuung',
    description: 'Regelmäßige Besuche und Hilfe für ältere Nachbarn organisieren. Einkaufen, Gespräche, kleine Hilfen.',
    category: 'sozial',
    status: 'active',
    location: 'Im ganzen Haus',
    participants: ['user-105', 'user-101', 'user-107'],
    participantNames: ['Lisa M.', 'Maria K.', 'Max H.'],
    creator: 'Lisa M.',
    creatorId: 'user-105',
    tasks: [
      { id: 1, text: 'Interessierte Senioren ansprechen', completed: true },
      { id: 2, text: 'Wochenplan erstellen', completed: true },
      { id: 3, text: 'Erste Besuche durchführen', completed: false },
    ],
    comments: [
      { id: 1, author: 'Maria K.', text: 'Frau Müller aus dem 4. OG freut sich sehr!', created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: 2, author: 'Max H.', text: 'Ich kann mittwochs und freitags.', created_at: new Date(Date.now() - 86400000).toISOString() },
    ],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export default function Community() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('ankuendigungen');
  const [announcements, setAnnouncements] = useState(DEMO_ANNOUNCEMENTS);
  const [groups, setGroups] = useState(DEMO_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, authLoading]);

  const currentUserId = user?.id || 'current-user';

  // Announcement handlers
  const handleCreateAnnouncement = (data) => {
    const newAnnouncement = {
      id: Date.now(),
      ...data,
      author: user?.user_metadata?.full_name || 'Du',
      authorId: currentUserId,
      isPinned: false,
      created_at: new Date().toISOString(),
      comments: 0,
      reactions: {},
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    toast.success('Beitrag veröffentlicht!');
  };

  const handleReactToAnnouncement = (announcementId, emoji) => {
    setAnnouncements(announcements.map(a => {
      if (a.id === announcementId) {
        const reactions = { ...a.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...a, reactions };
      }
      return a;
    }));
  };

  // Group handlers
  const handleCreateGroup = (data) => {
    const newGroup = {
      id: Date.now(),
      ...data,
      members: [currentUserId],
      creator: user?.user_metadata?.full_name || 'Du',
      creatorId: currentUserId,
      created_at: new Date().toISOString(),
      recentActivity: 'Gerade erstellt',
    };
    setGroups([newGroup, ...groups]);
    toast.success('Gruppe erstellt!');
  };

  const handleJoinGroup = (group) => {
    const isMember = group.members.includes(currentUserId);
    setGroups(groups.map(g => {
      if (g.id === group.id) {
        if (isMember) {
          return { ...g, members: g.members.filter(m => m !== currentUserId) };
        } else {
          return { ...g, members: [...g.members, currentUserId] };
        }
      }
      return g;
    }));
    toast.success(isMember ? 'Gruppe verlassen' : 'Gruppe beigetreten!');
  };

  const handleOpenGroup = (group) => {
    setSelectedGroup(group);
  };

  // Project handlers
  const handleCreateProject = (data) => {
    const newProject = {
      id: Date.now(),
      ...data,
      status: 'planning',
      participants: [currentUserId],
      participantNames: [user?.user_metadata?.full_name || 'Du'],
      creator: user?.user_metadata?.full_name || 'Du',
      creatorId: currentUserId,
      comments: [],
      created_at: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
    toast.success('Projekt gestartet!');
  };

  const handleJoinProject = (project) => {
    const isMember = project.participants?.includes(currentUserId);
    setProjects(projects.map(p => {
      if (p.id === project.id) {
        if (isMember) {
          return { 
            ...p, 
            participants: p.participants.filter(m => m !== currentUserId),
            participantNames: p.participantNames?.filter((_, i) => p.participants[i] !== currentUserId)
          };
        } else {
          return { 
            ...p, 
            participants: [...(p.participants || []), currentUserId],
            participantNames: [...(p.participantNames || []), user?.user_metadata?.full_name || 'Du']
          };
        }
      }
      return p;
    }));
    if (selectedProject?.id === project.id) {
      setSelectedProject(prev => prev ? {
        ...prev,
        participants: isMember 
          ? prev.participants.filter(m => m !== currentUserId)
          : [...(prev.participants || []), currentUserId],
        participantNames: isMember
          ? prev.participantNames?.filter((_, i) => prev.participants[i] !== currentUserId)
          : [...(prev.participantNames || []), user?.user_metadata?.full_name || 'Du']
      } : null);
    }
    toast.success(isMember ? 'Projekt verlassen' : 'Du machst jetzt mit!');
  };

  const handleOpenProject = (project) => {
    setSelectedProject(project);
  };

  const handleProjectTaskToggle = (projectId, taskId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks?.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return p;
    }));
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? {
        ...prev,
        tasks: prev.tasks?.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      } : null);
    }
  };

  const handleProjectAddTask = (projectId, taskText) => {
    const newTask = { id: Date.now(), text: taskText, completed: false };
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: [...(p.tasks || []), newTask] };
      }
      return p;
    }));
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : null);
    }
    toast.success('Aufgabe hinzugefügt');
  };

  const handleProjectAddComment = (projectId, text) => {
    const newComment = {
      id: Date.now(),
      author: user?.user_metadata?.full_name || 'Du',
      text,
      created_at: new Date().toISOString(),
    };
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    }));
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null);
    }
    toast.success('Kommentar hinzugefügt');
  };

  const handleProjectStatusChange = (projectId, newStatus) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success('Status aktualisiert');
  };

  // Filtering
  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myGroups = filteredGroups.filter(g => g.members.includes(currentUserId));
  const otherGroups = filteredGroups.filter(g => !g.members.includes(currentUserId));

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myProjects = filteredProjects.filter(p => p.participants?.includes(currentUserId));
  const otherProjects = filteredProjects.filter(p => !p.participants?.includes(currentUserId));

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">🏘️ Community</h1>
          <Button 
            onClick={() => {
              if (activeTab === 'gruppen') setShowCreateGroup(true);
              else if (activeTab === 'projekte') setShowCreateProject(true);
              else setShowCreateAnnouncement(true);
            }}
            size="sm"
            className="bg-white text-[#8B5CF6] hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 mr-1" /> 
            {activeTab === 'gruppen' ? 'Gruppe' : activeTab === 'projekte' ? 'Projekt' : 'Beitrag'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen..."
            className="pl-9 bg-white/90 border-0"
          />
        </div>
      </div>

      <div className="px-4 -mt-3">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedCategory('all'); }}>
          <TabsList className="w-full bg-white shadow-sm border rounded-xl p-1 mb-4">
            <TabsTrigger value="ankuendigungen" className="flex-1 text-xs sm:text-sm">
              <Megaphone className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Pinnwand</span>
            </TabsTrigger>
            <TabsTrigger value="gruppen" className="flex-1 text-xs sm:text-sm">
              <Users className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Gruppen</span>
            </TabsTrigger>
            <TabsTrigger value="projekte" className="flex-1 text-xs sm:text-sm">
              <Target className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Projekte</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1 text-xs sm:text-sm" onClick={() => navigate(createPageUrl('Events'))}>
              <Calendar className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
          </TabsList>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            {(activeTab === 'ankuendigungen' ? ANNOUNCEMENT_CATEGORIES : activeTab === 'projekte' ? PROJECT_CATEGORIES : GROUP_CATEGORIES).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-[#8B5CF6] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Ankündigungen Tab */}
          <TabsContent value="ankuendigungen" className="space-y-4 mt-0">
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Keine Beiträge gefunden</p>
                <Button 
                  onClick={() => setShowCreateAnnouncement(true)}
                  className="mt-4 bg-[#8B5CF6] hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Ersten Beitrag erstellen
                </Button>
              </div>
            ) : (
              filteredAnnouncements.map(announcement => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onReact={handleReactToAnnouncement}
                  onComment={() => toast.info('Kommentare werden bald verfügbar sein')}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </TabsContent>

          {/* Gruppen Tab */}
          <TabsContent value="gruppen" className="space-y-6 mt-0">
            {/* My Groups */}
            {myGroups.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Meine Gruppen ({myGroups.length})</h3>
                <div className="grid gap-3">
                  {myGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onJoin={handleJoinGroup}
                      onOpen={handleOpenGroup}
                      isMember={true}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Groups */}
            {otherGroups.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Entdecken ({otherGroups.length})</h3>
                <div className="grid gap-3">
                  {otherGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onJoin={handleJoinGroup}
                      onOpen={handleOpenGroup}
                      isMember={false}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredGroups.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Keine Gruppen gefunden</p>
                <Button 
                  onClick={() => setShowCreateGroup(true)}
                  className="mt-4 bg-[#8B5CF6] hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Erste Gruppe erstellen
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Projekte Tab */}
          <TabsContent value="projekte" className="space-y-6 mt-0">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5" /> Gemeinsame Projekte
              </h3>
              <p className="text-sm opacity-90 mt-1">
                Starte oder unterstütze Nachbarschaftsprojekte – gemeinsam erreichen wir mehr!
              </p>
            </div>

            {/* My Projects */}
            {myProjects.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Meine Projekte ({myProjects.length})</h3>
                <div className="grid gap-4">
                  {myProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onJoin={handleJoinProject}
                      onOpen={handleOpenProject}
                      isMember={true}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Projects */}
            {otherProjects.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Entdecken ({otherProjects.length})</h3>
                <div className="grid gap-4">
                  {otherProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onJoin={handleJoinProject}
                      onOpen={handleOpenProject}
                      isMember={false}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Keine Projekte gefunden</p>
                <Button 
                  onClick={() => setShowCreateProject(true)}
                  className="mt-4 bg-[#8B5CF6] hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Erstes Projekt starten
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateAnnouncementDialog
        open={showCreateAnnouncement}
        onOpenChange={setShowCreateAnnouncement}
        onSubmit={handleCreateAnnouncement}
      />

      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onSubmit={handleCreateGroup}
      />

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onSubmit={handleCreateProject}
      />

      <GroupDetailDialog
        open={!!selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
        group={selectedGroup}
        onJoin={handleJoinGroup}
        currentUserId={currentUserId}
      />

      <ProjectDetailDialog
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
        project={selectedProject}
        onJoin={handleJoinProject}
        onTaskToggle={handleProjectTaskToggle}
        onAddTask={handleProjectAddTask}
        onAddComment={handleProjectAddComment}
        onStatusChange={handleProjectStatusChange}
        currentUserId={currentUserId}
        isMember={selectedProject?.participants?.includes(currentUserId)}
      />
    </div>
  );
}