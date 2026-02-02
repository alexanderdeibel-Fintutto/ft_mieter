import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, Calendar, MessageCircle, ArrowLeft, Edit2, Shield, Clock, Users, Heart, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';

// Demo data - in production this would come from Supabase
const DEMO_PROFILES = {
  'user-101': {
    id: 'user-101',
    name: 'Maria K.',
    floor: '1. OG',
    apartment: 'Whg. 3',
    bio: 'Rentnerin mit viel Zeit und Freude am Helfen. Liebe es, mit Menschen in Kontakt zu kommen und meinen Nachbarn unter die Arme zu greifen.',
    memberSince: '2024-03-15',
    online: true,
    verified: true,
    interests: ['Gärtnern', 'Kochen', 'Spazieren', 'Lesen'],
    contactVisible: true,
    email: 'maria.k@example.com',
    phone: '+49 170 1234567',
  },
  'user-102': {
    id: 'user-102',
    name: 'Jonas M.',
    floor: '3. OG',
    apartment: 'Whg. 8',
    bio: 'IT-Student, helfe gerne bei allem was mit Technik zu tun hat. Auch für einen Kaffee und Plausch zu haben!',
    memberSince: '2024-01-20',
    online: false,
    verified: true,
    interests: ['Technik', 'Gaming', 'Joggen', 'Musik'],
    contactVisible: false,
    email: 'jonas.m@example.com',
    phone: '+49 171 9876543',
  },
  'user-103': {
    id: 'user-103',
    name: 'Peter S.',
    floor: 'EG',
    apartment: 'Whg. 1',
    bio: 'Handwerker im Ruhestand. Kann eigentlich alles reparieren was kaputt ist. Werkzeug bringe ich mit!',
    memberSince: '2023-11-05',
    online: false,
    verified: true,
    interests: ['Heimwerken', 'Gärtnern', 'Joggen'],
    contactVisible: true,
    email: 'peter.s@example.com',
    phone: '+49 172 5555555',
  },
};

const DEMO_GROUPS = {
  'user-101': [
    { id: 'grp-1', name: 'Eltern mit Kindern', icon: '👨‍👩‍👧‍👦', role: 'admin', memberCount: 12 },
    { id: 'grp-2', name: 'Gartenfreunde', icon: '🌱', role: 'member', memberCount: 8 },
  ],
  'user-102': [
    { id: 'grp-3', name: 'Sportgruppe', icon: '⚽', role: 'admin', memberCount: 15 },
    { id: 'grp-4', name: 'Technik-Hilfe', icon: '💻', role: 'admin', memberCount: 6 },
  ],
  'user-103': [
    { id: 'grp-3', name: 'Sportgruppe', icon: '⚽', role: 'member', memberCount: 15 },
    { id: 'grp-5', name: 'Heimwerker Club', icon: '🔧', role: 'admin', memberCount: 4 },
  ],
};

// Current user interests for comparison
const CURRENT_USER_INTERESTS = ['Joggen', 'Kochen', 'Technik', 'Gärtnern'];

const DEMO_SERVICES = {
  'user-101': [
    {
      id: 101,
      title: 'Einkaufshilfe für Senioren',
      description: 'Erledige gerne Einkäufe für ältere Nachbarn.',
      categories: ['🛒 Einkaufshilfe'],
      price: 'Kostenlos',
      rating: 5,
      reviewCount: 12,
    },
  ],
  'user-102': [
    {
      id: 102,
      title: 'Computer & Handy Hilfe',
      description: 'Helfe bei technischen Problemen: PC einrichten, Apps installieren.',
      categories: ['💻 Technik-Hilfe'],
      price: '15€/Std',
      rating: 4,
      reviewCount: 8,
    },
  ],
  'user-103': [
    {
      id: 103,
      title: 'Kleine Reparaturen & Montage',
      description: 'Möbel aufbauen, Bilder aufhängen, kleine Reparaturen.',
      categories: ['🔧 Kleine Reparaturen'],
      price: '20€/Std',
      rating: 5,
      reviewCount: 23,
    },
  ],
};

