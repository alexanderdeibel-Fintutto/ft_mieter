import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Home, Settings, HelpCircle, LogOut, ChevronRight, Mail, Phone, MapPin, Calendar, Edit2, Check, X, Users, Heart, Eye, EyeOff, Wrench, ShoppingBag, Clock, Tag, Star, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import SEOHead, { generateProfileStructuredData } from '../components/common/SEOHead';
import VisibilityToggle from '../components/common/VisibilityToggle';

const AVAILABLE_INTERESTS = [
  'Gärtnern', 'Kochen', 'Joggen', 'Technik', 'Musik', 'Lesen', 
  'Heimwerken', 'Gaming', 'Yoga', 'Fotografie', 'Reisen', 'Kunst'
];

const AVAILABLE_SKILLS = [
  { id: 'handwerk', label: '🔧 Handwerk', description: 'Reparaturen, Montage' },
  { id: 'technik', label: '💻 Technik', description: 'Computer, Smartphones' },
  { id: 'garten', label: '🌱 Garten', description: 'Pflanzen, Rasen' },
  { id: 'kochen', label: '🍳 Kochen', description: 'Mahlzeiten, Backen' },
  { id: 'kinderbetreuung', label: '👶 Kinderbetreuung', description: 'Babysitting, Hilfe' },
  { id: 'sprachen', label: '🗣️ Sprachen', description: 'Übersetzungen, Nachhilfe' },
  { id: 'transport', label: '🚗 Transport', description: 'Fahrdienste, Umzug' },
  { id: 'haushalt', label: '🏠 Haushalt', description: 'Putzen, Einkaufen' },
];

const AVAILABILITY_OPTIONS = [
  { id: 'flexible', label: 'Flexibel' },
  { id: 'mornings', label: 'Vormittags' },
  { id: 'afternoons', label: 'Nachmittags' },
  { id: 'evenings', label: 'Abends' },
  { id: 'weekends', label: 'Wochenenden' },
];

const DEMO_USER_GROUPS = [
  { id: 'grp-1', name: 'Sportgruppe', icon: '⚽', role: 'member', memberCount: 15 },
  { id: 'grp-2', name: 'Gartenfreunde', icon: '🌱', role: 'admin', memberCount: 8 },
];

const DEMO_USER_ACTIVITIES = {
  listings: [
    { id: 1, title: 'IKEA Kallax Regal', type: 'offer', status: 'active', createdAt: '2026-01-20' },
    { id: 2, title: 'Suche Kinderfahrrad', type: 'search', status: 'active', createdAt: '2026-01-17' },
  ],
  services: [
    { id: 1, title: 'Computer Hilfe', type: 'offer', rating: 4.8, completedCount: 5 },
  ],
  transactions: [
    { id: 1, title: 'Bücher verschenkt an Maria K.', date: '2026-01-15', type: 'completed' },
    { id: 2, title: 'Pflanzentausch mit Peter S.', date: '2026-01-10', type: 'completed' },
  ],
};

