import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Check, Clock, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

function PackageCard({ pkg, onPickup }) {
  const isPending = pkg.status === 'pending';
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${isPending ? 'border-[#8B5CF6]' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${isPending ? 'bg-violet-100' : 'bg-gray-100'}`}>
          <Package className={`w-6 h-6 ${isPending ? 'text-[#8B5CF6]' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{pkg.carrier || 'Paket'}</h3>
            {isPending ? (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> Wartet
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Abgeholt
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">{pkg.description || 'Paket zur Abholung'}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {pkg.location || 'Hausmeister / Nachbar'}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Angekommen: {new Date(pkg.received_at || pkg.created_at).toLocaleDateString('de-DE', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      
      {isPending && (
        <Button 
          onClick={() => onPickup(pkg.id)}
          className="w-full mt-3 bg-[#8B5CF6] hover:bg-violet-700"
        >
          <Check className="w-4 h-4 mr-1" /> Als abgeholt markieren
        </Button>
      )}
    </div>
  );
}

export default function Pakete() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadPackages();
  }, [user, authLoading]);

  const loadPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('package_notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) setPackages(data);
    setLoading(false);
  };

  const handlePickup = async (packageId) => {
    const { error } = await supabase
      .from('package_notifications')
      .update({ status: 'picked_up', picked_up_at: new Date().toISOString() })
      .eq('id', packageId);

    if (error) {
      toast.error('Fehler beim Aktualisieren');
    } else {
      toast.success('Paket als abgeholt markiert!');
      loadPackages();
    }
  };

  const pendingPackages = packages.filter(p => p.status === 'pending');
  const pickedUpPackages = packages.filter(p => p.status === 'picked_up');
  const filteredPackages = filter === 'pending' ? pendingPackages : pickedUpPackages;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">📦 Pakete</h1>
      </header>

      {/* Stats */}
      {pendingPackages.length > 0 && (
        <div className="mx-4 mt-4 p-4 bg-[#8B5CF6] text-white rounded-xl">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div>
              <p className="text-2xl font-bold">{pendingPackages.length}</p>
              <p className="text-violet-200 text-sm">Paket(e) warten auf dich</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="p-4 flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'pending' 
              ? 'bg-[#8B5CF6] text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Wartend ({pendingPackages.length})
        </button>
        <button
          onClick={() => setFilter('picked_up')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'picked_up' 
              ? 'bg-[#8B5CF6] text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Abgeholt ({pickedUpPackages.length})
        </button>
      </div>

      <div className="px-4 space-y-3">
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{filter === 'pending' ? 'Keine wartenden Pakete' : 'Keine abgeholten Pakete'}</p>
          </div>
        ) : (
          filteredPackages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} onPickup={handlePickup} />
          ))
        )}
      </div>
    </div>
  );
}