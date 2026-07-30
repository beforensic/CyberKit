import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle, Trash2, ChevronLeft, BookOpen } from 'lucide-react';
import { getFavorites, clearAllFavorites } from '../utils/storage';
import { useResources } from '../hooks/useResources';
import ResourceCard from '../components/ResourceCard';

export default function Favorites() {
  const navigate = useNavigate();
  const { resources: catalogResources, loading: catalogLoading, error: catalogError } = useResources();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavorites());

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(getFavorites());
    window.addEventListener('favoritesUpdated', syncFavorites);
    return () => window.removeEventListener('favoritesUpdated', syncFavorites);
  }, []);

  const resources = useMemo(() => {
    if (favoriteIds.length === 0) return [];

    const byId = new Map(catalogResources.map((resource) => [resource.id, resource]));
    return favoriteIds
      .map((id) => byId.get(id))
      .filter((resource): resource is NonNullable<typeof resource> => resource != null);
  }, [catalogResources, favoriteIds]);

  const handleClearAll = () => {
    if (confirm('Voulez-vous vraiment supprimer tous vos favoris ?')) {
      clearAllFavorites();
    }
  };

  const waitingForCatalog = favoriteIds.length > 0 && catalogLoading;

  if (waitingForCatalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange" aria-hidden="true" />
        <span className="sr-only">Chargement de vos favoris</span>
      </div>
    );
  }

  const error = catalogError ? 'Impossible de charger vos favoris.' : null;

  return (
    <div className="page-light py-12 px-4 pb-8 text-left">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button
              onClick={() => navigate('/')}
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
        ) : favoriteIds.length === 0 || resources.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun favori pour le moment</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Parcourez la bibliothèque et cliquez sur le cœur pour retrouver vos ressources préférées ici.
            </p>
            <button
              onClick={() => navigate('/resources')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white rounded-2xl font-bold hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange/20"
            >
              <BookOpen className="w-5 h-5" /> Découvrir les ressources
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
