import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Loader, Filter, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { supabase, Resource, Theme, ResourceType } from '../lib/supabase';
import { saveThemeInterest } from '../utils/storage';
import ResourceCard from '../components/ResourceCard';
import ChatBot from '../components/ChatBot';

interface ResourcesProps {
  initialFilter?: string;
  onNavigate?: (page: 'home' | 'quiz' | 'resources' | 'admin' | 'contact' | 'legal') => void;
}

type SortOption = 'recent' | 'a-z' | 'z-a';

export default function Resources({ initialFilter, onNavigate }: ResourcesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('Tous');
  const [selectedType, setSelectedType] = useState<string>('Tout');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOption>('recent');
  const [resources, setResources] = useState<Resource[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const trackedSearches = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialFilter) {
      setSelectedTheme(initialFilter);
    }
  }, [initialFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [themesResponse, resourcesResponse, typesResponse] = await Promise.all([
        supabase.from('themes').select('*').order('title'),
        supabase
          .from('resources')
          .select(`
            *,
            theme:themes(*),
            resource_type:resource_types(*)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('resource_types').select('*').order('order')
      ]);

      if (themesResponse.error) throw themesResponse.error;
      if (resourcesResponse.error) throw resourcesResponse.error;
      if (typesResponse.error) throw typesResponse.error;

      setThemes(themesResponse.data || []);
      setResources(resourcesResponse.data || []);
      setResourceTypes(typesResponse.data || []);

    } catch (error) {
      console.error('Erreur chargement ressources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des ressources "Épinglées" (Essentielles)
  const pinnedResources = useMemo(() => {
    // On prend les ressources qui ont is_pinned à true dans la DB
    return resources.filter(r => r.is_pinned === true).slice(0, 5);
  }, [resources]);

  const themeOptions = useMemo(() => {
    return ['Tous', ...themes.map((t) => t.title).sort()];
  }, [themes]);

  const typeOptions = useMemo(() => {
    return ['Tout', ...resourceTypes.map((t) => t.name)];
  }, [resourceTypes]);

  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const filteredResources = useMemo(() => {
    const filtered = resources.filter((resource) => {
      const matchesTheme = selectedTheme === 'Tous' || resource.theme?.title === selectedTheme;
      const matchesType = selectedType === 'Tout' || resource.resource_type?.name === selectedType;
      const matchesTag = !selectedTag || resource.tags?.includes(selectedTag);

      const matchesSearch = (() => {
        if (searchTerm === '') return true;
        const term = normalizeText(searchTerm);
        return (
          normalizeText(resource.title).includes(term) ||
          (resource.description && normalizeText(resource.description).includes(term)) ||
          resource.tags?.some(t => normalizeText(t).includes(term))
        );
      })();

      return matchesTheme && matchesType && matchesTag && matchesSearch;
    });

    const sorted = [...filtered];
    if (sortOrder === 'a-z') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOrder === 'z-a') sorted.sort((a, b) => b.title.localeCompare(a.title));

    return sorted;
  }, [searchTerm, selectedTheme, selectedType, selectedTag, resources, sortOrder]);

  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResources.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredResources, currentPage]);

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTheme('Tous');
    setSelectedType('Tout');
    setSelectedTag(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="w-10 h-10 text-[#E8650A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <ChatBot />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ressources</h1>
          <p className="text-slate-600">{filteredResources.length} ressources disponibles</p>
        </div>

        {/* Zone Filtres */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-[#E8650A]" />
            <h2 className="text-lg font-bold text-slate-800">Filtres</h2>
            {(selectedTheme !== 'Tous' || searchTerm !== '') && (
              <button onClick={clearFilters} className="ml-auto text-sm text-slate-400 hover:text-[#E8650A] flex items-center gap-1">
                <X className="w-4 h-4" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#E8650A] focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {themeOptions.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedTheme === theme ? 'bg-[#E8650A] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION ESSENTIELS : On n'affiche que si on ne recherche rien */}
        {searchTerm === '' && selectedTheme === 'Tous' && pinnedResources.length > 0 && (
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Star className="w-5 h-5 text-[#E8650A] fill-[#E8650A]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Par où commencer ?</h2>
                <p className="text-slate-500">Les ressources indispensables sélectionnées pour vous</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {pinnedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={{ ...resource, isPinned: true }}
                  typeName={resource.resource_type?.name}
                  onNavigateToContact={() => onNavigate?.('contact')}
                />
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-2 text-slate-300">
              <p className="text-xs font-bold uppercase tracking-widest">Toutes les ressources</p>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>
          </div>
        )}

        {/* Grille Principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              typeName={resource.resource_type?.name}
              onNavigateToContact={() => onNavigate?.('contact')}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-lg border bg-white disabled:opacity-30"
            >
              <ChevronLeft />
            </button>
            <span className="font-bold text-slate-700">Page {currentPage} / {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-lg border bg-white disabled:opacity-30"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}