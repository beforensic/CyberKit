import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Loader, Filter, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Resource, ResourceType } from '../lib/supabase';
import { saveThemeInterest } from '../utils/storage';
import ResourceCard from '../components/ResourceCard';
import KeywordTooltip from '../components/KeywordTooltip';
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
  const [pinnedResources, setPinnedResources] = useState<Resource[]>([]);
  const [themes, setThemes] = useState<{ id: string; title: string }[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const trackedSearches = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchThemesAndResources();
  }, []);

  useEffect(() => {
    if (initialFilter) {
      setSelectedTheme(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    setShowAllTags(false);
  }, [selectedTheme]);

  const fetchThemesAndResources = async () => {
    try {
      setLoading(true);

      const [themesResponse, resourcesResponse, typesResponse] = await Promise.all([
        supabase.from('themes').select('id, title').order('title'),
        supabase
          .from('resources')
          .select(`
            *,
            theme:themes(id, title, description, slug),
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

      // Fetch pinned resources
      const pinnedPatterns = [
        "%Phishing%Guide complet%prévention%",
        "%politique de sauvegarde%3-2-1%",
        "%fraude au président%",
        "%double%authentification%utilisateur final%",
        "%règles d%or du mot de passe%"
      ];

      const pinnedResourcesData: Resource[] = [];
      for (const pattern of pinnedPatterns) {
        const { data, error } = await supabase
          .from('resources')
          .select(`
            *,
            theme:themes(id, title, description, slug),
            resource_type:resource_types(*)
          `)
          .ilike('title', pattern)
          .limit(1);

        if (!error && data && data.length > 0) {
          pinnedResourcesData.push(data[0]);
        }
      }

      setPinnedResources(pinnedResourcesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = useMemo(() => {
    return ['Tous', ...themes.map((t) => t.title).sort()];
  }, [themes]);

  const typeOptions = useMemo(() => {
    return ['Tout', ...resourceTypes.map((t) => t.name)];
  }, [resourceTypes]);

  const allTagsWithFrequency = useMemo(() => {
    const tagFrequency = new Map<string, number>();

    const resourcesToConsider = selectedTheme === 'Tous'
      ? resources
      : resources.filter(r => r.theme?.title === selectedTheme);

    resourcesToConsider.forEach((resource) => {
      resource.tags?.forEach((tag) => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [resources, selectedTheme]);

  const displayedTags = useMemo(() => {
    if (showAllTags || selectedTheme !== 'Tous') {
       return [...allTagsWithFrequency].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase(), 'fr', { sensitivity: 'base' })
);
    }
    return allTagsWithFrequency.slice(0, 12);
  }, [allTagsWithFrequency, showAllTags, selectedTheme]);

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const filteredResources = useMemo(() => {
    const filtered = resources.filter((resource) => {
      const matchesTheme =
        selectedTheme === 'Tous' || resource.theme?.title === selectedTheme;

      const matchesType = selectedType === 'Tout' || resource.resource_type?.name === selectedType;

      const matchesTag =
        !selectedTag || resource.tags?.includes(selectedTag);

      const matchesSearch = (() => {
        if (searchTerm === '') return true;

        const normalizedSearchTerm = normalizeText(searchTerm);

        const titleMatch = normalizeText(resource.title).includes(normalizedSearchTerm);

        const descriptionMatch = resource.description
          ? normalizeText(resource.description).includes(normalizedSearchTerm)
          : false;

        const tagsMatch = resource.tags?.some((tag) =>
          normalizeText(tag).includes(normalizedSearchTerm)
        ) || false;

        const themeMatch = resource.theme?.title
          ? normalizeText(resource.theme.title).includes(normalizedSearchTerm)
          : false;

        const typeMatch = resource.resource_type?.name
          ? normalizeText(resource.resource_type.name).includes(normalizedSearchTerm)
          : false;

        return titleMatch || descriptionMatch || tagsMatch || themeMatch || typeMatch;
      })();

      return matchesTheme && matchesType && matchesTag && matchesSearch;
    });

    const sorted = [...filtered];
    switch (sortOrder) {
      case 'a-z':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));
        break;
      case 'z-a':
        sorted.sort((a, b) => b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' }));
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    return sorted;
  }, [searchTerm, selectedTheme, selectedType, selectedTag, resources, sortOrder]);

  const trackSearch = async (query: string, resultsCount: number) => {
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery || trimmedQuery.length < 3) return;
    if (trackedSearches.current.has(trimmedQuery)) return;

    trackedSearches.current.add(trimmedQuery);

    try {
      await supabase
        .from('search_queries')
        .insert({
          query: trimmedQuery,
          results_count: resultsCount
        });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la recherche:', error);
    }
  };

  useEffect(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    if (searchTerm.trim().length >= 3) {
      searchDebounceTimer.current = setTimeout(() => {
        const resultsCount = filteredResources.length;
        trackSearch(searchTerm, resultsCount);
      }, 1500);
    }

    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchTerm, filteredResources]);

  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredResources.slice(startIndex, endIndex);
  }, [filteredResources, currentPage, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTheme, selectedType, selectedTag]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTheme('Tous');
    setSelectedType('Tout');
    setSelectedTag(null);
    setSortOrder('recent');
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim().length >= 3) {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
      const resultsCount = filteredResources.length;
      trackSearch(searchTerm, resultsCount);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement des ressources...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedTheme !== 'Tous' || selectedType !== 'Tout' || selectedTag !== null || searchTerm !== '';

  const getTypeColor = (typeName: string) => {
    switch (typeName) {
      case 'Présentation':
        return '#3B82F6';
      case 'Guide':
        return '#10B981';
      case 'Mémo':
        return '#F59E0B';
      case 'Infographie':
        return '#8B5CF6';
      case 'Vidéo':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#FAFAFA' }}>
      <ChatBot />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#2D3748' }}>
            Ressources
          </h1>
          <p className="text-slate-600">
            {filteredResources.length} ressource{filteredResources.length > 1 ? 's' : ''} disponible{filteredResources.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold" style={{ color: '#2D3748' }}>Filtres</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-slate-500 hover:text-primary flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, description ou tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-slate-700 min-w-[60px]">Thème :</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme}
                      onClick={() => {
                        setSelectedTheme(theme);
                        setSelectedTag(null);
                        if (theme !== 'Tous') {
                          saveThemeInterest(theme);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        selectedTheme === theme
                          ? 'bg-primary text-white shadow-lg shadow-primary-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-slate-700 min-w-[60px]">Type :</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {typeOptions.map((type) => {
                    const getTooltipText = (typeName: string) => {
                      switch (typeName) {
                        case 'Présentation':
                          return 'Diaporamas à projeter en réunion ou en formation';
                        case 'Guide':
                          return 'Documents pratiques à lire et à conserver';
                        case 'Mémo':
                          return 'Fiches courtes à garder sous la main au quotidien';
                        case 'Infographie':
                          return 'Visuels synthétiques pour comprendre d\'un coup d\'œil';
                        case 'Vidéo':
                          return 'Contenus audiovisuels à visionner en autonomie';
                        case 'Audio':
                          return 'Podcasts et contenus à écouter';
                        case 'Lien externe':
                          return 'Ressources sélectionnées sur des sites partenaires';
                        default:
                          return '';
                      }
                    };

                    const tooltipText = getTooltipText(type);

                    return (
                      <div key={type} className="relative group">
                        <button
                          onClick={() => setSelectedType(type)}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                            selectedType === type
                              ? 'bg-primary text-white shadow-lg shadow-primary-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                        {tooltipText && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[#1B3A5C] text-white text-xs rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            {tooltipText}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#1B3A5C]"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section Par où commencer - visible seulement si aucune recherche active */}
        {searchTerm === '' && pinnedResources.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: '#2D3748' }}>
                ⭐ Par où commencer ?
              </h2>
              <p className="text-slate-600">
                5 ressources essentielles pour bien démarrer en cybersécurité
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {pinnedResources.map((resource) => {
                const typeColor = resource.resource_type ? getTypeColor(resource.resource_type.name) : '#64748B';
                const typeName = resource.resource_type?.name;
                return (
                  <div key={resource.id} className="border-t-4 border-[#E8650A] rounded-t-lg">
                    <ResourceCard
                      resource={{...resource, isPinned: true}}
                      typeColor={typeColor}
                      typeName={typeName}
                      onNavigateToContact={() => onNavigate?.('contact')}
                    />
                  </div>
                );
              })}
            </div>

            {/* Indicateur découvrir toutes les ressources */}
            <div className="mt-10 mb-8 flex flex-col items-center gap-2">
              <ChevronDown className="w-6 h-6 animate-bounce" style={{ color: '#6B7280' }} />
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                Découvrir toutes les ressources
              </p>
            </div>

            <div className="border-t-2 border-slate-200"></div>
          </div>
        )}

        {filteredResources.length > 0 ? (
          <>
            <div className="flex justify-end mb-4">
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOption)}
                  className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="recent">Plus récentes</option>
                  <option value="a-z">A → Z</option>
                  <option value="z-a">Z → A</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResources.map((resource) => {
                const typeColor = resource.resource_type ? getTypeColor(resource.resource_type.name) : '#64748B';
                const typeName = resource.resource_type?.name;
                return (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    typeColor={typeColor}
                    typeName={typeName}
                    onNavigateToContact={() => onNavigate?.('contact')}
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#2D3748' }}>
              Aucune ressource trouvée
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm !== ''
                ? "Aucune ressource ne correspond à votre recherche. Essayez un terme plus général ou parcourez les thèmes ci-dessous."
                : "Essayez de modifier vos critères de recherche"}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-accent hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}