const DEMO_LISTINGS = {
  'user-101': [
    { id: 1, title: 'Blumentöpfe zu verschenken', category: 'verschenke', status: 'active', created_at: '2025-01-10' },
  ],
  'user-102': [
    { id: 2, title: 'Altes Notebook', category: 'biete', status: 'active', created_at: '2025-01-15', price: '50€' },
    { id: 3, title: 'Suche Gitarrenlehrer', category: 'suche', status: 'closed', created_at: '2024-12-01' },
  ],
  'user-103': [
    { id: 4, title: 'Werkzeugset zu verleihen', category: 'biete', status: 'active', created_at: '2025-01-05' },
  ],
};

const DEMO_REVIEWS = {
  'user-101': [
    { id: 1, author: 'Helga B.', rating: 5, comment: 'Super nett und zuverlässig! Hat mir sehr geholfen.', date: '2025-01-18', service: 'Einkaufshilfe' },
    { id: 2, author: 'Klaus D.', rating: 5, comment: 'Immer pünktlich und freundlich. Sehr empfehlenswert!', date: '2025-01-10', service: 'Einkaufshilfe' },
    { id: 3, author: 'Anna L.', rating: 5, comment: 'Herzlichen Dank für die tolle Unterstützung!', date: '2024-12-20', service: 'Einkaufshilfe' },
  ],
  'user-102': [
    { id: 4, author: 'Maria K.', rating: 5, comment: 'Hat mein Tablet gerettet! Sehr geduldig erklärt.', date: '2025-01-15', service: 'Computer & Handy Hilfe' },
    { id: 5, author: 'Peter S.', rating: 4, comment: 'Gute Arbeit, schnell und kompetent.', date: '2025-01-08', service: 'Computer & Handy Hilfe' },
    { id: 6, author: 'Tim B.', rating: 4, comment: 'Hat mir beim WLAN-Problem geholfen. Danke!', date: '2024-12-28', service: 'Computer & Handy Hilfe' },
  ],
  'user-103': [
    { id: 7, author: 'Jonas M.', rating: 5, comment: 'Mein IKEA-Schrank steht perfekt! Top Handwerker.', date: '2025-01-12', service: 'Kleine Reparaturen' },
    { id: 8, author: 'Lisa W.', rating: 5, comment: 'Bilder hängen gerade und halten! Vielen Dank.', date: '2025-01-05', service: 'Kleine Reparaturen' },
    { id: 9, author: 'Max H.', rating: 5, comment: 'Wasserhahn repariert in 10 Minuten. Klasse!', date: '2024-12-15', service: 'Kleine Reparaturen' },
  ],
};

