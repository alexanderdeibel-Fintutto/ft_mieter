import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Heart, Package, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import ListingCard from '../components/marketplace/ListingCard';
import CreateListingDialog from '../components/marketplace/CreateListingDialog';
import ContactSellerDialog from '../components/marketplace/ContactSellerDialog';
import AdvancedMarketplaceFilter from '../components/marketplace/AdvancedMarketplaceFilter';
import MarketplaceFilters, { ActiveFilterBadges, CONDITIONS, SORT_OPTIONS } from '../components/marketplace/MarketplaceFilters';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useFeatureLimits } from '../components/featuregate/useFeatureLimits';
import MarketplaceUpgradeNudge from '../components/featuregate/MarketplaceUpgradeNudge';

// Demo data
const DEMO_LISTINGS = [
  {
    id: 1,
    type: 'offer',
    transactionType: 'sell',
    title: 'IKEA Kallax Regal 4x4',
    description: 'Gut erhaltenes Kallax Regal in weiß. Leichte Gebrauchsspuren. Selbstabholung im 3. Stock.',
    category: 'furniture',
    condition: 'good',
    price: 45,
    images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop'],
    creatorId: 'user-101',
    creatorName: 'Maria K.',
    createdAt: '2026-01-20T10:00:00',
  },
  {
    id: 2,
    type: 'offer',
    transactionType: 'gift',
    title: 'Kinderbücher Paket (20 Stück)',
    description: 'Verschiedene Kinderbücher für 3-6 Jahre. Guter Zustand, einige mit kleinen Kratzern.',
    category: 'books',
    condition: 'used',
    price: null,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop'],
    creatorId: 'user-102',
    creatorName: 'Jonas M.',
    createdAt: '2026-01-19T15:30:00',
  },
  {
    id: 3,
    type: 'offer',
    transactionType: 'trade',
    title: 'Zimmerpflanzen gegen Ableger',
    description: 'Habe diverse Zimmerpflanzen (Monstera, Pothos) und suche Ableger für meine Sammlung.',
    category: 'garden',
    condition: 'good',
    tradeFor: 'Pflanzen-Ableger, Sukkulenten',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop'],
    creatorId: 'user-103',
    creatorName: 'Peter S.',
    createdAt: '2026-01-18T09:00:00',
  },
  {
    id: 4,
    type: 'search',
    transactionType: 'sell',
    title: 'Suche Fahrrad für Kind (20 Zoll)',
    description: 'Suche ein gebrauchtes Kinderfahrrad, 20 Zoll. Zustand sollte noch gut sein.',
    category: 'kids',
    condition: null,
    price: 50,
    images: [],
    creatorId: 'user-101',
    creatorName: 'Maria K.',
    createdAt: '2026-01-17T14:00:00',
  },
  {
    id: 5,
    type: 'offer',
    transactionType: 'sell',
    title: 'Samsung Galaxy Tab A8',
    description: 'Tablet in sehr gutem Zustand, 64GB, mit Hülle und Ladekabel. Funktioniert einwandfrei.',
    category: 'electronics',
    condition: 'like_new',
    price: 120,
    images: ['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=300&fit=crop'],
    creatorId: 'user-104',
    creatorName: 'Anna L.',
    createdAt: '2026-01-16T11:00:00',
  },
  {
    id: 6,
    type: 'offer',
    transactionType: 'gift',
    title: 'Umzugskartons (15 Stück)',
    description: 'Stabile Umzugskartons, einmal benutzt. Müssen bis Freitag abgeholt werden!',
    category: 'household',
    condition: 'good',
    images: [],
    creatorId: 'user-102',
    creatorName: 'Jonas M.',
    createdAt: '2026-01-15T16:00:00',
  },
];

