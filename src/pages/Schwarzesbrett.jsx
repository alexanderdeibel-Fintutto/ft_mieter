import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, MessageCircle, MapPin, Euro, Tag, Search, Users, Calendar, Filter, AlertTriangle, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ServiceCard from '../components/schwarzesbrett/ServiceCard';
import BookingDialog from '../components/schwarzesbrett/BookingDialog';
import ReviewDialog from '../components/schwarzesbrett/ReviewDialog';
import MyBookings from '../components/schwarzesbrett/MyBookings';
import CreateServiceDialog from '../components/schwarzesbrett/CreateServiceDialog';
import IncomingRequests from '../components/schwarzesbrett/IncomingRequests';
import BookingCalendar from '../components/schwarzesbrett/BookingCalendar';
import ServiceFilters, { SERVICE_CATEGORIES, STATUS_OPTIONS, TYPE_OPTIONS } from '../components/schwarzesbrett/ServiceFilters';
import AdvancedBulletinFilter from '../components/schwarzesbrett/AdvancedBulletinFilter';
import ServiceDetailDialog from '../components/schwarzesbrett/ServiceDetailDialog';
import AdvancedSearchFilters from '../components/common/AdvancedSearchFilters';
import SEOHead, { generateServiceStructuredData } from '../components/common/SEOHead';
import { PointsOverview, RewardsDialog, POINT_VALUES } from '../components/schwarzesbrett/PointsSystem';
import { AnonymousRequestCard, CreateAnonymousRequestDialog } from '../components/schwarzesbrett/AnonymousHelpRequest';

const CATEGORIES = [
  { id: 'all', label: 'Alle', icon: '📋' },
  { id: 'biete', label: 'Biete', icon: '🎁' },
  { id: 'suche', label: 'Suche', icon: '🔍' },
  { id: 'verschenke', label: 'Verschenke', icon: '💝' },
  { id: 'tausche', label: 'Tausche', icon: '🔄' },
  { id: 'hilfe', label: 'Hilfe', icon: '🤝' },
];

const DEMO_LISTINGS = [
  {
    id: 1,
    category: 'verschenke',
    title: 'Zimmerpflanze Monstera',
    description: 'Schöne Monstera, ca. 80cm hoch. Muss abgeholt werden (3. OG).',
    author: 'M. Schmidt',
    floor: '3. OG',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400',
    likes: 5,
  },
  {
    id: 2,
    category: 'suche',
    title: 'Bohrmaschine zum Ausleihen',
    description: 'Brauche für ein Wochenende eine Bohrmaschine für ein paar Bilder.',
    author: 'K. Weber',
    floor: '1. OG',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes: 2,
  },
  {
    id: 3,
    category: 'biete',
    title: 'Babysitting Service',
    description: 'Biete Babysitting an Wochenenden an. Erfahrung mit Kindern vorhanden.',
    author: 'L. Müller',
    floor: '2. OG',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    price: '12€/Std',
    likes: 8,
  },
  {
    id: 4,
    category: 'tausche',
    title: 'Bücherregal gegen Kommode',
    description: 'Weißes IKEA Billy Regal (80x200cm) gegen eine Kommode oder Sideboard.',
    author: 'A. Becker',
    floor: 'EG',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400',
    likes: 3,
  },
  {
    id: 5,
    category: 'hilfe',
    title: 'Hilfe beim Umzug gesucht',
    description: 'Ziehe am 15. um und brauche 2-3 Helfer für ca. 3 Stunden. Bier & Pizza als Dank!',
    author: 'T. Fischer',
    floor: '4. OG',
    created_at: new Date().toISOString(),
    likes: 4,
  },
];