function ProfileMenuItem({ icon: Icon, label, onClick, to, variant }) {
  const content = (
    <div className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border transition-all active:scale-98 ${
      variant === 'danger' ? 'border-red-100 text-red-600' : 'border-gray-100'
    }`}>
      <div className="flex items-center gap-4">
        <Icon className={`w-5 h-5 ${variant === 'danger' ? 'text-red-500' : 'text-gray-600'}`} />
        <span className={`font-medium ${variant === 'danger' ? 'text-red-600' : 'text-gray-800'}`}>{label}</span>
      </div>
      <ChevronRight className={`w-5 h-5 ${variant === 'danger' ? 'text-red-400' : 'text-gray-400'}`} />
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }
  return <button onClick={onClick} className="w-full text-left block">{content}</button>;
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-4 h-4 text-gray-400" />
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, supabaseProfile, loading, logout, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    interests: [],
    skills: [],
    availability: 'flexible',
    preferredContactTime: '',
    contactVisible: false,
    profileVisibility: 'neighbors', // public, neighbors, private
    listingsVisibility: 'neighbors',
  });
  const [myGroups] = useState(DEMO_USER_GROUPS);
  const [activities] = useState(DEMO_USER_ACTIVITIES);
  const [profileTab, setProfileTab] = useState('info');

  useEffect(() => {
    if (!loading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (supabaseProfile) {
      setFormData({
        first_name: supabaseProfile.first_name || '',
        last_name: supabaseProfile.last_name || '',
        phone: supabaseProfile.phone || '',
        bio: supabaseProfile.bio || '',
        interests: supabaseProfile.interests || ['Joggen', 'Kochen'],
        skills: supabaseProfile.skills || ['technik'],
        availability: supabaseProfile.availability || 'flexible',
        preferredContactTime: supabaseProfile.preferredContactTime || '',
        contactVisible: supabaseProfile.contactVisible ?? true,
        profileVisibility: supabaseProfile.profileVisibility || 'neighbors',
        listingsVisibility: supabaseProfile.listingsVisibility || 'neighbors',
      });
    }
  }, [supabaseProfile]);

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Register'));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .update(formData)
      .eq('id', user.id);

    if (error) {
      toast.error('Fehler beim Speichern');
    } else {
      toast.success('Profil aktualisiert');
      setEditing(false);
      if (refreshProfile) refreshProfile();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  const displayName = supabaseProfile?.first_name 
    ? `${supabaseProfile.first_name} ${supabaseProfile.last_name || ''}`.trim()
    : 'Mieter';

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    : '-';

  const profileStructuredData = generateProfileStructuredData({
    first_name: formData.first_name,
    last_name: formData.last_name,
    bio: formData.bio,
    skills: formData.skills,
  });

  return (
    <div>
      <SEOHead
        title={`${displayName} - Profil`}
        description={formData.bio || `Profil von ${displayName} in der MieterApp`}
        keywords={[...formData.interests, ...formData.skills.map(s => AVAILABLE_SKILLS.find(sk => sk.id === s)?.label || s)]}
        type="profile"
        structuredData={formData.profileVisibility === 'public' ? profileStructuredData : undefined}
        noIndex={formData.profileVisibility === 'private'}
      />
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">👤 Mein Profil</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <div className="relative bg-gradient-to-br from-[#8B5CF6] to-violet-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-2 border-white/30">
              {supabaseProfile?.first_name 
                ? supabaseProfile.first_name.charAt(0).toUpperCase() 
                : <User className="w-10 h-10" />
              }
            </div>
            <div>
              <h2 className="text-xl font-bold">{displayName}</h2>
              <p className="text-violet-200 text-sm">{user?.email}</p>
              <p className="text-violet-300 text-xs mt-1">Mitglied seit {memberSince}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Edit Form */}
        {editing && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Profil bearbeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Vorname</label>
                <Input 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Dein Vorname"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nachname</label>
                <Input 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Dein Nachname"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Telefon</label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+49 ..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Über mich</label>
                <Textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Erzähle etwas über dich..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Interessen</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              {/* Skills */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Meine Fähigkeiten</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SKILLS.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`p-2 rounded-lg text-left transition-colors ${
                        formData.skills.includes(skill.id)
                          ? 'bg-emerald-100 border-2 border-emerald-400'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <p className="text-sm font-medium">{skill.label}</p>
                      <p className="text-xs text-gray-500">{skill.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Verfügbarkeit</label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(v) => setFormData({...formData, availability: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wann bist du verfügbar?" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Contact Time */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bevorzugte Kontaktzeiten</label>
                <Input 
                  value={formData.preferredContactTime}
                  onChange={(e) => setFormData({...formData, preferredContactTime: e.target.value})}
                  placeholder="z.B. Mo-Fr 18-20 Uhr"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {formData.contactVisible ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  <div>
                    <p className="text-sm font-medium">Kontaktdaten freigeben</p>
                    <p className="text-xs text-gray-500">E-Mail & Telefon für Nachbarn sichtbar</p>
                  </div>
                </div>
                <Switch
                  checked={formData.contactVisible}
                  onCheckedChange={(v) => setFormData({...formData, contactVisible: v})}
                />
              </div>

              {/* Visibility Settings */}
              <div className="space-y-3 pt-2">
                <p className="text-xs text-gray-500 font-medium">Sichtbarkeitseinstellungen</p>
                <VisibilityToggle
                  visibility={formData.profileVisibility}
                  onVisibilityChange={(v) => setFormData({...formData, profileVisibility: v})}
                  variant="select"
                  label="Profil-Sichtbarkeit"
                />
                <VisibilityToggle
                  visibility={formData.listingsVisibility}
                  onVisibilityChange={(v) => setFormData({...formData, listingsVisibility: v})}
                  variant="select"
                  label="Anzeigen-Sichtbarkeit"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
                >
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditing(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Tabs */}
        {!editing && (
          <Tabs value={profileTab} onValueChange={setProfileTab}>
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Profil</TabsTrigger>
              <TabsTrigger value="skills" className="flex-1">Fähigkeiten</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Aktivitäten</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Bio Card */}
              {formData.bio && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Über mich</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{formData.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Interests Card */}
              {formData.interests.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Meine Interessen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map(interest => (
                        <Badge key={interest} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Community Groups */}
              {myGroups.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" /> Meine Gruppen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {myGroups.map(group => (
                      <div 
                        key={group.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xl">
                          {group.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{group.name}</p>
                          <p className="text-xs text-gray-500">{group.memberCount} Mitglieder</p>
                        </div>
                        {group.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">
                            Admin
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Kontaktdaten</span>
                    <span className="text-xs font-normal text-gray-500 flex items-center gap-1">
                      {formData.contactVisible ? (
                        <><Eye className="w-3 h-3" /> Sichtbar</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Privat</>
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow icon={Mail} label="E-Mail" value={user?.email} />
                  <InfoRow icon={Phone} label="Telefon" value={supabaseProfile?.phone} />
                  <InfoRow icon={MapPin} label="Adresse" value={supabaseProfile?.address || 'Über Wohnung hinterlegt'} />
                  <InfoRow icon={Calendar} label="Mitglied seit" value={memberSince} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-4 mt-4">
              {/* Skills Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Meine Fähigkeiten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.skills.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.skills.map(skillId => {
                        const skill = AVAILABLE_SKILLS.find(s => s.id === skillId);
                        return skill ? (
                          <div key={skillId} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-sm font-medium text-emerald-800">{skill.label}</p>
                            <p className="text-xs text-emerald-600">{skill.description}</p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Noch keine Fähigkeiten hinzugefügt
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Availability Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Verfügbarkeit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Generelle Verfügbarkeit</span>
                    <Badge variant="secondary">
                      {AVAILABILITY_OPTIONS.find(o => o.id === formData.availability)?.label || 'Flexibel'}
                    </Badge>
                  </div>
                  {formData.preferredContactTime && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Bevorzugte Kontaktzeiten</span>
                      <span className="text-sm font-medium">{formData.preferredContactTime}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              {/* Active Listings */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Aktive Anzeigen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activities.listings.length > 0 ? (
                    activities.listings.map(listing => (
                      <Link 
                        key={listing.id}
                        to={createPageUrl('Marktplatz')}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          listing.type === 'offer' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {listing.type === 'offer' ? (
                            <Tag className="w-5 h-5 text-green-600" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{listing.title}</p>
                          <p className="text-xs text-gray-500">
                            {listing.type === 'offer' ? 'Biete' : 'Suche'} • {new Date(listing.createdAt).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {listing.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Keine aktiven Anzeigen</p>
                  )}
                </CardContent>
              </Card>

              {/* Services */}
              {activities.services.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="w-4 h-4" /> Meine Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {activities.services.map(service => (
                      <Link 
                        key={service.id}
                        to={createPageUrl('Schwarzesbrett')}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{service.title}</p>
                          <p className="text-xs text-gray-500">{service.completedCount} abgeschlossen</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{service.rating}</span>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Past Transactions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Vergangene Transaktionen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activities.transactions.length > 0 ? (
                    activities.transactions.map(tx => (
                      <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{tx.title}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('de-DE')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Keine vergangenen Transaktionen</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Menu Items */}
        <div className="space-y-2 pt-2">
          <ProfileMenuItem icon={Home} label="Meine Wohnung" to={createPageUrl('MeineWohnung')} />
          <ProfileMenuItem icon={Home} label="Mein Haus" to={createPageUrl('MeinHaus')} />
          <ProfileMenuItem icon={Settings} label="Einstellungen" to={createPageUrl('Settings')} />
          <ProfileMenuItem icon={HelpCircle} label="Hilfe & Support" to={createPageUrl('Help')} />
        </div>

        <div className="pt-4">
          <ProfileMenuItem icon={LogOut} label="Ausloggen" onClick={handleLogout} variant="danger" />
        </div>
      </div>
    </div>
  );
}