import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Search, ChevronRight, ChevronLeft, LayoutGrid, Sparkles } from 'lucide-react';
import ResourceCard from '../components/ResourceCard';

export default function Resources({ onNavigate, initialFilter }: { onNavigate: (page: any) => void, initialFilter?: string }) {
  const [resources, setResources] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(initialFilter || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // États pour la visibilité des flèches
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Vérifier si le scroll est possible à chaque mise à jour des thèmes
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [themes, loading]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  async function fetchData() {
    try {
      setLoading(true);
      const { data: themeData } = await supabase
        .from('themes')
        .select('*')
        .order('sort_order', { ascending: true });
      setThemes(themeData || []);

      const { data: resData } = await supabase
        .from('resources')
        .select('*, theme:themes(title)')
        .order('created_at', { ascending: false });
      setResources(resData || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currentIndex = themes.findIndex(t => t.id === selectedThemeId);
  const prevTheme = currentIndex > 0 ? themes[currentIndex - 1] : null;
  const nextTheme = currentIndex < themes.length - 1 ? themes[currentIndex + 1] : null;

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = !selectedThemeId || res.theme_id === selectedThemeId;
    return matchesSearch && matchesTheme;
  });

  const handleThemeChange = (id: string | null) => {
    setSelectedThemeId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 text-left">
      {/* HEADER FIXE */}
      <div className="bg-white pt-12 pb-6 px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Bibliothèque</h1>
              <p className="text-slate-500 text-sm font-medium">Vos outils pour une sécurité maximale</p>
            </div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>
          </div>

          {/* BARRE DE THÈMES AVEC NAVIGATION ACTIVE */}
          <div className="relative flex items-center">
            {/* Flèche Gauche */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 z-20 p-2 bg-white/90 backdrop-blur-sm shadow-md rounded-full text-slate-600 hover:text-orange-500 transition-all -ml-2 border border-slate-100"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Conteneur Scrollable avec masque de fondu */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth w-full px-2"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)'
              }}
            >
              <button
                onClick={() => handleThemeChange(null)}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${!selectedThemeId
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
              >
                Tout voir
              </button>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${selectedThemeId === theme.id
                      ? 'bg-[#E8650A] text-white shadow-lg'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  {theme.title}
                </button>
              ))}
              <div className="min-w-[40px] h-4"></div>
            </div>

            {/* Flèche Droite */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 z-20 p-2 bg-white/90 backdrop-blur-sm shadow-md rounded-full text-slate-600 hover:text-orange-500 transition-all -mr-2 border border-slate-100"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reste du contenu (Ressources + Navigation Basse) inchangé */}
      <div className="max-w-6xl mx-auto px-4 py-12 text-left">
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-xl font-bold text-slate-900">Aucune ressource trouvée</h3>
          </div>
        )}

        {selectedThemeId && (
          <div className="mt-20 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="w-full md:w-auto">
              {prevTheme ? (
                <button onClick={() => handleThemeChange(prevTheme.id)} className="group flex items-center gap-4 text-left p-4 rounded-3xl hover:bg-white transition-all">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-200"><ChevronLeft size={24} /></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Précédent</p><p className="font-bold text-slate-900">{prevTheme.title}</p></div>
                </button>
              ) : <div className="invisible" />}
            </div>
            <div className="w-full md:w-auto flex justify-end">
              {nextTheme ? (
                <button onClick={() => handleThemeChange(nextTheme.id)} className="group flex items-center gap-4 text-right p-4 rounded-3xl hover:bg-white transition-all">
                  <div className="text-right"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Suivant</p><p className="font-bold text-slate-900">{nextTheme.title}</p></div>
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#E8650A] group-hover:bg-[#E8650A] group-hover:text-white transition-all"><ChevronRight size={24} /></div>
                </button>
              ) : (
                <button onClick={() => handleThemeChange(null)} className="group flex items-center gap-4 text-right p-4 rounded-3xl hover:bg-white transition-all">
                  <div className="text-right"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fin du parcours</p><p className="font-bold text-slate-900">Tout voir</p></div>
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><LayoutGrid size={24} /></div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}