const DEMO_SERVICES = [
  {
    id: 101,
    type: 'bietet',
    title: 'Einkaufshilfe für Senioren',
    description: 'Erledige gerne Einkäufe für ältere Nachbarn. Regelmäßig oder bei Bedarf.',
    author: 'Maria K.',
    floor: '1. OG',
    categories: ['🛒 Einkaufshilfe'],
    categoryId: 'einkaufshilfe',
    availability: 'Mo-Fr vormittags',
    price: 'Kostenlos',
    rating: 5,
    reviewCount: 12,
    verified: true,
    status: 'offen',
    commentCount: 3,
  },
  {
    id: 102,
    type: 'bietet',
    title: 'Computer & Handy Hilfe',
    description: 'Helfe bei technischen Problemen: PC einrichten, Apps installieren, Smart-Home.',
    author: 'Jonas M.',
    floor: '3. OG',
    categories: ['💻 Technik-Hilfe'],
    categoryId: 'technik',
    availability: 'Abends & Wochenende',
    price: '15€/Std',
    rating: 4,
    reviewCount: 8,
    verified: true,
    status: 'in_bearbeitung',
    commentCount: 5,
  },
  {
    id: 103,
    type: 'bietet',
    title: 'Kleine Reparaturen & Montage',
    description: 'Möbel aufbauen, Bilder aufhängen, kleine Reparaturen im Haushalt.',
    author: 'Peter S.',
    floor: 'EG',
    categories: ['🔧 Handwerk'],
    categoryId: 'handwerk',
    availability: 'Flexibel',
    price: '20€/Std',
    rating: 5,
    reviewCount: 23,
    verified: true,
    status: 'offen',
    commentCount: 8,
  },
  {
    id: 104,
    type: 'sucht',
    title: 'Suche Hilfe beim Gießen',
    description: 'Bin oft geschäftlich unterwegs und brauche jemanden der meine Pflanzen gießt.',
    author: 'Anna L.',
    floor: '4. OG',
    categories: ['🌱 Gartenarbeit'],
    categoryId: 'gartenarbeit',
    availability: 'Nach Absprache',
    rating: 0,
    reviewCount: 0,
    verified: false,
    status: 'offen',
    commentCount: 2,
  },
  {
    id: 105,
    type: 'bietet',
    title: 'Gassi-Service für Hunde',
    description: 'Gehe gerne mit Hunden spazieren. Auch mehrmals täglich möglich.',
    author: 'Tim B.',
    floor: '2. OG',
    categories: ['🐕 Tiersitting'],
    categoryId: 'tiersitting',
    availability: 'Mo-Fr ganztags',
    price: '8€/Runde',
    rating: 5,
    reviewCount: 15,
    verified: true,
    status: 'abgeschlossen',
    commentCount: 12,
  },
  {
    id: 106,
    type: 'sucht',
    title: 'Kinderbetreuung gesucht',
    description: 'Suche zuverlässige Betreuung für 2 Kinder (5 und 8 Jahre) am Nachmittag.',
    author: 'Sandra H.',
    floor: '2. OG',
    categories: ['👶 Kinderbetreuung'],
    categoryId: 'kinderbetreuung',
    availability: 'Mo-Fr 14-18 Uhr',
    price: '12€/Std',
    rating: 0,
    reviewCount: 0,
    verified: true,
    status: 'offen',
    commentCount: 4,
  },
];

const DEMO_COMMENTS = {
  101: [
    { id: 1, author: 'Klaus D.', text: 'Super Service! Hat mir sehr geholfen.', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, author: 'Helga B.', text: 'Sehr freundlich und zuverlässig!', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 3, author: 'Maria K.', text: 'Danke für das nette Feedback!', created_at: new Date(Date.now() - 86000000).toISOString() },
  ],
  102: [
    { id: 4, author: 'Peter S.', text: 'Kann ich nur empfehlen!', created_at: new Date(Date.now() - 259200000).toISOString() },
  ],
};

const DEMO_BOOKINGS = [
  {
    id: 201,
    serviceId: 102,
    serviceTitle: 'Computer & Handy Hilfe',
    providerName: 'Jonas M.',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    time: '18:00',
    status: 'confirmed',
    message: 'Brauche Hilfe beim Einrichten meines neuen Laptops',
    reviewed: false,
  },
  {
    id: 202,
    serviceId: 103,
    serviceTitle: 'Kleine Reparaturen & Montage',
    providerName: 'Peter S.',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    time: '14:00',
    status: 'completed',
    message: 'Schrank aufbauen',
    reviewed: true,
    rating: 5,
  },
  {
    id: 203,
    serviceId: 101,
    serviceTitle: 'Einkaufshilfe für Senioren',
    providerName: 'Maria K.',
    date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    time: '10:00',
    status: 'pending',
    message: 'Könnten Sie für mich zum Edeka gehen?',
    reviewed: false,
  },
];