function StarRating({ rating, size = 'sm' }) {
  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${starSize} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{service.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {service.categories.map(cat => (
              <span key={cat} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
        <span className="text-sm font-medium text-green-600">{service.price}</span>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <StarRating rating={service.rating} />
        <span className="text-xs text-gray-500">({service.reviewCount} Bewertungen)</span>
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  const categoryEmoji = {
    biete: '🎁',
    suche: '🔍',
    verschenke: '💝',
    tausche: '🔄',
    hilfe: '🤝',
  };

  return (
    <div className={`bg-white rounded-xl border p-4 ${listing.status === 'closed' ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {categoryEmoji[listing.category] || '📋'} {listing.category}
          </span>
          <h4 className="font-medium text-gray-900 mt-1">{listing.title}</h4>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(listing.created_at).toLocaleDateString('de-DE')}
          </p>
        </div>
        <div className="text-right">
          {listing.price && <span className="text-sm font-medium text-green-600">{listing.price}</span>}
          <span className={`block text-xs mt-1 ${listing.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
            {listing.status === 'active' ? '● Aktiv' : '○ Beendet'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {review.author.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{review.author}</p>
            <p className="text-xs text-gray-500">{review.service}</p>
          </div>
        </div>
        <div className="text-right">
          <StarRating rating={review.rating} />
          <p className="text-xs text-gray-400 mt-1">{new Date(review.date).toLocaleDateString('de-DE')}</p>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-gray-600 mt-3 italic">"{review.comment}"</p>
      )}
    </div>
  );
}

export default function NachbarProfil() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [sharedInterests, setSharedInterests] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }

    // Get userId from URL params
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id') || 'user-101'; // Default to demo user

    // Check if viewing own profile
    setIsOwnProfile(userId === user?.id);

    // Load profile data
    const profileData = DEMO_PROFILES[userId] || DEMO_PROFILES['user-101'];
    setProfile(profileData);
    setServices(DEMO_SERVICES[userId] || []);
    setListings(DEMO_LISTINGS[userId] || []);
    setReviews(DEMO_REVIEWS[userId] || []);
    setGroups(DEMO_GROUPS[userId] || []);

    // Calculate shared interests
    if (profileData.interests) {
      const shared = profileData.interests.filter(i => CURRENT_USER_INTERESTS.includes(i));
      setSharedInterests(shared);
    }
  }, [user, authLoading]);

  const handleContact = () => {
    if (profile) {
      navigate(createPageUrl('Chat') + `?recipient=${profile.id}`);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  const avgRating = calculateAverageRating();

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {isOwnProfile && (
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Edit2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0)}
              </div>
              {profile.online && (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                {profile.verified && (
                  <Shield className="w-5 h-5 text-blue-500" title="Verifiziert" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.floor}, {profile.apartment}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4" />
                <span>Mitglied seit {new Date(profile.memberSince).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
              <div className="text-3xl font-bold text-gray-900">{avgRating}</div>
              <div>
                <StarRating rating={Math.round(avgRating)} size="md" />
                <p className="text-xs text-gray-500 mt-0.5">{reviews.length} Bewertungen</p>
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Über mich</h3>
              <p className="text-sm text-gray-600">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Interessen</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => {
                  const isShared = sharedInterests.includes(interest);
                  return (
                    <Badge 
                      key={interest} 
                      variant={isShared ? "default" : "secondary"}
                      className={isShared ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                    >
                      {isShared && <Heart className="w-3 h-3 mr-1 fill-current" />}
                      {interest}
                    </Badge>
                  );
                })}
              </div>
              {!isOwnProfile && sharedInterests.length > 0 && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {sharedInterests.length} gemeinsame {sharedInterests.length === 1 ? 'Interesse' : 'Interessen'}
                </p>
              )}
            </div>
          )}

          {/* Contact Info (if visible) */}
          {profile.contactVisible && !isOwnProfile && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Kontaktdaten
              </h3>
              <div className="space-y-2">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#8B5CF6]">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#8B5CF6]">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {!profile.contactVisible && !isOwnProfile && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Kontaktdaten sind privat
              </p>
            </div>
          )}

          {/* Contact Button */}
          {!isOwnProfile && (
            <Button 
              onClick={handleContact}
              className="w-full mt-4 bg-[#8B5CF6] hover:bg-violet-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Nachricht schreiben
            </Button>
          )}
        </div>

        {/* Community Groups */}
        {groups.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community-Gruppen ({groups.length})
            </h3>
            <div className="space-y-2">
              {groups.map(group => (
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
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <Tabs defaultValue="services">
          <TabsList className="w-full">
            <TabsTrigger value="services" className="flex-1">
              Hilfsangebote ({services.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex-1">
              Anzeigen ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Bewertungen ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-4 space-y-3">
            {services.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Keine Hilfsangebote vorhanden</p>
            ) : (
              services.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))
            )}
          </TabsContent>

          <TabsContent value="listings" className="mt-4 space-y-3">
            {listings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Keine Anzeigen vorhanden</p>
            ) : (
              listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Noch keine Bewertungen erhalten</p>
            ) : (
              reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}