import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Search, BookOpen, ExternalLink, Filter } from 'lucide-react';

interface ResourceListProps {
  onEdit: (resource: any) => void;
}

export default function ResourceList({ onEdit }: ResourceListProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // Récupérer les ressources avec leurs thèmes
      const { data: resData, error: resError } = await supabase
        .from('resources')
        .select('*, theme:themes(title)')
        .order('created_at', { ascending: false });

      if (resError) throw resError;
      setResources(resData || []);

      // Récupérer les thèmes pour le filtre
      const { data: themeData } = await supabase.from('themes').select('id, title');
      setThemes(themeData || []);
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette ressource ?')) return;
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      setResources(resources.filter(r => r.id !== id));
    } catch (err: any) {
      alert("Erreur de suppression : " + err.message);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = selectedTheme === 'all' || r.theme_id === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="p-8">
      {/* Barre d'outils */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une ressource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 rounded-2xl border border-slate-100">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="bg-transparent border-none py-4 text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer"
          >
            <option value="all">Toutes les thématiques</option>
            {themes.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Chargement des ressources...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Ressource</th>
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Thématique</th>
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResources.map((res) => (
                <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{res.title}</p>
                        <a href={res.url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 flex items-center gap-1 hover:text-orange-500 transition-colors">
                          <ExternalLink size={10} /> Voir le lien
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">
                      {res.theme?.title || 'Non classé'}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(res)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(res.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResources.length === 0 && (
            <div className="py-20 text-center text-slate-400">Aucune ressource ne correspond à votre recherche.</div>
          )}
        </div>
      )}
    </div>
  );
}