// Demo incoming requests (for service providers)
const DEMO_INCOMING_REQUESTS = [
  {
    id: 301,
    serviceId: 102,
    serviceTitle: 'Computer & Handy Hilfe',
    requesterName: 'Helga B.',
    requesterFloor: '4. OG',
    date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    time: '15:00',
    status: 'pending',
    message: 'Mein Tablet zeigt immer Fehlermeldungen an',
  },
  {
    id: 302,
    serviceId: 102,
    serviceTitle: 'Computer & Handy Hilfe',
    requesterName: 'Klaus D.',
    requesterFloor: '1. OG',
    date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    time: '17:00',
    status: 'pending',
    message: 'Neues Smartphone einrichten',
  },
];

// Demo help requests (anonymous/urgent)
const DEMO_HELP_REQUESTS = [
  {
    id: 401,
    title: 'Dringend: Hilfe mit schwerem Paket',
    description: 'Habe ein sehr schweres Paket bekommen und kann es nicht alleine die Treppe hochtragen. Würde mich über Hilfe freuen!',
    category: 'transport',
    isAnonymous: false,
    isUrgent: true,
    preferredTime: 'Heute Abend',
    floor: '4. OG',
    pointsOffered: 30,
    timeAgo: 'vor 2 Std.',
    authorId: 'user-123',
  },
  {
    id: 402,
    title: 'Suche jemanden zum Reden',
    description: 'Bin neu im Haus und fühle mich manchmal einsam. Würde mich über Gesellschaft bei einem Kaffee freuen.',
    category: 'sonstiges',
    isAnonymous: true,
    isUrgent: false,
    preferredTime: 'Flexibel',
    floor: null,
    pointsOffered: 0,
    timeAgo: 'vor 5 Std.',
    authorId: 'user-456',
  },
  {
    id: 403,
    title: 'Brauche Hilfe mit Computer',
    description: 'Mein Laptop startet nicht mehr und ich brauche ihn dringend für die Arbeit. Kennt sich jemand aus?',
    category: 'technik',
    isAnonymous: false,
    isUrgent: true,
    preferredTime: 'So schnell wie möglich',
    floor: '2. OG',
    pointsOffered: 50,
    timeAgo: 'vor 1 Std.',
    authorId: 'user-789',
  },
];

