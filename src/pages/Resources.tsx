import { useState, useMemo, useEffect } from 'react';
import { Search, Loader, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Resource, Theme } from '../lib/supabase';
import ResourceCard from '../components/ResourceCard';
import ChatBot from '../components/ChatBot';

interface ResourcesProps {
  initialFilter?: string;
  onNavigate?: (page: any) => void;
}

export default function Resources({ initialFilter, onNavigate }: ResourcesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('Tous');
  const [resources, setResources] = useState<Resource[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (initialFilter) setSelectedTheme(initialFilter); }, [initialFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [th, res] = await Promise.all([
        supabase.from('themes').select('*').order('title'),
        supabase.from('resources').select('*, theme:themes(*), resource_type:resource_types(*)').order('created_at', { ascending: false })
      ]);
      setThemes(th.data || []);
      setResources(res.data || []);
    } finally { setLoading(false); }
  };

  const pinnedResources = useMemo(() => resources.filter(r => r.is_pinned).slice(0, 5), [resources]);
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const mTheme = selectedTheme === 'Tous' || r.theme?.title === selectedTheme;
      const mSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      return mTheme && mSearch;
    });
  }, [searchTerm, selectedTheme, resources]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResources.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResources, currentPage]);

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-[#E8650A] w-10 h-10" /></div>;

  return (
    <div className="min-h-screen pb-24 bg-[#FAFAFA]">
      <ChatBot />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Ressources Cyber</h1>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
          <select value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)} className="p-3 bg-slate-50 rounded-xl outline-none font-semibold text-slate-600 border-none">
            <option value="Tous">Tous les thèmes</option>
            {themes.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
          </select>
        </div>

        {searchTerm === '' && selectedTheme === 'Tous' && pinnedResources.length > 0 && (
          <div className="mb-20 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Star className="text-[#E8650A] fill-[#E8650A] w-5 h-5" />
              <h2 className="text-2xl font-bold text-slate-800">Par où commencer ?</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {pinnedResources.map(r => (
                <div key={r.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[240px] max-w-[300px]">
                  <ResourceCard resource={r} onNavigateToContact={() => onNavigate?.('contact')} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedResources.map(r => (
            <ResourceCard key={r.id} resource={r} onNavigateToContact={() => onNavigate?.('contact')} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-20"><ChevronLeft /></button>
            <span className="font-bold">Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-lg disabled:opacity-20"><ChevronRight /></button>
          </div>
        )}
      </div>
    </div>
  );
}