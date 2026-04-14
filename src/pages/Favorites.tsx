import { useState, useEffect } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { supabase, Resource } from '../lib/supabase';
import { getFavorites, clearAllFavorites } from '../utils/storage';
import ResourceCard from '../components/ResourceCard';

interface FavoritesProps {
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'admin' | 'contact' | 'legal' | 'favorites', filter?: string) => void;
}

export default function Favorites({ onNavigate }: FavoritesProps) {
  const [favorites, setFavorites] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoriteIds = getFavorites();

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*, theme:themes(*), resource_type:resource_types(*)')
        .in('id', favoriteIds);

      if (error) throw error;

      const orderedResources = favoriteIds
        .map(id => data?.find(r => r.id === id))
        .filter((r): r is Resource => r !== undefined);

      setFavorites(orderedResources);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleClearAll = () => {
    setShowConfirmation(true);
  };

  const confirmClearAll = () => {
    clearAllFavorites();
    setFavorites([]);
    setShowConfirmation(false);
  };

  const handleFavoriteChange = () => {
    loadFavorites();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement de vos favoris...</p>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Aucun favori pour le moment
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'avez pas encore de ressources favorites. Cliquez sur le ♥ d'une ressource pour l'ajouter ici.
            </p>
            <button
              onClick={() => onNavigate('resources')}
              className="px-8 py-4 bg-[#E8650A] text-white font-bold rounded-xl shadow-lg hover:bg-[#D15808] transition-all hover:scale-105 active:scale-95"
            >
              Découvrir les ressources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mes ressources favorites
            </h1>
            <p className="text-gray-600">
              {favorites.length} ressource{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            Tout supprimer
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {favorites.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              typeColor={resource.resource_type?.color}
              typeName={resource.resource_type?.name}
              onNavigateToContact={() => onNavigate('contact')}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              Vos favoris sont sauvegardés sur cet appareil. Ils seront perdus si vous videz le cache de votre navigateur.
            </p>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Voulez-vous supprimer tous vos favoris ? Cette action est irréversible.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
              >
                Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