export default function Marktplatz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { usage: listingCount } = useFeatureLimits('marketplaceListings');
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [contactListing, setContactListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTransactionType, setFilterTransactionType] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
    if (user) {
      loadListings();
    }
  }, [user, authLoading]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const dbListings = await base44.entities.MarketplaceListing.list('-created_date');
      if (dbListings && dbListings.length > 0) {
        // Map DB listings to display format
        const mappedListings = dbListings.map(l => ({
          id: l.id,
          type: 'offer',
          transactionType: l.price_type === 'verschenken' ? 'gift' : l.price_type === 'tauschen' ? 'trade' : 'sell',
          title: l.title,
          description: l.description,
          category: l.category,
          condition: l.condition,
          price: l.price,
          images: l.photos || [],
          creatorId: l.created_by,
          creatorName: l.created_by?.split('@')[0] || 'Unbekannt',
          createdAt: l.created_date,
          status: l.status,
          location: l.location
        }));
        setListings([...mappedListings, ...DEMO_LISTINGS]);
      } else {
        setListings(DEMO_LISTINGS);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      setListings(DEMO_LISTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUserId = user?.id || 'current-user';

  const handleCreateListing = async (listingData) => {
    try {
      if (editingListing) {
        // Update existing listing
        await base44.entities.MarketplaceListing.update(editingListing.id, {
          title: listingData.title,
          description: listingData.description,
          category: listingData.category,
          condition: listingData.condition,
          price: listingData.price,
          price_type: listingData.transactionType === 'gift' ? 'verschenken' : 
                      listingData.transactionType === 'trade' ? 'tauschen' : 'vb',
          photos: listingData.images,
          status: 'aktiv'
        });
        toast.success('Anzeige aktualisiert!');
        setEditingListing(null);
      } else {
        // Create new listing in database
        const newDbListing = await base44.entities.MarketplaceListing.create({
          title: listingData.title,
          description: listingData.description,
          category: listingData.category || 'sonstiges',
          condition: listingData.condition || 'gut',
          price: listingData.price || 0,
          price_type: listingData.transactionType === 'gift' ? 'verschenken' : 
                      listingData.transactionType === 'trade' ? 'tauschen' : 'vb',
          photos: listingData.images || [],
          contact_method: 'in_app_chat',
          status: 'aktiv'
        });
        toast.success('Anzeige veröffentlicht!');
      }
      loadListings();
    } catch (error) {
      console.error('Fehler:', error);
      toast.error('Fehler beim Speichern der Anzeige');
    }
  };

  const handleContact = (listing) => {
    setContactListing(listing);
    setShowContactDialog(true);
  };

  const handleSendMessage = (listing, message) => {
    // Navigate to chat with the message
    navigate(createPageUrl('Chat') + `?recipient=${listing.creatorId}&message=${encodeURIComponent(message)}&listingId=${listing.id}`);
    toast.success('Nachricht gesendet!');
  };

  const handleFavorite = (listing) => {
    setFavorites(prev => 
      prev.includes(listing.id)
        ? prev.filter(id => id !== listing.id)
        : [...prev, listing.id]
    );
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterTransactionType('all');
    setFilterCondition('all');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setSortBy('date_desc');
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || listing.type === filterType;
    const matchesCategory = filterCategory === 'all' || listing.category === filterCategory;
    const matchesTransaction = filterTransactionType === 'all' || listing.transactionType === filterTransactionType;
    const matchesCondition = filterCondition === 'all' || listing.condition === filterCondition;
    
    let matchesPrice = true;
    if (filterPriceMin && listing.price) {
      matchesPrice = listing.price >= parseFloat(filterPriceMin);
    }
    if (filterPriceMax && listing.price) {
      matchesPrice = matchesPrice && listing.price <= parseFloat(filterPriceMax);
    }

    return matchesSearch && matchesType && matchesCategory && matchesTransaction && matchesCondition && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'date_desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'price_asc':
        return (a.price || 0) - (b.price || 0);
      case 'price_desc':
        return (b.price || 0) - (a.price || 0);
      case 'title_asc':
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const myListings = listings.filter(l => l.creatorId === currentUserId);
  const favoriteListings = listings.filter(l => favorites.includes(l.id));

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <MarketplaceUpgradeNudge onUpgradeClick={() => {}} />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Nachbarschafts-Marktplatz</h1>
            <p className="text-emerald-100 text-sm">Kaufen, Verkaufen, Tauschen</p>
          </div>
          <Button 
            onClick={() => {
              setEditingListing(null);
              setShowCreateDialog(true);
            }}
            size="sm"
            className="bg-white text-emerald-600 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 mr-1" /> Anzeige
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Was suchst du?"
            className="pl-9 bg-white/90 border-0"
          />
        </div>
      </div>

      <div className="px-4 -mt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white shadow-sm border mb-4">
            <TabsTrigger value="browse" className="flex-1">
              <ShoppingBag className="w-4 h-4 mr-1" /> Stöbern
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1">
              <Heart className="w-4 h-4 mr-1" /> Favoriten
              {favorites.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="my" className="flex-1">
              <Package className="w-4 h-4 mr-1" /> Meine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-0">
            {/* Advanced Filter */}
            <AdvancedMarketplaceFilter 
              onFilterChange={(filters) => {
                const filtered = listings.filter(l => {
                  const matchSearch = !filters.search || l.title.toLowerCase().includes(filters.search.toLowerCase());
                  const matchCategory = filters.category === 'Alle' || l.category === filters.category;
                  const matchCondition = filters.condition === 'Alle' || l.condition === filters.condition;
                  const matchPrice = (!filters.minPrice || l.price >= filters.minPrice) &&
                                   (!filters.maxPrice || l.price <= filters.maxPrice);
                  return matchSearch && matchCategory && matchCondition && matchPrice;
                });
                setListings(filtered.length > 0 ? filtered : listings);
              }}
              totalListings={listings.length}
            />

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-violet-50 border-violet-200' : ''}
            >
              <Filter className="w-4 h-4 mr-1" />
              Weitere Filter
            </Button>

            {/* Filters */}
            {showFilters && (
              <MarketplaceFilters
                type={filterType}
                onTypeChange={setFilterType}
                category={filterCategory}
                onCategoryChange={setFilterCategory}
                transactionType={filterTransactionType}
                onTransactionTypeChange={setFilterTransactionType}
                condition={filterCondition}
                onConditionChange={setFilterCondition}
                sortBy={sortBy}
                onSortChange={setSortBy}
                priceMin={filterPriceMin}
                priceMax={filterPriceMax}
                onPriceMinChange={setFilterPriceMin}
                onPriceMaxChange={setFilterPriceMax}
                onClearFilters={handleClearFilters}
              />
            )}

            {/* Active Filter Badges above results */}
            <ActiveFilterBadges
              type={filterType}
              onTypeChange={setFilterType}
              category={filterCategory}
              onCategoryChange={setFilterCategory}
              transactionType={filterTransactionType}
              onTransactionTypeChange={setFilterTransactionType}
              condition={filterCondition}
              onConditionChange={setFilterCondition}
              priceMin={filterPriceMin}
              priceMax={filterPriceMax}
              onPriceMinChange={setFilterPriceMin}
              onPriceMaxChange={setFilterPriceMax}
              sortBy={sortBy}
            />

            {/* Listings Grid */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUserId={currentUserId}
                    onContact={handleContact}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes(listing.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Keine Anzeigen gefunden</p>
                <Button
                  onClick={() => {
                    setEditingListing(null);
                    setShowCreateDialog(true);
                  }}
                  className="mt-4 bg-[#8B5CF6] hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Erste Anzeige erstellen
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            {favoriteListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUserId={currentUserId}
                    onContact={handleContact}
                    onFavorite={handleFavorite}
                    isFavorite={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Noch keine Favoriten</p>
                <p className="text-sm text-gray-400 mt-1">Tippe auf ❤️ um Anzeigen zu speichern</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="mt-0">
            {myListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUserId={currentUserId}
                    onContact={handleContact}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes(listing.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Du hast noch keine Anzeigen</p>
                <Button
                  onClick={() => {
                    setEditingListing(null);
                    setShowCreateDialog(true);
                  }}
                  className="mt-4 bg-[#8B5CF6] hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Anzeige erstellen
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateListingDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setEditingListing(null);
        }}
        onSubmit={handleCreateListing}
        editListing={editingListing}
      />

      <ContactSellerDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        listing={contactListing}
        onSend={handleSendMessage}
      />
    </div>
  );
}