function ListingCard({ listing, onLike }) {
  const category = CATEGORIES.find(c => c.id === listing.category) || CATEGORIES[1];
  const timeAgo = getTimeAgo(listing.created_at);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {listing.image && (
        <img src={listing.image} alt={listing.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
            {category.icon} {category.label}
          </span>
          {listing.price && (
            <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Euro className="w-3 h-3" /> {listing.price}
            </span>
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>{listing.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {listing.floor}
            </span>
          </div>
          <span>{timeAgo}</span>
        </div>
        
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <button 
            onClick={() => onLike(listing.id)}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">{listing.likes}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-500 hover:text-[#8B5CF6] transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Kontakt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
  if (diff < 604800) return `vor ${Math.floor(diff / 86400)} Tagen`;
  return date.toLocaleDateString('de-DE');
}

export default function Schwarzesbrett() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState(DEMO_LISTINGS);
  const [services, setServices] = useState(DEMO_SERVICES);
  const [bookings, setBookings] = useState(DEMO_BOOKINGS);
  const [incomingRequests, setIncomingRequests] = useState(DEMO_INCOMING_REQUESTS);
  const [helpRequests, setHelpRequests] = useState(DEMO_HELP_REQUESTS);
  const [userPoints, setUserPoints] = useState(175);
  const [myBookingsView, setMyBookingsView] = useState('liste'); // 'liste', 'kalender', 'anfragen'
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);
  const [createHelpRequestDialogOpen, setCreateHelpRequestDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createServiceDialogOpen, setCreateServiceDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [serviceDetailDialogOpen, setServiceDetailDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('anzeigen');
  const [newListing, setNewListing] = useState({ category: 'biete', title: '', description: '', price: '' });
  const [serviceComments, setServiceComments] = useState(DEMO_COMMENTS);
  
  // Service filters
  const [serviceCategory, setServiceCategory] = useState('all');
  const [serviceStatus, setServiceStatus] = useState('all');
  const [serviceType, setServiceType] = useState('all');
  
  // Advanced search filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, authLoading]);

  const handleLike = (id) => {
    setListings(prev => prev.map(l => 
      l.id === id ? { ...l, likes: l.likes + 1 } : l
    ));
  };

  const handleCreate = () => {
    if (!newListing.title || !newListing.description) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    const listing = {
      id: Date.now(),
      ...newListing,
      author: user?.user_metadata?.full_name || 'Anonym',
      floor: '2. OG',
      created_at: new Date().toISOString(),
      likes: 0,
    };

    setListings(prev => [listing, ...prev]);
    setCreateDialogOpen(false);
    setNewListing({ category: 'biete', title: '', description: '', price: '' });
    toast.success('Anzeige erstellt');
  };

  const handleCreateService = async (formData) => {
    const newService = {
      id: Date.now(),
      ...formData,
      author: user?.user_metadata?.full_name || 'Anonym',
      floor: '2. OG',
      rating: 0,
      reviewCount: 0,
      verified: false,
    };
    setServices(prev => [newService, ...prev]);
    setCreateServiceDialogOpen(false);
    toast.success('Hilfsangebot erstellt');
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  const handleContactService = (service) => {
    // Navigate to chat with this user
    navigate(createPageUrl('Chat') + `?recipient=${service.id}&context=${encodeURIComponent(service.title)}`);
  };

  const handleSubmitBooking = async (bookingData) => {
    const newBooking = {
      id: Date.now(),
      serviceId: bookingData.serviceId,
      serviceTitle: selectedService.title,
      providerName: selectedService.author,
      date: bookingData.date,
      time: bookingData.time,
      status: 'pending',
      message: bookingData.message,
      reviewed: false,
    };
    setBookings(prev => [newBooking, ...prev]);
    setBookingDialogOpen(false);
    toast.success('Anfrage gesendet! Du erhältst eine Benachrichtigung bei Bestätigung.');
  };

  const handleReviewBooking = (booking) => {
    setSelectedBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {
    setBookings(prev => prev.map(b => 
      b.id === reviewData.bookingId ? { ...b, reviewed: true, rating: reviewData.rating } : b
    ));
    setServices(prev => prev.map(s => {
      if (s.id === selectedBooking?.serviceId) {
        const newReviewCount = s.reviewCount + 1;
        const newRating = Math.round((s.rating * s.reviewCount + reviewData.rating) / newReviewCount);
        return { ...s, rating: newRating, reviewCount: newReviewCount };
      }
      return s;
    }));
    setReviewDialogOpen(false);
    toast.success('Danke für deine Bewertung!');
  };

  const handleCancelBooking = (booking) => {
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? { ...b, status: 'cancelled' } : b
    ));
    toast.success('Buchung storniert');
  };

  const handleAcceptRequest = (request) => {
    setIncomingRequests(prev => prev.map(r => 
      r.id === request.id ? { ...r, status: 'confirmed' } : r
    ));
    toast.success(`Anfrage von ${request.requesterName} bestätigt!`);
  };

  const handleDeclineRequest = (request) => {
    setIncomingRequests(prev => prev.map(r => 
      r.id === request.id ? { ...r, status: 'declined' } : r
    ));
    toast.info(`Anfrage abgelehnt`);
  };

  const handleChatWithRequester = (request) => {
    navigate(createPageUrl('Chat') + `?recipient=${request.id}&context=${encodeURIComponent(request.serviceTitle)}`);
  };

  const handleRespondToHelpRequest = (request) => {
    toast.success('Danke! Der Anfragende wird benachrichtigt.');
    if (request.pointsOffered > 0) {
      setUserPoints(prev => prev + request.pointsOffered);
      toast.success(`+${request.pointsOffered} Punkte erhalten!`);
    }
  };

  const handleContactHelpRequest = (request) => {
    navigate(createPageUrl('Chat') + `?context=${encodeURIComponent(request.title)}`);
  };

  const handleCreateHelpRequest = async (formData) => {
    const newRequest = {
      id: Date.now(),
      ...formData,
      timeAgo: 'gerade eben',
      authorId: user?.id,
      floor: formData.isAnonymous ? null : '2. OG',
    };
    setHelpRequests(prev => [newRequest, ...prev]);
    
    if (formData.pointsOffered > 0) {
      setUserPoints(prev => prev - formData.pointsOffered);
    }
    
    setCreateHelpRequestDialogOpen(false);
    toast.success('Hilfsanfrage erstellt!');
  };

  const handleRedeemReward = (reward) => {
    setUserPoints(prev => prev - reward.points);
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setServiceDetailDialogOpen(true);
  };

  const handleServiceStatusChange = (serviceId, newStatus) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, status: newStatus } : s
    ));
  };

  const handleAddComment = async (serviceId, text) => {
    const newComment = {
      id: Date.now(),
      author: user?.user_metadata?.full_name || 'Anonym',
      text,
      created_at: new Date().toISOString(),
    };
    setServiceComments(prev => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), newComment]
    }));
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, commentCount: (s.commentCount || 0) + 1 } : s
    ));
    toast.success('Kommentar hinzugefügt');
  };

  const resetServiceFilters = () => {
    setServiceCategory('all');
    setServiceStatus('all');
    setServiceType('all');
    setSelectedFloor('all');
    setMinRating(0);
    setSelectedAvailability('all');
    setSortBy('relevance');
    setKeywords([]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (serviceCategory !== 'all') count++;
    if (serviceStatus !== 'all') count++;
    if (serviceType !== 'all') count++;
    if (selectedFloor !== 'all') count++;
    if (minRating > 0) count++;
    if (selectedAvailability !== 'all') count++;
    if (keywords.length > 0) count++;
    return count;
  };

  const filteredListings = listings.filter(l => {
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = !searchQuery || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = serviceCategory === 'all' || s.categoryId === serviceCategory;
    const matchesStatus = serviceStatus === 'all' || s.status === serviceStatus;
    const matchesType = serviceType === 'all' || s.type === serviceType;
    
    // Advanced filters
    const matchesFloor = selectedFloor === 'all' || 
      s.floor?.toLowerCase().includes(selectedFloor.replace('og', ' OG').toLowerCase());
    const matchesRating = !minRating || (s.rating >= minRating);
    const matchesAvailability = selectedAvailability === 'all' || 
      s.availability?.toLowerCase().includes(selectedAvailability.toLowerCase());
    const matchesKeywords = keywords.length === 0 || 
      keywords.some(kw => 
        s.title.toLowerCase().includes(kw.toLowerCase()) ||
        s.description.toLowerCase().includes(kw.toLowerCase())
      );
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType &&
           matchesFloor && matchesRating && matchesAvailability && matchesKeywords;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating_desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'date_desc':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'date_asc':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      default: // relevance
        return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">🏷️ Schwarzes Brett</h1>
          <Button 
            onClick={() => activeTab === 'hilfe' ? setCreateServiceDialogOpen(true) : setCreateDialogOpen(true)}
            className="bg-[#8B5CF6] hover:bg-violet-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" /> {activeTab === 'hilfe' ? 'Hilfe' : 'Anzeige'}
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="anzeigen" className="flex-1">
              <Tag className="w-4 h-4 mr-1" /> Anzeigen
            </TabsTrigger>
            <TabsTrigger value="hilfe" className="flex-1">
              <Users className="w-4 h-4 mr-1" /> Nachbarschaftshilfe
            </TabsTrigger>
            <TabsTrigger value="buchungen" className="flex-1">
              <Calendar className="w-4 h-4 mr-1" /> Meine
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <SEOHead
        title="Schwarzes Brett"
        description="Finde und biete Nachbarschaftshilfe, Dienstleistungen und Anzeigen in deiner Nachbarschaft."
        keywords={['Nachbarschaftshilfe', 'Dienstleistungen', 'Anzeigen', 'Schwarzes Brett']}
        type="website"
      />

      <div className="p-4 space-y-4">
        {/* Search */}
        {activeTab === 'hilfe' ? (
          <AdvancedSearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showAdvanced={showAdvancedFilters}
            onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
            selectedFloor={selectedFloor}
            onFloorChange={setSelectedFloor}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            selectedAvailability={selectedAvailability}
            onAvailabilityChange={setSelectedAvailability}
            sortBy={sortBy}
            onSortChange={setSortBy}
            keywords={keywords}
            onKeywordsChange={setKeywords}
            onReset={resetServiceFilters}
            activeFilterCount={getActiveFilterCount()}
          />
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="pl-10"
            />
          </div>
        )}

        {/* Tab: Anzeigen */}
        {activeTab === 'anzeigen' && (
          <>
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#8B5CF6] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Listings */}
            {filteredListings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Tag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Keine Anzeigen gefunden</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} onLike={handleLike} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Nachbarschaftshilfe */}
         {activeTab === 'hilfe' && (
           <>
             {/* Advanced Bulletin Filter */}
             <AdvancedBulletinFilter 
               onFilterChange={(filters) => {
                 // Filter services based on advanced filters
                 const filtered = services.filter(s => {
                   const matchSearch = !filters.search || s.title.toLowerCase().includes(filters.search.toLowerCase());
                   const matchType = filters.serviceType === 'Alle' || s.categoryId === filters.serviceType;
                   const matchRating = filters.minRating === 'Alle' || (s.rating || 0) >= parseInt(filters.minRating);
                   const matchAvail = filters.availability === 'Alle' || s.availability?.includes(filters.availability);
                   const matchVerified = !filters.onlyVerified || s.verified;
                   return matchSearch && matchType && matchRating && matchAvail && matchVerified;
                 });
                 // Optional: update services or apply filters
               }}
               totalListings={services.length}
             />

             {/* Points Overview */}
             <PointsOverview 
               points={userPoints} 
               onOpenRewards={() => setRewardsDialogOpen(true)} 
             />

            {/* Urgent Help Requests */}
            {helpRequests.filter(r => r.isUrgent).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h3 className="font-semibold text-red-700">Dringende Anfragen</h3>
                </div>
                {helpRequests.filter(r => r.isUrgent).map(request => (
                  <AnonymousRequestCard
                    key={request.id}
                    request={request}
                    onRespond={handleRespondToHelpRequest}
                    onContact={handleContactHelpRequest}
                  />
                ))}
              </div>
            )}

            {/* Quick Action: Create Help Request */}
            <div className="flex gap-2">
              <Button 
                onClick={() => setCreateHelpRequestDialogOpen(true)}
                variant="outline"
                className="flex-1"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Hilfe anfragen
              </Button>
              <Button 
                onClick={() => setCreateServiceDialogOpen(true)}
                className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Hilfe anbieten
              </Button>
            </div>

            {/* Non-Urgent Help Requests */}
            {helpRequests.filter(r => !r.isUrgent).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Aktuelle Anfragen</h3>
                {helpRequests.filter(r => !r.isUrgent).map(request => (
                  <AnonymousRequestCard
                    key={request.id}
                    request={request}
                    onRespond={handleRespondToHelpRequest}
                    onContact={handleContactHelpRequest}
                  />
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Hilfsangebote</h3>
              <ServiceFilters 
                selectedCategory={serviceCategory}
                onCategoryChange={setServiceCategory}
                selectedStatus={serviceStatus}
                onStatusChange={setServiceStatus}
                selectedType={serviceType}
                onTypeChange={setServiceType}
                onReset={resetServiceFilters}
              />
            </div>

            {/* Services */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Keine Hilfsangebote gefunden</p>
                <Button 
                  onClick={() => setCreateServiceDialogOpen(true)}
                  className="mt-3 bg-[#8B5CF6] hover:bg-violet-700"
                  size="sm"
                >
                  Hilfe anbieten
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredServices.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onBook={handleBookService}
                    onContact={handleContactService}
                    onClick={handleServiceClick}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Meine Buchungen */}
        {activeTab === 'buchungen' && (
          <>
            {/* Sub-Navigation */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMyBookingsView('liste')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  myBookingsView === 'liste'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Liste
              </button>
              <button
                onClick={() => setMyBookingsView('kalender')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  myBookingsView === 'kalender'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Kalender
              </button>
              <button
                onClick={() => setMyBookingsView('anfragen')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  myBookingsView === 'anfragen'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📥 Eingehend
                {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {incomingRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>

            {/* Buchungsliste */}
            {myBookingsView === 'liste' && (
              <>
                <h2 className="font-semibold text-gray-900 mb-3">Meine Buchungen</h2>
                <MyBookings 
                  bookings={bookings}
                  onReview={handleReviewBooking}
                  onCancel={handleCancelBooking}
                />
              </>
            )}

            {/* Kalenderansicht */}
            {myBookingsView === 'kalender' && (
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <BookingCalendar 
                  bookings={bookings}
                  onSelectBooking={(booking) => setSelectedBooking(booking)}
                  onReview={handleReviewBooking}
                />
              </div>
            )}

            {/* Eingehende Anfragen (für Anbieter) */}
            {myBookingsView === 'anfragen' && (
              <>
                <h2 className="font-semibold text-gray-900 mb-3">Eingehende Anfragen</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Hier siehst du Buchungsanfragen für deine angebotenen Hilfen
                </p>
                <IncomingRequests 
                  requests={incomingRequests}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                  onChat={handleChatWithRequester}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Create Listing Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Anzeige erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Kategorie</label>
              <Select value={newListing.category} onValueChange={(v) => setNewListing(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Titel *</label>
              <Input 
                value={newListing.title}
                onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Fahrrad zu verschenken"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Beschreibung *</label>
              <Textarea 
                value={newListing.description}
                onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibe dein Angebot..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Preis (optional)</label>
              <Input 
                value={newListing.price}
                onChange={(e) => setNewListing(prev => ({ ...prev, price: e.target.value }))}
                placeholder="z.B. 25€ oder VB"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} className="flex-1 bg-[#8B5CF6] hover:bg-violet-700">
                Anzeige erstellen
              </Button>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Service Dialog */}
      <CreateServiceDialog 
        open={createServiceDialogOpen}
        onOpenChange={setCreateServiceDialogOpen}
        onSubmit={handleCreateService}
        userName={user?.user_metadata?.full_name}
      />

      {/* Booking Dialog */}
      <BookingDialog 
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        service={selectedService}
        onSubmit={handleSubmitBooking}
      />

      {/* Review Dialog */}
      <ReviewDialog 
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        booking={selectedBooking}
        onSubmit={handleSubmitReview}
      />

      {/* Service Detail Dialog */}
      <ServiceDetailDialog 
        open={serviceDetailDialogOpen}
        onOpenChange={setServiceDetailDialogOpen}
        service={selectedService}
        onStatusChange={handleServiceStatusChange}
        onAddComment={handleAddComment}
        onBook={handleBookService}
        onContact={handleContactService}
        isOwner={selectedService?.author === (user?.user_metadata?.full_name || 'Anonym')}
        comments={selectedService ? (serviceComments[selectedService.id] || []) : []}
      />

      {/* Rewards Dialog */}
      <RewardsDialog
        open={rewardsDialogOpen}
        onOpenChange={setRewardsDialogOpen}
        userPoints={userPoints}
        onRedeem={handleRedeemReward}
      />

      {/* Create Help Request Dialog */}
      <CreateAnonymousRequestDialog
        open={createHelpRequestDialogOpen}
        onOpenChange={setCreateHelpRequestDialogOpen}
        onSubmit={handleCreateHelpRequest}
        userPoints={userPoints}
      />
    </div>
  );
}