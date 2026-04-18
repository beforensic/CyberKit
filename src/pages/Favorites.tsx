import { useState, useEffect } from 'react';
import { Heart, AlertCircle, Trash2, ChevronLeft, BookOpen } from 'lucide-react';
import { supabase, Resource } from '../lib/supabase';
import { getFavorites, clearAllFavorites } from '../utils/storage';
import ResourceCard from '../components/ResourceCard';

interface FavoritesProps {
  onNavigate: (page: any) => void;
}

export default function Favorites({ onNavigate }: FavoritesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    const favoriteIds = getFavorites();

    if (favoriteIds.length === 0) {
      setResources([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('resources')
        .select('*, theme:themes(title)')
        .in('id', favoriteIds);

      if (supabaseError) throw supabaseError;
      setResources(data || []);
    } catch (err) {
      console.error('Erreur chargement favoris:', err);
      setError('Impossible de charger vos favoris.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();

    const handleUpdate = () => fetchFavorites();
    window.addEventListener('favoritesUpdated', handleUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleUpdate);
  }, []);

  const handleClearAll = () => {
    if (confirm('Voulez-vous vraiment supprimer tous vos favoris ?')) {
      clearAllFavorites();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8650A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-32 text-left">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button
              onClick={() => onNavigate('home')}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-2 mb-4 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
            </button>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              Mes Favoris <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            </h1>
          </div>

          {resources.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" /> Tout effacer
            </button>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4 text-red-700">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun favori pour le moment</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Parcourez la bibliothèque et cliquez sur le cœur pour retrouver vos ressources préférées ici.
            </p>
            <button
              onClick={() => onNavigate('resources')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E8650A] text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <BookOpen className="w-5 h-5" /> Découvrir les ressources
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}