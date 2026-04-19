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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // 1. Charger les thèmes triés par sort_order
      const { data: themeData } = await supabase
        .from('themes')
        .select('*')
        .order('sort_order', { ascending: true });
      setThemes(themeData || []);

      // 2. Charger toutes les ressources avec leurs thèmes
      const { data: resData } = await supabase
        .from('resources')
        .select('*, theme:themes(title)')
        .order('created_at', { ascending: false });
      setResources(resData || []);
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
    } finally {
      setLoading(false);
    }
  }

  // Logique de navigation Suivant / Précédent
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
      {/* HEADER & RECHERCHE */}
      <div className="bg-white pt-12 pb-6 px-4 border-b border-slate-100 sticky top-0 z-30">
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
                placeholder="Rechercher un guide, un mémo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>
          </div>

          {/* BARRE D'ONGLETS (TABS) */}
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
            >
              <button
                onClick={() => handleThemeChange(null)}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${!selectedThemeId
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
              >
                Tout voir
              </button>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedThemeId === theme.id
                      ? 'bg-[#E8650A] text-white shadow-lg shadow-orange-500/20 scale-105'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  {theme.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LISTE DES RESSOURCES */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
              <BookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune ressource trouvée</h3>
            <p className="text-slate-500">Essayez de modifier votre recherche ou votre thématique.</p>
          </div>
        )}

        {/* NAVIGATION BASSE (SUIVANT / PRÉCÉDENT) */}
        {selectedThemeId && (
          <div className="mt-20 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="w-full md:w-auto">
              {prevTheme ? (
                <button
                  onClick={() => handleThemeChange(prevTheme.id)}
                  className="group flex items-center gap-4 text-left p-4 rounded-3xl hover:bg-white transition-all"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition-all">
                    <ChevronLeft size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sujet précédent</p>
                    <p className="font-bold text-slate-900">{prevTheme.title}</p>
                  </div>
                </button>
              ) : (
                <div className="invisible" />
              )}
            </div>

            <div className="text-center bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100 md:max-w-xs">
              <Sparkles className="w-6 h-6 text-[#E8650A] mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 leading-tight">
                Continuez votre parcours pour une protection complète.
              </p>
            </div>

            <div className="w-full md:w-auto flex justify-end">
              {nextTheme ? (
                <button
                  onClick={() => handleThemeChange(nextTheme.id)}
                  className="group flex items-center gap-4 text-right p-4 rounded-3xl hover:bg-white transition-all"
                >
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sujet suivant</p>
                    <p className="font-bold text-slate-900">{nextTheme.title}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#E8650A] group-hover:bg-[#E8650A] group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={24} />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => handleThemeChange(null)}
                  className="group flex items-center gap-4 text-right p-4 rounded-3xl hover:bg-white transition-all"
                >
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fin du parcours</p>
                    <p className="font-bold text-slate-900">Voir tout</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-slate-800 transition-all">
                    <LayoutGrid size={24} />
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}